const sentences = {
    beginner: [
        "The cat sits on the mat.",
        "She likes to read books.",
        "The sun shines brightly.",
        "I love eating ice cream."
    ],
    intermediate: [
        "Coding is fun and improves logical thinking.",
        "Practice typing daily to increase speed.",
        "Reading books enhances vocabulary skills.",
        "A balanced diet is essential for good health."
    ],
    advanced: [
        "JavaScript is a versatile programming language with dynamic capabilities.",
        "Effective communication is vital in professional and personal relationships.",
        "The internet has revolutionized the way information is shared globally.",
        "Artificial intelligence is transforming industries worldwide."
    ],
    pro: [
        "Cryptographic techniques ensure secure data transmission over the internet.",
        "Quantum computing has the potential to revolutionize problem-solving in science.",
        "Neural networks attempt to mimic the human brain's pattern recognition abilities.",
        "String theory aims to reconcile quantum mechanics and general relativity."
    ]
};
let currentSentence = "";
let startTime;
let timer;
let selectedTime = 30;

function showRegister() {
    document.getElementById("registerSection").classList.remove("hidden");
    document.getElementById("loginSection").classList.add("hidden");
}

function showLogin() {
    document.getElementById("registerSection").classList.add("hidden");
    document.getElementById("loginSection").classList.remove("hidden");
}

function register() {
    let username = document.getElementById("regUsername").value;
    let password = document.getElementById("regPassword").value;

    if (!username || !password) {
        document.getElementById("registerMessage").textContent = "Please enter valid credentials.";
        return;
    }

    localStorage.setItem(username, password);
    document.getElementById("registerMessage").textContent = "Successfully Registered! Redirecting to Login...";
    
    setTimeout(() => {
        showLogin();
    }, 1500);
}

function login() {
    let username = document.getElementById("loginUsername").value;
    let password = document.getElementById("loginPassword").value;

    if (localStorage.getItem(username) === password) {
        localStorage.setItem("loggedInUser", username);
        loadTypingSection(username);
    } else {
        document.getElementById("loginMessage").textContent = "Invalid login!";
    }
}

function loadTypingSection(username) {
    document.getElementById("auth").classList.add("hidden");
    document.getElementById("typingSection").classList.remove("hidden");
    document.getElementById("userDisplay").textContent = username;
    updateLeaderboard();
    updateTimeOptions();
}

function updateTimeOptions() {
    let timeSelect = document.getElementById("timeSelect");
    timeSelect.innerHTML = "";

    let level = document.getElementById("levelSelect").value;
    let times = {
        beginner: [40, 50, 60],
        intermediate: [30, 40, 45],
        advanced: [15, 30, 35],
        pro: [10, 15, 20]
    };

    times[level].forEach(time => {
        let option = document.createElement("option");
        option.value = time;
        option.textContent = `${time} sec`;
        timeSelect.appendChild(option);
    });

    selectedTime = times[level][0];
}


function startTyping() {
    let level = document.getElementById("levelSelect").value;
    let sentenceList = sentences[level]; // Get sentences for the selected level
    currentSentence = sentenceList[Math.floor(Math.random() * sentenceList.length)];

    document.getElementById("sentence").textContent = currentSentence;
    document.getElementById("typingArea").classList.remove("hidden");
    document.getElementById("timeLeft").classList.remove("hidden");

    selectedTime = parseInt(document.getElementById("timeSelect").value);
    document.getElementById("timeCounter").textContent = selectedTime;

    document.getElementById("typingArea").value = "";
    startTime = new Date().getTime();
    
    clearInterval(timer); // Clear any previous timer before starting a new one
    timer = setInterval(updateTimer, 1000);
}

function updateTimer() {
    let timeLeft = selectedTime - Math.floor((new Date().getTime() - startTime) / 1000);

    // Ensure time never goes negative
    if (timeLeft <= 0) {
        timeLeft = 0;
        clearInterval(timer); // Stop the timer when it reaches 0
        evaluateTyping();
    }

    document.getElementById("timeCounter").textContent = timeLeft;
}

function checkTyping() {
    let typedText = document.getElementById("typingArea").value.trim();

    // If the typed text matches the sentence, stop the timer immediately
    if (typedText === currentSentence) {
        clearInterval(timer); // Stop the timer
        evaluateTyping();
    }
}

function evaluateTyping() {
    let timeTaken = (new Date().getTime() - startTime) / 1000;
    saveResult(timeTaken);
}

function saveResult(time) {
    let username = localStorage.getItem("loggedInUser");
    let scores = JSON.parse(localStorage.getItem("weeklyScores")) || [];
    let now = new Date().getTime(); // Get current timestamp

    scores.push({ user: username, time, timestamp: now });

    // Remove scores older than 7 days
    let oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);
    scores = scores.filter(entry => entry.timestamp > oneWeekAgo);

    // Sort scores based on time (ascending order)
    scores.sort((a, b) => a.time - b.time);

    localStorage.setItem("weeklyScores", JSON.stringify(scores));

    updateLeaderboard();
}

function updateLeaderboard() {
    let scores = JSON.parse(localStorage.getItem("weeklyScores")) || [];
    let leaderboard = document.getElementById("topTypists");
    leaderboard.innerHTML = "";

    // Sort scores by fastest time
    scores.sort((a, b) => a.time - b.time);

    scores.slice(0, 5).forEach((entry, index) => {
        let listItem = document.createElement("li");
        listItem.innerHTML = `${index + 1}. ${entry.user} - ${entry.time}s`;
        leaderboard.appendChild(listItem);
    });

    checkWeeklyWinner(scores);
}

function checkWeeklyWinner(scores) {
    let lastReset = localStorage.getItem("lastReset") || 0;
    let now = new Date().getTime();
    let oneWeek = 7 * 24 * 60 * 60 * 1000;

    // If it's been a week, declare a winner and reset leaderboard
    if (now - lastReset > oneWeek) {
        if (scores.length > 0) {
            let winner = scores[0].user; // Fastest user
            alert(`🏆 This week's winner is: ${winner}! 🏆`);
        }

        localStorage.removeItem("weeklyScores"); // Reset leaderboard
        localStorage.setItem("lastReset", now.toString()); // Update reset time
    }
}

// **Restart function**
function restartTest() {
    clearInterval(timer); // Stop any existing timer
    document.getElementById("typingArea").value = "";
    document.getElementById("sentence").textContent = "Press 'Start' to begin.";
    document.getElementById("timeCounter").textContent = selectedTime;
}

// Initialize leaderboard and time options on page load
updateLeaderboard();
updateTimeOptions();
