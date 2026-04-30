import { useQuery } from '@tanstack/react-query';

function isInjuryNews(item) {
  const text = `${item.title || ''} ${item.description || ''}`.toLowerCase();

  return (
    text.includes('injur') ||
    text.includes('il') ||
    text.includes('10-day') ||
    text.includes('15-day') ||
    text.includes('60-day') ||
    text.includes('day-to-day') ||
    text.includes('soreness') ||
    text.includes('strain') ||
    text.includes('sprain') ||
    text.includes('fracture') ||
    text.includes('surgery') ||
    text.includes('rehab')
  );
}

export default function Injuries() {
  const { data = [], isLoading, error } = useQuery({
    queryKey: ['injuries'],
    queryFn: async () => {
      const res = await fetch('https://www.rotowire.com/rss/news.php?sport=MLB');

      if (!res.ok) {
        throw new Error('Failed to fetch injuries');
      }

      const text = await res.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(text, 'text/xml');

      const items = Array.from(xmlDoc.querySelectorAll('item')).map((item) => ({
        title: item.querySelector('title')?.textContent || '',
        link: item.querySelector('link')?.textContent || '',
        player: item.querySelector('title')?.textContent?.split(':')[0] || 'Unknown Player',
        description: item.querySelector('description')?.textContent || '',
        pubDate: item.querySelector('pubDate')?.textContent || '',
      }));

      return items.filter(isInjuryNews);
    },
    refetchInterval: 30000,
    refetchIntervalInBackground: true,
  });

  if (isLoading) return <p>Loading injuries...</p>;
  if (error) return <p>Error loading injuries</p>;

  return (
    <div>
      <h1>Injuries</h1>

      {data.length === 0 ? (
        <p>No injury updates found.</p>
      ) : (
        data.map((item, index) => (
          <div
            key={index}
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #ccc',
              borderRadius: '6px',
              padding: '12px',
              marginBottom: '12px',
            }}
          >
            <h3 style={{ margin: '0 0 6px 0' }}>{item.player}</h3>
            <p style={{ fontWeight: 'bold', margin: '0 0 6px 0' }}>
              {item.title}
            </p>
            <p
              style={{ margin: '0 0 6px 0' }}
              dangerouslySetInnerHTML={{ __html: item.description }}
            />
            <p style={{ fontSize: '12px', color: '#666' }}>
              {item.pubDate ? new Date(item.pubDate).toLocaleString() : ''}
            </p>
          </div>
        ))
      )}
    </div>
  );
}