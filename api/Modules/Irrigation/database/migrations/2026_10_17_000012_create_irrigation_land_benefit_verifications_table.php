<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Developed land & beneficiaries verification records (construction/benefits).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('irrigation_land_benefit_verifications', function (Blueprint $table) {
            $table->id();
            $table->string('fiscal_year', 16)->nullable();
            $table->string('zone')->nullable();
            $table->string('woreda')->nullable();
            $table->string('kebele')->nullable();
            $table->unsignedBigInteger('zone_id')->nullable();
            $table->unsignedBigInteger('woreda_id')->nullable();
            $table->unsignedBigInteger('kebele_id')->nullable();
            $table->string('benefit_code', 64);
            $table->string('scheme_name');
            $table->string('benefit_status');
            $table->string('verification_ethiopian_date')->nullable();
            $table->string('eth_month')->nullable();
            $table->integer('eth_day')->nullable();
            $table->string('eth_year', 16)->nullable();
            $table->string('contract_code');
            $table->string('project_code')->nullable();
            $table->string('scheme_type');
            $table->string('funding_source');
            $table->decimal('planned_command_ha', 20, 4);
            $table->decimal('actual_developed_ha', 20, 4);
            $table->decimal('operational_cultivated_ha', 20, 4);
            $table->integer('beneficiaries_male');
            $table->integer('beneficiaries_female');
            $table->integer('youth_beneficiaries_count')->nullable();
            $table->json('primary_crops_cultivated');
            $table->decimal('cropping_intensity_ratio', 20, 4);
            $table->string('verifying_agronomist');
            $table->text('field_survey_remarks')->nullable();
            $table->decimal('land_development_rate_pct', 20, 4)->nullable();
            $table->integer('total_beneficiaries')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index('fiscal_year');
            $table->index('zone');
            $table->index('benefit_code');
            $table->index('benefit_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('irrigation_land_benefit_verifications');
    }
};
