import { NICKNAME_ADJECTIVES, NICKNAME_NOUNS } from '../config/constants';

export function generateSuggestedNickname(): string {
  const noun = NICKNAME_NOUNS[Math.floor(Math.random() * NICKNAME_NOUNS.length)];
  const adj = NICKNAME_ADJECTIVES[Math.floor(Math.random() * NICKNAME_ADJECTIVES.length)];
  const num = Math.floor(Math.random() * 89 + 10); // 10 to 99
  return `${noun} ${adj} ${num}`;
}

export interface NicknameValidationResult {
  isValid: boolean;
  errorKey?: string;
}

export function validateNickname(nickname: string): NicknameValidationResult {
  const trimmed = nickname.trim();

  // Length check (3 to 20 chars)
  if (trimmed.length < 3 || trimmed.length > 20) {
    return { isValid: false, errorKey: 'onboarding.nickname_invalid' };
  }

  // No @ symbol
  if (trimmed.includes('@')) {
    return { isValid: false, errorKey: 'onboarding.nickname_invalid' };
  }

  // No links or urls
  const urlPattern = /(https?:\/\/|www\.|\.com|\.br|\.net|\.org|\.io)/i;
  if (urlPattern.test(trimmed)) {
    return { isValid: false, errorKey: 'onboarding.nickname_invalid' };
  }

  // No phone numbers (e.g., 7 or more consecutive digits, or common phone formats)
  const phonePattern = /(\d[\s.-]?){7,}/;
  if (phonePattern.test(trimmed)) {
    return { isValid: false, errorKey: 'onboarding.nickname_invalid' };
  }

  return { isValid: true };
}
