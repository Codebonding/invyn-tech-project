export function Skeleton({ height = 16, width = "100%", className = "" }) {
  return <span className={`sd-skel ${className}`} style={{ height, width }} aria-hidden="true" />;
}

export function CardSkeleton({ lines = 3 }) {
  return (
    <div className="sd-card" aria-hidden="true">
      <Skeleton height={20} width="45%" />
      {Array.from({ length: lines }, (_, i) => <Skeleton key={i} height={14} width={`${90 - i * 12}%`} />)}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div role="status" aria-label="Loading your dashboard" className="sd-stack">
      <CardSkeleton lines={2} />
      <div className="sd-stats">{[0, 1, 2, 3].map((i) => <CardSkeleton key={i} lines={1} />)}</div>
      <div className="sd-courses">{[0, 1, 2].map((i) => <CardSkeleton key={i} lines={4} />)}</div>
    </div>
  );
}

export function EmptyState({ title, children, action }) {
  return (
    <div className="sd-empty">
      <p className="sd-empty__title">{title}</p>
      {children && <p className="sd-muted">{children}</p>}
      {action}
    </div>
  );
}

export function ErrorState({ message = "We could not load this right now.", onRetry }) {
  return (
    <div className="sd-error" role="alert">
      <p className="sd-empty__title">Something went wrong</p>
      <p className="sd-muted">{message}</p>
      {onRetry && <button type="button" className="sd-btn sd-btn--primary" onClick={onRetry}>Try again</button>}
    </div>
  );
}