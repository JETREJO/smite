# Reglas de estilos

## Principios

- **Solo Tailwind.** Nada de archivos `.css` ni atributos `style`. Única excepción: librerías que solo aceptan estilos como objeto (p.ej. React Hot Toast), y esos valores salen de `THEME_COLORS` en `src/config/tailwind-theme.ts`.
- Tailwind se carga desde el CDN (`@tailwindcss/browser@4.3.3`) en `src/app/layout.tsx`. Los tokens del tema se definen en `src/config/tailwind-theme.ts` con `@theme`.
- **Tema oscuro, sobrio y moderno.** Grises fríos casi neutros con un solo acento verde azulado (teal apagado). Nada de dorados ni colores "temáticos" de dioses.
- Usar siempre los tokens de abajo, nunca colores sueltos (`bg-[#123456]`, `text-gray-400`).

## Paleta

| Token | Hex | Uso | Clase de ejemplo |
|---|---|---|---|
| `canvas` | `#0E1014` | Fondo de la app | `bg-canvas` |
| `surface` | `#15181E` | Tarjetas y secciones | `bg-surface` |
| `elevated` | `#1C2028` | Inputs, elementos encima de una tarjeta, hover | `bg-elevated` |
| `line` | `#2A2F39` | Bordes y divisores | `border-line` |
| `line-strong` | `#3A414D` | Bordes con más contraste (botón secundario, hover) | `border-line-strong` |
| `fg` | `#E7E9EE` | Texto principal | `text-fg` |
| `fg-muted` | `#A0A7B4` | Texto secundario, etiquetas | `text-fg-muted` |
| `fg-subtle` | `#6E7684` | Placeholders, ayudas, deshabilitado (no para texto importante) | `text-fg-subtle` |
| `accent` | `#5CB8A9` | Acción principal, foco, selección, marcas `*` | `bg-accent`, `text-accent` |
| `accent-strong` | `#78CABD` | Hover del acento, texto sobre fondo de acento suave | `hover:bg-accent-strong` |
| `on-accent` | `#0B1715` | Texto sobre `bg-accent` | `text-on-accent` |
| `danger` | `#E5676F` | Errores, eliminar | `text-danger` |
| `success` | `#63C08A` | Confirmaciones | `text-success` |
| `warning` | `#E0B25C` | Advertencias | `text-warning` |
| `info` | `#74A9E6` | Información neutral | `text-info` |

Opacidades permitidas sobre tokens: `bg-accent/15` para selección suave, `focus:ring-accent/30` para el foco, `bg-danger/10` para el hover de acciones peligrosas, `bg-canvas/40` para sub-tarjetas dentro de una tarjeta.

## Tipografía

Orden de fuentes (`font-sans`, aplicada al `body`):

1. **Montserrat** (Google Fonts, vía `next/font/google`): fuente principal.
2. **Roboto** (Google Fonts): respaldo.
3. Fuentes del sistema: `-apple-system` / `BlinkMacSystemFont` (San Francisco en Apple) y `Segoe UI` (Windows).
4. `system-ui`, `Helvetica Neue`, `Arial`, `sans-serif`.

Escala:

- Título de página: `text-3xl font-bold` (Home: `text-4xl sm:text-5xl`).
- Título de sección: `text-lg font-semibold`.
- Subtítulo dentro de sección: `text-sm font-semibold`.
- Etiqueta de campo: `text-xs font-semibold uppercase tracking-wide text-fg-muted`.
- Texto normal: `text-sm` en formularios, `text-base` / `text-lg` en texto de lectura.
- Ayudas y errores bajo un campo: `text-xs`.

## Componentes

- **Bordes redondeados:** `rounded-lg` en controles y botones, `rounded-xl` en tarjetas, `rounded-full` en chips.
- **Tarjetas:** `SectionCard` (`border border-line bg-surface p-5 sm:p-6`).
- **Botones:** `Button` / `ButtonLink` con variantes `primary` (acento), `secondary` (borde), `ghost` (solo texto) y `danger`.
- **Inputs:** `TextInput`, `NumberInput`, `TextArea`, `SelectInput` en `src/components/ui/inputs.tsx`. Fondo `elevated`, borde `line` y borde/anillo `accent` con foco.
- **Selección múltiple:** chips (`ChipMultiSelect`); seleccionado = `border-accent bg-accent/15 text-accent-strong`.
- **Campos:** envolver cada control en `FormField` (etiqueta, `*` de obligatorio, ayuda y error).
- **Toasts:** arriba a la derecha, fondo `elevated` y borde `line`.

## Layout

- Contenido centrado: `mx-auto max-w-5xl px-4`.
- Espaciado entre secciones: `gap-6`; dentro de una sección: `gap-5`.
- Diseño mobile first: tiene que verse bien a 375 px sin scroll horizontal; usar `sm:` / `md:` para columnas.
