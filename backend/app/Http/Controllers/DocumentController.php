<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Document;
use Illuminate\Http\JsonResponse;

class DocumentController extends Controller
{
    /**
     * Get the authenticated teacher's documents.
     */
    public function index(Request $request): JsonResponse
    {
        $teacherId = $request->user()->id;
        
        $documents = Document::where('teacher_id', $teacherId)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $documents
        ]);
    }
}
