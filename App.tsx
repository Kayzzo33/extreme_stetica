
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Calendar, Clock, Car, MapPin, Phone, Instagram, Shield, Sparkles, 
  Droplets, Zap, ShieldCheck, Gem, Sun, Layers, Star, UserCheck, 
  Cpu, Search, X, ChevronRight, CheckCircle, AlertCircle, Menu, Info
} from 'lucide-react';
import { format, isSaturday, startOfToday, parseISO } from 'date-fns';
import { SERVICES, PRODUCTS, WORKING_HOURS, CONTACT_INFO } from './constants';
import { Service, Booking, Product } from './types';

// --- Components ---

const SectionTitle = ({ children, subtitle }: { children?: React.ReactNode, subtitle?: string }) => (
  <div className="mb-10 text-center px-4 relative z-10">
    <h2 className="text-3xl md:text-4xl font-display font-black uppercase tracking-tighter mb-2 italic">
      {children}
    </h2>
    {subtitle && <p className="text-gray-400 max-w-lg mx-auto text-sm">{subtitle}</p>}
    <div className="w-24 h-1 bg-accent mx-auto mt-4 rounded-full shadow-[0_0_15px_#DC143C]"></div>
  </div>
);

const Toast = ({ message, type = 'success', onClose }: { message: string, type?: 'success' | 'error', onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-xl glass border-l-4 ${type === 'success' ? 'border-green-500' : 'border-red-500'} flex items-center gap-3 animate-fade-up shadow-2xl`}>
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

  // Booking Form State
  const [formDate, setFormDate] = useState(format(startOfToday(), 'yyyy-MM-dd'));
  const [formTime, setFormTime] = useState('');
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formVehicle, setFormVehicle] = useState('');
  const [formColor, setFormColor] = useState('');
  const [formObs, setFormObs] = useState('');

  // Scroll Handler
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

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
      
      const message = `Olá, EXTREME STÉTICA! 🚗\nGostaria de agendar o serviço:\n📋 Serviço: ${newBooking.servico}\n📅 Data: ${newBooking.data}\n🕐 Horário: ${newBooking.horario}\n👤 Cliente:\nNome: ${newBooking.nome}\nTelefone: ${newBooking.telefone}\nVeículo: ${newBooking.veiculo} - ${newBooking.cor}\n💬 Observações: ${newBooking.obs}\nAguardo confirmação!`;

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
      <div className="fixed inset-0 z-0 bg-animated opacity-40 pointer-events-none"></div>
      
      {/* Emergency Button */}
      <a 
        href={`https://wa.me/5573988176142?text=${encodeURIComponent('🚨 ATENDIMENTO URGENTE!\nPreciso de um serviço com prioridade.\nAguardo retorno imediato.')}`}
        target="_blank"
        className="fixed bottom-6 left-6 z-50 md:top-6 md:right-6 md:left-auto md:bottom-auto group"
      >
        <div className="flex items-center gap-2 px-5 py-3 rounded-full bg-accent text-white font-bold shadow-[0_0_25px_#DC143C] animate-pulse-fast hover:scale-105 transition-transform">
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
      <section id="home" className="relative min-h-screen flex flex-col items-center justify-center pt-20 pb-10 px-6 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(220,20,60,0.1),transparent_70%)] pointer-events-none"></div>
        
        <div className="relative z-10 text-center animate-fade-up max-w-4xl mx-auto">
          <h1 className="text-6xl md:text-9xl font-display font-black tracking-widest text-white mb-6 italic leading-tight">
            EXTREME<br/><span className="text-accent text-glow">STÉTICA</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 font-light mb-10 max-w-2xl mx-auto uppercase tracking-widest">
            Tecnologia de ponta encontra a <span className="text-white font-bold border-b-2 border-accent">arte automotiva</span>
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button 
              type="button"
              onClick={() => scrollToSection('servicos')}
              className="w-full sm:w-auto px-10 py-5 bg-accent rounded-2xl font-bold text-xl btn-glow transition-all hover:-translate-y-1 hover:brightness-110 active:scale-95"
            >
              Agendar Serviço
            </button>
            <button 
              type="button"
              onClick={() => scrollToSection('localizacao')}
              className="w-full sm:w-auto px-10 py-5 glass rounded-2xl font-bold text-xl hover:bg-white/10 transition-all active:scale-95"
            >
              Ver Localização
            </button>
          </div>
          <p className="mt-12 text-sm text-gray-500 font-medium uppercase tracking-[0.4em] opacity-80">
            Estética automotiva de alta performance em Maracás-BA
          </p>
        </div>
        
        <div className="absolute bottom-10 animate-float text-accent/50">
          <ChevronRight className="rotate-90" size={32} />
        </div>
      </section>

      {/* Services Section */}
      <section id="servicos" className="relative py-32 z-10 bg-gradient-to-b from-transparent via-dark/80 to-transparent">
        <div className="container mx-auto px-4">
          <SectionTitle subtitle="Transformação estética com produtos premium e técnica certificada.">
            Nossos Serviços
          </SectionTitle>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {SERVICES.map((service, idx) => {
              const IconComp = getIcon(service.icon);
              return (
                <div 
                  key={service.id} 
                  className="group relative glass p-8 rounded-3xl flex flex-col hover:border-accent/50 transition-all duration-500 animate-fade-up shadow-lg"
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  <div className="mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-6 group-hover:bg-accent group-hover:text-white transition-colors duration-300">
                      <IconComp size={28} />
                    </div>
                    <h3 className="text-2xl font-bold mb-3 pr-10 tracking-tight">{service.name}</h3>
                    <p className="text-gray-400 text-sm font-light mb-6 line-clamp-2 leading-relaxed">{service.description}</p>
                  </div>

                  <div className="mt-auto pt-6 border-t border-white/5 space-y-4">
                    <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] font-bold text-gray-500">
                      <span>Investimento</span>
                      <span className="text-white">{service.priceRange}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] font-bold text-gray-500">
                      <span>Tempo</span>
                      <span className="text-accent">{service.duration}</span>
                    </div>
                    <button 
                      onClick={() => setActiveModal(service)}
                      className="w-full mt-6 py-4 bg-white text-black font-black uppercase text-xs tracking-widest rounded-xl hover:bg-accent hover:text-white transition-all transform hover:scale-[1.03] active:scale-95 shadow-xl"
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
      <section id="rastreio" className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-card/20 to-transparent"></div>
        <div className="container mx-auto px-4 relative z-10">
          <SectionTitle subtitle="Acompanhe cada etapa do detalhamento do seu veículo.">
            Acompanhe Seu Serviço
          </SectionTitle>

          <div className="max-w-2xl mx-auto glass p-10 rounded-[40px] shadow-2xl border border-white/10">
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <div className="flex-1 relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-accent" size={20} />
                <input 
                  type="text" 
                  placeholder="Seu telefone (DDD) 9XXXX-XXXX"
                  className="w-full bg-dark/40 border border-white/5 rounded-2xl py-5 pl-14 pr-6 focus:ring-2 focus:ring-accent focus:outline-none transition-all font-bold text-lg"
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
                className="bg-accent px-10 py-5 rounded-2xl font-black uppercase text-sm tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-[0_0_15px_rgba(220,20,60,0.3)]"
              >
                Buscar
              </button>
            </div>

            {foundBookings.length > 0 ? (
              <div className="space-y-8">
                {foundBookings.map((b) => (
                  <div key={b.id} className="p-8 bg-dark/60 rounded-[32px] border border-white/10 animate-fade-up shadow-inner">
                    <div className="flex justify-between items-start mb-8">
                      <div>
                        <h4 className="text-xl font-display font-black uppercase italic text-accent tracking-tighter">{b.servico}</h4>
                        <p className="text-sm text-gray-400 font-medium mt-1 uppercase tracking-widest">{b.veiculo} • {b.data} às {b.horario}</p>
                      </div>
                      <span className={`px-4 py-1.5 rounded-full text-[10px] uppercase font-black tracking-widest shadow-lg ${
                        b.status === 'concluido' ? 'bg-green-500' : 'bg-accent'
                      }`}>
                        {b.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="relative pt-8 pb-4">
                      <div className="absolute top-10 left-0 w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className={`h-full bg-accent transition-all duration-1000 shadow-[0_0_10px_#DC143C]`} style={{ width: b.status === 'concluido' ? '100%' : b.status === 'em_andamento' ? '66%' : b.status === 'confirmado' ? '33%' : '5%' }}></div>
                      </div>
                      <div className="relative flex justify-between">
                        {[
                          { label: 'Agendado', key: 'pendente' },
                          { label: 'Confirmado', key: 'confirmado' },
                          { label: 'Progresso', key: 'em_andamento' },
                          { label: 'Concluído', key: 'concluido' }
                        ].map((step, idx) => {
                          const isActive = ['pendente', 'confirmado', 'em_andamento', 'concluido'].indexOf(b.status) >= idx;
                          return (
                            <div key={step.key} className="flex flex-col items-center gap-4">
                              <div className={`w-6 h-6 rounded-full z-10 border-4 transition-all duration-500 ${
                                isActive ? 'bg-accent border-dark scale-125 shadow-[0_0_15px_#DC143C]' : 'bg-dark border-white/10'
                              }`}></div>
                              <span className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${isActive ? 'text-white' : 'text-gray-700'}`}>
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
              <div className="text-center py-12">
                <p className="text-gray-600 font-bold uppercase tracking-widest italic text-sm">Nenhum agendamento encontrado.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Vönix Products */}
      <section id="produtos" className="py-32 bg-gradient-to-b from-transparent via-dark/50 to-transparent">
        <div className="container mx-auto px-4">
          <SectionTitle subtitle="Utilizamos exclusivamente o que há de melhor no mercado mundial.">
            Tecnologia Profissional
          </SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {PRODUCTS.map((prod) => (
              <div key={prod.id} className="group glass overflow-hidden rounded-[32px] transition-all hover:-translate-y-2 border-white/5 hover:border-accent/30 shadow-2xl">
                <div className="h-56 overflow-hidden relative">
                  <img src={prod.image} alt={prod.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100" />
                  {prod.isProfessional && (
                    <div className="absolute top-5 right-5 bg-accent text-[9px] font-black uppercase px-3 py-1.5 rounded-lg shadow-xl tracking-widest">
                      Vönix Tech
                    </div>
                  )}
                </div>
                <div className="p-8">
                  <h3 className="text-xl font-bold mb-3 group-hover:text-accent transition-colors tracking-tight">{prod.name}</h3>
                  <p className="text-xs text-gray-400 font-medium leading-relaxed opacity-80">{prod.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-card/10 to-transparent"></div>
        <div className="container mx-auto px-4 relative z-10">
          <SectionTitle subtitle="Os resultados que desafiam o tempo estarão em breve disponíveis aqui.">
            Transformações
          </SectionTitle>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[1, 2, 3, 4, 5, 6].map((_, i) => (
              <div key={i} className="aspect-square glass rounded-[32px] flex items-center justify-center border border-white/10 group hover:border-accent/40 transition-all duration-500 shadow-xl overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                 <div className="text-center px-4 relative z-10">
                   <Sparkles className="text-accent mx-auto mb-4 opacity-10 group-hover:opacity-50 group-hover:scale-110 transition-all duration-500" size={40} />
                   <span className="text-[11px] md:text-sm font-black uppercase tracking-[0.4em] text-white/20 group-hover:text-white/40 transition-colors italic">Em breve</span>
                 </div>
              </div>
            ))}
          </div>
          <p className="text-center mt-12 text-xs text-gray-700 uppercase font-black tracking-[0.4em] italic animate-pulse">Inovação e Perfeição</p>
        </div>
      </section>

      {/* Location Section */}
      <section id="localizacao" className="py-32 bg-gradient-to-b from-transparent to-dark">
        <div className="container mx-auto px-4">
          <SectionTitle subtitle="Venha nos visitar em Maracás. Café e paixão automotiva garantidos.">
            Nossa Sede
          </SectionTitle>
          <div className="flex flex-col lg:flex-row gap-12 max-w-6xl mx-auto items-stretch">
            <div className="lg:w-1/3 flex flex-col justify-center">
              <div className="glass p-10 rounded-[40px] space-y-8 shadow-2xl border border-white/10">
                <div className="space-y-6">
                  <div className="flex items-start gap-5">
                    <div className="p-4 bg-accent/10 rounded-2xl text-accent shadow-inner">
                      <MapPin size={26} />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-1 tracking-tight">Endereço</h4>
                      <p className="text-sm text-gray-400 leading-relaxed font-medium">{CONTACT_INFO.address}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-5">
                    <div className="p-4 bg-accent/10 rounded-2xl text-accent shadow-inner">
                      <Clock size={26} />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-1 tracking-tight">Horários</h4>
                      <p className="text-sm text-gray-400 font-medium">Segunda - Sexta: 08h às 18h</p>
                      <p className="text-sm text-gray-400 font-medium">Sábados: 08h às 12h</p>
                    </div>
                  </div>
                </div>
                <a 
                  href={CONTACT_INFO.mapsLink} 
                  target="_blank"
                  className="block w-full text-center py-5 bg-white text-black font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-accent hover:text-white transition-all shadow-xl active:scale-95"
                >
                  Abrir no Google Maps
                </a>
              </div>
            </div>
            <div className="lg:w-2/3 h-[500px] rounded-[48px] overflow-hidden glass p-3 shadow-2xl">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3876.620015501869!2d-40.4398782!3d-13.4409851!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x742277c0f165a25%3A0xcb3252a123f6e9eb!2sR.%20Edson%20Ribeiro%20Almeida%2C%20150%20-%20Marac%C3%A1s%2C%20BA%2C%2045360-000!5e0!3m2!1spt-BR!2sbr!4v1715424840294!5m2!1spt-BR!2sbr" 
                className="w-full h-full rounded-[40px] grayscale opacity-70 contrast-125 brightness-75 hover:grayscale-0 hover:opacity-100 transition-all duration-700"
                style={{ border: 0 }} 
                allowFullScreen={true} 
                loading="lazy" 
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark py-20 border-t border-white/5 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] text-[12rem] font-display font-black pointer-events-none tracking-tighter">
          EXTREME
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl font-display font-black tracking-[0.3em] italic mb-8 uppercase">
            EXTREME<span className="text-accent">STÉTICA</span>
          </h2>
          <div className="flex flex-wrap justify-center gap-8 mb-12 text-xs font-black uppercase tracking-[0.2em] text-gray-500">
            <button onClick={() => scrollToSection('home')} className="hover:text-accent transition-colors">Home</button>
            <button onClick={() => scrollToSection('servicos')} className="hover:text-accent transition-colors">Serviços</button>
            <button onClick={() => scrollToSection('rastreio')} className="hover:text-accent transition-colors">Rastreio</button>
            <button onClick={() => scrollToSection('produtos')} className="hover:text-accent transition-colors">Tecnologia</button>
          </div>
          <p className="text-xs text-gray-700 font-bold uppercase tracking-[0.3em] mb-6">© 2025 Extreme Stética • Todos os direitos reservados.</p>
          <div className="flex flex-col items-center gap-2">
            <p className="text-[10px] text-gray-600 uppercase tracking-widest font-black opacity-60">
              Desenvolvido por
            </p>
            <a 
              href="https://www.instagram.com/onzy.company/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-accent hover:text-white transition-all text-[11px] font-black uppercase tracking-[0.4em] border-b border-transparent hover:border-accent pb-0.5"
            >
              Onzy Company
            </a>
          </div>
        </div>
      </footer>

      {/* Booking Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
          <div className="absolute inset-0 bg-dark/95 backdrop-blur-3xl animate-fade-in" onClick={() => setActiveModal(null)}></div>
          <div className="relative w-full max-w-2xl bg-card rounded-[48px] overflow-hidden border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.8)] animate-fade-up max-h-[90vh] flex flex-col">
            <div className="bg-accent px-10 py-8 flex justify-between items-center shadow-lg relative z-10">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60 mb-1 block italic">Reserva Online</span>
                <h3 className="text-2xl font-display font-black uppercase italic tracking-tight">{activeModal.name}</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="p-3 bg-black/20 hover:bg-black/40 rounded-2xl text-white transition-colors shadow-inner">
                <X size={26} />
              </button>
            </div>

            <form onSubmit={handleBookingSubmit} className="p-10 space-y-8 overflow-y-auto custom-scrollbar flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 ml-1 italic">Data Desejada</label>
                  <input 
                    type="date" 
                    min={format(startOfToday(), 'yyyy-MM-dd')}
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full bg-dark/50 border border-white/5 p-5 rounded-2xl focus:ring-2 focus:ring-accent transition-all font-bold text-white outline-none shadow-inner"
                    required
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 ml-1 italic">Horário</label>
                  <select 
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="w-full bg-dark/50 border border-white/5 p-5 rounded-2xl focus:ring-2 focus:ring-accent transition-all appearance-none font-bold text-white outline-none shadow-inner"
                    required
                  >
                    <option value="">Selecione...</option>
                    {(isSaturday(parseISO(formDate)) ? WORKING_HOURS.saturday : WORKING_HOURS.weekday).map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 ml-1 italic">Seu Nome Completo</label>
                <input 
                  type="text" 
                  placeholder="Ex: João da Silva"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-dark/50 border border-white/5 p-5 rounded-2xl focus:ring-2 focus:ring-accent transition-all font-bold text-white outline-none shadow-inner"
                  required
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 ml-1 italic">WhatsApp para Contato</label>
                <input 
                  type="tel" 
                  placeholder="(73) 9 8817-6142"
                  value={formPhone}
                  onChange={(e) => setFormPhone(formatPhone(e.target.value))}
                  className="w-full bg-dark/50 border border-white/5 p-5 rounded-2xl focus:ring-2 focus:ring-accent transition-all font-bold text-white outline-none shadow-inner"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 ml-1 italic">Modelo do Veículo</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Hilux 2024"
                    value={formVehicle}
                    onChange={(e) => setFormVehicle(e.target.value)}
                    className="w-full bg-dark/50 border border-white/5 p-5 rounded-2xl focus:ring-2 focus:ring-accent transition-all font-bold text-white outline-none shadow-inner"
                    required
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 ml-1 italic">Cor</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Branco Pérola"
                    value={formColor}
                    onChange={(e) => setFormColor(e.target.value)}
                    className="w-full bg-dark/50 border border-white/5 p-5 rounded-2xl focus:ring-2 focus:ring-accent transition-all font-bold text-white outline-none shadow-inner"
                    required
                  />
                </div>
              </div>

              <div className="space-y-3 pb-4">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 ml-1 italic">Observações</label>
                <textarea 
                  rows={2}
                  placeholder="Algum detalhe específico?"
                  value={formObs}
                  onChange={(e) => setFormObs(e.target.value)}
                  className="w-full bg-dark/50 border border-white/5 p-5 rounded-2xl focus:ring-2 focus:ring-accent transition-all resize-none font-bold text-white outline-none shadow-inner"
                ></textarea>
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full py-6 bg-accent text-white font-black uppercase tracking-[0.3em] text-sm rounded-[24px] hover:brightness-110 active:scale-95 transition-all shadow-2xl flex items-center justify-center gap-4 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    Confirmar Reserva
                    <CheckCircle size={22} />
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
