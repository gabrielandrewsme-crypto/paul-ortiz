'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, 
  Users, 
  Database, 
  Home, 
  AlertCircle, 
  CheckCircle2, 
  Crown,
  Search,
  MessageSquare,
  Clock,
  Calendar,
  XCircle,
  RefreshCw,
  Sparkles,
  TrendingUp,
  DollarSign,
  PieChart,
  Download,
  FileSpreadsheet,
  PlusCircle,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Printer,
  Gift,
  ToggleLeft,
  ToggleRight,
  Activity,
  CreditCard,
  Zap,
  Check,
  X
} from 'lucide-react';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'MANAGER' | 'ADMIN';
  streakDays: number;
  currentCheckpoint: number;
  totalWordsLearned: number;
  plan: 'FREE' | 'PLUS' | 'PREMIUM' | 'LIFETIME' | 'MONTHLY' | 'SEMIANNUAL';
  isSubscribed: boolean;
  isComplimentary: boolean;
  subscriptionStartDate: string | null;
  subscriptionEndDate: string | null;
  subscriptionStatus: 'NONE' | 'ACTIVE' | 'EXPIRED';
  createdAt: string;
}

interface UserMetrics {
  totalUsers: number;
  totalSubscribers: number;
  paidSubscribers: number;
  complimentarySubscribers: number;
  totalPlus: number;
  totalPremium: number;
  totalLifetime: number;
  grossRevenue: number;
  mrr: number;
  expiringSoonCount: number;
  databaseStatus: string;
}

interface FinancialMetrics {
  totalUsers: number;
  freeUsers: number;
  plusUsers: number;
  premiumUsers: number;
  lifetimeUsers: number;
  totalSubscribers: number;
  paidSubscribers: number;
  complimentarySubscribers: number;
  grossRevenue: number;
  mrr: number;
  arr: number;
  ticketMedio: number;
  conversionRate: number;
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  period: string;
}

interface FinancialTransaction {
  id: string;
  description: string;
  category: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  date: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'accounting' | 'subscribers' | 'dre'>('accounting');
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Gestão de Usuários
  const [userMetrics, setUserMetrics] = useState<UserMetrics | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [expiringSoonUsers, setExpiringSoonUsers] = useState<AdminUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLIMENTARY' | 'PAID' | 'INACTIVE'>('ALL');
  
  // Contabilidade DRE
  const [finMetrics, setFinMetrics] = useState<FinancialMetrics | null>(null);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [periodFilter, setPeriodFilter] = useState<'all' | 'daily' | 'monthly' | 'annual'>('all');
  
