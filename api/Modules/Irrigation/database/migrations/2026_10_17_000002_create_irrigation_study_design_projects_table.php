<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Study & design project records (study-design).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('irrigation_study_design_projects', function (Blueprint $table) {
            $table->id();
            $table->string('fiscal_year', 16)->nullable();
            $table->string('zone')->nullable();
            $table->string('woreda')->nullable();
            $table->string('kebele')->nullable();
            $table->unsignedBigInteger('zone_id')->nullable();
            $table->unsignedBigInteger('woreda_id')->nullable();
            $table->unsignedBigInteger('kebele_id')->nullable();
            $table->string('project_code', 64);
            $table->string('project_name');
            $table->string('study_stage');
            $table->string('study_modality');
            $table->string('water_source');
            $table->string('lead_consultant_or_office');
            $table->decimal('study_cost_etb', 20, 4)->nullable();
            $table->decimal('command_area_hectares', 20, 4);
            $table->integer('beneficiaries_male');
            $table->integer('beneficiaries_female');
            $table->integer('experts_trained_male');
            $table->integer('experts_trained_female');
            $table->boolean('is_construction_ready');
            $table->string('review_status')->nullable();
            $table->string('qa_status')->nullable();
            $table->string('review_notes')->nullable();
            $table->string('reviewed_by')->nullable();
            $table->string('review_ethiopian_date')->nullable();
            $table->string('pipeline_code')->nullable();
            $table->unsignedBigInteger('pipeline_id')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index('fiscal_year');
            $table->index('zone');
            $table->index('project_code');
            $table->index('study_stage');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('irrigation_study_design_projects');
    }
};
