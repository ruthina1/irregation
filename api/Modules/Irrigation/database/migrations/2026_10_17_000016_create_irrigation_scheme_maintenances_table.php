<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Scheme maintenance & cleaning activity records (institutions/maintenance-cleaning).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('irrigation_scheme_maintenances', function (Blueprint $table) {
            $table->id();
            $table->string('fiscal_year', 16);
            $table->string('zone')->nullable();
            $table->string('woreda')->nullable();
            $table->string('kebele')->nullable();
            $table->unsignedBigInteger('zone_id')->nullable();
            $table->unsignedBigInteger('woreda_id')->nullable();
            $table->unsignedBigInteger('kebele_id')->nullable();
            $table->string('scheme_name');
            $table->string('operation_status');
            $table->string('activity_ethiopian_date')->nullable();
            $table->string('eth_month')->nullable();
            $table->integer('eth_day')->nullable();
            $table->string('eth_year', 16)->nullable();
            $table->string('canal_type');
            $table->string('wua_name');
            $table->json('intervention_types');
            $table->decimal('repaired_cleaned_km', 20, 4);
            $table->decimal('command_area_protected_ha', 20, 4);
            $table->decimal('financial_cost_etb', 20, 4)->nullable();
            $table->integer('mobilized_labor_male')->nullable();
            $table->integer('mobilized_labor_female')->nullable();
            $table->string('funding_source');
            $table->string('lead_coordinator');
            $table->text('field_remarks')->nullable();
            $table->integer('total_mobilized_labor')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index('fiscal_year');
            $table->index('zone');
            $table->index('operation_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('irrigation_scheme_maintenances');
    }
};
