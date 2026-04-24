import Compete from './Compete'
import '../../css/compete.css';

export default function CompeteContainer ({ teams }) {
    if (!teams) return (<div>Empty teams</div>)
    // console.log(teams)
    const fullTeams = teams.filter(team => team.rosterPlayers.length === 23);
    if (fullTeams.length<2) return (<div>Cannot Compete with current draft state.</div>)

    const formattedDate = (d) => d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
    });

    // const startDate = new Date();
    // const endDate = new Date(today);
    // endDate.setDate(startDate.getDate() - 7);

    const startDate = new Date(2026, 2, 22);
    const endDate = new Date(2026, 2, 29);

    return (
        <div className="compete-container">
            <h2 className="compete-title">Week of {formattedDate(startDate)} - {formattedDate(endDate)}</h2>

            <Compete 
                team1={fullTeams[0]}
                team2={fullTeams[1]}
                startDate={startDate}
                endDate={endDate}
            />

            <Compete 
                team1={fullTeams[0]}
                team2={fullTeams[2]}
                startDate={startDate}
                endDate={endDate}
            />

            <Compete 
                team1={fullTeams[1]}
                team2={fullTeams[2]}
                startDate={startDate}
                endDate={endDate}
            />
        </div>
    )
 }
