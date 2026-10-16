import React, { useState, useEffect } from 'react';
import { Calendar, Plus, CheckCircle, Clock, Trash2, Tag, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { dataService } from '../data/dataService';
import { Appointment, AppointmentKind } from '../data/types';
import { useAuth } from '../hooks/useAuth';
import { useI18n } from '../i18n';
import { formatFriendlyDate } from '../lib/dateUtils';

const TRIMESTER_TEMPLATES = [
  {
    trimester: '1º Trimestre',
    items: [
      { title: 'Consulta Pré-Natal Inicial', kind: 'consulta' as AppointmentKind, notes: 'Histórico de saúde, orientações nutricionais e pedido de exames.' },
      { title: 'Ultrassom 11 a 14 semanas (Translucência Nucal)', kind: 'ultrassom' as AppointmentKind, notes: 'Medição da translucência nucal e osso nasal.' },
      { title: 'Exames de Sangue e Urina 1º Trimestre', kind: 'exame' as AppointmentKind, notes: 'Hemograma, sorologias, tipagem sanguínea e glicemia.' },
    ],
  },
  {
    trimester: '2º Trimestre',
    items: [
      { title: 'Ultrassom Morfológico (20 a 24 semanas)', kind: 'ultrassom' as AppointmentKind, notes: 'Análise minuciosa de todos os órgãos e medidas do bebê.' },
      { title: 'Vacina dTpa (a partir de 20 semanas)', kind: 'vacina' as AppointmentKind, notes: 'Imuniza o bebê contra a coqueluche, tétano e difteria.' },
      { title: 'Curva Glicêmica - TOTG (24 a 28 semanas)', kind: 'exame' as AppointmentKind, notes: 'Rastreio do diabetes gestacional. Jejum de 8 a 12 horas.' },
    ],
  },
  {
    trimester: '3º Trimestre',
    items: [
      { title: 'Cultura para Estreptococo B (35 a 37 semanas)', kind: 'exame' as AppointmentKind, notes: 'Swab vaginal e retal de rotina pré-parto.' },
      { title: 'Ultrassom com Doppler (32 a 36 semanas)', kind: 'ultrassom' as AppointmentKind, notes: 'Avaliação do crescimento, líquido amniótico e placenta.' },
      { title: 'Consulta Semanal do Final da Gestação', kind: 'consulta' as AppointmentKind, notes: 'Acompanhamento da pressão, vitalidade fetal e colo do útero.' },
    ],
  },
];

export const AppointmentsSection: React.FC = () => {
  const { user } = useAuth();
  const { locale } = useI18n();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filter, setFilter] = useState<'upcoming' | 'past'>('upcoming');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [kind, setKind] = useState<AppointmentKind>('consulta');
  const [dateTime, setDateTime] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const loadAppointments = async () => {
    if (!user) return;
    const items = await dataService.getAppointments(user.id);
    setAppointments(items);
  };

  useEffect(() => {
    loadAppointments();
  }, [user]);

  const handleToggleDone = async (apt: Appointment) => {
    const newDone = !apt.done;
    await dataService.toggleAppointmentDone(apt.id, newDone);
    setAppointments((prev) =>
      prev.map((a) => (a.id === apt.id ? { ...a, done: newDone } : a))
    );
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Excluir este agendamento?')) {
      await dataService.deleteAppointment(id);
      setAppointments((prev) => prev.filter((a) => a.id !== id));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title.trim() || !dateTime) return;

    try {
      setSaving(true);
      await dataService.saveAppointment({
        user_id: user.id,
        title: title.trim(),
        kind,
        date_time: new Date(dateTime).toISOString(),
        notes: notes.trim() || undefined,
        done: false,
      });

      setTitle('');
      setDateTime('');
      setNotes('');
      setIsModalOpen(false);
      await loadAppointments();
    } finally {
      setSaving(false);
    }
  };

  const applyTemplate = (tmpl: { title: string; kind: AppointmentKind; notes: string }) => {
    setTitle(tmpl.title);
    setKind(tmpl.kind);
    setNotes(tmpl.notes);
    // Suggest 7 days from now as default
    const d = new Date(Date.now() + 7 * 86400 * 1000);
    d.setHours(9, 0, 0, 0);
    setDateTime(d.toISOString().slice(0, 16));
    setShowTemplates(false);
    setIsModalOpen(true);
  };

  const now = new Date().toISOString();
  const upcomingList = appointments.filter((a) => !a.done && a.date_time >= now);
  const pastList = appointments.filter((a) => a.done || a.date_time < now);
  const activeList = filter === 'upcoming' ? upcomingList : pastList;

  const kindBadgeColors: Record<AppointmentKind, string> = {
    consulta: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300',
    exame: 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300',
    vacina: 'bg-purple-100 text-purple-800 dark:bg-purple-950/50 dark:text-purple-300',
    ultrassom: 'bg-[#F3D6CB] text-[#8C4A3C] dark:bg-[#3E2925] dark:text-[#F3D6CB]',
    outro: 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300',
  };

  return (
    <div className="space-y-4">
      {/* Header with Quick Add & Templates */}
      <div className="flex items-center justify-between">
        <div className="flex p-1 rounded-2xl bg-[#FBF3EF] dark:bg-[#1E1817] border border-[#F3D6CB]/60 dark:border-[#382C29]">
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              filter === 'upcoming'
                ? 'bg-[#8C4A3C] text-white shadow-xs'
                : 'text-[#3D3230]/70 dark:text-[#A79895]'
            }`}
          >
            Próximos ({upcomingList.length})
          </button>
          <button
            onClick={() => setFilter('past')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              filter === 'past'
                ? 'bg-[#8C4A3C] text-white shadow-xs'
                : 'text-[#3D3230]/70 dark:text-[#A79895]'
            }`}
          >
            Passados / Feitos ({pastList.length})
          </button>
        </div>

        <button
          onClick={() => {
            setTitle('');
            setNotes('');
            const d = new Date();
            d.setHours(10, 0, 0, 0);
            setDateTime(d.toISOString().slice(0, 16));
            setIsModalOpen(true);
          }}
          className="px-3 py-2 rounded-2xl bg-[#8C4A3C] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm hover:brightness-105 active:scale-95 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Agendar</span>
        </button>
      </div>

      {/* Modelos Prontos por Trimestre Toggle */}
      <div className="rounded-2xl border border-[#F3D6CB]/70 dark:border-[#382C29] bg-white dark:bg-[#251E1C] overflow-hidden">
        <button
          onClick={() => setShowTemplates(!showTemplates)}
          className="w-full px-4 py-3 flex items-center justify-between text-xs font-bold text-[#8C4A3C] dark:text-[#F3D6CB] hover:bg-[#FBF3EF]/50 dark:hover:bg-[#1E1817]"
        >
          <span className="flex items-center gap-2">
            <Tag className="w-3.5 h-3.5" />
            Modelos de Exames & Consultas por Trimestre
          </span>
          {showTemplates ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showTemplates && (
          <div className="p-3 bg-[#FBF3EF]/40 dark:bg-[#1E1817] border-t border-[#F3D6CB]/60 dark:border-[#382C29] space-y-3">
            {TRIMESTER_TEMPLATES.map((group) => (
              <div key={group.trimester}>
                <span className="text-[11px] font-bold text-[#3D3230]/70 dark:text-[#A79895] uppercase tracking-wider block mb-1.5">
                  {group.trimester}
                </span>
                <div className="space-y-1.5">
                  {group.items.map((tmpl) => (
                    <div
                      key={tmpl.title}
                      className="p-2.5 rounded-xl bg-white dark:bg-[#251E1C] border border-[#F3D6CB]/60 dark:border-[#382C29] flex items-center justify-between gap-2"
                    >
                      <div>
                        <p className="text-xs font-semibold text-[#3D3230] dark:text-[#F8ECE8]">
                          {tmpl.title}
                        </p>
                        <p className="text-[10px] text-[#3D3230]/70 dark:text-[#A79895]">
                          {tmpl.notes}
                        </p>
                      </div>
                      <button
                        onClick={() => applyTemplate(tmpl)}
                        className="px-2.5 py-1 rounded-lg bg-[#8C4A3C]/10 text-[#8C4A3C] dark:bg-[#8C4A3C]/30 dark:text-[#F3D6CB] text-[11px] font-bold shrink-0 hover:bg-[#8C4A3C] hover:text-white transition"
                      >
                        Usar
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Appointments List */}
      <div className="space-y-2.5">
        {activeList.length === 0 ? (
          <div className="p-6 rounded-2xl bg-white dark:bg-[#251E1C] border border-[#F3D6CB]/70 dark:border-[#382C29] text-center">
            <Calendar className="w-8 h-8 mx-auto text-[#8C4A3C]/40 mb-2" />
            <p className="text-xs text-[#3D3230]/60 dark:text-[#A79895]">
              Nenhum agendamento nesta lista. Use o botão acima para marcar ou adicionar um modelo.
            </p>
          </div>
        ) : (
          activeList.map((apt) => {
            const dateObj = new Date(apt.date_time);
            const dateStr = formatFriendlyDate(apt.date_time.slice(0, 10), locale);
            const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            return (
              <div
                key={apt.id}
                className={`p-4 rounded-2xl border transition-all ${
                  apt.done
                    ? 'bg-[#FBF3EF]/40 dark:bg-[#1E1817]/60 border-[#F3D6CB]/40 dark:border-[#382C29] opacity-75'
                    : 'bg-white dark:bg-[#251E1C] border-[#F3D6CB]/80 dark:border-[#382C29] shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => handleToggleDone(apt)}
                      className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition ${
                        apt.done
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-[#8C4A3C]/60 hover:border-[#8C4A3C]'
                      }`}
                    >
                      {apt.done && <CheckCircle className="w-4 h-4 text-white" />}
                    </button>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            kindBadgeColors[apt.kind]
                          }`}
                        >
                          {apt.kind}
                        </span>
                        <span className="text-[11px] font-medium text-[#3D3230]/60 dark:text-[#A79895] flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {dateStr} às {timeStr}
                        </span>
                      </div>
                      <h4
                        className={`text-sm font-bold text-[#3D3230] dark:text-[#F8ECE8] ${
                          apt.done ? 'line-through opacity-70' : ''
                        }`}
                      >
                        {apt.title}
                      </h4>
                      {apt.notes && (
                        <p className="text-xs text-[#3D3230]/75 dark:text-[#D1C2BE] mt-1 leading-relaxed">
                          {apt.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(apt.id)}
                    className="p-1.5 rounded-lg text-[#3D3230]/30 hover:text-rose-600 dark:hover:text-rose-400 transition"
                    title="Excluir"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* New Appointment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-[#251E1C] rounded-3xl p-6 shadow-2xl border border-[#F3D6CB] dark:border-[#382C29]">
            <h3 className="font-serif font-bold text-xl text-[#3D3230] dark:text-[#F8ECE8] mb-4">
              Novo Agendamento
            </h3>

            <form onSubmit={handleSave} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold uppercase text-[#3D3230]/70 dark:text-[#A79895] mb-1">
                  Título *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Ultrassom Morfológico, Consulta Obstétrica..."
                  className="w-full px-4 py-2.5 rounded-xl border border-[#F3D6CB] dark:border-[#382C29] bg-[#FBF3EF]/40 dark:bg-[#1E1817] text-xs text-[#3D3230] dark:text-[#F8ECE8] focus:ring-2 focus:ring-[#8C4A3C]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-[#3D3230]/70 dark:text-[#A79895] mb-1">
                    Tipo
                  </label>
                  <select
                    value={kind}
                    onChange={(e) => setKind(e.target.value as AppointmentKind)}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#F3D6CB] dark:border-[#382C29] bg-[#FBF3EF]/40 dark:bg-[#1E1817] text-xs text-[#3D3230] dark:text-[#F8ECE8]"
                  >
                    <option value="consulta">Consulta</option>
                    <option value="ultrassom">Ultrassom</option>
                    <option value="exame">Exame</option>
                    <option value="vacina">Vacina</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[#3D3230]/70 dark:text-[#A79895] mb-1">
                    Data e Hora *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={dateTime}
                    onChange={(e) => setDateTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#F3D6CB] dark:border-[#382C29] bg-[#FBF3EF]/40 dark:bg-[#1E1817] text-xs text-[#3D3230] dark:text-[#F8ECE8]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#3D3230]/70 dark:text-[#A79895] mb-1">
                  Anotações / Recomendações
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Levar cartão do pré-natal, jejum de 8h..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-[#F3D6CB] dark:border-[#382C29] bg-[#FBF3EF]/40 dark:bg-[#1E1817] text-xs text-[#3D3230] dark:text-[#F8ECE8]"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#F3D6CB] dark:border-[#382C29] text-xs font-bold text-[#3D3230]/70 dark:text-[#D1C2BE]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-[#8C4A3C] text-white text-xs font-bold shadow-md hover:brightness-105"
                >
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
