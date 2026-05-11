import { useSocket } from "@/contexts/SocketContext";

export function SocketIndicator() {
  const { connected } = useSocket();

  return (
    <div
      className="flex items-center gap-2 text-xs font-medium tabular-nums"
      aria-live="polite"
    >
      <span className="relative flex h-[7px] w-[7px] shrink-0 items-center justify-center">
        {connected ? (
          <span
            className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--live)] opacity-35"
            aria-hidden
          />
        ) : null}
        <span
          className={`relative block h-[7px] w-[7px] rounded-full ${
            connected ? "bg-[var(--live)]" : "bg-[var(--live-off)]"
          }`}
          aria-hidden
        />
      </span>
      <span
        className={
          connected ? "text-[var(--live)]" : "text-[var(--live-off)]"
        }
      >
        {connected ? "Live" : "Disconnected"}
      </span>
    </div>
  );
}
