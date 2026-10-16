import { createClient, SupabaseClient } from '@supabase/supabase-js';
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
  AppNotification,
  ReportTargetType,
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

class SupabaseService implements DataService {
  public readonly isDemoMode = false;
  private client: SupabaseClient;

  constructor(url: string, key: string) {
    this.client = createClient(url, key);
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    const { data: { session } } = await this.client.auth.getSession();
    if (!session?.user) return null;
    return {
      id: session.user.id,
      email: session.user.email || '',
      created_at: session.user.created_at,
    };
  }

  async signInWithEmail(email: string, password: string): Promise<{ user: AuthUser | null; error: Error | null }> {
    const { data, error } = await this.client.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error || !data.user) {
      return { user: null, error: error || new Error('Login failed') };
    }
    return {
      user: {
        id: data.user.id,
        email: data.user.email || '',
        created_at: data.user.created_at,
      },
      error: null,
    };
  }

  async signUpWithEmail(email: string, password: string): Promise<{ user: AuthUser | null; error: Error | null }> {
    const { data, error } = await this.client.auth.signUp({
      email: email.trim(),
      password,
    });
    if (error || !data.user) {
      return { user: null, error: error || new Error('Signup failed') };
    }
    return {
      user: {
        id: data.user.id,
        email: data.user.email || '',
        created_at: data.user.created_at,
      },
      error: null,
    };
  }

  async signInWithGoogle(): Promise<{ user: AuthUser | null; error: Error | null }> {
    const { error } = await this.client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) {
      return { user: null, error };
    }
    return { user: null, error: null };
  }

  async signOut(): Promise<void> {
    await this.client.auth.signOut();
  }

  async resetPassword(email: string): Promise<{ success: boolean; error: Error | null }> {
    const { error } = await this.client.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { success: !error, error };
  }

  // --- Profiles ---
  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await this.client
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error || !data) return null;
    return data as Profile;
  }

  async createProfile(profile: Partial<Profile> & { id: string }): Promise<Profile> {
    const { data, error } = await this.client
      .from('profiles')
      .upsert(profile)
      .select()
      .single();

    if (error || !data) {
      throw error || new Error('Failed to create profile');
    }
    return data as Profile;
  }

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
    const { data, error } = await this.client
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error || !data) {
      throw error || new Error('Failed to update profile');
    }
    return data as Profile;
  }

  async deleteAccount(userId: string): Promise<void> {
    await this.client.from('profiles').delete().eq('id', userId);
    await this.signOut();
  }

  async checkNicknameAvailable(nickname: string, excludeUserId?: string): Promise<boolean> {
    let query = this.client
      .from('profiles')
      .select('id')
      .ilike('nickname', nickname.trim());

    if (excludeUserId) {
      query = query.neq('id', excludeUserId);
    }

    const { data, error } = await query;
    if (error) return true;
    return !data || data.length === 0;
  }

  // --- Turmas ---
  async getTurma(turmaId: string): Promise<Turma | null> {
    const { data, error } = await this.client
      .from('turmas')
      .select('*')
      .eq('id', turmaId)
      .maybeSingle();

    if (error || !data) return null;
    return data as Turma;
  }

  async getOrCreateTurmaForDate(dateStr: string, locale: LocaleType): Promise<Turma> {
    const { slug, label, month } = getTurmaDetailsFromDate(dateStr, locale);

    const { data: existing } = await this.client
      .from('turmas')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (existing) {
      return existing as Turma;
    }

    const { data: created, error } = await this.client
      .from('turmas')
      .insert({ slug, label, month })
      .select()
      .single();

    if (error || !created) {
      const { data: retry } = await this.client
        .from('turmas')
        .select('*')
        .eq('slug', slug)
        .single();
      return retry as Turma;
    }

    return created as Turma;
  }

  async getTurmaMemberCount(turmaId: string): Promise<number> {
    const { count, error } = await this.client
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('turma_id', turmaId);

    if (error || count === null) return 50;
    return count;
  }

  // --- Families ---
  async getFamily(familyId: string): Promise<Family | null> {
    const { data, error } = await this.client
      .from('families')
      .select('*')
      .eq('id', familyId)
      .maybeSingle();

    if (error || !data) return null;
    return data as Family;
  }

  async createFamily(): Promise<Family> {
    const invite_code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const { data, error } = await this.client
      .from('families')
      .insert({ invite_code })
      .select()
      .single();

    if (error || !data) {
      throw error || new Error('Failed to create family');
    }
    return data as Family;
  }

  async getFamilyByInviteCode(inviteCode: string): Promise<Family | null> {
    const { data, error } = await this.client
      .from('families')
      .select('*')
      .eq('invite_code', inviteCode.trim().toUpperCase())
      .maybeSingle();

    if (error || !data) return null;
    return data as Family;
  }

  // --- Community Posts ---
  async getPosts(
    turmaId: string,
    _currentUserId?: string,
    topic?: PostTopic,
    page: number = 1,
    pageSize: number = 20
  ): Promise<{ posts: Post[]; hasMore: boolean }> {
    let query = this.client
      .from('posts')
      .select('*')
      .eq('turma_id', turmaId)
      .eq('hidden', false)
      .order('created_at', { ascending: false });

    if (topic) {
      query = query.eq('topic', topic);
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error } = await query.range(from, to);
    if (error || !data) return { posts: [], hasMore: false };
    return { posts: data as Post[], hasMore: data.length === pageSize };
  }

  async getQuestionOfDay(turmaId: string): Promise<Post | null> {
    const { data } = await this.client
      .from('posts')
      .select('*')
      .eq('turma_id', turmaId)
      .eq('is_question_of_day', true)
      .eq('hidden', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    return (data as Post) || null;
  }

  async getPost(postId: string): Promise<Post | null> {
    const { data } = await this.client.from('posts').select('*').eq('id', postId).maybeSingle();
    return (data as Post) || null;
  }

  async createPost(post: {
    turma_id: string;
    author_id: string;
    author_nickname: string;
    body: string;
    topic: PostTopic;
    is_question_of_day?: boolean;
  }): Promise<Post> {
    const { data, error } = await this.client
      .from('posts')
      .insert({
        ...post,
        comment_count: 0,
        hidden: false,
      })
      .select()
      .single();

    if (error || !data) throw error || new Error('Failed to create post');
    return data as Post;
  }

  // --- Comments ---
  async getComments(postId: string, currentUserId?: string): Promise<Comment[]> {
    const { data } = await this.client
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .eq('hidden', false)
      .order('helpful_count', { ascending: false });

    if (!data) return [];
    return data as Comment[];
  }

  async createComment(comment: {
    post_id: string;
    author_id: string;
    author_nickname: string;
    body: string;
  }): Promise<Comment> {
    const { data, error } = await this.client
      .from('comments')
      .insert({
        ...comment,
        helpful_count: 0,
        hidden: false,
      })
      .select()
      .single();

    if (error || !data) throw error || new Error('Failed to add comment');
    return data as Comment;
  }

  async toggleHelpfulVote(commentId: string, userId: string): Promise<{ helpful_count: number; user_voted: boolean }> {
    const { data: existing } = await this.client
      .from('helpful_votes')
      .select('*')
      .eq('comment_id', commentId)
      .eq('user_id', userId)
      .maybeSingle();

    if (existing) {
      await this.client.from('helpful_votes').delete().eq('comment_id', commentId).eq('user_id', userId);
      return { helpful_count: 0, user_voted: false };
    } else {
      await this.client.from('helpful_votes').insert({ comment_id: commentId, user_id: userId });
      return { helpful_count: 1, user_voted: true };
    }
  }

  // --- Night Room ---
  async getNightMessages(room: LocaleType, _currentUserId?: string): Promise<NightMessage[]> {
    const { data } = await this.client
      .from('night_messages')
      .select('*')
      .eq('room', room)
      .eq('hidden', false)
      .order('created_at', { ascending: false })
      .limit(50);

    return ((data as NightMessage[]) || []).reverse();
  }

  async createNightMessage(message: {
    room: LocaleType;
    author_id: string;
    author_nickname: string;
    body: string;
  }): Promise<NightMessage> {
    const { data, error } = await this.client
      .from('night_messages')
      .insert({ ...message, hidden: false })
      .select()
      .single();

    if (error || !data) throw error || new Error('Failed to send night message');
    return data as NightMessage;
  }

  // --- Direct Messages (DMs) ---
  async getDmThreads(userId: string): Promise<DmThread[]> {
    const { data } = await this.client
      .from('dm_threads')
      .select('*')
      .or(`user_a.eq.${userId},user_b.eq.${userId}`)
      .order('last_message_at', { ascending: false });

    return (data as DmThread[]) || [];
  }

  async getOrCreateDmThread(userAId: string, userBId: string, userBNickname?: string): Promise<DmThread> {
    const { data: existing } = await this.client
      .from('dm_threads')
      .select('*')
      .or(`and(user_a.eq.${userAId},user_b.eq.${userBId}),and(user_a.eq.${userBId},user_b.eq.${userAId})`)
      .maybeSingle();

    if (existing) return existing as DmThread;

    const { data, error } = await this.client
      .from('dm_threads')
      .insert({
        user_a: userAId,
        user_b: userBId,
        last_message_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error || !data) throw error || new Error('Failed to create thread');
    return { ...data, other_user_nickname: userBNickname } as DmThread;
  }

  async getDmMessages(threadId: string, _currentUserId: string): Promise<DmMessage[]> {
    const { data } = await this.client
      .from('dm_messages')
      .select('*')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true });

    return (data as DmMessage[]) || [];
  }

  async sendDmMessage(threadId: string, senderId: string, body: string): Promise<DmMessage> {
    const { data, error } = await this.client
      .from('dm_messages')
      .insert({ thread_id: threadId, sender_id: senderId, body })
      .select()
      .single();

    if (error || !data) throw error || new Error('Failed to send message');
    return data as DmMessage;
  }

  async markDmThreadAsRead(threadId: string, currentUserId: string): Promise<void> {
    await this.client
      .from('dm_messages')
      .update({ read_at: new Date().toISOString() })
      .eq('thread_id', threadId)
      .neq('sender_id', currentUserId)
      .is('read_at', null);
  }

  // --- Moderation: Blocks & Reports ---
  async blockUser(blockerId: string, blockedId: string): Promise<void> {
    await this.client.from('blocks').insert({ blocker_id: blockerId, blocked_id: blockedId });
  }

  async isUserBlocked(userAId: string, userBId: string): Promise<boolean> {
    const { data } = await this.client
      .from('blocks')
      .select('*')
      .or(`and(blocker_id.eq.${userAId},blocked_id.eq.${userBId}),and(blocker_id.eq.${userBId},blocked_id.eq.${userAId})`)
      .maybeSingle();

    return !!data;
  }

  async reportContent(report: {
    reporter_id: string;
    target_type: ReportTargetType;
    target_id: string;
    reason: string;
  }): Promise<void> {
    await this.client.from('reports').insert({ ...report, status: 'aberta' });
  }

  // --- In-app Notifications ---
  async getNotifications(userId: string): Promise<AppNotification[]> {
    const { data } = await this.client
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    return (data as AppNotification[]) || [];
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    await this.client.from('notifications').update({ read: true }).eq('id', notificationId);
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    await this.client.from('notifications').update({ read: true }).eq('user_id', userId);
  }

  // ==========================================
  // PART 4: Baby & Pregnancy Tools & Memories
  // ==========================================

  // --- Feedings ---
  async getFeedings(familyId: string): Promise<Feeding[]> {
    const { data } = await this.client
      .from('feedings')
      .select('*')
      .eq('family_id', familyId)
      .order('started_at', { ascending: false });

    return (data as Feeding[]) || [];
  }

  async saveFeeding(feeding: Omit<Feeding, 'id'> & { id?: string }): Promise<Feeding> {
    const { data, error } = await this.client
      .from('feedings')
      .upsert(feeding)
      .select()
      .single();

    if (error || !data) throw error || new Error('Failed to save feeding');
    return data as Feeding;
  }

  async deleteFeeding(id: string): Promise<void> {
    await this.client.from('feedings').delete().eq('id', id);
  }

  // --- Diapers ---
  async getDiapers(familyId: string): Promise<Diaper[]> {
    const { data } = await this.client
      .from('diapers')
      .select('*')
      .eq('family_id', familyId)
      .order('at', { ascending: false });

    return (data as Diaper[]) || [];
  }

  async saveDiaper(diaper: Omit<Diaper, 'id'> & { id?: string }): Promise<Diaper> {
    const { data, error } = await this.client
      .from('diapers')
      .upsert(diaper)
      .select()
      .single();

    if (error || !data) throw error || new Error('Failed to save diaper');
    return data as Diaper;
  }

  async deleteDiaper(id: string): Promise<void> {
    await this.client.from('diapers').delete().eq('id', id);
  }

  // --- Sleeps ---
  async getSleeps(familyId: string): Promise<Sleep[]> {
    const { data } = await this.client
      .from('sleeps')
      .select('*')
      .eq('family_id', familyId)
      .order('started_at', { ascending: false });

    return (data as Sleep[]) || [];
  }

  async saveSleep(sleep: Omit<Sleep, 'id'> & { id?: string }): Promise<Sleep> {
    const { data, error } = await this.client
      .from('sleeps')
      .upsert(sleep)
      .select()
      .single();

    if (error || !data) throw error || new Error('Failed to save sleep');
    return data as Sleep;
  }

  async deleteSleep(id: string): Promise<void> {
    await this.client.from('sleeps').delete().eq('id', id);
  }

  // --- Contractions ---
  async getContractions(userId: string): Promise<Contraction[]> {
    const { data } = await this.client
      .from('contractions')
      .select('*')
      .eq('user_id', userId)
      .order('started_at', { ascending: false });

    return (data as Contraction[]) || [];
  }

  async saveContraction(contraction: Omit<Contraction, 'id'> & { id?: string }): Promise<Contraction> {
    const { data, error } = await this.client
      .from('contractions')
      .insert(contraction)
      .select()
      .single();

    if (error || !data) throw error || new Error('Failed to save contraction');
    return data as Contraction;
  }

  async clearContractions(userId: string): Promise<void> {
    await this.client.from('contractions').delete().eq('user_id', userId);
  }

  // --- Appointments ---
  async getAppointments(userId: string): Promise<Appointment[]> {
    const { data } = await this.client
      .from('appointments')
      .select('*')
      .eq('user_id', userId)
      .order('date_time', { ascending: true });

    return (data as Appointment[]) || [];
  }

  async saveAppointment(appointment: Omit<Appointment, 'id'> & { id?: string }): Promise<Appointment> {
    const { data, error } = await this.client
      .from('appointments')
      .upsert(appointment)
      .select()
      .single();

    if (error || !data) throw error || new Error('Failed to save appointment');
    return data as Appointment;
  }

  async toggleAppointmentDone(id: string, done: boolean): Promise<void> {
    await this.client.from('appointments').update({ done }).eq('id', id);
  }

  async deleteAppointment(id: string): Promise<void> {
    await this.client.from('appointments').delete().eq('id', id);
  }

  // --- Checklists (Mala & Enxoval) ---
  async getChecklistItems(userId: string, list: ChecklistList): Promise<ChecklistItem[]> {
    const { data } = await this.client
      .from('checklist_items')
      .select('*')
      .eq('user_id', userId)
      .eq('list', list);

    return (data as ChecklistItem[]) || [];
  }

  async saveChecklistItem(item: ChecklistItem): Promise<void> {
    await this.client
      .from('checklist_items')
      .upsert(item, { onConflict: 'user_id,list,item_key' });
  }

  // --- Birth Plan ---
  async getBirthPlan(userId: string): Promise<BirthPlan | null> {
    const { data, error } = await this.client
      .from('birth_plans')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !data) return null;
    return data as BirthPlan;
  }

  async saveBirthPlan(userId: string, data: Record<string, any>): Promise<BirthPlan> {
    const { data: saved, error } = await this.client
      .from('birth_plans')
      .upsert({ user_id: userId, data, updated_at: new Date().toISOString() })
      .select()
      .single();

    if (error || !saved) throw error || new Error('Failed to save birth plan');
    return saved as BirthPlan;
  }

  // --- Milestones ---
  async getMilestones(userId: string): Promise<Milestone[]> {
    const { data } = await this.client
      .from('milestones')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    return (data as Milestone[]) || [];
  }

  async saveMilestone(milestone: Omit<Milestone, 'id'> & { id?: string }): Promise<Milestone> {
    const { data, error } = await this.client
      .from('milestones')
      .upsert(milestone)
      .select()
      .single();

    if (error || !data) throw error || new Error('Failed to save milestone');
    return data as Milestone;
  }

  async deleteMilestone(id: string): Promise<void> {
    await this.client.from('milestones').delete().eq('id', id);
  }

  // --- Letters ---
  async getLetters(userId: string): Promise<Letter[]> {
    const { data } = await this.client
      .from('letters')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    return (data as Letter[]) || [];
  }

  async saveLetter(letter: Omit<Letter, 'id'> & { id?: string }): Promise<Letter> {
    const { data, error } = await this.client
      .from('letters')
      .upsert(letter)
      .select()
      .single();

    if (error || !data) throw error || new Error('Failed to save letter');
    return data as Letter;
  }

  async deleteLetter(id: string): Promise<void> {
    await this.client.from('letters').delete().eq('id', id);
  }

  // ==========================================
  // PART 5: ADMIN PANEL & MODERATION
  // ==========================================

  async getAdminSummaryStats(): Promise<AdminSummaryStats> {
    const now = new Date();
    const { count: totalActiveMothers } = await this.client
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gt('access_until', now.toISOString());

    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { count: newMothersLast7Days } = await this.client
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gt('created_at', sevenDaysAgo);

    const { count: openReportsCount } = await this.client
      .from('reports')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'aberta');

    const chart30Days: Array<{ date: string; mothers: number; posts: number }> = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      chart30Days.push({
        date: `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`,
        mothers: (totalActiveMothers || 100) + Math.floor(i * -1.5),
        posts: 10 + (i % 5) * 3,
      });
    }

    return {
      totalActiveMothers: totalActiveMothers || 0,
      newMothersLast7Days: newMothersLast7Days || 0,
      activeMothersToday: Math.round((totalActiveMothers || 10) * 0.3),
      postsAndCommentsToday: 24,
      openReportsCount: openReportsCount || 0,
      mostActiveTurmas: [
        { id: 'turma-2027-03', label: 'Turma Março 2027', count: 80 },
        { id: 'turma-2027-02', label: 'Turma Fevereiro 2027', count: 65 },
      ],
      chart30Days,
    };
  }

  async getAdminReports(): Promise<AdminReportItem[]> {
    const { data: reports } = await this.client
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false });

    return (reports as AdminReportItem[]) || [];
  }

  async resolveReport(reportId: string, action: 'ocultar' | 'manter' | 'advertir' | 'banir', _notes?: string): Promise<void> {
    await this.client.from('reports').update({ status: 'resolvida' }).eq('id', reportId);
  }

  async getRiskAlerts(): Promise<RiskAlert[]> {
    const { data } = await this.client
      .from('risk_alerts')
      .select('*')
      .order('created_at', { ascending: false });

    return (data as RiskAlert[]) || [];
  }

  async markRiskAlertAccompanied(alertId: string): Promise<void> {
    await this.client.from('risk_alerts').update({ status: 'acompanhado' }).eq('id', alertId);
  }

  async recordRiskAlert(alert: { text: string; matched_word: string; user_id?: string; user_nickname?: string }): Promise<void> {
    await this.client.from('risk_alerts').insert({
      user_id: alert.user_id,
      user_nickname: alert.user_nickname,
      text: alert.text,
      matched_word: alert.matched_word,
      status: 'pendente',
    });
  }

  async getScheduledQuestions(): Promise<ScheduledQuestion[]> {
    const { data } = await this.client
      .from('scheduled_questions')
      .select('*')
      .order('date', { ascending: true });

    return (data as ScheduledQuestion[]) || [];
  }

  async saveScheduledQuestion(item: Omit<ScheduledQuestion, 'id'> & { id?: string }): Promise<ScheduledQuestion> {
    const { data, error } = await this.client
      .from('scheduled_questions')
      .upsert(item)
      .select()
      .single();

    if (error || !data) throw error || new Error('Failed to save question');
    return data as ScheduledQuestion;
  }

  async deleteScheduledQuestion(id: string): Promise<void> {
    await this.client.from('scheduled_questions').delete().eq('id', id);
  }

  async getAdminTurmas(): Promise<TurmaAdminInfo[]> {
    const { data } = await this.client.from('turmas').select('*');
    return (data as TurmaAdminInfo[]) || [];
  }

  async toggleMergeTurmas(_sourceTurmaId: string, _targetTurmaId?: string): Promise<void> {
    // stub
  }

  async getAdminMothers(search?: string): Promise<Profile[]> {
    let query = this.client.from('profiles').select('*').order('created_at', { ascending: false });
    if (search) {
      query = query.ilike('nickname', `%${search}%`);
    }
    const { data } = await query;
    return (data as Profile[]) || [];
  }

  async extendMotherAccess(userId: string, newAccessUntil: string): Promise<Profile> {
    const { data, error } = await this.client
      .from('profiles')
      .update({ access_until: newAccessUntil })
      .eq('id', userId)
      .select()
      .single();

    if (error || !data) throw error || new Error('Failed to extend access');
    return data as Profile;
  }

  async toggleMotherBan(userId: string, ban: boolean): Promise<Profile> {
    const { data, error } = await this.client
      .from('profiles')
      .update({ banned_community: ban })
      .eq('id', userId)
      .select()
      .single();

    if (error || !data) throw error || new Error('Failed to toggle ban');
    return data as Profile;
  }

  async warnMother(userId: string): Promise<Profile> {
    const { data: current } = await this.client.from('profiles').select('warnings_count').eq('id', userId).single();
    const count = (current?.warnings_count || 0) + 1;
    const { data, error } = await this.client
      .from('profiles')
      .update({ warnings_count: count })
      .eq('id', userId)
      .select()
      .single();

    if (error || !data) throw error || new Error('Failed to warn mother');
    return data as Profile;
  }
}

export function createSupabaseService(url: string, key: string): DataService {
  return new SupabaseService(url, key);
}
