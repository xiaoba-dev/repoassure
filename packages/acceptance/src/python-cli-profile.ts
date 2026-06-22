import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

export type PythonCliProfileConfidence = 'high' | 'medium' | 'low';

export interface PythonCliProfile {
  repoRoot: string;
  pyprojectPath: string;
  projectName: string | null;
  requiresPython: string | null;
  dependencies: string[];
  optionalDependencies: Record<string, string[]>;
  consoleScripts: Record<string, string>;
  blockers: string[];
  confidence: PythonCliProfileConfidence;
}

interface TomlAssignment {
  section: string;
  key: string;
  value: string;
}

export async function buildPythonCliProfile(repoRoot: string): Promise<PythonCliProfile> {
  const pyprojectPath = join(repoRoot, 'pyproject.toml');
  const content = await readFile(pyprojectPath, 'utf8');
  const assignments = parseTomlAssignments(content);
  const projectName = readString(assignments, 'project', 'name');
  const requiresPython = readString(assignments, 'project', 'requires-python');
  const dependencies = readStringArray(assignments, 'project', 'dependencies');
  const optionalDependencies = readOptionalDependencies(assignments);
  const consoleScripts = readStringMap(assignments, 'project.scripts');
  const blockers = [
    ...(!projectName ? ['Missing [project].name in pyproject.toml'] : []),
    ...(Object.keys(consoleScripts).length === 0 ? ['No [project.scripts] console entrypoints detected'] : [])
  ];

  return {
    repoRoot,
    pyprojectPath,
    projectName,
    requiresPython,
    dependencies,
    optionalDependencies,
    consoleScripts,
    blockers,
    confidence: formatConfidence({ projectName, consoleScripts, blockers })
  };
}

export async function writePythonCliProfileArtifact(repoRoot: string, profile: PythonCliProfile): Promise<string> {
  const artifactPath = join(repoRoot, '.hardening', 'run', 'python-cli-profile.json');

  await mkdir(dirname(artifactPath), { recursive: true });
  await writeFile(artifactPath, `${JSON.stringify(profile, null, 2)}\n`);

  return artifactPath;
}

function parseTomlAssignments(content: string): TomlAssignment[] {
  const assignments: TomlAssignment[] = [];
  let section = '';
  let multilineKey: string | null = null;
  let multilineValue = '';

  for (const rawLine of content.split(/\r?\n/u)) {
    const line = stripTomlComment(rawLine).trim();

    if (!line) {
      continue;
    }

    if (multilineKey) {
      multilineValue = `${multilineValue}\n${line}`;
      if (line.includes(']')) {
        assignments.push({ section, key: multilineKey, value: multilineValue });
        multilineKey = null;
        multilineValue = '';
      }
      continue;
    }

    const sectionMatch = /^\[([^\]]+)\]$/u.exec(line);
    if (sectionMatch) {
      section = sectionMatch[1]!.trim();
      continue;
    }

    const assignmentMatch = /^([A-Za-z0-9_.-]+)\s*=\s*(.*)$/u.exec(line);
    if (!assignmentMatch) {
      continue;
    }

    const key = assignmentMatch[1]!.trim();
    const value = assignmentMatch[2]!.trim();
    if (value.startsWith('[') && !value.includes(']')) {
      multilineKey = key;
      multilineValue = value;
      continue;
    }

    assignments.push({ section, key, value });
  }

  return assignments;
}

function readString(assignments: TomlAssignment[], section: string, key: string): string | null {
  const assignment = assignments.find((candidate) => candidate.section === section && candidate.key === key);

  return assignment ? parseTomlString(assignment.value) : null;
}

function readStringArray(assignments: TomlAssignment[], section: string, key: string): string[] {
  const assignment = assignments.find((candidate) => candidate.section === section && candidate.key === key);

  return assignment ? parseTomlStringArray(assignment.value) : [];
}

function readStringMap(assignments: TomlAssignment[], section: string): Record<string, string> {
  const entries = assignments
    .filter((assignment) => assignment.section === section)
    .flatMap((assignment): Array<[string, string]> => {
      const value = parseTomlString(assignment.value);
      return value ? [[assignment.key, value]] : [];
    });

  return Object.fromEntries(entries);
}

function readOptionalDependencies(assignments: TomlAssignment[]): Record<string, string[]> {
  const entries = assignments
    .filter((assignment) => assignment.section === 'project.optional-dependencies')
    .map((assignment): [string, string[]] => [assignment.key, parseTomlStringArray(assignment.value)]);

  return Object.fromEntries(entries);
}

function parseTomlString(value: string): string | null {
  const match = /^"([^"]*)"$/u.exec(value.trim());

  return match ? match[1]! : null;
}

function parseTomlStringArray(value: string): string[] {
  return [...value.matchAll(/"([^"]*)"/gu)].map((match) => match[1]!);
}

function stripTomlComment(line: string): string {
  let inString = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"' && line[index - 1] !== '\\') {
      inString = !inString;
      continue;
    }

    if (char === '#' && !inString) {
      return line.slice(0, index);
    }
  }

  return line;
}

function formatConfidence(input: {
  projectName: string | null;
  consoleScripts: Record<string, string>;
  blockers: string[];
}): PythonCliProfileConfidence {
  if (input.blockers.length > 0) {
    return input.projectName ? 'medium' : 'low';
  }

  return Object.keys(input.consoleScripts).length > 0 ? 'high' : 'medium';
}
