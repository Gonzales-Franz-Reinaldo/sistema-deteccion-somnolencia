import requests
import json

BASE_URL = "http://localhost:8000/api/v1"

def test_login():
    """Test de login exitoso con JSON"""
    print("\n🧪 TEST 1: Login Exitoso (JSON)")
    print("-" * 50)
    
    response = requests.post(
        f"{BASE_URL}/auth/login",
        json={
            "username": "admin",
            "password": "admin123"
        },
        headers={"Content-Type": "application/json"}
    )
    
    print(f"Status Code: {response.status_code}")
    data = response.json()
    print(json.dumps(data, indent=2))
    
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    assert "access_token" in data, "access_token not in response"
    assert "refresh_token" in data, "refresh_token not in response"
    assert "user" in data, "user not in response"
    
    return data["access_token"], data["refresh_token"]


def test_login_invalid():
    """Test de login con credenciales inválidas"""
    print("\n🧪 TEST 2: Login con Credenciales Inválidas")
    print("-" * 50)
    
    response = requests.post(
        f"{BASE_URL}/auth/login",
        json={
            "username": "admin",
            "password": "password_incorrecta"
        },
        headers={"Content-Type": "application/json"}
    )
    
    print(f"Status Code: {response.status_code}")
    print(json.dumps(response.json(), indent=2))
    
    assert response.status_code == 401, f"Expected 401, got {response.status_code}"


def test_get_current_user(access_token):
    """Test de obtener usuario actual"""
    print("\n🧪 TEST 3: Obtener Usuario Actual")
    print("-" * 50)
    
    response = requests.get(
        f"{BASE_URL}/auth/me",
        headers={"Authorization": f"Bearer {access_token}"}
    )
    
    print(f"Status Code: {response.status_code}")
    data = response.json()
    print(json.dumps(data, indent=2))
    
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    assert "id_usuario" in data, "id_usuario not in response"
    assert "usuario" in data, "usuario not in response"


def test_refresh_token(refresh_token):
    """Test de renovar access token"""
    print("\n🧪 TEST 4: Renovar Access Token")
    print("-" * 50)
    
    response = requests.post(
        f"{BASE_URL}/auth/refresh",
        json={"refresh_token": refresh_token},
        headers={"Content-Type": "application/json"}
    )
    
    print(f"Status Code: {response.status_code}")
    data = response.json()
    print(json.dumps(data, indent=2))
    
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    assert "access_token" in data, "access_token not in response"
    
    return data["access_token"]


def test_change_password(access_token):
    """Test de cambiar contraseña"""
    print("\n🧪 TEST 5: Cambiar Contraseña")
    print("-" * 50)
    
    response = requests.post(
        f"{BASE_URL}/auth/change-password",
        json={
            "current_password": "admin123",
            "new_password": "admin123"  # Cambiar por la misma para no afectar tests
        },
        headers={
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }
    )
    
    print(f"Status Code: {response.status_code}")
    print(json.dumps(response.json(), indent=2))
    
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"


def test_logout(access_token):
    """Test de cerrar sesión"""
    print("\n🧪 TEST 6: Cerrar Sesión")
    print("-" * 50)
    
    response = requests.post(
        f"{BASE_URL}/auth/logout",
        headers={"Authorization": f"Bearer {access_token}"}
    )
    
    print(f"Status Code: {response.status_code}")
    data = response.json()
    print(json.dumps(data, indent=2))
    
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    assert "message" in data, "message not in response"


if __name__ == "__main__":
    print("=" * 50)
    print("🚀 INICIANDO TESTS DE AUTENTICACIÓN (JSON)")
    print("=" * 50)
    
    try:
        # Test 1 y 2
        access_token, refresh_token = test_login()
        test_login_invalid()
        
        # Test 3, 4, 5 y 6
        test_get_current_user(access_token)
        new_access_token = test_refresh_token(refresh_token)
        test_change_password(new_access_token)
        test_logout(new_access_token)
        
        print("\n" + "=" * 50)
        print("✅ TODOS LOS TESTS PASARON EXITOSAMENTE")
        print("=" * 50)
        
    except AssertionError as e:
        print("\n" + "=" * 50)
        print(f"❌ TEST FALLÓ: {e}")
        print("=" * 50)
    
    except Exception as e:
        print("\n" + "=" * 50)
        print(f"❌ ERROR: {e}")
        print("=" * 50)