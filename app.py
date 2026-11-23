"""Cat Meme Generator Flask application."""
from __future__ import annotations

import random
from urllib.parse import urlparse

import requests
from flask import Flask, jsonify, render_template, request, Response

app = Flask(__name__)

CAT_APIS = (
    "https://api.thecatapi.com/v1/images/search",
    "https://api.thecatapi.com/v1/images/search?limit=1",
)
ALLOWED_IMAGE_HOSTS = {"cdn2.thecatapi.com", "images.unsplash.com", "cataas.com"}
FALLBACK_IMAGE = "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=1200&auto=format&fit=crop&q=85"
JOKES = [
    ["我不是在耍廢", "我是在節能模式"],
    ["今天的待辦清單", "先躺一下再說"],
    ["人類說要早睡", "結果又滑到天亮"],
    ["朕不是胖", "只是毛比較蓬"],
    ["聽說罐罐漲價了", "本喵需要開會"],
    ["週一的我", "靈魂還在週末"],
    ["你說要減肥？", "那我先幫你吃掉"],
    ["看起來很冷靜", "其實在想晚餐"],
]


@app.get("/")
def home():
    return render_template("index.html")


@app.get("/api/random-cat")
def random_cat():
    """Fetch a cat image, falling back gracefully if upstream APIs fail."""
    for endpoint in CAT_APIS:
        try:
            response = requests.get(endpoint, timeout=(3.05, 7))
            response.raise_for_status()
            payload = response.json()
            image_url = payload[0].get("url") if payload else None
            if image_url and urlparse(image_url).hostname in ALLOWED_IMAGE_HOSTS:
                return jsonify(image_url=image_url, proxy_url=f"/api/cat-image?src={image_url}"), 200
        except (requests.RequestException, ValueError, IndexError, TypeError):
            continue
    return jsonify(image_url=FALLBACK_IMAGE, proxy_url=f"/api/cat-image?src={FALLBACK_IMAGE}", fallback=True), 200


@app.get("/api/cat-image")
def cat_image():
    """Proxy only known public cat image hosts for canvas-safe rendering."""
    source = request.args.get("src", "")
    parsed = urlparse(source)
    if parsed.scheme != "https" or parsed.hostname not in ALLOWED_IMAGE_HOSTS:
        return jsonify(error="不支援的圖片來源"), 400
    try:
        upstream = requests.get(source, timeout=(3.05, 10), stream=True, allow_redirects=False)
        upstream.raise_for_status()
        content_type = upstream.headers.get("Content-Type", "")
        if not content_type.startswith("image/"):
            return jsonify(error="來源未回傳圖片"), 502
        data = upstream.raw.read(8 * 1024 * 1024 + 1)
        if len(data) > 8 * 1024 * 1024:
            return jsonify(error="圖片檔案過大"), 413
        return Response(data, content_type=content_type, headers={"Cache-Control": "public, max-age=300", "X-Content-Type-Options": "nosniff"})
    except requests.RequestException:
        return jsonify(error="暫時無法載入圖片，請稍後再試"), 502


@app.get("/api/random-caption")
def random_caption():
    top, bottom = random.choice(JOKES)
    return jsonify(top=top, bottom=bottom)


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=False)
