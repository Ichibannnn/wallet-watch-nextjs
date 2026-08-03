export function ModuleHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

/** Simple dashed placeholder to stand in for a module's real content. */
export function ModulePlaceholder({ label }: { label: string }) {
  return (
    <div className="flex min-h-64 items-center justify-center rounded-xl border border-dashed border-border bg-card/40 text-sm text-muted-foreground">
      {label}
    </div>
  );
}
