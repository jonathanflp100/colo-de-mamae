export type PhaseType = 'gestante' | 'mae';
export type LocaleType = 'pt' | 'es' | 'en';
export type PostTopic = 'duvida' | 'desabafo' | 'conquista' | 'dica';
export type ReportTargetType = 'post' | 'comment' | 'night_message' | 'dm_message' | 'user';

export type FeedingSide = 'esquerdo' | 'direito' | 'mamadeira';
export type DiaperKind = 'xixi' | 'coco' | 'ambos';
export type DiaperColor = 'amarelo' | 'verde' | 'marrom' | 'preto' | 'branco_cinza' | 'com_sangue';
export type AppointmentKind = 'consulta' | 'exame' | 'vacina' | 'ultrassom' | 'outro';
export type ChecklistList = 'mala' | 'enxoval';
export type MilestoneKind = 'gestacao' | 'bebe';

export interface Profile {
  id: string; // uuid
  email?: string;
  nickname: string; // unique anonymous nickname
  phase: PhaseType;
  due_date?: string | null; // ISO YYYY-MM-DD
  last_period_date?: string | null; // ISO YYYY-MM-DD
  baby_birth_date?: string | null; // ISO YYYY-MM-DD
  baby_name?: string | null;
  turma_id?: string | null;
  family_id?: string | null;
  locale: LocaleType;
  access_until?: string | null; // ISO timestamp
  is_admin: boolean;
  banned_community?: boolean;
  warnings_count?: number;
  accepted_terms_at?: string | null; // ISO timestamp
  health_consent_at?: string | null; // ISO timestamp
  is_adult_confirmed: boolean;
  created_at: string; // ISO timestamp
}

export interface Turma {
  id: string;
  slug: string; // e.g. "2027-03"
  label: string; // e.g. "Turma Março 2027"
  month: string; // e.g. "2027-03-01"
  mothers_count?: number; // active count
}

export interface Family {
  id: string;
  invite_code: string; // 6 alphanumeric characters
}

export interface AuthUser {
  id: string;
  email: string;
  created_at?: string;
}

export interface Post {
  id: string;
  turma_id: string;
  author_id: string;
  author_nickname: string;
  body: string; // up to 1000 chars
  topic: PostTopic;
  comment_count: number;
  is_question_of_day: boolean;
  hidden: boolean;
  created_at: string; // ISO timestamp
}

export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  author_nickname: string;
  body: string; // up to 600 chars
  helpful_count: number;
  hidden: boolean;
  created_at: string; // ISO timestamp
  user_voted_helpful?: boolean;
}

export interface HelpfulVote {
  comment_id: string;
  user_id: string;
}

export interface NightMessage {
  id: string;
  room: LocaleType; // 'pt' | 'es' | 'en'
  author_id: string;
  author_nickname: string;
  body: string; // up to 300 chars
  hidden: boolean;
  created_at: string; // ISO timestamp
}

export interface DmThread {
  id: string;
  user_a: string;
  user_b: string;
  created_at: string;
  last_message_at: string;
  other_user_nickname?: string;
  other_user_id?: string;
  last_message_preview?: string;
  unread_count?: number;
}

export interface DmMessage {
  id: string;
  thread_id: string;
  sender_id: string;
  body: string; // up to 500 chars
  read_at?: string | null;
  created_at: string;
}

export interface Block {
  blocker_id: string;
  blocked_id: string;
}

export interface Report {
  id: string;
  reporter_id: string;
  target_type: ReportTargetType;
  target_id: string;
  reason: string;
  status: 'aberta' | 'resolvida';
  created_at: string;
}

export interface AppNotification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  created_at: string;
  read: boolean;
  link_post_id?: string;
}

// PART 4 ENTITIES
export interface Feeding {
  id: string;
  family_id: string;
  side: FeedingSide; // 'esquerdo' | 'direito' | 'mamadeira'
  started_at: string; // ISO timestamp
  ended_at?: string | null;
  amount_ml?: number | null; // optional, bottle only
  created_by: string;
}

export interface Diaper {
  id: string;
  family_id: string;
  kind: DiaperKind; // 'xixi' | 'coco' | 'ambos'
  color?: DiaperColor | null;
  at: string; // ISO timestamp
  created_by: string;
}

export interface Sleep {
  id: string;
  family_id: string;
  started_at: string; // ISO timestamp
  ended_at?: string | null;
  created_by: string;
}

export interface Contraction {
  id: string;
  user_id: string;
  started_at: string; // ISO timestamp
  ended_at: string; // ISO timestamp
}

