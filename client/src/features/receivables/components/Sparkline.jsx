import React from "react";

/** Mini sparkline SVG — muestra tendencia de los últimos 5 valores */
const Sparkline = ({ values, color = "#c54a3a", w = 64, h = 18 }) => {
  if (!values || values.length === 0) return null;

  const nums = values.map((v) => Number(v) || 0);
  const max = Math.max(...nums, 1);
  const min = Math.min(...nums, 0);
  const range = Math.max(max - min, 1);
  const stepX = w / (nums.length - 1 || 1);

  const points = nums
    .map(
      (v, i) =>
        `${(i * stepX).toFixed(1)},${(h - ((v - min) / range) * (h - 2) - 1).toFixed(1)}`
    )
    .join(" ");

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default Sparkline;
