# Despliegue en GitHub Pages — GCZ Data Buscador

> **Proyecto:** GCZ Data Buscador
> **Stack:** React 19 + Vite 7.3 + TypeScript
> **Hosting:** GitHub Pages (sitio estático)
> **Ultima actualizacion:** Febrero 2026

---

## Prerequisitos

- [x] Node.js instalado
- [x] npm instalado
- [ ] Cuenta de GitHub
- [ ] Git instalado y configurado (`git config user.name` y `git config user.email`)

---

## Plan de despliegue paso a paso

| Paso | Descripcion | Estado |
|------|-------------|--------|
| 1 | Proteger credenciales de Supabase con variables de entorno | Pendiente |
| 2 | Configurar `base` en Vite para GitHub Pages | Pendiente |
| 3 | Agregar script de deploy y dependencia `gh-pages` | Pendiente |
| 4 | Crear el archivo `404.html` para SPA routing | Pendiente |
| 5 | Inicializar repositorio Git local | Pendiente |
| 6 | Crear repositorio en GitHub | Pendiente |
| 7 | Hacer el primer commit y push | Pendiente |
| 8 | Desplegar a GitHub Pages | Pendiente |
| 9 | Verificar que funciona | Pendiente |

---

## Paso 1 — Proteger credenciales de Supabase

Actualmente las credenciales estan hardcodeadas en `src/supabase.ts`. Para produccion es mejor usar variables de entorno de Vite.

### 1a. Crear archivo `.env` en la raiz de `app-dev/`

```env
VITE_SUPABASE_URL=https://exnmzsgaeghzatxrwdza.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...tu_key_aqui
```

### 1b. Agregar `.env` al `.gitignore`

```gitignore
# Variables de entorno
.env
.env.local
.env.*.local
```

### 1c. Modificar `src/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

> **Nota importante:** La anon key de Supabase es publica por diseno (se expone en el frontend). La seguridad real la da RLS. Sin embargo, no es buena practica hardcodear URLs en el codigo fuente para poder cambiar de proyecto sin modificar el repo.

### 1d. Crear `.env.example` (para documentacion, SI se sube al repo)

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

---

## Paso 2 — Configurar `base` en Vite

GitHub Pages sirve el sitio desde `https://<usuario>.github.io/<nombre-repo>/`. Vite necesita saber esta subruta para que los assets se carguen correctamente.

### Modificar `vite.config.ts`

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  base: '/gcz-data-buscador/',  // <-- nombre del repositorio en GitHub
})
```

> **Ajustar `'/gcz-data-buscador/'`** al nombre exacto del repo que crees en GitHub.
> Si usas un dominio personalizado, cambialo a `base: '/'`.

---

## Paso 3 — Agregar dependencia y script de deploy

### 3a. Instalar `gh-pages`

```bash
npm install --save-dev gh-pages
```

### 3b. Agregar scripts en `package.json`

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview",
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

> `predeploy` se ejecuta automaticamente antes de `deploy`. Asi siempre se hace build antes de subir.

---

## Paso 4 — Crear `404.html` para SPA routing

GitHub Pages no soporta client-side routing nativamente. Si el usuario recarga la pagina en una subruta, GitHub devuelve 404. Este hack redirige todas las rutas al `index.html`.

### Crear `public/404.html`

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>GCZ Data Buscador</title>
    <script type="text/javascript">
      // Redirige rutas de GitHub Pages al SPA
      // Credito: https://github.com/rafgraph/spa-github-pages
      var pathSegmentsToKeep = 1; // 1 para project pages (usuario.github.io/repo)
      var l = window.location;
      l.replace(
        l.protocol + '//' + l.hostname + (l.port ? ':' + l.port : '') +
        l.pathname.split('/').slice(0, 1 + pathSegmentsToKeep).join('/') + '/?/' +
        l.pathname.slice(1).split('/').slice(pathSegmentsToKeep).join('/').replace(/&/g, '~and~') +
        (l.search ? '&' + l.search.slice(1).replace(/&/g, '~and~') : '') +
        l.hash
      );
    </script>
  </head>
  <body></body>
</html>
```

