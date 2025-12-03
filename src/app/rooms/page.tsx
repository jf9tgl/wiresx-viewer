import { Metadata } from "next";
import RoomsClient from "@/components/RoomsClient";

export const metadata: Metadata = {
    title: "アクティブルーム一覧",
    description:
        "WIRES-Xアクティブルームの一覧。ルーム名、アクティブユーザー数、DTMF IDなどを検索・ソートできます。",
    openGraph: {
        title: "WIRES-X アクティブルーム一覧",
        description: "WIRES-Xアクティブルームの一覧を表示",
    },
};

export default function RoomsPage() {
    return <RoomsClient />;
}
