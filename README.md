# 喵一下｜貓咪梗圖產生器

以 Python 3.12、Flask 與 requests 建置的繁體中文貓咪梗圖網站。使用者可取得隨機貓圖、即時編輯上下排文字、套用隨機文案，並在瀏覽器下載 PNG。圖片只在記憶體中處理，不會寫入伺服器磁碟。

## 專案結構

```text
.
├── api/index.py          # Vercel Python Runtime 入口
├── app.py                # Flask 頁面與 JSON/圖片 API
├── static/app.js         # 前端互動、即時預覽、Canvas PNG 匯出
├── static/style.css      # 響應式介面樣式
├── templates/index.html  # 繁體中文首頁
├── requirements.txt      # Flask、requests 相依套件
└── vercel.json           # Vercel 建置與路由
```

## 本機執行（Python 3.12）

在專案根目錄開啟終端機：

```powershell
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
python app.py
```

若 PowerShell 不允許啟用虛擬環境，可直接使用虛擬環境中的 Python：

```powershell
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe app.py
```

開啟 <http://127.0.0.1:5000>。隨機圖片由 The Cat API 提供；若服務無回應，系統會使用程式內設定的公開備援圖片。圖片代理只接受程式列出的 HTTPS 圖片網域，並限制下載大小與等待時間，以便 Canvas 匯出及避免任意網址代理。

## API

- `GET /api/random-cat`：取得貓圖網址與同源圖片代理網址；上游逾時時回傳備援圖。
- `GET /api/cat-image?src=...`：代理允許網域的圖片，協助 Canvas 避免跨網域污染。
- `GET /api/random-caption`：取得一組隨機繁體中文文案。

## 推送至 GitHub

先在 GitHub 建立一個空白儲存庫（不要自動新增 README 或其他檔案），再於專案根目錄執行：

```powershell
git init
git add .
git status
git commit -m "建立貓咪梗圖產生器"
git branch -M main
git remote add origin https://github.com/<你的帳號>/<儲存庫名稱>.git
git push -u origin main
```

`git status` 請先確認 `.env`、`.venv/`、`.vercel/` 和快取檔案沒有列入提交。若儲存庫已設定遠端，請略過 `git remote add origin ...`，並先確認遠端名稱與網址。

## 部署至 Vercel

1. 登入 [Vercel](https://vercel.com/)，選擇 **Add New → Project**。
2. 匯入剛推送的 GitHub 儲存庫，Framework Preset 選 **Other**，保留專案中的 `vercel.json` 設定並部署。
3. 此專案不需要環境變數或 API Key。若未來自行加入秘密設定，請只在 Vercel 專案的 **Settings → Environment Variables** 填入變數名稱及值，並勿提交 `.env`。
4. 後續推送到連結的分支會觸發新部署；可在 Vercel 專案的 Deployments 頁查看結果。

Vercel 使用 `api/index.py` 作為 Python Serverless Function 入口，所有路徑交由 Flask 處理。部署環境無狀態且唯讀；本程式不依賴持久化檔案，Canvas 合成與下載都在使用者瀏覽器完成。The Cat API 或圖片來源若臨時無法連線，頁面會顯示提示。

## GitHub 安全

`.gitignore` 已排除虛擬環境、Python 快取、`.env`、`.env.*` 及 `.vercel/`。不要將 API Key、Token 或其他秘密值寫入原始碼、README、提交內容或終端機輸出。
