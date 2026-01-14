// Detectamos si estamos en Electron de forma segura
const isElectron = typeof process !== 'undefined' && process.versions && process.versions.electron;

document.querySelectorAll('.icon-link').forEach(link => {
    link.addEventListener('click', (e) => {
        const url = link.getAttribute('href');

        if (isElectron) {
            // Si es la App de escritorio, usamos shell para abrir el navegador real
            e.preventDefault();
            const { shell } = require('electron');
            shell.openExternal(url);
        } else {
            // Si estoy en un browser normal, se abre con el target _blank
        }
    });
});

(function() {
    const dateStr = new Intl.DateTimeFormat('es-AR', {
        timeZone: 'America/Argentina/Buenos_Aires',
        year: 'numeric', month: '2-digit', day: '2-digit'
    }).format(new Date());
    
    const seed = parseInt(dateStr.split('/').reverse().join(''));
    function seededRandom(a) {
        return function() {
          var t = a += 0x6D2B79F5;
          t = Math.imul(t ^ t >>> 15, t | 1);
          t ^= t + Math.imul(t ^ t >>> 7, t | 61);
          return ((t ^ t >>> 14) >>> 0) / 4294967296;
        }
    }

    // Sobrescribimos Math.random globalmente
    const myRandom = seededRandom(seed);
    Math.random = myRandom;
})();

const dateStr = new Intl.DateTimeFormat('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires',
    year: 'numeric', month: '2-digit', day: '2-digit'
}).format(new Date());

// Escribir la fecha en el header
document.getElementById('date-text').textContent = dateStr;

const totalPairs = 8;
const productLimit = 499;
let computedPairs = [];

for (let i = 0; i < totalPairs; i++) {
    let n1 = Math.floor(Math.random() * 99) + 1;

    let maxPossibleN2 = Math.min(Math.floor(productLimit / n1));
    let rangeTopN2 = Math.min(99, maxPossibleN2);

    let n2 = Math.floor(Math.random() * rangeTopN2) + 1;

    computedPairs.push({
        n1: n1,
        n2: n2,
        sum: n1 + n2,
        product: n1 * n2
    })
}


// Here I prepare numbers for the grid 1 x 16
const allNumbers = computedPairs.flatMap(pair => [pair.n1, pair.n2]).sort((a, b) => a - b);

// Prepare for the 4x4 grid
const finalResults = [
    ...computedPairs.map(pair => pair.sum),
    ...computedPairs.map(pair => pair.product)
].sort(() => Math.random() - 0.5); // Shuffle

/* 
console.group("🛠️ DEBUG: PUZZLE SOLUTION");
console.log("--- Original Pairs (Sum & Product) ---");
console.table(computedPairs);

console.log("--- 1x16 Sorted Sequence (Solution) ---");
console.log(allNumbers.join(" - "));

console.log("--- 4x4 Grid Results (Shuffled) ---");
console.log(finalResults);
console.groupEnd();
*/ 

// Render
const gridContainer16 = document.getElementById('grid-1x16');

const positions = Array.from({ length: 16 }, (_, i) => i);

for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
}

const staticIndices = positions.slice(0, 8);

allNumbers.forEach((num, i) => {
    const div = document.createElement('div');
    div.className = 'grid-16';

    if (staticIndices.includes(i)) {
        // Se muestra como número fijo
        div.textContent = num;
        div.setAttribute('data-number', num);
    } else {
        // Se muestra como selector
        const select = document.createElement('select');
        select.setAttribute('data-number', num);
        
        const min = (i > 0) ? allNumbers[i - 1] : 1;
        const max = (i < 15) ? allNumbers[i + 1] : 99;

        select.innerHTML = `<option value="">?</option>`;
        for (let x = min; x <= max; x++) {
            const option = document.createElement('option');
            option.value = x;
            option.textContent = x;
            select.appendChild(option);
        }
        select.addEventListener('change', updateOptions4x4);
        div.appendChild(select);
    }
    gridContainer16.appendChild(div);
});

// Render 4x4 grid
const gridContainer4x4 = document.getElementById('grid-4x4');

finalResults.forEach((res) => {
    const box = document.createElement('div');
    box.className = 'box-4x4';

    //Upper number, the result
    const upperPart = document.createElement('div');
    upperPart.className = 'result-4x4';
    upperPart.textContent = res;

    //Lower part, the select
    const lowerPart = document.createElement('div');
    lowerPart.className = 'select-4x4';

    lowerPart.innerHTML = `
        <select class="num-op-select"><option value="">-</option></select>
        <select class="operator-select">
            <option value="+">+</option>
            <option value="*">*</option>
        </select>
        <select class="num-op-select"><option value="">-</option></select>`;
    
    box.appendChild(upperPart);
    box.appendChild(lowerPart);
    gridContainer4x4.appendChild(box);
});

