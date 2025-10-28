// types/agendamento.ts
export interface Agendamento {
    id: number;
    cliente_id: number;
    veiculo_id: number;
    funcionario_id?: number;
    data_agendamento: string;
    status: 'pendente' | 'confirmado' | 'concluido' | 'cancelado';
    observacoes?: string;
    createdAt: string;
    updatedAt: string;
    cliente?: Cliente;
    veiculo?: Veiculo;
    funcionario?: Funcionario;
}

export interface Cliente {
    id: number;
    nome: string;
    email: string;
    telefone: string;
}

export interface Veiculo {
    id: number;
    modelo: string;
    marca: string;
    placa: string;
    ano: number;
}

export interface Funcionario {
    id: number;
    nome: string;
    email: string;
    especialidade: string;
}

export interface CreateAgendamentoDto {
    cliente_id: number;
    veiculo_id: number;
    funcionario_id?: number;
    data_agendamento: string;
    status?: 'pendente' | 'confirmado' | 'concluido' | 'cancelado';
    observacoes?: string;
}

export interface UpdateAgendamentoDto extends Partial<CreateAgendamentoDto> { }