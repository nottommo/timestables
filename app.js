const tableOptions = document.querySelector("#table-options");
const selectionHint = document.querySelector("#selection-hint");
const equation = document.querySelector("#equation");
const feedback = document.querySelector("#feedback");
const answerDisplay = document.querySelector("#answer-display");
const keypad = document.querySelector("#keypad");
const submitButton = document.querySelector("#submit-answer");
const modeToggle = document.querySelector("#mode-toggle");
const modeButtons = [...modeToggle.querySelectorAll("[data-mode]")];
const timerPanel = document.querySelector("#timer-panel");
const timerClock = document.querySelector("#timer-clock");
const timerMessage = document.querySelector("#timer-message");
const startTimerButton = document.querySelector("#start-timer");
const resultsCard = document.querySelector("#results-card");
const practiceCard = document.querySelector(".practice-card");
const firstTryResult = document.querySelector("#first-try-result");
const retryResult = document.querySelector("#retry-result");
const averageResult = document.querySelector("#average-result");
const tryAgainButton = document.querySelector("#try-again");

let selectedTables = new Set([5]);
let answer = "";
let question;
let questions = [];
let waitingToAdvance = false;
let advanceTimer;
let mode = "freestyle";
let roundState = "ready";
let roundTables;
let roundDeadline;
let countdownTimer;
let incorrectAttempts = 0;
let roundStats;

const ROUND_DURATION_MS = 300 * 1000;

function shuffle(items) {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [items[index], items[swapIndex]] = [items[swapIndex], items[index]];
  }
  return items;
}

function createQuestionPool(tables = selectedTables) {
  const pool = [];
  for (const table of tables) {
    for (let factor = 1; factor <= 12; factor += 1) {
      pool.push({ table, factor });
    }
  }
  return shuffle(pool);
}

function sameQuestion(left, right) {
  return left.table === right.table && left.factor === right.factor;
}

function makeTableButtons() {
  for (let table = 1; table <= 12; table += 1) {
    const button = document.createElement("button");
    button.className = "table-toggle";
    button.type = "button";
    button.textContent = String(table);
    button.setAttribute("aria-label", `Table ${table}`);
    button.setAttribute("aria-pressed", String(selectedTables.has(table)));
    button.addEventListener("click", () => toggleTable(table, button));
    tableOptions.append(button);
  }
}

function toggleTable(table, button) {
  if (mode === "timer" && roundState === "running") {
    return;
  }

  if (selectedTables.has(table) && selectedTables.size === 1) {
    selectionHint.textContent = "Keep at least one table selected.";
    return;
  }

  if (selectedTables.has(table)) {
    selectedTables.delete(table);
  } else {
    selectedTables.add(table);
  }

  button.setAttribute("aria-pressed", String(selectedTables.has(table)));
  updateSelectionHint();
  if (mode === "timer" && roundState === "results") {
    return;
  }

  questions = createQuestionPool().filter((item) => !sameQuestion(item, question));
  if (advanceTimer !== undefined) {
    window.clearTimeout(advanceTimer);
    advanceTimer = undefined;
  }
  waitingToAdvance = false;
  keypad.querySelectorAll("button").forEach((key) => {
    key.disabled = false;
  });
  showQuestion(questions.pop());
}

function clearAdvanceTimer() {
  if (advanceTimer !== undefined) {
    window.clearTimeout(advanceTimer);
    advanceTimer = undefined;
  }
  waitingToAdvance = false;
}

function setKeypadDisabled(disabled) {
  keypad.querySelectorAll("button").forEach((button) => {
    button.disabled = disabled;
  });
  if (!disabled) {
    submitButton.disabled = !isValidAnswer();
  }
}

