import urllib.request
import urllib.parse
import json
import ssl

def main():
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    # 1. Login
    login_data = json.dumps({"username": "danone", "password": "1234"}).encode('utf-8')
    req = urllib.request.Request('http://localhost:8080/login', data=login_data, headers={'Content-Type': 'application/json'})
    try:
        res = urllib.request.urlopen(req, context=ctx)
        cookies = res.headers.get('Set-Cookie')
        print(f"Login success. Cookies: {cookies}")
    except Exception as e:
        print(f"Login failed: {e}")
        return

    # 2. GetUser
    req_user = urllib.request.Request('http://localhost:8080/GetUser', headers={'Cookie': cookies})
    try:
        res_user = urllib.request.urlopen(req_user, context=ctx)
        user_body = json.loads(res_user.read().decode('utf-8'))
        print(f"GetUser: {user_body}")
    except Exception as e:
        print(f"GetUser failed: {e}")
        return

    username = user_body.get('username')

    # 3. Realizar cobro
    cobro_payload = {
        "pago": 100,
        "costo": 25,
        "data": [
            {
                "codigo": "2394309439049",
                "nombre": "Jumex Zanahoria",
                "precio": 25,
                "cantidad": 1
            }
        ],
        "username": username
    }
    cobro_data = json.dumps(cobro_payload).encode('utf-8')
    req_cobro = urllib.request.Request('http://localhost:8080/realizarCobro', data=cobro_data, headers={'Content-Type': 'application/json', 'Cookie': cookies})
    try:
        res_cobro = urllib.request.urlopen(req_cobro, context=ctx)
        body = res_cobro.read().decode('utf-8')
        print(f"Cobro success. Body: {body}")
    except urllib.error.HTTPError as e:
        print(f"Cobro failed HTTP Error: {e.code} - {e.read().decode('utf-8')}")
        body = e.read().decode('utf-8')
        print(body)
    except Exception as e:
        print(f"Cobro failed: {e}")

if __name__ == '__main__':
    main()
