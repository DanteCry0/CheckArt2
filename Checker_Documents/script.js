/* script.js — Verificação de Arte v2.0 */

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let uploadedImage = new Image();
let hasImage = false;

// Dimensões do canvas
canvas.width = 456;
canvas.height = 700;

// Estado
let borderColor = 'black';
let currentHole = 'none';

// ── Utilitários ──────────────────────────────────────────

function setStatus(text, type = 'ok') {
  const badge = document.getElementById('status-badge');
  if (!badge) return;
  badge.textContent = text;
  badge.className = 'status-badge status-' + type;
}

function roundRect(ctx, x, y, w, h, r) {
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

// ── Desenho ──────────────────────────────────────────────

function desenharMarcas() {
  const r = 10;

  // Sangria (ciano)
  ctx.strokeStyle = '#00FFFF';
  ctx.lineWidth = 2;
  roundRect(ctx, 0, 0, 456, 700, r);

  // Corte (vermelho)
  ctx.strokeStyle = '#FF0000';
  ctx.lineWidth = 2;
  roundRect(ctx, 9.5, 10.5, 437, 679, r);

  // Segurança (verde)
  ctx.strokeStyle = '#00FF00';
  ctx.lineWidth = 2;
  roundRect(ctx, 29, 32, 398, 637, r);
}

function desenharFuro(tipo) {
  if (tipo === 'none') return;

  ctx.strokeStyle = borderColor;
  ctx.fillStyle = borderColor;
  ctx.lineWidth = 1.5;

  const yOvoide = 32 + 18;
  const yRedondo = 32 + 10;

  if (tipo === 'ovalCenter') {
    ctx.strokeRect((canvas.width - 72) / 2, yOvoide, 72, 14);

  } else if (tipo === 'ovalDouble') {
    ctx.strokeRect(33, yOvoide, 72, 14);
    ctx.strokeRect(canvas.width - 105, yOvoide, 72, 14);

  } else if (tipo === 'roundCenter') {
    ctx.beginPath();
    ctx.arc(canvas.width / 2, yRedondo + 13, 12, 0, 2 * Math.PI);
    ctx.stroke();

  } else if (tipo === 'roundDouble') {
    ctx.beginPath();
    ctx.arc(40, yRedondo + 13, 12, 0, 2 * Math.PI);
    ctx.arc(canvas.width - 40, yRedondo + 13, 12, 0, 2 * Math.PI);
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

// ── Inicialização ─────────────────────────────────────────

redraw();

// ── Eventos ───────────────────────────────────────────────

document.getElementById('upload').addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (!file) return;

  setStatus('carregando...', 'warn');
  const reader = new FileReader();
  reader.onload = function (event) {
    uploadedImage = new Image();
    uploadedImage.onload = function () {
      hasImage = true;
      redraw();
      setStatus('imagem carregada', 'ok');
    };
    uploadedImage.src = event.target.result;
  };
  reader.readAsDataURL(file);
});

document.getElementById('holeType').addEventListener('change', function (e) {
  currentHole = e.target.value;
  redraw();
});

document.getElementById('borderColor').addEventListener('change', function (e) {
  borderColor = e.target.value;
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
  link.download = 'verificacao-arte.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
});

// productType — extensível para futuros tamanhos diferentes
document.getElementById('productType').addEventListener('change', function () {
  redraw();
});
