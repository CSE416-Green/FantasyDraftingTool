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
  const chunks = chunkArray(unmatchedIDs, 10);

  const allResults = [];

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

    allResults.push(...(data.result || []));
  }

  return allResults;
}