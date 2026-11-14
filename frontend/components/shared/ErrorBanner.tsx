export function ErrorBanner({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <div
      role="alert"
      className="rounded-2xl border border-rose-500/40 bg-rose-950/40 px-3 py-2 text-sm text-rose-100"
    >
      <p className="font-medium">{title}</p>
      <p>{message}</p>
    </div>
  );
}
