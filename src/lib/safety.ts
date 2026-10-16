/**
 * Community Safety Filter for Colo de Mãe
 * First-layer security check before posting, commenting, or messaging.
 */

export interface SafetyCheckResult {
  blocked: boolean;
  blockReason?: string;
  hasRiskWords: boolean;
  matchedRiskWord?: string;
}

// 1. Risk phrases list in PT, ES, EN
export const RISK_PHRASES = [
  // Portuguese
  'quero morrer',
  'me matar',
  'acabar com tudo',
  'nao aguento mais viver',
  'não aguento mais viver',
  'machucar meu bebe',
  'machucar meu bebê',
  'me cortar',
  'tirar minha vida',
  'fazer mal ao meu bebe',
  'fazer mal ao meu bebê',
  // Spanish
  'quiero morir',
  'matarme',
  'acabar con todo',
  'no aguanto mas vivir',
  'no aguanto más vivir',
  'lastimar a mi bebe',
  'lastimar a mi bebé',
  'cortarme',
  // English
  'want to die',
  'kill myself',
  'end it all',
  'cant go on living',
  'can not go on living',
  'hurt my baby',
  'harm myself',
  'cut myself',
];

// Regex patterns to block
const URL_PATTERN = /(https?:\/\/|www\.|\.com\b|\.br\b|\.net\b|\.org\b|\.io\b|\.me\b|bit\.ly|t\.co|wa\.me)/i;
const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i;
const SOCIAL_HANDLE_PATTERN = /@[a-zA-Z0-9_.-]{3,}/;

// Phone pattern: 8 or more digits separated by optional spaces, dashes, dots, or parens
const PHONE_PATTERN = /(?:\+?55\s*)?(?:\(?\d{2}\)?\s*)?(?:9?\s*\d{4}[-\s.]?\d{4}|\d{8,11})/;

// Pix patterns:
// - CPF: 11 digits or formatted
// - CNPJ: 14 digits or formatted
// - UUID format key
// - Word "pix" followed by words/numbers
const PIX_UUID_PATTERN = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
const PIX_KEYWORD_PATTERN = /\bpix\s*[:=-]?\s*([a-zA-Z0-9._%+-]+|\d+)/i;

// Social messaging keywords followed by contact attempts
const MESSAGING_KEYWORD_PATTERN = /\b(whatsapp|whats|zap|telegram|insta|instagram)\b\s*[:=-]?\s*([a-zA-Z0-9_.-]+|\d+)/i;

export function checkSafety(text: string): SafetyCheckResult {
  const normalized = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const rawText = text.toLowerCase();

  // 1. Check for blocked external contact details
  if (URL_PATTERN.test(text)) {
    return {
      blocked: true,
      blockReason: 'Para proteger a comunidade, não é permitido compartilhar links ou páginas externas.',
      hasRiskWords: false,
    };
  }

  if (EMAIL_PATTERN.test(text)) {
    return {
      blocked: true,
      blockReason: 'Para proteger sua privacidade, não é permitido compartilhar endereços de e-mail.',
      hasRiskWords: false,
    };
  }

  if (SOCIAL_HANDLE_PATTERN.test(text)) {
    return {
      blocked: true,
      blockReason: 'Para manter o ambiente 100% anônimo, não é permitido compartilhar perfis de redes sociais.',
      hasRiskWords: false,
    };
  }

  if (PIX_UUID_PATTERN.test(text) || PIX_KEYWORD_PATTERN.test(text)) {
    return {
      blocked: true,
      blockReason: 'Por segurança e conformidade, é estritamente proibido compartilhar chaves Pix ou pedir dinheiro.',
      hasRiskWords: false,
    };
  }

  if (MESSAGING_KEYWORD_PATTERN.test(text)) {
    return {
      blocked: true,
      blockReason: 'Para proteger a comunidade, não é permitido compartilhar WhatsApp, Telegram ou Instagram.',
      hasRiskWords: false,
    };
  }

  // Count raw digits in text to prevent hidden phone numbers like "9 8 7 6 5 - 4 3 2 1"
  const digitsOnly = text.replace(/\D/g, '');
  if (digitsOnly.length >= 8 && digitsOnly.length <= 15) {
    // If it looks like a phone number sequence
    if (PHONE_PATTERN.test(text)) {
      return {
        blocked: true,
        blockReason: 'Para proteger a sua segurança e a da comunidade, não é permitido compartilhar números de telefone.',
        hasRiskWords: false,
      };
    }
  }

  // 2. Check for risk expressions
  for (const phrase of RISK_PHRASES) {
    const normalizedPhrase = phrase.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (normalized.includes(normalizedPhrase) || rawText.includes(phrase)) {
      console.warn(`[SAFETY TRIGGER] Acolhimento acionado para a expressão: "${phrase}"`);
      return {
        blocked: false,
        hasRiskWords: true,
        matchedRiskWord: phrase,
      };
    }
  }

  return {
    blocked: false,
    hasRiskWords: false,
  };
}

// 3. Rate limiting checks
const POST_TIMESTAMPS_KEY = 'colodemae_last_post_ts';
const DM_DAILY_COUNT_KEY = 'colodemae_dm_count_';

export function checkPostRateLimit(): { allowed: boolean; waitSeconds?: number } {
  const lastTs = localStorage.getItem(POST_TIMESTAMPS_KEY);
  if (!lastTs) return { allowed: true };

  const diffMs = Date.now() - parseInt(lastTs, 10);
  const twoMinutesMs = 2 * 60 * 1000;

  if (diffMs < twoMinutesMs) {
    const waitSeconds = Math.ceil((twoMinutesMs - diffMs) / 1000);
    return { allowed: false, waitSeconds };
  }
  return { allowed: true };
}

export function recordPostSent(): void {
  localStorage.setItem(POST_TIMESTAMPS_KEY, Date.now().toString());
}

export function checkDmRateLimit(userCreatedAt?: string): { allowed: boolean; remaining: number } {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const storageKey = DM_DAILY_COUNT_KEY + dateStr;

  const currentCount = parseInt(localStorage.getItem(storageKey) || '0', 10);

  // Check account age: if under 7 days old, limit to 20 msgs/day
  let accountAgeDays = 30; // default mature account
  if (userCreatedAt) {
    const created = new Date(userCreatedAt);
    accountAgeDays = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
  }

  const maxDaily = accountAgeDays < 7 ? 20 : 100;

  if (currentCount >= maxDaily) {
    return { allowed: false, remaining: 0 };
  }

  return { allowed: true, remaining: maxDaily - currentCount };
}

export function recordDmSent(): void {
  const dateStr = new Date().toISOString().split('T')[0];
  const storageKey = DM_DAILY_COUNT_KEY + dateStr;
  const currentCount = parseInt(localStorage.getItem(storageKey) || '0', 10);
  localStorage.setItem(storageKey, (currentCount + 1).toString());
}
