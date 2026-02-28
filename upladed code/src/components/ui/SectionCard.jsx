function SectionCard({
  title,
  icon,
  accent = '#f5a623',
  rightSlot,
  children,
  className = '',
  bodyClassName = ''
}) {
  return (
    <section
      className={`section-card fade-in p-4 ${className}`}
      style={{ borderLeft: `4px solid ${accent}` }}
    >
      {(title || rightSlot) && (
        <header className="mb-3 flex items-center justify-between gap-2">
          <h2 className="title-font text-xs font-bold uppercase tracking-[0.16em]" style={{ color: accent }}>
            <span className="mr-2 inline-flex items-center">{icon}</span>
            {title}
          </h2>
          {rightSlot}
        </header>
      )}
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}

export default SectionCard;
