<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="robots" content="noindex, nofollow">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>{{ $exam->title }} — Composition</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
            --primary: #1E40AF;
            --primary-dark: #1E3A8A;
            --bg-page: #F5F3EF;        /* Doux parchemin crème, anti-fatigue visuelle */
            --card-bg: #FAF8F5;        /* Feuille d'examen ivoire douce */
            --header-bg: #EFECE6;      /* Barre d'en-tête reposante */
            --text-dark: #1E293B;      /* Slate sombre ultra lisible */
            --text-muted: #64748B;
            --border-color: #DCD7CE;   /* Bordures douces papier */
            --input-bg: #FFFDF9;       /* Zone de texte reposante */
            --input-border: #D1C9BC;
            --gold: #D4AF37;
            --red: #DC2626;
            --orange: #D97706;
            --green: #16A34A;
        }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: var(--bg-page);
            color: var(--text-dark);
            min-height: 100vh;
            overflow-x: hidden;
        }

        /* ═══════════ WATERMARK ═══════════ */
        .watermark {
            position: fixed;
            top: 0; left: 0; width: 100%; height: 100%;
            pointer-events: none;
            z-index: 1000;
            overflow: hidden;
            opacity: 0.025;
        }
        .watermark-text {
            position: absolute;
            font-size: 18px;
            font-weight: 700;
            color: var(--text-dark);
            transform: rotate(-30deg);
            white-space: nowrap;
            font-family: 'Inter', sans-serif;
            letter-spacing: 2px;
        }

        /* ═══════════ HEADER ═══════════ */
        .exam-header {
            position: fixed;
            top: 0; left: 0; right: 0;
            z-index: 1000;
            background: var(--header-bg);
            backdrop-filter: blur(12px);
            border-bottom: 1px solid var(--border-color);
            padding: 12px 24px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
        }

        .header-left {
            display: flex;
            align-items: center;
            gap: 12px;
            flex: 1;
            min-width: 0;
        }

        .exam-badge {
            background: #E0E7FF;
            color: var(--primary);
            font-size: 11px;
            font-weight: 700;
            padding: 4px 10px;
            border-radius: 6px;
            white-space: nowrap;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            border: 1px solid #C7D2FE;
        }

        .exam-title-header {
            font-size: 15px;
            font-weight: 700;
            color: var(--text-dark);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .header-center {
            display: flex;
            align-items: center;
            gap: 16px;
        }

        /* Timer */
        .timer-container {
            display: flex;
            align-items: center;
            gap: 8px;
            background: #FFFDF9;
            border: 1.5px solid var(--border-color);
            border-radius: 10px;
            padding: 8px 16px;
            min-width: 140px;
            justify-content: center;
        }

        .timer-container.warning {
            border-color: var(--orange);
            background: #FEF3C7;
            animation: timerPulse 1s ease-in-out infinite;
        }

        .timer-container.danger {
            border-color: var(--red);
            background: #FEF2F2;
            animation: timerPulse 0.5s ease-in-out infinite;
        }

        @keyframes timerPulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
        }

        .timer-icon { font-size: 18px; }

        .timer-value {
            font-size: 20px;
            font-weight: 700;
            font-family: 'JetBrains Mono', monospace;
            color: var(--text-dark);
            letter-spacing: 1px;
        }

        .timer-container.warning .timer-value { color: #B45309; }
        .timer-container.danger .timer-value { color: var(--red); }

        /* Tab switch indicator */
        .tab-switch-indicator {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 12px;
            color: var(--text-muted);
            background: #FFFDF9;
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 6px 12px;
        }

        .tab-switch-indicator.warn {
            border-color: var(--orange);
            color: #B45309;
        }

        .tab-switch-indicator.critical {
            border-color: var(--red);
            color: var(--red);
            animation: timerPulse 1s ease-in-out infinite;
        }

        .header-right {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .submit-btn-header {
            padding: 10px 20px;
            background: var(--primary);
            border: none;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 700;
            font-family: 'Inter', sans-serif;
            color: #FFFFFF;
            cursor: pointer;
            transition: all 0.2s;
            white-space: nowrap;
            box-shadow: 0 2px 8px rgba(30, 64, 175, 0.2);
        }

        .submit-btn-header:hover {
            background: var(--primary-dark);
        }

        .submit-btn-header:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            transform: none;
        }

        /* ═══════════ MAIN CONTENT ═══════════ */
        .exam-body {
            max-width: 880px;
            margin: 76px auto 40px auto;
            padding: 20px;
            min-height: calc(100vh - 110px);
        }

        .questions-panel {
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 16px;
            padding: 36px 32px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
        }

        .questions-panel-title {
            font-size: 13px;
            font-weight: 700;
            color: var(--primary);
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .questions-content {
            font-size: 16px;
            line-height: 1.8;
            color: var(--text-dark);
        }

        /* Zone de réponse sous chaque question */
        .inline-question-box {
            margin-top: 16px;
            margin-bottom: 28px;
            background: #EFECE6;
            border: 1.5px solid var(--border-color);
            border-radius: 12px;
            padding: 16px;
        }

        .inline-question-header {
            font-size: 13px;
            font-weight: 700;
            color: var(--primary);
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .question-response-area {
            width: 100%;
            min-height: 140px;
            padding: 14px;
            background: var(--input-bg);
            border: 1.5px solid var(--input-border);
            border-radius: 10px;
            font-size: 15px;
            font-family: 'Inter', sans-serif;
            color: var(--text-dark);
            line-height: 1.7;
            resize: vertical;
            outline: none;
            transition: all 0.2s ease;
        }

        .question-response-area:focus {
            background: #FFFFFF;
            border-color: var(--primary);
            box-shadow: 0 0 0 3px rgba(30, 64, 175, 0.1);
        }

        .submit-btn-bottom {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            width: 100%;
            padding: 16px;
            margin-top: 28px;
            background: var(--primary);
            border: none;
            border-radius: 10px;
            font-size: 16px;
            font-weight: 700;
            font-family: 'Inter', sans-serif;
            color: #FFFFFF;
            cursor: pointer;
            transition: all 0.2s;
            box-shadow: 0 4px 12px rgba(30, 64, 175, 0.2);
        }

        .submit-btn-bottom:hover {
            background: var(--primary-dark);
        }

        /* ═══════════ MODALS ═══════════ */
        .modal-overlay {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            z-index: 2000;
            background: rgba(15, 23, 42, 0.6);
            backdrop-filter: blur(4px);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s;
        }

        .modal-overlay.active {
            opacity: 1;
            pointer-events: auto;
        }

        .modal-card {
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 16px;
            padding: 32px;
            max-width: 440px;
            width: 100%;
            text-align: center;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }

        .modal-icon {
            font-size: 40px;
            margin-bottom: 16px;
        }

        .modal-title {
            font-size: 20px;
            font-weight: 700;
            color: var(--text-dark);
            margin-bottom: 12px;
        }

        .modal-text {
            font-size: 14px;
            color: var(--text-muted);
            line-height: 1.6;
            margin-bottom: 24px;
        }

        .modal-btn {
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 700;
            font-family: 'Inter', sans-serif;
            cursor: pointer;
            transition: all 0.2s;
            border: none;
            margin: 0 4px;
        }

        .modal-btn-primary {
            background: var(--primary);
            color: #FFFFFF;
        }

        .modal-btn-primary:hover {
            background: var(--primary-dark);
        }

        .modal-btn-danger {
            background: #F1F5F9;
            color: #475569;
        }

        .modal-btn-danger:hover {
            background: #E2E8F0;
        }

        /* Prompt plein écran */
        .fullscreen-prompt {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 999;
            background: var(--primary);
            color: #FFFFFF;
            padding: 10px 16px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            display: none;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        .fullscreen-prompt.visible {
            display: block;
        }
    </style>
</head>
<body>
    <!-- Filigrane anti-triche -->
    <div class="watermark" id="watermark"></div>

    <!-- En-tête de l'examen -->
    <header class="exam-header">
        <div class="header-left">
            <span class="exam-badge">Épreuve</span>
            @if(!empty($exam->classe))
                <span class="exam-badge" style="background:#D1E7DD; color:#0F5132; margin-left: 4px;">{{ $exam->classe }}</span>
            @endif
            <span class="exam-title-header" title="{{ $exam->title }}">{{ $exam->title }}</span>
        </div>

        <div class="header-center">
            <div class="timer-container" id="timerContainer">
                <span class="timer-icon">⏱️</span>
                <span class="timer-value" id="timerDisplay">--:--</span>
            </div>

            <div class="tab-switch-indicator" id="tabSwitchIndicator">
                <span id="tabSwitchText">Sorties : 0/{{ $exam->settings['max_tab_switches'] ?? 2 }}</span>
            </div>
        </div>

        <div class="header-right">
            <button class="submit-btn-header" id="submitBtn" onclick="confirmSubmit()">
                ✅ Soumettre
            </button>
        </div>
    </header>

    <!-- Corps de l'examen -->
    <main class="exam-body">
        <!-- Panneau des questions avec zones de réponse intégrées -->
        <section class="questions-panel">
            <div class="questions-panel-title">
                <span>📋</span> Énoncé de l'épreuve & Réponses
            </div>
            <div class="questions-content" id="questionsContent">
                {!! $content_html !!}
            </div>

            <button class="submit-btn-bottom" onclick="confirmSubmit()">
                ✅ Terminer et Soumettre ma copie
            </button>
        </section>
    </main>

    <!-- Modal de confirmation de soumission -->
    <div class="modal-overlay" id="confirmModal">
        <div class="modal-card">
            <div class="modal-icon">📤</div>
            <div class="modal-title">Soumettre votre copie ?</div>
            <div class="modal-text">
                Une fois soumise, vous ne pourrez plus modifier vos réponses.
                Assurez-vous d'avoir répondu à toutes les questions.
            </div>
            <button class="modal-btn modal-btn-danger" onclick="closeModal('confirmModal')">Annuler</button>
            <button class="modal-btn modal-btn-primary" onclick="doSubmit(false)">Confirmer</button>
        </div>
    </div>

    <!-- Modal d'avertissement de sortie d'écran -->
    <div class="modal-overlay" id="tabWarningModal">
        <div class="modal-card">
            <div class="modal-icon">⚠️</div>
            <div class="modal-title" id="tabWarningTitle">Attention !</div>
            <div class="modal-text" id="tabWarningText"></div>
            <button class="modal-btn modal-btn-primary" onclick="closeModal('tabWarningModal')">J'ai compris</button>
        </div>
    </div>

    <!-- Modal de soumission forcée -->
    <div class="modal-overlay" id="forcedSubmitModal">
        <div class="modal-card">
            <div class="modal-icon">🚫</div>
            <div class="modal-title">Épreuve terminée</div>
            <div class="modal-text" id="forcedSubmitText">
                Votre épreuve a été automatiquement soumise.
            </div>
            <button class="modal-btn modal-btn-primary" onclick="window.location.reload()">Fermer</button>
        </div>
    </div>

    <!-- Prompt plein écran -->
    <div class="fullscreen-prompt" id="fullscreenPrompt" onclick="requestFullscreen()">
        🖥️ Cliquez pour revenir en plein écran
    </div>

    <script>
    (function() {
        'use strict';

        const EXAM_TOKEN = @json($exam->token);
        const SUBMISSION_ID = {{ $submission->id }};
        const REMAINING_SECONDS = {{ $remaining }};
        const MAX_TAB_SWITCHES = {{ $exam->settings['max_tab_switches'] ?? 2 }};
        const STUDENT_NAME = @json($submission->student_name);
        const STUDENT_MATRICULE = @json($submission->student_matricule);
        const CSRF_TOKEN = document.querySelector('meta[name="csrf-token"]').content;
        const HEARTBEAT_INTERVAL = 30000;
        const AUTOSAVE_INTERVAL = 10000;

        let remainingSeconds = REMAINING_SECONDS;
        let tabSwitchCount = 0;
        let isSubmitted = false;
        let timerInterval = null;
        let heartbeatInterval = null;

        // ═══════════ WATERMARK ═══════════
        function generateWatermark() {
            const container = document.getElementById('watermark');
            const text = `${STUDENT_NAME} — ${STUDENT_MATRICULE}`;
            for (let y = 0; y < window.innerHeight + 200; y += 120) {
                for (let x = -200; x < window.innerWidth + 200; x += 350) {
                    const span = document.createElement('span');
                    span.className = 'watermark-text';
                    span.textContent = text;
                    span.style.left = x + 'px';
                    span.style.top = y + 'px';
                    container.appendChild(span);
                }
            }
        }

        // ═══════════ TIMER ═══════════
        function updateTimer() {
            if (remainingSeconds <= 0) {
                clearInterval(timerInterval);
                autoSubmit('Temps écoulé');
                return;
            }

            remainingSeconds--;

            const hours = Math.floor(remainingSeconds / 3600);
            const minutes = Math.floor((remainingSeconds % 3600) / 60);
            const seconds = remainingSeconds % 60;

            const display = document.getElementById('timerDisplay');
            const container = document.getElementById('timerContainer');

            if (hours > 0) {
                display.textContent = `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            } else {
                display.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            }

            container.classList.remove('warning', 'danger');
            if (remainingSeconds <= 60) {
                container.classList.add('danger');
            } else if (remainingSeconds <= 300) {
                container.classList.add('warning');
            }
        }

        function startTimer() {
            updateTimer();
            timerInterval = setInterval(updateTimer, 1000);
        }

        // ═══════════ INJECT RESPONSE AREAS UNDER EACH QUESTION ═══════════
        function setupInlineQuestions() {
            const container = document.getElementById('questionsContent');
            if (!container) return;

            // Détecter les questions (titres h1, h2, h3, h4, ou paragraphes/puces)
            const headings = container.querySelectorAll('h1, h2, h3, h4, p');
            let qCounter = 0;

            headings.forEach((el) => {
                const text = el.innerText.trim();
                const isHeading = el.tagName.match(/^H[1234]$/i);
                const isQuestionText = /^(question|exercice|problème|q\d+|\d+[\.\)\-])/i.test(text);

                if (isHeading || isQuestionText) {
                    qCounter++;
                    const wrapper = document.createElement('div');
                    wrapper.className = 'inline-question-box';
                    wrapper.innerHTML = `
                        <div class="inline-question-header">
                            ✍️ Réponse à la Question / Partie ${qCounter}
                        </div>
                        <textarea 
                            class="question-response-area" 
                            data-qnum="${qCounter}"
                            placeholder="Rédigez votre réponse ici..."
                        ></textarea>
                    `;

                    if (el.nextSibling) {
                        el.parentNode.insertBefore(wrapper, el.nextSibling);
                    } else {
                        el.parentNode.appendChild(wrapper);
                    }
                }
            });

            // Si aucune question individuelle détectée, fournir une zone de réponse générale sous l'énoncé
            if (qCounter === 0) {
                const wrapper = document.createElement('div');
                wrapper.className = 'inline-question-box';
                wrapper.innerHTML = `
                    <div class="inline-question-header">
                        ✍️ Rédigez votre réponse ci-dessous
                    </div>
                    <textarea 
                        class="question-response-area" 
                        data-qnum="1"
                        placeholder="Rédigez votre réponse complète ici..."
                    ></textarea>
                `;
                container.appendChild(wrapper);
            }
        }

        // ═══════════ COLLECT ANSWERS FOR SUBMISSION ═══════════
        function getCombinedAnswers() {
            const textareas = document.querySelectorAll('.question-response-area');
            let combined = '';

            textareas.forEach((area, idx) => {
                const val = area.value.trim();
                const qNum = area.getAttribute('data-qnum') || (idx + 1);
                if (val) {
                    combined += `[ QUESTION ${qNum} ]\n${val}\n\n`;
                }
            });

            return combined.trim() || "(Aucune réponse fournie)";
        }

        // ═══════════ ANTI-TRICHE: TAB SWITCHING ═══════════
        function handleVisibilityChange() {
            if (document.hidden && !isSubmitted) {
                tabSwitchCount++;
                updateTabSwitchUI();

                if (tabSwitchCount > MAX_TAB_SWITCHES) {
                    autoSubmit('Vous avez quitté l\'écran trop de fois. Votre copie a été soumise automatiquement.');
                } else {
                    const remaining = MAX_TAB_SWITCHES - tabSwitchCount;
                    showTabWarning(
                        `Sortie d'écran détectée ! (${tabSwitchCount}/${MAX_TAB_SWITCHES})`,
                        remaining > 0
                            ? `Vous avez encore ${remaining} sortie(s) autorisée(s).`
                            : `⚠️ DERNIÈRE CHANCE ! La prochaine sortie entraînera la soumission automatique.`
                    );
                }
            }
        }

        function handleWindowBlur() {
            if (!document.hidden && !isSubmitted) {
                tabSwitchCount++;
                updateTabSwitchUI();

                if (tabSwitchCount > MAX_TAB_SWITCHES) {
                    autoSubmit('Vous avez quitté l\'écran trop de fois.');
                }
            }
        }

        function updateTabSwitchUI() {
            const indicator = document.getElementById('tabSwitchIndicator');
            const text = document.getElementById('tabSwitchText');
            text.textContent = `Sorties : ${tabSwitchCount}/${MAX_TAB_SWITCHES}`;

            indicator.classList.remove('warn', 'critical');
            if (tabSwitchCount >= MAX_TAB_SWITCHES) {
                indicator.classList.add('critical');
            } else if (tabSwitchCount > 0) {
                indicator.classList.add('warn');
            }
        }

        function blockCopyPaste(e) {
            if (e.type === 'paste' && e.target.classList && e.target.classList.contains('question-response-area')) {
                return;
            }
            e.preventDefault();
            return false;
        }

        function blockContextMenu(e) {
            e.preventDefault();
            return false;
        }

        // ═══════════ SUBMIT LOGIC ═══════════
        window.confirmSubmit = function() {
            if (isSubmitted) return;
            document.getElementById('confirmModal').classList.add('active');
        };

        window.closeModal = function(id) {
            document.getElementById(id).classList.remove('active');
        };

        window.doSubmit = function(isAuto) {
            if (isSubmitted) return;
            isSubmitted = true;

            clearInterval(timerInterval);
            clearInterval(heartbeatInterval);

            const btn = document.getElementById('submitBtn');
            btn.disabled = true;
            btn.textContent = '⏳ Envoi...';

            closeModal('confirmModal');

            const answers = getCombinedAnswers();

            fetch(`/exam/${EXAM_TOKEN}/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': CSRF_TOKEN,
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    submission_id: SUBMISSION_ID,
                    answers: answers,
                    tab_switches: tabSwitchCount,
                    auto_submit: isAuto,
                }),
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    window.location.href = `/exam/${EXAM_TOKEN}?submitted=1`;
                } else {
                    alert(data.message || 'Erreur lors de la soumission.');
                    isSubmitted = false;
                    btn.disabled = false;
                    btn.textContent = '✅ Soumettre';
                }
            })
            .catch(() => {
                document.getElementById('forcedSubmitText').textContent =
                    'Votre copie a été enregistrée.';
                document.getElementById('forcedSubmitModal').classList.add('active');
            });
        };

        function autoSubmit(reason) {
            if (isSubmitted) return;
            document.getElementById('forcedSubmitText').textContent = reason;
            document.getElementById('forcedSubmitModal').classList.add('active');
            window.doSubmit(true);
        }

        function showTabWarning(title, text) {
            document.getElementById('tabWarningTitle').textContent = title;
            document.getElementById('tabWarningText').textContent = text;
            document.getElementById('tabWarningModal').classList.add('active');
        }

        // ═══════════ AUTOSAVE & RESTORE ═══════════
        function autoSave() {
            const areas = document.querySelectorAll('.question-response-area');
            const data = {};
            areas.forEach((area) => {
                data[area.id || area.getAttribute('data-qnum')] = area.value;
            });
            try {
                localStorage.setItem(`exam_answers_${SUBMISSION_ID}`, JSON.stringify(data));
            } catch(e) {}
        }

        function restoreAutoSave() {
            try {
                const saved = localStorage.getItem(`exam_answers_${SUBMISSION_ID}`);
                if (saved) {
                    const data = JSON.parse(saved);
                    const areas = document.querySelectorAll('.question-response-area');
                    areas.forEach((area) => {
                        const key = area.id || area.getAttribute('data-qnum');
                        if (data[key]) {
                            area.value = data[key];
                        }
                    });
                }
            } catch(e) {}
        }

        // ═══════════ INIT ═══════════
        function init() {
            generateWatermark();
            setupInlineQuestions();
            restoreAutoSave();
            startTimer();

            document.addEventListener('visibilitychange', handleVisibilityChange);
            window.addEventListener('blur', handleWindowBlur);
            document.addEventListener('copy', blockCopyPaste);
            document.addEventListener('cut', blockCopyPaste);
            document.addEventListener('contextmenu', blockContextMenu);

            setInterval(autoSave, AUTOSAVE_INTERVAL);
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
        } else {
            init();
        }
    })();
    </script>
</body>
</html>
