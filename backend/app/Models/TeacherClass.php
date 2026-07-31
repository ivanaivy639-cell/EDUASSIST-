<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TeacherClass extends Model
{
    use HasFactory;

    protected $fillable = ['teacher_id', 'name', 'level'];

    public function teacher()
    {
        return $this->belongsTo(Teacher::class);
    }

    public function courses()
    {
        return $this->hasMany(Course::class);
    }
}
