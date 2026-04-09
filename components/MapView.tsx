"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface MapItem {
  id: string;
  name: string;
  lat: number;
  lng: number;
  category: string;
  suburb: string;
}

export default function MapView({
  items,
  type,
}: {
  items: MapItem[];
  type: "listings" | "events";
}) {
  const validItems = items.filter((i) => i.lat && i.lng);

  useEffect(() => {
    window.dispatchEvent(new Event("resize"));
  }, []);

  if (validItems.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">🗺️</div>
        <p className="font-bold text-[var(--color-text-strong)]">No map data available</p>
        <p className="text-gray-500 text-sm mt-1">
          These items don&apos;t have location coordinates
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl overflow-hidden border border-[var(--color-muted-surface)]">
      <MapContainer
        center={[-37.8136, 144.9631]}
        zoom={10}
        className="h-[calc(100vh-180px)] w-full"
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {validItems.map((item) => (
          <Marker key={item.id} position={[item.lat, item.lng]}>
            <Popup>
              <div className="text-sm">
                <p className="font-bold text-[var(--color-text-strong)]">{item.name}</p>
                <p className="text-gray-500 text-xs">📍 {item.suburb}</p>
                {type === "listings" ? (
                  <a
                    href={`/listing/${item.id}`}
                    className="text-xs font-semibold text-[var(--color-primary)] hover:underline"
                  >
                    View →
                  </a>
                ) : (
                  <span className="text-xs text-gray-400">{item.category}</span>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
