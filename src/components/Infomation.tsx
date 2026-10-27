export default function Infomation() {
    type Info = {
        title: string;
        content: string;
    };

    const infos: Info[] = [
        {
            title: "おしらせ",
            content: "現在公式サイトがセキュリティ問題の対処のため停止しているため、このサイトも一時的に利用できません。公式サイトの復旧を待ってください。",
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