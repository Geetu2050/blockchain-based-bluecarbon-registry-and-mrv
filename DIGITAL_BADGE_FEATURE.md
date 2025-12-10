# Digital Badge Feature Documentation

## Overview

The Digital Badge feature provides verifiable proof of carbon credit retirement actions. When users retire their carbon credits, they receive a beautiful, downloadable digital badge that serves as a certificate of their climate action.

## Features

### 🏆 Digital Badge Component
- **Certificate-like Design**: Professional, visually appealing badge with gradient background
- **Dynamic Information Display**: Shows company name, project name, credits retired, retirement date, and transaction hash
- **QR Code Integration**: Scannable QR code that links directly to the blockchain transaction
- **Download Options**: PNG and PDF export functionality
- **Verification**: Cryptographically linked to blockchain for tamper-proof verification

### 🔗 Blockchain Integration
- **Transaction Verification**: QR code links to Aptos Explorer for instant verification
- **Immutable Records**: All retirement data is stored on the blockchain
- **Real-time Updates**: Badge data is synchronized with blockchain transactions

### 📊 Firebase Backend
- **Badge Storage**: All badge data is stored in Firestore for off-chain record keeping
- **User Statistics**: Track total badges, credits retired, and unique projects
- **Analytics**: Comprehensive retirement analytics and reporting
- **Cloud Functions**: Automated processing when badges are created

## Implementation Details

### Frontend Components

#### DigitalBadge.js
```javascript
// Key features:
- QR code generation using qrcode.react
- High-quality image export using html2canvas
- PDF generation using jsPDF
- Responsive design with Bootstrap styling
- Transaction verification integration
```

#### BuyerPortal Integration
```javascript
// Enhanced retirement flow:
1. User retires credits
2. Transaction is executed on blockchain
3. Badge data is created and stored in Firebase
4. Digital badge modal is displayed
5. User can download PNG/PDF versions
6. Badge statistics are updated
```

### Backend Services

#### badgeService.js
```javascript
// Firebase Firestore operations:
- createBadge(): Store new badge data
- getUserBadges(): Retrieve user's badge collection
- getBadgeByTransactionHash(): Verify specific badge
- getUserBadgeStats(): Calculate user statistics
- verifyBadge(): Verify badge authenticity
```

#### Firebase Cloud Functions
```typescript
// Automated processing:
- onBadgeCreated: Triggered when badge is created
- getRetirementStats: HTTP endpoint for analytics
- verifyBadge: HTTP endpoint for badge verification
- User and project statistics updates
```

## Usage Flow

### 1. Credit Retirement
1. User navigates to "My Purchases" tab
2. Clicks "Retire" button on active credits
3. Wallet transaction is executed
4. Badge data is automatically generated

### 2. Badge Generation
1. Digital badge modal opens automatically
2. Badge displays all relevant information
3. QR code is generated for verification
4. User can download PNG or PDF versions

### 3. Badge Management
1. Retired credits show "Badge" button
2. Users can view previously generated badges
3. Badge statistics are displayed in dashboard
4. All badges are stored in Firebase for persistence

## Technical Requirements

### Dependencies Added
```json
{
  "qrcode.react": "^3.1.0",
  "html2canvas": "^1.4.1", 
  "jspdf": "^2.5.1"
}
```

### Firebase Configuration
- Firestore database for badge storage
- Cloud Functions for automated processing
- Authentication for secure access

### Blockchain Integration
- Aptos blockchain for transaction verification
- Transaction hash linking to Aptos Explorer
- Real-time transaction status updates

## Security Features

### Verification
- **Blockchain Verification**: All badges are linked to immutable blockchain transactions
- **QR Code Scanning**: Instant verification through blockchain explorer
- **Tamper-proof**: Badge data cannot be modified without detection

### Data Integrity
- **Firebase Storage**: Off-chain backup of all badge data
- **User Authentication**: Secure access to badge collections
- **Transaction Validation**: All transactions are validated on-chain

## Analytics and Reporting

### User Statistics
- Total number of digital badges earned
- Total credits retired across all projects
- Unique projects participated in
- First and latest retirement dates

### Project Analytics
- Total retirements per project
- Credits retired per project
- User participation metrics
- Time-based retirement trends

## Future Enhancements

### Planned Features
1. **Social Sharing**: Direct sharing to social media platforms
2. **Badge Collections**: Organize badges by project or date
3. **Achievement Levels**: Tiered badge system based on retirement volume
4. **Team Badges**: Corporate team retirement tracking
5. **API Integration**: Third-party verification endpoints

### Technical Improvements
1. **Offline Support**: Cache badges for offline viewing
2. **Batch Downloads**: Download multiple badges at once
3. **Custom Styling**: User-customizable badge designs
4. **Mobile Optimization**: Enhanced mobile badge experience

## Deployment

### Frontend Deployment
```bash
npm run build
# Deploy to your preferred hosting platform
```

### Firebase Functions Deployment
```bash
cd functions
npm install
npm run build
firebase deploy --only functions
```

### Environment Variables
```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

## Support

For technical support or feature requests, please refer to the main project documentation or create an issue in the repository.

---

*This digital badge feature enhances the user experience by providing tangible proof of climate action, encouraging continued participation in carbon credit retirement programs.*
