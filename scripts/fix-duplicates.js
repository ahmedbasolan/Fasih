const fs = require('fs');
const path = process.argv[2] || 'src/constants/scenarios.ts';
let src = fs.readFileSync(path, 'utf-8');

// Remove duplicate impact: { ... }, impact: { ... } patterns
src = src.replace(/(impact: \{ trust: -?\d+, respect: -?\d+, culture: -?\d+ \}),\s*\1/g, '$1');

fs.writeFileSync(path, src);
console.log('Duplicate impact fields removed.');
