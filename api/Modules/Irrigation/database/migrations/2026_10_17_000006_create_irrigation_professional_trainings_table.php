<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Professional capacity-building training records (capacity-building).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('irrigation_professional_trainings', function (Blueprint $table) {
            $table->id();
            $table->string('fiscal_year', 16)->nullable();
            $table->string('zone')->nullable();
            $table->string('woreda')->nullable();
            $table->string('kebele')->nullable();
            $table->unsignedBigInteger('zone_id')->nullable();
            $table->unsignedBigInteger('woreda_id')->nullable();
            $table->unsignedBigInteger('kebele_id')->nullable();
            $table->string('training_code', 64);
            $table->string('training_status');
            $table->string('ethiopian_date')->nullable();
            $table->string('eth_month')->nullable();
            $table->integer('eth_day')->nullable();
            $table->string('eth_year', 16)->nullable();
            $table->string('course_title');
            $table->string('discipline');
            $table->string('target_tier');
            $table->string('sponsoring_program');
            $table->string('training_venue');
            $table->integer('training_duration_days');
            $table->integer('male_participants');
            $table->integer('female_participants');
            $table->string('lead_trainer');
            $table->text('course_objectives')->nullable();
            $table->integer('total_participants')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index('fiscal_year');
            $table->index('zone');
            $table->index('training_code');
            $table->index('training_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('irrigation_professional_trainings');
    }
};
