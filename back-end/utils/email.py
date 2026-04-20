import resend
from config import settings

# Usa a chave correta vinda do seu .env
resend.api_key = settings.RESEND_API_KEY

def enviar_notificacao_venda(email_vendedor: str, nome_produto: str, valor: float):
    try:
        # No plano gratuito (Sandbox), o remetente fixo é este abaixo:
        remetente = "Mintify <onboarding@resend.dev>"

        params = {
            "from": remetente,
            "to": [email_vendedor], # O e-mail deve estar verificado no Resend se for Sandbox
            "subject": f"🔥 Venda Realizada: {nome_produto}",
            "html": f"""
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; max-width: 500px;">
                    <h2 style="color: #059669; margin-top: 0;">Parabéns!</h2>
                    <p style="font-size: 16px; color: #374151;">
                        Você realizou uma nova venda na plataforma <strong>Mintify</strong>.
                    </p>
                    <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 5px 0;"><strong>Produto:</strong> {nome_produto}</p>
                        <p style="margin: 5px 0;"><strong>Valor:</strong> R$ {valor:.2f}</p>
                    </div>
                    <p style="font-size: 14px; color: #6b7280;">
                        O saldo já foi atualizado no seu painel financeiro.
                    </p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="font-size: 11px; color: #9ca3af; text-align: center;">
                        © 2026 Mintify - Sistema de Notificações
                    </p>
                </div>
            """
        }

        response = resend.Emails.send(params)
        print(f"✅ E-mail enviado! ID: {response['id']}")
        return response
    except Exception as e:
        print(f"❌ Erro ao enviar e-mail: {e}")
        return None