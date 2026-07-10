const maskSensitive = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  const redacted = Array.isArray(obj) ? [] : {};
  for (const key of Object.keys(obj)) {
    const lower = key.toLowerCase();
    if (lower.includes('password') || lower.includes('secret') || lower.includes('token') || lower.includes('api_key') || lower.includes('apikey')) {
      redacted[key] = '[REDACTED]';
    } else if (typeof obj[key] === 'object') {
      redacted[key] = maskSensitive(obj[key]);
    } else {
      redacted[key] = obj[key];
    }
  }
  return redacted;
};

const requestLogger = (req, res, next) => {
  const start = process.hrtime();

  res.on('finish', () => {
    const [s, ns] = process.hrtime(start);
    const durationMs = (s * 1e3 + ns / 1e6).toFixed(2);
    const parts = [`${req.method}`, req.originalUrl, `status=${res.statusCode}`, `time=${durationMs}ms`];

    // Optionally include masked body for non-GET requests (kept small)
    if (req.body && Object.keys(req.body).length > 0) {
      try {
        const masked = maskSensitive(req.body);
        parts.push(`body=${JSON.stringify(masked)}`);
      } catch (e) {
        // ignore serialization errors
      }
    }

    console.info(parts.join(' | '));
  });

  next();
};

export default requestLogger;
