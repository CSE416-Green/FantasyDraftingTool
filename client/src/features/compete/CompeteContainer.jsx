import { Compete, CompeteAddHistory } from './Compete';
import WeeklyResult from './WeeklyResult'
import '../../css/compete.css';

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function getCurrentWeekRange() {
  const today = new Date();
  const day = today.getDay(); // 0 Sun, 1 Mon, 2 Tue, 3 Wed...

  const startDate = new Date(today);

  if (day < 3) {
    // Sun - Tue → last Wednesday
    startDate.setDate(today.getDate() - (day + 4));
  } else {
    // Wed - Sat → this Wednesday
    startDate.setDate(today.getDate() - (day - 3));
  }

  return {
    startDate,
    endDate: today,
  };
}

function getCompletedWednesdayTuesdayWeeks(firstStartDate) {
  const weeks = [];
  const today = new Date();

  let start = new Date(firstStartDate);
  let end = addDays(start, 6);

  while (end < today) {
    weeks.push({
      startDate: new Date(start),
      endDate: new Date(end),
    });

    start = addDays(start, 7);
    end = addDays(start, 6);
  }

  return weeks;
}

export default function CompeteContainer({ teams, leagueId, draftState, totalTeams }) {
    if (!teams) return (<div className="compete-container">
                          <div className="compete-card">
                            <h2 className="compete-title">No Teams Data</h2>
                            
                          </div>
                        </div>);
    // console.log("draftState ",draftState)
    const fullTeams = teams.filter((team) => team.rosterPlayers.length === 23);
    if (fullTeams.length < 2 || fullTeams.length < totalTeams) {
        return  (<div className="compete-container">
                  <div className="compete-card">
                    <h2 className="compete-title">Cannot Compete Yet</h2>
                    
                  </div>
                </div>);
    }

    const { startDate, endDate } = getCurrentWeekRange();

    // Pick the first historical week you want to save
    const firstHistoryStartDate = new Date("2026-03-26");

    const completedWeeks =
        getCompletedWednesdayTuesdayWeeks(firstHistoryStartDate);

    const startIsEnd = startDate.toDateString() === endDate.toDateString();

    return (
        <div className="compete-container">
        {!draftState && (
            <>
                {completedWeeks.map((week) => (
                <CompeteAddHistory
                    key={week.startDate.toISOString()}
                    teamsData={teams}
                    startDate={week.startDate}
                    endDate={week.endDate}
                    leagueId={leagueId}
                />
                ))}
                
                <WeeklyResult 
                  leagueId={leagueId}
                  startIsEnd={startIsEnd}
                  teamsData={teams}
                  startDate={startDate}
                  endDate={endDate}
                />
            </>
            )}

        
        </div>
    );
}
