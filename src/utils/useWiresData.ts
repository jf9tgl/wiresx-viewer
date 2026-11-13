"use client";

import { useEffect, useState } from "react";
import { getCachedEntry, isCacheFresh, setCachedData } from "./cache";

/**
 * ノード/ルーム一覧を取得するフック（stale-while-revalidate）。
 *
 * - localStorage にキャッシュがあれば、期限切れでも先に表示する
 * - 期限切れ、またはキャッシュがない場合だけAPIから取得する
 * - 更新に失敗しても、キャッシュがあれば古いデータを出し続ける
 */
export function useWiresData<T>(key: string, url: string) {
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            const cached = getCachedEntry<T[]>(key);
            const hasCache = !!cached && cached.data.length > 0;

            if (cached && hasCache) {
                setData(cached.data);
                setLoading(false);
                if (isCacheFresh(cached.timestamp)) return;
            }

            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error("Failed to fetch data");
                const fresh: T[] = await response.json();
                if (cancelled) return;
                setData(fresh);
                setError(null);
                if (fresh.length > 0) setCachedData(key, fresh);
            } catch (err) {
                if (cancelled) return;
                // キャッシュがあれば古いデータのまま表示する
                if (!hasCache) {
                    setError(
                        err instanceof Error ? err.message : "An error occurred"
                    );
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();
        return () => {
            cancelled = true;
        };
    }, [key, url]);

    return { data, loading, error };
}
