/*
 * Quiz logic for the LearnGreek.eu multi‑page quiz
 *
 * Each quiz page uses this script to handle option selection,
 * voice recording for answer input and evaluation of responses.
 * It also manages scoring via localStorage so the user can
 * navigate between questions without losing their progress.
 */

// Speak a given word using the Web Speech API. Fallback to alert if not supported.
function speakWord(word, lang) {
    if (!('speechSynthesis' in window)) {
        alert('Sprachausgabe wird von Ihrem Browser nicht unterstützt.');
        return;
    }
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = lang || 'el-GR';
    window.speechSynthesis.speak(utterance);
}

// Initialise click handlers on all quiz options. When an option is clicked
// it becomes selected and other options in the same container are deselected.
function initOptionHandlers() {
    const containers = document.querySelectorAll('.options');
    containers.forEach(container => {
        const opts = container.querySelectorAll('.quiz-option');
        opts.forEach(opt => {
            opt.addEventListener('click', function() {
                // Deselect all options in this container
                opts.forEach(o => o.classList.remove('selected'));
                // Mark this option as selected
                this.classList.add('selected');
                // Store selected value on container
                container.dataset.selected = this.dataset.value;
            });
        });
    });
}

// Retrieve overall quiz score from localStorage.
function getScore() {
    return Number(localStorage.getItem('quizScore') || 0);
}

// Update overall quiz score in localStorage.
function setScore(val) {
    localStorage.setItem('quizScore', val);
}

// Set a particular question's score and adjust the total accordingly.
function setQuestionScore(qid, score) {
    const key = 'q' + qid + 'score';
    const prev = Number(localStorage.getItem(key) || 0);
    let total = getScore();
    total -= prev;
    total += score;
    localStorage.setItem(key, score);
    setScore(total);
}

// Clear all quiz state
function resetQuiz() {
    localStorage.clear();
}

// Generic evaluation for questions using clickable options.
// selector: CSS selector for each row container (e.g., '.q1-row')
// qid: question identifier (string)
// maxPoints: total number of items in this question
function evaluateOptions(selector, qid, maxPoints) {
    let correctCount = 0;
    const rows = document.querySelectorAll(selector);
    rows.forEach(row => {
        const correctAnswer = row.dataset.answer;
        const selectedValue = row.dataset.selected || '';
        let attempts = parseInt(row.dataset.attempts || '0');
        const smiley = row.querySelector('.smiley');
        // Determine if correct
        if (selectedValue === correctAnswer) {
            correctCount += 1;
            // Mark selected option as correct
            const opts = row.querySelectorAll('.quiz-option');
            opts.forEach(opt => {
                // Remove previous states
                opt.classList.remove('correct', 'incorrect');
                if (opt.classList.contains('selected')) {
                    opt.classList.add('correct');
                }
            });
            // Show smiley and apply colour
            if (smiley) {
                smiley.textContent = '😊';
                smiley.classList.add('correct');
                smiley.classList.remove('incorrect');
            }
        } else {
            // Wrong selection
            attempts += 1;
            row.dataset.attempts = attempts;
            const opts = row.querySelectorAll('.quiz-option');
            opts.forEach(opt => {
                opt.classList.remove('correct', 'incorrect');
                if (opt.classList.contains('selected')) {
                    opt.classList.add('incorrect');
                }
            });
            // Show smiley and apply colour
            if (smiley) {
                smiley.textContent = '😕';
                smiley.classList.add('incorrect');
                smiley.classList.remove('correct');
            }
            // Reveal correct answer after two wrong attempts
            if (attempts >= 2) {
                const hint = row.querySelector('.hint');
                if (hint) {
                    hint.textContent = 'Richtig: ' + correctAnswer;
                    hint.classList.remove('hidden');
                }
            }
        }
    });
    setQuestionScore(qid, correctCount);
    // Provide user feedback
    alert('Frage ' + qid + ' bewertet! Du hast ' + correctCount + ' von ' + maxPoints + ' Punkten erreicht.');
}

// Voice recognition for typed answers in question 4.
// This function records speech and fills the associated input field.
let globalRecognition;
// Track whether we have already requested microphone permission
let micPermissionAsked = false;
function startRecording(rowId) {
    const row = document.getElementById(rowId);
    if (!row) return;
    const input = row.querySelector('input');
    const recordBtn = row.querySelector('.record-btn');
    // If speech recognition is not supported
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
        alert('Spracherkennung wird von Ihrem Browser nicht unterstützt.');
        return;
    }
    // Disable the record button during recording
    recordBtn.classList.add('disabled');
    recordBtn.textContent = 'Aufnahme...';

    // Helper to actually start recognition after permission is ensured
    const runRecognition = () => {
        // Stop any previous recognition
        if (globalRecognition) {
            globalRecognition.abort();
        }
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = 'de-DE';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        recognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript.trim();
            input.value = transcript;
            // After capturing, attempt to evaluate this row only
            evaluateQ4Row(rowId);
        };
        recognition.onerror = function(event) {
            console.error('Speech recognition error:', event.error);
        };
        recognition.onend = function() {
            // Re-enable the record button
            recordBtn.classList.remove('disabled');
            recordBtn.textContent = 'Aufsprechen';
        };
        globalRecognition = recognition;
        recognition.start();
    };

    // Only ask for microphone permission once when first recording
    if (!micPermissionAsked && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        micPermissionAsked = true;
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                // Immediately stop the stream as we only need permission
                stream.getTracks().forEach(track => track.stop());
                // Now run recognition
                runRecognition();
            })
            .catch(err => {
                console.warn('Mikrofonberechtigung wurde nicht erteilt:', err);
                // Re-enable button even if permission denied
                recordBtn.classList.remove('disabled');
                recordBtn.textContent = 'Aufsprechen';
            });
    } else {
        // Permission already granted or cannot request, proceed immediately
        runRecognition();
    }
}

