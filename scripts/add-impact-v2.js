const fs = require('fs');

const path = process.argv[2] || 'src/constants/scenarios.ts';
let lines = fs.readFileSync(path, 'utf-8').split('\n');

function distributeImpact(score, text, note) {
  const total = score;
  const s = ((text || '') + ' ' + (note || '')).toLowerCase();
  
  let trustW = 0.33, respectW = 0.33, cultureW = 0.33;
  
  if (/honest|transparent|truth|accurate|promise|safe|reliable|trust|professional|clear|direct|defe|explain/i.test(s)) trustW += 0.25;
  if (/lie|misleading|hide|evade|dishonest|deceive|trick|manipulate/i.test(s)) trustW += 0.2;
  
  if (/honor|respect|title|defer|senior|auntie|uncle|sheikh|role|boundary|position|age|elder|please|formal|appropriate|title/i.test(s)) respectW += 0.25;
  if (/lecture|overstep|override|casual|dismiss|boss|rude|abrupt|cold|harsh|push/i.test(s)) respectW += 0.2;
  
  if (/allah|greeting|bless|hospitality|arabic|custom|traditional|gulf|emirati|islam|pray|salaam|shukran|masha|in shaa|ya|حمد|الله|عاف|شاء|بارك/i.test(s)) cultureW += 0.25;
  if (/english|western|rude|ignore custom|skip|missed|fail|refuse|decline|reject/i.test(s)) cultureW += 0.2;
  
  const sum = trustW + respectW + cultureW;
  trustW /= sum; respectW /= sum; cultureW /= sum;
  
  let trust = Math.round(total * trustW);
  let respect = Math.round(total * respectW);
  let culture = Math.round(total * cultureW);
  
  let diff = total - (trust + respect + culture);
  const comps = [
    { key: 'trust', w: trustW, val: trust },
    { key: 'respect', w: respectW, val: respect },
    { key: 'culture', w: cultureW, val: culture },
  ].sort((a, b) => b.w - a.w);
  for (const c of comps) {
    if (diff === 0) break;
    const adj = Math.sign(diff);
    if (c.key === 'trust') trust += adj;
    else if (c.key === 'respect') respect += adj;
    else culture += adj;
    diff -= adj;
  }
  
  const clamp = (v) => Math.max(-3, Math.min(3, v));
  trust = clamp(trust); respect = clamp(respect); culture = clamp(culture);
  
  // Final scale check
  const maxAbs = Math.max(Math.abs(trust), Math.abs(respect), Math.abs(culture));
  if (maxAbs > 3) {
    const scale = 3 / maxAbs;
    trust = Math.round(trust * scale);
    respect = Math.round(respect * scale);
    culture = Math.round(culture * scale);
    diff = total - (trust + respect + culture);
    if (diff !== 0) {
      if (trust < 3 && diff > 0) { trust++; diff--; }
      else if (trust > -3 && diff < 0) { trust--; diff++; }
      else if (respect < 3 && diff > 0) { respect++; diff--; }
      else if (respect > -3 && diff < 0) { respect--; diff++; }
      else if (culture < 3 && diff > 0) { culture++; diff--; }
      else if (culture > -3 && diff < 0) { culture--; diff++; }
    }
  }
  
  return { trust, respect, culture };
}

function extractField(line, fieldName) {
  const regex = new RegExp(`${fieldName}:\\s*['"]((?:[^'"\\\\]|\\\\.)*)['"]`);
  const m = line.match(regex);
  return m ? m[1] : '';
}

function extractScore(line) {
  const m = line.match(/score:\\s*(-?\d+)/);
  return m ? parseInt(m[1], 10) : null;
}

function hasImpact(line) {
  return /impact:\\s*\{/.test(line);
}

// Remove ALL existing impact fields first (including duplicates)
for (let i = 0; i < lines.length; i++) {
  lines[i] = lines[i].replace(/,\\s*impact:\\s*\{ trust:\\s*-?\d+, respect:\\s*-?\d+, culture:\\s*-?\d+ \}/g, '');
}

// Now add impact to any line with score: N that doesn't have impact
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const score = extractScore(line);
  if (score === null) continue;
  if (hasImpact(line)) continue; // skip if impact already present
  
  const text = extractField(line, 'text');
  const note = extractField(line, 'note');
  const impact = distributeImpact(score, text, note);
  
  // Insert impact after score: N
  const scoreMatch = line.match(/(score:\\s*-?\d+)/);
  if (scoreMatch) {
    const scoreStr = scoreMatch[1];
    const pos = line.indexOf(scoreStr) + scoreStr.length;
    const impactStr = `, impact: { trust: ${impact.trust}, respect: ${impact.respect}, culture: ${impact.culture} }`;
    lines[i] = line.slice(0, pos) + impactStr + line.slice(pos);
  }
}

fs.writeFileSync(path, lines.join('\n'));
console.log('Impact data added to all choices (v2).');
