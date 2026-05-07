import { Store } from './state/store.js'
import { ApiClient } from './services/apiClient.js'
import { BLOCK_TYPES, createBlock } from './models/block.js'
import { Portfolio } from './models/portfolio.js'

const createInitialBlocks = () => [
  createBlock('main'),
  createBlock('about'),
  createBlock('skills'),
  createBlock('projects'),
  createBlock('contact'),
]

const createInitialState = () => {
  const blocks = createInitialBlocks()
  return {
    blocks,
    selectedId: blocks[0]?.id ?? null,
    preview: false,
    exportOpen: false,
    integrations: {
      github: {
        username: 'torvalds',
        status: 'idle',
        profile: null,
        repos: [],
        error: null,
      },
    },
  }
}

const escapeHtml = (value) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')

const parseLines = (value) =>
  value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

const parseProjects = (value) =>
  parseLines(value).map((line) => {
    const [name, description = '', link = ''] = line
      .split('|')
      .map((part) => part.trim())
    return {
      name: name || 'Проект',
      description,
      link,
    }
  })

const stringifyProjects = (items) =>
  items
    .map(
      (item) =>
        `${item.name ?? ''} | ${item.description ?? ''} | ${item.link ?? ''}`
    )
    .join('\n')

export class App {
  constructor(root) {
    this.root = root
    this.apiClient = new ApiClient()
    this.store = new Store(createInitialState())
    this.handleClick = this.handleClick.bind(this)
    this.handleInput = this.handleInput.bind(this)
    this.handleChange = this.handleChange.bind(this)

    this.root.addEventListener('click', this.handleClick)
    this.root.addEventListener('input', this.handleInput)
    this.root.addEventListener('change', this.handleChange)

    this.store.subscribe(() => this.render())
    this.render()
    this.refreshGitHub()
  }

  getState() {
    return this.store.getState()
  }

  updateState(updater) {
    this.store.update(updater)
  }

  handleClick(event) {
    const action = event.target.closest('[data-action]')?.dataset.action
    if (!action) return

    switch (action) {
      case 'add-block':
        this.addBlock(event.target.closest('[data-type]')?.dataset.type)
        break
      case 'select-block':
        this.selectBlock(event.target.closest('[data-id]')?.dataset.id)
        break
      case 'remove-block':
        this.removeBlock(event.target.closest('[data-id]')?.dataset.id)
        break
      case 'move-up':
        this.moveBlock(event.target.closest('[data-id]')?.dataset.id, -1)
        break
      case 'move-down':
        this.moveBlock(event.target.closest('[data-id]')?.dataset.id, 1)
        break
      case 'toggle-preview':
        this.updateState((state) => ({ ...state, preview: !state.preview }))
        break
      case 'export-html':
        this.updateState((state) => ({ ...state, exportOpen: true }))
        break
      case 'download-html':
        this.downloadHtml()
        break
      case 'close-export':
        this.updateState((state) => ({ ...state, exportOpen: false }))
        break
      case 'reset':
        this.store.setState(createInitialState())
        this.refreshGitHub()
        break
      case 'refresh-github':
        this.refreshGitHub()
        break
      case 'apply-github':
        this.applyGitHubData()
        break
      default:
        break
    }
  }

  handleInput(event) {
    const target = event.target
    const field = target.dataset.field
    if (!field) return

    if (target.dataset.context === 'github') {
      this.updateState((state) => ({
        ...state,
        integrations: {
          ...state.integrations,
          github: {
            ...state.integrations.github,
            username: target.value.trim(),
          },
        },
      }))
      return
    }

    if (target.dataset.context === 'block') {
      this.updateSelectedBlock(field, target.value, target.dataset.parser)
    }
  }

  handleChange(event) {
    const target = event.target
    if (target.dataset.context === 'block' && target.dataset.field) {
      this.updateSelectedBlock(target.dataset.field, target.value, target.dataset.parser)
    }
  }

  addBlock(type) {
    if (!type) return
    const block = createBlock(type)
    this.updateState((state) => {
      const portfolio = new Portfolio(state.blocks)
      const nextPortfolio = portfolio.addBlock(block)
      return { ...state, blocks: nextPortfolio.blocks, selectedId: block.id }
    })
  }

  selectBlock(id) {
    if (!id) return
    this.updateState((state) => ({ ...state, selectedId: id }))
  }

