/**
 * Setup Verification Script
 * Checks if all required environment variables are configured
 *
 * Run with: node scripts/verify-setup.js
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const chalk = {
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  bold: (text) => `\x1b[1m${text}\x1b[0m`,
};

console.log('\n' + chalk.bold(chalk.blue('🔍 ChefConnect Setup Verification\n')));

// Required environment variables
const requiredVars = {
  'App Configuration': [
    'NEXT_PUBLIC_APP_URL',
    'NEXT_PUBLIC_APP_NAME',
    'NODE_ENV',
  ],
  'Supabase': [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
  ],
  'Firebase Client': [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID',
  ],
  'Firebase Admin SDK': [
    'FIREBASE_ADMIN_PROJECT_ID',
    'FIREBASE_ADMIN_CLIENT_EMAIL',
    'FIREBASE_ADMIN_PRIVATE_KEY',
  ],
};

let allConfigured = true;
let warningCount = 0;

// Check each category
Object.entries(requiredVars).forEach(([category, vars]) => {
  console.log(chalk.bold(`\n${category}:`));

  vars.forEach(varName => {
    const value = process.env[varName];
    const isConfigured = value && value.length > 0 && !value.includes('your_');

    if (isConfigured) {
      // Show partial value for security
      const displayValue = varName.includes('KEY') || varName.includes('SECRET')
        ? value.substring(0, 20) + '...'
        : value.length > 50
        ? value.substring(0, 50) + '...'
        : value;

      console.log(`  ${chalk.green('✓')} ${varName}: ${displayValue}`);
    } else {
      console.log(`  ${chalk.red('✗')} ${varName}: ${chalk.red('NOT CONFIGURED')}`);
      allConfigured = false;
    }
  });
});

// Optional variables
console.log(chalk.bold('\n\nOptional Configuration:'));
const optionalVars = [
  'RESEND_API_KEY',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
];

optionalVars.forEach(varName => {
  const value = process.env[varName];
  const isConfigured = value && value.length > 0;

  if (isConfigured) {
    const displayValue = value.substring(0, 20) + '...';
    console.log(`  ${chalk.green('✓')} ${varName}: ${displayValue}`);
  } else {
    console.log(`  ${chalk.yellow('○')} ${varName}: ${chalk.yellow('Not configured')}`);
    warningCount++;
  }
});

// Validation checks
console.log(chalk.bold('\n\nValidation Checks:'));

// Check Firebase private key format
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
if (privateKey) {
  if (privateKey.includes('BEGIN PRIVATE KEY')) {
    console.log(`  ${chalk.green('✓')} Firebase private key format looks correct`);
  } else {
    console.log(`  ${chalk.red('✗')} Firebase private key format may be incorrect`);
    console.log(`     Make sure it includes "-----BEGIN PRIVATE KEY-----"`);
    allConfigured = false;
  }
}

// Check Supabase URL format
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (supabaseUrl && supabaseUrl.startsWith('https://')) {
  console.log(`  ${chalk.green('✓')} Supabase URL format is correct`);
} else if (supabaseUrl) {
  console.log(`  ${chalk.red('✗')} Supabase URL should start with https://`);
  allConfigured = false;
}

// Check Firebase Auth Domain format
const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
if (authDomain && authDomain.includes('firebaseapp.com')) {
  console.log(`  ${chalk.green('✓')} Firebase auth domain format is correct`);
} else if (authDomain) {
  console.log(`  ${chalk.yellow('⚠')} Firebase auth domain format may be incorrect`);
  console.log(`     Should end with .firebaseapp.com`);
}

// Summary
console.log(chalk.bold('\n\n' + '='.repeat(60)));
if (allConfigured) {
  console.log(chalk.green(chalk.bold('\n✓ All required environment variables are configured!\n')));
  console.log('Next steps:');
  console.log('1. Run the Supabase SQL schema (see FIREBASE_SETUP.md)');
  console.log('2. Start the dev server: npm run dev');
  console.log('3. Build your frontend components\n');
} else {
  console.log(chalk.red(chalk.bold('\n✗ Some required variables are missing!\n')));
  console.log('Please update your .env.local file with the missing values.');
  console.log('See FIREBASE_SETUP.md for detailed instructions.\n');
  process.exit(1);
}

if (warningCount > 0) {
  console.log(chalk.yellow(`⚠ ${warningCount} optional variable(s) not configured`));
  console.log('These are optional but recommended for full functionality.\n');
}

console.log('='.repeat(60) + '\n');
