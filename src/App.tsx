// @ts-nocheck
import React, { useState, useEffect, useCallback, useRef } from "react";

// ─── Static Data (moved to top to prevent TDZ in production build) ─────────
var COUNTER_TYPES = [
  { key: "+1/+1", label: "+1/+1", color: "#1a4a1a", text: "#7fff7f", desc: "Poder y resistencia" },
  { key: "-1/-1", label: "-1/-1", color: "#4a1a1a", text: "#ff8888", desc: "Reducir P/R" },
  { key: "loyalty", label: "Lealtad", color: "#1a2a5a", text: "#7fc4ff", desc: "Planeswalker" },
  { key: "charge", label: "Carga", color: "#3a2a1a", text: "#ffcc88", desc: "Artefactos, hechizos" },
  { key: "poison", label: "Veneno", color: "#2a1a4a", text: "#cc88ff", desc: "Infect" },
  { key: "energy", label: "⚡ Energía", color: "#1a3a3a", text: "#88ffee", desc: "Contador de energía" },
  { key: "time", label: "⏳ Tiempo", color: "#2a2a1a", text: "#eeee88", desc: "Suspense, Vanishing" },
  { key: "quest", label: "📜 Misión", color: "#2a1a2a", text: "#ff88cc", desc: "Quest enchantments" },
  { key: "shield", label: "🛡 Escudo", color: "#1a2a2a", text: "#88ffcc", desc: "Ward counters" },
  { key: "custom", label: "✏ Custom", color: "#2a2a2a", text: "#cccccc", desc: "Contador personalizado" },
];
var TOKEN_PRESETS = [
  { name: "Soldado", p: "1", t: "1", color: "#e8e0c0" },
  { name: "Zombie", p: "2", t: "2", color: "#8a9a8a" },
  { name: "Dragón", p: "5", t: "5", color: "#c04020" },
  { name: "Ángel", p: "4", t: "4", color: "#f0e8b0" },
  { name: "Demonio", p: "5", t: "5", color: "#4a1a6a" },
  { name: "Golem", p: "3", t: "3", color: "#8a8a9a" },
  { name: "Elfo", p: "1", t: "1", color: "#2a5a2a" },
  { name: "Humano", p: "1", t: "1", color: "#c0a060" },
  { name: "Thopter", p: "1", t: "1", color: "#7a9aaa" },
  { name: "Tesorero", p: "0", t: "1", color: "#c0a020" },
];
var DICE = [
  { sides: 4, icon: "▲", color: "#ff8844" },
  { sides: 6, icon: "⬡", color: "#ffcc44" },
  { sides: 8, icon: "◆", color: "#44ff88" },
  { sides: 10, icon: "⬟", color: "#44ccff" },
  { sides: 12, icon: "⬠", color: "#cc88ff" },
  { sides: 20, icon: "⬡", color: "#ff4488" },
];
var KEYWORD_MAP = {
  "lifelink": "lifelink",
  "trample": "trample",
  "deathtouch": "deathtouch",
  "flying": "flying",
  "first strike": "firststrike",
  "double strike": "doublestrike",
  "haste": "haste",
  "vigilance": "vigilance",
  "hexproof": "hexproof",
  "indestructible": "indestructible",
  "menace": "menace",
  "reach": "reach",
  "fear": "fear",
  "intimidate": "intimidate",
  "shadow": "shadow",
  "wither": "wither",
  "infect": "infect",
  "flanking": "flanking",
  "protection": "protection",
};
var ABILITIES = [
  { key: "lifelink", name: "Vínculo vital", en: "Lifelink", icon: "💚", color: "#2a6a2a", text: "#88ff88", desc: "El daño que hace cura al jugador" },
  { key: "trample", name: "Arrollar", en: "Trample", icon: "🐂", color: "#5a3a1a", text: "#ffaa44", desc: "El exceso de daño pasa al jugador" },
  { key: "deathtouch", name: "Toque mortal", en: "Deathtouch", icon: "💀", color: "#2a1a3a", text: "#cc88ff", desc: "Mata a cualquier criatura que dañe" },
  { key: "flying", name: "Volar", en: "Flying", icon: "🦅", color: "#1a2a4a", text: "#88ccff", desc: "Solo puede bloquearse con voladoras" },
  { key: "firststrike", name: "Dañar primero", en: "First Strike", icon: "⚡", color: "#4a3a0a", text: "#ffdd44", desc: "Hace daño antes que las demás" },
  { key: "haste", name: "Prisa", en: "Haste", icon: "💨", color: "#4a1a1a", text: "#ff8844", desc: "Puede atacar el mismo turno que entra" },
  { key: "vigilance", name: "Vigilancia", en: "Vigilance", icon: "👁", color: "#3a3a1a", text: "#eedd88", desc: "No se gira al atacar" },
  { key: "hexproof", name: "Protección mágica", en: "Hexproof", icon: "🛡", color: "#1a3a3a", text: "#88ffee", desc: "No puede ser objetivo de hechizos del oponente" },
  { key: "indestructible", name: "Indestructible", en: "Indestructible", icon: "♾", color: "#2a2a4a", text: "#aaaaff", desc: "No puede ser destruida" },
  { key: "menace", name: "Amenaza", en: "Menace", icon: "😈", color: "#3a1a2a", text: "#ff88aa", desc: "Debe bloquearse con 2+ criaturas" },
  { key: "reach", name: "Alcance", en: "Reach", icon: "🌿", color: "#1a3a1a", text: "#88dd88", desc: "Puede bloquear criaturas con volar" },
  { key: "doublestrike", name: "Doble golpe", en: "Double Strike", icon: "⚔⚔", color: "#4a2a0a", text: "#ffcc44", desc: "Daña primero y también en combate normal" },
  { key: "fear", name: "Inspirar temor", en: "Fear", icon: "👻", color: "#1a0a2a", text: "#bb88ff", desc: "Solo puede bloquearse con artefactos o criaturas negras" },
  { key: "intimidate", name: "Intimidar", en: "Intimidate", icon: "😱", color: "#2a1a3a", text: "#dd99ff", desc: "Solo puede bloquearse con artefactos o criaturas del mismo color" },
  { key: "shadow", name: "Sombra", en: "Shadow", icon: "🌑", color: "#0a0a1a", text: "#9999cc", desc: "Solo bloquea y es bloqueada por criaturas con sombra" },
  { key: "wither", name: "Marchitar", en: "Wither", icon: "🥀", color: "#1a2a0a", text: "#88cc44", desc: "Inflige daño a criaturas como contadores -1/-1" },
  { key: "infect", name: "Infectar", en: "Infect", icon: "☣", color: "#0a2a0a", text: "#44ff44", desc: "Daña como contadores -1/-1 a criaturas y contadores de veneno a jugadores" },
  { key: "flanking", name: "Flanquear", en: "Flanking", icon: "🐎", color: "#3a2a0a", text: "#ffbb44", desc: "Criaturas que lo bloquean sin flanquear obtienen -1/-1" },
  { key: "protection", name: "Protección", en: "Protection", icon: "🔰", color: "#0a2a3a", text: "#44ddff", desc: "Protegida de un color o tipo específico" },
  { key: "enrage", name: "Enfurecer", en: "Enrage", icon: "🔴", color: "#3a0a0a", text: "#ff6644", desc: "Se activa cuando recibe daño" },
  { key: "undying", name: "Inmortal", en: "Undying", icon: "🔁", color: "#0a1a2a", text: "#44ccff", desc: "Vuelve del cementerio con +1/+1 si no tenía contadores" },
  { key: "persist", name: "Persistir", en: "Persist", icon: "🔄", color: "#1a0a2a", text: "#cc88ff", desc: "Vuelve del cementerio con -1/-1 si no tenía contadores" },
  { key: "exploit", name: "Explotar", en: "Exploit", icon: "💥", color: "#2a0a1a", text: "#ff44aa", desc: "Puedes sacrificar una criatura al entrar al campo" },
  { key: "annihilator", name: "Aniquilador", en: "Annihilator", icon: "☠⚡", color: "#1a0a0a", text: "#ff2222", desc: "El defensor sacrifica permanentes al atacar" },
  { key: "unblockable", name: "Imbloqueable", en: "Unblockable", icon: "👻", color: "#0a0a2a", text: "#8888ff", desc: "No puede ser bloqueada" },
];
var MANA_DEFS = [
  { key: "W", label: "Blanco", color: "#f9f3d9", text: "#8a7a30", symbol: "☀" },
  { key: "U", label: "Azul", color: "#b3d9f7", text: "#1a4a7a", symbol: "💧" },
  { key: "B", label: "Negro", color: "#c8a0c8", text: "#4a1a4a", symbol: "💀" },
  { key: "R", label: "Rojo", color: "#f7b3a0", text: "#7a1a0a", symbol: "🔥" },
  { key: "G", label: "Verde", color: "#a0d9b3", text: "#0a4a1a", symbol: "🌲" },
  { key: "C", label: "Incoloro", color: "#d0d0d0", text: "#3a3a3a", symbol: "◇" },
];
var PHASES = ["Mantenimiento", "Robo", "Principal 1", "Ataque", "Principal 2", "Fin Turno"];

var FORMATS = [
  { key: "commander", label: "Commander", icon: "⚔️", desc: "100 cartas, comandante legendario, 40 vidas", deckSize: 100, life: 40, singletons: true },
  { key: "standard", label: "Standard", icon: "📅", desc: "Máximo 4 copias, sets recientes", deckSize: 60, life: 20, singletons: false },
  { key: "modern", label: "Modern", icon: "🔧", desc: "Máximo 4 copias, sets desde 2003", deckSize: 60, life: 20, singletons: false },
  { key: "legacy", label: "Legacy", icon: "📜", desc: "Máximo 4 copias, casi todo permitido", deckSize: 60, life: 20, singletons: false },
  { key: "vintage", label: "Vintage", icon: "🏺", desc: "Máximo 4 copias, Power 9 restringido", deckSize: 60, life: 20, singletons: false },
  { key: "pauper", label: "Pauper", icon: "🪙", desc: "Solo cartas comunes, máximo 4 copias", deckSize: 60, life: 20, singletons: false },
  { key: "pioneer", label: "Pioneer", icon: "🌄", desc: "Máximo 4 copias, sets desde 2012", deckSize: 60, life: 20, singletons: false },
  { key: "brawl", label: "Brawl", icon: "🗡", desc: "60 cartas, comandante, solo Standard", deckSize: 60, life: 25, singletons: true },
  { key: "oathbreaker", label: "Oathbreaker", icon: "🔮", desc: "60 cartas, planeswalker como comandante", deckSize: 60, life: 20, singletons: true },
  { key: "duel", label: "Duel Commander", icon: "🥊", desc: "Commander 1vs1, 20 vidas", deckSize: 100, life: 20, singletons: true },
  { key: "custom", label: "Personalizado", icon: "✨", desc: "Sin restricciones", deckSize: 0, life: 20, singletons: false },
];


var AVATARS = ['🧙', '⚔️', '🐉', '🏴\u200d☠️', '🦁', '🐺', '🦊', '🐻', '🦅', '🦉', '🧝', '🧛', '🧟', '🧜', '🪄', '🔮', '💀', '🌙', '☀️', '⚡', '🔥', '❄️', '🌊', '🌿'];


// ─── Sound Engine (Web Audio API) ────────────────────────────────────────────
var AudioCtx = typeof window !== "undefined" ? (window.AudioContext || window.webkitAudioContext) : null;
let _actx = null;
function getAudioCtx() { if (!_actx && AudioCtx) _actx = new AudioCtx(); return _actx; }
function playTone(freq, dur, type = "sine", vol = 0.15, delay = 0) {
  try {
    const ctx = getAudioCtx(); if (!ctx) return;
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.type = type; o.frequency.setValueAtTime(freq, ctx.currentTime + delay);
    g.gain.setValueAtTime(vol, ctx.currentTime + delay);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + dur);
    o.start(ctx.currentTime + delay); o.stop(ctx.currentTime + delay + dur + 0.01);
  } catch { }
}
var SFX = {
  draw: () => { playTone(440, 0.08, "sine", 0.12); playTone(550, 0.08, "sine", 0.10, 0.07); },
  play: () => { playTone(330, 0.12, "triangle", 0.13); playTone(440, 0.1, "triangle", 0.10, 0.1); },
  tap: () => playTone(220, 0.07, "square", 0.07),
  phase: () => { playTone(528, 0.15, "sine", 0.12); playTone(660, 0.12, "sine", 0.10, 0.12); },
  turnEnd: () => { [440, 550, 660].forEach((f, i) => playTone(f, 0.12, "sine", 0.13, i * 0.1)); },
  life: (d) => d < 0 ? playTone(180, 0.2, "sawtooth", 0.15) : playTone(550, 0.15, "sine", 0.12),
  graveyard: () => playTone(150, 0.25, "sawtooth", 0.13),
  shuffle: () => { for (let i = 0; i < 6; i++) playTone(200 + Math.random() * 300, 0.05, "square", 0.06, i * 0.04); },
  token: () => { playTone(660, 0.1, "sine", 0.12); playTone(880, 0.1, "sine", 0.10, 0.08); },
  undo: () => { playTone(550, 0.08, "sine", 0.1); playTone(440, 0.1, "sine", 0.1, 0.08); },
  chat: () => playTone(880, 0.06, "sine", 0.08),
  commander: () => { [330, 440, 550, 660].forEach((f, i) => playTone(f, 0.15, "triangle", 0.13, i * 0.08)); },
};


// ─── Supabase ─────────────────────────────────────────────────────────────────
var SUPABASE_URL = "https://uiadnflgzuisymxbxbyi.supabase.co";
var SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpYWRuZmxnenVpc3lteGJ4YnlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3MDY2MDksImV4cCI6MjA5NDI4MjYwOX0.rw-iCALIbf0pzc-9ENtKiklKPVPknrg95fsdNfqi9F8";

class SupabaseRealtime {
  constructor() { this.ws = null; this.channel = null; this.heartbeat = null; this.ref = 1; this.onMessage = null; }
  connect(roomCode, onMessage) {
    this.onMessage = onMessage;
    const wsUrl = SUPABASE_URL.replace("https://", "wss://") + "/realtime/v1/websocket?apikey=" + SUPABASE_KEY + "&vsn=1.0.0";
    this.channel = `realtime:commander:${roomCode}`;
    this.ws = new WebSocket(wsUrl);
    this.ws.onopen = () => {
      this._send({ topic: this.channel, event: "phx_join", payload: { config: { broadcast: { self: false } } }, ref: String(this.ref++) });
      this.heartbeat = setInterval(() => this._send({ topic: "phoenix", event: "heartbeat", payload: {}, ref: String(this.ref++) }), 25000);
    };
    this.ws.onmessage = (e) => {
      try { const msg = JSON.parse(e.data); if (msg.event === "broadcast" && msg.payload?.event) this.onMessage?.(msg.payload.event, msg.payload.payload); } catch { }
    };
    this.ws.onerror = () => { }; this.ws.onclose = () => clearInterval(this.heartbeat);
  }
  broadcast(event, payload) { if (this.ws?.readyState !== WebSocket.OPEN) return; this._send({ topic: this.channel, event: "broadcast", payload: { type: "broadcast", event, payload }, ref: String(this.ref++) }); }
  _send(obj) { this.ws?.send(JSON.stringify(obj)); }
  disconnect() { clearInterval(this.heartbeat); this.ws?.close(); }
}

// ─── Scryfall ─────────────────────────────────────────────────────────────────
async function searchCards(query) {
  const url = `https://api.scryfall.com/cards/search?q=${encodeURIComponent(query)}&order=name&unique=cards`;
  try {
    const r = await fetch(url);
    if (r.ok) { const d = await r.json(); return d.data || []; }
  } catch { }
  // Fallback via allorigins proxy
  try {
    const r2 = await fetch("https://api.allorigins.win/get?url=" + encodeURIComponent(url));
    if (r2.ok) { const w = await r2.json(); return JSON.parse(w.contents).data || []; }
  } catch { }
  return [];
}
// Direct Scryfall calls - works fine for card data and images
// Spanish lang calls are attempted but silently fall back to English
function scryfallUrl(path) {
  return "https://api.scryfall.com" + path;
}

async function getCardLocalized(card, preferLang = "es") {
  // Use English image (same artwork, just different text)
  // Spanish card NAME comes from printed_name field if available
  const img = card.image_uris?.normal || card.card_faces?.[0]?.image_uris?.normal || null;
  return {
    image_url: img,
    printed_name: card.printed_name || card.name,
    printed_text: card.printed_text || card.oracle_text,
    type_line: card.printed_type_line || card.type_line,
  };
}
async function getCardImage(card) {
  if (card.image_uris?.normal) return card.image_uris.normal;
  if (card.card_faces?.[0]?.image_uris?.normal) return card.card_faces[0].image_uris.normal;
  return null;
}
function getCardName(c) { return c?.printed_name || c?.name || "?"; }

// ─── Persistence ─────────────────────────────────────────────────────────────
var DECK_STORAGE_KEY = "commander_es_decks";
var SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function getSavedDecks() {
  try { return JSON.parse(localStorage.getItem(DECK_STORAGE_KEY) || "[]"); } catch { return []; }
}
function saveDeckToStorage(name, deck, commander, playerName, format, sideboard) {
  const decks = getSavedDecks().filter(d => d.name !== name);
  decks.unshift({ name, deck, commander, playerName, format: format || FORMATS[0], sideboard: sideboard || [], savedAt: Date.now() });
  localStorage.setItem(DECK_STORAGE_KEY, JSON.stringify(decks.slice(0, 20))); // max 20 decks
}
function deleteDeckFromStorage(name) {
  const decks = getSavedDecks().filter(d => d.name !== name);
  localStorage.setItem(DECK_STORAGE_KEY, JSON.stringify(decks));
}

// ─── Supabase Auth Client ────────────────────────────────────────────────────
var SB_AUTH = SUPABASE_URL + "/auth/v1";
var SB_REST = SUPABASE_URL + "/rest/v1";

async function refreshAccessToken() {
  const refresh = localStorage.getItem("sb_refresh_token");
  if (!refresh) return false;
  try {
    const r = await fetch(`${SB_AUTH}/token?grant_type=refresh_token`, {
      method: "POST",
      headers: { "apikey": SUPABASE_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refresh })
    });
    if (!r.ok) return false;
    const d = await r.json();
    if (d.access_token) {
      localStorage.setItem("sb_access_token", d.access_token);
      if (d.refresh_token) localStorage.setItem("sb_refresh_token", d.refresh_token);
      localStorage.setItem("sb_user", JSON.stringify(d.user));
      return true;
    }
  } catch { }
  return false;
}

async function authFetch(path, opts = {}) {
  let token = localStorage.getItem("sb_access_token");
  const doFetch = (t) => fetch(SUPABASE_URL + path, {
    ...opts,
    headers: {
      "apikey": SUPABASE_KEY,
      "Authorization": "Bearer " + (t || SUPABASE_KEY),
      "Content-Type": "application/json",
      "Accept": "application/json",
      ...(opts.headers || {}),
    }
  });
  let r = await doFetch(token);
  // If 401, try refreshing token once
  if (r.status === 401) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      token = localStorage.getItem("sb_access_token");
      r = await doFetch(token);
    }
  }
  return r;
}

// Sign in with Google OAuth
async function signInWithGoogle() {
  const redirectTo = encodeURIComponent("https://v0-vite-react-setup-sand.vercel.app");
  window.location.href = `${SB_AUTH}/authorize?provider=google&redirect_to=${redirectTo}`;
}

