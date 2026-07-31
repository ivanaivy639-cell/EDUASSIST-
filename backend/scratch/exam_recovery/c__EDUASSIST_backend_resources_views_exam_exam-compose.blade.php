<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="robots" content="noindex, nofollow">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>{{ $exam->title }} — Composition</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
            --gold: #D4AF37;
            --gold-dim: rgba(212, 175, 55, 0.15);
            --gold-glow: rgba(212, 175, 55, 0.3);
            --dark: #0A0A0A;
            --dark-card: #111111;
            --dark-field: #1A1A1A;
            --border: #2A2A2A;
            --muted: #8A8A8A;
            --white: #FFFFFF;
            --red: #E53E3E;
            --orange: #DD6B20;
            --green: #38A169;
        }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: var(--dark);
            color: var(--white);
            min-height: 100vh;
            overflow-x: hidden;
            /* Anti-triche: bloquer la sélection du texte de l'énoncé */
        }

        /* ═══════════ WATERMARK ═══════════ */
        .watermark {
            position: fixed;
            top: 0; left: 0; width: 100%; height: 100%;
            pointer-events: none;
            z-index: 1000;
            overflow: hidden;
            opacity: 0.035;
        }
        .watermark-text {
            position: absolute;
            font-size: 18px;
            font-weight: 700;
            color: var(--white);
            transform: rotate(-30deg);
            white-space: nowrap;
            font-family: 'Inter', sans-serif;
            letter-spacing: 2px;
        }

        /* ═══════════ HEADER ═══════════ */
        .exam-header {
            position: sticky;
            top: 0;
            z-index: 100;
            background: rgba(10, 10, 10, 0.95);
            backdrop-filter: blur(12px);
            border-bottom: 1px solid var(--border);
            padding: 12px 24px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
        }

        .header-left {
            display: flex;
            align-items: center;
            gap: 12px;
            flex: 1;
            min-width: 0;
        }

        .exam-badge {
            background: var(--gold-dim);
            color: var(--gold);
            font-size: 11px;
            font-weight: 700;
            padding: 4px 10px;
            border-radius: 6px;
            white-space: nowrap;
            letter-spacing: 0.5px;
            text-transform: uppercase;
        }

        .exam-title-header {
            font-size: 15px;
            font-weight: 600;
            color: var(--white);
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
            background: var(--dark-field);
            border: 1.5px solid var(--border);
            border-radius: 12px;
            padding: 8px 16px;
            min-width: 140px;
            justify-content: center;
        }

        .timer-container.warning {
            border-color: var(--orange);
            background: rgba(221, 107, 32, 0.1);
            animation: timerPulse 1s ease-in-out infinite;
        }

        .timer-container.danger {
            border-color: var(--red);
            background: rgba(229, 62, 62, 0.1);
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
            color: var(--white);
            letter-spacing: 1px;
        }

        .timer-container.warning .timer-value { color: var(--orange); }
        .timer-container.danger .timer-value { color: var(--red); }

        /* Tab switch indicator */
        .tab-switch-indicator {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 12px;
            color: var(--muted);
            background: var(--dark-field);
            border: 1px solid var(--border);
            border-radius: 8px;
            padding: 6px 12px;
        }

        .tab-switch-indicator.warn {
            border-color: var(--orange);
            color: var(--orange);
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
            background: linear-gradient(135deg, var(--gold), #B8962E);
            border: none;
            border-radius: 10px;
            font-size: 14px;
            font-weight: 700;
            font-family: 'Inter', sans-serif;
            color: #000;
            cursor: pointer;
            transition: all 0.3s;
            white-space: nowrap;
        }

        .submit-btn-header:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 16px rgba(212, 175, 55, 0.3);
        }

        .submit-btn-header:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            transform: none;
        }

        /* ═══════════ MAIN CONTENT ═══════════ */
        .exam-body {
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
            min-height: calc(100vh - 60px);
        }

        /* Left: Questions (Now Center) */
        .questions-panel {
            user-select: none; /* Anti-triche: empêcher la sélection */
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
        }

        .questions-panel-title {
            font-size: 13px;
            font-weight: 700;
            color: var(--gold);
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
            color: #E0E0E0;
        }

        .questions-content h1,
        .questions-content h2,
        .questions-content h3,
        .questions-content h4,
        .questions-content h5,
        .questions-content p,
        .questions-content li {
            position: relative;
            padding-bottom: 4px;
        }

        /* Hover effect for interactive elements */
        .questions-content .interactive-block {
            position: relative;
            border-radius: 4px;
            transition: background 0.2s;
        }

        .questions-content .interactive-block:hover {
            background: rgba(255,255,255,0.03);
            cursor: pointer;
        }

        /* Inline Add Answer Button */
        .add-answer-btn {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            background: var(--dark-field);
            border: 1px solid var(--border);
            color: var(--gold);
            font-size: 12px;
            font-weight: 600;
            padding: 4px 10px;
            border-radius: 12px;
            cursor: pointer;
            opacity: 0;
            transition: opacity 0.2s, transform 0.2s;
            margin-left: 10px;
            vertical-align: middle;
        }

        .interactive-block:hover .add-answer-btn {
            opacity: 1;
            transform: translateY(0);
        }

        .add-answer-btn:hover {
            background: var(--gold-dim);
            border-color: var(--gold);
        }

        /* Inline Answer Textarea Container */
        .inline-answer-container {
            margin-top: 12px;
            margin-bottom: 24px;
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .inline-answer-textarea {
            width: 100%;
            min-height: 100px;
            padding: 16px;
            background: rgba(20,20,20,0.8);
            border: 1.5px solid var(--border);
            border-radius: 8px;
            font-size: 15px;
            font-family: 'Inter', sans-serif;
            color: var(--green);
            line-height: 1.6;
            resize: vertical;
            outline: none;
            transition: border-color 0.3s, box-shadow 0.3s;
        }

        .inline-answer-textarea:focus {
            border-color: var(--green);
            box-shadow: 0 0 0 3px rgba(56, 161, 105, 0.2);
            background: var(--dark-field);
        }

        .inline-answer-textarea::placeholder {
            color: #555;
            font-style: italic;
        }
        
        .remove-answer-btn {
            align-self: flex-end;
            background: transparent;
            border: none;
            color: var(--muted);
            font-size: 12px;
            cursor: pointer;
            padding: 4px;
        }
        
        .remove-answer-btn:hover {
            color: var(--red);
        }

        .questions-content h1 { font-size: 24px; color: var(--white); margin: 32px 0 16px; }
        .questions-content h2 { font-size: 20px; color: var(--gold); margin: 28px 0 14px; }
        .questions-content h3 { font-size: 18px; color: var(--white); margin: 24px 0 12px; }

        .questions-content p { margin-bottom: 16px; }

        .questions-content ul, .questions-content ol {
            margin: 12px 0 12px 24px;
        }

        .questions-content li { margin-bottom: 8px; }

        .questions-content strong { color: var(--white); }

        .questions-content code {
            background: var(--dark-field);
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'JetBrains Mono', monospace;
            font-size: 13px;
        }

        .questions-content pre {
            background: var(--dark-field);
            padding: 16px;
            border-radius: 8px;
            overflow-x: auto;
            margin: 16px 0;
        }

        .questions-content pre code {
            background: none;
            padding: 0;
        }

        .questions-content img {
            max-width: 100%;
            border-radius: 8px;
            margin: 16px 0;
        }

        /* Right: Answers (HIDDEN) */
        .answers-panel {
            display: none;
        }

        /* ═══════════ MODAL OVERLAY ═══════════ */
        .modal-overlay {
            display: none;
            position: fixed;
            top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0, 0, 0, 0.85);
            backdrop-filter: blur(8px);
            z-index: 2000;
            align-items: center;
            justify-content: center;
        }

        .modal-overlay.active {
            display: flex;
        }

        .modal-card {
            background: var(--dark-card);
            border: 1px solid var(--border);
            border-radius: 20px;
            padding: 36px 32px;
            max-width: 420px;
            width: 90%;
            text-align: center;
            animation: modalPop 0.3s ease-out;
        }

        @keyframes modalPop {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
        }

        .modal-icon { font-size: 48px; margin-bottom: 16px; }
        .modal-title { font-size: 20px; font-weight: 700; margin-bottom: 10px; }
        .modal-text { font-size: 14px; color: var(--muted); line-height: 1.6; margin-bottom: 24px; }

        .modal-btn {
            padding: 12px 24px;
            border: none;
            border-radius: 10px;
            font-size: 14px;
            font-weight: 600;
            font-family: 'Inter', sans-serif;
            cursor: pointer;
            transition: all 0.3s;
            margin: 0 4px;
        }

        .modal-btn-primary {
            background: linear-gradient(135deg, var(--gold), #B8962E);
            color: #000;
        }

        .modal-btn-danger {
            background: rgba(229, 62, 62, 0.2);
            color: var(--red);
            border: 1px solid rgba(229, 62, 62, 0.3);
        }

        .modal-btn:hover { transform: translateY(-1px); }

        /* ═══════════ FULLSCREEN PROMPT ═══════════ */
        .fullscreen-prompt {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: var(--dark-card);
            border: 1px solid var(--orange);
            border-radius: 12px;
            padding: 14px 18px;
            font-size: 13px;
            color: var(--orange);
            z-index: 500;
            display: none;
            align-items: center;
            gap: 8px;
            cursor: pointer;
            animation: slideUp 0.3s ease-out;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
        }

        @keyframes slideUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }

        /* ═══════════ RESPONSIVE ═══════════ */
        @media (max-width: 768px) {
            .exam-body {
                grid-template-columns: 1fr;
            }

            .questions-panel {
                max-height: none;
                border-right: none;
                border-bottom: 1px solid var(--border);
                padding: 20px 16px;
            }

            .answers-panel {
                max-height: none;
                padding: 20px 16px;
            }

            .exam-header {
                padding: 10px 12px;
                flex-wrap: wrap;
                gap: 8px;
            }

            .header-left { order: 1; flex: 1 1 100%; }
            .header-center { order: 2; flex: 1; }
            .header-right { order: 3; }

            .exam-title-header { font-size: 13px; }
            .timer-value { font-size: 16px; }
        }

        /* ═══════════ PRINT PROTECTION ═══════════ */
        @media print {
            body { display: none !important; }
        }
    </style>
