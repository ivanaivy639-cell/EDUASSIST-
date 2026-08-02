<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="robots" content="noindex, nofollow">
    <title>Épreuve indisponible — EduAssist</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
            --bg-page: #F4F6F9;
            --card-bg: #FFFFFF;
            --text-dark: #0F172A;
            --text-muted: #64748B;
            --border-color: #E2E8F0;
            --red-color: #DC2626;
            --primary: #1E40AF;
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
            padding: 36px 28px;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
        }

        .alert-icon {
            width: 64px;
            height: 64px;
            background: #FEF2F2;
            border: 1px solid #FCA5A5;
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 26px;
            font-weight: 700;
            color: var(--red-color);
            margin-bottom: 20px;
        }

        .title {
            font-size: 20px;
            font-weight: 800;
            margin-bottom: 12px;
            color: var(--text-dark);
        }

        .reason-box {
            background: #F8FAFC;
            border: 1px solid var(--border-color);
            border-radius: 10px;
            padding: 16px;
            margin-bottom: 20px;
            text-align: center;
        }

        .reason-text {
            font-size: 14px;
            color: #334155;
            line-height: 1.6;
            font-weight: 500;
        }

        .message {
            font-size: 13px;
            color: var(--text-muted);
            line-height: 1.6;
            margin-bottom: 20px;
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
            <div class="alert-icon">
                !
            </div>

            <h1 class="title">
                @if ($reason === 'already_submitted')
                    Épreuve déjà composée
                @elseif ($reason === 'expired')
                    Temps écoulé
                @elseif ($reason === 'not_found')
                    Lien d'examen invalide
                @elseif ($reason === 'not_started')
                    Épreuve pas encore ouverte
                @elseif ($reason === 'ended')
                    Épreuve terminée
                @else
                    Épreuve indisponible
                @endif
            </h1>

            <div class="reason-box">
                <div class="reason-text">{{ $message }}</div>
            </div>

            <p class="message">
                Si vous pensez qu'il s'agit d'une erreur, contactez votre enseignant.
            </p>

            <div class="footer">
                EduAssist — Plateforme d'Évaluation Académique
            </div>
        </div>
    </div>
</body>
</html>
