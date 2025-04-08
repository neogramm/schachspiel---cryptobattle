const express = require('express');
const bodyParser = require('body-parser');
const { createEscrowTransaction, distributeWinnings } = require('./escrow');
const { addPlayer, checkMatch } = require('./gameManager');

const app = express();
app.use(bodyParser.json());
const PORT = 3000;

// Spieler tritt bei
app.post('/join', async (req, res) => {
  const { wallet, bet } = req.body;
  if (!wallet || !bet) return res.status(400).send("Wallet und Einsatz erforderlich.");

  // Spieler wird in Warteliste aufgenommen
  const match = addPlayer({ wallet, bet });

  if (match.ready) {
    // Beide Einsätze an Escrow senden
    await Promise.all([
      createEscrowTransaction(match.player1.wallet, bet),
      createEscrowTransaction(match.player2.wallet, bet)
    ]);

    // Erstelle privaten Lichess-Link (Platzhalter)
    const lichessURL = `https://lichess.org/${Math.random().toString(36).substr(2, 8)}`;

    // TODO: Sobald Spiel beendet, `distributeWinnings(winnerWallet, totalBet)`
    return res.json({
      message: "Match gefunden!",
      lichess: lichessURL,
      players: [match.player1.wallet, match.player2.wallet]
    });
  }

  return res.json({ message: "Warte auf zweiten Spieler…" });
});

app.listen(PORT, () => console.log(`Server läuft auf http://localhost:${PORT}`));
