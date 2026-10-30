'use strict';
const FIELDS=[['ignore','Ignore'],['date','Date'],['sport','Sport'],['level','Level of Play'],['away','Away Team'],['home','Home Team'],['awayLevel','Away Level'],['homeLevel','Home Level'],['gender','Gender'],['league','League (if applicable)'],['venue','Venue'],['position','Position'],['partner1','Partner 1'],['partner2','Partner 2'],['partner3','Partner 3'],['time','Game Time'],['status','Status'],['notes','Notes']];
const LEVELS=['','Middle School','High School','JUCO','NCAA D-I','NCAA D-II','NCAA D-III','Post-Grad','Semi-Pro','Professional','Other'];
const ALIASES={gamedate:'date',date:'date',visitor:'away',visitingteam:'away',away:'away',awayteam:'away',home:'home',hometeam:'home',site:'venue',location:'venue',venue:'venue',addressofarena:'venue',arena:'venue',assignment:'position',position:'position',role:'position',sport:'sport',level:'level',levelofplay:'level',division:'level',awaylevel:'awayLevel',homelevel:'homeLevel',gender:'gender',league:'league',notes:'notes',status:'status',gametime:'time',time:'time',timeest:'time',timeedt:'time',partner1:'partner1',partner2:'partner2',partner3:'partner3'};
const state={headers:[],rows:[],mappings:[],games:[]};
const $=id=>document.getElementById(id);
const option=(value,label)=>{const el=document.createElement('option');el.value=value;el.textContent=label;return el};
function makeLevelSelect(value,onChange){const s=document.createElement('select');LEVELS.forEach(l=>s.append(option(l,l||'Unassigned')));s.value=value||'';s.addEventListener('change',()=>onChange(s.value));return s}
$('defaultLevel').replaceWith((()=>{const s=makeLevelSelect('',()=>{});s.id='defaultLevel';return s})());
function stage(name){['upload','map','levels','review'].forEach((n,i)=>{ $(n).classList.toggle('hidden',n!==name);$('steps').children[i].classList.toggle('active',n===name)});window.scrollTo(0,0)}
document.querySelectorAll('[data-back]').forEach(b=>b.addEventListener('click',()=>stage(b.dataset.back)));
// RFC 4180-style CSV parsing, including quoted commas and embedded newlines.
function parseCSV(input){input=input.replace(/^\uFEFF/,'');let rows=[],row=[],field='',quoted=false;for(let i=0;i<input.length;i++){const c=input[i];if(c==='"'){if(quoted&&input[i+1]==='"'){field+='"';i++}else quoted=!quoted}else if(c===','&&!quoted){row.push(field);field=''}else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&input[i+1]==='\n')i++;row.push(field);if(row.some(v=>v.trim()))rows.push(row);row=[];field=''}else field+=c}if(quoted)throw Error('The CSV contains an unclosed quoted field.');row.push(field);if(row.some(v=>v.trim()))rows.push(row);return rows}
// Ignore unused trailing/blank columns instead of rejecting an otherwise valid CSV.
// Also recognize common level values in columns labeled "League".
function looksLikeLevel(value){
  const v=String(value||'').trim().toLowerCase().replace(/[.\s_-]/g,'');
  return /^(juco|njcaa|naia|ncaa(?:di|dii|diii|d1|d2|d3|divisioni|divisionii|divisioniii)|highschool|middleschool|postgrad|semipro|professional|pro|other)$/.test(v);
}
function normalizeLevel(value){
  const v=String(value||'').trim();
  const key=v.toLowerCase().replace(/[.\s_-]/g,'');
  const known={juco:'JUCO',njcaa:'JUCO',ncaadi:'NCAA D-I',ncaad1:'NCAA D-I',ncaadivisioni:'NCAA D-I',ncaadii:'NCAA D-II',ncaad2:'NCAA D-II',ncaadivisionii:'NCAA D-II',ncaadiii:'NCAA D-III',ncaad3:'NCAA D-III',ncaadivisioniii:'NCAA D-III',highschool:'High School',middleschool:'Middle School',postgrad:'Post-Grad',semipro:'Semi-Pro',professional:'Professional',pro:'Professional',other:'Other'};
  return known[key]||v;
}
$('file').addEventListener('change',async e=>{
  const f=e.target.files?.[0];
  $('toMap').disabled=true;
  if(!f)return;
  if(!/\.csv$/i.test(f.name)){
    $('fileStatus').textContent='Please choose a .csv file. Excel support is not connected yet.';
    return;
  }
  if(f.size>5*1024*1024){
    $('fileStatus').textContent='Please choose a CSV smaller than 5 MB.';
    return;
  }
  try{
    const rows=parseCSV(await f.text());
    if(rows.length<2)throw Error('No game rows found.');
    const rawHeaders=rows[0].map(x=>x.trim());
    const usedIndices=rawHeaders.map((h,i)=>h?i:-1).filter(i=>i>=0);
    if(!usedIndices.length)throw Error('No column headers found in the first row.');
    // An unnamed column containing actual data needs manual attention.
    const unnamedWithData=rawHeaders.some((h,i)=>!h&&rows.slice(1).some(r=>String(r[i]||'').trim()));
    if(unnamedWithData)throw Error('A column contains data but has no header. Please name that column in the CSV.');
    state.headers=usedIndices.map(i=>rawHeaders[i]);
    state.rows=rows.slice(1).map(r=>usedIndices.map(i=>r[i]||''));
    state.mappings=state.headers.map((h,i)=>{
      const alias=ALIASES[h.toLowerCase().replace(/[^a-z0-9]/g,'')]||'ignore';
      if(alias==='league'){
        const values=state.rows.map(r=>r[i]).filter(v=>String(v||'').trim());
        if(values.length&&values.every(looksLikeLevel))return 'level';
      }
      return alias;
    });
    $('fileStatus').textContent=`${f.name} · ${state.rows.length} rows detected · ${rawHeaders.length-usedIndices.length} empty columns ignored`;
    $('toMap').disabled=false;
  }catch(err){$('fileStatus').textContent=err.message}
});
$('toMap').addEventListener('click',()=>{const root=$('mapping');root.replaceChildren();state.headers.forEach((h,i)=>{const r=document.createElement('div');r.className='mapping-row';const desc=document.createElement('div');const strong=document.createElement('strong');strong.textContent=h;const ex=document.createElement('small');ex.textContent='Example: '+(state.rows[0]?.[i]||'—');desc.append(strong,ex);const sel=document.createElement('select');FIELDS.forEach(([v,l])=>sel.append(option(v,l)));sel.value=state.mappings[i];sel.addEventListener('change',()=>state.mappings[i]=sel.value);r.append(desc,sel);root.append(r)});stage('map')});
$('toLevels').addEventListener('click',()=>{const mapped=state.mappings.filter(x=>x!=='ignore');if(!mapped.includes('date'))return alert('Please map a Date column.');if(new Set(mapped).size!==mapped.length)return alert('Each field can only be mapped once.');state.games=state.rows.map((row,i)=>{const g={_row:i+2};state.mappings.forEach((field,j)=>{if(field!=='ignore')g[field]=(row[j]||'').trim()});g.level=normalizeLevel(g.level||'');g.awayLevel=normalizeLevel(g.awayLevel||g.level||'');g.homeLevel=normalizeLevel(g.homeLevel||g.level||'');return g});const mappedSport=state.games.find(g=>g.sport)?.sport;if(mappedSport&&[...$('sport').options].some(o=>o.value===mappedSport))$('sport').value=mappedSport;stage('levels')});
$('applyDefault').addEventListener('click',()=>{const l=$('defaultLevel').value;if(!l)return alert('Select a default level first.');state.games.forEach(g=>{g.awayLevel=l;g.homeLevel=l});alert(`Applied ${l} to both teams in ${state.games.length} games. You can change individual matchups in Review.`)});
$('toReview').addEventListener('click',()=>{const sport=$('sport').value;if(!sport&&!state.games.every(g=>g.sport))return alert('Choose a sport before continuing.');state.games.forEach(g=>{g.sport=g.sport||sport;g.awayLevel=g.awayLevel||$('defaultLevel').value;g.homeLevel=g.homeLevel||$('defaultLevel').value});const root=$('previewRows');root.replaceChildren();state.games.forEach((g,i)=>{const tr=document.createElement('tr');const addText=t=>{const td=document.createElement('td');td.textContent=t||'—';tr.append(td)};addText(String(i+1));addText(g.date);addText(g.away);const a=document.createElement('td');a.append(makeLevelSelect(g.awayLevel,v=>{g.awayLevel=v;updateSummary()}));tr.append(a);addText(g.home);const h=document.createElement('td');h.append(makeLevelSelect(g.homeLevel,v=>{g.homeLevel=v;updateSummary()}));tr.append(h);addText(g.venue);addText(g.position);root.append(tr)});updateSummary();stage('review')});
function updateSummary(){const missing=state.games.filter(g=>!g.awayLevel||!g.homeLevel).length;const cross=state.games.filter(g=>g.awayLevel&&g.homeLevel&&g.awayLevel!==g.homeLevel).length;$('summary').textContent=`${state.games.length} games · ${cross} cross-level matchups · ${missing} games missing a team level`}
