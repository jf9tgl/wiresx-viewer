"use client";

import { useEffect, useState } from "react";
import { WiresRoom } from "../api/rooms/route";
import { getCachedData, setCachedData } from "../../utils/cache";

export default function RoomsPage() {
    const [rooms, setRooms] = useState<WiresRoom[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [countryFilter, setCountryFilter] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 50;

    useEffect(() => {
        async function fetchRooms() {
            try {
                // キャッシュをチェック
                const cachedRooms = getCachedData<WiresRoom[]>("wiresx_rooms");
                if (cachedRooms) {
                    // データが中身がない場合は再取得
                    if (cachedRooms.length === 0) {
                        console.log("Cached rooms data is empty, refetching");
                    } else {
                        console.log("Using cached rooms data");
                        setRooms(cachedRooms);
                        setLoading(false);
                        return;
                    }
                }

                // キャッシュがない場合はAPIから取得
                console.log("Fetching rooms from API");
                const response = await fetch("/api/rooms");
                if (!response.ok) throw new Error("Failed to fetch rooms");
                const data = await response.json();
                setRooms(data);

                // データをキャッシュ
                setCachedData("wiresx_rooms", data);
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : "An error occurred"
                );
            } finally {
                setLoading(false);
            }
        }
        fetchRooms();
    }, []);

    const countries = Array.from(
        new Set(rooms.map((room) => room.country))
    ).sort();

    const filteredRooms = rooms.filter((room) => {
        const matchesSearch =
            room.room_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            room.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
            room.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            room.dtmf.includes(searchTerm);
        const matchesCountry = !countryFilter || room.country === countryFilter;
        return matchesSearch && matchesCountry;
    });

    // ページネーション
    const totalPages = Math.ceil(filteredRooms.length / itemsPerPage);
    const paginatedRooms = filteredRooms.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // フィルター変更時にページをリセット
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, countryFilter]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl">Loading rooms...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl text-red-600">Error: {error}</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">WIRES-X Active Rooms</h1>

            <div className="mb-6 flex gap-4 flex-wrap">
                <input
                    type="text"
                    placeholder="Search by Room Name, City, ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 min-w-[200px] px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                    value={countryFilter}
                    onChange={(e) => setCountryFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">All Countries</option>
                    {countries.map((country) => (
                        <option key={country} value={country}>
                            {country}
                        </option>
                    ))}
                </select>
            </div>

            <div className="mb-4 text-gray-600">
                Showing {paginatedRooms.length} of {filteredRooms.length} rooms
                {filteredRooms.length !== rooms.length &&
                    ` (filtered from ${rooms.length} total)`}
            </div>

            {/* ページネーション */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-2 mb-4">
                    <button
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                    >
                        最初
                    </button>
                    <button
                        onClick={() =>
                            setCurrentPage((p) => Math.max(1, p - 1))
                        }
                        disabled={currentPage === 1}
                        className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                    >
                        前へ
                    </button>
                    <span className="px-4 py-1 flex items-center">
                        {currentPage} / {totalPages}
                    </span>
                    <button
                        onClick={() =>
                            setCurrentPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                    >
                        次へ
                    </button>
                    <button
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
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
        </div>
    );
}
