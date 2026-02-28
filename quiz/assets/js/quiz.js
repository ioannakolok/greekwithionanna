/*
 * Quiz logic for the LearnGreek.eu multi‑page quiz
 *
 * Each quiz page uses this script to handle option selection,
 * voice recording for answer input and evaluation of responses.
 * It also manages scoring via localStorage so the user can
 * navigate between questions without losing their progress.
 */

// Speak a given word using the Web Speech API. Fallback to alert if not supported.
/**
 * Speak a given word using the Web Speech API.
 *
 * This helper attempts to select a Greek voice where available so the
 * pronunciation sounds as natural as possible. Many browsers ship with
 * multiple voices; by iterating through the available voices we can pick
 * one whose language starts with "el" (Greek). If no Greek voice is
 * installed, we fall back to whatever default voice the browser chooses.
 *
 * @param {string} word The Greek word to speak
 * @param {string} [lang] Optional BCP‑47 language tag. Defaults to Greek
 */
/**
 * Speak a given Greek word or phrase using the Web Speech API.
 *
 * This implementation attempts to replicate the natural sound of Google
 * Translate’s Greek accent by choosing a voice whose language is Greek
 * ("el") and whose name contains "Google", if available. If no such
 * voice exists on the client, it falls back to any Greek voice; failing
 * that, it tries a German voice to avoid an American accent. Finally it
 * relies on the browser default voice. The utterance’s language is
 * explicitly set to Greek to help the speech engine choose the correct
 * pronunciation based on the word itself rather than a phonetic hint.
 *
 * @param {string} word The Greek word or phrase to pronounce
 * @param {string} [lang] Optional language tag
 */
function speakWord(word, lang) {
    // Fallback alert if speech synthesis is not supported
    if (!('speechSynthesis' in window)) {
        alert('Sprachausgabe wird von Ihrem Browser nicht unterstützt.');
        return;
    }
    // Cancel any previous utterances immediately to reset the engine.  In
    // some desktop browsers, queued utterances can block new requests
    // until they finish, so clearing the queue helps guarantee our
    // utterance plays.
    const synth = window.speechSynthesis;
    synth.cancel();

    // Helper that actually performs the speech.  It fetches the list
    // of voices at the moment it is called, selects a suitable
    // candidate if available, and then invokes speak().  A
    // try‑catch guard is used because some browsers throw if you
    // assign a voice that isn’t fully loaded.
    const doSpeak = () => {
        const voices = synth.getVoices();
        const utterance = new SpeechSynthesisUtterance(word);
        // Explicitly set the language to modern Greek to influence
        // pronunciation.  Chrome and other browsers will fall back to
        // an installed voice that can handle this language.
        utterance.lang = lang || 'el-GR';
        // Use a slightly slower rate and neutral pitch for a more
        // natural sound.  These values can be tweaked as needed.
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        // Attempt to choose a Greek voice if one is installed on the
        // client.  If none is available, we simply let the browser
        // decide; explicitly assigning a non‑existent voice can
        // prevent playback on some systems, so we only assign if
        // found.
        const greekVoice = voices.find(v => v.lang && v.lang.toLowerCase().startsWith('el'));
        if (greekVoice) {
            try {
                utterance.voice = greekVoice;
            } catch (e) {
                // Silently ignore assignment errors – the browser will
                // choose a fallback voice instead.
            }
        }
        synth.speak(utterance);
    };
    // If voices are already available, speak immediately.  Otherwise
    // register a one‑time listener to wait for the voices list to
    // populate.  After speaking, remove the listener to avoid
    // multiple invocations.
    if (synth.getVoices().length > 0) {
        doSpeak();
    } else {
        synth.onvoiceschanged = function handleVoices() {
            doSpeak();
            // remove the handler after first invocation
            synth.onvoiceschanged = null;
        };
    }
}

/**
 * Play a simple tone to represent the sound of a Greek instrument. Since
 * obtaining royalty‑free recordings for each instrument is not always
 * possible in a self‑contained quiz, this function generates a short
 * sine‑wave tone at a unique frequency for each instrument. Users can
 * still differentiate between instruments by the varying pitch, and the
 * implementation works offline on both desktop and mobile devices.
 *
 * @param {string} instrument Greek name of the instrument (e.g. "μπουζούκι")
 */
