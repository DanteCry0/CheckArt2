/* =============================================================
   script.js — Verificação de Arte v2.2
   Dimensões exatas | Furos proporcionais | Zoom | Crop modal
   ============================================================= */

const MM = 96 / 25.4;

const PRODUTOS = {
  credencial: {
    label: 'Credencial — 94×144 mm',
    sw: 94*MM, sh: 144*MM,
    cOx: (94-90)/2*MM, cOy: (144-139)/2*MM,
    sOx: (94-82)/2*MM, sOy: (144-131)/2*MM,
    furos: { ovalW:54, ovalH:12, circR:10 }
  },
  cracha: {
    label: 'Crachá — 57×88 mm',
    sw: 57*MM, sh: 88*MM,
    cOx: (57-53)/2*MM, cOy: (88-83)/2*MM,
    sOx: (57-50)/2*MM, sOy: (88-77)/2*MM,
    furos: { ovalW:32, ovalH:8, circR:6 }
  },
  carteirinha: {
    label: 'Carteirinha — 88×57 mm',
    sw: 88*MM, sh: 57*MM,
    cOx: (88-83)/2*MM, cOy: (57-53)/2*MM,
    sOx: (88-77)/2*MM, sOy: (57-50)/2*MM,
    furos: { ovalW:32, ovalH:8, circR:6 }
  }
};

// canvas & state
const canvas = document.getElementById('canvas');
const ctx    = canvas.getContext('2d');
let img       = new Image(), hasImg = false;
let hole      = 'none', holeColor = 'black';
let prod      = 'credencial';
let zoom      = 1.0;
const ZS = 0.25, ZMIN = 0.25, ZMAX = 4.0;

// crop state
let cImg=null, cCvs=null, cCtx=null;
let cDrag=false, cStart={x:0,y:0}, cRect={x:0,y:0,w:0,h:0}, cScale=1;

/* ── utils ── */
const R = n => Math.round(n);
function setStatus(t,type='ok'){
  const b=document.getElementById('status-badge');
  if(b){b.textContent=t;b.className='status-badge status-'+type;}
}
function setZoomLabel(){ const l=document.getElementById('zoom-label'); if(l)l.textContent=R(zoom*100)+'%'; }
function applyZoom(){
  const p=PRODUTOS[prod];
  canvas.style.width =R(p.sw*zoom)+'px';
  canvas.style.height=R(p.sh*zoom)+'px';
  setZoomLabel();
}
function rr(c,x,y,w,h,r){
  r=Math.min(r,w/2,h/2);
  c.beginPath();
  c.moveTo(x+r,y); c.lineTo(x+w-r,y); c.arcTo(x+w,y,x+w,y+r,r);
  c.lineTo(x+w,y+h-r); c.arcTo(x+w,y+h,x+w-r,y+h,r);
  c.lineTo(x+r,y+h); c.arcTo(x,y+h,x,y+h-r,r);
  c.lineTo(x,y+r); c.arcTo(x,y,x+r,y,r);
  c.closePath(); c.stroke();
}

/* ── draw ── */
function drawMarks(){
  const p=PRODUTOS[prod], W=canvas.width, H=canvas.height;
  const rad=Math.min(10,W*.03,H*.03);
  ctx.lineWidth=2;
  ctx.strokeStyle='#00FFFF'; rr(ctx,1,1,W-2,H-2,rad);
  ctx.strokeStyle='#FF0000'; rr(ctx,p.cOx,p.cOy,W-p.cOx*2,H-p.cOy*2,rad);
  ctx.strokeStyle='#00FF00'; rr(ctx,p.sOx,p.sOy,W-p.sOx*2,H-p.sOy*2,rad);
}

function drawHole(tipo){
  if(tipo==='none') return;
  const p=PRODUTOS[prod], f=p.furos, W=canvas.width;
  const yOv = p.sOy+5, yRd = p.sOy+f.circR+2;
  const margin = p.sOx+5;
  ctx.strokeStyle=holeColor; ctx.fillStyle=holeColor; ctx.lineWidth=1.5;

  if(tipo==='ovalCenter'){
    ctx.strokeRect(R((W-f.ovalW)/2), R(yOv), f.ovalW, f.ovalH);
  } else if(tipo==='ovalDouble'){
    ctx.strokeRect(R(margin),R(yOv),f.ovalW,f.ovalH);
    ctx.strokeRect(R(W-margin-f.ovalW),R(yOv),f.ovalW,f.ovalH);
  } else if(tipo==='roundCenter'){
    ctx.beginPath(); ctx.arc(W/2,R(yRd),f.circR,0,2*Math.PI); ctx.stroke();
  } else if(tipo==='roundDouble'){
    ctx.beginPath();
    ctx.arc(R(margin+f.circR),R(yRd),f.circR,0,2*Math.PI);
    ctx.arc(R(W-margin-f.circR),R(yRd),f.circR,0,2*Math.PI);
    ctx.fill();
  }
}

