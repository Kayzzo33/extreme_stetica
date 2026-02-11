
import { Service, Product } from './types';

export const HERO_VIDEO = "https://res.cloudinary.com/dhtmv1kxb/video/upload/v1770769204/WhatsApp_Video_2026-02-10_at_21.14.29_nfev9d.mp4";
export const HERO_VIDEO_MOBILE = "https://res.cloudinary.com/dhtmv1kxb/video/upload/v1770771936/WhatsApp_Video_2026-02-10_at_21.43.59_ys3fh5.mp4";

export const SERVICES: Service[] = [
  { 
    id: 'combo-essencial', 
    name: 'Combo Essencial', 
    description: 'Limpeza externa, higienização interna com Sintra, descontaminação de rodas.', 
    priceRange: 'R$ 85', 
    duration: '2h', 
    icon: 'Droplets' 
  },
  { 
    id: 'combo-performance', 
    name: 'Combo Performance', 
    description: 'Higienização externa e interna, renovação de plásticos externa ou interna, disco de rodas.', 
    priceRange: 'R$ 135', 
    duration: '3h', 
    icon: 'Sparkle' 
  },
  { 
    id: 'combo-couro', 
    name: 'Combo Couro Care', 
    description: 'Higienização interna e externa, limpeza e hidratação de bancos de couro.', 
    priceRange: 'R$ 110', 
    duration: '3h', 
    icon: 'UserCheck' 
  },
  { 
    id: 'combo-detalhe', 
    name: 'Combo Detalhe Total', 
    description: 'Higienização interna e externa, limpeza de teto, bancos, tecidos, plásticos e disco de rodas.', 
    priceRange: 'R$ 210', 
    duration: '4-5h', 
    icon: 'Gem' 
  },
  { 
    id: 'engine-clean', 
    name: 'Engine Clean', 
    description: 'Limpeza de motor e aplicação de verniz.', 
    priceRange: 'A partir de R$ 150', 
    duration: '2h', 
    icon: 'Cpu' 
  },
  { 
    id: 'visao-nova', 
    name: 'Visão Nova', 
    description: 'Vitrificação de faróis.', 
    priceRange: 'A partir de R$ 100', 
    duration: '2h', 
    icon: 'Sun' 
  },
  { 
    id: 'brilho-premium', 
    name: 'Brilho Premium', 
    description: 'Polimento e aplicação de cera.', 
    priceRange: 'A partir de R$ 200', 
    duration: '3-4h', 
    icon: 'Star' 
  },
  { 
    id: 'polimento-tecnico', 
    name: 'Polimento Técnico', 
    description: 'Correção de pintura e eliminação de micro-riscos.', 
    priceRange: 'R$ 300-500', 
    duration: '6-8h', 
    icon: 'Zap' 
  },
  { 
    id: 'ppf', 
    name: 'Blindagem de Pintura (PPF)', 
    description: 'Película de proteção ultra resistente contra impactos.', 
    priceRange: 'Sob consulta', 
    duration: 'Consultar', 
    icon: 'Shield' 
  },
];

export const PRODUCTS: Product[] = [
  { id: 'p1', name: 'Vönix Ceramic Pro', description: 'Vitrificador de alta performance para proteção de longo prazo.', image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=600', isProfessional: true },
  { id: 'p2', name: 'Vönix V-Floc', description: 'Shampoo de alta performance com lubrificação premium para lavagem segura.', image: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&q=80&w=600', isProfessional: true },
  { id: 'p3', name: 'Vönix Cera Carnaúba Premium', description: 'Brilho quente e profundo com a lendária proteção da carnaúba brasileira.', image: 'https://images.unsplash.com/photo-1599256621730-535171e28e50?auto=format&fit=crop&q=80&w=600', isProfessional: false },
  { id: 'p4', name: 'Vönix V-Polish', description: 'Compostos polidores de corte, refino e lustro para acabamento espelhado.', image: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&q=80&w=600', isProfessional: true },
];

export const REELS = [
  "https://res.cloudinary.com/dhtmv1kxb/video/upload/v1770592379/WhatsApp_Video_2026-01-29_at_15.53.09_oseidc.mp4",
  "https://res.cloudinary.com/dhtmv1kxb/video/upload/v1770592361/WhatsApp_Video_2026-01-28_at_09.26.04_lp19nb.mp4",
  "https://res.cloudinary.com/dhtmv1kxb/video/upload/v1770592337/WhatsApp_Video_2026-01-30_at_13.14.32_c9n5md.mp4",
  "https://res.cloudinary.com/dhtmv1kxb/video/upload/v1770592346/WhatsApp_Video_2026-02-04_at_13.01.42_oeotqg.mp4",
  "https://res.cloudinary.com/dhtmv1kxb/video/upload/v1770592346/WhatsApp_Video_2026-02-04_at_13.01.42_oeotqg.mp4", 
  "https://res.cloudinary.com/dhtmv1kxb/video/upload/v1770592341/WhatsApp_Video_2026-01-31_at_19.23.42_y0s42v.mp4",
  "https://res.cloudinary.com/dhtmv1kxb/video/upload/v1770592338/WhatsApp_Video_2026-01-31_at_15.53.20_b8jhng.mp4",
  "https://res.cloudinary.com/dhtmv1kxb/video/upload/v1770592336/WhatsApp_Video_2026-02-07_at_20.11.09_iuvvzs.mp4",
  "https://res.cloudinary.com/dhtmv1kxb/video/upload/v1770592335/WhatsApp_Video_2026-02-04_at_12.04.25_trmlpx.mp4",
  "https://res.cloudinary.com/dhtmv1kxb/video/upload/v1770592335/WhatsApp_Video_2026-02-07_at_20.10.56_objzah.mp4"
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
  facadeImage: 'https://res.cloudinary.com/dhtmv1kxb/image/upload/v1770593141/WhatsApp_Image_2026-01-26_at_20.28.22_bnrivx.jpg'
};
