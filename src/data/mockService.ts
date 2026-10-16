import {
  AuthUser,
  DataService,
  Family,
  LocaleType,
  Profile,
  Turma,
  Post,
  Comment,
  PostTopic,
  NightMessage,
  DmThread,
  DmMessage,
  Block,
  Report,
  AppNotification,
  ReportTargetType,
  HelpfulVote,
  Feeding,
  Diaper,
  Sleep,
  Contraction,
  Appointment,
  ChecklistItem,
  ChecklistList,
  BirthPlan,
  Milestone,
  Letter,
  ScheduledQuestion,
  RiskAlert,
  AdminReportItem,
  AdminSummaryStats,
  TurmaAdminInfo,
} from './types';
import { getTurmaDetailsFromDate } from '../lib/dateUtils';

const STORAGE_USERS = 'colodemae_mock_users';
const STORAGE_PROFILES = 'colodemae_mock_profiles';
const STORAGE_TURMAS = 'colodemae_mock_turmas';
const STORAGE_FAMILIES = 'colodemae_mock_families';
const STORAGE_CURRENT_USER = 'colodemae_mock_current_user';
const STORAGE_POSTS = 'colodemae_mock_posts';
const STORAGE_COMMENTS = 'colodemae_mock_comments';
const STORAGE_HELPFUL_VOTES = 'colodemae_mock_helpful_votes';
const STORAGE_NIGHT_MESSAGES = 'colodemae_mock_night_messages';
const STORAGE_DM_THREADS = 'colodemae_mock_dm_threads';
const STORAGE_DM_MESSAGES = 'colodemae_mock_dm_messages';
const STORAGE_BLOCKS = 'colodemae_mock_blocks';
const STORAGE_REPORTS = 'colodemae_mock_reports';
const STORAGE_NOTIFICATIONS = 'colodemae_mock_notifications';
const STORAGE_FEEDINGS = 'colodemae_mock_feedings';
const STORAGE_DIAPERS = 'colodemae_mock_diapers';
const STORAGE_SLEEPS = 'colodemae_mock_sleeps';
const STORAGE_CONTRACTIONS = 'colodemae_mock_contractions';
const STORAGE_APPOINTMENTS = 'colodemae_mock_appointments';
const STORAGE_CHECKLISTS = 'colodemae_mock_checklists';
const STORAGE_BIRTH_PLANS = 'colodemae_mock_birth_plans';
const STORAGE_MILESTONES = 'colodemae_mock_milestones';
const STORAGE_LETTERS = 'colodemae_mock_letters';
const STORAGE_RISK_ALERTS = 'colodemae_mock_risk_alerts';
const STORAGE_SCHEDULED_QUESTIONS = 'colodemae_mock_scheduled_questions';
const STORAGE_MERGED_TURMAS = 'colodemae_mock_merged_turmas';

// 25 Realistic Seed Posts for Demo Mode
const INITIAL_DEMO_POSTS: Omit<Post, 'id' | 'created_at'>[] = [
  {
    turma_id: 'default',
    author_id: 'seed-user-1',
    author_nickname: 'Lua Serena 27',
    body: 'Mamães da nossa turma, como vocês lidaram com a fase das cólicas do 1º mês? O que realmente funcionou para acalmar o bebê de vocês sem desespero?',
    topic: 'duvida',
    comment_count: 5,
    is_question_of_day: true,
    hidden: false,
  },
  {
    turma_id: 'default',
    author_id: 'seed-user-2',
    author_nickname: 'Girassol Calmo 14',
    body: 'Hoje chorei no banho de exaustão. Amo meu filho com todas as minhas forças, mas o cansaço do puerpério às vezes é tão pesado que parece que vou quebrar. Só precisava colocar para fora onde ninguém me julgue.',
    topic: 'desabafo',
    comment_count: 6,
    is_question_of_day: false,
    hidden: false,
  },
  {
    turma_id: 'default',
    author_id: 'seed-user-3',
    author_nickname: 'Brisa Mansa 08',
    body: 'Vitória do dia! Conseguimos acertar a pega da amamentação depois de dias dolorosos! Uma consultora me ensinou a esperar o bebê abrir bem a boquinha tipo bocejo. Sem dor pela primeira vez!',
    topic: 'conquista',
    comment_count: 4,
    is_question_of_day: false,
    hidden: false,
  },
  {
    turma_id: 'default',
    author_id: 'seed-user-4',
    author_nickname: 'Estrela Suave 19',
    body: 'Dica de ouro para quem está montando a mala da maternidade: levem roupas com abertura frontal fácil e um chinelo um número maior. Meus pés incharam muito no pós-parto e meu chinelo normal não entrava!',
    topic: 'dica',
    comment_count: 3,
    is_question_of_day: false,
    hidden: false,
  },
  {
    turma_id: 'default',
    author_id: 'seed-user-5',
    author_nickname: 'Nuvem Serena 42',
    body: 'Estou na 28ª semana e comecei a sentir uma dor chatinha nas costas ao final da tarde. Alguém faz exercícios com bola de pilates? Ajuda mesmo?',
    topic: 'duvida',
    comment_count: 4,
    is_question_of_day: false,
    hidden: false,
  },
  {
    turma_id: 'default',
    author_id: 'seed-user-6',
    author_nickname: 'Aurora Dourada 05',
    body: 'Meninas, meu bebê completou 2 meses e deu a primeira gargalhada de verdade olhando nos meus olhos enquanto eu trocava a fralda. Meu coração derreteu inteirinho.',
    topic: 'conquista',
    comment_count: 3,
    is_question_of_day: false,
    hidden: false,
  },
  {
    turma_id: 'default',
    author_id: 'seed-user-7',
    author_nickname: 'Pétala Calma 31',
    body: 'Como é difícil lidar com palpites da família... Todo mundo acha que o bebê chora por fome ou que meu leite é fraco. Já chorei tanto com esses comentários.',
    topic: 'desabafo',
    comment_count: 5,
    is_question_of_day: false,
    hidden: false,
  },
  {
    turma_id: 'default',
    author_id: 'seed-user-8',
    author_nickname: 'Semente Gentil 11',
    body: 'Para quem está sofrendo com azia no 3º trimestre: maçã bem geladinha fatiada e comer em porções bem pequenas foi o que salvou minhas noites.',
    topic: 'dica',
    comment_count: 2,
    is_question_of_day: false,
    hidden: false,
  },
  {
    turma_id: 'default',
    author_id: 'seed-user-9',
    author_nickname: 'Orquídea Luminosa 23',
    body: 'Alguém mais com a sensação de ninho a todo vapor? Estou lavando as roupinhas e separando por tamanho. Dá uma emoção ver tudo pendurado no varal.',
    topic: 'conquista',
    comment_count: 2,
    is_question_of_day: false,
    hidden: false,
  },
  {
    turma_id: 'default',
    author_id: 'seed-user-10',
    author_nickname: 'Ciranda Doce 88',
    body: 'Dúvida sincera sobre o sono do bebê de 4 meses: o tal salto de desenvolvimento pegou vocês também? Aqui ele acordava 2x e agora acorda de hora em hora.',
    topic: 'duvida',
    comment_count: 4,
    is_question_of_day: false,
    hidden: false,
  },
  {
    turma_id: 'default',
    author_id: 'seed-user-11',
    author_nickname: 'Jasmim Tranquilo 16',
    body: 'Meu parceiro é prestativo, mas às vezes sinto uma solidão profunda, como se a carga mental de saber tudo sobre o bebê fosse só minha. Mais alguém se sente assim?',
    topic: 'desabafo',
    comment_count: 6,
    is_question_of_day: false,
    hidden: false,
  },
  {
    turma_id: 'default',
    author_id: 'seed-user-12',
    author_nickname: 'Canção Serena 54',
    body: 'Dica para acalmar crises de choro no final do dia (a famosa hora da bruxa): banho de balde ou chuveiro pele a pele no escuro com ruído de água. Faz milagres aqui.',
    topic: 'dica',
    comment_count: 3,
    is_question_of_day: false,
    hidden: false,
  },
  {
    turma_id: 'default',
    author_id: 'seed-user-13',
    author_nickname: 'Gotinha Valente 03',
    body: 'Fiz o ultrassom morfológico hoje e está tudo perfeito com os órgãos e o coraçãozinho! Saí da clínica flutuando de alívio e gratidão.',
    topic: 'conquista',
    comment_count: 4,
    is_question_of_day: false,
    hidden: false,
  },
  {
    turma_id: 'default',
    author_id: 'seed-user-14',
    author_nickname: 'Melodia Mansa 67',
    body: 'Quantos macacões tamanho RN vocês realmente usaram? Estou com medo de comprar muito e perder rápido ou comprar pouco e faltar.',
    topic: 'duvida',
    comment_count: 5,
    is_question_of_day: false,
    hidden: false,
  },
  {
    turma_id: 'default',
    author_id: 'seed-user-15',
    author_nickname: 'RaioDeSol Acolhedor 99',
    body: 'Hoje me olhei no espelho e acolhi meu corpo com carinho. A barriga ainda está flácida, tenho olheiras, mas gerei um ser humano perfeito. Estou aprendendo a me amar de novo.',
    topic: 'conquista',
    comment_count: 7,
    is_question_of_day: false,
    hidden: false,
  },
  {
    turma_id: 'default',
    author_id: 'seed-user-16',
    author_nickname: 'Lavanda Serena 37',
    body: 'A volta ao trabalho está chegando e sinto um aperto no peito só de pensar em deixar ele no berçário. Como vocês prepararam o coração para esse momento?',
    topic: 'desabafo',
    comment_count: 4,
    is_question_of_day: false,
    hidden: false,
  },
  {
    turma_id: 'default',
    author_id: 'seed-user-17',
    author_nickname: 'Maré Mansa 21',
    body: 'Dica de ouro para introdução alimentar aos 6 meses: não criem expectativas de pratos limpos. No início é só exploração de texturas e sabores. Sem neura!',
    topic: 'dica',
    comment_count: 3,
    is_question_of_day: false,
    hidden: false,
  },
  {
    turma_id: 'default',
    author_id: 'seed-user-18',
    author_nickname: 'Florinda Suave 74',
    body: 'Sentir o bebê soluçar na barriga é a coisa mais engraçadinha do mundo. Dá uns pulinhos ritmados por quase 10 minutos.',
    topic: 'conquista',
    comment_count: 2,
    is_question_of_day: false,
    hidden: false,
  },
  {
    turma_id: 'default',
    author_id: 'seed-user-19',
    author_nickname: 'Amorosa Valente 12',
    body: 'Perdi o tampão mucoso hoje cedo (38 semanas)! Sei que pode demorar ainda, mas o coração disparou de emoção sabendo que o grande dia está perto.',
    topic: 'conquista',
    comment_count: 3,
    is_question_of_day: false,
    hidden: false,
  },
  {
    turma_id: 'default',
    author_id: 'seed-user-20',
    author_nickname: 'Lua Calma 50',
    body: 'Alguém teve escapes leves de xixi ao espirrar no final da gravidez? Minha médica disse que a fisioterapia pélvica ajuda muito. Vocês fizeram?',
    topic: 'duvida',
    comment_count: 3,
    is_question_of_day: false,
    hidden: false,
  },
  {
    turma_id: 'default',
    author_id: 'seed-user-21',
    author_nickname: 'Brisa Gentil 33',
    body: 'Dica de sono: fazer um ritual consistente toda noite (banho morno, massagem, luz baixa, mamada e ruído branco) ajudou meu bebê a entender a hora de dormir.',
    topic: 'dica',
    comment_count: 4,
    is_question_of_day: false,
    hidden: false,
  },
  {
    turma_id: 'default',
    author_id: 'seed-user-22',
    author_nickname: 'Estrela Serena 61',
    body: 'A privação de sono é real... Esta noite acordei 5 vezes e na última esqueci onde tinha colocado a fralda limpa. Só rindo para não chorar!',
    topic: 'desabafo',
    comment_count: 5,
    is_question_of_day: false,
    hidden: false,
  },
  {
    turma_id: 'default',
    author_id: 'seed-user-23',
    author_nickname: 'Nuvem Mansa 18',
    body: 'Como escolher o carrinho de bebê sem gastar uma fortuna? Vale a pena focar em ser leve e fácil de fechar com uma mão só?',
    topic: 'duvida',
    comment_count: 4,
    is_question_of_day: false,
    hidden: false,
  },
  {
    turma_id: 'default',
    author_id: 'seed-user-24',
    author_nickname: 'Girassol Doce 95',
    body: 'Hoje meu bebê segurou meu dedo com as duas mãozinhas enquanto mamava e me olhou fixamente. Não troco esse momento por nada no mundo.',
    topic: 'conquista',
    comment_count: 3,
    is_question_of_day: false,
    hidden: false,
  },
  {
    turma_id: 'default',
    author_id: 'seed-user-25',
    author_nickname: 'Aurora Suave 77',
    body: 'Lembrete do dia para todas as mães desta turma: você está fazendo o seu melhor. Não se cobre tanto. Seu bebê tem a mãe perfeita para ele.',
    topic: 'dica',
    comment_count: 6,
    is_question_of_day: false,
    hidden: false,
  },
];

