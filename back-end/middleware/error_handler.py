"""
Middleware para tratamento global de erros
Captura exceções não tratadas e retorna respostas padronizadas
"""
from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import traceback
import uuid
from datetime import datetime
from config import settings


async def error_handler_middleware(request: Request, call_next):
    """
    Middleware para capturar e tratar erros não esperados
    """
    try:
        response = await call_next(request)
        return response
    except Exception as exc:
        # Gerar ID único para rastreamento
        error_id = str(uuid.uuid4())
        
        # Log do erro (em produção, usar logger apropriado)
        print(f"\n{'='*80}")
        print(f"ERRO NÃO TRATADO - ID: {error_id}")
        print(f"Timestamp: {datetime.now().isoformat()}")
        print(f"Path: {request.method} {request.url.path}")
        print(f"Erro: {str(exc)}")
        print(f"Traceback:")
        print(traceback.format_exc())
        print(f"{'='*80}\n")
        
        detail_message = "Erro interno do servidor. Por favor, tente novamente mais tarde."
        if settings.DEBUG:
            detail_message = f"Erro interno: {str(exc)}"

        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "detail": detail_message,
                "error_id": error_id,
                "timestamp": datetime.now().isoformat()
            }
        )


async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """
    Handler customizado para erros de validação do Pydantic
    """
    errors = []
    for error in exc.errors():
        field = " -> ".join(str(loc) for loc in error["loc"])
        message = error["msg"]
        errors.append({
            "field": field,
            "message": message,
            "type": error["type"]
        })
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": "Erro de validação nos dados enviados",
            "errors": errors
        }
    )


async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    """
    Handler customizado para HTTPException
    """
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "detail": exc.detail,
            "status_code": exc.status_code
        }
    )
