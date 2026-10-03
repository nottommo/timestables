# Times Tables Practice App

## Purpose

A simple, touch-friendly web app for practicing multiplication facts. The app works offline after its first successful online load and does not save practice results.

## Learner Experience

1. On opening the app, Freestyle is selected, only table 5 is selected, and a question is ready.
2. A mode toggle near the top lets the learner choose Freestyle or Timer. The table toggles for tables 1–12 remain visible, and at least one table must be selected at all times.
3. Freestyle preserves the current behavior: the learner sees one multiplication equation at a time, such as `3 × 4`, and enters the answer using a custom on-screen number pad. Changing the selected tables clears the current answer entry and immediately shows a different question from the updated selection.
4. Timer mode is a three-minute round. The learner selects tables as usual, then starts the round explicitly. Starting locks the selected tables for the duration of the round.
5. In either mode, a correct answer gets brief positive feedback and automatically presents the next question. An incorrect answer gets clear feedback, keeps the same question, and allows another attempt without revealing the correct answer.
6. Freestyle practice continues until the learner leaves or changes the selected tables; it has no score or results screen. Timer mode ends automatically after three minutes and displays a results summary.
7. Timer results show the number of correctly answered questions on the first attempt and the number answered correctly after one or more incorrect attempts. They also show the average seconds per correctly answered question, calculated as the full 180-second round divided by the total number of correct answers and rounded to the nearest 0.5 second. If no answers were correct, show that the average is unavailable.
8. On the results screen, the learner can change the selected tables for the next round without losing the current results. “Try again” starts a fresh round using the current table selection. The mode toggle remains at the top for switching back to Freestyle.

## Question Generation

- Each selected table produces facts from `n × 1` through `n × 12`.
- Shuffle the available facts and present each once before reshuffling for another pass.
- In Freestyle, when the table selection changes, immediately show a new question from the updated selection and apply the new selection to upcoming questions.
- In Timer mode, use the selection captured when the round starts for all questions in that round.
- Do not persist question progress or selected tables between visits.

## Answer Entry

- Use a custom keypad so the device keyboard does not cover the question.
- Include large digit buttons (`0`–`9`), backspace, and submit controls sized for touch use on an iPad.
- Accept answers from 1 to 144. Do not submit an empty answer.
- Clear the entry after an incorrect attempt so the learner can try again.

## Timer Mode

- The round lasts exactly three minutes; the duration is hard-coded for now.
- Provide a visible countdown and an explicit action to start the round after table selection.
- Lock the table selection once the round starts. Stop accepting answers when the countdown reaches zero and show the results.
- Count each question answered correctly once. A correct answer is a first-attempt success if that question had no earlier incorrect attempts; otherwise it is a retry success.
- Calculate average seconds per sum as `180 seconds ÷ total correct answers`, including both first-attempt and retry successes. Round to the nearest 0.5 second.
- Table selection is locked during a round but can be changed on the results screen without clearing those results.
- “Try again” starts a fresh round with the currently selected tables and resets the timer and results. The mode toggle at the top switches back to Freestyle.
- Timer results and progress are temporary and are not persisted.

## Offline and Data

- Cache the app shell and required assets so the app can be reopened and used offline after the first successful online load.
- No account, server-side practice logic, analytics, or result/history storage is required.
- Practice state is temporary and may be lost when the page is closed or reloaded.

## Quality Requirements

- Make the question, answer entry, and feedback easy to see and use on iPad in portrait and landscape orientations.
- Provide feedback with text and visual styling, not color alone.
- Keep the layout usable on other common screen sizes.
- Make the selected state of each table toggle clear and accessible to touch and assistive technology.

## Acceptance Criteria

- The app opens with only table 5 selected.
- Freestyle is the default mode and retains the existing untimed behavior.
- The learner can switch between Freestyle and Timer, and Timer mode offers a three-minute countdown that starts explicitly.
- Starting a timed round locks the selected tables until the round ends.
- When time expires, the app stops accepting answers and reports first-attempt correct answers, retry correct answers, and the average seconds per correct answer rounded to the nearest 0.5 second (or unavailable when there are no correct answers).
- Timer results offer a fresh round with the current selection; the learner can change tables before trying again, and the top mode toggle switches back to Freestyle.
- In Freestyle, a learner can change the selected tables at any time; the current question is replaced with one from the updated selection. In Timer mode, the selection can be changed before a round or on the results screen, and is locked while the round is running.
- Questions cover factors 1–12 for the selected tables, appear in shuffled order, and continue in new shuffled passes.
- Correct answers advance automatically after visible feedback; incorrect answers allow another attempt on the same question without revealing the answer.
- Answers can be entered and submitted entirely with the custom keypad.
- After an initial online load, the app can be reopened and used without a network connection.
- No scores, history, or other practice results are stored.