        // --- DOM Elements ---
        const levelSelectionScreen = document.getElementById('level-selection-screen');
        const gameScreen = document.getElementById('game-screen');
        const finalScoreScreen = document.getElementById('final-score-screen');
        const levelDisplay = document.getElementById('level-display');
        const scoreDisplay = document.getElementById('score-display');
        const timerContainer = document.getElementById('timer-container');
        const timerDisplay = document.getElementById('timer-display');
        const questionPrompt = document.getElementById('question-prompt');
        const wordDisplay = document.getElementById('word-display');
        const answerInput = document.getElementById('answer-input');
        const checkBtn = document.getElementById('check-btn');
        const messageArea = document.getElementById('message-area');
        const finalScoreDisplay = document.getElementById('final-score-display');
        const finalEmoji = document.getElementById('final-emoji');
        const finalTitle = document.getElementById('final-title');
        const finalMessage = document.getElementById('final-message');
        const darkModeToggle = document.getElementById('darkModeToggle');
        const rulesBtn = document.getElementById('rules-btn');
        const closeRulesBtn = document.getElementById('close-rules-btn');
        const rulesModal = document.getElementById('rules-modal');
        const rulesModalBackdrop = document.getElementById('rules-modal-backdrop');
        const levelsGrid = document.getElementById('levels-grid');

        // --- Game Data ---
const words = {
    "سهل": { 
        "قطة": "cat", 
        "كلب": "dog", 
        "شمس": "sun", 
        "ولد": "boy", 
        "بنت": "girl", 
        "كتاب": "book", 
        "سيارة": "car", 
        "تفاحة": "apple", 
        "ماء": "water", 
        "بيت": "house",
        "أزرق": "blue", 
        "أحمر": "red", 
        "أصفر": "yellow", 
        "أخضر": "green", 
        "وردة": "flower"
    },
    "متوسط": { 
        "سعيد": "happy", 
        "مدرسة": "school", 
        "صديق": "friend", 
        "طعام": "food", 
        "عائلة": "family", 
        "يلعب": "play", 
        "كبير": "big", 
        "صغير": "small", 
        "زهرة": "flower", 
        "شجرة": "tree",
        "سيارة": "car", 
        "شباك": "window", 
        "مغسلة": "sink", 
        "دراجة": "bike"
    },
    "صعب": { 
        "كمبيوتر": "computer", 
        "معلومات": "information", 
        "مستشفى": "hospital", 
        "مغامرة": "adventure", 
        "مكتبة": "library", 
        "جميل": "beautiful", 
        "قوة": "strength", 
        "مختلف": "different", 
        "معرفة": "knowledge", 
        "حكومة": "government",
        "محيط": "ocean", 
        "مطار": "airport", 
        "حيوان": "animal", 
        "غابة": "forest"
    },
    "تحدي الوقت": { 
        "كمبيوتر": "computer", 
        "معلومات": "information", 
        "مستشفى": "hospital", 
        "مغامرة": "adventure", 
        "مكتبة": "library", 
        "جميل": "beautiful", 
        "قوة": "strength", 
        "مختلف": "different", 
        "معرفة": "knowledge", 
        "حكومة": "government",
        "محيط": "ocean", 
        "مطار": "airport", 
        "حيوان": "animal", 
        "غابة": "forest"
    }
};

        const levelOrder = ["سهل", "متوسط", "صعب", "تحدي الوقت"];
        const levelThreshold = 80;
        const positiveFeedback = ["رائع! ✨", "أحسنت! 🎉", "إجابة صحيحة! 👍", "أنت نجم! 🌟", "مذهل! 🤩"];
        const encouragingFeedback = ["حاول مرة أخرى، أنت تستطيع! 💪", "لا بأس، فكر مرة أخرى! 🤔", "قريب جدًا، حاول مجددًا! 🎯"];

        // --- Game State ---
        let currentLevel = '';
        let score = 0;
        let currentQuestions = [];
        let questionIndex = 0;
        let attempts = 0;
        let currentCorrectAnswer = '';
        let timerInterval;
        let timeLeft = 15;

        // --- Event Listeners ---
        checkBtn.addEventListener('click', checkAnswer);
        answerInput.addEventListener('keyup', (event) => { if (event.key === 'Enter') checkBtn.click(); });
        darkModeToggle.addEventListener('change', () => document.body.classList.toggle('dark'));
        rulesBtn.addEventListener('click', () => {
            rulesModal.classList.add('active');
            rulesModalBackdrop.classList.add('active');
        });
        closeRulesBtn.addEventListener('click', closeRulesModal);
        rulesModalBackdrop.addEventListener('click', closeRulesModal);

        function closeRulesModal() {
            rulesModal.classList.remove('active');
            rulesModalBackdrop.classList.remove('active');
        }

        // --- Game Initialization ---
        function init() {
            updateLevelsUI();
            levelsGrid.addEventListener('click', (e) => {
                const levelCard = e.target.closest('.level-card');
                if (levelCard && !levelCard.classList.contains('locked')) {
                    startGame(levelCard.dataset.level);
                }
            });
        }
        
        function updateLevelsUI() {
            const unlockedLevelIndex = levelOrder.indexOf(localStorage.getItem('unlockedLevel') || 'سهل');
            document.querySelectorAll('.level-card').forEach((card, index) => {
                const lockIcon = card.querySelector('.lock-icon');
                if (index > unlockedLevelIndex) {
                    card.classList.add('locked');
                    lockIcon.classList.remove('hidden');
                } else {
                    card.classList.remove('locked');
                    lockIcon.classList.add('hidden');
                }
            });
        }

        // --- Game Functions ---
        function startGame(level) {
            currentLevel = level;
            score = 0;
            questionIndex = 0;
            levelDisplay.textContent = level;
            scoreDisplay.textContent = score;
            
            timerContainer.classList.toggle('hidden', level !== 'تحدي الوقت');

            const levelWords = words[level];
            currentQuestions = Object.entries(levelWords);
            shuffleArray(currentQuestions);

            levelSelectionScreen.classList.add('hidden');
            gameScreen.classList.remove('hidden');
            finalScoreScreen.classList.add('hidden');

            nextQuestion();
        }

