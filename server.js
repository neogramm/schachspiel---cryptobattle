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
