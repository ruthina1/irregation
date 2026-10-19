<?php

namespace Modules\Irrigation\Services\Reports;

use Modules\Irrigation\Models\Institutions\AssociationAudit;
use Modules\Irrigation\Models\Institutions\SchemeMaintenance;
use Modules\Irrigation\Models\Institutions\WaterUsersAssociation;
use Modules\Irrigation\Support\Institutions\AssociationAuditEnums;

/**
 * Institutions report: WUAs, audits and canal maintenance per zone.
 */
class InstitutionsReport extends IrrigationReport
{
    public function build(?string $fiscalYear): array
    {
        return ['data' => self::withKeys($this->zoneRows($fiscalYear))];
    }

    /** @return array<string, array<string, mixed>> rows keyed by zone */
    public function zoneRows(?string $fiscalYear): array
    {
        $wuas = $this->rows(WaterUsersAssociation::class, $fiscalYear);
        $audits = $this->rows(AssociationAudit::class, $fiscalYear);
        $om = $this->rows(SchemeMaintenance::class, $fiscalYear);

        $rows = [];
        foreach (self::zones($wuas, $audits, $om) as $zone) {
            $w = self::byZone($wuas, $zone);
            $a = self::byZone($audits, $zone)->filter(fn ($r) => ($r['audit_verdict'] ?? null) !== AssociationAuditEnums::IN_PROGRESS);
            $o = self::byZone($om, $zone);
            $new = $w->where('establishment_type', 'Newly Established WUA')->count();
            $canalKm = fn (string $type) => round(self::sum($o->filter(fn ($r) => str_contains((string) ($r['canal_type'] ?? ''), $type)), 'repaired_cleaned_km'), 1);

            $rows[$zone] = [
                'zone' => $zone,
                'total_wuas' => $w->count(),
                'new_wuas' => $new,
                'strengthened_wuas' => $w->count() - $new,
                'audited_wuas' => $a->count(),
                'unqualified_audits' => $a->where('audit_verdict', 'Unqualified Audit Opinion')->count(),
                'modern_canal_maintained_km' => $canalKm('Modern'),
                'traditional_canal_maintained_km' => $canalKm('Traditional'),
                'community_labor_count' => (int) self::sum($o, 'total_mobilized_labor'),
                'wua_members_total' => (int) self::sum($w, 'total_members'),
            ];
        }

        return $rows;
    }
}