function playInstrument(instrument) {
    // Map each instrument to a distinct frequency in Hz
    const freqMap = {
        'μπουζούκι': 440,   // A4
        'κλαρίνο':   523.25, // C5
        'λύρα':     392,   // G4
        'ντέφι':    329.63, // E4
        'νταούλι':  196,   // G3 (lower pitch for drum)
        'σαντούρι': 587.33 // D5
    };
    const freq = freqMap[instrument] || 440;
    // Create an audio context for synthesising tones
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(freq, ctx.currentTime);
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    // Set the volume to a comfortable level
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    oscillator.start();
    // Stop after 1 second
    oscillator.stop(ctx.currentTime + 1);
    // Clean up the audio context when finished to release resources
    oscillator.onended = () => ctx.close();
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
function evaluateOptions(selector, qid, maxPoints, silent) {
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
    // Provide user feedback if not in silent mode
    if (!silent) {
        alert('Frage ' + qid + ' bewertet! Du hast ' + correctCount + ' von ' + maxPoints + ' Punkten erreicht.');
    }
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
function evaluateQ4(silent) {
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
    // Show feedback unless in silent mode
    if (!silent) {
        alert('Frage 4 bewertet! Du hast ' + correctCount + ' von ' + rows.length + ' Punkten erreicht.');
    }
}

// Render results page
function renderResults() {
    // Only include scored questions in the final result. The quiz consists of
    // eight pages, but questions 5 and 8 are for fun or practice and do not
    // contribute to the score. Define an array of scored question IDs and
    // their maximum points. This allows us to skip q5 and q8 when
    // calculating totals and displaying the summary table.
    const scoredQuestions = [
        { id: 1, max: 8 },
        { id: 2, max: 6 },
        { id: 3, max: 6 },
        { id: 4, max: 12 },
        { id: 6, max: 7 },
        { id: 7, max: 6 }
    ];
    // Calculate total possible points and the user's total score across these
    // scored questions.
    const totalPossible = scoredQuestions.reduce((sum, q) => sum + q.max, 0);
    let totalScore = 0;
    scoredQuestions.forEach(q => {
        const qScore = Number(localStorage.getItem('q' + q.id + 'score') || 0);
        totalScore += qScore;
    });
    const percentage = totalPossible ? Math.round((totalScore / totalPossible) * 100) : 0;
    const smileyEl = document.getElementById('smiley');
    const messageEl = document.getElementById('message');
    const resultSummary = document.getElementById('result-summary');
    const passed = percentage >= 50;
    smileyEl.textContent = passed ? '😊' : '😕';
    messageEl.innerHTML = passed ?
        '<h2 class="text-2xl font-semibold mb-2">Du hast es geschafft!</h2><p class="text-gray-600">Super! Weiter so auf deinem Weg zum Griechisch‑Profi.</p>' :
        '<h2 class="text-2xl font-semibold mb-2">Du kannst es besser!</h2><p class="text-gray-600">Übe weiter und versuche es noch einmal.</p>';
    resultSummary.innerHTML = '<p class="mb-4">Dein Ergebnis: <strong>' + totalScore + ' von ' + totalPossible + ' Punkten (' + percentage + '%)</strong></p>';
    let tableHtml = '<table class="quiz-table"><thead><tr><th>Frage</th><th>Punkte</th></tr></thead><tbody>';
    // Build a row for each scored question.
    scoredQuestions.forEach((qObj, idx) => {
        const qScore = Number(localStorage.getItem('q' + qObj.id + 'score') || 0);
        // Display the question number as its position in the scored sequence (1–6)
        tableHtml += '<tr><td>' + (idx + 1) + '</td><td>' + qScore + ' / ' + qObj.max + '</td></tr>';
    });
    tableHtml += '</tbody></table>';
    resultSummary.innerHTML += tableHtml;
    // Display number of correct and incorrect answers across scored questions
    const wrongCount = totalPossible - totalScore;
    resultSummary.innerHTML += '<p class="mt-4">Du hast <strong>' + totalScore + '</strong> richtige Antworten und <strong>' + wrongCount + '</strong> falsche Antworten.</p>';
    // Mark the current session as completed and record the score exactly once
    if (!sessionStorage.getItem('quizCompleted')) {
        if (typeof completeQuizSession === 'function') {
            completeQuizSession(totalScore);
        }
        sessionStorage.setItem('quizCompleted', '1');
    }
}

/**
 * Record a user's score into localStorage for admin statistics. This function
 * retrieves or initialises an object called `quizStats` stored in
 * localStorage, increments the number of users and stores the score with
 * a timestamp. Because localStorage is scoped to a single browser, this
 * feature provides per-device analytics. An admin can view these stats via
 * admin.html.
 *
 * @param {number} score The total points the user achieved
 */
function recordQuizStats(score) {
    const key = 'quizStats';
    let stats;
    try {
        stats = JSON.parse(localStorage.getItem(key) || '{}');
    } catch (e) {
        stats = {};
    }
    if (typeof stats !== 'object' || stats === null) stats = {};
    stats.numUsers = (stats.numUsers || 0) + 1;
    if (!Array.isArray(stats.results)) stats.results = [];
    stats.results.push({ score: score, timestamp: Date.now() });
    localStorage.setItem(key, JSON.stringify(stats));
}

/**
 * Start a new quiz session for tracking purposes. This records an entry in
 * the admin statistics as soon as a user begins the quiz (i.e. when
 * question 1 is loaded). Each entry begins as incomplete with a
 * score of 0. The index of this new attempt is stored in
 * sessionStorage under the key `quizAttemptId` so that it can be
 * updated later upon completion. If an attempt is already
 * registered in this session, this function does nothing.
 */
function startQuizSession() {
    // Avoid starting multiple sessions in the same browser tab
    if (sessionStorage.getItem('quizAttemptId')) return;
    let stats;
    try {
        stats = JSON.parse(localStorage.getItem('quizStats') || '{}');
    } catch (e) {
        stats = {};
    }
    if (!stats || typeof stats !== 'object') stats = {};
    if (!Array.isArray(stats.results)) stats.results = [];
    // Create a new attempt with default values
    const attempt = {
        timestamp: Date.now(),
        complete: false,
        score: 0
    };
    stats.results.push(attempt);
    // Increment total attempts/users count
    stats.numUsers = (stats.numUsers || 0) + 1;
    localStorage.setItem('quizStats', JSON.stringify(stats));
    // Store this attempt index in sessionStorage for later update
    sessionStorage.setItem('quizAttemptId', String(stats.results.length - 1));
}

/**
 * Mark the current quiz session as completed and update its score. When the
 * user reaches the results page, this function updates the attempt
 * recorded in `startQuizSession()` with the final score and sets its
 * `complete` flag to true. It then clears the sessionStorage flag so
 * that refreshing the results page does not overwrite the same
 * attempt again.
 *
 * @param {number} score The total score achieved by the user
 */
function completeQuizSession(score) {
    const idStr = sessionStorage.getItem('quizAttemptId');
    if (idStr === null) return;
    const idx = parseInt(idStr, 10);
    let stats;
    try {
        stats = JSON.parse(localStorage.getItem('quizStats') || '{}');
    } catch (e) {
        stats = {};
    }
    if (!stats || typeof stats !== 'object' || !Array.isArray(stats.results)) {
        // Nothing to update
        sessionStorage.removeItem('quizAttemptId');
        return;
    }
    const attempt = stats.results[idx];
    if (attempt) {
        attempt.complete = true;
        attempt.score = score;
        stats.results[idx] = attempt;
        localStorage.setItem('quizStats', JSON.stringify(stats));
    }
    // Prevent further updates on refresh
    sessionStorage.removeItem('quizAttemptId');
}

/**
 * Render the admin statistics on admin.html. Reads the aggregated stats
 * from localStorage and displays the number of users, average score and
 * a list of individual results with dates. If no data exists, displays
 * a friendly message. Called on page load of admin.html.
 */
function renderAdminStats() {
    const container = document.getElementById('admin-stats');
    if (!container) return;
    let stats;
    try {
        stats = JSON.parse(localStorage.getItem('quizStats') || '{}');
    } catch (e) {
        stats = {};
    }
    // If there are no recorded attempts, show a friendly message
    if (!stats || !stats.results || !Array.isArray(stats.results) || stats.results.length === 0) {
        container.innerHTML = '<p>Noch keine Ergebnisse vorhanden.</p>';
        return;
    }
    const attempts = stats.results;
    const totalAttempts = attempts.length;
    const completedAttempts = attempts.filter(r => r.complete).length;
    const partialAttempts = totalAttempts - completedAttempts;
    const totalPoints = attempts.reduce((sum, r) => sum + (r.score || 0), 0);
    const avgScore = completedAttempts > 0 ? (totalPoints / completedAttempts).toFixed(2) : '0';
    let html = '';
    html += '<h2 class="text-2xl font-semibold mb-4">Admin Statistik</h2>';
    html += '<p class="mb-2">Gesamtanzahl der gestarteten Quizzen: <strong>' + totalAttempts + '</strong></p>';
    html += '<p class="mb-2">Davon vollständig abgeschlossen: <strong>' + completedAttempts + '</strong></p>';
    html += '<p class="mb-2">Davon vorzeitig beendet (Teilnehmer haben das Quiz nicht beendet): <strong>' + partialAttempts + '</strong></p>';
    html += '<p class="mb-2">Durchschnittliche Punktzahl (nur vollständige Tests): <strong>' + avgScore + '</strong></p>';
    html += '<h3 class="text-xl font-semibold mt-4 mb-2">Einzelergebnisse</h3>';
    html += '<table class="quiz-table"><thead><tr><th>#</th><th>Punkte</th><th>Status</th><th>Datum</th></tr></thead><tbody>';
    attempts.forEach((res, idx) => {
        const d = new Date(res.timestamp);
        const status = res.complete ? 'vollständig' : 'unvollständig';
        const scoreStr = res.complete ? (res.score + '') : '-';
        html += '<tr><td>' + (idx + 1) + '</td><td>' + scoreStr + '</td><td>' + status + '</td><td>' + d.toLocaleString() + '</td></tr>';
    });
    html += '</tbody></table>';
    container.innerHTML = html;
}

// Initialise options on page load
document.addEventListener('DOMContentLoaded', function() {
    initOptionHandlers();
    // Start a quiz session when any quiz page loads. This ensures that
    // participants are counted even if they do not complete the quiz.
    if (typeof startQuizSession === 'function') {
        startQuizSession();
    }
    // Do not request microphone permission globally. Permission will be
    // requested on demand within startRecording() when the user clicks
    // a record button on question 4. This prevents repeated prompts
    // outside of q4.
});