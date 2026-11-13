import { NextResponse } from "next/server";
import { fetchWithFallback, sourceHeaders } from "@/utils/yaesu";

export interface WiresNode {
    id: string;
    dtmf_id: string;
    call_sign: string;
    ana_dig: string;
    city: string;
    state: string;
    country: string;
    freq: string;
    sql: string;
    lat: string;
    lon: string;
    comment: string;
    distance?: number;
}

// HTMLからJavaScriptの配列データを抽出
function parseNodes(html: string): WiresNode[] {
    const nodes: WiresNode[] = [];
    const regex =
        /\{id:"([^"]*)",\s*dtmf_id:"([^"]*)",\s*call_sign:"([^"]*)",\s*ana_dig:"([^"]*)",\s*city:"([^"]*)",\s*state:"([^"]*)",\s*country:"([^"]*)",\s*freq:"([^"]*)",\s*sql:"([^"]*)",\s*lat:"([^"]*)",\s*lon:"([^"]*)",\s*comment:"([^"]*)"\s*\}/g;

    let match;
    while ((match = regex.exec(html)) !== null) {
        nodes.push({
            id: match[1],
            dtmf_id: match[2],
            call_sign: match[3],
            ana_dig: match[4],
            city: match[5],
            state: match[6],
            country: match[7],
            freq: match[8],
            sql: match[9],
            lat: match[10],
            lon: match[11],
            comment: match[12],
        });
    }
    return nodes;
}

export async function GET() {
    try {
        const result = await fetchWithFallback("active_node.php", parseNodes);

        if (!result) {
            return NextResponse.json(
                { error: "Failed to fetch nodes" },
                { status: 502 }
            );
        }

        return NextResponse.json(result.data, {
            headers: sourceHeaders(result),
        });
    } catch (error) {
        console.error("Error fetching nodes:", error);
        return NextResponse.json(
            { error: "Failed to fetch nodes" },
            { status: 500 }
        );
    }
}
