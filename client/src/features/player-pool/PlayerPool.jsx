import { useMemo, useEffect, useState, useRef } from 'react';
import axios from 'axios';
import {
  MaterialReactTable,
  useMaterialReactTable,
} from 'material-react-table';

import '../../css/mainPage.css'

const AL_TEAMS = [
  "Baltimore Orioles",
  "Boston Red Sox",
  "New York Yankees",
  "Tampa Bay Rays",
  "Toronto Blue Jays",
  "Chicago White Sox",
  "Cleveland Guardians",
  "Detroit Tigers",
  "Kansas City Royals",
  "Minnesota Twins",
  "Houston Astros",
  "Los Angeles Angels",
  "Athletics",
  "Seattle Mariners",
  "Texas Rangers"
];
const NL_TEAMS = [
  "Atlanta Braves",
  "Miami Marlins",
  "New York Mets",
  "Philadelphia Phillies",
  "Washington Nationals",
  "Chicago Cubs",
  "Cincinnati Reds",
  "Milwaukee Brewers",
  "Pittsburgh Pirates",
  "St. Louis Cardinals",
  "Arizona Diamondbacks",
  "Colorado Rockies",
  "Los Angeles Dodgers",
  "San Diego Padres",
  "San Francisco Giants"
];

export function parsePlayerString(playerString) {
  if (!playerString || typeof playerString !== 'string') {
    return {
      name: '',
      position: '',
      team: '',
    };
  }

  const trimmedPlayerString = playerString.trim();
  const splitPlayerString = trimmedPlayerString.split('|');

  const leftSide = splitPlayerString[0]?.trim() || '';
  const rightSide = splitPlayerString[1]?.trim() || '';

  if (!leftSide) {
    return {
      name: '',
      position: '',
      team: rightSide,
    };
  }

  const leftSideParts = leftSide.split(' ');
  const position = leftSideParts.pop() || '';
  const name = leftSideParts.join(' ');

  return {
    name,
    position,
    team: rightSide,
  };
}

export async function fetchPlayerStats(year) {
  const res = await fetch(`https://fantasydraftingtool.onrender.com/playerStats/${year}`);
  // const res = await fetch(`http://localhost:8080/stats/${year}`);

  if (!res.ok) {
    throw new Error(`Error Fetching Player Data ${res.status}`);
  }

  const json = await res.json();

  return {
    thisYear: json.players.thisYear,
    lastYear: json.players.lastYear,
    twoYearsAgo: json.players.twoYearsAgo,
  };
}

