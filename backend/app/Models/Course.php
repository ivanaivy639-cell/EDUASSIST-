<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
    use HasFactory;

    protected $fillable = ['teacher_class_id', 'name'];

    public function teacherClass()
    {
        return $this->belongsTo(TeacherClass::class);
    }

    public function chapters()
    {
        return $this->hasMany(Chapter::class);
    }
}
