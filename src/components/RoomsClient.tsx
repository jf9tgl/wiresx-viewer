"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { WiresRoom } from "@/app/api/rooms/route";
import { useWiresData } from "@/utils/useWiresData";
import Infomation from "./Infomation";

export default function RoomsPage() {
    const { data: rooms, loading, error } = useWiresData<WiresRoom>(
        "wiresx_rooms",
        "/api/rooms"
    );
    const [searchTerm, setSearchTerm] = useState("");
    const [countryFilter, setCountryFilter] = useState("");
    const [sortBy, setSortBy] = useState<"active" | "name" | "none">("active");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 50;

    // 入力中は古い検索語で描画を続け、入力を優先する
    const deferredSearch = useDeferredValue(searchTerm);

    const countries = useMemo(
        () => Array.from(new Set(rooms.map((room) => room.country))).sort(),
        [rooms]
    );

    // 検索対象の文字列を、データ取得時に1度だけ小文字化しておく
    const searchIndex = useMemo(
        () =>
            rooms.map((room) => ({
                room,
                haystack: [
                    room.room_name,
                    room.city,
                    room.state,
                    room.country,
                    room.id,
                    room.comment,
                ]
                    .join("\n")
                    .toLowerCase(),
            })),
        [rooms]
    );

    const sortedRooms = useMemo(() => {
        const query = deferredSearch.toLowerCase();
        const filtered = searchIndex
            .filter(({ room, haystack }) => {
                const matchesSearch =
                    !query ||
                    haystack.includes(query) ||
                    room.dtmf.includes(deferredSearch);
                const matchesCountry =
                    !countryFilter || room.country === countryFilter;
                return matchesSearch && matchesCountry;
            })
            .map(({ room }) => room);

        // ソート処理（filter 済みの新しい配列なので、そのまま並べ替えてよい）
        if (sortBy === "active") {
            // アクティブ数で降順ソート（数値として比較）
            return filtered.sort(
                (a, b) => (parseInt(b.act) || 0) - (parseInt(a.act) || 0)
            );
        }
        if (sortBy === "name") {
            // ルーム名でアルファベット順
            return filtered.sort((a, b) =>
                a.room_name.localeCompare(b.room_name)
            );
        }
        return filtered; // ソートなし
    }, [searchIndex, deferredSearch, countryFilter, sortBy]);

    // ページネーション（データ更新で総ページ数が減っても範囲内に収める）
    const totalPages = Math.ceil(sortedRooms.length / itemsPerPage);
    const page = Math.min(currentPage, Math.max(1, totalPages));
    const paginatedRooms = sortedRooms.slice(
        (page - 1) * itemsPerPage,
        page * itemsPerPage
    );

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">WIRES-X Active Rooms</h1>

            {error && (
                <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
                    Error: {error}
                </div>
            )}

            <Infomation />

            <div className="mb-6 flex gap-4 flex-wrap">
                <input
                    type="text"
                    placeholder="Search by Room Name, City, ID..."
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                    }}
                    className="flex-1 min-w-[200px] px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                    value={countryFilter}
                    onChange={(e) => {
                        setCountryFilter(e.target.value);
                        setCurrentPage(1);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">All Countries</option>
                    {countries.map((country) => (
                        <option key={country} value={country}>
                            {country}
                        </option>
                    ))}
                </select>
                <select
                    value={sortBy}
                    onChange={(e) => {
                        setSortBy(e.target.value as "active" | "name" | "none");
                        setCurrentPage(1);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="none">No Sort</option>
                    <option value="active">Active Count (High to Low)</option>
                    <option value="name">Room Name (A-Z)</option>
                </select>
            </div>

            <div className="mb-4 text-gray-600">
                {loading ? (
                    "Loading rooms..."
                ) : (
                    <>
                        Showing {paginatedRooms.length} of {sortedRooms.length}{" "}
                        rooms
                        {sortedRooms.length !== rooms.length &&
                            ` (filtered from ${rooms.length} total)`}
                    </>
                )}
            </div>

            {/* ページネーション */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-2 mb-4">
                    <button
                        onClick={() => setCurrentPage(1)}
                        disabled={page === 1}
                        className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                    >
                        最初
                    </button>
                    <button
                        onClick={() =>
                            setCurrentPage(Math.max(1, page - 1))
                        }
                        disabled={page === 1}
                        className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                    >
                        前へ
                    </button>
                    <span className="px-4 py-1 flex items-center">
                        {page} / {totalPages}
                    </span>
                    <button
                        onClick={() =>
                            setCurrentPage(Math.min(totalPages, page + 1))
                        }
                        disabled={page === totalPages}
                        className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                    >
                        次へ
                    </button>
                    <button
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={page === totalPages}
                        className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                    >
                        最後
                    </button>
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-300 shadow-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-4 py-2 border-b text-left">
                                Room Name
                            </th>
                            <th className="px-4 py-2 border-b text-left">
                                Room ID
                            </th>
                            <th className="px-4 py-2 border-b text-left">
                                DTMF
                            </th>
                            <th className="px-4 py-2 border-b text-left">
                                Active
                            </th>
                            <th className="px-4 py-2 border-b text-left">
                                Location
                            </th>
                            <th className="px-4 py-2 border-b text-left">
                                Comment
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && (
                            <tr>
                                <td
                                    colSpan={6}
                                    className="px-4 py-8 text-center text-gray-600"
                                >
                                    Loading rooms...
                                </td>
                            </tr>
                        )}
                        {paginatedRooms.map((room, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                                <td className="px-4 py-2 border-b font-semibold">
                                    {room.room_name}
                                </td>
                                <td className="px-4 py-2 border-b font-mono text-sm">
                                    {room.id}
                                </td>
                                <td className="px-4 py-2 border-b font-mono">
                                    {room.dtmf}
                                </td>
                                <td className="px-4 py-2 border-b">
                                    <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800">
                                        {room.act}
                                    </span>
                                </td>
                                <td className="px-4 py-2 border-b">
                                    <div className="text-sm">
                                        <div>{room.city}</div>
                                        <div className="text-gray-600">
                                            {room.state}, {room.country}
                                        </div>
                                    </div>
                                </td>
                                <td
                                    className="px-4 py-2 border-b text-sm max-w-xs truncate"
                                    title={room.comment}
                                >
                                    {room.comment}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ページネーション */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                    <button
                        onClick={() => setCurrentPage(1)}
                        disabled={page === 1}
                        className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                    >
                        最初
                    </button>
                    <button
                        onClick={() =>
                            setCurrentPage(Math.max(1, page - 1))
                        }
                        disabled={page === 1}
                        className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                    >
                        前へ
                    </button>
                    <span className="px-4 py-1 flex items-center">
                        {page} / {totalPages}
                    </span>
                    <button
                        onClick={() =>
                            setCurrentPage(Math.min(totalPages, page + 1))
                        }
                        disabled={page === totalPages}
                        className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                    >
                        次へ
                    </button>
                    <button
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={page === totalPages}
                        className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                    >
                        最後
                    </button>
                </div>
            )}
        </div>
    );
}
