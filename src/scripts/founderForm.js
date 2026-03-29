/* eslint-disable */
// ── Flaynn Founder Form — extracted from FounderForm.astro ──
const { BETA_CODE, WEBHOOK_URL, UPLOAD_URL } = window.__FF_CONFIG;

// ── Main form logic ──────────────────────────────────────────
(function(){
  const TOTAL = 30;
  let current = 0;
  let startTime = null;
  const csrf = crypto.randomUUID();
  const uploads = { 28:{url:'',filename:''}, 30:{url:'',filename:''} };
  const SK = 'ff_data';

  const overlay  = document.getElementById('ff-overlay');
  const bar      = document.getElementById('ff-bar');
  const lbl      = document.getElementById('ff-step-label');
  const kbdBar   = document.getElementById('ff-kbd-bar');
  const closeBtn = document.getElementById('ff-close');

  // ── Helpers ──────────────────────────────────────────────
  const step  = n => document.querySelector(`.ff-step[data-step="${n}"]`);
  const inp   = n => document.getElementById(`ff-${n}`);
  const err   = n => document.getElementById(`ff-err-${n}`);
  const setErr= (n,m) => { const e=err(n); if(e) e.textContent=m; };
  const clrErr= n => { const e=err(n); if(e) e.textContent=''; };
  const choice= n => { const g=document.getElementById(`ff-${n}`); if(!g) return ''; const s=g.querySelector('.ff-choice.selected'); return s?s.dataset.value:''; };

  function progress(n){
    const pct = n===0 ? 3 : Math.round((n/TOTAL)*100);
    bar.style.width = pct+'%';
    lbl.textContent = n===0 ? 'Accès' : `${n} / ${TOTAL}`;
  }

  function reqLabels(){
    const rev = choice(18) === 'Oui';
    [19,20].forEach(n => {
      const el = document.getElementById(`ff-${n}-req-label`);
      if(el) el.innerHTML = rev
        ? '<span class="ff-req" style="font-size:.55em;color:var(--orange)">*</span>'
        : '<span class="ff-opt">— optionnel</span>';
    });
  }

  function saveSession(){
    const d={};
    for(let i=1;i<=30;i++){
      const el=inp(i);
      if(!el||el.type==='file') continue;
      d[`f${i}`]=el.value;
    }
    document.querySelectorAll('.ff-choice.selected').forEach(b=>{
      const g=b.closest('.ff-choices');
      if(g) d[`c${g.id}`]=b.dataset.value;
    });
    sessionStorage.setItem(SK,JSON.stringify(d));
  }

  function loadSession(){
    try{
      const raw=sessionStorage.getItem(SK);
      if(!raw) return;
      const d=JSON.parse(raw);
      for(const [k,v] of Object.entries(d)){
        if(k.startsWith('f')){
          const el=document.getElementById(`ff-${k.slice(1)}`);
          if(el&&el.type!=='file') el.value=v;
        } else if(k.startsWith('c')){
          const g=document.getElementById(k.slice(1));
          if(g) g.querySelectorAll('.ff-choice').forEach(b=>{ if(b.dataset.value===v) b.classList.add('selected'); });
        }
      }
      syncCounters();
      const saved11=inp(11)?.value;
      setTimeout(()=>{
        if(saved11&&window.__ffRestoreCS) window.__ffRestoreCS(11,saved11);
      },50);
    }catch(e){}
  }

  function syncCounters(){
    [[8,140],[9,400],[10,400],[21,500]].forEach(([n,max])=>{
      const el=inp(n); const c=document.getElementById(`ff-count-${n}`);
      if(el&&c) c.textContent=`${el.value.length} / ${max}`;
    });
  }

  // ── Keyboard hint injection ─────────────────────────────
  function updateKbd(n){
    const s=step(n);
    if(!s){kbdBar.style.display='none'; kbdBar.classList.remove('visible'); return;}

    const hasText=s.querySelector('.ff-input:not([type=file]),.ff-textarea');
    const navRight=s.querySelector('.ff-nav-right');

    if(hasText && navRight){
      const btnNext=navRight.querySelector('.ff-btn-next');
      navRight.insertBefore(kbdBar, btnNext);
      kbdBar.style.display='flex';
      setTimeout(()=>kbdBar.classList.add('visible'), 10);
    } else {
      kbdBar.classList.remove('visible');
      setTimeout(()=> {if(!kbdBar.classList.contains('visible')) kbdBar.style.display='none';}, 300);
    }
  }

  // ── Validation ───────────────────────────────────────────
  const EMAIL_RE=/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const URL_RE=/^https?:\/\/.+\..+/;

  function validate(n){
    clrErr(n);
    const el=inp(n);
    const required=()=>{ if(!el||!el.value.trim()){setErr(n,'Ce champ est requis.');return false;} return true; };
    switch(n){
      case 0: if(!el||el.value.trim()!==BETA_CODE){setErr(0,'Code invalide. Contactez contact@flaynn.fr.');return false;} return true;
      case 1: if(!choice(1)){setErr(1,'Sélectionnez une option.');return false;} return true;
      case 2:case 4:case 5:case 7:case 11:case 12:case 14:case 23:case 25:case 27: return required();
      case 3: if(!required()) return false; if(!EMAIL_RE.test(el.value.trim())){setErr(3,'Email invalide.');return false;} return true;
      case 8:case 9:case 10:case 21: return required();
      case 13: if(!el||el.value===''){setErr(13,'Ce champ est requis.');return false;} return true;
      case 17:case 18:case 22:case 24: if(!choice(n)){setErr(n,'Sélectionnez une option.');return false;} return true;
      case 19:case 20: if(choice(18)==='Oui'&&(!el||el.value==='')){setErr(n,'Ce champ est requis.');return false;} return true;
      case 28: if(!uploads[28].url){setErr(28,'Uploadez votre pitch deck.');return false;} return true;
      case 29: { const v=el?el.value.trim():''; if(v&&!URL_RE.test(v)){setErr(29,'URL invalide (commencer par https://).');return false;} return true; }
      default: return true;
    }
  }

  // ── Navigation (Ghosting Fixed!) ─────────────────────
  function showStep(n, dir=1){
    const prev=step(current);
    let delay = 0;

    if(prev&&!prev.hidden){
      prev.classList.add('leaving');
      setTimeout(()=>{ prev.hidden=true; prev.classList.remove('leaving'); }, 220);
      delay = 280;
    }

    setTimeout(()=>{
      const next=step(n);
      if(!next) return;
      next.hidden=false;
      current=n;
      progress(n);
      reqLabels();
      updateKbd(n);
      overlay.scrollTo(0,0);
      const f=next.querySelector('.ff-input:not([type=file]),.ff-textarea');
      if(f) setTimeout(()=>f.focus(),50);
      saveSession();
    }, delay);
  }

  function goNext(n){
    if(!validate(n)) return;
    if(n===30){submit();return;}
    showStep(n+1,1);
  }
  function goBack(n){
    showStep(n<=1?0:n-1,-1);
  }

  // ── Open / Close ─────────────────────────────────────────
  function openForm(){
    overlay.hidden=false;
    document.body.style.overflow='hidden';
    startTime=Date.now();
    current=0;
    document.querySelectorAll('.ff-step').forEach((s,i)=>{ s.hidden=i!==0; });
    progress(0);
    updateKbd(0);
    const f=inp(0); if(f) setTimeout(()=>f.focus(),80);
    loadSession();
  }
  function closeForm(){
    overlay.hidden=true;
    document.body.style.overflow='';
    kbdBar.classList.remove('visible');
    setTimeout(()=>kbdBar.style.display='none',300);
  }

  window.openFounderForm=openForm;
  closeBtn.addEventListener('click',closeForm);
  overlay.addEventListener('click',e=>{ if(e.target===overlay) closeForm(); });
  document.addEventListener('keydown',e=>{ if(e.key==='Escape'&&!overlay.hidden) closeForm(); });

  // ── Button delegation ─────────────────────────────────────
  overlay.addEventListener('click',e=>{
    const nb=e.target.closest('.ff-btn-next');
    const bb=e.target.closest('.ff-btn-back');
    if(nb){ goNext(parseInt(nb.dataset.step)); return; }
    if(bb){ goBack(parseInt(bb.dataset.step)); return; }
  });

  overlay.addEventListener('keydown',e=>{
    if(e.key!=='Enter') return;
    if(e.target.tagName==='TEXTAREA') return;
    if(e.target.closest('.ff-choices')) return;
    const s=step(current);
    if(!s) return;
    const btn=s.querySelector('.ff-btn-next');
    if(btn) btn.click();
  });

  // ── Choice selection ──────────────────────────────────────
  overlay.addEventListener('click',e=>{
    const c=e.target.closest('.ff-choice');
    if(!c) return;
    const g=c.closest('.ff-choices');
    if(!g) return;
    g.querySelectorAll('.ff-choice').forEach(b=>b.classList.remove('selected'));
    c.classList.add('selected');
    clrErr(current);
    saveSession();
  });

  // ── Counters ──────────────────────────────────────────────
  [[8,140],[9,400],[10,400],[21,500]].forEach(([n,max])=>{
    const el=inp(n);
    const c=document.getElementById(`ff-count-${n}`);
    if(el&&c) el.addEventListener('input',()=>{ c.textContent=`${el.value.length} / ${max}`; saveSession(); });
  });
  for(let i=1;i<=30;i++){
    const el=inp(i);
    if(el&&el.type!=='file') el.addEventListener('input',()=>saveSession());
  }
  [11].forEach(n=>{ const el=inp(n); if(el) el.addEventListener('change',()=>saveSession()); });

  // ── File upload ───────────────────────────────────────────
  function setupUpload(sn){
    const fileInput=inp(sn);
    const zone=document.getElementById(`ff-file-zone-${sn}`);
    const idle=document.getElementById(`ff-drop-idle-${sn}`);
    const active=document.getElementById(`ff-file-info-${sn}`);
    const nameEl=document.getElementById(`ff-file-name-${sn}`);
    const fillEl=document.getElementById(`ff-upload-bar-${sn}`);
    const statEl=document.getElementById(`ff-file-status-${sn}`);
    const MAX=15*1024*1024;
    const TYPES28=['.pdf'];
    const TYPES30=['.pdf','.doc','.docx','.xls','.xlsx','.ppt','.pptx','.jpg','.png'];

    if(!fileInput||!zone) return;

    zone.addEventListener('dragover',e=>{ e.preventDefault(); zone.classList.add('drag-over'); });
    zone.addEventListener('dragleave',()=>zone.classList.remove('drag-over'));
    zone.addEventListener('drop',e=>{ e.preventDefault(); zone.classList.remove('drag-over'); if(e.dataTransfer.files.length) upload(e.dataTransfer.files[0]); });
    fileInput.addEventListener('change',()=>{ if(fileInput.files.length) upload(fileInput.files[0]); });

    function upload(file){
      clrErr(sn);
      const allowed=sn===28?TYPES28:TYPES30;
      const ext='.'+file.name.split('.').pop().toLowerCase();
      if(!allowed.includes(ext)){ setErr(sn,`Format non accepté. Formats : ${allowed.join(', ')}`); return; }
      if(file.size>MAX){ setErr(sn,'Fichier trop volumineux (max 15 Mo).'); return; }

      idle.hidden=true; active.hidden=false;
      nameEl.textContent=`${file.name}  ·  ${(file.size/1024/1024).toFixed(1)} Mo`;
      fillEl.style.width='0%';
      statEl.textContent='Upload en cours…'; statEl.className='ff-file-status';

      const fd=new FormData(); fd.append('file',file);
      const xhr=new XMLHttpRequest();
      xhr.open('POST',UPLOAD_URL);
      xhr.upload.addEventListener('progress',e=>{ if(e.lengthComputable) fillEl.style.width=Math.round(e.loaded/e.total*100)+'%'; });
      xhr.addEventListener('load',()=>{
        if(xhr.status>=200&&xhr.status<300){
          try{
            const res=JSON.parse(xhr.responseText);
            uploads[sn]={url:res.url,filename:file.name};
            fillEl.style.width='100%';
            statEl.textContent='✓ Fichier prêt'; statEl.className='ff-file-status ok';
          } catch(e2){ statEl.textContent='Erreur de réponse.'; statEl.className='ff-file-status err'; setErr(sn,'Réessayez.'); }
        } else { statEl.textContent=`Erreur ${xhr.status}`; statEl.className='ff-file-status err'; setErr(sn,'Erreur upload.'); }
      });
      xhr.addEventListener('error',()=>{ statEl.textContent='Erreur réseau'; statEl.className='ff-file-status err'; setErr(sn,'Erreur réseau.'); });
      xhr.send(fd);
    }
  }
  setupUpload(28); setupUpload(30);

  // ── Submit ────────────────────────────────────────────────
  async function submit(){
    const hp=document.getElementById('ff-honeypot');
    if(hp&&hp.value) return;
    const dur=Math.round((Date.now()-startTime)/1000);
    if(dur<10) return;

    showStep(31,1);
    const spinner=document.getElementById('ff-final-spinner');
    const success=document.getElementById('ff-final-success');
    const errorEl=document.getElementById('ff-final-error');
    spinner.hidden=false; success.hidden=true; errorEl.hidden=true;

    const v=n=>{ const el=inp(n); return el?el.value.trim():''; };
    const payload={
      code_acces:v(0), re_soumission:choice(1),
      nom_fondateur:v(2), email:v(3), pays:v(4), ville:v(5), telephone:v(6),
      nom_startup:v(7), pitch_une_phrase:v(8), probleme:v(9), solution:v(10),
      secteur:v(11), type_client:v(12), tam_usd:parseFloat(v(13))||0, estimation_tam:v(14),
      acquisition_clients:v(15), concurrents:v(16), stade:choice(17), revenus:choice(18),
      mrr:parseFloat(v(19))||0, clients_payants:parseInt(v(20))||0,
      pourquoi_vous:v(21), equipe_temps_plein:choice(22), priorite_6_mois:v(23),
      montant_leve:choice(24), jalons_18_mois:v(25), utilisation_fonds:v(26), vision_5_ans:v(27),
      pitch_deck_url:uploads[28].url, pitch_deck_filename:uploads[28].filename,
      lien_demo:v(29),
      doc_supplementaire_url:uploads[30].url, doc_supplementaire_filename:uploads[30].filename,
      submitted_at:new Date().toISOString(), csrf_token:csrf,
      fill_duration_seconds:dur, honeypot:hp?hp.value:''
    };

    try{
      const res=await fetch(WEBHOOK_URL,{ method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) });
      spinner.hidden=true;
      if(res.ok){
        document.getElementById('ff-success-email').textContent=payload.email;
        success.hidden=false;
        sessionStorage.removeItem(SK);
      } else { errorEl.hidden=false; }
    } catch(e){ spinner.hidden=true; errorEl.hidden=false; }
  }

  document.getElementById('ff-retry').addEventListener('click',()=>showStep(30,-1));

  // ── Init ─────────────────────────────────────────────────
  progress(0); reqLabels(); updateKbd(0);
})();

