<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Water users' association records (institutions/water-users-associations).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('irrigation_water_users_associations', function (Blueprint $table) {
            $table->id();
            $table->string('fiscal_year', 16)->nullable();
            $table->string('zone')->nullable();
            $table->string('woreda')->nullable();
            $table->string('kebele')->nullable();
            $table->unsignedBigInteger('zone_id')->nullable();
            $table->unsignedBigInteger('woreda_id')->nullable();
            $table->unsignedBigInteger('kebele_id')->nullable();
            $table->string('wua_reg_code', 64);
            $table->string('scheme_name');
            $table->string('governance_status');
            $table->string('establishment_eth_date')->nullable();
            $table->string('eth_month')->nullable();
            $table->integer('eth_day')->nullable();
            $table->string('eth_year', 16)->nullable();
            $table->string('wua_name');
            $table->string('contract_code')->nullable();
            $table->string('establishment_type');
            $table->decimal('command_area_ha', 20, 4);
            $table->integer('members_male');
            $table->integer('members_female');
            $table->string('chairperson_name');
            $table->string('water_master_name');
            $table->integer('committee_male');
            $table->integer('committee_female');
            $table->integer('sub_ketenas_count');
            $table->string('distribution_regime');
            $table->decimal('annual_water_fee_etb_ha', 20, 4);
            $table->decimal('fee_collection_rate_pct', 20, 4);
            $table->decimal('bank_account_balance_etb', 20, 4)->nullable();
            $table->string('registration_decree_ref');
            $table->string('bylaw_charter_status');
            $table->text('governance_remarks')->nullable();
            $table->integer('total_members')->nullable();
            $table->integer('committee_members_count')->nullable();
            $table->string('project_code')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index('fiscal_year');
            $table->index('zone');
            $table->index('wua_reg_code');
            $table->index('governance_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('irrigation_water_users_associations');
    }
};
