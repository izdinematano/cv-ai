import { NextResponse } from 'next/server';
import { initiateC2BPayment, getFriendlyError } from '@/lib/mpesa';
import { createPayment, addExtraCredits, updatePayment, getAdminSettings } from '@/lib/serverDb';
import type { PaymentRequest } from '@/store/useAppStore';

/**
 * POST /api/mpesa/pay
 *
 * Initiates a real M-Pesa C2B payment. The M-Pesa gateway sends a USSD
 * push to the customer's phone; when the customer confirms with their PIN,
 * the synchronous response tells us if payment succeeded.
 *
 * On success, a PaymentRequest with status 'approved' is created and the
 * user's credits are added automatically — no admin approval needed.
 */
export async function POST(req: Request) {
  try {
    const { userId, userEmail, phoneNumber, amount, credits } = await req.json();

    if (!userId || !phoneNumber) {
      return NextResponse.json(
        { ok: false, error: 'userId e phoneNumber são obrigatórios.' },
        { status: 400 }
      );
    }

    // Normalise phone number: strip spaces, ensure 258 prefix.
    let msisdn = phoneNumber.replace(/[\s\-+]/g, '');
    if (msisdn.startsWith('0')) {
      msisdn = '258' + msisdn.slice(1);
    }
    if (!msisdn.startsWith('258')) {
      msisdn = '258' + msisdn;
    }

    const settings = await getAdminSettings();
    const payAmount = amount || settings.pricePerPackMZN;
    const payCredits = credits || settings.creditsPerPack;

    // Generate unique references
    const txRef = `CV${Date.now().toString(36).toUpperCase()}`;
    const thirdPartyRef = `CVG${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    // Create a pending payment record first
    const paymentRecord: PaymentRequest = {
      id: Math.random().toString(36).slice(2, 11),
      userId,
      userEmail: userEmail || '',
      amountMZN: payAmount,
      credits: payCredits,
      mpesaReference: txRef,
      whatsappNumber: msisdn,
      note: `M-Pesa automático · ${msisdn}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    await createPayment(paymentRecord);

    // Call M-Pesa
    const result = await initiateC2BPayment({
      customerMSISDN: msisdn,
      amount: String(payAmount),
      transactionReference: txRef,
      thirdPartyReference: thirdPartyRef,
    });

    if (result.ok) {
      // Payment succeeded — auto-approve and add credits.
      await updatePayment(paymentRecord.id, {
        status: 'approved',
        reviewedAt: new Date().toISOString(),
        reviewerEmail: 'mpesa-auto',
        mpesaReference: result.transactionId || txRef,
      } as Partial<PaymentRequest>);
      await addExtraCredits(userId, payCredits);

      return NextResponse.json({
        ok: true,
        transactionId: result.transactionId,
        conversationId: result.conversationId,
        credits: payCredits,
        message: `Pagamento de ${payAmount} MZN confirmado! ${payCredits} créditos adicionados.`,
      });
    } else {
      // Payment failed — update record to rejected.
      await updatePayment(paymentRecord.id, {
        status: 'rejected',
        reviewedAt: new Date().toISOString(),
        reviewerEmail: 'mpesa-auto',
        rejectionReason: result.error || getFriendlyError(result.responseCode),
      } as Partial<PaymentRequest>);

      return NextResponse.json(
        {
          ok: false,
          responseCode: result.responseCode,
          error: getFriendlyError(result.responseCode),
        },
        { status: 400 }
      );
    }
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: `Erro interno: ${String(err)}` },
      { status: 500 }
    );
  }
}
