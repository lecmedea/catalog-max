# Каталог каналов MAX

Библиотека каналов мессенджера MAX. Витрина в духе TGStat: поиск, категории, карточки, статистика и отдельный каталог инструментов. Оформление — бумажный набросок: жёлтый лист, карандашная обводка и кнопки со смещённой тенью. Текст набран Source Sans 3, тем же семейством, что Source Sans Pro на huggingface.co.

Канал-источник: https://max.ru/channel_ii_katalog

## Страницы

- `/` — поиск, категории, свежие карточки
- `/catalog` и `/catalog/[slug]` — сетка, фильтры, карточка
- `/platforms` — инструменты, только чтение для гостей и пользователей
- `/login` и `/register` ведут на `/auth/login` и `/auth/register`
- `/auth/reset-password`, `/auth/update-password`
- `/dashboard`, `/dashboard/channels`, `/dashboard/favorites`, `/dashboard/profile`
- `/admin` — модерация, пользователи, инструменты, категории

## База

Миграция `supabase/migrations/20261115094405_catalog_schema.sql`:

- `profiles` создаётся триггером при регистрации. Роль всегда `user`, пока администратор не сменит её в базе.
- `categories`, `channels`, `channel_stats`, `platforms`, `favorites`
- код владения лежит в `channel_verifications` и не виден в публичной карточке
- читать одобренный каталог может любой гость
- править канал может его владелец, статус и метрики он сменить не может
- `/platforms` и категории меняет только `role = admin`

## Запуск

Подробная инструкция для человека без навыков программирования открывается на самом сайте: `/instructions`.

Коротко:

1. Создайте проект Supabase.
2. Скопируйте `.env.example` в `.env.local` и вставьте URL и publishable key.
3. В SQL Editor выполните миграцию. Команда `supabase db push` нужна только тем, кто ставит программу Supabase CLI.
4. В Auth → URL Configuration добавьте `http://localhost:3000/auth/callback` и `http://localhost:3000/auth/confirm`.
5. Назначьте себя администратором:

```sql
update public.profiles set role = 'admin' where email = 'you@example.com';
```

6. `npm run dev`

Пароль — от 8 до 72 символов. В Supabase → Authentication → Providers → Email поставьте Minimum password length = 8, чтобы лимит совпал с формой. Никнейм уникален: латиница, цифры и `_`, 3–24 знака.

Первый администратор появляется только этим SQL. Форма регистрации роль не выдаёт.

Защита `/dashboard` и `/admin` живёт в `src/proxy.ts`. В Next.js 16 файл `middleware.ts` больше не вызывается: его переименовали в `proxy.ts`, а функцию — в `proxy`.

Встроенная почта Supabase отправляет примерно два письма в час. Для регистрации и сброса пароля на живом сайте подключите свой SMTP в Authentication → Emails. В Auth → URL Configuration добавьте также адрес сайта и путь `/auth/confirm`, если шаблон письма использует `token_hash`.
