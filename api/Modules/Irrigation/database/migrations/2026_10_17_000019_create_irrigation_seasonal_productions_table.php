<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Seasonal crop production record records (production/seasonal-production).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('irrigation_seasonal_productions', function (Blueprint $table) {
            $table->id();
            $table->string('fiscal_year', 16);
            $table->string('zone')->nullable();
            $table->string('woreda')->nullable();
            $table->string('kebele')->nullable();
            $table->unsignedBigInteger('zone_id')->nullable();
            $table->unsignedBigInteger('woreda_id')->nullable();
            $table->unsignedBigInteger('kebele_id')->nullable();
            $table->string('production_code', 64);
            $table->string('scheme_name');
            $table->string('harvest_status');
            $table->string('survey_ethiopian_date')->nullable();
            $table->string('eth_month')->nullable();
            $table->integer('eth_day')->nullable();
            $table->string('eth_year', 16)->nullable();
            $table->string('scheme_code')->nullable();
            $table->string('wua_name')->nullable();
            $table->string('cropping_round');
            $table->string('crop_category');
            $table->string('specific_crop');
            $table->decimal('cultivated_area_ha', 20, 4);
            $table->decimal('production_yield_quintals', 20, 4);
            $table->integer('farmers_male');
            $table->integer('farmers_female');
            $table->string('verifying_agronomist');
            $table->text('agronomic_remarks')->nullable();
            $table->decimal('productivity_qt_per_ha', 20, 4)->nullable();
            $table->integer('total_farmers')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index('fiscal_year');
            $table->index('zone');
            $table->index('production_code');
            $table->index('harvest_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('irrigation_seasonal_productions');
    }
};
