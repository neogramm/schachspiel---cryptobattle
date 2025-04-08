const express = require('express');
const { Connection, clusterApiUrl, Keypair, Transaction, SystemProgram, PublicKey } = require('@solana/web3.js');
const app = express();
const port = 3000;

const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
const escrowAccount = Keypair.generate(); // Ersetze durch dein Escrow-Wallet

// Dummy-Daten für Spieler und deren Einsätze
let players = [
    { wallet: 'Player1WalletAddress', bet: 0.5 },
    { wallet: 'Player2WalletAddress', bet: 0.5 }
];

app.get('/start-game', async (req, res) => {
    // Beispiel: Überweise den Einsatz der Spieler an das Escrow-Wallet
    try {
        const transaction = new Transaction();
        players.forEach(player => {
            const playerPublicKey = new PublicKey(player.wallet);
            transaction.add(
                SystemProgram.transfer({
                    fromPubkey: playerPublicKey,
                    toPubkey: escrowAccount.publicKey,
                    lamports: player.bet * 1e9, // Umrechnung von Solana auf Lamports
                })
            );
        });

        // Signiere und sende die Transaktion
        const signature = await connection.sendTransaction(transaction, [escrowAccount]);
        await connection.confirmTransaction(signature);

        res.send({ message: 'Einsätze erfolgreich auf das Treuhand-Wallet überwiesen!' });
    } catch (err) {
        res.status(500).send({ message: 'Fehler beim Überweisen: ' + err.message });
    }
});

// Hier kannst du die Gewinner-Logik hinzufügen, um den Gewinner zu berechnen
app.post('/winner/:winnerWallet', async (req, res) => {
    const winner = req.params.winnerWallet;
    const winnerAmount = (players[0].bet + players[1].bet) * 0.9;
    const commission = (players[0].bet + players[1].bet) * 0.1;

    // Auszahlung an den Gewinner
    try {
        const winnerPublicKey = new PublicKey(winner);
        const transaction = new Transaction()
            .add(
                SystemProgram.transfer({
                    fromPubkey: escrowAccount.publicKey,
                    toPubkey: winnerPublicKey,
                    lamports: winnerAmount * 1e9,
                })
            )
            .add(
                SystemProgram.transfer({
                    fromPubkey: escrowAccount.publicKey,
                    toPubkey: 'YourWalletPublicKey', // Dein Wallet
                    lamports: commission * 1e9,
                })
            );

        const signature = await connection.sendTransaction(transaction, [escrowAccount]);
        await connection.confirmTransaction(signature);

        res.send({ message: 'Gewinner erfolgreich bezahlt!' });
    } catch (err) {
        res.status(500).send({ message: 'Fehler bei der Auszahlung: ' + err.message });
    }
});

app.listen(port, () => {
    console.log(`Server läuft auf http://localhost:${port}`);
});










const express = require('express');
const { Connection, clusterApiUrl, Keypair, Transaction, SystemProgram, PublicKey } = require('@solana/web3.js');
const app = express();
const port = 3000;

// Dummy-Daten für Spieler und deren Einsätze
let players = [
    { wallet: 'Player1WalletAddress', bet: 0.5 },
    { wallet: 'Player2WalletAddress', bet: 0.5 }
];

// Escrow Account (für Transaktionen)
const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
const escrowAccount = Keypair.generate(); // Escrow-Wallet

app.use(express.json());  // Body-Parser für JSON

// Gewinner Auszahlung
app.post('/winner/:winnerWallet', async (req, res) => {
    const winner = req.params.winnerWallet;
    const winnerAmount = (players[0].bet + players[1].bet) * 0.9;
    const commission = (players[0].bet + players[1].bet) * 0.1;

    try {
        const winnerPublicKey = new PublicKey(winner);
        const transaction = new Transaction()
            .add(
                SystemProgram.transfer({
                    fromPubkey: escrowAccount.publicKey,
                    toPubkey: winnerPublicKey,
                    lamports: winnerAmount * 1e9, // Umrechnung von SOL in Lamports
                })
            )
            .add(
                SystemProgram.transfer({
                    fromPubkey: escrowAccount.publicKey,
                    toPubkey: 'YourWalletPublicKeyHere', // Dein Wallet
                    lamports: commission * 1e9,
                })
            );

        const signature = await connection.sendTransaction(transaction, [escrowAccount]);
        await connection.confirmTransaction(signature);

        res.send({ message: 'Gewinner erfolgreich ausgezahlt!' });
    } catch (err) {
        res.status(500).send({ message: 'Fehler bei der Auszahlung: ' + err.message });
    }
});

app.listen(port, () => {
    console.log(`Server läuft auf http://localhost:${port}`);
});







// server.js

const express = require('express');
const { Connection, Keypair, LAMPORTS_PER_SOL, Transaction, SystemProgram } = require('@solana/web3.js');

const app = express();
const port = 3000;

// Erstelle eine Verbindung zur Solana Blockchain (Devnet)
const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

// Route zum Erstellen eines Escrow-Wallets
app.get('/create-escrow-wallet', async (req, res) => {
  try {
    // Generiere ein neues Escrow-Wallet
    const escrowWallet = Keypair.generate();
    console.log('Escrow Wallet Adresse:', escrowWallet.publicKey.toBase58());

    // Sende Solana zum Escrow-Wallet (Nur zu Testzwecken, über Faucets)
    const fromWallet = Keypair.generate(); // Dein Test-Wallet
    const airdropSignature = await connection.requestAirdrop(fromWallet.publicKey, 2 * LAMPORTS_PER_SOL);

    await connection.confirmTransaction(airdropSignature);

    // Transaktion erstellen, um Solana ins Escrow-Wallet zu senden
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: fromWallet.publicKey,
        toPubkey: escrowWallet.publicKey,
        lamports: 0.5 * LAMPORTS_PER_SOL // 0.5 SOL auf das Escrow-Wallet überweisen
      })
    );

    // Transaktion senden
    const signature = await connection.sendTransaction(transaction, [fromWallet]);

    res.json({
      success: true,
      escrowWallet: escrowWallet.publicKey.toBase58(),
      transactionSignature: signature
    });
  } catch (error) {
    console.error('Fehler beim Erstellen des Escrow-Wallets:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Starte den Server
app.listen(port, () => {
  console.log(`Server läuft auf http://localhost:${port}`);
});
