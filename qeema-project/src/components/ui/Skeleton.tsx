export function Skeleton({
  className = "",
}: {
  className?: string;
}) {
  return (
    <span
      className={`inline-block animate-pulse rounded-md bg-[var(--surface-2)] ${className}`}
      aria-hidden
    />
  );
}
