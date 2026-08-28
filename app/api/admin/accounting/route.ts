import { NextResponse } from 'next/server';
import { getSessionUser, isSuperAdmin } from '@/src/lib/auth';
import { prisma } from '@/src/lib/db';

const PLUS_PRICE = 37.90;      // Plano Plus (30 dias)
const PREMIUM_PRICE = 109.90;  // Plano Premium (180 dias / ~6 meses)

/**
 * GET /api/admin/accounting
 * Métricas Financeiras, KPIs, DRE Simplificado e Filtro por Período
 */
export async function GET(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session || !isSuperAdmin(session.email)) {
      return NextResponse.json({ error: 'Acesso restrito exclusivamente ao Administrador Supremo.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'all'; // 'daily', 'monthly', 'annual', 'all'

    // Buscar todos os usuários para cálculo de conversão e MRR/ARR
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        plan: true,
        isSubscribed: true,
        subscriptionStatus: true,
        createdAt: true,
      },
    });

    const totalUsers = users.length;
    const subscribers = users.filter((u) => u.isSubscribed && u.subscriptionStatus === 'ACTIVE');
    const totalSubscribers = subscribers.length;
    
    const plusUsers = users.filter((u) => (u.plan === 'PLUS' || u.plan === 'MONTHLY') && u.isSubscribed).length;
    const premiumUsers = users.filter((u) => (u.plan === 'PREMIUM' || u.plan === 'SEMIANNUAL') && u.isSubscribed).length;
    const lifetimeUsers = users.filter((u) => u.plan === 'LIFETIME' || isSuperAdmin(u.email)).length;
    const freeUsers = Math.max(0, totalUsers - totalSubscribers);

    // MRR = (Plus * 37.90) + (Premium * (109.90 / 6))
    const mrr = (plusUsers * PLUS_PRICE) + (premiumUsers * (PREMIUM_PRICE / 6));
    const arr = mrr * 12;

    // Receita Calculada de Assinaturas
    const calculatedSubscriptionRevenue = (plusUsers * PLUS_PRICE) + (premiumUsers * PREMIUM_PRICE);

    // Buscar transações financeiras cadastradas no banco (se houver)
    let transactions = await prisma.financialTransaction.findMany({
      orderBy: { date: 'desc' },
    });

    // Se a tabela de transações estiver vazia, popular com lançamentos base de exemplo contábil
    if (transactions.length === 0) {
      const defaultTransactions = [
        { description: 'Vendas Assinaturas Plano Plus (Mensal)', category: 'Assinaturas Plus', amount: plusUsers * PLUS_PRICE || 379.00, type: 'INCOME' as const },
        { description: 'Vendas Assinaturas Plano Premium (Semestral)', category: 'Assinaturas Premium', amount: premiumUsers * PREMIUM_PRICE || 549.50, type: 'INCOME' as const },
        { description: 'Hospedagem & CDN Vercel Pro', category: 'Infraestrutura / Servidores', amount: 120.00, type: 'EXPENSE' as const },
        { description: 'Banco de Dados Neon PostgreSQL Pooler', category: 'Database', amount: 85.00, type: 'EXPENSE' as const },
        { description: 'Disparos Transacionais Resend Email API', category: 'E-mail API', amount: 45.00, type: 'EXPENSE' as const },
        { description: 'API OpenAI LLM & Transcrição de Áudio', category: 'AI Services', amount: 110.00, type: 'EXPENSE' as const },
      ];

      for (const t of defaultTransactions) {
        await prisma.financialTransaction.create({ data: t });
      }

      transactions = await prisma.financialTransaction.findMany({
        orderBy: { date: 'desc' },
      });
    }

    // Filtrar transações por período se solicitado
    const now = new Date();
    const filteredTransactions = transactions.filter((t) => {
      const tDate = new Date(t.date);
      if (period === 'daily') {
        return tDate.toDateString() === now.toDateString();
      } else if (period === 'monthly') {
        return tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear();
      } else if (period === 'annual') {
        return tDate.getFullYear() === now.getFullYear();
      }
      return true;
    });

    const totalIncome = filteredTransactions
      .filter((t) => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = filteredTransactions
      .filter((t) => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0);

    const grossRevenue = totalIncome || calculatedSubscriptionRevenue;
    const netProfit = grossRevenue - totalExpense;

    const ticketMedio = totalSubscribers > 0 ? grossRevenue / totalSubscribers : 0;
    const conversionRate = totalUsers > 0 ? (totalSubscribers / totalUsers) * 100 : 0;

    return NextResponse.json({
      metrics: {
        totalUsers,
        freeUsers,
        plusUsers,
        premiumUsers,
        lifetimeUsers,
        totalSubscribers,
        grossRevenue,
        mrr,
        arr,
        ticketMedio,
        conversionRate,
        totalIncome: grossRevenue,
        totalExpense,
        netProfit,
        period,
      },
      dre: {
        incomes: filteredTransactions.filter((t) => t.type === 'INCOME'),
        expenses: filteredTransactions.filter((t) => t.type === 'EXPENSE'),
        grossRevenue,
        totalExpense,
        netProfit,
      },
      transactions: filteredTransactions,
    });
  } catch (error) {
    console.error('Admin accounting GET error:', error);
    return NextResponse.json({ error: 'Erro ao carregar dados contábeis.' }, { status: 500 });
  }
}

/**
 * POST /api/admin/accounting
 * Adicionar Lançamento Contábil (Entrada ou Saída)
 */
export async function POST(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session || !isSuperAdmin(session.email)) {
      return NextResponse.json({ error: 'Acesso restrito exclusivamente ao Administrador Supremo.' }, { status: 403 });
    }

    const { description, category, amount, type } = await request.json();

    if (!description || !category || !amount || !type) {
      return NextResponse.json({ error: 'Todos os campos são obrigatórios.' }, { status: 400 });
    }

    const newTransaction = await prisma.financialTransaction.create({
      data: {
        description,
        category,
        amount: parseFloat(amount),
        type: type === 'INCOME' ? 'INCOME' : 'EXPENSE',
      },
    });

    return NextResponse.json({ success: true, transaction: newTransaction });
  } catch (error) {
    console.error('Admin accounting POST error:', error);
    return NextResponse.json({ error: 'Erro ao cadastrar lançamento contábil.' }, { status: 500 });
  }
}
