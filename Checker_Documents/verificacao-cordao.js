/* verificacao-cordao.js — Verificação de Cordão v2.0 */

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let uploadedImage = new Image();
let hasImage = false;

canvas.width = 10630;
canvas.height = 342;

// ── Utilitários ──────────────────────────────────────────

function setStatus(text, type = 'ok') {
  const badge = document.getElementById('status-badge');
  if (!badge) return;
  badge.textContent = text;
  badge.className = 'status-badge status-' + type;
}

// ── Desenho ──────────────────────────────────────────────

function desenharMarcas() {
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  // Sangria (ciano) — 10630×342
  ctx.strokeStyle = '#00FFFF';
  ctx.lineWidth = 6;
  ctx.strokeRect(3, 3, 10624, 336);

  // Corte (vermelho) — 10238×318, centrado
  ctx.strokeStyle = '#FF0000';
  ctx.lineWidth = 6;
  ctx.strokeRect(192, 12, 10238, 318);

  // Segurança (verde) — 9902×298, centrado
  ctx.strokeStyle = '#00FF00';
  ctx.lineWidth = 6;
  ctx.strokeRect(380, 22, 9870, 298);
}

function redraw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (hasImage) {
    ctx.drawImage(uploadedImage, 0, 0, canvas.width, canvas.height);
  }
  desenharMarcas();
}

// ── Init ──────────────────────────────────────────────────

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
  link.download = 'verificacao-cordao.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
});
