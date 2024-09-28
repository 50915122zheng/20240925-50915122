const images = [
    '1.jpg', '2.jpg', '3.jpg', '4.jpg',
    '5.jpg', '6.jpg', '7.jpg', '8.jpg'
];

let firstCard = null;
let secondCard = null;
let lockBoard = false;
let matchedCards = 0;
let startTime;

let timerElement = document.getElementById('timer');
let gameBoard = document.getElementById('game-board');
let startButton = document.getElementById('start-button');
let flipAllCardsButton = document.getElementById('flip-all-cards-button');
let flipBackCardsButton = document.getElementById('flip-back-cards-button');
let levelSelector = document.getElementById('level-selector');

// Levels with dynamic configurations
const levels = {
    easy: {
        size: 4,
        images: [
            '1.jpg', '2.jpg', '3.jpg', '4.jpg', 
            '5.jpg', '6.jpg', '7.jpg', '8.jpg'
        ]
    },
    medium: {
        size: 4,
        images: [
            '10.png', '11.png', '12.png', '13.png',
            '14.png', '15.png', '16.png', '17.png'
        ]
    }
};

// Shuffle function
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Initialize the game based on level configuration
function initGame(size, imageSet) {
    const cardsArray = generateCards(size * size / 2, imageSet); // 確保生成正確數量的卡片
    const shuffledCards = shuffle(cardsArray);
    gameBoard.innerHTML = ''; 
    shuffledCards.forEach((image) => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.image = image;

        const img = document.createElement('img');
        img.src = image;
        card.appendChild(img);

        card.addEventListener('click', flipCard); 
        gameBoard.appendChild(card);
    });

    flipAllCards(); // 在初始化後翻開所有卡片
}



function startCountdown() {
    let timeLeft = 10; // 設定倒數時間
    const countdownDisplay = document.getElementById('countdown-seconds'); // 獲取顯示秒數的元素
    countdownDisplay.textContent = timeLeft; // 初始化顯示

    timerElement.style.display = 'block'; // 確保顯示計時器

    const countdown = setInterval(() => {
        timeLeft--;
        countdownDisplay.textContent = timeLeft; // 更新顯示的秒數

        if (timeLeft === 0) {
            clearInterval(countdown);
            timerElement.style.display = 'none'; 
            unflipAllCards(); // 倒數結束後翻回所有卡片
            lockBoard = false; 
        }
    }, 1000);
}



// Generate pairs of cards based on image set
function generateCards(totalPairs, imageSet) {
    const selectedImages = imageSet.slice(0, totalPairs);
    return [...selectedImages, ...selectedImages];
}

// Flip all cards with animation
function flipAllCards() {
    const cards = document.querySelectorAll('.card');
    let delay = 0;
    
    cards.forEach((card) => {
        setTimeout(() => {
            card.classList.add('flipped');
        }, delay);
        delay += 50; // 控制每張卡片翻轉的時間間隔
    });
}

// Unflip all cards with animation
function unflipAllCards() {
    const cards = document.querySelectorAll('.card');
    let delay = 0;

    cards.forEach((card) => {
        setTimeout(() => {
            card.classList.remove('flipped');
        }, delay);
        delay += 50; // 控制每張卡片翻轉回去的時間間隔
    });
}

// Flip a single card
function flipCard() {
    if (lockBoard) return;
    if (this === firstCard) return;

    this.classList.add('flipped');

    if (!firstCard) {
        firstCard = this;
        return;
    }

    secondCard = this;
    checkForMatch();
}

// Check if two cards match
function checkForMatch() {
    if (firstCard.dataset.image === secondCard.dataset.image) {
        disableCards();
        matchedCards += 1;

        if (matchedCards === images.length) {
            setTimeout(showEndGameMessage, 500);
        }
    } else {
        unflipCards();
    }
}

// Disable the matched cards
function disableCards() {
    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);
    firstCard.classList.add('matched');
    secondCard.classList.add('matched');
    resetBoard();
}

// Unflip unmatched cards
function unflipCards() {
    lockBoard = true;

    setTimeout(() => {
        firstCard.classList.remove('flipped');
        secondCard.classList.remove('flipped');
        resetBoard();
    }, 1000);
}

// Reset the board state
function resetBoard() {
    [firstCard, secondCard, lockBoard] = [null, null, false];
}

// Show the end game message
// Show the end game message with an effect
function showEndGameMessage() {
    const endTime = Date.now();
    const playTime = Math.round((endTime - startTime) / 1000);

    const endMessage = document.createElement('div');
    endMessage.classList.add('end-message'); // 添加類別以便於CSS樣式
    endMessage.innerHTML = `
        <h2>遊戲結束！</h2>
        <p>遊玩時間: ${playTime} 秒</p>
        <button id="play-again-button">再玩一次</button>
    `;
    
    // 將結束消息添加到遊戲板上
    gameBoard.appendChild(endMessage);
    
    // 添加淡入效果
    setTimeout(() => {
        endMessage.classList.add('fade-in');
    }, 10); // 延遲以確保樣式能應用

    document.getElementById('play-again-button').addEventListener('click', () => {
        endMessage.remove();
        resetGame();
    });
}


// Reset the game board
function resetGameBoard() {
    gameBoard.innerHTML = '';
    firstCard = null;
    secondCard = null;
    lockBoard = false;
}

function resetGame() {
    matchedCards = 0;
    resetGameBoard();
    const selectedLevel = levelSelector.value;
    initGame(levels[selectedLevel].size, levels[selectedLevel].images);
    
    // 重新開始倒數計時
    startCountdown();
}
// Event listeners for buttons
startButton.addEventListener('click', () => {
    const selectedLevel = levelSelector.value; // 獲取選擇的關卡
    startButton.style.display = 'none';
    document.getElementById('control-buttons').style.display = 'flex';
    gameBoard.style.visibility = 'visible';
    lockBoard = true; // 鎖定翻牌狀態
    matchedCards = 0;
    startTime = Date.now();
    
    // 初始化遊戲使用選擇的關卡
    initGame(levels[selectedLevel].size, levels[selectedLevel].images);
    
    // Flip all cards for 10 seconds
    flipAllCards();
    startCountdown(); // 開始倒數計時

    setTimeout(() => {
        unflipAllCards(); // 10秒後翻回所有卡片
        lockBoard = false; // 解鎖翻牌
    }, 10000); // 10秒
});

function startCountdown() {
    let timeLeft = 10; // 設定倒數時間
    const countdownDisplay = document.getElementById('countdown-seconds'); // 獲取顯示秒數的元素
    countdownDisplay.textContent = timeLeft; // 初始化顯示

    timerElement.style.display = 'block'; // 確保顯示計時器

    const countdown = setInterval(() => {
        timeLeft--;
        countdownDisplay.textContent = timeLeft; // 更新顯示的秒數

        if (timeLeft === 0) {
            clearInterval(countdown);
            timerElement.style.display = 'none'; 
            unflipAllCards(); // 倒數結束後翻回所有卡片
            lockBoard = false; 
        }
    }, 1000);
}

// Level selector change event
levelSelector.addEventListener('change', function() {
    const selectedLevel = this.value;
    resetGameBoard();
    initGame(levels[selectedLevel].size, levels[selectedLevel].images); // 使用選擇的關卡初始化遊戲
    startCountdown();
});


// Flip all and unflip all buttons
flipAllCardsButton.addEventListener('click', flipAllCards);
flipBackCardsButton.addEventListener('click', unflipAllCards);
