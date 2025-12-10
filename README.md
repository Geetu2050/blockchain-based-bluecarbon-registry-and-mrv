# Blue Carbon Registry

A blockchain-powered Blue Carbon Registry built on React.js and the Aptos blockchain. This application enables NGOs to register coastal restoration projects, administrators to verify and approve them, and corporate buyers to purchase and retire carbon credits with complete transparency.

## 🌊 Features

### Core Functionality
- **Project Registration**: NGOs can submit detailed coastal restoration projects
- **Verification & Approval**: Administrators can review and approve projects
- **Credit Trading**: Corporate buyers can purchase and retire carbon credits
- **Blockchain Integration**: All operations are recorded on the Aptos blockchain
- **Real-time Transparency**: Live blockchain explorer for all transactions

### User Portals
- **Landing Page**: Public homepage with project statistics and information
- **Registry**: Public view of all registered projects
- **NGO Dashboard**: Secure portal for project submission and management
- **Admin Dashboard**: Administrative interface for project verification
- **Buyer Portal**: Marketplace for purchasing and retiring carbon credits

### Technical Features
- **Wallet Integration**: Connect with Aptos wallets (Petra, Martian, Pontem)
- **Google Authentication**: Simulated login system
- **Responsive Design**: Mobile-first Bootstrap 5 UI
- **Real-time Data**: Live blockchain data integration
- **Transaction History**: Complete audit trail of all operations

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Aptos wallet (Petra, Martian, or Pontem)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd blue-carbon-registry
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Environment Variables

Create a `.env` file in the root directory:

```env
REACT_APP_CONTRACT_ADDRESS=0x1::blue_carbon_registry
REACT_APP_APTOS_NETWORK=testnet
```

## 🏗️ Architecture

### Frontend Stack
- **React.js 18**: Modern React with hooks and functional components
- **React Router**: Client-side routing
- **Bootstrap 5**: Responsive UI framework
- **Aptos Wallet Adapter**: Blockchain wallet integration
- **Aptos TypeScript SDK**: Blockchain interaction

### Smart Contract Integration
The application integrates with a conceptual smart contract on Aptos that includes:

- `create_project`: Register new blue carbon projects
- `verify_project`: Approve or reject projects
- `mint_tokens`: Issue carbon credits for approved projects
- `purchase_credits`: Buy carbon credits
- `retire_credits`: Permanently remove credits from circulation

### State Management
- React's built-in `useState` and `useEffect` hooks
- Context providers for wallet and authentication state
- Local state management for UI interactions

## 📱 User Interface

### Design Principles
- **Clean & Modern**: Minimalist design with ample whitespace
- **Responsive**: Mobile-first approach with Bootstrap 5
- **Accessible**: WCAG compliant with proper contrast and navigation
- **Intuitive**: Clear navigation and user flows

### Color Palette
- **Primary**: Forest Green (#2d5a27)
- **Secondary**: Sage Green (#4a7c59)
- **Accent**: Olive Green (#6b8e23)
- **Success**: Bootstrap Green (#28a745)
- **Warning**: Bootstrap Yellow (#ffc107)

## 🔗 Blockchain Integration

### Wallet Support
- **Petra Wallet**: Primary Aptos wallet
- **Martian Wallet**: Alternative Aptos wallet
- **Pontem Wallet**: Additional wallet option

### Transaction Types
- **Project Creation**: Register new restoration projects
- **Project Verification**: Approve/reject projects
- **Token Minting**: Issue carbon credits
- **Credit Purchase**: Buy credits from marketplace
- **Credit Retirement**: Permanently remove credits

### Smart Contract Functions
```typescript
// Project management
create_project(name, description, location, hectares, credits, start_date, end_date, methodology)
verify_project(project_id, approved)
mint_tokens(project_id, amount)

// Credit trading
purchase_credits(project_id, quantity, total_cost)
retire_credits(purchase_id)

// View functions
get_project(project_id)
get_available_credits()
get_user_purchases(user_address)
```

## 🎯 User Roles

### Public Users
- View project registry
- Access landing page information
- Browse available credits

### NGOs
- Submit new projects
- Track project status
- View earned credits
- Manage project documentation

### Administrators
- Review pending projects
- Approve or reject submissions
- Mint carbon credits
- Access admin analytics

### Corporate Buyers
- Browse available credits
- Purchase carbon credits
- Retire credits for offsetting
- Track purchase history

## 🔒 Security Features

### Authentication
- Simulated Google OAuth integration
- Role-based access control
- Secure route protection

### Blockchain Security
- Wallet signature verification
- Transaction validation
- Immutable record keeping
- Public audit trail

### Data Integrity
- All data stored on blockchain
- No centralized database
- Transparent verification process
- Tamper-proof records

## 📊 Analytics & Reporting

### Real-time Statistics
- Total hectares restored
- Credits issued and retired
- Project approval rates
- Transaction volume

### Blockchain Explorer
- Live transaction feed
- Transaction details and status
- Gas usage tracking
- Block confirmation times

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel
```bash
npm install -g vercel
vercel --prod
```

### Deploy to Netlify
```bash
npm run build
# Upload build folder to Netlify
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🌍 Environmental Impact

This platform enables:
- **Transparent Carbon Markets**: Verified and traceable carbon credits
- **Coastal Restoration**: Support for mangrove, seagrass, and salt marsh projects
- **Climate Action**: Direct contribution to carbon sequestration
- **Sustainable Finance**: Market-based incentives for environmental restoration

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔮 Future Enhancements

- **Mobile App**: Native iOS and Android applications
- **Advanced Analytics**: Detailed impact reporting
- **API Integration**: Third-party verification services
- **Multi-chain Support**: Integration with other blockchains
- **Carbon Footprint Calculator**: Personal impact assessment tools

---

Built with ❤️ for the environment and powered by blockchain technology.
