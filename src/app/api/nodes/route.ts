import { NextResponse } from "next/server";

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

export async function GET() {
    try {
        const response = await fetch(
            "https://www.yaesu.com/jp/wires-x/id/active_node.php",
            {
                cache: "no-store",
            }
        );
        
        if (!response.ok) {
            console.error("Error fetching nodes:", response.statusText);
            
            return NextResponse.json(
                { error: "Failed to fetch nodes" },
                { status: response.status }
            );
        }

        const html = await response.text();

        // HTMLからJavaScriptの配列データを抽出
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

        return NextResponse.json(nodes);
    } catch (error) {
        console.error("Error fetching nodes:", error);
        return NextResponse.json(
            { error: "Failed to fetch nodes" },
            { status: 500 }
        );
    }
}
