const STATUS_STYLES = {
  completed: "bg-good/10 text-good border-good/30",
  pending: "bg-warn/10 text-warn border-warn/30",
  failed: "bg-bad/10 text-bad border-bad/30",
  refunded: "bg-dim/10 text-muted border-dim/30",
};

const TYPE_STYLES = {
  topup: "bg-accent/10 text-accent border-accent/30",
  refund: "bg-bad/10 text-bad border-bad/30",
  expense: "bg-warn/10 text-warn border-warn/30",
};

export function StatusBadge({ status }) {
  return (
    <span
      className={`inline-block px-1.5 py-0.5 text-2xs border capitalize ${
        STATUS_STYLES[status] || STATUS_STYLES.pending
      }`}
    >
      {status}
    </span>
  );
}

export function TypeBadge({ type }) {
  const label = type === "topup" ? "cash in" : type === "refund" ? "refund" : "expense";
  return (
    <span
      className={`inline-block px-1.5 py-0.5 text-2xs border capitalize ${
        TYPE_STYLES[type] || TYPE_STYLES.topup
      }`}
    >
      {label}
    </span>
  );
}
