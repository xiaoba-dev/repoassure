const redacted = '[REDACTED]';

const sensitiveKeyValuePattern =
  /\b([A-Za-z0-9_.-]*(?:API[_-]?KEY|TOKEN|SECRET|PASSWORD|PASSCODE|SESSION|JWT|CSRF|PRIVATE[_-]?KEY|SERVICE[_-]?ROLE)[A-Za-z0-9_.-]*)\b(\s*[:=]\s*)("[^"]*"|'[^']*'|[^\s,;&#'"})]+)/giu;

const quotedSensitiveKeyValuePattern =
  /(["'])([A-Za-z0-9_.-]*(?:(?:PROXY[_-]?)?AUTHORIZATION|API[_-]?KEY|TOKEN|SECRET|PASSWORD|PASSCODE|SESSION|JWT|CSRF|PRIVATE[_-]?KEY|SERVICE[_-]?ROLE)[A-Za-z0-9_.-]*)\1(\s*:\s*)(["'])(?:\\.|(?!\4).)*\4/giu;
const authorizationHeaderPattern =
  /\b((?:Proxy-)?Authorization)(\s*:\s*)(['"]?)([A-Za-z][A-Za-z0-9._-]*)(\s+)([^\s,;'"})\]]+)(\3)/giu;
const urlUserInfoPattern = /\b([A-Za-z][A-Za-z0-9+.-]*:\/\/)([^/\s@]+@)/gu;
const urlPattern = /\b[A-Za-z][A-Za-z0-9+.-]*:\/\/[^\s'"<>()]+/gu;
const cookieHeaderPattern = /(^|\r?\n)(Cookie\s*:\s*)([^\r\n]*)/giu;
const setCookieHeaderPattern = /(^|\r?\n)(Set-Cookie\s*:\s*)([^\r\n]*)/giu;
const quotedCookieHeaderPattern =
  /(["'])(Cookie|Set-Cookie)\1(\s*:\s*)(["'])((?:\\.|(?!\4).)*)\4/giu;
const jwtTokenPattern = /\beyJ[A-Za-z0-9_-]*\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/gu;
const providerApiKeyPattern = /\bsk-(?:ant-api\d{2}-)?[A-Za-z0-9_-]{32,}\b/gu;
const toolTokenPattern =
  /\b(?:github_pat_[A-Za-z0-9_]{40,}|gh[opsu]_[A-Za-z0-9_]{32,}|npm_[A-Za-z0-9_-]{32,}|vercel_[A-Za-z0-9_-]{32,})\b/gu;
const cloudAccessKeyPattern = /\b(?:A[KS]IA[0-9A-Z]{16}|AIza[0-9A-Za-z_-]{35})\b/gu;

export function redactSensitiveText(value: string): string {
  return value
    .replace(cookieHeaderPattern, (_match, linePrefix: string, headerPrefix: string, headerValue: string) => {
      return `${linePrefix}${headerPrefix}${redactCookiePairs(headerValue)}`;
    })
    .replace(setCookieHeaderPattern, (_match, linePrefix: string, headerPrefix: string, headerValue: string) => {
      return `${linePrefix}${headerPrefix}${redactFirstCookiePair(headerValue)}`;
    })
    .replace(
      quotedCookieHeaderPattern,
      (_match, keyQuote: string, key: string, separator: string, valueQuote: string, headerValue: string) => {
        const redactedValue = key.toLowerCase() === 'set-cookie'
          ? redactFirstCookiePair(headerValue)
          : redactCookiePairs(headerValue);

        return `${keyQuote}${key}${keyQuote}${separator}${valueQuote}${redactedValue}${valueQuote}`;
      }
    )
    .replace(
      quotedSensitiveKeyValuePattern,
      (_match, keyQuote: string, key: string, separator: string, valueQuote: string) => {
        return `${keyQuote}${key}${keyQuote}${separator}${valueQuote}${redacted}${valueQuote}`;
      }
    )
    .replace(authorizationHeaderPattern, `$1$2$3$4$5${redacted}$7`)
    .replace(urlUserInfoPattern, `$1${redacted}@`)
    .replace(urlPattern, (url) => redactUrlParameters(url))
    .replace(jwtTokenPattern, redacted)
    .replace(providerApiKeyPattern, redacted)
    .replace(toolTokenPattern, redacted)
    .replace(cloudAccessKeyPattern, redacted)
    .replace(sensitiveKeyValuePattern, `$1$2${redacted}`);
}

function redactUrlParameters(value: string): string {
  const queryStart = value.indexOf('?');
  const hashStart = value.indexOf('#');

  if (queryStart === -1 || (hashStart !== -1 && hashStart < queryStart)) {
    return redactUrlFragment(value);
  }

  const urlPrefix = value.slice(0, queryStart);
  const query = value.slice(queryStart + 1, hashStart === -1 ? value.length : hashStart);
  const hash = hashStart === -1 ? '' : redactFragment(value.slice(hashStart));
  const sanitizedQuery = redactUrlParameterString(query);

  return `${urlPrefix}?${sanitizedQuery}${hash}`;
}

function redactUrlFragment(value: string): string {
  const hashStart = value.indexOf('#');

  if (hashStart === -1) {
    return value;
  }

  const urlPrefix = value.slice(0, hashStart);
  const hash = redactFragment(value.slice(hashStart));

  return `${urlPrefix}${hash}`;
}

function redactFragment(hash: string): string {
  const fragment = hash.slice(1);
  const fragmentQueryStart = fragment.indexOf('?');

  if (fragmentQueryStart !== -1) {
    const route = fragment.slice(0, fragmentQueryStart);
    const query = fragment.slice(fragmentQueryStart + 1);

    return `#${route}?${redactUrlParameterString(query)}`;
  }

  if (!fragment.includes('=')) {
    return hash;
  }

  return `#${redactUrlParameterString(fragment)}`;
}

function redactUrlParameterString(value: string): string {
  return value
    .split('&')
    .map((part) => redactUrlParameterPart(part))
    .join('&');
}

function redactUrlParameterPart(part: string): string {
  const equalsIndex = part.indexOf('=');
  const key = equalsIndex === -1 ? part : part.slice(0, equalsIndex);

  if (!isSensitiveQueryKey(key)) {
    return part;
  }

  return equalsIndex === -1 ? key : `${key}=${redacted}`;
}

function isSensitiveQueryKey(key: string): boolean {
  const normalizedKey = safeDecodeURIComponent(key).toLowerCase().replace(/[^a-z0-9]/gu, '');

  return (
    normalizedKey === 'code' ||
    normalizedKey === 'sig' ||
    normalizedKey === 'signature' ||
    normalizedKey === 'xamzcredential' ||
    normalizedKey === 'xamzsignature' ||
    normalizedKey === 'awsaccesskeyid' ||
    /(?:apikey|token|secret|password|passcode|session|jwt|csrf|privatekey|servicerole|authorization)/u.test(
      normalizedKey
    )
  );
}

function safeDecodeURIComponent(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function redactCookiePairs(value: string): string {
  return value
    .split(';')
    .map((part) => redactCookiePair(part))
    .join(';');
}

function redactFirstCookiePair(value: string): string {
  const parts = value.split(';');
  const [firstPart, ...rest] = parts;

  return [redactCookiePair(firstPart ?? ''), ...rest].join(';');
}

function redactCookiePair(value: string): string {
  return value.replace(/^(\s*[^=;\s]+)(=)([^;]*)$/u, (_match, key: string, separator: string) => {
    return `${key}${separator}${redacted}`;
  });
}
