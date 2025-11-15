// DynamicBarChart.jsx
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  Brush,
  LabelList,
  Cell,
} from "recharts";
import { useMemo } from "react";

/**
 * Props esperadas:
 *  - data: [{ id?: string|number, name: string, value: number, product_presentation?, product_weight_g? }]
 *  - title?: string
 *  - avgLine?: boolean
 *  - orientation?: "vertical" | "horizontal"
 *  - barWidth?: number
 *  - showBrush?: boolean
 *  - showValueLabels?: boolean
 *  - colorMode?: "solid" | "conditional" | "alternating"
 *  - solidColor?: string
 *  - topN?: number
 *  - sort?: "asc" | "desc" | "none"
 *  - onBarClick?: (rechartsPayload) => void
 *  - highlightId?: string|number
 *  - highlightColor?: string
 *  - rowHeight?: number
 *  - categoryGap?: number|string
 *  - subLabelFn?: (entry) => string   // <-- NUEVO: cómo construir el renglón secundario bajo el nombre
 *  - nameMaxLen?: number              // <-- NUEVO: truncamiento del nombre
 */

const trelloColors = [
  "#0079bf",
  "#70b500",
  "#ff9f1a",
  "#eb5a46",
  "#f2d600",
  "#c377e0",
  "#ff78cb",
  "#00c2e0",
  "#51e898",
  "#c4c9cc",
];


const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const entry = payload[0].payload;
  // ← tu fila original
  const when  = entry.date
  const val   = Number(entry.value).toFixed(2);

  return (
    <div className="rounded-xl bg-white border p-3 shadow">
      <div className="font-semibold">{label}</div>
      <div className="text-sm">Valor: ${val}</div>
      {when && <div className="text-sm">Fecha: {when}</div>}
    </div>
  );
};

const defaultSubLabel = (entry) => {
  if (!entry) return "";
  const pres = entry.product_presentation || entry.presentation || "";
  const w = entry.product_weight_g ?? entry.weight_g ?? entry.weight ?? "";
  const weightTxt = w !== "" && w != null ? `${w} g` : "";
  const parts = [pres, weightTxt].filter(Boolean);
  return parts.join(" · ");
};

const truncate = (t, n = 18) => (t?.length > n ? t.slice(0, n) + "…" : t || "");


const makeCustomYAxisTick = (lookup, subLabelFn, nameMaxLen = 18) => (props) => {
  const { x, y, payload } = props;
  const value = payload?.value ?? "";
  const entry = lookup.get(value);
  const line1 = truncate(value, nameMaxLen);
  const line2 = subLabelFn(entry);
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        dy={-4}
        x={0}
        y={0}
        textAnchor="end"
        fontSize={12}
        fill="#111827"
      >
        {line1}
      </text>
      {line2 ? (
        <text
          dy={10}
          x={0}
          y={0}
          textAnchor="end"
          fontSize={10}
          fill="#6b7280"
        >
          {truncate(line2, nameMaxLen + 6)}
        </text>
      ) : null}
    </g>
  );
};

