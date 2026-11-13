export default function Infomation() {
    type Info = {
        title: string;
        content: string;
    };

    const infos: Info[] = [
        {
            title: "おしらせ",
            content: "現在公式サイトがセキュリティ問題の対処のため停止しています。過去のデータを使用しているためデータが古い可能性がありますご注意ください。",
        }
    ]

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