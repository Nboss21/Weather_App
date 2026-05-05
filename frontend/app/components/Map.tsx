"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix missing default icon in Leaflet + Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

function MapUpdater({ lat, lon }: { lat: number; lon: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lon], map.getZoom());
  }, [lat, lon, map]);
  return null;
}

interface MapProps {
  latitude: number;
  longitude: number;
  locationName: string;
}

export default function Map({ latitude, longitude, locationName }: MapProps) {
  return (
    <div style={{ height: "100%", width: "100%", borderRadius: "inherit", overflow: "hidden" }}>
      <MapContainer
        center={[latitude, longitude]}
        zoom={10}
        style={{ height: "100%", width: "100%", background: "#0b1120" }}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <Marker position={[latitude, longitude]}>
          <Popup>
            <div style={{ color: "#333", fontWeight: "bold" }}>{locationName}</div>
          </Popup>
        </Marker>
        <MapUpdater lat={latitude} lon={longitude} />
      </MapContainer>
    </div>
  );
}