const DynamicBarChart = ({
  data,
  title = "Gráfico de Barras",
  avgLine = true,
  orientation = "vertical",
  barWidth = 40,
  showBrush = true,
  showValueLabels = true,
  colorMode = "conditional",
  solidColor = "#16a34a",
  topN,
  sort = "desc",
  onBarClick,
  highlightId,
  highlightColor = "#f59e0b",
  rowHeight = 36,
  categoryGap = "60%",
  subLabelFn = defaultSubLabel,  // <-- NUEVO
  nameMaxLen = 18,               // <-- NUEVO
}) => {
  // 1) ordenar y recortar
  const prepared = useMemo(() => {
    let d = [...(data || [])];
    if (sort !== "none") {
      d.sort((a, b) =>
        sort === "asc" ? a.value - b.value : b.value - a.value
      );
    }
    if (topN && topN > 0 && topN < d.length) d = d.slice(0, topN);
    return d;
  }, [data, topN, sort]);

  // 2) promedio
  const avg = useMemo(() => {
    if (!prepared.length) return 0;
    return (
      prepared.reduce((s, x) => s + (Number(x.value) || 0), 0) / prepared.length
    );
  }, [prepared]);

  // 3) colores base
  const baseFill = (entry, idx) => {
    const v = entry.value;
    if (colorMode === "solid") return solidColor;
    if (colorMode === "alternating")
      return idx % 2 === 0 ? "#2563eb" : "#60a5fa";
    if (v < avg * 0.98) return "#10b981";
    if (v > avg * 1.02) return "#ef4444";
    return "#6b7280";
  };

  // 4) tamaños
  const chartWidth = Math.max(prepared.length * (barWidth + 16), 800);
  const perRow = Math.max(24, Number(rowHeight) || 36);
  const chartHeight =
    orientation === "horizontal"
      ? Math.max(prepared.length * perRow, 320)
      : Math.max(prepared.length * (barWidth * 0.7), 320);

  const computedBarSize =
    orientation === "horizontal" ? Math.round(perRow * 0.55) : barWidth;

  const xKey = "name";
  const yKey = "value";

  // --- NUEVO: lookup por nombre -> entry para que el tick tenga acceso a presentación y peso
  const nameLookup = useMemo(() => {
    const map = new Map();
    prepared.forEach((e) => map.set(e[xKey], e));
    return map;
  }, [prepared]);


  const CustomYAxisTick = useMemo(
    () => makeCustomYAxisTick(nameLookup, subLabelFn, nameMaxLen),
    [nameLookup, subLabelFn, nameMaxLen]
  );

  const ChartCore = (
    <BarChart
      data={prepared}
      layout={orientation === "horizontal" ? "vertical" : "horizontal"}
      width={orientation === "horizontal" ? 800 : chartWidth}
      height={chartHeight}
      margin={{ top: 36, right: 100, left: 10, bottom: 30 }}
      barCategoryGap={categoryGap}
    >
      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
      {orientation === "horizontal" ? (
        <>
          <XAxis type="number" tick={{ fontSize: 12 }} />
          <YAxis
            dataKey={xKey}
            type="category"
            width={170} // un poco más de ancho para dos líneas
            interval={0}
            tick={CustomYAxisTick}
          />
        </>
      ) : (
        <>
          <XAxis
            dataKey={xKey}
            interval={0}
            height={48}
            tick={{ angle: -90, textAnchor: "end", fontSize: 12 }}
          />
          <YAxis tick={{ fontSize: 12 }} />
        </>
      )}

      <Tooltip
        // label ya muestra el name; agregamos la sublabel en el "labelFormatter"
        content={<CustomTooltip />}
      />

      <Bar
        dataKey={yKey}
        radius={[8, 8, 0, 0]}
        onClick={(d) => onBarClick?.(d)}
        style={{ cursor: onBarClick ? "pointer" : "default" }}
        barSize={computedBarSize}
        maxBarSize={computedBarSize}
      >
        {prepared.map((entry, index) => {
          const isHighlight =
            highlightId !== undefined &&
            (entry.id === highlightId || entry.name === highlightId);
          const fill = isHighlight ? highlightColor : baseFill(entry, index);

          return (
            <Cell key={`cell-${entry.id ?? entry.name ?? index}`} fill={fill} />
          );
        })}

        {avgLine && (
          <ReferenceLine
            y={orientation === "horizontal" ? undefined : avg}
            x={orientation === "horizontal" ? avg : undefined}
            stroke="#111827"
            strokeWidth={2}
            strokeDasharray="6 6"
            ifOverflow="extendDomain"
            label={{
              value: `Promedio $${avg.toFixed(2)}`,
              position: orientation === "horizontal" ? "top" : "right",
              fill: "#111827",
              fontSize: 12,
            }}
          />
        )}

        {showValueLabels && prepared.length <= 25 && (
          <LabelList
            dataKey={yKey}
            position={orientation === "horizontal" ? "right" : "top"}
            formatter={(val) => `$${Number(val).toFixed(2)}`}
          />
        )}
      </Bar>

      {showBrush && prepared.length > 20 && (
        <Brush dataKey={xKey} height={20} travellerWidth={10} />
      )}
    </BarChart>
  );

  return (
    <div className="w-full rounded-2xl border p-4 bg-white shadow-sm">
      <div className="text-lg font-semibold mb-3">{title}</div>

      {orientation === "horizontal" ? (
        <div className="w-full overflow-y-auto" style={{ maxHeight: 420 }}>
          {ChartCore}
        </div>
      ) : (
        <div className="w-full overflow-x-auto ">
          <div style={{ width: chartWidth, height: chartHeight }}>
            <ResponsiveContainer width="100%" height={chartHeight}>
              {ChartCore}
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default DynamicBarChart;