// Evaluate a single row in question 4 (culture words). Compares typed input
// against synonyms, updates attempts, shows hints and smileys.
function evaluateQ4Row(rowId) {
    const row = document.getElementById(rowId);
    if (!row) return;
    const input = row.querySelector('input');
    const synonyms = row.dataset.answer.toLowerCase().split('|');
    let attempts = parseInt(row.dataset.attempts || '0');
    const smiley = row.querySelector('.smiley');
    const hint = row.querySelector('.hint');
    const val = input.value.trim().toLowerCase();
    const matched = synonyms.some(ans => val === ans || val.includes(ans));
    if (matched) {
        // Correct
        smiley.textContent = '😊';
        smiley.classList.add('correct');
        smiley.classList.remove('incorrect');
        input.classList.remove('incorrect');
        input.classList.add('correct');
    } else {
        // Wrong
        attempts += 1;
        row.dataset.attempts = attempts;
        smiley.textContent = '😕';
        smiley.classList.add('incorrect');
        smiley.classList.remove('correct');
        input.classList.remove('correct');
        input.classList.add('incorrect');
        if (attempts >= 2) {
            hint.textContent = 'Richtig: ' + synonyms[0].charAt(0).toUpperCase() + synonyms[0].slice(1);
            hint.classList.remove('hidden');
        }
    }
}

// Evaluate entire question 4 across all rows
function evaluateQ4() {
    let correctCount = 0;
    const rows = document.querySelectorAll('.q4-row');
    rows.forEach(row => {
        const input = row.querySelector('input');
        const synonyms = row.dataset.answer.toLowerCase().split('|');
        let attempts = parseInt(row.dataset.attempts || '0');
        const val = input.value.trim().toLowerCase();
        const smiley = row.querySelector('.smiley');
        const hint = row.querySelector('.hint');
        const matched = synonyms.some(ans => val === ans || val.includes(ans));
        if (matched) {
            correctCount += 1;
            smiley.textContent = '😊';
            smiley.classList.add('correct');
            smiley.classList.remove('incorrect');
            input.classList.add('correct');
            input.classList.remove('incorrect');
        } else {
            attempts += 1;
            row.dataset.attempts = attempts;
            smiley.textContent = '😕';
            smiley.classList.add('incorrect');
            smiley.classList.remove('correct');
            input.classList.add('incorrect');
            input.classList.remove('correct');
            if (attempts >= 2) {
                hint.textContent = 'Richtig: ' + synonyms[0].charAt(0).toUpperCase() + synonyms[0].slice(1);
                hint.classList.remove('hidden');
            }
        }
    });
    setQuestionScore('4', correctCount);
    alert('Frage 4 bewertet! Du hast ' + correctCount + ' von ' + rows.length + ' Punkten erreicht.');
}

// Render results page
function renderResults() {
    const totalPossible = 55;
    const score = getScore();
    const percentage = totalPossible ? Math.round((score / totalPossible) * 100) : 0;
    const smileyEl = document.getElementById('smiley');
    const messageEl = document.getElementById('message');
    const resultSummary = document.getElementById('result-summary');
    const passed = percentage >= 50;
    smileyEl.textContent = passed ? '😊' : '😕';
    messageEl.innerHTML = passed ?
        '<h2 class="text-2xl font-semibold mb-2">Du hast es geschafft!</h2><p class="text-gray-600">Super! Weiter so auf deinem Weg zum Griechisch‑Profi.</p>' :
        '<h2 class="text-2xl font-semibold mb-2">Du kannst es besser!</h2><p class="text-gray-600">Übe weiter und versuche es noch einmal.</p>';
    resultSummary.innerHTML = '<p class="mb-4">Dein Ergebnis: <strong>' + score + ' von ' + totalPossible + ' Punkten (' + percentage + '%)</strong></p>';
    let tableHtml = '<table class="quiz-table"><thead><tr><th>Frage</th><th>Punkte</th></tr></thead><tbody>';
    const totals = [12,6,10,7,7,6,7];
    for (let i = 1; i <= 7; i++) {
        const qScore = Number(localStorage.getItem('q' + i + 'score') || 0);
        tableHtml += '<tr><td>' + i + '</td><td>' + qScore + ' / ' + totals[i-1] + '</td></tr>';
    }
    tableHtml += '</tbody></table>';
    resultSummary.innerHTML += tableHtml;
}

// Initialise options on page load
document.addEventListener('DOMContentLoaded', function() {
    initOptionHandlers();
    // Do not request microphone permission globally. Permission will be
    // requested on demand within startRecording() when the user clicks
    // a record button on question 4. This prevents repeated prompts
    // outside of q4.
});