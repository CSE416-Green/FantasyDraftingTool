import { useEffect, useState } from "react";
import "../../css/depthChart.css"

function DepthChart() {
    const [depthCharts, setDepthCharts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");

    const filteredTeams = depthCharts.filter((team) => {
        const searchTerm = search.toLowerCase();

        return (
            team.team.toLowerCase().includes(searchTerm) || team.abbr.toLowerCase().includes(searchTerm)
        );
    });

    useEffect(() => {
        async function fetchDepthCharts() {
        try {
            // const response = await fetch("/depthChart/fetch");
            const response = await fetch("http://localhost:3000/depthChart/fetch");

            if (!response.ok) {
            throw new Error("Failed to fetch depth charts");
            }

            const data = await response.json();
            setDepthCharts(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
        }

        fetchDepthCharts();
    }, []);

    if (loading) return <p className="depthChart-loading">Loading depth charts...</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;

    return (
    <div className="depthChart-page">
        <h1 className="depthChart-title">MLB Depth Charts</h1>
        <input
            type="text"
            placeholder="Search team..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="depthChart-search"
        />
        <div className="depthChart-grid">
        {filteredTeams.map((team) => (
            <div key={team.teamId} className="depthChart-teamCard">
            <h2 className="depthChart-teamName">
                {team.team} ({team.abbr})
            </h2>

            {team.positions.map((position) => (
                <div
                key={position.position}
                >
                <h3 className="depthChart-positionTitle">
                    {position.position} - {position.description}
                </h3>

                <table className="depthChart-table">
                    <thead>
                    <tr>
                        <th>Depth</th>
                        <th>Player</th>
                        <th>Pos</th>
                        <th>Status</th>
                    </tr>
                    </thead>

                    <tbody>
                    {position.players.map((player) => (
                        <tr key={player.id}>
                        <td>{player.depth}</td>
                        <td>{player.name}</td>
                        <td>{player.primaryPosition}</td>
                        <td>{player.status}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>
            ))}
            </div>
        ))}
        </div>
    </div>
    )};

export default DepthChart;