function redraw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  if(hasImg) ctx.drawImage(img,0,0,canvas.width,canvas.height);
  drawMarks(); drawHole(hole);
}

function setProduto(tipo){
  prod=tipo;
  const p=PRODUTOS[tipo];
  canvas.width=R(p.sw); canvas.height=R(p.sh);
  applyZoom();
  const l=document.getElementById('canvas-size-label');
  if(l) l.textContent=p.label;
  redraw();
}

/* ══════════════════════════════════════════════════
   CROP MODAL
   ══════════════════════════════════════════════════ */
function openCrop(file){
  cCvs=document.getElementById('crop-canvas');
  cCtx=cCvs.getContext('2d');
  const modal=document.getElementById('crop-modal');
  const sel=document.getElementById('crop-prod-sel');
  if(sel) sel.value=prod;

  const reader=new FileReader();
  reader.onload=ev=>{
    cImg=new Image();
    cImg.onload=()=>{
      const maxW=Math.min(window.innerWidth-64,1000);
      const maxH=Math.min(window.innerHeight-280,560);
      cScale=Math.min(maxW/cImg.width, maxH/cImg.height, 1);
      cCvs.width =R(cImg.width *cScale);
      cCvs.height=R(cImg.height*cScale);
      suggestRect(prod);
      renderCrop();
      modal.classList.add('open');
    };
    cImg.src=ev.target.result;
  };
  reader.readAsDataURL(file);
}

function suggestRect(tipo){
  if(!cCvs||!cImg) return;
  const p=PRODUTOS[tipo];
  const rw=Math.min(R(p.sw*cScale),cCvs.width);
  const rh=Math.min(R(p.sh*cScale),cCvs.height);
  cRect={x:R((cCvs.width-rw)/2),y:R((cCvs.height-rh)/2),w:rw,h:rh};
}

function renderCrop(){
  if(!cCvs||!cImg) return;
  const W=cCvs.width,H=cCvs.height;
  cCtx.clearRect(0,0,W,H);
  cCtx.drawImage(cImg,0,0,W,H);

  // escurecer tudo
  cCtx.fillStyle='rgba(0,0,0,0.62)';
  cCtx.fillRect(0,0,W,H);

  if(cRect.w>2&&cRect.h>2){
    // janela clara
    cCtx.clearRect(cRect.x,cRect.y,cRect.w,cRect.h);
    cCtx.drawImage(cImg, cRect.x/cScale,cRect.y/cScale,cRect.w/cScale,cRect.h/cScale,
                         cRect.x,cRect.y,cRect.w,cRect.h);

    // borda
    cCtx.strokeStyle='#4f8fff'; cCtx.lineWidth=2;
    cCtx.strokeRect(cRect.x,cRect.y,cRect.w,cRect.h);

    // alças
    const hs=8; cCtx.fillStyle='#fff';
    [[0,0],[cRect.w-hs,0],[0,cRect.h-hs],[cRect.w-hs,cRect.h-hs]].forEach(([dx,dy])=>{
      cCtx.fillRect(cRect.x+dx,cRect.y+dy,hs,hs);
    });

    // grade de terços
    cCtx.strokeStyle='rgba(255,255,255,0.18)'; cCtx.lineWidth=1;
    for(let i=1;i<3;i++){
      cCtx.beginPath(); cCtx.moveTo(cRect.x+cRect.w*i/3,cRect.y); cCtx.lineTo(cRect.x+cRect.w*i/3,cRect.y+cRect.h); cCtx.stroke();
      cCtx.beginPath(); cCtx.moveTo(cRect.x,cRect.y+cRect.h*i/3); cCtx.lineTo(cRect.x+cRect.w,cRect.y+cRect.h*i/3); cCtx.stroke();
    }

    // label dimensão
    const rw=R(cRect.w/cScale), rh=R(cRect.h/cScale);
    const lbl=`${rw} × ${rh} px`;
    cCtx.font='11px DM Mono,monospace';
    const tw=cCtx.measureText(lbl).width+12;
    const lx=cRect.x, ly=cRect.y>28?cRect.y-26:cRect.y+cRect.h+4;
    cCtx.fillStyle='rgba(79,143,255,0.92)'; cCtx.fillRect(lx,ly,tw,20);
    cCtx.fillStyle='#fff'; cCtx.fillText(lbl,lx+6,ly+14);
  }
}

