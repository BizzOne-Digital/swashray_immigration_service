export function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <div className="text-center py-16 px-6 rounded-[var(--radius-card)] border border-dashed border-black/10 bg-black/[0.015]">
      <p className="font-heading text-lg font-medium text-[var(--color-primary)]">{title}</p>
      <p className="mt-2 text-sm text-[var(--color-muted)] max-w-sm mx-auto">{message}</p>
    </div>
  );
}
