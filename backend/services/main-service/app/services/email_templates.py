"""
Email templates — table-based, inline-styled, light-theme-locked.

Compatibility notes
-------------------
Layout is nested <table role="presentation">, no flex, no grid, no div
scaffolding. Outlook 2007+ renders mail with Word's HTML engine, which
supports neither flexbox nor grid — table layout is the only way to
align the code block and the CTA button reliably.

Every visual rule is inline. Gmail strips <style> blocks in the
Promotions tab and when a message is clipped, so the <style> element
below carries only the two things that can't be inlined: the mobile
media query and the dark-mode override. Both degrade gracefully if the
client drops them.

Widths cap at 600px, the industry default — wider than that triggers
horizontal scrolling in Outlook's reading pane.

Light theme is forced, not preferred. The `color-scheme: light only`
meta tags tell iOS Mail, Apple Mail, and Outlook.com not to auto-invert.
Gmail ignores these, so every surface also carries an explicit
`background-color` and every text node an explicit `color` — clients
that invert light→dark either respect the meta tag or hit our
`!important` overrides in the dark-mode media query.

Fonts are system stacks only. We can't load a webfont: most clients
block external CSS, Outlook doesn't support @font-face at all, and
Gmail strips the <link> tag. The monospace stack used for the code
block (SF Mono / Consolas / Menlo / Courier New) has near-100%
installed coverage across desktop and mobile.

Reusing this module
-------------------
To add a new email type:
  1. Add a translation block under TRANSLATIONS[lang][your_type]
  2. Write a render_your_type_email() that builds body_html and calls
     _base_layout(lang=..., preheader=..., body_html=..., t=t)
  3. Return (subject, text_body, html_body) so it matches the existing
     signatures. Callers pass all three straight to send_email_html().
"""

from typing import Optional


# ═══════════════════════════════════════════════════════════════════
# Translations
# ═══════════════════════════════════════════════════════════════════
# Single source of truth for every string in every email. Adding a
# locale is one new top-level key; adding an email type is one new
# block under each existing locale.
#
# `lang` values arriving from the request are constrained to "en" / "ru"
# by the pydantic schemas, but we defensively fall back to Russian for
# anything unexpected — matching the app-wide default.
TRANSLATIONS: dict[str, dict] = {
    "ru": {
        "brand": "Юнидока",
        "site_url": "https://unidoka.com",
        "site_label": "unidoka.com",
        "year": "2026",
        "footer_legal": "Это письмо отправлено автоматически. Не отвечайте на него.",
        "footer_rights": "Все права защищены.",
        "verification": {
            "subject": "Код подтверждения — Юнидока",
            "preheader": "Ваш код: {code}. Действует 5 минут.",
            "title": "Подтверждение email",
            "greeting": "Здравствуйте!",
            "intro": "Вы регистрируетесь в Юнидоке. Введите код ниже, чтобы подтвердить адрес:",
            "expiry": "Код действует 5 минут.",
            "ignore_title": "Не запрашивали код?",
            "ignore_body": (
                "Если вы не регистрировались в Юнидоке, просто "
                "проигнорируйте это письмо. Ваш аккаунт в безопасности, "
                "никаких действий не требуется."
            ),
        },
        "password_reset": {
            "subject": "Сброс пароля — Юнидока",
            "preheader": "Ссылка для сброса пароля. Действует 30 минут.",
            "title": "Сброс пароля",
            "greeting": "Здравствуйте!",
            "intro": (
                "Мы получили запрос на сброс пароля для вашего аккаунта "
                "в Юнидоке. Нажмите кнопку ниже, чтобы задать новый пароль:"
            ),
            "cta": "Задать новый пароль",
            "fallback": "Если кнопка не работает, скопируйте ссылку:",
            "expiry": "Ссылка действует 30 минут.",
            "ignore_title": "Не запрашивали сброс?",
            "ignore_body": (
                "Если вы не запрашивали сброс пароля, просто проигнорируйте "
                "это письмо. Ваш пароль останется прежним, никаких "
                "действий не требуется."
            ),
        },
    },
    "en": {
        "brand": "Unidoka",
        "site_url": "https://unidoka.com",
        "site_label": "unidoka.com",
        "year": "2026",
        "footer_legal": "This message was sent automatically. Please do not reply.",
        "footer_rights": "All rights reserved.",
        "verification": {
            "subject": "Verification code — Unidoka",
            "preheader": "Your code is {code}. Valid for 5 minutes.",
            "title": "Verify your email",
            "greeting": "Hello,",
            "intro": "You're signing up for Unidoka. Enter the code below to confirm your email address:",
            "expiry": "This code expires in 5 minutes.",
            "ignore_title": "Didn't request this code?",
            "ignore_body": (
                "If you did not sign up for Unidoka, you can safely ignore "
                "this email. Your account is safe, and no action is required."
            ),
        },
        "password_reset": {
            "subject": "Reset your password — Unidoka",
            "preheader": "Password reset link. Valid for 30 minutes.",
            "title": "Reset your password",
            "greeting": "Hello,",
            "intro": (
                "We received a request to reset the password for your "
                "Unidoka account. Click the button below to choose a new one:"
            ),
            "cta": "Set new password",
            "fallback": "If the button doesn't work, copy the link:",
            "expiry": "This link expires in 30 minutes.",
            "ignore_title": "Didn't request a reset?",
            "ignore_body": (
                "If you did not request a password reset, you can safely "
                "ignore this email. Your password will remain unchanged, "
                "and no action is required."
            ),
        },
    },
}

