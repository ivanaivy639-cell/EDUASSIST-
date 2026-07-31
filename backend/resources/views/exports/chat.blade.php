<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Export EduAssist</title>
    <style>
        @page {
            margin: 100px 50px 80px 50px;
        }
        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            line-height: 1.6;
            color: #2D3748;
            font-size: 14px;
        }
        .header {
            position: fixed;
            top: -60px;
            left: 0px;
            right: 0px;
            text-align: center;
            border-bottom: 2px solid #D4AF37;
            padding-bottom: 10px;
        }
        .header h1 {
            color: #1a1a1a;
            margin: 0;
            font-size: 24px;
        }
        .header p {
            color: #718096;
            font-size: 11px;
            margin: 5px 0 0 0;
        }
        .footer {
            position: fixed;
            bottom: -50px;
            left: 0px;
            right: 0px;
            font-size: 10px;
            text-align: center;
            color: #A0AEC0;
            border-top: 1px solid #E2E8F0;
            padding-top: 10px;
        }
        
        /* Styles générés depuis le Markdown (Parsedown) */
        h1 {
            color: #1A202C;
            font-size: 22px;
            border-bottom: 1px solid #E2E8F0;
            padding-bottom: 8px;
            margin-top: 0;
        }
        h2 {
            color: #2B6CB0;
            font-size: 18px;
            margin-top: 25px;
        }
        h3 {
            color: #2D3748;
            font-size: 16px;
            margin-top: 20px;
        }
        p {
            margin-bottom: 15px;
            text-align: justify;
        }
        ul, ol {
            margin-bottom: 15px;
            padding-left: 25px;
        }
        li {
            margin-bottom: 5px;
        }
        strong {
            color: #1A202C;
        }
        blockquote {
            border-left: 4px solid #D4AF37;
            padding-left: 15px;
            color: #4A5568;
            background-color: #F7FAFC;
            padding: 10px 15px;
            margin: 15px 0;
        }
        code {
            background-color: #EDF2F7;
            padding: 2px 5px;
            border-radius: 3px;
            font-family: monospace;
            font-size: 12px;
        }
        img {
            max-width: 100%;
            height: auto;
            display: block;
            margin: 20px auto;
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>EduAssist IA</h1>
        <p>Document généré le {{ \Carbon\Carbon::now()->timezone('Africa/Douala')->format('d/m/Y à H:i') }}</p>
    </div>

    <div class="footer">
        Généré automatiquement par EduAssist - L'assistant pédagogique Camerounais
    </div>

    <!-- Contenu converti depuis le Markdown -->
    <div class="content">
        {!! $htmlContent !!}
    </div>
</body>
</html>
