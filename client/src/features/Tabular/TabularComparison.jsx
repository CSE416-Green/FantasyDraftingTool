import React, { useMemo } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { parsePlayerString } from "../player-pool/PlayerPool";

// logic is by me, implemented is by chatGPT

function isPitcher(position) {
  return ["P", "SP", "RP", "CP"].includes(position);
}

function safeNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? Math.trunc(num) : 0;
}


function calculateTeamWeightedStats(players) {
  return players.reduce(
    (acc, player) => {
      if (player.playerType === "hitters") {
        const singles = player.H - player.Doubles - player.Triples - player.HR;

        acc.Singles += singles;
        acc.Doubles += 2 * player.Doubles;
        acc.Triples += 3 * player.Triples;
        acc.HR += 4 * player.HR;
        acc.RBI += player.RBI;
        acc.R += player.R;
        acc.BB += player.BB;
        acc.SB += 2 * player.SB;
        acc.HitterK += -1 * player.K;
      }

      if (player.playerType === "pitchers") {
        const er = (player.ERA * player.IP) / 9;
        const hitsAllowed = player.WHIP * player.IP - player.BB;

        acc.IP += 3 * player.IP;
        acc.PitcherK += player.K;
        acc.W += 5 * player.W;
        acc.SV += 5 * player.SV;
        acc.ER += -2 * er;
        acc.HAllowed += -1 * hitsAllowed;
        acc.PitcherBB += -1 * player.BB;
      }

      return acc;
    },
    {
      Singles: 0,
      Doubles: 0,
      Triples: 0,
      HR: 0,
      RBI: 0,
      R: 0,
      BB: 0,
      SB: 0,
      HitterK: 0,

      IP: 0,
      PitcherK: 0,
      W: 0,
      SV: 0,
      ER: 0,
      HAllowed: 0,
      PitcherBB: 0,
    }
  );
}

export default function TabularComparison({
  playerStatsByYear,
  teams = [],
  leagueName,
  extraPlayerStats = [],
}) {



    const data = useMemo(() => {
    const playerStats = playerStatsByYear?.lastYear || [];

    const normalizePlayer = (player) => {
        const parsedPlayer = parsePlayerString(player.Player ?? player.name ?? "");

        return {
        id: Number(player.ID ?? player.playerID ?? player.id),
        name: parsedPlayer.name || player.name,
        age: player.AGE ?? player.age,
        position: parsedPlayer.position || player.position,
        team: parsedPlayer.team || player.team,

        AB: safeNumber(player.AB),
        R: safeNumber(player.R),
        H: safeNumber(player.H),
        Doubles: safeNumber(player.Doubles ?? player.doubles),
        Triples: safeNumber(player.Triples ?? player.triples),
        HR: safeNumber(player.HR ?? player.homeRuns),
        RBI: safeNumber(player.RBI ?? player.rbi),
        BB: safeNumber(player.BB ?? player.baseOnBalls),
        K: safeNumber(player.K ?? player.strikeOuts),
        SB: safeNumber(player.SB ?? player.stolenBases),

        IP: safeNumber(player.IP ?? player.inningsPitched),
        W: safeNumber(player.W ?? player.wins),
        SV: safeNumber(player.SV ?? player.saves),
        ERA: safeNumber(player.ERA ?? player.era),
        WHIP: safeNumber(player.WHIP ?? player.whip),

        playerType: player.playerType ||
          (isPitcher(parsedPlayer.position || player.position)
            ? "pitchers"
            : "hitters"),
        };
    };

    const apiPlayers = playerStats.map(normalizePlayer);
    const fetchedPlayers = extraPlayerStats.map(normalizePlayer);

    const allPlayers = [...apiPlayers, ...fetchedPlayers];

    return teams.map((team) => {
        const rosterPlayers = team?.rosterPlayers ?? [];

        const matchedPlayers = rosterPlayers
        .map((rosterPlayer) =>
            allPlayers.find((apiPlayer) => {
            return (
                apiPlayer.id === Number(rosterPlayer.playerID) ||
                apiPlayer.id === Number(rosterPlayer.ID) ||
                apiPlayer.name === rosterPlayer.name
            );
            })
        )
        .filter(Boolean);

        const weightedStats = calculateTeamWeightedStats(matchedPlayers);

        const totalFPTS = Object.values(weightedStats).reduce(
        (sum, value) => sum + value,
        0
        );

        return {
        teamName: team.teamName,
        players: matchedPlayers.length,
        ...weightedStats,
        FPTS: totalFPTS,
        };
    });
    }, [teams, playerStatsByYear, extraPlayerStats]);

    const columns = useMemo(() => {

      const pitcherCellStyle = {
        sx: {
          backgroundColor: "#d9d9d9",
        },
      };

      return [
        {
          accessorKey: "teamName",
          header: "Team",
          size: 150,
        },
        {
          accessorKey: "players",
          header: "Players",
          size: 80,
        },
        {
          accessorKey: "FPTS",
          header: "Total FPTS",
          size: 100,
          Cell: ({ cell }) => Number(cell.getValue()).toFixed(1),
        },

        {
          header: "Hitting Points",
          columns: [
            { accessorKey: "Singles", header: "1B", size: 70 },
            { accessorKey: "Doubles", header: "2B", size: 70 },
            { accessorKey: "Triples", header: "3B", size: 70 },
            { accessorKey: "HR", header: "HR", size: 70 },
            { accessorKey: "RBI", header: "RBI", size: 70 },
            { accessorKey: "R", header: "R", size: 70 },
            { accessorKey: "BB", header: "BB", size: 70 },
            { accessorKey: "SB", header: "SB", size: 70 },
            { accessorKey: "HitterK", header: "K", size: 70 },
          ],
        },

        {
          header: "Pitching Points",
          columns: [
            { accessorKey: "IP", header: "IP", size: 70, muiTableBodyCellProps: pitcherCellStyle },
            { accessorKey: "PitcherK", header: "K", size: 70, muiTableBodyCellProps: pitcherCellStyle },
            { accessorKey: "W", header: "W", size: 70, muiTableBodyCellProps: pitcherCellStyle },
            { accessorKey: "SV", header: "SV", size: 70, muiTableBodyCellProps: pitcherCellStyle },
            { accessorKey: "ER", header: "ER", size: 70, muiTableBodyCellProps: pitcherCellStyle, Cell: ({ cell }) => Number(cell.getValue()).toFixed(1) },
            { accessorKey: "HAllowed", header: "H", size: 70, muiTableBodyCellProps: pitcherCellStyle },
            { accessorKey: "PitcherBB", header: "BB", size: 70, muiTableBodyCellProps: pitcherCellStyle },
          ],
        },
      ];
    }, []);

  const table = useMaterialReactTable({
    columns,
    data,
    initialState: {
      sorting: [{ id: "FPTS", desc: true }],
      density: "compact",
    },
    muiTableBodyCellProps: {
      sx: {
        fontSize: "13px",
      },
    },
  });

  return (
    <div className="tabular-comparison">
      <h2>{leagueName} Weighted Team Comparison Predictions</h2>

      <MaterialReactTable table={table} />
    </div>
  );
}