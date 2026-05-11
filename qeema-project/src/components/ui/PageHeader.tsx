export function PageHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <header className="mb-8 border-b border-[var(--border)] pb-6">
      <h1 className="text-2xl font-semibold tracking-tight text-[var(--text)]">
        {title}
      </h1>
      {description ? (
        <p className="mt-2 max-w-2xl text-[13px] font-normal leading-relaxed text-[var(--text-muted)]">
          {description}
        </p>
      ) : null}
    </header>
  );
}
