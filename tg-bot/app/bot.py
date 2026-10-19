import os
import sys
import asyncio
import logging

from aiogram import Bot, Dispatcher, types
from aiogram.filters import Command
from aiogram.client.default import DefaultBotProperties
from aiogram.types import BotCommand

logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] %(levelname)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
log = logging.getLogger("tg-bot")

TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")

bot = Bot(token=TOKEN, default=DefaultBotProperties(parse_mode="HTML"))
dp = Dispatcher()


@dp.message(Command("start"))
async def cmd_start(message: types.Message) -> None:
    await message.answer("👋 Hello, world!")


@dp.message(Command("help"))
async def cmd_help(message: types.Message) -> None:
    await message.answer("<b>Commands</b>\n/start — greet\n/help — this message")


async def main() -> None:
    if not TOKEN:
        log.error("TELEGRAM_BOT_TOKEN is not set")
        sys.exit(1)
    await bot.set_my_commands([
        BotCommand(command="start", description="Greet"),
        BotCommand(command="help", description="Show commands"),
    ])
    log.info("Bot started")
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
