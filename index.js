const RANDOM_IMG_ENDPOINT = "https://dog.ceo/api/breeds/image/random";

const BREEDS = [
  "affenpinscher",
  "african",
  "airedale",
  "akita",
  "appenzeller",
  "shepherd australian",
  "basenji",
  "beagle",
  "bluetick",
  "borzoi",
  "bouvier",
  "boxer",
  "brabancon",
  "briard",
  "norwegian buhund",
  "boston bulldog",
  "english bulldog",
  "french bulldog",
  "staffordshire bullterrier",
  "australian cattledog",
  "chihuahua",
  "chow",
  "clumber",
  "cockapoo",
  "border collie",
  "coonhound",
  "cardigan corgi",
  "dachshund",
  "dalmatian",
  "great dane",
];

// Game state
let currentQuestionNumber = 1;
const TOTAL_QUESTIONS = 10;
let score = 0;
let hasAnswered = false;
let isLoading = false;

// Utility function to get a random element from array
function getRandomElement(array) {
  const i = Math.floor(Math.random() * array.length);
  return array[i];
}

// Utility function to shuffle array
function shuffleArray(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

// Get multiple choice options
function getMultipleChoices(n, correctAnswer, array) {
  const choices = [correctAnswer];
  while (choices.length < n) {
    const choice = getRandomElement(array);
    if (!choices.includes(choice)) {
      choices.push(choice);
    }
  }
  return shuffleArray(choices);
}

// Extract breed name from URL
function getBreedFromURL(url) {

    const [,path] = url.split("/breeds/");
    const [breedID] = path.split("/");
    const [breed, subtype] = breedID.split("-");
    return [subtype, breed].join(" ");
}

// Fetch dog image
async function fetchMessage(url) {
  const response = await fetch(url);
  const data = await response.json();
  return data.message;
}

// Reset game state
function resetGame() {
  currentQuestionNumber = 1;
  score = 0;
  hasAnswered = false;
  isLoading = false;

  // Clear the main content
  const main = document.querySelector("main");
  main.innerHTML = `
    <div id="image-frame"></div>
    <div id="options"></div>
  `;

  // Start new game
  initQuiz();
}

// Update score display
function updateScoreDisplay() {
  const header = document.querySelector("header p");
  header.textContent = `Question ${currentQuestionNumber}/${TOTAL_QUESTIONS} - Score: ${score}`;
}

// Show loading state
function showLoading() {
  const frame = document.getElementById("image-frame");
  const options = document.getElementById("options");
  frame.textContent = "🐕 Fetching doggo...";
  options.innerHTML = "";
  isLoading = true;
}

// Handle game completion
function handleGameComplete() {
  const main = document.querySelector("main");
  main.innerHTML = `
    <div class="game-complete">
      <h2>Game Complete!</h2>
      <p>Your final score: ${score} out of ${TOTAL_QUESTIONS}</p>
      <button id="playAgain">Play Again</button>
    </div>
  `;

  const playAgainButton = document.getElementById("playAgain");
  if (playAgainButton) {
    playAgainButton.addEventListener("click", resetGame);
  }
}

// Render buttons for choices
function renderButtons(choicesArray, correctAnswer) {
  function buttonHandler(e) {
    if (hasAnswered) return;

    hasAnswered = true;
    const isCorrect = e.target.value === correctAnswer;

    if (isCorrect) {
      score++;
      e.target.classList.add("correct");
    } else {
      e.target.classList.add("incorrect");
      document
        .querySelector(`button[value="${correctAnswer}"]`)
        .classList.add("correct");
    }

    updateScoreDisplay();

    // Disable all buttons
    document.querySelectorAll("#options button").forEach((btn) => {
      btn.disabled = true;
    });

    // Show next question button
    const nextButton = document.createElement("button");
    nextButton.textContent = "Next Dog";
    nextButton.classList.add("next-button");
    nextButton.addEventListener("click", () => {
      if (currentQuestionNumber >= TOTAL_QUESTIONS) {
        handleGameComplete();
      } else {
        currentQuestionNumber++;
        initQuiz();
      }
    });
    document.getElementById("options").appendChild(nextButton);
  }

  const options = document.getElementById("options");
  options.innerHTML = ""; // Clear previous buttons

  choicesArray.forEach((choice) => {
    const button = document.createElement("button");
    button.name = choice;
    button.value = choice;
    button.textContent = choice;
    button.addEventListener("click", buttonHandler);
    options.appendChild(button);
  });
}

// Render quiz content
function renderQuiz(imgUrl, correctAnswer, choices) {
  const image = document.createElement("img");
  image.setAttribute("src", imgUrl);
  const frame = document.getElementById("image-frame");

  image.addEventListener("load", () => {
    // Add artificial delay
    setTimeout(() => {
      frame.replaceChildren(image);
      renderButtons(choices, correctAnswer);
      isLoading = false;
      updateScoreDisplay();
    }, 1000);
  });
}

// Load quiz data
async function loadQuizData() {
  showLoading();
  const doggoImgUrl = await fetchMessage(RANDOM_IMG_ENDPOINT);
  const correctBreed = getBreedFromURL(doggoImgUrl);
  const breedChoices = getMultipleChoices(3, correctBreed, BREEDS);

  return [doggoImgUrl, correctBreed, breedChoices];
}

// Initialize quiz
async function initQuiz() {
  if (isLoading) return;

  hasAnswered = false;
  const [imageUrl, correctAnswer, choices] = await loadQuizData();
  renderQuiz(imageUrl, correctAnswer, choices);
}

// Start the game
document.addEventListener("DOMContentLoaded", () => {
  resetGame();
});
