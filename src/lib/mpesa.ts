/**
 * M-Pesa C2B (Customer to Business) payment integration.
 *
 * Flow:
 *   1. Encrypt the API key with M-Pesa's RSA public key → Bearer token.
 *   2. POST to the C2B singleStage endpoint with customer MSISDN + amount.
 *   3. M-Pesa sends a USSD push to the customer's phone.
 *   4. Customer confirms with their PIN → synchronous response arrives.
 *
 * Environment variables required:
 *   MPESA_API_KEY        — from the M-Pesa developer portal
 *   MPESA_PUBLIC_KEY     — RSA public key from the M-Pesa developer portal
 *   MPESA_SERVICE_PROVIDER_CODE — your business shortcode (e.g. 171717 for sandbox)
 *   MPESA_ENV            — "sandbox" | "production" (default: sandbox)
 */

import crypto from 'crypto';

/* ------------------------------------------------------------------ */
/* Config                                                              */
/* ------------------------------------------------------------------ */

const isSandbox = (process.env.MPESA_ENV || 'sandbox') === 'sandbox';

const MPESA_HOST = isSandbox ? 'api.sandbox.vm.co.mz' : 'api.vm.co.mz';
const MPESA_PORT = 18352;
const MPESA_PATH = '/ipg/v1x/c2bPayment/singleStage/';
const MPESA_ORIGIN = 'developer.mpesa.vm.co.mz';

/* ------------------------------------------------------------------ */
/* Token generation                                                    */
/* ------------------------------------------------------------------ */

/**
 * Generates the Bearer token by RSA-encrypting the API key with the
 * M-Pesa public key, then base64-encoding the ciphertext.
 */
function generateBearerToken(): string {
  const apiKey = process.env.MPESA_API_KEY;
  const publicKeyBase64 = process.env.MPESA_PUBLIC_KEY;

  if (!apiKey || !publicKeyBase64) {
    throw new Error('MPESA_API_KEY and MPESA_PUBLIC_KEY must be set in environment variables.');
  }

  // Wrap the base64 public key in PEM format.
  const pem = `-----BEGIN PUBLIC KEY-----\n${publicKeyBase64}\n-----END PUBLIC KEY-----`;

  const encrypted = crypto.publicEncrypt(
    {
      key: pem,
      padding: crypto.constants.RSA_PKCS1_PADDING,
    },
    Buffer.from(apiKey)
  );

  return encrypted.toString('base64');
}

/* ------------------------------------------------------------------ */
/* C2B Payment                                                         */
/* ------------------------------------------------------------------ */

export interface C2BPaymentInput {
  /** Customer phone number in international format, e.g. "258843330333" */
  customerMSISDN: string;
  /** Amount in MZN, e.g. "100" */
  amount: string;
  /** Unique transaction reference from your system */
  transactionReference: string;
  /** Unique third-party reference for tracking */
  thirdPartyReference: string;
}

export interface C2BPaymentResult {
  ok: boolean;
  conversationId?: string;
  transactionId?: string;
  responseCode?: string;
  responseDesc?: string;
  thirdPartyReference?: string;
  error?: string;
  httpStatus?: number;
}

export async function initiateC2BPayment(input: C2BPaymentInput): Promise<C2BPaymentResult> {
  const serviceProviderCode = process.env.MPESA_SERVICE_PROVIDER_CODE || '171717';

  let token: string;
  try {
    token = generateBearerToken();
  } catch (err) {
    return { ok: false, error: `Token generation failed: ${String(err)}` };
  }

  const body = JSON.stringify({
    input_TransactionReference: input.transactionReference,
    input_CustomerMSISDN: input.customerMSISDN,
    input_Amount: input.amount,
    input_ThirdPartyReference: input.thirdPartyReference,
    input_ServiceProviderCode: serviceProviderCode,
  });

  const url = `https://${MPESA_HOST}:${MPESA_PORT}${MPESA_PATH}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        Origin: MPESA_ORIGIN,
      },
      body,
    });

    const data = await response.json();

    if (data.output_ResponseCode === 'INS-0') {
      return {
        ok: true,
        conversationId: data.output_ConversationID,
        transactionId: data.output_TransactionID,
        responseCode: data.output_ResponseCode,
        responseDesc: data.output_ResponseDesc,
        thirdPartyReference: data.output_ThirdPartyReference,
        httpStatus: response.status,
      };
    }

    return {
      ok: false,
      responseCode: data.output_ResponseCode,
      responseDesc: data.output_ResponseDesc,
      error: data.output_ResponseDesc || `M-Pesa error: ${data.output_ResponseCode}`,
      httpStatus: response.status,
    };
  } catch (err) {
    return {
      ok: false,
      error: `Network error: ${String(err)}`,
    };
  }
}

/* ------------------------------------------------------------------ */
/* Friendly error messages (Portuguese)                                */
/* ------------------------------------------------------------------ */

const ERROR_MESSAGES: Record<string, string> = {
  'INS-0': 'Pagamento processado com sucesso.',
  'INS-1': 'Erro interno no M-Pesa. Tente novamente.',
  'INS-2': 'Chave de API inválida.',
  'INS-4': 'Utilizador não está activo.',
  'INS-5': 'Pagamento cancelado pelo cliente.',
  'INS-6': 'Pagamento falhou.',
  'INS-9': 'Tempo de espera esgotado. Tente novamente.',
  'INS-10': 'Transação duplicada.',
  'INS-13': 'Shortcode do negócio inválido.',
  'INS-15': 'Valor inválido.',
  'INS-16': 'Serviço temporariamente indisponível.',
  'INS-2001': 'Erro de autenticação.',
  'INS-2006': 'Saldo insuficiente.',
  'INS-2051': 'Número de telefone inválido.',
};

export function getFriendlyError(responseCode: string | undefined): string {
  if (!responseCode) return 'Erro desconhecido.';
  return ERROR_MESSAGES[responseCode] || `Erro M-Pesa (${responseCode}).`;
}
