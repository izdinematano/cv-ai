import nodemailer from 'nodemailer';

/**
 * Simple email helper using nodemailer.
 *
 * Configure these environment variables:
 *   SMTP_HOST, SMTP_PORT (default 587),
 *   SMTP_USER, SMTP_PASS,
 *   SMTP_FROM (default noreply@cv.moztraders.com)
 */

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: Number(process.env.SMTP_PORT || 587) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const DEFAULT_FROM = process.env.SMTP_FROM || 'noreply@cv.moztraders.com';

export async function sendPasswordResetEmail(to: string, resetUrl: string, fullName: string) {
  await transporter.sendMail({
    from: `"CV Gen AI" <${DEFAULT_FROM}>`,
    to,
    subject: 'Repor a sua senha',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; color: #1f2937;">
        <h2 style="color: #111827;">Olá ${fullName},</h2>
        <p>Recebemos um pedido para repor a sua senha no CV Gen AI.</p>
        <p>Clique no botão abaixo para criar uma nova senha:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: #3b82f6; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600;">
          Repor senha
        </a>
        <p style="font-size: 12px; color: #6b7280; margin-top: 24px;">
          Se não pediste isto, ignora este email. O link expira em 1 hora.
        </p>
      </div>
    `,
    text: `Olá ${fullName},\n\nRecebemos um pedido para repor a sua senha no CV Gen AI.\n\nClica aqui: ${resetUrl}\n\nO link expira em 1 hora. Se não pediste isto, ignora este email.`,
  });
}
