export default function Infomation() {
    type Info = {
        title: string;
        content: string;
    };

    const infos: Info[] = [
        {
            title: "おしらせ",
            content: "現在公式サイトがセキュリティ問題の対処のため停止しています。過去のデータを使用しているためデータが古い可能性がありますご注意ください。",
        },
        {
            title: "概略位置について",
            content: "座標のないノードの一部は、市区町村レベルの概略位置を表示しています。これは局の正確な位置ではありません。概略位置の一部にはGeoNamesのデータを使用しています（GeoNames Gazetteer Data、CC BY 4.0）。",
        },
    ];

    if (infos.length === 0) {
        return;
    }

    return (
        <div className="space-y-4 my-4">
            {infos.map((info, index) => (
                <div key={index} className="bg-blue-200  p-4 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold mb-2">{info.title}</h2>
                    <p className="text-gray-700">{info.content}</p>
                </div>
            ))}
        </div>
    )
}