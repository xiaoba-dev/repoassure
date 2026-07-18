import { Copy } from 'lucide-react';

type EvidenceHashProps = {
  value: string;
  className?: string;
};

export function EvidenceHash({ value, className }: EvidenceHashProps) {
  const classes = ['evidence-hash', className].filter(Boolean).join(' ');

  return (
    <span className={classes}>
      <code>{value}</code>
      <Copy size={15} aria-hidden="true" />
    </span>
  );
}
