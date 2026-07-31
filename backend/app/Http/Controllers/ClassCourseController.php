<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ClassCourseController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $teacher = $request->user()?->teacher;

        if (!$teacher) {
            return response()->json([
                'success' => false,
                'message' => 'Profil enseignant requis.',
            ], 403);
        }

        $classes = $teacher->classes()->with('courses')->get();

        return response()->json([
            'success' => true,
            'data' => $classes,
        ]);
    }

    public function show(Request $request, $classId): JsonResponse
    {
        $teacher = $request->user()?->teacher;

        if (!$teacher) {
            return response()->json([
                'success' => false,
                'message' => 'Profil enseignant requis.',
            ], 403);
        }

        $class = $teacher->classes()->with('courses')->find($classId);

        if (!$class) {
            return response()->json([
                'success' => false,
                'message' => 'Classe non trouvée.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $class,
        ]);
    }
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'level' => 'nullable|string|max:100',
        ]);

        $teacher = $request->user()?->teacher;

        if (!$teacher) {
            return response()->json([
                'success' => false,
                'message' => 'Profil enseignant requis.',
            ], 403);
        }

        $class = $teacher->classes()->create([
            'name' => $request->name,
            'level' => $request->level,
        ]);

        return response()->json([
            'success' => true,
            'data' => $class,
            'message' => 'Classe créée avec succès.'
        ], 201);
    }

    public function update(Request $request, $classId): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'level' => 'nullable|string|max:100',
        ]);

        $teacher = $request->user()?->teacher;
        if (!$teacher) {
            return response()->json(['success' => false, 'message' => 'Profil enseignant requis.'], 403);
        }

        $class = $teacher->classes()->find($classId);
        if (!$class) {
            return response()->json(['success' => false, 'message' => 'Classe non trouvée.'], 404);
        }

        $class->update([
            'name' => $request->name,
            'level' => $request->level,
        ]);

        return response()->json([
            'success' => true,
            'data' => $class,
            'message' => 'Classe mise à jour avec succès.'
        ]);
    }

    public function destroy(Request $request, $classId): JsonResponse
    {
        $teacher = $request->user()?->teacher;
        if (!$teacher) {
            return response()->json(['success' => false, 'message' => 'Profil enseignant requis.'], 403);
        }

        $class = $teacher->classes()->find($classId);
        if (!$class) {
            return response()->json(['success' => false, 'message' => 'Classe non trouvée.'], 404);
        }

        $class->delete(); // Cascades on DB level or Eloquent depending on setup, but typically courses are linked

        return response()->json([
            'success' => true,
            'message' => 'Classe supprimée avec succès.'
        ]);
    }

    public function storeCourse(Request $request, $classId): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $teacher = $request->user()?->teacher;

        if (!$teacher) {
            return response()->json([
                'success' => false,
                'message' => 'Profil enseignant requis.',
            ], 403);
        }

        $class = $teacher->classes()->find($classId);

        if (!$class) {
            return response()->json([
                'success' => false,
                'message' => 'Classe non trouvée ou accès refusé.',
            ], 404);
        }

        $course = $class->courses()->create([
            'name' => $request->name,
        ]);

        return response()->json([
            'success' => true,
            'data' => $course,
            'message' => 'Cours créé avec succès.'
        ], 201);
    }

    public function updateCourse(Request $request, $classId, $courseId): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $teacher = $request->user()?->teacher;
        if (!$teacher) {
            return response()->json(['success' => false, 'message' => 'Profil enseignant requis.'], 403);
        }

        $class = $teacher->classes()->find($classId);
        if (!$class) {
            return response()->json(['success' => false, 'message' => 'Classe non trouvée.'], 404);
        }

        $course = $class->courses()->find($courseId);
        if (!$course) {
            return response()->json(['success' => false, 'message' => 'Cours non trouvé.'], 404);
        }

        $course->update([
            'name' => $request->name,
        ]);

        return response()->json([
            'success' => true,
            'data' => $course,
            'message' => 'Cours mis à jour avec succès.'
        ]);
    }

    public function destroyCourse(Request $request, $classId, $courseId): JsonResponse
    {
        $teacher = $request->user()?->teacher;
        if (!$teacher) {
            return response()->json(['success' => false, 'message' => 'Profil enseignant requis.'], 403);
        }

        $class = $teacher->classes()->find($classId);
        if (!$class) {
            return response()->json(['success' => false, 'message' => 'Classe non trouvée.'], 404);
        }

        $course = $class->courses()->find($courseId);
        if (!$course) {
            return response()->json(['success' => false, 'message' => 'Cours non trouvé.'], 404);
        }

        $course->delete();

        return response()->json([
            'success' => true,
            'message' => 'Cours supprimé avec succès.'
        ]);
    }

    public function showCourse(Request $request, $classId, $courseId): JsonResponse
    {
        $teacher = $request->user()?->teacher;
        if (!$teacher) {
            return response()->json(['success' => false, 'message' => 'Profil enseignant requis.'], 403);
        }

        $class = $teacher->classes()->find($classId);
        if (!$class) {
            return response()->json(['success' => false, 'message' => 'Classe non trouvée.'], 404);
        }

        $course = $class->courses()->with('chapters.lessons')->find($courseId);
        if (!$course) {
            return response()->json(['success' => false, 'message' => 'Cours non trouvé.'], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $course,
        ]);
    }

    public function storeChapter(Request $request, $classId, $courseId): JsonResponse
    {
        $request->validate([
            'title' => 'required|string|max:255',
        ]);

        $teacher = $request->user()?->teacher;
        if (!$teacher) return response()->json(['success' => false, 'message' => 'Non autorisé'], 403);

        $course = $teacher->classes()->find($classId)?->courses()->find($courseId);
        if (!$course) return response()->json(['success' => false, 'message' => 'Cours introuvable'], 404);

        $chapter = $course->chapters()->create(['title' => $request->title]);

        return response()->json(['success' => true, 'data' => $chapter], 201);
    }

    public function destroyChapter(Request $request, $classId, $courseId, $chapterId): JsonResponse
    {
        $teacher = $request->user()?->teacher;
        if (!$teacher) return response()->json(['success' => false, 'message' => 'Non autorisé'], 403);

        $chapter = $teacher->classes()->find($classId)?->courses()->find($courseId)?->chapters()->find($chapterId);
        if (!$chapter) return response()->json(['success' => false, 'message' => 'Chapitre introuvable'], 404);

        $chapter->delete();

        return response()->json(['success' => true, 'message' => 'Chapitre supprimé']);
    }

    public function storeLesson(Request $request, $classId, $courseId, $chapterId): JsonResponse
    {
        $request->validate([
            'title' => 'required|string|max:255',
        ]);

        $teacher = $request->user()?->teacher;
        if (!$teacher) return response()->json(['success' => false, 'message' => 'Non autorisé'], 403);

        $chapter = $teacher->classes()->find($classId)?->courses()->find($courseId)?->chapters()->find($chapterId);
        if (!$chapter) return response()->json(['success' => false, 'message' => 'Chapitre introuvable'], 404);

        $lesson = $chapter->lessons()->create(['title' => $request->title]);

        return response()->json(['success' => true, 'data' => $lesson], 201);
    }

    public function destroyLesson(Request $request, $classId, $courseId, $chapterId, $lessonId): JsonResponse
    {
        $teacher = $request->user()?->teacher;
        if (!$teacher) return response()->json(['success' => false, 'message' => 'Non autorisé'], 403);

        $lesson = $teacher->classes()->find($classId)?->courses()->find($courseId)?->chapters()->find($chapterId)?->lessons()->find($lessonId);
        if (!$lesson) return response()->json(['success' => false, 'message' => 'Leçon introuvable'], 404);

        $lesson->delete();

        return response()->json(['success' => true, 'message' => 'Leçon supprimée']);
    }
}
