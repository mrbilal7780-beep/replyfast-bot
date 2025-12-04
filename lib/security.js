import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// ═══════════════════════════════════════════════════════════
// 🔐 AUTHENTICATION MIDDLEWARE
// ═══════════════════════════════════════════════════════════

/**
 * Vérifie l'authentification Supabase
 * Usage:
 *   const { user, error } = await authenticateRequest(req);
 *   if (error) return res.status(401).json({ error });
 */
export async function authenticateRequest(req) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { user: null, error: 'Missing or invalid Authorization header' };
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return { user: null, error: 'Invalid or expired token' };
    }

    return { user, error: null, supabase };
  } catch (err) {
    return { user: null, error: 'Authentication failed: ' + err.message };
  }
}

// ═══════════════════════════════════════════════════════════
// 🚦 RATE LIMITING
// ═══════════════════════════════════════════════════════════

const rateLimitStore = new Map();

/**
 * Rate limiting simple en mémoire
 * Pour production: utiliser Redis ou service externe
 *
 * @param {string} identifier - IP, user ID, ou autre identifiant unique
 * @param {number} maxRequests - Nombre max de requêtes
 * @param {number} windowMs - Fenêtre de temps en ms
 * @returns {{ allowed: boolean, retryAfter?: number }}
 */
export function rateLimit(identifier, maxRequests = 10, windowMs = 60000) {
  const now = Date.now();
  const windowStart = now - windowMs;

  if (!rateLimitStore.has(identifier)) {
    rateLimitStore.set(identifier, []);
  }

  // Nettoyer les anciennes requêtes
  const requests = rateLimitStore.get(identifier).filter(time => time > windowStart);

  if (requests.length >= maxRequests) {
    const oldestRequest = requests[0];
    const retryAfter = Math.ceil((oldestRequest + windowMs - now) / 1000);
    return { allowed: false, retryAfter };
  }

  requests.push(now);
  rateLimitStore.set(identifier, requests);

  return { allowed: true };
}

/**
 * Helper pour obtenir l'IP du client
 */
export function getClientIp(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0] ||
    req.headers['x-real-ip'] ||
    req.socket.remoteAddress ||
    'unknown'
  );
}

// ═══════════════════════════════════════════════════════════
// 🔏 WEBHOOK SIGNATURE VERIFICATION (Meta/Facebook)
// ═══════════════════════════════════════════════════════════

/**
 * Vérifie la signature d'un webhook Meta/Facebook
 *
 * @param {string|Buffer} payload - Corps de la requête (raw)
 * @param {string} signature - Header x-hub-signature-256
 * @param {string} appSecret - Secret de l'app Meta
 * @returns {boolean}
 */
export function verifyMetaWebhookSignature(payload, signature, appSecret) {
  if (!signature || !appSecret) {
    return false;
  }

  try {
    const hmac = crypto.createHmac('sha256', appSecret);
    const payloadString = typeof payload === 'string' ? payload : payload.toString('utf8');
    const expectedSignature = 'sha256=' + hmac.update(payloadString).digest('hex');

    // Utiliser timingSafeEqual pour éviter les timing attacks
    const signatureBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (signatureBuffer.length !== expectedBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
  } catch (error) {
    console.error('❌ Erreur vérification signature webhook:', error);
    return false;
  }
}

// ═══════════════════════════════════════════════════════════
// 🛡️ INPUT VALIDATION
// ═══════════════════════════════════════════════════════════

/**
 * Valide un email
 */
export function validateEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}

/**
 * Valide un numéro de téléphone (format international)
 */
export function validatePhone(phone) {
  if (!phone || typeof phone !== 'string') return false;
  // Format: +33612345678 ou +1234567890
  const phoneRegex = /^\+\d{10,15}$/;
  return phoneRegex.test(phone);
}

/**
 * Valide une date ISO (YYYY-MM-DD)
 */
export function validateIsoDate(date) {
  if (!date || typeof date !== 'string') return false;
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) return false;

  const parsedDate = new Date(date);
  return !isNaN(parsedDate.getTime());
}

/**
 * Valide une heure (HH:MM format 24h)
 */
export function validateTime(time) {
  if (!time || typeof time !== 'string') return false;
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  return timeRegex.test(time);
}

