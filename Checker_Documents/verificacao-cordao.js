/* verificacao-cordao.js v2.2
   900×27mm @ 96dpi = 3402×102px | zoom | crop modal */

const MM = 96/25.4;
const CW = Math.round(900*MM);   // 3402
const CH = Math.round(27*MM);    // 102
const C  = Math.round(1*MM);     // ~4px
const S  = Math.round(2*MM);     // ~8px

const canvas = document.getElementById('canvas');
const ctx    = canvas.getContext('2d');
let img=new Image(), hasImg=false;
let zoom=1.0;
const ZS=0.25, ZMIN=0.1, ZMAX=3.0;

let cImg=null,cCvs=null,cCtx=null;
let cDrag=false,cStart={x:0,y:0},cRect={x:0,y:0,w:0,h:0},cScale=1;

canvas.width=CW; canvas.height=CH;

function setStatus(t,type='ok'){const b=document.getElementById('status-badge');if(b){b.textContent=t;b.className='status-badge status-'+type;}}
function applyZoom(){canvas.style.width=Math.round(CW*zoom)+'px';canvas.style.height=Math.round(CH*zoom)+'px';const l=document.getElementById('zoom-label');if(l)l.textContent=Math.round(zoom*100)+'%';}

function drawMarks(){
  ctx.lineJoin='round'; ctx.lineCap='round';
  ctx.strokeStyle='#00FFFF'; ctx.lineWidth=3; ctx.strokeRect(1.5,1.5,CW-3,CH-3);
  ctx.strokeStyle='#FF0000'; ctx.lineWidth=3; ctx.strokeRect(C,C,CW-C*2,CH-C*2);
  ctx.strokeStyle='#00FF00'; ctx.lineWidth=3; ctx.strokeRect(S,S,CW-S*2,CH-S*2);
}
function redraw(){ctx.clearRect(0,0,CW,CH);if(hasImg)ctx.drawImage(img,0,0,CW,CH);drawMarks();}

/* ── crop ── */
function openCrop(file){
  cCvs=document.getElementById('crop-canvas');
  cCtx=cCvs.getContext('2d');
  const reader=new FileReader();
  reader.onload=ev=>{
    cImg=new Image();
    cImg.onload=()=>{
      const maxW=Math.min(window.innerWidth-64,1040);
      const maxH=Math.min(window.innerHeight-280,440);
      cScale=Math.min(maxW/cImg.width,maxH/cImg.height,1);
      cCvs.width =Math.round(cImg.width *cScale);
      cCvs.height=Math.round(cImg.height*cScale);
      // sugestão: faixa central com proporção do cordão
      const rw=Math.min(Math.round(CW*cScale),cCvs.width);
      const rh=Math.min(Math.round(CH*cScale),cCvs.height);
      cRect={x:Math.round((cCvs.width-rw)/2),y:Math.round((cCvs.height-rh)/2),w:rw,h:rh};
      renderCrop();
      document.getElementById('crop-modal').classList.add('open');
    };
    cImg.src=ev.target.result;
  };
  reader.readAsDataURL(file);
}

function renderCrop(){
  if(!cCvs||!cImg)return;
  const W=cCvs.width,H=cCvs.height;
  cCtx.clearRect(0,0,W,H);
  cCtx.drawImage(cImg,0,0,W,H);
  cCtx.fillStyle='rgba(0,0,0,0.62)'; cCtx.fillRect(0,0,W,H);
  if(cRect.w>2&&cRect.h>2){
    cCtx.clearRect(cRect.x,cRect.y,cRect.w,cRect.h);
    cCtx.drawImage(cImg,cRect.x/cScale,cRect.y/cScale,cRect.w/cScale,cRect.h/cScale,cRect.x,cRect.y,cRect.w,cRect.h);
    cCtx.strokeStyle='#4f8fff'; cCtx.lineWidth=2; cCtx.strokeRect(cRect.x,cRect.y,cRect.w,cRect.h);
    const hs=8; cCtx.fillStyle='#fff';
    [[0,0],[cRect.w-hs,0],[0,cRect.h-hs],[cRect.w-hs,cRect.h-hs]].forEach(([dx,dy])=>cCtx.fillRect(cRect.x+dx,cRect.y+dy,hs,hs));
    const lbl=`${Math.round(cRect.w/cScale)} × ${Math.round(cRect.h/cScale)} px`;
    cCtx.font='11px DM Mono,monospace';
    const tw=cCtx.measureText(lbl).width+12;
    const lx=cRect.x, ly=cRect.y>28?cRect.y-26:cRect.y+cRect.h+4;
    cCtx.fillStyle='rgba(79,143,255,0.92)'; cCtx.fillRect(lx,ly,tw,20);
    cCtx.fillStyle='#fff'; cCtx.fillText(lbl,lx+6,ly+14);
  }
}

