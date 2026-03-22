"""
╔══════════════════════════════════════════╗
║         CRYPTO ROGUELIKE BOT             ║
║    python-telegram-bot v20+              ║
╚══════════════════════════════════════════╝

INSTALLATION :
    pip install python-telegram-bot

LANCEMENT :
    python bot.py
"""

import logging
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import Application, CommandHandler, ContextTypes

# ─────────────────────────────────────────
# ⚙️  CONFIG — REMPLACE CES DEUX VALEURS
# ─────────────────────────────────────────
BOT_TOKEN   = "COLLE_TON_TOKEN_ICI"          # Token donné par @BotFather
GAME_URL    = "https://COLLE_TON_URL_VERCEL.vercel.app"  # URL Vercel de ton jeu
# ─────────────────────────────────────────

logging.basicConfig(
    format="%(asctime)s — %(name)s — %(levelname)s — %(message)s",
    level=logging.INFO
)
logger = logging.getLogger(__name__)


# ══════════════════════════════════════════
# /start  — Message de bienvenue
# ══════════════════════════════════════════
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user = update.effective_user
    first_name = user.first_name or "Ser"

    text = (
        f"⚡ *GM {first_name}!*\n\n"
        "Bienvenue dans *CRYPTO ROGUELIKE* — le seul jeu où tu peux perdre ton portfolio virtuel "
        "ET apprendre à trader pour de vrai.\n\n"
        "🎴 Runs courts • 📊 Skill > Chance • 🏆 Leaderboard mondial\n\n"
        "_NFA. DYOR. WAGMI ser._ 🚀"
    )

    keyboard = InlineKeyboardMarkup([
        [InlineKeyboardButton("🎮  JOUER MAINTENANT", web_app=WebAppInfo(url=GAME_URL))],
        [InlineKeyboardButton("🏆 Leaderboard", callback_data="leaderboard"),
         InlineKeyboardButton("❓ Aide", callback_data="help")],
    ])

    await update.message.reply_text(text, parse_mode="Markdown", reply_markup=keyboard)


# ══════════════════════════════════════════
# /play  — Lance directement le jeu
# ══════════════════════════════════════════
async def play(update: Update, context: ContextTypes.DEFAULT_TYPE):
    keyboard = InlineKeyboardMarkup([
        [InlineKeyboardButton("🎮  OUVRIR LE JEU", web_app=WebAppInfo(url=GAME_URL))]
    ])
    await update.message.reply_text(
        "⚡ *Let's go ser !* Clique pour lancer le run ↓",
        parse_mode="Markdown",
        reply_markup=keyboard
    )


# ══════════════════════════════════════════
# /help  — Explication du jeu
# ══════════════════════════════════════════
async def help_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE):
    text = (
        "📖 *Comment jouer*\n\n"
        "*Objectif :* Fais grandir ton portfolio de 1 000 USDT en 8 rounds + 1 boss.\n\n"
        "*Actions disponibles :*\n"
        "⚡ Entry Early — risqué mais gros gains potentiels\n"
        "✅ Wait/Confirm — entrée sûre, gains modérés\n"
        "🚫 Ignore — skip le token, économise de l'énergie\n"
        "🔍 Scan Wallets — info on-chain avant de décider\n\n"
        "*Cartes :* Débloque des modificateurs tous les 3 rounds.\n"
        "*Boss :* Survive au boss final pour le score max.\n\n"
        "*Commandes :*\n"
        "/play — Lancer le jeu\n"
        "/help — Ce message\n\n"
        "_NFA. DYOR. Probably nothing._ 🐸"
    )
    await update.message.reply_text(text, parse_mode="Markdown")


# ══════════════════════════════════════════
# Callback buttons (inline keyboard)
# ══════════════════════════════════════════
async def button_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()

    if query.data == "help":
        text = (
            "📖 *Comment jouer*\n\n"
            "⚡ Entry Early — risqué\n"
            "✅ Wait/Confirm — safe\n"
            "🚫 Ignore — skip\n"
            "🔍 Scan — info on-chain\n\n"
            "8 rounds + boss final. Bonne chance ser 🎮"
        )
        await query.edit_message_text(text, parse_mode="Markdown",
            reply_markup=InlineKeyboardMarkup([
                [InlineKeyboardButton("🎮 Jouer", web_app=WebAppInfo(url=GAME_URL))]
            ])
        )

    elif query.data == "leaderboard":
        await query.edit_message_text(
            "🏆 *Hall of Legends*\n\nLe leaderboard est directement dans le jeu — clique pour voir ton rang !",
            parse_mode="Markdown",
            reply_markup=InlineKeyboardMarkup([
                [InlineKeyboardButton("🎮 Voir le leaderboard", web_app=WebAppInfo(url=GAME_URL))]
            ])
        )


# ══════════════════════════════════════════
# MAIN
# ══════════════════════════════════════════
def main():
    if BOT_TOKEN == "COLLE_TON_TOKEN_ICI":
        print("\n❌ ERREUR : Tu dois coller ton token BotFather dans bot.py ligne 22\n")
        return

    print("🚀 Crypto Roguelike Bot démarré...")
    print(f"🎮 Jeu servi depuis : {GAME_URL}")
    print("⏹️  Ctrl+C pour arrêter\n")

    app = Application.builder().token(BOT_TOKEN).build()

    app.add_handler(CommandHandler("start",   start))
    app.add_handler(CommandHandler("play",    play))
    app.add_handler(CommandHandler("help",    help_cmd))

    from telegram.ext import CallbackQueryHandler
    app.add_handler(CallbackQueryHandler(button_callback))

    app.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    main()
