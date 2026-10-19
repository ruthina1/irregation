<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Pipeline project records (pipeline).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('irrigation_pipeline_projects', function (Blueprint $table) {
            $table->id();
            $table->string('fiscal_year', 16)->nullable();
            $table->string('zone')->nullable();
            $table->string('woreda')->nullable();
            $table->string('kebele')->nullable();
            $table->unsignedBigInteger('zone_id')->nullable();
            $table->unsignedBigInteger('woreda_id')->nullable();
            $table->unsignedBigInteger('kebele_id')->nullable();
            $table->string('pipeline_code', 64);
            $table->string('scheme_name');
            $table->string('pipeline_status');
            $table->string('initiative_source');
            $table->string('water_source');
            $table->string('priority_level');
            $table->decimal('potential_area_ha', 20, 4);
            $table->decimal('estimated_budget_etb', 20, 4)->nullable();
            $table->integer('estimated_beneficiaries_male');
            $table->integer('estimated_beneficiaries_female');
            $table->text('site_notes')->nullable();
            $table->boolean('promoted_to_study')->nullable();
            $table->string('reconnaissance_expert')->nullable();
            $table->string('reconnaissance_ethiopian_date')->nullable();
            $table->unsignedBigInteger('promoted_study_id')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index('fiscal_year');
            $table->index('zone');
            $table->index('pipeline_code');
            $table->index('pipeline_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('irrigation_pipeline_projects');
    }
};
