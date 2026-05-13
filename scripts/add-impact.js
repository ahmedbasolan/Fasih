/**
 * Bulk conversion: adds `impact: { trust, respect, culture }` to every ScenarioChoice
 * based on existing `score`, `outcome`, and text/note analysis.
 */
const fs = require('fs');

const path = process.argv[2] || 'src/constants/scenarios.ts';
let src = fs.readFileSync(path, 'utf-8');

function distributeImpact(score, outcome, text, note) {
  const total = score;
  const s = (text + ' ' + (note || '')).toLowerCase();

  // Keyword-based meter weights (0-1 each)
  let trustW = 0.33, respectW = 0.33, cultureW = 0.33;

  // Trust keywords
  if (/honest|transparent|truth|accurate|promise|safe|reliable|trust|professional|clear/i.test(s)) trustW += 0.25;
  if (/lie|misleading|hide|evade|dishonest|deceive/i.test(s)) trustW += 0.2;
  // Respect keywords
  if (/honor|respect|title|defer|senior|auntie|uncle|sheikh|role|boundary|position|age|elder/i.test(s)) respectW += 0.25;
  if (/lecture|overstep|override|casual|dismiss|boss/i.test(s)) respectW += 0.2;
  // Culture keywords
  if (/allah|greeting|bless|hospitality|arabic|custom|traditional|gulf|emirati|islam|pray|salaam|shukran|masha/i.test(s)) cultureW += 0.25;
  if (/english|western|rude|ignore custom|skip/i.test(s)) cultureW += 0.2;

  // Normalize
  const sum = trustW + respectW + cultureW;
  trustW /= sum; respectW /= sum; cultureW /= sum;

  // Distribute total across meters, clamped to [-3, 3]
  let trust = Math.round(total * trustW);
  let respect = Math.round(total * respectW);
  let culture = Math.round(total * cultureW);

  // Adjust so sum equals total (fix rounding errors)
  let diff = total - (trust + respect + culture);
  // Apply diff to largest component
  if (Math.abs(diff) > 0) {
    const comps = [
      { key: 'trust', val: Math.abs(trustW), ref: trust },
      { key: 'respect', val: Math.abs(respectW), ref: respect },
      { key: 'culture', val: Math.abs(cultureW), ref: culture },
    ].sort((a, b) => b.val - a.val);
    for (const c of comps) {
      if (diff === 0) break;
      const adj = Math.sign(diff);
      if (c.key === 'trust') trust += adj;
      else if (c.key === 'respect') respect += adj;
      else culture += adj;
      diff -= adj;
    }
  }

  // Clamp to [-3, 3]
  const clamp = (v) => Math.max(-3, Math.min(3, v));
  trust = clamp(trust);
  respect = clamp(respect);
  culture = clamp(culture);

  // Re-clamp after adjustment - ensure none exceed bounds even after diff fix
  // If any exceed due to diff fix, redistribute
  const all = [trust, respect, culture];
  const maxV = Math.max(...all.map(Math.abs));
  if (maxV > 3) {
    // Scale down proportionally
    const scale = 3 / maxV;
    trust = Math.round(trust * scale);
    respect = Math.round(respect * scale);
    culture = Math.round(culture * scale);
    // Final diff fix
    diff = total - (trust + respect + culture);
    if (diff !== 0) {
      // Find component with most headroom
      const canInc = (v) => v < 3;
      const canDec = (v) => v > -3;
      if (diff > 0) {
        if (canInc(trust)) trust++;
        else if (canInc(respect)) respect++;
        else if (canInc(culture)) culture++;
      } else {
        if (canDec(trust)) trust--;
        else if (canDec(respect)) respect--;
        else if (canDec(culture)) culture--;
      }
    }
  }

  return { trust, respect, culture };
}

// Regex to find each choice block: { id: '...', text: '...', ... }
// We need to insert `impact: { trust: N, respect: N, culture: N },` after the `score` field
const choiceRegex = /\{ id: '([^']+)', text: '((?:[^'\\]|\\.)*)', arabic: '((?:[^'\\]|\\.)*)', roman: "((?:[^"\\]|\\.)*)", score: (-?\d+)([^}]*?)\}/g;

src = src.replace(choiceRegex, (match, id, text, arabic, roman, score, rest) => {
  const sc = parseInt(score, 10);
  // Extract note and outcome from rest
  const noteMatch = rest.match(/note: '((?:[^'\\]|\\.)*)'/);
  const note = noteMatch ? noteMatch[1] : '';
  const outcomeMatch = rest.match(/outcome: '([^']+)'/);
  const outcome = outcomeMatch ? outcomeMatch[1] : 'neutral';
  
  const impact = distributeImpact(sc, outcome, text, note);
  
  // Insert impact after score
  const impactStr = `, impact: { trust: ${impact.trust}, respect: ${impact.respect}, culture: ${impact.culture} }`;
  
  // Find position of score: N and insert after it
  const scorePos = match.indexOf(`score: ${score}`);
  const scoreEndPos = scorePos + `score: ${score}`.length;
  
  return match.slice(0, scoreEndPos) + impactStr + match.slice(scoreEndPos);
});

fs.writeFileSync(path, src);
console.log('Impact data added to all choices.');
