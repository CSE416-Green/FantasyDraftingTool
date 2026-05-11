function chunkArray(array, size) {
  const chunks = [];

  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }

  return chunks;
}

export async function fetchUnmatchedPlayers(unmatchedIDs, year) {
  if (!unmatchedIDs || unmatchedIDs.length === 0) {
    return [];
  }

  const fetchYear = Number(year) - 1;
  const allResults = [];
  const idsToFetch = [];

  for (const playerID of unmatchedIDs) {
    const cacheKey = `player-stat-${fetchYear}-${playerID}`;
    const cached = sessionStorage.getItem(cacheKey);

    if (cached) {
      allResults.push(JSON.parse(cached));
    } else {
      idsToFetch.push(playerID);
    }
  }

  const chunks = chunkArray(idsToFetch, 10);

  for (const chunk of chunks) {
    const res = await fetch(
      "https://fantasydraftingtool.onrender.com/playerStats/players",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          playerIDs: chunk,
          year: fetchYear,
        }),
      }
    );

    const text = await res.text();

    if (!res.ok) {
      console.error("Failed chunk:", chunk);
      console.error("Error:", text);
      continue;
    }

    const data = JSON.parse(text);
    const results = data.result || [];

    results.forEach((player) => {
      const cacheKey = `player-stat-${fetchYear}-${player.id}`;
      sessionStorage.setItem(cacheKey, JSON.stringify(player));

      allResults.push(player);
    });
  }

  return allResults;
}