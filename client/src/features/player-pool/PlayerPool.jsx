import { useMemo, useEffect, useState } from 'react';
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

export async function fetchPlayerStats() {
  const res = await fetch('https://fantasydraftingtool.onrender.com/playerStats/2025');
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

export default function PlayerPool({ playerStats, isLoading, error, leagueName, year, leagueId }) {
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
  } catch (err) {
    console.error('Failed to fetch draft history:', err);
    setDraftedNames([]);
  }
  };

  useEffect(() => {
    if (leagueId && year) {
      fetchDraftedPlayers();
    }
  }, [leagueId, year]);

  //fetch manual players from DB
  const [manualPlayers, setManualPlayers] = useState([]);
  useEffect(() => {
    async function fetchManualPlayers() {
      try {
        const res = await axios.get(`/addedPlayerPool/manualPlayers/${leagueId}`);
        setManualPlayers(res.data);
      } catch (err) {
        console.error('Failed to fetch manual players:', err);
      }
    }
    fetchManualPlayers();
  }, []);


  const data = useMemo(() => {
    const apiPlayers=playerStats.map((player)=>{
      const parsedPlayer = parsePlayerString(player.Player ?? '');
      const isDrafted = draftedNames.includes(parsedPlayer.name);
      return {
        id: player.ID,
        name: parsedPlayer.name,
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
      const isDrafted = draftedNames.includes(player.name);
      return {
        id: player._id,
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
      sx: {
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
  </div>
  )

  // return <MaterialReactTable table={table} />;
}