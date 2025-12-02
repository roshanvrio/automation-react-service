function BotStatusList() {
  const bots = [
    { name: 'VM18.BOT', status: 'Bot is ready to accept next transaction' },
    { name: 'VM48.BOT', status: 'Bot is ready to accept next transaction' },
    { name: 'VM19.BOT', status: 'Bot is ready to accept next transaction' },
    { name: 'VM22.BOT', status: 'BankPostingNigeria-OGA' },
    { name: 'VM32.BOT', status: 'Bot is ready to accept next transaction' }
  ];

  return (
    <div style={{
      background: '#0a0a0a',
      padding: '10px',
      borderRadius: '8px',
      maxHeight: '130px',
      overflowY: 'auto'
    }}>
      {bots.map((bot, index) => (
        <div
          key={index}
          style={{
            color: '#aaa',
            fontSize: '12px',
            marginBottom: '8px',
            fontFamily: 'monospace',
            lineHeight: '1.4'
          }}
        >
          <span style={{ color: 'white' }}>{bot.name}</span> - {bot.status}
        </div>
      ))}
    </div>
  );
}

export default BotStatusList;