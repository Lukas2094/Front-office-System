export interface Cliente {
  id?: number;
  nome: string;
  tipo: 'PF' | 'PJ';
  cpf_cnpj: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
}
