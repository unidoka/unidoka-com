from unittest.mock import AsyncMock, MagicMock

import pytest

from app.bot import cmd_start, cmd_help


def _message(chat_id: int = 42) -> MagicMock:
    m = MagicMock()
    m.chat.id = chat_id
    m.answer = AsyncMock()
    return m


@pytest.mark.asyncio
async def test_start_greets():
    m = _message()
    await cmd_start(m)
    m.answer.assert_awaited_once()
    assert "Hello" in m.answer.await_args.args[0]


@pytest.mark.asyncio
async def test_help_lists_commands():
    m = _message()
    await cmd_help(m)
    text = m.answer.await_args.args[0]
    assert "/start" in text
    assert "/help" in text