  removeBlock(id) {
    if (!id) return
    this.updateState((state) => {
      const portfolio = new Portfolio(state.blocks)
      const nextPortfolio = portfolio.removeBlock(id)
      const nextSelected =
        state.selectedId === id ? nextPortfolio.blocks[0]?.id ?? null : state.selectedId
      return { ...state, blocks: nextPortfolio.blocks, selectedId: nextSelected }
    })
  }

  moveBlock(id, direction) {
    if (!id) return
    this.updateState((state) => {
      const portfolio = new Portfolio(state.blocks)
      const nextPortfolio = portfolio.moveBlock(id, direction)
      return { ...state, blocks: nextPortfolio.blocks }
    })
  }

  updateSelectedBlock(field, value, parser) {
    const { selectedId } = this.getState()
    if (!selectedId) return

    const updateValue = () => {
      if (parser === 'lines') return parseLines(value)
      if (parser === 'projects') return parseProjects(value)
      return value
    }

    this.updateState((state) => {
      const portfolio = new Portfolio(state.blocks)
      const nextPortfolio = portfolio.updateBlock(selectedId, (data) => ({
        ...data,
        [field]: updateValue(),
      }))
      return { ...state, blocks: nextPortfolio.blocks }
    })
  }

  async refreshGitHub() {
    const state = this.getState()
    const username = state.integrations.github.username
    if (!username) return

    this.updateState((prev) => ({
      ...prev,
      integrations: {
        ...prev.integrations,
        github: {
          ...prev.integrations.github,
          status: 'loading',
          error: null,
        },
      },
    }))

    const currentUsername = username

    try {
      const [profile, repos] = await Promise.all([
        this.apiClient.fetchProfile(currentUsername),
        this.apiClient.fetchRepos(currentUsername),
      ])

      this.updateState((prev) => {
        if (prev.integrations.github.username !== currentUsername) {
          return prev
        }

        return {
          ...prev,
          integrations: {
            ...prev.integrations,
            github: {
              ...prev.integrations.github,
              status: 'ready',
              profile,
              repos,
              error: null,
            },
          },
        }
      })
    } catch (error) {
      this.updateState((prev) => ({
        ...prev,
        integrations: {
          ...prev.integrations,
          github: {
            ...prev.integrations.github,
            status: 'error',
            error: error.message,
          },
        },
      }))
    }
  }

  applyGitHubData() {
    const state = this.getState()
    const github = state.integrations.github
    if (!github.profile) return

    const mainBlock = state.blocks.find((block) => block.type === 'main')
    const projectsBlock = state.blocks.find((block) => block.type === 'projects')

    this.updateState((prev) => {
      let portfolio = new Portfolio(prev.blocks)

      if (mainBlock) {
        portfolio = portfolio.updateBlock(mainBlock.id, (data) => ({
          ...data,
          heading: github.profile.name || data.heading,
          summary: github.profile.bio || data.summary,
          location: github.profile.location || data.location,
        }))
      }

      if (projectsBlock && github.repos.length) {
        portfolio = portfolio.updateBlock(projectsBlock.id, (data) => ({
          ...data,
          items: github.repos.map((repo) => ({
            name: repo.name,
            description: repo.description || 'Описание отсутствует',
            link: repo.html_url,
          })),
        }))
      }

      return { ...prev, blocks: portfolio.blocks }
    })
  }

  buildExportHtml(state) {
    const blocksHtml = state.blocks.map((block) => this.renderBlockContent(block)).join('')

    return `<!doctype html>
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
      ${blocksHtml}
    </main>
  </body>
</html>`
  }

