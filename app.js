const tableOptions = document.querySelector("#table-options");
const equation = document.querySelector("#equation");
const feedback = document.querySelector("#feedback");
const answerDisplay = document.querySelector("#answer-display");
const keypad = document.querySelector("#keypad");
const submitButton = document.querySelector("#submit-answer");

let selectedTables = new Set([5]);
let answer = "";
let question;
let questions = [];
let waitingToAdvance = false;
let advanceTimer;

function shuffle(items) {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [items[index], items[swapIndex]] = [items[swapIndex], items[index]];
  }
  return items;
}

function createQuestionPool() {
  const pool = [];
  for (const table of selectedTables) {
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
  if (selectedTables.has(table) && selectedTables.size === 1) {
    feedback.textContent = "Keep at least one table selected.";
    feedback.className = "feedback";
    return;
  }

  if (selectedTables.has(table)) {
    selectedTables.delete(table);
  } else {
    selectedTables.add(table);
  }

  button.setAttribute("aria-pressed", String(selectedTables.has(table)));
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

function showQuestion(nextQuestion) {
  question = nextQuestion;
  equation.textContent = `${question.table} × ${question.factor}`;
  answer = "";
  renderAnswer();
  feedback.textContent = "";
  feedback.className = "feedback";
}

function nextQuestion() {
  if (questions.length === 0) {
    questions = createQuestionPool().filter((item) => !sameQuestion(item, question));
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
  if (waitingToAdvance) {
    return;
  }
  answer += digit;
  renderAnswer();
}

function deleteDigit() {
  if (waitingToAdvance) {
    return;
  }
  answer = answer.slice(0, -1);
  renderAnswer();
}

function checkAnswer() {
  if (waitingToAdvance || !isValidAnswer()) {
    return;
  }

  if (Number(answer) === question.table * question.factor) {
    waitingToAdvance = true;
    feedback.textContent = "Correct! Great work!";
    feedback.className = "feedback is-correct";
    keypad.querySelectorAll("button").forEach((button) => {
      button.disabled = true;
    });
    advanceTimer = window.setTimeout(() => {
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

  answer = "";
  renderAnswer();
  feedback.textContent = "Not quite. Try again!";
  feedback.className = "feedback is-incorrect";
}

keypad.addEventListener("click", (event) => {
  const button = event.target.closest("button");
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

makeTableButtons();
questions = createQuestionPool();
showQuestion(questions.pop());

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch((error) => {
      console.error("Offline support could not be enabled.", error);
    });
  });
}
