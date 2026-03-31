const fs = require('fs');
const path = require('path');

function removeComments(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Remove multi-line comments
  content = content.replace(/\/\*[\s\S]*?\*\//g, '');
  
  // Remove single line comments (not matching http://)
  // We match // followed by anything up to a newline, NOT preceded by :
  content = content.replace(/(?<!:)\/\/.*$/gm, '');
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Cleaned comments from', filePath);
}

function traverse(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      traverse(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx') || fullPath.endsWith('.css') || fullPath.endsWith('.json')) {
      if (!fullPath.includes('node_modules') && !fullPath.includes('.git') && !file.includes('package') && !file.includes('tsconfig')) {
        removeComments(fullPath);
      }
    }
  }
}

// 1. Delete SpellingBeeChallenge
const spellingBeePath = path.join(__dirname, 'src/components/SpellingBeeChallenge.tsx');
if(fs.existsSync(spellingBeePath)) {
  fs.unlinkSync(spellingBeePath);
  console.log('Deleted', spellingBeePath);
}

// 2. Clean comments
traverse(path.join(__dirname, 'src'));
console.log('Done cleaning comments.');
