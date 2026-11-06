# Plan de trabajo: de app personal a plataforma pública

Objetivo: convertir la app actual en un sitio público para la comunidad de SMITE 2, con usuarios registrados, builds públicas con calificación, una base de datos del juego actualizada, varios idiomas y publicidad, gratis para el usuario.

## Cómo usar este plan

- Marca cada tarea al terminarla: `- [ ]` pasa a `- [x]`.
- Al cerrar una tarea importante, anota en [PROJECT_LOG.md](PROJECT_LOG.md) qué se logró, qué se decidió y en qué commit quedó.
- Las fases van en orden. Dentro de cada fase las tareas también, salvo que se indique lo contrario.
- Cada fase termina con una lista **"Listo cuando"**: no se pasa a la siguiente hasta cumplirla.
- Las estimaciones suponen 10–15 horas por semana, con ayuda de Claude.

## Resumen de fases

| Fase | Tema | Estimación | Estado |
|---|---|---|---|
| 0 | Validación y decisiones previas | 1–2 semanas | Pendiente |
| 1 | Bases de producción | 4–6 semanas | Pendiente |
| 2 | Varios idiomas (inglés, español, portugués) | 3–4 semanas | Pendiente |
| 3 | Contenido propio y traducciones | 4–8 semanas | Pendiente |
| Hito | Beta pública de solo lectura (validar interés) | 1 semana | Pendiente |
| 4 | Comunidad: builds por usuario y calificaciones | 3–4 semanas | Pendiente |
| 5 | Seguridad, legal y lanzamiento | 2–3 semanas | Pendiente |
| 6 | Publicidad e ingresos | 1–2 semanas | Pendiente |
| 7 | Extras después del lanzamiento | Continuo | Pendiente |

Total estimado hasta el lanzamiento: **4 a 6 meses** a medio tiempo.

---

## Fase 0: validación y decisiones previas

Objetivo: confirmar que vale la pena y tomar las decisiones que cambian el diseño, antes de escribir código.

### 0.1 Propiedad intelectual
- [ ] Leer la política de Hi-Rez para contenido de fans (fan content policy) y guardar el enlace en la bitácora.
- [ ] Revisar la licencia del wiki oficial (wiki.smite2.com) y si pide atribución por usar sus datos.
- [ ] Confirmar las reglas ya decididas: solo nombres y datos numéricos, sin imágenes, sin lore, con efectos parafraseados (ver la bitácora, 2026-11-05).
- [ ] Decidir el texto de atribución y el aviso de "sitio no oficial, sin relación con Hi-Rez".

### 0.2 Mercado y comunidad
- [ ] Buscar sitios similares (builds y stats de SMITE 2), anotar qué ofrecen y qué les falta.
- [ ] Definir qué nos distingue: builds de la comunidad con calificación, varios idiomas y datos al día en cada parche.
- [ ] Buscar cifras de jugadores activos de SMITE 2 y anotar la fuente.
- [ ] Ubicar dónde está la comunidad (r/Smite, Discords) para anunciar la beta.

### 0.3 Nombre y dominio
- [ ] Elegir el nombre del sitio. No debe usar "SMITE" de forma que parezca oficial.
- [ ] Revisar que el dominio esté libre y registrarlo.

### 0.4 Decisiones técnicas
Para cada una: elegir, anotar en la bitácora con el motivo y marcarla.
- [ ] **Hospedaje de la app:** Vercel Pro, Railway, Render o Fly.io. El plan gratuito de Vercel no permite uso comercial.
- [ ] **Base de datos:** PostgreSQL administrado (Supabase, Neon o equivalente).
- [ ] **Acceso a la base:** Drizzle o Kysely, con migraciones.
- [ ] **Autenticación:** Auth.js, Better Auth, Clerk o Supabase Auth. Inicio de sesión con Discord y Google.
- [ ] **Validación de datos:** Zod (u otra) para validar en el servidor.
- [ ] **Traducciones de la interfaz:** next-intl (u otra), y si el idioma va en la URL (`/en/...`, `/es/...`).
- [ ] **Pruebas:** herramienta de pruebas automáticas (Vitest y Playwright, o equivalentes).

### Listo cuando
- [ ] No hay riesgo legal conocido que impida publicar.
- [ ] Todas las decisiones de 0.4 están tomadas y anotadas en la bitácora.
- [ ] El dominio está registrado.

---

## Fase 1: bases de producción

Objetivo: que la app pueda vivir en internet de forma segura, con una base de datos que soporte muchos usuarios.

### 1.1 Herramientas del proyecto
- [ ] Instalar Tailwind como dependencia y quitar el CDN. Mover los tokens de `src/config/tailwind-theme.ts` a la configuración de Tailwind. Mantener [STYLES.md](../STYLES.md) en sintonía.
- [ ] Configurar pruebas automáticas y una primera prueba que pase.
- [ ] Configurar CI (GitHub Actions): lint, tipos y pruebas en cada push.
- [ ] Definir variables de entorno (`.env.example`) y cómo se manejan los secretos.

