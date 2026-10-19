<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Design document review records (document-review).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('irrigation_design_document_reviews', function (Blueprint $table) {
            $table->id();
            $table->string('fiscal_year', 16)->nullable();
            $table->string('zone')->nullable();
            $table->string('woreda')->nullable();
            $table->string('kebele')->nullable();
            $table->unsignedBigInteger('zone_id')->nullable();
            $table->unsignedBigInteger('woreda_id')->nullable();
            $table->unsignedBigInteger('kebele_id')->nullable();
            $table->string('review_code', 64);
            $table->string('scheme_name');
            $table->string('review_verdict');
            $table->foreignId('project_id')->constrained('irrigation_study_design_projects')->nullOnDelete();
            $table->string('review_ethiopian_date')->nullable();
            $table->string('eth_month')->nullable();
            $table->integer('eth_day')->nullable();
            $table->string('eth_year', 16)->nullable();
            $table->string('submitting_entity');
            $table->decimal('command_area_ha', 20, 4);
            $table->string('review_milestone');
            $table->string('document_volume');
            $table->string('submission_version');
            $table->string('lead_reviewer');
            $table->integer('review_team_size')->nullable();
            $table->integer('overall_technical_score');
            $table->text('technical_remarks')->nullable();
            $table->string('project_code')->nullable();
            $table->string('document_source')->nullable();
            $table->json('disciplinary_checklist')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index('fiscal_year');
            $table->index('zone');
            $table->index('review_code');
            $table->index('review_verdict');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('irrigation_design_document_reviews');
    }
};
