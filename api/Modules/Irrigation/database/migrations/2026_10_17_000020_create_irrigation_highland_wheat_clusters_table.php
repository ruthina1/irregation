<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Highland irrigated wheat cluster records (production/highland-wheat).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('irrigation_highland_wheat_clusters', function (Blueprint $table) {
            $table->id();
            $table->string('fiscal_year', 16);
            $table->string('zone')->nullable();
            $table->string('woreda')->nullable();
            $table->string('kebele')->nullable();
            $table->unsignedBigInteger('zone_id')->nullable();
            $table->unsignedBigInteger('woreda_id')->nullable();
            $table->unsignedBigInteger('kebele_id')->nullable();
            $table->string('initiative_code', 64);
            $table->string('scheme_name');
            $table->string('verification_status');
            $table->string('field_survey_eth_date')->nullable();
            $table->string('eth_month')->nullable();
            $table->integer('eth_day')->nullable();
            $table->string('eth_year', 16)->nullable();
            $table->string('scheme_code')->nullable();
            $table->string('wua_name')->nullable();
            $table->string('cropping_round');
            $table->string('wheat_variety');
            $table->string('cluster_block_code');
            $table->decimal('wheat_command_ha', 20, 4);
            $table->decimal('expected_yield_qt', 20, 4);
            $table->integer('farmers_male');
            $table->integer('farmers_female');
            $table->boolean('mechanized_harvesting')->nullable();
            $table->string('lead_agronomist');
            $table->text('initiative_notes')->nullable();
            $table->decimal('productivity_qt_ha', 20, 4)->nullable();
            $table->integer('total_farmers')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index('fiscal_year');
            $table->index('zone');
            $table->index('initiative_code');
            $table->index('verification_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('irrigation_highland_wheat_clusters');
    }
};
