# Refonte de l'interface d'évaluation étudiant

Le but est de rendre la page de composition plus **ergonomique** et **minimaliste**, tout en permettant aux étudiants de **répondre directement sous chaque question**.

## User Review Required
> [!IMPORTANT]
> Étant donné que le contenu de l'examen est généré par l'IA ou rédigé librement par le professeur (format Markdown libre), il n'y a pas de structure fixe de "questions". 
> **Solution technique proposée :** Je vais développer un système "à la Notion" où l'étudiant peut cliquer sur n'importe quel paragraphe, titre ou puce de l'énoncé pour y insérer une boîte de texte et écrire sa réponse. 
> Êtes-vous d'accord avec cette approche interactive ?

## Proposed Changes

### Composant : Vue de l'examen étudiant

#### [MODIFY] `c:\EDUASSIST\backend\resources\views\exam\exam-compose.blade.php`
- **Design Minimaliste** :
  - Suppression de l'affichage en "double panneau" (énoncé à gauche, grosse boîte de réponse à droite).
  - Adoption d'une mise en page en **colonne unique centrale**, très épurée (style formulaire type Typeform/Notion), optimisant la lecture.
- **Réponses en ligne (Inline Answers)** :
  - Ajout d'un script JavaScript interactif.
  - Lorsqu'un étudiant clique (ou survole) un élément de l'énoncé (ex: un paragraphe avec une question), un bouton "✏️ Ajouter une réponse" apparaît.
  - Au clic, une zone de texte s'insère dynamiquement **juste en dessous** de la question pour y taper la réponse.
- **Compilation à la soumission** :
  - Lors du clic sur "Soumettre", le système va automatiquement regrouper toutes les petites zones de texte éparpillées dans le document, et les associer au texte de la question pour former la copie finale à corriger par l'IA.

## Verification Plan

### Manual Verification
- Ouvrir un lien d'examen étudiant depuis le tableau de bord du professeur.
- Vérifier que l'interface est bien épurée et en une seule colonne.
- Cliquer sur un paragraphe de l'énoncé pour voir apparaître la zone de texte.
- Rédiger des réponses éparpillées, soumettre, et vérifier côté professeur que les réponses ont bien été enregistrées.