/**
 * Sanitize string pour éviter XSS
 */
export function escapeHtml(unsafe) {
  if (!unsafe) return '';
  return unsafe
    .toString()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Valide les données d'une notification email
 */
export function validateNotificationRequest(body) {
  const { type, recipientEmail, data } = body;

  if (!type || typeof type !== 'string') {
    return { valid: false, error: 'Invalid type' };
  }

  if (!recipientEmail || !validateEmail(recipientEmail)) {
    return { valid: false, error: 'Invalid recipient email' };
  }

  const allowedTypes = [
    'appointment_reminder',
    'new_client',
    'new_message',
    'appointment_confirmed',
    'appointment_cancelled'
  ];

  if (!allowedTypes.includes(type)) {
    return { valid: false, error: `Unknown notification type: ${type}` };
  }

  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Invalid data object' };
  }

  return { valid: true };
}

/**
 * Valide les messages pour l'AI assistant
 */
export function validateAIAssistantRequest(body) {
  const { messages, context } = body;

  if (!messages || !Array.isArray(messages)) {
    return { valid: false, error: 'Invalid messages array' };
  }

  if (messages.length === 0) {
    return { valid: false, error: 'Messages array is empty' };
  }

  if (messages.length > 50) {
    return { valid: false, error: 'Too many messages (max 50)' };
  }

  // Vérifier que chaque message a role et content
  for (const msg of messages) {
    if (!msg.role || !msg.content) {
      return { valid: false, error: 'Each message must have role and content' };
    }
    if (!['user', 'assistant', 'system'].includes(msg.role)) {
      return { valid: false, error: 'Invalid message role' };
    }
    if (typeof msg.content !== 'string') {
      return { valid: false, error: 'Message content must be string' };
    }
    if (msg.content.length > 10000) {
      return { valid: false, error: 'Message content too long (max 10000 chars)' };
    }
  }

  if (!context || typeof context !== 'object') {
    return { valid: false, error: 'Invalid context object' };
  }

  return { valid: true };
}

// ═══════════════════════════════════════════════════════════
// 🔒 AUTHORIZATION (IDOR Prevention)
// ═══════════════════════════════════════════════════════════

/**
 * Vérifie qu'un utilisateur a accès à une ressource
 *
 * @param {object} user - Utilisateur authentifié
 * @param {string} resourceOwnerEmail - Email du propriétaire de la ressource
 * @returns {boolean}
 */
export function authorizeResourceAccess(user, resourceOwnerEmail) {
  if (!user || !user.email) {
    return false;
  }

  return user.email === resourceOwnerEmail;
}

/**
 * Vérifie qu'un RDV appartient à l'utilisateur
 */
export async function authorizeAppointmentAccess(supabase, user, appointmentId) {
  const { data, error } = await supabase
    .from('appointments')
    .select('client_email')
    .eq('id', appointmentId)
    .single();

  if (error || !data) {
    return { authorized: false, error: 'Appointment not found' };
  }

  if (data.client_email !== user.email) {
    return { authorized: false, error: 'Access denied' };
  }

  return { authorized: true, error: null };
}

// ═══════════════════════════════════════════════════════════
// 📊 LOGGING (Production-Safe)
// ═══════════════════════════════════════════════════════════

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Log sécurisé qui masque les données sensibles en production
 */
export function secureLog(level, message, data = {}) {
  const sanitizedData = isProduction ? sanitizeLogData(data) : data;

  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...sanitizedData
  };

  if (level === 'error') {
    console.error(JSON.stringify(logEntry));
  } else {
    console.log(JSON.stringify(logEntry));
  }
}

/**
 * Masque les données sensibles
 */
function sanitizeLogData(data) {
  const sanitized = { ...data };

  // Masquer les emails
  if (sanitized.email) {
    const [local, domain] = sanitized.email.split('@');
    sanitized.email = `${local.substring(0, 2)}***@${domain}`;
  }

  // Masquer les téléphones
  if (sanitized.phone) {
    sanitized.phone = sanitized.phone.substring(0, 4) + '***';
  }

  // Masquer les tokens
  if (sanitized.token) {
    sanitized.token = '***';
  }

  return sanitized;
}
