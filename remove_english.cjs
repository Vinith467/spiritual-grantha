const fs = require('fs');
let content = fs.readFileSync('src/pages/Admin.jsx', 'utf8');

// Replace all instances of content_language: 'en' with 'hi'
content = content.replace(/content_language: 'en'/g, "content_language: 'hi'");

// Replace all instances of item.content_language || 'en' with 'hi'
content = content.replace(/item\.content_language \|\| 'en'/g, "item.content_language || 'hi'");

// Remove the English option from all selects
content = content.replace(/<option value="en">English<\/option>\s*/g, '');

fs.writeFileSync('src/pages/Admin.jsx', content);
console.log('Admin.jsx successfully updated.');
