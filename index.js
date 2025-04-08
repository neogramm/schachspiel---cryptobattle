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







// Erstelle ein neues Schach-Objekt
const chess = new Chess();

// Funktion, um den Spielstand zu prüfen und die Züge anzuzeigen
function displayBoard() {
    // Hier kannst du den aktuellen Schachstand anzeigen, z.B. in einem HTML-Element
    const board = document.getElementById('board');
    board.innerText = chess.ascii(); // Zeigt das Schachbrett in ASCII an (du kannst auch eine andere Darstellung verwenden)
    document.getElementById('status').innerText = chess.game_over() ? 'Spiel beendet' : 'Spiel läuft';
}

// Funktion, um einen Zug zu machen
function makeMove(move) {
    const result = chess.move(move);
    if (result === null) {
        alert('Ungültiger Zug!');
        return;
    }
    displayBoard();
    checkGameOver();
}

// Funktion, um das Spiel zu beenden, wenn jemand gewonnen hat
function checkGameOver() {
    if (chess.game_over()) {
        const winner = chess.turn() === 'w' ? 'Schwarz hat gewonnen' : 'Weiß hat gewonnen';
        alert(winner);
        // Hier kannst du den Gewinner ermitteln und den Einsatz auszahlen (Backend).
        sendWinnerToBackend(winner);
    }
}

// Beispiel, um den Gewinner an das Backend zu senden (hier wirst du den Gewinner zur Auszahlung an dein Treuhand-Wallet schicken)
function sendWinnerToBackend(winner) {
    fetch('/winner/' + winner)
        .then(response => response.json())
        .then(data => {
            alert('Gewinner wurde ausgezahlt!');
        })
        .catch(error => {
            console.error('Fehler:', error);
        });
}

// Beispiel für einen Spielzug (hier solltest du die Logik anpassen, wie Züge eingegeben werden)
document.getElementById('moveButton').addEventListener('click', () => {
    const move = document.getElementById('moveInput').value; // Nimm den Zug vom Spieler
    makeMove(move);
});

displayBoard(); // Zu Beginn das Schachbrett anzeigen
