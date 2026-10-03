# Times Tables Practice App

## Purpose

A simple, touch-friendly web app for practicing multiplication facts. The app works offline after its first successful online load and does not save practice results.

## Learner Experience

1. On opening the app, only table 5 is selected and a question is ready.
2. A row of toggles for tables 1–12 remains visible across the top. The learner can select any combination, with at least one table selected at all times.
3. The learner sees one multiplication equation at a time, such as `3 × 4`, and enters the answer using a custom on-screen number pad. Changing the selected tables clears the current answer entry and immediately shows a different question from the updated selection.
4. On a correct answer, show brief positive feedback and automatically present the next question.
5. On an incorrect answer, show clear feedback, keep the same question, and allow another attempt. Do not reveal the correct answer.
6. Practice continues until the learner leaves or changes the selected tables; there is no score or results screen.

## Question Generation

- Each selected table produces facts from `n × 1` through `n × 12`.
- Shuffle the available facts and present each once before reshuffling for another pass.
- When the table selection changes, immediately show a new question from the updated selection and apply the new selection to upcoming questions.
- Do not persist question progress or selected tables between visits.

## Answer Entry

- Use a custom keypad so the device keyboard does not cover the question.
- Include large digit buttons (`0`–`9`), backspace, and submit controls sized for touch use on an iPad.
- Accept answers from 1 to 144. Do not submit an empty answer.
- Clear the entry after an incorrect attempt so the learner can try again.

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
- A learner can change the selected tables at any time; the current question is replaced with one from the updated selection.
- Questions cover factors 1–12 for the selected tables, appear in shuffled order, and continue in new shuffled passes.
- Correct answers advance automatically after visible feedback; incorrect answers allow another attempt on the same question without revealing the answer.
- Answers can be entered and submitted entirely with the custom keypad.
- After an initial online load, the app can be reopened and used without a network connection.
- No scores, history, or other practice results are stored.