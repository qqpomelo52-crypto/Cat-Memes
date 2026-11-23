(() => {
  const image = document.querySelector('#cat-image');
  const loading = document.querySelector('#loading');
  const imageNote = document.querySelector('#image-note');
  const topInput = document.querySelector('#top-text');
  const bottomInput = document.querySelector('#bottom-text');
  const topPreview = document.querySelector('#top-preview');
  const bottomPreview = document.querySelector('#bottom-preview');
  const toast = document.querySelector('#toast');
  let toastTimer;
  function notify(message) { toast.textContent = message; toast.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('show'), 2800); }
  function syncText() { topPreview.textContent = topInput.value || ' '; bottomPreview.textContent = bottomInput.value || ' '; }
  topInput.addEventListener('input', syncText); bottomInput.addEventListener('input', syncText);

  async function loadCat() {
    loading.classList.remove('hidden'); imageNote.textContent = '正在為你找一隻貓…';
    try {
      const response = await fetch('/api/random-cat');
      if (!response.ok) throw new Error('圖片服務暫時忙碌');
      const cat = await response.json();
      image.onload = () => { loading.classList.add('hidden'); imageNote.textContent = cat.fallback ? '已使用備援圖片，你仍可編輯並下載梗圖。' : '主角已就位！'; };
      image.onerror = () => { loading.classList.add('hidden'); imageNote.textContent = '圖片載入失敗，請再換一隻貓。'; notify('貓咪圖片載入失敗，請稍後重試。'); };
      image.src = cat.proxy_url;
    } catch (error) { loading.classList.add('hidden'); imageNote.textContent = '暫時無法取得貓咪圖片，請稍後再試。'; notify(error.message || '載入失敗'); }
  }
  document.querySelector('#refresh-cat').addEventListener('click', loadCat);
  document.querySelector('#random-caption').addEventListener('click', async () => {
    try { const response = await fetch('/api/random-caption'); if (!response.ok) throw new Error(); const joke = await response.json(); topInput.value = joke.top; bottomInput.value = joke.bottom; syncText(); }
    catch { topInput.value = '朕今天心情好'; bottomInput.value = '所以准你摸一下'; syncText(); }
  });

  document.querySelector('#download').addEventListener('click', async () => {
    if (!image.complete || !image.naturalWidth) { notify('貓咪還在路上，請稍等一下再下載。'); return; }
    const button = document.querySelector('#download'); button.disabled = true; button.textContent = '正在製作…';
    try {
      const canvas = document.createElement('canvas'); canvas.width = 1200; canvas.height = 900;
      const ctx = canvas.getContext('2d');
      const scale = Math.max(canvas.width / image.naturalWidth, canvas.height / image.naturalHeight);
      const width = image.naturalWidth * scale, height = image.naturalHeight * scale;
      ctx.drawImage(image, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height);
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height); gradient.addColorStop(0, '#0005'); gradient.addColorStop(.25, 'transparent'); gradient.addColorStop(.68, 'transparent'); gradient.addColorStop(1, '#0006'); ctx.fillStyle = gradient; ctx.fillRect(0, 0, canvas.width, canvas.height);
      const drawText = (text, y, baseline) => {
        const maxWidth = canvas.width * .88; let size = 76; ctx.textAlign = 'center'; ctx.textBaseline = baseline; ctx.font = `900 ${size}px "Noto Sans TC", "Arial Black", sans-serif`;
        while (ctx.measureText(text).width > maxWidth && size > 30) { size -= 2; ctx.font = `900 ${size}px "Noto Sans TC", "Arial Black", sans-serif`; }
        ctx.lineJoin = 'round'; ctx.lineWidth = Math.max(5, size * .105); ctx.strokeStyle = '#17120f'; ctx.fillStyle = '#fff'; ctx.shadowColor = '#0008'; ctx.shadowBlur = 6; ctx.shadowOffsetY = 3; ctx.strokeText(text, canvas.width / 2, y, maxWidth); ctx.fillText(text, canvas.width / 2, y, maxWidth); ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
      };
      drawText(topInput.value, 74, 'top'); drawText(bottomInput.value, 826, 'bottom');
      const link = document.createElement('a'); link.download = 'miao-meme.png'; link.href = canvas.toDataURL('image/png'); link.click(); notify('梗圖已下載，分享你的傑作吧！');
    } catch (error) { notify('無法匯出圖片。請重新載入貓咪後再試一次。'); }
    finally { button.disabled = false; button.innerHTML = '<span>↓</span> 下載梗圖'; }
  });
  loadCat();
})();
