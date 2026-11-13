"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { WiresNode } from "@/app/api/nodes/route";
import { useWiresData } from "@/utils/useWiresData";
import { isThisAnalog, isThisDigital } from "@/utils/anaordig";
import Infomation from "./Infomation";

export default function NodesPage() {
    const { data: nodes, loading, error } = useWiresData<WiresNode>(
        "wiresx_nodes",
        "/api/nodes"
    );
    const [searchTerm, setSearchTerm] = useState("");
    const [countryFilter, setCountryFilter] = useState("");
    const [typeFilter, setTypeFilter] = useState<string>(""); // "Digital", "Analog", ""
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 50;

    // 入力中は古い検索語で描画を続け、入力を優先する
    const deferredSearch = useDeferredValue(searchTerm);

    const countries = useMemo(
        () => Array.from(new Set(nodes.map((node) => node.country))).sort(),
        [nodes]
    );

    // 検索対象の文字列を、データ取得時に1度だけ小文字化しておく
    const searchIndex = useMemo(
        () =>
            nodes.map((node) => ({
                node,
                haystack: [
                    node.call_sign,
                    node.city,
                    node.state,
                    node.country,
                    node.id,
                ]
                    .join("\n")
                    .toLowerCase(),
            })),
        [nodes]
    );

    const filteredNodes = useMemo(() => {
        const query = deferredSearch.toLowerCase();
        return searchIndex
            .filter(({ node, haystack }) => {
                const matchesSearch =
                    !query ||
                    haystack.includes(query) ||
                    node.dtmf_id.includes(deferredSearch);
                const matchesCountry =
                    !countryFilter || node.country === countryFilter;
                const matchesType = !typeFilter || node.ana_dig === typeFilter;
                return matchesSearch && matchesCountry && matchesType;
            })
            .map(({ node }) => node);
    }, [searchIndex, deferredSearch, countryFilter, typeFilter]);

    // ページネーション（データ更新で総ページ数が減っても範囲内に収める）
    const totalPages = Math.ceil(filteredNodes.length / itemsPerPage);
    const page = Math.min(currentPage, Math.max(1, totalPages));
    const paginatedNodes = filteredNodes.slice(
        (page - 1) * itemsPerPage,
        page * itemsPerPage
    );

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">WIRES-X Node Stations</h1>

            {error && (
                <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
                    Error: {error}
                </div>
            )}

            <Infomation />

            <div className="mb-6 flex gap-4 flex-wrap">
                <input
                    type="text"
                    placeholder="Search by Call Sign, City, ID..."
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
                    value={typeFilter}
                    onChange={(e) => {
                        setTypeFilter(e.target.value);
                        setCurrentPage(1);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">All Types</option>
                    <option value="Digital">Digital</option>
                    <option value="Analog">Analog</option>
                </select>
            </div>
            <div className="mb-4 text-gray-600">
                {loading ? (
                    "Loading nodes..."
                ) : (
                    <>
                        Showing {paginatedNodes.length} of{" "}
                        {filteredNodes.length} nodes
                        {filteredNodes.length !== nodes.length &&
                            ` (filtered from ${nodes.length} total)`}
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
                        {loading && (
                            <tr>
                                <td
                                    colSpan={8}
                                    className="px-4 py-8 text-center text-gray-600"
                                >
                                    Loading nodes...
                                </td>
                            </tr>
                        )}
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
