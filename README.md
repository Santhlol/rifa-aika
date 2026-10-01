# Rifa por Aika 🐶💗

Web de la rifa para ayudar con los gastos veterinarios de Aika.

- **`/`** — página pública: historia, premios y tablero 00–99. Los números tomados se ven con una **X** y el tablero se actualiza en vivo.
- **`/admin`** — panel de la dueña:
  - **Números:** quién lo tomó, teléfono, si pagó, fecha supuesta de pago y observación.
  - **Colaboraciones:** donaciones de personas que no compran número.
  - Resumen con lo recaudado (números pagados + colaboraciones) y lo pendiente por cobrar.

**Stack:** Next.js 16 (App Router) · Tailwind CSS 4 · Supabase (Postgres, Auth, RLS, Realtime) · Vercel.

## Seguridad de los datos

| Tabla | Contenido | Quién la ve |
|---|---|---|
| `numeros` | número + tomado (sí/no) | Todo el mundo (solo lectura) |
| `numeros_detalle` | nombre, teléfono, pagado, fecha supuesta de pago, observación | Solo usuarios en `admins` |
| `colaboraciones` | nombre, monto, fecha, medio, observación | Solo usuarios en `admins` |
| `admins` | user_id de las administradoras | Solo la propia admin |

Las reglas viven en la base de datos (RLS), no solo en la interfaz. Los cambios pasan por la función `guardar_numero`, que valida que quien guarda sea admin y actualiza ambas tablas en una sola transacción.

## Configuración

### 1. Supabase

1. Crea una cuenta en [supabase.com](https://supabase.com) y un proyecto nuevo (región sugerida: `East US` / `São Paulo`).
2. En **SQL Editor**, ejecuta **en orden** cada archivo de `supabase/migrations/`:
   1. `20260930000000_rifa_inicial.sql`
   2. `20261001000000_colaboraciones_y_fecha_pago.sql`
3. En **Authentication → Sign In / Providers**, desactiva **Allow new users to sign up**.
4. En **Authentication → Users → Add user**, crea el usuario de la dueña (correo + contraseña, marcando *Auto Confirm User*).
5. Copia su **User UID** y, en SQL Editor, ejecuta:
   ```sql
   insert into public.admins (user_id) values ('<USER_UID>');
   ```
6. En **Project Settings → API**, copia la *Project URL* y la *Publishable key*.

### 2. Local

```bash
cp .env.example .env.local   # y pega los valores de Supabase
npm install
npm run dev
```

Sin `.env.local` la página pública funciona igual, con todos los números disponibles.

Para comprobar que un visitante anónimo no puede ver ni modificar datos privados:

```bash
node --env-file=.env.local scripts/verificar-rls.mjs
```

### 3. Vercel

Importa el repo en Vercel, agrega las mismas dos variables de entorno (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`) y despliega. Cada `git push` a `main` redespliega.

## Datos de la rifa

Precio, premios, lotería y fecha están en `src/lib/rifa.ts`.
