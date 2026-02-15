# PQT06 Invoice Master Engine

**Nombre del proyecto:** GCZ Data Buscador
**Sistema:** GCZ Intelligence System
**Última actualización:** Febrero 2026

---

## Descripcion

Aplicacion web de busqueda y gestion de facturas de proveedores en tiempo real. Permite consultar, filtrar y exportar documentos financieros desde una base de datos centralizada en Supabase. Incluye pantalla de bienvenida, búsqueda multi-estrategia con soporte de comas, panel de visibilidad de columnas y selección múltiple con suma de totales.

---

## Stack Tecnologico

| Capa            | Tecnologia                              | Versión actual |
|-----------------|-----------------------------------------|----------------|
| Frontend        | React + TypeScript                      | 19.2 / ~5.9    |
| Build Tool      | Vite                                    | 7.3            |
| Estilos         | Tailwind CSS                            | 4.1            |
| Grilla de datos | AG Grid React (Community)               | 35.1           |
| Iconos          | Lucide React                            | 0.564          |
| Backend/BD      | Supabase (PostgreSQL)                   | SDK 2.95       |
| Utilidades      | Lodash (debounce)                       | 4.0            |

---

## Funcionalidades

### Pantalla de bienvenida
- Logo + nombre de la app centrados con animación fade-in.
- Botón "Iniciar" o tecla `Enter` para acceder al buscador.
- Al iniciar, carga automáticamente los últimos 100 registros.

### Búsqueda en tiempo real
- Debounce de 400ms para evitar llamadas excesivas.
- **Multi-estrategia** — la función RPC detecta automáticamente el tipo de búsqueda:
  - Texto libre → full-text (`tsvector` con diccionario `spanish`)
  - Numérico puro → ILIKE en `oc`, `documento_identidad` + exacto en `id_registro`
  - Contiene guión → ILIKE en `concatenar_factura` (serie-correlativo)
- **Soporte de comas** — múltiples términos separados por coma se combinan con AND.
- **Fallback** — si la función RPC falla, se ejecuta query directo con ILIKE en 3 columnas.

### Tabla interactiva (AG Grid)
- 92 columnas configuradas (excluye `busqueda_vector`).
- Columna `id_registro` fijada a la izquierda (pinned), siempre visible.
- Ordenamiento, filtrado nativo y redimensionado de columnas.
- Paginación configurable: 20, 50 (default), 100 filas por página.
- Selección múltiple con checkboxes.
- Barra de selección con conteo y **suma de `total_original`** de filas seleccionadas.

### Panel de visibilidad de columnas
- Panel lateral deslizable desde la derecha.
- Toggle individual por columna con checkboxes.
- Presets: "Mostrar todas" y "Recomendadas" (24 columnas clave).
- Persistencia en `localStorage` (clave: `pqt06-column-visibility`).

### Sidebar de navegación
- Menú lateral colapsable (icono ↔ expandido).
- Links a módulos: PQT06 (activo), PQT07, PQT08 (placeholder).

### Renderers personalizados
- **StatusBadge** — badges de colores por estado: Pagado (verde), Anulado (rojo), Pendiente (ámbar), Otro (gris).
- **AmountRenderer** — formato numérico con separador de miles y 2 decimales (locale `es-PE`).
- **DateRenderer** — formato DD/MM/YYYY (locale `es-PE`, timezone UTC).

### Exportación
- Botón de descarga CSV (usa `exportDataAsCsv` de AG Grid).

### Indicadores de estado
- Spinner en el icono de búsqueda mientras carga.
- Overlay de carga con spinner al iniciar sin datos.
- Banner de error con botón "Reintentar".
- Indicador "Conectado" en el footer.
- Contador de resultados en el header.

---

## Estructura del Proyecto

```
app-dev/
├── src/
│   ├── App.tsx            # Componente principal (welcome, sidebar, header, grid, panels)
│   ├── main.tsx           # Punto de entrada React (StrictMode)
│   ├── supabase.ts        # Cliente Supabase (URL + anon key)
│   ├── index.css          # Tailwind + AG Grid theme + animaciones custom
│   └── assets/            # Recursos estáticos
├── public/                # Archivos públicos
├── package.json           # Dependencias y scripts
├── vite.config.ts         # Configuración de Vite + plugin Tailwind
├── tsconfig.json          # Configuración TypeScript
├── eslint.config.js       # Configuración ESLint
├── CONFIGURACION_SUPABASE.md  # SQL completo para replicar la BD
└── FICHA_PROYECTO.md      # Este archivo
```