function updateModeControls() {
  modeButtons.forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.mode === mode));
    button.disabled = roundState === "running";
  });

  tableOptions.querySelectorAll("button").forEach((button) => {
    button.disabled = mode === "timer" && roundState === "running";
  });

  timerPanel.hidden = mode !== "timer" || roundState === "results";
  resultsCard.hidden = mode !== "timer" || roundState !== "results";
  practiceCard.hidden = mode === "timer" && roundState === "results";
  startTimerButton.hidden = roundState !== "ready";
  timerMessage.hidden = roundState === "results";
  setKeypadDisabled(mode === "timer" && roundState !== "running");
  const duration = formatDuration(ROUND_DURATION_MS);
  startTimerButton.textContent = `Start ${duration} timer`;
  timerMessage.textContent = roundState === "running"
    ? "Answer as many as you can before time runs out."
    : `Start when you’re ready. You’ll have ${duration}.`;
  updateSelectionHint();
}

function updateSelectionHint() {
  if (mode === "timer" && roundState === "results") {
    selectionHint.textContent = "Choose tables for your next round, then tap Try again.";
  } else if (mode === "timer" && roundState === "running") {
    selectionHint.textContent = "Table selection is locked for this round.";
  } else {
    selectionHint.textContent = "Pick one or more tables to practise.";
  }
}

function switchMode(nextMode) {
  if (roundState === "running" || mode === nextMode) {
    return;
  }

  clearAdvanceTimer();
  mode = nextMode;
  roundState = "ready";
  roundTables = undefined;
  roundStats = undefined;
  timerClock.textContent = formatTime(ROUND_DURATION_MS);
  if (countdownTimer !== undefined) {
    window.clearInterval(countdownTimer);
    countdownTimer = undefined;
  }

  questions = createQuestionPool();
  updateModeControls();
  if (!resultsCard.hidden) {
    resultsCard.hidden = true;
  }
  showQuestion(questions.pop());
}

function formatTime(milliseconds) {
  const seconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const minutesPart = Math.floor(seconds / 60);
  const secondsPart = String(seconds % 60).padStart(2, "0");
  return `${minutesPart}:${secondsPart}`;
}

function formatDuration(milliseconds) {
  const seconds = Math.round(milliseconds / 1000);
  if (seconds % 60 === 0) {
    const minutes = seconds / 60;
    return `${minutes} ${minutes === 1 ? "minute" : "minutes"}`;
  }
  return `${seconds} ${seconds === 1 ? "second" : "seconds"}`;
}

function updateCountdown() {
  const remaining = roundDeadline - Date.now();
  if (remaining <= 0) {
    finishRound();
    return;
  }
  timerClock.textContent = formatTime(remaining);
}

function finishIfTimeExpired() {
  if (mode === "timer" && roundState === "running" && Date.now() >= roundDeadline) {
    finishRound();
    return true;
  }
  return false;
}

function startRound(tables = selectedTables) {
  clearAdvanceTimer();
  roundTables = new Set(tables);
  selectedTables = new Set(roundTables);
  roundStats = { firstTry: 0, retries: 0 };
  roundState = "running";
  questions = createQuestionPool(roundTables);
  showQuestion(questions.pop());
  timerClock.textContent = formatTime(ROUND_DURATION_MS);
  roundDeadline = Date.now() + ROUND_DURATION_MS;
  updateModeControls();
  setKeypadDisabled(false);
  updateCountdown();
  countdownTimer = window.setInterval(updateCountdown, 250);
}

function finishRound() {
  if (roundState !== "running") {
    return;
  }

  if (countdownTimer !== undefined) {
    window.clearInterval(countdownTimer);
    countdownTimer = undefined;
  }
  clearAdvanceTimer();
  roundState = "results";
  timerClock.textContent = "0:00";
  firstTryResult.textContent = String(roundStats.firstTry);
  retryResult.textContent = String(roundStats.retries);
  const correctAnswers = roundStats.firstTry + roundStats.retries;
  if (correctAnswers === 0) {
    averageResult.textContent = "Not available";
  } else {
    const roundedAverage = Math.round((ROUND_DURATION_MS / 1000 / correctAnswers) * 2) / 2;
    averageResult.textContent = `${roundedAverage} seconds`;
  }
  updateModeControls();
}

