export default function TradeHistory({ leagueId, trades = [], fetchTrades }) {
    // remove the useEffect and useState entirely
    return (
      <div>
        <h3 style={{ marginBottom: "15px" }}>Trade History</h3>
        {trades.length === 0 ? (
          <p>No trades yet.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ padding: "10px 6px" }}>From Team</th>
                <th style={{ padding: "10px 6px" }}>Player Given</th>
                <th style={{ padding: "10px 6px" }}>To Team</th>
                <th style={{ padding: "10px 6px" }}>Player Received</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((trade, i) => (
                <tr key={i}>
                  <td style={{ padding: "10px 6px" }}>{trade.fromTeamName}</td>
                  <td style={{ padding: "10px 6px" }}>{trade.fromPlayerName}</td>
                  <td style={{ padding: "10px 6px" }}>{trade.toTeamName}</td>
                  <td style={{ padding: "10px 6px" }}>{trade.toPlayerName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  }