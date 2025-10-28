'use client';

import { useEffect, useState, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';
import api from '@/lib/api';
import { getSocket } from '@/lib/websocket';
import { toCalendarEvents } from '@/types/utils/calendarEvents';
import AgendamentoModal from './agendaModal';
import { FiTrash2, FiCalendar, FiUsers, FiCheckCircle, FiClock, FiXCircle, FiAlertCircle } from 'react-icons/fi';
import moment from 'moment';
import 'moment/locale/pt-br';

moment.locale('pt-br');

// Componente Toast
const Toast = ({ message, type, onClose }: { message: string; type: 'success' | 'error' | 'warning' | 'info'; onClose: () => void }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 4000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const icons = {
        success: <FiCheckCircle className="w-5 h-5" />,
        error: <FiXCircle className="w-5 h-5" />,
        warning: <FiAlertCircle className="w-5 h-5" />,
        info: <FiClock className="w-5 h-5" />,
    };

    const colors = {
        success: 'bg-green-500 border-green-600',
        error: 'bg-red-500 border-red-600',
        warning: 'bg-yellow-500 border-yellow-600',
        info: 'bg-blue-500 border-blue-600',
    };

    return (
        <div className={`flex items-center space-x-3 p-4 rounded-xl text-white shadow-2xl border-l-4 ${colors[type]} animate-in slide-in-from-right-full duration-300`}>
            {icons[type]}
            <span className="font-medium flex-1">{message}</span>
            <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-lg transition-colors">
                <FiXCircle className="w-4 h-4" />
            </button>
        </div>
    );
};

export default function AgendamentosList({ initialAgendamentos, initialClientes, initialFuncionarios }: any) {
    const [agendamentos, setAgendamentos] = useState<any[]>(initialAgendamentos || []);
    const [cliente, setClientes] = useState<any[]>(initialClientes || []);
    const [funcionarios, setFuncionarios] = useState<any[]>(initialFuncionarios || []);
    const [modalData, setModalData] = useState<any | null>(null);
    const [loading, setLoading] = useState(false);
    const [dragging, setDragging] = useState(false);
    const [toasts, setToasts] = useState<{ id: number; message: string; type: 'success' | 'error' | 'warning' | 'info' }[]>([]);
    const trashRef = useRef<HTMLDivElement | null>(null);
    const toastIdRef = useRef(0);
    const calendarRef = useRef<any>(null);

    const socket = getSocket();

    const addToast = (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
        const id = toastIdRef.current++;
        setToasts(prev => [...prev, { id, message, type }]);
    };

    const removeToast = (id: number) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    const getToken = () => {
        if (typeof window === 'undefined') return '';
        const token = document.cookie
            .split('; ')
            .find((row) => row.startsWith('token='))
            ?.split('=')[1];
        return token || '';
    };

    const fetchAgendamentos = async () => {
        try {
            const { data } = await api.get('/agendamentos', {
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            setAgendamentos(data);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        socket.on('agendamento:created', fetchAgendamentos);
        socket.on('agendamento:updated', fetchAgendamentos);
        socket.on('agendamento:deleted', fetchAgendamentos);

        return () => {
            socket.off('agendamento:created');
            socket.off('agendamento:updated');
            socket.off('agendamento:deleted');
        };
    }, []);

    const handleDateSelect = (selectInfo: any) => {
        const start = new Date(selectInfo.startStr);
        const now = new Date();

        if (start < now) {
            addToast('Só é permitido agendar a partir de agora.', 'warning');
            return;
        }

        setModalData({
            start: selectInfo.startStr,
            end: selectInfo.endStr,
        });
    };

    // CORREÇÃO: Função melhorada para arrastar eventos
    const handleEventDrop = async (changeInfo: any) => {
        const id = Number(changeInfo.event.id);
        const newDate = changeInfo.event.start;
        const now = new Date();

        // Verifica se a nova data é no passado
        if (newDate < now) {
            addToast('Não é possível mover agendamentos para datas/horários passados.', 'warning');
            changeInfo.revert();
            return;
        }

        try {
            await api.patch(
                `/agendamentos/${id}`,
                {
                    data_agendamento: newDate.toISOString()
                },
                { headers: { Authorization: `Bearer ${getToken()}` } }
            );

            // Atualiza a lista localmente para refletir a mudança imediatamente
            setAgendamentos(prev =>
                prev.map(ag =>
                    ag.id === id
                        ? { ...ag, data_agendamento: newDate.toISOString() }
                        : ag
                )
            );

            socket.emit('agendamento:updated', id);
            addToast('Agendamento movido com sucesso!', 'success');
        } catch (err: any) {
            console.error('Erro ao mover agendamento:', err);
            addToast(
                err.response?.data?.message || 'Erro ao mover agendamento.',
                'error'
            );
            changeInfo.revert();
        }
    };

    // CORREÇÃO: Função para quando o arraste é cancelado
    const handleEventDragStop = (info: any) => {
        setDragging(false);
        const trashEl = trashRef.current;
        if (!trashEl) return;

        const trashRect = trashEl.getBoundingClientRect();
        const x = info.jsEvent.clientX;
        const y = info.jsEvent.clientY;

        if (
            x >= trashRect.left &&
            x <= trashRect.right &&
            y >= trashRect.top &&
            y <= trashRect.bottom
        ) {
            const id = info.event.id;
            const eventTitle = info.event.title;

            if (window.confirm(`Deseja realmente excluir o agendamento "${eventTitle}"?`)) {
                handleDeleteAgendamento(id);
            } else {
                // Se o usuário cancelar a exclusão, reverte o arraste
                info.revert();
            }
        }
    };

    // Função separada para deletar agendamento
    const handleDeleteAgendamento = async (id: number) => {
        try {
            await api.delete(`/agendamentos/${id}`, {
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            socket.emit('agendamento:deleted', id);

            // Atualiza a lista localmente
            setAgendamentos(prev => prev.filter(ag => ag.id !== id));

            addToast('Agendamento excluído com sucesso!', 'success');
        } catch (error) {
            addToast('Erro ao excluir agendamento.', 'error');
        }
    };

    // CORREÇÃO: Configuração do drag mirror para seguir o mouse
    const handleEventDragStart = (info: any) => {
        setDragging(true);

        // CORREÇÃO: Aplica configurações para o drag mirror seguir o mouse
        const mirrorEl = info.jsEvent.target.closest('.fc-event-dragging') || info.el;
        if (mirrorEl) {
            mirrorEl.style.opacity = '0.8';
            mirrorEl.style.cursor = 'grabbing';
        }
    };

    // CORREÇÃO: Buscar o agendamento completo quando clicar no evento
    const handleEventClick = (info: any) => {
        const agendamentoId = parseInt(info.event.id);
        const agendamentoCompleto = agendamentos.find(a => a.id === agendamentoId);

        if (agendamentoCompleto) {
            setModalData(agendamentoCompleto);
        }
    };

    // CORREÇÃO: Função para formatar data e hora para exibição
    const formatEventTime = (startStr: string, endStr: string) => {
        try {
            const start = new Date(startStr);
            const end = new Date(endStr);

            // Verifica se as datas são válidas
            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                return 'Horário indisponível';
            }

            const formatTime = (date: Date) => {
                return date.toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                });
            };

            return `${formatTime(start)} - ${formatTime(end)}`;
        } catch (error) {
            console.error('Erro ao formatar horário:', error);
            return 'Horário indisponível';
        }
    };

    // CORREÇÃO: Função para formatar data completa
    const formatEventDate = (dateStr: string) => {
        try {
            const date = new Date(dateStr);

            // Verifica se a data é válida
            if (isNaN(date.getTime())) {
                return 'Data indisponível';
            }

            return date.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch (error) {
            console.error('Erro ao formatar data:', error);
            return 'Data indisponível';
        }
    };

    // Estatísticas
    const stats = {
        total: agendamentos.length,
        pendentes: agendamentos.filter(a => a.status === 'pendente').length,
        confirmados: agendamentos.filter(a => a.status === 'confirmado').length,
        concluidos: agendamentos.filter(a => a.status === 'concluido').length,
        cancelados: agendamentos.filter(a => a.status === 'cancelado').length,
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-4 sm:p-6 relative">
            {/* Toast Container */}
            <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm">
                {toasts.map((toast) => (
                    <Toast
                        key={toast.id}
                        message={toast.message}
                        type={toast.type}
                        onClose={() => removeToast(toast.id)}
                    />
                ))}
            </div>

            {/* Header Premium */}
            <div className="mb-6 sm:mb-8">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex items-center space-x-3 sm:space-x-4">
                        <div className="bg-white p-2 sm:p-3 rounded-2xl shadow-xl border border-blue-100">
                            <div className="bg-gradient-to-br from-blue-600 to-purple-700 p-2 sm:p-3 rounded-xl shadow-lg">
                                <FiCalendar className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Agendamentos
                            </h1>
                            <p className="text-gray-600 mt-1 text-sm sm:text-base flex items-center space-x-2">
                                <span>Gerencie seus compromissos em tempo real</span>
                                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                            </p>
                        </div>
                    </div>

                    {/* Cards de Estatísticas */}
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-3">
                        {[
                            { label: 'Total', value: stats.total, color: 'blue', icon: FiCalendar },
                            { label: 'Pendentes', value: stats.pendentes, color: 'yellow', icon: FiClock },
                            { label: 'Confirmados', value: stats.confirmados, color: 'green', icon: FiCheckCircle },
                            { label: 'Concluídos', value: stats.concluidos, color: 'purple', icon: FiUsers },
                            { label: 'Cancelados', value: stats.cancelados, color: 'red', icon: FiXCircle },
                        ].map((stat, index) => (
                            <div key={index} className="bg-white/80 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className={`text-lg sm:text-xl font-bold text-${stat.color}-600`}>{stat.value}</div>
                                        <div className="text-xs text-gray-500 font-medium">{stat.label}</div>
                                    </div>
                                    <stat.icon className={`w-4 h-4 text-${stat.color}-500`} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Calendário Premium - CONFIGURAÇÕES CORRIGIDAS */}
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-gray-200/60 backdrop-blur-sm">
                {loading ? (
                    <div className="flex items-center justify-center h-96">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
                            <p className="text-gray-600 font-medium">Carregando agendamentos...</p>
                        </div>
                    </div>
                ) : (
                    <FullCalendar
                        ref={calendarRef}
                        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                        initialView="timeGridWeek"
                        selectable={true}
                        editable={true}
                        events={toCalendarEvents(agendamentos)}
                        eventDrop={handleEventDrop}
                            eventDragStart={(info) => {
                                setDragging(true);

                                // ⚙️ Personaliza o clone que segue o mouse
                                const mirrorEl: any = document.querySelector('.fc-event.fc-mirror');
                                if (mirrorEl) {
                                    mirrorEl.classList.add('custom-mirror');
                                    mirrorEl.style.opacity = '0.95';
                                    mirrorEl.style.cursor = 'grabbing';
                                    mirrorEl.style.position = 'fixed';
                                    mirrorEl.style.pointerEvents = 'none';
                                    mirrorEl.style.zIndex = '9999';
                                }

                                // Atualiza posição do clone seguindo o mouse
                                document.addEventListener('mousemove', (e) => {
                                    const mirror = document.querySelector('.custom-mirror') as HTMLElement;
                                    if (mirror) {
                                        mirror.style.left = `${e.clientX + 10}px`;
                                        mirror.style.top = `${e.clientY + 10}px`;
                                    }
                                });
                            }}
                        eventDragStop={handleEventDragStop}
                        select={handleDateSelect}
                        eventClick={handleEventClick}
                        locale={ptBrLocale}
                        height="70vh"
                        headerToolbar={{
                            left: 'prev,next today',
                            center: 'title',
                            right: 'dayGridMonth,timeGridWeek,timeGridDay',
                        }}
                        // CONFIGURAÇÕES CORRIGIDAS PARA ARRASTE
                        dragScroll={true}
                        longPressDelay={100}
                        eventMinHeight={30}
                        slotDuration="00:30:00"
                        snapDuration="00:30:00"
                        // CORREÇÃO: Configurações do drag mirror
                        dragRevertDuration={0}
                        // CORREÇÃO: Remove hover branco e melhora o drag
                        dayCellClassNames="transition-colors duration-200"
                        slotLabelClassNames="font-medium text-gray-600 text-sm"
                        nowIndicatorClassNames="bg-red-500 h-1"
                        moreLinkClassNames="bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg px-3 py-1 font-medium text-sm transition-colors duration-200"
                        // CORREÇÃO: Remove hover branco dos eventos
                        eventClassNames="cursor-pointer rounded-lg border-l-4 shadow-sm transition-all duration-200"
                        // CORREÇÃO: Custom event content corrigido
                            eventContent={(eventInfo) => {
                                const start = eventInfo.event.start ? moment(eventInfo.event.start).utcOffset(-180) : null;
                                const end = eventInfo.event.end ? moment(eventInfo.event.end).utcOffset(-180) : null;
                                const funcionario = eventInfo.event.extendedProps?.funcionario?.nome ?? 'Sem funcionário';

                                const startStr = start ? start.format('HH:mm') : '';
                                const endStr = end ? end.format('HH:mm') : '';

                                return (
                                    <div className="p-1 w-full h-full flex flex-col justify-center bg-gradient-to-r from-green-500 to-green-600 rounded-md shadow-md text-white">
                                        <div className="font-semibold text-xs leading-tight mb-0.5">
                                            {eventInfo.event.title}
                                        </div>
                                        <div className="text-[10px] italic opacity-90 mb-0.5">
                                            {funcionario}
                                        </div>
                                        <div className="text-xs leading-tight">
                                            {`${startStr} - ${endStr}`}
                                            <div className="text-[10px] mt-0.5">
                                                {start ? start.format('DD/MM/YYYY') : ''}
                                            </div>
                                        </div>
                                    </div>
                                );
                            }}

                        // Cores customizadas baseadas no status
                        eventDidMount={(info) => {
                            const status = info.event.extendedProps.status;
                            const colorMap = {
                                pendente: 'bg-gradient-to-r from-yellow-500 to-yellow-600 border-yellow-600',
                                confirmado: 'bg-gradient-to-r from-green-500 to-green-600 border-green-600',
                                concluido: 'bg-gradient-to-r from-blue-500 to-blue-600 border-blue-600',
                                cancelado: 'bg-gradient-to-r from-red-500 to-red-600 border-red-600',
                            };

                            if (colorMap[status as keyof typeof colorMap]) {
                                info.el.className += ` ${colorMap[status as keyof typeof colorMap]}`;
                            }

                            // CORREÇÃO: Remove qualquer transform problemática e configura para drag
                            info.el.style.transform = 'none';
                            info.el.style.position = 'relative';
                            info.el.style.cursor = 'grab';
                        }}
                        businessHours={{
                            daysOfWeek: [1, 2, 3, 4, 5],
                            startTime: '08:00',
                            endTime: '18:00',
                        }}
                        slotMinTime="06:00:00"
                        slotMaxTime="22:00:00"
                        allDaySlot={false}
                        expandRows={true}
                        stickyHeaderDates={true}
                        selectMirror={true}
                        selectOverlap={false}
                        eventOverlap={false}
                        slotEventOverlap={false}
                        // Configurações de performance
                        eventStartEditable={true}
                        eventDurationEditable={true}
                    />
                )}
            </div>

            {/* 🗑️ Lixeira Estilizada */}
            <div
                ref={trashRef}
                className={`fixed bottom-6 right-6 z-40 p-4 rounded-2xl transition-all duration-300 shadow-2xl border-2
                    ${dragging
                        ? 'bg-gradient-to-br from-red-600 to-red-700 scale-110 text-white border-red-700'
                        : 'bg-gradient-to-br from-red-600 to-red-500 text-white border-red-500 hover:from-red-500 hover:to-red-600 hover:scale-105'
                    } cursor-pointer group`}
            >
                <div className="flex items-center space-x-2">
                    <FiTrash2 className="w-6 h-6 group-hover:animate-bounce" />
                    <span className="text-sm font-medium hidden sm:block">
                        {dragging ? 'Solte para excluir' : 'Arraste para excluir'}
                    </span>
                </div>
            </div>

            {/* Legendas Premium */}
            <div className="mt-6 flex flex-wrap gap-4 justify-center">
                {[
                    { status: 'pendente', label: 'Pendente', color: 'bg-gradient-to-r from-yellow-500 to-yellow-600' },
                    { status: 'confirmado', label: 'Confirmado', color: 'bg-gradient-to-r from-green-500 to-green-600' },
                    { status: 'concluido', label: 'Concluído', color: 'bg-gradient-to-r from-blue-500 to-blue-600' },
                    { status: 'cancelado', label: 'Cancelado', color: 'bg-gradient-to-r from-red-500 to-red-600' },
                ].map((item) => (
                    <div key={item.status} className="flex items-center space-x-3 bg-white/80 backdrop-blur-sm rounded-xl px-4 py-3 shadow-lg border border-gray-100">
                        <div className={`w-4 h-4 rounded-full ${item.color} shadow-md`}></div>
                        <span className="text-sm font-medium text-gray-700">{item.label}</span>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            {stats[item.status as keyof typeof stats]}
                        </span>
                    </div>
                ))}
            </div>

            {modalData && (
                <AgendamentoModal
                    data={modalData}
                    client={cliente}
                    employee={funcionarios}
                    onClose={() => setModalData(null)}
                    onSaved={fetchAgendamentos}
                />
            )}
        </div>
    );
}