# Font stacks. Emails can't load webfonts, so we lean on what's
# installed on the reader's machine. Both stacks are ordered
# most-modern-first with a web-safe fallback last.
FONT_SANS = (
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, "
    "Helvetica, Arial, sans-serif"
)
FONT_MONO = "'SF Mono', Consolas, Menlo, 'Courier New', monospace"


def _resolve_lang(lang: Optional[str]) -> str:
    """Normalize an incoming lang code to a key present in TRANSLATIONS."""
    if not lang:
        return "ru"
    key = lang.strip().lower()
    return key if key in TRANSLATIONS else "ru"


# ═══════════════════════════════════════════════════════════════════
# Shared chrome
# ═══════════════════════════════════════════════════════════════════
def _base_layout(
    *,
    lang: str,
    preheader: str,
    body_html: str,
    t: dict,
) -> str:
    """Wrap rendered body content in the shared email chrome.

    `body_html` is injected verbatim into a 600px-wide card between the
    header strip (brand + host) and the footer strip (legal notice +
    copyright). Every template in this module funnels through here, so
    brand consistency is a single-file concern.
    """
    # The preheader is the hidden snippet clients show next to the
    # subject in the inbox list. Zero-width joiners pad it so the client
    # doesn't accidentally pull in the first body sentence.
    pad = "&#8203;&#847;" * 12

    return f"""<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="{lang}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="x-apple-disable-message-reformatting" />
  <meta name="format-detection" content="telephone=no, date=no, address=no, email=no" />
  <!-- Light-theme lock. Honored by iOS Mail, Apple Mail, Outlook.com.
       Gmail ignores it, which is why every surface below carries an
       explicit background-color and every text node an explicit color. -->
  <meta name="color-scheme" content="light only" />
  <meta name="supported-color-schemes" content="light only" />
  <title>{t["brand"]}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style type="text/css">
    :root {{ color-scheme: light only; supported-color-schemes: light only; }}
    /* Fallback override for clients that ignore the meta tags above.
       `!important` is required — the client's inversion rules ship
       with matching specificity and land in a stylesheet appended
       after ours. */
    @media (prefers-color-scheme: dark) {{
      .fl-bg {{ background-color: #f4f4f5 !important; }}
      .fl-card {{ background-color: #ffffff !important; }}
      .fl-surface {{ background-color: #f4f4f5 !important; }}
      .fl-soft {{ background-color: #fafafa !important; }}
      .fl-text {{ color: #18181b !important; }}
      .fl-muted {{ color: #52525b !important; }}
      .fl-dim {{ color: #a1a1aa !important; }}
      .fl-border {{ border-color: #e4e4e7 !important; }}
      .fl-divider {{ border-color: #f4f4f5 !important; }}
      a {{ color: #18181b !important; }}
    }}
    /* Outlook adds a 15px lspace/rspace around every table unless told
       otherwise. Zeroing it here keeps our padding numbers honest. */
    table {{ border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }}
    img {{ -ms-interpolation-mode: bicubic; border: 0; outline: none; }}
    a {{ color: #18181b; }}
  </style>
</head>
<body style="margin:0; padding:0; width:100%; background-color:#f4f4f5; -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%;" class="fl-bg">

  <!-- Inbox preheader — hidden from the body, shown in the list view.
       Trailing zero-width characters stop the client from pulling the
       first line of visible body copy into the snippet. -->
  <div style="display:none; font-size:1px; color:#f4f4f5; line-height:1px; max-height:0; max-width:0; opacity:0; overflow:hidden; mso-hide:all; font-family:{FONT_SANS};">
    {preheader}{pad}
  </div>

  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f4f4f5;" class="fl-bg">
    <tr>
      <td align="center" style="padding: 40px 16px;">

        <!--[if mso]>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600"><tr><td>
        <![endif]-->

        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:600px; background-color:#ffffff; border-radius:16px;" class="fl-card">

          <!-- ── Header ─────────────────────────────────────────── -->
          <tr>
            <td style="padding: 24px 40px; border-bottom: 1px solid #f4f4f5;" class="fl-card fl-divider">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td align="left" style="font-family:{FONT_SANS}; font-size:15px; font-weight:600; letter-spacing:-0.01em; color:#18181b; mso-line-height-rule:exactly; line-height:20px;" class="fl-text">
                    {t["brand"]}
                  </td>
                  <td align="right" style="font-family:{FONT_MONO}; font-size:11px; letter-spacing:0.06em; color:#a1a1aa; mso-line-height-rule:exactly; line-height:20px;" class="fl-dim">
                    {t["site_label"]}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── Body ───────────────────────────────────────────── -->
          <tr>
            <td style="padding: 40px 40px 36px;" class="fl-card">
              {body_html}
            </td>
          </tr>

          <!-- ── Footer ─────────────────────────────────────────── -->
          <tr>
            <td style="padding: 22px 40px 28px; border-top: 1px solid #f4f4f5;" class="fl-card fl-divider">
              <p style="margin:0 0 6px; font-family:{FONT_SANS}; font-size:12px; color:#71717a; mso-line-height-rule:exactly; line-height:18px;" class="fl-muted">
                {t["footer_legal"]}
              </p>
              <p style="margin:0; font-family:{FONT_SANS}; font-size:12px; color:#a1a1aa; mso-line-height-rule:exactly; line-height:18px;" class="fl-dim">
                © {t["year"]} {t["brand"]} &nbsp;·&nbsp; {t["footer_rights"]}
              </p>
            </td>
          </tr>

        </table>

        <!--[if mso]>
        </td></tr></table>
        <![endif]-->

      </td>
    </tr>
  </table>
</body>
</html>"""


