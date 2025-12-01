"use client";

import { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { WiresNode } from "../api/nodes/route";
import { getCachedData, setCachedData } from "../../utils/cache";
import { isThisAnalog, isThisDigital } from "../../utils/anaordig";

// LeafletコンポーネントをSSRなしで動的にインポート
const MapComponent = dynamic(() => import("@/components/MapComponent"), {
    ssr: false,
    loading: () => (
        <div className="h-[600px] w-full bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-xl text-gray-600">Loading map...</div>
        </div>
    ),
});

// 座標文字列をパース（例: "N:33 19' 57"" -> 33.3325）
function parseCoordinate(coord: string): number | null {
    try {
        const match = coord.match(/([NSEW]):(\d+)\s+(\d+)'\s+(\d+)/);
        if (!match) return null;

        const [, direction, degrees, minutes, seconds] = match;
        let decimal =
            parseInt(degrees) +
            parseInt(minutes) / 60 +
            parseInt(seconds) / 3600;

        if (direction === "S" || direction === "W") {
            decimal = -decimal;
        }

        return decimal;
    } catch {
        return null;
    }
}

// 2点間の距離を計算（Haversine式）
function calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    const R = 6371; // 地球の半径 (km)
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// 都市名から座標を取得（Nominatim APIでジオコーディング）
async function geocodeCity(
    city: string,
    state: string,
    country: string
): Promise<{ lat: number; lon: number } | null> {
    try {
        const query = `${city}, ${state}, ${country}`;
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                query
            )}&limit=1`,
            {
                headers: {
                    "User-Agent": "WIRES-X-Viewer/1.0",
                },
            }
        );

        if (!response.ok) return null;

        const data = await response.json();
        if (data.length > 0) {
            return {
                lat: parseFloat(data[0].lat),
                lon: parseFloat(data[0].lon),
            };
        }
        return null;
    } catch (error) {
        console.error("Geocoding error:", error);
        return null;
    }
}

interface UserLocation {
    lat: number;
    lon: number;
    city?: string;
    country?: string;
    source?: "gps" | "ip";
}

interface GeocodedCoordinates {
    [key: string]: { lat: number; lon: number } | null;
}

export default function MapPage() {
    const [nodes, setNodes] = useState<WiresNode[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedNode, setSelectedNode] = useState<WiresNode | null>(null);
    const [countryFilter, setCountryFilter] = useState("");
    const [typeFilter, setTypeFilter] = useState<string>(""); // "Digital", "Analog", ""
    const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
    const [locationLoading, setLocationLoading] = useState(true);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [distanceFilter, setDistanceFilter] = useState<number>(100); // km
    const itemsPerPage = 50;
    const [geocodedCoords, setGeocodedCoords] = useState<GeocodedCoordinates>(
        {}
    );
    const [geocodingProgress, setGeocodingProgress] = useState<number>(0);

    // GPS位置情報を取得
    const getGPSLocation = () => {
        setLocationLoading(true);
        setLocationError(null);

        if (!navigator.geolocation) {
            setLocationError("お使いのブラウザは位置情報に対応していません");
            setLocationLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;

                // 逆ジオコーディングで都市名を取得（オプション）
                try {
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                    );
                    const data = await response.json();

                    setUserLocation({
                        lat: latitude,
                        lon: longitude,
                        city:
                            data.address?.city ||
                            data.address?.town ||
                            data.address?.village,
                        country: data.address?.country,
                        source: "gps",
                    });
                } catch (err) {
                    console.error("Reverse geocoding failed:", err);
                    // 逆ジオコーディング失敗時も座標だけは設定
                    setUserLocation({
                        lat: latitude,
                        lon: longitude,
                        source: "gps",
                    });
                }
                setLocationLoading(false);
            },
            (err) => {
                console.error("GPS location error:", err);
                setLocationError(
                    err.code === 1
                        ? "位置情報の使用が拒否されました"
                        : err.code === 2
                        ? "位置情報を取得できませんでした"
                        : err.code === 3
                        ? "位置情報の取得がタイムアウトしました"
                        : "位置情報の取得に失敗しました"
                );
                setLocationLoading(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            }
        );
    };

    // IPジオロケーションで現在地を取得
    useEffect(() => {
        async function fetchUserLocation() {
            try {
                const response = await fetch("https://ipapi.co/json/");
                const data = await response.json();
                setUserLocation({
                    lat: data.latitude,
                    lon: data.longitude,
                    city: data.city,
                    country: data.country_name,
                    source: "ip",
                });
            } catch (err) {
                console.error("Failed to fetch user location:", err);
                setLocationError("IP位置情報の取得に失敗しました");
            } finally {
                setLocationLoading(false);
            }
        }
        fetchUserLocation();
    }, []);

    useEffect(() => {
        async function fetchNodes() {
            try {
                // キャッシュをチェック
                const cachedNodes = getCachedData<WiresNode[]>("wiresx_nodes");
                if (cachedNodes) {
                    console.log("Using cached nodes data");
                    setNodes(cachedNodes);
                    setLoading(false);
                    return;
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

    // ジオコーディングキャッシュをロード
    useEffect(() => {
        const cached = getCachedData<GeocodedCoordinates>(
            "wiresx_geocoded_coords"
        );
        if (cached) {
            console.log("Using cached geocoded coordinates");
            setGeocodedCoords(cached);
        }
    }, []);

    // 座標がないノードをジオコーディング
    useEffect(() => {
        if (nodes.length === 0) return;

        async function geocodeNodes() {
            const nodesToGeocode = nodes.filter((node) => {
                const lat = parseCoordinate(node.lat);
                const lon = parseCoordinate(node.lon);
                const key = `${node.city}-${node.state}-${node.country}`;
                return lat === null || (lon === null && !geocodedCoords[key]);
            });

            if (nodesToGeocode.length === 0) return;

            console.log(`Geocoding ${nodesToGeocode.length} nodes...`);
            const newCoords: GeocodedCoordinates = { ...geocodedCoords };
            let processed = 0;

            // バッチ処理（APIレート制限を考慮して1秒に1リクエスト）
            for (const node of nodesToGeocode.slice(0, 50)) {
                // 最初の50件のみ
                const key = `${node.city}-${node.state}-${node.country}`;
                if (newCoords[key] === undefined) {
                    const coords = await geocodeCity(
                        node.city,
                        node.state,
                        node.country
                    );
                    newCoords[key] = coords;
                    processed++;
                    setGeocodingProgress(
                        Math.round(
                            (processed / Math.min(nodesToGeocode.length, 50)) *
                                100
                        )
                    );
                    // レート制限対策で1秒待機
                    await new Promise((resolve) => setTimeout(resolve, 1000));
                }
            }

            setGeocodedCoords(newCoords);
            setCachedData("wiresx_geocoded_coords", newCoords);
            setGeocodingProgress(0);
            console.log(`Geocoding complete: ${processed} locations processed`);
        }

        geocodeNodes();
    }, [nodes]); // geocodedCoordsを依存配列から除外して無限ループを防ぐ

    const countries = Array.from(
        new Set(nodes.map((node) => node.country))
    ).sort();

    const filteredNodes = nodes.filter((node) => {
        const matchesCountry = !countryFilter || node.country === countryFilter;
        const matchesType = !typeFilter || node.ana_dig === typeFilter;
        return matchesCountry && matchesType;
    });

    // 座標がある有効なノードのみ（ジオコーディング結果も使用）
    const validNodes = useMemo(() => {
        return filteredNodes
            .map((node) => {
                let lat = parseCoordinate(node.lat);
                let lon = parseCoordinate(node.lon);

                // 座標がない場合はジオコーディング結果を使用
                if (lat === null || lon === null) {
                    const key = `${node.city}-${node.state}-${node.country}`;
                    const geocoded = geocodedCoords[key];
                    if (geocoded) {
                        lat = geocoded.lat;
                        lon = geocoded.lon;
                    }
                }

                if (lat !== null && lon !== null) {
                    return { node, lat, lon };
                }
                return null;
            })
            .filter(
                (
                    item
                ): item is {
                    distance: number;
                    node: WiresNode;
                    lat: number;
                    lon: number;
                } => item !== null
            );
    }, [filteredNodes, geocodedCoords]);

    // 現在地から近い順にソート
    const nearbyNodes = useMemo(() => {
        if (!userLocation) return validNodes;

        return [...validNodes]
            .map((item) => ({
                ...item,
                distance: calculateDistance(
                    userLocation.lat,
                    userLocation.lon,
                    item.lat,
                    item.lon
                ),
            }))
            .sort((a, b) => a.distance - b.distance);
    }, [validNodes, userLocation]);

    // 距離フィルター適用後のノード（地図表示用）
    const mapNodes = useMemo(() => {
        if (!userLocation) {
            // 現在地がない場合は最初の100件のみ表示
            return validNodes.slice(0, 100);
        }
        // 指定距離内のノードのみ
        return nearbyNodes.filter((item) => item.distance <= distanceFilter);
    }, [nearbyNodes, validNodes, userLocation, distanceFilter]);

    // 地図の中心座標（現在地がある場合はそれを使用）
    const mapCenter = useMemo(() => {
        if (userLocation) {
            return { lat: userLocation.lat, lon: userLocation.lon };
        }
        if (validNodes.length > 0) {
            const centerLat =
                validNodes.reduce((sum, n) => sum + n.lat, 0) /
                validNodes.length;
            const centerLon =
                validNodes.reduce((sum, n) => sum + n.lon, 0) /
                validNodes.length;
            return { lat: centerLat, lon: centerLon };
        }
        return { lat: 35.6762, lon: 139.6503 }; // デフォルト（東京）
    }, [validNodes, userLocation]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl">Loading map...</div>
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
            <h1 className="text-3xl font-bold mb-6">WIRES-X Node Map</h1>

            <div className="mb-6 flex flex-wrap gap-4 items-center">
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

                {userLocation && (
                    <select
                        value={distanceFilter}
                        onChange={(e) =>
                            setDistanceFilter(Number(e.target.value))
                        }
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value={50}>Within 50km</option>
                        <option value={100}>Within 100km</option>
                        <option value={200}>Within 200km</option>
                        <option value={500}>Within 500km</option>
                        <option value={1000}>Within 1000km</option>
                        <option value={10000}>All Distances</option>
                    </select>
                )}

                {/* GPS位置情報取得ボタン */}
                <button
                    onClick={getGPSLocation}
                    disabled={locationLoading}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    <span>📍</span>
                    <span>
                        {locationLoading ? "取得中..." : "GPS位置を取得"}
                    </span>
                </button>

                <span className="text-gray-600">
                    Map: {mapNodes.length} / Total: {validNodes.length} nodes
                </span>
                {userLocation && (
                    <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg">
                        <span className="text-blue-700">
                            {userLocation.source === "gps" ? "🎯" : "🌐"}
                        </span>
                        <span className="text-sm text-blue-900">
                            {userLocation.source === "gps" ? "GPS" : "IP"}:{" "}
                            {userLocation.city && `${userLocation.city}, `}
                            {userLocation.country ||
                                `${userLocation.lat.toFixed(
                                    4
                                )}, ${userLocation.lon.toFixed(4)}`}
                        </span>
                    </div>
                )}
                {locationError && (
                    <div className="flex items-center gap-2 bg-red-50 px-4 py-2 rounded-lg">
                        <span className="text-red-700">⚠️</span>
                        <span className="text-sm text-red-900">
                            {locationError}
                        </span>
                    </div>
                )}
                {geocodingProgress > 0 && (
                    <div className="flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-lg">
                        <span className="text-yellow-700">🌍</span>
                        <span className="text-sm text-yellow-900">
                            都市名から座標を取得中... {geocodingProgress}%
                        </span>
                    </div>
                )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">
                    <strong>Info:</strong>{" "}
                    地図上のマーカーをクリックすると、ノード局の詳細情報が表示されます。
                    {userLocation
                        ? userLocation.source === "gps"
                            ? "GPS位置情報を使用して正確な距離を計算しています。"
                            : "IP位置情報を使用しています。より正確な位置を取得するには「GPS位置を取得」ボタンをクリックしてください。"
                        : "地図には最初の100件のみ表示されます。"}
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="lg:col-span-2">
                    <MapComponent
                        key={`map-${userLocation?.source}-${userLocation?.lat}-${userLocation?.lon}`}
                        nodes={mapNodes}
                        center={mapCenter}
                        userLocation={userLocation}
                    />
                </div>

                <div className="lg:col-span-1 h-[600px]">
                    <div className="bg-white rounded-lg shadow-md p-4 sticky top-4">
                        <h2 className="text-xl font-bold mb-4">
                            {userLocation ? "Nearby Nodes" : "All Nodes"}
                        </h2>
                        <div className="space-y-3 max-h-[600px] overflow-y-auto">
                            {nearbyNodes.slice(0, 20).map((item, index) => (
                                <div
                                    key={index}
                                    className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer hover:bg-gray-50"
                                    onClick={() => setSelectedNode(item.node)}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex flex-row items-center gap-3">
                                            <h3 className="font-bold text-base">
                                                {item.node.call_sign}
                                            </h3>
                                            <span
                                                className={`px-2 py-1 rounded text-xs ${
                                                    isThisDigital(
                                                        item.node.ana_dig
                                                    )
                                                        ? "bg-blue-100 text-blue-800"
                                                        : isThisAnalog(
                                                              item.node.ana_dig
                                                          )
                                                        ? "bg-red-100 text-red-800"
                                                        : "bg-green-100 text-green-800"
                                                }`}
                                            >
                                                {item.node.ana_dig}
                                            </span>
                                        </div>
                                        {userLocation && (
                                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                {item.distance.toFixed(0)} km
                                            </span>
                                        )}
                                    </div>
                                    <div className="space-y-1 text-xs text-gray-600">
                                        <p>
                                            <span className="font-semibold">
                                                ID:
                                            </span>{" "}
                                            {item.node.dtmf_id}
                                        </p>
                                        <p>
                                            <span className="font-semibold">
                                                Location:
                                            </span>{" "}
                                            {item.node.city},{" "}
                                            {item.node.country}
                                        </p>
                                        <p>
                                            <span className="font-semibold">
                                                Freq:
                                            </span>{" "}
                                            {item.node.freq}
                                            <span>SQL: {item.node.sql}</span>
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {selectedNode && (
                <div
                    className="fixed inset-0 bg-[rgba(0,0,0,0.5)] bg-opacity-50 flex items-center justify-center p-4 z-1000"
                    onClick={() => setSelectedNode(null)}
                >
                    <div
                        className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <h2 className="text-2xl font-bold">
                                {selectedNode.call_sign}
                            </h2>
                            <button
                                onClick={() => setSelectedNode(null)}
                                className="text-gray-500 hover:text-gray-700 text-2xl"
                            >
                                ×
                            </button>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <span className="font-semibold">Node ID:</span>{" "}
                                {selectedNode.id}
                            </div>
                            <div>
                                <span className="font-semibold">DTMF ID:</span>{" "}
                                {selectedNode.dtmf_id}
                            </div>
                            <div>
                                <span className="font-semibold">Type:</span>{" "}
                                <span
                                    className={`px-2 py-1 rounded text-xs ${
                                        selectedNode.ana_dig === "Digital"
                                            ? "bg-blue-100 text-blue-800"
                                            : "bg-green-100 text-green-800"
                                    }`}
                                >
                                    {selectedNode.ana_dig}
                                </span>
                            </div>
                            <div>
                                <span className="font-semibold">Location:</span>{" "}
                                {selectedNode.city}, {selectedNode.state},{" "}
                                {selectedNode.country}
                            </div>
                            <div>
                                <span className="font-semibold">
                                    Frequency:
                                </span>{" "}
                                {selectedNode.freq}
                            </div>
                            <div>
                                <span className="font-semibold">SQL:</span>{" "}
                                {selectedNode.sql}
                            </div>
                            <div>
                                <span className="font-semibold">
                                    Coordinates:
                                </span>
                                <br />
                                Lat: {selectedNode.lat}
                                <br />
                                Lon: {selectedNode.lon}
                            </div>
                            {selectedNode.comment && (
                                <div>
                                    <span className="font-semibold">
                                        Comment:
                                    </span>
                                    <br />
                                    <p className="mt-1 text-gray-700">
                                        {selectedNode.comment}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
