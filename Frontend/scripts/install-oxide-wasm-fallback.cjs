const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const targetDir = path.join(root, 'node_modules', '@tailwindcss', 'oxide-wasm32-wasi');
const packageDir = path.join(root, 'node_modules', '@tailwindcss');
const tarballName = 'tailwindcss-oxide-wasm32-wasi-4.2.4.tgz';
const tarballPath = path.join(root, tarballName);

if (fs.existsSync(targetDir)) {
  process.exit(0);
}

if (!fs.existsSync(packageDir)) {
  fs.mkdirSync(packageDir, { recursive: true });
}

console.log('Installing @tailwindcss/oxide-wasm32-wasi fallback package...');
execSync(`npm pack @tailwindcss/oxide-wasm32-wasi@4.2.4`, {
  stdio: 'inherit',
  cwd: root,
});

execSync(`tar -xzf ${tarballName} -C ${packageDir}`, {
  stdio: 'inherit',
  cwd: root,
});

const extractedPackageDir = path.join(packageDir, 'package');
if (!fs.existsSync(extractedPackageDir)) {
  throw new Error('Expected extracted package directory not found');
}

fs.renameSync(extractedPackageDir, targetDir);
fs.unlinkSync(tarballPath);
console.log('Installed @tailwindcss/oxide-wasm32-wasi fallback package.');
