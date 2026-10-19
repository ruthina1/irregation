<?php

namespace Modules\Irrigation\Tests\Feature;

class InstitutionsWaterProductionTest extends IrrigationTestCase
{
    private function auditPayload(array $overrides = []): array
    {
        return array_merge([
            'fiscal_year' => '2019 E.C.', 'audit_scope' => 'Comprehensive Financial & Legal Compliance Audit',
            'audit_verdict' => 'Unqualified Audit Opinion', 'governance_grade' => 'Grade A - High Functionality',
            'overall_health_score' => 88, 'audited_revenue_etb' => 250000, 'audited_expense_etb' => 120000,
            'unaccounted_variance_etb' => 0, 'lead_auditor' => 'Ato Girma', 'eth_month' => 'Tikimt', 'eth_day' => 28,
            'eth_year' => '2019 E.C.', 'check_assembly' => true, 'check_bank' => true, 'check_receipts' => false,
            'check_bylaws' => true, 'check_disputes' => true, 'check_assets' => true,
        ], $overrides);
    }

    public function test_registering_a_wua_opens_a_pending_audit(): void
    {
        $wua = $this->make('institutions/water-users-associations');

        $this->assertSame(650, $wua['total_members']);
        $this->assertSame(7, $wua['committee_members_count']);
        $this->assertSame('Active & Fully Functional', $wua['governance_status']);
        $this->assertSame('2019 E.C.', $wua['fiscal_year'], 'derived from the establishment date');

        $audit = $this->api('GET', 'institutions/assessment-audit?fiscal_year=2019%20E.C.')->assertJsonCount(1, 'data')->json('data.0');
        $this->assertSame('Audit In Progress', $audit['audit_verdict']);
        $this->assertSame($wua['wua_reg_code'], $audit['wua_reg_code']);
        $this->assertSame($wua['wua_name'], $audit['wua_name']);
        $this->assertSame(650, $audit['total_members']);
        $this->assertMatchesRegularExpression('/^AUD-2019-\d{3}$/', $audit['audit_code']);
    }

    public function test_yearly_audit_rolls_the_previous_result_into_history(): void
    {
        $this->make('institutions/water-users-associations');
        $auditId = $this->api('GET', 'institutions/assessment-audit')->json('data.0.id');

        $this->api('PUT', "institutions/assessment-audit/{$auditId}", $this->auditPayload())->assertOk()
            ->assertJsonPath('data.audit_verdict', 'Unqualified Audit Opinion')
            ->assertJsonPath('data.audit_ethiopian_date', 'Tikimt 28, 2019 E.C.')
            ->assertJsonPath('data.compliance_checklist.water_fee_receipts_audited', false);

        $response = $this->api('PUT', "institutions/assessment-audit/{$auditId}", $this->auditPayload([
            'fiscal_year' => '2020 E.C.', 'audit_verdict' => 'Qualified Audit Opinion', 'overall_health_score' => 72, 'eth_year' => '2020 E.C.',
        ]))->assertOk();

        $history = $response->json('data.audit_history');
        $this->assertCount(1, $history);
        $this->assertSame(['year' => '2019 E.C.', 'verdict' => 'Unqualified Audit Opinion', 'score' => 88, 'auditor' => 'Ato Girma'], $history[0]);

        // Re-auditing the same year replaces that year's history entry instead of duplicating it.
        $response = $this->api('PUT', "institutions/assessment-audit/{$auditId}", $this->auditPayload(['fiscal_year' => '2020 E.C.', 'eth_year' => '2020 E.C.']))->assertOk();
        $this->assertSame(['2020 E.C.', '2019 E.C.'], array_column($response->json('data.audit_history'), 'year'));
    }

    public function test_deleting_a_wua_removes_its_audit_but_not_if_trainings_exist(): void
    {
        $wua = $this->make('institutions/water-users-associations');
        $training = $this->make('institutions/capacity-building', ['wua_id' => $wua['id']]);

        $this->assertSame($wua['wua_name'], $training['wua_name']);
        $this->assertSame(42, $training['total_trainees']);
        $this->api('DELETE', "institutions/water-users-associations/{$wua['id']}")->assertStatus(409);

        $this->api('DELETE', "institutions/capacity-building/{$training['id']}")->assertOk();
        $this->api('DELETE', "institutions/water-users-associations/{$wua['id']}")->assertOk();
        $this->api('GET', "institutions/assessment-audit?wua_id={$wua['id']}")->assertJsonCount(0, 'data');
    }

    public function test_maintenance_labor_defaults_when_no_cleaning_work_is_logged(): void
    {
        $record = $this->make('institutions/maintenance-cleaning', [
            'intervention_types' => ['Headwork Weir Crest & Intake Gate Repair (የመጥለፊያ ግድብና በር ጥገና)'],
            'mobilized_labor_male' => null, 'mobilized_labor_female' => null,
        ]);

        $this->assertSame(0, $record['total_mobilized_labor']);
        $this->api('POST', 'institutions/maintenance-cleaning', array_merge(IrrigationPayloads::for('institutions/maintenance-cleaning', $this), [
            'intervention_types' => ['Not an intervention'],
        ]))->assertUnprocessable()->assertJsonValidationErrors('intervention_types.0');
    }

    public function test_water_and_production_derived_fields(): void
    {
        $area = $this->make('water-utilization/irrigated-area');
        $this->assertEquals(640, $area['total_effective_irrigated_ha']);
        $this->assertEquals(80, $area['utilization_rate_pct']);
        $this->assertSame(520, $area['total_farmers']);

        $source = $this->make('water-utilization/water-sources', ['technology_type' => 'Community Earth Reservoir (የማህበረሰብ ኩሬ)']);
        $this->assertSame('Storage Ponds & Linings', $source['source_category']);
        $source = $this->make('water-utilization/water-sources', ['technology_type' => 'Deep Borehole Well (ጥልቅ ዌል)']);
        $this->assertSame('Groundwater Wells', $source['source_category']);

        $seasonal = $this->make('production/seasonal-production');
        $this->assertEquals(42.5, $seasonal['productivity_qt_per_ha']);

        $wheat = $this->make('production/highland-wheat');
        $this->assertEquals(42, $wheat['productivity_qt_ha']);
        $this->assertTrue($wheat['mechanized_harvesting']);
    }
}
