<?php

namespace App\Http\Controllers;

use App\Models\Exam;
use App\Models\TeacherClass;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DocumentController extends Controller
{
    /**
     * Répertorie l'ensemble des documents générés et téléchargés sur la plateforme par classe.
     * Chaque document utilise les informations saisies par l'utilisateur et sa classe.
     */
    public function index(Request $request): JsonResponse
    {
        $teacher = $request->user()?->teacher;

        if (!$teacher) {
            return response()->json([
                'success' => false,
                'message' => 'Profil enseignant requis.',
            ], 403);
        }

        $classes = TeacherClass::where('teacher_id', $teacher->id)
            ->with(['courses.chapters.lessons'])
            ->get();

        $exams = Exam::where('teacher_id', $teacher->id)->get();

        $documents = [];

        // 1. Documents issus des examens/épreuves créés
        foreach ($exams as $exam) {
            $className = 'Classe générale';
            $classId = null;
            if ($exam->course_id) {
                foreach ($classes as $cls) {
                    if ($cls->courses->pluck('id')->contains($exam->course_id)) {
                        $className = $cls->name;
                        $classId = $cls->id;
                        break;
                    }
                }
            }

            // Titre explicite combinant l'intitulé de l'épreuve et sa classe
            $examTitle = trim($exam->title) ?: 'Évaluation';
            $formattedTitle = 'Épreuve : ' . $examTitle;
            if ($className !== 'Classe générale') {
                $formattedTitle .= ' — ' . $className;
            }

            $documents[] = [
                'id'         => 'exam_' . $exam->id,
                'title'      => $formattedTitle,
                'format'     => 'pdf',
                'class_id'   => $classId,
                'class_name' => $className,
                'url'        => url("/exam/{$exam->token}"),
                'created_at' => $exam->created_at?->toISOString() ?? now()->toISOString(),
            ];
        }

        // 2. Documents issus des leçons/fiches de cours
        foreach ($classes as $cls) {
            foreach ($cls->courses as $course) {
                foreach ($course->chapters as $chapter) {
                    foreach ($chapter->lessons as $lesson) {
                        $lessonTitle = trim($lesson->title) ?: trim($course->name);
                        $formattedTitle = "Fiche : {$lessonTitle} — {$cls->name}";

                        $documents[] = [
                            'id'         => 'lesson_' . $lesson->id,
                            'title'      => $formattedTitle,
                            'format'     => 'docx',
                            'class_id'   => $cls->id,
                            'class_name' => $cls->name,
                            'url'        => url("/api/v1/classes/{$cls->id}/courses/{$course->id}"),
                            'created_at' => $lesson->created_at?->toISOString() ?? now()->toISOString(),
                        ];
                    }
                }
            }
        }

        return response()->json([
            'success' => true,
            'data'    => $documents,
        ]);
    }
}