export interface Appointment {
  id: string;
  user_id: string;
  title: string;
  kind: AppointmentKind;
  date_time: string; // ISO timestamp
  notes?: string;
  done: boolean;
}

export interface ChecklistItem {
  id?: string;
  user_id: string;
  list: ChecklistList; // 'mala' | 'enxoval'
  item_key: string;
  label?: string;
  category?: string;
  done: boolean;
}

export interface BirthPlan {
  user_id: string;
  data: Record<string, any>;
  updated_at?: string;
}

export interface Milestone {
  id: string;
  user_id: string;
  kind: MilestoneKind; // 'gestacao' | 'bebe'
  title: string;
  date: string; // YYYY-MM-DD
  note?: string;
}

export interface Letter {
  id: string;
  user_id: string;
  title: string;
  body: string;
  created_at: string; // ISO timestamp
}

// PART 5 ENTITIES (ADMIN & MODERATION)
export interface ScheduledQuestion {
  id: string;
  date: string; // YYYY-MM-DD
  question: string;
  turma_id?: string | 'all';
  created_at?: string;
}

export interface RiskAlert {
  id: string;
  user_id?: string;
  user_nickname?: string;
  text: string;
  matched_word: string;
  status: 'pendente' | 'acompanhado';
  created_at: string;
}

export interface AdminReportItem extends Report {
  target_content?: string;
  reporter_nickname?: string;
  author_nickname?: string;
  author_id?: string;
}

export interface AdminSummaryStats {
  totalActiveMothers: number;
  newMothersLast7Days: number;
  activeMothersToday: number;
  postsAndCommentsToday: number;
  openReportsCount: number;
  mostActiveTurmas: Array<{ id: string; label: string; count: number }>;
  chart30Days: Array<{ date: string; mothers: number; posts: number }>;
}

export interface TurmaAdminInfo extends Turma {
  posts_count: number;
  posts_this_week: number;
  is_merged?: boolean;
  merged_with_id?: string;
  merged_with_label?: string;
}

export interface DataService {
  // Auth
  getCurrentUser(): Promise<AuthUser | null>;
  signInWithEmail(email: string, password: string): Promise<{ user: AuthUser | null; error: Error | null }>;
  signUpWithEmail(email: string, password: string): Promise<{ user: AuthUser | null; error: Error | null }>;
  signInWithGoogle(): Promise<{ user: AuthUser | null; error: Error | null }>;
  signOut(): Promise<void>;
  resetPassword(email: string): Promise<{ success: boolean; error: Error | null }>;

  // Profiles
  getProfile(userId: string): Promise<Profile | null>;
  createProfile(profile: Partial<Profile> & { id: string }): Promise<Profile>;
  updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile>;
  deleteAccount(userId: string): Promise<void>;
  checkNicknameAvailable(nickname: string, excludeUserId?: string): Promise<boolean>;

  // Turmas
  getTurma(turmaId: string): Promise<Turma | null>;
  getOrCreateTurmaForDate(dateStr: string, locale: LocaleType): Promise<Turma>;
  getTurmaMemberCount(turmaId: string): Promise<number>;

  // Families
  getFamily(familyId: string): Promise<Family | null>;
  createFamily(): Promise<Family>;
  getFamilyByInviteCode(inviteCode: string): Promise<Family | null>;

  // Community Posts
  getPosts(turmaId: string, currentUserId?: string, topic?: PostTopic, page?: number, pageSize?: number): Promise<{ posts: Post[]; hasMore: boolean }>;
  getQuestionOfDay(turmaId: string): Promise<Post | null>;
  getPost(postId: string): Promise<Post | null>;
  createPost(post: { turma_id: string; author_id: string; author_nickname: string; body: string; topic: PostTopic; is_question_of_day?: boolean }): Promise<Post>;
  
  // Comments
  getComments(postId: string, currentUserId?: string): Promise<Comment[]>;
  createComment(comment: { post_id: string; author_id: string; author_nickname: string; body: string }): Promise<Comment>;
  toggleHelpfulVote(commentId: string, userId: string): Promise<{ helpful_count: number; user_voted: boolean }>;

  // Night Room
  getNightMessages(room: LocaleType, currentUserId?: string): Promise<NightMessage[]>;
  createNightMessage(message: { room: LocaleType; author_id: string; author_nickname: string; body: string }): Promise<NightMessage>;

