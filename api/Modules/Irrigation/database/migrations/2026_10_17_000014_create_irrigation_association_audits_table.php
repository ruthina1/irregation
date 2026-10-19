<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * WUA strengthening audit records (institutions/assessment-audit).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('irrigation_association_audits', function (Blueprint $table) {
            $table->id();
            $table->string('fiscal_year', 16);
            $table->string('zone')->nullable();
            $table->string('woreda')->nullable();
            $table->string('kebele')->nullable();
            $table->unsignedBigInteger('zone_id')->nullable();
            $table->unsignedBigInteger('woreda_id')->nullable();
            $table->unsignedBigInteger('kebele_id')->nullable();
            $table->string('audit_code', 64);
            $table->string('scheme_name');
            $table->string('audit_verdict');
            $table->foreignId('wua_id')->constrained('irrigation_water_users_associations')->nullOnDelete();
            $table->string('audit_ethiopian_date')->nullable();
            $table->string('eth_month')->nullable();
            $table->integer('eth_day')->nullable();
            $table->string('eth_year', 16)->nullable();
            $table->string('audit_scope');
            $table->string('governance_grade');
            $table->integer('overall_health_score');
            $table->decimal('audited_revenue_etb', 20, 4);
            $table->decimal('audited_expense_etb', 20, 4);
            $table->decimal('unaccounted_variance_etb', 20, 4)->nullable();
            $table->string('lead_auditor');
            $table->string('audit_institution')->nullable();
            $table->text('strengthening_interventions')->nullable();
            $table->json('audit_history')->nullable();
            $table->string('wua_reg_code')->nullable();
            $table->string('wua_name')->nullable();
            $table->decimal('command_area_ha', 20, 4)->nullable();
            $table->integer('total_members')->nullable();
            $table->json('compliance_checklist')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index('fiscal_year');
            $table->index('zone');
            $table->index('audit_code');
            $table->index('audit_verdict');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('irrigation_association_audits');
    }
};
