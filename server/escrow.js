const {
  Connection, Keypair, PublicKey,
  Transaction, SystemProgram, sendAndConfirmTransaction
} = require('@solana/web3.js');
require('dotenv').config();

const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
const escrowKeypair = Keypair.fromSecretKey(
  new Uint8Array(JSON.parse(process.env.ESCROW_PRIVATE_KEY))
);
const ownerWallet = new PublicKey(process.env.OWNER_WALLET);

async function createEscrowTransaction(fromWalletAddress, amountSol) {
  const fromPublicKey = new PublicKey(fromWalletAddress);
  const lamports = amountSol * 1e9;

  // Hier wäre eigentlich der Nutzer mit Phantom dran → clientseitig initiiert.
  console.log(`→ Spieler ${fromPublicKey.toBase58()} soll ${amountSol} SOL an Escrow senden.`);

  // Hinweis: Diese Funktion ist ein Platzhalter, die eigentliche Überweisung erfolgt clientseitig mit Phantom!
}

async function distributeWinnings(winnerWalletAddress, totalBet) {
  const winner = new PublicKey(winnerWalletAddress);
  const ninetyPercent = Math.floor(totalBet * 0.9 * 1e9);
  const tenPercent = Math.floor(totalBet * 0.1 * 1e9);

  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: escrowKeypair.publicKey,
      toPubkey: winner,
      lamports: ninetyPercent
    }),
    SystemProgram.transfer({
      fromPubkey: escrowKeypair.publicKey,
      toPubkey: ownerWallet,
      lamports: tenPercent
    })
  );

  await sendAndConfirmTransaction(connection, transaction, [escrowKeypair]);
  console.log('✅ Gewinn ausgeschüttet');
}

module.exports = { createEscrowTransaction, distributeWinnings };
