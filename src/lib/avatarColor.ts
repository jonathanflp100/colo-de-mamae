export interface AvatarStyle {
  bg: string;
  text: string;
  initial: string;
}

const PALETTES = [
  { bg: '#F3D6CB', text: '#73392E' }, // Rose soft
  { bg: '#EEF3EA', text: '#435139' }, // Sage light
  { bg: '#FBEFEA', text: '#8C4A3C' }, // Pale Terracotta
  { bg: '#EAE5F3', text: '#4C3B68' }, // Gentle Lavender
  { bg: '#FCEFD8', text: '#785217' }, // Honey Cream
  { bg: '#E2EEF4', text: '#275269' }, // Soft River Blue
  { bg: '#EADFD9', text: '#573E36' }, // Warm Clay
  { bg: '#F7E2E6', text: '#7C3443' }, // Petal Pink
  { bg: '#E5ECE0', text: '#3E5533' }, // Olive Sprig
  { bg: '#8C4A3C', text: '#FFFFFF' }, // Terracotta Dark
  { bg: '#6F7F62', text: '#FFFFFF' }, // Sage Accent
];

export function getAvatarStyle(nickname: string): AvatarStyle {
  const clean = (nickname || 'M').trim();
  const initial = clean.charAt(0).toUpperCase();

  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = (hash << 5) - hash + clean.charCodeAt(i);
    hash |= 0;
  }

  const index = Math.abs(hash) % PALETTES.length;
  const palette = PALETTES[index];

  return {
    bg: palette.bg,
    text: palette.text,
    initial,
  };
}
