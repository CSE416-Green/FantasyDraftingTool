import "../../css/playerNews.css";
import Drawer from './Drawer';

export default function PlayerNews({ playerNews }) {
  //console.log("Rendering PlayerNews with data:", playerNews);
  return (
    <> 
    <div className="news-container">
      {playerNews.map((item) => (
        <div key={item.id} className="news-card">
          {/* Left Section */}
          <div className="news-left">
            <div className="news-image">
              {item.image ? (
                <img src={item.image} alt="player" />
              ) : (
                <div className="image-placeholder" />
              )}
            </div>

            <div className="news-meta">
              <p className="player-name">{item.player}</p>
              <p className="team-info">Team | Pos | Rank</p>
              <p className="time">
                {new Date(item.pubDate).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Right Section */}
          <div className="news-right">
            <p className="news-title">{item.title}</p>
            <p
              className="news-description">
              {item.description}
            </p>
          </div>
        </div>
      ))}
    </div>
    </>
  ); 
}



