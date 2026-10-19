<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Kebele extends Model
{
    use HasFactory;

    protected $fillable = [
        'woreda_id',
        'name',
        'code',
        'total_area_ha',
        'arable_land_area_ha',
        'elevation_meters',
        'ecology_type',
        'average_annual_rainfall_mm',
    ];

    protected $casts = [
        'total_area_ha' => 'decimal:2',
        'arable_land_area_ha' => 'decimal:2',
        'elevation_meters' => 'integer',
        'average_annual_rainfall_mm' => 'decimal:2',
    ];

    public function woreda(): BelongsTo
    {
        return $this->belongsTo(Woreda::class);
    }
}
