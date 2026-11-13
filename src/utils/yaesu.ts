const YAESU_BASE = "https://www.yaesu.com/jp/wires-x/id/";

// 14桁タイムスタンプに遠い未来を指定すると、Wayback は「最も新しい」スナップショットへ
// リダイレクトする。id_ を付けると、リンク書き換えやツールバーのない元のHTMLが返る。
const WAYBACK_LATEST = "https://web.archive.org/web/20991231235959id_/";

export type DataSource = "yaesu" | "wayback";

export interface FetchResult<T> {
    data: T;
    source: DataSource;
    /** Wayback の場合のみ。スナップショットの取得日時（YYYYMMDDhhmmss） */
    snapshot?: string;
}

async function tryFetch(
    url: string,
    init: RequestInit & { next?: { revalidate: number } },
    timeoutMs: number
): Promise<{ html: string; finalUrl: string } | null> {
    try {
        const response = await fetch(url, {
            ...init,
            signal: AbortSignal.timeout(timeoutMs),
        });
        if (!response.ok) {
            console.error(`Fetch failed: ${url} -> ${response.status}`);
            return null;
        }
        return { html: await response.text(), finalUrl: response.url };
    } catch (error) {
        console.error(`Fetch error: ${url}`, error);
        return null;
    }
}

/**
 * ヤエス公式から取得し、失敗または0件だった場合は Wayback Machine の最新スナップショットへフォールバックする。
 * parse は HTML からデータ配列を取り出す関数。
 */
export async function fetchWithFallback<T>(
    file: string,
    parse: (html: string) => T[]
): Promise<FetchResult<T[]> | null> {
    const url = YAESU_BASE + file;

    const live = await tryFetch(url, { cache: "no-store" }, 8000);
    if (live) {
        const data = parse(live.html);
        // 200 でもエラーページ等で0件の場合は成功扱いにしない
        if (data.length > 0) return { data, source: "yaesu" };
    }

    const archived = await tryFetch(
        WAYBACK_LATEST + url,
        { next: { revalidate: 60 * 60 * 24 } },
        15000
    );
    if (archived) {
        const data = parse(archived.html);
        if (data.length > 0) {
            const snapshot = archived.finalUrl.match(/\/web\/(\d{14})/)?.[1];
            return { data, source: "wayback", snapshot };
        }
    }

    return null;
}

export function sourceHeaders<T>(result: FetchResult<T>): HeadersInit {
    const headers: Record<string, string> = { "X-Data-Source": result.source };
    if (result.snapshot) headers["X-Snapshot-Date"] = result.snapshot;
    return headers;
}
