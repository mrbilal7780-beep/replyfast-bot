# 🔒 SECURITY AUDIT REPORT - ReplyFast AI
**Date:** 2025-12-02
**Auditor:** Claude
**Scope:** Full codebase security review

---

## ⚠️ CRITICAL VULNERABILITIES (Must Fix Immediately)

### 1. **No Authentication on API Endpoints**
**Severity:** 🔴 CRITICAL
**Files:** `pages/api/ai-assistant.js`, `pages/api/send-notification-email.js`

**Issue:**
These API endpoints are publicly accessible without any authentication. Anyone can:
- Consume OpenAI quota by hitting `/api/ai-assistant`
- Send fake email notifications via `/api/send-notification-email`
- Cause denial of service through resource exhaustion

**Vulnerable Code:**
```javascript
// pages/api/ai-assistant.js (line 7-10)
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  // ❌ NO AUTHENTICATION CHECK HERE
  const { messages, context } = req.body;
```

**Fix:**
```javascript
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // ✅ Verify authentication
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      global: {
        headers: { Authorization: authHeader }
      }
    }
  );

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  // Continue with authenticated request...
}
```

---

### 2. **Missing Webhook Signature Verification**
**Severity:** 🔴 CRITICAL
**Files:** `pages/api/bot.js`, `pages/api/webhook.js`

**Issue:**
No verification of Meta's webhook signature (`x-hub-signature-256`). Attackers can:
- Send fake webhook payloads
- Trigger unauthorized database insertions
- Access other clients' data via IDOR

**Vulnerable Code:**
```javascript
// pages/api/bot.js (line 171-181)
export default async function handler(req, res) {
  if (req.method === 'GET') {
    // ...
  }
  // ❌ NO SIGNATURE VERIFICATION
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
```

**Fix:**
```javascript
import crypto from 'crypto';

function verifyWebhookSignature(payload, signature) {
  const hmac = crypto.createHmac('sha256', process.env.META_APP_SECRET);
  const expectedSignature = 'sha256=' + hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const signature = req.headers['x-hub-signature-256'];
    const rawBody = await getRawBody(req);

    // ✅ Verify signature
    if (!signature || !verifyWebhookSignature(rawBody.toString('utf8'), signature)) {
      return res.status(403).json({ error: 'Invalid signature' });
    }

    const body = JSON.parse(rawBody.toString('utf8'));
    // Continue processing...
  }
}
```

---

### 3. **Hardcoded Secrets**
**Severity:** 🟠 HIGH
**Files:** `pages/api/bot.js:177`, `pages/api/webhook.js:177`

**Issue:**
Webhook verify token is hardcoded in source code and committed to git.

**Vulnerable Code:**
```javascript
if (mode === 'subscribe' && token === 'replyfast_webhook_secret_2025') {
```

**Fix:**
```javascript
if (mode === 'subscribe' && token === process.env.WEBHOOK_VERIFY_TOKEN) {
```

Add to `.env`:
```
WEBHOOK_VERIFY_TOKEN=replyfast_webhook_secret_2025
```

---

### 4. **XSS in Email Templates**
**Severity:** 🟠 HIGH
**Files:** `pages/api/send-notification-email.js`

**Issue:**
User input is directly interpolated into HTML email templates without sanitization. Attackers can inject malicious scripts.

**Vulnerable Code:**
```javascript
// Line 31
<p>Bonjour ${data.clientName || 'cher client'},</p>
// Line 46
subject: `Nouveau client: ${data.clientName || 'Inconnu'}`,
```

**Attack Example:**
```javascript
{
  clientName: "<img src=x onerror='alert(document.cookie)'>"
}
```

**Fix:**
```javascript
// Add HTML escaping function
function escapeHtml(unsafe) {
  if (!unsafe) return '';
  return unsafe
    .toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Use it in templates:
<p>Bonjour ${escapeHtml(data.clientName) || 'cher client'},</p>
subject: `Nouveau client: ${escapeHtml(data.clientName) || 'Inconnu'}`,
```

---

## 🟡 HIGH PRIORITY VULNERABILITIES

### 5. **No Rate Limiting**
**Severity:** 🟠 HIGH
**Files:** All API routes

**Issue:**
No rate limiting on any endpoint. Attackers can:
- DoS the application
- Exhaust OpenAI quota
- Spam webhooks

**Fix:** Implement rate limiting middleware
```javascript
// lib/rateLimiter.js
const rateLimitMap = new Map();

export function rateLimit(identifier, maxRequests = 10, windowMs = 60000) {
  const now = Date.now();
  const windowStart = now - windowMs;

  if (!rateLimitMap.has(identifier)) {
    rateLimitMap.set(identifier, []);
  }

  const requests = rateLimitMap.get(identifier).filter(time => time > windowStart);

  if (requests.length >= maxRequests) {
    return { allowed: false, retryAfter: Math.ceil((requests[0] + windowMs - now) / 1000) };
  }

  requests.push(now);
  rateLimitMap.set(identifier, requests);
  return { allowed: true };
}

// Usage in API route:
const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
const { allowed, retryAfter } = rateLimit(clientIp, 10, 60000);

if (!allowed) {
  return res.status(429).json({
    error: 'Too many requests',
    retryAfter: retryAfter
  });
}
```

---

### 6. **Insufficient Input Validation**
**Severity:** 🟠 HIGH
**Files:** `pages/api/ai-assistant.js`, `pages/api/send-notification-email.js`

