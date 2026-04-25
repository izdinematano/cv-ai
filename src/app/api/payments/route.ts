import { NextResponse } from 'next/server';
import { getAllPayments, createPayment, updatePayment, addExtraCredits } from '@/lib/serverDb';
import type { PaymentRequest } from '@/store/useAppStore';

export async function GET() {
  try {
    const payments = await getAllPayments();
    return NextResponse.json({ payments });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, userEmail, mpesaReference, whatsappNumber, note, amountMZN, credits } = body;

    const payment: PaymentRequest = {
      id: Math.random().toString(36).slice(2, 11),
      userId,
      userEmail,
      amountMZN: amountMZN || 100,
      credits: credits || 5,
      mpesaReference: mpesaReference || '',
      whatsappNumber: whatsappNumber || '',
      note: note || '',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    await createPayment(payment);
    return NextResponse.json({ ok: true, payment });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { paymentId, status, reviewerEmail, rejectionReason } = await req.json();
    if (!paymentId || !status) {
      return NextResponse.json({ ok: false, error: 'Missing paymentId or status' }, { status: 400 });
    }

    const update: Partial<PaymentRequest> = {
      status,
      reviewedAt: new Date().toISOString(),
      reviewerEmail,
    };
    if (rejectionReason) update.rejectionReason = rejectionReason;

    const updated = await updatePayment(paymentId, update);
    if (!updated) {
      return NextResponse.json({ ok: false, error: 'Pagamento nao encontrado' }, { status: 404 });
    }

    // If approved, add credits to the user.
    if (status === 'approved') {
      await addExtraCredits(updated.userId, updated.credits);
    }

    return NextResponse.json({ ok: true, payment: updated });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