function getCXY(e){
  const r=cCvs.getBoundingClientRect();
  const sx=cCvs.width/r.width,sy=cCvs.height/r.height;
  const cx=e.touches?e.touches[0].clientX:e.clientX;
  const cy=e.touches?e.touches[0].clientY:e.clientY;
  return{x:(cx-r.left)*sx,y:(cy-r.top)*sy};
}

function applyCrop(){
  if(cRect.w<4||cRect.h<4){closeCrop();return;}
  const tmp=document.createElement('canvas');
  tmp.width=CW; tmp.height=CH;
  tmp.getContext('2d').drawImage(cImg,cRect.x/cScale,cRect.y/cScale,cRect.w/cScale,cRect.h/cScale,0,0,CW,CH);
  img=new Image();
  img.onload=()=>{hasImg=true;redraw();setStatus('imagem cortada ✓','ok');};
  img.src=tmp.toDataURL('image/png');
  closeCrop();
}
function closeCrop(){document.getElementById('crop-modal').classList.remove('open');}

/* ── init ── */
redraw(); applyZoom();
const lbl=document.getElementById('canvas-size-label');
if(lbl)lbl.textContent='900 × 27 mm  (3402 × 102 px)';

/* ── events ── */
document.getElementById('upload').addEventListener('change',function(e){const f=e.target.files[0];if(!f)return;this.value='';openCrop(f);});
document.getElementById('delete-image').addEventListener('click',function(){hasImg=false;img=new Image();redraw();setStatus('removida','warn');setTimeout(()=>setStatus('pronto','ok'),2000);});
document.getElementById('download-canvas').addEventListener('click',function(){const a=document.createElement('a');a.download='verificacao-cordao.png';a.href=canvas.toDataURL('image/png');a.click();});
document.getElementById('zoom-in').addEventListener('click',()=>{zoom=Math.min(ZMAX,zoom+ZS);applyZoom();});
document.getElementById('zoom-out').addEventListener('click',()=>{zoom=Math.max(ZMIN,zoom-ZS);applyZoom();});
document.getElementById('zoom-reset').addEventListener('click',()=>{zoom=1.0;applyZoom();});

window.addEventListener('DOMContentLoaded',()=>{
  const cc=document.getElementById('crop-canvas');if(!cc)return;
  cc.addEventListener('mousedown',e=>{cDrag=true;cStart=getCXY(e);cRect={...cStart,w:0,h:0};});
  cc.addEventListener('mousemove',e=>{if(!cDrag)return;const p=getCXY(e);cRect.x=Math.min(cStart.x,p.x);cRect.y=Math.min(cStart.y,p.y);cRect.w=Math.abs(p.x-cStart.x);cRect.h=Math.abs(p.y-cStart.y);renderCrop();});
  cc.addEventListener('mouseup',()=>cDrag=false);
  cc.addEventListener('mouseleave',()=>cDrag=false);
  cc.addEventListener('touchstart',e=>{e.preventDefault();cDrag=true;cStart=getCXY(e);cRect={...cStart,w:0,h:0};},{passive:false});
  cc.addEventListener('touchmove',e=>{e.preventDefault();if(!cDrag)return;const p=getCXY(e);cRect.x=Math.min(cStart.x,p.x);cRect.y=Math.min(cStart.y,p.y);cRect.w=Math.abs(p.x-cStart.x);cRect.h=Math.abs(p.y-cStart.y);renderCrop();},{passive:false});
  cc.addEventListener('touchend',()=>cDrag=false);
  document.getElementById('crop-confirm').addEventListener('click',applyCrop);
  document.getElementById('crop-cancel').addEventListener('click',closeCrop);
  document.getElementById('crop-modal-close').addEventListener('click',closeCrop);
  document.getElementById('crop-modal').addEventListener('click',e=>{if(e.target===e.currentTarget)closeCrop();});
});
