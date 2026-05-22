# MTG Arena ES 🃏

Simulador de **Magic: The Gathering** multijugador online, construido con React + Supabase. Soporte para múltiples formatos, cartas en español, chat de voz WebRTC y mazos en la nube.

🌐 **Demo:** [v0-vite-react-setup-sand.vercel.app](https://v0-vite-react-setup-sand.vercel.app)

---

## Características

### Formatos soportados
| Formato | Vidas | Mazo | Comandante |
|---|---|---|---|
| Commander | 40 | 100 | ✓ |
| Duel Commander | 20 | 100 | ✓ |
| Brawl | 25 | 60 | ✓ |
| Oathbreaker | 20 | 60 | ✓ |
| Standard | 20 | 60 | — |
| Modern | 20 | 60 | — |
| Legacy | 20 | 60 | — |
| Vintage | 20 | 60 | — |
| Pioneer | 20 | 60 | — |
| Pauper | 20 | 60 | — |
| Personalizado | 20 | libre | — |

### Constructor de Mazos
- Búsqueda de cartas vía Scryfall API (inglés y español)
- Importar lista de texto (formato `1x Nombre Carta`)
- Barra de progreso durante importación
- Categorías automáticas en español (Criatura, Instantáneo, Tierra, etc.)
- Validación de legalidad por formato con badges 🚫 BAN / ⚠️ REST
- Sideboard (hasta 15 cartas) para formatos no-Commander
- Guardar mazo local o en la nube (requiere sesión)
- Cartas en español cuando están disponibles en Scryfall

### Tablero de Juego
- Soporte para 2–4 jugadores simultáneos
- Layout optimizado para 2 jugadores (pantalla dividida 50/50)
- Panel de fases: Mantenimiento → Robo → Principal 1 → Ataque → Principal 2 → Fin Turno
- Declarar atacantes con click derecho durante fase de Ataque
- Drag & drop para reordenar cartas en campo, tierras y mano

### Zonas de Juego
- Campo de batalla, mano, biblioteca, cementerio, exilio, zona de comandante, sideboard
- Reverso de cartas con diseño CSS para biblioteca y cartas boca abajo
- Búsqueda en biblioteca (Tutor → Mano / Campo / Tope)
- Scry, Surveil, Mill, Cascade, Discover, Impulse, Dredge y más

### Contadores y Estadísticas
- Vida ❤, Veneno ☠, Energía ⚡, Experiencia ✨
- Panel de daño de comandante por oponente con barra de progreso
- Contadores por carta: +1/+1, -1/-1, lealtad, veneno, personalizados
- Modificadores de Poder/Resistencia independientes

### Habilidades
- 25+ habilidades: Volar, Alcance, Arrollar, Vínculo vital, Prisa, Vigilancia, Toque mortal, Hexproof, Indestructible, Menace, Fear, Intimidate, Shadow, Infect, Wither, Annihilator, Enrage, Undying, Persist y más
- Auto-detección desde campo `keywords` de Scryfall al jugar la carta
- Asignación manual por carta con click derecho → ✨ Habilidades
- Íconos flotantes sobre las cartas en el campo

### Tokens
- Buscador de tokens en Scryfall
- Creación manual (nombre, tipo, P/T, color)
- Sugerencias automáticas de tokens para el comandante activo
- Tokens predefinidos comunes

### Social y Multijugador
- Salas con código de 4 letras
- Chat de texto en partida
- Chat de voz WebRTC P2P (sin servidor, gratuito)
- Indicador visual de quién está hablando 🎙
- Notificaciones en tiempo real entre jugadores
- Modo espectador (solo lectura)
- Log de acciones agrupado por turno (colapsable)

### Gestión de Partida
- Deshacer última acción (hasta 10 niveles)
- Reiniciar partida con los mismos jugadores
- Exportar estado de partida a `.txt`
- Tracker de maná (WUBRG + incoloro)
- Dados: d4, d6, d8, d10, d12, d20 (sincronizados entre jugadores)

### Autenticación y Nube
- Login con Google OAuth o email/contraseña vía Supabase Auth
- Nombre de jugador persistente por sesión
- Mazos guardados en la nube (Supabase) por usuario
- Mazos locales (localStorage) sin sesión
- Filtro de mazos por formato

---

## Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | React 18 + Vite |
| UI | CSS-in-JS (inline styles) |
| Realtime | Supabase Realtime (WebSockets) |
| Auth | Supabase Auth (Google OAuth + email) |
| Base de datos | Supabase PostgreSQL |
| Voz | WebRTC P2P + STUN Google |
| Cartas | Scryfall API + allorigins.win proxy |
| Deploy | Vercel |

---

## Estructura del Proyecto

```
├── src/
│   └── App.tsx          # Toda la app (~4900 líneas, single-file React)
├── api/
│   ├── scryfall.js      # Proxy serverless para Scryfall (Vercel)
│   └── scryfall-search.js
├── vercel.json
└── vite.config.ts
```

---

## Variables de Entorno / Configuración

Las credenciales están hardcodeadas en `App.tsx` para el proyecto actual:

```js
const SUPABASE_URL = "https://uiadnflgzuisymxbxbyi.supabase.co";
const SUPABASE_KEY = "..."; // anon key pública
```

Para un fork propio, reemplaza con tu proyecto de Supabase.

---

## Base de Datos (Supabase)

```sql
-- Tabla de mazos
create table user_decks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  deck jsonb not null,
  commander jsonb,
  format jsonb,
  sideboard jsonb,
  updated_at timestamptz default now()
);

alter table user_decks enable row level security;
create policy "Users can only see their own decks"
  on user_decks for all using (auth.uid() = user_id);

-- Tabla de sesiones de juego
create table game_sessions (
  room_code text,
  player_id text,
  state text,
  updated_at timestamptz,
  primary key (room_code, player_id)
);
alter table game_sessions enable row level security;
create policy "allow all" on game_sessions for all using (true);
```

---

## Desarrollo Local

```bash
git clone <repo>
cd <repo>
npm install
npm run dev
```

---

## Limitaciones Conocidas

- **CORS de Scryfall**: algunas llamadas usan `allorigins.win` como proxy. En entornos locales sin proxy puede haber fallos ocasionales.
- **Cartas en español**: solo las cartas con impresión física en español aparecen traducidas. El resto se muestra en inglés.
- **WebRTC**: puede fallar en redes corporativas con NAT estricto. No incluye servidor TURN.
- **Single-file**: toda la app está en un solo archivo `App.tsx` (~280KB). Funcional pero no ideal para proyectos grandes.

---

## Roadmap

- [ ] Historial de vida con gráfico por jugador
- [ ] Estadísticas de jugador (partidas, victorias, formato favorito)
- [ ] Modo mobile optimizado
- [ ] Animaciones al jugar cartas
- [ ] Temas de tablero
- [ ] Soporte offline / PWA

---

## Licencia

Proyecto personal / educativo. Magic: The Gathering es propiedad de Wizards of the Coast. Las imágenes de cartas son propiedad de sus respectivos artistas y Wizards of the Coast, servidas mediante la API pública de [Scryfall](https://scryfall.com).
