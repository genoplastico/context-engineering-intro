import { NextResponse } from 'next/server';

export async function GET() {
  const firebaseKeys = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID'
  ];

  const result = {
    serverSide: {
      nodeEnv: process.env.NODE_ENV,
      totalEnvKeys: Object.keys(process.env).length,
      nextPublicKeys: Object.keys(process.env).filter(k => k.startsWith('NEXT_PUBLIC_')),
      firebaseKeys: {} as Record<string, string | null>
    }
  };

  firebaseKeys.forEach(key => {
    result.serverSide.firebaseKeys[key] = process.env[key] || null;
  });

  console.log('🔥 SERVER API DEBUG:', JSON.stringify(result, null, 2));

  return NextResponse.json(result);
}