function getCropXY(e){
  const rect=cCvs.getBoundingClientRect();
  const sx=cCvs.width/rect.width, sy=cCvs.height/rect.height;
  const cx=e.touches?e.touches[0].clientX:e.clientX;
  const cy=e.touches?e.touches[0].clientY:e.clientY;
  return{x:(cx-rect.left)*sx, y:(cy-rect.top)*sy};
}

function applyCrop(){
  if(cRect.w<4||cRect.h<4){ closeCrop(); return; }
  cRect.x=Math.max(0,cRect.x); cRect.y=Math.max(0,cRect.y);
  cRect.w=Math.min(cRect.w,cCvs.width-cRect.x);
  cRect.h=Math.min(cRect.h,cCvs.height-cRect.y);

  const p=PRODUTOS[prod];
  const tmp=document.createElement('canvas');
  tmp.width=R(p.sw); tmp.height=R(p.sh);
  tmp.getContext('2d').drawImage(cImg,
    cRect.x/cScale,cRect.y/cScale,cRect.w/cScale,cRect.h/cScale,
    0,0,tmp.width,tmp.height);

  img=new Image();
  img.onload=()=>{ hasImg=true; redraw(); setStatus('imagem cortada ✓','ok'); };
  img.src=tmp.toDataURL('image/png');
  closeCrop();
}
function closeCrop(){ document.getElementById('crop-modal').classList.remove('open'); }

/* ── Init ── */
setProduto('credencial');

/* ── Event listeners ── */
document.getElementById('productType').addEventListener('change',function(){ setProduto(this.value); const s=document.getElementById('crop-prod-sel'); if(s)s.value=this.value; });
document.getElementById('upload').addEventListener('change',function(e){ const f=e.target.files[0]; if(!f)return; this.value=''; openCrop(f); });
document.getElementById('holeType').addEventListener('change',function(){ hole=this.value; redraw(); });
document.getElementById('borderColor').addEventListener('change',function(){ holeColor=this.value; redraw(); });
document.getElementById('delete-image').addEventListener('click',function(){ hasImg=false; img=new Image(); redraw(); setStatus('removida','warn'); setTimeout(()=>setStatus('pronto','ok'),2000); });
document.getElementById('download-canvas').addEventListener('click',function(){ const a=document.createElement('a'); a.download='verificacao-'+prod+'.png'; a.href=canvas.toDataURL('image/png'); a.click(); });
document.getElementById('zoom-in').addEventListener('click',()=>{ zoom=Math.min(ZMAX,zoom+ZS); applyZoom(); });
document.getElementById('zoom-out').addEventListener('click',()=>{ zoom=Math.max(ZMIN,zoom-ZS); applyZoom(); });
document.getElementById('zoom-reset').addEventListener('click',()=>{ zoom=1.0; applyZoom(); });

window.addEventListener('DOMContentLoaded',()=>{
  const cc=document.getElementById('crop-canvas'); if(!cc)return;

  cc.addEventListener('mousedown',e=>{ cDrag=true; cStart=getCropXY(e); cRect={...cStart,w:0,h:0}; });
  cc.addEventListener('mousemove',e=>{ if(!cDrag)return; const p=getCropXY(e); cRect.x=Math.min(cStart.x,p.x); cRect.y=Math.min(cStart.y,p.y); cRect.w=Math.abs(p.x-cStart.x); cRect.h=Math.abs(p.y-cStart.y); renderCrop(); });
  cc.addEventListener('mouseup',()=>cDrag=false);
  cc.addEventListener('mouseleave',()=>cDrag=false);
  cc.addEventListener('touchstart',e=>{ e.preventDefault(); cDrag=true; cStart=getCropXY(e); cRect={...cStart,w:0,h:0}; },{passive:false});
  cc.addEventListener('touchmove',e=>{ e.preventDefault(); if(!cDrag)return; const p=getCropXY(e); cRect.x=Math.min(cStart.x,p.x); cRect.y=Math.min(cStart.y,p.y); cRect.w=Math.abs(p.x-cStart.x); cRect.h=Math.abs(p.y-cStart.y); renderCrop(); },{passive:false});
  cc.addEventListener('touchend',()=>cDrag=false);

  document.getElementById('crop-confirm').addEventListener('click',applyCrop);
  document.getElementById('crop-cancel').addEventListener('click',closeCrop);
  document.getElementById('crop-modal-close').addEventListener('click',closeCrop);
  document.getElementById('crop-modal').addEventListener('click',e=>{ if(e.target===e.currentTarget)closeCrop(); });
  document.getElementById('crop-prod-sel').addEventListener('change',function(){ suggestRect(this.value); renderCrop(); });
});
