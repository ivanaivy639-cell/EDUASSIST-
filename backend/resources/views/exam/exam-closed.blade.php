<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="robots" content="noindex, nofollow">
    <title>Épreuve indisponible — EduAssist</title>
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

        .error-icon {
            width: 80px;
            height: 80px;
            background: rgba(229, 62, 62, 0.15);
            border: 2px solid rgba(229, 62, 62, 0.3);
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 36px;
            margin-bottom: 24px;
        }

        .title {
            font-size: 22px;
            font-weight: 700;
            margin-bottom: 12px;
            color: #E53E3E;
        }

        .message {
            font-size: 15px;
            color: #8A8A8A;
            line-height: 1.7;
            margin-bottom: 24px;
        }

        .reason-card {
            background: #111111;
            border: 1px solid #2A2A2A;
            border-radius: 14px;
            padding: 20px 24px;
            margin-bottom: 24px;
        }

        .reason-label {
            font-size: 12px;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 8px;
        }

        .reason-text {
            font-size: 14px;
            color: #D0D0D0;
            line-height: 1.6;
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
        <div class="error-icon">
            @if ($reason === 'already_submitted')
                📋
            @elseif ($reason === 'expired')
                ⏰
            @elseif ($reason === 'not_started')
                ⏳
            @elseif ($reason === 'ended')
                🛑
            @else
                🚫
            @endif
        </div>

        <h1 class="title">
            @if ($reason === 'already_submitted')
                Épreuve déjà composée
            @elseif ($reason === 'expired')
                Temps écoulé
            @elseif ($reason === 'not_found')
                Lien invalide
            @elseif ($reason === 'not_started')
                Pas encore ouvert
            @elseif ($reason === 'ended')
                Épreuve terminée
            @else
                Épreuve indisponible
            @endif
        </h1>

        <div class="reason-card">
            <div class="reason-label">Détail</div>
            <div class="reason-text">{{ $message }}</div>
        </div>

        <p class="message">
            Si vous pensez qu'il s'agit d'une erreur, contactez votre enseignant.
        </p>

        <div class="footer">
            Propulsé par <span>EduAssist</span>
        </div>
    </div>
</body>
</html>
