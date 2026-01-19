
export interface Service {
  id: string;
  name: string;
  description: string;
  priceRange: string;
  duration: string;
  icon: string;
}

export interface Booking {
  id: number;
  servico: string;
  data: string;
  horario: string;
  nome: string;
  telefone: string;
  veiculo: string;
  cor: string;
  obs: string;
  status: 'pendente' | 'confirmado' | 'em_andamento' | 'concluido';
}

export interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
  isProfessional: boolean;
}
