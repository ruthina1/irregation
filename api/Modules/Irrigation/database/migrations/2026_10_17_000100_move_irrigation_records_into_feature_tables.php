<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Moves records from the former shared `irrigation_records` table (one row per
 * record, feature fields in a JSON `data` column) into the per-feature tables.
 * Record ids are kept, so links between records stay valid. The old table is
 * kept as `irrigation_records_legacy` for reference.
 */
return new class extends Migration
{
    /**
     * Former resource key => [table, code column, scheme column, status column, column for parent_id].
     *
     * @var array<string, array{0: string, 1: ?string, 2: ?string, 3: ?string, 4: ?string}>
     */
    private const RESOURCES = [
        'pipeline' => ['irrigation_pipeline_projects', 'pipeline_code', 'scheme_name', 'pipeline_status', null],
        'study-design' => ['irrigation_study_design_projects', 'project_code', 'project_name', 'study_stage', 'pipeline_id'],
        'document-review' => ['irrigation_design_document_reviews', 'review_code', 'scheme_name', 'review_verdict', 'project_id'],
        'quality-assurance' => ['irrigation_design_quality_audits', 'qa_certificate_no', 'scheme_name', 'qa_status', 'project_id'],
        'construction-ready' => ['irrigation_construction_ready_designs', 'shelf_code', 'scheme_name', 'shelf_status', 'project_id'],
        'capacity-building' => ['irrigation_professional_trainings', 'training_code', null, 'training_status', null],
        'inputs' => ['irrigation_input_allocations', 'input_code', null, 'status', null],
        'construction/projects' => ['irrigation_construction_contracts', 'contract_code', 'scheme_name', 'construction_status', null],
        'construction/progress' => ['irrigation_construction_progress_logs', 'progress_log_code', 'scheme_name', 'health_status', 'contract_id'],
        'construction/completion' => ['irrigation_handover_certificates', 'handover_certificate_no', 'scheme_name', 'handover_status', null],
        'construction/funding' => ['irrigation_funding_allocations', 'funding_code', 'scheme_name', 'allocation_status', null],
        'construction/benefits' => ['irrigation_land_benefit_verifications', 'benefit_code', 'scheme_name', 'benefit_status', null],
        'institutions/water-users-associations' => ['irrigation_water_users_associations', 'wua_reg_code', 'scheme_name', 'governance_status', null],
        'institutions/assessment-audit' => ['irrigation_association_audits', 'audit_code', 'scheme_name', 'audit_verdict', 'wua_id'],
        'institutions/capacity-building' => ['irrigation_association_trainings', 'training_code', 'scheme_name', 'training_status', 'wua_id'],
        'institutions/maintenance-cleaning' => ['irrigation_scheme_maintenances', null, 'scheme_name', 'operation_status', null],
        'water-utilization/irrigated-area' => ['irrigation_irrigated_areas', 'utilization_code', 'scheme_name', 'water_adequacy_status', null],
        'water-utilization/water-sources' => ['irrigation_water_sources', null, 'scheme_name', 'operational_status', null],
        'production/seasonal-production' => ['irrigation_seasonal_productions', 'production_code', 'scheme_name', 'harvest_status', null],
        'production/highland-wheat' => ['irrigation_highland_wheat_clusters', 'initiative_code', 'scheme_name', 'verification_status', null],
    ];

    public function up(): void
    {
        if (! Schema::hasTable('irrigation_records')) {
            return;
        }

        DB::transaction(function () {
            foreach (self::RESOURCES as $resource => [$table, $code, $scheme, $status, $parent]) {
                $columns = array_flip(Schema::getColumnListing($table));

                DB::table('irrigation_records')->where('resource', $resource)->orderBy('id')
                    ->each(function (object $old) use ($table, $code, $scheme, $status, $parent, $columns) {
                        $row = [];
                        foreach ((array) json_decode($old->data ?? '{}', true) as $key => $value) {
                            $row[$key] = is_array($value) ? json_encode($value) : $value;
                        }
                        foreach (['fiscal_year', 'zone', 'woreda', 'kebele', 'created_by', 'updated_by', 'created_at', 'updated_at', 'deleted_at'] as $key) {
                            $row[$key] = $old->{$key};
                        }
                        foreach ([$code => $old->code, $scheme => $old->scheme_name, $status => $old->status, $parent => $old->parent_id] as $key => $value) {
                            if ($key) {
                                $row[$key] = $value;
                            }
                        }
                        $row['id'] = $old->id;

                        DB::table($table)->insert(array_intersect_key($row, $columns));
                    });
            }
        });

        Schema::rename('irrigation_records', 'irrigation_records_legacy');
    }

    public function down(): void
    {
        if (Schema::hasTable('irrigation_records_legacy') && ! Schema::hasTable('irrigation_records')) {
            Schema::rename('irrigation_records_legacy', 'irrigation_records');
        }
        foreach (array_reverse(self::RESOURCES) as [$table]) {
            DB::table($table)->delete();
        }
    }
};
