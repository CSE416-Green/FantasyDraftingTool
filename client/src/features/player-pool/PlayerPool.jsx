import { useMemo, useEffect, useState, useRef } from 'react';
import axios from 'axios';
// import { useQuery } from '@tanstack/react-query';
import {
  MaterialReactTable,
  useMaterialReactTable,
} from 'material-react-table';

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
  if (!res.ok) {
    throw new Error(`Error Fetching Player Data ${res.status}`);
  }

  try {
    const playerStatsJson = await res.json();
    const playerData = [...playerStatsJson];
    return playerData;
  } catch (error) {
    console.error('Error parsing player stats JSON:', error);
  }
}

export default function PlayerPool({ playerStats, isLoading, error, leagueName, year, leagueId, user, teams, draftedIDs, setDraftedIDs }) {
  // const {
  //   data: playerStats = [],
  //   isLoading,
  //   error,
  // } = useQuery({
  //   queryKey: ['player-stats'],
  //   queryFn: fetchPlayerStats,
  // });
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


    const ids = [
      ...new Set([
      ...draftedIDs,
      ...farmPlayerIDs,
      ...rosterPlayerIDs
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
        const res = await axios.get(`/addedPlayerPool/manualPlayers/${leagueId}`);
        const data = res.data.map(({ _id, ...rest }) => rest);
        setManualPlayers(data);
      } catch (err) {
        console.error('Failed to fetch manual players:', err);
      }
    }
    fetchManualPlayers();
  }, []);

  const data = useMemo(() => {
    const apiPlayers=playerStats.map((player)=>{
      const parsedPlayer = parsePlayerString(player.Player ?? '');
      const isDrafted = draftedIDs.includes(player.ID) || draftedNames.includes(parsedPlayer.name);
      return {
        id: player.ID,
        name: parsedPlayer.name,
        age: player.AGE,
        position: parsedPlayer.position,
        team: parsedPlayer.team,
        AB: player.AB ?? '',
        R: player.R ?? '',
        H: player.H ?? '',
        '1B': player['1B'] ?? '',
        '2B': player['2B'] ?? '',
        '3B': player['3B'] ?? '',
        HR: player.HR ?? '',
        RBI: player.RBI ?? '',
        BB: player.BB ?? '',
        K: player.K ?? '',
        SB: player.SB ?? '',
        CS: player.CS ?? '',
        AVG: player.AVG ?? '',
        OBP: player.OBP ?? '',
        SLG: player.SLG ?? '',
        FPTS: player.FPTS ?? '',
        isDrafted,
      };
    });
    const dbPlayers=manualPlayers.map((player)=>{
      const isDrafted = draftedIDs.includes(player.ID) || draftedNames.includes(player.name);
      return {
        id: player.playerID,
        name: player.name,
        position: player.position,
        team: player.team,
        AB: player.AB ?? '',
        R: player.R ?? '',
        H: player.H ?? '',
        '1B': player['1B'] ?? '',
        '2B': player['2B'] ?? '',
        '3B': player['3B'] ?? '',
        HR: player.HR ?? '',
        RBI: player.RBI ?? '',
        BB: player.BB ?? '',
        K: player.K ?? '',
        SB: player.SB ?? '',
        CS: player.CS ?? '',
        AVG: player.AVG ?? '',
        OBP: player.OBP ?? '',
        SLG: player.SLG ?? '',
        FPTS: player.FPTS ?? '',
        isDrafted,
      };
    });
    return [...apiPlayers, ...dbPlayers];
  }, [playerStats, draftedNames, manualPlayers]);

  const columns = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Player Name',
        size: 100
      },
      {
        accessorKey: 'age',
        header: 'Age',
        size: 60
      }
      ,
      {
        accessorKey: 'position',
        header: 'Position',
        size: 60
      },
      {
        accessorKey: 'team',
        header: 'Team Name',
        size: 80
      },
      {
        accessorKey: 'AB',
        header: 'AB',
        size: 60
      },
      {
        accessorKey: 'R',
        header: 'R',
        size: 60
      },
      {
        accessorKey: 'H',
        header: 'H',
        size: 60
      },
      {
        accessorKey: '1B',
        header: '1B',
        size: 60
      },
      {
        accessorKey: '2B',
        header: '2B',
        size: 60
      },
      {
        accessorKey: '3B',
        header: '3B',
        size: 60
      },
      {
        accessorKey: 'HR',
        header: 'HR',
        size: 60
      },
      {
        accessorKey: 'RBI',
        header: 'RBI',
        size: 60
      },
      {
        accessorKey: 'BB',
        header: 'BB',
        size: 60
      },
      {
        accessorKey: 'K',
        header: 'K',
        size: 60
      },
      {
        accessorKey: 'SB',
        header: 'SB',
        size: 60
      },
      {
        accessorKey: 'CS',
        header: 'CS',
        size: 60
      },
      {
        accessorKey: 'AVG',
        header: 'AVG',
        size: 60
      },
      {
        accessorKey: 'OBP',
        header: 'OBP',
        size: 60
      },
      {
        accessorKey: 'SLG',
        header: 'SLG',
        size: 60
      },
      {
        accessorKey: 'FPTS',
        header: 'FPTS',
        size: 60
      },
    ],
    [],
  );

  const table = useMaterialReactTable({
    columns,
    data,
    state: {
      isLoading,
      showAlertBanner: Boolean(error),
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
      <button onClick={fetchDraftedPlayers} className="form-buttom">
        Refresh Player Pool
      </button>
      <MaterialReactTable table={table} />
      {selectedPlayer && (
      <div style={{
        marginTop: "16px",
        padding: "16px",
        border: "1px solid #ccc",
        borderRadius: "6px",
        backgroundColor: "#ffffff",
        position: "relative",
      }}>
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
  //return <MaterialReactTable table={table} />;
  )};