  // Novo Lançamento Contábil Modal
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [txDesc, setTxDesc] = useState('');
  const [txCat, setTxCat] = useState('Infraestrutura');
  const [txAmount, setTxAmount] = useState('');
  const [txType, setTxType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [nowTime, setNowTime] = useState<number>(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNowTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchAdminData = async () => {
    try {
      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();

      if (!meData.authenticated || !meData.user) {
        setError('Sessão expirada. Realize login novamente.');
        setLoading(false);
        return;
      }

      setCurrentUser(meData.user);

      if (meData.user.email.toLowerCase().trim() !== 'gabrielandrews.me@gmail.com') {
        setError('Acesso negado. Esta área é restrita exclusivamente ao e-mail administrador Supremo: gabrielandrews.me@gmail.com');
        setLoading(false);
        return;
      }

      // Buscar dados de usuários
      const adminRes = await fetch('/api/admin/users');
      const adminData = await adminRes.json();

      if (!adminRes.ok) {
        setError(adminData.error || 'Erro ao carregar dados do painel.');
      } else {
        setUserMetrics(adminData.metrics);
        setUsers(adminData.users || []);
        setExpiringSoonUsers(adminData.expiringSoonUsers || []);
      }

      // Buscar dados contábeis
      await fetchAccountingData(periodFilter);
    } catch (err) {
      setError('Falha de conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAccountingData = async (period: string) => {
    try {
      const finRes = await fetch(`/api/admin/accounting?period=${period}`);
      const finData = await finRes.json();
      if (finRes.ok) {
        setFinMetrics(finData.metrics);
        setTransactions(finData.transactions || []);
      }
    } catch (err) {
      console.error('Erro contabilidade:', err);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchAccountingData(periodFilter);
    }
  }, [periodFilter]);

  // Ação de toggle Cortesia (Is Complimentary)
  const handleToggleComplimentary = async (user: AdminUser) => {
    setStatusMessage('');
    setActionLoadingId(user.id);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          action: 'toggle_complimentary',
          isComplimentary: !user.isComplimentary,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setStatusMessage(`Erro: ${data.error}`);
      } else {
        setStatusMessage(`✨ Cortesia ${!user.isComplimentary ? 'ATIVADA (R$ 0,00 no faturamento)' : 'DESATIVADA'} para ${user.name}!`);
        await fetchAdminData();
      }
    } catch (err) {
      setStatusMessage('Erro ao atualizar estado de cortesia.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Gerenciamento de Assinatura
  const handleSubscriptionAction = async (userId: string, action: string, daysToAdd?: number) => {
    setStatusMessage('');
    setActionLoadingId(userId);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action, daysToAdd }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatusMessage(`Erro: ${data.error}`);
      } else {
        setStatusMessage(`✨ Assinatura atualizada com sucesso para ${data.user.name}!`);
        await fetchAdminData();
      }
    } catch (err) {
      setStatusMessage('Erro de comunicação com a API de administração.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txDesc || !txAmount) return;

    try {
      const res = await fetch('/api/admin/accounting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: txDesc,
          category: txCat,
          amount: parseFloat(txAmount),
          type: txType,
        }),
      });

      if (res.ok) {
        setStatusMessage('✨ Lançamento financeiro registrado com sucesso!');
        setTxDesc('');
        setTxAmount('');
        setShowAddTransaction(false);
        fetchAccountingData(periodFilter);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Contribuição real do usuário para o caixa
  const getUserContribution = (user: AdminUser): number => {
    if (!user.isSubscribed || user.subscriptionStatus !== 'ACTIVE' || user.isComplimentary || user.plan === 'LIFETIME' || user.email.toLowerCase() === 'gabrielandrews.me@gmail.com') {
      return 0;
    }
    if (user.plan === 'PLUS' || user.plan === 'MONTHLY') return 37.90;
    if (user.plan === 'PREMIUM' || user.plan === 'SEMIANNUAL') return 109.00;
    return 0;
  };

  // Usuários filtrados
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === 'ACTIVE') return u.isSubscribed && u.subscriptionStatus === 'ACTIVE';
    if (statusFilter === 'COMPLIMENTARY') return u.isSubscribed && u.isComplimentary;
    if (statusFilter === 'PAID') return u.isSubscribed && !u.isComplimentary && u.plan !== 'LIFETIME';
    if (statusFilter === 'INACTIVE') return !u.isSubscribed || u.subscriptionStatus !== 'ACTIVE';

    return true;
  });