function nextQuestion() {
    if (questionIndex >= currentQuestions.length) {
        endGame();
        return;
    }
    clearInterval(timerInterval);
    attempts = 0;
    answerInput.value = '';
    answerInput.disabled = false;
    answerInput.focus();
    messageArea.textContent = '';
    wordDisplay.classList.remove('correct-answer', 'wrong-answer');
    checkBtn.disabled = false;

    // اختيار موضوع عشوائي
    const topics = ["سهل", "متوسط", "صعب", "تحدي الوقت"];
    const randomTopic = topics[Math.floor(Math.random() * topics.length)];
    const levelWords = words[randomTopic];
    currentQuestions = Object.entries(levelWords);
    shuffleArray(currentQuestions);

    const [arabicWord, englishWord] = currentQuestions[questionIndex];

    if (Math.random() < 0.5) {
        questionPrompt.textContent = `ما هي ترجمة كلمة '${arabicWord}' بالإنجليزية؟`;
        wordDisplay.textContent = arabicWord;
        currentCorrectAnswer = englishWord;
    } else {
        questionPrompt.textContent = `ما هي ترجمة كلمة '${englishWord}' بالعربية؟`;
        wordDisplay.textContent = englishWord;
        currentCorrectAnswer = arabicWord;
    }

    if (currentLevel === 'تحدي الوقت') startTimer();
}


function startTimer() {
    timeLeft = 15;
    timerDisplay.textContent = timeLeft;
    timerInterval = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            handleTimeUp();
        }
    }, 1000);
}

        
        function handleTimeUp() {
            messageArea.innerHTML = `انتهى الوقت! الإجابة هي: <span class="font-bold text-red-500">${currentCorrectAnswer}</span>`;
            messageArea.style.color = '#EF4444';
            answerInput.disabled = true;
            checkBtn.disabled = true;
            questionIndex++;
            setTimeout(nextQuestion, 3000);
        }

function checkAnswer() {
    const userAnswer = answerInput.value.trim().toLowerCase();
    if (!userAnswer) return;
    clearInterval(timerInterval);
    if (userAnswer === currentCorrectAnswer.toLowerCase()) handleCorrectAnswer();
    else handleWrongAnswer();
}


        function handleCorrectAnswer() {
            score += (currentLevel === 'تحدي الوقت' || attempts === 0) ? 10 : 5;
            scoreDisplay.textContent = score;
            messageArea.textContent = randomChoice(positiveFeedback);
            messageArea.style.color = '#10B981';
            wordDisplay.classList.add('correct-answer');
            answerInput.disabled = true;
            checkBtn.disabled = true;
            questionIndex++;
            setTimeout(nextQuestion, 1500);
        }
        
        function handleWrongAnswer() {
            attempts++;
            wordDisplay.classList.add('wrong-answer');
            setTimeout(() => wordDisplay.classList.remove('wrong-answer'), 500);

            if (currentLevel === 'تحدي الوقت' || attempts >= 2) {
                messageArea.innerHTML = `للأسف! الإجابة الصحيحة هي: <span class="font-bold text-red-500">${currentCorrectAnswer}</span>`;
                messageArea.style.color = '#EF4444';
                answerInput.disabled = true;
                checkBtn.disabled = true;
                questionIndex++;
                setTimeout(nextQuestion, 3000);
            } else {
                messageArea.textContent = randomChoice(encouragingFeedback);
                messageArea.style.color = '#F59E0B';
                answerInput.value = '';
                answerInput.focus();
            }
        }

        function endGame() {
            const currentLevelIndex = levelOrder.indexOf(currentLevel);
            const unlockedLevelIndex = levelOrder.indexOf(localStorage.getItem('unlockedLevel') || 'سهل');
            
            // Check for unlocking the next level
            if (score >= levelThreshold && currentLevelIndex < levelOrder.length - 1 && currentLevelIndex >= unlockedLevelIndex) {
                 const nextLevel = levelOrder[currentLevelIndex + 1];
                 localStorage.setItem('unlockedLevel', nextLevel);
                 finalEmoji.textContent = '🏆';
                 finalTitle.textContent = 'تهانينا!';
                 finalMessage.textContent = `لقد فتحت قفل المستوى التالي: ${nextLevel}!`;
            } else {
                 finalEmoji.textContent = '🎉';
                 finalTitle.textContent = 'أداء رائع!';
                 finalMessage.textContent = 'لقد أكملت المستوى بنجاح.';
            }

            gameScreen.classList.add('hidden');
            finalScoreScreen.classList.remove('hidden');
            finalScoreDisplay.textContent = score;
        }

        function playAgain() {
            finalScoreScreen.classList.add('hidden');
            levelSelectionScreen.classList.remove('hidden');
            updateLevelsUI();
        }

        // --- Helper Functions ---
// دالة لخلط الأسئلة عشوائيًا
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

        function randomChoice(array) {
            return array[Math.floor(Math.random() * array.length)];
        }
        
        // --- Start the app ---
        init();