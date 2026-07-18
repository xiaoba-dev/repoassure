type StatusChipProps = {
  children: string;
  tone?: 'accent' | 'success';
  className?: string;
};

export function StatusChip({ children, tone = 'accent', className }: StatusChipProps) {
  const classes = ['status-chip', `status-chip-${tone}`, className].filter(Boolean).join(' ');
  return <span className={classes}>{children}</span>;
}

type SeverityChipProps = {
  severity: 'P0' | 'P1' | 'P2';
};

export function SeverityChip({ severity }: SeverityChipProps) {
  return <span className={`severity-chip severity-${severity.toLowerCase()}`}>{severity}</span>;
}
