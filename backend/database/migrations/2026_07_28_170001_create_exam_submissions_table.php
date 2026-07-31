<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('exam_submissions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('exam_id');
            $table->string('student_name');
            $table->string('student_matricule');
            $table->longText('answers')->nullable(); // Réponses de l'étudiant
            $table->decimal('score', 5, 2)->nullable(); // Note après correction IA
            $table->integer('max_score')->default(20);
            $table->longText('ai_feedback')->nullable(); // Feedback détaillé de l'IA
            $table->timestamp('started_at');
            $table->timestamp('submitted_at')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->integer('tab_switches')->default(0); // Nombre de sorties d'écran
            $table->boolean('is_auto_submitted')->default(false); // Soumission auto (temps ou triche)
            $table->enum('status', [
                'in_progress',
                'submitted',
                'graded',
                'expired',
                'disqualified'
            ])->default('in_progress');
            $table->timestamps();

            $table->foreign('exam_id')->references('id')->on('exams')->onDelete('cascade');
            $table->unique(['exam_id', 'student_matricule']); // Un étudiant ne compose qu'une fois
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exam_submissions');
    }
};
