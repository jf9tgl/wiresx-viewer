import { NextResponse } from "next/server";

export interface WiresRoom {
    id: string;
    dtmf: string;
    act: string;
    room_name: string;
    city: string;
    state: string;
    country: string;
    comment: string;
}

export async function GET() {
    try {
        const response = await fetch(
            "https://www.yaesu.com/jp/wires-x/id/active_room.php",
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
        const rooms: WiresRoom[] = [];
        const regex =
            /\{id:"([^"]*)",\s*dtmp:"([^"]*)",\s*act:"([^"]*)",\s*room_name:"([^"]*)",\s*city:"([^"]*)",\s*state:"([^"]*)",\s*country:"([^"]*)",\s*comment:"([^"]*)"\s*\}/g;

        let match;
        while ((match = regex.exec(html)) !== null) {
            rooms.push({
                id: match[1],
                dtmf: match[2],
                act: match[3],
                room_name: match[4],
                city: match[5],
                state: match[6],
                country: match[7],
                comment: match[8],
            });
        }

        return NextResponse.json(rooms);
    } catch (error) {
        console.error("Error fetching rooms:", error);
        return NextResponse.json(
            { error: "Failed to fetch rooms" },
            { status: 500 }
        );
    }
}
