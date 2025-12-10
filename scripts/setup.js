#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🌊 Setting up Blue Carbon Registry...\n');

// Check if .env file exists
const envPath = path.join(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file from template...');
  const envContent = `# Aptos Smart Contract Configuration
REACT_APP_CONTRACT_ADDRESS=0x1::blue_carbon_registry
REACT_APP_APTOS_NETWORK=testnet

# Optional: API Keys for external services
# REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
# REACT_APP_ANALYTICS_ID=your_analytics_id
`;
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created successfully!');
} else {
  console.log('✅ .env file already exists');
}

console.log('\n🚀 Setup complete! You can now run:');
console.log('   npm start     - Start development server');
console.log('   npm run build - Build for production');
console.log('\n📚 Make sure to:');
console.log('   1. Install an Aptos wallet (Petra, Martian, or Pontem)');
console.log('   2. Connect your wallet to the testnet');
console.log('   3. Have some testnet APT for gas fees');
console.log('\n🌍 Happy coding for the environment!');
