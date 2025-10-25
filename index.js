// --- ЗМІННІ ГРИ ---
let score = 0;
let tapPower = 1; 
let autoClickRate = 0; 

// Вартість та рівні (використовуємо UPGRADES для збереження стану)
const UPGRADES = {
    cursor: { cost: 10, rateIncrease: 1.5, power: 1 },
    autoclick: { cost: 100, rateIncrease: 1.8, power: 1 }
};

// DOM елементи
const scoreDisplay = document.getElementById('score-display');
const tpsDisplay = document.getElementById('taps-per-second');
const tapButton = document.getElementById('tap-button');

// Оновлення вартості в інтерфейсі (DOM-елементи з HTML)
const cursorCostDisplay = document.getElementById('cursor-cost');
const autoclickCostDisplay = document.getElementById('autoclick-cost');


// ----------------------------------
// ЗБЕРЕЖЕННЯ / ЗАВАНТАЖЕННЯ СТАНУ (LocalStorage)
// ----------------------------------

function saveGame() {
    const gameState = {
        score: score,
        tapPower: tapPower,
        autoClickRate: autoClickRate,
        cursorCost: UPGRADES.cursor.cost,
        autoclickCost: UPGRADES.autoclick.cost
    };
    localStorage.setItem('clickerGameSave', JSON.stringify(gameState));
}

function loadGame() {
    const savedState = localStorage.getItem('clickerGameSave');
    
    if (savedState) {
        const gameState = JSON.parse(savedState);
        
        // Відновлення змінних
        score = gameState.score || 0;
        tapPower = gameState.tapPower || 1;
        autoClickRate = gameState.autoClickRate || 0;

        // Відновлення вартості апгрейдів
        UPGRADES.cursor.cost = gameState.cursorCost || 10;
        UPGRADES.autoclick.cost = gameState.autoclickCost || 100;
        
        console.log('Гра завантажена успішно!');
    }
}


// --- 1. Основна Логіка Тапання ---
function performTap(event) {
    score += tapPower;
    // Оновлення дисплея також викликає збереження
    updateDisplay(); 
}

// --- 2. Логіка Магазину ---
function buyUpgrade(type) {
    const upgrade = UPGRADES[type];
    const cost = upgrade.cost;

    if (score >= cost) {
        score -= cost;

        if (type === 'cursor') {
            tapPower += upgrade.power;
            upgrade.cost = Math.ceil(cost * upgrade.rateIncrease); 
        } else if (type === 'autoclick') {
            autoClickRate += upgrade.power;
            upgrade.cost = Math.ceil(cost * upgrade.rateIncrease);
            
            // Перезапускаємо інтервал для нового TPS
            clearInterval(autoClickInterval);
            startAutoClicker();
        }
        
        // Оновлення дисплея викликає збереження
        updateDisplay(); 
    } else {
        alert('Недостатньо койнів!');
    }
}

// --- 3. Автоматичний Клікер (TPS) ---
let autoClickInterval;
function startAutoClicker() {
    // Зупиняємо старий інтервал, якщо він існує
    if (autoClickInterval) clearInterval(autoClickInterval);

    // Запускаємо новий інтервал, лише якщо є TPS
    if (autoClickRate > 0) {
        autoClickInterval = setInterval(() => {
            score += autoClickRate;
            updateDisplay(); 
        }, 1000); // Оновлюємо кожну секунду
    }
}

// --- 4. Оновлення Інтерфейсу ---
function updateDisplay() {
    scoreDisplay.innerText = `${Math.floor(score).toLocaleString()} КОЙНІВ`;
    tpsDisplay.innerText = `${autoClickRate} койнів/сек`;

    // Оновлення вартості в магазині
    cursorCostDisplay.innerText = UPGRADES.cursor.cost.toLocaleString();
    autoclickCostDisplay.innerText = UPGRADES.autoclick.cost.toLocaleString();

    // Оновлення стану кнопок магазину
    document.getElementById('upgrade-cursor').querySelector('button').disabled = score < UPGRADES.cursor.cost;
    document.getElementById('upgrade-autoclick').querySelector('button').disabled = score < UPGRADES.autoclick.cost;

    // *** ЗБЕРЕЖЕННЯ ГРИ ***
    saveGame();
}


// --- ІНІЦІАЛІЗАЦІЯ ---

// 1. PWA: Реєстрація Service Worker 
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Реєструємо SW
        navigator.serviceWorker.register('./sw.js') 
          .then(reg => console.log('PWA: SW registered successfully!'))
          .catch(err => console.log('PWA: SW registration failed: ', err));
    });
}

// 2. ЗАВАНТАЖЕННЯ ГРИ: має бути першим
loadGame(); 

// 3. Прив'язка події тапання
tapButton.addEventListener('click', performTap);

// 4. Початкове оновлення та запуск автоклікера
updateDisplay();
startAutoClicker(); 

// Робимо функцію доступною глобально для HTML-кнопок
window.buyUpgrade = buyUpgrade;
