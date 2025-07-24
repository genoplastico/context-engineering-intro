// Test independiente de variables de entorno
console.log('=== INDEPENDENT ENV TEST ===');
console.log('Current directory:', process.cwd());
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('All env keys count:', Object.keys(process.env).length);

// Check for our Firebase keys specifically
const firebaseKeys = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID'
];

console.log('\n=== FIREBASE KEYS TEST ===');
firebaseKeys.forEach(key => {
  const value = process.env[key];
  console.log(`${key}: ${value ? `✅ [${value.substring(0, 10)}...]` : '❌ MISSING'}`);
});

console.log('\n=== ALL NEXT_PUBLIC KEYS ===');
const nextPublicKeys = Object.keys(process.env).filter(k => k.startsWith('NEXT_PUBLIC_'));
console.log(`Found ${nextPublicKeys.length} NEXT_PUBLIC_ keys:`);
nextPublicKeys.forEach(key => {
  console.log(`- ${key}: ${process.env[key] ? '✅' : '❌'}`);
});

console.log('\n=== TRYING TO LOAD .env MANUALLY ===');
try {
  const fs = require('fs');
  const path = require('path');
  
  const envPath = path.join(process.cwd(), '.env');
  const envLocalPath = path.join(process.cwd(), '.env.local');
  
  console.log('Checking .env file:', envPath);
  console.log('.env exists:', fs.existsSync(envPath));
  
  console.log('Checking .env.local file:', envLocalPath);
  console.log('.env.local exists:', fs.existsSync(envLocalPath));
  
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    console.log('.env content preview:', envContent.substring(0, 200) + '...');
  }
  
  if (fs.existsSync(envLocalPath)) {
    const envLocalContent = fs.readFileSync(envLocalPath, 'utf8');
    console.log('.env.local content preview:', envLocalContent.substring(0, 200) + '...');
  }
} catch (error) {
  console.error('Error checking files:', error.message);
}