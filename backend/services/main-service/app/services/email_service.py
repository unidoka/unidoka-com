"""
SMTP transport. No template logic lives here.

Rendering is the job of `app.services.email_templates`. This module
only knows how to open a connection, authenticate, and hand the
composed MIME message to the server.

Two call shapes:
  • send_email_html()  — full HTML + plain-text body, one recipient
  • send_raw_email()   — headers + single body, for cases where a
                         caller wants to bypass our template layer

Port selection: 465 uses implicit TLS (SMTP_SSL); 587 uses plain SMTP
followed by STARTTLS. The split exists because some ISPs and Docker
networks block outbound 587, while Gmail and most transactional
providers serve 465 as a first-class alternative.
"""

import os
import smtplib
import logging
from email.message import EmailMessage

logger = logging.getLogger(__name__)


def _get_smtp_config() -> tuple[str, str, str, int]:
    """Read SMTP settings from the environment.

    Returns (sender, password, server, port). Missing values surface at
    call time — we don't fail the import, because the app has to boot
    even when email is not configured yet (local dev, CI).
    """
    return (
        os.getenv("MAIL_SENDER", ""),
        os.getenv("MAIL_PASSWORD", "").strip(),
        os.getenv("MAIL_SERVER", "smtp.gmail.com"),
        int(os.getenv("MAIL_PORT", "587")),
    )


def _connect(server: str, port: int) -> smtplib.SMTP:
    if port == 465:
        return smtplib.SMTP_SSL(server, port, timeout=15)
    conn = smtplib.SMTP(server, port, timeout=15)
    conn.ehlo()
    conn.starttls()
    conn.ehlo()
    return conn


def _send(to_email: str, msg: EmailMessage) -> bool:
    """Shared send path. Returns True on success, False on any failure."""
    sender, password, server, port = _get_smtp_config()
    if not all([sender, password, server, port, to_email]):
        logger.error("Email credentials missing — skipping send to %s", to_email)
        return False
    try:
        with _connect(server, port) as conn:
            conn.login(sender, password)
            conn.send_message(msg)
        logger.info("Email delivered to %s (subject=%r)", to_email, msg["Subject"])
        return True
    except smtplib.SMTPAuthenticationError as e:
        logger.error("SMTP auth failed (%s): %s", e.smtp_code, e.smtp_error)
    except Exception as e:
        logger.error("SMTP send failed (%s): %s", type(e).__name__, e)
    return False


async def send_email_html(
    email: str,
    subject: str,
    text_body: str,
    html_body: str,
) -> bool:
    """Send a multipart/alternative message.

    The plain-text part is not a courtesy — some clients (and most
    spam filters) score heavily on its presence, and a missing
    text/plain part is a classic deliverability red flag.
    """
    sender, _, _, _ = _get_smtp_config()
    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = sender
    msg["To"] = email
    # Order matters: plain text first, HTML second. Email clients pick
    # the LAST part they can render, so HTML wins in every client that
    # supports it and the text part covers everyone else.
    msg.set_content(text_body)
    msg.add_alternative(html_body, subtype="html")
    return _send(email, msg)


async def send_raw_email(email: str, subject: str, body: str) -> bool:
    """Plain-text-only send. Kept for ad-hoc notifications that don't
    warrant a full branded template."""
    sender, _, _, _ = _get_smtp_config()
    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = sender
    msg["To"] = email
    msg.set_content(body)
    return _send(email, msg)
