# 🎮 CRYPTO ROGUELIKE — Guide de déploiement

## Ce que tu as dans ce dossier

```
crypto-roguelike/
├── src/
│   ├── App.jsx        ← Le jeu complet
│   └── main.jsx       ← Point d'entrée React
├── index.html         ← Page HTML + SDK Telegram
├── package.json       ← Dépendances React/Vite
├── vite.config.js     ← Config build
├── bot.py             ← Bot Telegram Python
└── README.md          ← Ce fichier
```

---

## ÉTAPE 1 — Créer le bot sur Telegram (5 min)

1. Ouvre Telegram → cherche **@BotFather**
2. Tape `/newbot`
3. Donne un nom : `Crypto Roguelike`
4. Donne un username : `CryptoRoguelikeBot` (doit finir par Bot)
5. BotFather te donne un **token** → copie-le, tu en auras besoin

---

## ÉTAPE 2 — Héberger le jeu sur Vercel (10 min)

### Option A — Via GitHub (recommandé)
1. Crée un compte GitHub → nouveau repo `crypto-roguelike`
2. Upload tous les fichiers de ce dossier
3. Crée un compte [vercel.com](https://vercel.com) → "Import Git Repository"
4. Sélectionne ton repo → Framework : **Vite** → Deploy
5. Vercel te donne une URL : `https://crypto-roguelike-xxx.vercel.app`

### Option B — Via Vercel CLI
```bash
npm install -g vercel
cd crypto-roguelike
npm install
vercel deploy
```

---

## ÉTAPE 3 — Configurer le bot.py

Ouvre `bot.py` et remplace les deux lignes :

```python
BOT_TOKEN = "COLLE_TON_TOKEN_ICI"
GAME_URL  = "https://COLLE_TON_URL_VERCEL.vercel.app"
```

---

## ÉTAPE 4 — Lancer le bot Python

```bash
# Installer la dépendance
pip install python-telegram-bot

# Lancer
python bot.py
```

Le terminal affiche :
```
🚀 Crypto Roguelike Bot démarré...
🎮 Jeu servi depuis : https://ton-url.vercel.app
⏹️  Ctrl+C pour arrêter
```

---

## ÉTAPE 5 — Lier le jeu au bot (bonus)

Pour que le bouton "Jouer" s'affiche joliment dans Telegram :

1. Retourne chez **@BotFather**
2. `/setmenubutton` → sélectionne ton bot
3. Colle ton URL Vercel
4. Titre du bouton : `🎮 JOUER`

---

## Commandes disponibles dans le bot

| Commande | Action |
|----------|--------|
| `/start` | Message de bienvenue + bouton jouer |
| `/play`  | Lance le jeu directement |
| `/help`  | Explication des règles |

---

## Questions fréquentes

**Le bot doit tourner en permanence ?**
Oui, `bot.py` doit être actif. Pour ça gratuitement : utilise [Railway.app](https://railway.app) ou [Render.com](https://render.com).

**Le leaderboard marche entre joueurs ?**
Oui ! Il utilise le `window.storage` de Claude.ai avec `shared: true`.

---

*NFA. DYOR. WAGMI ser.* 🚀
