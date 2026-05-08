/* visualizacao-arquivos.js — Visualização de Arquivos v2.0 */

const fileInput    = document.getElementById('file-upload');
const previewArea  = document.getElementById('file-preview');
const convertBtn   = document.getElementById('convert-file');
const clearBtn     = document.getElementById('clear-file');
const fileNameEl   = document.getElementById('file-name');
const fileSizeEl   = document.getElementById('file-size');
const fileInfoEl   = document.getElementById('file-info');
const previewLabel = document.getElementById('preview-label');
const statusBadge  = document.getElementById('status-badge');

let currentObjectURL = null;
let currentFile = null;

// ── Utilitários ──────────────────────────────────────────

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

function setStatus(text, type = 'ok') {
  statusBadge.textContent = text;
  statusBadge.className = 'status-badge status-' + type;
  statusBadge.style.display = '';
}

function showEmpty() {
  previewArea.innerHTML = `
    <div class="preview-empty">
      <div class="preview-empty-icon">📄</div>
      <p>Envie um arquivo para visualizar</p>
    </div>`;
  previewLabel.textContent = 'nenhum arquivo';
  statusBadge.style.display = 'none';
  fileInfoEl.style.display = 'none';
  convertBtn.disabled = true;
  clearBtn.disabled = true;
  currentFile = null;
}

// ── Handlers ─────────────────────────────────────────────

fileInput.addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (!file) return;

  // Libera URL anterior
  if (currentObjectURL) URL.revokeObjectURL(currentObjectURL);

  currentFile = file;
  currentObjectURL = URL.createObjectURL(file);

  // Mostra info do arquivo
  fileNameEl.textContent = file.name;
  fileSizeEl.textContent = formatBytes(file.size);
  fileInfoEl.style.display = '';
  previewLabel.textContent = file.name;

  // Ativa botões
  convertBtn.disabled = false;
  clearBtn.disabled = false;

  // Renderiza preview
  if (file.type === 'application/pdf') {
    renderPDF(currentObjectURL);
    setStatus('PDF', 'ok');
  } else if (file.type.startsWith('image/')) {
    renderImage(currentObjectURL);
    setStatus('imagem', 'ok');
  } else {
    previewArea.innerHTML = `<div class="preview-empty"><div class="preview-empty-icon">⚠️</div><p>Prévia não disponível para este tipo de arquivo.</p></div>`;
    setStatus('não suportado', 'warn');
  }
});

function renderPDF(url) {
  previewArea.innerHTML = '';
  const iframe = document.createElement('iframe');
  iframe.src = url;
  previewArea.appendChild(iframe);
}

function renderImage(url) {
  previewArea.innerHTML = '';
  const img = document.createElement('img');
  img.src = url;
  img.alt = 'Preview';
  previewArea.appendChild(img);
}

// ── Converter para JPG ────────────────────────────────────

convertBtn.addEventListener('click', function () {
  if (!currentFile) return;

  if (currentFile.type.startsWith('image/')) {
    // Imagens: converter via canvas
    const img = new Image();
    img.onload = function () {
      const cvs = document.createElement('canvas');
      cvs.width = img.naturalWidth;
      cvs.height = img.naturalHeight;
      const c = cvs.getContext('2d');
      // Fundo branco (necessário para PNG transparente → JPG)
      c.fillStyle = '#ffffff';
      c.fillRect(0, 0, cvs.width, cvs.height);
      c.drawImage(img, 0, 0);
      const link = document.createElement('a');
      link.download = currentFile.name.replace(/\.[^.]+$/, '') + '.jpg';
      link.href = cvs.toDataURL('image/jpeg', 0.95);
      link.click();
      setStatus('baixado!', 'ok');
    };
    img.src = currentObjectURL;

  } else if (currentFile.type === 'application/pdf') {
    // PDF: informa limitação do browser
    alert('Para PDFs, utilize a opção de impressão do visualizador (Ctrl+P) e salve como imagem, ou use uma ferramenta dedicada como o ILovePDF.');
  }
});

// ── Limpar ────────────────────────────────────────────────

clearBtn.addEventListener('click', function () {
  fileInput.value = '';
  if (currentObjectURL) URL.revokeObjectURL(currentObjectURL);
  currentObjectURL = null;
  showEmpty();
});

// ── Init ──────────────────────────────────────────────────
showEmpty();
