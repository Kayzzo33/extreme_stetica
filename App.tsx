
import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { 
  Calendar, Clock, Car, MapPin, Phone, Instagram, Shield, Sparkles, 
  Droplets, Zap, ShieldCheck, Gem, Sun, Layers, Star, UserCheck, 
  Cpu, X, ChevronRight, CheckCircle, AlertCircle, Info, Play
} from 'lucide-react';
import { format, isSaturday } from 'date-fns';
import { doc, getDoc, updateDoc, increment, setDoc, addDoc, collection } from "firebase/firestore";
import { db } from './firebaseConfig';
import { SERVICES, PRODUCTS as DEFAULT_PRODUCTS, WORKING_HOURS, CONTACT_INFO, REELS as DEFAULT_REELS, HERO_VIDEO as DEFAULT_HERO_VIDEO, HERO_VIDEO_MOBILE as DEFAULT_HERO_VIDEO_MOBILE, DEFAULT_HERO_OPACITY, DEFAULT_HERO_BLUR } from './constants';
import { Service, Booking, Product } from './types';
import Admin from './Admin';

// --- Components ---

const LazySection = ({ children, id, className = "" }: { children: React.ReactNode, id?: string, className?: string }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} id={id} className={`min-h-[100px] ${className}`}>
      {isVisible ? children : <div className="h-20 w-full flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin"></div></div>}
    </div>
  );
};

const SectionTitle = ({ children, subtitle }: { children?: React.ReactNode, subtitle?: string }) => (
  <div className="mb-12 text-center px-4 relative z-10">
    <h2 className="text-3xl md:text-5xl font-display font-black uppercase tracking-tighter mb-4 italic text-white">
      {children}
    </h2>
    {subtitle && <p className="text-gray-500 max-w-lg mx-auto text-sm font-medium tracking-wide">{subtitle}</p>}
    <div className="w-16 h-1 bg-accent mx-auto mt-6 rounded-full shadow-[0_0_20px_#DC143C]"></div>
  </div>
);

