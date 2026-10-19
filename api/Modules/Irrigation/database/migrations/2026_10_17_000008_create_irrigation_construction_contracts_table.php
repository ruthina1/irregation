<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Construction contract records (construction/projects).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('irrigation_construction_contracts', function (Blueprint $table) {
            $table->id();
            $table->string('fiscal_year', 16)->nullable();
            $table->string('zone')->nullable();
            $table->string('woreda')->nullable();
            $table->string('kebele')->nullable();
            $table->unsignedBigInteger('zone_id')->nullable();
            $table->unsignedBigInteger('woreda_id')->nullable();
            $table->unsignedBigInteger('kebele_id')->nullable();
            $table->string('contract_code', 64);
            $table->string('scheme_name');
            $table->string('construction_status');
            $table->string('contract_signing_eth_date')->nullable();
            $table->string('eth_start_month')->nullable();
            $table->integer('eth_start_day')->nullable();
            $table->string('eth_start_year', 16)->nullable();
            $table->string('planned_completion_eth_date')->nullable();
            $table->string('eth_end_month')->nullable();
            $table->integer('eth_end_day')->nullable();
            $table->string('eth_end_year', 16)->nullable();
            $table->string('project_code');
            $table->string('scheme_type');
            $table->string('funding_source');
            $table->string('contractor_name');
            $table->string('contractor_grade');
            $table->string('consultant_supervisor');
            $table->decimal('contract_sum_etb', 20, 4);
            $table->integer('defect_liability_months');
            $table->decimal('physical_progress_pct', 20, 4);
            $table->decimal('command_area_ha', 20, 4);
            $table->integer('beneficiaries_male');
            $table->integer('beneficiaries_female');
            $table->text('site_progress_notes')->nullable();
            $table->decimal('disbursed_sum_etb', 20, 4)->nullable();
            $table->decimal('financial_progress_pct', 20, 4)->nullable();
            $table->decimal('planned_progress_pct', 20, 4)->nullable();
            $table->string('health_status')->nullable();
            $table->decimal('weir_concreting_pct', 20, 4)->nullable();
            $table->decimal('canal_excavation_pct', 20, 4)->nullable();
            $table->decimal('canal_lining_km', 20, 4)->nullable();
            $table->decimal('target_canal_lining_km', 20, 4)->nullable();
            $table->integer('gates_installed_count')->nullable();
            $table->integer('target_gates_count')->nullable();
            $table->string('resident_engineer')->nullable();
            $table->string('reporting_ethiopian_date')->nullable();
            $table->integer('total_beneficiaries')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index('fiscal_year');
            $table->index('zone');
            $table->index('contract_code');
            $table->index('construction_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('irrigation_construction_contracts');
    }
};
