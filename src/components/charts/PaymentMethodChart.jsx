import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { chartColors, tooltipStyle } from "./ChartCard";
import { formatMoney } from "../../lib/format";

const PALETTE = [chartColors.accent, chartColors.good, chartColors.warn, chartColors.purple, chartColors.bad, chartColors.muted];

export default function PaymentMethodChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={78}
          paddingAngle={2}
          strokeWidth={0}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} formatter={(value) => [formatMoney(value), "Amount"]} />
        <Legend
          verticalAlign="bottom"
          height={24}
          iconSize={8}
          formatter={(value) => <span style={{ color: chartColors.muted, fontSize: 11 }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
