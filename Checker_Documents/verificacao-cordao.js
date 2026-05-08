/* verificacao-cordao.js — Verificação de Cordão v2.0
   Tamanho real: 900mm × 27mm @ 96dpi = 3402 × 102 px
*/

const canvas = document.getElementById('canvas');
const ctx    = canvas.getContext('2d');
let uploadedImage = new Image();
let hasImage = false;

/* Dimensões reais: 900mm x 27mm @ 96dpi (1mm = 3.7795px) */
const W = 3402;  // 900mm
const H = 102;   // 27mm

canvas.width  = W;
canvas.height = H;

/* margens: ~1mm = 4px (corte), ~2mm = 8px (segurança) */
const C = 4;   // corte
const S = 8;   // segurança

/* ── Utilitários ─────────────────────────────────────── */
function setStatus(text, type = 'ok') {
  const b = document.getElementById('status-badge');
  if (!b) return;
  b.textContent = text;
  b.className = 'status-badge status-' + type;
}

/* ── Desenho ─────────────────────────────────────────── */
function desenharMarcas() {
  ctx.lineJoin = 'round';
  ctx.lineCap  = 'round';

  // Sangria (ciano) — 3402×102
  ctx.strokeStyle = '#00FFFF';
  ctx.lineWidth = 3;
  ctx.strokeRect(1.5, 1.5, W - 3, H - 3);

  // Corte (vermelho)
  ctx.strokeStyle = '#FF0000';
  ctx.lineWidth = 3;
  ctx.strokeRect(C, C, W - C * 2, H - C * 2);

  // Segurança (verde)
  ctx.strokeStyle = '#00FF00';
  ctx.lineWidth = 3;
  ctx.strokeRect(S, S, W - S * 2, H - S * 2);
}

function redraw() {
  ctx.clearRect(0, 0, W, H);
  if (hasImage) {
    ctx.drawImage(uploadedImage, 0, 0, W, H);
  }
  desenharMarcas();
}

/* ── Init ────────────────────────────────────────────── */
redraw();

/* Atualiza label de tamanho */
const lbl = document.getElementById('canvas-size-label');
if (lbl) lbl.textContent = '900 × 27 mm  (3402 × 102 px)';

/* ── Eventos ─────────────────────────────────────────── */
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
