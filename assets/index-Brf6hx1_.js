(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=class{constructor(e){this.state=e,this.listeners=new Set}getState(){return this.state}setState(e){this.state=e,this.listeners.forEach(e=>e(this.state))}update(e){this.setState(e(this.state))}subscribe(e){return this.listeners.add(e),()=>this.listeners.delete(e)}},t=class{constructor(e=`https://api.github.com`){this.baseUrl=e}async request(e){let t=await fetch(`${this.baseUrl}${e}`,{headers:{Accept:`application/vnd.github+json`}});if(!t.ok){let e=`GitHub API: ${t.status}`;throw Error(e)}return t.json()}fetchProfile(e){return this.request(`/users/${e}`)}fetchRepos(e){return this.request(`/users/${e}/repos?per_page=5&sort=updated`)}},n=()=>crypto.randomUUID(),r=[{type:`main`,title:`Основная информация`,description:`Главный экран с именем и позицией.`},{type:`about`,title:`Обо мне`,description:`Краткая биография.`},{type:`skills`,title:`Навыки`,description:`Список моих технологий.`},{type:`projects`,title:`Проекты`,description:`Подборка выполненных работ.`},{type:`contact`,title:`Контакты`,description:`Каналы связи и соцсети.`}],i={main:{heading:`Имя Фамилия`,role:`Кумир Developer`,summary:`Создаю высокопроизводительные приложения на кумире и паскале`,location:`Москва, Россия`},about:{heading:`Обо мне`,body:`3+ года в разработке клиентских приложений. Люблю проектировать enterprise проекты на кумир`},skills:{heading:`Навыки`,items:[`Кумир`,`Python`,`JavaScript`,`Git`,`Linux`]},projects:{heading:`Проекты`,items:[{name:`Проект однодневка`,description:`Пет-проект на кумире`,link:`https://github.com/torvalds/linux`},{name:`Случайные цифровые звуки`,description:`Создание цифровых звуков на языке паскаль`,link:`https://github.com/torvalds/AudioNoise`}]},contact:{heading:`Контакты`,email:`name@example.com`,telegram:`@username`,github:`https://github.com/username`}},a=class{constructor({id:e=n(),type:t,data:r}){this.id=e,this.type=t,this.data=r}},o=e=>new a({type:e,data:structuredClone(i[e])}),s=class e{constructor(e=[]){this.blocks=e}addBlock(t){return new e([...this.blocks,t])}removeBlock(t){return new e(this.blocks.filter(e=>e.id!==t))}updateBlock(t,n){return new e(this.blocks.map(e=>e.id===t?{...e,data:n(e.data)}:e))}moveBlock(t,n){let r=this.blocks.findIndex(e=>e.id===t);if(r===-1)return new e(this.blocks);let i=r+n;if(i<0||i>=this.blocks.length)return new e(this.blocks);let a=[...this.blocks],[o]=a.splice(r,1);return a.splice(i,0,o),new e(a)}},c=()=>[o(`main`),o(`about`),o(`skills`),o(`projects`),o(`contact`)],l=()=>{let e=c();return{blocks:e,selectedId:e[0]?.id??null,preview:!1,integrations:{github:{username:`torvalds`,status:`idle`,profile:null,repos:[],error:null}}}},u=e=>e.split(`
`).map(e=>e.trim()).filter(Boolean),d=e=>u(e).map(e=>{let[t,n=``,r=``]=e.split(`|`).map(e=>e.trim());return{name:t||`Проект`,description:n,link:r}}),f=e=>e.map(e=>`${e.name??``} | ${e.description??``} | ${e.link??``}`).join(`
`);new class{constructor(n){this.root=n,this.apiClient=new t,this.store=new e(l()),this.handleClick=this.handleClick.bind(this),this.handleInput=this.handleInput.bind(this),this.handleChange=this.handleChange.bind(this),this.root.addEventListener(`click`,this.handleClick),this.root.addEventListener(`input`,this.handleInput),this.root.addEventListener(`change`,this.handleChange),this.store.subscribe(()=>this.render()),this.render(),this.refreshGitHub()}getState(){return this.store.getState()}updateState(e){this.store.update(e)}handleClick(e){let t=e.target.closest(`[data-action]`)?.dataset.action;if(t)switch(t){case`add-block`:this.addBlock(e.target.closest(`[data-type]`)?.dataset.type);break;case`select-block`:this.selectBlock(e.target.closest(`[data-id]`)?.dataset.id);break;case`remove-block`:this.removeBlock(e.target.closest(`[data-id]`)?.dataset.id);break;case`move-up`:this.moveBlock(e.target.closest(`[data-id]`)?.dataset.id,-1);break;case`move-down`:this.moveBlock(e.target.closest(`[data-id]`)?.dataset.id,1);break;case`toggle-preview`:this.updateState(e=>({...e,preview:!e.preview}));break;case`export-html`:this.downloadHtml();break;case`reset`:this.store.setState(l()),this.refreshGitHub();break;case`refresh-github`:this.refreshGitHub();break;case`apply-github`:this.applyGitHubData();break;default:break}}handleInput(e){let t=e.target,n=t.dataset.field;if(n){if(t.dataset.context===`github`){this.updateState(e=>({...e,integrations:{...e.integrations,github:{...e.integrations.github,username:t.value.trim()}}}));return}t.dataset.context===`block`&&this.updateSelectedBlock(n,t.value,t.dataset.parser)}}handleChange(e){let t=e.target;t.dataset.context===`block`&&t.dataset.field&&this.updateSelectedBlock(t.dataset.field,t.value,t.dataset.parser)}addBlock(e){if(!e)return;let t=o(e);this.updateState(e=>{let n=new s(e.blocks).addBlock(t);return{...e,blocks:n.blocks,selectedId:t.id}})}selectBlock(e){e&&this.updateState(t=>({...t,selectedId:e}))}removeBlock(e){e&&this.updateState(t=>{let n=new s(t.blocks).removeBlock(e),r=t.selectedId===e?n.blocks[0]?.id??null:t.selectedId;return{...t,blocks:n.blocks,selectedId:r}})}moveBlock(e,t){e&&this.updateState(n=>{let r=new s(n.blocks).moveBlock(e,t);return{...n,blocks:r.blocks}})}updateSelectedBlock(e,t,n){let{selectedId:r}=this.getState();if(!r)return;let i=()=>n===`lines`?u(t):n===`projects`?d(t):t;this.updateState(t=>{let n=new s(t.blocks).updateBlock(r,t=>({...t,[e]:i()}));return{...t,blocks:n.blocks}})}async refreshGitHub(){let e=this.getState().integrations.github.username;if(!e)return;this.updateState(e=>({...e,integrations:{...e.integrations,github:{...e.integrations.github,status:`loading`,error:null}}}));let t=e;try{let[e,n]=await Promise.all([this.apiClient.fetchProfile(t),this.apiClient.fetchRepos(t)]);this.updateState(r=>r.integrations.github.username===t?{...r,integrations:{...r.integrations,github:{...r.integrations.github,status:`ready`,profile:e,repos:n,error:null}}}:r)}catch(e){this.updateState(t=>({...t,integrations:{...t.integrations,github:{...t.integrations.github,status:`error`,error:e.message}}}))}}applyGitHubData(){let e=this.getState(),t=e.integrations.github;if(!t.profile)return;let n=e.blocks.find(e=>e.type===`main`),r=e.blocks.find(e=>e.type===`projects`);this.updateState(e=>{let i=new s(e.blocks);return n&&(i=i.updateBlock(n.id,e=>({...e,heading:t.profile.name||e.heading,summary:t.profile.bio||e.summary,location:t.profile.location||e.location}))),r&&t.repos.length&&(i=i.updateBlock(r.id,e=>({...e,items:t.repos.map(e=>({name:e.name,description:e.description||`Описание отсутствует`,link:e.html_url}))}))),{...e,blocks:i.blocks}})}buildExportHtml(e){return`<!doctype html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Портфолио разработчика</title>
    <style>
      :root {
        --bg: #f7f7fb;
        --surface: #ffffff;
        --border: #e1e4ee;
        --text: #1d1e26;
        --text-muted: #6b7280;
        --accent: #6d28d9;
        --radius: 16px;
        font: 16px/1.5 'Segoe UI', system-ui, -apple-system, sans-serif;
        color: var(--text);
        background: var(--bg);
      }
      * { box-sizing: border-box; }
      body { margin: 0; padding: 32px; }
      main { max-width: 960px; margin: 0 auto; display: grid; gap: 20px; }
      h1, h2 { margin: 0; }
      .main__meta { color: var(--text-muted); font-size: 14px; }
      .main__title { font-size: 36px; }
      .main__role { font-weight: 600; font-size: 18px; }
      .main__summary { color: var(--text-muted); max-width: 520px; }
      .section-title { font-size: 22px; }
      .section-text { color: var(--text-muted); }
      .skills__list { display: flex; flex-wrap: wrap; gap: 8px; }
      .tag { padding: 6px 10px; border-radius: 999px; background: var(--surface); border: 1px solid var(--border); font-size: 13px; }
      .projects__grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; }
      .project-card { border: 1px solid var(--border); border-radius: 14px; padding: 12px; background: var(--surface); display: grid; gap: 6px; }
      .project-card__title { font-weight: 600; }
      .project-card__description { color: var(--text-muted); font-size: 13px; }
      .project-card__link { color: var(--accent); font-size: 13px; text-decoration: none; }
      .contact__grid { display: grid; gap: 8px; color: var(--text-muted); }
      section { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 16px; }
      @media (max-width: 640px) {
        body { padding: 20px; }
        .main__title { font-size: 28px; }
      }
    </style>
  </head>
  <body>
    <main>
      ${e.blocks.map(e=>this.renderBlockContent(e)).join(``)}
    </main>
  </body>
</html>`}downloadHtml(){let e=this.buildExportHtml(this.getState()),t=new Blob([e],{type:`text/html;charset=utf-8`}),n=URL.createObjectURL(t),r=document.createElement(`a`);r.href=n,r.download=`portfolio.html`,document.body.appendChild(r),r.click(),r.remove(),URL.revokeObjectURL(n)}render(){let e=this.getState(),t=document.activeElement,n=t&&t.dataset?.field?{field:t.dataset.field,context:t.dataset.context,selectionStart:t.selectionStart,selectionEnd:t.selectionEnd}:null;if(this.root.innerHTML=this.template(e),n){let e=`[data-context="${n.context}"][data-field="${n.field}"]`,t=this.root.querySelector(e);t&&(t.focus(),typeof n.selectionStart==`number`&&typeof n.selectionEnd==`number`&&t.setSelectionRange(n.selectionStart,n.selectionEnd))}}template(e){return`
<div class="builder">
  <header class="builder__header">
    <div class="brand">
      <div class="brand__title">Веб-конструктор портфолио разработчика</div>
      <div class="brand__subtitle">Визуальный редактор адаптивных портфолио</div>
    </div>
    <div class="builder__header-actions">
      <button class="button button--ghost" data-action="toggle-preview">
        ${e.preview?`Режим редактирования`:`Режим предпросмотра`}
      </button>
      <button class="button button--primary" data-action="export-html">Экспорт HTML</button>
    </div>
  </header>

  <div class="builder__body">
    <aside class="builder__sidebar">
      <div class="panel panel--stack">
        <h2 class="panel__title">Библиотека блоков</h2>
        <p class="panel__hint">Добавить визуальные блоки и отредактировать их справа.</p>
        <div class="block-library">
          ${r.map(e=>`
            <button class="block-card" data-action="add-block" data-type="${e.type}">
              <div class="block-card__title">${e.title}</div>
              <div class="block-card__description">${e.description}</div>
            </button>
          `).join(``)}
        </div>
      </div>
      <div class="panel panel--stack">
        <h2 class="panel__title">Блоки</h2>
        <div class="timeline">
          ${e.blocks.map((t,n)=>`
              <div class="timeline__item ${t.id===e.selectedId?`timeline__item--active`:``}" data-action="select-block" data-id="${t.id}">
                <div class="timeline__index">${n+1}</div>
                <div class="timeline__name">${t.type}</div>
              </div>
            `).join(``)}
        </div>
      </div>
    </aside>

    <main class="builder__canvas">
      <div class="canvas ${e.preview?`canvas--preview`:``}">
        <div class="canvas__header">
          <div>
            <div class="canvas__title">Портфолио</div>
          </div>
          <button class="button button--ghost" data-action="reset">Сбросить</button>
        </div>
        <div class="canvas__viewport">
          ${e.blocks.map(t=>this.renderBlock(t,e)).join(``)}
        </div>
      </div>
    </main>

    <aside class="builder__panel">
      <div class="panel panel--stack">
        <h2 class="panel__title">Свойства блока</h2>
        ${this.renderProperties(e)}
      </div>
      <div class="panel panel--stack">
        <h2 class="panel__title">Интеграция GitHub API</h2>
        ${this.renderGitHubPanel(e)}
      </div>
    </aside>
  </div>

  <footer class="builder__footer">
    <div class="builder__footer-note">Поставте 5🫩</div>
  </footer>
</div>
    `}renderBlock(e,t){let n=e.id===t.selectedId;return`
<section class="portfolio-block portfolio-block--${e.type} ${n?`portfolio-block--active`:``}" data-action="select-block" data-id="${e.id}">
  <div class="portfolio-block__toolbar">
    <button class="button button--icon" data-action="move-up" data-id="${e.id}" title="Вверх">↑</button>
    <button class="button button--icon" data-action="move-down" data-id="${e.id}" title="Вниз">↓</button>
    <button class="button button--danger" data-action="remove-block" data-id="${e.id}">Удалить</button>
  </div>
  <div class="portfolio-block__content">
    ${this.renderBlockContent(e)}
  </div>
</section>
    `}renderBlockContent(e){let t=e.data;switch(e.type){case`main`:return`
<div class="main">
  <div class="main__meta">${t.location}</div>
  <h1 class="main__title">${t.heading}</h1>
  <div class="main__role">${t.role}</div>
  <p class="main__summary">${t.summary}</p>
</div>
        `;case`about`:return`
<div class="about">
  <h2 class="section-title">${t.heading}</h2>
  <p class="section-text">${t.body}</p>
</div>
        `;case`skills`:return`
<div class="skills">
  <h2 class="section-title">${t.heading}</h2>
  <div class="skills__list">
    ${t.items.map(e=>`<span class="tag">${e}</span>`).join(``)}
  </div>
</div>
        `;case`projects`:return`
<div class="projects">
  <h2 class="section-title">${t.heading}</h2>
  <div class="projects__grid">
    ${t.items.map(e=>`
        <article class="project-card">
          <div class="project-card__title">${e.name}</div>
          <div class="project-card__description">${e.description}</div>
          <a class="project-card__link" href="${e.link}" target="_blank" rel="noreferrer">Открыть</a>
        </article>
      `).join(``)}
  </div>
</div>
        `;case`contact`:return`
<div class="contact">
  <h2 class="section-title">${t.heading}</h2>
  <div class="contact__grid">
    <div class="contact__item">Email: <a href="mailto:${t.email}">${t.email}</a></div>
    <div class="contact__item">Telegram: <a href="https://t.me/${t.telegram.replace(`@`,``)}" target="_blank" rel="noreferrer">${t.telegram}</a></div>
    <div class="contact__item">GitHub: <a href="${t.github}" target="_blank" rel="noreferrer">${t.github}</a></div>
  </div>
</div>
        `;default:return``}}renderProperties(e){let t=e.blocks.find(t=>t.id===e.selectedId);if(!t)return`<p class="panel__hint">Выберите блок слева, чтобы увидеть настройки.</p>`;let n=t.data;switch(t.type){case`main`:return`
<div class="fields">
  ${this.renderField(`Имя и фамилия`,`heading`,n.heading)}
  ${this.renderField(`Роль`,`role`,n.role)}
  ${this.renderArea(`Краткое описание`,`summary`,n.summary)}
  ${this.renderField(`Локация`,`location`,n.location)}
</div>
        `;case`about`:return`
<div class="fields">
  ${this.renderField(`Заголовок`,`heading`,n.heading)}
  ${this.renderArea(`Текст`,`body`,n.body)}
</div>
        `;case`skills`:return`
<div class="fields">
  ${this.renderField(`Заголовок`,`heading`,n.heading)}
  ${this.renderArea(`Навыки (по одному в строке)`,`items`,n.items.join(`
`),`lines`)}
</div>
        `;case`projects`:return`
<div class="fields">
  ${this.renderField(`Заголовок`,`heading`,n.heading)}
  ${this.renderArea(`(название | описание | ссылка)`,`items`,f(n.items),`projects`)}
</div>
        `;case`contact`:return`
<div class="fields">
  ${this.renderField(`Заголовок`,`heading`,n.heading)}
  ${this.renderField(`Email`,`email`,n.email)}
  ${this.renderField(`Telegram`,`telegram`,n.telegram)}
  ${this.renderField(`GitHub`,`github`,n.github)}
</div>
        `;default:return``}}renderGitHubPanel(e){let t=e.integrations.github,n=t.status===`loading`?`Загрузка...`:t.status===`error`?`Ошибка`:`Готово`;return`
<div class="fields">
  ${this.renderField(`GitHub username`,`username`,t.username,null,`github`)}
  <div class="status">
    <div class="status__item">Статус: <strong>${n}</strong></div>
  </div>
  ${t.error?`<div class="alert">${t.error}</div>`:``}
  <div class="button-row">
    <button class="button button--ghost" data-action="refresh-github">Обновить данные</button>
    <button class="button button--primary" data-action="apply-github">Заполнить блоки</button>
  </div>
  ${t.profile?`
    <div class="profile">
      <img class="profile__avatar" src="${t.profile.avatar_url}" alt="Аватар" />
      <div>
        <div class="profile__name">${t.profile.name||t.profile.login}</div>
        <div class="profile__bio">${t.profile.bio||`Биография отсутствует`}</div>
      </div>
    </div>
  `:``}
</div>
    `}renderField(e,t,n,r=null,i=`block`){return`
<label class="field">
  <span class="field__label">${e}</span>
  <input
    class="field__input"
    type="text"
    data-context="${i}"
    data-field="${t}"
    ${r?`data-parser="${r}"`:``}
    value="${n??``}"
  />
</label>
    `}renderArea(e,t,n,r=null,i=`block`){return`
<label class="field">
  <span class="field__label">${e}</span>
  <textarea
    class="field__textarea"
    rows="5"
    data-context="${i}"
    data-field="${t}"
    ${r?`data-parser="${r}"`:``}
  >${n??``}</textarea>
</label>
    `}}(document.querySelector(`#app`));