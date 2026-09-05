import {ideas,templates} from './product-data.js';
import {compilePerfectPrompt} from './prompt-engine/compiler.js';

const $=s=>document.querySelector(s);
const screen=$('#screen'),menu=$('#menuSheet'),backdrop=$('#sheetBackdrop'),menuBtn=$('#menuButton'),toast=$('#toast');
const state={screen:'home',idea:'',goal:'build',priorities:[],target:'auto',step:1,result:'',meta:null,theme:localStorage.getItem('pp-theme')||'system'};

const goalOptions=[['build','Build something','App, website, feature, tool or workflow'],['improve','Improve or fix','Upgrade an existing product, prompt or behavior'],['research','Research or compare','Find, evaluate and recommend'],['create','Create content','Writing, image, video or another creative output']];
const priorityOptions=[['premium','Premium polish'],['simple','Keep it simple'],['mobile','Mobile-first'],['privacy','Privacy-first'],['fast','Fast & efficient'],['exact','Strict requirements'],['versatile','Versatile / reusable'],['commercial','Commercial quality']];
const targetOptions=[['auto','Let Perfect Prompt choose','Detect the task and use the strongest Prompt Master route'],['agent','Coding / agent tool','Codex, Claude Code, Cursor, Arena, Lovable and similar'],['chat','General AI chat','ChatGPT, Claude, Gemini, Grok and similar'],['visual','Image / video AI','Image, video and creative generation tools']];

const esc=(v='')=>String(v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function showToast(text){toast.textContent=text;toast.classList.add('show');clearTimeout(showToast.t);showToast.t=setTimeout(()=>toast.classList.remove('show'),1900)}
function setTheme(theme){state.theme=theme;localStorage.setItem('pp-theme',theme);document.documentElement.dataset.theme=theme;syncThemeButtons()}
function syncThemeButtons(){document.querySelectorAll('[data-quick-theme],[data-theme-choice]').forEach(b=>b.classList.toggle('on',(b.dataset.quickTheme||b.dataset.themeChoice)===state.theme))}
function openMenu(){menu.classList.add('open');menu.setAttribute('aria-hidden','false');backdrop.hidden=false;menuBtn.setAttribute('aria-expanded','true');syncThemeButtons()}
function closeMenu(){menu.classList.remove('open');menu.setAttribute('aria-hidden','true');backdrop.hidden=true;menuBtn.setAttribute('aria-expanded','false')}
function go(name){state.screen=name;closeMenu();render();window.scrollTo({top:0,behavior:'smooth'})}
function loadStarter(text){state.idea=text;state.step=1;state.priorities=[];state.target='auto';state.meta=null;go('home');setTimeout(()=>$('#ideaInput')?.focus(),30);showToast('Loaded into generator')}
function startNew(){state.idea='';state.goal='build';state.priorities=[];state.target='auto';state.step=1;state.result='';state.meta=null;go('home')}

setTheme(state.theme);
menuBtn.addEventListener('click',openMenu);$('#menuClose').addEventListener('click',closeMenu);backdrop.addEventListener('click',closeMenu);document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu()});
document.querySelectorAll('[data-menu]').forEach(b=>b.addEventListener('click',()=>go(b.dataset.menu)));
document.querySelectorAll('[data-quick-theme]').forEach(b=>b.addEventListener('click',()=>{setTheme(b.dataset.quickTheme);showToast(`${b.textContent} theme`)}));

function home(){return `<section class="home">
  <div class="hero-lockup"><span class="hero-spark">✦</span><p class="eyebrow">Focused prompt generation</p></div>
  <h1 class="hero-title">Turn a rough idea into a prompt that gets it right.</h1>
  <p class="hero-copy">Describe what you want. Perfect Prompt locks the intent, routes it through Prompt Master, removes ambiguity, and gives you one clean instruction ready to use.</p>
  <div class="idea-card">
    <div class="input-top"><span>What do you want to create?</span><span class="local-badge">Private · local</span></div>
    <textarea id="ideaInput" maxlength="4000" placeholder="Example: Build a simple personal timesheet for one worker with punch in, punch out, history, and a monthly calendar.">${esc(state.idea)}</textarea>
    <div class="idea-footer"><span class="privacy-mini">Prompt Master runs locally in this browser</span><button class="primary generate-button" id="generateStart"><span>Generate Prompt</span><b>→</b></button></div>
  </div>
  <div class="validation" id="validation"></div>
  <div class="try-row"><div><strong>Try an idea</strong><span>Start fast, then make it yours.</span></div><button class="more-link" data-open-ideas>More ideas →</button></div>
  <div class="starter-grid">
    <button class="quick-card" data-quick="Build a simple personal timesheet for one worker with punch in, punch out, live shift time, history, and monthly calendar."><span>◷</span><strong>Smart Timesheet</strong><small>Personal work hours</small></button>
    <button class="quick-card" data-quick="Build a calm personal budgeting app that makes setting and following a budget painless."><span>◇</span><strong>Budget Flow</strong><small>Simple money control</small></button>
    <button class="quick-card" data-quick="Improve an existing mobile app so the main workflow is clearer, faster, and more reliable without adding unrelated features."><span>↗</span><strong>Improve an App</strong><small>Polish what exists</small></button>
  </div>
</section>`}

