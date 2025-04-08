// Global variables
let userWallet = null;
let escrowAddress = 'EscrowWalletPublicKeyHere'; // Ersetze mit dem tatsächlichen Escrow Wallet
let betAmount = 0.1;

document.getElementById('connectButton').addEventListener('click', async () => {
    if (window.solana && window.solana.isPhantom) {
        try {
            await window.solana.connect();
            userWallet = window.solana.publicKey.toString();
            document.getElementById('walletAddress').innerText = `Wallet verbunden: ${userWallet}`;
            document.getElementById('startGameButton').disabled = false;
        } catch (err) {
            alert('Wallet-Verbindung fehlgeschlagen!');
        }
    } else {
        alert('Phantom Wallet nicht gefunden!');
    }
});

document.getElementById('betAmount').addEventListener('input', (event) => {
    betAmount = parseFloat(event.target.value);
});

document.getElementById('startGameButton').addEventListener('click', async () => {
    if (userWallet) {
        await startGame();
    } else {
        alert('Bitte verbinde dein Wallet zuerst!');
    }
});

async function startGame() {
    // Transferiere den Einsatz an das Escrow-Wallet
    try {
        const connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl('devnet'));
        const senderPublicKey = new solanaWeb3.PublicKey(userWallet);
        const escrowPublicKey = new solanaWeb3.PublicKey(escrowAddress);
        
        const transaction = new solanaWeb3.Transaction().add(
            solanaWeb3.SystemProgram.transfer({
                fromPubkey: senderPublicKey,
                toPubkey: escrowPublicKey,
                lamports: solanaWeb3.LAMPORTS_PER_SOL * betAmount, // Umrechnung von SOL in Lamports
            })
        );

        const { signature } = await window.solana.signTransaction(transaction);
        await connection.confirmTransaction(signature);
        
        alert('Einsatz erfolgreich gesetzt!');
        // Weiterleitung oder Spiellogik hier hinzufügen
    } catch (err) {
        alert('Fehler bei der Übertragung des Einsatzes: ' + err.message);
    }
}
