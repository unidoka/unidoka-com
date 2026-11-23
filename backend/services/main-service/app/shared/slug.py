"""URL slug generation.

Every auto-generated slug in the API goes through here so the result is
always URL-safe ASCII: lowercase a-z, digits 0-9, and single hyphens.
Cyrillic titles are transliterated rather than dropped; anything else
non-ASCII is removed, and an empty result falls back to a stable word.
"""
import re
import unicodedata
from typing import Final

TRANSLIT_MAP: Final[dict[str, str]] = {
    "а": "a", "б": "b", "в": "v", "г": "g", "д": "d", "е": "e", "ё": "e",
    "ж": "zh", "з": "z", "и": "i", "й": "y", "к": "k", "л": "l", "м": "m",
    "н": "n", "о": "o", "п": "p", "р": "r", "с": "s", "т": "t", "у": "u",
    "ф": "f", "х": "kh", "ц": "ts", "ч": "ch", "ш": "sh", "щ": "shch",
    "ъ": "", "ы": "y", "ь": "", "э": "e", "ю": "yu", "я": "ya",
    # Ukrainian letters that otherwise disappear during the ASCII fold.
    "і": "i", "ї": "i", "є": "e", "ґ": "g",
}


def slugify(text: str, fallback: str = "item", max_length: int = 180) -> str:
    value = (text or "").lower().strip()
    value = "".join(TRANSLIT_MAP.get(char, char) for char in value)
    # Fold accents (é → e) and drop everything non-ASCII.
    value = unicodedata.normalize("NFKD", value)
    value = value.encode("ascii", "ignore").decode("ascii")
    value = value.lower()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    value = re.sub(r"-+", "-", value).strip("-")
    return value[:max_length].strip("-") or fallback
