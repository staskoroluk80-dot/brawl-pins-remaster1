const CACHE_NAME = 'clicker-v7'; // *** КРИТИЧНО: ЗБІЛЬШТЕ ВЕРСІЮ КЕШУ! ***

// Виправляємо список кешування для GitHub Pages: прибираємо '/' і додаємо необхідні файли.
const urlsToCache = [
    'index.html',
    'style.css',
    'script.js',
    'manifest.json',
    'images/champie_super_brawl_pin.png', 
    'images/icon-192.png',
    'images/icon-512.png'
    // Додайте тут будь-які інші файли, які абсолютно необхідні!
];

// ----------------------------------
// 1. Блок INSTALL: Кешування ресурсів
// ----------------------------------
self.addEventListener('install', event => {
    console.log('SW: Installing and Caching assets');
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            // .addAll() завантажує та кешує всі файли. Якщо щось не знайдено, Service Worker не активується.
            return cache.addAll(urlsToCache).catch(error => {
                console.error('SW failed to cache all files:', error);
                // Тут ми не можемо повернути помилку, інакше Service Worker не активується.
            });
        })
    );
});

// ----------------------------------
// 2. Блок ACTIVATE: Очищення старих кешів
// ----------------------------------
self.addEventListener('activate', event => {
    console.log('SW: Activated and cleaning up old caches');
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

// ----------------------------------
// 3. Блок FETCH: Обробка запитів (Ключовий для офлайн-роботи)
// ----------------------------------
self.addEventListener('fetch', event => {
    // Ми перевіряємо, чи запит є GET-запитом (щоб не кешувати POST, PUT тощо)
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request) // 1. Шукаємо запит у кеші
            .then(response => {
                // 2. Якщо знайдено в кеші, повертаємо його негайно.
                if (response) {
                    return response;
                }

                // 3. Якщо не знайдено, намагаємося завантажити з мережі.
                return fetch(event.request);
            })
            // 4. Обробка помилок (відсутність мережі)
            .catch(error => {
                console.log('SW: Fetch failed, returning index.html as fallback:', error);
                
                // *** КЛЮЧОВИЙ ФІКС: *** // Якщо мережа відсутня, а запит не знайдено в кеші, 
                // ми примусово повертаємо кешований index.html.
                return caches.match('index.html');
            })
    );
});
