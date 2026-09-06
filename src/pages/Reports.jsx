import { useMemo } from "react";
import Topbar from "../components/Topbar";
import ChartCard from "../components/charts/ChartCard";
import { chartColors, tooltipStyle } from "../components/charts/ChartCard";
import { useData } from "../context/DataContext";
import { formatMoney, monthKey } from "../lib/format";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from "recharts";

const STATUS_PALETTE = {
  completed: chartColors.good,
  pending: chartColors.warn,
  failed: chartColors.bad,
  refunded: chartColors.muted,
};

export default function Reports() {
  const { transactions, stats } = useData();

  const monthly = useMemo(() => buildMonthly(transactions, 6), [transactions]);
  const statusMix = useMemo(() => buildStatusMix(transactions), [transactions]);
  const topCustomers = useMemo(() => buildTopCustomers(transactions), [transactions]);
  const avgOrder = useMemo(() => {
    const orders = transactions.filter((t) => t.type === "topup" && t.status === "completed");
    if (orders.length === 0) return 0;
    return orders.reduce((s, t) => s + Number(t.amount || 0), 0) / orders.length;
  }, [transactions]);
  const marginPct = stats.cashIn > 0 ? (stats.profit / stats.cashIn) * 100 : 0;

  return (
    <>
      <Topbar title="Reports" subtitle="Deeper trends across your shop's history" />

      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MiniStat label="Avg. order value" value={formatMoney(avgOrder)} />
          <MiniStat label="Profit margin" value={`${marginPct.toFixed(1)}%`} />
          <MiniStat label="Completed orders" value={stats.completedCount} />
          <MiniStat label="Total records" value={stats.totalTransactions} />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <ChartCard
            title="Revenue vs profit — last 6 months"
            subtitle="Monthly totals, completed topups only"
            className="xl:col-span-2 h-72"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke={chartColors.grid} vertical={false} />
                <XAxis dataKey="label" tick={{ fill: chartColors.muted, fontSize: 10, fontFamily: "JetBrains Mono" }} axisLine={{ stroke: chartColors.grid }} tickLine={false} />
                <YAxis tick={{ fill: chartColors.muted, fontSize: 10, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} width={40} tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)} />
                <Tooltip contentStyle={tooltipStyle} formatter={(value, name) => [formatMoney(value), name === "revenue" ? "Revenue" : "Profit"]} cursor={{ fill: "#1A1E23" }} />
                <Bar dataKey="revenue" fill={chartColors.accent} radius={[2, 2, 0, 0]} barSize={18} />
                <Bar dataKey="profit" fill={chartColors.good} radius={[2, 2, 0, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Transaction status mix" subtitle="All records" className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusMix} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={48} outerRadius={76} paddingAngle={2} strokeWidth={0}>
                  {statusMix.map((entry) => (
                    <Cell key={entry.name} fill={STATUS_PALETTE[entry.name] || chartColors.muted} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend
                  verticalAlign="bottom"
                  height={24}
                  iconSize={8}
                  formatter={(value) => <span style={{ color: chartColors.muted, fontSize: 11, textTransform: "capitalize" }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <ChartCard title="Cumulative net cash" subtitle="Running total, last 6 months" className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthly} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke={chartColors.grid} vertical={false} />
                <XAxis dataKey="label" tick={{ fill: chartColors.muted, fontSize: 10, fontFamily: "JetBrains Mono" }} axisLine={{ stroke: chartColors.grid }} tickLine={false} />
                <YAxis tick={{ fill: chartColors.muted, fontSize: 10, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} width={40} tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)} />
                <Tooltip contentStyle={tooltipStyle} formatter={(value) => [formatMoney(value), "Net cash"]} />
                <Line type="monotone" dataKey="cumulativeNet" stroke={chartColors.accent} strokeWidth={2} dot={{ r: 2.5, fill: chartColors.accent }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <div className="bg-panel border border-border h-64 flex flex-col">
            <div className="px-4 py-3 border-b border-border">
              <h3 className="text-sm font-medium">Top customers</h3>
              <p className="text-2xs text-dim mt-0.5">By total completed spend</p>
            </div>
            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-sm">
                <tbody>
                  {topCustomers.map((c, i) => (
                    <tr key={c.name} className="border-b border-border/60 last:border-0">
                      <td className="px-4 py-2 text-dim w-6 num text-2xs">{i + 1}</td>
                      <td className="px-2 py-2">{c.name}</td>
                      <td className="px-4 py-2 text-2xs text-dim">{c.orders} orders</td>
                      <td className="px-4 py-2 num text-right">{formatMoney(c.total)}</td>
                    </tr>
                  ))}
                  {topCustomers.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-dim text-sm">
                        No completed orders yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="bg-panel border border-border p-4">
      <div className="text-2xs uppercase tracking-wide text-dim mb-2">{label}</div>
      <div className="num text-xl font-semibold">{value}</div>
    </div>
  );
}

function buildMonthly(transactions, months) {
  const buckets = [];
  const today = new Date();
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    buckets.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: d.toLocaleDateString("en-US", { month: "short" }),
      revenue: 0,
      profit: 0,
      cashOut: 0,
    });
  }
  transactions
    .filter((t) => t.status === "completed")
    .forEach((t) => {
      const key = monthKey(t.date);
      const bucket = buckets.find((b) => b.key === key);
      if (!bucket) return;
      if (t.type === "topup") {
        bucket.revenue += Number(t.amount || 0);
        bucket.profit += Number(t.profit || 0);
      } else {
        bucket.cashOut += Number(t.amount || 0);
      }
    });
  let running = 0;
  return buckets.map((b) => {
    running += b.revenue - b.cashOut;
    return { ...b, revenue: round2(b.revenue), profit: round2(b.profit), cumulativeNet: round2(running) };
  });
}

function buildStatusMix(transactions) {
  const map = new Map();
  transactions.forEach((t) => map.set(t.status, (map.get(t.status) || 0) + 1));
  return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
}

function buildTopCustomers(transactions) {
  const map = new Map();
  transactions
    .filter((t) => t.type === "topup" && t.status === "completed" && t.customerName)
    .forEach((t) => {
      const cur = map.get(t.customerName) || { name: t.customerName, total: 0, orders: 0 };
      cur.total += Number(t.amount || 0);
      cur.orders += 1;
      map.set(t.customerName, cur);
    });
  return Array.from(map.values())
    .sort((a, b) => b.total - a.total)
    .slice(0, 8)
    .map((c) => ({ ...c, total: round2(c.total) }));
}

function round2(n) {
  return Math.round(n * 100) / 100;
}