export default function PlayerPool({ playerStatsByYear, isLoading, error, leagueName, year, leagueId, user, teams, draftedIDs, setDraftedIDs, draftLeague = "MLB" }) {
  const [draftedNames, setDraftedNames] = useState([]);

  const fetchDraftedPlayers = async () => {
  try {
    const res = await axios.post('/draftHistory/league', { leagueId: leagueId });
    const names = res.data.DraftedPlayers.map((p) => p.PlayerName);
    setDraftedNames(names);

     const draftedIDs = [
      ...res.data.DraftedPlayers.map(p => p.PlayerID),
      ...res.data.OldPlayers.map(p => p.PlayerID)
    ];

    const farmPlayerIDs = teams.flatMap(team =>
      team.farmPlayers
        .map(p => p.playerID)
        .filter(id => id !== undefined)
    );

    const rosterPlayerIDs = teams.flatMap(team =>
      team.rosterPlayers
        .map(p => p.playerID)
        .filter(id => id !== undefined)
    );

    const taxiPlayerIDs = teams.flatMap(team => 
      team.taxiPlayers
        .map(p => p.playerID)
        .filter(id => id !== undefined)
    );

    const ids = [
      ...new Set([
      ...draftedIDs,
      ...farmPlayerIDs,
      ...rosterPlayerIDs,
      ...taxiPlayerIDs
    ])
  ];

    setDraftedIDs(ids);
  } catch (err) {
    console.error('Failed to fetch draft history:', err);
    setDraftedIDs([]);
    setDraftedNames([]);
  }
  };

  useEffect(() => {
    if (leagueId && year && teams.length > 0) {
        fetchDraftedPlayers();
  }
  }, [leagueId, year, teams]);

  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [playerNote, setPlayerNote] = useState("");
  const [noteStatus, setNoteStatus] = useState("");
  const debounceTimer = useRef(null);
  const [playerType, setPlayerType] = useState("hitters");
  const [selectedStatsYear, setSelectedStatsYear] = useState("thisYear");
  const playerStats = playerStatsByYear?.[selectedStatsYear] || [];
  async function fetchPlayerNote(playerName) {
    try {
      const res = await axios.get(`/playerNote/${leagueId}/${user._id}/${encodeURIComponent(playerName)}`);
      setPlayerNote(res.data.note || "");
    } catch (err) {
      console.error("Failed to fetch player note:", err);
    }
  }

  function handleNoteChange(e) {
    const value = e.target.value;
    setPlayerNote(value);
    setNoteStatus("Saving...");
  
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(async () => {
      try {
        await axios.post("/playerNote/save", {
          playerName: selectedPlayer,
          leagueId,
          userId: user._id,
          note: value,
        });
        setNoteStatus("Saved!");
        setTimeout(() => setNoteStatus(""), 2000);
      } catch (err) {
        console.error("Failed to save note:", err);
        setNoteStatus("Error saving");
      }
    }, 1000);
  }

  //fetch manual players from DB
  const [manualPlayers, setManualPlayers] = useState([]);
  useEffect(() => {
    async function fetchManualPlayers() {
      try {
        if (!leagueId) return; 
        const res = await axios.get(`/addedPlayerPool/manualPlayers/${leagueId}`);
        const data = res.data.map(({ _id, ...rest }) => rest);
        setManualPlayers(data);
      } catch (err) {
        console.error('Failed to fetch manual players:', err);
      }
    }
    fetchManualPlayers();
  }, [leagueId]);

  const data = useMemo(() => {
  const isPitcher = (position) => position === "P" || position?.includes("P");

  const apiPlayers = playerStats.map((player) => {
    const parsedPlayer = parsePlayerString(player.Player ?? '');
    const isDrafted = draftedIDs.includes(player.ID) || draftedNames.includes(parsedPlayer.name);

    return {
      id: player.ID,
      name: parsedPlayer.name,
      age: player.AGE,
      position: parsedPlayer.position,
      team: parsedPlayer.team,

      AB: Number(player.AB) ?? '',
      R: Number(player.R) ?? '',
      H: Number(player.H) ?? '',
      Doubles: Number(player.Doubles) ?? '',
      Triples: Number(player.Triples) ?? '',
      HR: Number(player.HR) ?? '',
      RBI: Number(player.RBI) ?? '',
      BB: Number(player.BB) ?? '',
      K: Number(player.K) ?? '',
      SB: Number(player.SB) ?? '',
      AVG: Number(player.AVG) ?? '',
      OBP: Number(player.OBP) ?? '',
      SLG: Number(player.SLG) ?? '',

      IP: Number(player.IP) ?? '',
      W: Number(player.W) ?? '',
      SV: Number(player.SV) ?? '',
      ERA: Number(player.ERA) ?? '',
      WHIP: Number(player.WHIP) ?? '',
      FPTS: Number(player.FPTS) || 0,
      isDrafted,
      playerType: isPitcher(parsedPlayer.position) ? "pitchers" : "hitters",
    };
  });

  const dbPlayers = manualPlayers.map((player) => {
    const isDrafted = draftedIDs.includes(player.playerID) || draftedNames.includes(player.name);

    return {
      id: player.playerID,
      name: player.name,
      age: player.age ?? '',
      position: player.position,
      team: player.team,

      AB: Number(player.AB) ?? '',
      R: Number(player.R) ?? '',
      H: Number(player.H) ?? '',
      Doubles: Number(player.Doubles) ?? '',
      Triples: Number(player.Triples) ?? '',      
      HR: Number(player.HR) ?? '',
      RBI: Number(player.RBI) ?? '',
      BB: Number(player.BB) ?? '',
      K: Number(player.K) ?? '',
      SB: Number(player.SB) ?? '',
      AVG: Number(player.AVG) ?? '',
      OBP: Number(player.OBP) ?? '',
      SLG: Number(player.SLG) ?? '',

      IP: Number(player.IP) ?? '',
      W: Number(player.W) ?? '',
      SV: Number(player.SV) ?? '',
      ERA: Number(player.ERA) ?? '',
      WHIP: Number(player.WHIP) ?? '',
      FPTS: Number(player.FPTS) || 0,
      isDrafted,
      playerType: isPitcher(player.position) ? "pitchers" : "hitters",
    };
  });

  return [...apiPlayers, ...dbPlayers].filter((player) => {
    const matchesPlayerType = player.playerType === playerType;

    const matchesDraftLeague =
      draftLeague === "MLB" ||
      (draftLeague === "AL" && AL_TEAMS.includes(player.team)) ||
      (draftLeague === "NL" && NL_TEAMS.includes(player.team));

    return matchesPlayerType && matchesDraftLeague;
  });
  }, [playerStats, draftedNames, manualPlayers, draftedIDs, playerType, draftLeague]);

 const columns = useMemo(() => {
  const baseColumns = [
    {
      accessorKey: 'name',
      header: 'Player Name',
      size: 100,
    },
    {
      accessorKey: 'age',
      header: 'Age',
      size: 60,
    },
    {
      accessorKey: 'position',
      header: 'Position',
      size: 60,
    },
    {
      accessorKey: 'team',
      header: 'Team',
      size: 80,
    },
    {
      accessorKey: 'FPTS',
      header: 'FPTS',
      size: 60,
    },
  ];

  const hitterColumns = [
    { accessorKey: 'AB', header: 'AB', size: 60 },
    { accessorKey: 'R', header: 'R', size: 60 },
    { accessorKey: 'H', header: 'H', size: 60 },
    { accessorKey: 'Doubles', header: 'Doubles', size: 60 },
    { accessorKey: 'Triples', header: 'Triples', size: 60 },
    { accessorKey: 'HR', header: 'HR', size: 60 },
    { accessorKey: 'RBI', header: 'RBI', size: 60 },
    { accessorKey: 'BB', header: 'BB', size: 60 },
    { accessorKey: 'K', header: 'K', size: 60 },
    { accessorKey: 'SB', header: 'SB', size: 60 },
    { accessorKey: 'AVG', header: 'AVG', size: 60 },
    { accessorKey: 'OBP', header: 'OBP', size: 60 },
    { accessorKey: 'SLG', header: 'SLG', size: 60 },
  ];

  const pitcherColumns = [
    { accessorKey: 'IP', header: 'IP', size: 60 },
    { accessorKey: 'W', header: 'W', size: 60 },
    { accessorKey: 'SV', header: 'SV', size: 60 },
    { accessorKey: 'K', header: 'K', size: 60 },
    { accessorKey: 'BB', header: 'BB', size: 60 },
    { accessorKey: 'ERA', header: 'ERA', size: 60 },
    { accessorKey: 'WHIP', header: 'WHIP', size: 60 },
  ];

  return [
    ...baseColumns,
    ...(playerType === "hitters" ? hitterColumns : pitcherColumns),
  ];
  }, [playerType]);

  const table = useMaterialReactTable({
    columns,
    data,
    state: {
      isLoading,
      showAlertBanner: Boolean(error),
    },
    initialState: {
      sorting: [
        {
          id: 'FPTS',   // must match accessorKey
          desc: true,   // true = descending (highest first)
        },
      ],
    },
    muiTableBodyRowProps: ({ row }) => ({
      onClick: () => {
        setSelectedPlayer(row.original.name);
        fetchPlayerNote(row.original.name);
      },
      sx: {
        cursor: 'pointer',
        '& td': {
          color: row.original.isDrafted ? '#D5D5D5' : '#000000',
        },
      },
    }),
  });

  return (
    <div>
      <div className="player-pool-controls">
        {/* <button onClick={fetchDraftedPlayers} className="form-buttom">
          Refresh Player Pool
        </button> */}

        <label>
          Player Type:
        </label>

        <select
          value={playerType}
          className="form-select"
          onChange={(e) => setPlayerType(e.target.value)}
        >
          <option value="hitters">Hitters</option>
          <option value="pitchers">Pitchers</option>
        </select>
        <label>
          Stats Year:
        </label>

        <select
          value={selectedStatsYear}
          className="form-select"
          onChange={(e) => setSelectedStatsYear(e.target.value)}
        >
          <option value="thisYear">{year}</option>
          <option value="lastYear">{year ? Number(year) - 1 : ""}</option>
          <option value="twoYearsAgo">{year ? Number(year) - 2 : ""}</option>
        </select>
      </div>
      
      <MaterialReactTable table={table} />
      {selectedPlayer && (
      <div>
        <button
          onClick={() => setSelectedPlayer(null)}
          style={{
            position: "absolute",
            top: "8px",
            right: "8px",
            background: "none",
            border: "none",
            fontSize: "18px",
            cursor: "pointer",
            color: "#666",
            lineHeight: 1,
          }}
        >
          ✕
        </button>
        <h3 style={{ margin: "0 0 8px 0", color: "#1d3a28" }}>
          Notes for {selectedPlayer}
        </h3>
        <textarea
          value={playerNote}
          onChange={handleNoteChange}
          placeholder="Type your notes about this player..."
          rows={4}
          style={{
            width: "100%",
            resize: "vertical",
            boxSizing: "border-box",
            padding: "10px",
            backgroundColor: "#d9d9d9",
            border: "1px solid #ccc",
            borderRadius: "4px",
            fontSize: "14px",
            fontFamily: "inherit",
            color: "#1d3a28",
          }}
        />
        {noteStatus && <p style={{ fontSize: "12px", color: "#666", margin: "4px 0 0 0" }}>{noteStatus}</p>}
      </div>
          )}
    </div>
  )};