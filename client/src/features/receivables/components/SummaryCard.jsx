import React from "react";

/** Card de resumen para el portfolio header */
const SummaryCard = ({ label, value, sub, emphasize = false, prefix = "" }) => (
  <div
    className={`rounded-xl border p-3.5 ${
      emphasize
        ? "bg-gray-900 border-gray-900 text-white"
        : "bg-white border-gray-200"
    }`}
  >
    <div
      className={`text-[11px] uppercase tracking-wide font-semibold ${
        emphasize ? "text-white/65" : "text-gray-400"
      }`}
    >
      {label}
    </div>
    <div
      className={`text-2xl font-extrabold mt-1.5 tracking-tight tabular-nums ${
        emphasize ? "text-white" : "text-gray-900"
      }`}
    >
      {prefix}
      {value}
    </div>
    {sub && (
      <div
        className={`text-[11px] mt-0.5 ${
          emphasize ? "text-white/60" : "text-gray-400"
        }`}
      >
        {sub}
      </div>
    )}
  </div>
);

export default SummaryCard;
