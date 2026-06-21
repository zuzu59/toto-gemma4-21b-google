const fs = require('fs');

function updateVersionFile() {
  const data = JSON.parse(fs.readFileSync('./version.json', 'utf8'));
  const parts = data.version.split('.').map(Number);
  
  // Incrémente uniquement la position z (dernière)
  parts[parts.length - 1]++;
  
  const newVersion = parts.join('.');
  fs.writeFileSync('./version.json', JSON.stringify({ version: newVersion }, null, 2));
  
  fs.writeFileSync('./src/version.js', `export const APP_VERSION = '${newVersion}';`);
  console.log(`Version updated to ${newVersion}`);
}

updateVersionFile();
