const waitingPlayers = [];

function addPlayer(player) {
  // Suche nach Spieler mit gleichem Einsatz
  const index = waitingPlayers.findIndex(p => p.bet === player.bet);
  if (index !== -1) {
    const match = { player1: waitingPlayers[index], player2: player, ready: true };
    waitingPlayers.splice(index, 1);
    return match;
  } else {
    waitingPlayers.push(player);
    return { ready: false };
  }
}

module.exports = { addPlayer };