function progress(n){return `<div class="progress-wrap"><span>${n}/3</span><div class="progress">${[1,2,3].map(i=>`<i class="${i<=n?'on':''}"></i>`).join('')}</div></div>`}
function wizard(){let body='';if(state.step===1){body=`<div class="choice-list">${goalOptions.map(([v,t,d])=>`<button class="choice ${state.goal===v?'selected':''}" data-goal="${v}"><span><strong>${t}</strong><small>${d}</small></span><span class="radio"></span></button>`).join('')}</div>`}else if(state.step===2){body=`<div class="tag-grid">${priorityOptions.map(([v,t])=>`<button class="tag ${state.priorities.includes(v)?'on':''}" data-priority="${v}">${t}</button>`).join('')}</div><div class="helper-card"><span>Tip</span><p>Choose only what truly matters. Prompt Master will infer non-critical details and add the right scope, verification, and output controls.</p></div>`}else{body=`<div class="choice-list">${targetOptions.map(([v,t,d])=>`<button class="choice ${state.target===v?'selected':''}" data-target="${v}"><span><strong>${t}</strong><small>${d}</small></span><span class="radio"></span></button>`).join('')}</div>`}const titles=[['What are we doing?','Choose the job. The core intent stays locked.'],['What matters most?','Add the constraints that should shape the result.'],['Where is the prompt going?','Pick a destination or let Prompt Master route it.']][state.step-1];return `<section class="flow"><div class="flow-head"><div><p class="eyebrow">Smart wizard</p><h1>${titles[0]}</h1><p>${titles[1]}</p></div>${progress(state.step)}</div>${body}<div class="wizard-actions"><button class="secondary" data-action="${state.step===1?'home':'back'}">Back</button><button class="primary" id="wizardNext">${state.step===3?'Generate Prompt':'Continue'} <b>→</b></button></div></section>`}

function generating(){return `<section class="generating"><div class="generation-card"><div class="orb"><span>✦</span></div><p class="eyebrow">Prompt Master Engine</p><h1>Compiling your prompt</h1><p>Extracting intent, choosing the right route, checking failure patterns, and locking success criteria.</p><div class="pulse-lines"><i></i><i></i><i></i></div></div></section>`}
function result(){const target=state.meta?.targetLabel||'Optimized route';const template=state.meta?.template||'prompt-master';return `<section class="result"><div class="result-celebrate"><span>✓</span><div><p class="eyebrow">Ready to use</p><h1>Your prompt is compiled.</h1><p>Prompt Master selected the structure automatically. Copy it as-is or make one focused refinement.</p></div></div><div class="prompt-card"><div class="prompt-toolbar"><span>${esc(target)} · ${esc(template)}</span><span>Private · local</span></div><div class="prompt-surface" id="promptText">${esc(state.result)}</div></div><div class="result-actions"><button class="primary" id="copyPrompt">Copy Prompt <b>↗</b></button><button class="secondary" id="refinePrompt">Refine</button><button class="secondary" data-action="new">Start New</button></div></section>`}

