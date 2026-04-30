export function convertToTeams(allTeams) {
  const formatPlayers = (players) =>
    players.map(({ playerID, name, position }) => ({
      ID: playerID,
      name,
      position
    }));

  return allTeams.map((team) => ({
    id: team._id,
    name: team.teamName,
    stat: formatPlayers(team.rosterPlayers || [])
  }));
}