  // Direct Messages (DMs)
  getDmThreads(userId: string): Promise<DmThread[]>;
  getOrCreateDmThread(userAId: string, userBId: string, userBNickname?: string): Promise<DmThread>;
  getDmMessages(threadId: string, currentUserId: string): Promise<DmMessage[]>;
  sendDmMessage(threadId: string, senderId: string, body: string): Promise<DmMessage>;
  markDmThreadAsRead(threadId: string, currentUserId: string): Promise<void>;

  // Moderation: Blocks & Reports
  blockUser(blockerId: string, blockedId: string): Promise<void>;
  isUserBlocked(userAId: string, userBId: string): Promise<boolean>;
  reportContent(report: { reporter_id: string; target_type: ReportTargetType; target_id: string; reason: string }): Promise<void>;

  // In-app Notifications
  getNotifications(userId: string): Promise<AppNotification[]>;
  markNotificationAsRead(notificationId: string): Promise<void>;
  markAllNotificationsAsRead(userId: string): Promise<void>;

  // PART 4: Tools & Tracking
  // Feedings
  getFeedings(familyId: string): Promise<Feeding[]>;
  saveFeeding(feeding: Omit<Feeding, 'id'> & { id?: string }): Promise<Feeding>;
  deleteFeeding(id: string): Promise<void>;

  // Diapers
  getDiapers(familyId: string): Promise<Diaper[]>;
  saveDiaper(diaper: Omit<Diaper, 'id'> & { id?: string }): Promise<Diaper>;
  deleteDiaper(id: string): Promise<void>;

  // Sleeps
  getSleeps(familyId: string): Promise<Sleep[]>;
  saveSleep(sleep: Omit<Sleep, 'id'> & { id?: string }): Promise<Sleep>;
  deleteSleep(id: string): Promise<void>;

  // Contractions
  getContractions(userId: string): Promise<Contraction[]>;
  saveContraction(contraction: Omit<Contraction, 'id'> & { id?: string }): Promise<Contraction>;
  clearContractions(userId: string): Promise<void>;

  // Appointments
  getAppointments(userId: string): Promise<Appointment[]>;
  saveAppointment(appointment: Omit<Appointment, 'id'> & { id?: string }): Promise<Appointment>;
  toggleAppointmentDone(id: string, done: boolean): Promise<void>;
  deleteAppointment(id: string): Promise<void>;

  // Checklists (Mala & Enxoval)
  getChecklistItems(userId: string, list: ChecklistList): Promise<ChecklistItem[]>;
  saveChecklistItem(item: ChecklistItem): Promise<void>;

  // Birth Plan
  getBirthPlan(userId: string): Promise<BirthPlan | null>;
  saveBirthPlan(userId: string, data: Record<string, any>): Promise<BirthPlan>;

  // Milestones
  getMilestones(userId: string): Promise<Milestone[]>;
  saveMilestone(milestone: Omit<Milestone, 'id'> & { id?: string }): Promise<Milestone>;
  deleteMilestone(id: string): Promise<void>;

  // Letters
  getLetters(userId: string): Promise<Letter[]>;
  saveLetter(letter: Omit<Letter, 'id'> & { id?: string }): Promise<Letter>;
  deleteLetter(id: string): Promise<void>;

  // PART 5: Admin Panel & Moderation
  getAdminSummaryStats(): Promise<AdminSummaryStats>;
  getAdminReports(): Promise<AdminReportItem[]>;
  resolveReport(reportId: string, action: 'ocultar' | 'manter' | 'advertir' | 'banir', notes?: string): Promise<void>;
  getRiskAlerts(): Promise<RiskAlert[]>;
  markRiskAlertAccompanied(alertId: string): Promise<void>;
  recordRiskAlert(alert: { text: string; matched_word: string; user_id?: string; user_nickname?: string }): Promise<void>;
  getScheduledQuestions(): Promise<ScheduledQuestion[]>;
  saveScheduledQuestion(item: Omit<ScheduledQuestion, 'id'> & { id?: string }): Promise<ScheduledQuestion>;
  deleteScheduledQuestion(id: string): Promise<void>;
  getAdminTurmas(): Promise<TurmaAdminInfo[]>;
  toggleMergeTurmas(sourceTurmaId: string, targetTurmaId?: string): Promise<void>;
  getAdminMothers(search?: string): Promise<Profile[]>;
  extendMotherAccess(userId: string, newAccessUntil: string): Promise<Profile>;
  toggleMotherBan(userId: string, ban: boolean): Promise<Profile>;
  warnMother(userId: string): Promise<Profile>;

  // Info
  isDemoMode: boolean;
}
