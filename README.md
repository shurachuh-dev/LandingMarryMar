# Marymar — лендінг авторських техкарт тортів

Одна сторінка про техкарти тортів кондитера Марії ([@marymar.cake](https://www.instagram.com/marymar.cake/)).
Звичайні HTML, CSS і JavaScript, без збірки та залежностей.

## Як подивитися локально

Запустіть локальний сервер у папці проєкту:

```
powershell -ExecutionPolicy Bypass -File serve.ps1
```

Потім відкрийте http://localhost:8080. Щоб зупинити сервер, натисніть Ctrl+C.

Для швидкого перегляду можна просто двічі клацнути `index.html`.

## Структура

```
index.html        вся сторінка (7 блоків)
css/style.css     стилі; кольори зібрані на початку файлу в :root
js/main.js        інтерактив (етап 2)
assets/img/       фото
assets/fonts/     шрифти Manrope, Cormorant Garamond, Cormorant SC, Marck Script
```

## Де що змінювати

- **Тексти й ціни** знаходяться в `index.html`. Ціни поки стоять як `[ціна]`.
- **Кольори** задані змінними на початку `css/style.css` (`--accent` і т. д.).
- **Фото** лежать в `assets/img/`. Якщо замінити файл з тим самим ім'ям, фото оновиться на сторінці.
