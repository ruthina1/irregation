<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Irrigated land utilization record records (water-utilization/irrigated-area).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('irrigation_irrigated_areas', function (Blueprint $table) {
            $table->id();
            $table->string('fiscal_year', 16);
            $table->string('zone')->nullable();
            $table->string('woreda')->nullable();
            $table->string('kebele')->nullable();
            $table->unsignedBigInteger('zone_id')->nullable();
            $table->unsignedBigInteger('woreda_id')->nullable();
            $table->unsignedBigInteger('kebele_id')->nullable();
            $table->string('utilization_code', 64);
            $table->string('scheme_name');
            $table->string('water_adequacy_status');
            $table->string('reporting_ethiopian_date')->nullable();
            $table->string('eth_month')->nullable();
            $table->integer('eth_day')->nullable();
            $table->string('eth_year', 16)->nullable();
            $table->string('scheme_code');
            $table->string('cropping_round');
            $table->string('wua_name');
            $table->string('land_modality');
            $table->string('expansion_method');
            $table->decimal('planned_command_ha', 20, 4);
            $table->decimal('actual_irrigated_ha', 20, 4);
            $table->decimal('expansion_area_ha', 20, 4)->nullable();
            $table->integer('farmers_male');
            $table->integer('farmers_female');
            $table->text('dominant_crops');
            $table->string('verifying_expert');
            $table->text('field_observations')->nullable();
            $table->decimal('total_effective_irrigated_ha', 20, 4)->nullable();
            $table->decimal('utilization_rate_pct', 20, 4)->nullable();
            $table->integer('total_farmers')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index('fiscal_year');
            $table->index('zone');
            $table->index('utilization_code');
            $table->index('water_adequacy_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('irrigation_irrigated_areas');
    }
};
