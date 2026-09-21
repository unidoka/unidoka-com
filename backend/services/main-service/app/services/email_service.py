import smtplib
from email.message import EmailMessage
import os
import logging

logger = logging.getLogger(__name__)

async def send_email(email: str, subject: str, code: str) -> bool:
    sender_email = os.getenv("MAIL_SENDER")
    sender_password = os.getenv("MAIL_PASSWORD")
    mail_server = os.getenv("MAIL_SERVER")
    mail_port = int(os.getenv("MAIL_PORT", 587))

    if not all([sender_email, sender_password, mail_server, mail_port, email]):
        logger.error("Email credentials missing")
        return False

    sender_password = sender_password.strip()

    logger.info(f"Attempting to send email to {email} via {mail_server}:{mail_port}")

    # Тестовое подключение
    try:
        with smtplib.SMTP(mail_server, mail_port) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(sender_email, sender_password)
            logger.info("SMTP login successful")
    except Exception as e:
        logger.error(f"SMTP connection/login failed: {e}")
        return False

    # Формируем письмо с HTML
    msg = EmailMessage()
    msg['Subject'] = subject
    msg['From'] = sender_email
    msg['To'] = email

    # Текстовое содержимое (fallback)
    msg.set_content(f"Ваш код подтверждения: {code}\n\nЕсли вы не запрашивали этот код, проигнорируйте письмо.")

    # HTML-версия (красивое оформление)
    html_content = f"""
    <html>
        <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
                <h2 style="color: #333;">Подтверждение регистрации</h2>
                <p style="font-size: 16px; color: #555;">Ваш код подтверждения:</p>
                <div style="font-size: 32px; font-weight: bold; color: #007bff; letter-spacing: 4px; padding: 15px 0; text-align: center; background: #f8f9fa; border-radius: 6px;">
                    {code}
                </div>
                <p style="font-size: 14px; color: #888; margin-top: 20px;">
                    Если вы не запрашивали этот код, проигнорируйте данное письмо.
                </p>
            </div>
        </body>
    </html>
    """
    msg.add_alternative(html_content, subtype='html')

    try:
        with smtplib.SMTP(mail_server, mail_port) as server:
            server.starttls()
            server.login(sender_email, sender_password)
            server.send_message(msg)
        logger.info(f"Email sent successfully to {email}")
        return True
    except Exception as e:
        logger.error(f"Email send error: {e}")
        return False
