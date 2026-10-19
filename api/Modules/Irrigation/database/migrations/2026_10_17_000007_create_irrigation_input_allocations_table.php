<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Agricultural input allocation records (inputs).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('irrigation_input_allocations', function (Blueprint $table) {
            $table->id();
            $table->string('fiscal_year', 16)->nullable();
            $table->string('zone')->nullable();
            $table->string('woreda')->nullable();
            $table->string('kebele')->nullable();
            $table->unsignedBigInteger('zone_id')->nullable();
            $table->unsignedBigInteger('woreda_id')->nullable();
            $table->unsignedBigInteger('kebele_id')->nullable();
            $table->string('input_code', 64);
            $table->string('status');
            $table->string('irrigation_season');
            $table->string('cropping_round');
            $table->string('input_name');
            $table->string('specification');
            $table->string('unit');
            $table->decimal('planned_target_qty', 20, 4);
            $table->decimal('covered_hectares', 20, 4);
            $table->string('funding_program');
            $table->integer('beneficiaries_male');
            $table->integer('beneficiaries_female');
            $table->decimal('distributed_qty', 20, 4)->nullable();
            $table->json('dispatch_history')->nullable();
            $table->string('item_name')->nullable();
            $table->integer('total_beneficiaries')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index('fiscal_year');
            $table->index('zone');
            $table->index('input_code');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('irrigation_input_allocations');
    }
};
