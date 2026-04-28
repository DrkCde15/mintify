import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from config import settings


def _smtp_credentials() -> tuple[str, str, str, int, bool, str]:
    smtp_user = settings.SMTP_USER or settings.EMAIL
    smtp_password = settings.SMTP_PASSWORD or settings.EMAIL_PASS_APP
    from_email = settings.SMTP_FROM_EMAIL or smtp_user

    return (
        smtp_user,
        smtp_password,
        settings.SMTP_HOST,
        settings.SMTP_PORT,
        settings.SMTP_USE_TLS,
        from_email,
    )


def enviar_notificacao_venda(email_vendedor: str, nome_produto: str, valor: float):
    smtp_user, smtp_password, host, port, use_tls, from_email = _smtp_credentials()

    if not smtp_user or not smtp_password or not from_email:
        print("SMTP nao configurado. Defina EMAIL/EMAIL_PASS_APP ou SMTP_USER/SMTP_PASSWORD.")
        return None

    subject = f"Venda Realizada: {nome_produto}"
    html_body = f"""
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; max-width: 500px;">
            <h2 style="color: #059669; margin-top: 0;">Parabens!</h2>
            <p style="font-size: 16px; color: #374151;">
                Voce realizou uma nova venda na plataforma <strong>Mintify</strong>.
            </p>
            <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Produto:</strong> {nome_produto}</p>
                <p style="margin: 5px 0;"><strong>Valor:</strong> R$ {valor:.2f}</p>
            </div>
            <p style="font-size: 14px; color: #6b7280;">
                O saldo ja foi atualizado no seu painel financeiro.
            </p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 11px; color: #9ca3af; text-align: center;">
                (c) 2026 Mintify - Sistema de Notificacoes
            </p>
        </div>
    """

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"{settings.SMTP_FROM_NAME} <{from_email}>"
    msg["To"] = email_vendedor
    msg.attach(MIMEText(html_body, "html", "utf-8"))

    try:
        with smtplib.SMTP(host, port, timeout=20) as server:
            server.ehlo()
            if use_tls:
                server.starttls()
                server.ehlo()
            server.login(smtp_user, smtp_password)
            server.sendmail(from_email, [email_vendedor], msg.as_string())

        print(f"E-mail de venda enviado para {email_vendedor}")
        return {"status": "sent", "to": email_vendedor}
    except Exception as e:
        print(f"Erro ao enviar e-mail SMTP: {e}")
        return None