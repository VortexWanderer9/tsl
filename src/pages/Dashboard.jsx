import { useMemo, useState } from "react";
import { Wallet, TrendingUp, TrendingDown, Clock, AlertTriangle, Plus } from "lucide-react";
import Topbar from "../components/Topbar";
import StatCard from "../components/StatCard";
import ChartCard from "../components/charts/ChartCard";
import CashFlowChart from "../components/charts/CashFlowChart";
import GameBreakdownChart from "../components/charts/GameBreakdownChart";
import PaymentMethodChart from "../components/charts/PaymentMethodChart";
import ProfitChart from "../components/charts/ProfitChart";
import Modal from "../components/Modal";
import TransactionForm from "../components/TransactionForm";
import { StatusBadge, TypeBadge } from "../components/Badge";
import { useData } from "../context/DataContext";
import { formatMoney, formatDate, isoDateOnly } from "../lib/format";

const METHOD_LABEL = {
  esewa: "eSewa",
  khalti: "Khalti",
  bank_transfer: "Bank transfer",
  cash: "Cash",
  card: "Card",
  crypto: "Crypto",
  other: "Other",
};

export default function Dashboard() {
  const { transactions, stats } = useData();
  const [formOpen, setFormOpen] = useState(false);

  const cashFlowData = useMemo(() => buildCashFlowSeries(transactions, 30), [transactions]);
  const gameData = useMemo(() => buildGameBreakdown(transactions), [transactions]);
  const methodData = useMemo(() => buildMethodBreakdown(transactions), [transactions]);
  const profitData = useMemo(() => buildWeeklyProfit(transactions, 8), [transactions]);
  const recent = transactions.slice(0, 8);

  return (
    <>
      <Topbar
        title="Overview"
        subtitle="Live snapshot of your shop's cash flow"
        actions={
          <button
            onClick={() => setFormOpen(true)}
            className="flex items-center gap-1.5 bg-accent text-bg text-sm font-medium px-3 py-1.5 hover:bg-accent/90 transition-colors"
          >
            <Plus size={14} strokeWidth={2.5} />
            Add transaction
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          <StatCard label="Cash in" value={formatMoney(stats.cashIn)} icon={Wallet} tone="good" />
          <StatCard label="Cash out" value={formatMoney(stats.cashOut)} icon={TrendingDown} tone="bad" />
          <StatCard
            label="Net cash"
            value={formatMoney(stats.netCash)}
            icon={TrendingUp}
            tone={stats.netCash >= 0 ? "good" : "bad"}
          />
          <StatCard label="Profit" value={formatMoney(stats.profit)} icon={TrendingUp} />
          <StatCard label="Pending" value={stats.pendingCount} icon={Clock} />
          <StatCard label="Failed" value={stats.failedCount} icon={AlertTriangle} tone={stats.failedCount ? "bad" : "default"} />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <ChartCard title="Cash flow — last 30 days" subtitle="Cash in vs cash out" className="xl:col-span-2 h-72">
            <CashFlowChart data={cashFlowData} />
          </ChartCard>
          <ChartCard title="Payment methods" subtitle="Share of completed cash in" className="h-72">
            <PaymentMethodChart data={methodData} />
          </ChartCard>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <ChartCard title="Revenue by game" subtitle="Top titles, all time" className="h-64">
            <GameBreakdownChart data={gameData} />
          </ChartCard>
          <ChartCard title="Profit by week" subtitle="Last 8 weeks" className="h-64">
            <ProfitChart data={profitData} />
          </ChartCard>
        </div>

        <div className="bg-panel border border-border">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-medium">Recent transactions</h3>
            <span className="text-2xs text-dim">{transactions.length} total</span>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-2xs uppercase tracking-wide text-dim border-b border-border">
                <th className="px-4 py-2 font-medium">Date</th>
                <th className="px-4 py-2 font-medium">Customer / note</th>
                <th className="px-4 py-2 font-medium">Game</th>
                <th className="px-4 py-2 font-medium">Type</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((t) => (
                <tr key={t.id} className="border-b border-border/60 last:border-0 hover:bg-panel2/50">
                  <td className="px-4 py-2.5 num text-2xs text-muted whitespace-nowrap">{formatDate(t.date)}</td>
                  <td className="px-4 py-2.5">{t.customerName || t.notes || "—"}</td>
                  <td className="px-4 py-2.5 text-muted">{t.game || "—"}</td>
                  <td className="px-4 py-2.5">
                    <TypeBadge type={t.type} />
                  </td>
                  <td className="px-4 py-2.5">
                    <StatusBadge status={t.status} />
                  </td>
                  <td className="px-4 py-2.5 num text-right">{formatMoney(t.amount)}</td>
                </tr>
              ))}
              {recent.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-dim text-sm">
                    No transactions yet. Add your first one above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title="Add transaction">
        <TransactionForm onDone={() => setFormOpen(false)} />
      </Modal>
    </>
  );
}

function buildCashFlowSeries(transactions, days) {
  const buckets = new Map();
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    buckets.set(key, {
      label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      cashIn: 0,
      cashOut: 0,
    });
  }
  transactions
    .filter((t) => t.status === "completed")
    .forEach((t) => {
      const key = isoDateOnly(t.date);
      if (!buckets.has(key)) return;
      const bucket = buckets.get(key);
      if (t.type === "topup") bucket.cashIn += Number(t.amount || 0);
      else bucket.cashOut += Number(t.amount || 0);
    });
  return Array.from(buckets.values());
}

function buildGameBreakdown(transactions) {
  const map = new Map();
  transactions
    .filter((t) => t.type === "topup" && t.status === "completed" && t.game)
    .forEach((t) => {
      map.set(t.game, (map.get(t.game) || 0) + Number(t.amount || 0));
    });
  return Array.from(map.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);
}

function buildMethodBreakdown(transactions) {
  const map = new Map();
  transactions
    .filter((t) => t.type === "topup" && t.status === "completed")
    .forEach((t) => {
      const label = METHOD_LABEL[t.paymentMethod] || t.paymentMethod;
      map.set(label, (map.get(label) || 0) + Number(t.amount || 0));
    });
  return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
}

function buildWeeklyProfit(transactions, weeks) {
  const buckets = [];
  const today = new Date();
  for (let i = weeks - 1; i >= 0; i--) {
    const end = new Date(today);
    end.setDate(end.getDate() - i * 7);
    const start = new Date(end);
    start.setDate(start.getDate() - 6);
    buckets.push({
      label: `${start.getMonth() + 1}/${start.getDate()}`,
      start,
      end,
      value: 0,
    });
  }
  transactions
    .filter((t) => t.type === "topup" && t.status === "completed")
    .forEach((t) => {
      const d = new Date(t.date);
      const bucket = buckets.find((b) => d >= b.start && d <= b.end);
      if (bucket) bucket.value += Number(t.profit || 0);
    });
  return buckets.map(({ label, value }) => ({ label, value: Math.round(value * 100) / 100 }));
}
