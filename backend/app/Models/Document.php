<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Document extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'name', 'path', 'category', 'type', 'size', 'date_uploaded'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
