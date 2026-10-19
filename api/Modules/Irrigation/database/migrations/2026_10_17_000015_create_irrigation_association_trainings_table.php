<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * WUA capacity-building training records (institutions/capacity-building).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('irrigation_association_trainings', function (Blueprint $table) {
            $table->id();
            $table->string('fiscal_year', 16);
            $table->string('zone')->nullable();
            $table->string('woreda')->nullable();
            $table->string('kebele')->nullable();
            $table->unsignedBigInteger('zone_id')->nullable();
            $table->unsignedBigInteger('woreda_id')->nullable();
            $table->unsignedBigInteger('kebele_id')->nullable();
            $table->string('training_code', 64);
            $table->string('scheme_name');
            $table->string('training_status');
            $table->foreignId('wua_id')->constrained('irrigation_water_users_associations')->nullOnDelete();
            $table->string('ethiopian_date')->nullable();
            $table->string('eth_month')->nullable();
            $table->integer('eth_day')->nullable();
            $table->string('eth_year', 16)->nullable();
            $table->string('target_group');
            $table->string('training_module');
            $table->string('facilitator_channel');
            $table->string('training_venue');
            $table->integer('training_duration_days');
            $table->integer('exec_leaders_male');
            $table->integer('exec_leaders_female');
            $table->integer('members_male');
            $table->integer('members_female');
            $table->string('lead_facilitator');
            $table->text('course_learning_outcomes')->nullable();
            $table->integer('total_trainees')->nullable();
            $table->string('wua_name')->nullable();
            $table->string('wua_reg_code')->nullable();
            $table->string('project_code')->nullable();
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
        Schema::dropIfExists('irrigation_association_trainings');
    }
};
