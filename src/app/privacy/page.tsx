import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "プライバシーポリシー",
    description:
        "WIRES-X Station Viewerのプライバシーポリシー。位置情報の取り扱い、データの保存方法について説明します。",
    openGraph: {
        title: "プライバシーポリシー | WIRES-X Station Viewer",
        description: "位置情報とデータの取り扱いについて",
    },
};

export default function PrivacyPage() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6">プライバシーポリシー</h1>

            <div className="prose prose-blue max-w-none">
                <p className="text-gray-600 mb-6">最終更新日: 2025年12月1日</p>

                <section className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">1. はじめに</h2>
                    <p className="mb-4">
                        WIRES-X Station
                        Viewer（以下「本サービス」）は、アマチュア無線のWIRES-Xノード局とルーム情報を閲覧するためのウェブアプリケーションです。
                        本プライバシーポリシーでは、本サービスにおける位置情報の取り扱いについて説明します。
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">
                        2. 位置情報の取得と利用
                    </h2>

                    <h3 className="text-xl font-semibold mb-3 mt-4">
                        2.1 IP位置情報
                    </h3>
                    <p className="mb-4">
                        本サービスでは、マップページの読み込み時に自動的にIPアドレスから大まかな位置情報（都市レベル）を取得します。
                        これは、ユーザーの近くにあるノード局を表示するために使用されます。
                    </p>
                    <ul className="list-disc pl-6 mb-4 space-y-2">
                        <li>取得元: ipapi.co サービス</li>
                        <li>取得する情報: 緯度、経度、都市名、国名</li>
                        <li>利用目的: 付近のノード局の検索と表示</li>
                    </ul>

                    <h3 className="text-xl font-semibold mb-3 mt-4">
                        2.2 GPS位置情報（オプション）
                    </h3>
                    <p className="mb-4">
                        「GPS位置を取得」ボタンをクリックした場合のみ、ブラウザのGeolocation
                        APIを使用して
                        より正確な位置情報を取得します。この機能は完全に任意であり、ユーザーの明示的な操作が必要です。
                    </p>
                    <ul className="list-disc pl-6 mb-4 space-y-2">
                        <li>取得方法: ブラウザのGeolocation API</li>
                        <li>取得する情報: 緯度、経度</li>
                        <li>
                            都市名の取得: OpenStreetMap Nominatim
                            APIを使用（逆ジオコーディング）
                        </li>
                        <li>
                            利用目的: より正確な距離計算と付近のノード局の表示
                        </li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">
                        3. 位置情報の保存と共有
                    </h2>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                        <p className="text-green-900 font-semibold">
                            🔒 重要:
                            取得された位置情報は、お使いのブラウザ内でのみ処理され、
                            外部サーバーには一切送信されません。
                        </p>
                    </div>

                    <ul className="list-disc pl-6 mb-4 space-y-2">
                        <li>位置情報はブラウザのメモリ内でのみ保持されます</li>
                        <li>
                            ページをリロードすると位置情報はリセットされます
                        </li>
                        <li>
                            第三者のサーバーに位置情報を送信することはありません
                        </li>
                        <li>
                            位置情報をデータベースやログに保存することはありません
                        </li>
                        <li>
                            他のユーザーと位置情報を共有することはありません
                        </li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">
                        4. キャッシュ機能
                    </h2>
                    <p className="mb-4">
                        本サービスでは、ノード局とルームのデータをブラウザのlocalStorageに
                        最大1時間キャッシュします。これはページの読み込み速度を向上させるためです。
                    </p>
                    <ul className="list-disc pl-6 mb-4 space-y-2">
                        <li>
                            保存される情報:
                            YAESU公式サイトから取得した公開情報のみ
                        </li>
                        <li>
                            保存先: お使いのブラウザのlocalStorage（ローカル）
                        </li>
                        <li>保存期間: 最大25分</li>
                        <li>個人情報は含まれません</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">5. データソース</h2>
                    <p className="mb-4">
                        ノード局とルームの情報は、以下の公式ソースから取得しています：
                    </p>
                    <ul className="list-disc pl-6 mb-4 space-y-2">
                        <li>
                            WIRES-X ノード局:{" "}
                            <a
                                href="https://www.yaesu.com/jp/wires-x/id/active_node.php"
                                className="text-blue-600 hover:underline"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                YAESU公式サイト
                            </a>
                        </li>
                        <li>
                            WIRES-X アクティブルーム:{" "}
                            <a
                                href="https://www.yaesu.com/jp/wires-x/id/active_room.php"
                                className="text-blue-600 hover:underline"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                YAESU公式サイト
                            </a>
                        </li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">
                        6. 外部サービスの利用
                    </h2>
                    <p className="mb-4">
                        本サービスでは、以下の外部サービスを利用しています：
                    </p>
                    <ul className="list-disc pl-6 mb-4 space-y-2">
                        <li>
                            <strong>ipapi.co:</strong> IP位置情報の取得
                        </li>
                        <li>
                            <strong>OpenStreetMap:</strong> 地図タイルの表示
                        </li>
                        <li>
                            <strong>Nominatim:</strong>{" "}
                            座標から都市名の取得（逆ジオコーディング）
                        </li>
                    </ul>
                    <p className="mb-4">
                        これらのサービスには、それぞれのプライバシーポリシーが適用されます。
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">7. Cookie</h2>
                    <p className="mb-4">
                        本サービスは、Cookie を使用していません。
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">
                        8. 子どものプライバシー
                    </h2>
                    <p className="mb-4">
                        本サービスは、アマチュア無線家向けに設計されており、
                        意図的に13歳未満の子どもから個人情報を収集することはありません。
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">
                        9. プライバシーポリシーの変更
                    </h2>
                    <p className="mb-4">
                        本プライバシーポリシーは、必要に応じて変更されることがあります。
                        変更があった場合は、このページに掲載してお知らせします。
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">
                        10. お問い合わせ
                    </h2>
                    <p className="mb-4">
                        本プライバシーポリシーに関するご質問やご意見がある場合は、
                        GitHubのIssueまたはプルリクエストでお知らせください。
                    </p>
                </section>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
                    <h3 className="text-lg font-semibold mb-2">要約</h3>
                    <ul className="space-y-2">
                        <li>✅ 位置情報はブラウザ内でのみ処理されます</li>
                        <li>✅ GPS位置情報の取得は完全に任意です</li>
                        <li>
                            ✅ 外部サーバーに位置情報を送信することはありません
                        </li>
                        <li>✅ 個人情報を収集・保存することはありません</li>
                        <li>
                            ✅
                            すべての情報はローカル（ブラウザ内）で処理されます
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