---

## Modelo de Datos

**Schema:** `cgoii-data-prod`
**Tabla:** `PQT06_Facturas_Consulta_Master`
**Columnas:** 93 (incluyendo `busqueda_vector`)
**Función RPC:** `buscar_documentos_prod`

> Ver `CONFIGURACION_SUPABASE.md` para el SQL completo de la tabla, índices, trigger y función RPC.

---

## Flujo de Datos

```
Pantalla de bienvenida
        │
        ▼ (clic "Iniciar" o Enter)
fetchInvoices('') → últimos 100 registros
        │
        ▼
Usuario escribe en buscador
        │
        ▼
Debounce (400ms)
        │
        ▼
fetchInvoices(termino)
        │
        ├─► supabase.rpc('buscar_documentos_prod', { termino_busqueda })
        │     └─► Detección automática: full-text / numérico / serie-correlativo / comas
        │
        └─► Fallback: query directo con ILIKE en proveedor, documento_identidad, empresa
                │
                ▼
        Supabase (PostgreSQL) — schema cgoii-data-prod
                │
                ▼
  Resultados renderizados en AG Grid (máx 100 filas)
```

---

## Scripts Disponibles

| Comando            | Descripcion                        |
|--------------------|------------------------------------|
| `npm run dev`      | Servidor de desarrollo con HMR     |
| `npm run build`    | Compilación TypeScript + build     |
| `npm run lint`     | Verificación de código con ESLint  |
| `npm run preview`  | Preview del build de producción    |

---

## Diseño UI

- Fondo `#f8fafc` (slate-50), interfaz limpia y compacta.
- Paleta de colores azul (`blue-600` como acento principal).
- Header compacto (44px) con logo, buscador y acciones.
- Sidebar colapsable con iconos.
- Transición fade-in al iniciar la app.
- Panel lateral de columnas con slide-in desde la derecha.
- Barra de selección azul en el footer cuando hay filas seleccionadas.
- Footer con copyright y estado de conexión.
- Tipografía: sistema (`font-sans`), tabular-nums para cifras.

---

## Patrones y Decisiones de Arquitectura

### Monolito en un solo componente
Todo el UI está en `App.tsx` — para este tamaño de proyecto es pragmático y evita overhead de archivos. Si crece, extraer: `WelcomeScreen`, `SearchHeader`, `ColumnPanel`, `SelectionBar`.

### Búsqueda RPC vs query directo
- **Primario:** Función RPC en PostgreSQL que maneja toda la lógica de detección de tipo.
- **Fallback:** Query directo con ILIKE si la RPC falla (resiliencia).
- **Ventaja:** El frontend envía el string tal cual, sin parsear — toda la inteligencia está en la BD.

### Visibilidad de columnas persistente
- Se guarda en `localStorage` como mapa `{ field: boolean }`.
- Dos presets: todas (92) y recomendadas (24 columnas clave).
- `id_registro` siempre visible y fijada a la izquierda.

### AG Grid Community
- Módulo `AllCommunityModule` registrado globalmente.
- `rowSelection: { mode: 'multiRow', checkboxes: true }` para selección.
- `enableCellTextSelection` + `ensureDomOrder` para permitir copiar texto.

---

## Recomendaciones para Replicar

1. **Crear la BD primero** — seguir `CONFIGURACION_SUPABASE.md` paso a paso.
2. **Clonar el frontend** — cambiar URL + anon key en `supabase.ts`.
3. **Adaptar la tabla** — modificar `columnConfig` en `App.tsx` para reflejar los campos de la nueva tabla.
4. **Adaptar la función RPC** — ajustar los campos del trigger, los índices fuzzy y la lógica de detección en la función RPC.
5. **Variables de entorno** — en un proyecto real, mover credenciales a `.env` con `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
