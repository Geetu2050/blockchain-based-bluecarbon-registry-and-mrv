#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Blue Carbon Registry Smart Contract Deployment');
console.log('================================================\n');

// Check if Aptos CLI is installed
try {
  execSync('aptos --version', { stdio: 'pipe' });
  console.log('✅ Aptos CLI is installed');
} catch (error) {
  console.error('❌ Aptos CLI is not installed. Please install it first:');
  console.error('   curl -fsSL "https://aptos.dev/scripts/install_cli.py" | python3');
  process.exit(1);
}

// Check if .aptos directory exists
const aptosDir = path.join(process.cwd(), '.aptos');
if (!fs.existsSync(aptosDir)) {
  console.log('📁 Initializing Aptos project...');
  try {
    execSync('aptos init --profile blue-carbon', { stdio: 'inherit' });
    console.log('✅ Aptos project initialized');
  } catch (error) {
    console.error('❌ Failed to initialize Aptos project:', error.message);
    process.exit(1);
  }
}

// Check if move directory exists
const moveDir = path.join(process.cwd(), 'move', 'BlueCarbonRegistry');
if (!fs.existsSync(moveDir)) {
  console.error('❌ Move directory not found. Please ensure the smart contracts are in move/BlueCarbonRegistry/');
  process.exit(1);
}

console.log('📦 Deploying smart contracts...');

try {
  // Fund the account first
  console.log('💰 Funding account with testnet APT...');
  execSync('aptos account fund-with-faucet --profile blue-carbon', { stdio: 'inherit' });
  
  // Deploy the contracts
  console.log('🚀 Publishing smart contracts...');
  execSync('aptos move publish --profile blue-carbon', { 
    stdio: 'inherit',
    cwd: moveDir
  });
  
  console.log('✅ Smart contracts deployed successfully!');
  
  // Get the account address
  const configPath = path.join(aptosDir, 'config.yaml');
  if (fs.existsSync(configPath)) {
    const config = fs.readFileSync(configPath, 'utf8');
    const accountMatch = config.match(/account: "([^"]+)"/);
    if (accountMatch) {
      const accountAddress = accountMatch[1];
      console.log(`\n📋 Contract Address: ${accountAddress}`);
      console.log(`\n🔗 View on Aptos Explorer:`);
      console.log(`   https://explorer.aptoslabs.com/account/${accountAddress}?network=testnet`);
      
      // Update .env file
      const envPath = path.join(process.cwd(), '.env');
      let envContent = '';
      
      if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf8');
      }
      
      // Update or add contract address
      if (envContent.includes('REACT_APP_CONTRACT_ADDRESS=')) {
        envContent = envContent.replace(
          /REACT_APP_CONTRACT_ADDRESS=.*/,
          `REACT_APP_CONTRACT_ADDRESS=${accountAddress}`
        );
      } else {
        envContent += `\nREACT_APP_CONTRACT_ADDRESS=${accountAddress}\n`;
      }
      
      // Ensure other required variables
      if (!envContent.includes('REACT_APP_APTOS_NETWORK=')) {
        envContent += 'REACT_APP_APTOS_NETWORK=testnet\n';
      }
      
      fs.writeFileSync(envPath, envContent);
      console.log(`\n✅ Updated .env file with contract address`);
      
      console.log(`\n🎉 Deployment complete!`);
      console.log(`\nNext steps:`);
      console.log(`1. Restart your React app: npm start`);
      console.log(`2. Connect your wallet`);
      console.log(`3. Try the marketplace features`);
      console.log(`\nTo initialize the liquidity pool, run:`);
      console.log(`   aptos move run --profile blue-carbon --function-id ${accountAddress}::LiquidityPool::initialize`);
    }
  }
  
} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  console.log('\nTroubleshooting:');
  console.log('1. Make sure your account has enough APT for gas fees');
  console.log('2. Check that the Aptos CLI is properly configured');
  console.log('3. Verify you are connected to the testnet');
  process.exit(1);
}
