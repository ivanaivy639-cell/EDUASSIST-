<?php

namespace App\Http\Controllers\Ai;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use PhpOffice\PhpWord\IOFactory;
use Smalot\PdfParser\Parser as PdfParser;

class AiDocumentController extends Controller
{
    public function parseDocument(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|max:10240|mimes:pdf,doc,docx,txt', // 10MB max
        ]);

        try {
            $file = $request->file('file');
            $extension = strtolower($file->getClientOriginalExtension());
            $path = $file->getRealPath();
            $text = '';

            if ($extension === 'pdf') {
                $parser = new PdfParser();
                $pdf = $parser->parseFile($path);
                $text = $pdf->getText();
            } elseif (in_array($extension, ['doc', 'docx'])) {
                $phpWord = IOFactory::load($path);
                foreach ($phpWord->getSections() as $section) {
                    foreach ($section->getElements() as $element) {
                        if (method_exists($element, 'getText')) {
                            $text .= $element->getText() . "\n";
                        } elseif (method_exists($element, 'getElements')) {
                            foreach ($element->getElements() as $childElement) {
                                if (method_exists($childElement, 'getText')) {
                                    $text .= $childElement->getText() . " ";
                                }
                            }
                            $text .= "\n";
                        }
                    }
                }
            } elseif ($extension === 'txt') {
                $text = file_get_contents($path);
            }

            // Clean up text
            $text = trim(preg_replace('/\s+/', ' ', $text));

            // Truncate to ~12000 characters (approx 3000 tokens) to avoid Groq 6000 TPM limit
            if (mb_strlen($text) > 12000) {
                $text = mb_substr($text, 0, 12000) . "\n\n[Note: Le document a été tronqué car il est trop volumineux pour l'IA.]";
            }

            if (empty($text)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Le document semble être vide ou illisible.',
                ], 400);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'text' => $text,
                    'file_name' => $file->getClientOriginalName()
                ],
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur lors du parsing du document', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Impossible d\'analyser ce document : ' . $e->getMessage(),
            ], 500);
        }
    }
}
