<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Construction-ready design records (construction-ready).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('irrigation_construction_ready_designs', function (Blueprint $table) {
            $table->id();
            $table->string('fiscal_year', 16)->nullable();
            $table->string('zone')->nullable();
            $table->string('woreda')->nullable();
            $table->string('kebele')->nullable();
            $table->unsignedBigInteger('zone_id')->nullable();
            $table->unsignedBigInteger('woreda_id')->nullable();
            $table->unsignedBigInteger('kebele_id')->nullable();
            $table->string('shelf_code', 64);
            $table->string('scheme_name');
            $table->string('shelf_status');
            $table->foreignId('project_id')->constrained('irrigation_study_design_projects')->nullOnDelete();
            $table->string('preferred_funding_channel')->nullable();
            $table->decimal('estimated_construction_etb', 20, 4)->nullable();
            $table->string('scheme_type')->nullable();
            $table->text('procurement_remarks')->nullable();
            $table->string('project_code')->nullable();
            $table->string('study_modality')->nullable();
            $table->string('water_source')->nullable();
            $table->decimal('command_area_ha', 20, 4)->nullable();
            $table->integer('beneficiaries_male')->nullable();
            $table->integer('beneficiaries_female')->nullable();
            $table->string('qa_certificate_no')->nullable();
            $table->string('shelf_entry_ethiopian_date')->nullable();
            $table->json('tender_dossier')->nullable();
            $table->json('handover_details')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index('fiscal_year');
            $table->index('zone');
            $table->index('shelf_code');
            $table->index('shelf_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('irrigation_construction_ready_designs');
    }
};