</head>
<body>
    <!-- Watermark dynamique -->
    <div class="watermark" id="watermark"></div>

    <!-- Header sticky -->
    <header class="exam-header">
        <div class="header-left">
            <span class="exam-badge">📝 ÉPREUVE</span>
            <span class="exam-title-header">{{ $exam->title }}</span>
        </div>

        <div class="header-center">
            <div class="timer-container" id="timerContainer">
                <span class="timer-icon">⏱️</span>
                <span class="timer-value" id="timerDisplay">--:--</span>
            </div>

            <div class="tab-switch-indicator" id="tabSwitchIndicator">
                <span>🔄</span>
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
        <!-- Panneau des questions (lecture seule) -->
        <section class="questions-panel">
            <div class="questions-panel-title">
                <span>📋</span> Énoncé de l'épreuve
            </div>
            <div class="questions-content" id="questionsContent">
                {!! $content_html !!}
            </div>
        </section>

        <!-- Note: La section des réponses est désormais gérée dynamiquement (inline) -->
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

        // ═══════════ CONFIG ═══════════
        const EXAM_TOKEN = @json($exam->token);
        const SUBMISSION_ID = {{ $submission->id }};
        const REMAINING_SECONDS = {{ $remaining }};
        const MAX_TAB_SWITCHES = {{ $exam->settings['max_tab_switches'] ?? 2 }};
        const STUDENT_NAME = @json($submission->student_name);
        const STUDENT_MATRICULE = @json($submission->student_matricule);
        const CSRF_TOKEN = document.querySelector('meta[name="csrf-token"]').content;
        const HEARTBEAT_INTERVAL = 30000; // 30 secondes
        const AUTOSAVE_INTERVAL = 15000;  // 15 secondes

        // ═══════════ STATE ═══════════
        let remainingSeconds = REMAINING_SECONDS;
        let tabSwitchCount = 0;
        let isSubmitted = false;
        let isFullscreen = false;
        let timerInterval = null;
        let heartbeatInterval = null;

        // ═══════════ WATERMARK ═══════════
        function generateWatermark() {
            const container = document.getElementById('watermark');
            const text = `${STUDENT_NAME} — ${STUDENT_MATRICULE}`;
            const positions = [];
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

            // Alertes visuelles
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
                            ? `Vous avez encore ${remaining} sortie(s) autorisée(s). Au-delà, votre épreuve sera automatiquement soumise.`
                            : `⚠️ DERNIÈRE CHANCE ! La prochaine sortie entraînera la soumission automatique de votre copie.`
                    );
                }
            }
        }

        function handleWindowBlur() {
            if (!document.hidden && !isSubmitted) {
                // Le focus a quitté la fenêtre sans changer de tab (ex: alt+tab)
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

        // ═══════════ ANTI-TRICHE: COPY/PASTE/CUT ═══════════
        function blockCopyPaste(e) {
            // Permettre le paste UNIQUEMENT dans le textarea de réponses
            if (e.type === 'paste' && e.target.classList && e.target.classList.contains('inline-answer-textarea')) {
                return; // Autoriser le paste dans les réponses
            }
            e.preventDefault();
            e.stopPropagation();
            return false;
        }

        // ═══════════ ANTI-TRICHE: CONTEXT MENU ═══════════
        function blockContextMenu(e) {
            e.preventDefault();
            return false;
        }

        // ═══════════ ANTI-TRICHE: KEYBOARD SHORTCUTS ═══════════
        function blockShortcuts(e) {
            // Bloquer: Ctrl+C, Ctrl+V (sauf dans textarea), Ctrl+U, Ctrl+Shift+I, F12
            if (e.key === 'F12') {
                e.preventDefault();
                return false;
            }
            if (e.ctrlKey || e.metaKey) {
                const blockedKeys = ['u', 's', 'p']; // view source, save, print
                if (blockedKeys.includes(e.key.toLowerCase())) {
                    e.preventDefault();
                    return false;
                }
                // Ctrl+Shift+I (DevTools)
                if (e.shiftKey && e.key.toLowerCase() === 'i') {
                    e.preventDefault();
                    return false;
                }
                // Ctrl+Shift+J (Console)
                if (e.shiftKey && e.key.toLowerCase() === 'j') {
                    e.preventDefault();
                    return false;
                }
                // Bloquer Ctrl+C sur le panneau des questions seulement
                if (e.key.toLowerCase() === 'c' && !isAnswersFocused()) {
                    e.preventDefault();
                    return false;
                }
            }
        }

        function isAnswersFocused() {
            return document.activeElement && document.activeElement.classList.contains('inline-answer-textarea');
        }

        // ═══════════ ANTI-TRICHE: DEVTOOLS DETECTION ═══════════
        let devtoolsOpen = false;
        function checkDevTools() {
            const threshold = 160;
            const widthThreshold = window.outerWidth - window.innerWidth > threshold;
            const heightThreshold = window.outerHeight - window.innerHeight > threshold;

            if (widthThreshold || heightThreshold) {
                if (!devtoolsOpen) {
                    devtoolsOpen = true;
                    tabSwitchCount++;
                    updateTabSwitchUI();
                    showTabWarning(
                        'Outils de développement détectés !',
                        'L\'utilisation des outils de développement est interdite pendant l\'épreuve. Fermez-les immédiatement.'
                    );
                }
            } else {
                devtoolsOpen = false;
            }
        }

        // ═══════════ ANTI-TRICHE: FULLSCREEN ═══════════
        function requestFullscreen() {
            const elem = document.documentElement;
            if (elem.requestFullscreen) {
                elem.requestFullscreen().catch(() => {});
            } else if (elem.webkitRequestFullscreen) {
                elem.webkitRequestFullscreen();
            } else if (elem.msRequestFullscreen) {
                elem.msRequestFullscreen();
            }
        }

        function handleFullscreenChange() {
            const isFS = !!(document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement);
            const prompt = document.getElementById('fullscreenPrompt');

            if (isFS) {
                isFullscreen = true;
                prompt.style.display = 'none';
            } else {
                if (isFullscreen && !isSubmitted) {
                    prompt.style.display = 'flex';
                }
            }
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

            // Gather all inline answers
            let answers = "";
            const answerContainers = document.querySelectorAll('.inline-answer-container');
            answerContainers.forEach(container => {
                const textarea = container.querySelector('.inline-answer-textarea');
                const val = textarea.value.trim();
                if (val) {
                    const questionText = container.getAttribute('data-question') || 'Réponse :';
                    answers += `[${questionText}]\n${val}\n\n`;
                }
            });
            
            // Fallback si rien n'a été répondu
            if (!answers.trim()) {
                answers = "(Aucune réponse fournie)";
            }

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
            .catch(err => {
                // Même en cas d'erreur réseau, considérer comme soumis
                console.error('Submit error:', err);
                document.getElementById('forcedSubmitText').textContent =
                    'Votre copie a été enregistrée. Si vous avez un problème de connexion, contactez votre enseignant.';
                document.getElementById('forcedSubmitModal').classList.add('active');
            });
        };
        
        // ═══════════ INLINE ANSWERING LOGIC ═══════════
        function setupInlineAnswering() {
            const content = document.getElementById('questionsContent');
            const blocks = content.querySelectorAll('p, li, h3, h4, h5');
            
            blocks.forEach(block => {
                block.classList.add('interactive-block');
                
                const btn = document.createElement('button');
                btn.className = 'add-answer-btn';
                btn.innerHTML = '✏️ Répondre';
                
                btn.onclick = function(e) {
                    e.stopPropagation();
                    // Si une zone existe déjà, ne rien faire
                    if (block.nextElementSibling && block.nextElementSibling.classList.contains('inline-answer-container')) {
                        block.nextElementSibling.querySelector('textarea').focus();
                        return;
                    }
                    
                    const container = document.createElement('div');
                    container.className = 'inline-answer-container';
                    
                    // Récupérer un extrait du texte pour l'associer à la réponse
                    const blockText = block.innerText.replace('✏️ Répondre', '').trim();
                    const snippet = blockText.length > 50 ? blockText.substring(0, 50) + '...' : blockText;
                    container.setAttribute('data-question', 'Suite à: ' + snippet);
                    
                    const textarea = document.createElement('textarea');
                    textarea.className = 'inline-answer-textarea';
                    textarea.placeholder = 'Rédigez votre réponse ici...';
                    
                    const removeBtn = document.createElement('button');
                    removeBtn.className = 'remove-answer-btn';
                    removeBtn.innerHTML = 'Annuler';
                    removeBtn.onclick = function() {
                        container.remove();
                    };
                    
                    container.appendChild(textarea);
                    container.appendChild(removeBtn);
                    
                    block.parentNode.insertBefore(container, block.nextSibling);
                    textarea.focus();
                };
                
                block.appendChild(btn);
            });
        }

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

        // ═══════════ HEARTBEAT ═══════════
        function sendHeartbeat() {
            if (isSubmitted) return;

            fetch(`/exam/${EXAM_TOKEN}/heartbeat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': CSRF_TOKEN,
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    submission_id: SUBMISSION_ID,
                    tab_switches: tabSwitchCount,
                }),
            })
            .then(res => res.json())
            .then(data => {
                if (data.expired) {
                    autoSubmit('Le temps est écoulé. Votre copie a été soumise automatiquement.');
                } else if (data.remaining !== undefined) {
                    // Synchroniser le timer avec le serveur
                    remainingSeconds = data.remaining;
                }
            })
            .catch(() => {}); // Silently ignore heartbeat errors
        }

        // ═══════════ AUTOSAVE ═══════════
        let lastSavedContent = '';
        function autoSave() {
            const content = document.getElementById('answersTextarea').value;
            if (content !== lastSavedContent) {
                lastSavedContent = content;
                try {
                    localStorage.setItem(`exam_${SUBMISSION_ID}_answers`, content);
                } catch(e) {}
            }
        }

        function restoreAutoSave() {
            try {
                const saved = localStorage.getItem(`exam_${SUBMISSION_ID}_answers`);
                if (saved) {
                    document.getElementById('answersTextarea').value = saved;
                    lastSavedContent = saved;
                }
            } catch(e) {}
        }

        // ═══════════ INIT ═══════════
        function init() {
            // Watermark
            generateWatermark();

            // Timer
            startTimer();

            // Restore autosave
            restoreAutoSave();

            // Anti-triche listeners
            document.addEventListener('visibilitychange', handleVisibilityChange);
            window.addEventListener('blur', handleWindowBlur);
            document.addEventListener('copy', blockCopyPaste);
            document.addEventListener('cut', blockCopyPaste);
            document.addEventListener('contextmenu', blockContextMenu);
            document.addEventListener('keydown', blockShortcuts);
            document.addEventListener('fullscreenchange', handleFullscreenChange);
            document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

            // DevTools detection
            setInterval(checkDevTools, 1000);

            // Heartbeat
            heartbeatInterval = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);

            // Autosave
            setInterval(autoSave, AUTOSAVE_INTERVAL);

            // Request fullscreen on first interaction
            document.addEventListener('click', function firstClick() {
                requestFullscreen();
                document.removeEventListener('click', firstClick);
            }, { once: true });

            // Empêcher de quitter la page par erreur
            window.addEventListener('beforeunload', function(e) {
                if (!isSubmitted) {
                    e.preventDefault();
                    e.returnValue = 'Votre épreuve est en cours. Êtes-vous sûr de vouloir quitter ?';
                    return e.returnValue;
                }
            });

            // Bloquer le drag pour éviter le drag-and-drop de texte
            document.addEventListener('dragstart', function(e) {
                if (e.target.id !== 'answersTextarea') {
                    e.preventDefault();
                }
            });
        }

        // Attendre le DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
        } else {
            init();
        }
    })();
    </script>
</body>
</html>
