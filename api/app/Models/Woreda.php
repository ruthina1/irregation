<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Woreda extends Model
{
    use HasFactory;

    protected $fillable = [
        'zone_id',
        'name',
        'code',
        'is_food_insecure',
    ];

    protected $casts = [
        'is_food_insecure' => 'boolean',
    ];

    public function zone(): BelongsTo
    {
        return $this->belongsTo(Zone::class);
    }

    public function kebeles(): HasMany
    {
        return $this->hasMany(Kebele::class);
    }
}
