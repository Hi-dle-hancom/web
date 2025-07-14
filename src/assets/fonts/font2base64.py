import base64

with open("NotoSansCJKkr-Regular.ttf", "rb") as f:
    encoded = base64.b64encode(f.read()).decode("utf-8")

with open("NotoSansKR_base64.ts", "w", encoding="utf-8") as f:
    f.write('export const notoSansKRBase64 = `')
    f.write(encoded)
    f.write('`;')
