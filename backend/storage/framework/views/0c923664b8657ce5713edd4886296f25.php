<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="robots" content="noindex, nofollow">
    <title><?php echo e($exam->title); ?> — EduAssist Évaluation</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

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
            --green: #38A169;
        }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: var(--dark);
            color: var(--white);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
        }

        /* Animated background */
        body::before {
            content: '';
            position: fixed;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(ellipse at 30% 20%, rgba(212, 175, 55, 0.06) 0%, transparent 50%),
                        radial-gradient(ellipse at 70% 80%, rgba(212, 175, 55, 0.04) 0%, transparent 50%);
            animation: bgShift 20s ease-in-out infinite;
            z-index: -1;
        }

        @keyframes bgShift {
            0%, 100% { transform: translate(0, 0); }
            50% { transform: translate(-5%, -5%); }
        }

        .login-container {
            width: 100%;
            max-width: 480px;
            padding: 20px;
        }

        .login-card {
            background: var(--dark-card);
            border: 1px solid var(--border);
            border-radius: 20px;
            padding: 40px 32px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5),
                        0 0 40px rgba(212, 175, 55, 0.05);
            animation: cardSlide 0.6s ease-out;
        }

        @keyframes cardSlide {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
        }

        /* Logo / Header */
        .logo-section {
            text-align: center;
            margin-bottom: 32px;
        }

        .logo-icon {
            width: 64px;
            height: 64px;
            background: linear-gradient(135deg, var(--gold), #B8962E);
            border-radius: 16px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 28px;
            margin-bottom: 16px;
            box-shadow: 0 8px 24px rgba(212, 175, 55, 0.2);
        }

        .logo-title {
            font-size: 22px;
            font-weight: 700;
            color: var(--white);
            margin-bottom: 4px;
        }

        .logo-subtitle {
            font-size: 13px;
            color: var(--muted);
            font-weight: 400;
        }

        /* Exam Info */
        .exam-info {
            background: var(--gold-dim);
            border: 1px solid rgba(212, 175, 55, 0.2);
            border-radius: 12px;
            padding: 16px 20px;
            margin-bottom: 28px;
        }

        .exam-info-title {
            font-size: 16px;
            font-weight: 600;
            color: var(--gold);
            margin-bottom: 10px;
        }

        .exam-info-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 4px 0;
        }

        .exam-info-label {
            font-size: 13px;
            color: var(--muted);
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
            padding: 14px 16px;
            background: var(--dark-field);
            border: 1.5px solid var(--border);
            border-radius: 12px;
            font-size: 15px;
            font-family: 'Inter', sans-serif;
            color: var(--white);
            outline: none;
            transition: border-color 0.3s, box-shadow 0.3s;
        }

        .form-input::placeholder {
            color: #555;
        }

        .form-input:focus {
            border-color: var(--gold);
            box-shadow: 0 0 0 3px var(--gold-glow);
        }

        /* Warning box */
        .warning-box {
            background: rgba(229, 62, 62, 0.1);
            border: 1px solid rgba(229, 62, 62, 0.3);
            border-radius: 10px;
            padding: 14px 16px;
            margin-bottom: 24px;
            display: flex;
            gap: 10px;
            align-items: flex-start;
        }

        .warning-icon {
            font-size: 18px;
            flex-shrink: 0;
            margin-top: 1px;
        }

        .warning-text {
            font-size: 12px;
            color: #F5A0A0;
            line-height: 1.6;
        }

        /* Submit button */
        .submit-btn {
            width: 100%;
            padding: 16px;
            background: linear-gradient(135deg, var(--gold), #B8962E);
            border: none;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 700;
            font-family: 'Inter', sans-serif;
            color: #000;
            cursor: pointer;
            transition: all 0.3s;
            letter-spacing: 0.5px;
            position: relative;
            overflow: hidden;
        }

        .submit-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(212, 175, 55, 0.3);
        }

        .submit-btn:active {
            transform: translateY(0);
        }

        .submit-btn::after {
            content: '';
            position: absolute;
            top: 0; left: -100%; width: 100%; height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
            transition: left 0.5s;
        }

        .submit-btn:hover::after {
            left: 100%;
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
            font-size: 12px;
            color: #444;
        }

        .footer span {
            color: var(--gold);
            font-weight: 600;
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
                <div class="logo-icon">📝</div>
                <div class="logo-title">Évaluation en ligne</div>
                <div class="logo-subtitle">EduAssist — Plateforme d'évaluation sécurisée</div>
            </div>

            <div class="exam-info">
                <div class="exam-info-title"><?php echo e($exam->title); ?></div>
                <div class="exam-info-row">
                    <span class="exam-info-label">Enseignant</span>
                    <span class="exam-info-value"><?php echo e($teacher_name); ?></span>
                </div>
                <div class="exam-info-row">
                    <span class="exam-info-label">Durée</span>
                    <span class="exam-info-value"><?php echo e($exam->duration_minutes); ?> minutes</span>
                </div>
                <div class="exam-info-row">
                    <span class="exam-info-label">Barème</span>
                    <span class="exam-info-value"><?php echo e($exam->max_score); ?> points</span>
                </div>
            </div>

            <?php if($errors->any()): ?>
                <div class="error-msg">
                    <?php $__currentLoopData = $errors->all(); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $error): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <?php echo e($error); ?><br>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                </div>
            <?php endif; ?>

            <form method="POST" action="/exam/<?php echo e($exam->token); ?>/start" id="loginForm">
                <?php echo csrf_field(); ?>

                <div class="form-group">
                    <label class="form-label" for="student_name">Nom complet</label>
                    <input
                        type="text"
                        class="form-input"
                        id="student_name"
                        name="student_name"
                        placeholder="Ex: MBARGA Jean Pierre"
                        value="<?php echo e(old('student_name')); ?>"
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
                        value="<?php echo e(old('student_matricule')); ?>"
                        required
                        autocomplete="off"
                        style="text-transform: uppercase;"
                    >
                </div>

                <div class="warning-box">
                    <span class="warning-icon">⚠️</span>
                    <span class="warning-text">
                        <strong>Règles de l'épreuve :</strong><br>
                        • Le chronomètre démarre dès que vous cliquez sur "Commencer"<br>
                        • Quitter l'écran plus de 2 fois entraîne la fermeture de l'épreuve<br>
                        • Le copier-coller et le clic droit sont désactivés<br>
                        • Votre activité est surveillée pendant toute la durée de l'épreuve
                    </span>
                </div>

                <button type="submit" class="submit-btn" id="submitBtn">
                    🚀 Commencer l'épreuve
                </button>
            </form>

            <div class="footer">
                Propulsé par <span>EduAssist</span>
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
<?php /**PATH C:\EDUASSIST\backend\resources\views/exam/exam-login.blade.php ENDPATH**/ ?>