class MockService implements DataService {
  public readonly isDemoMode = true;

  constructor() {
    this.ensureSeedData();
  }

  private ensureSeedData() {
    const rawPosts = localStorage.getItem(STORAGE_POSTS);
    if (!rawPosts) {
      const posts: Post[] = [];
      const comments: Comment[] = [];
      const now = Date.now();

      INITIAL_DEMO_POSTS.forEach((p, idx) => {
        const id = `post-${idx + 1}`;
        // spread timestamps over the last 48 hours
        const createdAt = new Date(now - (idx * 1.8 * 3600 * 1000)).toISOString();

        posts.push({
          id,
          turma_id: 'turma-demo',
          author_id: p.author_id,
          author_nickname: p.author_nickname,
          body: p.body,
          topic: p.topic,
          comment_count: p.comment_count,
          is_question_of_day: p.is_question_of_day,
          hidden: false,
          created_at: createdAt,
        });

        // Add 2-3 warm comments per post
        comments.push(
          {
            id: `comm-${id}-1`,
            post_id: id,
            author_id: `seed-user-${(idx + 3) % 25 + 1}`,
            author_nickname: `Mamãe Acolhedora ${(idx * 7) % 80 + 10}`,
            body: 'Te entendo perfeitamente, passei por isso semana passada! O que mais me ajudou foi respirar fundo e pedir ajuda.',
            helpful_count: Math.floor(Math.random() * 8) + 1,
            hidden: false,
            created_at: new Date(new Date(createdAt).getTime() + 15 * 60 * 1000).toISOString(),
          },
          {
            id: `comm-${id}-2`,
            post_id: id,
            author_id: `seed-user-${(idx + 7) % 25 + 1}`,
            author_nickname: `Brisa Doce ${(idx * 11) % 80 + 10}`,
            body: 'Que relato lindo e necessário! Estamos todas juntas nesse mesmo barco, conta com o nosso ninho sempre.',
            helpful_count: Math.floor(Math.random() * 5) + 1,
            hidden: false,
            created_at: new Date(new Date(createdAt).getTime() + 45 * 60 * 1000).toISOString(),
          }
        );
      });

      localStorage.setItem(STORAGE_POSTS, JSON.stringify(posts));
      localStorage.setItem(STORAGE_COMMENTS, JSON.stringify(comments));
    }

    // Seed initial night messages if absent
    if (!localStorage.getItem(STORAGE_NIGHT_MESSAGES)) {
      const nightMsgs: NightMessage[] = [
        {
          id: 'night-1',
          room: 'pt',
          author_id: 'seed-night-1',
          author_nickname: 'Lua Serena 27',
          body: 'Mamada das 03h da manhã por aqui... Quem mais na ronda do amor?',
          hidden: false,
          created_at: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
        },
        {
          id: 'night-2',
          room: 'pt',
          author_id: 'seed-night-2',
          author_nickname: 'Estrela Calma 14',
          body: 'Eu também! Trocando fralda no escurinho para não despertar ele todo.',
          hidden: false,
          created_at: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
        },
        {
          id: 'night-3',
          room: 'pt',
          author_id: 'seed-night-3',
          author_nickname: 'Nuvem Suave 88',
          body: 'Força para nós, mamães da madrugada! O silêncio da noite acolhe a gente.',
          hidden: false,
          created_at: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
        },
      ];
      localStorage.setItem(STORAGE_NIGHT_MESSAGES, JSON.stringify(nightMsgs));
    }

    // Seed initial notifications if absent
    if (!localStorage.getItem(STORAGE_NOTIFICATIONS)) {
      const notifs: AppNotification[] = [
        {
          id: 'notif-1',
          user_id: 'all',
          title: 'Nova pergunta do dia',
          body: 'A pergunta de hoje sobre cólicas e aconchego já está aberta na sua turma!',
          created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
          read: false,
        },
        {
          id: 'notif-2',
          user_id: 'all',
          title: 'Sua resposta ajudou 3 mães',
          body: 'Três mamães marcaram seu comentário sobre sono como útil.',
          created_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
          read: false,
        },
      ];
      localStorage.setItem(STORAGE_NOTIFICATIONS, JSON.stringify(notifs));
    }

    // Seed initial reports if absent
    if (!localStorage.getItem(STORAGE_REPORTS)) {
      const reports: Report[] = [
        {
          id: 'rep-1',
          reporter_id: 'seed-user-2',
          target_type: 'post',
          target_id: 'post-5',
          reason: 'Possível indicação inadequada de medicação sem prescrição médica',
          status: 'aberta',
          created_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
        },
        {
          id: 'rep-2',
          reporter_id: 'seed-user-4',
          target_type: 'comment',
          target_id: 'comm-post-2-1',
          reason: 'Tom ríspido e julgamento sobre o modo de amamentar',
          status: 'aberta',
          created_at: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
        },
        {
          id: 'rep-3',
          reporter_id: 'seed-user-9',
          target_type: 'user',
          target_id: 'seed-user-18',
          reason: 'Comportamento insistente em mensagens privadas solicitando contato fora',
          status: 'aberta',
          created_at: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
        },
      ];
      localStorage.setItem(STORAGE_REPORTS, JSON.stringify(reports));
    }

    // Seed initial risk alerts if absent
    if (!localStorage.getItem(STORAGE_RISK_ALERTS)) {
      const riskAlerts: RiskAlert[] = [
        {
          id: 'risk-1',
          user_id: 'seed-user-7',
          user_nickname: 'Pétala Calma 31',
          matched_word: 'não aguento mais viver',
          text: 'Hoje foi tão pesado com as cólicas que senti que não aguento mais viver assim, preciso de força e acolhimento...',
          status: 'pendente',
          created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
        },
        {
          id: 'risk-2',
          user_id: 'seed-user-13',
          user_nickname: 'Noite Serena 14',
          matched_word: 'machucar meu bebê',
          text: 'Tive muito medo dos pensamentos intrusivos de machucar meu bebê durante o choro sem fim da madrugada.',
          status: 'pendente',
          created_at: new Date(Date.now() - 7 * 3600 * 1000).toISOString(),
        },
        {
          id: 'risk-3',
          user_id: 'seed-user-15',
          user_nickname: 'Estrela Serena 50',
          matched_word: 'quero morrer',
          text: 'A privação de sono acumulada está tão extrema que às vezes quero morrer de cansaço, socorro.',
          status: 'acompanhado',
          created_at: new Date(Date.now() - 28 * 3600 * 1000).toISOString(),
        },
      ];
      localStorage.setItem(STORAGE_RISK_ALERTS, JSON.stringify(riskAlerts));
    }

    // Seed initial scheduled questions if absent
    if (!localStorage.getItem(STORAGE_SCHEDULED_QUESTIONS)) {
      const todayStr = new Date().toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 24 * 3600 * 1000).toISOString().split('T')[0];
      const dayAfter = new Date(Date.now() + 48 * 3600 * 1000).toISOString().split('T')[0];
      const questions: ScheduledQuestion[] = [
        {
          id: 'sq-1',
          date: todayStr,
          question: 'O que ninguém te contou sobre o puerpério e que você gostaria de ter sabido antes?',
          turma_id: 'all',
          created_at: new Date().toISOString(),
        },
        {
          id: 'sq-2',
          date: tomorrow,
          question: 'Qual foi o desejo de gravidez mais estranho ou inesperado que você sentiu?',
          turma_id: 'all',
          created_at: new Date().toISOString(),
        },
        {
          id: 'sq-3',
          date: dayAfter,
          question: 'Qual pequeno instante de paz ou respiração te salvou no dia de hoje?',
          turma_id: 'all',
          created_at: new Date().toISOString(),
        },
      ];
      localStorage.setItem(STORAGE_SCHEDULED_QUESTIONS, JSON.stringify(questions));
    }
  }

  // --- Helpers ---
  private getBlocks(): Block[] {
    const raw = localStorage.getItem(STORAGE_BLOCKS);
    return raw ? JSON.parse(raw) : [];
  }

  private getBlockedUserIds(currentUserId?: string): Set<string> {
    if (!currentUserId) return new Set();
    const blocks = this.getBlocks();
    const set = new Set<string>();
    blocks.forEach((b) => {
      if (b.blocker_id === currentUserId) set.add(b.blocked_id);
      if (b.blocked_id === currentUserId) set.add(b.blocker_id);
    });
    return set;
  }

  // --- Auth ---
  async getCurrentUser(): Promise<AuthUser | null> {
    const raw = localStorage.getItem(STORAGE_CURRENT_USER);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  async signInWithEmail(email: string, _password: string): Promise<{ user: AuthUser | null; error: Error | null }> {
    const cleanEmail = email.trim().toLowerCase();
    const rawUsers = localStorage.getItem(STORAGE_USERS);
    const users: Record<string, any> = rawUsers ? JSON.parse(rawUsers) : {};
    let user = Object.values(users).find((u: any) => u.email === cleanEmail);

    if (!user) {
      const id = 'mock-user-' + Math.random().toString(36).substring(2, 9);
      user = { id, email: cleanEmail, created_at: new Date().toISOString() };
      users[id] = user;
      localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
    }

    const authUser: AuthUser = { id: user.id, email: user.email, created_at: user.created_at };
    localStorage.setItem(STORAGE_CURRENT_USER, JSON.stringify(authUser));

    await this.ensureDemoAccess(user.id, user.email);

    return { user: authUser, error: null };
  }

  async signUpWithEmail(email: string, _password: string): Promise<{ user: AuthUser | null; error: Error | null }> {
    return this.signInWithEmail(email, _password);
  }

  async signInWithGoogle(): Promise<{ user: AuthUser | null; error: Error | null }> {
    return this.signInWithEmail('mamae.demo@exemplo.com', 'google-mock');
  }

  async signOut(): Promise<void> {
    localStorage.removeItem(STORAGE_CURRENT_USER);
  }

  async resetPassword(_email: string): Promise<{ success: boolean; error: Error | null }> {
    return { success: true, error: null };
  }

  private async ensureDemoAccess(userId: string, email: string) {
    const rawProfiles = localStorage.getItem(STORAGE_PROFILES);
    const profiles: Record<string, Profile> = rawProfiles ? JSON.parse(rawProfiles) : {};
    const existing = profiles[userId];
    const now = new Date();
    const oneYearLater = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString();

    if (!existing) {
      profiles[userId] = {
        id: userId,
        email,
        nickname: '',
        phase: 'gestante',
        locale: 'pt',
        access_until: oneYearLater,
        is_admin: true,
        is_adult_confirmed: false,
        created_at: now.toISOString(),
      };
      localStorage.setItem(STORAGE_PROFILES, JSON.stringify(profiles));
    } else {
      existing.is_admin = true;
      const dYear = existing.due_date ? parseInt(existing.due_date.slice(0, 4), 10) : 0;
      const bYear = existing.baby_birth_date ? parseInt(existing.baby_birth_date.slice(0, 4), 10) : 0;
      if ((dYear > 0 && dYear < 2020) || (bYear > 0 && bYear < 2020)) {
        existing.due_date = null;
        existing.baby_birth_date = null;
        existing.turma_id = undefined;
        existing.nickname = '';
        existing.accepted_terms_at = null;
      }
      if (!existing.access_until || new Date(existing.access_until) < now) {
        existing.access_until = oneYearLater;
      }
      profiles[userId] = existing;
      localStorage.setItem(STORAGE_PROFILES, JSON.stringify(profiles));
    }
  }

  // --- Profiles ---
  async getProfile(userId: string): Promise<Profile | null> {
    const raw = localStorage.getItem(STORAGE_PROFILES);
    const profiles: Record<string, Profile> = raw ? JSON.parse(raw) : {};
    const prof = profiles[userId] || null;
    if (prof) {
      prof.is_admin = true; // In demo mode, logged in user is admin
      const dYear = prof.due_date ? parseInt(prof.due_date.slice(0, 4), 10) : 0;
      const bYear = prof.baby_birth_date ? parseInt(prof.baby_birth_date.slice(0, 4), 10) : 0;
      if ((dYear > 0 && dYear < 2020) || (bYear > 0 && bYear < 2020)) {
        prof.due_date = null;
        prof.baby_birth_date = null;
        prof.turma_id = undefined;
        prof.nickname = '';
        prof.accepted_terms_at = null;
        profiles[userId] = prof;
        localStorage.setItem(STORAGE_PROFILES, JSON.stringify(profiles));
      }
    }
    return prof;
  }

  async createProfile(profile: Partial<Profile> & { id: string }): Promise<Profile> {
    const raw = localStorage.getItem(STORAGE_PROFILES);
    const profiles: Record<string, Profile> = raw ? JSON.parse(raw) : {};
    const now = new Date();
    const oneYearLater = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString();

    const fullProfile: Profile = {
      id: profile.id,
      email: profile.email || '',
      nickname: profile.nickname || '',
      phase: profile.phase || 'gestante',
      due_date: profile.due_date || null,
      last_period_date: profile.last_period_date || null,
      baby_birth_date: profile.baby_birth_date || null,
      baby_name: profile.baby_name || null,
      turma_id: profile.turma_id || null,
      family_id: profile.family_id || null,
      locale: profile.locale || 'pt',
      access_until: profile.access_until || oneYearLater,
      is_admin: true,
      accepted_terms_at: profile.accepted_terms_at || now.toISOString(),
      health_consent_at: profile.health_consent_at || now.toISOString(),
      is_adult_confirmed: profile.is_adult_confirmed ?? true,
      created_at: profile.created_at || now.toISOString(),
    };

    profiles[profile.id] = fullProfile;
    localStorage.setItem(STORAGE_PROFILES, JSON.stringify(profiles));
    return fullProfile;
  }

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
    const raw = localStorage.getItem(STORAGE_PROFILES);
    const profiles: Record<string, Profile> = raw ? JSON.parse(raw) : {};
    const current = profiles[userId];
    if (!current) throw new Error(`Profile ${userId} not found`);

    const updated: Profile = { ...current, ...updates };
    profiles[userId] = updated;
    localStorage.setItem(STORAGE_PROFILES, JSON.stringify(profiles));
    return updated;
  }

  async deleteAccount(userId: string): Promise<void> {
    const rawProfiles = localStorage.getItem(STORAGE_PROFILES);
    if (rawProfiles) {
      const profiles: Record<string, Profile> = JSON.parse(rawProfiles);
      delete profiles[userId];
      localStorage.setItem(STORAGE_PROFILES, JSON.stringify(profiles));
    }
    const rawUsers = localStorage.getItem(STORAGE_USERS);
    if (rawUsers) {
      const users = JSON.parse(rawUsers);
      delete users[userId];
      localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
    }
    await this.signOut();
  }

  async checkNicknameAvailable(nickname: string, excludeUserId?: string): Promise<boolean> {
    const clean = nickname.trim().toLowerCase();
    const raw = localStorage.getItem(STORAGE_PROFILES);
    const profiles: Record<string, Profile> = raw ? JSON.parse(raw) : {};
    for (const [id, prof] of Object.entries(profiles)) {
      if (excludeUserId && id === excludeUserId) continue;
      if (prof.nickname && prof.nickname.trim().toLowerCase() === clean) {
        return false;
      }
    }
    return true;
  }

  // --- Turmas ---
  async getTurma(turmaId: string): Promise<Turma | null> {
    const raw = localStorage.getItem(STORAGE_TURMAS);
    const turmas: Record<string, Turma> = raw ? JSON.parse(raw) : {};
    return turmas[turmaId] || null;
  }

  async getOrCreateTurmaForDate(dateStr: string, locale: LocaleType): Promise<Turma> {
    const { slug, label, month } = getTurmaDetailsFromDate(dateStr, locale);
    const raw = localStorage.getItem(STORAGE_TURMAS);
    const turmas: Record<string, Turma> = raw ? JSON.parse(raw) : {};

    let turma = Object.values(turmas).find((t) => t.slug === slug);
    if (!turma) {
      const id = 'turma-' + slug;
      const randomCount = Math.floor(Math.random() * (300 - 40 + 1)) + 40;
      turma = { id, slug, label, month, mothers_count: randomCount };
      turmas[id] = turma;
      localStorage.setItem(STORAGE_TURMAS, JSON.stringify(turmas));
    }
    return turma;
  }

  async getTurmaMemberCount(turmaId: string): Promise<number> {
    const turma = await this.getTurma(turmaId);
    if (turma?.mothers_count) return turma.mothers_count;
    return 128;
  }

  // --- Families ---
  async getFamily(familyId: string): Promise<Family | null> {
    const raw = localStorage.getItem(STORAGE_FAMILIES);
    const families: Record<string, Family> = raw ? JSON.parse(raw) : {};
    return families[familyId] || null;
  }

  async createFamily(): Promise<Family> {
    const raw = localStorage.getItem(STORAGE_FAMILIES);
    const families: Record<string, Family> = raw ? JSON.parse(raw) : {};
    const id = 'fam-' + Math.random().toString(36).substring(2, 9);
    const invite_code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const family: Family = { id, invite_code };
    families[id] = family;
    localStorage.setItem(STORAGE_FAMILIES, JSON.stringify(families));
    return family;
  }

  async getFamilyByInviteCode(inviteCode: string): Promise<Family | null> {
    const raw = localStorage.getItem(STORAGE_FAMILIES);
    const families: Record<string, Family> = raw ? JSON.parse(raw) : {};
    const clean = inviteCode.trim().toUpperCase();
    return Object.values(families).find((f) => f.invite_code === clean) || null;
  }

  // --- Community Posts ---
  async getPosts(
    _turmaId: string,
    currentUserId?: string,
    topic?: PostTopic,
    page: number = 1,
    pageSize: number = 20
  ): Promise<{ posts: Post[]; hasMore: boolean }> {
    this.ensureSeedData();
    const raw = localStorage.getItem(STORAGE_POSTS);
    let posts: Post[] = raw ? JSON.parse(raw) : [];

    const blocked = this.getBlockedUserIds(currentUserId);
    posts = posts.filter((p) => !p.hidden && !blocked.has(p.author_id));

    if (topic) {
      posts = posts.filter((p) => p.topic === topic);
    }

    // Sort newest first
    posts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const start = (page - 1) * pageSize;
    const paginated = posts.slice(start, start + pageSize);
    const hasMore = start + pageSize < posts.length;

    return { posts: paginated, hasMore };
  }

  async getQuestionOfDay(_turmaId: string): Promise<Post | null> {
    this.ensureSeedData();
    const raw = localStorage.getItem(STORAGE_POSTS);
    const posts: Post[] = raw ? JSON.parse(raw) : [];
    const qod = posts.find((p) => p.is_question_of_day && !p.hidden);
    return qod || posts[0] || null;
  }

  async getPost(postId: string): Promise<Post | null> {
    const raw = localStorage.getItem(STORAGE_POSTS);
    const posts: Post[] = raw ? JSON.parse(raw) : [];
    return posts.find((p) => p.id === postId) || null;
  }

  async createPost(post: {
    turma_id: string;
    author_id: string;
    author_nickname: string;
    body: string;
    topic: PostTopic;
    is_question_of_day?: boolean;
  }): Promise<Post> {
    const raw = localStorage.getItem(STORAGE_POSTS);
    const posts: Post[] = raw ? JSON.parse(raw) : [];

    const newPost: Post = {
      id: 'post-' + Math.random().toString(36).substring(2, 9),
      turma_id: post.turma_id,
      author_id: post.author_id,
      author_nickname: post.author_nickname,
      body: post.body,
      topic: post.topic,
      comment_count: 0,
      is_question_of_day: post.is_question_of_day ?? false,
      hidden: false,
      created_at: new Date().toISOString(),
    };

    posts.unshift(newPost);
    localStorage.setItem(STORAGE_POSTS, JSON.stringify(posts));
    return newPost;
  }

  // --- Comments ---
  async getComments(postId: string, currentUserId?: string): Promise<Comment[]> {
    const raw = localStorage.getItem(STORAGE_COMMENTS);
    let comments: Comment[] = raw ? JSON.parse(raw) : [];

    const rawVotes = localStorage.getItem(STORAGE_HELPFUL_VOTES);
    const votes: HelpfulVote[] = rawVotes ? JSON.parse(rawVotes) : [];

    const blocked = this.getBlockedUserIds(currentUserId);

    comments = comments.filter((c) => c.post_id === postId && !c.hidden && !blocked.has(c.author_id));

    // Attach user_voted_helpful & sort most helpful first
    comments = comments.map((c) => ({
      ...c,
      user_voted_helpful: currentUserId ? votes.some((v) => v.comment_id === c.id && v.user_id === currentUserId) : false,
    }));

    comments.sort((a, b) => b.helpful_count - a.helpful_count || new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    return comments;
  }

  async createComment(comment: {
    post_id: string;
    author_id: string;
    author_nickname: string;
    body: string;
  }): Promise<Comment> {
    const raw = localStorage.getItem(STORAGE_COMMENTS);
    const comments: Comment[] = raw ? JSON.parse(raw) : [];

    const newComment: Comment = {
      id: 'comm-' + Math.random().toString(36).substring(2, 9),
      post_id: comment.post_id,
      author_id: comment.author_id,
      author_nickname: comment.author_nickname,
      body: comment.body,
      helpful_count: 0,
      hidden: false,
      created_at: new Date().toISOString(),
      user_voted_helpful: false,
    };

    comments.push(newComment);
    localStorage.setItem(STORAGE_COMMENTS, JSON.stringify(comments));

    // Increment post comment_count
    const rawPosts = localStorage.getItem(STORAGE_POSTS);
    if (rawPosts) {
      const posts: Post[] = JSON.parse(rawPosts);
      const post = posts.find((p) => p.id === comment.post_id);
      if (post) {
        post.comment_count += 1;
        localStorage.setItem(STORAGE_POSTS, JSON.stringify(posts));
      }
    }

    return newComment;
  }

  async toggleHelpfulVote(commentId: string, userId: string): Promise<{ helpful_count: number; user_voted: boolean }> {
    const rawVotes = localStorage.getItem(STORAGE_HELPFUL_VOTES);
    let votes: HelpfulVote[] = rawVotes ? JSON.parse(rawVotes) : [];

    const rawComments = localStorage.getItem(STORAGE_COMMENTS);
    const comments: Comment[] = rawComments ? JSON.parse(rawComments) : [];
    const comment = comments.find((c) => c.id === commentId);

    const existingVoteIndex = votes.findIndex((v) => v.comment_id === commentId && v.user_id === userId);
    let userVoted = false;

    if (existingVoteIndex >= 0) {
      // Remove vote
      votes.splice(existingVoteIndex, 1);
      if (comment) comment.helpful_count = Math.max(0, comment.helpful_count - 1);
      userVoted = false;
    } else {
      // Add vote
      votes.push({ comment_id: commentId, user_id: userId });
      if (comment) comment.helpful_count += 1;
      userVoted = true;
    }

    localStorage.setItem(STORAGE_HELPFUL_VOTES, JSON.stringify(votes));
    localStorage.setItem(STORAGE_COMMENTS, JSON.stringify(comments));

    return {
      helpful_count: comment ? comment.helpful_count : 0,
      user_voted: userVoted,
    };
  }

  // --- Night Room ---
  async getNightMessages(room: LocaleType, currentUserId?: string): Promise<NightMessage[]> {
    this.ensureSeedData();
    const raw = localStorage.getItem(STORAGE_NIGHT_MESSAGES);
    let msgs: NightMessage[] = raw ? JSON.parse(raw) : [];

    const blocked = this.getBlockedUserIds(currentUserId);
    msgs = msgs.filter((m) => m.room === room && !m.hidden && !blocked.has(m.author_id));

    // Return last 50 sorted chronologically
    msgs.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    return msgs.slice(-50);
  }

  async createNightMessage(message: {
    room: LocaleType;
    author_id: string;
    author_nickname: string;
    body: string;
  }): Promise<NightMessage> {
    const raw = localStorage.getItem(STORAGE_NIGHT_MESSAGES);
    const msgs: NightMessage[] = raw ? JSON.parse(raw) : [];

    const newMsg: NightMessage = {
      id: 'night-' + Math.random().toString(36).substring(2, 9),
      room: message.room,
      author_id: message.author_id,
      author_nickname: message.author_nickname,
      body: message.body,
      hidden: false,
      created_at: new Date().toISOString(),
    };

    msgs.push(newMsg);
    localStorage.setItem(STORAGE_NIGHT_MESSAGES, JSON.stringify(msgs));
    return newMsg;
  }

  // --- Direct Messages (DMs) ---
  async getDmThreads(userId: string): Promise<DmThread[]> {
    const rawThreads = localStorage.getItem(STORAGE_DM_THREADS);
    let threads: DmThread[] = rawThreads ? JSON.parse(rawThreads) : [];

    const blocked = this.getBlockedUserIds(userId);
    threads = threads.filter(
      (t) =>
        (t.user_a === userId || t.user_b === userId) &&
        !blocked.has(t.user_a === userId ? t.user_b : t.user_a)
    );

    // Resolve other user nicknames and previews
    const rawProfiles = localStorage.getItem(STORAGE_PROFILES);
    const profiles: Record<string, Profile> = rawProfiles ? JSON.parse(rawProfiles) : {};

    const rawMsgs = localStorage.getItem(STORAGE_DM_MESSAGES);
    const messages: DmMessage[] = rawMsgs ? JSON.parse(rawMsgs) : [];

    threads = threads.map((t) => {
      const otherId = t.user_a === userId ? t.user_b : t.user_a;
      const otherProf = profiles[otherId];
      const otherNickname = otherProf?.nickname || 'Mamãe da Turma';

      const threadMsgs = messages.filter((m) => m.thread_id === t.id);
      const lastMsg = threadMsgs[threadMsgs.length - 1];
      const unreadCount = threadMsgs.filter((m) => m.sender_id !== userId && !m.read_at).length;

      return {
        ...t,
        other_user_id: otherId,
        other_user_nickname: otherNickname,
        last_message_preview: lastMsg ? lastMsg.body : 'Nova conversa',
        unread_count: unreadCount,
      };
    });

    threads.sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime());
    return threads;
  }

  async getOrCreateDmThread(userAId: string, userBId: string, userBNickname?: string): Promise<DmThread> {
    const raw = localStorage.getItem(STORAGE_DM_THREADS);
    const threads: DmThread[] = raw ? JSON.parse(raw) : [];

    let existing = threads.find(
      (t) => (t.user_a === userAId && t.user_b === userBId) || (t.user_a === userBId && t.user_b === userAId)
    );

    if (existing) {
      return {
        ...existing,
        other_user_id: userBId,
        other_user_nickname: userBNickname || 'Mamãe da Turma',
      };
    }

    const now = new Date().toISOString();
    const newThread: DmThread = {
      id: 'thread-' + Math.random().toString(36).substring(2, 9),
      user_a: userAId,
      user_b: userBId,
      created_at: now,
      last_message_at: now,
      other_user_id: userBId,
      other_user_nickname: userBNickname || 'Mamãe da Turma',
      unread_count: 0,
    };

    threads.push(newThread);
    localStorage.setItem(STORAGE_DM_THREADS, JSON.stringify(threads));
    return newThread;
  }

  async getDmMessages(threadId: string, _currentUserId: string): Promise<DmMessage[]> {
    const raw = localStorage.getItem(STORAGE_DM_MESSAGES);
    const msgs: DmMessage[] = raw ? JSON.parse(raw) : [];
    return msgs.filter((m) => m.thread_id === threadId).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }

  async sendDmMessage(threadId: string, senderId: string, body: string): Promise<DmMessage> {
    const raw = localStorage.getItem(STORAGE_DM_MESSAGES);
    const msgs: DmMessage[] = raw ? JSON.parse(raw) : [];

    const now = new Date().toISOString();
    const newMsg: DmMessage = {
      id: 'msg-' + Math.random().toString(36).substring(2, 9),
      thread_id: threadId,
      sender_id: senderId,
      body,
      read_at: null,
      created_at: now,
    };

    msgs.push(newMsg);
    localStorage.setItem(STORAGE_DM_MESSAGES, JSON.stringify(msgs));

    // Update thread last_message_at
    const rawThreads = localStorage.getItem(STORAGE_DM_THREADS);
    if (rawThreads) {
      const threads: DmThread[] = JSON.parse(rawThreads);
      const thread = threads.find((t) => t.id === threadId);
      if (thread) {
        thread.last_message_at = now;
        localStorage.setItem(STORAGE_DM_THREADS, JSON.stringify(threads));
      }
    }

    return newMsg;
  }

  async markDmThreadAsRead(threadId: string, currentUserId: string): Promise<void> {
    const raw = localStorage.getItem(STORAGE_DM_MESSAGES);
    if (!raw) return;
    const msgs: DmMessage[] = JSON.parse(raw);
    const now = new Date().toISOString();

    let updated = false;
    msgs.forEach((m) => {
      if (m.thread_id === threadId && m.sender_id !== currentUserId && !m.read_at) {
        m.read_at = now;
        updated = true;
      }
    });

    if (updated) {
      localStorage.setItem(STORAGE_DM_MESSAGES, JSON.stringify(msgs));
    }
  }

  // --- Moderation: Blocks & Reports ---
  async blockUser(blockerId: string, blockedId: string): Promise<void> {
    const blocks = this.getBlocks();
    if (!blocks.some((b) => b.blocker_id === blockerId && b.blocked_id === blockedId)) {
      blocks.push({ blocker_id: blockerId, blocked_id: blockedId });
      localStorage.setItem(STORAGE_BLOCKS, JSON.stringify(blocks));
    }
  }

  async isUserBlocked(userAId: string, userBId: string): Promise<boolean> {
    const blocks = this.getBlocks();
    return blocks.some(
      (b) => (b.blocker_id === userAId && b.blocked_id === userBId) || (b.blocker_id === userBId && b.blocked_id === userAId)
    );
  }

  async reportContent(report: {
    reporter_id: string;
    target_type: ReportTargetType;
    target_id: string;
    reason: string;
  }): Promise<void> {
    const raw = localStorage.getItem(STORAGE_REPORTS);
    const reports: Report[] = raw ? JSON.parse(raw) : [];

    const newReport: Report = {
      id: 'rep-' + Math.random().toString(36).substring(2, 9),
      reporter_id: report.reporter_id,
      target_type: report.target_type,
      target_id: report.target_id,
      reason: report.reason,
      status: 'aberta',
      created_at: new Date().toISOString(),
    };

    reports.push(newReport);
    localStorage.setItem(STORAGE_REPORTS, JSON.stringify(reports));
    console.log('[MODERATION REPORT LOGGED]:', newReport);
  }

  // --- In-app Notifications ---
  async getNotifications(userId: string): Promise<AppNotification[]> {
    this.ensureSeedData();
    const raw = localStorage.getItem(STORAGE_NOTIFICATIONS);
    const notifs: AppNotification[] = raw ? JSON.parse(raw) : [];
    return notifs.filter((n) => n.user_id === userId || n.user_id === 'all');
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    const raw = localStorage.getItem(STORAGE_NOTIFICATIONS);
    if (!raw) return;
    const notifs: AppNotification[] = JSON.parse(raw);
    const n = notifs.find((item) => item.id === notificationId);
    if (n) {
      n.read = true;
      localStorage.setItem(STORAGE_NOTIFICATIONS, JSON.stringify(notifs));
    }
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    const raw = localStorage.getItem(STORAGE_NOTIFICATIONS);
    if (!raw) return;
    const notifs: AppNotification[] = JSON.parse(raw);
    notifs.forEach((n) => {
      if (n.user_id === userId || n.user_id === 'all') {
        n.read = true;
      }
    });
    localStorage.setItem(STORAGE_NOTIFICATIONS, JSON.stringify(notifs));
  }

  // ==========================================
  // PART 4: Baby & Pregnancy Tools & Memories
  // ==========================================

  // --- Feedings ---
  async getFeedings(familyId: string): Promise<Feeding[]> {
    const raw = localStorage.getItem(STORAGE_FEEDINGS);
    let feedings: Feeding[] = raw ? JSON.parse(raw) : [];

    if (!raw) {
      // Seed initial feedings for demo
      const today = new Date();
      feedings = [
        {
          id: 'feed-1',
          family_id: familyId || 'fam-demo',
          side: 'esquerdo',
          started_at: new Date(today.getTime() - 7 * 3600 * 1000).toISOString(),
          ended_at: new Date(today.getTime() - 6.7 * 3600 * 1000).toISOString(),
          amount_ml: null,
          created_by: 'seed-user',
        },
        {
          id: 'feed-2',
          family_id: familyId || 'fam-demo',
          side: 'direito',
          started_at: new Date(today.getTime() - 4 * 3600 * 1000).toISOString(),
          ended_at: new Date(today.getTime() - 3.75 * 3600 * 1000).toISOString(),
          amount_ml: null,
          created_by: 'seed-user',
        },
        {
          id: 'feed-3',
          family_id: familyId || 'fam-demo',
          side: 'mamadeira',
          started_at: new Date(today.getTime() - 1.5 * 3600 * 1000).toISOString(),
          ended_at: new Date(today.getTime() - 1.3 * 3600 * 1000).toISOString(),
          amount_ml: 90,
          created_by: 'seed-user',
        },
      ];
      localStorage.setItem(STORAGE_FEEDINGS, JSON.stringify(feedings));
    }

    return feedings
      .filter((f) => !familyId || f.family_id === familyId || f.family_id === 'fam-demo')
      .sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime());
  }

  async saveFeeding(feeding: Omit<Feeding, 'id'> & { id?: string }): Promise<Feeding> {
    const raw = localStorage.getItem(STORAGE_FEEDINGS);
    const feedings: Feeding[] = raw ? JSON.parse(raw) : [];

    const item: Feeding = {
      ...feeding,
      id: feeding.id || 'feed-' + Math.random().toString(36).substring(2, 9),
    };

    const existingIndex = feedings.findIndex((f) => f.id === item.id);
    if (existingIndex >= 0) {
      feedings[existingIndex] = item;
    } else {
      feedings.unshift(item);
    }

    localStorage.setItem(STORAGE_FEEDINGS, JSON.stringify(feedings));
    return item;
  }

  async deleteFeeding(id: string): Promise<void> {
    const raw = localStorage.getItem(STORAGE_FEEDINGS);
    if (!raw) return;
    const feedings: Feeding[] = JSON.parse(raw);
    const filtered = feedings.filter((f) => f.id !== id);
    localStorage.setItem(STORAGE_FEEDINGS, JSON.stringify(filtered));
  }

  // --- Diapers ---
  async getDiapers(familyId: string): Promise<Diaper[]> {
    const raw = localStorage.getItem(STORAGE_DIAPERS);
    let diapers: Diaper[] = raw ? JSON.parse(raw) : [];

    if (!raw) {
      const today = new Date();
      diapers = [
        {
          id: 'diaper-1',
          family_id: familyId || 'fam-demo',
          kind: 'xixi',
          color: null,
          at: new Date(today.getTime() - 8 * 3600 * 1000).toISOString(),
          created_by: 'seed-user',
        },
        {
          id: 'diaper-2',
          family_id: familyId || 'fam-demo',
          kind: 'coco',
          color: 'amarelo',
          at: new Date(today.getTime() - 5.5 * 3600 * 1000).toISOString(),
          created_by: 'seed-user',
        },
        {
          id: 'diaper-3',
          family_id: familyId || 'fam-demo',
          kind: 'ambos',
          color: 'amarelo',
          at: new Date(today.getTime() - 2.5 * 3600 * 1000).toISOString(),
          created_by: 'seed-user',
        },
        {
          id: 'diaper-4',
          family_id: familyId || 'fam-demo',
          kind: 'xixi',
          color: null,
          at: new Date(today.getTime() - 40 * 60 * 1000).toISOString(),
          created_by: 'seed-user',
        },
      ];
      localStorage.setItem(STORAGE_DIAPERS, JSON.stringify(diapers));
    }

    return diapers
      .filter((d) => !familyId || d.family_id === familyId || d.family_id === 'fam-demo')
      .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
  }

  async saveDiaper(diaper: Omit<Diaper, 'id'> & { id?: string }): Promise<Diaper> {
    const raw = localStorage.getItem(STORAGE_DIAPERS);
    const diapers: Diaper[] = raw ? JSON.parse(raw) : [];

    const item: Diaper = {
      ...diaper,
      id: diaper.id || 'diaper-' + Math.random().toString(36).substring(2, 9),
    };

    const existingIndex = diapers.findIndex((d) => d.id === item.id);
    if (existingIndex >= 0) {
      diapers[existingIndex] = item;
    } else {
      diapers.unshift(item);
    }

    localStorage.setItem(STORAGE_DIAPERS, JSON.stringify(diapers));
    return item;
  }

  async deleteDiaper(id: string): Promise<void> {
    const raw = localStorage.getItem(STORAGE_DIAPERS);
    if (!raw) return;
    const diapers: Diaper[] = JSON.parse(raw);
    const filtered = diapers.filter((d) => d.id !== id);
    localStorage.setItem(STORAGE_DIAPERS, JSON.stringify(filtered));
  }

  // --- Sleeps ---
  async getSleeps(familyId: string): Promise<Sleep[]> {
    const raw = localStorage.getItem(STORAGE_SLEEPS);
    let sleeps: Sleep[] = raw ? JSON.parse(raw) : [];

    if (!raw) {
      const today = new Date();
      sleeps = [
        {
          id: 'sleep-1',
          family_id: familyId || 'fam-demo',
          started_at: new Date(today.getTime() - 9 * 3600 * 1000).toISOString(),
          ended_at: new Date(today.getTime() - 6.5 * 3600 * 1000).toISOString(), // 2h30m
          created_by: 'seed-user',
        },
        {
          id: 'sleep-2',
          family_id: familyId || 'fam-demo',
          started_at: new Date(today.getTime() - 4.5 * 3600 * 1000).toISOString(),
          ended_at: new Date(today.getTime() - 3 * 3600 * 1000).toISOString(), // 1h30m
          created_by: 'seed-user',
        },
      ];
      localStorage.setItem(STORAGE_SLEEPS, JSON.stringify(sleeps));
    }

    return sleeps
      .filter((s) => !familyId || s.family_id === familyId || s.family_id === 'fam-demo')
      .sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime());
  }

  async saveSleep(sleep: Omit<Sleep, 'id'> & { id?: string }): Promise<Sleep> {
    const raw = localStorage.getItem(STORAGE_SLEEPS);
    const sleeps: Sleep[] = raw ? JSON.parse(raw) : [];

    const item: Sleep = {
      ...sleep,
      id: sleep.id || 'sleep-' + Math.random().toString(36).substring(2, 9),
    };

    const existingIndex = sleeps.findIndex((s) => s.id === item.id);
    if (existingIndex >= 0) {
      sleeps[existingIndex] = item;
    } else {
      sleeps.unshift(item);
    }

    localStorage.setItem(STORAGE_SLEEPS, JSON.stringify(sleeps));
    return item;
  }

  async deleteSleep(id: string): Promise<void> {
    const raw = localStorage.getItem(STORAGE_SLEEPS);
    if (!raw) return;
    const sleeps: Sleep[] = JSON.parse(raw);
    const filtered = sleeps.filter((s) => s.id !== id);
    localStorage.setItem(STORAGE_SLEEPS, JSON.stringify(filtered));
  }

  // --- Contractions ---
  async getContractions(userId: string): Promise<Contraction[]> {
    const raw = localStorage.getItem(STORAGE_CONTRACTIONS);
    const contractions: Contraction[] = raw ? JSON.parse(raw) : [];
    return contractions
      .filter((c) => c.user_id === userId)
      .sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime());
  }

  async saveContraction(contraction: Omit<Contraction, 'id'> & { id?: string }): Promise<Contraction> {
    const raw = localStorage.getItem(STORAGE_CONTRACTIONS);
    const contractions: Contraction[] = raw ? JSON.parse(raw) : [];

    const item: Contraction = {
      ...contraction,
      id: contraction.id || 'contra-' + Math.random().toString(36).substring(2, 9),
    };

    contractions.unshift(item);
    localStorage.setItem(STORAGE_CONTRACTIONS, JSON.stringify(contractions));
    return item;
  }

  async clearContractions(userId: string): Promise<void> {
    const raw = localStorage.getItem(STORAGE_CONTRACTIONS);
    if (!raw) return;
    const contractions: Contraction[] = JSON.parse(raw);
    const filtered = contractions.filter((c) => c.user_id !== userId);
    localStorage.setItem(STORAGE_CONTRACTIONS, JSON.stringify(filtered));
  }

  // --- Appointments ---
  async getAppointments(userId: string): Promise<Appointment[]> {
    const raw = localStorage.getItem(STORAGE_APPOINTMENTS);
    let appointments: Appointment[] = raw ? JSON.parse(raw) : [];

    if (!raw) {
      const now = Date.now();
      appointments = [
        {
          id: 'apt-1',
          user_id: userId,
          title: 'Ultrassom 11 a 14 semanas (Translucência Nucal)',
          kind: 'ultrassom',
          date_time: new Date(now - 14 * 86400 * 1000).toISOString(),
          notes: 'Tudo dentro do esperado. Bebê medindo 6,2 cm e batimentos 155 bpm.',
          done: true,
        },
        {
          id: 'apt-2',
          user_id: userId,
          title: 'Consulta Pré-Natal com Obstetra',
          kind: 'consulta',
          date_time: new Date(now + 4 * 86400 * 1000 + 10 * 3600 * 1000).toISOString(),
          notes: 'Levar resultados dos exames de sangue e urina do 2º trimestre.',
          done: false,
        },
        {
          id: 'apt-3',
          user_id: userId,
          title: 'Ultrassom Morfológico (20 a 24 semanas)',
          kind: 'ultrassom',
          date_time: new Date(now + 21 * 86400 * 1000 + 14 * 3600 * 1000).toISOString(),
          notes: 'Avaliação detalhada da anatomia do bebê.',
          done: false,
        },
        {
          id: 'apt-4',
          user_id: userId,
          title: 'Curva Glicêmica (TOTG 24 a 28 semanas)',
          kind: 'exame',
          date_time: new Date(now + 38 * 86400 * 1000 + 8 * 3600 * 1000).toISOString(),
          notes: 'Jejum prévio de 8 a 12 horas. Levar algo confortável para ler.',
          done: false,
        },
        {
          id: 'apt-5',
          user_id: userId,
          title: 'Vacina dTpa (a partir de 20 semanas)',
          kind: 'vacina',
          date_time: new Date(now + 25 * 86400 * 1000).toISOString(),
          notes: 'Protege o bebê contra tétano, difteria e coqueluche.',
          done: false,
        },
      ];
      localStorage.setItem(STORAGE_APPOINTMENTS, JSON.stringify(appointments));
    }

    return appointments
      .filter((a) => a.user_id === userId || a.user_id === 'all')
      .sort((a, b) => new Date(a.date_time).getTime() - new Date(b.date_time).getTime());
  }

  async saveAppointment(appointment: Omit<Appointment, 'id'> & { id?: string }): Promise<Appointment> {
    const raw = localStorage.getItem(STORAGE_APPOINTMENTS);
    const appointments: Appointment[] = raw ? JSON.parse(raw) : [];

    const item: Appointment = {
      ...appointment,
      id: appointment.id || 'apt-' + Math.random().toString(36).substring(2, 9),
    };

    const existingIndex = appointments.findIndex((a) => a.id === item.id);
    if (existingIndex >= 0) {
      appointments[existingIndex] = item;
    } else {
      appointments.push(item);
    }

    localStorage.setItem(STORAGE_APPOINTMENTS, JSON.stringify(appointments));
    return item;
  }

  async toggleAppointmentDone(id: string, done: boolean): Promise<void> {
    const raw = localStorage.getItem(STORAGE_APPOINTMENTS);
    if (!raw) return;
    const appointments: Appointment[] = JSON.parse(raw);
    const item = appointments.find((a) => a.id === id);
    if (item) {
      item.done = done;
      localStorage.setItem(STORAGE_APPOINTMENTS, JSON.stringify(appointments));
    }
  }

  async deleteAppointment(id: string): Promise<void> {
    const raw = localStorage.getItem(STORAGE_APPOINTMENTS);
    if (!raw) return;
    const appointments: Appointment[] = JSON.parse(raw);
    const filtered = appointments.filter((a) => a.id !== id);
    localStorage.setItem(STORAGE_APPOINTMENTS, JSON.stringify(filtered));
  }

  // --- Checklists (Mala & Enxoval) ---
  async getChecklistItems(userId: string, list: ChecklistList): Promise<ChecklistItem[]> {
    const raw = localStorage.getItem(STORAGE_CHECKLISTS);
    let allItems: ChecklistItem[] = raw ? JSON.parse(raw) : [];

    let userListItems = allItems.filter((i) => i.user_id === userId && i.list === list);

    if (userListItems.length === 0) {
      if (list === 'mala') {
        const defaults: ChecklistItem[] = [
          // Mae
          { user_id: userId, list: 'mala', item_key: 'mae_camisolas', label: '3 camisolas ou pijamas com abertura frontal para amamentar', category: 'mae', done: false },
          { user_id: userId, list: 'mala', item_key: 'mae_sutias', label: '2 a 3 sutiãs de amamentação confortáveis sem aro', category: 'mae', done: false },
          { user_id: userId, list: 'mala', item_key: 'mae_calcinhas', label: '5 a 6 calcinhas pós-parto de cintura alta em algodão', category: 'mae', done: true },
          { user_id: userId, list: 'mala', item_key: 'mae_absorventes', label: '1 pacote de absorventes noturnos pós-parto', category: 'mae', done: true },
          { user_id: userId, list: 'mala', item_key: 'mae_higiene', label: 'Kit de higiene pessoal (escova, pasta, sabonete, hidratante labial)', category: 'mae', done: false },
          { user_id: userId, list: 'mala', item_key: 'mae_chinelo', label: 'Chinelo macio de quarto e chinelo de borracha para o banho', category: 'mae', done: false },
          { user_id: userId, list: 'mala', item_key: 'mae_documentos', label: 'Documentos com foto, cartão do convênio e caderneta pré-natal', category: 'mae', done: true },
          { user_id: userId, list: 'mala', item_key: 'mae_roupa_saida', label: '1 roupa solta e confortável para a saída da maternidade', category: 'mae', done: false },
          // Bebe
          { user_id: userId, list: 'mala', item_key: 'bebe_macacoes', label: '4 a 6 macacões de manga longa (tamanho RN e P)', category: 'bebe', done: true },
          { user_id: userId, list: 'mala', item_key: 'bebe_bodies', label: '6 bodies e 6 mijões/culotes de algodão macio', category: 'bebe', done: true },
          { user_id: userId, list: 'mala', item_key: 'bebe_meias_luvas', label: '3 pares de meias e 2 pares de luvinhas', category: 'bebe', done: false },
          { user_id: userId, list: 'mala', item_key: 'bebe_toucas', label: '2 touquinhas de algodão', category: 'bebe', done: false },
          { user_id: userId, list: 'mala', item_key: 'bebe_fraldas_pano', label: '6 fraldas de pano e 6 paninhos de boca (babetes)', category: 'bebe', done: true },
          { user_id: userId, list: 'mala', item_key: 'bebe_manta', label: '2 mantas de toque macio e cueiro', category: 'bebe', done: false },
          { user_id: userId, list: 'mala', item_key: 'bebe_saida', label: '1 roupinha especial para saída da maternidade com manta', category: 'bebe', done: false },
          { user_id: userId, list: 'mala', item_key: 'bebe_fraldas_desc', label: '1 pacote de fraldas descartáveis RN', category: 'bebe', done: true },
          // Acompanhante
          { user_id: userId, list: 'mala', item_key: 'acomp_roupas', label: '2 trocas de roupas confortáveis', category: 'acompanhante', done: false },
          { user_id: userId, list: 'mala', item_key: 'acomp_higiene', label: 'Kit de higiene pessoal e desodorante', category: 'acompanhante', done: false },
          { user_id: userId, list: 'mala', item_key: 'acomp_carregador', label: 'Carregador de celular com cabo longo', category: 'acompanhante', done: true },
          { user_id: userId, list: 'mala', item_key: 'acomp_lanchinhos', label: 'Lanches práticos, castanhas e garrafa de água', category: 'acompanhante', done: false },
        ];
        allItems.push(...defaults);
        localStorage.setItem(STORAGE_CHECKLISTS, JSON.stringify(allItems));
        return defaults;
      }
    }

    return userListItems;
  }

  async saveChecklistItem(item: ChecklistItem): Promise<void> {
    const raw = localStorage.getItem(STORAGE_CHECKLISTS);
    const allItems: ChecklistItem[] = raw ? JSON.parse(raw) : [];

    const idx = allItems.findIndex(
      (i) => i.user_id === item.user_id && i.list === item.list && i.item_key === item.item_key
    );

    if (idx >= 0) {
      allItems[idx] = { ...allItems[idx], ...item };
    } else {
      allItems.push(item);
    }

    localStorage.setItem(STORAGE_CHECKLISTS, JSON.stringify(allItems));
  }

  // --- Birth Plan ---
  async getBirthPlan(userId: string): Promise<BirthPlan | null> {
    const raw = localStorage.getItem(STORAGE_BIRTH_PLANS);
    const plans: Record<string, BirthPlan> = raw ? JSON.parse(raw) : {};
    return plans[userId] || null;
  }

  async saveBirthPlan(userId: string, data: Record<string, any>): Promise<BirthPlan> {
    const raw = localStorage.getItem(STORAGE_BIRTH_PLANS);
    const plans: Record<string, BirthPlan> = raw ? JSON.parse(raw) : {};

    const plan: BirthPlan = {
      user_id: userId,
      data,
      updated_at: new Date().toISOString(),
    };

    plans[userId] = plan;
    localStorage.setItem(STORAGE_BIRTH_PLANS, JSON.stringify(plans));
    return plan;
  }

  // --- Milestones ---
  async getMilestones(userId: string): Promise<Milestone[]> {
    const raw = localStorage.getItem(STORAGE_MILESTONES);
    let milestones: Milestone[] = raw ? JSON.parse(raw) : [];

    if (!raw) {
      const today = new Date();
      milestones = [
        {
          id: 'mile-1',
          user_id: userId,
          kind: 'gestacao',
          title: 'Descobri que era você! (Teste de gravidez positivo)',
          date: new Date(today.getTime() - 100 * 86400 * 1000).toISOString().split('T')[0],
          note: 'O coração disparou ao ver as duas listrinhas no teste.',
        },
        {
          id: 'mile-2',
          user_id: userId,
          kind: 'gestacao',
          title: 'Primeiro ultrassom — vimos o pequeno feijãozinho',
          date: new Date(today.getTime() - 80 * 86400 * 1000).toISOString().split('T')[0],
          note: 'Tão pequenininho e já tão gigante dentro de nós.',
        },
        {
          id: 'mile-3',
          user_id: userId,
          kind: 'gestacao',
          title: 'Primeiro bater do coração no consultório',
          date: new Date(today.getTime() - 65 * 86400 * 1000).toISOString().split('T')[0],
          note: 'O som mais potente e lindo de todo o universo.',
        },
        {
          id: 'mile-4',
          user_id: userId,
          kind: 'gestacao',
          title: 'Primeiro chute na barriga',
          date: new Date(today.getTime() - 25 * 86400 * 1000).toISOString().split('T')[0],
          note: 'Uma borboletinha no começo que virou o toque de amor mais gostoso.',
        },
        {
          id: 'mile-5',
          user_id: userId,
          kind: 'bebe',
          title: 'Primeiro sorriso espontâneo acordado',
          date: new Date(today.getTime() - 10 * 86400 * 1000).toISOString().split('T')[0],
          note: 'Iluminou o quarto todo e derreteu meu peito de emoção.',
        },
      ];
      localStorage.setItem(STORAGE_MILESTONES, JSON.stringify(milestones));
    }

    return milestones
      .filter((m) => m.user_id === userId || m.user_id === 'all')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async saveMilestone(milestone: Omit<Milestone, 'id'> & { id?: string }): Promise<Milestone> {
    const raw = localStorage.getItem(STORAGE_MILESTONES);
    const milestones: Milestone[] = raw ? JSON.parse(raw) : [];

    const item: Milestone = {
      ...milestone,
      id: milestone.id || 'mile-' + Math.random().toString(36).substring(2, 9),
    };

    const existingIndex = milestones.findIndex((m) => m.id === item.id);
    if (existingIndex >= 0) {
      milestones[existingIndex] = item;
    } else {
      milestones.unshift(item);
    }

    localStorage.setItem(STORAGE_MILESTONES, JSON.stringify(milestones));
    return item;
  }

  async deleteMilestone(id: string): Promise<void> {
    const raw = localStorage.getItem(STORAGE_MILESTONES);
    if (!raw) return;
    const milestones: Milestone[] = JSON.parse(raw);
    const filtered = milestones.filter((m) => m.id !== id);
    localStorage.setItem(STORAGE_MILESTONES, JSON.stringify(filtered));
  }

  // --- Letters ---
  async getLetters(userId: string): Promise<Letter[]> {
    const raw = localStorage.getItem(STORAGE_LETTERS);
    let letters: Letter[] = raw ? JSON.parse(raw) : [];

    if (!raw) {
      letters = [
        {
          id: 'letter-1',
          user_id: userId,
          title: 'Meu pequeno amor, antes de você chegar...',
          body: 'Filho(a), quando descobri você, meu mundo parou por alguns segundos para se reorganizar por inteiro. Hoje sinto seus chutes e imagino o formato dos seus olhos, o cheirinho do seu cabelinho e o som do seu choro. Quero que você saiba que, aconteça o que acontecer na vida, este colo sempre será o seu porto seguro incondicional. Com todo o meu amor, sua mãe.',
          created_at: new Date(Date.now() - 30 * 86400 * 1000).toISOString(),
        },
      ];
      localStorage.setItem(STORAGE_LETTERS, JSON.stringify(letters));
    }

    return letters
      .filter((l) => l.user_id === userId || l.user_id === 'all')
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  async saveLetter(letter: Omit<Letter, 'id'> & { id?: string }): Promise<Letter> {
    const raw = localStorage.getItem(STORAGE_LETTERS);
    const letters: Letter[] = raw ? JSON.parse(raw) : [];

    const item: Letter = {
      ...letter,
      id: letter.id || 'let-' + Math.random().toString(36).substring(2, 9),
      created_at: letter.created_at || new Date().toISOString(),
    };

    const existingIndex = letters.findIndex((l) => l.id === item.id);
    if (existingIndex >= 0) {
      letters[existingIndex] = item;
    } else {
      letters.unshift(item);
    }

    localStorage.setItem(STORAGE_LETTERS, JSON.stringify(letters));
    return item;
  }

  async deleteLetter(id: string): Promise<void> {
    const raw = localStorage.getItem(STORAGE_LETTERS);
    if (!raw) return;
    const letters: Letter[] = JSON.parse(raw);
    const filtered = letters.filter((l) => l.id !== id);
    localStorage.setItem(STORAGE_LETTERS, JSON.stringify(filtered));
  }

  // ==========================================
  // PART 5: ADMIN PANEL & MODERATION
  // ==========================================

  async getAdminSummaryStats(): Promise<AdminSummaryStats> {
    const rawProfiles = localStorage.getItem(STORAGE_PROFILES);
    const profiles: Record<string, Profile> = rawProfiles ? JSON.parse(rawProfiles) : {};
    const now = new Date();

    const profileList = Object.values(profiles);
    const activeMothers = profileList.filter((p) => p.access_until && new Date(p.access_until) > now).length;
    // ensure realistic demonstration baseline if only 1 user registered yet
    const displayTotalMothers = Math.max(activeMothers, 486);

    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const newMothers = profileList.filter((p) => p.created_at && new Date(p.created_at) > sevenDaysAgo).length;
    const displayNewMothers = Math.max(newMothers, 34);

    const rawReports = localStorage.getItem(STORAGE_REPORTS);
    const reports: Report[] = rawReports ? JSON.parse(rawReports) : [];
    const openReportsCount = reports.filter((r) => r.status === 'aberta').length;

    const rawPosts = localStorage.getItem(STORAGE_POSTS);
    const posts: Post[] = rawPosts ? JSON.parse(rawPosts) : [];
    const rawComments = localStorage.getItem(STORAGE_COMMENTS);
    const comments: Comment[] = rawComments ? JSON.parse(rawComments) : [];

    const todayStr = now.toISOString().split('T')[0];
    const postsToday = posts.filter((p) => p.created_at?.startsWith(todayStr)).length;
    const commentsToday = comments.filter((c) => c.created_at?.startsWith(todayStr)).length;
    const postsAndCommentsToday = Math.max(postsToday + commentsToday, 62);

    // 30 days history curve
    const chart30Days: Array<{ date: string; mothers: number; posts: number }> = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayLabel = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
      // realistic organic progression
      const baseMothers = 380 + Math.floor(i * -3.5 + (30 - i) * 3.8);
      const dayPosts = 15 + Math.floor(Math.sin(i * 0.8) * 6 + Math.random() * 8);
      chart30Days.push({
        date: dayLabel,
        mothers: baseMothers,
        posts: dayPosts,
      });
    }

    return {
      totalActiveMothers: displayTotalMothers,
      newMothersLast7Days: displayNewMothers,
      activeMothersToday: 128,
      postsAndCommentsToday,
      openReportsCount,
      mostActiveTurmas: [
        { id: 'turma-2027-03', label: 'Turma Março 2027', count: 142 },
        { id: 'turma-2027-02', label: 'Turma Fevereiro 2027', count: 128 },
        { id: 'turma-2027-04', label: 'Turma Abril 2027', count: 95 },
        { id: 'turma-2027-01', label: 'Turma Janeiro 2027', count: 71 },
      ],
      chart30Days,
    };
  }

  async getAdminReports(): Promise<AdminReportItem[]> {
    const rawReports = localStorage.getItem(STORAGE_REPORTS);
    const reports: Report[] = rawReports ? JSON.parse(rawReports) : [];

    const rawPosts = localStorage.getItem(STORAGE_POSTS);
    const posts: Post[] = rawPosts ? JSON.parse(rawPosts) : [];

    const rawComments = localStorage.getItem(STORAGE_COMMENTS);
    const comments: Comment[] = rawComments ? JSON.parse(rawComments) : [];

    const rawProfiles = localStorage.getItem(STORAGE_PROFILES);
    const profiles: Record<string, Profile> = rawProfiles ? JSON.parse(rawProfiles) : {};

    return reports.map((r) => {
      let target_content = '';
      let author_nickname = 'Usuária Anônima';
      let author_id = '';

      if (r.target_type === 'post') {
        const p = posts.find((item) => item.id === r.target_id);
        if (p) {
          target_content = p.body;
          author_nickname = p.author_nickname;
          author_id = p.author_id;
        }
      } else if (r.target_type === 'comment') {
        const c = comments.find((item) => item.id === r.target_id);
        if (c) {
          target_content = c.body;
          author_nickname = c.author_nickname;
          author_id = c.author_id;
        }
      } else if (r.target_type === 'user') {
        const prof = profiles[r.target_id];
        if (prof) {
          author_nickname = prof.nickname;
          author_id = prof.id;
          target_content = `Perfil da usuária: ${prof.nickname} (${prof.phase === 'gestante' ? 'Gestante' : 'Mãe'})`;
        }
      }

      const reporter = profiles[r.reporter_id];

      return {
        ...r,
        target_content: target_content || 'Conteúdo não encontrado ou já removido',
        reporter_nickname: reporter?.nickname || 'Mãe Anônima',
        author_nickname,
        author_id,
      };
    });
  }

  async resolveReport(reportId: string, action: 'ocultar' | 'manter' | 'advertir' | 'banir', _notes?: string): Promise<void> {
    const rawReports = localStorage.getItem(STORAGE_REPORTS);
    if (!rawReports) return;
    const reports: Report[] = JSON.parse(rawReports);
    const reportIndex = reports.findIndex((r) => r.id === reportId);
    if (reportIndex === -1) return;

    const report = reports[reportIndex];
    report.status = 'resolvida';

    // 1. Ocultar conteúdo
    if (action === 'ocultar' || action === 'banir') {
      if (report.target_type === 'post') {
        const rawPosts = localStorage.getItem(STORAGE_POSTS);
        if (rawPosts) {
          const posts: Post[] = JSON.parse(rawPosts);
          const p = posts.find((item) => item.id === report.target_id);
          if (p) {
            p.hidden = true;
            localStorage.setItem(STORAGE_POSTS, JSON.stringify(posts));
          }
        }
      } else if (report.target_type === 'comment') {
        const rawComments = localStorage.getItem(STORAGE_COMMENTS);
        if (rawComments) {
          const comments: Comment[] = JSON.parse(rawComments);
          const c = comments.find((item) => item.id === report.target_id);
          if (c) {
            c.hidden = true;
            localStorage.setItem(STORAGE_COMMENTS, JSON.stringify(comments));
          }
        }
      }
    }

    // 2. Advertir usuária
    if (action === 'advertir') {
      // Find author
      let targetUserId = report.target_id;
      if (report.target_type === 'post') {
        const rawPosts = localStorage.getItem(STORAGE_POSTS);
        const p = rawPosts ? (JSON.parse(rawPosts) as Post[]).find((x) => x.id === report.target_id) : null;
        if (p) targetUserId = p.author_id;
      } else if (report.target_type === 'comment') {
        const rawComments = localStorage.getItem(STORAGE_COMMENTS);
        const c = rawComments ? (JSON.parse(rawComments) as Comment[]).find((x) => x.id === report.target_id) : null;
        if (c) targetUserId = c.author_id;
      }

      await this.warnMother(targetUserId);

      // Send notification
      const rawNotifs = localStorage.getItem(STORAGE_NOTIFICATIONS);
      const notifs: AppNotification[] = rawNotifs ? JSON.parse(rawNotifs) : [];
      notifs.unshift({
        id: 'warn-' + Math.random().toString(36).substring(2, 9),
        user_id: targetUserId,
        title: 'Aviso da Moderação',
        body: 'Uma de suas interações recebeu uma advertência por violar os termos de acolhimento mútuo. Por favor, mantenha o tom respeitoso.',
        created_at: new Date().toISOString(),
        read: false,
      });
      localStorage.setItem(STORAGE_NOTIFICATIONS, JSON.stringify(notifs));
    }

    // 3. Banir mãe da comunidade
    if (action === 'banir') {
      let targetUserId = report.target_id;
      if (report.target_type === 'post') {
        const rawPosts = localStorage.getItem(STORAGE_POSTS);
        const p = rawPosts ? (JSON.parse(rawPosts) as Post[]).find((x) => x.id === report.target_id) : null;
        if (p) targetUserId = p.author_id;
      } else if (report.target_type === 'comment') {
        const rawComments = localStorage.getItem(STORAGE_COMMENTS);
        const c = rawComments ? (JSON.parse(rawComments) as Comment[]).find((x) => x.id === report.target_id) : null;
        if (c) targetUserId = c.author_id;
      }
      await this.toggleMotherBan(targetUserId, true);
    }

    localStorage.setItem(STORAGE_REPORTS, JSON.stringify(reports));
  }

  async getRiskAlerts(): Promise<RiskAlert[]> {
    const raw = localStorage.getItem(STORAGE_RISK_ALERTS);
    const alerts: RiskAlert[] = raw ? JSON.parse(raw) : [];
    return alerts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  async markRiskAlertAccompanied(alertId: string): Promise<void> {
    const raw = localStorage.getItem(STORAGE_RISK_ALERTS);
    if (!raw) return;
    const alerts: RiskAlert[] = JSON.parse(raw);
    const item = alerts.find((a) => a.id === alertId);
    if (item) {
      item.status = 'acompanhado';
      localStorage.setItem(STORAGE_RISK_ALERTS, JSON.stringify(alerts));
    }
  }

  async recordRiskAlert(alert: { text: string; matched_word: string; user_id?: string; user_nickname?: string }): Promise<void> {
    const raw = localStorage.getItem(STORAGE_RISK_ALERTS);
    const alerts: RiskAlert[] = raw ? JSON.parse(raw) : [];
    const item: RiskAlert = {
      id: 'risk-' + Math.random().toString(36).substring(2, 9),
      user_id: alert.user_id,
      user_nickname: alert.user_nickname || 'Mãe Anônima',
      text: alert.text,
      matched_word: alert.matched_word,
      status: 'pendente',
      created_at: new Date().toISOString(),
    };
    alerts.unshift(item);
    localStorage.setItem(STORAGE_RISK_ALERTS, JSON.stringify(alerts));
  }

  async getScheduledQuestions(): Promise<ScheduledQuestion[]> {
    const raw = localStorage.getItem(STORAGE_SCHEDULED_QUESTIONS);
    const questions: ScheduledQuestion[] = raw ? JSON.parse(raw) : [];
    return questions.sort((a, b) => a.date.localeCompare(b.date));
  }

  async saveScheduledQuestion(item: Omit<ScheduledQuestion, 'id'> & { id?: string }): Promise<ScheduledQuestion> {
    const raw = localStorage.getItem(STORAGE_SCHEDULED_QUESTIONS);
    const questions: ScheduledQuestion[] = raw ? JSON.parse(raw) : [];
    const saved: ScheduledQuestion = {
      id: item.id || 'sq-' + Math.random().toString(36).substring(2, 9),
      date: item.date,
      question: item.question,
      turma_id: item.turma_id || 'all',
      created_at: item.created_at || new Date().toISOString(),
    };

    const idx = questions.findIndex((q) => q.id === saved.id);
    if (idx >= 0) {
      questions[idx] = saved;
    } else {
      questions.push(saved);
    }
    localStorage.setItem(STORAGE_SCHEDULED_QUESTIONS, JSON.stringify(questions));
    return saved;
  }

  async deleteScheduledQuestion(id: string): Promise<void> {
    const raw = localStorage.getItem(STORAGE_SCHEDULED_QUESTIONS);
    if (!raw) return;
    const questions: ScheduledQuestion[] = JSON.parse(raw);
    const filtered = questions.filter((q) => q.id !== id);
    localStorage.setItem(STORAGE_SCHEDULED_QUESTIONS, JSON.stringify(filtered));
  }

  async getAdminTurmas(): Promise<TurmaAdminInfo[]> {
    const rawMerged = localStorage.getItem(STORAGE_MERGED_TURMAS);
    const mergedMap: Record<string, { mergedWithId: string; mergedWithLabel: string }> = rawMerged ? JSON.parse(rawMerged) : {};

    const baseTurmas: TurmaAdminInfo[] = [
      {
        id: 'turma-2027-03',
        slug: '2027-03',
        label: 'Turma Março 2027',
        month: '2027-03-01',
        mothers_count: 142,
        posts_count: 48,
        posts_this_week: 16,
      },
      {
        id: 'turma-2027-02',
        slug: '2027-02',
        label: 'Turma Fevereiro 2027',
        month: '2027-02-01',
        mothers_count: 128,
        posts_count: 53,
        posts_this_week: 14,
      },
      {
        id: 'turma-2027-04',
        slug: '2027-04',
        label: 'Turma Abril 2027',
        month: '2027-04-01',
        mothers_count: 95,
        posts_count: 32,
        posts_this_week: 11,
      },
      {
        id: 'turma-2027-01',
        slug: '2027-01',
        label: 'Turma Janeiro 2027',
        month: '2027-01-01',
        mothers_count: 71,
        posts_count: 24,
        posts_this_week: 8,
      },
      {
        id: 'turma-2026-12',
        slug: '2026-12',
        label: 'Turma Dezembro 2026',
        month: '2026-12-01',
        mothers_count: 18,
        posts_count: 12,
        posts_this_week: 3,
      },
      {
        id: 'turma-2026-11',
        slug: '2026-11',
        label: 'Turma Novembro 2026',
        month: '2026-11-01',
        mothers_count: 14,
        posts_count: 9,
        posts_this_week: 2,
      },
    ];

    return baseTurmas.map((t) => {
      const mergeInfo = mergedMap[t.id];
      if (mergeInfo) {
        return {
          ...t,
          is_merged: true,
          merged_with_id: mergeInfo.mergedWithId,
          merged_with_label: mergeInfo.mergedWithLabel,
        };
      }
      return t;
    });
  }

  async toggleMergeTurmas(sourceTurmaId: string, targetTurmaId?: string): Promise<void> {
    const raw = localStorage.getItem(STORAGE_MERGED_TURMAS);
    const map: Record<string, { mergedWithId: string; mergedWithLabel: string }> = raw ? JSON.parse(raw) : {};

    if (map[sourceTurmaId]) {
      // Unmerge
      delete map[sourceTurmaId];
    } else if (targetTurmaId) {
      // Find label
      const turmas = await this.getAdminTurmas();
      const target = turmas.find((t) => t.id === targetTurmaId);
      map[sourceTurmaId] = {
        mergedWithId: targetTurmaId,
        mergedWithLabel: target?.label || targetTurmaId,
      };
    }
    localStorage.setItem(STORAGE_MERGED_TURMAS, JSON.stringify(map));
  }

  async getAdminMothers(search?: string): Promise<Profile[]> {
    const raw = localStorage.getItem(STORAGE_PROFILES);
    const profiles: Record<string, Profile> = raw ? JSON.parse(raw) : {};

    // Seed additional sample mothers if only a couple exist in storage so the admin list is rich
    if (Object.keys(profiles).length < 5) {
      const now = new Date();
      const sampleMothers: Array<Partial<Profile> & { id: string; email: string; nickname: string }> = [
        {
          id: 'seed-mother-1',
          email: 'mariana.luz@exemplo.com',
          nickname: 'Flor de Maio 14',
          phase: 'gestante',
          access_until: new Date(now.getTime() + 240 * 24 * 60 * 60 * 1000).toISOString(),
          is_admin: false,
          created_at: new Date(now.getTime() - 22 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'seed-mother-2',
          email: 'camila.santos@exemplo.com',
          nickname: 'Nuvem Doce 88',
          phase: 'mae',
          baby_name: 'Gabriel',
          access_until: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString(),
          is_admin: false,
          created_at: new Date(now.getTime() - 95 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'seed-mother-3',
          email: 'beatriz.v@exemplo.com',
          nickname: 'Estrela Serena 50',
          phase: 'mae',
          baby_name: 'Helena',
          access_until: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          is_admin: false,
          warnings_count: 1,
          created_at: new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'seed-mother-4',
          email: 'juliana.costa@exemplo.com',
          nickname: 'Brisa Mansa 08',
          phase: 'gestante',
          access_until: new Date(now.getTime() + 320 * 24 * 60 * 60 * 1000).toISOString(),
          is_admin: false,
          created_at: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'seed-mother-5',
          email: 'larissa.moraes@exemplo.com',
          nickname: 'Coração Leve 91',
          phase: 'mae',
          access_until: new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000).toISOString(),
          is_admin: false,
          banned_community: true,
          created_at: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ];

      for (const m of sampleMothers) {
        if (!profiles[m.id]) {
          profiles[m.id] = {
            id: m.id,
            email: m.email,
            nickname: m.nickname,
            phase: m.phase as any,
            baby_name: m.baby_name,
            locale: 'pt',
            access_until: m.access_until,
            is_admin: false,
            banned_community: m.banned_community || false,
            warnings_count: m.warnings_count || 0,
            is_adult_confirmed: true,
            created_at: m.created_at || now.toISOString(),
          };
        }
      }
      localStorage.setItem(STORAGE_PROFILES, JSON.stringify(profiles));
    }

    let list = Object.values(profiles);

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (p) =>
          (p.nickname && p.nickname.toLowerCase().includes(q)) ||
          (p.email && p.email.toLowerCase().includes(q))
      );
    }

    return list.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
  }

  async extendMotherAccess(userId: string, newAccessUntil: string): Promise<Profile> {
    const raw = localStorage.getItem(STORAGE_PROFILES);
    const profiles: Record<string, Profile> = raw ? JSON.parse(raw) : {};
    const prof = profiles[userId];
    if (!prof) throw new Error('Mother profile not found');

    prof.access_until = newAccessUntil;
    profiles[userId] = prof;
    localStorage.setItem(STORAGE_PROFILES, JSON.stringify(profiles));
    return prof;
  }

  async toggleMotherBan(userId: string, ban: boolean): Promise<Profile> {
    const raw = localStorage.getItem(STORAGE_PROFILES);
    const profiles: Record<string, Profile> = raw ? JSON.parse(raw) : {};
    const prof = profiles[userId];
    if (!prof) throw new Error('Mother profile not found');

    prof.banned_community = ban;
    profiles[userId] = prof;
    localStorage.setItem(STORAGE_PROFILES, JSON.stringify(profiles));
    return prof;
  }

  async warnMother(userId: string): Promise<Profile> {
    const raw = localStorage.getItem(STORAGE_PROFILES);
    const profiles: Record<string, Profile> = raw ? JSON.parse(raw) : {};
    const prof = profiles[userId];
    if (!prof) throw new Error('Mother profile not found');

    prof.warnings_count = (prof.warnings_count || 0) + 1;
    profiles[userId] = prof;
    localStorage.setItem(STORAGE_PROFILES, JSON.stringify(profiles));
    return prof;
  }
}

export const mockService = new MockService();
