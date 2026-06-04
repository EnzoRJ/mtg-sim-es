# MTG Commander ES — Design System MASTER

> Source of Truth for all UI/UX decisions. Page-specific overrides live in `pages/`.

---

## 1. Identidad Visual

**Producto:** Aplicación de partida multijugador para Magic: The Gathering Commander  
**Estilo:** Dark Fantasy — fusión de *Modern Dark Cinema* + *Cyberpunk UI* adaptado a fantasía arcana  
**Audiencia:** Jugadores adultos de MTG (18–45), contexto de escritorio/tableta con ratón  
**Stack:** React + Vite + Tailwind CSS v4 + shadcn/ui (Radix) + Lucide React

### Palabras clave de diseño
`dark`, `arcane`, `immersive`, `fantasy`, `gold`, `deep night`, `parchment`, `neon glow`, `tactile`, `mystical`

---

## 2. Color System

Todos los valores deben declararse como CSS custom properties en `src/index.css`.  
**Nunca usar hex hardcodeado en componentes** — usar siempre las variables.

### Variables de color (reemplaza el bloque `:root` actual en index.css)

```css
/* ── MTG Commander: Dark Fantasy Palette ── */
:root {
  /* Superficies */
  --bg-deep:       #020208;   /* Fondo raíz — negro violáceo */
  --bg-base:       #06060e;   /* Panel principal */
  --bg-elevated:   #0d0d1e;   /* Cards, modales */
  --bg-raised:     #161630;   /* Sub-paneles, popovers */
  --bg-input:      #080810;   /* Inputs, dropdowns */

  /* Texto */
  --text-primary:  #e8e0d0;   /* Pergamino cálido — texto principal */
  --text-secondary: #aaaacc;  /* Secundario */
  --text-muted:    #8888aa;   /* Labels, subtítulos */
  --text-disabled: #555577;   /* Deshabilitado */

  /* Acento principal — Oro MTG */
  --gold:          #ffd700;
  --gold-dim:      #ffd70088;
  --gold-glow:     #ffd70033;
  --gold-dark:     #ff8c00;

  /* Borders */
  --border-subtle:  #1a1a2e;
  --border-default: #2a2a4a;
  --border-strong:  #3a3a6a;

  /* Semánticos */
  --color-life:    #88ff88;   /* Verde vida */
  --color-damage:  #ff8888;   /* Rojo daño */
  --color-info:    #88ccff;   /* Azul info */
  --color-warning: #ffcc44;   /* Amarillo advertencia */
  --color-poison:  #cc88ff;   /* Violeta veneno */
  --color-exile:   #ff88cc;   /* Rosa exilio */

  /* Maná */
  --mana-W: #f9f3d9; --mana-W-text: #8a7a30;
  --mana-U: #b3d9f7; --mana-U-text: #1a4a7a;
  --mana-B: #c8a0c8; --mana-B-text: #4a1a4a;
  --mana-R: #f7b3a0; --mana-R-text: #7a1a0a;
  --mana-G: #a0d9b3; --mana-G-text: #0a4a1a;
  --mana-C: #d0d0d0; --mana-C-text: #3a3a3a;

  /* Radii */
  --radius-sm:  4px;
  --radius-md:  8px;
  --radius-lg:  12px;
  --radius-xl:  16px;
  --radius-2xl: 20px;

  /* Sombras */
  --shadow-card:  0 2px 8px #0005;
  --shadow-modal: 0 20px 60px #000c;
  --shadow-glow:  0 0 20px var(--gold-glow);

  /* Timing de animaciones */
  --ease-out:    cubic-bezier(0.16, 1, 0.3, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --dur-fast:    150ms;
  --dur-normal:  250ms;
  --dur-slow:    400ms;
}
```

### Paleta de colores visual

| Token               | Hex       | Uso                                   |
|---------------------|-----------|---------------------------------------|
| `--bg-deep`         | `#020208` | Fondo raíz de la app                  |
| `--bg-elevated`     | `#0d0d1e` | Modales, cards de mano               |
| `--gold`            | `#ffd700` | CTA primario, acento, vida alta       |
| `--gold-dark`       | `#ff8c00` | Gradiente secundario del oro          |
| `--text-primary`    | `#e8e0d0` | Texto principal — tono pergamino      |
| `--color-life`      | `#88ff88` | Vida, buffs, +1/+1                    |
| `--color-damage`    | `#ff8888` | Daño, -1/-1, destrucción              |
| `--border-default`  | `#2a2a4a` | Bordes estándar                       |

---

## 3. Tipografía

### Jerarquía de fuentes

| Rol              | Fuente             | Peso      | Tamaño  | Uso                                           |
|------------------|--------------------|-----------|---------|-----------------------------------------------|
| **Display**      | Cinzel             | 700–900   | 28–42px | Títulos de sección, nombres de comandante    |
| **Heading**      | Cinzel             | 600–700   | 16–24px | Cabeceras de panel, nombres de fase           |
| **Body**         | Crimson Text       | 400–600   | 14–16px | Texto corrido, descripciones de carta         |
| **UI / Labels**  | Inter              | 400–500   | 11–13px | Labels, botones, inputs, metadata            |
| **Stats / Nums** | JetBrains Mono     | 400–700   | 12–20px | Vida, contadores, costes de maná              |

