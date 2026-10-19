<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Construction progress log records (construction/progress).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('irrigation_construction_progress_logs', function (Blueprint $table) {
            $table->id();
            $table->string('fiscal_year', 16)->nullable();
            $table->string('zone')->nullable();
            $table->string('woreda')->nullable();
            $table->string('kebele')->nullable();
            $table->unsignedBigInteger('zone_id')->nullable();
            $table->unsignedBigInteger('woreda_id')->nullable();
            $table->unsignedBigInteger('kebele_id')->nullable();
            $table->string('progress_log_code', 64);
            $table->string('scheme_name');
            $table->string('health_status');
            $table->foreignId('contract_id')->constrained('irrigation_construction_contracts')->nullOnDelete();
            $table->string('reporting_ethiopian_date')->nullable();
            $table->string('eth_month')->nullable();
            $table->integer('eth_day')->nullable();
            $table->string('eth_year', 16)->nullable();
            $table->text('site_engineering_remarks')->nullable();
            $table->decimal('planned_progress_pct', 20, 4);
            $table->decimal('physical_progress_pct', 20, 4);
            $table->decimal('financial_progress_pct', 20, 4);
            $table->decimal('weir_concreting_pct', 20, 4);
            $table->decimal('canal_excavation_pct', 20, 4);
            $table->decimal('canal_lining_km', 20, 4);
            $table->decimal('target_canal_lining_km', 20, 4);
            $table->integer('gates_installed_count');
            $table->integer('target_gates_count');
            $table->string('resident_engineer');
            $table->string('contract_code')->nullable();
            $table->string('project_code')->nullable();
            $table->string('scheme_type')->nullable();
            $table->decimal('contract_sum_etb', 20, 4)->nullable();
            $table->decimal('command_area_ha', 20, 4)->nullable();
            $table->decimal('disbursed_sum_etb', 20, 4)->nullable();
            $table->decimal('variance_pct', 20, 4)->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index('fiscal_year');
            $table->index('zone');
            $table->index('progress_log_code');
            $table->index('health_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('irrigation_construction_progress_logs');
    }
};
