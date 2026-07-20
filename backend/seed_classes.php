<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Teacher;
use App\Models\TeacherClass;
use App\Models\Course;

$teachers = Teacher::all();

foreach ($teachers as $teacher) {
    if ($teacher->classes()->count() > 0) continue;

    // Classe 1
    $class1 = TeacherClass::create(['teacher_id' => $teacher->id, 'name' => '6ème A']);
    Course::create(['teacher_class_id' => $class1->id, 'name' => 'Mathématiques']);
    Course::create(['teacher_class_id' => $class1->id, 'name' => 'Physique-Chimie']);

    // Classe 2
    $class2 = TeacherClass::create(['teacher_id' => $teacher->id, 'name' => '3ème B']);
    Course::create(['teacher_class_id' => $class2->id, 'name' => 'Mathématiques']);
    Course::create(['teacher_class_id' => $class2->id, 'name' => 'SVT']);
    Course::create(['teacher_class_id' => $class2->id, 'name' => 'Informatique']);

    // Classe 3
    $class3 = TeacherClass::create(['teacher_id' => $teacher->id, 'name' => 'Terminale C']);
    Course::create(['teacher_class_id' => $class3->id, 'name' => 'Mathématiques']);
    Course::create(['teacher_class_id' => $class3->id, 'name' => 'Physique']);
}

echo "Seeded classes and courses for " . $teachers->count() . " teachers.\n";
