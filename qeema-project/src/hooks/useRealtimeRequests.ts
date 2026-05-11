import { useCallback, useEffect, useRef, useState } from "react";
import { ApiClientError, requestsApi } from "@/lib/api";
import { useSocket } from "@/contexts/SocketContext";
import type { ServiceRequest } from "@/types/models";

const FETCH_ERROR =
  "Could not load requests. Check your connection and try again.";

/**
 * Loads requests from the API and keeps the list in sync via Socket.io events.
 */
export function useRealtimeRequests() {
  const { socket } = useSocket();
  const [items, setItems] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const highlightTimers = useRef<Map<number, ReturnType<typeof setTimeout>>>(
    new Map()
  );
  const [highlightedIds, setHighlightedIds] = useState<Set<number>>(new Set());

  const flashRow = useCallback((id: number) => {
    const prev = highlightTimers.current.get(id);
    if (prev) clearTimeout(prev);

    setHighlightedIds((s) => new Set(s).add(id));

    const t = setTimeout(() => {
      setHighlightedIds((s) => {
        const next = new Set(s);
        next.delete(id);
        return next;
      });
      highlightTimers.current.delete(id);
    }, 1400);

    highlightTimers.current.set(id, t);
  }, []);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await requestsApi.list();
      setItems(data.data);
    } catch (err) {
      const msg =
        err instanceof ApiClientError ? err.message : FETCH_ERROR;
      setError(msg);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchRequests();
  }, [fetchRequests]);

  useEffect(() => {
    return () => {
      for (const t of highlightTimers.current.values()) {
        clearTimeout(t);
      }
      highlightTimers.current.clear();
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    const onNew = (payload: ServiceRequest) => {
      setError(null);
      setItems((prev) => {
        if (prev.some((r) => r.id === payload.id)) return prev;
        return [payload, ...prev];
      });
      flashRow(payload.id);
    };

    const onUpdated = (payload: ServiceRequest) => {
      setError(null);
      setItems((prev) => {
        if (prev.length === 0) return [payload];
        return prev.map((r) => (r.id === payload.id ? payload : r));
      });
      flashRow(payload.id);
    };

    socket.on("new-request", onNew);
    socket.on("request-status-updated", onUpdated);

    return () => {
      socket.off("new-request", onNew);
      socket.off("request-status-updated", onUpdated);
    };
  }, [socket, flashRow]);

  return {
    items,
    loading,
    error,
    refetch: fetchRequests,
    highlightedIds,
  };
}
