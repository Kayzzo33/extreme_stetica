
import { Service, Product } from './types';

export const SERVICES: Service[] = [
  { id: '1', name: 'Lavagem Detalhada Externa', description: 'Foco total na remoção de contaminantes e brilho externo.', priceRange: 'R$ 80-120', duration: '2h', icon: 'Droplets' },
  { id: '2', name: 'Lavagem Completa', description: 'Limpeza minuciosa externa e higienização interna básica.', priceRange: 'R$ 150-200', duration: '4h', icon: 'Car' },
  { id: '3', name: 'Higienização Interna Profunda', description: 'Remoção de ácaros, bactérias e manchas em estofados.', priceRange: 'R$ 180-250', duration: '5h', icon: 'Sparkle' },
  { id: '4', name: 'Polimento Técnico', description: 'Correção de verniz e eliminação de micro-riscos.', priceRange: 'R$ 300-500', duration: '6-8h', icon: 'Zap' },
  { id: '5', name: 'Polimento + Cristalização', description: 'Proteção extra com selante de alto brilho.', priceRange: 'R$ 450-700', duration: '1 dia', icon: 'ShieldCheck' },
  { id: '6', name: 'Vitrificação de Pintura', description: 'O ápice da proteção cerâmica com dureza 9H.', priceRange: 'R$ 800-1.500', duration: '1-2 dias', icon: 'Gem' },
  { id: '7', name: 'Vitrificação de Faróis', description: 'Restauração da transparência e proteção UV duradoura.', priceRange: 'R$ 250-400', duration: '3h', icon: 'Sun' },
  { id: '8', name: 'Revitalização de Plásticos', description: 'Devolve a cor original e protege plásticos ressecados.', priceRange: 'R$ 150-250', duration: '2h', icon: 'Layers' },
  { id: '9', name: 'Enceramento Premium', description: 'Aplicação de ceras de carnaúba pura para efeito show car.', priceRange: 'R$ 200-350', duration: '3h', icon: 'Star' },
  { id: '10', name: 'Restauração de Couro', description: 'Limpeza técnica e hidratação profunda de assentos.', priceRange: 'R$ 300-600', duration: '4h', icon: 'UserCheck' },
  { id: '11', name: 'Blindagem de Pintura (PPF)', description: 'Película de proteção ultra resistente contra impactos.', priceRange: 'Sob consulta', duration: 'Consultar', icon: 'Shield' },
  { id: '12', name: 'Tratamento Cerâmico', description: 'Proteção integral com nanotecnologia de ponta.', priceRange: 'R$ 1.200-2.000', duration: '2 dias', icon: 'Cpu' },
];

export const PRODUCTS: Product[] = [
  { id: 'p1', name: 'Vönix Ceramic Pro', description: 'Vitrificador de alta performance para proteção de longo prazo.', image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=600', isProfessional: true },
  { id: 'p2', name: 'Vönix V-Floc', description: 'Shampoo de alta performance com lubrificação premium para lavagem segura.', image: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&q=80&w=600', isProfessional: true },
  { id: 'p3', name: 'Vönix Cera Carnaúba Premium', description: 'Brilho quente e profundo com a lendária proteção da carnaúba brasileira.', image: 'https://images.unsplash.com/photo-1599256621730-535171e28e50?auto=format&fit=crop&q=80&w=600', isProfessional: false },
  { id: 'p4', name: 'Vönix V-Polish', description: 'Compostos polidores de corte, refino e lustro para acabamento espelhado.', image: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&q=80&w=600', isProfessional: true },
];

export const WORKING_HOURS = {
  weekday: ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'],
  saturday: ['08:00', '09:00', '10:00', '11:00'],
};

export const CONTACT_INFO = {
  whatsapp: '+55 73 9 8817-6142',
  instagram: '@extreme_stetica',
  address: 'R. Edson Ribeiro Almeida, 150, Maracás - BA, 45360-000',
  mapsLink: 'https://www.google.com/maps/place/R.+Edson+Ribeiro+Almeida,+150,+Maracás+-+BA,+45360-000/@-13.4409851,-40.4398782,17z/',
};
