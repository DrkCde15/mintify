import httpx
import json
from typing import Optional, Dict, Any
from config import settings

class PayPalClient:
    def __init__(self):
        self.base_url = settings.paypal_base_url
        self.client_id = settings.paypal_client_id
        self.secret_key = settings.paypal_secret_key

    async def get_access_token(self) -> str:
        url = f"{self.base_url}/v1/oauth2/token"
        headers = {
            "Content-Type": "application/x-www-form-urlencoded",
        }
        data = {
            "grant_type": "client_credentials"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                url, 
                headers=headers, 
                data=data, 
                auth=(self.client_id, self.secret_key)
            )
            
            if response.status_code == 200:
                return response.json().get("access_token")
            else:
                raise Exception(f"Erro ao obter token PayPal: {response.text}")

    async def create_order(self, amount: float, return_url: str, cancel_url: str, currency: str = "BRL", reference_id: str = "") -> Dict[str, Any]:
        token = await self.get_access_token()
        url = f"{self.base_url}/v2/checkout/orders"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}",
            "PayPal-Request-Id": reference_id # Idempotência
        }
        
        order_data = {
            "intent": "CAPTURE",
            "purchase_units": [
                {
                    "reference_id": reference_id,
                    "amount": {
                        "currency_code": currency,
                        "value": f"{amount:.2f}"
                    }
                }
            ],
            "application_context": {
                "brand_name": "Mintify",
                "landing_page": "BILLING",
                "user_action": "PAY_NOW",
                "return_url": return_url,
                "cancel_url": cancel_url
            }
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(url, headers=headers, json=order_data)
            
            if response.status_code in [200, 201]:
                return response.json()
            else:
                raise Exception(f"Erro ao criar pedido PayPal: {response.text}")

    async def capture_payment(self, order_id: str) -> Dict[str, Any]:
        token = await self.get_access_token()
        url = f"{self.base_url}/v2/checkout/orders/{order_id}/capture"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(url, headers=headers)
            
            if response.status_code in [200, 201]:
                return response.json()
            else:
                raise Exception(f"Erro ao capturar pagamento PayPal: {response.text}")

# Instância global
paypal_client = PayPalClient()
