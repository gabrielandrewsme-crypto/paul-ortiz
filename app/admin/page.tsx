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
  Printer
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
  subscriptionStartDate: string | null;
  subscriptionEndDate: string | null;
  subscriptionStatus: 'NONE' | 'ACTIVE' | 'EXPIRED';
  createdAt: string;
}

interface UserMetrics {
  totalUsers: number;
  totalSubscribers: number;
  totalPlus: number;
  totalPremium: number;
  totalLifetime: number;
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
  const [activeTab, setActiveTab] = useState<'users' | 'accounting'>('users');
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Gestão de Usuários
  const [userMetrics, setUserMetrics] = useState<UserMetrics | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [expiringSoonUsers, setExpiringSoonUsers] = useState<AdminUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [planFilter, setPlanFilter] = useState<'ALL' | 'FREE' | 'PLUS' | 'PREMIUM' | 'LIFETIME'>('ALL');
  
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

  // Atualizar temporizador a cada segundo para o countdown visual exato
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
        setUsers(adminData.users);
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
        setStatusMessage(`Assinatura atualizada com sucesso para ${data.user.name}!`);
        await fetchAdminData();
      }
    } catch (err) {
      setStatusMessage('Falha ao processar requisição.');
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
        setStatusMessage('Lançamento contábil registrado com sucesso!');
        setShowAddTransaction(false);
        setTxDesc('');
        setTxAmount('');
        fetchAccountingData(periodFilter);
      }
    } catch (err) {
      setStatusMessage('Erro ao registrar lançamento.');
    }
  };

  // Cálculo da contagem regressiva em tempo real
  const formatCountdown = (endDateStr: string | null, email: string, plan: string) => {
    if (email.toLowerCase().trim() === 'gabrielandrews.me@gmail.com' || plan === 'LIFETIME') {
      return { text: 'Vitalício (Sem Expiração)', expired: false, isLifetime: true };
    }
    if (!endDateStr) return { text: 'N/A', expired: false, isLifetime: false };

    const end = new Date(endDateStr).getTime();
    const diff = end - nowTime;

    if (diff <= 0) {
      return { text: 'Expirado', expired: true, isLifetime: false };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return {
      text: `${days}d ${hours}h ${minutes}m ${seconds}s`,
      exactDate: new Date(endDateStr).toLocaleString('pt-BR'),
      daysRemaining: days,
      expired: false,
      isLifetime: false,
    };
  };

  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  const formatCurrency = (val: number): string => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const exportCSV = () => {
    if (!finMetrics || transactions.length === 0) return;

    const headers = ['ID,Data,Descricao,Categoria,Tipo,Valor(BRL)'];
    const rows = transactions.map(t => 
      `"${t.id}","${formatDate(t.date)}","${t.description}","${t.category}","${t.type === 'INCOME' ? 'Entrada' : 'Saida'}",${t.amount}`
    );

    const summaryRows = [
      '',
      '--- RESUMO CONTABIL DRE ---',
      `Receita Bruta,${finMetrics.grossRevenue}`,
      `Despesas Operacionais,${finMetrics.totalExpense}`,
      `Lucro Liquido,${finMetrics.netProfit}`,
      `MRR,${finMetrics.mrr}`,
      `ARR,${finMetrics.arr}`,
      `Ticket Medio,${finMetrics.ticketMedio}`,
      `Taxa de Conversao,${finMetrics.conversionRate.toFixed(2)}%`
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join('\n'), rows.join('\n'), summaryRows.join('\n')].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DRE_Contabilidade_PaulOrtiz_${periodFilter}_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  const generateWhatsAppCobrança = (u: AdminUser) => {
    const countdown = formatCountdown(u.subscriptionEndDate, u.email, u.plan);
    const dateFormatted = formatDate(u.subscriptionEndDate);
    const planName = u.plan === 'PLUS' || u.plan === 'MONTHLY' ? 'Plus (30 dias)' : 'Premium (180 dias)';
    const text = encodeURIComponent(
      `Olá ${u.name}! Sua assinatura do Plano ${planName} da plataforma Paul Ortiz vence em ${countdown.daysRemaining || 0} dias (no dia ${dateFormatted}). Gostaria de garantir a renovação para continuar acessando todos os conteúdos?`
    );
    return `https://wa.me/?text=${text}`;
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (planFilter === 'ALL') return matchesSearch;
    if (planFilter === 'FREE') return matchesSearch && (u.plan === 'FREE' || !u.isSubscribed);
    if (planFilter === 'PLUS') return matchesSearch && (u.plan === 'PLUS' || u.plan === 'MONTHLY');
    if (planFilter === 'PREMIUM') return matchesSearch && (u.plan === 'PREMIUM' || u.plan === 'SEMIANNUAL');
    if (planFilter === 'LIFETIME') return matchesSearch && (u.plan === 'LIFETIME' || u.email.toLowerCase().trim() === 'gabrielandrews.me@gmail.com');
    return matchesSearch;
  });

  if (loading) {
    return (
      <main className="admin-page-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <div style={{ color: '#ffffff', fontSize: '1.2rem', fontWeight: 700 }}>Carregando Painel Admin Supremo & DRE Contábil...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="admin-page-wrapper">
        <div className="admin-card">
          <div className="auth-alert error">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
          <Link href="/" className="auth-btn-primary" style={{ marginTop: '1rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <Home size={18} /> Voltar à Página Inicial
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-page-wrapper">
      <div className="admin-container">
        {/* Header Admin */}
        <header className="admin-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="admin-badge-icon">
              <ShieldCheck size={28} color="#f59e0b" />
            </div>
            <div>
              <h1 className="admin-title">Painel Administrativo & Contabilidade DRE</h1>
              <p className="admin-subtitle">Administrador Supremo: <strong>{currentUser?.email}</strong> (Acesso Vitalício)</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
            <Link href="/" className="back-link">
              <Home size={18} /> Ir para o Mapa
            </Link>
          </div>
        </header>

        {statusMessage && (
          <div className="auth-alert success" style={{ marginBottom: '1.5rem' }}>
            <CheckCircle2 size={18} />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* NAVEGAÇÃO POR ABAS */}
        <div className="flex gap-3 mb-6 bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
              activeTab === 'users'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Users size={18} />
            <span>Gestão de Usuários & Tempo Regressivo</span>
          </button>

          <button
            onClick={() => setActiveTab('accounting')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
              activeTab === 'accounting'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <TrendingUp size={18} />
            <span>Contabilidade Avançada DRE</span>
          </button>
        </div>

        {/* ════════════════════ ABA 1: GESTÃO DE USUÁRIOS ════════════════════ */}
        {activeTab === 'users' && (
          <>
            {/* METRICS GRID USUÁRIOS */}
            {userMetrics && (
              <div className="metrics-grid">
                <div className="metric-card">
                  <div className="metric-icon" style={{ background: '#dbeafe', color: '#1d4ed8' }}>
                    <Users size={22} />
                  </div>
                  <div>
                    <span className="metric-label">Total de Usuários</span>
                    <h3 className="metric-value">{userMetrics.totalUsers}</h3>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
                    <Crown size={22} />
                  </div>
                  <div>
                    <span className="metric-label">Total Assinantes Ativos</span>
                    <h3 className="metric-value">{userMetrics.totalSubscribers}</h3>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-icon" style={{ background: '#dcfce7', color: '#15803d' }}>
                    <Sparkles size={22} />
                  </div>
                  <div>
                    <span className="metric-label">Plus (30d) / Premium (180d)</span>
                    <h3 className="metric-value">{userMetrics.totalPlus} Plus / {userMetrics.totalPremium} Prem</h3>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-icon" style={{ background: '#fee2e2', color: '#b91c1c' }}>
                    <Clock size={22} />
                  </div>
                  <div>
                    <span className="metric-label">Vencendo em 5 dias</span>
                    <h3 className="metric-value" style={{ color: userMetrics.expiringSoonCount > 0 ? '#dc2626' : '#1e293b' }}>
                      {userMetrics.expiringSoonCount}
                    </h3>
                  </div>
                </div>
              </div>
            )}

            {/* ALERTAS DE ASSINATURA VENCENDO */}
            {expiringSoonUsers.length > 0 && (
              <div style={{ background: '#fffbe3', border: '2px solid #fde047', borderRadius: '20px', padding: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#854d0e', marginBottom: '1rem' }}>
                  <Clock size={22} />
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>⚠️ Assinaturas Vencendo em Breve (Próximos 5 Dias)</h2>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  {expiringSoonUsers.map(u => {
                    const countdown = formatCountdown(u.subscriptionEndDate, u.email, u.plan);
                    return (
                      <div key={u.id} style={{ background: '#ffffff', padding: '1rem', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #fef08a' }}>
                        <div>
                          <strong style={{ color: '#0f172a', fontSize: '1rem' }}>{u.name}</strong>
                          <span style={{ color: '#64748b', fontSize: '0.85rem', marginLeft: '0.5rem' }}>({u.email})</span>
                          <div style={{ fontSize: '0.85rem', color: '#854d0e', marginTop: '0.2rem' }}>
                            Plano: <strong>{u.plan}</strong> | Tempo Restante: <strong style={{ color: '#dc2626' }}>{countdown.text}</strong> ({formatDate(u.subscriptionEndDate)})
                          </div>
                        </div>

                        <a
                          href={generateWhatsAppCobrança(u)}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            background: '#25d366',
                            color: '#ffffff',
                            padding: '0.6rem 1.2rem',
                            borderRadius: '10px',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            boxShadow: '0 2px 8px rgba(37,211,102,0.3)'
                          }}
                        >
                          <MessageSquare size={16} /> Cobrar no WhatsApp
                        </a>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TABELA DE USUÁRIOS E CONCESSÃO DE PLANOS */}
            <div className="admin-table-card">
              <div className="table-header-row" style={{ flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2 className="table-title">Gestão de Usuários & Planos com Tempo Regressivo</h2>
                  <p className="table-subtitle">Conceda planos de 30 dias (Plus), 180 dias (Premium) ou Vitalício com atualização instantânea</p>
                </div>

                <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  {/* Filtro por Plano */}
                  <select
                    value={planFilter}
                    onChange={(e: any) => setPlanFilter(e.target.value)}
                    style={{ padding: '0.6rem 1rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 700, background: '#ffffff', cursor: 'pointer' }}
                  >
                    <option value="ALL">Todos os Planos</option>
                    <option value="FREE">Gratuito (Free)</option>
                    <option value="PLUS">Plano Plus (30 dias)</option>
                    <option value="PREMIUM">Plano Premium (180 dias)</option>
                    <option value="LIFETIME">Vitalício (Admin)</option>
                  </select>

                  {/* Busca */}
                  <div className="search-box">
                    <Search size={18} className="search-icon" />
                    <input
                      type="text"
                      placeholder="Buscar por nome ou e-mail..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="search-input"
                    />
                  </div>
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>Usuário</th>
                      <th>Plano Ativo</th>
                      <th>Status Assinatura</th>
                      <th>Data de Início</th>
                      <th>Data / Hora Expiração</th>
                      <th>Tempo Regressivo Restante</th>
                      <th>Ações de Ativação Manual</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => {
                      const countdown = formatCountdown(u.subscriptionEndDate, u.email, u.plan);
                      const isSuper = u.email.toLowerCase().trim() === 'gabrielandrews.me@gmail.com';
                      const isActive = isSuper || (u.isSubscribed && u.subscriptionStatus === 'ACTIVE' && !countdown.expired);

                      return (
                        <tr key={u.id}>
                          <td>
                            <div style={{ fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              {u.name}
                              {isSuper && (
                                <span title="Administrador Supremo">
                                  <ShieldCheck size={16} color="#f59e0b" />
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{u.email}</div>
                          </td>
                          <td>
                            <span className={`role-badge ${u.plan !== 'FREE' ? 'admin' : 'user'}`}>
                              {u.plan === 'LIFETIME' || isSuper ? 'Vitalício (Admin)' :
                               u.plan === 'PLUS' || u.plan === 'MONTHLY' ? 'Plus (30 Dias)' :
                               u.plan === 'PREMIUM' || u.plan === 'SEMIANNUAL' ? 'Premium (180 Dias)' :
                               'Gratuito (FREE)'}
                            </span>
                          </td>
                          <td>
                            {isSuper || u.plan === 'LIFETIME' ? (
                              <span style={{ background: '#fef3c7', color: '#92400e', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 800 }}>
                                👑 Vitalício
                              </span>
                            ) : isActive ? (
                              <span style={{ background: '#dcfce7', color: '#15803d', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 800 }}>
                                ✅ Ativo
                              </span>
                            ) : countdown.expired ? (
                              <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 800 }}>
                                ❌ Expirado
                              </span>
                            ) : (
                              <span style={{ background: '#f1f5f9', color: '#64748b', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700 }}>
                                Gratuito
                              </span>
                            )}
                          </td>
                          <td style={{ fontSize: '0.85rem' }}>{formatDate(u.subscriptionStartDate)}</td>
                          <td style={{ fontSize: '0.85rem' }}>
                            {countdown.isLifetime ? 'NUNCA' : countdown.exactDate || formatDate(u.subscriptionEndDate)}
                          </td>
                          <td>
                            {countdown.isLifetime ? (
                              <strong style={{ color: '#d97706' }}>∞ Ilimitado</strong>
                            ) : isActive ? (
                              <strong style={{ color: (countdown.daysRemaining || 0) <= 5 ? '#dc2626' : '#16a34a', fontFamily: 'monospace', fontSize: '0.9rem' }}>
                                ⏳ {countdown.text}
                              </strong>
                            ) : (
                              <span style={{ color: '#94a3b8' }}>-</span>
                            )}
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                              {/* Plus 30 dias */}
                              <button
                                onClick={() => handleSubscriptionAction(u.id, 'activate_plus_30d')}
                                disabled={actionLoadingId === u.id}
                                style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '0.35rem 0.7rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                                title="Concede 30 dias de Plano Plus"
                              >
                                + Plus (30d)
                              </button>

                              {/* Premium 180 dias */}
                              <button
                                onClick={() => handleSubscriptionAction(u.id, 'activate_premium_180d')}
                                disabled={actionLoadingId === u.id}
                                style={{ background: '#7c3aed', color: '#ffffff', border: 'none', padding: '0.35rem 0.7rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                                title="Concede 180 dias (6 meses) de Plano Premium"
                              >
                                + Premium (180d)
                              </button>

                              {/* Vitalício */}
                              <button
                                onClick={() => handleSubscriptionAction(u.id, 'activate_lifetime')}
                                disabled={actionLoadingId === u.id}
                                style={{ background: '#ca8a04', color: '#ffffff', border: 'none', padding: '0.35rem 0.7rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                                title="Concede Acesso Vitalício Ilimitado"
                              >
                                👑 Vitalício
                              </button>

                              {/* Revogar */}
                              {isActive && !isSuper && (
                                <button
                                  onClick={() => handleSubscriptionAction(u.id, 'revoke')}
                                  disabled={actionLoadingId === u.id}
                                  style={{ background: '#ef4444', color: '#ffffff', border: 'none', padding: '0.35rem 0.7rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                                  title="Revoga a assinatura e volta para Free"
                                >
                                  <XCircle size={12} /> Revogar
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ════════════════════ ABA 2: CONTABILIDADE AVANÇADA DRE ════════════════════ */}
        {activeTab === 'accounting' && finMetrics && (
          <>
            {/* BARRA DE AÇÕES CONTÁBEIS & FILTROS DE PERÍODO */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{ color: '#ffffff', fontSize: '0.9rem', fontWeight: 700 }}>Período DRE:</span>
                {(['all', 'daily', 'monthly', 'annual'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => setPeriodFilter(p)}
                    style={{
                      background: periodFilter === p ? '#2563eb' : 'rgba(255,255,255,0.1)',
                      color: '#ffffff',
                      border: 'none',
                      padding: '0.4rem 0.9rem',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textTransform: 'capitalize'
                    }}
                  >
                    {p === 'all' ? 'Total Histórico' : p === 'daily' ? 'Hoje' : p === 'monthly' ? 'Este Mês' : 'Este Ano'}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '0.8rem' }}>
                <button
                  onClick={() => setShowAddTransaction(!showAddTransaction)}
                  style={{ background: '#10b981', color: '#ffffff', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <PlusCircle size={16} /> Novo Lançamento DRE
                </button>

                <button
                  onClick={exportCSV}
                  style={{ background: '#3b82f6', color: '#ffffff', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <FileSpreadsheet size={16} /> Exportar CSV
                </button>

                <button
                  onClick={handlePrintPDF}
                  style={{ background: '#64748b', color: '#ffffff', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Printer size={16} /> Imprimir / PDF
                </button>
              </div>
            </div>

            {/* FORMULÁRIO MODAL NOVO LANÇAMENTO */}
            {showAddTransaction && (
              <form onSubmit={handleAddTransaction} style={{ background: '#1e293b', border: '1px solid #334155', padding: '1.5rem', borderRadius: '16px', marginBottom: '2rem' }}>
                <h3 style={{ color: '#ffffff', fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem' }}>Registrar Novo Lançamento Contábil DRE</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 700 }}>Descrição</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Servidor Vercel ou Venda Direta"
                      value={txDesc}
                      onChange={e => setTxDesc(e.target.value)}
                      style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #475569', background: '#0f172a', color: '#ffffff', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 700 }}>Categoria</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Servidores, E-mail API, AI Services"
                      value={txCat}
                      onChange={e => setTxCat(e.target.value)}
                      style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #475569', background: '#0f172a', color: '#ffffff', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 700 }}>Valor (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="0.00"
                      value={txAmount}
                      onChange={e => setTxAmount(e.target.value)}
                      style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #475569', background: '#0f172a', color: '#ffffff', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 700 }}>Tipo de Lançamento</label>
                    <select
                      value={txType}
                      onChange={(e: any) => setTxType(e.target.value)}
                      style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #475569', background: '#0f172a', color: '#ffffff', fontSize: '0.85rem' }}
                    >
                      <option value="EXPENSE">🔴 Saída / Custo Operacional</option>
                      <option value="INCOME">🟢 Entrada / Receita</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginTop: '1rem', display: 'flex', gap: '0.8rem', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setShowAddTransaction(false)} style={{ background: '#475569', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer' }}>
                    Cancelar
                  </button>
                  <button type="submit" style={{ background: '#10b981', color: '#fff', border: 'none', padding: '0.5rem 1.2rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
                    Salvar Lançamento
                  </button>
                </div>
              </form>
            )}

            {/* DASHBOARD FINANCEIRO VISUAL (KPIs) */}
            <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginBottom: '2rem' }}>
              {/* Receita Bruta */}
              <div className="metric-card" style={{ borderLeft: '4px solid #10b981' }}>
                <div className="metric-icon" style={{ background: '#dcfce7', color: '#15803d' }}>
                  <DollarSign size={22} />
                </div>
                <div>
                  <span className="metric-label">Receita Bruta Total</span>
                  <h3 className="metric-value" style={{ color: '#15803d' }}>{formatCurrency(finMetrics.grossRevenue)}</h3>
                </div>
              </div>

              {/* MRR */}
              <div className="metric-card" style={{ borderLeft: '4px solid #3b82f6' }}>
                <div className="metric-icon" style={{ background: '#dbeafe', color: '#1d4ed8' }}>
                  <TrendingUp size={22} />
                </div>
                <div>
                  <span className="metric-label">MRR (Mensal Recorrente)</span>
                  <h3 className="metric-value" style={{ color: '#1d4ed8' }}>{formatCurrency(finMetrics.mrr)}</h3>
                </div>
              </div>

              {/* ARR */}
              <div className="metric-card" style={{ borderLeft: '4px solid #8b5cf6' }}>
                <div className="metric-icon" style={{ background: '#f3e8ff', color: '#6b21a8' }}>
                  <PieChart size={22} />
                </div>
                <div>
                  <span className="metric-label">ARR (Projeção Anual)</span>
                  <h3 className="metric-value" style={{ color: '#6b21a8' }}>{formatCurrency(finMetrics.arr)}</h3>
                </div>
              </div>

              {/* Ticket Médio */}
              <div className="metric-card" style={{ borderLeft: '4px solid #f59e0b' }}>
                <div className="metric-icon" style={{ background: '#fef3c7', color: '#b45309' }}>
                  <Crown size={22} />
                </div>
                <div>
                  <span className="metric-label">Ticket Médio (ARPU)</span>
                  <h3 className="metric-value" style={{ color: '#b45309' }}>{formatCurrency(finMetrics.ticketMedio)}</h3>
                </div>
              </div>

              {/* Taxa de Conversão */}
              <div className="metric-card" style={{ borderLeft: '4px solid #06b6d4' }}>
                <div className="metric-icon" style={{ background: '#cffaff', color: '#0e7490' }}>
                  <ArrowUpRight size={22} />
                </div>
                <div>
                  <span className="metric-label">Taxa Conversão (Free → Pago)</span>
                  <h3 className="metric-value" style={{ color: '#0e7490' }}>{finMetrics.conversionRate.toFixed(1)}%</h3>
                </div>
              </div>

              {/* Lucro Líquido */}
              <div className="metric-card" style={{ borderLeft: `4px solid ${finMetrics.netProfit >= 0 ? '#10b981' : '#ef4444'}` }}>
                <div className="metric-icon" style={{ background: finMetrics.netProfit >= 0 ? '#dcfce7' : '#fee2e2', color: finMetrics.netProfit >= 0 ? '#15803d' : '#b91c1c' }}>
                  <DollarSign size={22} />
                </div>
                <div>
                  <span className="metric-label">Lucro Líquido Final</span>
                  <h3 className="metric-value" style={{ color: finMetrics.netProfit >= 0 ? '#15803d' : '#b91c1c' }}>
                    {formatCurrency(finMetrics.netProfit)}
                  </h3>
                </div>
              </div>
            </div>

            {/* TABELA CONTÁBIL DRE (DEMONSTRATIVO DO RESULTADO DO EXERCÍCIO) */}
            <div className="admin-table-card" style={{ marginBottom: '2rem' }}>
              <div className="table-header-row">
                <div>
                  <h2 className="table-title">DRE - Demonstrativo do Resultado do Exercício</h2>
                  <p className="table-subtitle">Organização detalhada de Entradas (Vendas), Custos Operacionais e Resultado Líquido</p>
                </div>
              </div>

              <div style={{ overflowX: 'auto', padding: '1rem' }}>
                <table className="users-table" style={{ background: '#ffffff', borderRadius: '12px' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc' }}>
                      <th style={{ textAlign: 'left', padding: '0.8rem' }}>Estrutura Contábil DRE</th>
                      <th style={{ textAlign: 'center', padding: '0.8rem' }}>Categoria / Origem</th>
                      <th style={{ textAlign: 'right', padding: '0.8rem' }}>Valor (R$)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* ENTRADAS / RECEITAS */}
                    <tr style={{ background: '#f0fdf4', fontWeight: 800 }}>
                      <td colSpan={2} style={{ color: '#166534', padding: '0.8rem' }}>
                        (+) RECEITA BRUTA OPERACIONAL (Vendas & Assinaturas)
                      </td>
                      <td style={{ textAlign: 'right', color: '#166534', padding: '0.8rem' }}>
                        {formatCurrency(finMetrics.grossRevenue)}
                      </td>
                    </tr>
                    {transactions.filter(t => t.type === 'INCOME').map(t => (
                      <tr key={t.id}>
                        <td style={{ paddingLeft: '2rem', color: '#334155', fontSize: '0.85rem' }}>
                          • {t.description}
                        </td>
                        <td style={{ textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>{t.category}</td>
                        <td style={{ textAlign: 'right', color: '#15803d', fontWeight: 700, fontSize: '0.85rem' }}>
                          + {formatCurrency(t.amount)}
                        </td>
                      </tr>
                    ))}

                    {/* SAÍDAS / CUSTOS */}
                    <tr style={{ background: '#fef2f2', fontWeight: 800 }}>
                      <td colSpan={2} style={{ color: '#991b1b', padding: '0.8rem' }}>
                        (-) CUSTOS OPERACIONAIS & INFRAESTRUTURA (Servidores, APIs, DB)
                      </td>
                      <td style={{ textAlign: 'right', color: '#991b1b', padding: '0.8rem' }}>
                        - {formatCurrency(finMetrics.totalExpense)}
                      </td>
                    </tr>
                    {transactions.filter(t => t.type === 'EXPENSE').map(t => (
                      <tr key={t.id}>
                        <td style={{ paddingLeft: '2rem', color: '#334155', fontSize: '0.85rem' }}>
                          • {t.description}
                        </td>
                        <td style={{ textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>{t.category}</td>
                        <td style={{ textAlign: 'right', color: '#b91c1c', fontWeight: 700, fontSize: '0.85rem' }}>
                          - {formatCurrency(t.amount)}
                        </td>
                      </tr>
                    ))}

                    {/* LUCRO LÍQUIDO FINAL */}
                    <tr style={{ background: finMetrics.netProfit >= 0 ? '#dcfce7' : '#fee2e2', fontWeight: 900, fontSize: '1.05rem' }}>
                      <td colSpan={2} style={{ color: finMetrics.netProfit >= 0 ? '#14532d' : '#7f1d1d', padding: '1rem' }}>
                        (=) LUCRO LÍQUIDO DO PERÍODO
                      </td>
                      <td style={{ textAlign: 'right', color: finMetrics.netProfit >= 0 ? '#14532d' : '#7f1d1d', padding: '1rem' }}>
                        {formatCurrency(finMetrics.netProfit)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
