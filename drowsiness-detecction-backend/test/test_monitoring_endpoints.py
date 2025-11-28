from fastapi.testclient import TestClient
from app.main import app


client = TestClient(app)

def test_metrics_requires_auth():
    resp = client.get('/api/v1/monitoring/metrics')
    # Debe fallar sin token
    assert resp.status_code in (401, 403)

def test_viajes_activos_requires_auth():
    resp = client.get('/api/v1/monitoring/viajes-activos')
    assert resp.status_code in (401, 403)

# NOTA: Tests adicionales con autenticación y datos simulados deberían agregarse
# creando fixtures de BD y usuarios chofer/admin. Aquí se valida presencia y protección básica.