# ═══════════════════════════════════════════════════════════════════
# Shared partials
# ═══════════════════════════════════════════════════════════════════
def _heading(text: str) -> str:
    return (
        f'<h1 style="margin:0 0 16px; font-family:{FONT_SANS}; '
        f'font-size:26px; font-weight:600; letter-spacing:-0.02em; '
        f'color:#18181b; mso-line-height-rule:exactly; line-height:34px;" '
        f'class="fl-text">{text}</h1>'
    )


def _paragraph(text: str, *, tone: str = "body", margin_bottom: int = 20) -> str:
    """`tone` is one of body | muted | dim — maps to text colors."""
    colors = {"body": "#18181b", "muted": "#52525b", "dim": "#71717a"}
    classes = {"body": "fl-text", "muted": "fl-muted", "dim": "fl-muted"}
    return (
        f'<p style="margin:0 0 {margin_bottom}px; font-family:{FONT_SANS}; '
        f'font-size:15px; color:{colors[tone]}; mso-line-height-rule:exactly; '
        f'line-height:24px;" class="{classes[tone]}">{text}</p>'
    )


def _legal_notice(title: str, body: str) -> str:
    """Framed callout for the "you can ignore this email" note.

    A bordered box, distinct from body copy, so a user scanning for the
    code can't miss the security reassurance. Left-bar design keeps it
    visually subordinate to the main content while still being a
    distinct region — no background fill, no screaming border.
    """
    return f"""
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:8px;">
        <tr>
          <td style="background-color:#fafafa; border-left:3px solid #e4e4e7; border-radius:0 8px 8px 0; padding:14px 16px;" class="fl-soft">
            <p style="margin:0 0 4px; font-family:{FONT_SANS}; font-size:13px; font-weight:600; color:#18181b; mso-line-height-rule:exactly; line-height:20px;" class="fl-text">
              {title}
            </p>
            <p style="margin:0; font-family:{FONT_SANS}; font-size:13px; color:#52525b; mso-line-height-rule:exactly; line-height:20px;" class="fl-muted">
              {body}
            </p>
          </td>
        </tr>
      </table>"""


def _code_block(code: str, *, label: str) -> str:
    """Big letter-spaced code, centered in a rounded tile.

    Border-radius on a table cell isn't honored by Outlook's Word
    engine, so Outlook gets a flat rectangle with the same padding and
    the code still centered and legible. Every modern client gets the
    rounded corners.

    `padding-left` compensates for the trailing `letter-spacing` on the
    last digit — without it, the visual center of the digits sits a few
    pixels left of the tile center.
    """
    return f"""
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:4px 0 24px;">
        <tr>
          <td align="center">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td align="center" bgcolor="#f4f4f5" style="background-color:#f4f4f5; border:1px solid #e4e4e7; border-radius:14px; padding:20px 36px 20px 46px;" class="fl-surface fl-border" aria-label="{label}">
                  <span style="font-family:{FONT_MONO}; font-size:30px; font-weight:600; letter-spacing:10px; color:#18181b; mso-line-height-rule:exactly; line-height:38px;" class="fl-text">{code}</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>"""