function ideaLibrary(){return `<section class="library"><div class="library-top"><button class="back-link" data-action="home">← Home</button><p class="eyebrow">Prompt Ideas</p><h1>Useful ideas for real life.</h1><p class="library-sub">Browse practical app concepts. Tap one to load it into the generator and customize it.</p></div>${Object.entries(ideas).map(([cat,list])=>`<section class="library-section"><div class="section-heading"><h2>${cat}</h2><span>${list.length} ideas</span></div><div class="card-grid">${list.map(item=>`<button class="starter-card" data-starter="${esc(item.prompt)}"><span class="card-arrow">↗</span><strong>${esc(item.title)}</strong><p>${esc(item.prompt)}</p></button>`).join('')}</div></section>`).join('')}</section>`}
function templateLibrary(){return `<section class="library"><div class="library-top"><button class="back-link" data-action="home">← Home</button><p class="eyebrow">Prompt Templates</p><h1>Start with a proven structure.</h1><p class="library-sub">Templates are reusable prompt recipes. Prompt Master will still route and strengthen them before output.</p></div><div class="template-grid">${templates.map(t=>`<button class="template-card" data-starter="${esc(t.prompt)}"><span class="template-category">${esc(t.category)}</span><strong>${esc(t.title)}</strong><p>${esc(t.prompt)}</p><b>Use template →</b></button>`).join('')}</div></section>`}
function settings(){return `<section class="library"><div class="library-top"><button class="back-link" data-action="home">← Home</button><p class="eyebrow">Settings</p><h1>Keep it comfortable.</h1><p class="library-sub">Only useful preferences. No account or cloud history required.</p></div><div class="settings-panel"><div><h2>Appearance</h2><p>Choose a theme or follow your device.</p></div><div class="theme-options">${['system','light','dark'].map(t=>`<button class="theme-option ${state.theme===t?'on':''}" data-theme-choice="${t}">${t[0].toUpperCase()+t.slice(1)}</button>`).join('')}</div></div><div class="setting-block"><h3>Prompt privacy</h3><p>Your idea, wizard answers, intent analysis, diagnostics, and generated prompt stay in the browser. No external AI call is required for compilation.</p></div></section>`}
function about(){return `<section class="library"><div class="library-top"><button class="back-link" data-action="home">← Home</button><p class="eyebrow">About</p><h1>Perfect Prompt</h1><p class="library-sub">A deterministic prompt compiler powered by the Prompt Master rules and extended with Idea Lock for reliable product-building prompts.</p></div><div class="setting-block"><h3>Prompt Master engine</h3><p>The live compiler now performs intent extraction, target routing, template selection, failure-pattern diagnostics, tool-specific controls, and verification rules locally in the browser.</p></div><div class="setting-block"><h3>Attribution</h3><p>Prompt-engineering concepts are adapted from the MIT-licensed Prompt Master project by Nidhin Joseph Nelson. License and upstream attribution remain in this repository.</p></div></section>`}

function compile(){return compilePerfectPrompt({idea:state.idea,goal:state.goal,priorities:state.priorities,target:state.target})}

function bind(){
  $('#ideaInput')?.addEventListener('input',e=>state.idea=e.target.value);
  $('#generateStart')?.addEventListener('click',()=>{state.idea=$('#ideaInput').value.trim();if(!state.idea){$('#validation').textContent='Describe what you want first.';$('#ideaInput').focus();return}state.step=1;go('wizard')});
  $('[data-open-ideas]')?.addEventListener('click',()=>go('ideas'));
  document.querySelectorAll('[data-quick]').forEach(b=>b.addEventListener('click',()=>loadStarter(b.dataset.quick)));
  document.querySelectorAll('[data-starter]').forEach(b=>b.addEventListener('click',()=>loadStarter(b.dataset.starter)));
  document.querySelectorAll('[data-goal]').forEach(b=>b.addEventListener('click',()=>{state.goal=b.dataset.goal;render()}));
  document.querySelectorAll('[data-priority]').forEach(b=>b.addEventListener('click',()=>{const v=b.dataset.priority;state.priorities=state.priorities.includes(v)?state.priorities.filter(x=>x!==v):[...state.priorities,v];render()}));
  document.querySelectorAll('[data-target]').forEach(b=>b.addEventListener('click',()=>{state.target=b.dataset.target;render()}));
  $('#wizardNext')?.addEventListener('click',()=>{if(state.step<3){state.step++;render();window.scrollTo({top:0,behavior:'smooth'})}else{state.meta=compile();state.result=state.meta.prompt;state.screen='generating';render();setTimeout(()=>{state.screen='result';render()},700)}});
  document.querySelectorAll('[data-action]').forEach(b=>b.addEventListener('click',()=>{const a=b.dataset.action;if(a==='home')go('home');if(a==='back'){state.step=Math.max(1,state.step-1);render()}if(a==='new')startNew()}));
  $('#copyPrompt')?.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(state.result);$('#copyPrompt').innerHTML='Copied ✓';showToast('Prompt copied')}catch{showToast('Select the prompt and copy manually')}});
  $('#refinePrompt')?.addEventListener('click',()=>{state.idea=`Adapt and improve this existing prompt while preserving its core intent and constraints:\n\n${state.result}`;state.goal='improve';state.target='auto';state.step=1;go('wizard')});
  document.querySelectorAll('[data-theme-choice]').forEach(b=>b.addEventListener('click',()=>{setTheme(b.dataset.themeChoice);render();showToast(`${b.textContent} theme`)}));
}

function render(){if(state.screen==='home')screen.innerHTML=home();else if(state.screen==='wizard')screen.innerHTML=wizard();else if(state.screen==='generating')screen.innerHTML=generating();else if(state.screen==='result')screen.innerHTML=result();else if(state.screen==='ideas')screen.innerHTML=ideaLibrary();else if(state.screen==='templates')screen.innerHTML=templateLibrary();else if(state.screen==='settings')screen.innerHTML=settings();else screen.innerHTML=about();bind();syncThemeButtons()}
render();