function tryAgain() {
  if (selectedTables.size > 0) {
    startRound(selectedTables);
  }
}

function showQuestion(nextQuestion) {
  question = nextQuestion;
  incorrectAttempts = 0;
  equation.textContent = `${question.table} × ${question.factor}`;
  answer = "";
  renderAnswer();
  feedback.textContent = "";
  feedback.className = "feedback";
}

function nextQuestion() {
  if (questions.length === 0) {
    const tables = mode === "timer" ? roundTables : selectedTables;
    questions = createQuestionPool(tables).filter((item) => !sameQuestion(item, question));
  }
  showQuestion(questions.pop());
}

function renderAnswer() {
  answerDisplay.replaceChildren();
  if (answer.length === 0) {
    const placeholder = document.createElement("span");
    placeholder.className = "answer-placeholder";
    placeholder.textContent = "Your answer";
    answerDisplay.append(placeholder);
  } else {
    const enteredAnswer = document.createElement("span");
    enteredAnswer.className = "answer-value";
    enteredAnswer.textContent = answer;
    answerDisplay.append(enteredAnswer);
  }
  submitButton.disabled = waitingToAdvance || !isValidAnswer();
}

function isValidAnswer() {
  return answer.length > 0;
}

function enterDigit(digit) {
  if (finishIfTimeExpired() || waitingToAdvance || (mode === "timer" && roundState !== "running")) {
    return;
  }
  answer += digit;
  renderAnswer();
}

function deleteDigit() {
  if (finishIfTimeExpired() || waitingToAdvance || (mode === "timer" && roundState !== "running")) {
    return;
  }
  answer = answer.slice(0, -1);
  renderAnswer();
}

function checkAnswer() {
  if (finishIfTimeExpired() || waitingToAdvance || !isValidAnswer() || (mode === "timer" && roundState !== "running")) {
    return;
  }

  if (Number(answer) === question.table * question.factor) {
    if (mode === "timer") {
      if (incorrectAttempts === 0) {
        roundStats.firstTry += 1;
      } else {
        roundStats.retries += 1;
      }
    }
    waitingToAdvance = true;
    feedback.textContent = "Correct! Great work!";
    feedback.className = "feedback is-correct";
    keypad.querySelectorAll("button").forEach((button) => {
      button.disabled = true;
    });
    advanceTimer = window.setTimeout(() => {
      if (mode === "timer" && roundState !== "running") {
        return;
      }
      waitingToAdvance = false;
      advanceTimer = undefined;
      nextQuestion();
      keypad.querySelectorAll("button").forEach((button) => {
        button.disabled = false;
      });
      submitButton.disabled = true;
    }, 750);
    return;
  }

  incorrectAttempts += 1;
  answer = "";
  renderAnswer();
  feedback.textContent = "Not quite. Try again!";
  feedback.className = "feedback is-incorrect";
}

keypad.addEventListener("click", (event) => {
  const button = event.target instanceof Element ? event.target.closest("button") : null;
  if (!button) {
    return;
  }

  if (button.dataset.digit !== undefined) {
    enterDigit(button.dataset.digit);
  } else if (button.dataset.action === "backspace") {
    deleteDigit();
  } else if (button.id === "submit-answer") {
    checkAnswer();
  }
});

modeToggle.addEventListener("click", (event) => {
  const button = event.target instanceof Element ? event.target.closest("[data-mode]") : null;
  if (button) {
    switchMode(button.dataset.mode);
  }
});

startTimerButton.addEventListener("click", () => startRound());
tryAgainButton.addEventListener("click", tryAgain);

makeTableButtons();
questions = createQuestionPool();
showQuestion(questions.pop());
timerClock.textContent = formatTime(ROUND_DURATION_MS);
updateModeControls();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch((error) => {
      console.error("Offline support could not be enabled.", error);
    });
  });
}