// ── Searchable Combobox Engine (Secteur uniquement) ────────
(function(){

const SECTORS=[
  {value:'fintech',label:'Fintech & Paiements',prefix:'💳'},
  {value:'insurtech',label:'Insurtech',prefix:'🛡️'},
  {value:'regtech',label:'Regtech & Conformité',prefix:'⚖️'},
  {value:'wealthtech',label:'Wealthtech & Investissement',prefix:'📈'},
  {value:'healthtech',label:'Healthtech & MedTech',prefix:'🏥'},
  {value:'biotech',label:'Biotech & Sciences de la vie',prefix:'🧬'},
  {value:'mentalhealth',label:'Santé mentale & Bien-être',prefix:'🧠'},
  {value:'edtech',label:'Edtech & Formation',prefix:'🎓'},
  {value:'elearning',label:'E-learning & Upskilling',prefix:'📚'},
  {value:'hrtech',label:'HRtech & Recrutement',prefix:'👥'},
  {value:'futureofwork',label:'Future of Work',prefix:'🏠'},
  {value:'legaltech',label:'Legaltech',prefix:'📋'},
  {value:'proptech',label:'Proptech & Immobilier',prefix:'🏢'},
  {value:'contech',label:'Contech & Construction',prefix:'🏗️'},
  {value:'climatetech',label:'Climatetech & GreenTech',prefix:'🌱'},
  {value:'agritech',label:'Agritech & Foodtech',prefix:'🌾'},
  {value:'energy',label:'Énergie & Utilities',prefix:'⚡'},
  {value:'mobility',label:'Mobilité & Transport',prefix:'🚗'},
  {value:'logistics',label:'Logistique & Supply Chain',prefix:'📦'},
  {value:'ecommerce',label:'E-commerce & Retail',prefix:'🛍️'},
  {value:'marketplace',label:'Marketplace & Plateforme',prefix:'🔗'},
  {value:'saas',label:'SaaS B2B',prefix:'☁️'},
  {value:'devtools',label:'Outils développeurs & DevTools',prefix:'🛠️'},
  {value:'cybersecurity',label:'Cybersécurité',prefix:'🔐'},
  {value:'ai',label:'IA & Machine Learning',prefix:'🤖'},
  {value:'data',label:'Data & Analytics',prefix:'📊'},
  {value:'blockchain',label:'Blockchain & Web3',prefix:'⛓️'},
  {value:'iot',label:'IoT & Hardware',prefix:'📡'},
  {value:'ar-vr',label:'AR / VR & Spatial computing',prefix:'🥽'},
  {value:'gaming',label:'Gaming & Esports',prefix:'🎮'},
  {value:'mediatech',label:'Mediatech & Streaming',prefix:'🎬'},
  {value:'adtech',label:'Adtech & Marketing',prefix:'📣'},
  {value:'socialnetwork',label:'Réseau social & Communauté',prefix:'💬'},
  {value:'creator',label:'Creator Economy',prefix:'✨'},
  {value:'traveltech',label:'Traveltech & Hospitality',prefix:'✈️'},
  {value:'sportstech',label:'Sportstech & Fitness',prefix:'⚽'},
  {value:'fashiontech',label:'Fashiontech & Luxe',prefix:'👗'},
  {value:'beautytech',label:'Beautytech & Cosmétique',prefix:'💄'},
  {value:'govtech',label:'Govtech & Civic tech',prefix:'🏛️'},
  {value:'socialimpact',label:'Impact social & ESS',prefix:'🤝'},
  {value:'spacetech',label:'Spacetech & Défense',prefix:'🚀'},
  {value:'robotics',label:'Robotique & Automatisation',prefix:'🦾'},
  {value:'deeptech',label:'Deeptech & Quantique',prefix:'⚗️'},
  {value:'manufacturing',label:'Industrie & Fabrication',prefix:'🏭'},
  {value:'pettech',label:'Pettech & Animaux',prefix:'🐾'},
  {value:'other',label:'Autre',prefix:'🌐'},
];

function createCombobox(wrap, hiddenId, opts, placeholder){
  let options=opts.slice();
  let selected=null;
  let activeIdx=-1;
  let isOpen=false;

  const hidden=document.getElementById(hiddenId);

  const trigger=document.createElement('button');
  trigger.type='button';
  trigger.className='ff-cs-trigger';
  trigger.setAttribute('aria-haspopup','listbox');
  trigger.setAttribute('aria-expanded','false');
  trigger.innerHTML=`<span class="ff-cs-val ff-cs-ph">${placeholder}</span><svg class="ff-cs-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>`;

  const search=document.createElement('input');
  search.type='text';
  search.className='ff-cs-search';
  search.placeholder='Rechercher…';
  search.setAttribute('aria-autocomplete','list');
  search.autocomplete='off';
  search.hidden=true;

  const list=document.createElement('ul');
  list.className='ff-cs-list';
  list.setAttribute('role','listbox');
  list.hidden=true;

  wrap.appendChild(trigger);
  wrap.appendChild(search);
  document.body.appendChild(list);

  const valEl=trigger.querySelector('.ff-cs-val');
  const icoEl=trigger.querySelector('.ff-cs-ico');

  function getFiltered(){
    const q=search.value.toLowerCase().trim();
    if(!q) return options;
    return options.filter(o=>o.label.toLowerCase().includes(q)||(o.value&&o.value.toLowerCase().includes(q)));
  }

  function renderList(){
    const filtered=getFiltered();
    list.innerHTML='';
    if(!filtered.length){
      list.innerHTML='<li class="ff-cs-empty">Aucun résultat</li>';
      return;
    }
    filtered.forEach((opt,i)=>{
      const li=document.createElement('li');
      li.className='ff-cs-opt'+(selected&&selected.value===opt.value?' ff-cs-opt--sel':'')+(i===activeIdx?' ff-cs-opt--act':'');
      li.setAttribute('role','option');
      li.setAttribute('aria-selected',String(!!(selected&&selected.value===opt.value)));
      li.dataset.idx=String(i);
      li.innerHTML=`${opt.prefix?`<span class="ff-cs-pfx">${opt.prefix}</span>`:''}${opt.label}${selected&&selected.value===opt.value?'<span class="ff-cs-chk">✓</span>':''}`;
      li.addEventListener('mousedown',e=>{e.preventDefault();pick(opt);});
      li.addEventListener('mouseenter',()=>{activeIdx=i;highlight();});
      list.appendChild(li);
    });
  }

  function highlight(){
    list.querySelectorAll('.ff-cs-opt').forEach((el,i)=>{
      el.classList.toggle('ff-cs-opt--act',i===activeIdx);
    });
    if(activeIdx>=0){
      const act=list.children[activeIdx];
      act&&act.scrollIntoView({block:'nearest'});
    }
  }

  function positionList(){
    const r=wrap.getBoundingClientRect();
    list.style.cssText=`position:fixed;top:${r.bottom+4}px;left:${r.left}px;width:${r.width}px;z-index:99999`;
  }

  function openDrop(){
    if(isOpen) return;
    isOpen=true;
    trigger.setAttribute('aria-expanded','true');
    icoEl.style.transform='rotate(180deg)';
    valEl.hidden=true;
    icoEl.style.display='none';
    search.hidden=false;
    search.value='';
    search.focus();
    positionList();
    renderList();
    list.hidden=false;
  }

  function closeDrop(){
    if(!isOpen) return;
    isOpen=false;
    trigger.setAttribute('aria-expanded','false');
    icoEl.style.transform='';
    icoEl.style.display='';
    search.hidden=true;
    list.hidden=true;
    valEl.hidden=false;
    activeIdx=-1;
  }

  function pick(opt){
    selected=opt;
    if(hidden) hidden.value=opt.value;
    valEl.textContent=(opt.prefix?opt.prefix+' ':'')+opt.label;
    valEl.classList.remove('ff-cs-ph');
    closeDrop();
    hidden&&hidden.dispatchEvent(new Event('change',{bubbles:true}));
  }

  trigger.addEventListener('click',()=>{ isOpen?closeDrop():openDrop(); });
  search.addEventListener('input',()=>{ activeIdx=-1; renderList(); });

  search.addEventListener('keydown',e=>{
    const filtered=getFiltered();
    if(e.key==='ArrowDown'){ e.preventDefault(); activeIdx=Math.min(activeIdx+1,filtered.length-1); highlight(); }
    else if(e.key==='ArrowUp'){ e.preventDefault(); activeIdx=Math.max(activeIdx-1,0); highlight(); }
    else if(e.key==='Enter'){ e.preventDefault(); if(activeIdx>=0&&filtered[activeIdx]) pick(filtered[activeIdx]); }
    else if(e.key==='Escape'||e.key==='Tab'){ closeDrop(); }
  });

  document.addEventListener('mousedown',e=>{
    if(!wrap.contains(e.target)&&!list.contains(e.target)) closeDrop();
  });

  window.addEventListener('scroll',()=>{ if(isOpen) positionList(); },true);
  window.addEventListener('resize',()=>{ if(isOpen) positionList(); });

  return {
    setValue(val){
      const found=options.find(o=>o.value===val||o.label===val);
      if(found){selected=found;valEl.textContent=(found.prefix?found.prefix+' ':'')+found.label;valEl.classList.remove('ff-cs-ph');}
    },
    setOptions(opts){
      options=opts;
      if(isOpen) renderList();
    },
    reset(){
      selected=null;
      if(hidden) hidden.value='';
      valEl.textContent=placeholder;
      valEl.classList.add('ff-cs-ph');
      closeDrop();
    },
  };
}

const csSector=document.getElementById('ff-cs-11');
let cbSector=null;
if(csSector) cbSector=createCombobox(csSector,'ff-11',SECTORS,"Rechercher un secteur…");

window.__ffRestoreCS=function(step,val){
  if(step===11&&cbSector){ cbSector.setValue(val); }
};

})();