  const exportCSVUsers = () => {
    const headers = 'ID,Nome,Email,Plano,Status,Cortesia,Data Inicio,Data Fim,Contribuicao R$\n';
    const rows = filteredUsers
      .map(
        (u) =>
          `"${u.id}","${u.name}","${u.email}","${u.plan}","${u.subscriptionStatus}","${u.isComplimentary ? 'Sim' : 'Nao'}","${u.subscriptionStartDate || ''}","${u.subscriptionEndDate || ''}","${getUserContribution(u).toFixed(2)}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio_assinantes_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#071917] text-teal-300 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-teal-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-black tracking-widest uppercase text-teal-400/80">Carregando Painel Executivo...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#071917] text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900/90 border border-rose-500/30 rounded-3xl p-6 text-center space-y-4 shadow-2xl backdrop-blur-xl">
          <AlertCircle size={48} className="text-rose-400 mx-auto" />
          <h2 className="text-xl font-black text-white">Acesso Restrito ao Administrador</h2>
          <p className="text-xs text-slate-300 leading-relaxed">{error}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-500 text-slate-950 font-black text-xs hover:bg-teal-400 transition"
          >
            <Home size={16} />
            <span>Voltar à Plataforma</span>
          </Link>
        </div>
      </div>
    );
  }

  const grossRevenue = finMetrics?.grossRevenue || userMetrics?.grossRevenue || 0;
  const mrr = finMetrics?.mrr || userMetrics?.mrr || 0;
  const totalSubscribers = finMetrics?.totalSubscribers || userMetrics?.totalSubscribers || 0;
  const paidSubscribers = finMetrics?.paidSubscribers || userMetrics?.paidSubscribers || 0;
  const complimentarySubscribers = finMetrics?.complimentarySubscribers || userMetrics?.complimentarySubscribers || 0;

  return (
    <div className="min-h-screen bg-[#061817] text-slate-100 font-sans p-3 sm:p-6 overflow-x-hidden selection:bg-teal-500 selection:text-slate-950">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* TOP BAR / NAVIGATION HEADER */}
        <header className="bg-slate-900/60 border border-teal-500/20 backdrop-blur-xl rounded-3xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xl relative overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-400 via-emerald-500 to-cyan-600 p-0.5 shadow-lg shadow-teal-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-teal-300">
                <Crown size={24} />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide">STREAM Control</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-teal-500/20 text-teal-300 border border-teal-500/40">
                  Painel Executivo
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Controle do Caixa, Receita Recorrente (MRR) & Gestão de Assinantes (Plus / Premium / Cortesia)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap w-full md:w-auto justify-end">
            <Link
              href="/"
              className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 font-bold text-xs flex items-center gap-1.5 border border-slate-700 transition"
            >
              <Home size={15} />
              <span>Voltar ao App</span>
            </Link>
            <button
              onClick={fetchAdminData}
              className="px-3.5 py-2 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 font-extrabold text-xs flex items-center gap-1.5 border border-teal-500/30 transition cursor-pointer"
            >
              <RefreshCw size={15} className="animate-spin-slow" />
              <span>Atualizar Dados</span>
            </button>
          </div>
        </header>

        {/* STATUS TOAST NOTIFICATION */}
        {statusMessage && (
          <div className="bg-teal-500 text-slate-950 font-black px-4 py-3 rounded-2xl shadow-xl flex items-center justify-between gap-3 text-xs sm:text-sm animate-bounce">
            <div className="flex items-center gap-2">
              <Sparkles size={18} />
              <span>{statusMessage}</span>
            </div>
            <button onClick={() => setStatusMessage('')} className="hover:opacity-80">
              <X size={16} />
            </button>
          </div>
        )}

        {/* FINANCIAL BALANCE & WALLET OVERVIEW (INSPIRADO NO DESIGN DE REFERÊNCIA STREAM) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* BALANCE CARD PRINCIPAL */}
          <div className="lg:col-span-7 bg-gradient-to-br from-teal-950/80 via-slate-900/90 to-emerald-950/80 border border-teal-500/30 backdrop-blur-2xl rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-extrabold text-teal-400 uppercase tracking-widest block mb-1">
                  Balance / Faturamento Total em Caixa
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-white tracking-wide">
                  R$ {grossRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Soma dos pagamentos reais efetuados por assinantes ativos (excluindo cortesias)
                </p>
              </div>

              <div className="flex items-center gap-1 bg-slate-900/80 p-1.5 rounded-2xl border border-teal-500/20 text-xs font-bold text-slate-300">
                <span className="px-3 py-1 rounded-xl bg-teal-500 text-slate-950 font-black">BRL</span>
                <span className="px-3 py-1 rounded-xl text-slate-400">USD</span>
              </div>
            </div>

            {/* METRIC CIRCULAR PILLS */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="bg-slate-900/70 border border-teal-500/20 rounded-2xl p-3.5 text-center shadow-inner">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Plano Plus</span>
                <span className="text-lg font-black text-emerald-400">R$ 37,90</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Mensal</span>
              </div>
              <div className="bg-slate-900/70 border border-teal-500/20 rounded-2xl p-3.5 text-center shadow-inner">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Plano Premium</span>
                <span className="text-lg font-black text-sky-400">R$ 109,00</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Semestral</span>
              </div>
              <div className="bg-slate-900/70 border border-amber-500/30 rounded-2xl p-3.5 text-center shadow-inner">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1">Cortesia</span>
                <span className="text-lg font-black text-amber-300">R$ 0,00</span>
                <span className="text-[10px] text-amber-400/80 block mt-0.5">Isento do Caixa</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-teal-500/20 text-xs">
              <div className="flex items-center gap-2 text-slate-300 font-bold">
                <Activity size={16} className="text-teal-400" />
                <span>MRR Estimado (Recorrente): <strong className="text-teal-300 font-black">R$ {mrr.toFixed(2)} / mês</strong></span>
              </div>
              <span className="text-[11px] text-slate-400">
                Premium diluído: R$ 18,17/mês
              </span>
            </div>
          </div>

          {/* FINANCIAL HEALTH & SUBSCRIBERS SUMMARY CARD */}
          <div className="lg:col-span-5 bg-slate-900/70 border border-teal-500/20 backdrop-blur-xl rounded-3xl p-6 shadow-2xl flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <PieChart size={18} className="text-teal-400" />
                <span>Controle de Assinantes</span>
              </h3>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                {totalSubscribers} Ativos
              </span>
            </div>

            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black">
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <span className="text-xs font-black text-white block">Assinantes Pagantes</span>
                    <span className="text-[10px] text-slate-400">Contribuem para o caixa real</span>
                  </div>
                </div>
                <span className="text-base font-black text-emerald-400">{paidSubscribers}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-amber-500/20">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black">
                    <Gift size={16} />
                  </div>
                  <div>
                    <span className="text-xs font-black text-white block">Assinantes Cortesia</span>
                    <span className="text-[10px] text-amber-400/80">Acesso liberado (R$ 0,00 no caixa)</span>
                  </div>
                </div>
                <span className="text-base font-black text-amber-400">{complimentarySubscribers}</span>
              </div>
            </div>

            {/* SAÚDE FINANCEIRA INDICATOR */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-teal-900/40 to-cyan-900/40 border border-teal-500/30 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold text-teal-300 uppercase tracking-widest block">Saúde Financeira</span>
                <span className="text-xl font-black text-white">92% Excelente</span>
              </div>
              <div className="w-12 h-12 rounded-full border-4 border-teal-400 border-t-transparent flex items-center justify-center text-xs font-black text-teal-300">
                92%
              </div>
            </div>
          </div>
        </div>

        {/* TAB SWITCHER */}
        <div className="flex items-center gap-2 border-b border-teal-500/20 pb-3">
          <button
            onClick={() => setActiveTab('accounting')}
            className={`px-4 py-2.5 rounded-2xl font-extrabold text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'accounting'
                ? 'bg-teal-500 text-slate-950 shadow-lg shadow-teal-500/20'
                : 'bg-slate-900/70 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <DollarSign size={16} />
            <span>1. Visão Financeira & DRE</span>
          </button>

          <button
            onClick={() => setActiveTab('subscribers')}
            className={`px-4 py-2.5 rounded-2xl font-extrabold text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'subscribers'
                ? 'bg-teal-500 text-slate-950 shadow-lg shadow-teal-500/20'
                : 'bg-slate-900/70 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Users size={16} />
            <span>2. Controle de Assinantes & Cortesia</span>
          </button>
        </div>

        {/* TAB 1: VISÃO FINANCEIRA & DRE */}
        {activeTab === 'accounting' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-slate-900/70 border border-teal-500/20 rounded-3xl p-5 shadow-xl">
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Entradas Totais</span>
                <h3 className="text-2xl font-black text-emerald-400">R$ {grossRevenue.toFixed(2)}</h3>
                <span className="text-[10px] text-slate-400 mt-1 block">Assinaturas Ativas Pagas</span>
              </div>
              <div className="bg-slate-900/70 border border-teal-500/20 rounded-3xl p-5 shadow-xl">
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block mb-1">MRR Diluído</span>
                <h3 className="text-2xl font-black text-sky-400">R$ {mrr.toFixed(2)}</h3>
                <span className="text-[10px] text-slate-400 mt-1 block">Recorrência Mensal Projetada</span>
              </div>
              <div className="bg-slate-900/70 border border-teal-500/20 rounded-3xl p-5 shadow-xl">
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Assinantes Pagantes</span>
                <h3 className="text-2xl font-black text-teal-300">{paidSubscribers}</h3>
                <span className="text-[10px] text-slate-400 mt-1 block">Plus & Premium sem Cortesia</span>
              </div>
              <div className="bg-slate-900/70 border border-amber-500/30 rounded-3xl p-5 shadow-xl">
                <span className="text-xs font-extrabold text-amber-400 uppercase tracking-wider block mb-1">Assinantes Cortesia</span>
                <h3 className="text-2xl font-black text-amber-300">{complimentarySubscribers}</h3>
                <span className="text-[10px] text-amber-400/80 mt-1 block">Isentos de Pagamento</span>
              </div>
            </div>

            {/* GRÁFICO VISUAL DE BARRAS DE ESTATÍSTICA DE FATURAMENTO (ESTILO REFERÊNCIA STREAM) */}
            <div className="bg-slate-900/70 border border-teal-500/20 rounded-3xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-white">Estatísticas de Faturamento</h3>
                  <p className="text-xs text-slate-400">Evolução dos últimos meses e projeção de crescimento</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  Por Mês
                </span>
              </div>

              <div className="h-44 w-full flex items-end justify-between gap-3 pt-6 px-2">
                {[
                  { month: 'MAI', amount: grossRevenue * 0.45, height: '45%' },
                  { month: 'JUN', amount: grossRevenue * 0.65, height: '65%' },
                  { month: 'JUL', amount: grossRevenue * 0.55, height: '55%' },
                  { month: 'AGO', amount: grossRevenue * 0.85, height: '85%' },
                  { month: 'SET', amount: grossRevenue * 1.00, height: '100%' },
                  { month: 'OUT', amount: grossRevenue * 1.15, height: '90%' },
                ].map((item, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <span className="text-[10px] font-bold text-teal-300 opacity-0 group-hover:opacity-100 transition">
                      R$ {item.amount.toFixed(0)}
                    </span>
                    <div
                      className="w-full max-w-[40px] rounded-t-xl bg-gradient-to-t from-teal-600 via-emerald-400 to-cyan-300 group-hover:brightness-125 transition-all shadow-lg shadow-teal-500/20"
                      style={{ height: item.height }}
                    />
                    <span className="text-[11px] font-bold text-slate-400">{item.month}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* TABELA DE LANÇAMENTOS CONTÁBEIS */}
            <div className="bg-slate-900/70 border border-teal-500/20 rounded-3xl p-6 shadow-2xl space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-black text-white">Lançamentos Contábeis do Caixa</h3>
                  <p className="text-xs text-slate-400">Entradas de assinaturas e custos de infraestrutura</p>
                </div>
                <button
                  onClick={() => setShowAddTransaction(true)}
                  className="px-4 py-2 rounded-xl bg-teal-500 text-slate-950 font-extrabold text-xs flex items-center gap-2 hover:bg-teal-400 transition cursor-pointer"
                >
                  <PlusCircle size={16} />
                  <span>Novo Lançamento</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-3">Descrição</th>
                      <th className="py-3 px-3">Categoria</th>
                      <th className="py-3 px-3">Tipo</th>
                      <th className="py-3 px-3 text-right">Valor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-3 font-bold text-white">{tx.description}</td>
                        <td className="py-3 px-3 text-slate-400">{tx.category}</td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                            tx.type === 'INCOME'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}>
                            {tx.type === 'INCOME' ? 'ENTRADA' : 'SAÍDA'}
                          </span>
                        </td>
                        <td className={`py-3 px-3 text-right font-black ${
                          tx.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'
                        }`}>
                          {tx.type === 'INCOME' ? '+' : '-'} R$ {tx.amount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CONTROLE DE ASSINANTES & CORTESIA */}
        {activeTab === 'subscribers' && (
          <div className="space-y-6">
            
            {/* BARRA DE FILTROS E PESQUISA DE ASSINANTES */}
            <div className="bg-slate-900/70 border border-teal-500/20 rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por nome ou e-mail..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-end">
                {[
                  { label: 'Todos', value: 'ALL' },
                  { label: 'Ativos', value: 'ACTIVE' },
                  { label: 'Pagantes', value: 'PAID' },
                  { label: 'Cortesias 🎁', value: 'COMPLIMENTARY' },
                  { label: 'Inativos', value: 'INACTIVE' },
                ].map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setStatusFilter(f.value as any)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                      statusFilter === f.value
                        ? 'bg-teal-500 text-slate-950 font-black shadow-md shadow-teal-500/20'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}

                <button
                  onClick={exportCSVUsers}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 border border-slate-700 transition cursor-pointer"
                >
                  <Download size={14} />
                  <span>Exportar CSV</span>
                </button>
              </div>
            </div>

            {/* TABELA / LISTA DE ASSINANTES (REFORMA VISUAL STREAM) */}
            <div className="bg-slate-900/70 border border-teal-500/20 rounded-3xl p-5 shadow-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-3">Usuário</th>
                      <th className="py-3 px-3">Plano Atual</th>
                      <th className="py-3 px-3">Status Assinatura</th>
                      <th className="py-3 px-3">Ação Cortesia</th>
                      <th className="py-3 px-3 text-right">Contribuição Caixa</th>
                      <th className="py-3 px-3 text-right">Ações Rápidas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {filteredUsers.map((u) => {
                      const isSuperAdminEmail = u.email.toLowerCase().trim() === 'gabrielandrews.me@gmail.com';
                      const isComplimentaryUser = u.isComplimentary;
                      const contribution = getUserContribution(u);

                      return (
                        <tr key={u.id} className="hover:bg-slate-800/40 transition">
                          <td className="py-3 px-3">
                            <div className="font-bold text-white">{u.name}</div>
                            <div className="text-[10px] text-slate-400">{u.email}</div>
                          </td>

                          <td className="py-3 px-3">
                            {isSuperAdminEmail || u.plan === 'LIFETIME' ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                Vitalício
                              </span>
                            ) : u.plan === 'PLUS' || u.plan === 'MONTHLY' ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                Plus (R$ 37,90/mês)
                              </span>
                            ) : u.plan === 'PREMIUM' || u.plan === 'SEMIANNUAL' ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-sky-500/20 text-sky-300 border border-sky-500/40">
                                Premium (R$ 109,00/6m)
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                                Gratuito
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-3">
                            {u.isSubscribed && u.subscriptionStatus === 'ACTIVE' ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1 w-max">
                                <CheckCircle2 size={12} /> Ativo
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1 w-max">
                                <XCircle size={12} /> Inativo
                              </span>
                            )}
                          </td>

                          {/* TOGGLE BUTTON CORTESIA (IS COMPLIMENTARY) */}
                          <td className="py-3 px-3">
                            <button
                              onClick={() => handleToggleComplimentary(u)}
                              disabled={actionLoadingId === u.id || isSuperAdminEmail}
                              className={`px-3 py-1 rounded-xl text-[11px] font-extrabold flex items-center gap-1.5 transition cursor-pointer border ${
                                isComplimentaryUser
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                              }`}
                              title="Marcar se o plano do usuário é uma cortesia isenta de faturamento"
                            >
                              {isComplimentaryUser ? (
                                <>
                                  <ToggleRight size={16} className="text-amber-400" />
                                  <span>Cortesia: SIM</span>
                                </>
                              ) : (
                                <>
                                  <ToggleLeft size={16} className="text-slate-500" />
                                  <span>Cortesia: NÃO</span>
                                </>
                              )}
                            </button>
                          </td>

                          <td className="py-3 px-3 text-right">
                            <span className={`font-black text-xs ${
                              contribution > 0 ? 'text-emerald-400' : 'text-slate-500'
                            }`}>
                              R$ {contribution.toFixed(2)}
                            </span>
                          </td>

                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleSubscriptionAction(u.id, 'activate_plus_30d')}
                                disabled={actionLoadingId === u.id}
                                className="px-2 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-[10px] border border-emerald-500/30 transition cursor-pointer"
                                title="Ativar Plus 30 Dias"
                              >
                                Plus 30d
                              </button>
                              <button
                                onClick={() => handleSubscriptionAction(u.id, 'activate_premium_180d')}
                                disabled={actionLoadingId === u.id}
                                className="px-2 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 font-bold text-[10px] border border-sky-500/30 transition cursor-pointer"
                                title="Ativar Premium 180 Dias"
                              >
                                Premium 180d
                              </button>
                              <button
                                onClick={() => handleSubscriptionAction(u.id, 'revoke')}
                                disabled={actionLoadingId === u.id}
                                className="px-2 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold text-[10px] border border-rose-500/30 transition cursor-pointer"
                                title="Revogar Assinatura"
                              >
                                Revogar
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* MODAL ADICIONAR LANÇAMENTO CONTÁBIL */}
      {showAddTransaction && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-teal-500/30 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-white text-base">Novo Lançamento Financeiro</h3>
              <button onClick={() => setShowAddTransaction(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddTransaction} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Descrição</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Assinatura Servidor Neon"
                  value={txDesc}
                  onChange={(e) => setTxDesc(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Categoria</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Infraestrutura, Marketing, API"
                  value={txCat}
                  onChange={(e) => setTxCat(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Valor (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={txAmount}
                    onChange={(e) => setTxAmount(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Tipo</label>
                  <select
                    value={txType}
                    onChange={(e) => setTxType(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-teal-500 focus:outline-none"
                  >
                    <option value="EXPENSE">Saída (Despesa)</option>
                    <option value="INCOME">Entrada (Receita)</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddTransaction(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-black"
                >
                  Salvar Lançamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
