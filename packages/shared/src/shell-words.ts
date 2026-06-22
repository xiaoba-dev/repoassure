export function parseShellWords(command: string): string[] | undefined {
  const words: string[] = [];
  let current = '';
  let quote: '"' | "'" | undefined;
  let ansiCString = false;
  let escaping = false;

  for (let index = 0; index < command.length; index += 1) {
    const character = command[index] ?? '';

    if (escaping) {
      if (ansiCString) {
        if (character === 'x' && /^[0-9a-fA-F]{2}$/u.test(command.slice(index + 1, index + 3))) {
          current += String.fromCharCode(Number.parseInt(command.slice(index + 1, index + 3), 16));
          index += 2;
        } else {
          current += decodeAnsiCStringEscape(character);
        }
      } else {
        current += character;
      }

      escaping = false;
      continue;
    }

    if (character === '\\' && (ansiCString || quote !== "'")) {
      escaping = true;
      continue;
    }

    if (quote) {
      if (character === quote) {
        quote = undefined;
        ansiCString = false;
        continue;
      }

      current += character;
      continue;
    }

    if (character === "'" && current.endsWith('$')) {
      current = current.slice(0, -1);
      quote = character;
      ansiCString = true;
      continue;
    }

    if (character === '"' || character === "'") {
      quote = character;
      continue;
    }

    if (/\s/u.test(character)) {
      if (current.length > 0) {
        words.push(current);
        current = '';
      }

      continue;
    }

    current += character;
  }

  if (escaping) {
    current += '\\';
  }

  if (quote) {
    return undefined;
  }

  if (current.length > 0) {
    words.push(current);
  }

  return words;
}

function decodeAnsiCStringEscape(character: string): string {
  if (character === 'n') {
    return '\n';
  }

  if (character === 'r') {
    return '\r';
  }

  if (character === 't') {
    return '\t';
  }

  return character;
}
