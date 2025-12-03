import { Metadata } from "next";
import MapClient from "@/components/MapClient";

export const metadata: Metadata = {
    title: "ノード局マップ",
    description:
        "WIRES-Xノード局を地図上に表示。GPS位置情報、IP位置情報による近隣ノード検索、距離フィルタリング機能付き。",
    openGraph: {
        title: "WIRES-X ノード局マップ",
        description: "WIRES-Xノード局を地図上に表示",
    },
    alternates: {
        canonical: "/map",
    },
};

export default function MapPage() {
    return <MapClient />;
}
