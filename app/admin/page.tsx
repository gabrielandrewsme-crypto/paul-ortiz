'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, 
  Users, 
  UserCheck, 
  Database, 
  LogOut, 
  Home, 
  AlertCircle, 
  CheckCircle2, 
  Crown,
  Search,
  Settings2
} from 'lucide-react';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'MANAGER' | 'ADMIN';
  streakDays: number;
  currentCheckpoint: number;
  totalWordsLearned: number;
  createdAt: string;
}

interface Metrics {
  totalUsers: number;
  totalAdmins: number;
  totalManagers: number;
  databaseStatus: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  const fetchAdminData = async () => {
    try {
      // 1. Verify Session
      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();

      if (!meData.authenticated || !meData.user) {
        setError('Sessão expirada. Realize login novamente.');
        setLoading(false);
        return;
      }

      setCurrentUser(meData.user);

      if (meData.user.role !== 'ADMIN' && meData.user.role !== 'MANAGER') {
        setError('Acesso negado. Apenas Administradores e Gestores têm permissão.');
        setLoading(false);
        return;
      }

      // 2. Fetch Users & Metrics
      const adminRes = await fetch('/api/admin/users');
      const adminData = await adminRes.json();

      if (!adminRes.ok) {
        setError(adminData.error || 'Erro ao carregar dados do painel.');
      } else {
        setMetrics(adminData.metrics);
        setUsers(adminData.users);
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

  const handleRoleChange = async (userId: string, newRole: string) => {
    setStatusMessage('');
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatusMessage(`Erro: ${data.error}`);
      } else {
        setStatusMessage('Cargo atualizado com sucesso!');
        fetchAdminData();
      }
    } catch (err) {
      setStatusMessage('Erro ao comunicar com o servidor.');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <main className="admin-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ background: '#ffffff', padding: '2rem 3rem', borderRadius: '20px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#4a90e2' }}>Carregando Painel de Gestão...</div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="admin-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '1.5rem' }}>
        <div style={{ background: '#ffffff', padding: '2.5rem', borderRadius: '24px', maxWidth: '480px', width: '100%', textAlign: 'center', boxShadow: '0 15px 40px rgba(0,0,0,0.12)' }}>
          <AlertCircle size={48} color="#ef4444" style={{ margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e293b' }}>Acesso Restrito</h2>
          <p style={{ color: '#64748b', marginTop: '0.5rem', fontSize: '0.95rem' }}>{error}</p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.8rem', justifyContent: 'center' }}>
            <Link href="/" style={{ background: '#f1f5f9', color: '#334155', padding: '0.8rem 1.4rem', borderRadius: '12px', fontWeight: 700, textDecoration: 'none' }}>
              Voltar ao Início
            </Link>
            <Link href="/login" style={{ background: '#4a90e2', color: '#ffffff', padding: '0.8rem 1.4rem', borderRadius: '12px', fontWeight: 700, textDecoration: 'none' }}>
              Realizar Login
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-container">
      {/* Top Navbar */}
      <header className="admin-header">
        <div className="admin-brand">
          <ShieldCheck size={28} color="#4a90e2" />
          <div>
            <h1 className="admin-title">Painel de Gestão & Administração</h1>
            <span className="admin-subtitle">Sara Core — Neon PostgreSQL Database</span>
          </div>
        </div>

        <div className="admin-user-info">
          <div className="user-badge-role">
            <Crown size={16} color="#d97706" />
            <span>{currentUser?.role}</span>
          </div>
          <span className="user-name">{currentUser?.name}</span>
          <Link href="/" className="icon-link" title="Ir para a Montanha">
            <Home size={20} />
          </Link>
          <button className="icon-link" onClick={handleLogout} title="Sair">
            <LogOut size={20} color="#ef4444" />
          </button>
        </div>
      </header>

      {/* Metrics Cards Grid */}
      <div className="admin-metrics-grid">
        <div className="admin-metric-card">
          <div className="metric-icon-box" style={{ background: '#eff6ff', color: '#3b82f6' }}>
            <Users size={24} />
          </div>
          <div className="metric-data">
            <span className="metric-label">Total de Usuários</span>
            <span className="metric-value">{metrics?.totalUsers || 0}</span>
          </div>
        </div>

        <div className="admin-metric-card">
          <div className="metric-icon-box" style={{ background: '#fef3c7', color: '#d97706' }}>
            <Crown size={24} />
          </div>
          <div className="metric-data">
            <span className="metric-label">Administradores</span>
            <span className="metric-value">{metrics?.totalAdmins || 0}</span>
          </div>
        </div>

        <div className="admin-metric-card">
          <div className="metric-icon-box" style={{ background: '#f3e8ff', color: '#9333ea' }}>
            <UserCheck size={24} />
          </div>
          <div className="metric-data">
            <span className="metric-label">Gestores / Managers</span>
            <span className="metric-value">{metrics?.totalManagers || 0}</span>
          </div>
        </div>

        <div className="admin-metric-card">
          <div className="metric-icon-box" style={{ background: '#dcfce7', color: '#16a34a' }}>
            <Database size={24} />
          </div>
          <div className="metric-data">
            <span className="metric-label">Banco de Dados</span>
            <span className="metric-value" style={{ fontSize: '1.05rem', color: '#15803d' }}>
              {metrics?.databaseStatus || 'Conectado'}
            </span>
          </div>
        </div>
      </div>

      {/* Status Feedback Message */}
      {statusMessage && (
        <div className="admin-status-bar">
          <CheckCircle2 size={18} color="#16a34a" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Users Section Table */}
      <div className="admin-table-card">
        <div className="table-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Settings2 size={20} color="#4a90e2" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b' }}>Controle de Usuários e Permissões (RBAC)</h2>
          </div>

          <div className="search-box">
            <Search size={18} color="#94a3b8" />
            <input
              type="text"
              placeholder="Buscar por nome ou e-mail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Usuário / Escalador</th>
                <th>E-mail</th>
                <th>Cargo (Role)</th>
                <th>Checkpoint</th>
                <th>Streak</th>
                <th>Palavras</th>
                <th>Ações de Gestão</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{user.name}</div>
                  </td>
                  <td style={{ color: '#64748b' }}>{user.email}</td>
                  <td>
                    <span className={`role-badge ${user.role.toLowerCase()}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: '#4a90e2' }}>Checkpoint {user.currentCheckpoint}</span>
                  </td>
                  <td>⚡ {user.streakDays} dias</td>
                  <td>✨ {user.totalWordsLearned} palavras</td>
                  <td>
                    {currentUser?.role === 'ADMIN' ? (
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className="role-select"
                      >
                        <option value="USER">USER</option>
                        <option value="MANAGER">MANAGER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Apenas Leitura</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
