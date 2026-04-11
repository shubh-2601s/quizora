import { Link } from 'react-router-dom';

const QuizCard = ({ quiz, isAdmin = false, onDelete }) => {
  const now = new Date();
  const start = new Date(quiz.startTime);
  const end = new Date(quiz.endTime);

  let status = 'upcoming';
  let statusLabel = 'Upcoming';
  let badgeCls = 'badge-warning';
  if (now >= start && now <= end) { status = 'active'; statusLabel = 'Active'; badgeCls = 'badge-success'; }
  else if (now > end) { status = 'ended'; statusLabel = 'Ended'; badgeCls = 'badge-error'; }

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="flex-between">
        <div>
          <h3 style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: 4 }}>{quiz.title}</h3>
          <span className="badge badge-primary" style={{ fontFamily: 'monospace', fontSize: '0.85rem', letterSpacing: '0.1em' }}>
            {quiz.code}
          </span>
        </div>
        <span className={`badge ${badgeCls}`}>{statusLabel}</span>
      </div>

      {quiz.description && (
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{quiz.description}</p>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
        <span>⏱ {quiz.duration} min</span>
        {quiz.questionCount !== undefined && <span>❓ {quiz.questionCount} questions</span>}
        {quiz.submissionCount !== undefined && <span>👥 {quiz.submissionCount} attempts</span>}
        <span>📅 {start.toLocaleDateString()}</span>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 'auto', paddingTop: 8, borderTop: '1px solid var(--border)' }}>
        {isAdmin ? (
          <>
            <Link to={`/admin/quiz/${quiz._id}`} className="btn btn-secondary btn-sm">View Details</Link>
            <Link to={`/admin/quiz/${quiz._id}/edit`} className="btn btn-outline btn-sm">Edit</Link>
            <Link to={`/admin/quiz/${quiz._id}/questions`} className="btn btn-outline btn-sm">Questions</Link>
            {onDelete && (
              <button onClick={() => onDelete(quiz._id)} className="btn btn-danger btn-sm" style={{ marginLeft: 'auto' }}>Delete</button>
            )}
          </>
        ) : (
          <Link to={`/quiz/${quiz.code}/instructions`} className="btn btn-primary btn-sm">
            {status === 'active' ? 'Attempt Quiz' : 'View'}
          </Link>
        )}
      </div>
    </div>
  );
};

export default QuizCard;
