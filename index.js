let score = 0;
let tapPower = 1; // Скільки койнів за один тап
let autoClickRate = 0; // Скільки койнів за секунду (койнів/сек)

// Вартість та рівні
const costs = {
    cursor: 10,
    autoclick: 100
};

// DOM елементи
const scoreDisplay = document.getElementById('score-display');
const tpsDisplay = document.getElementById('taps-per-second');
const tapButton = document.getElementById('tap-button');
const tapFeedback = document.getElementById('tap-feedback');

// --- 1. Основна Логіка Тапання ---
function performTap(event) {
    score += tapPower;
    updateDisplay();
    
    // Візуальний фідбек (+1)
    showTapFeedback(tapPower, event);
}

// --- 2. Візуальний Фідбек ---
function showTapFeedback(amount, event) {
    const feedback = document.createElement('div');
    feedback.innerText = `+${amount}`;
    feedback.className = 'tap-feedback-popup';

    // Розташування: трохи зміщуємо відносно кліка
    feedback.style.left = `${event.clientX}px`;
    feedback.style.top = `${event.clientY}px`;
    
    // Додаємо елемент і видаляємо його через деякий час
    document.body.appendChild(feedback);
    
    // Анімація (використовуємо CSS-клас для анімації)
    setTimeout(() => {
        feedback.remove();
    }, 800);
}

// Додайте цей CSS-клас в style.css
// .tap-feedback-popup {
//     position: fixed;
//     color: #ffcc00;
//     font-size: 2em;
//     font-weight: bold;
//     pointer-events: none;
//     opacity: 1;
//     animation: floatUp 0.8s ease-out forwards;
//     z-index: 1000;
// }
// @keyframes floatUp {
//     0% { transform: translateY(0); opacity: 1; }
//     100% { transform: translateY(-50px); opacity: 0; }
// }


// --- 3. Логіка Магазину ---
function buyUpgrade(type) {
    const cost = costs[type];

    if (score >= cost) {
        score -= cost;

        if (type === 'cursor') {
            tapPower += 1;
            costs.cursor = Math.ceil(cost * 1.5); // Збільшуємо вартість на 50%
            document.getElementById('cursor-cost').innerText = costs.cursor;
        } else if (type === 'autoclick') {
            autoClickRate += 1;
            costs.autoclick = Math.ceil(cost * 1.8); // Збільшуємо вартість
            document.getElementById('autoclick-cost').innerText = costs.autoclick;
            // Перезапускаємо інтервал для нового TPS
            clearInterval(autoClickInterval);
            startAutoClicker();
        }
        
        updateDisplay();
    } else {
        alert('Недостатньо койнів!');
    }
}

// --- 4. Автоматичний Клікер (TPS) ---
let autoClickInterval;
function startAutoClicker() {
    autoClickInterval = setInterval(() => {
        score += autoClickRate;
        updateDisplay();
        // Можна додати візуальний фідбек для TPS тут, якщо потрібно
    }, 1000); // Оновлюємо кожну секунду
}

// --- 5. Оновлення Інтерфейсу ---
function updateDisplay() {
    scoreDisplay.innerText = `${Math.floor(score)} КОЙНІВ`;
    tpsDisplay.innerText = `${autoClickRate} койнів/сек`;

    // Оновлення стану кнопок магазину
    document.getElementById('upgrade-cursor').querySelector('button').disabled = score < costs.cursor;
    document.getElementById('upgrade-autoclick').querySelector('button').disabled = score < costs.autoclick;
}

// --- Ініціалізація ---
tapButton.addEventListener('click', performTap);

// Початкове оновлення
updateDisplay();
startAutoClicker(); 

// Робимо функцію доступною глобально для HTML-кнопок
window.buyUpgrade = buyUpgrade;