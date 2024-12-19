# Sketch-Chain

A Web3 drawing game where players wager crypto, compete to draw and guess, and winners take the pool.

[![Video Demo](https://img.youtube.com/vi/oJ6OyIFg-sU/0.jpg)](https://youtu.be/oJ6OyIFg-sU?feature=shared)

## 🎮 Features

- Real-time drawing and guessing gameplay
- Cryptocurrency wagering system
- Automatic prize distribution
- WalletConnect integration
- Game history tracking
- Smart contract-based game logic

## 🛠️ Built With

- Next.js 14
- TypeScript
- Socket.io
- Solidity
- WalletConnect
- Mantle Network

## 🚀 Contract Details

- Network: Mantle-Sepolia Testnet
- Contract Address: `0x5D8D952a174e094aab6fFA4E01d0bcF5696BbA78`

## 📋 Prerequisites

- Node.js (v18 or higher)
- Yarn or npm
- MetaMask or any WalletConnect compatible wallet
- Mantle-Sepolia testnet MNT for transactions

## ⚙️ Installation

1. Clone the repository:
```bash
git clone https://github.com/Kaustubh-404/Sketch-Chain
cd sketch-chain
```

2. Frontend Setup:
```bash
# Install frontend dependencies
npm install
# or
yarn install

# Set up environment variables
cp .env.example .env.local

# Start the frontend development server
npm run dev
# or
yarn dev
```

3. Backend Setup:
```bash
# Navigate to backend directory
cd backend

# Install backend dependencies
npm install

# Start the backend server
npm run dev
# or
node server.js
```

## 🎯 How to Play

1. Connect your Web3 wallet
2. Create a room or join with a 6-digit code
3. Place your wager (minimum 1 USD)
4. Take turns drawing and guessing
5. Highest points winner takes the pool!

## 🏗️ Project Structure

```
project-root/
├── src/               # Frontend code
│   ├── app/          # Next.js pages
│   ├── components/   # React components
│   ├── contracts/    # Smart contracts
│   ├── hooks/        # Custom hooks
│   └── utils/        # Utility functions
├── backend/          # Backend Socket.io server
└── public/          # Static assets
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## 🙏 Acknowledgments

- Built during [Mantle-APAC Hackathon on HackQuest]
- Powered by Mantle Network
- Special thanks to all contributors

## 📧 Contact

Your Name - [@flackk_](https://twitter.com/flackk_)

Project Link: [https://github.com/Kaustubh-404/Sketch-Chain](https://github.com/Kaustubh-404/Sketch-Chain)
