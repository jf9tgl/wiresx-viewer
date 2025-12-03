import Link from "next/link";

export default function Home() {
    return (
        <>
            <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100">
                <main className="container mx-auto px-4 py-16">
                    <header className="text-center mb-12">
                        <h1 className="text-5xl font-bold text-gray-900 mb-4">
                            WIRES-X Station Viewer
                        </h1>
                        <p className="text-xl text-gray-600 mb-2">
                            アマチュア無線 WIRES-X ノード局・ルーム情報
                        </p>
                        <p className="text-sm text-gray-500">
                            データソース: YAESU WIRES-X 公式サイト
                        </p>
                    </header>

                    <nav
                        className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto"
                        aria-label="Main navigation"
                    >
                        <Link href="/nodes" aria-label="ノード局一覧ページへ">
                            <article className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow cursor-pointer border-t-4 border-blue-500">
                                <div className="text-center">
                                    <h2 className="text-2xl font-bold mb-3 text-gray-900">
                                        Node Stations
                                    </h2>
                                    <p className="text-gray-600 mb-4">
                                        WIRES-Xノード局の一覧を表示します。コールサイン、周波数、位置情報などを確認できます。
                                    </p>
                                    <div className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold">
                                        View Nodes →
                                    </div>
                                </div>
                            </article>
                        </Link>

                        <Link
                            href="/rooms"
                            aria-label="アクティブルーム一覧ページへ"
                        >
                            <article className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow cursor-pointer border-t-4 border-green-500">
                                <div className="text-center">
                                    <h2 className="text-2xl font-bold mb-3 text-gray-900">
                                        Active Rooms
                                    </h2>
                                    <p className="text-gray-600 mb-4">
                                        アクティブなWIRES-Xルームの一覧を表示します。ルーム名、DTMF
                                        ID、位置情報を確認できます。
                                    </p>
                                    <div className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold">
                                        View Rooms →
                                    </div>
                                </div>
                            </article>
                        </Link>

                        <Link href="/map" aria-label="ノード局マップページへ">
                            <article className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow cursor-pointer border-t-4 border-purple-500">
                                <div className="text-center">
                                    <h2 className="text-2xl font-bold mb-3 text-gray-900">
                                        Node Map
                                    </h2>
                                    <p className="text-gray-600 mb-4">
                                        ノード局の位置情報を地図上で確認します。座標データを持つノードを一覧表示します。
                                    </p>
                                    <div className="inline-block bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-semibold">
                                        View Map →
                                    </div>
                                </div>
                            </article>
                        </Link>
                    </nav>

                    <section className="mt-16 max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-xl font-bold mb-3 text-gray-900">
                            About WIRES-X
                        </h3>
                        <p className="text-gray-700 mb-3">
                            WIRES-X（Wide-coverage Internet Repeater Enhancement
                            System）は、
                            YAESUが提供するアマチュア無線のインターネット接続システムです。
                        </p>
                        <p className="text-gray-700">
                            このサイトでは、YAESU公式サイトから取得したノード局とルームの情報を
                            見やすく表示し、検索やフィルタリングを行うことができます。
                        </p>
                    </section>
                </main>
            </div>

            <footer className="bg-white w-full h-full mt-12 text-center text-gray-600 text-sm pb-8">
                <div className="mb-2">
                    <Link
                        href="/privacy"
                        className="text-blue-600 hover:text-blue-800 underline"
                    >
                        プライバシーポリシー
                    </Link>
                </div>
                <p>© 2025 JF9TGL</p>
            </footer>
        </>
    );
}
