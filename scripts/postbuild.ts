import fs from 'fs';
import path from 'path';

const filePath = path.join(__dirname, '../dist/bin/run.js');

if (fs.existsSync(filePath)) {
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.startsWith('#!/usr/bin/env bun')) {
    content = content.replace('#!/usr/bin/env bun', '#!/usr/bin/env node');
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Successfully changed shebang to node in dist/bin/run.js');
  } else {
    console.log('Shebang is already updated or not found.');
  }
} else {
  console.error(`Error: Compiled run.js not found at ${filePath}`);
  process.exit(1);
}
