#!/usr/bin/env python3
"""
Real morphological MSA detection for Fasih's Arabic content.

The Jest lint (`src/engine/__tests__/languageContent.test.ts`) enforces a
blocklist of known MSA function words. That is a cheap approximation. This is
the general form of the same question:

    Does this token analyse under an MSA analyser but NOT under a Gulf one?

If so, it is almost certainly MSA that leaked into a dialect-only app.

Requires CAMeL Tools and its Gulf database:

    pip install camel-tools
    camel_data -i morphology-db-glf     # CALIMA-GLF, ~2,600 verbal lemmas
    camel_data -i morphology-db-msa-r13

Reports; does not block. Deliberately: morphological analysis has false
positives on proper nouns, loanwords and dialect forms the analyser has not
seen, so a red CI on every unknown word would train people to ignore it.

Usage:
    python tools/dialect-check.py                  # report to stdout
    python tools/dialect-check.py --json out.json  # machine-readable
    python tools/dialect-check.py --max-msa 0      # exit 1 above a threshold
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from dataclasses import dataclass, asdict
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
ARABIC = re.compile(r'[؀-ۿ]')

# Learner-facing Arabic only. Notes and pronTips legitimately quote MSA in order
# to contrast it — see the scoping note in curriculum.ts.
FIELD_PATTERNS = [
    re.compile(r"\barabic:\s*'((?:[^'\\]|\\.)*)'"),
    re.compile(r"\barabicFeminine:\s*'((?:[^'\\]|\\.)*)'"),
]

CONTENT_FILES = [
    REPO / 'src' / 'constants' / 'phrases.ts',
    REPO / 'src' / 'constants' / 'scenarios.ts',
    REPO / 'src' / 'constants' / 'grammar.ts',
]


@dataclass
class Finding:
    file: str
    line: int
    token: str
    utterance: str
    reason: str


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
                    text = m.group(1)
                    if ARABIC.search(text):
                        out.append((str(path.relative_to(REPO)), lineno, text))
    return out


# Arabic-script punctuation lives INSIDE the ؀-ۿ block, so a naive
# "keep everything Arabic" filter keeps `؟` and `،` attached to the word and
# every question would come back unanalysable.
ARABIC_PUNCT = '،؛؟٪۔٬…'


def tokenize(utterance: str) -> list[str]:
    """Arabic word tokens, stripped of punctuation and stage directions."""
    cleaned = re.sub(r'\([^)]*\)', ' ', utterance)
    tokens = []
    for raw in cleaned.split():
        tok = ''.join(
            ch for ch in raw
            if ARABIC.match(ch) and ch not in ARABIC_PUNCT
        )
        if tok:
            tokens.append(tok)
    return tokens


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument('--json', metavar='PATH', help='write findings as JSON')
    ap.add_argument('--max-msa', type=int, default=None,
                    help='exit 1 if MSA-only tokens exceed this count')
    args = ap.parse_args()

    try:
        from camel_tools.morphology.database import MorphologyDB
        from camel_tools.morphology.analyzer import Analyzer
    except ImportError:
        print('camel-tools is not installed.\n'
              '  pip install camel-tools\n'
              '  camel_data -i morphology-db-glf\n'
              '  camel_data -i morphology-db-msa-r13', file=sys.stderr)
        return 2

    try:
        glf = Analyzer(MorphologyDB.builtin_db('calima-glf-01', 'a'))
        msa = Analyzer(MorphologyDB.builtin_db('calima-msa-s31', 'a'))
    except Exception as exc:  # noqa: BLE001 — surface the real setup problem
        print(f'could not load morphology databases: {exc}\n'
              '  camel_data -i morphology-db-glf\n'
              '  camel_data -i morphology-db-msa-r13', file=sys.stderr)
        return 2

    utterances = collect_utterances()
    print(f'collected {len(utterances)} learner-facing Arabic strings')

    findings: list[Finding] = []
    unknown: list[Finding] = []
    seen: set[str] = set()
    total_tokens = 0

    for file, line, utterance in utterances:
        for token in tokenize(utterance):
            total_tokens += 1
            key = f'{file}:{line}:{token}'
            if key in seen:
                continue
            seen.add(key)

            in_glf = bool(glf.analyze(token))
            in_msa = bool(msa.analyze(token))

            if in_msa and not in_glf:
                findings.append(Finding(file, line, token, utterance,
                                        'analyses as MSA but not as Gulf'))
            elif not in_msa and not in_glf:
                unknown.append(Finding(file, line, token, utterance,
                                       'unanalysable by either database'))

    print(f'analysed {total_tokens} tokens\n')

    if findings:
        print(f'── {len(findings)} MSA-only tokens ' + '─' * 40)
        for f in findings:
            print(f'  {f.file}:{f.line}  {f.token}')
            print(f'      {f.utterance}')
    else:
        print('no MSA-only tokens found')

    if unknown:
        print(f'\n── {len(unknown)} unanalysable tokens (review, not necessarily wrong) '
              + '─' * 8)
        print('   Expect proper nouns, loanwords, and dialect forms CALIMA-GLF has')
        print('   not seen. A real Emirati word missing from the Gulf database is a')
        print('   gap in the database, not in the content.')
        for f in unknown[:40]:
            print(f'  {f.file}:{f.line}  {f.token}')
        if len(unknown) > 40:
            print(f'  ... and {len(unknown) - 40} more')

    if args.json:
        Path(args.json).write_text(json.dumps({
            'msa_only': [asdict(f) for f in findings],
            'unanalysable': [asdict(f) for f in unknown],
            'tokens_analysed': total_tokens,
            'utterances': len(utterances),
        }, ensure_ascii=False, indent=2), encoding='utf-8')
        print(f'\nwrote {args.json}')

    if args.max_msa is not None and len(findings) > args.max_msa:
        print(f'\nFAIL: {len(findings)} MSA-only tokens exceeds --max-msa {args.max_msa}',
              file=sys.stderr)
        return 1
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
