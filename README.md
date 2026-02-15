# GCZ Data Buscador

Aplicación web de búsqueda y gestión de documentos de facturación en tiempo real, construida con React, TypeScript y Supabase.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?logo=supabase&logoColor=white)

## Funcionalidades

- **Búsqueda inteligente** con detección automática de patrones (texto, numérico, serie-correlativo)
- **Términos múltiples** separados por coma con lógica AND
- **Grilla interactiva** con AG Grid: ordenamiento, filtrado, paginación y redimensionamiento de columnas
- **Selección múltiple** de filas con cálculo automático de totales
- **Panel de visibilidad de columnas** con presets (todas / recomendadas) y persistencia en localStorage
- **Exportación a CSV**
- **Búsqueda full-text** con `tsvector`, normalización de acentos (`unaccent`) y búsqueda fuzzy (`pg_trgm`)

## Tech Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | React 19, TypeScript 5.9 |
| Build | Vite 7 |
| Estilos | Tailwind CSS 4 |
| Grilla de datos | AG Grid Community 35 |
| Base de datos | Supabase (PostgreSQL) |
| Iconos | Lucide React |
| Deploy | GitHub Pages |

## Requisitos previos

- [Node.js](https://nodejs.org/) >= 18
- Una cuenta y proyecto en [Supabase](https://supabase.com/)

## Instalación

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/gcz-data-buscador.git
cd gcz-data-buscador/app-dev

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
```

Editar el archivo `.env` con las credenciales de tu proyecto Supabase:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

> La configuración de la base de datos (tablas, funciones RPC, índices y triggers) se detalla en [CONFIGURACION_SUPABASE.md](CONFIGURACION_SUPABASE.md).

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia el servidor de desarrollo con HMR |
| `npm run build` | Compila TypeScript y genera el build de producción |
| `npm run preview` | Previsualiza el build de producción localmente |
| `npm run lint` | Ejecuta ESLint |
| `npm run deploy` | Compila y despliega a GitHub Pages |

## Estructura del proyecto

```
app-dev/
├── src/
│   ├── App.tsx           # Componente principal de la aplicación
│   ├── main.tsx          # Punto de entrada (React StrictMode)
│   ├── supabase.ts       # Configuración del cliente Supabase
│   └── index.css         # Tailwind, tema AG Grid y animaciones
├── public/
│   └── 404.html          # Fallback SPA para GitHub Pages
├── .env.example          # Plantilla de variables de entorno
├── vite.config.ts        # Configuración de Vite
├── tsconfig.json         # Configuración de TypeScript
└── eslint.config.js      # Configuración de ESLint
```

## Despliegue

La aplicación está configurada para desplegarse en **GitHub Pages**:

```bash
npm run deploy
```

Esto ejecuta el build y publica el contenido de `dist/` en la rama `gh-pages`.

> Para más detalles sobre el despliegue, consultar [DEPLOY_GITHUB_PAGES.md](DEPLOY_GITHUB_PAGES.md).

## Documentación adicional

- [FICHA_PROYECTO.md](FICHA_PROYECTO.md) — Documentación completa del proyecto
- [CONFIGURACION_SUPABASE.md](CONFIGURACION_SUPABASE.md) — Guía de configuración de la base de datos
- [DEPLOY_GITHUB_PAGES.md](DEPLOY_GITHUB_PAGES.md) — Guía de despliegue en GitHub Pages

## Licencia

Este proyecto es de uso interno. Consultar con el equipo antes de redistribuir.
