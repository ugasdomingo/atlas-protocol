# Protocolo Atlas

Landing de conversion + lead magnet gratuito + seguimiento a 3 dias + venta de paquete digital con biblioteca protegida por OTP.

## Stack

- Next.js 15 (App Router) en Vercel
- MongoDB Atlas para leads, ventas, accesos y productos
- Cloudinary para PDFs/MP3 con URLs firmadas
- Stripe para pagos y webhooks
- Resend para emails HTML transaccionales y comerciales
- iron-session para sesiones seguras

## Flujo comercial

1. El visitante deja nombre, email y consentimiento de marketing.
2. La app guarda el lead en MongoDB y envia el PDF gratuito por Resend.
3. Tres dias despues, el cron `/api/cron/follow-up` envia el email de seguimiento y oferta.
4. Si compra el paquete de $47 USD, Stripe dispara el webhook.
5. El webhook registra la venta, crea el acceso y marca el lead como convertido.
6. El comprador entra a `/acceso` con email + OTP y descarga PDFs/MP3 desde `/biblioteca`.

## Setup

### 1. Variables de entorno

```bash
cp .env.example .env.local
```

Rellena MongoDB, Stripe, Cloudinary, Resend, sesion, cron y URL publica.

### 2. Contenido

Coloca los archivos en `content/`:

- `estrategia-3-dias.pdf` para el lead magnet gratuito
- `en-realidad-amo.pdf`
- `hombre-proveedor.pdf`
- cualquier audio `.mp3` del paquete pago

Sube todo a Cloudinary:

```bash
npm run upload-content
```

El lead magnet usa por defecto:

```env
LEAD_MAGNET_PUBLIC_ID=protocolo-atlas/estrategia-3-dias
LEAD_MAGNET_FILENAME=Estrategia gratuita 3 dias.pdf
```

### 3. Base de datos y producto

```bash
npm run seed
```

El script crea indices, guarda el producto pago y detecta automaticamente los MP3 presentes en `content/`.

### 4. Desarrollo local

En Windows usa:

```bash
npm.cmd run dev
```

### 5. Produccion

1. Importa el repo en Vercel.
2. Configura las variables de `.env.example`.
3. Configura el dominio en Vercel.
4. Configura el webhook Stripe en `https://TU-DOMINIO/api/stripe/webhook` escuchando `checkout.session.completed`.
5. Configura dominio verificado en Resend para `EMAIL_FROM`.
6. Cambia `NEXT_PUBLIC_APP_URL=https://TU-DOMINIO`.

## Cron

`vercel.json` ejecuta diariamente:

```text
/api/cron/follow-up
```

El endpoint requiere `Authorization: Bearer CRON_SECRET`.

## Verificacion antes de vender

- `npm.cmd run build`
- enviar un lead real y confirmar que llega el PDF
- adelantar un lead en MongoDB o ejecutar el cron manualmente para probar el follow-up
- hacer compra Stripe en test/live
- verificar venta en `/admin`
- entrar a `/biblioteca` y descargar PDFs/MP3
