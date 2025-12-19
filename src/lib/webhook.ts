import { formatPhoneE164, formatCurrencyBRL, formatDateTime } from './formatters';

// Configuration - these should be environment variables in production
const WEBHOOK_URL = 'https://your-webhook-url.com/webhook'; // Replace with actual webhook
const CLEANPOOL_WHATSAPP = '+5544999999999'; // Replace with actual Clean Pool number

export interface ServiceFormData {
  servico: string;
  profissional: string;
  telefone: string;
  valor: number;
  observacoes: string;
}

export function buildWhatsAppMessage(data: ServiceFormData): string {
  const formattedPhone = formatPhoneE164(data.telefone);
  const formattedValue = formatCurrencyBRL(data.valor);
  const dateTime = formatDateTime();
  const obs = data.observacoes.trim() || '—';

  return `🧾 *Relatório de Serviço — Clean Pool*
• *Serviço:* ${data.servico}
• *Profissional:* ${data.profissional}
• *Cliente (WhatsApp):* ${formattedPhone}
• *Valor cobrado:* ${formattedValue}
• *Observações:* ${obs}

⏱️ *Data/Hora:* ${dateTime}`;
}

export interface WebhookPayload {
  recipients: string[];
  message: string;
  data: {
    servico: string;
    profissional: string;
    telefone_cliente: string;
    observacoes: string;
    valor_cobrado: number;
  };
  source: 'cleanpool-form';
}

export function buildWebhookPayload(data: ServiceFormData): WebhookPayload {
  const normalizedPhone = formatPhoneE164(data.telefone);
  const message = buildWhatsAppMessage(data);

  return {
    recipients: [normalizedPhone, CLEANPOOL_WHATSAPP],
    message,
    data: {
      servico: data.servico,
      profissional: data.profissional,
      telefone_cliente: normalizedPhone,
      observacoes: data.observacoes.trim() || '',
      valor_cobrado: data.valor,
    },
    source: 'cleanpool-form',
  };
}

export async function sendWebhook(data: ServiceFormData): Promise<{ success: boolean; error?: string }> {
  const payload = buildWebhookPayload(data);

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Webhook error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao enviar dados',
    };
  }
}
