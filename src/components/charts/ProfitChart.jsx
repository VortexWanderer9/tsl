import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { chartColors, tooltipStyle } from "./ChartCard";
import { formatMoney } from "../../lib/format";

export default function ProfitChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid stroke={chartColors.grid} vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: chartColors.muted, fontSize: 10, fontFamily: "JetBrains Mono" }}
          axisLine={{ stroke: chartColors.grid }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: chartColors.muted, fontSize: 10, fontFamily: "JetBrains Mono" }}
          axisLine={false}
          tickLine={false}
          width={40}
          tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)}
        />
        <Tooltip contentStyle={tooltipStyle} formatter={(value) => [formatMoney(value), "Profit"]} cursor={{ fill: "#1A1E23" }} />
        <Bar dataKey="value" fill={chartColors.good} radius={[2, 2, 0, 0]} barSize={14} />
      </BarChart>
    </ResponsiveContainer>
  );
}