### CSS Import (añadir en `index.html <head>`)

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;900&family=Crimson+Text:wght@400;600&family=Inter:wght@400;500&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
```

### Variables de tipografía (añadir en index.css)

```css
:root {
  --font-display: 'Cinzel', Georgia, serif;
  --font-body:    'Crimson Text', Georgia, serif;
  --font-ui:      'Inter', system-ui, sans-serif;
  --font-mono:    'JetBrains Mono', monospace;

  /* Escala de tamaños */
  --text-xs:   10px;
  --text-sm:   12px;
  --text-base: 14px;
  --text-md:   16px;
  --text-lg:   18px;
  --text-xl:   22px;
  --text-2xl:  28px;
  --text-3xl:  36px;
}
```

**Reglas:**
- Usar `--font-display` (Cinzel) para cualquier encabezado tipo "Comandante", "Fase", título de modal
- Usar `--font-body` (Crimson Text) para texto narrativo, descripciones de habilidades
- Usar `--font-ui` (Inter) para botones, inputs, navegación funcional
- Usar `--font-mono` (JetBrains Mono) para **todos** los números: vida, contadores, turno

---

## 4. Espaciado

Sistema **4pt base**, múltiplos de 4. Nunca usar valores arbitrarios.

```
4  →  gap-1, p-1   (separación mínima entre elementos inline)
8  →  gap-2, p-2   (padding mínimo de botón, spacing entre chips)
12 →  gap-3, p-3   (padding estándar de botón pequeño)
16 →  gap-4, p-4   (padding de card, sección compacta)
20 →  gap-5, p-5   (espacio entre grupos)
24 →  gap-6, p-6   (padding de modal)
32 →  gap-8, p-8   (sección mayor)
48 →  gap-12, p-12 (separación entre secciones grandes)
```

---

## 5. Animaciones y Motion

Todos los keyframes deben vivir en `src/index.css`, **no inyectados via `<style>` tags en componentes**.

### Keyframes globales (añadir en index.css)

```css
@keyframes neonPulse {
  0%,100% { text-shadow: 0 0 8px var(--gold), 0 0 20px var(--gold-dim), 0 0 40px rgba(255,140,0,0.27); }
  50%      { text-shadow: 0 0 16px var(--gold), 0 0 40px var(--gold-dim), 0 0 80px rgba(255,140,0,0.53); }
}
@keyframes borderNeon {
  0%,100% { box-shadow: 0 0 6px var(--gold-dim), inset 0 0 6px var(--gold-glow); }
  50%      { box-shadow: 0 0 18px rgba(255,215,0,0.8), inset 0 0 12px rgba(255,215,0,0.27); }
}
@keyframes scanline {
  0%   { transform: translateY(-100%); }
  100% { transform: translateY(400%); }
}
@keyframes float {
  0%,100% { transform: translateY(0); }
  50%     { transform: translateY(-4px); }
}
@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes shimmer {
  0%   { background-position: 200% center; }
  100% { background-position: -200% center; }
}

/* Clases utilitarias */
.anim-neon-text   { animation: neonPulse 3s ease-in-out infinite; }
.anim-neon-border { animation: borderNeon 2s ease-in-out infinite; }
.anim-float       { animation: float 3s ease-in-out infinite; }
.anim-slide-down  { animation: slideDown var(--dur-normal) var(--ease-out); }
.anim-fade-up     { animation: fadeInUp var(--dur-normal) var(--ease-out); }

/* Reduced motion: respetar preferencia del sistema */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Reglas de timing

| Tipo de interacción     | Duración | Easing            |
|-------------------------|----------|-------------------|
| Hover de botón          | 150ms    | `ease-out`        |
| Apertura de modal       | 250ms    | `--ease-spring`   |
| Cierre de modal         | 180ms    | `ease-in`         |
| Transición de carta     | 200ms    | `--ease-spring`   |
| Animaciones de loop     | 2–4s     | `ease-in-out`     |
| Fade de notificación    | 300ms    | `ease-out`        |

---

## 6. Componentes Base

### Botón Primario (CTA)

```css
.btn-primary {
  background: linear-gradient(90deg, var(--gold), var(--gold-dark));
  color: #000;
  font-family: var(--font-ui);
  font-weight: 700;
  font-size: var(--text-base);
  padding: 10px 24px;
  border-radius: var(--radius-md);
  border: none;
  cursor: pointer;
  transition: all var(--dur-fast) var(--ease-spring);
}
.btn-primary:hover  { transform: translateY(-2px) scale(1.04); filter: brightness(1.2); }
.btn-primary:active { transform: translateY(1px) scale(0.97); }
.btn-primary:focus-visible { outline: 2px solid var(--gold); outline-offset: 2px; }
```

### Card / Panel