function updateOptions4x4() {
    let availableNumbers = []

    document.querySelectorAll('.grid-16').forEach(box => {
        const staticNum = box.getAttribute('data-number');
        const select = box.querySelector('select');

        if(staticNum) {
            // This is a static number box
            availableNumbers.push(staticNum);
        } else if (select && select.value !== "") {
            // The user has already selected a number
            availableNumbers.push(select.value);
        }
    });

    const uniques = [...new Set(availableNumbers)];
    document.querySelectorAll('.num-op-select').forEach(select => {
        const previousValue = select.value;
        select.innerHTML = `<option value="">-</option>`;
        uniques.forEach(num => {
            const option = document.createElement('option');
            option.value = num;
            option.textContent = num;
            if(num == previousValue) option.selected = true;
            select.appendChild(option);
        });
    });
}

updateOptions4x4();

document.getElementById('check-btn').addEventListener('click', () => {
    const boxes16 = document.querySelectorAll('.grid-16 select');
    let boxes16Valid = true;

    boxes16.forEach(select => {
        const userValue = parseInt(select.value);
        const correctValue = parseInt(select.getAttribute('data-number'));
        if (isNaN(userValue) || userValue !== correctValue) {
            boxes16Valid = false;
        }
    });

    const boxes4x4 = document.querySelectorAll('.box-4x4');
    let boxes4x4Valid = true;

    boxes4x4.forEach(box => {
        const target = parseInt(box.querySelector('.result-4x4').textContent);
        const numSelects = box.querySelectorAll('.num-op-select');
        const operator = box.querySelector('.operator-select').value;

        const num1 = parseInt(numSelects[0].value);
        const num2 = parseInt(numSelects[1].value);
        
        if (isNaN(num1) || isNaN(num2)) {
            boxes4x4Valid = false;
            return;
        }

        const isValidMatch = computedPairs.some(pair => {
            const numbersMatch = (num1 === pair.n1 && num2 === pair.n2) || 
                                 (num1 === pair.n2 && num2 === pair.n1);
            
            const operationMatches = (operator === '+' && target === pair.sum) || 
                                     (operator === '*' && target === pair.product);
            
            return numbersMatch && operationMatches;
        });

        if (!isValidMatch) {
            boxes4x4Valid = false;
        }
    });

    if (boxes16Valid && boxes4x4Valid) {
        clearInterval(timerInterval); 
        saveStats(secondsElapsed);    

        setTimeout(() => {
            window.location.href = 'html/stats.html';
        }, 100);
    } else {
        alert("Some answers are incorrect. Check your pairs and try again!");
    }
});

// Reset answers
document.getElementById('reset-btn').addEventListener('click', () => {
    document.querySelectorAll('.grid-16 select').forEach(select => {
        select.value = "";
    });

    document.querySelectorAll('.num-op-select').forEach(select => {
        select.value = "";
    });

    document.querySelectorAll('.operator-select').forEach(select => {
        select.value = "+";
    });

    document.querySelectorAll('.box-4x4').forEach(box => {
        box.classList.remove('correct', 'incorrect');
    });

    updateOptions4x4();
});

// Modal logic
const modal = document.getElementById("help-modal");
const btn = document.getElementById("help-btn");
const span = document.getElementsByClassName("close-modal")[0];

btn.onclick = function() {
    modal.style.display = "flex";
}

span.onclick = function() {
    modal.style.display = "none";
}

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}


// Timer Logic
let startTime;
let timerInterval;
let secondsElapsed = 0;

function startTimer() {
    startTime = Date.now();
    timerInterval = setInterval(() => {
        secondsElapsed = Math.floor((Date.now() - startTime) / 1000);
        document.getElementById('timer-display').textContent = formatTime(secondsElapsed);
    }, 1000);
}

function formatTime(sec) {
    const mins = Math.floor(sec / 60).toString().padStart(2, '0');
    const secs = (sec % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
}

function saveStats(time) {
    const dateKey = document.getElementById('date-text').textContent;
    
    let stats = JSON.parse(localStorage.getItem('tetonor-stats')) || {};
    
    if (!stats[dateKey] || time < stats[dateKey]) {
        stats[dateKey] = time;
        localStorage.setItem('tetonor-stats', JSON.stringify(stats));
    }
}

startTimer();