
import React, { useState, useEffect } from 'react';
import { auth, db } from './firebaseConfig';
import { collection, addDoc, query, orderBy, onSnapshot, doc, setDoc, getDoc, updateDoc, increment } from "firebase/firestore";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Lock, DollarSign, LogOut, Save, Trash2, Plus, Eye, BarChart3, Image as ImageIcon, Video, MonitorPlay, CalendarDays, Smartphone, Settings } from 'lucide-react';
import { REELS, PRODUCTS, HERO_VIDEO, HERO_VIDEO_MOBILE, DEFAULT_HERO_OPACITY, DEFAULT_HERO_BLUR } from './constants';

export default function Admin() {
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'bookings' | 'finance' | 'cms'>('dashboard');

  // Finance State
  const [transactions, setTransactions] = useState<any[]>([]);
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('income');

  // Bookings State
  const [bookings, setBookings] = useState<any[]>([]);

  // CMS State
  const [cmsReels, setCmsReels] = useState<string[]>([]);
  const [cmsProducts, setCmsProducts] = useState<any[]>([]);
  const [cmsHeroVideo, setCmsHeroVideo] = useState('');
  const [cmsHeroVideoMobile, setCmsHeroVideoMobile] = useState('');
  const [cmsHeroOpacity, setCmsHeroOpacity] = useState(DEFAULT_HERO_OPACITY);
  const [cmsHeroBlur, setCmsHeroBlur] = useState(DEFAULT_HERO_BLUR);
  const [visits, setVisits] = useState(0);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
      if (u) {
        loadData();
      }
    });
    return () => unsubscribe();
  }, []);

  const loadData = () => {
    // Load Transactions
    const q = query(collection(db, "financials"), orderBy("createdAt", "desc"));
    onSnapshot(q, (snapshot) => {
      setTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Load Bookings
    const bookingsQuery = query(collection(db, "bookings"), orderBy("createdAt", "desc"));
    onSnapshot(bookingsQuery, (snapshot) => {
      setBookings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Load CMS Data
    const contentRef = doc(db, "site_content", "main");
    onSnapshot(contentRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setCmsReels(data.reels || REELS);
        setCmsProducts(data.products || PRODUCTS);
        setCmsHeroVideo(data.heroVideo || HERO_VIDEO);
        setCmsHeroVideoMobile(data.heroVideoMobile || HERO_VIDEO_MOBILE);
        setCmsHeroOpacity(data.heroOpacity !== undefined ? data.heroOpacity : DEFAULT_HERO_OPACITY);
        setCmsHeroBlur(data.heroBlur !== undefined ? data.heroBlur : DEFAULT_HERO_BLUR);
      } else {
        // Initialize if not exists
        const initialData = { 
          reels: REELS, 
          products: PRODUCTS, 
          heroVideo: HERO_VIDEO,
          heroVideoMobile: HERO_VIDEO_MOBILE,
          heroOpacity: DEFAULT_HERO_OPACITY,
          heroBlur: DEFAULT_HERO_BLUR
        };
        setDoc(contentRef, initialData);
        setCmsReels(REELS);
        setCmsProducts(PRODUCTS);
        setCmsHeroVideo(HERO_VIDEO);
        setCmsHeroVideoMobile(HERO_VIDEO_MOBILE);
        setCmsHeroOpacity(DEFAULT_HERO_OPACITY);
        setCmsHeroBlur(DEFAULT_HERO_BLUR);
      }
    });

    // Load Analytics
    const analyticsRef = doc(db, "analytics", "stats");
    onSnapshot(analyticsRef, (docSnap) => {
      if (docSnap.exists()) {
        setVisits(docSnap.data().visits || 0);
      }
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await auth.signInWithEmailAndPassword(email, password);
    } catch (error) {
      alert("Erro ao logar. Verifique suas credenciais.");
    }
  };

  const handleLogout = () => auth.signOut();

  const addTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc || !amount) return;
    await addDoc(collection(db, "financials"), {
      description: desc,
      amount: parseFloat(amount),
      type,
      createdAt: new Date().toISOString()
    });
    setDesc('');
    setAmount('');
  };

  const saveCMS = async () => {
    const contentRef = doc(db, "site_content", "main");
    await updateDoc(contentRef, {
      reels: cmsReels,
      products: cmsProducts,
      heroVideo: cmsHeroVideo,
      heroVideoMobile: cmsHeroVideoMobile,
      heroOpacity: cmsHeroOpacity,
      heroBlur: cmsHeroBlur
    });
    alert("Conteúdo atualizado no site!");
  };

  // Calculations
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const balance = totalIncome - totalExpense;

  const chartData = [
    { name: 'Entradas', value: totalIncome },
    { name: 'Saídas', value: totalExpense },
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="bg-card border border-white/10 p-8 rounded-2xl w-full max-w-md">
          <div className="flex justify-center mb-6">
            <Lock className="text-accent w-12 h-12" />
          </div>
          <h2 className="text-2xl font-bold text-center text-white mb-6">Painel Administrativo</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              className="w-full bg-dark border border-white/20 p-3 rounded-lg text-white"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Senha"
              className="w-full bg-dark border border-white/20 p-3 rounded-lg text-white"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <button type="submit" className="w-full bg-accent text-white py-3 rounded-lg font-bold hover:bg-accent/80 transition">
              Entrar
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-card border-r border-white/5 p-6 flex flex-col">
        <h1 className="text-xl font-bold text-accent mb-8 italic">EXTREME ADMIN</h1>
        <nav className="space-y-2 flex-1">
          <button 
            onClick={() => setActiveTab('dashboard')} 
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition ${activeTab === 'dashboard' ? 'bg-accent text-white' : 'hover:bg-white/5 text-gray-400'}`}
          >
            <BarChart3 size={20} /> Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('bookings')} 
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition ${activeTab === 'bookings' ? 'bg-accent text-white' : 'hover:bg-white/5 text-gray-400'}`}
          >
            <CalendarDays size={20} /> Agendamentos
          </button>
          <button 
            onClick={() => setActiveTab('finance')} 
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition ${activeTab === 'finance' ? 'bg-accent text-white' : 'hover:bg-white/5 text-gray-400'}`}
          >
            <DollarSign size={20} /> Financeiro
          </button>
          <button 
            onClick={() => setActiveTab('cms')} 
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition ${activeTab === 'cms' ? 'bg-accent text-white' : 'hover:bg-white/5 text-gray-400'}`}
          >
            <Video size={20} /> Conteúdo Site
          </button>
        </nav>
        <button onClick={handleLogout} className="flex items-center gap-3 p-3 text-red-500 hover:bg-red-500/10 rounded-lg mt-auto">
          <LogOut size={20} /> Sair
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fade-up">
            <h2 className="text-3xl font-bold mb-6">Visão Geral</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-card p-6 rounded-2xl border border-white/5">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-400">Total Visitas</span>
                  <Eye className="text-accent" />
                </div>
                <p className="text-4xl font-bold">{visits}</p>
              </div>
              <div className="bg-card p-6 rounded-2xl border border-white/5">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-400">Agendamentos</span>
                  <CalendarDays className="text-blue-500" />
                </div>
                <p className="text-4xl font-bold">{bookings.length}</p>
              </div>
              <div className="bg-card p-6 rounded-2xl border border-white/5">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-400">Saldo Caixa</span>
                  <DollarSign className="text-green-500" />
                </div>
                <p className={`text-4xl font-bold ${balance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  R$ {balance.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="bg-card p-6 rounded-2xl border border-white/5 h-[400px]">
              <h3 className="text-xl font-bold mb-6">Movimentação Financeira</h3>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="name" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="value">
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#10B981' : '#EF4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
           <div className="space-y-6 animate-fade-up">
             <h2 className="text-3xl font-bold mb-6">Agendamentos Recebidos</h2>
             <div className="bg-card rounded-2xl border border-white/5 overflow-hidden">
               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                   <thead className="bg-white/5 text-gray-400">
                     <tr>
                       <th className="p-4 whitespace-nowrap">Data/Hora</th>
                       <th className="p-4">Cliente</th>
                       <th className="p-4">Contato</th>
                       <th className="p-4">Veículo</th>
                       <th className="p-4">Serviço</th>
                       <th className="p-4">Obs</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-white/5">
                     {bookings.map(b => (
                       <tr key={b.id} className="hover:bg-white/5 transition">
                         <td className="p-4 text-sm text-gray-400 whitespace-nowrap">
                           {b.data} <br/> 
                           <span className="text-accent font-bold">{b.horario}</span>
                         </td>
                         <td className="p-4 font-medium">{b.nome}</td>
                         <td className="p-4 text-sm">{b.telefone}</td>
                         <td className="p-4 text-sm">{b.veiculo} - {b.cor}</td>
                         <td className="p-4 font-bold text-accent">{b.servico}</td>
                         <td className="p-4 text-sm text-gray-500 italic max-w-xs truncate">{b.obs}</td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
               {bookings.length === 0 && (
                 <div className="p-8 text-center text-gray-500 italic">Nenhum agendamento registrado ainda.</div>
               )}
             </div>
           </div>
        )}

        {activeTab === 'finance' && (
          <div className="space-y-6 animate-fade-up">
            <h2 className="text-3xl font-bold mb-6">Controle Financeiro</h2>
            
            <div className="bg-card p-6 rounded-2xl border border-white/5">
              <h3 className="text-xl font-bold mb-4">Novo Lançamento</h3>
              <form onSubmit={addTransaction} className="flex flex-col md:flex-row gap-4">
                <input 
                  type="text" 
                  placeholder="Descrição (ex: Polimento Honda Civic)" 
                  className="flex-1 bg-dark border border-white/10 p-3 rounded-lg text-white"
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                />
                <input 
                  type="number" 
                  placeholder="Valor (R$)" 
                  className="w-full md:w-32 bg-dark border border-white/10 p-3 rounded-lg text-white"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                />
                <select 
                  className="bg-dark border border-white/10 p-3 rounded-lg text-white"
                  value={type}
                  onChange={(e: any) => setType(e.target.value)}
                >
                  <option value="income">Entrada</option>
                  <option value="expense">Saída</option>
                </select>
                <button type="submit" className="bg-accent text-white px-6 py-3 rounded-lg font-bold hover:bg-accent/80 flex items-center gap-2">
                  <Plus size={20} /> Adicionar
                </button>
              </form>
            </div>

            <div className="bg-card rounded-2xl border border-white/5 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-white/5 text-gray-400">
                  <tr>
                    <th className="p-4">Data</th>
                    <th className="p-4">Descrição</th>
                    <th className="p-4">Tipo</th>
                    <th className="p-4 text-right">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {transactions.map(t => (
                    <tr key={t.id} className="hover:bg-white/5 transition">
                      <td className="p-4 text-sm text-gray-400">{new Date(t.createdAt).toLocaleDateString()}</td>
                      <td className="p-4 font-medium">{t.description}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${t.type === 'income' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                          {t.type === 'income' ? 'Entrada' : 'Saída'}
                        </span>
                      </td>
                      <td className={`p-4 text-right font-bold ${t.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                        {t.type === 'expense' && '- '}R$ {t.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {transactions.length === 0 && (
                <div className="p-8 text-center text-gray-500 italic">Nenhum lançamento registrado.</div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'cms' && (
          <div className="space-y-8 animate-fade-up">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold">Gerenciar Conteúdo do Site</h2>
              <button onClick={saveCMS} className="bg-accent text-white px-6 py-3 rounded-lg font-bold hover:bg-accent/80 flex items-center gap-2 shadow-[0_0_15px_#DC143C]">
                <Save size={20} /> Salvar Alterações
              </button>
            </div>
            
            {/* HERO VIDEO EDIT */}
            <div className="grid grid-cols-1 gap-6">
              <div className="bg-card p-6 rounded-2xl border border-white/5 border-l-4 border-l-accent grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <MonitorPlay className="text-accent" /> Vídeo Desktop (Horizontal)
                  </h3>
                  <input 
                    type="text" 
                    className="w-full bg-dark border border-white/10 p-3 rounded-lg text-white text-sm"
                    placeholder="https://..."
                    value={cmsHeroVideo}
                    onChange={(e) => setCmsHeroVideo(e.target.value)}
                  />
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Smartphone className="text-accent" /> Vídeo Mobile (Vertical)
                  </h3>
                  <input 
                    type="text" 
                    className="w-full bg-dark border border-white/10 p-3 rounded-lg text-white text-sm"
                    placeholder="https://..."
                    value={cmsHeroVideoMobile}
                    onChange={(e) => setCmsHeroVideoMobile(e.target.value)}
                  />
                </div>
              </div>

              {/* VIDEO SETTINGS (BLUR & OPACITY) */}
              <div className="bg-card p-6 rounded-2xl border border-white/5 grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div>
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Settings className="text-accent" /> Ajustes Visuais do Vídeo
                    </h3>
                    <p className="text-sm text-gray-500 mb-6">Controle a qualidade e a escuridão do vídeo de fundo em tempo real.</p>
                 </div>
                 <div className="space-y-6">
                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-sm font-bold text-gray-300">Escuridão (Overlay)</label>
                        <span className="text-sm text-accent font-bold">{Math.round(cmsHeroOpacity * 100)}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="1" 
                        step="0.05"
                        value={cmsHeroOpacity}
                        onChange={(e) => setCmsHeroOpacity(parseFloat(e.target.value))}
                        className="w-full accent-accent h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                      />
                      <p className="text-xs text-gray-600 mt-1">Quanto maior, mais escuro o vídeo fica para ler o texto.</p>
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-sm font-bold text-gray-300">Desfoque (Blur)</label>
                        <span className="text-sm text-accent font-bold">{cmsHeroBlur}px</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="10" 
                        step="0.5"
                        value={cmsHeroBlur}
                        onChange={(e) => setCmsHeroBlur(parseFloat(e.target.value))}
                        className="w-full accent-accent h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                      />
                      <p className="text-xs text-gray-600 mt-1">0px = Vídeo Nítido. Aumente se quiser desfocar o fundo.</p>
                    </div>
                 </div>
              </div>
            </div>

            <div className="bg-card p-6 rounded-2xl border border-white/5">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Video className="text-accent" /> Links dos Reels
              </h3>
              <div className="space-y-3">
                {cmsReels.map((url, idx) => (
                  <div key={idx} className="flex gap-2">
                    <span className="bg-white/10 p-3 rounded text-gray-400 w-8 text-center">{idx + 1}</span>
                    <input 
                      type="text" 
                      className="flex-1 bg-dark border border-white/10 p-3 rounded-lg text-white text-sm"
                      value={url}
                      onChange={(e) => {
                        const newReels = [...cmsReels];
                        newReels[idx] = e.target.value;
                        setCmsReels(newReels);
                      }}
                    />
                    <button 
                      onClick={() => {
                        const newReels = cmsReels.filter((_, i) => i !== idx);
                        setCmsReels(newReels);
                      }}
                      className="p-3 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/40"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
                <button 
                  onClick={() => setCmsReels([...cmsReels, ""])}
                  className="w-full py-2 border border-dashed border-white/20 text-gray-400 rounded-lg hover:border-accent hover:text-accent transition"
                >
                  + Adicionar Novo Vídeo
                </button>
              </div>
            </div>

            <div className="bg-card p-6 rounded-2xl border border-white/5">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <ImageIcon className="text-accent" /> Produtos (Tecnologia Profissional)
              </h3>
              <div className="space-y-6">
                {cmsProducts.map((prod, idx) => (
                  <div key={idx} className="bg-dark/50 p-4 rounded-xl border border-white/5 space-y-3">
                    <div className="flex justify-between">
                      <span className="font-bold text-gray-400">Produto {idx + 1}</span>
                      <button 
                        onClick={() => {
                          const newProds = cmsProducts.filter((_, i) => i !== idx);
                          setCmsProducts(newProds);
                        }}
                        className="text-red-500 hover:text-red-400 text-xs uppercase font-bold"
                      >
                        Remover
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">Nome</label>
                        <input 
                          type="text" 
                          className="w-full bg-black border border-white/10 p-2 rounded text-sm"
                          value={prod.name}
                          onChange={(e) => {
                            const newProds = [...cmsProducts];
                            newProds[idx].name = e.target.value;
                            setCmsProducts(newProds);
                          }}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">URL Imagem</label>
                        <input 
                          type="text" 
                          className="w-full bg-black border border-white/10 p-2 rounded text-sm"
                          value={prod.image}
                          onChange={(e) => {
                            const newProds = [...cmsProducts];
                            newProds[idx].image = e.target.value;
                            setCmsProducts(newProds);
                          }}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-xs text-gray-500 block mb-1">Descrição</label>
                        <textarea 
                          className="w-full bg-black border border-white/10 p-2 rounded text-sm"
                          rows={2}
                          value={prod.description}
                          onChange={(e) => {
                            const newProds = [...cmsProducts];
                            newProds[idx].description = e.target.value;
                            setCmsProducts(newProds);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