def _cta_button(url: str, label: str) -> str:
    """Bulletproof button.

    The background color lives on the wrapping `<td>`, not the `<a>`.
    Outlook's Word engine ignores background-color on inline elements,
    so a styled `<a>` would render as bare text. The cell also carries
    `mso-padding-alt` so Outlook's vertical padding matches the CSS
    padding used by everyone else.

    `border-radius` is a no-op in Outlook — accepted, button still
    reads as a button there.
    """
    return f"""
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin: 8px auto 28px;">
        <tr>
          <td align="center" bgcolor="#18181b" style="background-color:#18181b; border-radius:10px; mso-padding-alt: 14px 28px;">
            <a href="{url}" target="_blank" style="display:inline-block; padding:14px 28px; font-family:{FONT_SANS}; font-size:15px; font-weight:500; color:#ffffff; text-decoration:none; border-radius:10px; mso-line-height-rule:exactly; line-height:20px;">
              {label}
            </a>
          </td>
        </tr>
      </table>"""


# ═══════════════════════════════════════════════════════════════════
# Verification email
# ═══════════════════════════════════════════════════════════════════
def render_verification_email(
    *,
    code: str,
    email: str,
    lang: Optional[str] = None,
) -> tuple[str, str, str]:
    """Build the email-verification message.

    Returns (subject, text_body, html_body). The plain-text variant is
    a first-class fallback for clients that render text/plain, and for
    the rare inbox that refuses HTML entirely.
    """
    lang_code = _resolve_lang(lang)
    t = TRANSLATIONS[lang_code]
    v = t["verification"]

    preheader = v["preheader"].format(code=code)

    body_html = (
        _heading(v["title"])
        + _paragraph(v["greeting"], margin_bottom=8)
        + _paragraph(v["intro"], tone="muted", margin_bottom=8)
        + _code_block(code, label=v["expiry"])
        + _paragraph(v["expiry"], tone="dim", margin_bottom=24)
        + _legal_notice(v["ignore_title"], v["ignore_body"])
    )

    html = _base_layout(
        lang=lang_code,
        preheader=preheader,
        body_html=body_html,
        t=t,
    )

    text = f"""{v["title"]}

{v["greeting"]}

{v["intro"]}

    {code}

{v["expiry"]}

{v["ignore_title"]}
{v["ignore_body"]}

--
{t["footer_legal"]}
© {t["year"]} {t["brand"]} - {t["footer_rights"]}
"""

    return v["subject"], text, html


# ═══════════════════════════════════════════════════════════════════
# Password reset email
# ═══════════════════════════════════════════════════════════════════
def render_password_reset_email(
    *,
    reset_url: str,
    lang: Optional[str] = None,
) -> tuple[str, str, str]:
    """Build the password-reset message.

    Returns (subject, text_body, html_body), same contract as
    render_verification_email().
    """
    lang_code = _resolve_lang(lang)
    t = TRANSLATIONS[lang_code]
    p = t["password_reset"]

    # The raw URL is shown as a copy-paste fallback. Some clients strip
    # or mangle anchor hrefs, and some users prefer to paste manually.
    fallback_block = (
        f'<p style="margin:0 0 6px; font-family:{FONT_SANS}; font-size:13px; '
        f'color:#71717a; mso-line-height-rule:exactly; line-height:20px;" '
        f'class="fl-muted">{p["fallback"]}</p>'
        f'<p style="margin:0 0 28px; font-family:{FONT_MONO}; font-size:12px; '
        f'color:#18181b; word-break:break-all; mso-line-height-rule:exactly; '
        f'line-height:18px;" class="fl-text">'
        f'<a href="{reset_url}" target="_blank" style="color:#18181b; text-decoration:underline;">{reset_url}</a>'
        f'</p>'
    )

    body_html = (
        _heading(p["title"])
        + _paragraph(p["greeting"], margin_bottom=8)
        + _paragraph(p["intro"], tone="muted", margin_bottom=8)
        + _cta_button(reset_url, p["cta"])
        + fallback_block
        + _paragraph(p["expiry"], tone="dim", margin_bottom=24)
        + _legal_notice(p["ignore_title"], p["ignore_body"])
    )

    html = _base_layout(
        lang=lang_code,
        preheader=p["preheader"],
        body_html=body_html,
        t=t,
    )

    text = f"""{p["title"]}

{p["greeting"]}

{p["intro"]}

    {reset_url}

{p["expiry"]}

{p["ignore_title"]}
{p["ignore_body"]}

--
{t["footer_legal"]}
© {t["year"]} {t["brand"]} - {t["footer_rights"]}
"""

    return p["subject"], text, html
