/* eslint-disable react-refresh/only-export-components */
import { useMemo, useEffect, useState, useRef, useCallback } from 'react';
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

function getValueOrEmpty(value) {
  return value === undefined || value === null || value === "" ? 0 : Number(value);
}


export async function fetchPlayerStats(year) {
  const cacheKey = `player-stats-${year}`;

  const cached = sessionStorage.getItem(cacheKey);

  if (cached) {
    const parsed = JSON.parse(cached);

    const ONE_HOURS = 60 * 60 * 1000;

    if (Date.now() - parsed.timestamp < ONE_HOURS) {
      return parsed.data;
    }
  }
  const res = await fetch( `https://fantasydraftingtool.onrender.com/playerStats/${year}`);
  // const res = await fetch(`http://localhost:8080/stats/${year}`);

  if (!res.ok) {
    throw new Error(`Error Fetching Player Data ${res.status}`);
  }

  const json = await res.json();

  const formattedData = {
    thisYear: json.players.thisYear,
    lastYear: json.players.lastYear,
    twoYearsAgo: json.players.twoYearsAgo,
  };

  sessionStorage.setItem(
    cacheKey,
    JSON.stringify({
      timestamp: Date.now(),
      data: formattedData,
    })
  );

  return formattedData;
}


export default function PlayerPool({ playerStatsByYear, isLoading, error, year, leagueId, user, teams, draftedIDs, setDraftedIDs, draftLeague = "MLB", depthCharts }) {
  
  const depthChartMap = useMemo(() => {
    const map = new Map();

    depthCharts.forEach((team) => {
      team.positions?.forEach((position) => {
        position.players?.forEach((player) => {
          map.set(
            player.name.toLowerCase(),
            `${player.primaryPosition} #${player.depth}`
          );
        });
      });
    });

    return map;
  }, [depthCharts]);

    const [draftedNames, setDraftedNames] = useState([]);

  const fetchDraftedPlayers = useCallback(async () => {
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
  }, [leagueId, teams, setDraftedIDs]);

  useEffect(() => {
    if (leagueId && year && teams.length > 0) {
      fetchDraftedPlayers();
    }
  }, [leagueId, year, teams, fetchDraftedPlayers]);

  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [playerNote, setPlayerNote] = useState("");
  const [noteStatus, setNoteStatus] = useState("");
  const debounceTimer = useRef(null);
  const [playerType, setPlayerType] = useState("hitters");
  const [selectedStatsYear, setSelectedStatsYear] = useState("thisYear");
  const [savedHitterStats, setSavedHitterStats] = useState(null);
  const [savedPitcherStats, setSavedPitcherStats] = useState(null);
  const [columnStatsVisibility, setColumnStatsVisibility] = useState({});

  useEffect(()=>{
    async function fetchLeagueStats() {
      try {
        const res = await axios.get(`/settings/league/stats/${leagueId}`);
        setSavedHitterStats(res.data.hitterStats);
        setSavedPitcherStats(res.data.pitcherStats);
      } catch (err) {
        console.error("Failed to fetch league stats:", err);
      }
    }
    if (leagueId) fetchLeagueStats();
  },[leagueId]);

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
        const data = res.data.map((player) => {
          const { _id: _unusedId, ...rest } = player;
          return rest;
        });
        setManualPlayers(data);
      } catch (err) {
        console.error('Failed to fetch manual players:', err);
      }
    }
    fetchManualPlayers();
  }, [leagueId]);


  const data = useMemo(() => {
    const playerStats = playerStatsByYear?.[selectedStatsYear] || [];
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
      depthChart: year === 2026 && selectedStatsYear === "thisYear" ? depthChartMap.get(parsedPlayer.name.toLowerCase()) || "" : "",

      AB: getValueOrEmpty(player.AB),
      R: getValueOrEmpty(player.R),
      H: getValueOrEmpty(player.H),
      Doubles: getValueOrEmpty(player.Doubles),
      Triples: getValueOrEmpty(player.Triples),
      HR: getValueOrEmpty(player.HR),
      RBI: getValueOrEmpty(player.RBI),
      BB: getValueOrEmpty(player.BB),
      K: getValueOrEmpty(player.K),
      SB: getValueOrEmpty(player.SB),
      AVG: getValueOrEmpty(player.AVG),
      OBP: getValueOrEmpty(player.OBP),
      SLG: getValueOrEmpty(player.SLG),
      IP: getValueOrEmpty(player.IP),
      W: getValueOrEmpty(player.W),
      SV: getValueOrEmpty(player.SV),
      ERA: getValueOrEmpty(player.ERA),
      WHIP: getValueOrEmpty(player.WHIP),
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
      depthChart: selectedStatsYear === "thisYear" ? depthChartMap.get(player.name.toLowerCase()) || "" : "",

      AB: getValueOrEmpty(player.AB),
      R: getValueOrEmpty(player.R),
      H: getValueOrEmpty(player.H),
      Doubles: getValueOrEmpty(player.Doubles),
      Triples: getValueOrEmpty(player.Triples),      
      HR: getValueOrEmpty(player.HR),
      RBI: getValueOrEmpty(player.RBI),
      BB: getValueOrEmpty(player.BB),
      K: getValueOrEmpty(player.K),
      SB: getValueOrEmpty(player.SB),
      AVG: getValueOrEmpty(player.AVG),
      OBP: getValueOrEmpty(player.OBP),
      SLG: getValueOrEmpty(player.SLG),

      IP: getValueOrEmpty(player.IP),
      W: getValueOrEmpty(player.W),
      SV: getValueOrEmpty(player.SV),
      ERA: getValueOrEmpty(player.ERA),
      WHIP: getValueOrEmpty(player.WHIP),
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
  }, [playerStatsByYear, selectedStatsYear, draftedNames, manualPlayers, draftedIDs, playerType, draftLeague, depthChartMap]);


  const statsVisibility = useMemo(() => {
    const visibility = {};
    
    const hitterCols = ['AB', 'R', 'H', 'Doubles', 'Triples', 'HR', 'RBI', 'BB', 'K', 'SB', 'AVG', 'OBP', 'SLG'];
    const pitcherCols = ['IP', 'W', 'SV', 'K', 'BB', 'ERA', 'WHIP'];

    hitterCols.forEach(col => {
      visibility[col] = savedHitterStats ? savedHitterStats.includes(col) : true;
    });

    pitcherCols.forEach(col => {
      visibility[col] = savedPitcherStats ? savedPitcherStats.includes(col) : true;
    });

    return visibility;
  }, [savedHitterStats, savedPitcherStats]);

  useEffect(() => {
    setColumnStatsVisibility(statsVisibility);
  }, [statsVisibility]);

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
      accessorKey: 'depthChart',
      header: 'Depth Chart',
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
      columnVisibility: columnStatsVisibility, 
    }, onColumnVisibilityChange: setColumnStatsVisibility,
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
      <div style={{ marginTop: "10px", padding: "16px", backgroundColor: "#", borderRadius: "6px", border: "1px solid #ccc" }}>
        <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <h3 style={{ margin: 0, color: "#1d3a28" }}>Notes for {selectedPlayer}</h3>
          <button onClick={() => setSelectedPlayer(null)} style={{ background: "none", border: "none", fontSize: "18px", cursor: "pointer", color: "#666" }}>✕</button>
        </div>
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
            color: "#1d3a28" }}
        />
        {noteStatus && <p style={{ fontSize: "12px", color: "#666", margin: "4px 0 0 0" }}>{noteStatus}</p>}
      </div>
    )}
    </div>
  )};