**Issue:**
Minimal validation of request bodies. Can lead to unexpected behavior or crashes.

**Fix:** Add comprehensive validation
```javascript
// lib/validators.js
export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateNotificationRequest(body) {
  const { type, recipientEmail, data } = body;

  if (!type || typeof type !== 'string') {
    return { valid: false, error: 'Invalid type' };
  }

  if (!recipientEmail || !validateEmail(recipientEmail)) {
    return { valid: false, error: 'Invalid email' };
  }

  const allowedTypes = ['appointment_reminder', 'new_client', 'new_message', 'appointment_confirmed', 'appointment_cancelled'];
  if (!allowedTypes.includes(type)) {
    return { valid: false, error: 'Unknown notification type' };
  }

  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Invalid data object' };
  }

  return { valid: true };
}

// Usage:
const validation = validateNotificationRequest(req.body);
if (!validation.valid) {
  return res.status(400).json({ error: validation.error });
}
```

---

### 7. **IDOR (Insecure Direct Object Reference)**
**Severity:** 🟠 HIGH
**Files:** Multiple API routes

**Issue:**
No verification that authenticated users can only access their own data. User A could potentially access User B's appointments, messages, etc.

**Example Vulnerable Pattern:**
```javascript
// If user provides appointmentId in request, we should verify ownership
const { appointmentId } = req.body;
const { data } = await supabase
  .from('appointments')
  .select('*')
  .eq('id', appointmentId)
  .single();
// ❌ No check if appointment belongs to authenticated user
```

**Fix:**
```javascript
const { appointmentId } = req.body;
const { data } = await supabase
  .from('appointments')
  .select('*')
  .eq('id', appointmentId)
  .eq('client_email', user.email) // ✅ Verify ownership
  .single();

if (!data) {
  return res.status(404).json({ error: 'Appointment not found or access denied' });
}
```

---

## 🟢 MEDIUM PRIORITY ISSUES

### 8. **Missing CSRF Protection**
**Severity:** 🟡 MEDIUM
**Issue:** No CSRF tokens for state-changing operations

**Fix:** Next.js API routes are generally safe from CSRF when using proper authentication (tokens in headers, not cookies). Ensure all authenticated requests use `Authorization: Bearer <token>` header, not cookie-based auth.

---

### 9. **Missing Security Headers**
**Severity:** 🟡 MEDIUM

**Fix:** Add to `next.config.js`:
```javascript
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};
```

---

### 10. **Sensitive Data in Console Logs**
**Severity:** 🟡 MEDIUM
**Files:** Multiple

**Issue:**
API keys, customer phone numbers, email addresses logged to console.

**Examples:**
```javascript
console.log('✅ Client trouvé:', client.email); // Line 228
console.log('📱 Message reçu:', fromNumber, '|', incomingMessage); // Line 202
```

**Fix:** Remove or sanitize sensitive data in production
```javascript
const isProduction = process.env.NODE_ENV === 'production';

if (!isProduction) {
  console.log('✅ Client trouvé:', client.email);
} else {
  console.log('✅ Client trouvé:', client.email.substring(0, 3) + '***');
}
```

---

## 📋 SECURITY CHECKLIST

### Immediate Actions (This Week)
- [ ] Add authentication to all API routes
- [ ] Implement webhook signature verification
- [ ] Move hardcoded secrets to environment variables
- [ ] Add HTML escaping to email templates
- [ ] Implement rate limiting on all endpoints

### Short Term (This Month)
- [ ] Add comprehensive input validation
- [ ] Fix all IDOR vulnerabilities
- [ ] Add security headers via next.config.js
- [ ] Remove sensitive data from logs
- [ ] Set up monitoring/alerting for failed auth attempts

### Long Term (Ongoing)
- [ ] Regular security audits
- [ ] Dependency vulnerability scanning (`npm audit`)
- [ ] Implement WAF (Web Application Firewall)
- [ ] Add API request logging for forensics
- [ ] Set up intrusion detection

---

## 🔧 RECOMMENDED SECURITY LIBRARIES

```bash
npm install helmet                    # Security headers
npm install express-rate-limit        # Rate limiting
npm install validator                 # Input validation
npm install dompurify                 # XSS protection
npm install crypto                    # Signature verification (built-in)
```

---

## 🎯 PRIORITY MATRIX

| Vulnerability | Severity | Ease of Fix | Priority |
|--------------|----------|-------------|----------|
| No Auth on APIs | Critical | Easy | 1 |
| No Webhook Verification | Critical | Easy | 1 |
| Hardcoded Secrets | High | Easy | 2 |
| XSS in Emails | High | Easy | 2 |
| No Rate Limiting | High | Medium | 3 |
| Input Validation | High | Medium | 3 |
| IDOR | High | Medium | 4 |
| CSRF Protection | Medium | Easy | 5 |
| Security Headers | Medium | Easy | 5 |
| Sensitive Logs | Medium | Easy | 6 |

---

## ✅ POSITIVE FINDINGS

1. ✅ Using Supabase with parameterized queries (no SQL injection)
2. ✅ HTTPS enforced via Next.js/Vercel
3. ✅ Using environment variables for most secrets
4. ✅ Proper error handling in most routes
5. ✅ Using bcrypt/Supabase Auth for password hashing

---

## 📞 CONTACT

For questions about this audit, refer to the implementation recommendations above.

**Next Steps:** Implement fixes in priority order, starting with Critical vulnerabilities.
