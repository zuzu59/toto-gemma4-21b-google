const fs = require('fs');
const { execSync } = require('child_process');

function incrementVersion() {
  const data = JSON.parse(fs.readFileSync('./version.json', 'utf8'));
  const parts = data.version.split('.').map(Number);
  
  if (parts[parts.length - 1] < 9) {
    parts[parts.length - 1]++;
  } else {
    parts[parts.length - 2]++;
    parts[parts.length - 1] = 0;
  }
  
  const newVersion = parts.join('.');
  fs.writeFileSync('./version.json', JSON.stringify({ version: newVersion }, null, 2));
  console.log(`Version incremented to ${newVersion}`);
  return newVersion;
}

const version = incrementVersion();

try {
  console.log(`Building version ${version}...`);
  execSync('npm run build', { stdio: 'inherit' });
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}
