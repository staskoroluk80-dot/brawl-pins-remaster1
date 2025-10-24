const CACHE_NAME = 'clicker-v4';
// Важливо: На GitHub Pages, якщо ви не використовуєте кастомний домен, 
// кореневий шлях './' іноді може не працювати. Вказуємо повні імена файлів.
const urlsToCache = [
    '/', // Спроба кешування кореневого шляху
    'index.html',
    'style.css',
    'script.js',
    'manifest.json',
    // Обов'язково кешуємо зображення!
    'images/champie_super_brawl_pin.png', 
    'images/icon-192.png',
    'images/icon-512.png'
];

self.addEventListener('install', event => {
    console.log('Service Worker: Installing and Caching assets');
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            // Використовуємо .addAll() для завантаження та кешування всіх файлів
            return cache.addAll(urlsToCache).catch(error => {
                console.error('Service Worker failed to cache required files:', error);
            });
        })
    );
});

self.addEventListener('activate', event => {
    console.log('Service Worker: Activated');
    // Очищення старих кешів, щоб оновити додаток при новій версії
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', event => {
    // Перехоплюємо всі запити та повертаємо дані з кешу
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});