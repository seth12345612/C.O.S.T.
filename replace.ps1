const fs = require('fs');
const path = require('path');
const glob = require('glob');

const replacements = [
  [/\btext-white\/80\b/g, 'text-bright'],
  [/\btext-white\/70\b/g, 'text-strong'],
  [/\btext-white\/60\b/g, 'text-muted'],
  [/\btext-white\/50\b/g, 'text-dim'],
  [/\btext-white\/40\b/g, 'text-subtle'],
  [/\btext-white\/30\b/g, 'text-faint'],
  [/\btext-white\/25\b/g, 'text-fainter'],
  [/\btext-white\/20\b/g, 'text-faintest'],
  [/\bbg-white\/20\b/g, 'bg-card-strong'],
  [/\bbg-white\/15\b/g, 'bg-card-active'],
  [/\bbg-white\/10\b/g, 'bg-card-hover'],
  [/\bbg-white\/8\b/g, 'bg-card-soft8'],
  [/\bbg-white\/6\b/g, 'bg-card-soft6'],
  [/\bbg-white\/5\b/g, 'bg-card'],
  [/\bbg-white\/4\b/g, 'bg-card-soft4'],
  [/\bbg-white\/3\b/g, 'bg-card-soft'],
  [/\bborder-white\/40\b/g, 'border-strongest'],
  [/\bborder-white\/30\b/g, 'border-stronger'],
  [/\bborder-white\/20\b/g, 'border-strong'],
  [/\bborder-white\/15\b/g, 'border-medium'],
  [/\bborder-white\/10\b/g, 'border-subtle'],
  [/\bborder-white\/8\b/g, 'border-subtle8'],
  [/\bborder-white\/5\b/g, 'border-subtler'],
  [/\bbg-black\/80\b/g, 'bg-overlay-stronger'],
  [/\bbg-black\/70\b/g, 'bg-overlay-strong'],
  [/\bbg-black\/60\b/g, 'bg-overlay'],
  [/\bbg-black\/40\b/g, 'bg-overlay-soft'],
  [/\bhover:bg-white\/20\b/g, 'hover:bg-card-strong'],
  [/\bhover:bg-white\/10\b/g, 'hover:bg-card-hover'],
  [/\bhover:bg-white\/8\b/g, 'hover:bg-card-soft8'],
  [/\bhover:bg-white\/6\b/g, 'hover:bg-card-soft6'],
  [/\bhover:bg-white\/5\b/g, 'hover:bg-card'],
  [/\bhover:border-white\/40\b/g, 'hover:border-strongest'],
  [/\bhover:border-white\/30\b/g, 'hover:border-stronger'],
  [/\bhover:border-white\/20\b/g, 'hover:border-strong'],
  [/\bhover:text-white\b/g, 'hover:text-main'],
  [/\bplaceholder:text-white\/30\b/g, 'placeholder-text-faint'],
  [/\bplaceholder:text-white\/25\b/g, 'placeholder-text-fainter'],
  [/\bplaceholder:text-white\/20\b/g, 'placeholder-text-faintest'],
  [/\btext-white\b(?!\/)/g, 'text-main'],
];

const srcDir = path.join(__dirname, 'src');
const files = glob.sync('**/*.tsx', { cwd: srcDir, ignore: 'node_modules/**' });

let count = 0;
for (const file of files) {
  const filePath = path.join(srcDir, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  let changed = false;
  
  for (const [pattern, replacement] of replacements) {
    if (pattern.test(content)) {
      pattern.lastIndex = 0;
      content = content.replace(pattern, replacement);
      changed = true;
    }
  }
  
  if (changed) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Updated: ${file}`);
    count++;
  }
}

console.log(`\nDone! ${count} files updated.`);