### 1.2 Migrar de SQLite a PostgreSQL
- [ ] Crear la base Postgres de desarrollo.
- [ ] Traducir `db/schema.sql` y las migraciones a Postgres con la herramienta elegida en 0.4.
- [ ] Pasar los repositorios (`src/server/repositories/`) de `better-sqlite3`, que es síncrono, al driver nuevo, que es asíncrono. Hay que tocar cada función y a quien la llama.
- [ ] Migrar los datos actuales (dioses, items, builds y catálogos) con un script y comparar conteos antes y después.
- [ ] Adaptar los scripts (`db:migrate`, importadores, respaldos) o reemplazarlos por los de la herramienta nueva.
- [ ] Revisar índices para las consultas más usadas (listas, búsqueda, builds por dios).
- [ ] Respaldos automáticos de la base en producción.

### 1.3 Usuarios, roles y permisos
- [ ] Integrar la autenticación con Discord y Google.
- [ ] Tabla de usuarios: nombre visible, idioma preferido y fecha de alta. Guardar solo los datos necesarios.
- [ ] Roles: `admin`, `moderador` y `usuario`.
- [ ] Reemplazar la autoría `user`/`claude`/`seed` por usuarios reales: los datos oficiales quedan del sistema y las builds del usuario que las crea. Dejar una regla equivalente para los datos de prueba.
- [ ] Revisar en cada Server Action quién la llama y si tiene permiso. Hoy son endpoints públicos sin control.

### 1.4 Separar datos oficiales y datos de la comunidad
- [ ] Solo `admin` puede crear o editar dioses, items, catálogos e importaciones.
- [ ] Mover los formularios de edición a un área de administración (`/admin`).
- [ ] La vista pública de dioses e items es de solo lectura.

### 1.5 Validación en el servidor
- [ ] Pasar los validadores (`src/server/validators/`) a esquemas de la herramienta elegida, con límites de longitud en todos los textos.

### Listo cuando
- [ ] La app corre sobre Postgres con todos los datos actuales.
- [ ] Un usuario sin rol de admin no puede cambiar datos oficiales, ni desde la app ni con una petición directa.
- [ ] El CI pasa en verde.

---

## Fase 2: varios idiomas

Objetivo: inglés como idioma base, español y portugués desde el lanzamiento, y poder agregar más idiomas (francés, alemán…) sin rediseñar nada.

### 2.1 Interfaz
- [ ] Integrar la librería de traducciones elegida en 0.4.
- [ ] Sacar todos los textos de la interfaz a archivos de traducción (`en`, `es`, `pt`).
- [ ] Selector de idioma visible. Guardar la preferencia del usuario (perfil o cookie) y detectar el idioma del navegador la primera vez.
- [ ] Fechas y números con el formato de cada idioma.
- [ ] Actualizar [LANGUAGES.md](../LANGUAGES.md): la interfaz deja de estar solo en español.

### 2.2 Datos del juego
- [ ] Diseñar tablas de traducción para lo que se muestra en cada idioma: nombres y textos de dioses, habilidades, aspectos, items, catálogos y etiquetas de valores. Ejemplo: `item_translations (item_id, locale, name, passive_text, ...)`.
- [ ] Definir el respaldo: si falta una traducción, se muestra en inglés.
- [ ] Migrar lo que ya existe: los nombres en inglés (`english_name` y los `englishName` de `db/imports/`) pasan a `en`, y los textos en español a `es`.
- [ ] Adaptar los importadores del wiki para que escriban en inglés y no pisen las traducciones.

### 2.3 Agregar un idioma nuevo
- [ ] Documentar en el README los pasos para agregar un idioma.

### Listo cuando
- [ ] Toda la interfaz se puede ver en en, es y pt.
- [ ] Agregar un idioma nuevo no requiere cambiar código fuera de las traducciones y la lista de idiomas.

---

## Fase 3: contenido propio y traducciones

Objetivo: textos propios (parafraseados) en los tres idiomas. Es la fase que más tiempo de revisión pide.

### 3.1 Reglas de contenido
- [ ] Escribir una guía corta de estilo para paráfrasis: tono, términos del juego y qué se traduce y qué no.
- [ ] Glosario de términos en en, es y pt (protecciones, penetración, enfriamiento, control duro…). Usarlo en toda la app.

### 3.2 Items (unos 260)
- [ ] Parafrasear en inglés pasivas y activas de Tier I y II.
- [ ] Parafrasear Tier III.
- [ ] Parafrasear iniciales y reliquias (ya importadas) y las categorías que se importen en 3.4.
- [ ] Traducir a español y portugués, y revisarlas.

### 3.3 Dioses (93)
- [ ] Parafrasear en inglés descripciones de habilidades, notas y aspectos. Hoy están copiados del wiki y se deben reemplazar antes de publicar.
- [ ] Revisar las etiquetas de valores que siguen en inglés (unas 780 de 2,430).
- [ ] Traducir a español y portugués, y revisarlas.
- [ ] Quitar los títulos de dioses copiados del wiki o reemplazarlos por textos propios. Decidir si se muestran.

