
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Calendar, Clock, Car, MapPin, Phone, Instagram, Shield, Sparkles, 
  Droplets, Zap, ShieldCheck, Gem, Sun, Layers, Star, UserCheck, 
  Cpu, Search, X, ChevronRight, CheckCircle, AlertCircle, Menu, Info
} from 'lucide-react';
import { format, addDays, isWeekend, isSaturday, startOfToday, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { SERVICES, PRODUCTS, WORKING_HOURS, CONTACT_INFO } from './constants';
import { Service, Booking, Product } from './types';

// --- Components ---

const IconButton = ({ icon: Icon, className = "" }: { icon: any, className?: string }) => (
  <div className={`p-2 rounded-full glass ${className}`}>
    <Icon size={20} className="text-accent" />
  </div>
);

// Fix: Changed children to optional to resolve Property 'children' is missing in type error
const SectionTitle = ({ children, subtitle }: { children?: React.ReactNode, subtitle?: string }) => (
  <div className="mb-10 text-center px-4">
    <h2 className="text-3xl md:text-4xl font-display font-black uppercase tracking-tighter mb-2 italic">
      {children}
    </h2>
    {subtitle && <p className="text-gray-400 max-w-lg mx-auto text-sm">{subtitle}</p>}
    <div className="w-24 h-1 bg-accent mx-auto mt-4 rounded-full shadow-[0_0_8px_#DC143C]"></div>
  </div>
);

const Toast = ({ message, type = 'success', onClose }: { message: string, type?: 'success' | 'error', onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-xl glass border-l-4 ${type === 'success' ? 'border-green-500' : 'border-red-500'} flex items-center gap-3 animate-fade-up`}>
      {type === 'success' ? <CheckCircle className="text-green-500" /> : <AlertCircle className="text-red-500" />}
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [activeModal, setActiveModal] = useState<Service | null>(null);
  const [trackerPhone, setTrackerPhone] = useState('');
  const [foundBookings, setFoundBookings] = useState<Booking[]>([]);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Booking Form State
  const [formDate, setFormDate] = useState(format(startOfToday(), 'yyyy-MM-dd'));
  const [formTime, setFormTime] = useState('');
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formVehicle, setFormVehicle] = useState('');
  const [formColor, setFormColor] = useState('');
  const [formObs, setFormObs] = useState('');

  // LocalStorage Helpers
  const saveBooking = (booking: Booking) => {
    const existing = JSON.parse(localStorage.getItem('extreme_bookings') || '[]');
    localStorage.setItem('extreme_bookings', JSON.stringify([booking, ...existing]));
  };

  const searchBookings = (phone: string) => {
    if (!phone) return;
    const existing: Booking[] = JSON.parse(localStorage.getItem('extreme_bookings') || '[]');
    const results = existing.filter(b => b.telefone.replace(/\D/g, '').includes(phone.replace(/\D/g, '')));
    setFoundBookings(results);
  };

  // UI Handlers
  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTime || !formName || !formPhone || !formVehicle) {
      setToast({ message: 'Preencha todos os campos obrigatórios!', type: 'error' });
      return;
    }

    setIsLoading(true);

    const newBooking: Booking = {
      id: Date.now(),
      servico: activeModal!.name,
      data: format(parseISO(formDate), 'dd/MM/yyyy'),
      horario: formTime,
      nome: formName,
      telefone: formPhone,
      veiculo: formVehicle,
      cor: formColor,
      obs: formObs || 'Nenhuma',
      status: 'pendente'
    };

    setTimeout(() => {
      saveBooking(newBooking);
      setIsLoading(false);
      setToast({ message: 'Agendamento registrado com sucesso!', type: 'success' });
      
      // WhatsApp Link
      const message = `Olá, EXTREME STÉTICA! 🚗
Gostaria de agendar o serviço:
📋 Serviço: ${newBooking.servico}
📅 Data: ${newBooking.data}
🕐 Horário: ${newBooking.horario}
👤 Dados do cliente:
Nome: ${newBooking.nome}
Telefone: ${newBooking.telefone}
Veículo: ${newBooking.veiculo} - ${newBooking.cor}
💬 Observações: ${newBooking.obs}
Aguardo confirmação!`;

      const encoded = encodeURIComponent(message);
      window.open(`https://wa.me/5573988176142?text=${encoded}`, '_blank');
      
      setActiveModal(null);
      resetForm();
    }, 1500);
  };

  const resetForm = () => {
    setFormDate(format(startOfToday(), 'yyyy-MM-dd'));
    setFormTime('');
    setFormName('');
    setFormPhone('');
    setFormVehicle('');
    setFormColor('');
    setFormObs('');
  };

  const getIcon = (name: string) => {
    switch (name) {
      case 'Droplets': return Droplets;
      case 'Car': return Car;
      case 'Sparkle': return Sparkles;
      case 'Zap': return Zap;
      case 'ShieldCheck': return ShieldCheck;
      case 'Gem': return Gem;
      case 'Sun': return Sun;
      case 'Layers': return Layers;
      case 'Star': return Star;
      case 'UserCheck': return UserCheck;
      case 'Shield': return Shield;
      case 'Cpu': return Cpu;
      default: return Info;
    }
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers
        .replace(/^(\d{2})(\d)/g, '($1) $2')
        .replace(/(\d)(\d{4})$/, '$1-$2');
    }
    return value;
  };

  return (
    <div className="min-h-screen bg-dark text-white font-sans selection:bg-accent selection:text-white">
      {/* Background Effect */}
      <div className="fixed inset-0 z-0 bg-animated opacity-30 pointer-events-none"></div>
      
      {/* Emergency Button */}
      <a 
        href={`https://wa.me/5573988176142?text=${encodeURIComponent('🚨 ATENDIMENTO URGENTE!\nPreciso de um serviço com prioridade.\nAguardo retorno imediato.')}`}
        target="_blank"
        className="fixed bottom-6 left-6 z-50 md:top-6 md:right-6 md:left-auto md:bottom-auto group"
      >
        <div className="flex items-center gap-2 px-5 py-3 rounded-full bg-accent text-white font-bold shadow-[0_0_20px_#DC143C] animate-pulse-fast hover:scale-105 transition-transform">
          <span className="hidden md:inline">Atendimento Urgente</span>
          <span className="md:hidden">Urgência</span>
          <AlertCircle size={20} />
        </div>
      </a>

      {/* WhatsApp Fixed Button */}
      <a 
        href={`https://wa.me/5573988176142`}
        target="_blank"
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-[#25D366] text-white shadow-xl hover:scale-110 transition-transform md:p-5"
      >
        <Phone size={24} />
      </a>

      {/* Hero Section */}
      <section id="home" className="relative min-h-[90vh] flex flex-col items-center justify-center pt-20 pb-10 px-6 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
        
        <div className="relative z-10 text-center animate-fade-up max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-8xl font-display font-black tracking-widest text-white mb-4 italic">
            EXTREME<br/><span className="text-accent text-glow">STÉTICA</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 font-light mb-8 max-w-2xl mx-auto uppercase tracking-widest">
            Tecnologia de ponta encontra a <span className="text-white font-bold border-b-2 border-accent">arte automotiva</span>
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#servicos" className="w-full sm:w-auto px-8 py-4 bg-accent rounded-xl font-bold text-lg btn-glow transition-all hover:-translate-y-1">
              Agendar Serviço
            </a>
            <a href="#localizacao" className="w-full sm:w-auto px-8 py-4 glass rounded-xl font-bold text-lg hover:bg-white/10 transition-all">
              Ver Localização
            </a>
          </div>
          <p className="mt-8 text-sm text-gray-500 font-medium uppercase tracking-[0.3em]">
            Estética automotiva de alta performance em Maracás-BA
          </p>
        </div>
        
        <div className="absolute bottom-10 animate-float text-accent">
          <ChevronRight className="rotate-90" size={32} />
        </div>
      </section>

      {/* Services Section */}
      <section id="servicos" className="relative py-24 z-10">
        <div className="container mx-auto px-4">
          <SectionTitle subtitle="Transformação estética com produtos premium e técnica certificada.">
            Nossos Serviços
          </SectionTitle>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {SERVICES.map((service, idx) => {
              const IconComp = getIcon(service.icon);
              return (
                <div 
                  key={service.id} 
                  className="group relative glass p-6 rounded-2xl flex flex-col hover:border-accent/40 transition-all duration-500 animate-fade-up"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                    <IconComp size={64} />
                  </div>
                  
                  <div className="mb-4">
                    <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center mb-4 group-hover:bg-accent group-hover:text-white transition-colors duration-300">
                      <IconComp size={24} />
                    </div>
                    <h3 className="text-xl font-bold mb-2 pr-10">{service.name}</h3>
                    <p className="text-gray-400 text-sm font-light mb-6 line-clamp-2">{service.description}</p>
                  </div>

                  <div className="mt-auto pt-4 border-t border-white/5 space-y-3">
                    <div className="flex items-center justify-between text-xs uppercase tracking-widest font-semibold text-gray-500">
                      <span>Preço Estimado</span>
                      <span className="text-white">{service.priceRange}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs uppercase tracking-widest font-semibold text-gray-500">
                      <span>Duração</span>
                      <span className="text-accent">{service.duration}</span>
                    </div>
                    <button 
                      onClick={() => setActiveModal(service)}
                      className="w-full mt-4 py-3 bg-white text-black font-bold rounded-lg hover:bg-accent hover:text-white transition-all transform hover:scale-[1.02]"
                    >
                      Agendar Agora
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tracking Section */}
      <section id="rastreio" className="py-24 bg-card relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-[100px]"></div>
        <div className="container mx-auto px-4 relative z-10">
          <SectionTitle subtitle="Acompanhe o status do seu veículo em tempo real.">
            Rastreamento de Serviço
          </SectionTitle>

          <div className="max-w-2xl mx-auto glass p-8 rounded-3xl">
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                <input 
                  type="text" 
                  placeholder="Seu telefone (DDD) 9XXXX-XXXX"
                  className="w-full bg-dark/50 border border-white/10 rounded-xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-accent focus:outline-none transition-all"
                  value={trackerPhone}
                  onChange={(e) => {
                    const val = formatPhone(e.target.value);
                    setTrackerPhone(val);
                    if (val.length >= 10) searchBookings(val);
                  }}
                />
              </div>
              <button 
                onClick={() => searchBookings(trackerPhone)}
                className="bg-accent px-8 py-4 rounded-xl font-bold hover:brightness-110 transition-all"
              >
                Buscar
              </button>
            </div>

            {foundBookings.length > 0 ? (
              <div className="space-y-6">
                {foundBookings.map((b) => (
                  <div key={b.id} className="p-6 bg-dark/40 rounded-2xl border border-white/5 animate-fade-up">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h4 className="text-lg font-bold text-accent">{b.servico}</h4>
                        <p className="text-sm text-gray-400">{b.veiculo} • {b.data} às {b.horario}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[10px] uppercase font-black tracking-tighter ${
                        b.status === 'concluido' ? 'bg-green-500' : 'bg-accent shadow-[0_0_10px_#DC143C]'
                      }`}>
                        {b.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="relative pt-6 pb-2">
                      <div className="absolute top-8 left-0 w-full h-1 bg-white/10 rounded-full"></div>
                      <div className="relative flex justify-between">
                        {[
                          { label: 'Agendado', key: 'pendente' },
                          { label: 'Confirmado', key: 'confirmado' },
                          { label: 'Em Progresso', key: 'em_andamento' },
                          { label: 'Concluído', key: 'concluido' }
                        ].map((step, idx) => {
                          const isActive = ['pendente', 'confirmado', 'em_andamento', 'concluido'].indexOf(b.status) >= idx;
                          return (
                            <div key={step.key} className="flex flex-col items-center gap-3">
                              <div className={`w-5 h-5 rounded-full z-10 border-2 transition-all ${
                                isActive ? 'bg-accent border-accent scale-110 shadow-[0_0_10px_#DC143C]' : 'bg-dark border-white/20'
                              }`}></div>
                              <span className={`text-[10px] font-bold uppercase tracking-widest ${isActive ? 'text-white' : 'text-gray-600'}`}>
                                {step.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : trackerPhone.length > 5 && (
              <div className="text-center py-10">
                <p className="text-gray-500 italic">Nenhum agendamento encontrado para este número.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Vönix Products */}
      <section id="produtos" className="py-24">
        <div className="container mx-auto px-4">
          <SectionTitle subtitle="Utilizamos exclusivamente o que há de melhor no mercado mundial.">
            Tecnologia Vönix
          </SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {PRODUCTS.map((prod) => (
              <div key={prod.id} className="group glass overflow-hidden rounded-3xl transition-transform hover:-translate-y-2">
                <div className="h-48 overflow-hidden relative">
                  <img src={prod.image} alt={prod.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-60 group-hover:opacity-100" />
                  {prod.isProfessional && (
                    <div className="absolute top-4 right-4 bg-accent text-[10px] font-black uppercase px-2 py-1 rounded shadow-lg">
                      Profissional
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="font-bold mb-2 group-hover:text-accent transition-colors">{prod.name}</h3>
                  <p className="text-xs text-gray-400 font-light leading-relaxed">{prod.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Placeholder */}
      <section className="py-24 bg-card">
        <div className="container mx-auto px-4">
          <SectionTitle subtitle="A perfeição está nos detalhes. Confira nossos resultados recentes.">
            Transformações
          </SectionTitle>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-5xl mx-auto opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700 cursor-help">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="aspect-square bg-dark border border-white/5 rounded-2xl flex items-center justify-center p-4">
                <div className="text-center">
                  <Car className="mx-auto mb-2 text-gray-700" size={32} />
                  <span className="text-[10px] uppercase font-bold text-gray-700 tracking-[0.3em]">Em Breve</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section id="localizacao" className="py-24">
        <div className="container mx-auto px-4">
          <SectionTitle subtitle="Venha nos visitar em Maracás. Café e paixão automotiva garantidos.">
            Onde Estamos
          </SectionTitle>
          <div className="flex flex-col lg:flex-row gap-10 max-w-6xl mx-auto">
            <div className="lg:w-1/3 space-y-8">
              <div className="glass p-8 rounded-3xl space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-accent/20 rounded-xl text-accent">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Endereço</h4>
                    <p className="text-sm text-gray-400 leading-relaxed">{CONTACT_INFO.address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-accent/20 rounded-xl text-accent">
                    <Clock size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Funcionamento</h4>
                    <p className="text-sm text-gray-400">Seg - Sex: 08h às 18h</p>
                    <p className="text-sm text-gray-400">Sáb: 08h às 12h</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-accent/20 rounded-xl text-accent">
                    <Instagram size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Social</h4>
                    <p className="text-sm text-gray-400">{CONTACT_INFO.instagram}</p>
                  </div>
                </div>
                <a 
                  href={CONTACT_INFO.mapsLink} 
                  target="_blank"
                  className="block w-full text-center py-4 bg-white text-black font-bold rounded-xl hover:bg-accent hover:text-white transition-all shadow-lg"
                >
                  Abrir no Google Maps
                </a>
              </div>
            </div>
            <div className="lg:w-2/3 h-[450px] rounded-3xl overflow-hidden glass p-2">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3876.620015501869!2d-40.4398782!3d-13.4409851!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x742277c0f165a25%3A0xcb3252a123f6e9eb!2sR.%20Edson%20Ribeiro%20Almeida%2C%20150%20-%20Marac%C3%A1s%2C%20BA%2C%2045360-000!5e0!3m2!1spt-BR!2sbr!4v1715424840294!5m2!1spt-BR!2sbr" 
                className="w-full h-full rounded-2xl grayscale opacity-80 contrast-125"
                style={{ border: 0 }} 
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark py-12 border-t border-white/5 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.02] text-9xl font-display font-black pointer-events-none">
          EXTREME
        </div>
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-display font-black tracking-widest italic mb-6">
            EXTREME<span className="text-accent">STÉTICA</span>
          </h2>
          <div className="flex justify-center gap-6 mb-8 text-gray-400">
            <a href="#home" className="hover:text-accent transition-colors">Home</a>
            <a href="#servicos" className="hover:text-accent transition-colors">Serviços</a>
            <a href="#rastreio" className="hover:text-accent transition-colors">Rastreio</a>
            <a href="#produtos" className="hover:text-accent transition-colors">Produtos</a>
          </div>
          <p className="text-sm text-gray-600 mb-2">© 2025 Extreme Stética - Todos os direitos reservados.</p>
          <p className="text-[10px] text-gray-700 uppercase tracking-widest font-bold">Desenvolvido com tecnologia de ponta</p>
        </div>
      </footer>

      {/* Booking Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-dark/95 backdrop-blur-xl animate-fade-in" onClick={() => setActiveModal(null)}></div>
          <div className="relative w-full max-w-xl bg-card rounded-[32px] overflow-hidden border border-white/10 shadow-2xl animate-fade-up">
            <div className="bg-accent px-8 py-6 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Agendamento Online</span>
                <h3 className="text-xl font-bold italic">{activeModal.name}</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="p-2 hover:bg-black/20 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleBookingSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Data do Serviço</label>
                  <input 
                    type="date" 
                    min={format(startOfToday(), 'yyyy-MM-dd')}
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full bg-dark border border-white/5 p-4 rounded-xl focus:ring-2 focus:ring-accent transition-all"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Horário Disponível</label>
                  <select 
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="w-full bg-dark border border-white/5 p-4 rounded-xl focus:ring-2 focus:ring-accent transition-all appearance-none"
                    required
                  >
                    <option value="">Selecione...</option>
                    {(isSaturday(parseISO(formDate)) ? WORKING_HOURS.saturday : WORKING_HOURS.weekday).map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Seu Nome Completo</label>
                <input 
                  type="text" 
                  placeholder="Ex: João da Silva"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-dark border border-white/5 p-4 rounded-xl focus:ring-2 focus:ring-accent transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Telefone / WhatsApp</label>
                <input 
                  type="tel" 
                  placeholder="(73) 9 8817-6142"
                  value={formPhone}
                  onChange={(e) => setFormPhone(formatPhone(e.target.value))}
                  className="w-full bg-dark border border-white/5 p-4 rounded-xl focus:ring-2 focus:ring-accent transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Veículo</label>
                  <input 
                    type="text" 
                    placeholder="Marca/Modelo"
                    value={formVehicle}
                    onChange={(e) => setFormVehicle(e.target.value)}
                    className="w-full bg-dark border border-white/5 p-4 rounded-xl focus:ring-2 focus:ring-accent transition-all"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Cor</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Prata"
                    value={formColor}
                    onChange={(e) => setFormColor(e.target.value)}
                    className="w-full bg-dark border border-white/5 p-4 rounded-xl focus:ring-2 focus:ring-accent transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Observações (Opcional)</label>
                <textarea 
                  rows={2}
                  placeholder="Algo específico que deseja nos avisar?"
                  value={formObs}
                  onChange={(e) => setFormObs(e.target.value)}
                  className="w-full bg-dark border border-white/5 p-4 rounded-xl focus:ring-2 focus:ring-accent transition-all resize-none"
                ></textarea>
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full py-5 bg-accent text-white font-black uppercase tracking-widest rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-lg flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    Confirmar Agendamento
                    <CheckCircle size={20} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </div>
  );
}
