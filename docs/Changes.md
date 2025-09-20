# Changes Log

## Version 0.1.23 - 2025-01-19
### ✨ New Features
- **ERC-4337 Account Creator**: Added new page for creating ERC-4337 smart accounts
  - Support for Simple Account and Alchemy Light Account factories
  - CREATE2 deterministic address calculation with salt configuration
  - Custom and Random salt modes for creating multiple accounts per private key
  - Automatic PNTs and ETH funding for new accounts
  - Account creation history with local storage persistence

### 🐛 Bug Fixes
- **Salt Functionality**: Fixed salt value processing to correctly generate different addresses
  - Added proper salt normalization (hex/decimal conversion)
  - Fixed Random Salt mode to generate new values on each calculation
  - Added real-time salt display and debugging information
  - Enhanced salt input validation and formatting
  - Added clear UI distinction between factory addresses and smart account addresses
  - Etherscan integration for transaction tracking

### 🔧 Technical Changes
- **New Component**: `AccountCreatorPage.jsx` - Complete account creation workflow
- **UI Enhancement**: Added page navigation in header
- **Routing**: Implemented simple page switching (main/account-creator)
- **Styling**: Added comprehensive CSS for account creator interface
- **Factory Support**: Integrated multiple ERC-4337 factory contracts
  - Simple Account Factory (Sepolia): `0x91E60e0613810449d098b0b5Ec8b51A0FE8c8985`
  - Alchemy Light Account Factory (Sepolia): `0x00004EC70002a32400f8ae005A26aeFe730D0A1E`

### 📚 Documentation
- **AccountCreatorUsage.md**: Comprehensive usage guide for the new feature
- **SolutionV3.md**: Updated with latest factory addresses and implementation details

### 🏗️ Architecture
- **Non-intrusive Design**: New functionality added without modifying existing code
- **Modular Components**: Separate page component with clear interfaces
- **State Management**: Local storage for account persistence
- **Error Handling**: Comprehensive error handling and user feedback

## Previous Versions
- 0.1.22 - Initial project setup and basic minting functionality
- 0.1.21 - Gas-sponsored minting implementation
- 0.1.20 - PNTs ERC20 token deployment
- 0.1.19 - NFT and SBT minting features
