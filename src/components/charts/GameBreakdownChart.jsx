import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts";
import { ResponsiveContainer } from "recharts";
import { chartColors, tooltipStyle } from "./ChartCard";
import { formatMoney } from "../../lib/format";

const PALETTE = [chartColors.accent, chartColors.good, chartColors.warn, chartColors.purple, chartColors.bad, chartColors.muted];

export default function GameBreakdownChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid stroke={chartColors.grid} horizontal={false} />
        <XAxis
          type="number"
          tick={{ fill: chartColors.muted, fontSize: 10, fontFamily: "JetBrains Mono" }}
          axisLine={{ stroke: chartColors.grid }}
          tickLine={false}
          tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)}
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fill: chartColors.muted, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={100}
        />
        <Tooltip contentStyle={tooltipStyle} formatter={(value) => [formatMoney(value), "Revenue"]} cursor={{ fill: "#1A1E23" }} />
        <Bar dataKey="value" radius={[0, 2, 2, 0]} barSize={16}>
          {data.map((_, i) => (
            <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
