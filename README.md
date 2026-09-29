# Лабораторная работа №3 — Sass: рефакторинг стилей сайта-визитки

Сайт-визитка из лабораторных №1–2 (вёрстка + jQuery). В этой работе стили
переписаны на **Sass (SCSS)**: разбиты на модули, значения вынесены в
переменные и карты, добавлены функции и миксины, классы переименованы по
**БЭМ**, реализована **светлая/тёмная тема**. Сборка — через **Node.js / npm**.

**Автор:** Сергей
**Группа:** ФИТ-241

## Запуск проекта с нуля

Нужен [Node.js](https://nodejs.org/) (LTS) — вместе с ним ставится npm.

```bash
npm install        # ставит Sass (папка node_modules/)
npm run build      # однократная сборка сжатого CSS → dist/css/main.css
```

При разработке вместо `build` запустите слежение за файлами:

```bash
npm run sass:dev   # пересобирает CSS при каждом сохранении scss/*
```

Затем откройте сайт через локальный сервер (Live Server в VS Code или
`npm run serve`, он запускает `npx serve .`). Для разработки нужны **два
процесса одновременно**: `sass:dev` и сервер.

> `dist/` и `node_modules/` не хранятся в репозитории (они в `.gitignore`).
> Без `npm run build` стилей на странице не будет. При деплое (Netlify,
> Vercel, GitHub Actions) в качестве команды сборки указывайте
> `npm install && npm run build`.

## Деплой
Ссылка на сайт: _добавьте после деплоя_

## Структура проекта

```
├─ scss/
│  ├─ utils/        переменные, карты, функции, миксины (CSS не генерируют)
│  │  ├─ _variables.scss   шрифты, шкалы, $breakpoints, палитры $theme-light / $theme-dark
│  │  ├─ _functions.scss   rem(), space(), fs(), z()
│  │  ├─ _mixins.scss      respond-to(), theme-vars(), flex-center(), circle(), focus-ring()
│  │  └─ _index.scss       @forward всех файлов папки
│  ├─ base/         reset и типографика
│  ├─ layout/       container, header, section, hero, about, portfolio, contacts, footer
│  ├─ components/   button, logo, nav, nav-toggle, theme-toggle, carousel,
│  │                skill-card, card, form, modal, back-to-top
│  ├─ themes/       _light.scss (:root) и _dark.scss ([data-theme='dark'])
│  └─ main.scss     точка входа: @use 'base'; 'themes'; 'layout'; 'components'
├─ js/
│  ├─ theme-init.js ранняя установка темы (в <head>, без «вспышки»)
│  └─ script.js     jQuery-функциональность (лаб. №2) + переключатель темы
├─ data/portfolio.json
├─ images/
├─ index.html
├─ package.json, package-lock.json
└─ dist/            результат сборки (в .gitignore)
```

## Что реализовано

**Модули.** Везде только `@use` / `@forward`, `@import` нет. В каждой папке
есть `_index.scss`, который собирает содержимое через `@forward`; partial-файлы
подключают утилиты одной строкой `@use '../utils' as *;`.
Встроенные возможности берутся из модулей `sass:math` (`math.div`),
`sass:color` (`color.change`) и `sass:map`.

**Переменные, карты, функции.**
- Все цвета, шрифты, размеры, отступы, радиусы, слои и брейкпоинты лежат в
  `utils/_variables.scss`.
- Брейкпоинты — карта `$breakpoints` (`mobile: 480px`, `tablet: 768px`,
  `desktop: 1024px`). Стили пишутся **mobile-first**: базовые правила без
  медиа-запросов, расширения — через `respond-to()`.
- Свои функции: `rem($px)` (px → rem через `math.div`), `space($key)`,
  `fs($key)`, `z($layer)`. При неверном ключе — `@error`.

**Миксины.**
- `respond-to($breakpoint)` — `min-width` по имени брейкпоинта, стили через
  `@content`; неизвестное имя → `@error` при компиляции.
- `theme-vars($palette)` — превращает карту палитры в CSS-переменные (`@each`).
- `flex-center`, `circle($size)`, `focus-ring` — вспомогательные.

**БЭМ.** Все классы вида `блок`, `блок__элемент`, `блок--модификатор`; стили не
привязаны к тегам. В скомпилированном CSS селекторы не длиннее 2 уровней.
Для JS используются `id` и классы с префиксом `js-` (`js-nav-link`,
`js-carousel-dot`, `js-form-field`, `js-theme-toggle` …), поэтому
стили можно менять, не ломая скрипты.

**Темы.** Палитры описаны картами `$theme-light` и `$theme-dark` с
одинаковыми ключами. Из них через `@each` (миксин `theme-vars`) генерируются
CSS-переменные `--color-*`: светлая — для `:root`, тёмная — для
`[data-theme='dark']`. Компоненты берут цвета **только** из `var(--color-*)`.
Кнопка в шапке (jQuery) переключает `data-theme` на `<html>` и сохраняет выбор
в `localStorage`; при первом визите тема выбирается по `prefers-color-scheme`.
Атрибут ставится ещё в `<head>` (`js/theme-init.js`), поэтому страница не мигает.

**Компонент с состояниями — кнопка `.button`.** Модификаторы
`button--primary`, `button--light`, `button--outline`; состояния `:hover`,
`:focus-visible`, `:active`, `:disabled`. Корректно выглядит в обеих темах.

## Что осталось от лабораторной №2 (jQuery)

| Функциональность | Метод jQuery |
|---|---|
| Выпадающее (мобильное) меню | `.slideToggle()` |
| Модальное окно «Оставить заявку» | `.fadeIn()` / `.fadeOut()`, клик по оверлею, Esc |
| Галерея из JSON, плавное появление карточек | `$.getJSON()`, `.delay().fadeIn()` |
| Валидация форм, симуляция отправки | regex, `$.ajax()` |
| Карусель навыков (кнопки, точки, автопрокрутка) | `setInterval`, `.css('transform')` |
| Подсветка пункта меню при скролле, кнопка «Вверх» | `.scroll()`, `.offset()`, `.animate()` |
| **Новое:** переключатель темы | `.attr()`, `localStorage` |

## Чек-лист
- [x] npm-проект, `sass` — dev-зависимость
- [x] Скрипты `sass:dev` и `build`
- [x] `node_modules/` и `dist/` в `.gitignore`, `package-lock.json` в репозитории
- [x] Папки `utils`, `base`, `layout`, `components`, `themes` с `_index.scss`
- [x] Только `@use` / `@forward`
- [x] Переменные, карта брейкпоинтов, своя функция
- [x] `respond-to` с `@content` и `@error`, ещё несколько миксинов
- [x] БЭМ, селекторы не длиннее 2 уровней
- [x] Функциональность лабораторной №2 работает
- [x] Темы: карты → CSS-переменные через `@each`, переключатель, `localStorage`
- [x] Компонент с состояниями и модификаторами
- [x] README
