import { NextResponse } from "next/server";
import { fetchWithFallback, sourceHeaders } from "@/utils/yaesu";

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

// HTMLからJavaScriptの配列データを抽出
function parseRooms(html: string): WiresRoom[] {
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
    return rooms;
}

export async function GET() {
    try {
        const result = await fetchWithFallback("active_room.php", parseRooms);

        if (!result) {
            return NextResponse.json(
                { error: "Failed to fetch rooms" },
                { status: 502 }
            );
        }

        return NextResponse.json(result.data, {
            headers: sourceHeaders(result),
        });
    } catch (error) {
        console.error("Error fetching rooms:", error);
        return NextResponse.json(
            { error: "Failed to fetch rooms" },
            { status: 500 }
        );
    }
}
