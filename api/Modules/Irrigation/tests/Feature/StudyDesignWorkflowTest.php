<?php

namespace Modules\Irrigation\Tests\Feature;

use Illuminate\Testing\TestResponse;

class StudyDesignWorkflowTest extends IrrigationTestCase
{
    private function screen(int $id, string $status, bool $promote): TestResponse
    {
        return $this->api('PATCH', "pipeline/{$id}/screening", [
            'pipeline_status' => $status, 'promoted_to_study' => $promote, 'reconnaissance_expert' => 'Eng. Worku',
            'eth_month' => 'Tikimt', 'eth_day' => 18, 'eth_year' => '2019 E.C.',
        ]);
    }

    public function test_screening_only_promotes_approved_projects(): void
    {
        $pipeline = $this->make('pipeline');

        $this->screen($pipeline['id'], 'Hydrologically Feasible', true)->assertOk()
            ->assertJsonPath('data.promoted_to_study', false)
            ->assertJsonPath('data.reconnaissance_ethiopian_date', 'Tikimt 18, 2019 E.C.');
        $this->api('GET', 'study-design')->assertJsonCount(0, 'data');
    }

    public function test_promotion_opens_a_study_design_project_once(): void
    {
        $pipeline = $this->make('pipeline', ['pipeline_code' => 'PLN-2019-07', 'potential_area_ha' => 1250]);

        $promotedId = $this->screen($pipeline['id'], 'Approved for Detailed Study & Design', true)->assertOk()
            ->assertJsonPath('data.promoted_to_study', true)->json('data.promoted_study_id');

        $this->api('GET', "study-design/{$promotedId}")->assertOk()
            ->assertJsonPath('data.project_code', 'STD-2019-07')
            ->assertJsonPath('data.project_name', $pipeline['scheme_name'])
            ->assertJsonPath('data.study_stage', 'Feasibility & Hydrology Study')
            ->assertJsonPath('data.command_area_hectares', 1250)
            ->assertJsonPath('data.zone', 'West Gojjam');

        // Re-screening keeps a single study; withdrawing approval is a conflict.
        $this->screen($pipeline['id'], 'Approved for Detailed Study & Design', true)->assertOk();
        $this->api('GET', 'study-design')->assertJsonCount(1, 'data');
        $this->screen($pipeline['id'], 'Infeasible / Deferred', false)->assertStatus(409);
    }

    public function test_review_verdict_drives_study_review_status_and_qa_gate(): void
    {
        $study = $this->make('study-design');
        $review = $this->make('document-review', ['project_id' => $study['id']]);
        $qa = $this->make('quality-assurance', ['project_id' => $study['id']]);

        $this->assertSame($study['project_code'], $review['project_code']);
        $this->assertSame(['hydrology' => true, 'structural' => true, 'geotechnical' => true, 'agronomy' => true, 'esia' => false], $review['disciplinary_checklist']);
        $this->assertFalse($qa['review_cleared']);

        // Certification is refused until the review is approved.
        $this->api('PATCH', "quality-assurance/{$qa['id']}", ['qa_status' => 'Certified QA Passed'])
            ->assertUnprocessable()->assertJsonValidationErrors('qa_status');

        $this->api('PATCH', "document-review/{$review['id']}", ['review_verdict' => 'Approved Without Comments'])->assertOk();
        $this->api('GET', "study-design/{$study['id']}")
            ->assertJsonPath('data.review_status', 'Reviewed & Verified')
            ->assertJsonPath('data.latest_review_code', $review['review_code'])
            ->assertJsonPath('data.review_cleared', true);

        $this->api('PATCH', "quality-assurance/{$qa['id']}", ['qa_status' => 'Certified QA Passed'])->assertOk()
            ->assertJsonPath('data.review_cleared', true);

        $this->api('GET', "study-design/{$study['id']}")
            ->assertJsonPath('data.qa_status', 'Quality Assured (Certified Passed)')
            ->assertJsonPath('data.is_construction_ready', true);

        $shelf = $this->api('GET', 'construction-ready')->assertJsonCount(1, 'data')->json('data.0');
        $this->assertSame($qa['qa_certificate_no'], $shelf['qa_certificate_no']);
        $this->assertSame('Available on Shelf', $shelf['shelf_status']);
        $this->assertMatchesRegularExpression('/^SHLF-2019-\d{3}$/', $shelf['shelf_code']);
        $this->assertTrue($shelf['tender_dossier']['priced_boq']);
    }

