import { useQuery } from '@tanstack/react-query'
import "../../css/playerNews.css";
import Drawer from './Drawer';

export default function PlayerNews() {
    const { data, isLoading, error } = useQuery({
    queryKey: ['news'],
    queryFn: async () => {
        const res = await fetch(
        'https://www.rotowire.com/rss/news.php?sport=MLB'
        );
        const text = await res.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(text, "text/xml");
        const rssItems = Array.from(xmlDoc.querySelectorAll("item")).map(
        (item) => ({
            title: item.querySelector("title")?.textContent,
            link: item.querySelector("link")?.textContent,
            player: item.querySelector("title")?.textContent.split(":")[0],
            description: item.querySelector("description")?.textContent,
            pubDate: item.querySelector("pubDate")?.textContent,
        })
        );
        return rssItems;
    },
    refetchInterval: 10000,    
    refetchIntervalInBackground: true,
    });

    if (isLoading) return <p>Loading...</p>
    if (error) return <p>Error loading player news</p>

    return (
    <> 
    <div className="news-container">
      {data.map((item, index) => (
        <div key={index} className="news-card">
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
              className="news-description"
              dangerouslySetInnerHTML={{ __html: item.description }}
            />
          </div>
        </div>
      ))}
    </div>
    </>
  ); 
}



