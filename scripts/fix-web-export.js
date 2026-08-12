const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist');
const oldSegment = 'node_modules';
const newSegment = 'vendor-modules';

function renameNodeModulesDirs(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === oldSegment) {
        const newPath = path.join(dir, newSegment);
        fs.renameSync(fullPath, newPath);
        renameNodeModulesDirs(newPath);
      } else {
        renameNodeModulesDirs(fullPath);
      }
    }
  }
}

function walk(dir, callback) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, callback);
    } else {
      callback(fullPath);
    }
  }
}

renameNodeModulesDirs(distDir);

walk(distDir, (filePath) => {
  const ext = path.extname(filePath);
  if (['.js', '.html', '.json', '.css', '.map'].includes(ext)) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes(oldSegment)) {
      content = content.split(oldSegment).join(newSegment);
      fs.writeFileSync(filePath, content, 'utf8');
    }
  }
});

console.log('Fixed node_modules path segment in dist/ for Vercel compatibility.');