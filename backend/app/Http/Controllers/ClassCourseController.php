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
        ]);

        return response()->json([
            'success' => true,
            'data' => $class,
            'message' => 'Classe créée avec succès.'
        ], 201);
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
}