  downloadHtml() {
    const html = this.buildExportHtml(this.getState())
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'portfolio.html'
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  render() {
    const state = this.getState()
    const activeElement = document.activeElement
    const focusMeta = activeElement && activeElement.dataset?.field
      ? {
          field: activeElement.dataset.field,
          context: activeElement.dataset.context,
          selectionStart: activeElement.selectionStart,
          selectionEnd: activeElement.selectionEnd,
        }
      : null

    this.root.innerHTML = this.template(state)

    if (focusMeta) {
      const selector = `[data-context="${focusMeta.context}"][data-field="${focusMeta.field}"]`
      const nextActive = this.root.querySelector(selector)
      if (nextActive) {
        nextActive.focus()
        if (
          typeof focusMeta.selectionStart === 'number' &&
          typeof focusMeta.selectionEnd === 'number'
        ) {
          nextActive.setSelectionRange(
            focusMeta.selectionStart,
            focusMeta.selectionEnd
          )
        }
      }
    }
  }

  template(state) {
    const exportHtml = escapeHtml(this.buildExportHtml(state))
    return `
<div class="builder">
  <header class="builder__header">
    <div class="brand">
      <div class="brand__title">Веб-конструктор портфолио разработчика</div>
      <div class="brand__subtitle">Визуальный редактор адаптивных портфолио</div>
    </div>
    <div class="builder__header-actions">
      <button class="button button--ghost" data-action="toggle-preview">
        ${state.preview ? 'Режим редактирования' : 'Режим предпросмотра'}
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
          ${BLOCK_TYPES.map(
            (block) => `
            <button class="block-card" data-action="add-block" data-type="${block.type}">
              <div class="block-card__title">${block.title}</div>
              <div class="block-card__description">${block.description}</div>
            </button>
          `
          ).join('')}
        </div>
      </div>
      <div class="panel panel--stack">
        <h2 class="panel__title">Блоки</h2>
        <div class="timeline">
          ${state.blocks
            .map(
              (block, index) => `
              <div class="timeline__item ${
                block.id === state.selectedId ? 'timeline__item--active' : ''
              }" data-action="select-block" data-id="${block.id}">
                <div class="timeline__index">${index + 1}</div>
                <div class="timeline__name">${block.type}</div>
              </div>
            `
            )
            .join('')}
        </div>
      </div>
    </aside>

    <main class="builder__canvas">
      <div class="canvas ${state.preview ? 'canvas--preview' : ''}">
        <div class="canvas__header">
          <div>
            <div class="canvas__title">Портфолио</div>
          </div>
          <button class="button button--ghost" data-action="reset">Сбросить</button>
        </div>
        <div class="canvas__viewport">
          ${state.blocks.map((block) => this.renderBlock(block, state)).join('')}
        </div>
      </div>
    </main>

    <aside class="builder__panel">
      <div class="panel panel--stack">
        <h2 class="panel__title">Свойства блока</h2>
        ${this.renderProperties(state)}
      </div>
      <div class="panel panel--stack">
        <h2 class="panel__title">Интеграция GitHub API</h2>
        ${this.renderGitHubPanel(state)}
      </div>
    </aside>
  </div>

  <footer class="builder__footer">
    <div class="builder__footer-note">Поставте 5🫩</div>
  </footer>
</div>

<div class="modal ${state.exportOpen ? 'modal--open' : ''}" role="dialog" aria-modal="true" aria-hidden="${
      state.exportOpen ? 'false' : 'true'
    }">
  <div class="modal__overlay" data-action="close-export"></div>
  <div class="modal__content">
    <div class="modal__header">
      <h3 class="modal__title">Экспорт HTML</h3>
      <div class="button-row">
        <button class="button button--primary" data-action="download-html">Скачать HTML</button>
        <button class="button button--ghost" data-action="close-export">Закрыть</button>
      </div>
    </div>
    <pre class="code-block">${exportHtml}</pre>
  </div>
</div>
    `
  }

  renderBlock(block, state) {
    const isActive = block.id === state.selectedId
    return `
<section class="portfolio-block portfolio-block--${block.type} ${
      isActive ? 'portfolio-block--active' : ''
    }" data-action="select-block" data-id="${block.id}">
  <div class="portfolio-block__toolbar">
    <button class="button button--icon" data-action="move-up" data-id="${block.id}" title="Вверх">↑</button>
    <button class="button button--icon" data-action="move-down" data-id="${block.id}" title="Вниз">↓</button>
    <button class="button button--danger" data-action="remove-block" data-id="${block.id}">Удалить</button>
  </div>
  <div class="portfolio-block__content">
    ${this.renderBlockContent(block)}
  </div>
</section>
    `
  }

