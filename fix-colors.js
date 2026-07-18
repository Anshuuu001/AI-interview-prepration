const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    if (fs.statSync(dirFile).isDirectory()) {
      filelist = walkSync(dirFile, filelist);
    } else if (dirFile.endsWith('.jsx') || dirFile.endsWith('.js')) {
      filelist.push(dirFile);
    }
  });
  return filelist;
};

const files = walkSync('./src');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  content = content.replace(/(?<![:a-zA-Z0-9\-])text-slate-100(?![a-zA-Z0-9\-])/g, 'text-slate-900 dark:text-slate-100');
  content = content.replace(/(?<![:a-zA-Z0-9\-])text-slate-200(?![a-zA-Z0-9\-])/g, 'text-slate-800 dark:text-slate-200');
  content = content.replace(/(?<![:a-zA-Z0-9\-])text-slate-250(?![a-zA-Z0-9\-])/g, 'text-slate-800 dark:text-slate-200');
  content = content.replace(/(?<![:a-zA-Z0-9\-])text-slate-300(?![a-zA-Z0-9\-])/g, 'text-slate-700 dark:text-slate-300');
  content = content.replace(/(?<![:a-zA-Z0-9\-])text-slate-350(?![a-zA-Z0-9\-])/g, 'text-slate-600 dark:text-slate-300');
  
  if (original !== content) {
    fs.writeFileSync(file, content);
    console.log('Fixed ' + file);
  }
});
console.log('Done');
