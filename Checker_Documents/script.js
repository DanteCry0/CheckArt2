/* script.js — Verificação de Arte v2.0
   Suporte a múltiplos tamanhos reais (mm→px @ 96dpi)
*/

const canvas = document.getElementById('canvas');
const ctx    = canvas.getContext('2d');
let uploadedImage = new Image();
let hasImage      = false;
let borderColor   = 'black';
let currentHole   = 'none';

/* ── Tamanhos dos produtos (px @ 96dpi, 1mm = 3.7795px) ── */
const PRODUTOS = {
  credencial:   { w: 340, h: 529, label: '90 × 140 mm  (340 × 529 px)' },
  cracha:       { w: 197, h: 314, label: '52 × 83 mm  (197 × 314 px)'  },
  carteirinha:  { w: 314, h: 197, label: '83 × 52 mm  (314 × 197 px)'  },
};

/* margens em px: sangria=borda, corte=~1mm, segurança=~3mm */
const MARGEM_CORTE = 4;   // ~1mm
const MARGEM_SEG   = 11;  // ~3mm

/* ── Utilitários ───────────────────────────────────────── */
function setStatus(text, type = 'ok') {
  const b = document.getElementById('status-badge');
  if (!b) return;
  b.textContent = text;
  b.className = 'status-badge status-' + type;
}

function roundRect(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
  ctx.stroke();
}

/* ── Desenho ───────────────────────────────────────────── */
function desenharMarcas() {
  const W = canvas.width;
  const H = canvas.height;
  const r = 8;
  const c = MARGEM_CORTE;
  const s = MARGEM_SEG;

  // Sangria (ciano)
  ctx.strokeStyle = '#00FFFF';
  ctx.lineWidth = 2;
  roundRect(ctx, 1, 1, W - 2, H - 2, r);

  // Corte (vermelho)
  ctx.strokeStyle = '#FF0000';
  ctx.lineWidth = 2;
  roundRect(ctx, c, c, W - c * 2, H - c * 2, r);

  // Segurança (verde)
  ctx.strokeStyle = '#00FF00';
  ctx.lineWidth = 2;
  roundRect(ctx, s, s, W - s * 2, H - s * 2, r);
}

function desenharFuro(tipo) {
  if (tipo === 'none') return;
  const W = canvas.width;
  ctx.strokeStyle = borderColor;
  ctx.fillStyle   = borderColor;
  ctx.lineWidth   = 1.5;

  const yOvoide  = MARGEM_SEG + 18;
  const yRedondo = MARGEM_SEG + 10;

  if (tipo === 'ovalCenter') {
    ctx.strokeRect((W - 72) / 2, yOvoide, 72, 14);

  } else if (tipo === 'ovalDouble') {
    ctx.strokeRect(MARGEM_SEG + 10, yOvoide, 72, 14);
    ctx.strokeRect(W - MARGEM_SEG - 10 - 72, yOvoide, 72, 14);

  } else if (tipo === 'roundCenter') {
    ctx.beginPath();
    ctx.arc(W / 2, yRedondo + 13, 12, 0, 2 * Math.PI);
    ctx.stroke();

  } else if (tipo === 'roundDouble') {
    ctx.beginPath();
    ctx.arc(MARGEM_SEG + 22, yRedondo + 13, 12, 0, 2 * Math.PI);
    ctx.arc(W - MARGEM_SEG - 22, yRedondo + 13, 12, 0, 2 * Math.PI);
    ctx.fill();
  }
}

function redraw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (hasImage) {
    ctx.drawImage(uploadedImage, 0, 0, canvas.width, canvas.height);
  }
  desenharMarcas();
  desenharFuro(currentHole);
}

/* ── Trocar produto (redimensiona canvas) ──────────────── */
function aplicarProduto(tipo) {
  const p = PRODUTOS[tipo];
  if (!p) return;

  canvas.width  = p.w;
  canvas.height = p.h;

  // Atualiza label
  const lbl = document.getElementById('canvas-size-label');
  if (lbl) lbl.textContent = p.label;

  redraw();
}

/* ── Init ──────────────────────────────────────────────── */
aplicarProduto('credencial');

/* ── Eventos ───────────────────────────────────────────── */
document.getElementById('productType').addEventListener('change', function () {
  aplicarProduto(this.value);
});

document.getElementById('upload').addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (!file) return;
  setStatus('carregando...', 'warn');
  const reader = new FileReader();
  reader.onload = function (ev) {
    uploadedImage = new Image();
    uploadedImage.onload = function () {
      hasImage = true;
      redraw();
      setStatus('imagem carregada', 'ok');
    };
    uploadedImage.src = ev.target.result;
  };
  reader.readAsDataURL(file);
});

document.getElementById('holeType').addEventListener('change', function () {
  currentHole = this.value;
  redraw();
});

document.getElementById('borderColor').addEventListener('change', function () {
  borderColor = this.value;
  redraw();
});

document.getElementById('delete-image').addEventListener('click', function () {
  hasImage = false;
  uploadedImage = new Image();
  document.getElementById('upload').value = '';
  redraw();
  setStatus('imagem removida', 'warn');
  setTimeout(() => setStatus('pronto', 'ok'), 2000);
});

document.getElementById('download-canvas').addEventListener('click', function () {
  const link = document.createElement('a');
  const prod = document.getElementById('productType').value;
  link.download = 'verificacao-' + prod + '.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
});
