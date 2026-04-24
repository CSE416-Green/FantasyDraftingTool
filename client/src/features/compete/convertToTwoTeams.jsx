export function convertToTwoTeams(team1, team2) {
  const formatPlayers = (players) =>
    players.map(({ playerID, name, position }) => ({
      ID: playerID,
      name,
      position
    }));

  return {
    team1: {
      id: team1._id,
      name: team1.teamName,
      stat: formatPlayers(team1.rosterPlayers)
    },
    team2: {
      id: team2._id,
      name: team2.teamName,
      stat: formatPlayers(team2.rosterPlayers)
    }
  };
}
