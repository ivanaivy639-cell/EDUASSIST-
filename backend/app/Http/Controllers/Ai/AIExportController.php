<?php

namespace App\Http\Controllers\Ai;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;
use PhpOffice\PhpWord\PhpWord;
use PhpOffice\PhpWord\IOFactory;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Parsedown;
use App\Models\Document;

class AIExportController extends Controller
{
    public function exportChatResponse(Request $request)
    {
        $request->validate([
            'chat_text' => 'required|string',
            'format' => 'required|in:pdf,word',
            'title' => 'nullable|string'
        ]);

        $text = $request->input('chat_text');
        $format = $request->input('format');
        $title = $request->input('title', 'Document généré');
        
        // Convertir le Markdown en HTML
        $parsedown = new Parsedown();
        $htmlContent = $parsedown->text($text);
        
        $fileName = 'eduassist_export_' . time() . '_' . Str::random(5);

        if ($format === 'pdf') {
            $pdf = Pdf::setOptions(['isRemoteEnabled' => true, 'chroot' => public_path()])
                      ->loadView('exports.chat', ['htmlContent' => $htmlContent]);
            Storage::disk('public')->put("exports/{$fileName}.pdf", $pdf->output());
            $url = asset("storage/exports/{$fileName}.pdf");
        } else {
            $phpWord = new PhpWord();
            $section = $phpWord->addSection();
            
            \PhpOffice\PhpWord\Shared\Html::addHtml($section, $htmlContent, false, false);
            
            $objWriter = IOFactory::createWriter($phpWord, 'Word2007');
            
            if (!Storage::disk('public')->exists('exports')) {
                Storage::disk('public')->makeDirectory('exports');
            }
            
            $path = storage_path("app/public/exports/{$fileName}.docx");
            $objWriter->save($path);
            $url = asset("storage/exports/{$fileName}.docx");
        }

        // Save to Database
        if ($request->user()) {
            Document::create([
                'teacher_id' => $request->user()->id,
                'title' => $title,
                'format' => $format,
                'url' => $url,
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'download_url' => $url
            ]
        ]);
    }
}