> **Nota:** Si la app actualmente NO usa React Router (es una SPA de una sola vista), este paso es opcional pero recomendable como prevencion. No hace dano tenerlo.

---

## Paso 5 — Inicializar repositorio Git

```bash
cd "c:/Users/Usuario/Documents/Dev Projects/gcz-data-buscador/app-dev"

git init
git branch -M main
```

---

## Paso 6 — Crear repositorio en GitHub

### Opcion A: Desde la web

1. Ir a https://github.com/new
2. Nombre del repositorio: `gcz-data-buscador` (debe coincidir con `base` en vite.config.ts)
3. Visibilidad: **Private** (recomendado, tiene credenciales de Supabase en el historial)
4. NO inicializar con README, .gitignore ni licencia
5. Copiar la URL del repo

### Opcion B: Con GitHub CLI

```bash
gh repo create gcz-data-buscador --private --source=. --remote=origin
```

---

## Paso 7 — Primer commit y push

```bash
git add .
git commit -m "feat: initial commit - GCZ Data Buscador"
git remote add origin https://github.com/<TU_USUARIO>/gcz-data-buscador.git
git push -u origin main
```

> Reemplazar `<TU_USUARIO>` con tu nombre de usuario de GitHub.

---

## Paso 8 — Desplegar a GitHub Pages

```bash
npm run deploy
```

Esto ejecuta:
1. `predeploy` → `npm run build` → genera la carpeta `dist/`
2. `deploy` → `gh-pages -d dist` → sube el contenido de `dist/` a la rama `gh-pages`

### Configurar GitHub Pages (solo la primera vez)

1. Ir a **Settings** > **Pages** en el repositorio
2. Source: **Deploy from a branch**
3. Branch: `gh-pages` / `/ (root)`
4. Guardar

> GitHub Pages tarda 1-3 minutos en activarse la primera vez.

---

## Paso 9 — Verificar

La app estara disponible en:

```
https://<TU_USUARIO>.github.io/gcz-data-buscador/
```

### Checklist de verificacion

- [ ] La pagina carga sin errores en consola
- [ ] Los assets (CSS, JS, iconos) se cargan correctamente (no hay 404 en Network)
- [ ] La conexion con Supabase funciona (se ven datos en la tabla)
- [ ] La busqueda devuelve resultados
- [ ] La exportacion CSV funciona
- [ ] El favicon se muestra correctamente

### Problemas comunes

| Problema | Causa | Solucion |
|----------|-------|----------|
| Pagina en blanco | `base` mal configurado en Vite | Verificar que coincide con el nombre del repo |
| Assets no cargan (404) | Rutas absolutas sin `base` | Asegurar que `base` esta configurado |
| "Failed to fetch" en consola | Credenciales de Supabase incorrectas | Verificar `.env` y que se hizo build con las variables |
| CORS error | Supabase no permite el dominio | Ir a Supabase > Settings > API y agregar la URL de GitHub Pages a los dominios permitidos |

---

## Actualizaciones futuras

Para cada actualizacion de la app, solo necesitas ejecutar:

```bash
npm run deploy
```

Esto hace build y sube automaticamente a GitHub Pages.

Si tambien quieres guardar el codigo fuente:

```bash
git add .
git commit -m "descripcion del cambio"
git push origin main
npm run deploy
```

---

## Estructura de ramas

| Rama | Contenido |
|------|-----------|
| `main` | Codigo fuente (TypeScript, configs, etc.) |
| `gh-pages` | Build de produccion (generada automaticamente por `gh-pages`) |

> **No edites la rama `gh-pages` manualmente.** Se sobreescribe cada vez que ejecutas `npm run deploy`.
