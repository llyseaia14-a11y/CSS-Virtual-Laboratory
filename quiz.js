const questions = [
    {
        question: "What is the first step before opening a computer?",
        options: [
            "Wear gloves",
            "Unplug the power cable",
            "Touch the RAM",
            "Shake the case"
        ],
        correct: 1
    }
];

let qIndex = 0;
let score = 0;


const questionText = document.getElementById("questionText");
const optionsContainer = document.getElementById("optionsContainer");
const nextBtn = document.getElementById("nextBtn");
const progressBar = document.getElementById("progressBar");
const feedbackMessage = document.getElementById("feedbackMessage");

function loadQuestion() {
    const q = questions[qIndex];

    questionText.textContent = q.question;
    optionsContainer.innerHTML = "";
    nextBtn.style.display = "none";
    feedbackMessage.style.display = "none";

    progressBar.style.width = ((qIndex) / questions.length) * 100 + "%";

    q.options.forEach((opt, i) => {
        const div = document.createElement("div");
        div.textContent = opt;
        div.classList.add("quiz-option");
        div.onclick = () => checkAnswer(i, div);
        optionsContainer.appendChild(div);
    });
}

function checkAnswer(selectedIndex, selectedDiv) {
    const q = questions[qIndex];

    let options = document.querySelectorAll(".quiz-option");
    options.forEach(o => o.style.pointerEvents = "none");

    if (selectedIndex === q.correct) {
        selectedDiv.classList.add("correct");
        score++;
        showFeedback("🎉 Good job!", "green");
    } else {
        selectedDiv.classList.add("wrong");
        showFeedback("❌ Try again next time!", "red");
    }

    nextBtn.style.display = "block";
}

function showFeedback(message, color) {
    feedbackMessage.textContent = message;
    feedbackMessage.style.color = color;
    feedbackMessage.style.display = "block";
}

nextBtn.onclick = () => {
    qIndex++;
    if (qIndex < questions.length) {
        loadQuestion();
    } else {
        finishQuiz();
    }
};

function finishQuiz() {
    questionText.textContent = "Quiz Completed!";
    optionsContainer.innerHTML = "";
    nextBtn.style.display = "none";

    progressBar.style.width = "100%";

    feedbackMessage.style.display = "block";
    feedbackMessage.style.color = "yellow";
    feedbackMessage.textContent = `⭐ Your Score: ${score}/${questions.length}`;
}

loadQuestion();
