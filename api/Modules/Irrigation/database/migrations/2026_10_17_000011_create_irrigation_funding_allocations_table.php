<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Funding allocation records (construction/funding).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('irrigation_funding_allocations', function (Blueprint $table) {
            $table->id();
            $table->string('fiscal_year', 16)->nullable();
            $table->string('zone')->nullable();
            $table->string('woreda')->nullable();
            $table->string('kebele')->nullable();
            $table->unsignedBigInteger('zone_id')->nullable();
            $table->unsignedBigInteger('woreda_id')->nullable();
            $table->unsignedBigInteger('kebele_id')->nullable();
            $table->string('funding_code', 64);
            $table->string('scheme_name');
            $table->string('allocation_status');
            $table->string('contract_code');
            $table->string('project_code');
            $table->string('funding_program');
            $table->string('donor_account_ref');
            $table->decimal('total_allocated_budget_etb', 20, 4);
            $table->decimal('cumulative_disbursed_etb', 20, 4);
            $table->text('financial_notes')->nullable();
            $table->json('disbursement_ledger')->nullable();
            $table->decimal('remaining_balance_etb', 20, 4)->nullable();
            $table->decimal('financial_burn_rate_pct', 20, 4)->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index('fiscal_year');
            $table->index('zone');
            $table->index('funding_code');
            $table->index('allocation_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('irrigation_funding_allocations');
    }
};
