import React from "react";
import { BUCKET_META } from "../receivablesHelpers";

/** Dot de color por bucket de severidad */
const StatusDot = ({ bucket }) => {
  const meta = BUCKET_META[bucket];
  if (!meta) return null;
  return (
    <span
      title={meta.label}
      className="inline-block w-2 h-2 rounded-full"
      style={{ backgroundColor: meta.color }}
    />
  );
};

/** Pill con label de estado */
export const StatusPill = ({ bucket }) => {
  const meta = BUCKET_META[bucket];
  if (!meta) return null;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold"
      style={{ backgroundColor: meta.bg, color: meta.color }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: meta.color }}
      />
      {meta.label}
    </span>
  );
};

export default StatusDot;
