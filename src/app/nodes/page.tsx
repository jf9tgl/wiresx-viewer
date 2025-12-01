"use client";

import { useEffect, useState } from "react";
import { WiresNode } from "../api/nodes/route";
import { getCachedData, setCachedData } from "../../utils/cache";
import { isThisAnalog, isThisDigital } from "../../utils/anaordig";

export default function NodesPage() {
    const [nodes, setNodes] = useState<WiresNode[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [countryFilter, setCountryFilter] = useState("");
    const [typeFilter, setTypeFilter] = useState<string>(""); // "Digital", "Analog", ""
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 50;

    useEffect(() => {
        async function fetchNodes() {
            try {
                // キャッシュをチェック
                const cachedNodes = getCachedData<WiresNode[]>("wiresx_nodes");
                if (cachedNodes) {
                    // データが中身がない場合は再取得
                    if (cachedNodes.length === 0) {
                        console.log("Cached nodes data is empty, refetching");
                    } else {
                        console.log("Using cached nodes data");
                        setNodes(cachedNodes);
                        setLoading(false);
                        return;
                    }
                }

                // キャッシュがない場合はAPIから取得
                console.log("Fetching nodes from API");
                const response = await fetch("/api/nodes");
                if (!response.ok) throw new Error("Failed to fetch nodes");
                const data = await response.json();
                setNodes(data);

                // データをキャッシュ
                setCachedData("wiresx_nodes", data);
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : "An error occurred"
                );
            } finally {
                setLoading(false);
            }
        }
        fetchNodes();
    }, []);

    const countries = Array.from(
        new Set(nodes.map((node) => node.country))
    ).sort();

    const filteredNodes = nodes.filter((node) => {
        const matchesSearch =
            node.call_sign.toLowerCase().includes(searchTerm.toLowerCase()) ||
            node.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
            node.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            node.dtmf_id.includes(searchTerm);
        const matchesCountry = !countryFilter || node.country === countryFilter;
        const matchesType = !typeFilter || node.ana_dig === typeFilter;
        return matchesSearch && matchesCountry && matchesType;
    });

    // ページネーション
    const totalPages = Math.ceil(filteredNodes.length / itemsPerPage);
    const paginatedNodes = filteredNodes.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // フィルター変更時にページをリセット
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, countryFilter, typeFilter]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl">Loading nodes...</div>
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
            <h1 className="text-3xl font-bold mb-6">WIRES-X Node Stations</h1>

            <div className="mb-6 flex gap-4 flex-wrap">
                <input
                    type="text"
                    placeholder="Search by Call Sign, City, ID..."
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
                <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">All Types</option>
                    <option value="Digital">🔵 Digital</option>
                    <option value="Analog">🟢 Analog</option>
                </select>
            </div>

            <div className="mb-4 text-gray-600">
                Showing {paginatedNodes.length} of {filteredNodes.length} nodes
                {filteredNodes.length !== nodes.length &&
                    ` (filtered from ${nodes.length} total)`}
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
                                Call Sign
                            </th>
                            <th className="px-4 py-2 border-b text-left">
                                Node ID
                            </th>
                            <th className="px-4 py-2 border-b text-left">
                                DTMF ID
                            </th>
                            <th className="px-4 py-2 border-b text-left">
                                Type
                            </th>
                            <th className="px-4 py-2 border-b text-left">
                                Location
                            </th>
                            <th className="px-4 py-2 border-b text-left">
                                Frequency
                            </th>
                            <th className="px-4 py-2 border-b text-left">
                                SQL
                            </th>
                            <th className="px-4 py-2 border-b text-left">
                                Comment
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedNodes.map((node, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                                <td className="px-4 py-2 border-b font-mono font-semibold">
                                    {node.call_sign}
                                </td>
                                <td className="px-4 py-2 border-b font-mono text-sm">
                                    {node.id}
                                </td>
                                <td className="px-4 py-2 border-b font-mono">
                                    {node.dtmf_id}
                                </td>
                                <td className="px-4 py-2 border-b">
                                    <span
                                        className={`px-2 py-1 rounded text-xs ${
                                            isThisDigital(node.ana_dig)
                                                ? "bg-blue-100 text-blue-800"
                                                : isThisAnalog(node.ana_dig)
                                                ? "bg-red-100 text-red-800"
                                                : "bg-green-100 text-green-800"
                                        }`}
                                    >
                                        {node.ana_dig}
                                    </span>
                                </td>
                                <td className="px-4 py-2 border-b">
                                    <div className="text-sm">
                                        <div>{node.city}</div>
                                        <div className="text-gray-600">
                                            {node.state}, {node.country}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-2 border-b font-mono text-sm">
                                    {node.freq}
                                </td>
                                <td className="px-4 py-2 border-b font-mono text-sm">
                                    {node.sql}
                                </td>
                                <td
                                    className="px-4 py-2 border-b text-sm max-w-xs truncate"
                                    title={node.comment}
                                >
                                    {node.comment}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
