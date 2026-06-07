# Protocolo Atlas

Landing de venta para Protocolo Atlas: PDF gratuito, seguimiento por email a 3 dias, compra con Stripe y biblioteca privada para descargar PDFs/audios.

## Que hace

- Captura nombre, email y consentimiento para enviar el PDF gratuito.
- Guarda leads, ventas y accesos en MongoDB Atlas.
- Envia emails con Resend.
- Cobra el paquete pago con Stripe Checkout.
- Entrega PDFs y audios desde Cloudinary con URLs firmadas.
- Permite volver a entrar a la biblioteca con email + codigo OTP.
- Ejecuta un cron diario para enviar el follow-up comercial 3 dias despues.

## Stack necesario

- Next.js 15 en Vercel
- MongoDB Atlas
- Cloudinary
- Stripe
- Resend

## Variables de entorno

```env
MONGODB_URI=
MONGODB_DB=protocolo_atlas

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

LEAD_MAGNET_PUBLIC_ID=protocolo-atlas/estrategia-3-dias
LEAD_MAGNET_FILENAME=Estrategia gratuita 3 dias.pdf

RESEND_API_KEY=
EMAIL_FROM=Protocolo Atlas <noreply@protocoloatlas.com>

IRON_SESSION_PASSWORD=
ADMIN_EMAIL=

CRON_SECRET=
TAX_RATE_PCT=19
NEXT_PUBLIC_APP_URL=https://tu-dominio.com
```

`IRON_SESSION_PASSWORD` y `CRON_SECRET` deben tener minimo 32 caracteres.

## Contenido

Coloca los archivos fuente en `content/`:

- `estrategia-3-dias.pdf`
- `en-realidad-amo.pdf`
- `hombre-proveedor.pdf`
- audios `.mp3`

Sube los assets a Cloudinary:

```bash
npm run upload-content
```

Crea indices y producto en MongoDB:

```bash
npm run seed
```

Los MP3 en `content/` se detectan automaticamente y se agregan al producto pago.

## Produccion

1. Importa el repo en Vercel.
2. Configura las variables de entorno.
3. Configura el webhook Stripe:

```text
https://TU-DOMINIO/api/stripe/webhook
```

Evento:

```text
checkout.session.completed
```

4. Verifica dominio en Resend para `EMAIL_FROM`.
5. Sube contenido a Cloudinary y corre `npm run seed`.

## Verificacion

```bash
npm run build
```

Luego prueba:

- enviar el PDF gratuito
- recibir el email
- comprar con Stripe test
- entrar a `/acceso`
- descargar desde `/biblioteca`
