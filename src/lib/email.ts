import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY || '';
const emailFrom = process.env.EMAIL_FROM || 'Sara Core <onboarding@resend.dev>';
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

const resend = resendApiKey ? new Resend(resendApiKey) : null;

/**
 * Send Password Reset Email via Resend
 */
export async function sendPasswordResetEmail(email: string, token: string) {
  const resetLink = `${appUrl}/reset-password?token=${token}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Outfit', -apple-system, sans-serif; background-color: #f1f5f9; color: #1e293b; margin: 0; padding: 20px; }
          .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 20px; padding: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); }
          .header { text-align: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 25px; }
          .title { font-size: 24px; font-weight: 800; color: #4a90e2; margin: 0; }
          .subtitle { font-size: 14px; color: #64748b; margin-top: 5px; }
          .content { line-height: 1.6; font-size: 16px; }
          .btn-container { text-align: center; margin: 30px 0; }
          .btn { background: #4a90e2; color: #ffffff !important; padding: 14px 28px; border-radius: 12px; font-weight: 700; text-decoration: none; display: inline-block; box-shadow: 0 4px 12px rgba(74,144,226,0.35); }
          .footer { text-align: center; font-size: 12px; color: #94a3b8; margin-top: 30px; border-top: 1px solid #f1f5f9; padding-top: 15px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="title">Sara Core — Paul Ortiz</h1>
            <p class="subtitle">Plataforma de Aprendizado & Escalada da Montanha</p>
          </div>
          <div class="content">
            <p>Olá,</p>
            <p>Recebemos uma solicitação para redefinir a senha da sua conta na plataforma <strong>Sara Core</strong>.</p>
            <p>Clique no botão abaixo para escolher uma nova senha de acesso. Este link é válido por <strong>1 hora</strong>:</p>
            <div class="btn-container">
              <a href="${resetLink}" class="btn">Redefinir Minha Senha</a>
            </div>
            <p style="font-size: 13px; color: #64748b;">Se você não solicitou a redefinição de senha, por favor ignore este e-mail.</p>
          </div>
          <div class="footer">
            © ${new Date().getFullYear()} Sara Core & Paul Ortiz. Todos os direitos reservados.
          </div>
        </div>
      </body>
    </html>
  `;

  console.log(`[RESEND EMAIL] Disparando e-mail de redefinição para ${email} | Link: ${resetLink}`);

  if (!resend || resendApiKey.startsWith('re_123456789')) {
    console.log(`[RESEND SIMULAÇÃO] Chave API não configurada ou placeholder. E-mail simulado com sucesso.`);
    return { success: true, simulated: true, resetLink };
  }

  try {
    const data = await resend.emails.send({
      from: emailFrom,
      to: [email],
      subject: 'Redefinição de Senha — Sara Core / Paul Ortiz',
      html,
    });
    return { success: true, data };
  } catch (error) {
    console.error('[RESEND ERRO]', error);
    return { success: false, error };
  }
}

/**
 * Send Welcome Email via Resend
 */
export async function sendWelcomeEmail(email: string, name: string, role: string) {
  const loginLink = `${appUrl}/login`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Outfit', -apple-system, sans-serif; background-color: #f1f5f9; color: #1e293b; margin: 0; padding: 20px; }
          .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 20px; padding: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); }
          .header { text-align: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 25px; }
          .title { font-size: 24px; font-weight: 800; color: #4a90e2; margin: 0; }
          .subtitle { font-size: 14px; color: #64748b; margin-top: 5px; }
          .content { line-height: 1.6; font-size: 16px; }
          .badge { display: inline-block; background: #dbeafe; color: #1e40af; font-weight: 700; padding: 4px 12px; border-radius: 999px; font-size: 13px; }
          .btn-container { text-align: center; margin: 30px 0; }
          .btn { background: #4a90e2; color: #ffffff !important; padding: 14px 28px; border-radius: 12px; font-weight: 700; text-decoration: none; display: inline-block; box-shadow: 0 4px 12px rgba(74,144,226,0.35); }
          .footer { text-align: center; font-size: 12px; color: #94a3b8; margin-top: 30px; border-top: 1px solid #f1f5f9; padding-top: 15px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="title">Bem-vindo(a) à Sara Core! 🏔️</h1>
            <p class="subtitle">Sua Jornada de Aprendizado de Inglês Começou</p>
          </div>
          <div class="content">
            <p>Olá <strong>${name}</strong>,</p>
            <p>Sua conta foi criada com sucesso na plataforma <strong>Sara Core</strong>!</p>
            <p>Nível de Acesso Atribuído: <span class="badge">${role}</span></p>
            <p>Você já pode personalizar seu avatar de escalada e iniciar a subida pelos 16 checkpoints da montanha.</p>
            <div class="btn-container">
              <a href="${loginLink}" class="btn">Acessar Minha Conta</a>
            </div>
          </div>
          <div class="footer">
            © ${new Date().getFullYear()} Sara Core & Paul Ortiz. Todos os direitos reservados.
          </div>
        </div>
      </body>
    </html>
  `;

  console.log(`[RESEND EMAIL] Disparando e-mail de boas-vindas para ${email}`);

  if (!resend || resendApiKey.startsWith('re_123456789')) {
    return { success: true, simulated: true };
  }

  try {
    const data = await resend.emails.send({
      from: emailFrom,
      to: [email],
      subject: 'Bem-vindo(a) à Plataforma Sara Core! 🚀',
      html,
    });
    return { success: true, data };
  } catch (error) {
    console.error('[RESEND ERRO]', error);
    return { success: false, error };
  }
}
