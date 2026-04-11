const Leaderboard = ({ data, currentUserId }) => {
  if (!data || data.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🏆</div>
        <p>No submissions yet. Be the first!</p>
      </div>
    );
  }

  const getRankClass = (rank) => {
    if (rank === 1) return 'rank-badge rank-1';
    if (rank === 2) return 'rank-badge rank-2';
    if (rank === 3) return 'rank-badge rank-3';
    return 'rank-badge rank-other';
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return rank;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {data.map((entry, i) => (
        <div
          key={i}
          className="podium-row"
          style={{
            background: entry.rank <= 3 ? 'var(--primary-light)' : 'var(--bg)',
            border: `1px solid ${entry.rank <= 3 ? 'var(--border)' : 'var(--border-light)'}`,
            borderRadius: 'var(--radius-md)',
          }}
        >
          <div className={getRankClass(entry.rank)}>{getRankIcon(entry.rank)}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontWeight: 700, fontSize: '0.925rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {entry.name}
            </p>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{entry.email}</p>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <p style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--primary)' }}>
              {entry.score}/{entry.total}
            </p>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{entry.percentage}%</p>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0, minWidth: 60 }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {Math.floor(entry.timeTaken / 60)}m {entry.timeTaken % 60}s
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Leaderboard;
