"use client";

import dynamic from "next/dynamic";

const DynamicMap = dynamic(() => import("./Map"), {
  ssr: false,
  loading: () => (
    <div style={{ 
      width: "100%", height: "100%", 
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(255,255,255,0.02)", color: "rgba(255,255,255,0.4)",
      fontSize: 13
    }}>
      Loading map...
    </div>
  )
});

interface WeatherMapProps {
  latitude: number;
  longitude: number;
  locationName: string;
}

export default function WeatherMap({ latitude, longitude, locationName }: WeatherMapProps) {
  return (
    <div style={{ 
      width: "100%", height: 200, 
      borderRadius: 16, overflow: "hidden",
      border: "1px solid rgba(255,255,255,0.1)",
      marginTop: 20
    }}>
      <DynamicMap latitude={latitude} longitude={longitude} locationName={locationName} />
    </div>
  );
}
