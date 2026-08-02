<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="robots" content="noindex, nofollow">
    <title>Épreuve soumise — EduAssist</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
            --bg-page: #F4F6F9;
            --card-bg: #FFFFFF;
            --text-dark: #0F172A;
            --text-muted: #64748B;
            --border-color: #E2E8F0;
            --green-color: #16A34A;
        }

        body {
            font-family: 'Inter', -apple-system, sans-serif;
            background: var(--bg-page);
            color: var(--text-dark);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px 16px;
        }

        .container {
            max-width: 480px;
            width: 100%;
            text-align: center;
        }

        .card {
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 16px;
            padding: 40px 32px;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
        }

        .success-icon {
            width: 64px;
            height: 64px;
            background: #DCFCE7;
            border: 1px solid #86EFAC;
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 30px;
            margin-bottom: 20px;
        }

        .title {
            font-size: 22px;
            font-weight: 800;
            margin-bottom: 12px;
            color: var(--text-dark);
        }

        .message {
            font-size: 14px;
            color: var(--text-muted);
            line-height: 1.6;
            margin-bottom: 24px;
        }

        .info-card {
            background: #F8FAFC;
            border: 1px solid var(--border-color);
            border-radius: 10px;
            padding: 16px 20px;
            text-align: left;
            margin-bottom: 24px;
        }

        .info-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            font-size: 13px;
        }

        .info-row + .info-row {
            border-top: 1px dashed var(--border-color);
        }

        .info-label {
            color: var(--text-muted);
            font-weight: 500;
        }

        .info-value {
            font-weight: 700;
            color: var(--text-dark);
        }

        .footer {
            font-size: 12px;
            color: var(--text-muted);
            font-weight: 500;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <div class="success-icon">✓</div>
            <h1 class="title">Copie soumise avec succès !</h1>
            <p class="message">
                Votre épreuve a bien été enregistrée et transmise à votre enseignant.
            </p>

            <div class="info-card">
                <div class="info-row">
                    <span class="info-label">Statut</span>
                    <span class="info-value" style="color: var(--green-color);">Transmise</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Heure d'enregistrement</span>
                    <span class="info-value">{{ now()->format('d/m/Y à H:i') }}</span>
                </div>
            </div>

            <p class="message" style="font-size: 13px;">
                Vous pouvez maintenant fermer cette fenêtre en toute sécurité.
            </p>

            <div class="footer">
                EduAssist — Plateforme d'Évaluation Académique
            </div>
        </div>
    </div>

    <script>
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
