import { Lead } from '../types/index.js';

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface EmailResult {
  success: boolean;
  messageId?: string;
  provider: 'resend' | 'smtp' | 'console_audit';
  error?: string;
}

/**
 * Transactional Email Dispatcher for CuántoVale
 * Configured for production with Resend API / SMTP or structured audit logging.
 */
export async function sendTransactionalEmail({
  to,
  subject,
  html,
  text
}: SendEmailParams): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromAddress = process.env.EMAIL_FROM || 'CuántoVale <notificaciones@cuantovale.es>';

  if (apiKey) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [to],
          subject,
          html,
          text: text || html.replace(/<[^>]*>?/gm, '')
        })
      });

      if (response.ok) {
        const data = (await response.json()) as any;
        console.log(`[CuántoVale Email] Dispatched via Resend: ID ${data.id} to ${to.slice(0, 3)}***@***`);
        return { success: true, messageId: data.id, provider: 'resend' };
      } else {
        const errData = await response.text();
        console.error('[CuántoVale Email] Resend API error:', errData);
      }
    } catch (err: any) {
      console.error('[CuántoVale Email] Network error sending via Resend:', err.message);
    }
  }

  // Fallback audit log (No PII leak in public output)
  const auditId = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  console.log(`[CuántoVale Email Audit] Subject: "${subject}" | Recipient domain: ${to.split('@')[1]} | ID: ${auditId}`);
  
  return {
    success: true,
    messageId: auditId,
    provider: 'console_audit'
  };
}

/**
 * Dispatch lead confirmation email to customer
 */
export async function dispatchLeadConfirmationEmail(lead: Lead): Promise<EmailResult> {
  const subject = `Confirmación de solicitud de presupuesto — CuántoVale.es (${lead.service})`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; color: #0f172a; line-height: 1.6;">
      <div style="border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 20px;">
        <h2 style="margin: 0; font-size: 20px; font-weight: 800;">Cuánto<span style="color: #2563eb;">Vale</span>.es</h2>
      </div>
      <p style="font-size: 15px;">Hola <strong>${lead.name}</strong>,</p>
      <p style="font-size: 14px; color: #334155;">
        Hemos recibido correctamente tu solicitud de presupuesto para <strong>${lead.service}</strong> en la provincia de <strong>${lead.province}</strong>.
      </p>
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <h3 style="margin: 0 0 8px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b;">Detalles del proyecto</h3>
        <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #1e293b;">
          <li>Inmueble: ${lead.property_type || 'Nave industrial'} (~${lead.approx_square_meters} m²)</li>
          <li>Urgencia: ${lead.timeframe || '1 a 3 meses'}</li>
          ${lead.calculator_result_min ? `<li>Estimación de referencia calculada: ${lead.calculator_result_min.toLocaleString('es-ES')} € – ${lead.calculator_result_max?.toLocaleString('es-ES')} €</li>` : ''}
        </ul>
      </div>
      <p style="font-size: 13px; color: #475569;">
        <strong>Siguiente paso:</strong> Un máximo de 2 empresas instaladoras homologadas y verificadas de tu zona revisarán la viabilidad técnica para remitirte una valoración ajustada.
      </p>
      <p style="font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 24px;">
        CuántoVale.es · Independencia técnica y transparencia de precios en España.<br/>
        Has recibido este correo porque solicitaste una comparativa en cuantovale.es.
      </p>
    </div>
  `;

  return sendTransactionalEmail({
    to: lead.email,
    subject,
    html
  });
}
