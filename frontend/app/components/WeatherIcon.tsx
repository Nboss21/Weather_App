import React from "react";
import { IconType } from "../lib/weatherCodes";

const icons: Record<IconType, React.JSX.Element> = {
  sunny: (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      <circle cx="40" cy="40" r="16" fill="#fbbf24" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
        <line
          key={i}
          x1="40"
          y1="6"
          x2="40"
          y2="15"
          stroke="#fbbf24"
          strokeWidth="4"
          strokeLinecap="round"
          transform={`rotate(${deg} 40 40)`}
        />
      ))}
    </svg>
  ),
  "partly-cloudy": (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      <circle cx="34" cy="30" r="12" fill="#fbbf24" />
      {[0, 60, 120, 180, 240, 300].map((deg, i) => (
        <line
          key={i}
          x1="34"
          y1="10"
          x2="34"
          y2="17"
          stroke="#fbbf24"
          strokeWidth="3"
          strokeLinecap="round"
          transform={`rotate(${deg} 34 30)`}
        />
      ))}
      <path
        d="M20 55 Q20 40 33 40 Q36 32 46 34 Q54 34 56 42 Q64 42 64 52 Q64 60 56 60 H24 Q20 60 20 55Z"
        fill="white"
        fillOpacity="0.95"
      />
    </svg>
  ),
  cloudy: (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      <path
        d="M14 52 Q14 36 28 36 Q32 26 44 28 Q54 28 56 38 Q66 38 66 50 Q66 60 56 60 H22 Q14 60 14 52Z"
        fill="white"
        fillOpacity="0.9"
      />
    </svg>
  ),
  foggy: (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      <path
        d="M12 28 Q20 24 28 28 Q36 32 44 28 Q52 24 60 28 Q68 32 76 28"
        stroke="white"
        strokeWidth="4"
        strokeLinecap="round"
        strokeOpacity="0.8"
      />
      <path
        d="M12 42 Q20 38 28 42 Q36 46 44 42 Q52 38 60 42 Q68 46 76 42"
        stroke="white"
        strokeWidth="4"
        strokeLinecap="round"
        strokeOpacity="0.6"
      />
      <path
        d="M18 56 Q26 52 34 56 Q42 60 50 56 Q58 52 66 56"
        stroke="white"
        strokeWidth="4"
        strokeLinecap="round"
        strokeOpacity="0.4"
      />
    </svg>
  ),
  drizzle: (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      <path
        d="M14 44 Q14 30 26 30 Q30 22 40 24 Q50 24 52 32 Q60 32 60 44 Q60 52 52 52 H22 Q14 52 14 44Z"
        fill="white"
        fillOpacity="0.85"
      />
      <line
        x1="28"
        y1="58"
        x2="26"
        y2="66"
        stroke="#7dd3fc"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <line
        x1="40"
        y1="58"
        x2="38"
        y2="66"
        stroke="#7dd3fc"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <line
        x1="52"
        y1="58"
        x2="50"
        y2="66"
        stroke="#7dd3fc"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  ),
  rainy: (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      <path
        d="M12 40 Q12 26 24 26 Q28 18 38 20 Q48 20 50 28 Q58 28 58 40 Q58 48 50 48 H20 Q12 48 12 40Z"
        fill="white"
        fillOpacity="0.85"
      />
      <line
        x1="24"
        y1="54"
        x2="20"
        y2="66"
        stroke="#38bdf8"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <line
        x1="36"
        y1="54"
        x2="32"
        y2="66"
        stroke="#38bdf8"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <line
        x1="48"
        y1="54"
        x2="44"
        y2="66"
        stroke="#38bdf8"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <line
        x1="58"
        y1="54"
        x2="54"
        y2="66"
        stroke="#38bdf8"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  ),
  snowy: (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      <path
        d="M12 40 Q12 26 24 26 Q28 18 38 20 Q48 20 50 28 Q58 28 58 40 Q58 48 50 48 H20 Q12 48 12 40Z"
        fill="white"
        fillOpacity="0.85"
      />
      <circle cx="26" cy="60" r="3" fill="#bae6fd" />
      <circle cx="40" cy="64" r="3" fill="#bae6fd" />
      <circle cx="54" cy="60" r="3" fill="#bae6fd" />
      <circle cx="33" cy="72" r="2.5" fill="#bae6fd" />
      <circle cx="47" cy="72" r="2.5" fill="#bae6fd" />
    </svg>
  ),
  stormy: (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      <path
        d="M10 40 Q10 24 24 24 Q28 14 40 16 Q52 16 54 26 Q64 26 64 40 Q64 50 54 50 H18 Q10 50 10 40Z"
        fill="#94a3b8"
        fillOpacity="0.9"
      />
      <polyline
        points="42,52 36,64 43,64 37,76"
        stroke="#fbbf24"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  ),
};

export default function WeatherIcon({
  type,
  size = 80,
}: {
  type: IconType;
  size?: number;
}) {
  return <div style={{ width: size, height: size }}>{icons[type]}
  <div></div>
  </div>;
}
