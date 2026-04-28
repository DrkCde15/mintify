"""
Cliente para a API da Cakto.
Gerencia autenticacao OAuth2 e requisicoes a API.
As credenciais sao lidas automaticamente do arquivo .env via config.py.
"""
import socket
import subprocess
import threading
import time
from contextlib import contextmanager
from typing import Optional
from urllib.parse import urlparse

import requests
from requests import Response
from requests.exceptions import RequestException

from config import settings


class CaktoAPIClient:
    def __init__(self):
        self.client_id = settings.CAKTO_CLIENT_ID
        self.client_secret = settings.CAKTO_CLIENT_SECRET
        self.base_url = settings.CAKTO_BASE_URL.rstrip("/")
        self.access_token: Optional[str] = None
        self.timeout_seconds = 20
        self._dns_cache: dict[str, tuple[str, float]] = {}
        self._dns_cache_lock = threading.Lock()

    def authenticate(self) -> dict:
        """Obtem um novo access token usando client_id e client_secret."""
        if not self.client_id or not self.client_secret:
            raise RuntimeError("Credenciais da Cakto nao configuradas no .env")

        url = f"{self.base_url}/public_api/token/"
        data = {
            "client_id": self.client_id,
            "client_secret": self.client_secret,
        }
        headers = {"Content-Type": "application/x-www-form-urlencoded"}

        try:
            response = requests.post(
                url,
                data=data,
                headers=headers,
                timeout=self.timeout_seconds,
            )
        except RequestException as exc:
            parsed_host = urlparse(url).hostname
            if parsed_host and self._is_network_resolution_error(exc):
                ip = self._resolve_host_with_public_dns(parsed_host)
                with self._override_dns_resolution(parsed_host, ip):
                    response = requests.post(
                        url,
                        data=data,
                        headers=headers,
                        timeout=self.timeout_seconds,
                    )
            else:
                raise

        response.raise_for_status()

        token_data = response.json()
        self.access_token = token_data["access_token"]
        return token_data

    def get_headers(self) -> dict:
        """Retorna os headers com autenticacao."""
        if not self.access_token:
            self.authenticate()

        return {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json",
        }

    def _request(self, method: str, endpoint: str, retry_on_401: bool = True, **kwargs) -> dict:
        """Executa request autenticada e refaz uma vez em caso de 401 (token expirado)."""
        url = f"{self.base_url}{endpoint}"
        parsed_host = urlparse(url).hostname

        try:
            response = self._perform_request(method, url, **kwargs)

            if response.status_code == 401 and retry_on_401:
                self.authenticate()
                return self._request(method, endpoint, retry_on_401=False, **kwargs)

            response.raise_for_status()
            return response.json()
        except RequestException as exc:
            # Fallback para DNS publico quando o DNS local falha.
            if parsed_host and self._is_network_resolution_error(exc):
                try:
                    ip = self._resolve_host_with_public_dns(parsed_host)
                    with self._override_dns_resolution(parsed_host, ip):
                        response = self._perform_request(method, url, **kwargs)

                    if response.status_code == 401 and retry_on_401:
                        self.authenticate()
                        with self._override_dns_resolution(parsed_host, ip):
                            response = self._perform_request(method, url, **kwargs)

                    response.raise_for_status()
                    return response.json()
                except Exception:
                    # Mantem o erro original abaixo para facilitar diagnostico.
                    pass

            raise RuntimeError(f"Falha na comunicacao com Cakto ({method} {endpoint}): {exc}") from exc

    def _perform_request(self, method: str, url: str, **kwargs) -> Response:
        return requests.request(
            method=method,
            url=url,
            headers=self.get_headers(),
            timeout=self.timeout_seconds,
            **kwargs,
        )

    def _is_network_resolution_error(self, exc: RequestException) -> bool:
        msg = str(exc).lower()
        return any(token in msg for token in [
            "name or service not known",
            "getaddrinfo failed",
            "failed to establish a new connection",
            "could not connect to server",
            "winerror 10013",
        ])

    def _resolve_host_with_public_dns(self, host: str) -> str:
        now = time.time()
        with self._dns_cache_lock:
            cached = self._dns_cache.get(host)
            if cached and cached[1] > now:
                return cached[0]

        command = (
            f"(Resolve-DnsName {host} -Server 1.1.1.1 -Type A | "
            "Select-Object -First 1 -ExpandProperty IPAddress)"
        )
        result = subprocess.run(
            ["powershell", "-NoProfile", "-Command", command],
            capture_output=True,
            text=True,
            timeout=8,
            check=False,
        )
        ip = result.stdout.strip().splitlines()[0] if result.stdout.strip() else ""
        if not ip:
            raise RuntimeError(
                f"Nao foi possivel resolver {host} via DNS publico. stderr: {result.stderr.strip()}"
            )

        with self._dns_cache_lock:
            # Cache curto para evitar chamadas frequentes no PowerShell.
            self._dns_cache[host] = (ip, now + 300)
        return ip

    @contextmanager
    def _override_dns_resolution(self, host: str, ip: str):
        original_getaddrinfo = socket.getaddrinfo

        def patched_getaddrinfo(target, port, family=0, type=0, proto=0, flags=0):
            if target == host:
                return original_getaddrinfo(ip, port, family, type, proto, flags)
            return original_getaddrinfo(target, port, family, type, proto, flags)

        socket.getaddrinfo = patched_getaddrinfo
        try:
            yield
        finally:
            socket.getaddrinfo = original_getaddrinfo

    def get(self, endpoint: str, **kwargs) -> dict:
        """Faz uma requisicao GET autenticada."""
        return self._request("GET", endpoint, **kwargs)

    def post(self, endpoint: str, data: dict, **kwargs) -> dict:
        """Faz uma requisicao POST autenticada."""
        return self._request("POST", endpoint, json=data, **kwargs)

    def put(self, endpoint: str, data: dict, **kwargs) -> dict:
        """Faz uma requisicao PUT autenticada."""
        return self._request("PUT", endpoint, json=data, **kwargs)

    # --- Metodos de conveniencia para recursos da Cakto ---

    def listar_produtos(
        self,
        page: int = 1,
        limit: int = 50,
        name: Optional[str] = None,
        search: Optional[str] = None,
    ) -> dict:
        """Lista os produtos cadastrados na Cakto."""
        params = {"page": page, "limit": limit}
        if name:
            params["name"] = name
        if search:
            params["search"] = search
        return self.get("/public_api/products/", params=params)

    def obter_produto(self, produto_id: str) -> dict:
        """Obtem um produto da Cakto pelo ID."""
        return self.get(f"/public_api/products/{produto_id}/")

    def buscar_produto_por_nome(self, nome: str) -> Optional[dict]:
        """Busca um produto da Cakto por nome e retorna o melhor match."""
        if not nome:
            return None

        resposta = self.listar_produtos(page=1, limit=50, search=nome)
        results = resposta.get("results") if isinstance(resposta, dict) else None
        if not isinstance(results, list):
            return None

        nome_norm = nome.strip().lower()
        # Prioriza match exato por nome
        for item in results:
            if isinstance(item, dict) and str(item.get("name", "")).strip().lower() == nome_norm:
                return item

        # Fallback: primeiro item retornado na busca
        for item in results:
            if isinstance(item, dict):
                return item
        return None

    def extrair_checkout_url(self, payload: Optional[dict]) -> Optional[str]:
        """Extrai URL de checkout/sales page de respostas da Cakto."""
        if not isinstance(payload, dict):
            return None

        candidatos = [
            payload.get("salesPage"),
            payload.get("checkoutUrl"),
            payload.get("checkout_url"),
            (payload.get("checkout") or {}).get("url") if isinstance(payload.get("checkout"), dict) else None,
        ]

        # Em respostas paginadas, a URL pode vir em results[0].salesPage
        results = payload.get("results")
        if isinstance(results, list):
            for item in results:
                if isinstance(item, dict):
                    candidatos.append(item.get("salesPage"))
                    candidatos.append(item.get("checkoutUrl"))
                    candidatos.append(item.get("checkout_url"))

        for url in candidatos:
            if isinstance(url, str) and url.strip():
                return url.strip()
        return None

    def obter_pedido(self, pedido_id: str) -> dict:
        """Obtem os detalhes de um pedido pelo ID."""
        return self.get(f"/public_api/orders/{pedido_id}/")

    def listar_pedidos(self, page: int = 1, limit: int = 50) -> dict:
        """Lista os pedidos da conta."""
        return self.get(f"/public_api/orders/?page={page}&limit={limit}")

    def criar_webhook(
        self,
        url: str,
        eventos: list[str],
        products: list[str],
        name: str = "Mintify Webhook",
        status: str = "active",
    ) -> dict:
        """
        Cria um webhook na Cakto.
        `eventos` deve usar custom_id da Cakto, por exemplo:
        ['purchase_approved', 'refund'].
        """
        payload = {
            "name": name,
            "url": url,
            "products": products,
            "events": eventos,
            "status": status,
        }
        return self.post("/public_api/webhook/", payload)


# Instancia global reutilizavel (singleton simples)
cakto_client = CaktoAPIClient()
