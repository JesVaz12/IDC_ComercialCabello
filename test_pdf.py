import urllib.request
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

payload = {
    "pago": 100,
    "costo": 25,
    "data": [
        {
            "codigo": "2394309439049",
            "nombre": "Jumex Zanahoria",
            "precio": 25,
            "cantidad": 1
        }
    ]
}
req = urllib.request.Request('http://localhost:8080/imprimir-ticket', data=json.dumps(payload).encode('utf-8'), headers={'Content-Type': 'application/json'})
try:
    res = urllib.request.urlopen(req, context=ctx)
    print(len(res.read()), "bytes PDF downloaded.")
except Exception as e:
    print(f"PDF Error: {e}")
