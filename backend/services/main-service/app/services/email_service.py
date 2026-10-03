import smtplib
from email.message import EmailMessage
import os
import logging

logger = logging.getLogger(__name__)


def _get_smtp_config():
    """Read SMTP settings from env. Port 465 implies SSL, 587 implies STARTTLS."""
    sender = os.getenv("MAIL_SENDER")
    password = os.getenv("MAIL_PASSWORD", "").strip()
    server = os.getenv("MAIL_SERVER", "smtp.gmail.com")
    port = int(os.getenv("MAIL_PORT", 587))
    return sender, password, server, port


def _connect(server: str, port: int) -> smtplib.SMTP:
    """
    Open an SMTP connection. Port 465 uses implicit SSL (SMTP_SSL);
    port 587 uses plain SMTP + STARTTLS. This split exists because many
    ISPs and Docker networks block outbound port 587, and Gmail still
    serves 465 as a first-class alternative.
    """
    if port == 465:
        return smtplib.SMTP_SSL(server, port, timeout=15)
    conn = smtplib.SMTP(server, port, timeout=15)
    conn.ehlo()
    conn.starttls()
    conn.ehlo()
    return conn


async def send_email(email: str, subject: str, code: str) -> bool:
    sender, password, server, port = _get_smtp_config()
    if not all([sender, password, server, port, email]):
        logger.error("Email credentials missing")
        return False

    logger.info(f"Attempting to send email to {email} via {server}:{port}")
    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = sender
    msg["To"] = email
    msg.set_content(
        f"Ваш код подтверждения: {code}\n\n"
        "Если вы не запрашивали этот код, проигнорируйте письмо."
    )
    html = f"""
    <html><body style="font-family:Arial,sans-serif;background:#f4f4f4;padding:20px;">
      <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:8px;padding:30px;">
        <h2 style="color:#333;">Подтверждение регистрации</h2>
        <p style="font-size:16px;color:#555;">Ваш код подтверждения:</p>
        <div style="font-size:32px;font-weight:bold;color:#007bff;letter-spacing:4px;
                    padding:15px 0;text-align:center;background:#f8f9fa;border-radius:6px;">
          {code}
        </div>
        <p style="font-size:14px;color:#888;margin-top:20px;">
          Если вы не запрашивали этот код, проигнорируйте данное письмо.
        </p>
      </div>
    </body></html>
    """
    msg.add_alternative(html, subtype="html")

    try:
        with _connect(server, port) as conn:
            conn.login(sender, password)
            conn.send_message(msg)
        logger.info(f"Email sent successfully to {email}")
        return True
    except smtplib.SMTPAuthenticationError as e:
        logger.error(f"SMTP auth failed ({e.smtp_code}): {e.smtp_error}")
        return False
    except Exception as e:
        logger.error(f"Email send error ({type(e).__name__}): {e}")
        return False


async def send_email_html(email: str, subject: str, text_body: str, html_body: str) -> bool:
    sender, password, server, port = _get_smtp_config()
    if not all([sender, password, server, port, email]):
        logger.error("Email credentials missing")
        return False

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = sender
    msg["To"] = email
    msg.set_content(text_body)
    msg.add_alternative(html_body, subtype="html")

    try:
        with _connect(server, port) as conn:
            conn.login(sender, password)
            conn.send_message(msg)
        logger.info(f"Email sent successfully to {email}")
        return True
    except smtplib.SMTPAuthenticationError as e:
        logger.error(f"SMTP auth failed ({e.smtp_code}): {e.smtp_error}")
        return False
    except Exception as e:
        logger.error(f"Email send error ({type(e).__name__}): {e}")
        return False
