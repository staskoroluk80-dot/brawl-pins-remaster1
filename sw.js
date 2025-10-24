const CACHE_NAME = 'clicker-v5'; // Збільште версію кешу при кожній зміні файлів!
// Кешуємо всі критично важливі файли
const urlsToCache = [
    '/', 
    'index.html',
    'style.css',
    'script.js',
    'manifest.json',
    'images/champie_super_brawl_pin.png', 
    'images/icon-192.png',
    'images/icon-512.png'
];

self.addEventListener('install', event => {
    console.log('SW: Installing and Caching assets');
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            // Важливо: .addAll() викличе помилку, якщо хоча б один файл недоступний.
            // На GitHub Pages іноді може бути проблема з '/'.
            // Ми використовуємо Promise.all для кращої діагностики.
            return cache.addAll(urlsToCache).catch(error => {
                console.error('SW failed to cache all files:', error);
            });
        })
    );
});

self.addEventListener('activate', event => {
    console.log('SW: Activated');
    // Очищення старих кешів
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log('SW: Deleting old cache:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', event => {
    // === СТРАТЕГІЯ: Спочатку Кеш ===
    event.respondWith(
        caches.match(event.request) // 1. Шукаємо запит у кеші
            .then(response => {
                // 2. Якщо знайдено, повертаємо кешовану відповідь
                if (response) {
                    return response;
                }
                // 3. Якщо не знайдено, намагаємося завантажити з мережі
                return fetch(event.request);
            })
            // Додатково: Обробка випадку, коли мережа недоступна, а кеш не спрацював
            .catch(() => {
                 // Тут можна повернути офлайн-сторінку, якщо потрібно, 
                 // але для простого PWA це не обов'язково.
                 console.log("SW: Network fetch failed. Item not in cache.");
            })
    );
});
