<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Project completion & handover certificate records (construction/completion).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('irrigation_handover_certificates', function (Blueprint $table) {
            $table->id();
            $table->string('fiscal_year', 16)->nullable();
            $table->string('zone')->nullable();
            $table->string('woreda')->nullable();
            $table->string('kebele')->nullable();
            $table->unsignedBigInteger('zone_id')->nullable();
            $table->unsignedBigInteger('woreda_id')->nullable();
            $table->unsignedBigInteger('kebele_id')->nullable();
            $table->string('handover_certificate_no', 64);
            $table->string('scheme_name');
            $table->string('handover_status');
            $table->string('provisional_handover_eth_date')->nullable();
            $table->string('eth_month')->nullable();
            $table->integer('eth_day')->nullable();
            $table->string('eth_year', 16)->nullable();
            $table->string('contract_code');
            $table->string('project_code')->nullable();
            $table->string('recipient_wua');
            $table->string('contractor_name')->nullable();
            $table->string('consultant_supervisor')->nullable();
            $table->decimal('command_area_ha', 20, 4);
            $table->integer('beneficiaries_male');
            $table->integer('beneficiaries_female');
            $table->decimal('contract_sum_etb', 20, 4);
            $table->decimal('retention_money_etb', 20, 4);
            $table->integer('defect_liability_months');
            $table->integer('snag_items_count');
            $table->string('handover_committee_lead');
            $table->text('handover_remarks')->nullable();
            $table->integer('total_beneficiaries')->nullable();
            $table->string('dlp_expiry_eth_date')->nullable();
            $table->json('protocol_checklist')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index('fiscal_year');
            $table->index('zone');
            $table->index('handover_certificate_no');
            $table->index('handover_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('irrigation_handover_certificates');
    }
};
