<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Water source & irrigation technology records (water-utilization/water-sources).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('irrigation_water_sources', function (Blueprint $table) {
            $table->id();
            $table->string('fiscal_year', 16);
            $table->string('zone')->nullable();
            $table->string('woreda')->nullable();
            $table->string('kebele')->nullable();
            $table->unsignedBigInteger('zone_id')->nullable();
            $table->unsignedBigInteger('woreda_id')->nullable();
            $table->unsignedBigInteger('kebele_id')->nullable();
            $table->string('scheme_name');
            $table->string('operational_status');
            $table->string('wua_name');
            $table->string('technology_type');
            $table->integer('equipment_units_count');
            $table->decimal('discharge_capacity_liters_sec', 20, 4);
            $table->decimal('command_area_served_ha', 20, 4);
            $table->string('energy_source');
            $table->integer('farmers_male');
            $table->integer('farmers_female');
            $table->string('installation_eth_year');
            $table->text('technical_specs')->nullable();
            $table->string('source_category')->nullable();
            $table->integer('total_farmers')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index('fiscal_year');
            $table->index('zone');
            $table->index('operational_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('irrigation_water_sources');
    }
};