  renderBlockContent(block) {
    const data = block.data
    switch (block.type) {
      case 'main':
        return `
<div class="main">
  <div class="main__meta">${data.location}</div>
  <h1 class="main__title">${data.heading}</h1>
  <div class="main__role">${data.role}</div>
  <p class="main__summary">${data.summary}</p>
</div>
        `
      case 'about':
        return `
<div class="about">
  <h2 class="section-title">${data.heading}</h2>
  <p class="section-text">${data.body}</p>
</div>
        `
      case 'skills':
        return `
<div class="skills">
  <h2 class="section-title">${data.heading}</h2>
  <div class="skills__list">
    ${data.items
      .map((item) => `<span class="tag">${item}</span>`)
      .join('')}
  </div>
</div>
        `
      case 'projects':
        return `
<div class="projects">
  <h2 class="section-title">${data.heading}</h2>
  <div class="projects__grid">
    ${data.items
      .map(
        (item) => `
        <article class="project-card">
          <div class="project-card__title">${item.name}</div>
          <div class="project-card__description">${item.description}</div>
          <a class="project-card__link" href="${item.link}" target="_blank" rel="noreferrer">Открыть</a>
        </article>
      `
      )
      .join('')}
  </div>
</div>
        `
      case 'contact':
        return `
<div class="contact">
  <h2 class="section-title">${data.heading}</h2>
  <div class="contact__grid">
    <div class="contact__item">Email: <a href="mailto:${data.email}">${data.email}</a></div>
    <div class="contact__item">Telegram: <a href="https://t.me/${data.telegram.replace('@', '')}" target="_blank" rel="noreferrer">${data.telegram}</a></div>
    <div class="contact__item">GitHub: <a href="${data.github}" target="_blank" rel="noreferrer">${data.github}</a></div>
  </div>
</div>
        `
      default:
        return ''
    }
  }

  renderProperties(state) {
    const block = state.blocks.find((item) => item.id === state.selectedId)
    if (!block) {
      return '<p class="panel__hint">Выберите блок слева, чтобы увидеть настройки.</p>'
    }

    const data = block.data

    switch (block.type) {
      case 'main':
        return `
<div class="fields">
  ${this.renderField('Имя и фамилия', 'heading', data.heading)}
  ${this.renderField('Роль', 'role', data.role)}
  ${this.renderArea('Краткое описание', 'summary', data.summary)}
  ${this.renderField('Локация', 'location', data.location)}
</div>
        `
      case 'about':
        return `
<div class="fields">
  ${this.renderField('Заголовок', 'heading', data.heading)}
  ${this.renderArea('Текст', 'body', data.body)}
</div>
        `
      case 'skills':
        return `
<div class="fields">
  ${this.renderField('Заголовок', 'heading', data.heading)}
  ${this.renderArea('Навыки (по одному в строке)', 'items', data.items.join('\n'), 'lines')}
</div>
        `
      case 'projects':
        return `
<div class="fields">
  ${this.renderField('Заголовок', 'heading', data.heading)}
  ${this.renderArea(
    '(название | описание | ссылка)',
    'items',
    stringifyProjects(data.items),
    'projects'
  )}
</div>
        `
      case 'contact':
        return `
<div class="fields">
  ${this.renderField('Заголовок', 'heading', data.heading)}
  ${this.renderField('Email', 'email', data.email)}
  ${this.renderField('Telegram', 'telegram', data.telegram)}
  ${this.renderField('GitHub', 'github', data.github)}
</div>
        `
      default:
        return ''
    }
  }

  renderGitHubPanel(state) {
    const github = state.integrations.github
    const statusLabel =
      github.status === 'loading'
        ? 'Загрузка...'
        : github.status === 'error'
          ? 'Ошибка'
          : 'Готово'

    return `
<div class="fields">
  ${this.renderField(
    'GitHub username',
    'username',
    github.username,
    null,
    'github'
  )}
  <div class="status">
    <div class="status__item">Статус: <strong>${statusLabel}</strong></div>
  </div>
  ${
    github.error
      ? `<div class="alert">${github.error}</div>`
      : ''
  }
  <div class="button-row">
    <button class="button button--ghost" data-action="refresh-github">Обновить данные</button>
    <button class="button button--primary" data-action="apply-github">Заполнить блоки</button>
  </div>
  ${
    github.profile
      ? `
    <div class="profile">
      <img class="profile__avatar" src="${github.profile.avatar_url}" alt="Аватар" />
      <div>
        <div class="profile__name">${github.profile.name || github.profile.login}</div>
        <div class="profile__bio">${github.profile.bio || 'Биография отсутствует'}</div>
      </div>
    </div>
  `
      : ''
  }
</div>
    `
  }

  renderField(label, field, value, parser = null, context = 'block') {
    return `
<label class="field">
  <span class="field__label">${label}</span>
  <input
    class="field__input"
    type="text"
    data-context="${context}"
    data-field="${field}"
    ${parser ? `data-parser="${parser}"` : ''}
    value="${value ?? ''}"
  />
</label>
    `
  }

  renderArea(label, field, value, parser = null, context = 'block') {
    return `
<label class="field">
  <span class="field__label">${label}</span>
  <textarea
    class="field__textarea"
    rows="5"
    data-context="${context}"
    data-field="${field}"
    ${parser ? `data-parser="${parser}"` : ''}
  >${value ?? ''}</textarea>
</label>
    `
  }
}

