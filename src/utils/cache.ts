// キャッシュの有効期限（25分 = 1500000ミリ秒）
const CACHE_DURATION = 60 * 25 * 1000;

interface CacheData<T> {
    data: T;
    timestamp: number;
}

/**
 * localStorageからキャッシュデータを取得
 * 有効期限が切れている場合はnullを返す
 */
export function getCachedData<T>(key: string): T | null {
    if (typeof window === "undefined") return null;

    try {
        const cached = localStorage.getItem(key);
        if (!cached) return null;

        const { data, timestamp }: CacheData<T> = JSON.parse(cached);
        const now = Date.now();

        // キャッシュが有効期限内かチェック
        if (now - timestamp < CACHE_DURATION) {
            return data;
        }

        // 期限切れの場合は削除
        localStorage.removeItem(key);
        return null;
    } catch (error) {
        console.error("Failed to get cached data:", error);
        return null;
    }
}

/**
 * localStorageにデータをキャッシュ
 */
export function setCachedData<T>(key: string, data: T): void {
    if (typeof window === "undefined") return;

    try {
        const cacheData: CacheData<T> = {
            data,
            timestamp: Date.now(),
        };
        localStorage.setItem(key, JSON.stringify(cacheData));
    } catch (error) {
        console.error("Failed to cache data:", error);
    }
}

/**
 * キャッシュをクリア
 */
export function clearCache(key: string): void {
    if (typeof window === "undefined") return;

    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error("Failed to clear cache:", error);
    }
}

/**
 * すべてのWIRES-Xキャッシュをクリア
 */
export function clearAllWiresXCache(): void {
    if (typeof window === "undefined") return;

    try {
        clearCache("wiresx_nodes");
        clearCache("wiresx_rooms");
    } catch (error) {
        console.error("Failed to clear all cache:", error);
    }
}
