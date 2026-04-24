import { convertToTwoTeams } from "./convertToTwoTeams";

describe("convertToTwoTeams", () => {
  it("function convertToTwoTeams functionality", () => {
    const team1 = {
      _id: "abc123",
      teamName: "Team Alpha",
      rosterPlayers: [
        { playerID: 669373, name: "Tarik Skubal", position: "P", cost: 10 },
        { playerID: 592450, name: "Aaron Judge", position: "OF", status: "S1" }
      ]
    };

    const team2 = {
      _id: "xyz456",
      teamName: "Team Beta",
      rosterPlayers: [
        { playerID: 694973, name: "Paul Skenes", position: "P", cost: 8 },
        { playerID: 660271, name: "Shohei Ohtani", position: "U", status: "S2" }
      ]
    };

    const result = convertToTwoTeams(team1, team2);

    expect(result).toEqual({
      team1: {
        id: "abc123",
        name: "Team Alpha",
        stat: [
          { ID: 669373, name: "Tarik Skubal", position: "P" },
          { ID: 592450, name: "Aaron Judge", position: "OF" }
        ]
      },
      team2: {
        id: "xyz456",
        name: "Team Beta",
        stat: [
          { ID: 694973, name: "Paul Skenes", position: "P" },
          { ID: 660271, name: "Shohei Ohtani", position: "U" }
        ]
      }
    });
  });
});