// Sign in with email/password
async function signInWithEmail(email, password) {
  const r = await fetch(`${SB_AUTH}/token?grant_type=password`, {
    method: "POST",
    headers: { "apikey": SUPABASE_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  const d = await r.json();
  if (d.access_token) {
    localStorage.setItem("sb_access_token", d.access_token);
    localStorage.setItem("sb_refresh_token", d.refresh_token);
    localStorage.setItem("sb_user", JSON.stringify(d.user));
    return { user: d.user, error: null };
  }
  return { user: null, error: d.error_description || d.msg || "Error al iniciar sesión" };
}

// Sign up with email/password
async function signUpWithEmail(email, password) {
  const r = await fetch(`${SB_AUTH}/signup`, {
    method: "POST",
    headers: { "apikey": SUPABASE_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  const d = await r.json();
  if (d.access_token) {
    localStorage.setItem("sb_access_token", d.access_token);
    localStorage.setItem("sb_refresh_token", d.refresh_token);
    localStorage.setItem("sb_user", JSON.stringify(d.user));
    return { user: d.user, error: null };
  }
  return { user: null, error: d.error_description || d.msg || "Error al registrarse" };
}

// Sign out
function signOut() {
  localStorage.removeItem("sb_access_token");
  localStorage.removeItem("sb_refresh_token");
  localStorage.removeItem("sb_user");
}

// Get current user from token
function getCurrentUser() {
  try { return JSON.parse(localStorage.getItem("sb_user") || "null"); } catch { return null; }
}

// Get display name from Google user (uses full name, then email prefix)
function getUserDisplayName(user) {
  if (!user) return null;
  return user.user_metadata?.full_name
    || user.user_metadata?.name
    || user.email?.split("@")[0]
    || null;
}

// Saved player name (persists in localStorage while session is open)
function getSavedPlayerName() {
  return localStorage.getItem("commander_es_player_name") || "";
}
function setSavedPlayerName(name) {
  localStorage.setItem("commander_es_player_name", name);
}

// Handle OAuth callback (token in URL hash)
function handleAuthCallback() {
  const hash = window.location.hash;
  if (!hash) return null;
  const params = new URLSearchParams(hash.slice(1));
  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");
  if (accessToken) {
    localStorage.setItem("sb_access_token", accessToken);
    if (refreshToken) localStorage.setItem("sb_refresh_token", refreshToken);
    // Fetch user info
    fetch(`${SB_AUTH}/user`, {
      headers: { "apikey": SUPABASE_KEY, "Authorization": "Bearer " + accessToken }
    }).then(r => r.json()).then(user => {
      localStorage.setItem("sb_user", JSON.stringify(user));
      window.history.replaceState({}, document.title, window.location.pathname);
    });
    window.history.replaceState({}, document.title, window.location.pathname);
    return accessToken;
  }
  return null;
}

// Cloud deck operations
async function saveCloudDeck(name, deck, commander, playerName, format, sideboard) {
  const user = getCurrentUser();
  if (!user) return { ok: false, error: "No hay sesión activa" };
  try {
    const r = await authFetch("/rest/v1/user_decks", {
      method: "POST",
      headers: { "Prefer": "return=minimal" },
      body: JSON.stringify({
        user_id: user.id,
        name,
        deck: { cards: deck, format: format || FORMATS[0], sideboard: sideboard || [] },
        commander,
        updated_at: new Date().toISOString()
      })
    });
    if (!r.ok) {
      const errText = await r.text();
      console.error("saveCloudDeck error:", r.status, errText);
      return { ok: false, error: `Error ${r.status}: ${errText}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

async function loadCloudDecks() {
  const user = getCurrentUser();
  if (!user) return [];
  const r = await authFetch(`/rest/v1/user_decks?user_id=eq.${user.id}&order=updated_at.desc`);
  if (!r.ok) return [];
  const rows = await r.json();
  // Normalize: support both old format (deck=[]) and new format (deck={cards,format,sideboard})
  return rows.map(row => {
    const d = row.deck;
    if (Array.isArray(d)) {
      // Old format — deck is plain array
      return { ...row, deck: d, format: FORMATS[0], sideboard: [] };
    }
    // New format — deck is object with cards/format/sideboard
    return { ...row, deck: d?.cards || [], format: d?.format || FORMATS[0], sideboard: d?.sideboard || [] };
  });
}

async function deleteCloudDeck(id) {
  const r = await authFetch(`/rest/v1/user_decks?id=eq.${id}`, { method: "DELETE" });
  return r.ok;
}

// Game session persistence via Supabase REST API
var SB_HEADERS = { "apikey": SUPABASE_KEY, "Authorization": "Bearer " + SUPABASE_KEY, "Content-Type": "application/json", "Prefer": "resolution=merge-duplicates,return=minimal" };

async function saveGameSession(roomCode, myId, playersState, turn, phase, activePlayer) {
  return; // state saved to localStorage via syncState
}




async function loadGameSession(roomCode, myId) {
  // Load from localStorage instead of Supabase
  try {
    const raw = localStorage.getItem("commander_es_full_save");
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data.roomCode !== roomCode) return null;
    const age = Date.now() - (data.savedAt || 0);
    if (age > SESSION_TTL_MS) return null;
    return { playersState: Object.fromEntries((data.players || []).map(p => [p.id, p.playerState])), turn: data.turn, phase: data.phase, activePlayer: data.activePlayer };
  } catch { return null; }
}

async function clearGameSession(roomCode, myId) {
  try { localStorage.removeItem("commander_es_full_save"); } catch { }
}


const uid = () => Math.random().toString(36).slice(2, 10);
const shuffle = (arr) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } return a; };
const genCode = () => Math.random().toString(36).slice(2, 6).toUpperCase();
function isLegendary(c) {
  const t = c?.type_line?.toLowerCase() || "";
  return t.includes("legendary") || t.includes("legendaria") || t.includes("legendario");
}
function isLand(c) { const t = c?.type_line?.toLowerCase() || ""; return t.includes("land") || t.includes("tierra"); }

function mkState(id, name, deck, commander, startLife = 40, sideboard = []) {
  // Ensure commander is not in the library (filter by name and id)
  const deckFiltered = (commander && commander.name)
    ? deck.filter(c => c && c.name !== commander.name && c.id !== commander.id)
    : deck;
  const lib = shuffle([...deckFiltered]);
  return {
    id, name, life: startLife, poison: 0, energy: 0, experience: 0, sideboard: sideboard || [],
    commanderDamage: {},
    commanderTax: 0,
    hand: lib.slice(0, 7).map(c => ({ ...c, instanceId: uid() })),
    library: lib.slice(7),
    battlefield: [],
    graveyard: [],
    exile: [],
    commandZone: commander ? [{ ...commander, instanceId: uid() }] : [],
    commanderCard: commander ? { ...commander } : null,
  };
}

// ─── Scroll Overflow Indicator ──────────────────────────────────────────────────
function ScrollIndicator({ containerRef }) {
  const [hasOverflow, setHasOverflow] = useState(false);
  const [atEnd, setAtEnd] = useState(false);
  useEffect(() => {
    const el = containerRef?.current;
    if (!el) return;
    const check = () => {
      setHasOverflow(el.scrollWidth > el.clientWidth + 4);
      setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
    };
    check();
    el.addEventListener("scroll", check);
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => { el.removeEventListener("scroll", check); ro.disconnect(); };
  }, [containerRef]);
  if (!hasOverflow || atEnd) return null;
  return (
    <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 32, background: "linear-gradient(to right, transparent, #06060eee)", display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 5, pointerEvents: "none", zIndex: 5 }}>
      <span style={{ fontSize: 16, color: "#ffd700cc" }}>›</span>
    </div>
  );
}

// ─── Hover Zoom ───────────────────────────────────────────────────────────────
function HoverZoom({ card, x, y }) {
  if (!card) return null;
  const imgUrl = card.image_url;
  const left = x > window.innerWidth - 240 ? x - 230 : x + 16;
  const top = Math.min(y - 60, window.innerHeight - 360);
  return (
    <div style={{ position: "fixed", left, top, zIndex: 9999, pointerEvents: "none", filter: "drop-shadow(0 8px 32px #000c)" }}>
      {imgUrl
        ? <img src={imgUrl} style={{ width: 210, borderRadius: 12 }} alt={getCardName(card)} />
        : <div style={{ width: 210, aspectRatio: "2.5/3.5", borderRadius: 12, background: "#1a1a3e", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8, color: "#ccc", fontSize: 13, padding: 16, textAlign: "center" }}>
          <div style={{ fontSize: 32 }}>🃏</div><div>{getCardName(card)}</div>
        </div>}
    </div>
  );
}

// ─── Card Tile ────────────────────────────────────────────────────────────────
function CardTile({ card, onClick, onDoubleClick, onRightClick, onHover, onHoverEnd, small, mini, tapped, selected, faceDown }) {
  const [loaded, setLoaded] = useState(false);
  const imgUrl = faceDown ? null : card?.image_url;
  const w = mini ? 40 : small ? 52 : 72; const h = mini ? 56 : small ? 73 : 100;
  return (
    <div onClick={onClick}
      onDoubleClick={onDoubleClick}
      onContextMenu={e => { e.preventDefault(); onRightClick?.(); }}
      onMouseEnter={e => onHover?.(card, e.clientX, e.clientY)}
      onMouseMove={e => onHover?.(card, e.clientX, e.clientY)}
      onMouseLeave={() => onHoverEnd?.()}
      title={faceDown ? "?" : getCardName(card)}
      style={{ width: w, height: h, borderRadius: 5, overflow: "hidden", cursor: "pointer", flexShrink: 0, transform: tapped ? "rotate(90deg)" : "none", transition: "transform 0.2s", boxShadow: selected ? "0 0 0 2px #ffd700,0 4px 16px #0008" : "0 2px 8px #0005", border: selected ? "2px solid #ffd700" : "2px solid #2a2a4a", background: "#1a1a2e", position: "relative" }}>
      {faceDown
        ? <div style={{ width: "100%", height: "100%", background: "linear-gradient(160deg,#1a2a4a 0%,#0d1a2e 40%,#1a0a2a 100%)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 4, border: "2px solid #3a4a6a", borderRadius: 4 }} />
          <div style={{ position: "absolute", inset: 6, border: "1px solid #2a3a5a", borderRadius: 3 }} />
          <div style={{ fontSize: 28, opacity: 0.6 }}>🌟</div>
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg,#1a2a8a,#8a1a8a,#1a2a8a)" }} />
        </div>
        : imgUrl
          ? <><div style={{ position: "absolute", inset: 0, display: loaded ? "none" : "flex", alignItems: "center", justifyContent: "center", fontSize: 8, color: "#888", padding: 3, textAlign: "center" }}>{getCardName(card)}</div><img src={imgUrl} alt={getCardName(card)} onLoad={() => setLoaded(true)} style={{ width: "100%", height: "100%", objectFit: "cover", display: loaded ? "block" : "none" }} /></>
          : card?.isToken
            ? <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 3, background: `linear-gradient(135deg,${card.tokenColor || "#2a2a4a"}44,#0d0d1a)`, fontSize: 8, color: card.tokenColor || "#aaa", textAlign: "center", gap: 3 }}><div style={{ fontSize: 14, fontWeight: 800, color: card.tokenColor || "#fff" }}>{card.power}/{card.toughness}</div><div style={{ fontSize: 7, opacity: 0.8 }}>{getCardName(card)}</div><div style={{ fontSize: 6, opacity: 0.5 }}>TOKEN</div></div>
            : <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 3, background: "linear-gradient(135deg,#1a1a3e,#0d0d1a)", fontSize: 8, color: "#ccc", textAlign: "center", gap: 3 }}><div style={{ fontSize: 16 }}>🃏</div><div>{getCardName(card)}</div></div>}
    </div>
  );
}

// ─── Context Menu (with submenu support) ─────────────────────────────────────
// Uses pure CSS :hover via injected <style> — no timer races, no state flicker.
function CtxMenu({ menu, onClose }) {
  if (!menu) return null;
  const W = 215;
  const left = menu.x + W > window.innerWidth ? menu.x - W : menu.x;
  const top = Math.min(menu.y, window.innerHeight - Math.min(menu.items.length * 32 + 60, 500));

  const renderItems = (items, depth = 0) => items.map((item, i) => {
    const key = depth + "-" + i;
    if (item === "---") return <div key={key} style={{ borderTop: "1px solid #2a2a4a", margin: "3px 0" }} />;

    if (item.submenu) {
      // Submenu shown via CSS :hover on the parent .has-sub div
      // The submenu panel is absolutely positioned and only visible on hover
      const subLeft = depth === 0 ? W - 4 : W - 4;
      return (
        <div key={key} className="has-sub" style={{ position: "relative" }}>
          <button style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            width: "100%", padding: "7px 10px", border: "none", background: "none",
            color: item.color || "#e8e0d0", cursor: "pointer", textAlign: "left",
            fontSize: 12, borderRadius: 5, boxSizing: "border-box"
          }}>
            <span>{item.label}</span>
            <span style={{ color: "#666", fontSize: 9, marginLeft: 8 }}>▶</span>
          </button>
          {/* Invisible bridge: fills the gap between button and submenu */}
          <div style={{
            position: "absolute", top: 0, left: W - 8, width: 12, height: "100%",
            background: "transparent"
          }} />
          <div style={{
            position: "absolute", top: -8, left: subLeft,
            background: "#161630", border: "1px solid #3a3a6a", borderRadius: 10,
            padding: 7, minWidth: W, boxShadow: "0 8px 40px #000c", zIndex: 20,
            display: "none"  // toggled by CSS .has-sub:hover > .submenu-panel
          }} className="submenu-panel">
            {renderItems(item.submenu, depth + 1)}
          </div>
        </div>
      );
    }

    return (
      <button key={key}
        onClick={e => { e.stopPropagation(); item.action(); onClose(); }}
        style={{
          display: "block", width: "100%", padding: "7px 10px", border: "none",
          background: "none", color: item.color || "#e8e0d0",
          cursor: "pointer", textAlign: "left", fontSize: 12, borderRadius: 5
        }}
        onMouseEnter={e => e.currentTarget.style.background = "#2a2a5a"}
        onMouseLeave={e => e.currentTarget.style.background = "none"}>
        {item.label}
      </button>
    );
  });

  return (
    <>
      <style>{`
        .has-sub:hover > .submenu-panel { display: block !important; }
        .has-sub:hover > button { background: #2a2a5a !important; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes slideDown { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
      <div style={{ position: "fixed", inset: 0, zIndex: 500 }} onClick={onClose}>
        <div style={{ position: "absolute", left, top, background: "#161630", border: "1px solid #3a3a6a", borderRadius: 10, padding: 7, minWidth: W, boxShadow: "0 8px 40px #000c" }}
          onClick={e => e.stopPropagation()}>
          {menu.title && (
            <div style={{ fontSize: 10, color: "#ffd700", padding: "3px 10px 6px", borderBottom: "1px solid #2a2a4a", marginBottom: 3, fontWeight: 700 }}>
              {menu.title}
            </div>
          )}
          {renderItems(menu.items)}
        </div>
      </div>
    </>
  );
}

// ─── Library Context Menu items ───────────────────────────────────────────────
function libraryMenu(p, pid, isMe, actions) {
  if (!isMe) return [];
  const askX = (msg, def = "1") => { const x = parseInt(prompt(msg, def)); return isNaN(x) || x < 1 ? null : x; };
  return [
    // ── Robar ─────────────────────────────────────────────────────────────────
    {
      label: "📖 Robar ▶",
      submenu: [
        { label: "Robar 1", action: () => actions.draw(pid, 1) },
        { label: "Robar 2", action: () => actions.draw(pid, 2) },
        { label: "Robar 3", action: () => actions.draw(pid, 3) },
        { label: "Robar X...", action: () => { const x = askX("¿Cuántas cartas robar?", "3"); if (x) actions.draw(pid, x); } },
      ],
    },
    "---",
    // ── Ver / Inspeccionar tope ───────────────────────────────────────────────
    {
      label: "🔍 Ver tope ▶",
      submenu: [
        { label: "Ver top 1", action: () => actions.viewTop(pid, 1) },
        { label: "Ver top 3", action: () => actions.viewTop(pid, 3) },
        { label: "Ver top X...", action: () => { const x = askX("¿Cuántas cartas ver?", "3"); if (x) actions.viewTop(pid, x); } },
      ],
    },
    // ── Scry / Surveil ────────────────────────────────────────────────────────
    {
      label: "🔮 Scry / Surveil ▶",
      submenu: [
        { label: "Scry 1", action: () => actions.scry(pid, 1) },
        { label: "Scry 2", action: () => actions.scry(pid, 2) },
        { label: "Scry X...", action: () => { const x = askX("Scry X:", "2"); if (x) actions.scry(pid, x); } },
        "---",
        { label: "Surveil 1", action: () => actions.surveil(pid, 1) },
        { label: "Surveil 2", action: () => actions.surveil(pid, 2) },
        { label: "Surveil X...", action: () => { const x = askX("Surveil X:", "2"); if (x) actions.surveil(pid, x); } },
      ],
    },
    "---",
    // ── Mill ──────────────────────────────────────────────────────────────────
    {
      label: "🌀 Mill ▶",
      submenu: [
        { label: "Mill 1", action: () => actions.mill(pid, 1) },
        { label: "Mill 3", action: () => actions.mill(pid, 3) },
        { label: "Mill 5", action: () => actions.mill(pid, 5) },
        { label: "Mill X...", action: () => { const x = askX("¿Cuántas hacer mill?", "3"); if (x) actions.mill(pid, x); } },
      ],
    },
    // ── Exiliar / Mecánicas especiales ───────────────────────────────────────
    {
      label: "💀 Exiliar / Mecánicas ▶",
      submenu: [
        { label: "Exiliar top 1", action: () => actions.exileTop(pid, 1) },
        { label: "Exiliar top X...", action: () => { const x = askX("¿Cuántas exiliar del tope?", "1"); if (x) actions.exileTop(pid, x); } },
        "---",
        { label: "🌊 Cascade...", action: () => { const x = askX("CMC del hechizo que disparó Cascade:", "5"); if (x) actions.cascade(pid, x); } },
        { label: "🔭 Discover X...", action: () => { const x = askX("Discover X (exilar top X, jugar uno gratis):", "4"); if (x) actions.discover(pid, x); } },
        { label: "💨 Impulse X...", action: () => { const x = askX("Impulse X (exilar top X, jugar uno este turno):", "4"); if (x) actions.impulse(pid, x); } },
        { label: "✨ Foretell", action: () => actions.foretell(pid) },
        { label: "⏳ Suspend...", action: () => actions.suspend(pid) },
        "---",
        { label: "🌿 Dredge...", action: () => { const x = askX("Dredge X (mill X, devolver carta del cementerio):", "3"); if (x) actions.dredge(pid, x); } },
        { label: "🎴 Connive X...", action: () => { const x = askX("Connive X (robar X, descartar X):", "1"); if (x) actions.connive(pid, x); } },
        { label: "✨ Miracle", action: () => actions.miracle(pid) },
      ],
    },
    "---",
    // ── Mover cartas ─────────────────────────────────────────────────────────
    {
      label: "⬇ Mover ▶",
      submenu: [
        { label: "Top → Fondo", action: () => actions.topToBottom(pid, 1) },
        { label: "Top X → Fondo...", action: () => { const x = askX("¿Cuántas mover al fondo?", "1"); if (x) actions.topToBottom(pid, x); } },
        "---",
        { label: "Fondo → Top", action: () => actions.bottomToTop(pid) },
        "---",
        { label: "🔄 Revelar hasta tierra", action: () => actions.revealUntilLand(pid) },
        { label: "🔎 Tutor → Mano", action: () => actions.tutorToHand(pid) },
        { label: "🔎 Tutor → Campo", action: () => actions.tutorToBattlefield(pid) },
        { label: "🔎 Tutor → Tope biblioteca", action: () => actions.tutorToTop(pid) },
        { label: "🔎 Buscar carta específica", action: () => actions.searchLib(pid) },
      ],
    },
    "---",
    // ── Reanimar ─────────────────────────────────────────────────────────────
    {
      label: "☠ Reanimar ▶",
      color: "#ff88aa",
      submenu: [
        { label: "☠ Cementerio → Mano", action: () => actions.reanimateToHand(pid), color: "#ff88aa" },
        { label: "⚔ Cementerio → Campo", action: () => actions.reanimateToBattlefield(pid), color: "#ff88aa" },
      ],
    },
    "---",
    // ── Biblioteca ───────────────────────────────────────────────────────────
    {
      label: "🔀 Biblioteca ▶",
      submenu: [
        { label: "Barajar biblioteca", action: () => actions.shuffleLib(pid) },
        { label: "Barajar mano + biblioteca", action: () => actions.handToLib(pid) },
      ],
    },
  ];
}

// ─── Scry Modal ───────────────────────────────────────────────────────────────
function ScryModal({ cards, onDone, title }) {
  const [top, setTop] = useState(cards.map(c => ({ ...c, dest: "top" }))); // top | bottom | graveyard
  const toggle = (idx, dest) => setTop(t => t.map((c, i) => i === idx ? { ...c, dest } : c));
  return (
    <div style={{ position: "fixed", inset: 0, background: "#000b", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 600 }}>
      <div style={{ background: "#0d0d1e", border: "1px solid #3a3a6a", borderRadius: 16, padding: 24, maxWidth: 600, width: "90vw" }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: "#ffd700", marginBottom: 16 }}>{title}</div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
          {top.map((card, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <CardTile card={card} small onClick={() => { }} />
              <div style={{ display: "flex", gap: 4 }}>
                {["top", "bottom", "graveyard"].map(d => (
                  <button key={d} onClick={() => toggle(i, d)} style={{ padding: "2px 6px", borderRadius: 4, border: "none", background: card.dest === d ? "#ffd700" : "#2a2a4a", color: card.dest === d ? "#000" : "#aaa", cursor: "pointer", fontSize: 10 }}>
                    {d === "top" ? "↑Top" : d === "bottom" ? "↓Bot" : "🪦"}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <button onClick={() => onDone(top)} style={{ padding: "10px 28px", borderRadius: 8, border: "none", background: "linear-gradient(90deg,#ffd700,#ff8c00)", color: "#000", fontWeight: 800, cursor: "pointer" }}>Confirmar</button>
      </div>
    </div>
  );
}

// ─── Search Library Modal ─────────────────────────────────────────────────────
function SearchLibModal({ library, graveyard, sideboard, zone, dest, onPick, onClose }) {
  const [q, setQ] = useState("");
  const [hover, setHover] = useState(null);
  const cards = zone === "graveyard" ? (graveyard || []) : zone === "sideboard" ? (sideboard || []) : (library || []);
  const filtered = cards.filter(c => {
    if (!q.trim()) return true;
    const s = q.toLowerCase();
    // Search in: printed name (es), original name (en), type line, oracle text
    return (
      (c.printed_name || "").toLowerCase().includes(s) ||
      (c.name || "").toLowerCase().includes(s) ||
      (c.type_line || "").toLowerCase().includes(s) ||
      (c.printed_type_line || "").toLowerCase().includes(s) ||
      (c.oracle_text || "").toLowerCase().includes(s) ||
      (c.printed_text || "").toLowerCase().includes(s)
    );
  });
  const title = zone === "graveyard"
    ? (dest === "battlefield" ? "⚔ Reanimar al campo" : "☠ Reanimar a la mano")
    : "🔎 Buscar en Biblioteca";
  return (
    <div style={{ position: "fixed", inset: 0, background: "#000b", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 600 }}>
      <div style={{ background: "#0d0d1e", border: "1px solid #3a3a6a", borderRadius: 16, padding: 24, maxWidth: 500, width: "90vw", maxHeight: "80vh", display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#ffd700", marginBottom: 12 }}>{title}</div>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Nombre de carta..." style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #3a3a6a", background: "#080810", color: "#e8e0d0", fontSize: 13, outline: "none", marginBottom: 12 }} autoFocus />
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
          {filtered.map((card, i) => (
            <div key={card.instanceId} onClick={() => onPick(card)}
              onMouseEnter={e => { e.currentTarget.style.background = "#2a2a4e"; setHover({ card, x: e.clientX, y: e.clientY }); }}
              onMouseMove={e => setHover(h => h ? { ...h, x: e.clientX, y: e.clientY } : h)}
              onMouseLeave={e => { e.currentTarget.style.background = "#1a1a2e"; setHover(null); }}
              style={{ padding: "8px 12px", borderRadius: 7, background: "#1a1a2e", cursor: "pointer", fontSize: 12, display: "flex", gap: 10, alignItems: "center" }}>
              <span style={{ color: "#888", minWidth: 24 }}>#{cards.indexOf(card) + 1}</span>
              {card.image_url && <img src={card.image_url} style={{ width: 28, height: 39, borderRadius: 3, objectFit: "cover", flexShrink: 0 }} />}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600 }}>{getCardName(card)}</div>
                <div style={{ fontSize: 10, color: "#555" }}>{card.type_line?.split("—")[0]}</div>
              </div>
            </div>
          ))}
          {!filtered.length && <div style={{ color: "#555", padding: "20px 0", textAlign: "center" }}>Sin resultados</div>}
        </div>
        <button onClick={onClose} style={{ marginTop: 14, padding: "8px 0", borderRadius: 8, border: "1px solid #333", background: "transparent", color: "#888", cursor: "pointer" }}>Cancelar</button>
      </div>
      {hover && <HoverZoom card={hover.card} x={hover.x} y={hover.y} />}
    </div>
  );
}


// ─── Counter Modal ────────────────────────────────────────────────────────────
function CounterModal({ card, onUpdate, onClose }) {
  const current = card.counters || [];
  const [customName, setCustomName] = useState("");

  // Separate P/R tracking: stored as "pow:+3" "tgh:-1" style entries
  // We compute net P/R from all +1/+1 and -1/-1 counters
  const counts = {};
  for (const c of current) counts[c] = (counts[c] || 0) + 1;

  const pp = counts["+1/+1"] || 0;   // +1/+1 counters
  const mm = counts["-1/-1"] || 0;   // -1/-1 counters
  const netPow = pp - mm;             // net power change
  const netTgh = pp - mm;             // net toughness change (same for +1/+1)

  // Individual P/R modifiers stored as "pow:N" and "tgh:N" (N can be negative)
  // We'll use a separate state for clean +/- on P/R independently
  const powMod = counts["pow"] ? Object.entries(counts).find(([k]) => k.startsWith("pow:")) : null;
  // Simpler: store as explicit counter strings "+pow" / "-pow" / "+tgh" / "-tgh"
  const extraPow = (counts["+pow"] || 0) - (counts["-pow"] || 0);
  const extraTgh = (counts["+tgh"] || 0) - (counts["-tgh"] || 0);

  const add = (type) => onUpdate([...current, type === "custom" ? (customName || "custom") : type]);
  const remove = (type) => {
    const idx = current.lastIndexOf(type);
    if (idx === -1) return;
    const next = [...current]; next.splice(idx, 1); onUpdate(next);
  };
  const clear = (type) => onUpdate(current.filter(c => c !== type));

  // P/R adjustment helpers
  const adjPow = (delta) => {
    if (delta > 0) onUpdate([...current, "+pow"]);
    else {
      const idx = current.lastIndexOf("+pow");
      if (idx !== -1) { const n = [...current]; n.splice(idx, 1); onUpdate(n); }
      else onUpdate([...current, "-pow"]);
    }
  };
  const adjTgh = (delta) => {
    if (delta > 0) onUpdate([...current, "+tgh"]);
    else {
      const idx = current.lastIndexOf("+tgh");
      if (idx !== -1) { const n = [...current]; n.splice(idx, 1); onUpdate(n); }
      else onUpdate([...current, "-tgh"]);
    }
  };
  const resetPR = () => onUpdate(current.filter(c => c !== "+pow" && c !== "-pow" && c !== "+tgh" && c !== "-tgh"));

  // Display net P/R including +1/+1 and -1/-1 counters
  const dispPow = netPow + extraPow;
  const dispTgh = netTgh + extraTgh;

  const btnS = (bg, col) => ({ width: 28, height: 28, borderRadius: "50%", border: "none", background: bg, color: col, cursor: "pointer", fontSize: 16, fontWeight: 800, padding: 0, flexShrink: 0 });

  return (
    <>
      <div style={{ position: "fixed", inset: 0, background: "#000c", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 700 }} onClick={onClose}>
        <div style={{ background: "#0d0d1e", border: "1px solid #3a3a6a", borderRadius: 16, padding: 22, width: 440, maxHeight: "90vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#ffd700" }}>🎯 Contadores</div>
              <div style={{ fontSize: 11, color: "#8888aa" }}>{card.printed_name || card.name}</div>
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", color: "#888", cursor: "pointer", fontSize: 18 }}>✕</button>
          </div>

          {/* ── P/R TRACKER ─────────────────────────────────────────────── */}
          <div style={{ background: "#0a0a18", border: "1px solid #3a3a6a", borderRadius: 12, padding: "14px 16px", marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: "#ffd700", fontWeight: 700, marginBottom: 12, letterSpacing: 1 }}>⚔ PODER / RESISTENCIA</div>
            <div style={{ display: "flex", gap: 16, justifyContent: "center", alignItems: "center" }}>

              {/* Power */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{ fontSize: 10, color: "#8888aa", letterSpacing: 1 }}>PODER</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button onClick={() => adjPow(-1)} style={btnS("#4a1a1a", "#ff8888")}>−</button>
                  <div style={{ width: 52, height: 52, borderRadius: 10, background: dispPow > 0 ? "#1a4a1a" : dispPow < 0 ? "#4a1a1a" : "#1a1a2e", border: `2px solid ${dispPow > 0 ? "#88ff88" : dispPow < 0 ? "#ff8888" : "#3a3a6a"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 22, fontWeight: 900, color: dispPow > 0 ? "#88ff88" : dispPow < 0 ? "#ff8888" : "#e8e0d0" }}>
                      {dispPow > 0 ? `+${dispPow}` : dispPow}
                    </span>
                  </div>
                  <button onClick={() => adjPow(+1)} style={btnS("#1a4a1a", "#88ff88")}>+</button>
                </div>
              </div>

              {/* Separator */}
              <div style={{ fontSize: 28, color: "#555", fontWeight: 300 }}>/</div>

              {/* Toughness */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{ fontSize: 10, color: "#8888aa", letterSpacing: 1 }}>RESISTENCIA</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button onClick={() => adjTgh(-1)} style={btnS("#4a1a1a", "#ff8888")}>−</button>
                  <div style={{ width: 52, height: 52, borderRadius: 10, background: dispTgh > 0 ? "#1a4a1a" : dispTgh < 0 ? "#4a1a1a" : "#1a1a2e", border: `2px solid ${dispTgh > 0 ? "#88ff88" : dispTgh < 0 ? "#ff8888" : "#3a3a6a"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 22, fontWeight: 900, color: dispTgh > 0 ? "#88ff88" : dispTgh < 0 ? "#ff8888" : "#e8e0d0" }}>
                      {dispTgh > 0 ? `+${dispTgh}` : dispTgh}
                    </span>
                  </div>
                  <button onClick={() => adjTgh(+1)} style={btnS("#1a4a1a", "#88ff88")}>+</button>
                </div>
              </div>

            </div>

            {/* Net display + reset */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
              <div style={{ fontSize: 11, color: "#8888aa" }}>
                Modificador neto: <span style={{ fontWeight: 800, color: dispPow === 0 && dispTgh === 0 ? "#555" : "#ffd700" }}>
                  {dispPow > 0 ? `+${dispPow}` : dispPow}/{dispTgh > 0 ? `+${dispTgh}` : dispTgh}
                </span>
                {(pp > 0 || mm > 0) && <span style={{ fontSize: 9, color: "#555", marginLeft: 6 }}>(incluye {pp > 0 ? `${pp}×+1/+1 ` : ""}{mm > 0 ? `${mm}×-1/-1` : ""} )</span>}
              </div>
              {(extraPow !== 0 || extraTgh !== 0) && (
                <button onClick={resetPR} style={{ padding: "3px 10px", borderRadius: 5, border: "1px solid #4a2a2a", background: "#1a0a0a", color: "#ff8888", cursor: "pointer", fontSize: 10 }}>
                  Resetear P/R
                </button>
              )}
            </div>
          </div>

          {/* Active counters summary */}
          {Object.keys(counts).filter(k => k !== "+pow" && k !== "-pow" && k !== "+tgh" && k !== "-tgh").length > 0 && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14, padding: "8px 10px", background: "#0a0a18", borderRadius: 8 }}>
              {Object.entries(counts).filter(([t]) => t !== "+pow" && t !== "-pow" && t !== "+tgh" && t !== "-tgh").map(([type, n]) => {
                const def = COUNTER_TYPES.find(t => t.key === type) || { color: "#2a2a2a", text: "#ccc" };
                return (
                  <div key={type} style={{ display: "flex", alignItems: "center", gap: 3, background: def.color, borderRadius: 20, padding: "3px 8px" }}>
                    <button onClick={() => remove(type)} style={{ background: "none", border: "none", color: def.text, cursor: "pointer", fontSize: 14, lineHeight: 1, padding: 0 }}>−</button>
                    <span style={{ color: def.text, fontSize: 13, fontWeight: 800, minWidth: 16, textAlign: "center" }}>{n}</span>
                    <span style={{ color: def.text, fontSize: 11 }}>{type}</span>
                    <button onClick={() => add(type)} style={{ background: "none", border: "none", color: def.text, cursor: "pointer", fontSize: 14, lineHeight: 1, padding: 0 }}>+</button>
                    <button onClick={() => clear(type)} style={{ background: "none", border: "none", color: def.text + "88", cursor: "pointer", fontSize: 10, padding: 0 }}>✕</button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Counter type grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
            {COUNTER_TYPES.filter(t => t.key !== "custom").map(ct => (
              <div key={ct.key} style={{ background: ct.color + "44", border: `1px solid ${ct.color}`, borderRadius: 8, padding: "7px 10px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: 12, color: ct.text, fontWeight: 700 }}>{ct.label}</div>
                  <div style={{ fontSize: 9, color: "#8888aa" }}>{ct.desc}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <button onClick={() => remove(ct.key)} style={{ width: 24, height: 24, borderRadius: "50%", border: "none", background: "#4a1a1a", color: "#ff8888", cursor: "pointer", fontSize: 15, fontWeight: 800, padding: 0 }}>−</button>
                  <span style={{ color: ct.text, fontWeight: 800, minWidth: 18, textAlign: "center", fontSize: 14 }}>{counts[ct.key] || 0}</span>
                  <button onClick={() => add(ct.key)} style={{ width: 24, height: 24, borderRadius: "50%", border: "none", background: "#1a4a1a", color: "#7fff7f", cursor: "pointer", fontSize: 15, fontWeight: 800, padding: 0 }}>+</button>
                </div>
              </div>
            ))}
          </div>

          {/* Custom counter */}
          <div style={{ marginTop: 10, display: "flex", gap: 8, alignItems: "center" }}>
            <input value={customName} onChange={e => setCustomName(e.target.value)} placeholder="Nombre contador custom..." style={{ flex: 1, padding: "7px 10px", borderRadius: 7, border: "1px solid #3a3a6a", background: "#080810", color: "#e8e0d0", fontSize: 12, outline: "none" }} />
            <button onClick={() => { if (customName.trim()) { add("custom"); } }} style={{ padding: "7px 14px", borderRadius: 7, border: "none", background: "#2a2a4a", color: "#cccccc", cursor: "pointer", fontSize: 12 }}>+ Agregar</button>
          </div>

          <button onClick={onClose} style={{ marginTop: 14, width: "100%", padding: "9px 0", borderRadius: 8, border: "none", background: "linear-gradient(90deg,#ffd700,#ff8c00)", color: "#000", fontWeight: 800, cursor: "pointer" }}>Listo</button>
        </div>
      </div>
    </>
  );
}


// ─── Mulligan Modal (Commander London Mulligan) ───────────────────────────────
// Commander rule: first mulligan is FREE (draw 7, keep 7).
// From the second mulligan onward, put back (mulliganCount - 1) cards to library bottom.
// mulliganCount=0 → initial hand shown before any decision
// mulliganCount=1 → first mulligan taken, FREE (no put-back)
// mulliganCount=2 → second mulligan, put back 1
// mulliganCount=3 → put back 2, etc.
function MulliganModal({ player, mulliganCount, onKeep, onMulligan, onHome }) {
  // In Commander the first mulligan (count=1) is free: mustPutBack = max(0, count-1)
  const mustPutBack = Math.max(0, mulliganCount - 1);
  const [selected, setSelected] = useState(new Set());
  const [hover, setHover] = useState(null);
  const hand = player?.hand || [];

  const toggle = (iid) => {
    setSelected(s => {
      const next = new Set(s);
      if (next.has(iid)) next.delete(iid);
      else if (next.size < mustPutBack) next.add(iid);
      return next;
    });
  };

  const canConfirm = mustPutBack === 0 || selected.size === mustPutBack;

  // Label helpers
  const title = mulliganCount === 0
    ? "🃏 Mano inicial"
    : mulliganCount === 1
      ? "🔄 Mulligan #1 — Gratuito"
      : `🔄 Mulligan #${mulliganCount}`;

  const subtitle = mulliganCount === 0
    ? "¿Guardas esta mano o haces mulligan?"
    : mustPutBack === 0
      ? "Mulligan gratuito — robaste 7. ¿Guardas o sigues?"
      : `Selecciona ${mustPutBack} carta${mustPutBack > 1 ? "s" : ""} para poner al fondo de tu biblioteca`;

  const hint = mulliganCount >= 2
    ? `Commander London: pones ${mustPutBack} al fondo (te quedan ${7 - mustPutBack} efectivas)`
    : mulliganCount === 1
      ? "En Commander el primer mulligan es gratis — conservas las 7"
      : null;

  const nextMulliganLabel = (() => {
    const nextPenalty = Math.max(0, mulliganCount); // after this mulligan, penalty = mulliganCount
    return `🔄 Mulligan${nextPenalty > 0 ? ` (devolver ${nextPenalty})` : " (gratis)"}`;
  })();

  return (
    <>
      <div style={{ position: "fixed", inset: 0, background: "#000d", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 800, fontFamily: "'Crimson Text',Georgia,serif" }}>
        <div style={{ background: "#0a0a1a", border: "2px solid #ffd70066", borderRadius: 18, padding: 28, maxWidth: 700, width: "95vw" }}>
          <div style={{ textAlign: "center", marginBottom: 18 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: mulliganCount === 1 ? "#88ff88" : "#ffd700" }}>{title}</div>
            <div style={{ fontSize: 13, color: "#aaa", marginTop: 6 }}>{subtitle}</div>
            {hint && <div style={{ fontSize: 11, color: "#555", marginTop: 4, fontStyle: "italic" }}>{hint}</div>}
          </div>

          {/* Hand */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginBottom: 22 }}>
            {hand.map(card => {
              const marked = selected.has(card.instanceId);
              return (
                <div key={card.instanceId}
                  onClick={() => mustPutBack > 0 && toggle(card.instanceId)}
                  onMouseEnter={e => setHover({ card, x: e.clientX, y: e.clientY })}
                  onMouseMove={e => setHover(h => h ? { ...h, x: e.clientX, y: e.clientY } : h)}
                  onMouseLeave={() => setHover(null)}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: mustPutBack > 0 ? "pointer" : "default" }}>
                  <div style={{ position: "relative" }}>
                    <div style={{
                      position: "absolute", inset: 0, borderRadius: 6, zIndex: 2, pointerEvents: "none",
                      background: marked ? "#ff000033" : "transparent",
                      border: marked ? "3px solid #ff4444" : "3px solid transparent",
                      transition: "all 0.15s"
                    }} />
                    {card.image_url
                      ? <img src={card.image_url} style={{ width: 74, borderRadius: 6, display: "block" }} />
                      : <div style={{ width: 74, height: 103, borderRadius: 6, background: "#1a1a3e", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#888", textAlign: "center", padding: 4 }}>{getCardName(card)}</div>}
                  </div>
                  {marked && <div style={{ fontSize: 9, color: "#ff8888", fontWeight: 700 }}>↓ fondo</div>}
                </div>
              );
            })}
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={() => canConfirm && onKeep([...selected])}
              disabled={!canConfirm}
              style={{ padding: "12px 32px", borderRadius: 10, border: "none", background: canConfirm ? "linear-gradient(90deg,#1a5a1a,#2a8a2a)" : "#222", color: canConfirm ? "#7fff7f" : "#444", fontWeight: 800, fontSize: 15, cursor: canConfirm ? "pointer" : "default", transition: "all 0.2s" }}>
              {mustPutBack === 0 ? "✅ Guardar mano" : `✅ Confirmar (${selected.size}/${mustPutBack} seleccionadas)`}
            </button>
            <button
              onClick={onMulligan}
              style={{ padding: "12px 28px", borderRadius: 10, border: "1px solid #ffd70055", background: "#1a140a", color: "#ffd700", fontWeight: 800, fontSize: 14, cursor: "pointer" }}>
              {nextMulliganLabel}
            </button>
          </div>
          {/* Home button */}
          {onHome && (
            <div style={{ textAlign: "center", marginTop: 8 }}>
              <button onClick={onHome}
                style={{ padding: "5px 16px", borderRadius: 6, border: "1px solid #333", background: "transparent", color: "#666", cursor: "pointer", fontSize: 11 }}>
                🏠 Volver al inicio
              </button>
            </div>
          )}
        </div>
      </div>
      {/* HoverZoom rendered outside modal so it's never clipped */}
      {hover && <HoverZoom card={hover.card} x={hover.x} y={hover.y} />}
    </>
  );
}

// ─── DECK BUILDER ─────────────────────────────────────────────────────────────
function DeckBuilder({ onReady, onHome, initialDeck, initialCommander, initialPlayerName, initialDeckName, initialFormat, initialSideboard }) {
  const [search, setSearch] = useState(""); const [results, setResults] = useState([]);
  const [deck, setDeck] = useState(() => initialDeck || []); const [sideboard, setSideboard] = useState(() => initialSideboard || []); const [format, setFormat] = useState(() => initialFormat || FORMATS[0]); const [showFormatModal, setShowFormatModal] = useState(false); const [formatWarnings, setFormatWarnings] = useState({}); const [commander, setCommander] = useState(() => initialCommander || null);
  const [loading, setLoading] = useState(false); const [preview, setPreview] = useState(null);
  const [importText, setImportText] = useState(""); const [importLoading, setImportLoading] = useState(false);
  const [importProgress, setImportProgress] = useState({ done: 0, total: 0 });
  const [tab, setTab] = useState(initialDeck?.length > 0 ? "mazo" : "buscar"); const [playerName, setPlayerName] = useState(initialPlayerName || "Jugador");
  const [deckCtx, setDeckCtx] = useState(null);
  const [hover, setHover] = useState(null); // {card, x, y}
  const [savedDecks, setSavedDecks] = useState(getSavedDecks);
  const [deckName, setDeckName] = useState(initialDeckName || "Mi Mazo");
  const lang = "es"; // always Spanish, fallback to English if not found
  const deb = useRef(null);

  useEffect(() => {
    clearTimeout(deb.current);
    if (!search.trim()) { setResults([]); return; }
    deb.current = setTimeout(async () => { setLoading(true); setResults((await searchCards(search)).slice(0, 20)); setLoading(false); }, 500);
  }, [search, lang]);

  const formatHasCommander = (fmt) => ["commander", "duel", "brawl", "oathbreaker"].includes(fmt?.key);

  const checkLegality = (card, fmt) => {
    if (!fmt || fmt.key === "custom") return null;
    const leg = card.legalities?.[fmt.key];
    if (leg === "banned") return "banned";
    if (leg === "not_legal") return "not_legal";
    if (leg === "restricted") return "restricted";
    return null;
  };

  const addCard = async (card) => {
    const img = card.image_uris?.normal || card.card_faces?.[0]?.image_uris?.normal || null;
    setDeck(d => [...d, { ...card, image_url: img, instanceId: uid() }]);
    // Check legality
    const issue = checkLegality(card, format);
    if (issue) {
      setFormatWarnings(w => ({ ...w, [card.name]: issue }));
    }
  };
  const setCmd = async (card) => {
    const img = card.image_uris?.normal || card.card_faces?.[0]?.image_uris?.normal || null;
    setCommander({ ...card, image_url: img || card.image_url, instanceId: card.instanceId || uid() });
    // Auto-fill deck name with commander's name if still default/empty
    const cmdName = card.printed_name || card.name || "";
    if (cmdName) setDeckName(prev => (!prev || prev === "Mi Mazo") ? cmdName : prev);
  };

  const handleImport = async () => {
    setImportLoading(true);
    const lines = importText.split("\n").map(l => l.trim()).filter(Boolean);
    const validLines = lines.filter(l => !l.startsWith("//") && !l.startsWith("#") && l.trim());
    const total = validLines.reduce((s, l) => { const m = l.match(/^(\d+)x?\s+/); return s + (m ? parseInt(m[1]) : 1); }, 0);
    setImportProgress({ done: 0, total });
    const out = [];
    const cache = {};
    let done = 0;
    for (const line of lines) {
      // Skip comment lines
      if (line.startsWith("//") || line.startsWith("#")) continue;
      const m = line.match(/^(\d+)x?\s+(.+)$/i);
      const name = (m ? m[2] : line).trim();
      const n = m ? parseInt(m[1]) : 1;
      if (!name || isNaN(n) || n < 1) continue;
      // Delay to respect Scryfall rate limit (~10 req/s)
      await new Promise(r => setTimeout(r, 120));
      if (!cache[name]) {
        const targetLang = "es"; // always try Spanish first
        try {
          let card = null;
          // Fetch via allorigins proxy to bypass Vercel CORS restrictions
          const proxyBase = "https://api.allorigins.win/get?url=";
          const scryBase = "https://api.scryfall.com/cards/search";

          const sfFetch = async (url) => {
            try {
              // Try direct first (works ~50% of time from Vercel)
              const r = await fetch(url);
              if (r.ok) return await r.json();
            } catch { }
            try {
              // Fallback: allorigins proxy
              const proxy = proxyBase + encodeURIComponent(url);
              const r = await fetch(proxy);
              if (r.ok) {
                const wrapper = await r.json();
                return JSON.parse(wrapper.contents);
              }
            } catch { }
            return null;
          };

          // Step 1: Get English card
          let enCard = null;
          const q1 = `!"${name}"`;
          const d1 = await sfFetch(`${scryBase}?q=${encodeURIComponent(q1)}&unique=cards&order=released`);
          if (d1?.data?.[0]) enCard = d1.data[0];
          if (!enCard) {
            const d2 = await sfFetch(`${scryBase}?q=${encodeURIComponent(name)}&unique=cards&order=released`);
            if (d2?.data?.[0]) enCard = d2.data[0];
          }
          if (!enCard) { continue; }

          // Step 2: Try Spanish
          let esCard = null;
          const qEs = `!"${enCard.name}" lang:es`;
          const dEs = await sfFetch(`${scryBase}?q=${encodeURIComponent(qEs)}&order=released&dir=desc`);
          if (dEs?.data?.[0]?.image_uris) esCard = dEs.data[0];

          if (esCard) {
            card = {
              ...enCard,
              image_url: esCard.image_uris?.normal || esCard.card_faces?.[0]?.image_uris?.normal || null,
              printed_name: esCard.printed_name || enCard.name,
              printed_text: esCard.printed_text || enCard.oracle_text,
              type_line: esCard.printed_type_line || enCard.type_line,
            };
          } else {
            card = { ...enCard, image_url: enCard.image_uris?.normal || enCard.card_faces?.[0]?.image_uris?.normal || null };
          }
          if (!card) { continue; }

          if (card && !card.image_url) {
            card = { ...card, image_url: card.image_uris?.normal || card.card_faces?.[0]?.image_uris?.normal || null };
          }
          cache[name] = card;
          // Check legality in current format
          const issue = checkLegality(card, format);
          if (issue) setFormatWarnings(w => ({ ...w, [card.name]: issue }));
        } catch { }
      }
      if (cache[name]) {
        for (let i = 0; i < n; i++) out.push({ ...cache[name], instanceId: uid() });
        done += n;
        setImportProgress({ done, total });
      }
    }
    setDeck(d => [...d, ...out]); setImportLoading(false); setImportProgress({ done: 0, total: 0 }); setTab("mazo");
  };

  const normalizeType = (typeLine) => {
    if (!typeLine) return "Otro";
    const t = typeLine.toLowerCase();
    const leg = t.includes("legendary") || t.includes("legendaria") || t.includes("legendario");
    const cre = t.includes("creature") || t.includes("criatura");
    const art = t.includes("artifact") || t.includes("artefacto");
    const enc = t.includes("enchantment") || t.includes("encantamiento");
    const pla = t.includes("planeswalker");
    const ins = t.includes("instant") || t.includes("instantáneo");
    const sor = t.includes("sorcery") || t.includes("conjuro");
    const lan = t.includes("land") || t.includes("tierra");
    const bat = t.includes("battle") || t.includes("batalla");
    if (leg && cre) return "Criatura Legendaria";
    if (leg && pla) return "Planeswalker Legendario";
    if (leg) return "Legendario";
    if (cre) return "Criatura";
    if (ins) return "Instantáneo";
    if (sor) return "Conjuro";
    if (enc && art) return "Artefacto Encantamiento";
    if (enc) return "Encantamiento";
    if (art) return "Artefacto";
    if (pla) return "Planeswalker";
    if (lan) return "Tierra";
    if (bat) return "Batalla";
    return "Otro";
  };
  const grouped = deck.reduce((a, c) => {
    const t = normalizeType(c.type_line);
    if (!a[t]) a[t] = [];
    a[t].push(c);
    return a;
  }, {});
  const tabBtn = (t, label) => <button onClick={() => setTab(t)} style={{ flex: 1, padding: "10px 0", border: "none", cursor: "pointer", background: tab === t ? "#1a1a3e" : "transparent", color: tab === t ? "#ffd700" : "#888", fontWeight: 600, fontSize: 13, borderBottom: tab === t ? "2px solid #ffd700" : "2px solid transparent" }}>{label}</button>;

  const ctxItems = (card, source) => [
    source === "results" && { label: "➕ Agregar al mazo", action: () => addCard(card) },
    source === "results" && !format?.singletons && { label: "➕➕ Agregar x4", action: () => [1, 2, 3, 4].forEach(() => addCard(card)) },
    source === "results" && !formatHasCommander(format) && sideboard.length < 15 && { label: "↔ Agregar al Sideboard", action: () => setSideboard(s => [...s, { ...card, image_url: card.image_uris?.normal || card.image_url, instanceId: uid() }]), color: "#88aaff" },
    isLegendary(card) && formatHasCommander(format) && { label: "⚔ Elegir como Comandante", action: () => setCmd(card), color: "#ffd700" },
    isLegendary(card) && source === "results" && formatHasCommander(format) && { label: "⚔ + Agregar como Comandante", action: () => { addCard(card); setCmd(card); }, color: "#ffd700" },
    source === "deck" && formatHasCommander(format) && { label: "⚔ Elegir como Comandante", action: () => setCmd(card), color: "#ffd700" },
    source === "deck" && { label: "🗑 Quitar del mazo", action: () => setDeck(d => d.filter(c => c.instanceId !== card.instanceId)), color: "#ff8888" },
  ].filter(Boolean);

  return (
    <div style={{ minHeight: "100vh", background: "radial-gradient(ellipse at 30% 10%, #160a28 0%, #0a0a1e 60%, #060616 100%)", color: "#e8e0d0", fontFamily: "'Crimson Text',Georgia,serif", display: "flex", flexDirection: "column" }}
      onClick={() => setDeckCtx(null)}>
      <div style={{ padding: "16px 28px", borderBottom: "1px solid #2a2a4a", background: "linear-gradient(90deg,#0a0a1a,#1a0a2e,#0a0a1a)", display: "flex", alignItems: "center", gap: 14 }}>
        <span style={{ fontSize: 26 }}>⚔️</span>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: 2, background: "linear-gradient(90deg,#ffd700,#ff8c00)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>COMMANDER ES</h1>
          <div style={{ fontSize: 11, color: "#8888aa" }}>Multijugador Online · Cartas en Español</div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 12, color: "#888" }}>Tu nombre:</span>
          <input value={playerName} onChange={e => setPlayerName(e.target.value)} style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #3a3a6a", background: "#0d0d1e", color: "#e8e0d0", fontSize: 14, outline: "none", width: 120 }} />
          <input value={deckName} onChange={e => setDeckName(e.target.value)} placeholder="Nombre del mazo" style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #3a3a6a", background: "#0d0d1e", color: "#e8e0d0", fontSize: 13, outline: "none", width: 140 }} />
          <button onClick={async () => {
            if (formatHasCommander(format) && !commander) return alert(`Selecciona un comandante para el formato ${format.label}.`);
            const currentUser = getCurrentUser();
            if (currentUser) {
              const result = await saveCloudDeck(deckName, deck, commander, playerName, format, sideboard);
              if (result.ok) alert(`✓ Mazo "${deckName}" guardado como ${format.label} ☁`);
              else alert(`✗ Error: ${result.error}`);
            } else {
              saveDeckToStorage(deckName, deck, commander, playerName, format, sideboard);
              setSavedDecks(getSavedDecks());
              alert(`✓ Mazo "${deckName}" guardado como ${format.label}`);
            }
          }}
            style={{ padding: "6px 14px", borderRadius: 8, border: "none", background: "linear-gradient(90deg,#1a4a1a,#2a6a2a)", color: "#7fff7f", cursor: "pointer", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 5 }}>
            💾 Guardar mazo
          </button>
          {onHome && <button onClick={onHome} style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #333", background: "transparent", color: "#888", cursor: "pointer", fontSize: 12 }}>🏠</button>}
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Search panel */}
        <div style={{ width: 290, borderRight: "1px solid #2a2a4a", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", borderBottom: "1px solid #2a2a4a" }}>
            {tabBtn("buscar", "🔍 Buscar")}
            {tabBtn("importar", "📋 Importar")}
            {!formatHasCommander(format) && tabBtn("sideboard", `↔ SB (${sideboard.length}/15)`)}
          </div>
          {tab === "buscar" && (
            <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <div style={{ padding: 10, display: "flex", flexDirection: "column", gap: 7 }}>

                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar cartas en español..." style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #3a3a6a", background: "#0d0d1e", color: "#e8e0d0", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
              </div>
              <div style={{ flex: 1, overflowY: "auto", padding: "0 10px 10px" }}>
                {loading && <div style={{ color: "#888", textAlign: "center", padding: 16 }}>Buscando...</div>}
                {results.map(card => (
                  <div key={card.id}
                    onMouseEnter={e => { setPreview(card); setHover({ card: { ...card, image_url: card.image_uris?.normal }, x: e.clientX, y: e.clientY }); }}
                    onMouseMove={e => setHover(h => h ? { ...h, x: e.clientX, y: e.clientY } : h)}
                    onMouseLeave={() => { setPreview(null); setHover(null); }}
                    onContextMenu={e => { e.preventDefault(); e.stopPropagation(); setDeckCtx({ x: e.clientX, y: e.clientY, items: ctxItems(card, "results"), title: getCardName(card) }); }}
                    style={{ display: "flex", gap: 8, alignItems: "center", padding: "7px 0", borderBottom: "1px solid #1a1a2e", cursor: "context-menu" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>{getCardName(card)}</div>
                      <div style={{ fontSize: 10, color: "#8888aa" }}>{card.type_line}</div>
                    </div>
                    <button onClick={() => addCard(card)} style={{ padding: "3px 8px", borderRadius: 4, border: "none", background: "#1a4a1a", color: "#7fff7f", cursor: "pointer", fontSize: 11 }}>+</button>
                    {isLegendary(card) && <button onClick={() => setCmd(card)} style={{ padding: "3px 8px", borderRadius: 4, border: "none", background: "#4a3a0a", color: "#ffd700", cursor: "pointer", fontSize: 11 }}>⚔</button>}
                  </div>
                ))}
              </div>
            </div>
          )}
          {tab === "sideboard" && (
            <div style={{ flex: 1, padding: 14, display: "flex", flexDirection: "column", gap: 10, overflowY: "auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 12, color: "#8888aa" }}>Sideboard ({sideboard.length}/15)</div>
                <div style={{ display: "flex", gap: 6 }}>
                  {sideboard.length > 0 && <button onClick={() => setSideboard([])} style={{ background: "none", border: "none", color: "#ff8888", cursor: "pointer", fontSize: 11 }}>Vaciar</button>}
                </div>
              </div>
              {sideboard.length >= 15 && <div style={{ fontSize: 11, color: "#ff8888", background: "#2a0a0a", borderRadius: 6, padding: "6px 10px" }}>⚠ Sideboard completo (máx. 15 cartas)</div>}
              {/* Paste/import for sideboard */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <textarea
                  placeholder={"Pegar lista (ej: 2x Negate\n1x Counterspell...)"}
                  rows={3}
                  style={{ padding: "7px 10px", borderRadius: 7, border: "1px solid #3a3a6a", background: "#080810", color: "#e8e0d0", fontSize: 11, resize: "none", outline: "none", fontFamily: "monospace" }}
                  onPaste={async (e) => {
                    e.preventDefault();
                    const text = e.clipboardData.getData("text");
                    if (!text.trim()) return;
                    const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
                    const toAdd = [];
                    for (const line of lines) {
                      if (sideboard.length + toAdd.length >= 15) break;
                      const m = line.match(/^(\d+)x?\s+(.+)$/i);
                      const name = (m ? m[2] : line).trim();
                      const n = Math.min(m ? parseInt(m[1]) : 1, 15 - sideboard.length - toAdd.length);
                      if (!name || n < 1) continue;
                      try {
                        const r = await fetch(`https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(name)}`);
                        if (!r.ok) continue;
                        const card = await r.json();
                        const img = card.image_uris?.normal || card.card_faces?.[0]?.image_uris?.normal || null;
                        for (let i = 0; i < n; i++) toAdd.push({ ...card, image_url: img, instanceId: uid() });
                      } catch { }
                    }
                    if (toAdd.length) setSideboard(s => [...s, ...toAdd].slice(0, 15));
                  }}
                  onChange={() => { }}
                />
                <div style={{ fontSize: 10, color: "#555" }}>Pega una lista aquí (Ctrl+V) — se importa automáticamente</div>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {sideboard.map((card, i) => (
                  <div key={card.instanceId} style={{ position: "relative", width: 52 }}>
                    <CardTile card={card} small onClick={() => { }} onHover={(c, x, y) => setHover({ card: c, x, y })} onHoverEnd={() => setHover(null)} />
                    <button onClick={() => setSideboard(s => s.filter(c => c.instanceId !== card.instanceId))}
                      style={{ position: "absolute", top: -4, right: -4, width: 15, height: 15, borderRadius: "50%", border: "none", background: "#cc2222", color: "#fff", cursor: "pointer", fontSize: 9, padding: 0 }}>×</button>
                  </div>
                ))}
                {sideboard.length === 0 && (
                  <div style={{ border: "2px dashed #2a2a4a", borderRadius: 8, padding: "16px", color: "#444", fontSize: 12, textAlign: "center", width: "100%" }}>
                    Busca cartas, click derecho → Sideboard, o pega una lista arriba
                  </div>
                )}
              </div>
            </div>
          )}
          {tab === "importar" && (
            <div style={{ flex: 1, padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ fontSize: 11, color: "#8888aa" }}>Una carta por línea. Ej: "4x Sol Ring"</div>
              <textarea value={importText} onChange={e => setImportText(e.target.value)} placeholder={"1x Sol Ring\n1x Command Tower\n..."} style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid #3a3a6a", background: "#0d0d1e", color: "#e8e0d0", fontSize: 12, resize: "none", outline: "none", fontFamily: "monospace" }} />
              {importLoading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#7fc4ff" }}>
                    <span>Importando cartas...</span>
                    <span>{importProgress.done}/{importProgress.total}</span>
                  </div>
                  <div style={{ height: 8, borderRadius: 4, background: "#1a1a2e", overflow: "hidden" }}>
                    <div style={{ height: "100%", borderRadius: 4, background: "linear-gradient(90deg,#1a4a8a,#7fc4ff)", width: importProgress.total > 0 ? `${Math.round(importProgress.done / importProgress.total * 100)}%` : "0%", transition: "width 0.3s ease" }} />
                  </div>
                  <div style={{ fontSize: 10, color: "#555", textAlign: "center" }}>
                    {importProgress.total > 0 ? `${Math.round(importProgress.done / importProgress.total * 100)}%` : "Preparando..."}
                  </div>
                </div>
              ) : (
                <button onClick={handleImport} style={{ padding: "10px 0", borderRadius: 8, border: "none", background: "#1a4a8a", color: "#7fc4ff", cursor: "pointer", fontWeight: 700, fontSize: 13 }}>Importar lista</button>
              )}
            </div>
          )}
        </div>

        {/* Deck */}
        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "10px 18px", borderBottom: "1px solid #2a2a4a", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#ffd700" }}>Mi Mazo</span>
            <span style={{ background: "#1a1a3e", borderRadius: 20, padding: "2px 9px", fontSize: 12, color: "#8888aa" }}>
              {deck.length}{format.deckSize > 0 ? `/${formatHasCommander(format) ? format.deckSize - 1 : format.deckSize}` : ""}
            </span>
            {Object.keys(formatWarnings).length > 0 && (
              <span title="Hay cartas no legales en este formato" style={{ background: "#4a0a0a", borderRadius: 20, padding: "2px 9px", fontSize: 11, color: "#ff8888", cursor: "default" }}>
                🚫 {Object.values(formatWarnings).filter(v => v === "banned").length} ban
              </span>
            )}
            <div style={{ marginLeft: "auto" }}>
              <button onClick={() => {
                if (formatHasCommander(format) && !commander) return alert(`Selecciona un Comandante para el formato ${format.label}.`);
                if (deck.length < 5) return alert("Agrega más cartas.");
                // Warn about format violations
                const violations = Object.entries(formatWarnings).filter(([, v]) => v === "banned");
                if (violations.length > 0 && !window.confirm(`Hay ${violations.length} carta(s) baneada(s) en ${format.label}:\n${violations.map(([n]) => n).join(", ")}\n\n¿Continuar de todas formas?`)) return;
                // Remove commander from deck by name/id (instanceId may differ if loaded from storage)
                const deckWithoutCmd = !commander ? deck : deck.filter(c =>
                  c.instanceId !== commander.instanceId &&
                  c.name !== commander.name &&
                  c.id !== commander.id
                );
                onReady({ deck: shuffle(deckWithoutCmd), commander, playerName, format, sideboard });
              }}
                style={{ padding: "9px 22px", borderRadius: 8, border: "none", background: "linear-gradient(90deg,#ffd700,#ff8c00)", color: "#000", fontWeight: 800, fontSize: 14, cursor: "pointer" }}>▶ JUGAR</button>
            </div>
          </div>
          {/* Format selector — always visible dropdown in sidebar */}
          <div style={{ padding: "8px 18px", borderBottom: "1px solid #1a1a2e", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 10, color: "#8888aa", flexShrink: 0 }}>Formato:</span>
            <select
              value={format.key}
              onChange={e => {
                const f = FORMATS.find(f => f.key === e.target.value) || FORMATS[0];
                setFormat(f);
                setFormatWarnings({});
                if (!['commander', 'duel', 'brawl', 'oathbreaker'].includes(f.key)) setCommander(null);
              }}
              style={{ flex: 1, padding: "4px 8px", borderRadius: 7, border: "1px solid #3a3a6a", background: "#0a0a18", color: "#e8e0d0", fontSize: 12, cursor: "pointer", outline: "none" }}>
              {FORMATS.map(f => (
                <option key={f.key} value={f.key}>{f.icon} {f.label}</option>
              ))}
            </select>
            <span style={{ fontSize: 10, color: "#666" }}>♥{format.life}</span>
          </div>

          {formatHasCommander(format) && (
            <div style={{ padding: "10px 18px 8px", borderBottom: "1px solid #1a1a2e" }}>
              <div style={{ fontSize: 10, color: "#ffd700", letterSpacing: 2, marginBottom: 6 }}>⚔ COMANDANTE</div>
              {commander
                ? <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <CardTile card={commander} small onClick={() => { }} onHover={(c, x, y) => setHover({ card: c, x, y })} onHoverEnd={() => setHover(null)} />
                  <div><div style={{ fontWeight: 700, fontSize: 13 }}>{getCardName(commander)}</div><div style={{ fontSize: 10, color: "#8888aa" }}>{commander.type_line}</div><button onClick={() => setCommander(null)} style={{ marginTop: 4, padding: "2px 8px", borderRadius: 4, border: "none", background: "#4a1a1a", color: "#ff8888", cursor: "pointer", fontSize: 11 }}>Quitar</button></div>
                </div>
                : <div style={{ border: "2px dashed #3a3a6a", borderRadius: 8, padding: "10px 16px", color: "#555", fontSize: 12, textAlign: "center" }}>Busca una criatura legendaria y pulsa ⚔ (o click derecho → Elegir como Comandante)</div>}
            </div>
          )}
          <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
            {Object.entries(grouped).sort(([a], [b]) => {
              const ORDER = ['Criatura Legendaria', 'Planeswalker Legendario', 'Legendario', 'Criatura', 'Planeswalker', 'Instantáneo', 'Conjuro', 'Encantamiento', 'Artefacto Encantamiento', 'Artefacto', 'Tierra', 'Batalla', 'Otro'];
              const ai = ORDER.indexOf(a); const bi = ORDER.indexOf(b);
              if (ai === -1 && bi === -1) return a.localeCompare(b);
              if (ai === -1) return 1; if (bi === -1) return -1;
              return ai - bi;
            }).map(([type, cards]) => (
              <div key={type} style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 10, color: "#8888aa", letterSpacing: 2, marginBottom: 6, textTransform: "uppercase" }}>{type} ({cards.length})</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {cards.map(card => (
                    <div key={card.instanceId}
                      onContextMenu={e => { e.preventDefault(); e.stopPropagation(); setDeckCtx({ x: e.clientX, y: e.clientY, items: ctxItems(card, "deck"), title: getCardName(card) }); }}
                      style={{ position: "relative" }}>
                      <CardTile card={card} small onClick={() => { }} onHover={(c, x, y) => setHover({ card: c, x, y })} onHoverEnd={() => setHover(null)} />
                      <button onClick={() => setDeck(d => d.filter(c => c.instanceId !== card.instanceId))} style={{ position: "absolute", top: -4, right: -4, width: 15, height: 15, borderRadius: "50%", border: "none", background: "#cc2222", color: "#fff", cursor: "pointer", fontSize: 9, padding: 0 }}>×</button>
                      {formatWarnings[card.name] && (
                        <div title={formatWarnings[card.name] === "banned" ? "Baneada en " + format.label : formatWarnings[card.name] === "restricted" ? "Restringida (solo 1 copia)" : "No legal en " + format.label}
                          style={{ position: "absolute", bottom: -4, left: "50%", transform: "translateX(-50%)", background: formatWarnings[card.name] === "banned" ? "#cc0000" : formatWarnings[card.name] === "restricted" ? "#ff8800" : "#888", borderRadius: 3, padding: "1px 4px", fontSize: 7, color: "#fff", whiteSpace: "nowrap", pointerEvents: "none" }}>
                          {formatWarnings[card.name] === "banned" ? "🚫BAN" : formatWarnings[card.name] === "restricted" ? "⚠️REST" : "✗"}
                        </div>
                      )}
                      {isLegendary(card) && formatHasCommander(format) && (
                        <button onClick={() => setCmd(card)} title="Elegir como Comandante"
                          style={{ position: "absolute", top: -4, left: -4, width: 18, height: 18, borderRadius: "50%", border: "none", background: "#4a3a0a", color: "#ffd700", cursor: "pointer", fontSize: 10, padding: 0, fontWeight: 800 }}>⚔</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {!deck.length && <div style={{ color: "#333", textAlign: "center", marginTop: 50, fontSize: 15 }}>Busca cartas y agrégalas a tu mazo</div>}
          </div>
        </div>

        {/* Preview panel */}
        {preview && (
          <div style={{ width: 200, borderLeft: "1px solid #2a2a4a", padding: 14, display: "flex", flexDirection: "column", gap: 10, background: "#080814", flexShrink: 0 }}>
            {preview.image_uris?.normal ? <img src={preview.image_uris.normal} style={{ width: "100%", borderRadius: 7 }} /> : <div style={{ width: "100%", aspectRatio: "2.5/3.5", borderRadius: 7, background: "#1a1a3e", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36 }}>🃏</div>}
            <div><div style={{ fontWeight: 700, fontSize: 13 }}>{getCardName(preview)}</div><div style={{ fontSize: 10, color: "#8888aa", marginTop: 3 }}>{preview.type_line}</div>{preview.oracle_text && <div style={{ fontSize: 10, color: "#b0a888", marginTop: 6, lineHeight: 1.5 }}>{preview.printed_text || preview.oracle_text}</div>}{preview.power && <div style={{ fontSize: 12, color: "#ffd700", marginTop: 6 }}>⚔ {preview.power}/{preview.toughness}</div>}</div>
          </div>
        )}
      </div>

      {/* Context Menu */}
      <CtxMenu menu={deckCtx} onClose={() => setDeckCtx(null)} />
      {/* Hover zoom */}
      {hover && <HoverZoom card={hover.card} x={hover.x} y={hover.y} />}
      {/* Save format picker */}

    </div>
  );
}

// ─── LOBBY ────────────────────────────────────────────────────────────────────
function Lobby({ playerName: initialName, deckData, onGameStart, onHome, resumeCode, wasHost }) {
  const googleName = getUserDisplayName(getCurrentUser());
  const defaultName = initialName || googleName || "";
  const [name, setName] = useState(defaultName);
  const [avatar, setAvatar] = useState("🧙");
  const [nameConfirmed, setNameConfirmed] = useState(!!(defaultName && defaultName !== "Jugador"));
  const [mode, setMode] = useState(null);
  const [roomCode, setRoomCode] = useState("");
  const [joinCode, setJoinCode] = useState(resumeCode || "");
  const [isHost, setIsHost] = useState(false);
  const [players, setPlayers] = useState([]);
  const [lobbyHover, setLobbyHover] = useState(null); // {card, x, y}
  const [lobbyDeckName, setLobbyDeckName] = useState(() => {
    const user = getCurrentUser();
    const name = user ? (user.user_metadata?.full_name || user.email?.split("@")[0]) : "";
    return name ? `Mazo de ${name}` : "Mi Mazo";
  });
  const [myId] = useState(uid);

  // Auto-reconnect when resuming a session
  useEffect(() => {
    if (!resumeCode || mode) return;
    if (!nameConfirmed) { setNameConfirmed(true); }
    const wasHostSession = deckData?.wasHost ?? wasHost ?? false;
    const code = resumeCode.toUpperCase();
    setRoomCode(code);
    setJoinCode(code);
    if (wasHostSession) {
      setMode("create"); setIsHost(true);
      setPlayers([myPayload(true)]);
      connect(code, true);
    } else {
      setMode("join"); setIsHost(false);
      setPlayers([myPayload(false)]);
      connect(code, false);
    }
  }, [resumeCode]);
  const rtRef = useRef(null);

  // Build my own playerState from my deck — done once here
  const myPlayerState = useRef(null);
  const getMyState = () => {
    const deck = deckData?.deck || [];
    const commander = deckData?.commander || null;
    const playerName = name || "Jugador";
    myPlayerState.current = mkState(myId, name || "Jugador", deck, commander, deckData?.format?.life || 40, deckData?.sideboard || []);
    return myPlayerState.current;
  };

  const myPayload = (amHost) => {
    const state = getMyState();
    return {
      id: myId,
      name: name || "Jugador",
      avatar: avatar || "🧙",
      isHost: amHost,
      playerState: state,
      format: deckData?.format || FORMATS[0],
      commander: deckData?.commander || null,
    };
  };

  const connect = (code, amHost) => {
    const rt = new SupabaseRealtime();
    rtRef.current = rt;

    rt.connect(code, (event, payload) => {
      if (event === "player_join") {
        // Add/update player in list (includes their playerState)
        setPlayers(prev => {
          const exists = prev.find(p => p.id === payload.id);
          if (exists) return prev.map(p => p.id === payload.id ? { ...p, ...payload } : p);
          return [...prev, payload];
        });
        // Re-announce ourselves so the new joiner sees us
        setTimeout(() => rt.broadcast("player_join", myPayload(amHost)), 300);
      }
      if (event === "player_leave") {
        setPlayers(prev => prev.filter(p => p.id !== payload.id));
      }
      if (event === "game_start") {
        // Use the playerState from each player's own payload
        onGameStart(payload.players, code, myId, rt);
      }
    });

    // Announce ourselves after WS connects
    setTimeout(() => rt.broadcast("player_join", myPayload(amHost)), 1500);
  };

  const createRoom = () => {
    const code = genCode();
    setRoomCode(code); setMode("create"); setIsHost(true);
    setPlayers([myPayload(true)]);
    connect(code, true);
  };

  const joinRoom = () => {
    if (!joinCode.trim()) return;
    const code = joinCode.trim().toUpperCase();
    setRoomCode(code); setMode("join"); setIsHost(false);
    setPlayers([myPayload(false)]);
    connect(code, false);
  };

  const startGame = () => {
    const all = players.map(p => {
      // Each player's state was sent with their player_join broadcast
      // Use it directly — don't overwrite with another player's deck
      const state = p.id === myId
        ? getMyState()
        : (p.playerState && p.playerState.library !== undefined
          ? p.playerState
          : mkState(p.id, p.name || "Jugador", [], null));
      return { id: p.id, name: p.name || "Jugador", avatar: p.avatar || "🧙", isHost: p.isHost, playerState: state, format: p.format || FORMATS[0], commander: p.commander || null };
    });
    // Broadcast — JSON serialization strips functions but playerState is plain data
    rtRef.current?.broadcast("game_start", { players: all });
    onGameStart(all, roomCode, myId, rtRef.current);
  };

  const [copied, setCopied] = useState(false);
  const copyCode = () => {
    navigator.clipboard?.writeText(roomCode).catch(() => { });
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#0a0a1a,#0d1b2a)", color: "#e8e0d0", fontFamily: "'Crimson Text',Georgia,serif", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 480, display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ textAlign: "center" }}>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, background: "linear-gradient(90deg,#ffd700,#ff8c00)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>⚔ COMMANDER ES</h1>
            <div style={{ color: "#8888aa", marginTop: 4 }}>Hola, <strong style={{ color: "#e8e0d0" }}>{name || "..."}</strong></div>
            {onHome && <button onClick={onHome} style={{ marginTop: 8, padding: "4px 14px", borderRadius: 6, border: "1px solid #333", background: "transparent", color: "#888", cursor: "pointer", fontSize: 11 }}>← Volver al inicio</button>}
          </div>

          {/* Step 1: Confirm player name */}
          {!nameConfirmed && !mode && (
            <div style={{ background: "#0d0d1e", borderRadius: 14, border: "1px solid #2a2a4a", padding: "22px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#ffd700" }}>¿Cómo te llamas?</div>
              <div style={{ fontSize: 12, color: "#8888aa" }}>Este nombre y avatar verán los demás jugadores</div>

              {/* Avatar picker */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, padding: "8px 0" }}>
                {AVATARS.map(av => (
                  <button key={av} onClick={() => setAvatar(av)}
                    style={{ width: 40, height: 40, borderRadius: 8, border: avatar === av ? "2px solid #ffd700" : "2px solid #2a2a4a", background: avatar === av ? "#ffd70022" : "transparent", fontSize: 22, cursor: "pointer", transition: "all 0.15s" }}>
                    {av}
                  </button>
                ))}
              </div>

              {/* Name + preview */}
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ fontSize: 36, flexShrink: 0 }}>{avatar}</div>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && name.trim() && setNameConfirmed(true)}
                  placeholder="Tu nombre (ej. Enzo)"
                  autoFocus maxLength={20}
                  style={{ flex: 1, padding: "12px 16px", borderRadius: 10, border: "1px solid #3a3a6a", background: "#080810", color: "#e8e0d0", fontSize: 18, outline: "none", fontWeight: 700 }}
                />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => { setName(`Jugador ${Math.floor(Math.random() * 900) + 100}`); setAvatar(AVATARS[Math.floor(Math.random() * AVATARS.length)]); setNameConfirmed(true); }}
                  style={{ flex: 1, padding: "10px 0", borderRadius: 9, border: "1px solid #333", background: "transparent", color: "#888", cursor: "pointer", fontSize: 13 }}>
                  Aleatorio
                </button>
                <button onClick={() => name.trim() && setNameConfirmed(true)} disabled={!name.trim()}
                  style={{ flex: 2, padding: "10px 0", borderRadius: 9, border: "none", background: name.trim() ? "linear-gradient(90deg,#ffd700,#ff8c00)" : "#222", color: name.trim() ? "#000" : "#555", fontWeight: 800, fontSize: 14, cursor: name.trim() ? "pointer" : "default" }}>
                  ¡Jugar como {avatar} {name || "..."}!
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Create or join — only after name confirmed */}
          {nameConfirmed && !mode && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 13, color: "#8888aa" }}>Jugando como</span>
                <span style={{ fontSize: 15, fontWeight: 700, color: "#e8e0d0" }}>{name}</span>
                <button onClick={() => setNameConfirmed(false)} style={{ padding: "2px 8px", borderRadius: 5, border: "1px solid #333", background: "transparent", color: "#888", cursor: "pointer", fontSize: 11 }}>✏</button>
              </div>
              <button onClick={createRoom} style={{ padding: 18, borderRadius: 12, border: "1px solid #ffd70044", background: "linear-gradient(135deg,#1a140a,#2a1f0a)", color: "#ffd700", fontSize: 17, cursor: "pointer", fontWeight: 700 }}>
                ✦ Crear Sala Nueva
              </button>
              <div style={{ textAlign: "center", color: "#555" }}>— o únete con un código —</div>
              <div style={{ display: "flex", gap: 8 }}>
                <input value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} placeholder="Código (ej. XK9F)" maxLength={4}
                  onKeyDown={e => e.key === "Enter" && joinRoom()}
                  style={{ flex: 1, padding: "13px 16px", borderRadius: 10, border: "1px solid #3a3a6a", background: "#0d0d1e", color: "#e8e0d0", fontSize: 20, outline: "none", textAlign: "center", letterSpacing: 6, fontWeight: 700 }} />
                <button onClick={joinRoom} style={{ padding: "13px 20px", borderRadius: 10, border: "none", background: "#1a3a6a", color: "#7fc4ff", fontSize: 14, cursor: "pointer", fontWeight: 700 }}>
                  Unirse
                </button>
              </div>
            </div>
          )}

          {/* In-room panel */}
          {mode && (
            <div style={{ background: "#0d0d1e", borderRadius: 16, border: "1px solid #2a2a4a", padding: 22, display: "flex", flexDirection: "column", gap: 14 }}>

              {/* Room code + copy */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, color: "#8888aa" }}>Código de sala</span>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 36, fontWeight: 800, letterSpacing: 10, color: "#ffd700" }}>{roomCode}</span>
                  <button onClick={copyCode} title="Copiar código"
                    style={{ padding: "5px 10px", borderRadius: 6, border: copied ? "1px solid #44ff88" : "1px solid #3a3a6a", background: copied ? "#1a3a1a" : "#1a1a3e", color: copied ? "#44ff88" : "#aaa", cursor: "pointer", fontSize: 11, fontWeight: copied ? 700 : 400, transition: "all 0.2s", minWidth: 60 }}>
                    {copied ? "✓ COPIADO" : "📋"}
                  </button>
                </div>
              </div>

              {isHost && (
                <div style={{ fontSize: 11, color: "#555", textAlign: "center", background: "#0a0a18", borderRadius: 8, padding: "8px 12px" }}>
                  {deckData?.format && (
                    <span style={{ color: "#ffd70088", marginRight: 8 }}>{deckData.format.icon} {deckData.format.label} · ♥ {deckData.format.life} vidas</span>
                  )}
                  Comparte este código con tus amigos
                </div>
              )}
              {/* Save deck button — only for new unsaved decks */}
              {deckData?.isNewDeck && <div style={{ background: "#0a0a18", border: "1px solid #2a2a4a", borderRadius: 10, padding: "10px 12px" }}>
                <div style={{ fontSize: 10, color: "#8888aa", marginBottom: 7, letterSpacing: 1 }}>💾 GUARDAR MAZO ANTES DE JUGAR</div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input value={lobbyDeckName} onChange={e => setLobbyDeckName(e.target.value)} placeholder="Nombre del mazo..."
                    style={{ flex: 1, padding: "7px 10px", borderRadius: 7, border: "1px solid #3a3a6a", background: "#080810", color: "#e8e0d0", fontSize: 13, outline: "none" }} />
                  <button onClick={async () => {
                    const user = getCurrentUser();
                    if (user) {
                      const res = await saveCloudDeck(lobbyDeckName, deckData.deck, deckData.commander, name, deckData.format);
                      alert(res.ok ? `✓ Mazo "${lobbyDeckName}" guardado en la nube ☁` : `✗ Error: ${res.error}`);
                    } else {
                      saveDeckToStorage(lobbyDeckName, deckData.deck, deckData.commander, name, deckData.format);
                      alert(`✓ Mazo "${lobbyDeckName}" guardado`);
                    }
                  }}
                    style={{ padding: "7px 14px", borderRadius: 7, border: "none", background: "linear-gradient(90deg,#1a6a1a,#2a8a2a)", color: "#7fff7f", cursor: "pointer", fontSize: 12, fontWeight: 700, flexShrink: 0, whiteSpace: "nowrap" }}>
                    💾 Guardar
                  </button>
                </div>
                <div style={{ fontSize: 10, color: "#555", marginTop: 5 }}>Guarda este mazo en tu colección para usarlo en futuras partidas</div>
              </div>}

              {/* Players list */}
              <div style={{ borderTop: "1px solid #2a2a4a", paddingTop: 14 }}>
                <div style={{ fontSize: 10, color: "#8888aa", letterSpacing: 2, marginBottom: 10 }}>
                  JUGADORES ({players.length}/4)
                </div>
                {players.map(p => (
                  <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderBottom: "1px solid #1a1a2e" }}>
                    <span style={{ fontSize: 22, flexShrink: 0 }}>{p.avatar || "🧙"}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{p.name}{p.id === myId ? " (tú)" : ""}</div>
                      {p.commander && (
                        <div
                          onMouseEnter={e => setLobbyHover({ card: p.commander, x: e.clientX, y: e.clientY })}
                          onMouseMove={e => setLobbyHover(h => h ? { ...h, x: e.clientX, y: e.clientY } : h)}
                          onMouseLeave={() => setLobbyHover(null)}
                          style={{ fontSize: 10, color: "#ffd70099", display: "flex", alignItems: "center", gap: 5, marginTop: 2, cursor: "pointer" }}>
                          {p.commander.image_url && <img src={p.commander.image_url} style={{ width: 16, height: 22, borderRadius: 2, objectFit: "cover" }} />}
                          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>⚔ {p.commander.printed_name || p.commander.name}</span>
                        </div>
                      )}
                    </div>
                    {p.isHost && <span style={{ fontSize: 10, color: "#ffd700" }}>👑 Host</span>}
                  </div>
                ))}
                {[...Array(Math.max(0, 4 - players.length))].map((_, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderBottom: "1px solid #1a1a2e", color: "#2a2a4a" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#2a2a4a" }} />
                    <span style={{ fontSize: 13 }}>Esperando jugador...</span>
                  </div>
                ))}
              </div>

              {/* Start button — visible to HOST only */}
              {isHost ? (
                <button onClick={startGame} style={{ padding: 13, borderRadius: 10, border: "none", background: "linear-gradient(90deg,#ffd700,#ff8c00)", color: "#000", fontWeight: 800, fontSize: 15, cursor: "pointer" }}>
                  {players.length === 1 ? "▶ Jugar Solo" : `▶ Comenzar con ${players.length} jugador${players.length > 1 ? "es" : ""}`}
                </button>
              ) : (
                <div style={{ textAlign: "center", padding: "10px 0" }}>
                  <div style={{ color: "#8888aa", fontSize: 13 }}>Esperando que el host inicie la partida...</div>
                  <div style={{ color: "#555", fontSize: 11, marginTop: 4 }}>Sala: <strong style={{ color: "#ffd700" }}>{roomCode}</strong></div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {lobbyHover && <HoverZoom card={lobbyHover.card} x={lobbyHover.x} y={lobbyHover.y} />}
    </>
  );
}


// ─── Token Creator Modal ──────────────────────────────────────────────────────
function TokenModal({ onCreate, onClose, cmdTokenSuggestions }) {
  const [tab, setTab] = useState("buscar");   // "buscar" | "manual"
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [hover, setHover] = useState(null);
  const [name, setName] = useState("Soldado");
  const [power, setPower] = useState("1");
  const [tough, setTough] = useState("1");
  const [color, setColor] = useState("#e8e0c0");
  const [qty, setQty] = useState(1);
  const debRef = useRef(null);

  const apply = (preset) => {
    setName(preset.name); setPower(preset.p);
    setTough(preset.t); setColor(preset.color);
    setSelectedCard(null);
  };

  // Search Scryfall for token cards
  useEffect(() => {
    clearTimeout(debRef.current);
    if (!search.trim()) { setResults([]); return; }
    debRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        // Search specifically for token cards on Scryfall
        const q = encodeURIComponent(`${search} type:token`);
        const r = await fetch(`https://api.scryfall.com/cards/search?q=${q}&order=name`);
        if (r.ok) { const d = await r.json(); setResults(d.data?.slice(0, 12) || []); }
        else setResults([]);
      } catch { setResults([]); }
      setSearching(false);
    }, 400);
  }, [search]);

  // When user picks a card from search results
  const pickCard = async (card) => {
    const img = card.image_uris?.normal || card.card_faces?.[0]?.image_uris?.normal || null;
    setSelectedCard({ ...card, image_url: img });
    setName(card.printed_name || card.name);
    setPower(card.power || "1");
    setTough(card.toughness || "1");
    // Pick a color based on card colors
    const cols = card.colors || [];
    const colorMap = { W: "#f9f3d9", U: "#b3d9f7", B: "#c8a0c8", R: "#f7b3a0", G: "#a0d9b3" };
    setColor(cols.length === 1 ? (colorMap[cols[0]] || "#e8e0d0") : "#e8e0d0");
  };

  const handleCreate = () => {
    if (selectedCard) {
      // Create with actual card image
      onCreate(
        name, power, tough, color, qty,
        selectedCard.image_url  // pass image_url as extra arg
      );
    } else {
      onCreate(name, power, tough, color, qty, null);
    }
  };

  const tabBtn = (t, label) => (
    <button onClick={() => setTab(t)} style={{ flex: 1, padding: "8px 0", border: "none", cursor: "pointer", background: tab === t ? "#1a1a3e" : "transparent", color: tab === t ? "#ffd700" : "#888", fontWeight: 600, fontSize: 12, borderBottom: tab === t ? "2px solid #ffd700" : "2px solid transparent" }}>
      {label}
    </button>
  );

  return (
    <>
      <div style={{ position: "fixed", inset: 0, background: "#000c", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 700 }} onClick={onClose}>
        <div style={{ background: "#0d0d1e", border: "1px solid #3a3a6a", borderRadius: 16, padding: 0, width: 520, maxHeight: "88vh", display: "flex", flexDirection: "column", overflow: "hidden" }} onClick={e => e.stopPropagation()}>

          {/* Header */}
          <div style={{ padding: "16px 20px 0", flexShrink: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#ffd700", marginBottom: 8 }}>🪄 Crear Token</div>
            {/* Commander token suggestions */}
            {cmdTokenSuggestions?.length > 0 && (
              <div style={{ marginBottom: 10, padding: "8px 10px", background: "#0a0a18", borderRadius: 8, border: "1px solid #ffd70033" }}>
                <div style={{ fontSize: 10, color: "#ffd700", marginBottom: 6 }}>⚔ Tokens sugeridos para tu comandante:</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {cmdTokenSuggestions.map(t => (
                    <button key={t.id}
                      onClick={() => { onCreate([{ ...t, image_url: t.image_uris?.normal || null, instanceId: uid(), isToken: true, tapped: false, counters: [], abilities: [] }]); onClose(); }}
                      style={{ padding: "3px 8px", borderRadius: 6, border: "1px solid #3a3a6a", background: "#1a1a3e", color: "#e8e0d0", cursor: "pointer", fontSize: 11, display: "flex", alignItems: "center", gap: 5 }}>
                      {t.image_uris?.normal && <img src={t.image_uris.normal} style={{ width: 16, height: 22, borderRadius: 2, objectFit: "cover" }} />}
                      <span>{t.name}</span>
                      {t.power && <span style={{ color: "#666", fontSize: 9 }}>{t.power}/{t.toughness}</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {/* Tabs */}
            <div style={{ display: "flex", borderBottom: "1px solid #2a2a4a" }}>
              {tabBtn("buscar", "🔍 Buscar en Scryfall")}
              {tabBtn("manual", "✏ Crear manual")}
            </div>
          </div>

          {/* Tab: Buscar */}
          {tab === "buscar" && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", padding: "12px 20px" }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar token (ej: Soldado, Zombie, Tesoro...)" autoFocus
                style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #3a3a6a", background: "#080810", color: "#e8e0d0", fontSize: 13, outline: "none", boxSizing: "border-box", marginBottom: 10 }} />

              {/* Results grid */}
              <div style={{ flex: 1, overflowY: "auto", display: "flex", flexWrap: "wrap", gap: 8, alignContent: "flex-start" }}>
                {searching && <div style={{ color: "#888", fontSize: 12, width: "100%", textAlign: "center", padding: 20 }}>Buscando...</div>}
                {!searching && results.length === 0 && search && <div style={{ color: "#444", fontSize: 12, width: "100%", textAlign: "center", padding: 20 }}>Sin resultados — prueba "Soldier", "Zombie", "Treasure"</div>}
                {results.map(card => {
                  const img = card.image_uris?.normal || card.card_faces?.[0]?.image_uris?.normal;
                  const isSelected = selectedCard?.id === card.id;
                  return (
                    <div key={card.id} onClick={() => pickCard(card)}
                      onMouseEnter={e => setHover({ card: { ...card, image_url: img }, x: e.clientX, y: e.clientY })}
                      onMouseMove={e => setHover(h => h ? { ...h, x: e.clientX, y: e.clientY } : h)}
                      onMouseLeave={() => setHover(null)}
                      style={{ cursor: "pointer", borderRadius: 8, border: isSelected ? "2px solid #ffd700" : "2px solid transparent", transition: "all 0.15s", overflow: "hidden", flexShrink: 0 }}>
                      {img
                        ? <img src={img} style={{ width: 72, height: 100, objectFit: "cover", borderRadius: 6, display: "block" }} />
                        : <div style={{ width: 72, height: 100, borderRadius: 6, background: "#1a1a3e", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#888", textAlign: "center", padding: 4 }}>{card.printed_name || card.name}</div>}
                    </div>
                  );
                })}
              </div>

              {/* Selected card info */}
              {selectedCard && (
                <div style={{ marginTop: 10, padding: "10px 14px", background: "#0a0a18", borderRadius: 10, display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                  <img src={selectedCard.image_url} style={{ width: 44, height: 62, borderRadius: 5, objectFit: "cover" }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#e8e0d0" }}>{name}</div>
                    <div style={{ fontSize: 11, color: "#8888aa" }}>{selectedCard.type_line}</div>
                    {selectedCard.power && <div style={{ fontSize: 12, color: "#ffd700", marginTop: 2 }}>⚔ {power}/{tough}</div>}
                  </div>
                  {/* Quantity */}
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ width: 26, height: 26, borderRadius: "50%", border: "none", background: "#4a1a1a", color: "#ff8888", cursor: "pointer", fontSize: 15, fontWeight: 800 }}>−</button>
                    <span style={{ fontSize: 16, fontWeight: 800, color: "#e8e0d0", minWidth: 24, textAlign: "center" }}>{qty}</span>
                    <button onClick={() => setQty(q => q + 1)} style={{ width: 26, height: 26, borderRadius: "50%", border: "none", background: "#1a4a1a", color: "#88ff88", cursor: "pointer", fontSize: 15, fontWeight: 800 }}>+</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab: Manual */}
          {tab === "manual" && (
            <div style={{ flex: 1, overflowY: "auto", padding: "12px 20px" }}>
              {/* Presets */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12 }}>
                {TOKEN_PRESETS.map(p => (
                  <button key={p.name} onClick={() => apply(p)} style={{ padding: "4px 9px", borderRadius: 6, border: `1px solid ${p.color}44`, background: p.color + "22", color: p.color, cursor: "pointer", fontSize: 11, fontWeight: 600 }}>{p.name}</button>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 10, color: "#888", marginBottom: 4 }}>Nombre</div>
                  <input value={name} onChange={e => setName(e.target.value)} style={{ width: "100%", padding: "7px 10px", borderRadius: 7, border: "1px solid #3a3a6a", background: "#080810", color: "#e8e0d0", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                </div>
                <div>
                  <div style={{ fontSize: 10, color: "#888", marginBottom: 4 }}>Color</div>
                  <input type="color" value={color} onChange={e => setColor(e.target.value)} style={{ width: "100%", height: 34, borderRadius: 7, border: "1px solid #3a3a6a", background: "#080810", cursor: "pointer" }} />
                </div>
                <div>
                  <div style={{ fontSize: 10, color: "#888", marginBottom: 4 }}>Poder</div>
                  <input value={power} onChange={e => setPower(e.target.value)} style={{ width: "100%", padding: "7px 10px", borderRadius: 7, border: "1px solid #3a3a6a", background: "#080810", color: "#e8e0d0", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                </div>
                <div>
                  <div style={{ fontSize: 10, color: "#888", marginBottom: 4 }}>Resistencia</div>
                  <input value={tough} onChange={e => setTough(e.target.value)} style={{ width: "100%", padding: "7px 10px", borderRadius: 7, border: "1px solid #3a3a6a", background: "#080810", color: "#e8e0d0", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <span style={{ fontSize: 12, color: "#888" }}>Cantidad:</span>
                <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ width: 28, height: 28, borderRadius: "50%", border: "none", background: "#4a1a1a", color: "#ff8888", cursor: "pointer", fontSize: 16, fontWeight: 800 }}>−</button>
                <span style={{ fontSize: 18, fontWeight: 800, color: "#e8e0d0", minWidth: 28, textAlign: "center" }}>{qty}</span>
                <button onClick={() => setQty(q => q + 1)} style={{ width: 28, height: 28, borderRadius: "50%", border: "none", background: "#1a4a1a", color: "#88ff88", cursor: "pointer", fontSize: 16, fontWeight: 800 }}>+</button>
              </div>
              {/* Preview */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: color + "15", border: `1px solid ${color}44`, borderRadius: 10 }}>
                <div style={{ width: 44, height: 62, borderRadius: 5, background: color + "33", border: `2px solid ${color}`, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 2 }}>
                  <div style={{ fontSize: 9, color, fontWeight: 700, textAlign: "center", padding: "0 3px" }}>{name}</div>
                  <div style={{ fontSize: 13, color, fontWeight: 800 }}>{power}/{tough}</div>
                </div>
                <div style={{ fontSize: 12, color: "#aaa" }}>{qty}× {name} {power}/{tough}</div>
              </div>
            </div>
          )}

          {/* Footer buttons */}
          <div style={{ padding: "12px 20px", borderTop: "1px solid #2a2a4a", display: "flex", gap: 8, flexShrink: 0 }}>
            <button
              onClick={handleCreate}
              disabled={tab === "buscar" && !selectedCard}
              style={{ flex: 1, padding: "11px 0", borderRadius: 9, border: "none", background: (tab === "manual" || selectedCard) ? "linear-gradient(90deg,#ffd700,#ff8c00)" : "#222", color: (tab === "manual" || selectedCard) ? "#000" : "#555", fontWeight: 800, fontSize: 14, cursor: (tab === "manual" || selectedCard) ? "pointer" : "default" }}>
              ✦ {tab === "buscar" && selectedCard ? `Agregar ${qty}× ${name}` : `Crear Token${qty > 1 ? "s" : ""}`}
            </button>
            <button onClick={onClose} style={{ padding: "11px 16px", borderRadius: 9, border: "1px solid #333", background: "transparent", color: "#888", cursor: "pointer" }}>✕</button>
          </div>
        </div>
      </div>
      {hover && <HoverZoom card={hover.card} x={hover.x} y={hover.y} />}
    </>
  );
}

// ─── Life History Panel ───────────────────────────────────────────────────────
function LifeHistoryPanel({ players, lifeHistory, onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "#000b", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 600 }} onClick={onClose}>
      <div style={{ background: "#0d0d1e", border: "1px solid #3a3a6a", borderRadius: 16, padding: 24, minWidth: 360, maxWidth: 500, maxHeight: "80vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#ffd700" }}>❤ Historial de Vida</div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#888", cursor: "pointer", fontSize: 18 }}>✕</button>
        </div>
        {Object.entries(players).map(([pid, p]) => {
          const hist = lifeHistory[pid] || [40];
          return (
            <div key={pid} style={{ marginBottom: 16, padding: "10px 14px", background: "#0a0a18", borderRadius: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#e8e0d0", marginBottom: 8 }}>{p.name} — actual: <span style={{ color: p.life <= 10 ? "#ff4444" : "#88ff88", fontSize: 16 }}>{p.life}</span></div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {hist.map((v, i) => (
                  <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: v <= 10 ? "#ff4444" : v >= 50 ? "#44ff88" : "#e8e0d0", background: "#1a1a2e", borderRadius: 5, padding: "2px 7px", minWidth: 28, textAlign: "center" }}>{v}</div>
                    {i < hist.length - 1 && <div style={{ fontSize: 8, color: hist[i + 1] > v ? "#88ff88" : "#ff8888" }}>{hist[i + 1] > v ? `+${hist[i + 1] - v}` : hist[i + 1] - v}</div>}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Chat Panel ───────────────────────────────────────────────────────────────
function ChatPanel({ messages, input, onInput, onSend, onClose, playerName }) {
  const bottomRef = useRef(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  return (
    <div style={{ position: "fixed", bottom: 0, right: 170, width: 280, height: 360, background: "#0d0d1e", border: "1px solid #3a3a6a", borderRadius: "12px 12px 0 0", display: "flex", flexDirection: "column", zIndex: 400, boxShadow: "0 -4px 24px #000a" }}>
      <div style={{ padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #2a2a4a", background: "#1a1a3e", borderRadius: "12px 12px 0 0" }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#ffd700" }}>💬 Chat</span>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "#888", cursor: "pointer", fontSize: 16 }}>✕</button>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: 10, display: "flex", flexDirection: "column", gap: 6 }}>
        {messages.length === 0 && <div style={{ color: "#444", fontSize: 11, textAlign: "center", marginTop: 20 }}>Sin mensajes aún</div>}
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: m.sender === playerName ? "flex-end" : "flex-start" }}>
            <div style={{ fontSize: 9, color: "#888", marginBottom: 2 }}>{m.sender} · {m.time}</div>
            <div style={{ background: m.sender === playerName ? "#1a3a6a" : "#1a1a3e", color: "#e8e0d0", padding: "6px 10px", borderRadius: 9, fontSize: 12, maxWidth: "90%", wordBreak: "break-word" }}>{m.text}</div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div style={{ padding: 8, borderTop: "1px solid #2a2a4a", display: "flex", gap: 6 }}>
        <input value={input} onChange={e => onInput(e.target.value)} onKeyDown={e => e.key === "Enter" && onSend()} placeholder="Escribe..." style={{ flex: 1, padding: "7px 10px", borderRadius: 7, border: "1px solid #3a3a6a", background: "#080810", color: "#e8e0d0", fontSize: 12, outline: "none" }} />
        <button onClick={onSend} style={{ padding: "7px 12px", borderRadius: 7, border: "none", background: "#1a3a6a", color: "#7fc4ff", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>→</button>
      </div>
    </div>
  );
}

// ─── Notes Panel ──────────────────────────────────────────────────────────────
function NotesPanel({ notes, onChange, onClose }) {
  return (
    <div style={{ position: "fixed", bottom: 0, left: 10, width: 240, height: 300, background: "#0d0d1e", border: "1px solid #3a3a6a", borderRadius: "12px 12px 0 0", display: "flex", flexDirection: "column", zIndex: 400, boxShadow: "0 -4px 24px #000a" }}>
      <div style={{ padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #2a2a4a", background: "#1a1a3e", borderRadius: "12px 12px 0 0" }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#ffd700" }}>📝 Notas</span>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "#888", cursor: "pointer", fontSize: 16 }}>✕</button>
      </div>
      <textarea value={notes} onChange={e => onChange(e.target.value)} placeholder="Tus notas: combos, recordatorios, conteos..." style={{ flex: 1, padding: 10, background: "#080810", color: "#e8e0d0", border: "none", outline: "none", resize: "none", fontSize: 12, lineHeight: 1.6, fontFamily: "monospace" }} />
    </div>
  );
}

// ─── Zoom Card Modal ──────────────────────────────────────────────────────────
function ZoomCardModal({ card, onClose }) {
  if (!card) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "#000d", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 900 }} onClick={onClose}>
      <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }} onClick={e => e.stopPropagation()}>
        {card.image_url
          ? <img src={card.image_url} style={{ width: 300, borderRadius: 14, boxShadow: "0 8px 48px #000c" }} />
          : <div style={{ width: 300, aspectRatio: "2.5/3.5", borderRadius: 14, background: "#1a1a3e", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 60 }}>🃏</div>}
        <div style={{ maxWidth: 260, color: "#e8e0d0" }}>
          <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>{getCardName(card)}</div>
          <div style={{ fontSize: 12, color: "#8888aa", marginBottom: 10 }}>{card.type_line}</div>
          {card.oracle_text && <div style={{ fontSize: 13, color: "#b0a888", lineHeight: 1.7, background: "#0a0a18", borderRadius: 8, padding: 12 }}>{card.printed_text || card.oracle_text}</div>}
          {card.power && <div style={{ fontSize: 18, fontWeight: 800, color: "#ffd700", marginTop: 10 }}>⚔ {card.power}/{card.toughness}</div>}
          {card.loyalty && <div style={{ fontSize: 18, fontWeight: 800, color: "#7fc4ff", marginTop: 10 }}>🔵 {card.loyalty}</div>}
          {(card.counters || []).length > 0 && <div style={{ fontSize: 12, color: "#88ffcc", marginTop: 8 }}>Contadores: {[...new Set(card.counters)].map(t => `${t}×${card.counters.filter(x => x === t).length}`).join(", ")}</div>}
          <button onClick={onClose} style={{ marginTop: 16, padding: "8px 24px", borderRadius: 8, border: "1px solid #333", background: "transparent", color: "#888", cursor: "pointer" }}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}

// ─── Turn Order Panel ─────────────────────────────────────────────────────────
function PhasePanel({ playerOrder, players, activePlayer, turn, phase, isMyTurn, onNextPhase, onEndTurn, onMulligan, onHome, avatars }) {
  const PHASE_ICONS = ["🌙", "📖", "⚡", "⚔️", "⚡", "🏁"];
  const PHASE_SHORT = ["Mant.", "Robo", "Prin 1", "Ataque", "Prin 2", "Fin"];
  return (
    <div style={{ width: 72, flexShrink: 0, background: "#06060e", borderRight: "1px solid #1a1a2e", display: "flex", flexDirection: "column", alignItems: "center", padding: "6px 4px", gap: 3, overflowY: "auto" }}>
      {/* Logo/Home */}
      <div onClick={onHome} title="Inicio" style={{ fontSize: 16, cursor: "pointer", marginBottom: 4 }}>⚔️</div>
      {/* Turn number */}
      <div style={{ fontSize: 9, color: "#ffd700", fontWeight: 800, marginBottom: 2 }}>T{turn}</div>
      {/* Phase indicators */}
      {PHASE_SHORT.map((ph, i) => (
        <div key={ph} style={{ width: "100%", padding: "5px 3px", borderRadius: 6, background: i === phase ? "#ffd70022" : "transparent", border: i === phase ? "1px solid #ffd70055" : "1px solid transparent", textAlign: "center", cursor: isMyTurn ? "pointer" : "default", transition: "all 0.15s" }}>
          <div style={{ fontSize: 12 }}>{PHASE_ICONS[i]}</div>
          <div style={{ fontSize: 7, color: i === phase ? "#ffd700" : "#555", fontWeight: i === phase ? 800 : 400, lineHeight: 1.2 }}>{ph}</div>
        </div>
      ))}
      {/* Next phase + End turn buttons */}
      {isMyTurn && (
        <div style={{ position: "relative", marginTop: 4, display: "flex", flexDirection: "column", gap: 3 }}>
          <button onClick={onNextPhase} style={{ width: "100%", padding: "6px 2px", borderRadius: 6, border: "none", background: "linear-gradient(180deg,#ffd700,#ff8c00)", color: "#000", fontWeight: 800, fontSize: 9, cursor: "pointer", lineHeight: 1.3 }}>
            {phase >= 5 ? "Pasar turno" : "Sig. fase"} ▶
          </button>
          {phase < 5 && (
            <button onClick={onEndTurn} style={{ width: "100%", padding: "5px 2px", borderRadius: 6, border: "1px solid #3a3a6a", background: "#0d0d1e", color: "#8888aa", fontWeight: 700, fontSize: 8, cursor: "pointer", lineHeight: 1.3 }}>
              ⏭ Fin Turno
            </button>
          )}
          {/* Combat hint */}
          {phase === 3 && (
            <div style={{ width: "100%", padding: "6px 8px", borderRadius: 8, background: "#2a0a0a", border: "1px solid #ff4444aa", textAlign: "center" }}>
              <div style={{ fontSize: 10, color: "#ff6666", fontWeight: 800 }}>⚔ ATAQUE</div>
              <div style={{ fontSize: 8, color: "#ff8888", lineHeight: 1.5, marginTop: 2 }}>Click derecho<br />en criatura para<br />declarar atacante</div>
            </div>
          )}
        </div>
      )}
      {/* Turn order */}
      <div style={{ width: "100%", borderTop: "1px solid #1a1a2e", marginTop: 4, paddingTop: 4, display: "flex", flexDirection: "column", gap: 3 }}>
        {playerOrder.map((pid, i) => {
          const p = players[pid]; if (!p) return null;
          const isActive = pid === activePlayer;
          return (
            <div key={pid} style={{ padding: "3px 4px", borderRadius: 5, background: isActive ? "#1a140a" : "transparent", border: isActive ? "1px solid #ffd70044" : "1px solid transparent" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                <span style={{ fontSize: 10 }}>{avatars?.[pid] || "🧙"}</span>
                <div style={{ fontSize: 8, fontWeight: 700, color: isActive ? "#ffd700" : "#666", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name.slice(0, 7)}</div>
              </div>
              <div style={{ fontSize: 8, color: p.life <= 10 ? "#ff4444" : "#555" }}>❤{p.life}</div>
            </div>
          );
        })}
      </div>
      {/* Mulligan button if turn 1 */}
      {isMyTurn && turn === 1 && (
        <button onClick={onMulligan} style={{ marginTop: 4, width: "100%", padding: "4px 2px", borderRadius: 5, border: "1px solid #ffd70044", background: "#1a140a", color: "#ffd700", fontSize: 8, cursor: "pointer", fontWeight: 700 }}>
          🔄
        </button>
      )}
    </div>
  );
}


// ─── Resolve Modal ────────────────────────────────────────────────────────────
// Generic modal for mechanics that need card selection: Cascade, Discover,
// Impulse, Suspend, Connive, Dredge
function ResolveModal({ modal, players, onResolve, onClose }) {
  const { mode, cards, pid, label, extra } = modal;
  const p = players[pid];
  const [selected, setSelected] = useState(null);
  const [selectedSet, setSelectedSet] = useState(new Set());
  const [hover, setHover] = useState(null);

  const mustDiscard = extra?.mustDiscard || 0;
  const millN = extra?.millN || 0;
  const timeCounters = extra?.timeCounters || 0;

  const toggle = (iid) => {
    if (mode === "connive") {
      setSelectedSet(s => { const n = new Set(s); n.has(iid) ? n.delete(iid) : n.size < mustDiscard && n.add(iid); return n; });
    } else {
      setSelected(iid);
    }
  };

  const MODES = {
    cascade: { title: "⚡ Cascade", desc: "Puedes lanzar esta carta sin pagar su coste. Las cartas exiladas durante Cascade vuelven al fondo en orden aleatorio.", btnPlay: "▶ Lanzar sin coste", btnHand: null, btnExile: "✗ No lanzar (todo al fondo)" },
    discover: { title: "🔭 Discover", desc: "Elige una carta para jugar gratis. Las demás al fondo", btnPlay: "▶ Jugar gratis", btnHand: "🤚 A la mano", btnExile: null },
    impulse: { title: "💨 Impulse", desc: "Elige una carta para jugar este turno. Las demás se exilan", btnPlay: "▶ Jugar este turno", btnHand: null, btnExile: "Exilar todas" },
    suspend: { title: "⏳ Suspend", desc: "Elige la carta a suspender (va al exilio con contadores de tiempo)", btnPlay: "⏳ Suspender", btnHand: null, btnExile: null },
    connive: { title: "🎴 Connive", desc: `Descarta ${mustDiscard} carta${mustDiscard > 1 ? "s" : ""}. Las que no descartas ganan +1/+1`, btnPlay: null, btnHand: null, btnExile: `🗑 Descartar seleccionadas (${selectedSet.size}/${mustDiscard})` },
    dredge: { title: "🌿 Dredge", desc: `Elige una carta del cementerio para devolver a la mano. Mill ${millN}.`, btnPlay: "🤚 Devolver a mano", btnHand: null, btnExile: null },
  };

  const m = MODES[mode] || { title: label, desc: "", btnPlay: "▶ Jugar", btnHand: "🤚 Mano", btnExile: "✨ Exilar" };

  const canConfirm = mode === "connive" ? selectedSet.size === mustDiscard : selected !== null;

  return (
    <>
      <div style={{ position: "fixed", inset: 0, background: "#000d", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 750, fontFamily: "'Crimson Text',Georgia,serif" }}>
        <div style={{ background: "#0a0a1a", border: "2px solid #ffd70055", borderRadius: 18, padding: 26, maxWidth: 720, width: "95vw", maxHeight: "90vh", overflowY: "auto" }}>
          {/* Header */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#ffd700" }}>{m.title}</div>
            <div style={{ fontSize: 12, color: "#8888aa", marginTop: 4 }}>{m.desc}</div>
          </div>

          {/* Cards */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginBottom: 20 }}>
            {cards.map(card => {
              const iid = card.instanceId;
              const sel = mode === "connive" ? selectedSet.has(iid) : selected === iid;
              return (
                <div key={iid} onClick={() => toggle(iid)}
                  onMouseEnter={e => setHover({ card, x: e.clientX, y: e.clientY })}
                  onMouseMove={e => setHover(h => h ? { ...h, x: e.clientX, y: e.clientY } : h)}
                  onMouseLeave={() => setHover(null)}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, cursor: "pointer" }}>
                  <div style={{ position: "relative" }}>
                    <div style={{
                      position: "absolute", inset: 0, borderRadius: 7, zIndex: 2, pointerEvents: "none",
                      background: sel ? "#ffd70033" : "transparent",
                      border: sel ? "3px solid #ffd700" : "3px solid transparent",
                      transition: "all 0.15s"
                    }} />
                    {card.image_url
                      ? <img src={card.image_url} style={{ width: 80, borderRadius: 7, display: "block" }} />
                      : <div style={{ width: 80, height: 112, borderRadius: 7, background: "#1a1a3e", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#888", textAlign: "center", padding: 4 }}>{getCardName(card)}</div>}
                  </div>
                  <div style={{ fontSize: 9, color: "#8888aa", textAlign: "center", maxWidth: 80 }}>{getCardName(card)}</div>
                  {mode === "connive" && sel && <div style={{ fontSize: 9, color: "#ff8888", fontWeight: 700 }}>🗑 Descartar</div>}
                  {(mode === "cascade" || mode === "discover") && sel && <div style={{ fontSize: 9, color: "#ffd700", fontWeight: 700 }}>✓ Seleccionada</div>}
                </div>
              );
            })}
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
            {m.btnPlay && (
              <button onClick={() => canConfirm && onResolve(mode, "play", selected, selectedSet, modal)}
                disabled={!canConfirm}
                style={{ padding: "10px 22px", borderRadius: 9, border: "none", background: canConfirm ? "linear-gradient(90deg,#1a5a1a,#2a8a2a)" : "#222", color: canConfirm ? "#7fff7f" : "#444", fontWeight: 800, fontSize: 13, cursor: canConfirm ? "pointer" : "default" }}>
                {m.btnPlay}
              </button>
            )}
            {m.btnHand && (
              <button onClick={() => canConfirm && onResolve(mode, "hand", selected, selectedSet, modal)}
                disabled={!canConfirm}
                style={{ padding: "10px 22px", borderRadius: 9, border: "1px solid #3a3a6a", background: canConfirm ? "#1a1a3e" : "#111", color: canConfirm ? "#e8e0d0" : "#444", fontWeight: 700, fontSize: 13, cursor: canConfirm ? "pointer" : "default" }}>
                {m.btnHand}
              </button>
            )}
            {m.btnExile && (
              <button onClick={() => onResolve(mode, "exile", selected, selectedSet, modal)}
                disabled={mode === "connive" && !canConfirm}
                style={{ padding: "10px 22px", borderRadius: 9, border: "1px solid #4a3a3a", background: "#1a0a0a", color: "#ff8888", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                {m.btnExile}
              </button>
            )}
            <button onClick={onClose}
              style={{ padding: "10px 16px", borderRadius: 9, border: "1px solid #333", background: "transparent", color: "#555", cursor: "pointer", fontSize: 12 }}>
              Cancelar
            </button>
          </div>
        </div>
      </div>
      {hover && <HoverZoom card={hover.card} x={hover.x} y={hover.y} />}
    </>
  );
}


// ─── Dice Roller Modal ────────────────────────────────────────────────────────
function DiceModal({ onClose, playerName, onRoll }) {
  const [result, setResult] = useState(null);
  const [rolling, setRolling] = useState(false);

  const roll = (die) => {
    setRolling(true);
    setResult(null);
    let ticks = 0;
    const interval = setInterval(() => {
      setResult({ die: die.sides, value: Math.ceil(Math.random() * die.sides), color: die.color, rolling: true });
      ticks++;
      if (ticks >= 8) {
        clearInterval(interval);
        const final = Math.ceil(Math.random() * die.sides);
        const rollData = { playerName, die: die.sides, value: final, color: die.color };
        setResult({ ...rollData, rolling: false });
        setRolling(false);
        // Broadcast to all players
        onRoll?.(rollData);
      }
    }, 80);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000c", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 700, fontFamily: "'Crimson Text',Georgia,serif" }} onClick={onClose}>
      <div style={{ background: "#0d0d1e", border: "1px solid #3a3a6a", borderRadius: 16, padding: 24, width: 320 }} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 16, fontWeight: 700, color: "#ffd700", marginBottom: 16, textAlign: "center" }}>🎲 Tirar Dado</div>

        {/* Result display */}
        <div style={{ textAlign: "center", marginBottom: 20, minHeight: 80, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
          {result ? (
            <>
              <div style={{ fontSize: 52, fontWeight: 900, color: result.color, transition: "all 0.1s", opacity: result.rolling ? 0.6 : 1 }}>
                {result.value}
              </div>
              <div style={{ fontSize: 12, color: "#8888aa" }}>d{result.die}{!result.rolling && result.value === result.die ? " — ¡Máximo! 🎉" : result.value === 1 ? " — Falla crítica 💀" : ""}</div>
            </>
          ) : (
            <div style={{ fontSize: 13, color: "#555" }}>Elige un dado</div>
          )}
        </div>

        {/* Dice buttons */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
          {DICE.map(die => (
            <button key={die.sides} onClick={() => !rolling && roll(die)} disabled={rolling}
              style={{ padding: "14px 0", borderRadius: 10, border: `2px solid ${die.color}44`, background: `${die.color}11`, color: die.color, cursor: rolling ? "default" : "pointer", fontWeight: 800, fontSize: 18, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, transition: "all 0.15s", opacity: rolling ? 0.5 : 1 }}
              onMouseEnter={e => !rolling && (e.currentTarget.style.background = `${die.color}22`)}
              onMouseLeave={e => (e.currentTarget.style.background = `${die.color}11`)}>
              <span style={{ fontSize: 22 }}>{die.icon}</span>
              <span style={{ fontSize: 13 }}>d{die.sides}</span>
            </button>
          ))}
        </div>

        <button onClick={onClose} style={{ marginTop: 16, width: "100%", padding: "8px 0", borderRadius: 8, border: "1px solid #333", background: "transparent", color: "#888", cursor: "pointer", fontSize: 12 }}>Cerrar</button>
      </div>
    </div>
  );
}


// ─── Abilities Modal ──────────────────────────────────────────────────────────
// Map Scryfall keywords to our ability keys (auto-assigned when card enters battlefield)
// Extract abilities from card keywords
function cardAbilitiesFromKeywords(card) {
  const keywords = card.keywords || [];
  return keywords
    .map(k => KEYWORD_MAP[k.toLowerCase()])
    .filter(Boolean);
}

function AbilitiesModal({ markers, onAdd, onRemove, onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "#000c", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 700, fontFamily: "'Crimson Text',Georgia,serif" }} onClick={onClose}>
      <div style={{ background: "#0d0d1e", border: "1px solid #3a3a6a", borderRadius: 16, padding: 0, width: 500, maxHeight: "88vh", display: "flex", flexDirection: "column", overflow: "hidden" }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #2a2a4a", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#ffd700" }}>✨ Habilidades activas</div>
            <div style={{ fontSize: 11, color: "#8888aa", marginTop: 2 }}>Agrega marcadores de habilidad al tablero</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#888", cursor: "pointer", fontSize: 18 }}>✕</button>
        </div>

        {/* Active markers */}
        {markers.length > 0 && (
          <div style={{ padding: "10px 16px", borderBottom: "1px solid #2a2a4a", flexShrink: 0 }}>
            <div style={{ fontSize: 10, color: "#8888aa", letterSpacing: 2, marginBottom: 8 }}>MARCADORES ACTIVOS</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {markers.map(m => {
                const ab = ABILITIES.find(a => a.key === m.ability) || { icon: "?", name: m.ability, color: "#2a2a4a", text: "#fff" };
                return (
                  <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 20, background: ab.color, border: `1px solid ${ab.text}44` }}>
                    <span style={{ fontSize: 14 }}>{ab.icon}</span>
                    <span style={{ fontSize: 11, color: ab.text, fontWeight: 700 }}>{ab.name}</span>
                    <button onClick={() => onRemove(m.id)} style={{ background: "none", border: "none", color: ab.text, cursor: "pointer", fontSize: 13, lineHeight: 1, padding: 0, opacity: 0.7 }}>✕</button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Abilities grid */}
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {ABILITIES.map(ab => {
              const isActive = markers.some(m => m.ability === ab.key);
              return (
                <button key={ab.key} onClick={() => onAdd(ab.key)}
                  style={{ padding: "10px 14px", borderRadius: 10, border: `2px solid ${isActive ? ab.text : ab.color}`, background: isActive ? ab.color + "88" : ab.color + "22", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 10, transition: "all 0.15s", position: "relative" }}
                  onMouseEnter={e => e.currentTarget.style.background = ab.color + "55"}
                  onMouseLeave={e => e.currentTarget.style.background = isActive ? ab.color + "88" : ab.color + "22"}>
                  <span style={{ fontSize: 22, flexShrink: 0 }}>{ab.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: ab.text }}>{ab.name}</div>
                    <div style={{ fontSize: 9, color: ab.text, opacity: 0.7, fontStyle: "italic" }}>{ab.en}</div>
                    <div style={{ fontSize: 9, color: "#8888aa", marginTop: 2, lineHeight: 1.3 }}>{ab.desc}</div>
                  </div>
                  {isActive && <div style={{ position: "absolute", top: 6, right: 8, width: 8, height: 8, borderRadius: "50%", background: ab.text }} />}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ padding: "12px 16px", borderTop: "1px solid #2a2a4a", flexShrink: 0 }}>
          <button onClick={() => { onRemove("all"); }} style={{ width: "100%", padding: "8px 0", borderRadius: 8, border: "1px solid #4a2a2a", background: "#1a0a0a", color: "#ff8888", cursor: "pointer", fontSize: 12 }}>
            🗑 Quitar todos los marcadores
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Ability Marker (rendered on battlefield) ─────────────────────────────────
function AbilityMarker({ marker, onRemove }) {
  const ab = ABILITIES.find(a => a.key === marker.ability) || { icon: "?", name: marker.ability, color: "#2a2a4a", text: "#fff" };
  return (
    <div title={`${ab.name} — ${ab.en}`}
      onContextMenu={e => { e.preventDefault(); onRemove(marker.id); }}
      style={{ width: 52, height: 52, borderRadius: 8, background: `linear-gradient(135deg,${ab.color},${ab.color}88)`, border: `2px solid ${ab.text}66`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, cursor: "context-menu", flexShrink: 0, userSelect: "none" }}>
      <span style={{ fontSize: 22 }}>{ab.icon}</span>
      <span style={{ fontSize: 7, color: ab.text, fontWeight: 700, textAlign: "center", lineHeight: 1 }}>{ab.name}</span>
    </div>
  );
}


// ─── Dice Result Overlay ──────────────────────────────────────────────────────
// Shown to ALL players when any player rolls a die
function DiceResultOverlay({ result, onClose }) {
  if (!result) return null;
  const isMax = result.value === result.die;
  const isCrit = result.value === 1;
  return (
    <div style={{ position: "fixed", bottom: 80, left: "50%", transform: "translateX(-50%)", zIndex: 800, pointerEvents: "none", textAlign: "center", animation: "fadeInUp 0.3s ease" }}>
      <style>{`@keyframes fadeInUp{from{opacity:0;transform:translateX(-50%) translateY(20px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
      <div style={{ background: "#0d0d1e", border: `2px solid ${result.color}`, borderRadius: 16, padding: "14px 28px", boxShadow: `0 0 40px ${result.color}66, 0 8px 32px #000c`, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
        <div style={{ fontSize: 11, color: "#8888aa", letterSpacing: 2 }}>{result.playerName} — d{result.die}</div>
        <div style={{ fontSize: 60, fontWeight: 900, color: result.color, lineHeight: 1 }}>{result.value}</div>
        {isMax && <div style={{ fontSize: 13, color: "#ffd700", fontWeight: 700 }}>¡Máximo! 🎉</div>}
        {isCrit && <div style={{ fontSize: 13, color: "#ff4444", fontWeight: 700 }}>Falla crítica 💀</div>}
      </div>
    </div>
  );
}


// ─── Mana Tracker ─────────────────────────────────────────────────────────────
function ManaTracker({ mana, onChange, onClose }) {
  return (
    <div style={{ position: "fixed", bottom: 10, left: 90, background: "#0d0d1e", border: "1px solid #3a3a6a", borderRadius: 14, padding: 14, zIndex: 400, boxShadow: "0 8px 32px #000a" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#ffd700" }}>💎 Maná disponible</span>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "#888", cursor: "pointer", fontSize: 14 }}>✕</button>
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        {MANA_DEFS.map(m => (
          <div key={m.key} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{ fontSize: 16 }}>{m.symbol}</div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
              <button onClick={() => onChange({ ...mana, [m.key]: mana[m.key] + 1 })}
                style={{ width: 24, height: 24, borderRadius: "50%", border: "none", background: "#1a4a1a", color: "#88ff88", cursor: "pointer", fontSize: 14, fontWeight: 800, padding: 0 }}>+</button>
              <div style={{ width: 32, height: 32, borderRadius: 6, background: m.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, color: m.text }}>
                {mana[m.key]}
              </div>
              <button onClick={() => onChange({ ...mana, [m.key]: Math.max(0, mana[m.key] - 1) })}
                style={{ width: 24, height: 24, borderRadius: "50%", border: "none", background: "#4a1a1a", color: "#ff8888", cursor: "pointer", fontSize: 14, fontWeight: 800, padding: 0 }}>−</button>
            </div>
            <div style={{ fontSize: 7, color: "#888" }}>{m.label}</div>
          </div>
        ))}
        <button onClick={() => onChange({ W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 })}
          style={{ padding: "6px 10px", borderRadius: 7, border: "1px solid #3a3a6a", background: "transparent", color: "#888", cursor: "pointer", fontSize: 10, alignSelf: "center" }}>
          Limpiar
        </button>
      </div>
    </div>
  );
}


// ─── WebRTC Voice Chat ────────────────────────────────────────────────────────
// P2P audio using WebRTC, Supabase Realtime as signaling channel
class VoiceChat {
  constructor(myId, rtInstance) {
    this.myId = myId;
    this.rt = rtInstance;
    this.peers = {};        // { peerId: RTCPeerConnection }
    this.streams = {};      // { peerId: MediaStream }
    this.localStream = null;
    this.muted = false;
    this.onSpeaking = null; // callback(peerId, bool)
    this.onPeerJoin = null;
    this.onPeerLeave = null;
    this.analyserNodes = {};
    this.speakingTimers = {};
  }

  async start() {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      return true;
    } catch (e) {
      console.warn("Microphone access denied:", e);
      return false;
    }
  }

  setMuted(muted) {
    this.muted = muted;
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(t => t.enabled = !muted);
    }
  }

  // Called when we receive a signaling message
  async handleSignal(fromId, signal) {
    if (fromId === this.myId) return;
    const { type, sdp, candidate } = signal;

    if (type === "offer") {
      const pc = this._getPeer(fromId);
      await pc.setRemoteDescription(new RTCSessionDescription({ type: "offer", sdp }));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      this.rt.broadcast("webrtc_signal", { to: fromId, from: this.myId, type: "answer", sdp: answer.sdp });
    }
    else if (type === "answer") {
      const pc = this.peers[fromId];
      if (pc && pc.signalingState !== "stable") {
        await pc.setRemoteDescription(new RTCSessionDescription({ type: "answer", sdp }));
      }
    }
    else if (type === "candidate" && candidate) {
      const pc = this.peers[fromId];
      if (pc) { try { await pc.addIceCandidate(new RTCIceCandidate(candidate)); } catch { } }
    }
    else if (type === "join") {
      // New peer joined — initiate offer
      await this._initiateCall(fromId);
    }
  }

  async connectToPeer(peerId) {
    // Announce our presence so peer initiates offer
    this.rt.broadcast("webrtc_signal", { to: peerId, from: this.myId, type: "join" });
  }

  async _initiateCall(peerId) {
    const pc = this._getPeer(peerId);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    this.rt.broadcast("webrtc_signal", { to: peerId, from: this.myId, type: "offer", sdp: offer.sdp });
  }

  _getPeer(peerId) {
    if (this.peers[peerId]) return this.peers[peerId];
    const config = {
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ]
    };
    const pc = new RTCPeerConnection(config);
    this.peers[peerId] = pc;

    // Add local audio tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach(t => pc.addTrack(t, this.localStream));
    }

    // ICE candidates
    pc.onicecandidate = e => {
      if (e.candidate) {
        this.rt.broadcast("webrtc_signal", { to: peerId, from: this.myId, type: "candidate", candidate: e.candidate });
      }
    };

    // Remote audio
    pc.ontrack = e => {
      this.streams[peerId] = e.streams[0];
      const audio = document.createElement("audio");
      audio.srcObject = e.streams[0];
      audio.autoplay = true;
      audio.id = `voice-${peerId}`;
      document.body.appendChild(audio);
      this.onPeerJoin?.(peerId);
      this._startSpeakingDetection(peerId, e.streams[0]);
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
        this._cleanupPeer(peerId);
        this.onPeerLeave?.(peerId);
      }
    };

    return pc;
  }

  _startSpeakingDetection(peerId, stream) {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      src.connect(analyser);
      this.analyserNodes[peerId] = analyser;

      const check = () => {
        if (!this.analyserNodes[peerId]) return;
        const data = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        const speaking = avg > 15;
        if (speaking !== this._lastSpeaking?.[peerId]) {
          this._lastSpeaking = { ...this._lastSpeaking, [peerId]: speaking };
          this.onSpeaking?.(peerId, speaking);
        }
        this.speakingTimers[peerId] = requestAnimationFrame(check);
      };
      check();
    } catch { }
  }

  _cleanupPeer(peerId) {
    this.peers[peerId]?.close();
    delete this.peers[peerId];
    delete this.streams[peerId];
    delete this.analyserNodes[peerId];
    if (this.speakingTimers[peerId]) cancelAnimationFrame(this.speakingTimers[peerId]);
    document.getElementById(`voice-${peerId}`)?.remove();
  }

  stop() {
    Object.keys(this.peers).forEach(id => this._cleanupPeer(id));
    this.localStream?.getTracks().forEach(t => t.stop());
    this.localStream = null;
  }
}


// ─── Commander Damage Panel ───────────────────────────────────────────────────
function CmdDmgPanel({ myPid, players, playerOrder, avatarMap, onAdjust, onClose }) {
  const opponents = playerOrder.filter(pid => pid !== myPid);
  const myState = players[myPid];

  return (
    <div style={{ position: "fixed", bottom: 60, left: 90, background: "#0d0d1e", border: "1px solid #3a3a6a", borderRadius: 14, padding: 14, zIndex: 400, boxShadow: "0 8px 32px #000a", minWidth: 220 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#ffd700" }}>⚔ Daño de Comandante</span>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "#888", cursor: "pointer", fontSize: 14 }}>✕</button>
      </div>
      <div style={{ fontSize: 10, color: "#555", marginBottom: 8 }}>21+ daño = eliminado</div>
      {opponents.map(pid => {
        const dmg = myState?.commanderDamage?.[pid] || 0;
        const pct = Math.min(100, (dmg / 21) * 100);
        return (
          <div key={pid} style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 16 }}>{avatarMap?.[pid] || "🧙"}</span>
              <span style={{ fontSize: 12, color: "#e8e0d0", flex: 1 }}>{players[pid]?.name}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <button onClick={() => onAdjust(pid, -1)} style={{ width: 22, height: 22, borderRadius: "50%", border: "none", background: "#4a1a1a", color: "#ff8888", cursor: "pointer", fontSize: 13, fontWeight: 800, padding: 0 }}>−</button>
                <span style={{ fontSize: 16, fontWeight: 800, color: dmg >= 21 ? "#ff4444" : dmg >= 15 ? "#ff8844" : "#e8e0d0", minWidth: 28, textAlign: "center" }}>{dmg}</span>
                <button onClick={() => onAdjust(pid, 1)} style={{ width: 22, height: 22, borderRadius: "50%", border: "none", background: "#1a4a1a", color: "#88ff88", cursor: "pointer", fontSize: 13, fontWeight: 800, padding: 0 }}>+</button>
              </div>
              {dmg >= 21 && <span style={{ fontSize: 10, color: "#ff4444", fontWeight: 800 }}>☠</span>}
            </div>
            <div style={{ height: 4, borderRadius: 2, background: "#1a1a2e", overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: 2, background: dmg >= 21 ? "#ff4444" : dmg >= 15 ? "#ff8844" : "#ffd700", width: `${pct}%`, transition: "width 0.3s" }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}


function exportGameState(players, playerOrder, turn, phase, turnLog, roomCode) {
  const lines = [];
  lines.push(`# MTG Arena ES — Exportar Partida`);
  lines.push(`Sala: ${roomCode} | Turno: ${turn} | Fase: ${PHASES[phase]}`);
  lines.push(`Fecha: ${new Date().toLocaleString()}`);
  lines.push("");

  playerOrder.forEach(pid => {
    const p = players[pid];
    if (!p) return;
    lines.push(`## ${p.name}`);
    lines.push(`- Vida: ${p.life} | Veneno: ${p.poison} | Energía: ${p.energy || 0} | Experiencia: ${p.experience || 0}`);
    if (Object.values(p.commanderDamage || {}).some(v => v > 0)) {
      lines.push(`- Daño de comandante recibido: ${Object.entries(p.commanderDamage).filter(([, v]) => v > 0).map(([k, v]) => `${players[k]?.name}: ${v}`).join(", ")}`);
    }
    lines.push(`- Biblioteca: ${p.library.length} | Mano: ${p.hand.length} | Campo: ${p.battlefield.length}`);
    lines.push(`- Cementerio: ${p.graveyard.length} | Exilio: ${p.exile.length}`);
    if (p.commandZone?.length) lines.push(`- Zona de Comandante: ${p.commandZone.map(c => c.printed_name || c.name).join(", ")}`);
    if (p.battlefield.length) lines.push(`- En campo: ${p.battlefield.map(c => `${c.printed_name || c.name}${c.tapped ? " (girada)" : ""}`).join(", ")}`);
    lines.push("");
  });

  lines.push("## Log de la Partida");
  turnLog.forEach(g => {
    lines.push(`### Turno ${g.turn}`);
    g.entries.forEach(e => lines.push(`  - ${e}`));
  });

  return lines.join("\n");
}
// ─── GAME BOARD ───────────────────────────────────────────────────────────────
// Layout: top-left, top-right, bottom-left, bottom-right, center = me
// Positions: p1=bottom-center(me), p2=top-center, p3=left, p4=right  (adjusted by count)

function GameBoard({ initialPlayers, myId, rtInstance, onExit, onHome, onClearSession, roomCode, isSpectator, resumedTurn, resumedPhase, resumedActivePlayer, resumedTurnLog }) {
  const [turn, setTurn] = useState(resumedTurn || 1);
  const [phase, setPhase] = useState(resumedPhase || 0);
  const [activePlayer, setActivePlayer] = useState(resumedActivePlayer || initialPlayers[0]?.id);
  const [players, setPlayers] = useState(() => {
    const entries = initialPlayers.map(p => {
      // Use playerState directly if it has library (restored from save)
      const state = (p.playerState && p.playerState.library !== undefined)
        ? p.playerState
        : mkState(p.id, p.name || "Jugador", p.playerState?.fullDeck || [], p.playerState?.commanderCard || null, p.format?.life || initialPlayers[0]?.format?.life || 40);
      return [p.id, state];
    });
    return Object.fromEntries(entries);
  });
  // Structured log: [{turn, phase, entries:[]}]
  const [turnLog, setTurnLog] = useState(resumedTurnLog || [{ turn: 1, entries: ["¡Partida comenzada!"] }]);
  const [cmdTokenSuggestions, setCmdTokenSuggestions] = useState([]);
  const [logCollapsed, setLogCollapsed] = useState({}); // {turnN: bool}
  // Auto-open mulligan on game start
  const [ctxMenu, setCtxMenu] = useState(null);
  const [showZone, setShowZone] = useState(null);
  const [selCard, setSelCard] = useState(null);
  const [counterModal, setCounterModal] = useState(null); // instanceId of card
  const [mulliganModal, setMulliganModal] = useState(false);
  const [mulliganCount, setMulliganCount] = useState(0); // how many mulligans taken
  const [hover, setHover] = useState(null);
  const [scryModal, setScryModal] = useState(null); // {pid, cards, mode: "scry"|"surveil"}
  const [searchLibModal, setSearchLibModal] = useState(null); // pid
  const [viewTopModal, setViewTopModal] = useState(null);
  const [resolveModal, setResolveModal] = useState(null); // {mode, cards, rest, pid}
  const [history, setHistory] = useState([]);
  const [tokenModal, setTokenModal] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [notes, setNotes] = useState("");
  const [notesOpen, setNotesOpen] = useState(false);
  const [zoomCard, setZoomCard] = useState(null);
  const [cardSearch, setCardSearch] = useState({ open: false, query: "", results: [], loading: false });
  const [cardSearchCtx, setCardSearchCtx] = useState(null);
  const [diceModal, setDiceModal] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [notifications, setNotifications] = useState([]); // [{id, msg, from, ts}]
  const [muted, setMuted] = useState(false);
  const [speaking, setSpeaking] = useState({}); // {pid: bool}
  const voiceRef = useRef(null);
  const [abilitiesModal, setAbilitiesModal] = useState(false);
  const [diceResult, setDiceResult] = useState(null); // {playerName, die, value, color} shown to all
  // Combat state
  const [attackers, setAttackers] = useState(new Set());
  const [undoStack, setUndoStack] = useState([]);
  const [dragCard, setDragCard] = useState(null);
  const [battlefieldWrap, setBattlefieldWrap] = useState(false); // toggle wrap for 2-row layout // {instanceId, zone: 'battlefield'|'lands'|'hand'}
  const [row2Cards, setRow2Cards] = useState(new Set()); // instanceIds of cards in row 2
  const [row3Cards, setRow3Cards] = useState(new Set()); // instanceIds of cards in row 3
  const [dragOverId, setDragOverId] = useState(null);
  const [combatModal, setCombatModal] = useState(false);
  // Active ability markers on the board: [{id, ability, color, icon}]
  const [abilityMarkers, setAbilityMarkers] = useState([]);
  const [lifeHistoryOpen, setLifeHistoryOpen] = useState(false);
  const [mana, setMana] = useState({ W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 });
  const [manaOpen, setManaOpen] = useState(false);
  const [cmdDmgOpen, setCmdDmgOpen] = useState(false);
  const [lifeHistory, setLifeHistory] = useState(() => Object.fromEntries(initialPlayers.map(p => [p.id, [40]])));
  const rt = useRef(rtInstance);
  const playerOrder = initialPlayers.map(p => p.id);
  // Map pid → avatar for use in sub-components
  const avatarMap = Object.fromEntries(initialPlayers.map(p => [p.id, p.avatar || "🧙"]));
  const isMyTurn = !isSpectator && activePlayer === myId;
  const isTwoPlayer = playerOrder.length === 2;
  const addLog = useCallback(msg => {
    setTurnLog(tl => {
      const updated = [...tl];
      if (!updated.length) return [{ turn: 1, entries: [msg] }];
      updated[updated.length - 1] = {
        ...updated[updated.length - 1],
        entries: [...updated[updated.length - 1].entries, msg]
      };
      return updated;
    });
  }, []);

  useEffect(() => {
    if (!rt.current) return;
    rt.current.onMessage = (event, payload) => {
      if (event === "state_update") { setPlayers(ps => ({ ...ps, [payload.pid]: payload.state })); if (payload.log) addLog(payload.log); }
      if (event === "turn_change") { setActivePlayer(payload.ap); setPhase(payload.ph); setTurn(payload.t); addLog(payload.log); }
      if (event === "chat_msg") { setChatMessages(m => [...m, payload]); SFX.chat(); }
      if (event === "dice_roll") {
        setDiceResult(payload);
        addLog(`🎲 ${payload.playerName} tira d${payload.die}: ${payload.value}${payload.value === payload.die ? " 🎉" : payload.value === 1 ? " 💀" : ""}`);
        // Auto-hide after 4 seconds
        setTimeout(() => setDiceResult(null), 4000);
      }
    };
  }, [addLog]);

  // ── Voice Chat Init ──
  useEffect(() => {
    const vc = new VoiceChat(myId, rt.current);
    voiceRef.current = vc;

    vc.onSpeaking = (pid, isSpeaking) => setSpeaking(s => ({ ...s, [pid]: isSpeaking }));
    vc.onPeerJoin = (pid) => addLog(`🎙 ${players[pid]?.name || pid} conectado a voz.`);
    vc.onPeerLeave = (pid) => { setSpeaking(s => ({ ...s, [pid]: false })); addLog(`🎙 ${players[pid]?.name || pid} desconectado de voz.`); };

    // Handle WebRTC signals from Supabase
    const origOnMessage = rt.current?.onMessage;
    if (rt.current) {
      const prevOnMsg = rt.current.onMessage;
      rt.current.onMessage = (event, payload) => {
        if (event === "notification" && payload.from !== myId) {
          showNotification(payload.msg, payload.from);
        }
        if (event === "webrtc_signal" && payload.to === myId) {
          vc.handleSignal(payload.from, payload);
        }
        prevOnMsg?.(event, payload);
      };
    }

    return () => { vc.stop(); };
  }, []);

  const toggleVoice = async () => {
    const vc = voiceRef.current;
    if (!voiceEnabled) {
      const ok = await vc.start();
      if (!ok) { alert("No se pudo acceder al micrófono. Verifica los permisos del navegador."); return; }
      setVoiceEnabled(true);
      // Connect to all current players
      playerOrder.filter(pid => pid !== myId).forEach(pid => vc.connectToPeer(pid));
      addLog(`🎙 ${players[myId]?.name} activó el chat de voz.`);
    } else {
      vc.stop();
      await vc.start(); // restart for re-enabling
      setVoiceEnabled(false);
      setSpeaking({});
      addLog(`🎙 ${players[myId]?.name} desactivó el chat de voz.`);
    }
  };

  const toggleMute = () => {
    const vc = voiceRef.current;
    const newMuted = !muted;
    setMuted(newMuted);
    vc?.setMuted(newMuted);
  };

  const showNotification = (msg, from) => {
    const id = uid();
    setNotifications(n => [...n, { id, msg, from }]);
    setTimeout(() => setNotifications(n => n.filter(x => x.id !== id)), 4000);
  };

  const syncState = (state, logMsg) => {
    rt.current?.broadcast("state_update", { pid: myId, state, log: logMsg });
    if (roomCode) saveGameSession(roomCode, myId, { [myId]: state }, turn, phase, activePlayer);
    // Save full game snapshot to localStorage on every action
    try {
      const sess = JSON.parse(localStorage.getItem("commander_es_session") || "{}");
      const updatedPlayers = (sess.players || []).map(p => p.id === myId ? { ...p, playerState: state } : p);
      const snapshot = {
        ...sess,
        players: updatedPlayers,
        turn, phase, activePlayer,
        savedAt: Date.now(),
      };
      localStorage.setItem("commander_es_session", JSON.stringify(snapshot));
    } catch { }
  };
  const saveHistory = (ps) => setHistory(h => [...h.slice(-19), JSON.parse(JSON.stringify(ps))]);
  // Auto-open mulligan on game start
  useEffect(() => { setMulliganModal(true); }, []);

  // Reorder cards in a zone by dragging
  const reorderZone = (pid, zone, fromId, toId) => {
    if (fromId === toId) return;
    setPlayers(ps => {
      const p = ps[pid];
      const arr = zone === "hand" ? [...p.hand] : [...p.battlefield];
      const fromIdx = arr.findIndex(c => c.instanceId === fromId);
      const toIdx = arr.findIndex(c => c.instanceId === toId);
      if (fromIdx === -1 || toIdx === -1) return ps;
      const [moved] = arr.splice(fromIdx, 1);
      arr.splice(toIdx, 0, moved);
      const next = zone === "hand" ? { ...p, hand: arr } : { ...p, battlefield: arr };
      if (pid === myId) syncState(next);
      return { ...ps, [pid]: next };
    });
  };

  const pushUndo = (state) => setUndoStack(s => [...s.slice(-9), state]); // keep last 10

  const undoLastAction = () => {
    setUndoStack(s => {
      if (!s.length) return s;
      const prev = s[s.length - 1];
      setPlayers(ps => ({ ...ps, [myId]: prev }));
      syncState(prev);
      addLog("↩ Acción deshecha.");
      return s.slice(0, -1);
    });
  };

  const updMe = (fn, logMsg) => {
    setPlayers(ps => { saveHistory(ps); const next = fn({ ...ps[myId] }); syncState(next, logMsg); if (logMsg) addLog(logMsg); return { ...ps, [myId]: next }; });
  };
  const undo = () => {
    setHistory(h => {
      if (!h.length) return h;
      const prev = h[h.length - 1];
      setPlayers(prev);
      syncState(prev[myId], "↩ Deshacer.");
      addLog("↩ Acción deshecha."); SFX.undo();
      return h.slice(0, -1);
    });
  };

  // ── Library Actions ──
  const libActions = {
    draw: (pid, n = 1) => {
      setPlayers(ps => {
        const p = { ...ps[pid] };
        const drawn = p.library.slice(0, n).map(c => ({ ...c, instanceId: uid() }));
        const next = { ...p, library: p.library.slice(n), hand: [...p.hand, ...drawn] };
        if (pid === myId) { syncState(next, `${p.name} roba ${n} carta${n > 1 ? "s" : ""}.`); addLog(`${p.name} roba ${n} carta${n > 1 ? "s" : ""}.`); }
        return { ...ps, [pid]: next };
      });
    },
    mill: (pid, n = 1) => {
      setPlayers(ps => {
        const p = { ...ps[pid] };
        const milled = p.library.slice(0, n);
        const next = { ...p, library: p.library.slice(n), graveyard: [...milled, ...p.graveyard] };
        if (pid === myId) { syncState(next, `${p.name} hace mill de ${n} carta${n > 1 ? "s" : ""}.`); addLog(`${p.name} hace mill de ${n}.`); }
        return { ...ps, [pid]: next };
      });
    },
    viewTop: (pid, n = 1) => {
      const p = players[pid];
      setViewTopModal({ pid, cards: p.library.slice(0, n) });
    },
    scry: (pid, n = 1) => {
      const p = players[pid];
      setScryModal({ pid, cards: p.library.slice(0, n).map(c => ({ ...c, dest: "top" })), mode: "scry" });
    },
    surveil: (pid, n = 1) => {
      const p = players[pid];
      setScryModal({ pid, cards: p.library.slice(0, n).map(c => ({ ...c, dest: "top" })), mode: "surveil" });
    },
    shuffleLib: (pid) => {
      setPlayers(ps => {
        const p = ps[pid];
        const next = { ...p, library: shuffle([...p.library]) };
        if (pid === myId) { syncState(next, `${p.name} baraja su biblioteca.`); addLog(`${p.name} baraja su biblioteca.`); }
        return { ...ps, [pid]: next };
      });
    },
    searchLib: (pid) => setSearchLibModal(pid),
    exileTop: (pid, n = 1) => {
      setPlayers(ps => {
        const p = ps[pid];
        const exiled = p.library.slice(0, n);
        const next = { ...p, library: p.library.slice(n), exile: [...exiled, ...p.exile] };
        if (pid === myId) { syncState(next, `${p.name} exilia ${n} del tope.`); addLog(`${p.name} exilia ${n} del tope.`); }
        return { ...ps, [pid]: next };
      });
    },
    // Cascade (regla oficial):
    // Exilas cartas de arriba hacia abajo hasta encontrar una no-tierra con CMC menor
    // al hechizo que disparó Cascade. Puedes lanzarla sin pagar su coste.
    // Todas las exiladas (incluida la encontrada si no la lanzas) vuelven al fondo en orden aleatorio.
    cascade: (pid, triggerCmc = null) => {
      const p = players[pid];
      // Ask for the CMC of the spell that triggered Cascade if not provided
      let cmc = triggerCmc;
      if (cmc === null) {
        const input = prompt("¿Cuál es el coste de maná convertido (CMC) del hechizo que disparó Cascade?", "5");
        cmc = parseInt(input);
        if (isNaN(cmc) || cmc < 1) return;
      }
      const lib = [...p.library];
      const exiledDuringCascade = []; // all cards seen during cascade (go to bottom after)
      let foundIdx = -1;
      for (let i = 0; i < lib.length; i++) {
        const card = lib[i];
        const cardCmc = card.cmc ?? 0; // Scryfall provides cmc directly
        // Found: non-land with strictly less CMC than the cascade trigger
        if (!isLand(card) && cardCmc < cmc) { foundIdx = i; break; }
        exiledDuringCascade.push(card);
      }
      if (foundIdx === -1) {
        addLog(`${p.name}: Cascade no encontró carta no-tierra con CMC < ${cmc}. Las exiladas vuelven al fondo.`);
        setPlayers(ps => {
          const pp = ps[pid];
          const next = { ...pp, library: shuffle([...lib.slice(exiledDuringCascade.length), ...exiledDuringCascade]) };
          if (pid === myId) syncState(next);
          return { ...ps, [pid]: next };
        });
        return;
      }
      const found = lib[foundIdx];
      // Cards after found card stay in library; exiled cards (not found) return to bottom shuffled
      const restOfLibrary = lib.slice(foundIdx + 1);
      const returnToBottom = exiledDuringCascade; // these go to bottom whether or not we cast found
      addLog(`${p.name} usa Cascade (CMC<${cmc}) → encuentra ${getCardName(found)} (CMC ${found.cmc ?? "?"})`);
      // Temporarily remove all exiled cards + found from library
      setPlayers(ps => {
        const pp = ps[pid];
        const next = { ...pp, library: restOfLibrary };
        if (pid === myId) syncState(next, `${p.name} Cascade → encuentra ${getCardName(found)}`);
        return { ...ps, [pid]: next };
      });
      // Open modal: cast free or not — returnToBottom always go back to bottom
      setResolveModal({
        mode: "cascade",
        cards: [found],
        rest: returnToBottom, // returned to bottom of library regardless
        pid,
        label: `⚡ Cascade — CMC < ${cmc}`,
        extra: { cmc, returnToBottom }
      });
    },

    // Discover X: exile top X, pick one to play free, rest to bottom
    discover: (pid, n = 4) => {
      const p = players[pid];
      const cards = p.library.slice(0, n);
      const rest = p.library.slice(n);
      setPlayers(ps => { const next = { ...ps[pid], library: rest }; if (pid === myId) syncState(next); return { ...ps, [pid]: next }; });
      setResolveModal({ mode: "discover", cards, rest: [], pid, label: `🔭 Discover ${n}` });
    },

    // Impulse: exile top X, play one this turn, rest exiled
    impulse: (pid, n = 4) => {
      const p = players[pid];
      const cards = p.library.slice(0, n);
      const rest = p.library.slice(n);
      setPlayers(ps => { const next = { ...ps[pid], library: rest }; if (pid === myId) syncState(next); return { ...ps, [pid]: next }; });
      setResolveModal({ mode: "impulse", cards, rest: [], pid, label: `💨 Impulse ${n}` });
    },

    // Phenomenon / Foretell: exile top 2 face-down, cast later
    foretell: (pid) => {
      const p = players[pid];
      if (!p.library.length) return;
      const card = { ...p.library[0], foretold: true };
      setPlayers(ps => {
        const pp = ps[pid];
        const next = { ...pp, library: pp.library.slice(1), exile: [card, ...pp.exile] };
        if (pid === myId) { syncState(next, `${pp.name} usa Foretell: exilia ${getCardName(card)} boca abajo.`); addLog(`${pp.name} Foretell → ${getCardName(card)}`); }
        return { ...ps, [pid]: next };
      });
    },

    // Suspend: exile with time counters
    suspend: (pid) => {
      const p = players[pid];
      const x = parseInt(prompt("¿Cuántos contadores de tiempo (Suspend)?", "3"));
      if (!x || x < 1) return;
      setResolveModal({ mode: "suspend", cards: p.library.slice(0, 5), rest: p.library.slice(5), pid, label: `⏳ Suspend (${x} contadores)`, extra: { timeCounters: x } });
    },

    // Connive: draw then discard
    connive: (pid, n = 1) => {
      const p = players[pid];
      const drawn = p.library.slice(0, n).map(c => ({ ...c, instanceId: uid() }));
      const newLib = p.library.slice(n);
      const newHand = [...p.hand, ...drawn];
      setPlayers(ps => { const next = { ...ps[pid], library: newLib, hand: newHand }; if (pid === myId) syncState(next); return { ...ps, [pid]: next }; });
      setResolveModal({ mode: "connive", cards: newHand, rest: [], pid, label: `🎴 Connive / Descartar (${n} robadas)`, extra: { mustDiscard: n } });
    },

    // Cycling: draw 1, discard this card
    cycling: (pid, card) => {
      libActions.draw(pid, 1);
      addLog(`${players[pid]?.name} cicla ${getCardName(card)}.`);
    },

    // Dredge: return from graveyard to hand, mill N
    dredge: (pid, n = 3) => {
      setResolveModal({ mode: "dredge", cards: players[pid]?.graveyard || [], rest: [], pid, label: `🌿 Dredge (mill ${n})`, extra: { millN: n } });
    },

    // Miracle: reveal top, if matches, cast for miracle cost
    miracle: (pid) => {
      const p = players[pid];
      if (!p.library.length) return;
      const top = p.library[0];
      setViewTopModal({ pid, cards: [top], label: "✨ Miracle — carta revelada" });
      addLog(`${p.name} revela ${getCardName(top)} (Miracle)`);
    },
    topToBottom: (pid, n = 1) => {
      setPlayers(ps => {
        const p = ps[pid];
        const top = p.library.slice(0, n);
        const rest = p.library.slice(n);
        const next = { ...p, library: [...rest, ...top] };
        if (pid === myId) { syncState(next, `${p.name} mueve ${n} carta(s) al fondo.`); addLog(`${p.name} mueve ${n} al fondo.`); }
        return { ...ps, [pid]: next };
      });
    },
    bottomToTop: (pid) => {
      setPlayers(ps => {
        const p = ps[pid];
        if (!p.library.length) return ps;
        const bottom = p.library[p.library.length - 1];
        const next = { ...p, library: [bottom, ...p.library.slice(0, -1)] };
        if (pid === myId) { syncState(next, `${p.name} mueve el fondo arriba.`); addLog(`${p.name} fondo → arriba.`); }
        return { ...ps, [pid]: next };
      });
    },
    revealUntilLand: (pid) => {
      setPlayers(ps => {
        const p = ps[pid];
        const lib = [...p.library];
        const revealed = [];
        let landIdx = -1;
        for (let i = 0; i < lib.length; i++) {
          revealed.push(lib[i]);
          if (isLand(lib[i])) { landIdx = i; break; }
        }
        if (landIdx === -1) { addLog(`${p.name}: no hay tierras en biblioteca.`); return ps; }
        const land = lib[landIdx];
        const rest = lib.filter((_, i) => i !== landIdx);
        const next = { ...p, library: rest, hand: [...p.hand, { ...land, instanceId: uid() }], graveyard: [...revealed.slice(0, landIdx), ...p.graveyard] };
        if (pid === myId) { syncState(next, `${p.name} revela hasta tierra: ${getCardName(land)}.`); addLog(`${p.name} revela hasta ${getCardName(land)}.`); }
        return { ...ps, [pid]: next };
      });
    },
    reanimateToHand: (pid) => setSearchLibModal({ pid, zone: "graveyard", dest: "hand" }),
    reanimateToBattlefield: (pid) => setSearchLibModal({ pid, zone: "graveyard", dest: "battlefield" }),
    handToLib: (pid) => {
      setPlayers(ps => {
        const p = ps[pid];
        const next = { ...p, library: shuffle([...p.library, ...p.hand]), hand: [] };
        if (pid === myId) { syncState(next, `${p.name} baraja la mano a la biblioteca.`); addLog(`${p.name} baraja mano a biblioteca.`); }
        return { ...ps, [pid]: next };
      });
    },
  };

  // ── Resolve Modal handler ──
  const resolveModalAction = (mode, action, selectedId, selectedSet, modal) => {
    const { pid, cards, extra } = modal;
    const p = players[pid];

    if (mode === "cascade") {
      const chosen = cards[0]; // only one card in cascade
      if (!chosen) return;
      const returnToBottom = extra?.returnToBottom || [];
      setPlayers(ps => {
        const pp = ps[pid];
        let next;
        if (action === "play") {
          // Cast for free → goes to battlefield (permanents) or graveyard after resolving (we simulate as battlefield)
          next = {
            ...pp,
            battlefield: [...pp.battlefield, { ...chosen, tapped: false, counters: [] }],
            library: [...pp.library, ...shuffle(returnToBottom)], // exiled cards return to bottom shuffled
          };
        } else {
          // Don't cast → chosen card also returns to bottom with the rest
          next = {
            ...pp,
            library: [...pp.library, ...shuffle([...returnToBottom, chosen])],
          };
        }
        if (pid === myId) { syncState(next, `${pp.name} Cascade: ${action === "play" ? "lanza" : "no lanza"} ${getCardName(chosen)}. ${returnToBottom.length} cartas vuelven al fondo.`); addLog(`${pp.name} Cascade → ${action === "play" ? "lanza" : "pasa"} ${getCardName(chosen)}`); }
        return { ...ps, [pid]: next };
      });
    }

    else if (mode === "discover") {
      const chosen = cards.find(c => c.instanceId === selectedId);
      const unchosen = cards.filter(c => c.instanceId !== selectedId);
      if (!chosen) return;
      setPlayers(ps => {
        const pp = ps[pid];
        let next;
        if (action === "play") {
          next = { ...pp, battlefield: [...pp.battlefield, { ...chosen, tapped: false, counters: [], abilities: cardAbilitiesFromKeywords(chosen) }], library: [...pp.library, ...unchosen] };
        } else {
          next = { ...pp, hand: [...pp.hand, chosen], library: [...pp.library, ...unchosen] };
        }
        if (pid === myId) { syncState(next, `${pp.name} Discover: ${action} ${getCardName(chosen)}.`); addLog(`${pp.name} Discover → ${getCardName(chosen)}`); }
        return { ...ps, [pid]: next };
      });
    }

    else if (mode === "impulse") {
      const chosen = cards.find(c => c.instanceId === selectedId);
      const unchosen = cards.filter(c => c.instanceId !== selectedId);
      if (!chosen) return;
      setPlayers(ps => {
        const pp = ps[pid];
        // Chosen: to hand (play this turn); unchosen: to exile
        const next = { ...pp, hand: [...pp.hand, chosen], exile: [...unchosen, ...pp.exile] };
        if (pid === myId) { syncState(next, `${pp.name} usa Impulse → ${getCardName(chosen)}.`); addLog(`${pp.name} Impulse → ${getCardName(chosen)}`); }
        return { ...ps, [pid]: next };
      });
    }

    else if (mode === "suspend") {
      const chosen = cards.find(c => c.instanceId === selectedId);
      if (!chosen) return;
      const suspended = { ...chosen, suspended: true, counters: Array(extra?.timeCounters || 3).fill("time") };
      setPlayers(ps => {
        const pp = ps[pid];
        const next = { ...pp, exile: [suspended, ...pp.exile] };
        if (pid === myId) { syncState(next, `${pp.name} suspende ${getCardName(chosen)} (${extra?.timeCounters} contadores).`); addLog(`${pp.name} Suspend → ${getCardName(chosen)}`); }
        return { ...ps, [pid]: next };
      });
    }

    else if (mode === "connive") {
      // Discard selected, +1/+1 counters on creature for each discarded
      const toDiscard = cards.filter(c => selectedSet.has(c.instanceId));
      const kept = cards.filter(c => !selectedSet.has(c.instanceId));
      setPlayers(ps => {
        const pp = ps[pid];
        const next = { ...pp, hand: kept, graveyard: [...toDiscard, ...pp.graveyard] };
        if (pid === myId) { syncState(next, `${pp.name} usa Connive, descarta ${toDiscard.length}.`); addLog(`${pp.name} Connive → descarta ${toDiscard.length}`); }
        return { ...ps, [pid]: next };
      });
    }

    else if (mode === "dredge") {
      const chosen = cards.find(c => c.instanceId === selectedId);
      if (!chosen) return;
      setPlayers(ps => {
        const pp = ps[pid];
        const newGrave = pp.graveyard.filter(c => c.instanceId !== chosen.instanceId);
        const milled = pp.library.slice(0, extra?.millN || 3);
        const newLib = pp.library.slice(extra?.millN || 3);
        const next = { ...pp, graveyard: [...milled, ...newGrave], library: newLib, hand: [...pp.hand, chosen] };
        if (pid === myId) { syncState(next, `${pp.name} usa Dredge → ${getCardName(chosen)}, mill ${milled.length}.`); addLog(`${pp.name} Dredge → ${getCardName(chosen)}`); }
        return { ...ps, [pid]: next };
      });
    }

    setResolveModal(null);
  };

  const resolveScry = (results) => {
    const { pid, mode } = scryModal;
    const p = players[pid];
    const toTop = results.filter(c => c.dest === "top");
    const toBottom = results.filter(c => c.dest === "bottom");
    const toGrave = results.filter(c => c.dest === "graveyard");
    const usedIds = new Set(results.map(c => c.instanceId));
    const restLib = p.library.filter(c => !usedIds.has(c.instanceId));
    const next = { ...p, library: [...toTop, ...restLib, ...toBottom], graveyard: [...toGrave, ...p.graveyard] };
    setPlayers(ps => { syncState(next, `${p.name} usa ${mode}.`); addLog(`${p.name} usa ${mode}.`); return { ...ps, [pid]: next }; });
    setScryModal(null);
  };

  const resolveSearchLib = (card) => {
    const modal = searchLibModal;
    const pid = typeof modal === "string" ? modal : modal.pid;
    const zone = typeof modal === "string" ? "library" : (modal.zone || "library");
    const dest = typeof modal === "string" ? "hand" : (modal.dest || "hand");
    const p = players[pid];
    let next;
    if (zone === "library") {
      const newLib = shuffle(p.library.filter(c => c.instanceId !== card.instanceId));
      if (dest === "hand") next = { ...p, library: newLib, hand: [...p.hand, card] };
      else next = { ...p, library: newLib, battlefield: [...p.battlefield, { ...card, tapped: false, counters: [] }] };
    } else {
      // graveyard
      const newGrave = p.graveyard.filter(c => c.instanceId !== card.instanceId);
      if (dest === "hand") next = { ...p, graveyard: newGrave, hand: [...p.hand, card] };
      else next = { ...p, graveyard: newGrave, battlefield: [...p.battlefield, { ...card, tapped: false, counters: [] }] };
    }
    const logMsg = `${p.name} ${zone === "graveyard" ? "reanima" : "busca"} ${getCardName(card)}${dest === "battlefield" ? " al campo." : " a la mano."}`;
    setPlayers(ps => { syncState(next, logMsg); addLog(logMsg); return { ...ps, [pid]: next }; });
    setSearchLibModal(null);
  };

  // ── Mulligan Actions ──
  const startMulligan = () => setMulliganModal(true);

  const doMulligan = () => {
    // London mulligan: return all to library, shuffle, draw 7 again
    setPlayers(ps => {
      const p = ps[myId];
      const allCards = [...p.hand, ...p.library];
      const newLib = shuffle(allCards);
      const newHand = newLib.slice(0, 7).map(c => ({ ...c, instanceId: uid() }));
      const next = { ...p, library: newLib.slice(7), hand: newHand };
      syncState(next);
      return { ...ps, [myId]: next };
    });
    setMulliganCount(n => n + 1);
    addLog(`${players[myId]?.name} hace mulligan #${mulliganCount + 1}.`);
  };

  const keepHand = (putBackIds) => {
    // Put selected cards to bottom of library
    setPlayers(ps => {
      const p = ps[myId];
      const putBack = p.hand.filter(c => putBackIds.includes(c.instanceId));
      const keep = p.hand.filter(c => !putBackIds.includes(c.instanceId));
      const next = { ...p, hand: keep, library: [...p.library, ...putBack] };
      syncState(next, `${p.name} guarda mano${putBack.length > 0 ? ` (pone ${putBack.length} al fondo)` : ""}.`);
      addLog(`${p.name} guarda mano de ${keep.length} cartas.`);
      return { ...ps, [myId]: next };
    });
    setMulliganModal(false);
    setMulliganCount(0);
  };

  // ── Card Actions ──
  const tapCard = (iid) => updMe(p => ({ ...p, battlefield: p.battlefield.map(c => c.instanceId === iid ? { ...c, tapped: !c.tapped } : c) }));
  const untapAll = () => updMe(p => ({ ...p, battlefield: p.battlefield.map(c => ({ ...c, tapped: false })) }), `${players[myId]?.name} destapa todo.`);
  const playCard = (card, from) => {
    const autoAbilities = cardAbilitiesFromKeywords(card);
    updMe(p => ({
      ...p,
      [from]: p[from].filter(c => c.instanceId !== card.instanceId),
      battlefield: [...p.battlefield, { ...card, tapped: false, counters: [], abilities: autoAbilities }]
    }), `${players[myId]?.name} juega ${getCardName(card)}.`);
    setSelCard(null); setCtxMenu(null);
  };
  const moveCard = (card, from, to) => {
    if (from === "battlefield") {
      setRow2Cards(s => { const n = new Set(s); n.delete(card.instanceId); return n; });
      setRow3Cards(s => { const n = new Set(s); n.delete(card.instanceId); return n; });
    }
    updMe(p => ({ ...p, [from]: p[from].filter(c => c.instanceId !== card.instanceId), [to]: to === "library_top" ? [card, ...p.library] : to === "library_bottom" ? [...p.library, card] : to === "hand" ? [...p.hand, card] : [card, ...p[to]] }), `${players[myId]?.name}: ${getCardName(card)} → ${to === "graveyard" ? "cementerio" : to === "exile" ? "exilio" : to === "hand" ? "mano" : "biblioteca"}.`);
    setCtxMenu(null);
  };
  const playCommander = () => {
    updMe(p => {
      if (!p.commandZone.length) return p;
      const [c, ...r] = p.commandZone;
      const autoAbilities = cardAbilitiesFromKeywords(c);
      // Fetch token suggestions for this commander
      const cmdName = c.printed_name || c.name;
      if (cmdName) {
        fetch(`https://api.scryfall.com/cards/search?q=t:token+related:!"${encodeURIComponent(cmdName)}"&unique=cards`)
          .then(r => r.ok ? r.json() : null)
          .then(d => { if (d?.data?.length) setCmdTokenSuggestions(d.data.slice(0, 6)); })
          .catch(() => { });
      }
      return { ...p, commandZone: r, battlefield: [...p.battlefield, { ...c, tapped: false, counters: [], abilities: autoAbilities }] };
    }, `${players[myId]?.name} invoca a su Comandante!`);
  };
  const returnCmdToZone = (card, from, incrementTax = false) => updMe(p => ({
    ...p,
    [from]: p[from].filter(c => c.instanceId !== card.instanceId),
    commandZone: [...p.commandZone, { ...card, instanceId: uid() }],
    commanderTax: incrementTax ? p.commanderTax + 2 : p.commanderTax,
  }), `${players[myId]?.name} regresa Comandante a la zona de mando.${incrementTax ? " (+2 impuesto)" : ""}`);
  const addCounter = (iid, type) => updMe(p => ({ ...p, battlefield: p.battlefield.map(c => c.instanceId === iid ? { ...c, counters: [...(c.counters || []), type] } : c) }));
  const removeCounter = (iid, type) => updMe(p => ({ ...p, battlefield: p.battlefield.map(c => c.instanceId === iid ? { ...c, counters: (c.counters || []).filter((x, i, a) => { const idx = a.indexOf(type); return i !== idx; }) } : c) }));
  const setCounters = (iid, newCounters) => updMe(p => ({ ...p, battlefield: p.battlefield.map(c => c.instanceId === iid ? { ...c, counters: newCounters } : c) }));
  const createToken = (name, power, toughness, color, qty = 1, imageUrl = null) => {
    SFX.token();
    const tokens = Array.from({ length: qty }, () => ({
      instanceId: uid(), name, printed_name: name,
      image_url: imageUrl,  // real card image if searched from Scryfall
      type_line: "Token Creature", power, toughness, counters: [], tapped: false,
      isToken: !imageUrl,   // if has real image, render normally; else use token style
      tokenColor: color,
    }));
    updMe(p => ({ ...p, battlefield: [...p.battlefield, ...tokens] }), `${players[myId]?.name} crea ${qty}× token ${name}${power ? ` ${power}/${toughness}` : ""}.`);
    setTokenModal(false);
  };
  const sendChatMessage = () => {
    if (!chatInput.trim()) return;
    const msg = { sender: players[myId]?.name || "Tú", text: chatInput.trim(), time: new Date().toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" }) };
    setChatMessages(m => [...m, msg]);
    rt.current?.broadcast("chat_msg", msg);
    setChatInput(""); SFX.chat();
  };
  const adjLife = (pid, d) => {
    setPlayers(ps => {
      const next = { ...ps[pid], life: ps[pid].life + d };
      if (pid === myId) { syncState(next, `${ps[pid].name}: vida ${ps[pid].life}→${next.life}`); addLog(`${ps[pid].name}: vida ${ps[pid].life}→${next.life}`); }
      return { ...ps, [pid]: next };
    });
  };
  const adjPoison = (pid, d) => { setPlayers(ps => { const next = { ...ps[pid], poison: Math.max(0, ps[pid].poison + d) }; if (pid === myId) syncState(next); return { ...ps, [pid]: next }; }); };
  const adjEnergy = (pid, d) => { setPlayers(ps => { const next = { ...ps[pid], energy: Math.max(0, (ps[pid].energy || 0) + d) }; if (pid === myId) syncState(next); return { ...ps, [pid]: next }; }); };
  const adjExperience = (pid, d) => { setPlayers(ps => { const next = { ...ps[pid], experience: Math.max(0, (ps[pid].experience || 0) + d) }; if (pid === myId) syncState(next); return { ...ps, [pid]: next }; }); };
  const adjCmdDmg = (fromPid, toPid, d) => {
    setPlayers(ps => {
      const p = ps[toPid]; const cur = p.commanderDamage[fromPid] || 0; const next = { ...p, commanderDamage: { ...p.commanderDamage, [fromPid]: Math.max(0, cur + d) } };
      if (toPid === myId) { syncState(next); }
      return { ...ps, [toPid]: next };
    });
  };

  const nextPhase = () => {
    if (phase >= PHASES.length - 1) {
      const idx = playerOrder.indexOf(activePlayer); const nextId = playerOrder[(idx + 1) % playerOrder.length]; const newTurn = turn + 1;
      const msg = `─── Turno ${newTurn}: ${players[nextId]?.name || nextId} ───`;
      setActivePlayer(nextId); setPhase(0); setTurn(newTurn); addLog(msg);
      setTurnLog(tl => [...tl, { turn: newTurn, entries: [msg] }]);
      rt.current?.broadcast("turn_change", { ap: nextId, ph: 0, t: newTurn, log: msg });
      // Save turn change to localStorage
      try {
        const sess = JSON.parse(localStorage.getItem("commander_es_session") || "{}");
        localStorage.setItem("commander_es_session", JSON.stringify({ ...sess, turn: newTurn, phase: 0, activePlayer: nextId, savedAt: Date.now() }));
      } catch { }
      if (nextId === myId) { untapAll(); }
    } else {
      const np = phase + 1; setPhase(np); const msg = `Fase: ${PHASES[np]}`; addLog(msg);
      if (phase === 3) { setAttackers(new Set()); } // clear attackers after combat
      rt.current?.broadcast("turn_change", { ap: activePlayer, ph: np, t: turn, log: msg });
      // Auto-draw when entering Robo phase (index 1) on my turn
      if (np === 1 && activePlayer === myId) { setTimeout(() => libActions.draw(myId, 1), 100); }
    }
  };

  // ── Context menu for cards ──
  const cardCtxItems = (pid, card, zone, isMe) => {
    if (!isMe) return [];
    const isCmd = isLegendary(card) && zone !== "commandZone";
    return [
      zone !== "battlefield" && { label: "▶ Jugar en campo", action: () => playCard(card, zone) },
      zone === "battlefield" && { label: card.tapped ? "↺ Desgirar" : "↻ Girar", action: () => tapCard(card.instanceId) },
      "---",
      zone !== "hand" && { label: "🤚 A la mano", action: () => moveCard(card, zone, "hand") },
      zone !== "graveyard" && { label: "🪦 Al cementerio", action: () => moveCard(card, zone, "graveyard") },
      zone !== "exile" && { label: "✨ Exiliar", action: () => moveCard(card, zone, "exile") },
      { label: "📚 A biblioteca (arriba)", action: () => moveCard(card, zone, "library_top") },
      { label: "📚 A biblioteca (abajo)", action: () => moveCard(card, zone, "library_bottom") },
      isCmd && { label: "⚔ A zona de mando", action: () => returnCmdToZone(card, zone, true), color: "#ffd700" },
      "---",
      zone === "battlefield" && { label: "🎯 Gestionar contadores...", action: () => { setCtxMenu(null); setCounterModal(card.instanceId); } },
      zone === "battlefield" && {
        label: "✨ Habilidades...",
        submenu: ABILITIES.map(ab => ({
          label: `${ab.icon} ${ab.name}${(card.abilities || []).includes(ab.key) ? " ✓" : ""}`,
          color: (card.abilities || []).includes(ab.key) ? ab.text : "#e8e0d0",
          action: () => {
            const hasIt = (card.abilities || []).includes(ab.key);
            updMe(p => ({
              ...p,
              battlefield: p.battlefield.map(c => c.instanceId === card.instanceId
                ? { ...c, abilities: hasIt ? (c.abilities || []).filter(a => a !== ab.key) : [...(c.abilities || []), ab.key] }
                : c)
            }), `${players[myId]?.name}: ${hasIt ? "quita" : "asigna"} ${ab.name} a ${getCardName(card)}.`);
          }
        }))
      },
      zone === "battlefield" && phase === 3 && isMyTurn && !card.tapped && {
        label: attackers.has(card.instanceId) ? "❌ Quitar de ataque" : "⚔ Declarar atacante",
        action: () => setAttackers(a => {
          const n = new Set(a);
          if (n.has(card.instanceId)) n.delete(card.instanceId);
          else { n.add(card.instanceId); tapCard(card.instanceId); }
          addLog(`${players[myId]?.name}: ${n.has(card.instanceId) ? "declara atacante" : "retira del ataque"} ${getCardName(card)}.`);
          return n;
        }),
        color: attackers.has(card.instanceId) ? "#ff8888" : "#ffaa44"
      },
    ].filter(Boolean);
  };

  const openCardCtx = (e, pid, card, zone, isMe) => {
    e.preventDefault(); e.stopPropagation();
    const items = cardCtxItems(pid, card, zone, isMe);
    if (!items.length) return;
    setCtxMenu({ x: e.clientX, y: e.clientY, items, title: getCardName(card) });
  };

  // ── Player panel ──
  const others = initialPlayers.filter(p => p.id !== myId);

  // Position slots: up to 3 opponents arranged top-left, top-center, top-right
  const getOpponentStyle = (idx, total) => {
    // total 1: center top; 2: left+right top; 3: left+center+right
    const positions = {
      1: ["top-center"],
      2: ["top-left", "top-right"],
      3: ["top-left", "top-center", "top-right"],
    };
    return (positions[total] || ["top-center"])[idx];
  };

  const renderZoneBar = (p, isMe) => (
    <div style={{ display: "flex", gap: 4, alignItems: "flex-start", overflowX: "auto", paddingBottom: 2 }}>
      {/* Fixed Commander slot — always visible */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, flexShrink: 0 }}>
        <div style={{ fontSize: 8, color: "#ffd700", letterSpacing: 1, textAlign: "center" }}>COMANDANTE</div>
        {p.commandZone.length > 0
          ? p.commandZone.map(c => (
            <div key={c.instanceId} onContextMenu={e => openCardCtx(e, p.id, c, "commandZone", isMe)} style={{ position: "relative" }}>
              <CardTile card={c} small onClick={isMe ? playCommander : undefined} onHover={(card, x, y) => setHover({ card, x, y })} onHoverEnd={() => setHover(null)} />
              {p.commanderTax > 0 && (
                <div style={{ position: "absolute", top: -6, right: -6, background: "#8b0000", color: "#ffcccc", borderRadius: "50%", width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 800, border: "1px solid #ff4444" }}>
                  +{p.commanderTax}
                </div>
              )}
            </div>
          ))
          : p.commanderCard
            ? <div onContextMenu={e => { if (!isMe) return; e.preventDefault(); e.stopPropagation(); setCtxMenu({ x: e.clientX, y: e.clientY, title: "Comandante ausente", items: [{ label: "↩ Devolver a zona de mando", action: () => { /* can't — not on battlefield */ } }] }); }}
              style={{ width: 52, height: 73, borderRadius: 5, border: "2px dashed #ffd70066", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 2 }}>
              <div style={{ fontSize: 14 }}>⚔</div>
              <div style={{ fontSize: 7, color: "#ffd70066", textAlign: "center", padding: "0 4px" }}>En juego</div>
              {p.commanderTax > 0 && <div style={{ fontSize: 8, color: "#ff8844", fontWeight: 800 }}>+{p.commanderTax}</div>}
            </div>
            : <div style={{ width: 52, height: 73, borderRadius: 5, border: "2px dashed #2a2a4a", display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ fontSize: 8, color: "#333" }}>—</div></div>
        }
      </div>

      {/* Library */}
      <div style={{ position: "relative" }}>
        <div
          onClick={isMe ? () => libActions.draw(p.id, 1) : undefined}
          onContextMenu={e => { if (!isMe) return; e.preventDefault(); e.stopPropagation(); setCtxMenu({ x: e.clientX, y: e.clientY, title: `Biblioteca (${p.library.length})`, items: libraryMenu(p, p.id, isMe, libActions) }); }}
          style={{ width: 52, height: 73, borderRadius: 5, overflow: "hidden", border: "2px solid #3a5a8a", cursor: isMe ? "pointer" : "default", position: "relative", flexShrink: 0 }}>
          <div style={{ width: "100%", height: "100%", background: "linear-gradient(160deg,#1a2a4a,#0d1a2e,#1a0a2a)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
            <div style={{ position: "absolute", inset: 3, border: "1px solid #3a4a6a", borderRadius: 3 }} />
            <div style={{ fontSize: 16, opacity: 0.5 }}>🌟</div>
          </div>
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, textAlign: "center", fontSize: 10, color: "#fff", fontWeight: 800, background: "#000b", padding: "2px 0" }}>{p.library.length}</div>
        </div>
        {isMe && <div style={{ position: "absolute", bottom: -14, left: 0, right: 0, fontSize: 8, color: "#8888aa", textAlign: "center" }}>Biblioteca</div>}
      </div>

      {/* Graveyard */}
      <div style={{ position: "relative" }} onClick={() => setShowZone({ pid: p.id, zone: "graveyard" })}>
        {p.graveyard.length > 0
          ? <CardTile card={p.graveyard[0]} small onClick={() => setShowZone({ pid: p.id, zone: "graveyard" })} onHover={(c, x, y) => setHover({ card: c, x, y })} onHoverEnd={() => setHover(null)} />
          : <div style={{ width: 52, height: 73, borderRadius: 5, border: "2px dashed #3a3a5a", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 2, cursor: "pointer" }}><div style={{ fontSize: 14 }}>🪦</div><div style={{ fontSize: 9, color: "#555" }}>0</div></div>}
        <div style={{ position: "absolute", top: -10, left: 0, right: 0, textAlign: "center", fontSize: 8, color: "#8888aa" }}>🪦 {p.graveyard.length}</div>
      </div>

      {/* Exile */}
      <div style={{ position: "relative" }} onClick={() => setShowZone({ pid: p.id, zone: "exile" })}>
        {p.exile.length > 0
          ? <CardTile card={p.exile[0]} small onClick={() => setShowZone({ pid: p.id, zone: "exile" })} onHover={(c, x, y) => setHover({ card: c, x, y })} onHoverEnd={() => setHover(null)} />
          : <div style={{ width: 52, height: 73, borderRadius: 5, border: "2px dashed #3a3a5a", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 2, cursor: "pointer" }}><div style={{ fontSize: 14 }}>✨</div><div style={{ fontSize: 9, color: "#555" }}>0</div></div>}
        <div style={{ position: "absolute", top: -10, left: 0, right: 0, textAlign: "center", fontSize: 8, color: "#8888aa" }}>✨ {p.exile.length}</div>
      </div>
    </div>
  );

  const scrollRef1 = useRef(null);
  const scrollRef2 = useRef(null);
  const scrollRef3 = useRef(null);
  const scrollRefLands = useRef(null);
  const renderPlayerPanel = (pid, isMe) => {
    const p = players[pid]; if (!p) return null;
    const isActive = pid === activePlayer;

    return (
      <div style={{
        display: "flex", flexDirection: "column", height: "100%",
        border: isActive ? "2px solid #ffd700" : "1px solid #2a2a4a",
        borderRadius: 10, overflow: "hidden", background: "#080810",
      }}>
        {/* Header bar */}
        <div style={{ padding: "2px 6px", display: "flex", alignItems: "center", gap: 4, background: isActive ? "#1a140a" : "#0d0d18", borderBottom: "1px solid #2a2a4a", flexShrink: 0, flexWrap: "nowrap", minHeight: 24 }}>
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: isActive ? "#ffd700" : "#333", flexShrink: 0 }} />
          <span title={p.name} style={{ fontSize: 13, flexShrink: 0 }}>{avatarMap[pid] || "🧙"}</span>
          <span title={p.name} style={{ fontWeight: 700, fontSize: 10, color: isActive ? "#ffd700" : "#e8e0d0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 70 }}>{p.name}{isMe ? " (tú)" : ""}</span>

          {/* Life */}
          <div title="Vida" style={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0, background: "#0d0a0a", borderRadius: 4, padding: "0 3px" }}>
            {isMe && <button title="Reducir vida" onClick={() => adjLife(pid, -1)} style={mbtn("#4a1a1a", "#ff8888")}>−</button>}
            <span style={{ fontSize: 7, color: "#ff6666", lineHeight: 1 }}>❤</span>
            <span title={`Vida: ${p.life}`} style={{ fontSize: 12, fontWeight: 800, color: p.life <= 10 ? "#ff4444" : p.life >= 50 ? "#44ff88" : "#e8e0d0", minWidth: 20, textAlign: "center" }}>{p.life}</span>
            {isMe && <button title="Aumentar vida" onClick={() => adjLife(pid, 1)} style={mbtn("#1a4a1a", "#88ff88")}>+</button>}
          </div>

          {/* Poison */}
          {(isMe || p.poison > 0) && (
            <div title="Veneno (10 = eliminado)" style={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0, background: "#0d0a14", borderRadius: 4, padding: "0 3px" }}>
              {isMe && <button title="Reducir veneno" onClick={() => adjPoison(pid, -1)} style={mbtn("#3a1a3a", "#ff88ff")}>−</button>}
              <span style={{ fontSize: 7, color: "#cc88ff", lineHeight: 1 }}>☠</span>
              <span title={`Veneno: ${p.poison}`} style={{ fontSize: 9, fontWeight: 700, color: p.poison >= 10 ? "#ff44ff" : p.poison > 0 ? "#cc88ff" : "#888", minWidth: 12, textAlign: "center" }}>{p.poison}</span>
              {isMe && <button title="Agregar veneno" onClick={() => adjPoison(pid, 1)} style={mbtn("#1a1a4a", "#88aaff")}>+</button>}
            </div>
          )}
          {/* Energy */}
          {(isMe || (p.energy || 0) > 0) && (
            <div title="Energía" style={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0, background: "#0a1a20", borderRadius: 4, padding: "0 3px" }}>
              {isMe && <button title="Reducir energía" onClick={() => adjEnergy(pid, -1)} style={mbtn("#0a2030", "#44ccff")}>−</button>}
              <span style={{ fontSize: 7, color: "#44ccff", lineHeight: 1 }}>⚡</span>
              <span title={`Energía: ${p.energy || 0}`} style={{ fontSize: 9, fontWeight: 700, color: (p.energy || 0) > 0 ? "#44ccff" : "#888", minWidth: 12, textAlign: "center" }}>{p.energy || 0}</span>
              {isMe && <button title="Agregar energía" onClick={() => adjEnergy(pid, 1)} style={mbtn("#0a2030", "#44ccff")}>+</button>}
            </div>
          )}
          {/* Experience */}
          {(isMe || (p.experience || 0) > 0) && (
            <div title="Experiencia" style={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0, background: "#140a20", borderRadius: 4, padding: "0 3px" }}>
              {isMe && <button title="Reducir experiencia" onClick={() => adjExperience(pid, -1)} style={mbtn("#1a0a30", "#cc88ff")}>−</button>}
              <span style={{ fontSize: 7, color: "#cc88ff", lineHeight: 1 }}>✨</span>
              <span title={`Experiencia: ${p.experience || 0}`} style={{ fontSize: 9, fontWeight: 700, color: (p.experience || 0) > 0 ? "#cc88ff" : "#888", minWidth: 12, textAlign: "center" }}>{p.experience || 0}</span>
              {isMe && <button title="Agregar experiencia" onClick={() => adjExperience(pid, 1)} style={mbtn("#1a0a30", "#cc88ff")}>+</button>}
            </div>
          )}

          {/* Commander damage */}
          {Object.entries(p.commanderDamage).filter(([, v]) => v > 0).map(([fromPid, dmg]) => (
            <span key={fromPid} title={`Daño de comandante de ${players[fromPid]?.name || "oponente"}: ${dmg}`} style={{ fontSize: 8, color: "#ff8844", background: "#2a1a0a", borderRadius: 3, padding: "0 3px", flexShrink: 0 }}>
              ⚔{dmg}
            </span>
          ))}

          {speaking[pid] && <span title="Hablando por voz" style={{ fontSize: 10, color: "#44ff88", animation: "pulse 0.5s infinite", flexShrink: 0 }}>🎙</span>}
          {p.experience > 0 && <span style={{ fontSize: 9, color: "#ddaaff", background: "#1a0a3a", borderRadius: 4, padding: "0 4px", flexShrink: 0 }}>✨{p.experience}</span>}
          <span style={{ fontSize: 9, color: "#8888aa", marginLeft: "auto", flexShrink: 0 }}>🤚{p.hand.length}</span>
        </div>

        {/* Body: battlefield + bottom bar — reversed for opponents */}
        <div style={{ flex: 1, display: "flex", flexDirection: isMe ? "column" : "column-reverse", minHeight: 0, overflow: "hidden" }}>
          {/* Battlefield: split permanents (top) and lands (bottom) */}
          {(() => {
            const permanents = p.battlefield.filter(c => !isLand(c));
            const lands = p.battlefield.filter(c => isLand(c));
            const renderCard = (card, zone = "battlefield", forceSmall = false) => {
              const isAttacking = isMe && attackers.has(card.instanceId);
              const isDragging = dragCard?.instanceId === card.instanceId;
              const isOver = dragOverId === card.instanceId;
              return (
                <div key={card.instanceId}
                  draggable={isMe}
                  onDragStart={() => isMe && setDragCard({ instanceId: card.instanceId, zone })}
                  onDragOver={e => { e.preventDefault(); isMe && setDragOverId(card.instanceId); }}
                  onDragLeave={() => setDragOverId(null)}
                  onDrop={e => {
                    e.preventDefault();
                    if (dragCard && isMe) {
                      if (dragCard.zone === zone) {
                        // Same zone — reorder
                        reorderZone(pid, zone, dragCard.instanceId, card.instanceId);
                      }
                      // Don't stopPropagation — let row containers handle cross-row drops
                    }
                    setDragCard(null); setDragOverId(null);
                  }}
                  onDragEnd={() => { setDragCard(null); setDragOverId(null); }}
                  style={{ position: "relative", opacity: isDragging ? 0.4 : 1, outline: isOver ? "2px dashed #ffd700" : "none", borderRadius: 6, cursor: isMe ? "grab" : "default", transition: "opacity 0.15s", overflow: zone === "lands" ? "hidden" : "visible" }}
                  onContextMenu={e => openCardCtx(e, pid, card, "battlefield", isMe)}>
                  {isAttacking && <div style={{ position: "absolute", inset: -2, borderRadius: 6, border: "2px solid #ff4444", zIndex: 3, pointerEvents: "none", boxShadow: "0 0 8px #ff4444aa" }} />}
                  {isAttacking && <div style={{ position: "absolute", top: -9, left: "50%", transform: "translateX(-50%)", background: "#cc0000", color: "#fff", borderRadius: 3, fontSize: 7, padding: "1px 4px", zIndex: 4, whiteSpace: "nowrap", fontWeight: 800 }}>⚔ ATQ</div>}

                  <CardTile card={card} tapped={card.tapped} small={!isMe || forceSmall} mini={zone === "lands" && isMe}
                    selected={selCard?.instanceId === card.instanceId}
                    onClick={() => { if (isMe) setSelCard(s => s?.instanceId === card.instanceId ? null : card); }}
                    onDoubleClick={() => { if (isMe) { tapCard(card.instanceId); setSelCard(null); } else setZoomCard(card); }}
                    onHover={(c, x, y) => setHover({ card, x, y })} onHoverEnd={() => setHover(null)} />
                  {/* Ability icons — contained strictly within card width */}
                  {(card.abilities || []).length > 0 && (
                    <div style={{ position: "absolute", top: -16, left: 0, right: 0, display: "flex", gap: 1, justifyContent: "center", flexWrap: "nowrap", zIndex: 20, pointerEvents: "none", overflow: "hidden", padding: "0 2px" }}>
                      {(card.abilities || []).slice(0, isMe ? 6 : 4).map(key => {
                        const ab = ABILITIES.find(a => a.key === key);
                        return ab ? (
                          <span key={key} title={ab.name} style={{
                            fontSize: isMe ? 10 : 8,
                            lineHeight: 1,
                            background: "#000000ee",
                            borderRadius: 3,
                            padding: "1px 2px",
                            border: `1px solid ${ab.text}44`,
                            flexShrink: 0,
                            minWidth: 0,
                          }}>
                            {ab.icon}
                          </span>
                        ) : null;
                      })}
                      {(card.abilities || []).length > (isMe ? 6 : 4) && (
                        <span style={{ fontSize: isMe ? 9 : 7, color: "#aaa", background: "#000000ee", borderRadius: 3, padding: "1px 2px", flexShrink: 0 }}>
                          +{(card.abilities || []).length - (isMe ? 6 : 4)}
                        </span>
                      )}
                    </div>
                  )}
                  {(card.counters || []).length > 0 && (() => {
                    const cnts = card.counters || [];
                    const pp = cnts.filter(x => x === "+1/+1").length;
                    const mm = cnts.filter(x => x === "-1/-1").length;
                    const ep = cnts.filter(x => x === "+pow").length - cnts.filter(x => x === "-pow").length;
                    const et = cnts.filter(x => x === "+tgh").length - cnts.filter(x => x === "-tgh").length;
                    const netP = pp - mm + ep;
                    const netT = pp - mm + et;
                    const others = [...new Set(cnts.filter(x => x !== "+1/+1" && x !== "-1/-1" && x !== "+pow" && x !== "-pow" && x !== "+tgh" && x !== "-tgh"))];
                    const hasPR = netP !== 0 || netT !== 0;
                    return (
                      <div style={{ position: "absolute", bottom: 1, left: 1, right: 1, display: "flex", gap: 1, flexWrap: "wrap" }}>
                        {hasPR && (
                          <span style={{ fontSize: 9, background: netP > 0 && netT > 0 ? "#1a4a1a" : netP < 0 || netT < 0 ? "#4a1a1a" : "#2a2a2a", color: "#fff", borderRadius: 3, padding: "0 3px", fontWeight: 800 }}>
                            {netP > 0 ? `+${netP}` : netP}/{netT > 0 ? `+${netT}` : netT}
                          </span>
                        )}
                        {others.map(type => {
                          const count = cnts.filter(x => x === type).length;
                          const def = COUNTER_TYPES.find(t => t.key === type);
                          return <span key={type} style={{ fontSize: 8, background: def?.color || "#2a2a3a", color: def?.text || "#fff", borderRadius: 3, padding: "0 3px" }}>{type.length > 6 ? type.slice(0, 5) + "…" : type}×{count}</span>;
                        })}
                      </div>
                    );
                  })()}
                </div>
              );
            };
            return (
              <div style={{ flex: 1, display: "flex", flexDirection: "row", overflow: "hidden", minHeight: 0 }}>
                {/* Rows + Lands wrapper */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
                  {/* Row 1 — permanents with horizontal scroll */}
                  <div style={{ position: "relative", height: 116, flexShrink: 0, overflow: "hidden", borderBottom: "1px solid #1a1a2e" }}>
                    {/* Scrollable cards area — stops before log */}
                    <div ref={isMe ? scrollRef1 : null}
                      onDragOver={e => e.preventDefault()}
                      onDrop={e => {
                        e.preventDefault(); if (isMe && dragCard) {
                          setRow2Cards(s => { const n = new Set(s); n.delete(dragCard.instanceId); return n; });
                          setRow3Cards(s => { const n = new Set(s); n.delete(dragCard.instanceId); return n; });
                        } setDragCard(null); setDragOverId(null);
                      }}
                      style={{ height: "100%", overflowX: "auto", overflowY: "hidden", padding: "6px 8px", display: "flex", gap: 5, alignItems: "flex-start", flexWrap: "nowrap" }}>
                      {isMe && abilityMarkers.map(m => (
                        <AbilityMarker key={m.id} marker={m} onRemove={id => setAbilityMarkers(p => p.filter(x => x.id !== id))} />
                      ))}
                      {permanents.filter(c => !row2Cards.has(c.instanceId) && !row3Cards.has(c.instanceId)).map(c => renderCard(c))}
                      {!permanents.filter(c => !row2Cards.has(c.instanceId)).length && !abilityMarkers.length && (
                        <div style={{ color: "#1a1a2e", fontSize: 10, flexShrink: 0, paddingTop: 10 }}>Campo vacío</div>
                      )}
                    </div>

                    {isMe && <ScrollIndicator containerRef={scrollRef1} />}
                  </div>

                  {/* Row 2 — always visible for isMe, drop target */}
                  {(isMe || permanents.some(c => row2Cards.has(c.instanceId))) && (
                    <div
                      onDragOver={e => { e.preventDefault(); e.currentTarget.style.background = "#0d0d20"; e.currentTarget.style.outline = "1px dashed #ffd70055"; }}
                      onDragLeave={e => { e.currentTarget.style.background = isMe ? "#050508" : "transparent"; e.currentTarget.style.outline = "none"; }}
                      onDrop={e => {
                        e.preventDefault(); e.currentTarget.style.background = isMe ? "#050508" : "transparent"; e.currentTarget.style.outline = "none"; if (isMe && dragCard) {
                          setRow2Cards(s => new Set([...s, dragCard.instanceId]));
                          setRow3Cards(s => { const n = new Set(s); n.delete(dragCard.instanceId); return n; });
                        } setDragCard(null); setDragOverId(null);
                      }}
                      ref={isMe ? scrollRef2 : null} style={{ height: isMe ? 116 : 0, flexShrink: 0, overflowX: "auto", overflow: "hidden", padding: "4px 8px", display: "flex", gap: 5, alignItems: "flex-start", flexWrap: "nowrap", borderTop: "1px solid #1a1a2e", borderBottom: lands.length > 0 ? "1px solid #1a1a2e" : "none", background: isMe ? "#050508" : "transparent" }}>
                      {permanents.filter(c => row2Cards.has(c.instanceId)).map(c => renderCard(c))}
                      {isMe && !permanents.some(c => row2Cards.has(c.instanceId)) && (
                        <div style={{ color: "#1a1a2e", fontSize: 9, flexShrink: 0, paddingTop: 14, paddingLeft: 10, fontStyle: "italic", userSelect: "none" }}>↓ arrastra cartas a esta fila</div>
                      )}
                    </div>
                  )}
                  {/* Row 3 */}
                  {(isMe || permanents.some(c => row3Cards.has(c.instanceId))) && (
                    <div
                      onDragOver={e => { e.preventDefault(); e.currentTarget.style.background = "#0d0d20"; }}
                      onDragLeave={e => { e.currentTarget.style.background = isMe ? "#060609" : "transparent"; }}
                      onDrop={e => { e.preventDefault(); e.currentTarget.style.background = isMe ? "#060609" : "transparent"; if (isMe && dragCard) { setRow3Cards(s => new Set([...s, dragCard.instanceId])); setRow2Cards(s => { const n = new Set(s); n.delete(dragCard.instanceId); return n; }); } setDragCard(null); setDragOverId(null); }}
                      ref={isMe ? scrollRef2 : null} style={{ height: isMe ? 116 : 0, flexShrink: 0, overflowX: "auto", overflow: "hidden", padding: "4px 8px", display: "flex", gap: 5, alignItems: "flex-start", flexWrap: "nowrap", borderBottom: "1px solid #1a1a2e", background: isMe ? "#060609" : "transparent" }}>
                      {permanents.filter(c => row3Cards.has(c.instanceId)).map(c => renderCard(c))}
                      {isMe && !permanents.some(c => row3Cards.has(c.instanceId)) && (
                        <div style={{ color: "#3a3a5a", fontSize: 9, flexShrink: 0, paddingTop: 14, paddingLeft: 10, fontStyle: "italic", userSelect: "none" }}>↓ arrastra cartas a esta fila</div>
                      )}
                    </div>
                  )}

                  {/* Lands zone — horizontal scroll */}
                  <div style={{ height: lands.length > 0 ? 178 : 22, flexShrink: 0, overflow: "hidden", overflowX: "auto", padding: "3px 6px", display: "flex", flexDirection: "row", gap: 4, alignItems: "center", background: "#060609", flexWrap: "nowrap", minHeight: lands.length > 0 ? 56 : 20, maxHeight: lands.length > 0 ? 90 : 20 }}>
                    {lands.length > 0
                      ? <>
                        <span style={{ fontSize: 8, color: "#4a6a3a", letterSpacing: 1, flexShrink: 0, writingMode: "vertical-rl", marginRight: 2 }}>TIERRAS</span>
                        {lands.map(c => renderCard(c, "lands"))}
                      </>
                      : <div style={{ fontSize: 9, color: "#2a2a3a", paddingLeft: 8 }}>Zona de tierras</div>}
                  </div>
                </div>{/* end rows+lands col */}

                {/* LOG column — fixed width, full battlefield height, no overlap */}
                {isMe && (
                  <div style={{ width: 165, flexShrink: 0, borderLeft: "1px solid #1a1a2e", background: "#06060e", display: "flex", flexDirection: "column", overflow: "hidden" }}>
                    <div style={{ fontSize: 8, color: "#ffd700", letterSpacing: 2, padding: "5px 0 4px", textAlign: "center", borderBottom: "1px solid #1a1a2e", flexShrink: 0 }}>LOG</div>
                    <div style={{ flex: 1, padding: "4px 6px", overflowY: "auto" }}>
                      {[...turnLog].reverse().map((group, gi) => {
                        const isCollapsed = logCollapsed[group.turn] ?? (gi > 0);
                        return (
                          <div key={group.turn} style={{ marginBottom: 2 }}>
                            <div onClick={() => setLogCollapsed(c => ({ ...c, [group.turn]: !isCollapsed }))}
                              style={{ fontSize: 8, fontWeight: 800, color: "#ffd700aa", padding: "2px 0", cursor: "pointer", display: "flex", justifyContent: "space-between" }}>
                              <span>T{group.turn}</span><span>{isCollapsed ? "▶" : "▼"}</span>
                            </div>
                            {!isCollapsed && group.entries.slice().reverse().map((e, i) => (
                              <div key={i} style={{ fontSize: 8, color: gi === 0 && i === 0 ? "#ddddee" : "#44445a", lineHeight: 1.4, padding: "1px 0", borderBottom: "1px solid #0a0a14", wordBreak: "break-word" }}>{e}</div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              </div>
            );
          })()}

          {/* Bottom bar: CMD | EXILE | GRAVEYARD | LIBRARY ——————————————— HAND */}
          {(() => {
            // Responsive card size based on available space
            // We use CSS container queries via inline calc:
            // small = 42px wide cards, normal = 52px
            const cardW = isMe ? 52 : 42;
            const cardH = isMe ? 73 : 58;
            const zoneSlotStyle = (label) => ({
              display: "flex", flexDirection: "column", alignItems: "center",
              gap: 2, flexShrink: 0
            });
            const labelStyle = {
              fontSize: 7, color: "#8888aa", letterSpacing: 1,
              textTransform: "uppercase", lineHeight: 1, textAlign: "center"
            };
            return (
              <div style={{ borderTop: "1px solid #2a2a4a", background: "#050508", display: "flex", alignItems: "stretch", flexShrink: 0 }}>

                {/* LEFT ZONES — fixed width, never shrink */}
                <div style={{ display: "flex", gap: 3, alignItems: "center", padding: "4px 5px", flexShrink: 0, borderRight: "1px solid #1a1a2e" }}>

                  {/* Commander */}
                  <div style={zoneSlotStyle()}>
                    <div style={{ fontSize: 7, color: "#ffd700", letterSpacing: 1, textAlign: "center" }}>CMD</div>
                    {p.commandZone.length > 0
                      ? p.commandZone.map(c => (
                        <div key={c.instanceId} onContextMenu={e => openCardCtx(e, p.id, c, "commandZone", isMe)} style={{ position: "relative" }}>
                          <CardTile card={c} small onClick={isMe ? playCommander : undefined} onHover={(card, x, y) => setHover({ card, x, y })} onHoverEnd={() => setHover(null)} />
                          {p.commanderTax > 0 && (
                            <div style={{ position: "absolute", top: -5, right: -5, background: "#8b0000", color: "#ffcccc", borderRadius: "50%", width: 14, height: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 7, fontWeight: 800, border: "1px solid #ff4444" }}>
                              +{p.commanderTax}
                            </div>
                          )}
                        </div>
                      ))
                      : p.commanderCard
                        ? <div style={{ width: cardW, height: cardH, borderRadius: 5, border: "2px dashed #ffd70044", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 1 }}>
                          <div style={{ fontSize: 12 }}>⚔</div>
                          <div style={{ fontSize: 7, color: "#ffd70066" }}>En juego</div>
                          {p.commanderTax > 0 && <div style={{ fontSize: 7, color: "#ff8844", fontWeight: 800 }}>+{p.commanderTax}</div>}
                        </div>
                        : <div style={{ width: cardW, height: cardH, borderRadius: 5, border: "2px dashed #2a2a4a" }} />
                    }
                  </div>

                  {/* Library */}
                  <div style={zoneSlotStyle()}>
                    <div style={labelStyle}>Bib.</div>
                    <div onClick={isMe ? () => libActions.draw(p.id, 1) : undefined}
                      onContextMenu={e => { if (!isMe) return; e.preventDefault(); e.stopPropagation(); setCtxMenu({ x: e.clientX, y: e.clientY, title: `Biblioteca (${p.library.length})`, items: libraryMenu(p, p.id, isMe, libActions) }); }}
                      style={{ width: cardW, height: cardH, borderRadius: 5, overflow: "hidden", border: "2px solid #3a5a8a", cursor: isMe ? "pointer" : "default", position: "relative" }}>
                      <div style={{ width: "100%", height: "100%", background: "linear-gradient(160deg,#1a2a4a 0%,#0d1a2e 40%,#1a0a2a 100%)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                        <div style={{ position: "absolute", inset: 2, border: "1px solid #3a4a6a", borderRadius: 3 }} />
                        <span style={{ fontSize: 10, opacity: 0.5 }}>🌟</span>
                      </div>
                      <div style={{ position: "absolute", bottom: 2, left: 0, right: 0, textAlign: "center", fontSize: 10, color: "#fff", fontWeight: 800, background: "#000a", borderRadius: "0 0 4px 4px", padding: "1px 0" }}>{p.library.length}</div>
                    </div>
                  </div>

                  {/* Graveyard */}
                  <div style={zoneSlotStyle()}>
                    <div style={labelStyle}>Cem.</div>
                    <div onClick={() => setShowZone({ pid: p.id, zone: "graveyard" })} style={{ cursor: "pointer" }}>
                      {p.graveyard.length > 0
                        ? <CardTile card={p.graveyard[0]} small onClick={() => setShowZone({ pid: p.id, zone: "graveyard" })} onHover={(c, x, y) => setHover({ card: c, x, y })} onHoverEnd={() => setHover(null)} />
                        : <div style={{ width: cardW, height: cardH, borderRadius: 5, border: "2px dashed #3a3a5a", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 1 }}><div style={{ fontSize: 12 }}>🪦</div><div style={{ fontSize: 8, color: "#555" }}>{p.graveyard.length}</div></div>}
                    </div>
                  </div>

                  {/* Exile */}
                  <div style={zoneSlotStyle()}>
                    <div style={labelStyle}>Exilio</div>
                    <div onClick={() => setShowZone({ pid: p.id, zone: "exile" })} style={{ cursor: "pointer" }}>
                      {p.exile.length > 0
                        ? <CardTile card={p.exile[0]} small onClick={() => setShowZone({ pid: p.id, zone: "exile" })} onHover={(c, x, y) => setHover({ card: c, x, y })} onHoverEnd={() => setHover(null)} />
                        : <div style={{ width: cardW, height: cardH, borderRadius: 5, border: "2px dashed #3a3a5a", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 1 }}><div style={{ fontSize: 12 }}>✨</div><div style={{ fontSize: 8, color: "#555" }}>{p.exile.length}</div></div>}
                    </div>
                  </div>

                  {/* Sideboard — only show for non-commander formats */}
                  {(p.sideboard || []).length > 0 && (
                    <div style={zoneSlotStyle()}>
                      <div style={labelStyle}>SB</div>
                      <div onClick={() => setShowZone({ pid: p.id, zone: "sideboard" })} style={{ cursor: "pointer" }}>
                        <div style={{ width: cardW, height: cardH, borderRadius: 5, border: "2px solid #3a4a6a", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 1, background: "#1a1a3e", cursor: "pointer" }}>
                          <div style={{ fontSize: 10 }}>↔</div>
                          <div style={{ fontSize: 8, color: "#88aaff", fontWeight: 800 }}>{(p.sideboard || []).length}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* DIVIDER — flexible space */}
                <div style={{ flex: 1, minWidth: 8 }} />

                {/* RIGHT: HAND */}
                <div style={{ display: "flex", alignItems: "center", gap: 2, padding: "4px 5px", overflowX: "auto", flexShrink: 0, borderLeft: "1px solid #1a1a2e", maxWidth: "55%" }}>
                  <span style={{ fontSize: 7, color: "#555", writingMode: "vertical-rl", letterSpacing: 1, flexShrink: 0, textTransform: "uppercase" }}>Mano</span>
                  {isMe
                    ? p.hand.map(card => (
                      <div key={card.instanceId} onContextMenu={e => openCardCtx(e, pid, card, "hand", true)}>
                        <CardTile card={card} small
                          selected={selCard?.instanceId === card.instanceId}
                          onClick={() => setSelCard(s => s?.instanceId === card.instanceId ? null : card)}
                          onDoubleClick={() => playCard(card, "hand")}
                          onHover={(c, x, y) => setHover({ card: c, x, y })} onHoverEnd={() => setHover(null)} />
                      </div>
                    ))
                    : p.hand.map(card => (
                      <div key={card.instanceId} style={{ width: 38, height: 52, borderRadius: 4, overflow: "hidden", flexShrink: 0, border: "2px solid #2a3a5a", background: "linear-gradient(160deg,#1a2a4a,#0d1a2e,#1a0a2a)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontSize: 12, opacity: 0.5 }}>🌟</span>
                      </div>
                    ))
                  }
                  {p.hand.length === 0 && <span style={{ color: "#2a2a3a", fontSize: 9 }}>vacía</span>}
                </div>

              </div>
            );
          })()}
        </div>{/* end body wrapper */}
      </div>
    );
  };

  const mbtn = (bg, col) => ({ width: 20, height: 20, borderRadius: "50%", border: "none", background: bg, color: col, cursor: "pointer", fontSize: 13, fontWeight: 800, padding: 0, flexShrink: 0 });

  // ── Layout: 4-corner / center ──
  // Opponent positions based on count
  const opponentSlots = others.slice(0, 3);

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#04040c", color: "#e8e0d0", fontFamily: "'Crimson Text',Georgia,serif", overflow: "hidden", userSelect: "none" }}
      onClick={() => { setCtxMenu(null); setSelCard(null); }}>



      {/* Board: PhasePanel | Grid | ActionPanel */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* LEFT: Phase + Turn order panel */}
        <PhasePanel
          playerOrder={playerOrder} players={players} activePlayer={activePlayer}
          turn={turn} phase={phase} isMyTurn={isMyTurn}
          onNextPhase={nextPhase} onEndTurn={() => {
            const msg = `Fase: ${PHASES[5]}`;
            addLog(msg);
            setPhase(5);
            setAttackers(new Set());
            rt.current?.broadcast("turn_change", { ap: activePlayer, ph: 5, t: turn, log: msg });
            setTimeout(nextPhase, 150);
          }}
          onMulligan={startMulligan} onHome={onHome}
          avatars={avatarMap}
        />

        {/* CENTER: Player grids */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", gap: 4, padding: 4 }}>
          {/* Opponents row — in 2-player mode takes 50% height */}
          {opponentSlots.length > 0 && (
            <div style={{ flex: isTwoPlayer ? 1 : 1, display: "flex", gap: 4, minHeight: 0 }}>
              {opponentSlots.map(p => (
                <div key={p.id} style={{ flex: 1, minWidth: 0 }}>
                  {renderPlayerPanel(p.id, false, 0)}
                </div>
              ))}
            </div>
          )}
          {/* My panel — 50% in 2-player */}
          <div style={{ flex: 1, minHeight: 0 }}>
            {renderPlayerPanel(myId, true, 0)}
          </div>
        </div>

        {/* RIGHT: Actions + Log panel */}
        <div style={{ width: 68, flexShrink: 0, background: "#06060e", borderLeft: "1px solid #1a1a2e", display: "flex", flexDirection: "column", alignItems: "center", padding: "4px 4px", gap: 2, overflowY: "auto", flexShrink: 0 }}>
          {/* PRIMARY buttons — always visible */}
          {[
            { icon: "📚", label: "Robar", action: () => libActions.draw(myId, 1), color: "#7fc4ff" },
            { icon: "⟲", label: "Destapar", action: untapAll, color: "#88ff88" },
            { icon: "🪄", label: "Token", action: () => setTokenModal(true), color: "#cc88ff" },
            { icon: "🎲", label: "Dado", action: () => setDiceModal(true), color: "#ffaa44" },
            { icon: "💬", label: "Chat", action: () => setChatOpen(o => !o), color: chatOpen ? "#7fc4ff" : "#888" },
            { icon: "🎙", label: voiceEnabled ? (muted ? "Silenc." : "Voz ON") : "Voz", action: toggleVoice, color: voiceEnabled ? (muted ? "#ff8888" : "#44ff88") : "#555" },
          ].map(btn => (
            <button key={btn.label} onClick={btn.action} title={btn.label}
              style={{ width: "100%", padding: "4px 2px", borderRadius: 6, border: "1px solid #1a1a2e", background: "#0a0a14", color: btn.color, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
              <span style={{ fontSize: 14 }}>{btn.icon}</span>
              <span style={{ fontSize: 7, lineHeight: 1 }}>{btn.label}</span>
            </button>
          ))}

          {/* Separator */}
          <div style={{ width: "80%", height: 1, background: "#1a1a2e", margin: "2px 0", flexShrink: 0 }} />

          {/* SECONDARY buttons — smaller */}
          {[
            { icon: "↩", label: "Deshacer", action: undo, color: history.length ? "#ffcc88" : "#333", disabled: !history.length },
            { icon: "✨", label: "Habil.", action: () => setAbilitiesModal(true), color: "#88eeff" },
            { icon: "❤", label: "Vida", action: () => setLifeHistoryOpen(o => !o), color: "#ff8888" },
            { icon: "💎", label: "Maná", action: () => setManaOpen(o => !o), color: manaOpen ? "#ffd700" : "#888" },
            { icon: "⚔", label: "CmdDmg", action: () => setCmdDmgOpen(o => !o), color: cmdDmgOpen ? "#ff8844" : "#888" },
            { icon: "📝", label: "Notas", action: () => setNotesOpen(o => !o), color: notesOpen ? "#88ff88" : "#888" },
            { icon: "🔍", label: "Buscar", action: () => setCardSearch(s => ({ ...s, open: !s.open, query: "", results: [] })), color: cardSearch.open ? "#ffd700" : "#888" },
            ...(voiceEnabled ? [{ icon: muted ? "🔇" : "🔊", label: muted ? "Unmute" : "Mute", action: toggleMute, color: muted ? "#ff4444" : "#88ff88" }] : []),
          ].map(btn => (
            <button key={btn.label} onClick={btn.action} disabled={btn.disabled} title={btn.label}
              style={{ width: "100%", padding: "3px 2px", borderRadius: 5, border: "1px solid #141420", background: "#080810", color: btn.color, cursor: btn.disabled ? "default" : "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 0, opacity: btn.disabled ? 0.3 : 1 }}>
              <span style={{ fontSize: 12 }}>{btn.icon}</span>
              <span style={{ fontSize: 6, lineHeight: 1 }}>{btn.label}</span>
            </button>
          ))}

          {/* Separator */}
          <div style={{ width: "80%", height: 1, background: "#1a1a2e", margin: "2px 0", flexShrink: 0 }} />

          {/* UTILITY buttons — icon only, smallest */}
          {[
            {
              icon: "📤", label: "Exportar", action: () => {
                const txt = exportGameState(players, playerOrder, turn, phase, turnLog, roomCode);
                const blob = new Blob([txt], { type: "text/plain" });
                const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
                a.download = `partida-${roomCode}-T${turn}.txt`; a.click();
              }, color: "#555"
            },
            {
              icon: "🔄", label: "Reiniciar", action: () => {
                if (window.confirm("¿Reiniciar la partida?")) {
                  const newPlayers = {};
                  initialPlayers.forEach(p => {
                    newPlayers[p.id] = mkState(p.id, p.name, p.playerState?.fullDeck || p.playerState?.library || [], p.playerState?.commandZone?.[0] || null, p.format?.life || 40);
                  });
                  setPlayers(newPlayers); setTurn(1); setPhase(0);
                  setActivePlayer(initialPlayers[0]?.id);
                  setTurnLog([{ turn: 1, entries: ["¡Partida reiniciada!"] }]);
                  setAttackers(new Set()); addLog("🔄 Partida reiniciada.");
                  rt.current?.broadcast("notification", { msg: "🔄 La partida fue reiniciada", from: myId });
                }
              }, color: "#555"
            },
            { icon: "✕", label: "Salir", action: onExit, color: "#444" },
          ].map(btn => (
            <button key={btn.label} onClick={btn.action} title={btn.label}
              style={{ width: "100%", padding: "3px 2px", borderRadius: 5, border: "none", background: "transparent", color: btn.color, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <span style={{ fontSize: 12 }}>{btn.icon}</span>
              <span style={{ fontSize: 6, lineHeight: 1 }}>{btn.label}</span>
            </button>
          ))}
          {/* Card Search Panel */}
          {cardSearch.open && (
            <div style={{ width: "100%", borderTop: "1px solid #1a1a2e", paddingTop: 6, marginBottom: 4 }}>
              <input value={cardSearch.query}
                onChange={async e => {
                  const q = e.target.value;
                  setCardSearch(s => ({ ...s, query: q, loading: true }));
                  if (q.length < 2) { setCardSearch(s => ({ ...s, results: [], loading: false })); return; }
                  try {
                    const r = await fetch(`https://api.scryfall.com/cards/search?q=${encodeURIComponent(q)}&unique=cards&order=name`);
                    const d = r.ok ? await r.json() : { data: [] };
                    setCardSearch(s => ({ ...s, results: (d.data || []).slice(0, 20), loading: false }));
                  } catch { setCardSearch(s => ({ ...s, results: [], loading: false })); }
                }}
                placeholder="Buscar carta..."
                style={{ width: "100%", padding: "5px 7px", borderRadius: 6, border: "1px solid #3a3a6a", background: "#080810", color: "#e8e0d0", fontSize: 10, outline: "none", boxSizing: "border-box" }}
              />
              {cardSearch.loading && <div style={{ fontSize: 8, color: "#888", textAlign: "center", padding: 4 }}>...</div>}
              <div style={{ maxHeight: 200, overflowY: "auto", marginTop: 4 }}>
                {cardSearch.results.map(card => {
                  const img = card.image_uris?.normal || card.card_faces?.[0]?.image_uris?.normal;
                  return (
                    <div key={card.id}
                      onContextMenu={e => {
                        e.preventDefault();
                        setCtxMenu({
                          x: e.clientX, y: e.clientY, title: card.printed_name || card.name,
                          items: [
                            { label: "🤚 A la mano", action: () => updMe(p => ({ ...p, hand: [...p.hand, { ...card, image_url: img, instanceId: uid() }] }), `${players[myId]?.name} busca ${card.printed_name || card.name} → mano.`) },
                            { label: "🔝 Tope biblioteca", action: () => updMe(p => ({ ...p, library: [{ ...card, image_url: img, instanceId: uid() }, ...p.library] }), `${players[myId]?.name} busca ${card.printed_name || card.name} → tope.`) },
                            { label: "🔽 Fondo biblioteca", action: () => updMe(p => ({ ...p, library: [...p.library, { ...card, image_url: img, instanceId: uid() }] }), `${players[myId]?.name} busca ${card.printed_name || card.name} → fondo.`) },
                            { label: "⚔ Al campo", action: () => updMe(p => ({ ...p, battlefield: [...p.battlefield, { ...card, image_url: img, instanceId: uid(), tapped: false, counters: [], abilities: cardAbilitiesFromKeywords(card) }] }), `${players[myId]?.name} busca ${card.printed_name || card.name} → campo.`) },
                            { label: "✨ Al exilio", action: () => updMe(p => ({ ...p, exile: [{ ...card, image_url: img, instanceId: uid() }, ...p.exile] }), `${players[myId]?.name} busca ${card.printed_name || card.name} → exilio.`) },
                          ]
                        });
                      }}
                      onMouseEnter={e => setHover({ card: { ...card, image_url: img }, x: e.clientX, y: e.clientY })}
                      onMouseMove={e => setHover(h => h ? { ...h, x: e.clientX, y: e.clientY } : h)}
                      onMouseLeave={() => setHover(null)}
                      style={{ padding: "4px 6px", borderRadius: 5, cursor: "context-menu", borderBottom: "1px solid #0d0d18", display: "flex", gap: 6, alignItems: "center" }}
                      onMouseOver={e => e.currentTarget.style.background = "#1a1a2e"}
                      onMouseOut={e => e.currentTarget.style.background = "transparent"}>
                      {img && <img src={img} style={{ width: 24, height: 33, borderRadius: 2, objectFit: "cover", flexShrink: 0 }} />}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 8, color: "#e8e0d0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{card.printed_name || card.name}</div>
                        <div style={{ fontSize: 7, color: "#555", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{card.type_line?.split("—")[0]}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>



      </div>{/* end board flex row */}



      {/* Zone modal */}
      {showZone && (
        <div style={{ position: "fixed", inset: 0, background: "#000b", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 400 }} onClick={() => setShowZone(null)}>
          <div style={{ background: "#0d0d1e", border: "1px solid #3a3a6a", borderRadius: 14, padding: 22, maxWidth: 680, maxHeight: "80vh", overflowY: "auto", minWidth: 360 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#ffd700" }}>
                {showZone.zone === "graveyard" ? "🪦 Cementerio" : "✨ Exilio"} — {players[showZone.pid]?.name}
              </span>
              <button onClick={() => setShowZone(null)} style={{ background: "none", border: "none", color: "#888", cursor: "pointer", fontSize: 17 }}>✕</button>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {(players[showZone.pid]?.[showZone.zone] || []).map(card => (
                <div key={card.instanceId} onContextMenu={e => { setShowZone(null); openCardCtx(e, showZone.pid, card, showZone.zone, showZone.pid === myId); }}>
                  <CardTile card={card} onClick={() => { }} onHover={(c, x, y) => setHover({ card: c, x, y })} onHoverEnd={() => setHover(null)} />
                </div>
              ))}
              {!players[showZone.pid]?.[showZone.zone]?.length && <div style={{ color: "#555", padding: 18 }}>Vacío</div>}
            </div>
          </div>
        </div>
      )}

      {/* View top modal */}
      {viewTopModal && (
        <div style={{ position: "fixed", inset: 0, background: "#000b", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 600 }} onClick={() => setViewTopModal(null)}>
          <div style={{ background: "#0d0d1e", border: "1px solid #3a3a6a", borderRadius: 14, padding: 22, maxWidth: 600 }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#ffd700", marginBottom: 14 }}>🔍 Tope de biblioteca — {players[viewTopModal.pid]?.name}</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {viewTopModal.cards.map((card, i) => <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}><CardTile card={card} onClick={() => { }} onHover={(c, x, y) => setHover({ card: c, x, y })} onHoverEnd={() => setHover(null)} /><span style={{ fontSize: 9, color: "#888" }}>#{i + 1}</span></div>)}
            </div>
            <button onClick={() => setViewTopModal(null)} style={{ marginTop: 16, padding: "8px 24px", borderRadius: 8, border: "none", background: "#1a1a3e", color: "#e8e0d0", cursor: "pointer" }}>Cerrar</button>
          </div>
        </div>
      )}

      {/* Scry/Surveil modal */}
      {scryModal && <ScryModal cards={scryModal.cards} title={`${scryModal.mode === "scry" ? "🔮 Scry" : "👁 Surveil"} ${scryModal.cards.length}`} onDone={resolveScry} />}

      {/* Search lib modal */}
      {searchLibModal && (() => {
        const pid = typeof searchLibModal === "string" ? searchLibModal : searchLibModal.pid;
        const zone = typeof searchLibModal === "string" ? "library" : (searchLibModal.zone || "library");
        const dest = typeof searchLibModal === "string" ? "hand" : (searchLibModal.dest || "hand");
        return <SearchLibModal library={players[pid]?.library || []} graveyard={players[pid]?.graveyard || []} sideboard={players[pid]?.sideboard || []} zone={zone} dest={dest} onPick={resolveSearchLib} onClose={() => setSearchLibModal(null)} />;
      })()}

      {/* Resolve Modal (Cascade, Discover, Impulse, etc.) */}
      {resolveModal && (
        <ResolveModal
          modal={resolveModal}
          players={players}
          onResolve={resolveModalAction}
          onClose={() => setResolveModal(null)}
        />
      )}
      {/* Token Modal */}
      {tokenModal && <TokenModal cmdTokenSuggestions={cmdTokenSuggestions} onCreate={createToken} onClose={() => setTokenModal(false)} />}

      {/* Life History */}
      {lifeHistoryOpen && <LifeHistoryPanel players={players} lifeHistory={lifeHistory} onClose={() => setLifeHistoryOpen(false)} />}

      {/* Chat */}
      {chatOpen && <ChatPanel messages={chatMessages} input={chatInput} onInput={setChatInput} onSend={sendChatMessage} onClose={() => setChatOpen(false)} playerName={players[myId]?.name} />}

      {/* Notes */}
      {notesOpen && <NotesPanel notes={notes} onChange={setNotes} onClose={() => setNotesOpen(false)} />}

      {/* Mana Tracker */}
      {manaOpen && <ManaTracker mana={mana} onChange={setMana} onClose={() => setManaOpen(false)} />}
      {cmdDmgOpen && <CmdDmgPanel myPid={myId} players={players} playerOrder={playerOrder} avatarMap={avatarMap} onAdjust={(fromPid, d) => adjCmdDmg(fromPid, myId, d)} onClose={() => setCmdDmgOpen(false)} />}




      {/* Notifications */}
      <div style={{ position: "fixed", top: 16, left: "50%", transform: "translateX(-50%)", zIndex: 600, display: "flex", flexDirection: "column", gap: 6, alignItems: "center", pointerEvents: "none" }}>
        {notifications.map(n => (
          <div key={n.id} style={{ background: "#1a1a2eee", border: "1px solid #3a3a6a", borderRadius: 10, padding: "8px 16px", fontSize: 12, color: "#e8e0d0", boxShadow: "0 4px 16px #000a", animation: "slideDown 0.3s ease" }}>
            {n.msg}
          </div>
        ))}
      </div>

      {/* Spectator banner */}
      {isSpectator && (
        <div style={{ position: "fixed", top: 8, left: "50%", transform: "translateX(-50%)", background: "#0d0d1eee", border: "1px solid #3a3a6a", borderRadius: 20, padding: "6px 18px", fontSize: 12, color: "#8888aa", zIndex: 500, pointerEvents: "none" }}>
          👁 Modo Espectador — Solo lectura
        </div>
      )}
      {/* Dice Result Overlay — visible to all players */}
      <DiceResultOverlay result={diceResult} />
      {/* Abilities Modal */}
      {abilitiesModal && (
        <AbilitiesModal
          markers={abilityMarkers}
          onAdd={(key) => setAbilityMarkers(m => [...m, { id: uid(), ability: key }])}
          onRemove={(id) => {
            if (id === "all") setAbilityMarkers([]);
            else setAbilityMarkers(m => m.filter(x => x.id !== id));
          }}
          onClose={() => setAbilitiesModal(false)}
        />
      )}
      {/* Dice Modal */}
      {diceModal && <DiceModal
        onClose={() => setDiceModal(false)}
        playerName={players[myId]?.name}
        onRoll={(rollData) => {
          // Show to myself
          setDiceResult(rollData);
          addLog(`🎲 ${rollData.playerName} tira d${rollData.die}: ${rollData.value}${rollData.value === rollData.die ? " 🎉" : rollData.value === 1 ? " 💀" : ""}`);
          setTimeout(() => setDiceResult(null), 4000);
          // Broadcast to all others
          rt.current?.broadcast("dice_roll", rollData);
        }}
      />}
      {/* Zoom Card */}
      {zoomCard && <ZoomCardModal card={zoomCard} onClose={() => setZoomCard(null)} />}

      {/* Mulligan Modal */}
      {mulliganModal && (
        <MulliganModal
          player={players[myId]}
          mulliganCount={mulliganCount}
          onKeep={keepHand}
          onMulligan={doMulligan}
          onClose={() => setMulliganModal(false)}
          onHome={onHome}
        />
      )}
      {/* Counter Modal */}
      {counterModal && (() => {
        const card = players[myId]?.battlefield.find(c => c.instanceId === counterModal);
        if (!card) { setCounterModal(null); return null; }
        return <CounterModal card={card} onUpdate={(newCounters) => setCounters(counterModal, newCounters)} onClose={() => setCounterModal(null)} />;
      })()}
      {/* Context Menu */}
      <CtxMenu menu={ctxMenu} onClose={() => setCtxMenu(null)} />

      {/* Hover Zoom */}
      {hover && <HoverZoom card={hover.card} x={hover.x} y={hover.y} />}
    </div>
  );
}

function mbtn(bg, col) { return { width: 20, height: 20, borderRadius: "50%", border: "none", background: bg, color: col, cursor: "pointer", fontSize: 13, fontWeight: 800, padding: 0, flexShrink: 0 }; }



// ─── Deck Selector Modal ──────────────────────────────────────────────────────
function DeckSelectorModal({ decks, cloudDecks, onSelect, onNew, onClose }) {
  const [search, setSearch] = useState("");
  const [hover, setHover] = useState(null);
  const allDecks = [
    ...cloudDecks.map(d => ({ ...d, isCloud: true, deckName: d.name })),
    ...decks.map(d => ({ ...d, isCloud: false, deckName: d.name })),
  ];
  const filtered = allDecks.filter(d =>
    d.deckName?.toLowerCase().includes(search.toLowerCase()) ||
    getCardName(d.commander)?.toLowerCase().includes(search.toLowerCase())
  );

  // Deck stats
  const deckStats = (deck) => {
    if (!deck) return {};
    const d = deck.deck || [];
    return {
      creatures: d.filter(c => (c.type_line || "").toLowerCase().includes("criatura") || (c.type_line || "").toLowerCase().includes("creature")).length,
      lands: d.filter(c => isLand(c)).length,
      instants: d.filter(c => (c.type_line || "").toLowerCase().includes("instant") || (c.type_line || "").toLowerCase().includes("instantá")).length,
      sorceries: d.filter(c => (c.type_line || "").toLowerCase().includes("sorcery") || (c.type_line || "").toLowerCase().includes("conjuro")).length,
    };
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000d", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 900, fontFamily: "'Crimson Text',Georgia,serif" }} onClick={onClose}>
      <div style={{ background: "#0a0a1a", border: "1px solid #3a3a6a", borderRadius: 18, padding: 0, width: 640, maxHeight: "88vh", display: "flex", flexDirection: "column", overflow: "hidden" }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ padding: "20px 24px 0", flexShrink: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#ffd700" }}>📚 Elige un mazo</div>
              <div style={{ fontSize: 12, color: "#8888aa", marginTop: 3, display: "flex", alignItems: "center", gap: 6 }}>
                <span>{allDecks.length} mazo{allDecks.length !== 1 ? "s" : ""}</span>
                {allDecks[0]?.format && <span style={{ color: "#ffd70088" }}>{allDecks[0].format.icon} {allDecks[0].format.label}</span>}
              </div>
            </div>
            <button onClick={onNew}
              style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: "linear-gradient(90deg,#ffd700,#ff8c00)", color: "#000", fontWeight: 800, fontSize: 13, cursor: "pointer" }}>
              + Nuevo Mazo
            </button>
          </div>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre o comandante..."
            autoFocus
            style={{ width: "100%", padding: "9px 14px", borderRadius: 9, border: "1px solid #3a3a6a", background: "#080810", color: "#e8e0d0", fontSize: 13, outline: "none", boxSizing: "border-box", marginBottom: 12 }} />
        </div>

        {/* Deck grid */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 24px 20px", display: "flex", flexWrap: "wrap", gap: 12, alignContent: "flex-start" }}>
          {filtered.map((d, i) => {
            const stats = deckStats(d);
            const cmdImg = d.commander?.image_url;
            return (
              <div key={i} onClick={() => onSelect(d)}
                onMouseEnter={e => setHover({ d, x: e.clientX, y: e.clientY })}
                onMouseMove={e => setHover(h => h ? { ...h, x: e.clientX, y: e.clientY } : h)}
                onMouseLeave={() => setHover(null)}
                style={{ width: 180, borderRadius: 12, border: "1px solid #2a2a4a", background: "#0d0d1e", cursor: "pointer", overflow: "hidden", transition: "all 0.15s", flexShrink: 0 }}
                onMouseOver={e => { e.currentTarget.style.border = "1px solid #ffd70066"; e.currentTarget.style.background = "#1a1a2e"; }}
                onMouseOut={e => { e.currentTarget.style.border = "1px solid #2a2a4a"; e.currentTarget.style.background = "#0d0d1e"; }}>
                {/* Commander image */}
                <div style={{ height: 120, overflow: "hidden", position: "relative", background: "#1a1a3e" }}>
                  {cmdImg
                    ? <img src={cmdImg} style={{ width: "100%", objectFit: "cover", objectPosition: "top" }} />
                    : <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>⚔️</div>}
                  {d.isCloud && <div style={{ position: "absolute", top: 6, right: 6, background: "#000a", borderRadius: 4, padding: "2px 6px", fontSize: 9, color: "#44ff88" }}>☁ Nube</div>}
                </div>
                {/* Info */}
                <div style={{ padding: "10px 12px" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#e8e0d0", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.deckName}</div>
                  <div style={{ fontSize: 10, color: "#8888aa", marginBottom: 6 }}>{getCardName(d.commander) || "Sin comandante"}</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {stats.creatures > 0 && <span style={{ fontSize: 9, color: "#ff8888", background: "#2a1a1a", borderRadius: 4, padding: "1px 5px" }}>⚔{stats.creatures}</span>}
                    {stats.lands > 0 && <span style={{ fontSize: 9, color: "#88cc88", background: "#1a2a1a", borderRadius: 4, padding: "1px 5px" }}>🌲{stats.lands}</span>}
                    {stats.instants > 0 && <span style={{ fontSize: 9, color: "#88aaff", background: "#1a1a3a", borderRadius: 4, padding: "1px 5px" }}>⚡{stats.instants}</span>}
                    {stats.sorceries > 0 && <span style={{ fontSize: 9, color: "#ffaa44", background: "#2a1a0a", borderRadius: 4, padding: "1px 5px" }}>📜{stats.sorceries}</span>}
                  </div>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div style={{ width: "100%", textAlign: "center", color: "#444", fontSize: 13, padding: 30 }}>
              No se encontraron mazos
            </div>
          )}
        </div>
      </div>
      {hover && hover.d.commander && <HoverZoom card={hover.d.commander} x={hover.x} y={hover.y} />}
    </div>
  );
}


// ─── Player Name Modal ────────────────────────────────────────────────────────
function PlayerNameModal({ user, onSave }) {
  const suggested = getUserDisplayName(user) || "";
  const [name, setName] = useState(suggested);

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000d", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 950, fontFamily: "'Crimson Text',Georgia,serif" }}>
      <div style={{ background: "#0d0d1e", border: "1px solid #ffd70066", borderRadius: 18, padding: 30, width: 360, display: "flex", flexDirection: "column", gap: 16, textAlign: "center" }}>
        <div style={{ fontSize: 36 }}>⚔️</div>
        <div style={{ fontSize: 18, fontWeight: 800, color: "#ffd700" }}>¿Cómo quieres que te llamen?</div>
        <div style={{ fontSize: 12, color: "#8888aa" }}>Este nombre aparecerá en el tablero durante las partidas</div>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === "Enter" && name.trim() && onSave(name.trim())}
          placeholder="Tu nombre de jugador..."
          autoFocus
          maxLength={24}
          style={{ padding: "12px 16px", borderRadius: 10, border: "1px solid #3a3a6a", background: "#080810", color: "#e8e0d0", fontSize: 16, outline: "none", textAlign: "center", fontWeight: 700 }}
        />
        <button
          onClick={() => name.trim() && onSave(name.trim())}
          disabled={!name.trim()}
          style={{ padding: "13px 0", borderRadius: 10, border: "none", background: name.trim() ? "linear-gradient(90deg,#ffd700,#ff8c00)" : "#222", color: name.trim() ? "#000" : "#555", fontWeight: 800, fontSize: 15, cursor: name.trim() ? "pointer" : "default" }}>
          Confirmar →
        </button>
      </div>
    </div>
  );
}


// ─── Format Selector Modal ────────────────────────────────────────────────────
function FormatSelectorModal({ currentFormat, onSelect, onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "#000d", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 950 }} onClick={onClose}>
      <div style={{ background: "#0d0d1e", border: "1px solid #3a3a6a", borderRadius: 18, padding: 24, width: 520, maxHeight: "85vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#ffd700" }}>📋 Seleccionar Formato</div>
            <div style={{ fontSize: 11, color: "#8888aa", marginTop: 3 }}>Define las reglas de tu partida</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#888", cursor: "pointer", fontSize: 18 }}>✕</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {FORMATS.map(f => (
            <button key={f.key} onClick={() => { onSelect(f); onClose(); }}
              style={{
                padding: "14px 14px", borderRadius: 12, border: currentFormat?.key === f.key ? "2px solid #ffd700" : "1px solid #2a2a4a",
                background: currentFormat?.key === f.key ? "#1a140a" : "#0a0a18", cursor: "pointer", textAlign: "left", transition: "all 0.15s"
              }}
              onMouseOver={e => { e.currentTarget.style.border = "1px solid #ffd70066"; e.currentTarget.style.background = "#1a1a2e"; }}
              onMouseOut={e => { e.currentTarget.style.border = currentFormat?.key === f.key ? "2px solid #ffd700" : "1px solid #2a2a4a"; e.currentTarget.style.background = currentFormat?.key === f.key ? "#1a140a" : "#0a0a18"; }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                <span style={{ fontSize: 20 }}>{f.icon}</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: currentFormat?.key === f.key ? "#ffd700" : "#e8e0d0" }}>{f.label}</span>
                {currentFormat?.key === f.key && <span style={{ marginLeft: "auto", fontSize: 10, color: "#ffd700" }}>✓ Activo</span>}
              </div>
              <div style={{ fontSize: 10, color: "#8888aa", lineHeight: 1.4 }}>{f.desc}</div>
              <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                {f.deckSize > 0 && <span style={{ fontSize: 9, color: "#aaa", background: "#1a1a3e", borderRadius: 4, padding: "1px 6px" }}>{f.deckSize} cartas</span>}
                <span style={{ fontSize: 9, color: "#aaa", background: "#1a1a3e", borderRadius: 4, padding: "1px 6px" }}>♥ {f.life}</span>
                {f.singletons && <span style={{ fontSize: 9, color: "#88ff88", background: "#1a3a1a", borderRadius: 4, padding: "1px 6px" }}>1 copia</span>}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}


// ─── Tutorial Component ───────────────────────────────────────────────────────
const TUTORIAL_STEPS = [
  { title: "¡Bienvenido a MTG Arena ES!", body: "Un simulador de Magic: The Gathering multijugador online. Te guiaremos por las funciones principales.", icon: "🃏" },
  { title: "Selecciona un Formato", body: "Antes de crear tu mazo, elige el formato de juego: Commander, Standard, Legacy y más. Cada uno tiene sus propias reglas y vidas iniciales.", icon: "📋" },
  { title: "Construye tu Mazo", body: "Busca cartas por nombre, importa una lista completa, o carga un mazo guardado. Las cartas no legales en tu formato se marcan automáticamente.", icon: "🔍" },
  { title: "El Comandante", body: "En formatos Commander, busca una criatura legendaria y asígnala como comandante con click derecho → ⚔ Elegir como Comandante.", icon: "⚔️" },
  { title: "Crear o Unirse a una Partida", body: "Crea una nueva partida y comparte el código de 4 letras con tus amigos. También puedes unirte como espectador para ver sin jugar.", icon: "🔗" },
  { title: "El Tablero de Juego", body: "Durante la partida: panel izquierdo = fases del turno, panel derecho = acciones. Click derecho en cualquier carta para ver todas las opciones disponibles.", icon: "🎮" },
  { title: "Acciones con Cartas", body: "Doble click para girar/desgirar. Click derecho para jugar al campo, mover a la mano, añadir contadores, declarar atacante y más.", icon: "🖱️" },
  { title: "Contadores y Estadísticas", body: "Cada jugador tiene contadores de vida ❤, veneno ☠, energía ⚡ y experiencia ✨. Usa los botones + / − para ajustarlos durante la partida.", icon: "📊" },
  { title: "Chat de Voz", body: "Activa el micrófono con el botón 🎙 en el panel de acciones para comunicarte con los otros jugadores en tiempo real.", icon: "🎙" },
  { title: "¡Listo para jugar!", body: "Tus mazos se guardan automáticamente en la nube si estás con sesión iniciada. ¡Buena suerte en tus partidas!", icon: "✨" },
];

function Tutorial({ onClose }) {
  const [step, setStep] = useState(0);
  const s = TUTORIAL_STEPS[step];
  const isLast = step === TUTORIAL_STEPS.length - 1;

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000c", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, fontFamily: "'Crimson Text',Georgia,serif" }}>
      <div style={{ background: "#0d0d1e", border: "1px solid #ffd70066", borderRadius: 20, padding: 32, width: 420, display: "flex", flexDirection: "column", gap: 20, textAlign: "center", boxShadow: "0 20px 60px #000a" }}>
        {/* Step indicator */}
        <div style={{ display: "flex", justifyContent: "center", gap: 5 }}>
          {TUTORIAL_STEPS.map((_, i) => (
            <div key={i} onClick={() => setStep(i)}
              style={{ width: i === step ? 20 : 6, height: 6, borderRadius: 3, background: i === step ? "#ffd700" : i < step ? "#ffd70066" : "#2a2a4a", cursor: "pointer", transition: "all 0.2s" }} />
          ))}
        </div>
        {/* Content */}
        <div style={{ fontSize: 48 }}>{s.icon}</div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#ffd700", marginBottom: 8 }}>{s.title}</div>
          <div style={{ fontSize: 14, color: "#c0b090", lineHeight: 1.6 }}>{s.body}</div>
        </div>
        {/* Navigation */}
        <div style={{ display: "flex", gap: 10 }}>
          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)}
              style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "1px solid #3a3a6a", background: "transparent", color: "#888", cursor: "pointer", fontSize: 14 }}>
              ← Anterior
            </button>
          )}
          <button onClick={() => isLast ? onClose() : setStep(s => s + 1)}
            style={{ flex: 2, padding: "10px 0", borderRadius: 10, border: "none", background: "linear-gradient(90deg,#ffd700,#ff8c00)", color: "#000", fontWeight: 800, fontSize: 14, cursor: "pointer" }}>
            {isLast ? "¡Empezar a jugar! ✦" : "Siguiente →"}
          </button>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 12 }}>
          Saltar tutorial
        </button>
      </div>
    </div>
  );
}

// ─── Auth Modal ───────────────────────────────────────────────────────────────
function AuthModal({ onAuth, onClose }) {
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) return;
    setLoading(true); setError("");
    const fn = mode === "login" ? signInWithEmail : signUpWithEmail;
    const { user, error: err } = await fn(email, password);
    setLoading(false);
    if (err) { setError(err); return; }
    onAuth(user);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000d", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 900, fontFamily: "'Crimson Text',Georgia,serif" }} onClick={onClose}>
      <div style={{ background: "#0d0d1e", border: "1px solid #3a3a6a", borderRadius: 18, padding: 28, width: 380, display: "flex", flexDirection: "column", gap: 16 }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 28, marginBottom: 6 }}>⚔️</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#ffd700" }}>MTG Arena ES</div>
          <div style={{ fontSize: 12, color: "#8888aa", marginTop: 4 }}>
            {mode === "login" ? "Inicia sesión para guardar tus mazos en la nube" : "Crea una cuenta para guardar tus mazos"}
          </div>
        </div>

        {/* Google button */}
        <button onClick={signInWithGoogle}
          style={{ padding: "12px 0", borderRadius: 10, border: "1px solid #3a3a6a", background: "#fff", color: "#333", fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
          <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.2l6.7-6.7C35.8 2.5 30.2 0 24 0 14.6 0 6.6 5.4 2.6 13.3l7.8 6.1C12.4 13 17.8 9.5 24 9.5z" /><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17z" /><path fill="#FBBC05" d="M10.4 28.6A14.8 14.8 0 0 1 9.5 24c0-1.6.3-3.1.8-4.6l-7.8-6.1A23.9 23.9 0 0 0 0 24c0 3.9.9 7.5 2.6 10.7l7.8-6.1z" /><path fill="#34A853" d="M24 48c6.2 0 11.4-2 15.2-5.5l-7.5-5.8c-2 1.4-4.6 2.2-7.7 2.2-6.2 0-11.5-4.2-13.4-9.9l-7.8 6.1C6.6 42.6 14.6 48 24 48z" /></svg>
          Continuar con Google
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ flex: 1, height: 1, background: "#2a2a4a" }} />
          <span style={{ fontSize: 11, color: "#555" }}>o con email</span>
          <div style={{ flex: 1, height: 1, background: "#2a2a4a" }} />
        </div>

        {/* Email/password */}
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" type="email"
          style={{ padding: "10px 14px", borderRadius: 9, border: "1px solid #3a3a6a", background: "#080810", color: "#e8e0d0", fontSize: 14, outline: "none" }} />
        <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Contraseña" type="password"
          onKeyDown={e => e.key === "Enter" && handleSubmit()}
          style={{ padding: "10px 14px", borderRadius: 9, border: "1px solid #3a3a6a", background: "#080810", color: "#e8e0d0", fontSize: 14, outline: "none" }} />

        {error && <div style={{ fontSize: 11, color: "#ff8888", textAlign: "center" }}>{error}</div>}

        <button onClick={handleSubmit} disabled={loading}
          style={{ padding: "12px 0", borderRadius: 10, border: "none", background: "linear-gradient(90deg,#ffd700,#ff8c00)", color: "#000", fontWeight: 800, fontSize: 15, cursor: loading ? "default" : "pointer" }}>
          {loading ? "..." : mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
        </button>

        <button onClick={() => { setMode(m => m === "login" ? "signup" : "login"); setError(""); }}
          style={{ background: "none", border: "none", color: "#8888aa", cursor: "pointer", fontSize: 12, textAlign: "center" }}>
          {mode === "login" ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Inicia sesión"}
        </button>
      </div>
    </div>
  );
}

// ─── HOME SCREEN ─────────────────────────────────────────────────────────────
function HomeScreen({ onNewGame, onJoinGame, onEditDeck, onResumeSession, onClearSession, savedSession, user, onSignIn, onSignOut, onChangeName, onSpectate, onShowTutorial, onQuickFormat }) {
  const [decks, setDecks] = useState(getSavedDecks);
  const [cloudDecks, setCloudDecks] = useState([]);
  const [favoriteDeck, setFavoriteDeck] = useState(() => localStorage.getItem("commander_es_favorite") || "");
  const [filterFormat, setFilterFormat] = useState("all");
  const toggleFavorite = (name) => {
    const newFav = favoriteDeck === name ? "" : name;
    setFavoriteDeck(newFav);
    localStorage.setItem("commander_es_favorite", newFav);
  };
  const [loadingCloud, setLoadingCloud] = useState(false);
  const [cloudDeckName, setCloudDeckName] = useState("");

  const [joinCode, setJoinCode] = useState("");
  const [showJoin, setShowJoin] = useState(false);
  const [expandDecks, setExpandDecks] = useState(false);
  const [renamingDeck, setRenamingDeck] = useState(null);
  const [renameValue, setRenameValue] = useState("");

  const refreshCloudDecks = () => {
    if (!user) return;
    setLoadingCloud(true);
    loadCloudDecks().then(d => { setCloudDecks(d || []); setLoadingCloud(false); });
  };

  useEffect(() => {
    refreshCloudDecks();
  }, [user?.id]);

  useEffect(() => {
    if (expandDecks && user) refreshCloudDecks();
  }, [expandDecks]);

  const refreshDecks = () => setDecks(getSavedDecks());

  const deleteDeck = (name) => {
    if (!confirm(`¿Eliminar el mazo "${name}"?`)) return;
    deleteDeckFromStorage(name);
    refreshDecks();
  };

  const startRename = (deck) => {
    setRenamingDeck(deck.name);
    setRenameValue(deck.name);
  };

  const confirmRename = (deck) => {
    if (!renameValue.trim() || renameValue === deck.name) { setRenamingDeck(null); return; }
    // Save with new name, delete old
    saveDeckToStorage(renameValue.trim(), deck.deck, deck.commander, deck.playerName);
    deleteDeckFromStorage(deck.name);
    setRenamingDeck(null);
    refreshDecks();
  };

  return (
    <div style={{ minHeight: "100vh", background: "radial-gradient(ellipse at 50% 0%, #160a28 0%, #0a0a1e 45%, #060616 100%)", color: "#e8e0d0", fontFamily: "'Crimson Text',Georgia,serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 24, padding: "24px 16px" }}>
      {/* App name top-left */}
      <div style={{ position: "absolute", top: 18, left: 20, fontSize: 13, fontWeight: 800, color: "#ffd70066", letterSpacing: 2, zIndex: 1 }}>MTG ES</div>

      {/* User bar */}
      <div style={{ position: "absolute", top: 16, right: 20, display: "flex", alignItems: "center", gap: 10, zIndex: 1 }}>
        {user ? (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 14px", borderRadius: 20, background: "#1a1a2e", border: "1px solid #2a2a4a" }}>
              <div style={{ width: 26, height: 26, borderRadius: "50%", background: "linear-gradient(135deg,#ffd700,#ff8c00)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#000", flexShrink: 0 }}>
                {(user.email || "?")[0].toUpperCase()}
              </div>
              <span style={{ fontSize: 12, color: "#e8e0d0", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</span>
            </div>
            <button onClick={onChangeName}
              title="Cambiar nombre de jugador"
              style={{ padding: "7px 12px", borderRadius: 10, border: "1px solid #3a3a6a", background: "#1a1a2e", color: "#aaaaff", cursor: "pointer", fontSize: 12 }}>
              ✏ {getSavedPlayerName() || "Poner nombre"}
            </button>
            <button onClick={onSignOut}
              style={{ padding: "7px 14px", borderRadius: 10, border: "1px solid #4a2a2a", background: "#1a0a0a", color: "#ff8888", cursor: "pointer", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
              ↩ Cerrar sesión
            </button>
          </>
        ) : (
          <button onClick={onSignIn} style={{ padding: "8px 18px", borderRadius: 10, border: "1px solid #ffd70044", background: "linear-gradient(135deg,#1a140a,#2a1f0a)", color: "#ffd700", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>
            ✦ Iniciar sesión
          </button>
        )}
      </div>

      {/* Logo */}
      <div style={{ textAlign: "center" }}>
        {/* Animated card suit icons */}
        <div style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: 10, fontSize: 28 }}>
          <span style={{ opacity: 0.7 }}>♠</span>
          <span style={{ opacity: 0.9, color: "#e8e0d0" }}>🃏</span>
          <span style={{ opacity: 0.7, color: "#cc4444" }}>♥</span>
          <span style={{ opacity: 0.9, color: "#e8e0d0" }}>🎴</span>
          <span style={{ opacity: 0.7, color: "#cc4444" }}>♦</span>
        </div>
        <h1 style={{ margin: 0, fontSize: 38, fontWeight: 900, letterSpacing: 3, background: "linear-gradient(90deg,#c0a060,#ffd700,#ff8c00,#ffd700,#c0a060)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>MTG ARENA ES</h1>
        <div style={{ fontSize: 12, color: "#8888aa", marginTop: 5, letterSpacing: 3, textTransform: "uppercase" }}>Magic: The Gathering · Multijugador Online</div>
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
          {FORMATS.filter(f => ["commander", "standard", "legacy", "modern", "vintage", "pauper"].includes(f.key)).map(f => (
            <button key={f.key}
              onClick={() => user ? onQuickFormat(f) : onSignIn()}
              style={{ fontSize: 11, color: "#aaa", background: "#0d0d1a", borderRadius: 20, padding: "4px 12px", border: "1px solid #2a2a3a", cursor: "pointer", transition: "all 0.15s", fontFamily: "inherit" }}
              onMouseOver={e => { e.currentTarget.style.background = "#1a1a3e"; e.currentTarget.style.color = "#ffd700"; e.currentTarget.style.borderColor = "#ffd70044"; }}
              onMouseOut={e => { e.currentTarget.style.background = "#0d0d1a"; e.currentTarget.style.color = "#aaa"; e.currentTarget.style.borderColor = "#2a2a3a"; }}>
              {f.icon} {f.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", maxWidth: 440, position: "relative", zIndex: 1 }}>

        {/* Resume session */}
        {savedSession && (
          <div style={{ background: "#1a2a1a", border: "1px solid #4a8a4a", borderRadius: 14, padding: "14px 18px" }}>
            <div style={{ fontSize: 12, color: "#88ff88", marginBottom: 6, fontWeight: 700 }}>🔄 Partida en curso</div>
            <div style={{ fontSize: 11, color: "#8888aa", marginBottom: 10 }}>
              Sala: <strong style={{ color: "#ffd700" }}>{savedSession.roomCode}</strong>
              <span style={{ color: "#555" }}> · hace {Math.round((Date.now() - (savedSession.savedAt || Date.now())) / 60000)} min</span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => onResumeSession(savedSession)} style={{ flex: 1, padding: "9px 0", borderRadius: 8, border: "none", background: "linear-gradient(90deg,#1a5a1a,#2a8a2a)", color: "#7fff7f", fontWeight: 800, fontSize: 13, cursor: "pointer" }}>▶ Continuar</button>
              <button onClick={onClearSession} style={{ padding: "9px 12px", borderRadius: 8, border: "1px solid #4a2a2a", background: "#1a0a0a", color: "#ff8888", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>🗑</button>
            </div>
          </div>
        )}

        {/* Main actions */}
        {!user ? (
          /* Not logged in — show sign in prompt */
          <div style={{ background: "#0d0d1e", border: "1px solid #ffd70033", borderRadius: 14, padding: "20px 18px", textAlign: "center", display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ fontSize: 14, color: "#ffd700", fontWeight: 700 }}>🃏 Para jugar necesitas una cuenta</div>
            <div style={{ fontSize: 12, color: "#8888aa" }}>Inicia sesión para crear o unirte a una partida y guardar tus mazos en la nube</div>
            <button onClick={onSignIn} style={{ padding: "14px 0", borderRadius: 10, border: "none", background: "linear-gradient(90deg,#ffd700,#ff8c00)", color: "#000", fontWeight: 800, fontSize: 15, cursor: "pointer" }}>
              ✦ Iniciar sesión / Crear cuenta
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => onNewGame(null)}
                style={{ flex: 1, padding: "18px 0", borderRadius: 14, border: "none", background: "linear-gradient(135deg,#c0a030,#ffd700,#ff8c00)", color: "#0a0500", fontSize: 15, cursor: "pointer", fontWeight: 900, letterSpacing: 1, boxShadow: "0 4px 20px #ffd70033" }}>
                ✦ Nueva Partida
              </button>
              <button onClick={() => { setShowJoin(v => !v); }}
                style={{ flex: 1, padding: "18px 0", borderRadius: 14, border: "1px solid #3a6a9a66", background: showJoin ? "#0d2a4a" : "linear-gradient(135deg,#0a1a2a,#0d2040)", color: "#7fc4ff", fontSize: 15, cursor: "pointer", fontWeight: 800, letterSpacing: 1 }}>
                🔗 Unirse
              </button>
            </div>

            {/* Join code input */}
            {showJoin && (
              <div style={{ background: "#0d0d1e", border: "1px solid #2a3a5a", borderRadius: 12, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ fontSize: 12, color: "#8888aa" }}>Código de sala (4 letras)</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <input value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase().slice(0, 4))}
                    onKeyDown={e => e.key === "Enter" && joinCode.length === 4 && onJoinGame(joinCode)}
                    placeholder="XKJF" maxLength={4} autoFocus
                    style={{ flex: 1, padding: "12px 14px", borderRadius: 9, border: "1px solid #3a3a6a", background: "#080810", color: "#e8e0d0", fontSize: 22, outline: "none", textAlign: "center", letterSpacing: 8, fontWeight: 800 }} />
                  <button onClick={() => joinCode.length === 4 && onJoinGame(joinCode)} disabled={joinCode.length < 4}
                    style={{ padding: "12px 18px", borderRadius: 9, border: "none", background: joinCode.length === 4 ? "#1a4a8a" : "#111", color: joinCode.length === 4 ? "#7fc4ff" : "#444", fontSize: 13, cursor: joinCode.length === 4 ? "pointer" : "default", fontWeight: 700 }}>
                    Unirse →
                  </button>
                </div>
                <button onClick={() => joinCode.length === 4 && onSpectate && onSpectate(joinCode)} disabled={joinCode.length < 4}
                  style={{ width: "100%", padding: "8px 0", borderRadius: 8, border: "1px solid #2a3a4a", background: "transparent", color: joinCode.length === 4 ? "#8888aa" : "#333", cursor: joinCode.length === 4 ? "pointer" : "default", fontSize: 12 }}>
                  👁 Entrar como espectador
                </button>
              </div>
            )}
          </>
        )}

        {/* Cloud decks panel — only shown when logged in */}
        {user && (() => {
          // Group decks by format
          const filtered = filterFormat === "all" ? cloudDecks : cloudDecks.filter(d => (d.format?.key || "commander") === filterFormat);
          const byFormat = filtered.reduce((acc, d) => {
            const key = d.format?.key || "commander";
            if (!acc[key]) acc[key] = { fmt: d.format || FORMATS[0], decks: [] };
            acc[key].decks.push(d);
            return acc;
          }, {});

          return (
            <div style={{ background: "#0d0d1e", border: "1px solid #2a4a2a", borderRadius: 12, overflow: "hidden" }}>
              {/* Header with filter */}
              <div style={{ padding: "10px 14px", display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid #2a2a4a" }}>
                <button onClick={() => setExpandDecks(v => !v)}
                  style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, flex: 1, color: "#e8e0d0", padding: 0 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#ffd700" }}>📚 Mis Mazos</span>
                  <span style={{ fontSize: 11, color: "#8888aa" }}>({filtered.length})</span>
                  {loadingCloud
                    ? <span style={{ fontSize: 10, color: "#555" }}>Cargando...</span>
                    : <button onClick={e => { e.stopPropagation(); refreshCloudDecks(); }} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 12, padding: "0 4px" }}>↻</button>}
                  <span style={{ marginLeft: "auto", fontSize: 11, color: "#555" }}>{expandDecks ? "▲" : "▼"}</span>
                </button>
                {/* Format filter */}
                <select value={filterFormat} onChange={e => setFilterFormat(e.target.value)}
                  style={{ padding: "3px 7px", borderRadius: 6, border: "1px solid #2a2a4a", background: "#0a0a18", color: "#aaa", fontSize: 11, cursor: "pointer" }}>
                  <option value="all">Todos los formatos</option>
                  {FORMATS.map(f => <option key={f.key} value={f.key}>{f.icon} {f.label}</option>)}
                </select>
              </div>

              {/* Deck list grouped by format */}
              {expandDecks && (
                <div style={{ maxHeight: 340, overflowY: "auto" }}>
                  {filtered.length === 0 && !loadingCloud && (
                    <div style={{ padding: "16px", textAlign: "center", color: "#444", fontSize: 12 }}>
                      {filterFormat === "all" ? <>Sin mazos guardados.<br /><span style={{ fontSize: 11, color: "#333" }}>Usa 💾 en el constructor para guardarlos.</span></>
                        : `Sin mazos de ${FORMATS.find(f => f.key === filterFormat)?.label || filterFormat}.`}
                    </div>
                  )}
                  {Object.entries(byFormat).map(([fkey, group]) => (
                    <div key={fkey}>
                      {/* Format group header */}
                      <div style={{ padding: "5px 14px", background: "#0a0a14", fontSize: 10, color: "#ffd70099", fontWeight: 700, letterSpacing: 1, display: "flex", alignItems: "center", gap: 5, borderBottom: "1px solid #1a1a2e" }}>
                        <span>{group.fmt.icon}</span>
                        <span>{group.fmt.label}</span>
                        <span style={{ color: "#555" }}>({group.decks.length})</span>
                      </div>
                      {group.decks.map(d => (
                        <div key={d.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 14px", borderBottom: "1px solid #1a1a2e" }}>
                          {d.commander?.image_url
                            ? <img src={d.commander.image_url} style={{ width: 32, height: 44, borderRadius: 3, objectFit: "cover", flexShrink: 0 }} />
                            : <div style={{ width: 32, height: 44, borderRadius: 3, background: "#1a1a3e", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{group.fmt.icon}</div>}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: "#e8e0d0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.name}</div>
                            <div style={{ fontSize: 10, color: "#8888aa" }}>{(d.deck || []).length + (d.commander ? 1 : 0)} cartas{d.commander ? ` · ${d.commander.printed_name || d.commander.name}` : ""}</div>
                          </div>
                          <button onClick={() => onNewGame({ deck: d.deck, commander: d.commander, playerName: d.player_name, format: d.format })}
                            title="Jugar" style={{ padding: "5px 10px", borderRadius: 6, border: "none", background: "linear-gradient(90deg,#ffd700,#ff8c00)", color: "#000", fontWeight: 800, fontSize: 11, cursor: "pointer" }}>▶</button>
                          <button onClick={() => onEditDeck({ deck: d.deck, commander: d.commander, playerName: d.player_name, name: d.name, format: d.format, sideboard: d.sideboard })}
                            title="Editar" style={{ padding: "5px 8px", borderRadius: 6, border: "1px solid #3a3a6a", background: "#1a1a3e", color: "#aaaaff", cursor: "pointer", fontSize: 11 }}>✏</button>
                          <button onClick={async () => { await saveCloudDeck(d.name + " (copia)", d.deck, d.commander, d.player_name, d.format, d.sideboard); refreshCloudDecks(); }}
                            title="Duplicar" style={{ padding: "5px 8px", borderRadius: 6, border: "1px solid #3a3a6a", background: "#1a1a3e", color: "#88ffcc", cursor: "pointer", fontSize: 11 }}>⧉</button>
                          <button onClick={() => deleteCloudDeck(d.id).then(() => setCloudDecks(c => c.filter(x => x.id !== d.id)))}
                            title="Eliminar" style={{ padding: "5px 8px", borderRadius: 6, border: "1px solid #4a2a2a", background: "#1a0a0a", color: "#ff8888", cursor: "pointer", fontSize: 11 }}>🗑</button>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}

              {/* Collapsed summary */}
              {!expandDecks && filtered.length > 0 && (
                <div style={{ padding: "8px 14px", display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {Object.entries(byFormat).map(([fkey, group]) => (
                    <span key={fkey} style={{ fontSize: 11, color: "#8888aa", background: "#0a0a14", borderRadius: 20, padding: "2px 10px" }}>
                      {group.fmt.icon} {group.fmt.label} ({group.decks.length})
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })()}

        {/* Saved decks panel — only when NOT logged in (logged-in users use cloud) */}
        {!user && <div style={{ background: "#0d0d1e", border: "1px solid #2a2a4a", borderRadius: 12, overflow: "hidden" }}>
          {/* Header — always visible */}
          <div style={{ display: "flex", alignItems: "center", padding: "4px 6px 4px 16px" }}>
            <button onClick={() => setExpandDecks(v => !v)}
              style={{ flex: 1, padding: "9px 0", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, color: "#e8e0d0" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#ffd700" }}>📚 Mis Mazos</span>
              <span style={{ fontSize: 11, color: "#8888aa" }}>({decks.length})</span>
              <span style={{ marginLeft: "auto", fontSize: 11, color: "#888" }}>{expandDecks ? "▲ ocultar" : "▼ ver"}</span>
            </button>
            <button onClick={() => onNewGame(null)}
              title="Crear nuevo mazo"
              style={{ marginLeft: 8, padding: "6px 12px", borderRadius: 8, border: "1px solid #ffd70044", background: "#1a140a", color: "#ffd700", cursor: "pointer", fontSize: 11, fontWeight: 700, flexShrink: 0, whiteSpace: "nowrap" }}>
              + Nuevo Mazo
            </button>
          </div>

          {expandDecks && (
            <div style={{ borderTop: "1px solid #2a2a4a" }}>
              {decks.length === 0 && (
                <div style={{ padding: "20px", textAlign: "center", color: "#444", fontSize: 13 }}>
                  No hay mazos guardados aún.<br />
                  <button onClick={() => onNewGame(null)} style={{ marginTop: 10, padding: "7px 18px", borderRadius: 8, border: "none", background: "linear-gradient(90deg,#ffd700,#ff8c00)", color: "#000", fontWeight: 800, fontSize: 12, cursor: "pointer" }}>
                    + Crear primer mazo
                  </button>
                </div>
              )}
              {[...decks].sort((a, b) => a.name === favoriteDeck ? -1 : b.name === favoriteDeck ? 1 : 0).map(d => (
                <div key={d.name} style={{ borderBottom: "1px solid #1a1a2e" }}>
                  {/* Deck row */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px" }}>
                    {/* Commander thumbnail */}
                    {d.commander?.image_url
                      ? <img src={d.commander.image_url} style={{ width: 36, height: 50, borderRadius: 4, objectFit: "cover", flexShrink: 0 }} />
                      : <div style={{ width: 36, height: 50, borderRadius: 4, background: "#1a1a3e", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>⚔</div>}

                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* Name — editable */}
                      {renamingDeck === d.name
                        ? <div style={{ display: "flex", gap: 5, marginBottom: 3 }}>
                          <input value={renameValue} onChange={e => setRenameValue(e.target.value)}
                            onKeyDown={e => { if (e.key === "Enter") confirmRename(d); if (e.key === "Escape") setRenamingDeck(null); }}
                            autoFocus style={{ flex: 1, padding: "3px 8px", borderRadius: 5, border: "1px solid #ffd70066", background: "#0d0d1e", color: "#ffd700", fontSize: 13, outline: "none" }} />
                          <button onClick={() => confirmRename(d)} style={{ padding: "3px 8px", borderRadius: 5, border: "none", background: "#1a4a1a", color: "#7fff7f", cursor: "pointer", fontSize: 11 }}>✓</button>
                          <button onClick={() => setRenamingDeck(null)} style={{ padding: "3px 8px", borderRadius: 5, border: "none", background: "#2a2a3a", color: "#888", cursor: "pointer", fontSize: 11 }}>✕</button>
                        </div>
                        : <div style={{ fontSize: 13, fontWeight: 700, color: "#e8e0d0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.name}</div>}
                      <div style={{ fontSize: 10, color: "#8888aa", marginTop: 1 }}>
                        {d.deck.length + (d.commander ? 1 : 0)} cartas · {d.commander ? getCardName(d.commander) : "Sin comandante"}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
                      {/* Play */}
                      <button onClick={() => onNewGame({ deck: d.deck, commander: d.commander, playerName: d.playerName })}
                        title="Jugar con este mazo"
                        style={{ padding: "6px 10px", borderRadius: 6, border: "none", background: "linear-gradient(90deg,#ffd700,#ff8c00)", color: "#000", fontWeight: 800, fontSize: 11, cursor: "pointer" }}>
                        ▶
                      </button>
                      {/* Edit */}
                      <button onClick={() => onEditDeck(d)}
                        title="Editar mazo"
                        style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #3a3a6a", background: "#1a1a3e", color: "#aaaaff", cursor: "pointer", fontSize: 11 }}>
                        ✏
                      </button>
                      {/* Rename */}
                      <button onClick={() => startRename(d)}
                        title="Renombrar"
                        style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #3a3a6a", background: "#1a1a3e", color: "#ffcc88", cursor: "pointer", fontSize: 11 }}>
                        🏷
                      </button>
                      {/* Delete */}
                      <button onClick={() => deleteDeck(d.name)}
                        title="Eliminar mazo"
                        style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #4a2a2a", background: "#1a0a0a", color: "#ff8888", cursor: "pointer", fontSize: 11 }}>
                        🗑
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>}

        {/* Tutorial button */}
        <button onClick={() => onShowTutorial && onShowTutorial()}
          style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 12, textDecoration: "underline" }}>
          ❓ Ver tutorial
        </button>
      </div>
    </div>
  );
}

// ─── Error Boundary ──────────────────────────────────────────────────────────
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(e) { return { error: e }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ minHeight: "100vh", background: "#0a0a1a", color: "#e8e0d0", fontFamily: "monospace", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 32 }}>
          <div style={{ fontSize: 32 }}>⚠️</div>
          <div style={{ fontSize: 18, color: "#ff8888", fontWeight: 700 }}>Error al cargar el tablero</div>
          <div style={{ fontSize: 12, color: "#888", maxWidth: 600, textAlign: "center", lineHeight: 1.6 }}>{this.state.error?.message}</div>
          <button onClick={() => { this.setState({ error: null }); window.location.reload(); }}
            style={{ padding: "10px 24px", borderRadius: 8, border: "none", background: "linear-gradient(90deg,#ffd700,#ff8c00)", color: "#000", fontWeight: 800, cursor: "pointer", fontSize: 14 }}>
            🏠 Volver al inicio
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [stage, setStage] = useState("home");
  const [deckData, setDeckData] = useState(null);
  const [gameData, setGameData] = useState(null);
  const [showDeckSelector, setShowDeckSelector] = useState(false);
  const [cloudDecksForSelector, setCloudDecksForSelector] = useState([]);
  const [showFormatPicker, setShowFormatPicker] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState(FORMATS[0]);
  const [savedSession, setSavedSession] = useState(() => {
    try { const s = localStorage.getItem("commander_es_session"); return s ? JSON.parse(s) : null; } catch { return null; }
  });
  const [user, setUser] = useState(() => getCurrentUser());
  const [showTutorial, setShowTutorial] = useState(() => !localStorage.getItem("mtg_tutorial_done"));
  const [showAuth, setShowAuth] = useState(false);
  const [playerName, setPlayerName] = useState(() => getSavedPlayerName());
  const [showNameModal, setShowNameModal] = useState(false);

  // Handle OAuth callback on mount
  useEffect(() => {
    const token = handleAuthCallback();
    if (token) {
      setTimeout(() => {
        const u = getCurrentUser();
        setUser(u);
        // Show name modal if no name saved yet
        if (u && !getSavedPlayerName()) setShowNameModal(true);
      }, 500);
    }
  }, []);

  // Show name modal when user logs in for first time
  useEffect(() => {
    if (user && !getSavedPlayerName()) setShowNameModal(true);
  }, [user?.id]);

  const goHome = () => setStage("home");

  const handleGameStart = (players, code, myId, rt) => {
    const isHostPlayer = players.find(p => p.id === myId)?.isHost || false;
    const sessionData = { roomCode: code, myId, turn: 1, playerName: players.find(p => p.id === myId)?.name, savedAt: Date.now(), players, isHost: isHostPlayer };
    localStorage.setItem("commander_es_session", JSON.stringify(sessionData));
    setGameData({ players, myId, rt, roomCode: code });
    setSavedSession(sessionData);
    setStage("game");
  };

  const handleExit = async () => {
    // Save full game state before exiting
    try {
      const sess = JSON.parse(localStorage.getItem("commander_es_session") || "{}");
      if (sess.roomCode && sess.players) {
        const allStates = {};
        Object.entries(players).forEach(([pid, pstate]) => { allStates[pid] = pstate; });
        const snapshot = {
          ...sess,
          players: (sess.players || []).map(p => ({ ...p, playerState: allStates[p.id] || p.playerState })),
          turn, phase, activePlayer,
          turnLog,
          savedAt: Date.now(),
        };
        localStorage.setItem("commander_es_session", JSON.stringify(snapshot));
        localStorage.setItem("commander_es_full_save", JSON.stringify(snapshot));
      }
    } catch { }
    gameData?.rt?.disconnect();
    goHome();
  };

  const handleClearSession = () => {
    localStorage.removeItem("commander_es_session");
    setSavedSession(null);
    if (gameData) { clearGameSession(gameData.roomCode, gameData.myId); }
  };

  if (stage === "home") return (
    <>
      {showTutorial && <Tutorial onClose={() => { setShowTutorial(false); localStorage.setItem("mtg_tutorial_done", "1"); }} />}
      {showAuth && <AuthModal onAuth={(u) => { setUser(u); setShowAuth(false); if (!getSavedPlayerName()) setShowNameModal(true); }} onClose={() => setShowAuth(false)} />}
      {showNameModal && user && (
        <PlayerNameModal user={user} onSave={(name) => { setSavedPlayerName(name); setPlayerName(name); setShowNameModal(false); }} />
      )}
      {showFormatPicker && (
        <FormatSelectorModal
          currentFormat={selectedFormat}
          onSelect={async (f) => {
            setSelectedFormat(f);
            setShowFormatPicker(false);
            // Load decks for this format
            const localDecks = getSavedDecks().filter(d => !d.format || d.format.key === f.key);
            let cloud = [];
            if (user) {
              const all = await loadCloudDecks();
              cloud = all.filter(d => !d.format || d.format.key === f.key);
            }
            setCloudDecksForSelector(cloud.map(d => ({ ...d, _local: false })));
            const combined = [...cloud, ...localDecks];
            if (combined.length > 0) {
              setShowDeckSelector(true);
            } else {
              setStage("deck");
            }
          }}
          onClose={() => setShowFormatPicker(false)}
        />
      )}
      {showDeckSelector && (
        <DeckSelectorModal
          decks={getSavedDecks().filter(d => !d.format || d.format.key === selectedFormat.key)}
          cloudDecks={cloudDecksForSelector}
          onSelect={(d) => {
            setShowDeckSelector(false);
            setDeckData({ deck: d.deck, commander: d.commander, playerName: d.player_name || d.playerName || getUserDisplayName(user) || "Jugador", format: d.format || selectedFormat, isNewDeck: false });
            setStage("lobby");
          }}
          onNew={() => { setShowDeckSelector(false); setStage("deck"); }}
          onClose={() => setShowDeckSelector(false)}
        />
      )}
      <HomeScreen
        user={user}
        onSignIn={() => setShowAuth(true)}
        onSignOut={() => { signOut(); setUser(null); setSavedPlayerName(""); setPlayerName(""); }}
        onChangeName={() => setShowNameModal(true)}
        onShowTutorial={() => setShowTutorial(true)}
        onQuickFormat={async (f) => {
          setSelectedFormat(f);
          const localDecks = getSavedDecks().filter(d => !d.format || d.format.key === f.key);
          let cloud = [];
          if (user) {
            const all = await loadCloudDecks();
            cloud = all.filter(d => !d.format || d.format.key === f.key);
          }
          setCloudDecksForSelector(cloud);
          const combined = [...cloud, ...localDecks];
          if (combined.length > 0) {
            setShowDeckSelector(true);
          } else {
            setStage("deck");
          }
        }}
        onNewGame={async (preloadedDeck) => {
          if (preloadedDeck) { setDeckData(preloadedDeck); setStage("lobby"); return; }
          // Show format selector first, then deck selector
          setShowFormatPicker(true);
        }}
        onSpectate={(code) => {
          // Join as spectator — no deck needed
          const rt = new SupabaseRealtime();
          rt.joinRoom(code);
          setGameData({ players: [], myId: "spectator_" + uid(), rt, roomCode: code, isSpectator: true });
          setStage("game");
        }}
        onJoinGame={(code) => {
          setDeckData(prev => ({ ...(prev || { deck: [], commander: null }), playerName: prev?.playerName || "Jugador", joinCode: code }));
          setStage("deck-join");
        }}
        onEditDeck={(savedDeck) => {
          // Load the saved deck into the builder for editing
          setDeckData({ deck: savedDeck.deck, commander: savedDeck.commander, playerName: savedDeck.playerName, editingName: savedDeck.name });
          setStage("deck-edit");
        }}
        onResumeSession={(session) => {
          setDeckData({ deck: [], commander: null, playerName: session.playerName || "Jugador", wasHost: session.isHost });
          setStage("lobby-resume");
        }}
        onClearSession={() => {
          localStorage.removeItem("commander_es_session");
          setSavedSession(null);
        }}
        savedSession={savedSession}
      />
    </>
  );

  if (stage === "deck" || stage === "deck-join" || stage === "deck-edit") return (
    <DeckBuilder
      initialDeck={stage === "deck-edit" ? deckData?.deck : []}
      initialCommander={stage === "deck-edit" ? deckData?.commander : null}
      initialPlayerName={stage === "deck-edit" ? deckData?.playerName : (playerName || getUserDisplayName(user))}
      initialDeckName={stage === "deck-edit" ? deckData?.editingName : undefined}
      initialFormat={stage === "deck-edit" ? deckData?.format : selectedFormat}
      initialSideboard={stage === "deck-edit" ? deckData?.sideboard : []}
      onReady={d => {
        const joinCode = deckData?.joinCode;
        setDeckData({ ...d, joinCode, isNewDeck: true });
        setStage(joinCode ? "lobby-join" : "lobby");
      }}
      onHome={goHome}
    />
  );

  if (stage === "lobby" || stage === "lobby-resume" || stage === "lobby-join") return (
    <Lobby
      playerName={deckData.playerName || playerName || getUserDisplayName(user) || "Jugador"}
      deckData={deckData}
      resumeCode={stage === "lobby-resume" ? savedSession?.roomCode : stage === "lobby-join" ? deckData?.joinCode : null}
      wasHost={stage === "lobby-resume" ? savedSession?.isHost : false}
      onGameStart={handleGameStart}
      onHome={goHome}
    />
  );

  if (stage === "game") return (
    <ErrorBoundary>
      <GameBoard
        initialPlayers={gameData.players}
        myId={gameData.myId}
        rtInstance={gameData.rt}
        roomCode={gameData.roomCode}
        isSpectator={gameData.isSpectator}
        resumedTurn={gameData.resumedTurn}
        resumedPhase={gameData.resumedPhase}
        resumedActivePlayer={gameData.resumedActivePlayer}
        resumedTurnLog={gameData.resumedTurnLog}
        onExit={handleExit}
        onClearSession={handleClearSession}
        onHome={goHome}
      />
    </ErrorBoundary>
  );
}