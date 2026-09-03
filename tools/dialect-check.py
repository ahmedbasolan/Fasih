#!/usr/bin/env python3
"""
Morphological analysis of Fasih's Arabic content.

Runs every learner-facing Arabic token through two CAMeL Tools analysers — the
Gulf database (CALIMA-GLF) and the MSA one — and sorts the results by what the
pair of answers actually tells you.

    ─── Read this before trusting the "MSA" column ─────────────────────────────
    CALIMA-GLF is a VERB database: roughly 2,600 verbal lemmas. It is not a full
    Gulf lexicon. So "does not analyse as Gulf" overwhelmingly means "is not a
    Gulf verb", NOT "is MSA".

    The first version of this tool reported that pairing as "MSA-only" and
    produced 114 hits on real content, of which nearly all were false positives:
    ordinary shared nouns (سعر, كيلو, الوزن), proper nouns (رونالدو, البرتغال),
    an English loanword (أوكي), and — worst — هذي, which is the GULF feminine
    demonstrative that the app's own blocklist bans MSA هذه in favour of.

Hence the three buckets below, ordered by how much you should care:

  1. BLOCKLIST HIT — the token is on the curated MSA_BLOCKLIST in
     `src/constants/curriculum.ts`. High confidence, and should always be zero
     because the Jest lint fails the build on these. A hit here means the two
     detectors disagree and something slipped past.

  2. OUT OF VOCABULARY — neither database analyses it. The genuinely useful
     list. Contains real Emirati forms (يديد, صباطج — the g→y shift and the 2fs
     ـج suffix), other dialects on purpose (بتاعك, مكانش are Youssef's Egyptian
     in the taxi ride), and modern loanwords (الواتس, كارديو).

  3. WEAK SIGNAL — analyses as MSA but not as Gulf. Reported as distinct tokens
     only, because per-occurrence it is mostly noise. Skim it; do not action it
     without checking a source.

Requires CAMeL Tools and both morphology databases:

    pip install -r tools/requirements.txt
    camel_data -i morphology-db-glf-01   # -> calima-glf-01
    camel_data -i morphology-db-msa-r13  # -> calima-msa-r13

Reports; does not block by default. `--max-blocklist` gates on bucket 1 only —
never on buckets 2 or 3, which are advisory by construction.

Usage:
    python tools/dialect-check.py
    python tools/dialect-check.py --json out.json
    python tools/dialect-check.py --max-blocklist 0
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from collections import Counter
from dataclasses import dataclass, asdict, field
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
ARABIC = re.compile(r'[؀-ۿ]')

# Arabic-script punctuation lives INSIDE the ؀-ۿ block, so a naive "keep
# everything Arabic" filter leaves `؟` and `،` glued to the word and every
# question comes back unanalysable.
ARABIC_PUNCT = '،؛؟٪۔٬…'

# Learner-facing Arabic only. Notes and pronTips legitimately quote MSA in order
# to contrast it — `أريد` appears in exactly one place in the app, inside an
# English note explaining that Gulf uses أبي instead.
FIELD_PATTERNS = [
    re.compile(r"\barabic:\s*'((?:[^'\\]|\\.)*)'"),
    re.compile(r"\barabicFeminine:\s*'((?:[^'\\]|\\.)*)'"),
]

CONTENT_FILES = [
    REPO / 'src' / 'constants' / 'phrases.ts',
    REPO / 'src' / 'constants' / 'scenarios.ts',
    REPO / 'src' / 'constants' / 'grammar.ts',
]

CURRICULUM_TS = REPO / 'src' / 'constants' / 'curriculum.ts'


@dataclass
class Occurrence:
    file: str
    line: int
    utterance: str


@dataclass
class TokenFinding:
    token: str
    count: int
    occurrences: list[Occurrence] = field(default_factory=list)
    gulf_form: str | None = None   # set for blocklist hits


def load_msa_blocklist() -> dict[str, str]:
    """
    Read MSA_BLOCKLIST out of curriculum.ts.

    Parsed rather than duplicated so the Python tool and the Jest lint cannot
    drift apart — the whole design principle here is one home per rule.
    """
    if not CURRICULUM_TS.exists():
        print(f'warning: {CURRICULUM_TS} not found; blocklist bucket disabled',
              file=sys.stderr)
        return {}
    src = CURRICULUM_TS.read_text(encoding='utf-8')
    # Anchored to a line-start `export const`, not a bare identifier match: the
    # file mentions these names inside doc comments too, and a comment matching
    # first would silently return the wrong block — or nothing, quietly
    # disabling this bucket.
    m = re.search(r'^export const MSA_BLOCKLIST[^=]*=\s*\[(.*?)^\];',
                  src, re.S | re.M)
    if not m:
        print('warning: could not parse MSA_BLOCKLIST from curriculum.ts — '
              'bucket 1 disabled', file=sys.stderr)
        return {}
    entries = re.findall(r"\{\s*msa:\s*'([^']+)'\s*,\s*gulf:\s*'([^']*)'\s*\}",
                         m.group(1))
    if not entries:
        print('warning: MSA_BLOCKLIST parsed but contained no entries — '
              'has its shape changed?', file=sys.stderr)
    return dict(entries)


def collect_utterances() -> list[tuple[str, int, str]]:
    """Every learner-facing Arabic string, with file and line."""
    out: list[tuple[str, int, str]] = []
    for path in CONTENT_FILES:
        if not path.exists():
            print(f'  skip (missing): {path.relative_to(REPO)}', file=sys.stderr)
            continue
        for lineno, line in enumerate(path.read_text(encoding='utf-8').splitlines(), 1):
            for pat in FIELD_PATTERNS:
                for m in pat.finditer(line):
                    if ARABIC.search(m.group(1)):
                        out.append((str(path.relative_to(REPO)), lineno, m.group(1)))
    return out


def tokenize(utterance: str) -> list[str]:
    """Arabic word tokens, stripped of punctuation and stage directions."""
    cleaned = re.sub(r'\([^)]*\)', ' ', utterance)
    tokens = []
    for raw in cleaned.split():
        tok = ''.join(ch for ch in raw
                      if ARABIC.match(ch) and ch not in ARABIC_PUNCT)
        if tok:
            tokens.append(tok)
    return tokens


def rule(title: str, width: int = 78) -> str:
    return f'\n── {title} ' + '─' * max(3, width - len(title) - 4)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument('--json', metavar='PATH', help='write findings as JSON')
    ap.add_argument('--max-blocklist', type=int, default=None,
                    help='exit 1 if curated-blocklist hits exceed this count')
    ap.add_argument('--show-weak', type=int, default=40,
                    help='how many weak-signal tokens to print (default 40)')
    args = ap.parse_args()

    try:
        from camel_tools.morphology.database import MorphologyDB
        from camel_tools.morphology.analyzer import Analyzer
    except ImportError:
        print('camel-tools is not installed.\n'
              '  pip install -r tools/requirements.txt\n'
              '  camel_data -i morphology-db-glf-01\n'
              '  camel_data -i morphology-db-msa-r13', file=sys.stderr)
        return 2

    try:
        # Package name != dataset name: morphology-db-glf-01 installs
        # calima-glf-01, morphology-db-msa-r13 installs calima-msa-r13.
        glf = Analyzer(MorphologyDB.builtin_db('calima-glf-01', 'a'))
        msa = Analyzer(MorphologyDB.builtin_db('calima-msa-r13', 'a'))
    except Exception as exc:  # noqa: BLE001 — surface the real setup problem
        print(f'could not load morphology databases: {exc}\n'
              '  camel_data -i morphology-db-glf-01\n'
              '  camel_data -i morphology-db-msa-r13', file=sys.stderr)
        return 2

    blocklist = load_msa_blocklist()
    utterances = collect_utterances()

    blocklist_hits: dict[str, TokenFinding] = {}
    oov: dict[str, TokenFinding] = {}
    weak: dict[str, TokenFinding] = {}
    gulf_confirmed = Counter()
    total_tokens = 0
    analysis_cache: dict[str, tuple[bool, bool]] = {}

    for file, line, utterance in utterances:
        for token in tokenize(utterance):
            total_tokens += 1

            if token not in analysis_cache:
                analysis_cache[token] = (bool(glf.analyze(token)),
                                         bool(msa.analyze(token)))
            in_glf, in_msa = analysis_cache[token]

            if token in blocklist:
                bucket, extra = blocklist_hits, blocklist[token]
            elif in_glf:
                gulf_confirmed[token] += 1
                continue
            elif not in_msa:
                bucket, extra = oov, None
            else:
                bucket, extra = weak, None

            entry = bucket.setdefault(token, TokenFinding(token=token, count=0,
                                                          gulf_form=extra))
            entry.count += 1
            if len(entry.occurrences) < 5:
                entry.occurrences.append(Occurrence(file, line, utterance))

    # ── Summary ──────────────────────────────────────────────────────────────
    distinct = len(analysis_cache)
    gulf_share = 100 * sum(gulf_confirmed.values()) / total_tokens if total_tokens else 0
    print(f'{len(utterances)} learner-facing strings · {total_tokens} tokens '
          f'({distinct} distinct)')
    print(f'{sum(gulf_confirmed.values())} tokens ({gulf_share:.1f}%) analyse as Gulf')

    # ── 1. Blocklist hits — the only bucket worth failing on ────────────────
    print(rule('1. CURATED BLOCKLIST HITS — act on these'))
    if blocklist_hits:
        print('   These are on MSA_BLOCKLIST in curriculum.ts, which the Jest lint')
        print('   already fails the build for. A hit here means something slipped past.')
        for f in sorted(blocklist_hits.values(), key=lambda x: -x.count):
            print(f'\n   {f.token}  ({f.count}x)  → should be {f.gulf_form}')
            for o in f.occurrences:
                print(f'      {o.file}:{o.line}  {o.utterance}')
    else:
        print('   none — consistent with the Jest lint')

    # ── 2. Out of vocabulary — the useful review list ────────────────────────
    print(rule('2. OUT OF VOCABULARY — review'))
    print('   Neither database analyses these. Expect real Emirati forms the Gulf DB')
    print('   lacks, other dialects included on purpose, loanwords, and proper nouns.')
    print('   A genuine Emirati word missing here is a gap in the DATABASE, not the content.')
    for f in sorted(oov.values(), key=lambda x: -x.count):
        loc = f.occurrences[0]
        print(f'   {f.token:<14} {f.count}x   {loc.file}:{loc.line}')
    if not oov:
        print('   none')

    # ── 3. Weak signal — skim only ───────────────────────────────────────────
    print(rule('3. WEAK SIGNAL — skim, do not action without a source'))
    print('   Analyses as MSA but not as Gulf. CALIMA-GLF holds ~2,600 VERBAL lemmas,')
    print('   so this mostly means "not a Gulf verb" — ordinary shared nouns and proper')
    print('   nouns land here. Distinct tokens only; per-occurrence it is noise.')
    ranked = sorted(weak.values(), key=lambda x: -x.count)
    for f in ranked[:args.show_weak]:
        print(f'   {f.token:<14} {f.count}x')
    if len(ranked) > args.show_weak:
        print(f'   ... and {len(ranked) - args.show_weak} more distinct tokens')
    if not weak:
        print('   none')

    print(f'\nblocklist {len(blocklist_hits)} · out-of-vocab {len(oov)} '
          f'· weak {len(weak)} (distinct tokens)')

    if args.json:
        Path(args.json).write_text(json.dumps({
            'summary': {
                'utterances': len(utterances),
                'tokens': total_tokens,
                'distinct_tokens': distinct,
                'gulf_confirmed_tokens': sum(gulf_confirmed.values()),
                'gulf_share_pct': round(gulf_share, 2),
            },
            'blocklist_hits': [asdict(f) for f in blocklist_hits.values()],
            'out_of_vocabulary': [asdict(f) for f in oov.values()],
            'weak_signal': [asdict(f) for f in weak.values()],
        }, ensure_ascii=False, indent=2), encoding='utf-8')
        print(f'wrote {args.json}')

    if args.max_blocklist is not None and len(blocklist_hits) > args.max_blocklist:
        print(f'\nFAIL: {len(blocklist_hits)} blocklist hits exceeds '
              f'--max-blocklist {args.max_blocklist}', file=sys.stderr)
        return 1
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
