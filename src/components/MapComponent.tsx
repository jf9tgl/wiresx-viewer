"use client";

import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import { WiresNode } from "@/app/api/nodes/route";
import { analogOrDigital } from "../utils/anaordig";
import { memo, useEffect, useState } from "react";

const digitalIcon = L.icon({
    iconUrl: "/assets/map/digital-pin.png",
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
});

const analogIcon = L.icon({
    iconUrl: "/assets/map/analog-pin.png",
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
});

const approximateIcon = L.divIcon({
    className: "",
    html: '<div style="width:30px;height:30px;border-radius:50%;background:#f59e0b;border:3px solid white;box-shadow:0 1px 5px #666;color:white;font-weight:bold;text-align:center;line-height:24px;font-size:20px">?</div>',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
});

// ユーザー位置用のアイコン
const userIcon = L.icon({
    iconUrl:
        "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

interface MapComponentProps {
    nodes: Array<{
        node: WiresNode;
        lat: number;
        lon: number;
        approx?: boolean;
    }>;
    center?: { lat: number; lon: number };
    userLocation?: {
        lat: number;
        lon: number;
        city?: string;
        country?: string;
    } | null;
}

function MapInner({ nodes, center, userLocation }: MapComponentProps) {
    // 中心座標を計算
    const mapCenter = center || {
        lat:
            nodes.length > 0
                ? nodes.reduce((sum, n) => sum + n.lat, 0) / nodes.length
                : 35.6762,
        lon:
            nodes.length > 0
                ? nodes.reduce((sum, n) => sum + n.lon, 0) / nodes.length
                : 139.6503,
    };

    // ズームレベルを決定
    const zoom = userLocation ? 8 : nodes.length === 1 ? 10 : 5;

    return (
        <MapContainer
            center={[mapCenter.lat, mapCenter.lon]}
            zoom={zoom}
            style={{ height: "600px", width: "100%" }}
            className="rounded-lg shadow-lg"
            scrollWheelZoom={true}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                maxZoom={19}
                subdomains={["a", "b", "c"]}
            />

            {/* ユーザーの現在地マーカー */}
            {userLocation && (
                <>
                    <Marker
                        position={[userLocation.lat, userLocation.lon]}
                        icon={userIcon}
                    >
                        <Popup>
                            <div className="p-2">
                                <h3 className="font-bold text-lg mb-1">
                                    Your Location
                                </h3>
                                <p className="text-sm">
                                    {userLocation.city &&
                                        `${userLocation.city}, `}
                                    {userLocation.country}
                                </p>
                            </div>
                        </Popup>
                    </Marker>
                    {/* 50km圏内を示す円 */}
                    <Circle
                        center={[userLocation.lat, userLocation.lon]}
                        radius={50000}
                        pathOptions={{
                            color: "blue",
                            fillColor: "blue",
                            fillOpacity: 0.1,
                        }}
                    />
                </>
            )}

            {/* ノード局マーカー */}
            {nodes.map((item, index) => (
                <Marker
                    key={`${item.node.dtmf_id}-${item.node.call_sign}-${index}`}
                    position={[item.lat, item.lon]}
                    icon={
                        item.approx
                            ? approximateIcon
                            : analogOrDigital(item.node.ana_dig) === "Digital"
                            ? digitalIcon
                            : analogIcon
                    }
                >
                    <Popup>
                        <div className="p-2">
                            <h3 className="font-bold text-lg mb-2">
                                {item.node.call_sign}
                            </h3>
                            <div className="space-y-1 text-sm">
                                <p>
                                    <strong>Node ID:</strong> {item.node.id}
                                </p>
                                <p>
                                    <strong>DTMF ID:</strong>{" "}
                                    {item.node.dtmf_id}
                                </p>
                                <p>
                                    <strong>Type:</strong>{" "}
                                    <span
                                        className={`px-2 py-1 rounded text-xs ${
                                            item.node.ana_dig === "Digital"
                                                ? "bg-blue-100 text-blue-800"
                                                : "bg-green-100 text-green-800"
                                        }`}
                                    >
                                        {item.node.ana_dig}
                                    </span>
                                </p>
                                <p>
                                    <strong>Location:</strong> {item.node.city},{" "}
                                    {item.node.state}, {item.node.country}
                                </p>
                                {item.approx && (
                                    <p className="font-semibold text-amber-700">
                                        概略位置（市区町村レベル）
                                    </p>
                                )}
                                <p>
                                    <strong>Frequency:</strong> {item.node.freq}
                                </p>
                                <p>
                                    <strong>SQL:</strong> {item.node.sql}
                                </p>
                                {item.node.comment && (
                                    <p className="mt-2 text-xs text-gray-600 italic">
                                        {item.node.comment}
                                    </p>
                                )}
                            </div>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}

/**
 * 画面が表示されている間だけ地図（Leaflet）を作る。
 *
 * cacheComponents が有効だと、遷移した画面は破棄されず非表示のまま保持され、
 * 戻ったときに effect だけが再実行される。このとき Leaflet の地図は非表示になる際に
 * 破棄済みなので、そのまま再利用すると "Map container is being reused" などで落ちる。
 * effect の開始・終了に合わせて地図を作り直すことで、これを避ける。
 */
function MapComponent(props: MapComponentProps) {
    const [active, setActive] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- effect の開始と終了に合わせて地図を作り直すため
        setActive(true);
        return () => setActive(false);
    }, []);

    if (!active) {
        return (
            <div
                className="rounded-lg bg-gray-100"
                style={{ height: "600px", width: "100%" }}
            />
        );
    }

    return <MapInner {...props} />;
}

export default memo(MapComponent);
