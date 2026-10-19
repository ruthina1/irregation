<?php

namespace Modules\Irrigation\Tests\Feature;

use Modules\Irrigation\Http\Controllers\Reports\IrrigationReportController;

class IrrigationReportsTest extends IrrigationTestCase
{
    public function test_every_report_responds_for_an_empty_year(): void
    {
        foreach (array_keys(IrrigationReportController::REPORTS) as $report) {
            $this->api('GET', "reports/{$report}?fiscal_year=2016%20E.C.")->assertOk()->assertJsonPath('data', []);
        }
        $this->api('GET', 'study-design/dashboard')->assertOk()->assertJsonPath('data.kpis.active_studies', 0);
        $this->api('GET', 'production/overview')->assertOk()->assertJsonPath('data', []);
    }

    public function test_reports_aggregate_real_records_by_zone(): void
    {
        $this->make('study-design', ['zone' => 'West Gojjam', 'study_modality' => 'In-House Regional', 'command_area_hectares' => 300]);
        $this->make('study-design', ['zone' => 'West Gojjam', 'study_modality' => 'Consultant - New', 'command_area_hectares' => 500]);
        $this->make('study-design', ['zone' => 'South Gondar', 'command_area_hectares' => 200]);

        $rows = collect($this->api('GET', 'reports/study-design?fiscal_year=2019%20E.C.')->assertOk()->json('data'))->keyBy('zone');
        $this->assertSame(2, $rows['West Gojjam']['total_pipeline']);
        $this->assertSame(1, $rows['West Gojjam']['inhouse_studies']);
        $this->assertEquals(800, $rows['West Gojjam']['command_area_ha']);
        $this->assertSame(1, $rows['South Gondar']['total_pipeline']);

        $dashboard = $this->api('GET', 'study-design/dashboard?fiscal_year=2019%20E.C.')->assertOk()->json('data');
        $this->assertSame(3, $dashboard['kpis']['active_studies']);
        $this->assertSame(1, $dashboard['kpis']['in_house_studies']);
        $this->assertEquals(1000, $dashboard['kpis']['total_irrigable_ha']);
    }

    public function test_construction_and_master_reports(): void
    {
        $project = $this->make('construction/projects', ['funding_source' => 'PACT Program (በPACT በጀት)', 'contract_sum_etb' => 1000000]);
        $this->make('construction/funding', ['contract_code' => $project['contract_code'], 'total_allocated_budget_etb' => 3000000, 'funding_program' => 'PACT Program']);
        $this->make('construction/benefits', ['contract_code' => $project['contract_code'], 'actual_developed_ha' => 450]);

        $construction = $this->api('GET', 'reports/construction?fiscal_year=2019%20E.C.')->assertOk();
        $row = $construction->json('data.0');
        $this->assertSame('PACT Program (በPACT በጀት)', $row['program']);
        $this->assertSame(1, $row['new_schemes_count']);
        $this->assertEquals(450, $row['developed_land_ha']);
        $this->assertEquals(100, $construction->json('meta.milestone_adherence_pct'));

        $master = $this->api('GET', 'reports/directorate-master?fiscal_year=2019%20E.C.')->assertOk();
        $this->assertSame(1, $master->json('data.0.active_construction_schemes'));
        $this->assertEquals(3, $master->json('program_portfolio.0.allocated'));
    }

    public function test_untracked_metrics_are_null_not_invented(): void
    {
        $this->make('water-utilization/irrigated-area');
        $this->make('water-utilization/water-sources');

        $row = $this->api('GET', 'reports/water-utilization?fiscal_year=2019%20E.C.')->assertOk()->json('data.0');
        $this->assertNull($row['drip_sprinkler_ha']);
        $this->assertNull($row['avg_application_efficiency_pct']);
        $this->assertSame(1, $row['solar_pump_sites']);
        $this->assertEquals(640, $row['round_1_ha']);
    }

    public function test_production_overview_combines_seasonal_and_wheat_records(): void
    {
        $this->make('production/seasonal-production');
        $this->make('production/highland-wheat');

        $overview = $this->api('GET', 'production/overview?fiscal_year=2019%20E.C.')->assertOk();
        $this->assertCount(2, $overview->json('data'));
        $this->assertSame('42.5 Qt/Ha', $overview->json('data.0.productivity'));
        $this->assertEquals(4250 + 8400, $overview->json('summary.totalYieldQuintals'));
        $this->assertEquals(8400, $overview->json('summary.wheatHarvestQuintals'));
    }
}
