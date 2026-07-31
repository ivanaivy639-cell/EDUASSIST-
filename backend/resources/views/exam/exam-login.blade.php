<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="robots" content="noindex, nofollow">
    <title>{{ $exam->title }} — EduAssist Évaluation</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
            --primary: #2B6CB0;
            --primary-dark: #2C5282;
            --dark: #121212;
            --dark-card: #1A1A1A;
            --dark-field: #242424;
            --border: #333333;
            --muted: #A0AEC0;
            --white: #FFFFFF;
            --red: #C53030;
            --green: #2F855A;
        }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: var(--dark);
            color: var(--white);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow-x: hidden;
            overflow-y: auto;
            padding: 40px 20px;
        }

        /* No animated background */
        
        .login-container {
            width: 100%;
            max-width: 500px;
            margin: auto;
        }

        .login-card {
            background: var(--dark-card);
            border: 1px solid var(--border);
            border-radius: 4px;
            padding: 40px 32px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
        }

        /* Logo / Header */
        .logo-section {
            text-align: center;
            margin-bottom: 32px;
            border-bottom: 2px solid var(--primary);
            padding-bottom: 20px;
        }

        .logo-title {
            font-size: 20px;
            font-weight: 700;
            color: var(--white);
            margin-bottom: 4px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .logo-subtitle {
            font-size: 13px;
            color: var(--muted);
            font-weight: 500;
            text-transform: uppercase;
        }

        /* Exam Info */
        .exam-info {
            background: var(--dark-field);
            border: 1px solid var(--border);
            border-radius: 4px;
            padding: 16px 20px;
            margin-bottom: 28px;
        }

        .exam-info-title {
            font-size: 15px;
            font-weight: 700;
            color: var(--primary);
            margin-bottom: 12px;
            text-transform: uppercase;
        }

        .exam-info-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 6px 0;
        }

        .exam-info-label {
            font-size: 13px;
            color: var(--muted);
            font-weight: 600;
        }

        .exam-info-value {
            font-size: 13px;
            font-weight: 600;
            color: var(--white);
        }

        .exam-info-row + .exam-info-row {
            border-top: 1px solid rgba(255, 255, 255, 0.05);
            margin-top: 6px;
            padding-top: 10px;
        }

        /* Form */
        .form-group {
            margin-bottom: 20px;
        }

        .form-label {
            display: block;
            font-size: 13px;
            font-weight: 600;
            color: var(--white);
            margin-bottom: 8px;
            letter-spacing: 0.3px;
        }

        .form-input {
            width: 100%;
            padding: 12px 16px;
            background: var(--dark-field);
            border: 1px solid var(--border);
            border-radius: 4px;
            font-size: 15px;
            font-family: 'Inter', sans-serif;
            color: var(--white);
            outline: none;
            transition: border-color 0.2s;
        }

        .form-input::placeholder {
            color: #666;
        }

        .form-input:focus {
            border-color: var(--primary);
        }

        /* Warning box */
        .warning-box {
            background: rgba(197, 48, 48, 0.1);
            border-left: 4px solid var(--red);
            padding: 14px 16px;
            margin-bottom: 24px;
        }

        .warning-text {
            font-size: 12px;
            color: #FC8181;
            line-height: 1.6;
        }

        /* Submit button */
        .submit-btn {
            width: 100%;
            padding: 14px;
            background: var(--primary);
            border: none;
            border-radius: 4px;
            font-size: 14px;
            font-weight: 700;
            font-family: 'Inter', sans-serif;
            color: var(--white);
            cursor: pointer;
            transition: background 0.2s;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .submit-btn:hover {
            background: var(--primary-dark);
        }

        .submit-btn:disabled {
            background: var(--border);
            color: var(--muted);
            cursor: not-allowed;
        }

        /* Error message */
        .error-msg {
            background: rgba(229, 62, 62, 0.1);
            border: 1px solid rgba(229, 62, 62, 0.3);
            border-radius: 8px;
            padding: 12px 16px;
            margin-bottom: 16px;
            font-size: 13px;
            color: var(--red);
            text-align: center;
        }

        /* Footer */
        .footer {
            text-align: center;
            margin-top: 24px;
            font-size: 11px;
            color: var(--muted);
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        /* Responsive */
        @media (max-width: 520px) {
            .login-card { padding: 28px 20px; }
            .logo-title { font-size: 18px; }
        }
    </style>
</head>
<body>
    <div class="login-container">
        <div class="login-card">
            <div class="logo-section">
                <div class="logo-title">Portail d'Évaluation</div>
                <div class="logo-subtitle">Accès Sécurisé — Épreuve Académique</div>
            </div>

            <div class="exam-info">
                <div class="exam-info-title">{{ $exam->title }}</div>
                <div class="exam-info-row">
                    <span class="exam-info-label">Enseignant</span>
                    <span class="exam-info-value">{{ $teacher_name }}</span>
                </div>
                <div class="exam-info-row">
                    <span class="exam-info-label">Durée</span>
                    <span class="exam-info-value">{{ $exam->duration_minutes }} minutes</span>
                </div>
                <div class="exam-info-row">
                    <span class="exam-info-label">Barème</span>
                    <span class="exam-info-value">{{ $exam->max_score }} points</span>
                </div>
            </div>

            @if ($errors->any())
                <div class="error-msg">
                    @foreach ($errors->all() as $error)
                        {{ $error }}<br>
                    @endforeach
                </div>
            @endif

            <form method="POST" action="/exam/{{ $exam->token }}/start" id="loginForm">
                @csrf

                <div class="form-group">
                    <label class="form-label" for="student_name">Nom complet</label>
                    <input
                        type="text"
                        class="form-input"
                        id="student_name"
                        name="student_name"
                        placeholder="Ex: MBARGA Jean Pierre"
                        value="{{ old('student_name') }}"
                        required
                        autocomplete="off"
                    >
                </div>

                <div class="form-group">
                    <label class="form-label" for="student_matricule">Matricule</label>
                    <input
                        type="text"
                        class="form-input"
                        id="student_matricule"
                        name="student_matricule"
                        placeholder="Ex: 22A0456"
                        value="{{ old('student_matricule') }}"
                        required
                        autocomplete="off"
                        style="text-transform: uppercase;"
                    >
                </div>

                <div class="warning-box">
                    <span class="warning-text">
                        <strong>INSTRUCTIONS STRICTES :</strong><br>
                        - Le temps imparti s'écoule de manière continue.<br>
                        - Toute sortie de cette interface sera enregistrée (Tolérance : 2 sorties).<br>
                        - Les fonctions de copie et de collage sont bloquées.<br>
                        - La tricherie entraîne l'annulation automatique de la copie.
                    </span>
                </div>

                <button type="submit" class="submit-btn" id="submitBtn">
                    Accéder à l'épreuve
                </button>
            </form>

            <div class="footer">
                SYSTÈME D'ÉVALUATION SÉCURISÉ
            </div>
        </div>
    </div>

    <script>
        // Empêcher la soumission multiple
        document.getElementById('loginForm').addEventListener('submit', function() {
            const btn = document.getElementById('submitBtn');
            btn.disabled = true;
            btn.textContent = '⏳ Chargement...';
        });

        // Auto-uppercase pour le matricule
        document.getElementById('student_matricule').addEventListener('input', function(e) {
            e.target.value = e.target.value.toUpperCase();
        });
    </script>
</body>
</html>
