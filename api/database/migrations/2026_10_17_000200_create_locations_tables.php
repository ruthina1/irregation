<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('zones', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('woredas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('zone_id')->constrained('zones')->cascadeOnDelete();
            $table->string('name');
            $table->string('code')->nullable();
            $table->boolean('is_food_insecure')->default(false);
            $table->timestamps();
        });

        Schema::create('kebeles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('woreda_id')->constrained('woredas')->cascadeOnDelete();
            $table->string('name');
            $table->string('code')->nullable();
            $table->decimal('total_area_ha', 12, 2)->nullable();
            $table->decimal('arable_land_area_ha', 12, 2)->nullable();
            $table->integer('elevation_meters')->nullable();
            $table->string('ecology_type')->nullable();
            $table->decimal('average_annual_rainfall_mm', 8, 2)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kebeles');
        Schema::dropIfExists('woredas');
        Schema::dropIfExists('zones');
    }
};
