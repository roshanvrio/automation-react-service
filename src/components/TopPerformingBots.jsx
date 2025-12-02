import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function TopPerformingBots() {
  const data = [
    { name: 'vm22', value: 33.1, color: '#4a9eff' },
    { name: 'VM19', value: 19.8, color: '#ff9f40' },
    { name: 'VM48', value: 22.0, color: '#4ade80' },
    { name: 'VM33...', value: 21.1, color: '#fbbf24' },
    { name: 'VM32...', value: 10.1, color: '#4ade80' }
  ];

  return (
    <div style={{
      background: '#1a1a1a',
      padding: '15px',
      borderRadius: '8px',
      border: '1px solid #333'
    }}>
      <h3 style={{
        color: 'white',
        margin: '0 0 15px 0',
        fontSize: '14px',
        fontWeight: '500'
      }}>
        Top 5 Performing Bots
      </h3>
      
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis 
            dataKey="name" 
            stroke="#888"
            style={{ fontSize: '10px' }}
          />
          <YAxis 
            stroke="#888"
            style={{ fontSize: '10px' }}
          />
          <Tooltip 
            contentStyle={{
              background: '#2a2a2a',
              border: '1px solid #444',
              borderRadius: '4px',
              color: 'white',
              fontSize: '12px'
            }}
          />
          <Bar 
            dataKey="value" 
            fill="#4a9eff"
            radius={[6, 6, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default TopPerformingBots;