    public function test_review_qa_action_requires_qa_pass_for_construction_readiness(): void
    {
        $study = $this->make('study-design');
        $payload = [
            'review_status' => 'Reviewed & Verified', 'qa_status' => 'Pending QA Audit', 'is_construction_ready' => true,
            'reviewer_expert' => 'Eng. Solomon', 'eth_month' => 'Tikimt', 'eth_day' => 14, 'eth_year' => '2019 E.C.',
        ];

        $this->api('PATCH', "study-design/{$study['id']}/review-qa", $payload)
            ->assertUnprocessable()->assertJsonValidationErrors('is_construction_ready');

        $this->api('PATCH', "study-design/{$study['id']}/review-qa", ['qa_status' => 'Quality Assured (Certified Passed)'] + $payload)
            ->assertOk()
            ->assertJsonPath('data.is_construction_ready', true)
            ->assertJsonPath('data.reviewed_by', 'Eng. Solomon')
            ->assertJsonPath('data.review_ethiopian_date', 'Tikimt 14, 2019 E.C.');
        $this->api('GET', 'construction-ready')->assertJsonCount(1, 'data');
    }

    public function test_shelf_handover_is_one_way(): void
    {
        $study = $this->make('study-design');
        $this->api('PATCH', "study-design/{$study['id']}/review-qa", [
            'review_status' => 'Reviewed & Verified', 'qa_status' => 'Quality Assured (Certified Passed)', 'is_construction_ready' => true,
            'reviewer_expert' => 'Eng. Solomon', 'eth_month' => 'Tikimt', 'eth_day' => 14, 'eth_year' => '2019 E.C.',
        ])->assertOk();
        $shelfId = $this->api('GET', 'construction-ready')->json('data.0.id');

        $handover = ['procurement_method' => 'National Competitive Bidding (NCB)', 'executing_client' => 'Regional Bureau', 'allocated_budget_etb' => 42000000];
        $this->api('POST', "construction-ready/{$shelfId}/handover", $handover)->assertOk()
            ->assertJsonPath('data.shelf_status', 'Handed Over to Construction')
            ->assertJsonPath('data.handover_details.allocated_budget_etb', 42000000);
        $this->api('POST', "construction-ready/{$shelfId}/handover", $handover)->assertStatus(409);
        $this->api('POST', "construction-ready/{$shelfId}/handover", [])->assertUnprocessable();
    }

    public function test_records_with_dependants_cannot_be_deleted(): void
    {
        $study = $this->make('study-design');
        $this->make('document-review', ['project_id' => $study['id']]);

        $this->api('DELETE', "study-design/{$study['id']}")->assertStatus(409)
            ->assertJsonPath('message', fn ($m) => str_contains($m, 'Design document review'));
    }

    public function test_input_dispatches_accumulate_and_update_status(): void
    {
        $input = $this->make('inputs', ['planned_target_qty' => 100]);
        $dispatch = fn ($qty) => $this->api('POST', "inputs/{$input['id']}/dispatch", [
            'dispatch_qty' => $qty, 'recipient' => 'Mecha Cooperative', 'eth_month' => 'Tikimt', 'eth_day' => 15, 'eth_year' => '2019 E.C.',
        ]);

        $dispatch(40)->assertOk()->assertJsonPath('data.distributed_qty', 40)->assertJsonPath('data.status', 'In Progress');
        $response = $dispatch(60)->assertOk()->assertJsonPath('data.distributed_qty', 100)->assertJsonPath('data.status', 'Completed');

        $history = $response->json('data.dispatch_history');
        $this->assertCount(2, $history);
        $this->assertSame(60, $history[0]['qty']);
        $this->assertSame('Tikimt 15, 2019 E.C.', $history[0]['ethiopian_date']);
        $dispatch(0)->assertUnprocessable()->assertJsonValidationErrors('dispatch_qty');
    }
}
