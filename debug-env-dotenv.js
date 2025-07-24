// Test con dotenv
require('dotenv').config();

console.log('=== DOTENV TEST ===');
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
  console.log(`${key}: ${value ? `✅ [${value.substring(0, 15)}...]` : '❌ MISSING'}`);
});

console.log('\n=== ALL NEXT_PUBLIC KEYS ===');
const nextPublicKeys = Object.keys(process.env).filter(k => k.startsWith('NEXT_PUBLIC_'));
console.log(`Found ${nextPublicKeys.length} NEXT_PUBLIC_ keys:`);
nextPublicKeys.forEach(key => {
  console.log(`- ${key}: ${process.env[key] ? '✅' : '❌'}`);
});