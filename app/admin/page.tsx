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
  Sparkles
} from 'lucide-react';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'MANAGER' | 'ADMIN';
  streakDays: number;
  currentCheckpoint: number;
  totalWordsLearned: number;
  plan: 'FREE' | 'MONTHLY' | 'SEMIANNUAL';
  isSubscribed: boolean;
  subscriptionStartDate: string | null;
  subscriptionEndDate: string | null;
  subscriptionStatus: 'NONE' | 'ACTIVE' | 'EXPIRED';
  createdAt: string;
}

interface Metrics {
  totalUsers: number;
  totalSubscribers: number;
  totalMonthly: number;
  totalSemiannual: number;
  expiringSoonCount: number;
  databaseStatus: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [expiringSoonUsers, setExpiringSoonUsers] = useState<AdminUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

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
        setError('Acesso negado. Esta área é restrita exclusivamente ao e-mail administrador Supremo.');
        setLoading(false);
        return;
      }

      const adminRes = await fetch('/api/admin/users');
      const adminData = await adminRes.json();

      if (!adminRes.ok) {
        setError(adminData.error || 'Erro ao carregar dados do painel.');
      } else {
        setMetrics(adminData.metrics);
        setUsers(adminData.users);
        setExpiringSoonUsers(adminData.expiringSoonUsers || []);
      }
    } catch (err) {
      setError('Falha de conexão com o banco Neon.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

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

  const calculateDaysRemaining = (endDateStr: string | null): number => {
    if (!endDateStr) return 0;
    const end = new Date(endDateStr);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  const generateWhatsAppCobrança = (u: AdminUser) => {
    const daysLeft = calculateDaysRemaining(u.subscriptionEndDate);
    const dateFormatted = formatDate(u.subscriptionEndDate);
    const planName = u.plan === 'MONTHLY' ? 'Mensal' : 'Semestral';
    const text = encodeURIComponent(
      `Olá ${u.name}! Sua assinatura do Plano ${planName} da plataforma vence em ${daysLeft} dias (no dia ${dateFormatted}). Gostaria de garantir a renovação para continuar acessando todos os livros e podcasts da escalada?`
    );
    return `https://wa.me/?text=${text}`;
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <main className="admin-page-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <div style={{ color: '#ffffff', fontSize: '1.2rem', fontWeight: 700 }}>Carregando Painel Admin Supremo...</div>
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
              <h1 className="admin-title">Painel de Assinaturas & Gestão Admin</h1>
              <p className="admin-subtitle">Administrador: <strong>{currentUser?.email}</strong></p>
            </div>
          </div>

          <Link href="/" className="back-link">
            <Home size={18} /> Ir para o Mapa
          </Link>
        </header>

        {statusMessage && (
          <div className="auth-alert success" style={{ marginBottom: '1.5rem' }}>
            <CheckCircle2 size={18} />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* METRICS GRID */}
        {metrics && (
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-icon" style={{ background: '#dbeafe', color: '#1d4ed8' }}>
                <Users size={22} />
              </div>
              <div>
                <span className="metric-label">Total de Usuários</span>
                <h3 className="metric-value">{metrics.totalUsers}</h3>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
                <Crown size={22} />
              </div>
              <div>
                <span className="metric-label">Assinantes Plus Ativos</span>
                <h3 className="metric-value">{metrics.totalSubscribers}</h3>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon" style={{ background: '#dcfce7', color: '#15803d' }}>
                <Sparkles size={22} />
              </div>
              <div>
                <span className="metric-label">Plano Mensal / Semestral</span>
                <h3 className="metric-value">{metrics.totalMonthly}M / {metrics.totalSemiannual}S</h3>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon" style={{ background: '#fee2e2', color: '#b91c1c' }}>
                <Clock size={22} />
              </div>
              <div>
                <span className="metric-label">Vencendo em 5 dias</span>
                <h3 className="metric-value" style={{ color: metrics.expiringSoonCount > 0 ? '#dc2626' : '#1e293b' }}>
                  {metrics.expiringSoonCount}
                </h3>
              </div>
            </div>
          </div>
        )}

        {/* SECTION: ALERTAS DE ASSINATURA VENCENDO */}
        {expiringSoonUsers.length > 0 && (
          <div style={{ background: '#fffbe3', border: '2px solid #fde047', borderRadius: '20px', padding: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#854d0e', marginBottom: '1rem' }}>
              <Clock size={22} />
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>⚠️ Assinaturas Vencendo em Breve (Próximos 5 Dias)</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {expiringSoonUsers.map(u => {
                const daysLeft = calculateDaysRemaining(u.subscriptionEndDate);
                return (
                  <div key={u.id} style={{ background: '#ffffff', padding: '1rem', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #fef08a' }}>
                    <div>
                      <strong style={{ color: '#0f172a', fontSize: '1rem' }}>{u.name}</strong>
                      <span style={{ color: '#64748b', fontSize: '0.85rem', marginLeft: '0.5rem' }}>({u.email})</span>
                      <div style={{ fontSize: '0.8rem', color: '#854d0e', marginTop: '0.2rem' }}>
                        Plano: <strong>{u.plan}</strong> | Expira em: <strong>{formatDate(u.subscriptionEndDate)}</strong> ({daysLeft <= 0 ? 'VENCIDA' : `${daysLeft} dias restantes`})
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
                      <MessageSquare size={16} /> Enviar Cobrança WhatsApp
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* USER LIST & SUBSCRIPTION MANAGEMENT */}
        <div className="admin-table-card">
          <div className="table-header-row">
            <div>
              <h2 className="table-title">Gerenciamento Manual de Assinaturas</h2>
              <p className="table-subtitle">Ative, renove ou revogue o acesso dos usuários com atualização instantânea</p>
            </div>

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

          <div style={{ overflowX: 'auto' }}>
            <table className="users-table">
              <thead>
                <tr>
                  <th>Usuário</th>
                  <th>Plano Atual</th>
                  <th>Status</th>
                  <th>Data de Início</th>
                  <th>Data de Expiração</th>
                  <th>Dias Restantes</th>
                  <th>Ações de Ativação Manual</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => {
                  const daysLeft = calculateDaysRemaining(u.subscriptionEndDate);
                  const isExpired = u.subscriptionStatus === 'EXPIRED' || daysLeft < 0;
                  const isActive = u.isSubscribed && u.subscriptionStatus === 'ACTIVE' && !isExpired;

                  return (
                    <tr key={u.id}>
                      <td>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{u.name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{u.email}</div>
                      </td>
                      <td>
                        <span className={`role-badge ${u.plan !== 'FREE' ? 'admin' : 'user'}`}>
                          {u.plan === 'MONTHLY' ? 'Mensal (R$37,90)' : u.plan === 'SEMIANNUAL' ? 'Semestral (R$109,90)' : 'Gratuito (FREE)'}
                        </span>
                      </td>
                      <td>
                        {isActive ? (
                          <span style={{ background: '#dcfce7', color: '#15803d', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 800 }}>
                            ✅ Ativo
                          </span>
                        ) : isExpired ? (
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
                      <td style={{ fontSize: '0.85rem' }}>{formatDate(u.subscriptionEndDate)}</td>
                      <td>
                        {isActive ? (
                          <strong style={{ color: daysLeft <= 5 ? '#dc2626' : '#16a34a' }}>
                            {daysLeft} dias
                          </strong>
                        ) : (
                          <span style={{ color: '#94a3b8' }}>-</span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                          {/* Ativar Mensal */}
                          <button
                            onClick={() => handleSubscriptionAction(u.id, 'activate_monthly')}
                            disabled={actionLoadingId === u.id}
                            style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '0.35rem 0.7rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                            title="Define 30 dias de acesso Plus"
                          >
                            + Mensal (30d)
                          </button>

                          {/* Ativar Semestral */}
                          <button
                            onClick={() => handleSubscriptionAction(u.id, 'activate_semiannual')}
                            disabled={actionLoadingId === u.id}
                            style={{ background: '#ca8a04', color: '#ffffff', border: 'none', padding: '0.35rem 0.7rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                            title="Define 180 dias de acesso Plus"
                          >
                            + Semestral (180d)
                          </button>

                          {/* Renovar +30d */}
                          {isActive && (
                            <button
                              onClick={() => handleSubscriptionAction(u.id, 'renew', 30)}
                              disabled={actionLoadingId === u.id}
                              style={{ background: '#16a34a', color: '#ffffff', border: 'none', padding: '0.35rem 0.7rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                              title="Adiciona +30 dias a partir da data de término"
                            >
                              <RefreshCw size={12} /> +30d
                            </button>
                          )}

                          {/* Revogar */}
                          {isActive && (
                            <button
                              onClick={() => handleSubscriptionAction(u.id, 'revoke')}
                              disabled={actionLoadingId === u.id}
                              style={{ background: '#ef4444', color: '#ffffff', border: 'none', padding: '0.35rem 0.7rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                              title="Revoga o acesso e volta para Plano Gratuito"
                            >
                              <XCircle size={12} /> Cancelar
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
      </div>
    </main>
  );
}