### 3.4 Datos al día
- [ ] Importar las secciones que faltan del wiki (consumibles, curios, específicos de un dios).
- [ ] Documentar el proceso de actualización por parche: importar, comparar diferencias, revisar y publicar.

### Listo cuando
- [ ] No queda ningún texto descriptivo copiado del wiki.
- [ ] Todo el contenido visible existe en en, es y pt, o se muestra en inglés como respaldo.

---

## Hito: beta pública de solo lectura

Objetivo: medir si hay interés antes de construir la parte de comunidad.

- [ ] Desplegar en producción solo las vistas públicas: dioses, items y builds de ejemplo, sin registro de usuarios.
- [ ] Analítica respetuosa de la privacidad (visitas, páginas, países e idiomas).
- [ ] Anunciar en r/Smite y en Discords de la comunidad.
- [ ] Medir durante 2–3 meses: visitas, visitas que regresan e idiomas.
- [ ] Decidir con datos si se sigue con la Fase 4 y anotarlo en la bitácora.

---

## Fase 4: comunidad

Objetivo: cada usuario guarda sus builds, puede publicarlas y la comunidad las califica.

### 4.1 Builds por usuario
- [ ] Ligar cada build a su autor.
- [ ] Página "Mis builds" con crear, editar, duplicar y borrar.
- [ ] Visibilidad por build: privada o pública.
- [ ] Revisar las reglas actuales (nombre único por dios, mínimo un item) para varios autores. El nombre debería ser único por autor, no por dios.

### 4.2 Builds públicas y calificaciones
- [ ] Página de builds públicas por dios, con filtros por rol y aspecto.
- [ ] Calificación de 1 a 5 estrellas, un voto por usuario por build, editable.
- [ ] Orden por puntaje con promedio bayesiano o Wilson, para que una build con un solo 5 no quede arriba.
- [ ] Guardar promedio y número de votos, y recalcularlos al votar.
- [ ] Perfil público del autor con sus builds públicas.

### 4.3 Moderación
- [ ] Botón para reportar una build.
- [ ] Panel de moderación: ver reportes, ocultar builds y suspender usuarios.
- [ ] Límites contra abuso: builds por día, votos por minuto y longitud de textos.

### Listo cuando
- [ ] Un usuario nuevo puede registrarse, crear una build, publicarla y que otro la califique.
- [ ] Un moderador puede ocultar contenido reportado.

---

## Fase 5: seguridad, legal y lanzamiento

### 5.1 Seguridad
- [ ] Límite de peticiones (rate limiting) en acciones sensibles: registro, votos, creación de builds y reportes.
- [ ] Captcha en el registro.
- [ ] Encabezados de seguridad: CSP compatible con los anuncios, HSTS y X-Frame-Options.
- [ ] Revisar que todo texto de usuarios se muestre escapado y, si se permite formato, que se sanee.
- [ ] Revisión de seguridad completa del código (permisos, validaciones y secretos).
- [ ] Revisar dependencias con vulnerabilidades (`npm audit`) y activar alertas automáticas.

### 5.2 Legal
- [ ] Aviso de privacidad en en, es y pt.
- [ ] Términos de uso, con reglas de contenido de la comunidad.
- [ ] Banner de consentimiento de cookies (necesario para publicidad).
- [ ] Opción para que el usuario descargue y borre su cuenta y sus datos.
- [ ] Aviso de sitio no oficial y atribuciones (ver 0.1).

### 5.3 Infraestructura
- [ ] Ambiente de pruebas (staging) separado de producción.
- [ ] Monitoreo de errores (Sentry o equivalente) y alertas.
- [ ] Respaldos automáticos probados: hacer una restauración de prueba.
- [ ] Caché para las páginas de dioses e items, que casi no cambian.
- [ ] SEO: títulos, descripciones, sitemap, robots.txt y etiquetas de idioma (`hreflang`).
- [ ] Rendimiento: medir con Lighthouse en móvil.

### 5.4 Lanzamiento
- [ ] Lista de verificación final en staging.
- [ ] Publicar en producción.
- [ ] Anunciar en la comunidad.

### Listo cuando
- [ ] El sitio está público, con aviso de privacidad, términos y consentimiento de cookies.
- [ ] Hay monitoreo de errores y respaldos probados.

---

## Fase 6: publicidad e ingresos

- [ ] Solicitar AdSense cuando haya contenido y algo de tráfico.
- [ ] Ubicar los anuncios sin romper la experiencia, sobre todo en móvil.
- [ ] Ajustar la CSP y el banner de cookies para los anuncios.
- [ ] Opcional: donaciones (Ko-fi o Patreon) con beneficios simbólicos.
- [ ] Revisar con un contador el régimen fiscal y el RFC para declarar los ingresos.

---

## Fase 7: extras después del lanzamiento

- [ ] Build aleatoria por dios, respetando las reglas de Tier III.
- [ ] Comentarios en las builds públicas, con moderación.
- [ ] Comparador de builds o calculadora de daño.
- [ ] Más idiomas (francés, alemán…).
- [ ] Foro, o integración con Discord. Va al final: es el extra más costoso de moderar.
