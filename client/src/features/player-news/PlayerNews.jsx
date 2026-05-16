import "../../css/playerNews.css";
import Drawer from './Drawer';

export default function PlayerNews({ playerNews }) {
  //console.log("Rendering PlayerNews with data:", playerNews);
  return (
    <> 
    <div className="news-container">
      {playerNews?.filter((item) => item).map((item) => (
        <div key={item.id} className="news-card">
          {/* Right Section */}
          <div className="news-right">
            <p className="news-title">{item.title}</p>
            <p className="time">
              {new Date(item.pubDate).toLocaleString()}
            </p>
            <p
              className="news-description">
              {item.description}
            </p>
            <a href={item.link} target="_blank" rel="noopener noreferrer">
              Read more
            </a>
          </div>
        </div>
      ))}
    </div>
    </>
  ); 
}



