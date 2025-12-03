export default function JsonLd() {
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: "WIRES-X Station Viewer",
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Web",
        description:
            "YAESU WIRES-Xのノード局、アクティブルーム、地図情報をリアルタイムで表示。アマチュア無線家向けのノード局検索ツール。",
        offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "JPY",
        },
        author: {
            "@type": "Person",
            name: "JF9TGL",
        },
        publisher: {
            "@type": "Organization",
            name: "WIRES-X Station Viewer",
        },
        inLanguage: "ja-JP",
        keywords:
            "WIRES-X, YAESU, アマチュア無線, ノード局, ルーム, 無線機, Amateur Radio, Ham Radio",
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
    );
}
