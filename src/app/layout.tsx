import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "../components/Navigation";
import JsonLd from "../components/JsonLd";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: {
        default:
            "WIRES-X Station Viewer - アマチュア無線 WIRES-X ノード局・ルーム情報",
        template: "%s | WIRES-X Station Viewer",
    },
    description:
        "YAESU WIRES-Xのノード局、アクティブルーム、地図情報をリアルタイムで表示。アマチュア無線家向けのノード局検索ツール。",
    keywords: [
        "WIRES-X",
        "YAESU",
        "アマチュア無線",
        "ノード局",
        "ルーム",
        "無線機",
        "Amateur Radio",
        "Ham Radio",
        "周波数",
        "DTMF",
    ],
    authors: [{ name: "JF9TGL" }],
    creator: "JF9TGL",
    publisher: "WIRES-X Station Viewer",
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
    openGraph: {
        type: "website",
        locale: "ja_JP",
        url: "https://wiresxview.jf9tgl.net",
        siteName: "WIRES-X Station Viewer",
        title: "WIRES-X Station Viewer - アマチュア無線 WIRES-X ノード局・ルーム情報",
        description:
            "YAESU WIRES-Xのノード局、アクティブルーム、地図情報をリアルタイムで表示。",
    },
    twitter: {
        card: "summary_large_image",
        title: "WIRES-X Station Viewer",
        description: "YAESU WIRES-Xのノード局・ルーム情報をリアルタイム表示",
        creator: "@jf9tgl",
    },
    alternates: {
        canonical: "/",
    },
    metadataBase: new URL("https://wiresxview.jf9tgl.net"),
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ja">
            <head>
                <JsonLd />
            </head>
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <Navigation />
                {children}
            </body>
        </html>
    );
}
