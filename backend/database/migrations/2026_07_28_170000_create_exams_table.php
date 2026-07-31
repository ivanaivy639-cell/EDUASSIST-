<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('exams', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('teacher_id');
            $table->unsignedBigInteger('course_id')->nullable();
            $table->string('title');
            $table->longText('content'); // Énoncé de l'épreuve (Markdown)
            $table->longText('answer_key')->nullable(); // Corrigé type
            $table->string('token', 24)->unique(); // Lien public unique
            $table->integer('duration_minutes'); // Durée définie par le prof
            $table->integer('max_score')->default(20);
            $table->boolean('is_active')->default(true);
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->json('settings')->nullable(); // Config anti-triche, etc.
            $table->timestamps();

            $table->foreign('teacher_id')->references('id')->on('teachers')->onDelete('cascade');
            $table->foreign('course_id')->references('id')->on('courses')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exams');
    }
};
