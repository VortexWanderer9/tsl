export default function ChartCard({ title, subtitle, children, actions, className = "" }) {
  return (
    <div className={`bg-panel border border-border p-4 flex flex-col ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium">{title}</h3>
          {subtitle && <p className="text-2xs text-dim mt-0.5">{subtitle}</p>}
        </div>
        {actions}
      </div>
      <div className="flex-1 min-h-0">{children}</div>
    </div>
  );
}

export const chartColors = {
  accent: "#4F9DFF",
  good: "#3DD68C",
  bad: "#E5484D",
  warn: "#E5A94F",
  grid: "#262B31",
  muted: "#8B92A0",
  purple: "#9B7DF0",
};

export const tooltipStyle = {
  background: "#1A1E23",
  border: "1px solid #31373F",
  borderRadius: 0,
  fontSize: 12,
  fontFamily: "JetBrains Mono, monospace",
  color: "#E8EAED",
};
