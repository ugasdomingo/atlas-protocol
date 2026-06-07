import { Resend } from "resend";
import { env } from "./env";

const resend = new Resend(env.RESEND_API_KEY);

const brand = {
  name: "Protocolo Atlas",
  productName: "Protocolo Atlas - Paquete completo",
  price: "$47 USD",
  appUrl: env.NEXT_PUBLIC_APP_URL,
};

function baseEmail({
  preheader,
  title,
  body,
}: {
  preheader: string;
  title: string;
  body: string;
}) {
  return `
<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
  </head>
  <body style="margin:0;background:#080808;color:#f5f5f5;font-family:Inter,Arial,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;color:transparent;">${preheader}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#080808;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;border:1px solid #262626;background:#111111;">
            <tr>
              <td style="padding:32px 28px 18px;border-bottom:1px solid #262626;">
                <div style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#a3a3a3;">${brand.name}</div>
                <h1 style="margin:14px 0 0;font-size:30px;line-height:1.05;color:#ffffff;">${title}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:28px;color:#d4d4d4;font-size:16px;line-height:1.65;">
                ${body}
              </td>
            </tr>
            <tr>
              <td style="padding:22px 28px;border-top:1px solid #262626;color:#737373;font-size:12px;line-height:1.5;">
                Recibes este correo porque solicitaste informacion de ${brand.name} y aceptaste recibir comunicaciones. Puedes responder a este email si necesitas ayuda.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function cta(label: string, href: string) {
  return `
    <p style="margin:28px 0;">
      <a href="${href}" style="display:inline-block;background:#ffffff;color:#080808;text-decoration:none;font-weight:700;padding:14px 20px;border-radius:6px;">
        ${label}
      </a>
    </p>`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function renderLeadMagnetEmail({
  name,
  downloadUrl,
}: {
  name: string;
  downloadUrl: string;
}) {
  const safeName = escapeHtml(name);

  return baseEmail({
    preheader: "Tu estrategia gratuita de 3 dias ya esta lista.",
    title: "Tu plan de 3 dias",
    body: `
      <p style="margin:0 0 16px;">Hola ${safeName},</p>
      <p style="margin:0 0 16px;">Aqui tienes la estrategia gratuita de 3 dias. Es breve, directa y esta pensada para que la ejecutes sin esperar a sentirte listo.</p>
      ${cta("Descargar el PDF", downloadUrl)}
      <p style="margin:0;color:#a3a3a3;font-size:14px;">El enlace es privado y estara disponible por tiempo limitado. En 3 dias te escribire para saber como te fue.</p>
    `,
  });
}

export function renderFollowUpOfferEmail({
  name,
  offerUrl,
}: {
  name: string;
  offerUrl: string;
}) {
  const safeName = escapeHtml(name);

  return baseEmail({
    preheader: "Si el plan de 3 dias te movio, este es el siguiente paso.",
    title: "Como te fue con el plan?",
    body: `
      <p style="margin:0 0 16px;">Hola ${safeName},</p>
      <p style="margin:0 0 16px;">Hace 3 dias descargaste la estrategia gratuita. Si la hiciste con honestidad, ya deberias tener mas claridad sobre donde estas perdiendo direccion, energia o foco.</p>
      <p style="margin:0 0 16px;">El siguiente paso es el paquete completo: las guias centrales de ${brand.name} y los audios para trabajarlo en movimiento, sin depender de motivacion.</p>
      <p style="margin:0 0 16px;"><strong style="color:#ffffff;">${brand.productName}</strong><br />Pago unico: <strong style="color:#ffffff;">${brand.price}</strong></p>
      ${cta("Ver el paquete completo", offerUrl)}
      <p style="margin:0;color:#a3a3a3;font-size:14px;">No es una suscripcion. Compras una vez y accedes a tu biblioteca privada.</p>
    `,
  });
}

export async function sendLeadMagnetEmail({
  to,
  name,
  downloadUrl,
}: {
  to: string;
  name: string;
  downloadUrl: string;
}): Promise<void> {
  await resend.emails.send({
    from: env.EMAIL_FROM,
    to,
    subject: "Tu estrategia gratuita de 3 dias - Protocolo Atlas",
    html: renderLeadMagnetEmail({ name, downloadUrl }),
  });
}

export async function sendFollowUpOfferEmail({
  to,
  name,
}: {
  to: string;
  name: string;
}): Promise<void> {
  await resend.emails.send({
    from: env.EMAIL_FROM,
    to,
    subject: "Como te fue con el plan de 3 dias?",
    html: renderFollowUpOfferEmail({
      name,
      offerUrl: `${brand.appUrl}/?offer=protocolo-atlas`,
    }),
  });
}

export async function sendOtpEmail(to: string, otp: string): Promise<void> {
  await resend.emails.send({
    from: env.EMAIL_FROM,
    to,
    subject: "Tu codigo de acceso - Protocolo Atlas",
    html: baseEmail({
      preheader: "Usa este codigo para entrar a tu biblioteca.",
      title: "Codigo de acceso",
      body: `
        <p style="margin:0 0 16px;">Tu codigo de acceso es:</p>
        <div style="background:#ffffff;color:#080808;border-radius:6px;padding:22px;text-align:center;margin:24px 0;">
          <span style="font-size:38px;font-weight:800;letter-spacing:8px;">${otp}</span>
        </div>
        <p style="margin:0;color:#a3a3a3;font-size:14px;">Este codigo expira en 10 minutos. No lo compartas con nadie.</p>
      `,
    }),
  });
}

export async function sendPurchaseConfirmationEmail(
  to: string,
  name: string
): Promise<void> {
  const safeName = escapeHtml(name || "Atlas");

  await resend.emails.send({
    from: env.EMAIL_FROM,
    to,
    subject: "Compra confirmada - Protocolo Atlas",
    html: baseEmail({
      preheader: "Tu biblioteca privada esta lista.",
      title: "Compra confirmada",
      body: `
        <p style="margin:0 0 16px;">Hola ${safeName},</p>
        <p style="margin:0 0 16px;">Tu compra ha sido confirmada. Puedes entrar a tu biblioteca con el email que usaste en el pago.</p>
        ${cta("Acceder a mi biblioteca", `${brand.appUrl}/acceso`)}
        <p style="margin:0;color:#a3a3a3;font-size:14px;">Te enviaremos un codigo de verificacion cada vez que ingreses.</p>
      `,
    }),
  });
}
