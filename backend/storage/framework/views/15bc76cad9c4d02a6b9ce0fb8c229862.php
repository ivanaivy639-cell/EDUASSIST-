<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="robots" content="noindex, nofollow">
    <title>Épreuve soumise — EduAssist</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
            font-family: 'Inter', -apple-system, sans-serif;
            background: #0A0A0A;
            color: #FFFFFF;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .container {
            max-width: 460px;
            width: 90%;
            text-align: center;
            animation: fadeIn 0.6s ease-out;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .success-icon {
            width: 80px;
            height: 80px;
            background: rgba(56, 161, 105, 0.15);
            border: 2px solid rgba(56, 161, 105, 0.3);
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 36px;
            margin-bottom: 24px;
            animation: popIn 0.5s ease-out 0.2s both;
        }

        @keyframes popIn {
            from { transform: scale(0); }
            50% { transform: scale(1.2); }
            to { transform: scale(1); }
        }

        .title {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 12px;
            color: #38A169;
        }

        .message {
            font-size: 15px;
            color: #8A8A8A;
            line-height: 1.7;
            margin-bottom: 32px;
        }

        .info-card {
            background: #111111;
            border: 1px solid #2A2A2A;
            border-radius: 14px;
            padding: 20px 24px;
            text-align: left;
            margin-bottom: 24px;
        }

        .info-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
        }

        .info-row + .info-row {
            border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .info-label {
            font-size: 13px;
            color: #8A8A8A;
        }

        .info-value {
            font-size: 13px;
            font-weight: 600;
            color: #FFFFFF;
        }

        .footer {
            font-size: 12px;
            color: #444;
            margin-top: 20px;
        }

        .footer span {
            color: #D4AF37;
            font-weight: 600;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="success-icon">✅</div>
        <h1 class="title">Copie soumise avec succès !</h1>
        <p class="message">
            Votre épreuve a été transmise à votre enseignant. 
            La correction est en cours de traitement. 
            Les résultats vous seront communiqués par votre enseignant.
        </p>

        <div class="info-card">
            <div class="info-row">
                <span class="info-label">Statut</span>
                <span class="info-value" style="color: #38A169;">✅ Soumise</span>
            </div>
            <div class="info-row">
                <span class="info-label">Heure de soumission</span>
                <span class="info-value"><?php echo e(now()->format('d/m/Y à H:i')); ?></span>
            </div>
        </div>

        <p class="message" style="font-size: 13px;">
            Vous pouvez maintenant fermer cette page en toute sécurité.
        </p>

        <div class="footer">
            Propulsé par <span>EduAssist</span>
        </div>
    </div>

    <script>
        // Nettoyer le localStorage
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith('exam_')) {
                    localStorage.removeItem(key);
                }
            });
        } catch(e) {}
    </script>
</body>
</html>
<?php /**PATH C:\EDUASSIST\backend\resources\views/exam/exam-submitted.blade.php ENDPATH**/ ?>