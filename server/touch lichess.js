// lichess.js
require('dotenv').config();
const fetch = require('node-fetch');

const LICHESS_TOKEN = process.env.LICHESS_TOKEN;

async function getGameResult(gameId) {
  const url = `https://lichess.org/game/export/${gameId}?moves=false`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${LICHESS_TOKEN}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Fehler beim Abrufen der Partie: ${res.status}`);
  }

  const data = await res.json();

  const winner = data.winner; // 'white' | 'black' | undefined
  const white = data.players.white.user.name.toLowerCase();
  const black = data.players.black.user.name.toLowerCase();

  if (!winner) {
    return { result: 'draw', white, black };
  }

  const winnerName = winner === 'white' ? white : black;

  return {
    result: 'win',
    winner: winnerName,
    loser: winner === 'white' ? black : white,
  };
}

module.exports = { getGameResult };
