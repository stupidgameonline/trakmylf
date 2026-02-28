const styles = {
  complete: 'bg-green-500/20 text-green-300',
  passed: 'bg-green-500/20 text-green-300',
  failed: 'bg-red-500/20 text-red-300',
  fail: 'bg-red-500/20 text-red-300',
  na: 'bg-zinc-500/20 text-zinc-300'
};

function StatusBadge({ status }) {
  if (!status) return null;
  const normalized = status.toLowerCase();
  const textMap = {
    complete: 'DONE',
    failed: 'FAILED',
    passed: 'PASS',
    na: 'N/A'
  };

  return (
    <span className={`badge ${styles[normalized] || 'bg-zinc-600/20 text-zinc-200'}`}>
      {textMap[normalized] || status.toUpperCase()}
    </span>
  );
}

export default StatusBadge;
