# Las plantillas de correo

Los tres correos que manda CleanDerApp. Viven aquí, en el repositorio, aunque
se usen pegándolos en el panel de Supabase: así se pueden revisar, comparar y
recuperar si alguien los toca.

## Dónde se pegan

*Authentication → Emails → Templates*, y en cada pestaña se cambia **el asunto
y el cuerpo**:

| Archivo | Pestaña de Supabase | Asunto |
|---|---|---|
| `confirmar-cuenta.html` | Confirm signup | Confirma tu cuenta en CleanDerApp |
| `recuperar-clave.html` | Reset Password | Cambia tu contraseña de CleanDerApp |
| `cambiar-correo.html` | Change Email Address | Confirma tu nuevo correo en CleanDerApp |

Las demás pestañas (*Magic Link*, *Invite user*, *Reauthentication*) se quedan
como están: esos correos no se usan en la web.

## Por qué el enlace apunta a cleanderapp.com

De fábrica, Supabase manda a `<proyecto>.supabase.co` a confirmar. Funciona,
pero el correo lo firma `cleanderapp.com`: un mensaje de un dominio que te
empuja a pinchar en otro sin relación tiene **la forma exacta de un phishing**,
y los filtros lo tratan como tal. Lo detectó Resend y lo confirmó Outlook
mandando el primer correo a no deseado.

Así que el enlace lleva a la propia web con un vale de un solo uso
(`?token_hash=…&type=…`), y es `lib/arranque.js` quien lo canjea por una
sesión con `verifyOtp` antes de montar React. Lo hace el navegador, no el
servidor.

> **Cuidado:** por eso mismo, estos correos **necesitan la web publicada**.
> Con la página de mantenimiento puesta, quien pinche el enlace verá el cartel
> de «volvemos enseguida» y su cuenta no se confirmará. Las plantillas y el
> estreno van de la mano.

La forma antigua (`#access_token=…`) se sigue entendiendo, por si alguien abre
un correo enviado antes del cambio.

## El logo

`https://cleanderapp.com/isotipo.png`, que está tanto en `frontend/public/`
como en `mantenimiento/`. **Tiene que seguir en los dos sitios**: si solo
estuviera en uno, el logo desaparecería de los correos cada vez que se cambie
lo que está publicado.

Aun así el correo se lee entero sin imágenes, que es como lo abre Outlook por
defecto: el nombre y el lema son texto, no dibujo.
