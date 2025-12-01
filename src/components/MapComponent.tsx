"use client";

import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import { WiresNode } from "@/app/api/nodes/route";
import { analogOrDigital } from "../utils/anaordig";

// Leafletのデフォルトアイコンの問題を修正
const icon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

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
    }>;
    center?: { lat: number; lon: number };
    userLocation?: {
        lat: number;
        lon: number;
        city?: string;
        country?: string;
    } | null;
}

export default function MapComponent({
    nodes,
    center,
    userLocation,
}: MapComponentProps) {
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
                        analogOrDigital(item.node.ana_dig) === "Digital"
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