```css
.mtg-card {
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-card);
}
.mtg-card:hover {
  border-color: var(--gold-dim);
  box-shadow: var(--shadow-glow);
}
```

### Card Tile (carta de juego)

```css
.card-tile {
  transition: transform var(--dur-normal) var(--ease-spring), box-shadow var(--dur-normal);
}
.card-tile:hover {
  transform: translateY(-8px) scale(1.07);
  box-shadow: 0 16px 40px #000e, 0 0 20px rgba(255,215,0,0.47), 0 0 1px var(--gold);
  z-index: 50;
}
```

### Input

```css
.mtg-input {
  padding: 8px 12px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-strong);
  background: var(--bg-input);
  color: var(--text-primary);
  font-family: var(--font-ui);
  font-size: var(--text-base);
  outline: none;
  min-height: 40px; /* Touch target */
  transition: border-color var(--dur-fast);
}
.mtg-input:focus {
  border-color: var(--gold-dim);
  box-shadow: 0 0 0 2px var(--gold-glow);
}
```

---

## 7. Iconografía

**Regla crítica:** Usar exclusivamente `lucide-react` (ya instalado) para iconos de UI.  
Los emojis **solo están permitidos** en:
- Avatares de jugadores
- Símbolos de maná/color MTG (contexto narrativo)
- Nombres decorativos de habilidades

### Mapa de emojis → Lucide icons

| Emoji actual | Icono Lucide         | Uso                        |
|--------------|----------------------|----------------------------|
| 📚           | `BookOpen`           | Robar carta / Biblioteca   |
| ⟲            | `RotateCcw`          | Destapar                   |
| 🪄           | `Wand2`              | Token                      |
| 🎲           | `Dice6`              | Dado                       |
| 💬           | `MessageCircle`      | Chat                       |
| ↩            | `Undo2`              | Deshacer                   |
| ✨           | `Sparkles`           | Habilidades                |
| ❤            | `Heart`              | Vida                       |
| 💎           | `Gem`                | Maná                       |
| ⚔            | `Swords`             | Commander Damage           |
| 📝           | `FileText`           | Notas                      |
| 🔍           | `Search`             | Buscar                     |
| 📤           | `Download`           | Exportar                   |
| 🔄           | `RefreshCw`          | Reiniciar                  |
| ✕            | `X`                  | Cerrar / Salir             |
| 🔮           | `Eye`                | Scry / Ver tope            |
| 🪦           | `Ghost`              | Cementerio                 |
| 🏠           | `Home`               | Inicio                     |

---

## 8. Touch Targets

Requisito mínimo: **44×44px** para todo elemento interactivo.

Botones de contador actuales (24px/28px) → mínimo 36px en juego de mesa desktop, 44px en mobile.

```css
/* Clase utilitaria para expandir área de toque */
.touch-target {
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

---

## 9. Scrollbar

```css
::-webkit-scrollbar       { width: 4px; height: 4px; }
::-webkit-scrollbar-track { background: var(--bg-deep); }
::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, var(--gold), var(--gold-dark));
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover { background: var(--gold); }
```

---

## 10. Overlay / Scrim

Modales y drawers usan fondo oscuro semitransparente con al menos 70% opacidad:

```css
.modal-scrim {
  background: rgba(0, 0, 0, 0.75);  /* No menos de 0.7 */
  backdrop-filter: blur(2px);
}
```

---

## 11. Anti-Patterns a Evitar

| ❌ Evitar                                | ✅ Hacer en su lugar                          |
|------------------------------------------|-----------------------------------------------|
| Colores hex hardcodeados en JSX inline   | Variables CSS via `var(--gold)` etc.          |
| Emojis como íconos de UI                 | Lucide React icons                            |
| `<style>` tags inyectados en componentes | Estilos en `src/index.css`                    |
| Fuentes cargadas en `@import` inline JS  | `<link>` en `index.html`                      |
| Botones de 24px de alto                  | Mínimo 44px de alto                           |
| Animaciones sin `prefers-reduced-motion` | Siempre incluir `@media (prefers-reduced...)` |
| `console.log` / `try{}catch{}` vacíos    | Logging apropiado o eliminación               |
| Mezclar `fontFamily` in `style={{}}` JSX | `className` con clases CSS                    |

---

## 12. Checklist Pre-Entrega

- [ ] Todos los colores usan variables CSS (sin hex hardcodeados en JSX)
- [ ] Iconos de UI son de Lucide React (no emojis)
- [ ] Fuentes cargadas en `<head>` del HTML, no en imports JS
- [ ] Todos los keyframes viven en `index.css`
- [ ] `@media (prefers-reduced-motion: reduce)` implementado
- [ ] Touch targets ≥ 44px para todos los botones interactivos
- [ ] Contraste texto/fondo ≥ 4.5:1 (verificar con herramienta)
- [ ] Focus states visibles en todos los elementos interactivos
- [ ] Scrim de modal ≥ 0.7 opacidad
- [ ] Sin `cursor: pointer` faltante en elementos clicables
