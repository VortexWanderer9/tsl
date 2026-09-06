export default function StatCard({ label, value, delta, deltaTone = "neutral", icon: Icon, tone = "default" }) {
  const toneClasses = {
    default: "text-text",
    good: "text-good",
    bad: "text-bad",
  };

  return (
    <div className="bg-panel border border-border p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-2xs uppercase tracking-wide text-dim">{label}</span>
        {Icon && <Icon size={14} className="text-dim" strokeWidth={2} />}
      </div>
      <div className={`num text-2xl font-semibold ${toneClasses[tone]}`}>{value}</div>
      {delta && (
        <div
          className={`text-2xs num ${
            deltaTone === "good" ? "text-good" : deltaTone === "bad" ? "text-bad" : "text-dim"
          }`}
        >
          {delta}
        </div>
      )}
    </div>
  );
}
