function ProgressBar({ value = 0, color = 'linear-gradient(90deg, #f5a623, #ff8c00)', className = '' }) {
  const safe = Math.max(0, Math.min(100, Number(value || 0)));

  return (
    <div className={`h-1.5 w-full overflow-hidden rounded-full bg-borderSubtle ${className}`}>
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${safe}%`, background: color }}
      />
    </div>
  );
}

export default ProgressBar;
