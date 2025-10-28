export function toCalendarEvents(agendamentos: any[]) {
    return agendamentos.map((a) => ({
        id: a.id.toString(),
        title: `${a.cliente?.nome || 'Sem cliente'} - ${a.veiculo?.modelo || 'Veículo'}`,
        start: a.data_agendamento,
        backgroundColor: getStatusColor(a.status),
        extendedProps: {
            status: a.status,
            cliente: a.cliente,
            veiculo: a.veiculo,
            funcionario: a.funcionario,
        },
    }));
}

function getStatusColor(status: string) {
    switch (status) {
        case 'pendente': return '#facc15'; // amarelo
        case 'confirmado': return '#22c55e'; // verde
        case 'concluido': return '#3b82f6'; // azul
        case 'cancelado': return '#ef4444'; // vermelho
        default: return '#9ca3af';
    }
}
