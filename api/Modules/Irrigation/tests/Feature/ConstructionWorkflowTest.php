<?php

namespace Modules\Irrigation\Tests\Feature;

class ConstructionWorkflowTest extends IrrigationTestCase
{
    private function evaluation(array $overrides = []): array
    {
        return array_merge([
            'planned_progress_pct' => 60, 'physical_progress_pct' => 40, 'financial_progress_pct' => 35,
            'weir_concreting_pct' => 70, 'canal_excavation_pct' => 50, 'canal_lining_km' => 3.5, 'target_canal_lining_km' => 10,
            'gates_installed_count' => 2, 'target_gates_count' => 6, 'health_status' => 'Minor Delay',
            'resident_engineer' => 'Eng. Kebede', 'reporting_ethiopian_date' => 'Tikimt 20, 2019 E.C.',
        ], $overrides);
    }

    public function test_progress_evaluation_updates_contract_and_writes_a_progress_log(): void
    {
        $project = $this->make('construction/projects');

        $this->assertSame('Mobilization & Site Handover', $project['construction_status']);
        $this->assertSame('Tikimt 20, 2019 E.C.', $project['contract_signing_eth_date']);
        $this->assertSame(800, $project['total_beneficiaries']);

        $this->api('PUT', "construction/projects/{$project['id']}/progress", $this->evaluation())->assertOk()
            ->assertJsonPath('data.physical_progress_pct', 40)
            ->assertJsonPath('data.health_status', 'Minor Delay')
            ->assertJsonPath('data.construction_status', 'Mobilization & Site Handover');

        $log = $this->api('GET', "construction/progress?contract_id={$project['id']}")->assertJsonCount(1, 'data')->json('data.0');
        $this->assertSame($project['contract_code'], $log['contract_code']);
        $this->assertSame(-20, (int) $log['variance_pct']);
        $this->assertSame('Minor Delay', $log['health_status']);
        $this->assertSame('2019 E.C.', $log['fiscal_year']);

        $this->api('PUT', "construction/projects/{$project['id']}/progress", $this->evaluation(['physical_progress_pct' => 100]))->assertOk()
            ->assertJsonPath('data.construction_status', 'Handed Over to Users');
    }

    public function test_progress_log_derives_contract_fields_variance_and_health(): void
    {
        $project = $this->make('construction/projects');
        $log = $this->make('construction/progress', ['contract_id' => $project['id'], 'planned_progress_pct' => 50, 'physical_progress_pct' => 30]);

        $this->assertSame('Critical Delay', $log['health_status']);
        $this->assertSame($project['contract_code'], $log['contract_code']);
        $this->assertSame($project['scheme_name'], $log['scheme_name']);
        $this->assertSame('2019 E.C.', $log['fiscal_year']);
        // The newest log becomes the contract's current progress.
        $this->api('GET', "construction/projects/{$project['id']}")->assertJsonPath('data.physical_progress_pct', 30);
    }

    public function test_disbursement_updates_ledger_balance_and_contract(): void
    {
        $project = $this->make('construction/projects', ['contract_sum_etb' => 2000000]);
        $funding = $this->make('construction/funding', [
            'contract_code' => $project['contract_code'], 'total_allocated_budget_etb' => 1000000, 'cumulative_disbursed_etb' => 0,
        ]);
        $this->assertSame('Active Disbursement', $funding['allocation_status']);
        $this->assertEquals(1000000, $funding['remaining_balance_etb']);

        $disburse = fn ($amount) => $this->api('POST', "construction/funding/{$funding['id']}/disburse", [
            'disbursement_amount' => $amount, 'ipc_no' => 'IPC-01', 'recipient' => 'Abay Construction',
            'eth_month' => 'Tikimt', 'eth_day' => 28, 'eth_year' => '2019 E.C.',
        ]);

        $disburse(400000)->assertOk()
            ->assertJsonPath('data.cumulative_disbursed_etb', 400000)
            ->assertJsonPath('data.remaining_balance_etb', 600000)
            ->assertJsonPath('data.financial_burn_rate_pct', 40)
            ->assertJsonPath('data.disbursement_ledger.0.eth_date', 'Tikimt 28, 2019 E.C.');
        $disburse(700000)->assertUnprocessable()->assertJsonValidationErrors('disbursement_amount');
        $disburse(600000)->assertOk()->assertJsonPath('data.allocation_status', 'Fully Disbursed')
            ->assertJsonCount(2, 'data.disbursement_ledger');

        $this->api('GET', "construction/projects/{$project['id']}")
            ->assertJsonPath('data.disbursed_sum_etb', 1000000)
            ->assertJsonPath('data.financial_progress_pct', 50);
    }

    public function test_funding_program_labels_from_contracts_are_normalised(): void
    {
        $funding = $this->make('construction/funding', ['funding_program' => 'Regional Government Capital Budget (በክልል መንግስት በጀት)']);

        $this->assertSame('Regional Government Budget', $funding['funding_program']);
    }

    public function test_handover_certificate_computes_dlp_and_closes_the_contract(): void
    {
        $project = $this->make('construction/projects');
        $certificate = $this->make('construction/completion', [
            'contract_code' => $project['contract_code'], 'eth_month' => 'Hamle', 'eth_day' => 10, 'eth_year' => '2019 E.C.',
            'defect_liability_months' => 12,
        ]);

        $this->assertSame('Handed Over to Users', $certificate['handover_status']);
        $this->assertSame('Hamle 10, 2019 E.C.', $certificate['provisional_handover_eth_date']);
        $this->assertSame('Hamle 10, 2020 E.C.', $certificate['dlp_expiry_eth_date']);
        $this->assertSame('2020 E.C.', $certificate['fiscal_year'], 'Hamle starts the next fiscal year');
        $this->assertFalse($certificate['protocol_checklist']['retention_released']);
        $this->assertTrue($certificate['protocol_checklist']['hydraulic_wet_run_tested']);

        $this->api('GET', "construction/projects/{$project['id']}")->assertJsonPath('data.construction_status', 'Handed Over to Users');
        $this->api('GET', 'construction/projects?status=Handed%20Over%20to%20Users')->assertJsonCount(1, 'data');
    }

    public function test_land_benefit_status_follows_development_rate(): void
    {
        $partial = $this->make('construction/benefits', ['planned_command_ha' => 800, 'actual_developed_ha' => 400]);
        $full = $this->make('construction/benefits', ['planned_command_ha' => 800, 'actual_developed_ha' => 790]);

        $this->assertSame(50, (int) $partial['land_development_rate_pct']);
        $this->assertSame('Partially Irrigated', $partial['benefit_status']);
        $this->assertSame('Fully Operational', $full['benefit_status']);
        $this->assertSame(['Highland Irrigated Wheat (የደጋ ስንዴ)', 'Red Onion (ቀይ ሽንኩርት)'], $partial['primary_crops_cultivated']);
    }

    public function test_projects_expose_the_registered_wua_name(): void
    {
        $project = $this->make('construction/projects', ['scheme_name' => 'Jedeb Scheme']);
        $this->make('institutions/water-users-associations', ['scheme_name' => 'Jedeb Scheme', 'contract_code' => null, 'wua_name' => 'Jedeb WUA']);

        $this->api('GET', "construction/projects/{$project['id']}")->assertJsonPath('data.wua_name', 'Jedeb WUA');
    }
}
