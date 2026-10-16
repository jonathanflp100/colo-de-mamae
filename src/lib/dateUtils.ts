import { addDays, format, parseISO, isValid } from 'date-fns';
import { ptBR, es, enUS } from 'date-fns/locale';
import { LocaleType } from '../data/types';

export const localeMap = {
  pt: ptBR,
  es: es,
  en: enUS,
};

export function calculateDueDateFromLMP(lmpDateStr: string): string {
  if (!lmpDateStr) return '';
  try {
    const lmp = parseISO(lmpDateStr);
    if (!isValid(lmp)) return '';
    const dpp = addDays(lmp, 280);
    return format(dpp, 'yyyy-MM-dd');
  } catch {
    return '';
  }
}

export function parseDateParts(dateStr?: string | null): { year: number; month: number; day: number } | null {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const match = dateStr.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;
  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10); // 1-12
  const day = parseInt(match[3], 10);
  if (isNaN(year) || isNaN(month) || isNaN(day) || month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }
  return { year, month, day };
}

export function formatFriendlyDate(dateStr: string, locale: LocaleType = 'pt'): string {
  if (!dateStr) return '';
  const parts = parseDateParts(dateStr);
  if (parts) {
    const loc = localeMap[locale] || ptBR;
    const date = new Date(parts.year, parts.month - 1, parts.day, 12, 0, 0);
    return format(date, "dd 'de' MMMM 'de' yyyy", { locale: loc });
  }
  return dateStr;
}

export function getTurmaDetailsFromDate(dateStr: string, locale: LocaleType = 'pt') {
  const parts = parseDateParts(dateStr);
  const now = new Date();
  let year: number;
  let month: number;

  if (parts && parts.year >= 2020) {
    year = parts.year;
    month = parts.month;
  } else {
    // Current or future safe fallback
    year = now.getFullYear();
    month = now.getMonth() + 1;
  }

  const slug = `${year}-${String(month).padStart(2, '0')}`;
  const firstOfMonth = `${slug}-01`;
  const safeDate = new Date(year, month - 1, 1, 12, 0, 0);

  return {
    slug,
    month: firstOfMonth,
    label: buildTurmaLabel(safeDate, locale),
  };
}

export function validateDueDate(dueDateStr: string): { isValid: boolean; error?: string } {
  const parts = parseDateParts(dueDateStr);
  if (!parts) {
    return { isValid: false, error: 'Por favor, informe uma data válida no formato dia/mês/ano.' };
  }
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const target = new Date(parts.year, parts.month - 1, parts.day, 0, 0, 0);
  const maxDue = new Date(today.getTime() + 42 * 7 * 24 * 60 * 60 * 1000);
  const minDue = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000); // slight grace for 40+ weeks gestation

  if (target < minDue || target > maxDue) {
    return {
      isValid: false,
      error: 'A data provável do parto deve estar entre hoje e até 42 semanas à frente.',
    };
  }
  return { isValid: true };
}

export function validateBabyBirthDate(birthDateStr: string): { isValid: boolean; error?: string } {
  const parts = parseDateParts(birthDateStr);
  if (!parts) {
    return { isValid: false, error: 'Por favor, informe a data de nascimento do bebê.' };
  }
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  const target = new Date(parts.year, parts.month - 1, parts.day, 0, 0, 0);
  const oneYearAgo = new Date(today.getTime() - 366 * 24 * 60 * 60 * 1000);

  if (target > today) {
    return {
      isValid: false,
      error: 'A data de nascimento não pode estar no futuro.',
    };
  }
  if (target < oneYearAgo) {
    return {
      isValid: false,
      error: 'A data de nascimento do bebê deve ser de até 1 ano atrás até hoje.',
    };
  }
  return { isValid: true };
}

function buildTurmaLabel(date: Date, locale: LocaleType): string {
  const loc = localeMap[locale] || ptBR;
  const monthName = format(date, 'MMMM', { locale: loc });
  const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);
  const year = format(date, 'yyyy');

  if (locale === 'en') {
    return `${capitalizedMonth} ${year} Circle`;
  }
  if (locale === 'es') {
    return `Grupo ${capitalizedMonth} ${year}`;
  }
  return `Turma ${capitalizedMonth} ${year}`;
}

export function calculateWeeksPregnant(dueDateStr?: string | null, lmpDateStr?: string | null): number {
  const now = new Date();
  if (dueDateStr) {
    try {
      const due = parseISO(dueDateStr);
      if (isValid(due)) {
        const diffDays = Math.round((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        const week = 40 - Math.floor(diffDays / 7);
        return Math.max(1, Math.min(42, week));
      }
    } catch {
      // fallback
    }
  }

  if (lmpDateStr) {
    try {
      const lmp = parseISO(lmpDateStr);
      if (isValid(lmp)) {
        const diffDays = Math.round((now.getTime() - lmp.getTime()) / (1000 * 60 * 60 * 24));
        const week = Math.floor(diffDays / 7);
        return Math.max(1, Math.min(42, week));
      }
    } catch {
      // fallback
    }
  }

  return 20; // default midpoint
}

export function calculateBabyAge(birthDateStr?: string | null): { weeks: number; days: number; label: string } {
  if (!birthDateStr) return { weeks: 0, days: 0, label: 'Recém-nascido' };
  try {
    const birth = parseISO(birthDateStr);
    if (!isValid(birth)) return { weeks: 0, days: 0, label: 'Recém-nascido' };

    const now = new Date();
    const diffDays = Math.max(0, Math.floor((now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24)));
    const weeks = Math.floor(diffDays / 7);
    const days = diffDays % 7;

    let label = '';
    if (weeks === 0) {
      label = days === 1 ? '1 dia de vida' : `${days} dias de vida`;
    } else if (days === 0) {
      label = weeks === 1 ? '1 semana de vida' : `${weeks} semanas de vida`;
    } else {
      label = `${weeks} ${weeks === 1 ? 'semana' : 'semanas'} e ${days} ${days === 1 ? 'dia' : 'dias'}`;
    }

    return { weeks, days, label };
  } catch {
    return { weeks: 0, days: 0, label: 'Recém-nascido' };
  }
}

