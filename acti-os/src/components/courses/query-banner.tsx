export function QueryBanner({
  error,
  notice,
}: {
  error?: string | null;
  notice?: string | null;
}) {
  if (error) {
    return (
      <p
        role="alert"
        className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
      >
        {error}
      </p>
    );
  }
  if (notice) {
    return (
      <p
        role="status"
        className="rounded-md border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary"
      >
        {notice}
      </p>
    );
  }
  return null;
}
