import { redactSensitiveText as legacyRedactSensitiveText } from '../../src/shared/privacy-redaction.js';
import { redactSensitiveText } from '../../packages/acceptance/src/index.js';
import { redactSensitiveText as packageRedactSensitiveText } from '../../packages/shared/src/privacy-redaction.js';

describe('redactSensitiveText', () => {
  it('keeps package-owned and legacy shared redaction outputs aligned', () => {
    const text = [
      'Authorization: Bearer shared-secret',
      'https://example.com/callback?token=query-secret&state=public'
    ].join('\n');

    expect(packageRedactSensitiveText(text)).toBe(legacyRedactSensitiveText(text));
    expect(packageRedactSensitiveText(text)).toContain('[REDACTED]');
  });

  it('keeps sensitive key names while redacting values', () => {
    const text = [
      'OPENAI_API_KEY=sk-live-secret',
      'SUPABASE_SERVICE_ROLE_KEY: super-secret-token',
      'password="hunter2"',
      "PRIVATE_KEY='-----BEGIN PRIVATE KEY-----'"
    ].join('\n');

    const redacted = redactSensitiveText(text);

    expect(redacted).toContain('OPENAI_API_KEY=[REDACTED]');
    expect(redacted).toContain('SUPABASE_SERVICE_ROLE_KEY: [REDACTED]');
    expect(redacted).toContain('password=[REDACTED]');
    expect(redacted).toContain('PRIVATE_KEY=[REDACTED]');
    expect(redacted).not.toContain('sk-live-secret');
    expect(redacted).not.toContain('super-secret-token');
    expect(redacted).not.toContain('hunter2');
  });

  it('redacts quoted object keys that contain sensitive values', () => {
    const text = [
      '{"apiKey":"json-api-secret","project":"demo"}',
      '"accessToken": "json-access-token"',
      "'client_secret': 'object-client-secret'",
      '"NEXTAUTH_SESSION_TOKEN": "json-session-secret"'
    ].join('\n');

    const redacted = redactSensitiveText(text);

    expect(redacted).toContain('"apiKey":"[REDACTED]"');
    expect(redacted).toContain('"project":"demo"');
    expect(redacted).toContain('"accessToken": "[REDACTED]"');
    expect(redacted).toContain("'client_secret': '[REDACTED]'");
    expect(redacted).toContain('"NEXTAUTH_SESSION_TOKEN": "[REDACTED]"');
    expect(redacted).not.toContain('json-api-secret');
    expect(redacted).not.toContain('json-access-token');
    expect(redacted).not.toContain('object-client-secret');
    expect(redacted).not.toContain('json-session-secret');
  });

  it('redacts quoted authorization object credentials', () => {
    const text = [
      '{"Authorization":"Bearer json-bearer-token","ok":true}',
      '"authorization": "ApiKey json-api-key-token"',
      "'Proxy-Authorization': 'Digest json-proxy-digest'"
    ].join('\n');

    const redacted = redactSensitiveText(text);

    expect(redacted).toContain('"Authorization":"[REDACTED]"');
    expect(redacted).toContain('"ok":true');
    expect(redacted).toContain('"authorization": "[REDACTED]"');
    expect(redacted).toContain("'Proxy-Authorization': '[REDACTED]'");
    expect(redacted).not.toContain('json-bearer-token');
    expect(redacted).not.toContain('json-api-key-token');
    expect(redacted).not.toContain('json-proxy-digest');
  });

  it('redacts authorization bearer tokens in logs', () => {
    const redacted = redactSensitiveText('Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');

    expect(redacted).toBe('Authorization: Bearer [REDACTED]');
  });

  it('redacts non-bearer authorization header credentials', () => {
    const text = [
      'Authorization: Basic dXNlcjpwYXNz',
      'authorization: ApiKey api-key-secret',
      'Proxy-Authorization: Digest digest-secret',
      "Authorization: 'Basic quoted-secret'",
      'Proxy-Authorization: "Digest quoted-proxy-secret"'
    ].join('\n');

    const redacted = redactSensitiveText(text);

    expect(redacted).toContain('Authorization: Basic [REDACTED]');
    expect(redacted).toContain('authorization: ApiKey [REDACTED]');
    expect(redacted).toContain('Proxy-Authorization: Digest [REDACTED]');
    expect(redacted).toContain("Authorization: 'Basic [REDACTED]'");
    expect(redacted).toContain('Proxy-Authorization: "Digest [REDACTED]"');
    expect(redacted).not.toContain('dXNlcjpwYXNz');
    expect(redacted).not.toContain('api-key-secret');
    expect(redacted).not.toContain('digest-secret');
    expect(redacted).not.toContain('quoted-secret');
    expect(redacted).not.toContain('quoted-proxy-secret');
  });

  it('redacts session, cookie, jwt, and csrf values', () => {
    const text = [
      'Cookie: session=abc123; csrftoken=csrf-secret',
      'NEXTAUTH_SESSION_TOKEN=session-token',
      'jwt=header.payload.signature'
    ].join('\n');

    const redacted = redactSensitiveText(text);

    expect(redacted).toContain('Cookie: session=[REDACTED]');
    expect(redacted).toContain('csrftoken=[REDACTED]');
    expect(redacted).toContain('NEXTAUTH_SESSION_TOKEN=[REDACTED]');
    expect(redacted).toContain('jwt=[REDACTED]');
    expect(redacted).not.toContain('abc123');
    expect(redacted).not.toContain('csrf-secret');
    expect(redacted).not.toContain('session-token');
    expect(redacted).not.toContain('header.payload.signature');
  });

  it('redacts standalone JWT-looking tokens in logs', () => {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMifQ.signature-secret';
    const redacted = redactSensitiveText(`Token payload leaked: ${token}`);

    expect(redacted).toBe('Token payload leaked: [REDACTED]');
    expect(redacted).not.toContain(token);
    expect(redacted).not.toContain('signature-secret');
  });

  it('redacts standalone provider API keys in logs', () => {
    const openAiKey = 'sk-1234567890abcdefghijklmnopqrstuvwxyzABCD';
    const anthropicKey = 'sk-ant-api03-1234567890abcdefghijklmnopqrstuvwxyzABCD';
    const redacted = redactSensitiveText(`Provider keys leaked: ${openAiKey} and ${anthropicKey}`);

    expect(redacted).toBe('Provider keys leaked: [REDACTED] and [REDACTED]');
    expect(redacted).not.toContain(openAiKey);
    expect(redacted).not.toContain(anthropicKey);
  });

  it('redacts standalone repository and deployment tokens in logs', () => {
    const githubPat = 'github_pat_11ABCDEFG0abcdefghijklmnopqrstuvwxyz_1234567890abcdef';
    const githubToken = 'ghp_1234567890abcdefghijklmnopqrstuvwxyzABCD';
    const npmToken = 'npm_1234567890abcdefghijklmnopqrstuvwxyzABCD';
    const vercelToken = 'vercel_1234567890abcdefghijklmnopqrstuvwxyzABCD';
    const redacted = redactSensitiveText(
      `Tool tokens leaked: ${githubPat} ${githubToken} ${npmToken} ${vercelToken}`
    );

    expect(redacted).toBe('Tool tokens leaked: [REDACTED] [REDACTED] [REDACTED] [REDACTED]');
    expect(redacted).not.toContain(githubPat);
    expect(redacted).not.toContain(githubToken);
    expect(redacted).not.toContain(npmToken);
    expect(redacted).not.toContain(vercelToken);
  });

  it('redacts standalone cloud provider access keys in logs', () => {
    const awsAccessKey = 'AKIA1234567890ABCDEF';
    const awsSessionKey = 'ASIA1234567890ABCDEF';
    const googleApiKey = 'AIza1234567890abcdefghijklmnopqrstuvwxy';
    const redacted = redactSensitiveText(`Cloud keys leaked: ${awsAccessKey} ${awsSessionKey} ${googleApiKey}`);

    expect(redacted).toBe('Cloud keys leaked: [REDACTED] [REDACTED] [REDACTED]');
    expect(redacted).not.toContain(awsAccessKey);
    expect(redacted).not.toContain(awsSessionKey);
    expect(redacted).not.toContain(googleApiKey);
  });

  it('redacts all cookie header values while keeping cookie names', () => {
    const text = [
      'Cookie: theme=dark; sid=abc123; visitor_id=visitor-secret',
      'Set-Cookie: preview=preview-secret; Path=/; HttpOnly'
    ].join('\n');

    const redacted = redactSensitiveText(text);

    expect(redacted).toContain('Cookie: theme=[REDACTED]; sid=[REDACTED]; visitor_id=[REDACTED]');
    expect(redacted).toContain('Set-Cookie: preview=[REDACTED]; Path=/; HttpOnly');
    expect(redacted).not.toContain('dark');
    expect(redacted).not.toContain('abc123');
    expect(redacted).not.toContain('visitor-secret');
    expect(redacted).not.toContain('preview-secret');
  });

  it('redacts quoted cookie object values while keeping cookie attributes', () => {
    const text = [
      '{"Cookie":"theme=dark; sid=abc123; visitor_id=visitor-secret"}',
      '"set-cookie": "preview=preview-secret; Path=/; HttpOnly"'
    ].join('\n');

    const redacted = redactSensitiveText(text);

    expect(redacted).toContain('"Cookie":"theme=[REDACTED]; sid=[REDACTED]; visitor_id=[REDACTED]"');
    expect(redacted).toContain('"set-cookie": "preview=[REDACTED]; Path=/; HttpOnly"');
    expect(redacted).not.toContain('dark');
    expect(redacted).not.toContain('abc123');
    expect(redacted).not.toContain('visitor-secret');
    expect(redacted).not.toContain('preview-secret');
  });

  it('redacts URL userinfo credentials in web URLs and connection strings', () => {
    const text = [
      'GET https://alice:browser-pass@example.com/private failed',
      'DATABASE_URL=postgres://db_user:db-pass@db.example.com/app',
      'REDIS_URL=redis://:redis-pass@redis.example.com:6379/0'
    ].join('\n');

    const redacted = redactSensitiveText(text);

    expect(redacted).toContain('https://[REDACTED]@example.com/private');
    expect(redacted).toContain('DATABASE_URL=postgres://[REDACTED]@db.example.com/app');
    expect(redacted).toContain('REDIS_URL=redis://[REDACTED]@redis.example.com:6379/0');
    expect(redacted).not.toContain('alice:browser-pass');
    expect(redacted).not.toContain('db_user:db-pass');
    expect(redacted).not.toContain(':redis-pass');
  });

  it('redacts sensitive query parameters in full URLs while preserving non-sensitive parameters', () => {
    const text = [
      'Open http://localhost:3000/callback?code=oauth-secret&state=public-state&access_token=token-secret#done',
      'Retry https://example.com/settings?tab=team&csrf=csrf-secret'
    ].join('\n');

    const redacted = redactSensitiveText(text);

    expect(redacted).toContain(
      'http://localhost:3000/callback?code=[REDACTED]&state=public-state&access_token=[REDACTED]#done'
    );
    expect(redacted).toContain('https://example.com/settings?tab=team&csrf=[REDACTED]');
    expect(redacted).not.toContain('oauth-secret');
    expect(redacted).not.toContain('token-secret');
    expect(redacted).not.toContain('csrf-secret');
  });

  it('redacts signed URL query credentials while preserving non-sensitive parameters', () => {
    const text = [
      'Fetch https://bucket.s3.amazonaws.com/object?X-Amz-Credential=AKIASECRET%2F20260619%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=aws-signature-secret&X-Amz-Date=20260619T000000Z',
      'Legacy https://bucket.s3.amazonaws.com/object?AWSAccessKeyId=aws-access-key&Signature=legacy-signature-secret&Expires=1800000000',
      'Azure https://account.blob.core.windows.net/container/blob?sp=r&sig=azure-sas-secret&se=2026-06-19'
    ].join('\n');

    const redacted = redactSensitiveText(text);

    expect(redacted).toContain(
      'https://bucket.s3.amazonaws.com/object?X-Amz-Credential=[REDACTED]&X-Amz-Signature=[REDACTED]&X-Amz-Date=20260619T000000Z'
    );
    expect(redacted).toContain(
      'https://bucket.s3.amazonaws.com/object?AWSAccessKeyId=[REDACTED]&Signature=[REDACTED]&Expires=1800000000'
    );
    expect(redacted).toContain(
      'https://account.blob.core.windows.net/container/blob?sp=r&sig=[REDACTED]&se=2026-06-19'
    );
    expect(redacted).not.toContain('AKIASECRET');
    expect(redacted).not.toContain('aws-signature-secret');
    expect(redacted).not.toContain('aws-access-key');
    expect(redacted).not.toContain('legacy-signature-secret');
    expect(redacted).not.toContain('azure-sas-secret');
  });

  it('redacts sensitive fragment parameters in OAuth and SPA callback URLs', () => {
    const text = [
      'Open http://localhost:3000/callback#access_token=fragment-token&state=public-state&id_token=id-secret',
      'Confirm http://localhost:3000/callback#code=fragment-code&state=public-state',
      'Retry http://localhost:3000/#/callback?code=fragment-code&tab=profile'
    ].join('\n');

    const redacted = redactSensitiveText(text);

    expect(redacted).toContain(
      'http://localhost:3000/callback#access_token=[REDACTED]&state=public-state&id_token=[REDACTED]'
    );
    expect(redacted).toContain('http://localhost:3000/callback#code=[REDACTED]&state=public-state');
    expect(redacted).toContain('http://localhost:3000/#/callback?code=[REDACTED]&tab=profile');
    expect(redacted).not.toContain('fragment-token');
    expect(redacted).not.toContain('id-secret');
    expect(redacted).not.toContain('fragment-code');
  });

  it('keeps the package-owned redaction helper aligned with the shared legacy implementation', () => {
    const samples = [
      'OPENAI_API_KEY=sk-live-secret',
      'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
      'Cookie: session=abc123; csrftoken=csrf-secret',
      'Open http://localhost:3000/callback?code=oauth-secret&state=public-state'
    ];

    for (const sample of samples) {
      expect(redactSensitiveText(sample)).toBe(legacyRedactSensitiveText(sample));
    }
  });
});