const Toast = ({ message, type = 'success', onClose }: { message: string, type?: 'success' | 'error', onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-xl glass border-l-4 ${type === 'success' ? 'border-green-500' : 'border-red-500'} flex items-center gap-3 animate-fade-up shadow-2xl w-max max-w-[90vw]`}>
      {type === 'success' ? <CheckCircle className="text-green-500 shrink-0" /> : <AlertCircle className="text-red-500 shrink-0" />}
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
};

interface ReelCardProps {
  url: string;
  index: number;
  playingIndex: number | null;
  setPlayingIndex: React.Dispatch<React.SetStateAction<number | null>>;
}

const ReelCard: React.FC<ReelCardProps> = ({ url, index, playingIndex, setPlayingIndex }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isPlaying = playingIndex === index;
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Lazy Load Logic for individual reels
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(e => console.error("Error playing:", e));
      } else {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }
  }, [isPlaying]);

  const togglePlay = () => {
    if (isPlaying) {
      setPlayingIndex(null);
    } else {
      setPlayingIndex(index);
    }
  };

  return (
    <div ref={containerRef} className="aspect-[9/16] relative rounded-2xl overflow-hidden glass border border-white/5 group shadow-lg">
      {isVisible ? (
        <video
          ref={videoRef}
          src={url}
          className="w-full h-full object-cover"
          loop
          playsInline
          controls={isPlaying} 
          preload="metadata"
        />
      ) : (
        <div className="w-full h-full bg-gray-900 animate-pulse"></div>
      )}
      
      {!isPlaying && isVisible && (
        <div 
          className="absolute inset-0 z-10 flex items-center justify-center cursor-pointer play-overlay"
          onClick={togglePlay}
        >
          <div className="w-16 h-16 rounded-full bg-accent/90 flex items-center justify-center shadow-[0_0_30px_#DC143C] group-hover:scale-110 transition-transform">
            <Play className="text-white fill-current ml-1" size={32} />
          </div>
          <div className="absolute bottom-4 left-0 right-0 text-center">
            <span className="text-[10px] uppercase font-black tracking-widest text-white/80">Assistir</span>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Helper ---
const parseDate = (dateString: string) => {
  if (!dateString) return new Date();
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

// --- Main Page Logic ---

function MainLanding() {
  const [activeModal, setActiveModal] = useState<Service | null>(null);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [playingReel, setPlayingReel] = useState<number | null>(null);
  
  // Data from CMS
  const [reels, setReels] = useState<string[]>(DEFAULT_REELS);
  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [heroVideo, setHeroVideo] = useState<string>(DEFAULT_HERO_VIDEO);
  const [heroVideoMobile, setHeroVideoMobile] = useState<string>(DEFAULT_HERO_VIDEO_MOBILE);
  const [heroOpacity, setHeroOpacity] = useState<number>(DEFAULT_HERO_OPACITY);
  const [heroBlur, setHeroBlur] = useState<number>(DEFAULT_HERO_BLUR);

  // Booking Form State
  const [formDate, setFormDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [formTime, setFormTime] = useState('');
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formVehicle, setFormVehicle] = useState('');
  const [formColor, setFormColor] = useState('');
  const [formObs, setFormObs] = useState('');

  // Fetch CMS Data and Log Visit
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Log Visit
        const analyticsRef = doc(db, "analytics", "stats");
        try {
          await updateDoc(analyticsRef, { visits: increment(1) });
        } catch (e) {
          // If doc doesn't exist yet
          await setDoc(analyticsRef, { visits: 1 }, { merge: true });
        }

        // Fetch Content
        const contentRef = doc(db, "site_content", "main");
        const docSnap = await getDoc(contentRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.reels) setReels(data.reels);
          if (data.products) setProducts(data.products);
          if (data.heroVideo) setHeroVideo(data.heroVideo);
          if (data.heroVideoMobile) setHeroVideoMobile(data.heroVideoMobile);
          if (data.heroOpacity !== undefined) setHeroOpacity(data.heroOpacity);
          if (data.heroBlur !== undefined) setHeroBlur(data.heroBlur);
        }
      } catch (error) {
        console.log("Using default data (offline or config issue)");
      }
    };
    fetchData();
  }, []);

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

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTime || !formName || !formPhone || !formVehicle) {
      setToast({ message: 'Preencha todos os campos obrigatórios!', type: 'error' });
      return;
    }

    setIsLoading(true);

    const newBooking: Booking = {
      id: Date.now(),
      servico: activeModal!.name,
      data: format(parseDate(formDate), 'dd/MM/yyyy'),
      horario: formTime,
      nome: formName,
      telefone: formPhone,
      veiculo: formVehicle,
      cor: formColor,
      obs: formObs || 'Nenhuma',
      status: 'pendente'
    };

    try {
      // 1. Save to Database for Admin View
      await addDoc(collection(db, "bookings"), {
        ...newBooking,
        createdAt: new Date().toISOString()
      });

      // 2. Redirect to WhatsApp
      setTimeout(() => {
        setIsLoading(false);
        setToast({ message: 'Agendamento registrado! Redirecionando para o WhatsApp...', type: 'success' });
        
        const message = `Olá, EXTREME STÉTICA! 🚗\nGostaria de agendar o serviço:\n📋 Serviço: ${newBooking.servico}\n📅 Data: ${newBooking.data}\n🕐 Horário: ${newBooking.horario}\n👤 Cliente:\nNome: ${newBooking.nome}\nTelefone: ${newBooking.telefone}\nVeículo: ${newBooking.veiculo} - ${newBooking.cor}\n💬 Observações: ${newBooking.obs}\nAguardo confirmação!`;

        const encoded = encodeURIComponent(message);
        window.open(`https://wa.me/5573988176142?text=${encoded}`, '_blank');
        
        setActiveModal(null);
        resetForm();
      }, 1500);
      
    } catch (error) {
      console.error("Error saving booking:", error);
      setIsLoading(false);
      setToast({ message: 'Erro ao salvar. Tente novamente ou chame no WhatsApp.', type: 'error' });
    }
  };

  const resetForm = () => {
    setFormDate(format(new Date(), 'yyyy-MM-dd'));
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
      <div className="fixed inset-0 z-0 bg-animated opacity-20 pointer-events-none"></div>
      
      {/* Emergency Button - Fixed TOP Right */}
      <a 
        href={`https://wa.me/5573988176142?text=${encodeURIComponent('🚨 ATENDIMENTO URGENTE!\nPreciso de um serviço com prioridade.\nAguardo retorno imediato.')}`}
        target="_blank"
        className="fixed top-4 right-4 z-[90] group"
      >
        <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-accent text-white font-bold shadow-[0_0_25px_#DC143C] animate-pulse-fast hover:scale-105 transition-transform text-xs">
          <span className="md:hidden font-black tracking-wider">SOS</span>
          <span className="hidden md:inline">Atendimento Urgente</span>
          <AlertCircle size={16} />
        </div>
      </a>

      {/* WhatsApp Fixed Button - Bottom Right */}
      <a 
        href={`https://wa.me/5573988176142`}
        target="_blank"
        className="fixed bottom-6 right-6 z-[90] p-4 rounded-full bg-[#25D366] text-white shadow-xl hover:scale-110 transition-transform md:p-5"
      >
        <Phone size={24} />
      </a>

      {/* Hero Section */}
      <section id="home" className="relative h-[100dvh] w-full flex flex-col items-center justify-center px-4 overflow-hidden">
        
        {/* PARALLAX VIDEO BACKGROUND - Render Both, Toggle via CSS */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-black">
           {/* Mobile Video - Only shows on small screens */}
           <video 
              autoPlay 
              loop 
              muted 
              playsInline 
              poster={CONTACT_INFO.facadeImage} // Fallback image while loading
              className="absolute inset-0 w-full h-full object-cover block md:hidden"
              src={heroVideoMobile}
              style={{ filter: `blur(${heroBlur}px)` }} 
            />
            {/* Desktop Video - Only shows on medium+ screens */}
            <video 
              autoPlay 
              loop 
              muted 
              playsInline 
              poster={CONTACT_INFO.facadeImage}
              className="absolute inset-0 w-full h-full object-cover hidden md:block"
              src={heroVideo}
              style={{ filter: `blur(${heroBlur}px)` }}
            />
           {/* Dynamic Dark Overlay */}
           <div className="absolute inset-0 z-10 bg-black transition-opacity duration-300" style={{ opacity: heroOpacity }}></div>
           
           {/* Constant Gradient for Readability */}
           <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-dark/90 z-10"></div>
        </div>
        
        {/* Main Content - Layout Optimized for Mobile */}
        <div className="relative z-20 text-center animate-fade-up w-full max-w-5xl mx-auto flex flex-col items-center justify-center h-full md:pb-0">
          
          <img 
            src="https://res.cloudinary.com/dhtmv1kxb/image/upload/v1770597135/Design_sem_nome_55_jw0ktv.png" 
            alt="Extreme Stética Logo"
            // Adjusted size for mobile (w-60) and margins (mb-4) to fit everything
            className="w-60 md:w-[500px] h-auto mb-4 md:mb-10 drop-shadow-[0_0_30px_rgba(220,20,60,0.3)] mt-[-40px] md:mt-0"
          />
          
          <p className="text-sm md:text-2xl text-gray-200 font-light mb-6 md:mb-12 max-w-2xl mx-auto uppercase tracking-widest text-glow px-2">
            Tecnologia de ponta encontra a <br className="md:hidden" /> <span className="text-white font-bold border-b-2 border-accent">arte automotiva</span>
          </p>

          <div className="flex flex-col w-full px-6 gap-3 md:flex-row md:items-center md:justify-center md:gap-8">
            <button 
              type="button"
              onClick={() => scrollToSection('servicos')}
              className="w-full md:w-auto px-6 py-4 bg-accent rounded-2xl font-bold text-base md:text-xl btn-glow transition-all hover:-translate-y-1 hover:brightness-110 active:scale-95 shadow-2xl"
            >
              Agendar Serviço
            </button>
            <button 
              type="button"
              onClick={() => scrollToSection('localizacao')}
              className="w-full md:w-auto px-6 py-4 glass rounded-2xl font-bold text-base md:text-xl hover:bg-white/10 transition-all active:scale-95 backdrop-blur-md"
            >
              Nossa Sede
            </button>
          </div>
          
          <div className="mt-6 md:mt-12">
            <p className="text-[10px] md:text-sm text-gray-400 font-medium uppercase tracking-[0.4em] opacity-80">
              Maracás - Bahia
            </p>
          </div>
        </div>
        
        <div className="absolute bottom-6 animate-float text-accent/80 z-20">
          <ChevronRight className="rotate-90 w-8 h-8" />
        </div>
      </section>

      {/* Services Section */}
      <LazySection id="servicos" className="relative py-24 md:py-32 z-10 bg-dark/95 backdrop-blur-sm border-t border-white/5">
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
                    <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:bg-accent group-hover:text-white transition-colors duration-300">
                      <IconComp size={28} />
                    </div>
                    <h3 className="text-2xl font-bold mb-3 pr-10 tracking-tight">{service.name}</h3>
                    <p className="text-gray-500 text-sm font-light mb-6 line-clamp-2 leading-relaxed group-hover:text-gray-300 transition-colors">{service.description}</p>
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
      </LazySection>

      {/* REELS SECTION */}
      <LazySection id="reels" className="py-24 md:py-32 relative bg-card/95 z-10 border-t border-white/5">
        <div className="container mx-auto px-4">
          <SectionTitle subtitle="Confira um pouco do nosso trabalho em ação.">
            Nosso Reels
          </SectionTitle>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {reels.map((url, idx) => (
              url ? (
                <ReelCard 
                  key={idx} 
                  url={url} 
                  index={idx}
                  playingIndex={playingReel}
                  setPlayingIndex={setPlayingReel}
                />
              ) : null
            ))}
          </div>
        </div>
      </LazySection>

      {/* Vönix Products */}
      <LazySection id="produtos" className="py-24 md:py-32 relative z-10 bg-dark/95 border-t border-white/5">
        <div className="container mx-auto px-4">
          <SectionTitle subtitle="Utilizamos exclusivamente o que há de melhor no mercado mundial.">
            Tecnologia Profissional
          </SectionTitle>
          
          <div className="text-center mb-12 animate-fade-up">
            <span className="inline-block px-6 py-2 rounded-full border border-accent/30 bg-accent/10 text-accent font-bold uppercase tracking-widest text-xs md:text-sm">
              Trabalhamos com todos os produtos da linha Vonixx
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((prod) => (
              <div key={prod.id} className="group glass overflow-hidden rounded-[32px] transition-all hover:-translate-y-2 border-white/5 hover:border-accent/30 shadow-2xl">
                <div className="h-56 overflow-hidden relative">
                  <img loading="lazy" src={prod.image} alt={prod.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-60 group-hover:opacity-100 grayscale group-hover:grayscale-0" />
                  {prod.isProfessional && (
                    <div className="absolute top-5 right-5 bg-accent text-[9px] font-black uppercase px-3 py-1.5 rounded-lg shadow-xl tracking-widest">
                      Vönix Tech
                    </div>
                  )}
                </div>
                <div className="p-8">
                  <h3 className="text-xl font-bold mb-3 group-hover:text-accent transition-colors tracking-tight">{prod.name}</h3>
                  <p className="text-xs text-gray-500 font-medium leading-relaxed group-hover:text-gray-300 transition-colors">{prod.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </LazySection>

      {/* Gallery Section */}
      <LazySection className="py-24 md:py-32 relative bg-card/95 z-10 border-t border-white/5">
        <div className="container mx-auto px-4 relative z-10">
          <SectionTitle subtitle="Os resultados que desafiam o tempo estarão em breve disponíveis aqui.">
            Transformações
          </SectionTitle>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[1, 2, 3, 4, 5, 6].map((_, i) => (
              <div key={i} className="aspect-square glass rounded-[32px] flex items-center justify-center border border-white/5 group hover:border-accent/20 transition-all duration-500 shadow-xl overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                 <div className="text-center px-4 relative z-10">
                   <Sparkles className="text-accent mx-auto mb-4 opacity-20 group-hover:opacity-60 group-hover:scale-110 transition-all duration-500" size={40} />
                   <span className="text-[11px] md:text-sm font-black uppercase tracking-[0.4em] text-white/10 group-hover:text-white/40 transition-colors italic">Em breve</span>
                 </div>
              </div>
            ))}
          </div>
          <p className="text-center mt-12 text-xs text-gray-800 uppercase font-black tracking-[0.4em] italic animate-pulse">Inovação e Perfeição</p>
        </div>
      </LazySection>

      {/* Location Section */}
      <LazySection id="localizacao" className="py-24 md:py-32 relative z-10 bg-dark/95 border-t border-white/5">
        <div className="container mx-auto px-4">
          <SectionTitle subtitle="Venha nos visitar em Maracás. Café e paixão automotiva garantidos.">
            Nossa Sede
          </SectionTitle>
          <div className="max-w-4xl mx-auto">
            <div className="relative rounded-[40px] overflow-hidden shadow-2xl group border border-white/10 h-[500px] md:h-[600px]">
              <div className="w-full h-full relative">
                <img 
                  loading="lazy"
                  src={CONTACT_INFO.facadeImage} 
                  alt="Fachada Extreme Stética" 
                  className="w-full h-full object-cover object-bottom grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90 group-hover:opacity-60 transition-opacity duration-500"></div>
                
                {/* Overlay Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10 pointer-events-none">
                  <div className="mb-6 animate-fade-up">
                    <MapPin className="w-12 h-12 text-accent mx-auto mb-4 drop-shadow-[0_0_10px_rgba(220,20,60,0.5)]" />
                    <h3 className="text-3xl font-display font-black uppercase italic mb-2">{CONTACT_INFO.address}</h3>
                    <p className="text-gray-300 font-medium tracking-widest text-sm">MARACÁS - BAHIA</p>
                  </div>
                  
                  <a 
                    href={CONTACT_INFO.mapsLink} 
                    target="_blank"
                    className="pointer-events-auto px-10 py-5 bg-accent hover:bg-accent/90 text-white font-black uppercase tracking-widest text-sm rounded-2xl shadow-[0_0_30px_rgba(220,20,60,0.4)] hover:shadow-[0_0_50px_rgba(220,20,60,0.6)] hover:scale-105 transition-all duration-300 flex items-center gap-3 group/btn"
                  >
                    Ver no Google Maps
                    <ChevronRight className="group-hover/btn:translate-x-1 transition-transform" />
                  </a>
                </div>
              </div>

              {/* Info Bar */}
              <div className="absolute bottom-0 left-0 right-0 bg-dark/90 backdrop-blur-xl border-t border-white/10 p-8 grid grid-cols-1 md:grid-cols-2 gap-8 z-20">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/5 rounded-xl text-gray-400">
                    <Clock size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-white uppercase tracking-wider text-sm mb-1">Funcionamento</h4>
                    <p className="text-xs text-gray-500 font-medium">Seg - Sex: 08h às 18h • Sáb: 08h às 12h</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/5 rounded-xl text-gray-400">
                    <Instagram size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-white uppercase tracking-wider text-sm mb-1">Acompanhe</h4>
                    <p className="text-xs text-gray-500 font-medium">{CONTACT_INFO.instagram}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </LazySection>

      {/* Footer */}
      <footer className="bg-black py-20 border-t border-white/5 relative overflow-hidden z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] text-[12rem] font-display font-black pointer-events-none tracking-tighter">
          EXTREME
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl font-display font-black tracking-[0.3em] italic mb-8 uppercase">
            EXTREME<span className="text-accent">STÉTICA</span>
          </h2>
          <div className="flex flex-wrap justify-center gap-8 mb-12 text-xs font-black uppercase tracking-[0.2em] text-gray-600">
            <button onClick={() => scrollToSection('home')} className="hover:text-accent transition-colors">Home</button>
            <button onClick={() => scrollToSection('servicos')} className="hover:text-accent transition-colors">Serviços</button>
            <button onClick={() => scrollToSection('reels')} className="hover:text-accent transition-colors">Reels</button>
            <button onClick={() => scrollToSection('produtos')} className="hover:text-accent transition-colors">Tecnologia</button>
            <button onClick={() => scrollToSection('localizacao')} className="hover:text-accent transition-colors">Local</button>
          </div>
          <p className="text-xs text-gray-800 font-bold uppercase tracking-[0.3em] mb-6">© 2025 Extreme Stética • Todos os direitos reservados.</p>
          <div className="flex flex-col items-center gap-2">
            <p className="text-[10px] text-gray-700 uppercase tracking-widest font-black opacity-60">
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
          <div className="absolute inset-0 bg-black/95 backdrop-blur-3xl animate-fade-in" onClick={() => setActiveModal(null)}></div>
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
                    min={format(new Date(), 'yyyy-MM-dd')}
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
                    {(isSaturday(parseDate(formDate)) ? WORKING_HOURS.saturday : WORKING_HOURS.weekday).map(h => (
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

// Router Wrapper
export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLanding />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  );
}
