import { Terminal } from 'lucide-react';

export type CliDemoCopy = {
  label: string;
  heading: string;
  intro: string;
  command: string;
  lines: string[];
  footnote: string;
};

type CliDemoProps = {
  copy: CliDemoCopy;
};

export function CliDemo({ copy }: CliDemoProps) {
  return (
    <div className="cli-demo" data-testid="cli-demo">
      <div className="cli-demo-copy">
        <p className="section-label">{copy.label}</p>
        <h2>{copy.heading}</h2>
        <p className="section-intro">{copy.intro}</p>
      </div>

      <div className="cli-terminal" aria-label={copy.heading}>
        <div className="cli-terminal-chrome">
          <span className="cli-terminal-dot" aria-hidden="true" />
          <span className="cli-terminal-dot" aria-hidden="true" />
          <span className="cli-terminal-dot" aria-hidden="true" />
          <span className="cli-terminal-title">
            <Terminal size={14} />
            local run
          </span>
        </div>
        <div className="cli-terminal-body">
          <p className="cli-terminal-command">
            <span className="cli-prompt">$</span> {copy.command}
          </p>
          {copy.lines.map((line) => (
            <p className="cli-terminal-line" key={line}>
              {line}
            </p>
          ))}
        </div>
        <p className="cli-terminal-footnote">{copy.footnote}</p>
      </div>
    </div>
  );
}
