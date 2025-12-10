@echo off
echo 🌊 Setting up Blue Carbon Registry...
echo.

if not exist .env (
    echo 📝 Creating .env file from template...
    echo # Aptos Smart Contract Configuration > .env
    echo REACT_APP_CONTRACT_ADDRESS=0x1::blue_carbon_registry >> .env
    echo REACT_APP_APTOS_NETWORK=testnet >> .env
    echo. >> .env
    echo # Optional: API Keys for external services >> .env
    echo # REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id >> .env
    echo # REACT_APP_ANALYTICS_ID=your_analytics_id >> .env
    echo ✅ .env file created successfully!
) else (
    echo ✅ .env file already exists
)

echo.
echo 🚀 Setup complete! You can now run:
echo    npm start     - Start development server
echo    npm run build - Build for production
echo.
echo 📚 Make sure to:
echo    1. Install an Aptos wallet (Petra, Martian, or Pontem)
echo    2. Connect your wallet to the testnet
echo    3. Have some testnet APT for gas fees
echo.
echo 🌍 Happy coding for the environment!
pause




