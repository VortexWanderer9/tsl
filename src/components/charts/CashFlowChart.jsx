import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { chartColors, tooltipStyle } from "./ChartCard";
import { formatMoney } from "../../lib/format";

export default function CashFlowChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="cashInGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={chartColors.accent} stopOpacity={0.35} />
            <stop offset="100%" stopColor={chartColors.accent} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="cashOutGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={chartColors.bad} stopOpacity={0.25} />
            <stop offset="100%" stopColor={chartColors.bad} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={chartColors.grid} vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: chartColors.muted, fontSize: 10, fontFamily: "JetBrains Mono" }}
          axisLine={{ stroke: chartColors.grid }}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fill: chartColors.muted, fontSize: 10, fontFamily: "JetBrains Mono" }}
          axisLine={false}
          tickLine={false}
          width={40}
          tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(value, name) => [formatMoney(value), name === "cashIn" ? "Cash in" : "Cash out"]}
          labelStyle={{ color: chartColors.muted, marginBottom: 4 }}
        />
        <Area type="monotone" dataKey="cashIn" stroke={chartColors.accent} strokeWidth={1.5} fill="url(#cashInGrad)" />
        <Area type="monotone" dataKey="cashOut" stroke={chartColors.bad} strokeWidth={1.5} fill="url(#cashOutGrad)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
