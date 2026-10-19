<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Design quality-assurance audit records (quality-assurance).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('irrigation_design_quality_audits', function (Blueprint $table) {
            $table->id();
            $table->string('fiscal_year', 16)->nullable();
            $table->string('zone')->nullable();
            $table->string('woreda')->nullable();
            $table->string('kebele')->nullable();
            $table->unsignedBigInteger('zone_id')->nullable();
            $table->unsignedBigInteger('woreda_id')->nullable();
            $table->unsignedBigInteger('kebele_id')->nullable();
            $table->string('qa_certificate_no', 64);
            $table->string('scheme_name');
            $table->string('qa_status');
            $table->foreignId('project_id')->constrained('irrigation_study_design_projects')->nullOnDelete();
            $table->string('qa_ethiopian_date')->nullable();
            $table->string('eth_month')->nullable();
            $table->integer('eth_day')->nullable();
            $table->string('eth_year', 16)->nullable();
            $table->string('qa_domain');
            $table->decimal('command_area_ha', 20, 4);
            $table->string('lead_qa_auditor');
            $table->string('qa_institution');
            $table->integer('compliance_score');
            $table->text('qa_audit_findings')->nullable();
            $table->string('project_code')->nullable();
            $table->string('study_modality')->nullable();
            $table->string('linked_review_code')->nullable();
            $table->string('review_verdict_snapshot')->nullable();
            $table->integer('review_score_snapshot')->nullable();
            $table->boolean('review_cleared')->nullable();
            $table->json('verification_checklist')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index('fiscal_year');
            $table->index('zone');
            $table->index('qa_certificate_no');
            $table->index('qa_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('irrigation_design_quality_audits');
    }
};
