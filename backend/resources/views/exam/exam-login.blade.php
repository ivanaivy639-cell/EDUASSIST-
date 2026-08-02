<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="robots" content="noindex, nofollow">
    <title>{{ $exam->title }} — Épreuve Académique</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
            --primary: #1E40AF;
            --primary-hover: #1E3A8A;
            --bg-page: #F4F6F9;
            --card-bg: #FFFFFF;
            --text-dark: #0F172A;
            --text-muted: #64748B;
            --border-color: #E2E8F0;
            --input-bg: #F8FAFC;
            --input-border: #CBD5E1;
            --accent-gold: #D4AF37;
            --red-alert: #DC2626;
            --blue-info-bg: #EFF6FF;
            --blue-info-border: #BFDBFE;
        }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: var(--bg-page);
            color: var(--text-dark);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px 16px;
        }

        .login-container {
            width: 100%;
            max-width: 520px;
        }

        .login-card {
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 16px;
            padding: 40px 36px;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.03);
        }

        /* Header / Logo */
        .logo-section {
            text-align: center;
            margin-bottom: 28px;
            padding-bottom: 20px;
            border-bottom: 1px solid var(--border-color);
        }

        .badge-academic {
            display: inline-block;
            background: #F1F5F9;
            color: var(--primary);
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            padding: 4px 12px;
            border-radius: 20px;
            margin-bottom: 12px;
            border: 1px solid var(--border-color);
        }

        .logo-title {
            font-size: 22px;
            font-weight: 800;
            color: var(--text-dark);
            margin-bottom: 6px;
        }

        .logo-subtitle {
            font-size: 14px;
            color: var(--text-muted);
            font-weight: 500;
        }

        /* Exam Info Box */
        .exam-info {
            background: #F8FAFC;
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 28px;
        }

        .exam-info-title {
            font-size: 17px;
            font-weight: 700;
            color: var(--primary);
            margin-bottom: 14px;
        }

        .exam-info-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            font-size: 14px;
        }

        .exam-info-row + .exam-info-row {
            border-top: 1px dashed var(--border-color);
        }

        .exam-info-label {
            color: var(--text-muted);
            font-weight: 500;
        }

        .exam-info-value {
            font-weight: 700;
            color: var(--text-dark);
        }

        /* Form */
        .form-group {
            margin-bottom: 20px;
        }

        .form-label {
            display: block;
            font-size: 14px;
            font-weight: 600;
            color: var(--text-dark);
            margin-bottom: 8px;
        }

        .form-input {
            width: 100%;
            padding: 14px 16px;
            background: var(--input-bg);
            border: 1.5px solid var(--input-border);
            border-radius: 10px;
            font-size: 15px;
            font-family: 'Inter', sans-serif;
            color: var(--text-dark);
            outline: none;
            transition: all 0.2s ease;
        }

        .form-input::placeholder {
            color: #94A3B8;
        }

        .form-input:focus {
            background: #FFFFFF;
            border-color: var(--primary);
            box-shadow: 0 0 0 4px rgba(30, 64, 175, 0.1);
        }

        /* Instructions Box */
        .instructions-box {
            background: var(--blue-info-bg);
            border: 1px solid var(--blue-info-border);
            border-radius: 10px;
            padding: 16px;
            margin-bottom: 24px;
        }

        .instructions-header {
            font-size: 13px;
            font-weight: 700;
            color: var(--primary);
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .instructions-list {
            font-size: 13px;
            color: #334155;
            line-height: 1.6;
            margin-left: 18px;
        }

        /* Submit Button */
        .submit-btn {
            width: 100%;
            padding: 16px;
            background: var(--primary);
            border: none;
            border-radius: 10px;
            font-size: 16px;
            font-weight: 700;
            font-family: 'Inter', sans-serif;
            color: #FFFFFF;
            cursor: pointer;
            transition: background 0.2s ease, transform 0.1s ease;
            box-shadow: 0 4px 12px rgba(30, 64, 175, 0.2);
        }

        .submit-btn:hover {
            background: var(--primary-hover);
        }

        .submit-btn:active {
            transform: scale(0.99);
        }

        .submit-btn:disabled {
            background: #94A3B8;
            cursor: not-allowed;
            box-shadow: none;
        }

        /* Error message */
        .error-msg {
            background: #FEF2F2;
            border: 1px solid #FCA5A5;
            border-radius: 10px;
            padding: 14px 16px;
            margin-bottom: 20px;
            font-size: 14px;
            color: var(--red-alert);
            text-align: center;
            font-weight: 500;
        }

        /* Footer */
        .footer {
            text-align: center;
            margin-top: 24px;
            font-size: 12px;
            color: var(--text-muted);
            font-weight: 500;
        }

        @media (max-width: 480px) {
            .login-card { padding: 28px 20px; }
            .logo-title { font-size: 20px; }
        }
    </style>
</head>
<body>
    <div class="login-container">
        <div class="login-card">
            <div class="logo-section">
                <span class="badge-academic">Épreuve d'évaluation</span>
                <h1 class="logo-title">Identification de l'Élève</h1>
                <p class="logo-subtitle">Veuillez renseigner vos informations pour débuter l'épreuve</p>
            </div>

            <div class="exam-info">
                <div class="exam-info-title">{{ $exam->title }}</div>
                <div class="exam-info-row">
                    <span class="exam-info-label">Enseignant</span>
                    <span class="exam-info-value">{{ $teacher_name }}</span>
                </div>
                <div class="exam-info-row">
                    <span class="exam-info-label">Durée allouée</span>
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
                    <label class="form-label" for="student_name">Nom et Prénom complets</label>
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
                    <label class="form-label" for="student_matricule">Matricule Élève</label>
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

                <div class="instructions-box">
                    <div class="instructions-header">
                        📌 Instructions importantes
                    </div>
                    <ul class="instructions-list">
                        <li>Le décompte du temps démarre dès la validation.</li>
                        <li>Ne fermez pas et ne quittez pas la page pendant l'épreuve.</li>
                        <li>Validez vos réponses avant la fin du temps imparti.</li>
                    </ul>
                </div>

                <button type="submit" class="submit-btn" id="submitBtn">
                    Commencer l'épreuve
                </button>
            </form>

            <div class="footer">
                EduAssist — Plateforme d'Évaluation Académique
            </div>
        </div>
    </div>

    <script>
        document.getElementById('loginForm').addEventListener('submit', function() {
            const btn = document.getElementById('submitBtn');
            btn.disabled = true;
            btn.textContent = '⏳ Ouverture de l\'épreuve...';
        });

        document.getElementById('student_matricule').addEventListener('input', function(e) {
            e.target.value = e.target.value.toUpperCase();
        });
    </script>
</body>
</html>
