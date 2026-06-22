export function shellQuoteArg(value: string): string {
  if (/^[A-Za-z0-9_./:=@%+-]+$/.test(value)) {
    return value;
  }

  if (hasControlCharacter(value)) {
    return `$'${escapeAnsiCString(value)}'`;
  }

  return `'${value.replaceAll("'", "'\\''")}'`;
}

function hasControlCharacter(value: string): boolean {
  return Array.from(value).some((character) => {
    const code = character.charCodeAt(0);
    return code < 32 || code === 127;
  });
}

function escapeAnsiCString(value: string): string {
  return Array.from(value, (character) => {
    if (character === '\\') {
      return '\\\\';
    }

    if (character === "'") {
      return "\\'";
    }

    if (character === '\n') {
      return '\\n';
    }

    if (character === '\r') {
      return '\\r';
    }

    if (character === '\t') {
      return '\\t';
    }

    const code = character.charCodeAt(0);

    if (code < 32 || code === 127) {
      return `\\x${code.toString(16).padStart(2, '0')}`;
    }

    return character;
  }).join('');
}
