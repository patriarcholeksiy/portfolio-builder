const createId = () => crypto.randomUUID()

export const BLOCK_TYPES = [
  {
    type: 'main',
    title: 'Основная информация',
    description: 'Главный экран с именем и позицией.',
  },
  {
    type: 'about',
    title: 'Обо мне',
    description: 'Краткая биография.',
  },
  {
    type: 'skills',
    title: 'Навыки',
    description: 'Список моих технологий.',
  },
  {
    type: 'projects',
    title: 'Проекты',
    description: 'Подборка выполненных работ.',
  },
  {
    type: 'contact',
    title: 'Контакты',
    description: 'Каналы связи и соцсети.',
  },
]

const DEFAULT_DATA = {
  main: {
    heading: 'Имя Фамилия',
    role: 'Кумир Developer',
    summary:
      'Создаю высокопроизводительные приложения на кумире и паскале',
    location: 'Москва, Россия',
  },
  about: {
    heading: 'Обо мне',
    body:
      '3+ года в разработке клиентских приложений. Люблю проектировать enterprise проекты на кумир',
  },
  skills: {
    heading: 'Навыки',
    items: ['Кумир', 'Python', 'JavaScript', 'Git', 'Linux'],
  },
  projects: {
    heading: 'Проекты',
    items: [
      {
        name: 'Проект однодневка',
        description: 'Пет-проект на кумире',
        link: 'https://github.com/torvalds/linux',
      },
      {
        name: 'Случайные цифровые звуки',
        description: 'Создание цифровых звуков на языке паскаль',
        link: 'https://github.com/torvalds/AudioNoise',
      },
    ],
  },
  contact: {
    heading: 'Контакты',
    email: 'name@example.com',
    telegram: '@username',
    github: 'https://github.com/username',
  },
}

export class Block {
  constructor({ id = createId(), type, data }) {
    this.id = id
    this.type = type
    this.data = data
  }
}

export const createBlock = (type) =>
  new Block({
    type,
    data: structuredClone(DEFAULT_DATA[type]),
  })

export const serializeBlock = (block) => ({
  id: block.id,
  type: block.type,
  data: block.data,
})
