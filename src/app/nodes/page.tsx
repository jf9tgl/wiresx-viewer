import { Metadata } from "next";
import NodesClient from "@/components/NodesClient";

export const metadata: Metadata = {
    title: "ノード局一覧",
    description:
        "WIRES-Xノード局の一覧。コールサイン、周波数、位置情報、DTMF IDなどを検索・フィルタリングできます。",
    openGraph: {
        title: "WIRES-X ノード局一覧",
        description: "WIRES-Xノード局の一覧を表示",
    },
    alternates: {
        canonical: "/nodes",
    },
};

export default function NodesPage() {
    return <NodesClient />;
}
