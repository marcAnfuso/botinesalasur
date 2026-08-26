# MercadoPago: credenciales y avisos de pago

Para que la tienda cobre y confirme los pagos hacen falta dos cosas de la cuenta
de MercadoPago que recibe la plata:

1. Un **Access Token** (la credencial con la que la web le pide a MercadoPago que
   cobre).
2. Un **webhook** (la dirección a la que MercadoPago avisa cuando alguien pagó).

Sin el token no se puede cobrar. Sin el webhook el pedido queda pendiente para
siempre: no baja el stock y no sale ningún mail, aunque el pago haya entrado.

> El token que hoy está cargado en Vercel es de origen desconocido. **Se reemplaza
> por el de la cuenta de Fede**; no se usa para nada.

---

## Parte A — Crear la aplicación y sacar las credenciales

Lo hace Fede, desde una computadora, con la cuenta de MercadoPago **que va a
recibir la plata de las ventas**.

**1. Entrar al panel de desarrolladores**

```
https://www.mercadopago.com.ar/developers/panel
```

Iniciar sesión con la cuenta de la tienda.

**2. Crear la aplicación**

- **Tus integraciones** → **Crear aplicación**.
- Nombre: `Botinesala Sur`.
- ¿Qué producto integrás? → **Pagos online**.
- ¿Qué solución? → **Checkout Pro** (la web manda al cliente a pagar a
  MercadoPago y vuelve; no es checkout embebido).
- ¿Usás una plataforma de e-commerce? → **No**.
- Crear.

**3. Copiar las credenciales de producción**

Dentro de la aplicación → **Credenciales de producción**. Puede pedir completar
datos del negocio (rubro, sitio web: `https://botinesalasur.com.ar`) antes de
habilitarlas.

Lo que hace falta es el **Access Token** (empieza con `APP_USR-`). El Public Key
no se usa.

**4. Copiar también las credenciales de prueba**

En la misma aplicación → **Credenciales de prueba** → **Access Token** (empieza
con `TEST-`). Sirven para simular compras completas sin mover un peso.

> **Las credenciales no viajan por WhatsApp ni por mail.** Son la llave para
> cobrar en la cuenta. Se pasan en persona, por un gestor de contraseñas
> compartido, o con un link de un solo uso (por ejemplo onetimesecret.com).

---

## Parte B — Cargar las credenciales en Vercel

Lo hace quien tenga acceso a Vercel (Marc), con lo que le pasó Fede.

Proyecto **botinesalasur** → **Settings** → **Environment Variables**:

| Variable | Valor |
|---|---|
| `MERCADOPAGO_ACCESS_TOKEN` | el `APP_USR-…` de Fede (reemplaza al que está) |
| `MERCADOPAGO_WEBHOOK_SECRET` | la clave secreta que muestra el panel al guardar el webhook (Parte C, paso 5) |
| `NEXT_PUBLIC_BASE_URL` | `https://botinesalasur.com.ar` |

Para probar sin cobrar, cargar primero el `TEST-…` en `MERCADOPAGO_ACCESS_TOKEN`
y cambiarlo por el `APP_USR-…` cuando la prueba salga bien.

Después de cualquier cambio hay que **redesplegar**: las variables se resuelven
al construir el sitio.

---

## Parte C — Configurar el webhook

Lo hace Fede, en la misma aplicación que creó en la Parte A.

**1. Entrar a Webhooks**

Menú lateral de la aplicación → **Webhooks** (puede figurar como
*Notificaciones → Webhooks*).

**2. Configurar los dos modos**

Hay dos configuraciones separadas e independientes: **Modo pruebas** y **Modo
productivo**. Cargar la misma dirección en las dos. Si se configura una sola y
se prueba con la otra, no llega nada y parece que está roto.

**3. Pegar la dirección de la tienda**

```
https://botinesalasur.com.ar/api/mercadopago/webhook
```

Tal cual: con `https` y sin barra al final.

**4. Marcar solo el evento de pagos**

Tildar **Pagos** (`payment`). Los demás no hacen falta.

**5. Guardar**

MercadoPago muestra una **clave secreta**. Va a Vercel como
`MERCADOPAGO_WEBHOOK_SECRET` (Parte B). Con ella cargada, la tienda rechaza con
401 cualquier aviso que no venga firmado por MercadoPago.

**6. Probar con el simulador**

En la misma pantalla, **simular una notificación** con el evento de pagos. Tiene
que responder **200**.

---

## Cómo saber si quedó andando

De lo más rápido a lo que confirma de verdad:

1. **El simulador devuelve 200.** MercadoPago llega a la dirección.
2. **Aparece en los logs de Vercel.** Proyecto → **Logs**: tiene que figurar la
   llamada a `/api/mercadopago/webhook`.
3. **Una compra de prueba cambia el pedido.** Esta es la que vale. Con el token
   `TEST-` cargado, comprar algo en la web y verificar en `/admin/pedidos` que el
   pedido pase de *Pendiente* a *Confirmado*, que baje el stock del talle y que
   llegue el mail de confirmación.

Para pagar en modo prueba MercadoPago no acepta una cuenta real: hay que usar un
**usuario comprador de prueba** (en el panel: *Cuentas de prueba* → crear una de
tipo comprador) o las **tarjetas de prueba** que MercadoPago publica en su
documentación.

---

## Dos cosas que conviene saber

**La tienda siempre responde 200**, incluso si algo falla al procesar el aviso.
Es a propósito: si devolviera un error, MercadoPago reintentaría en loop y podría
cortar la suscripción. Los problemas quedan en los logs de Vercel.

**La firma se valida si la clave está cargada.** Con `MERCADOPAGO_WEBHOOK_SECRET`
en Vercel, un aviso sin firma o con firma inválida recibe **401** y no se procesa.
Sin la clave, se aceptan todos los avisos y queda un aviso en los logs; igual no
se le cree al aviso a ciegas: la tienda le pregunta a MercadoPago por ese pago
(`GET /v1/payments/:id`) y actúa según lo que MercadoPago responde.

Si después de cargar la clave el simulador devuelve 401, la clave está mal
copiada o es la del otro modo (pruebas vs. productivo).

**Los mails dependen del webhook.** Si el aviso no llega, el cliente no recibe ni
la confirmación ni el mensaje de pago pendiente.

---

## Referencias en el código

| Qué | Dónde |
|---|---|
| Recibe los avisos | `src/app/api/mercadopago/webhook/route.ts` |
| Verifica la firma de MercadoPago | `src/lib/mercadopago-signature.ts` |
| Arma el `notification_url` y cobra | `src/app/api/mercadopago/create-preference/route.ts` |
| Consulta un pago si el aviso no llegó | `src/app/api/mercadopago/verify-payment/route.ts` |
| Mails de confirmación y de pago pendiente | `src/lib/email.ts` |

Los nombres de las pantallas del panel cambian seguido. Lo que no cambia: la
dirección a configurar, el evento de pagos y las dos variables en Vercel.
