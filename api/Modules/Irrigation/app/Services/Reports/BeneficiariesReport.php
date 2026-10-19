<?php

namespace Modules\Irrigation\Services\Reports;

use Modules\Irrigation\Models\Construction\ConstructionContract;
use Modules\Irrigation\Models\Construction\LandBenefitVerification;
use Modules\Irrigation\Models\Institutions\WaterUsersAssociation;
use Modules\Irrigation\Models\Production\HighlandWheatCluster;
use Modules\Irrigation\Models\StudyDesign\StudyDesignProject;

/**
 * Beneficiary statistics report: farmers by gender and programme per zone.
 */
class BeneficiariesReport extends IrrigationReport
{
    public function build(?string $fiscalYear): array
    {
        $projects = $this->rows(ConstructionContract::class, $fiscalYear);
        $benefits = $this->rows(LandBenefitVerification::class, $fiscalYear);
        $wuas = $this->rows(WaterUsersAssociation::class, $fiscalYear);
        $wheat = $this->rows(HighlandWheatCluster::class, $fiscalYear);
        $studies = $this->rows(StudyDesignProject::class, $fiscalYear);

        $rows = array_map(function ($zone) use ($projects, $benefits, $wuas, $wheat, $studies) {
            $p = self::byZone($projects, $zone);
            $male = (int) self::sum($p, 'beneficiaries_male');
            $female = (int) self::sum($p, 'beneficiaries_female');
            $s = self::byZone($studies, $zone);

            return [
                'zone' => $zone,
                'woreda_count' => $p->pluck('woreda')->filter()->unique()->count(),
                'schemes_count' => $p->count(),
                'command_area_ha' => self::sum($p, 'command_area_ha'),
                'farmers_male' => $male,
                'farmers_female' => $female,
                'total_farmers' => $male + $female,
                'female_share_pct' => self::pct($female, $male + $female),
                'youth_farmers' => (int) self::sum(self::byZone($benefits, $zone), 'youth_beneficiaries_count'),
                'wua_members_total' => (int) self::sum(self::byZone($wuas, $zone), 'total_members'),
                'study_phase_target_farmers' => (int) (self::sum($s, 'beneficiaries_male') + self::sum($s, 'beneficiaries_female')),
                'wheat_initiative_farmers' => (int) self::sum(self::byZone($wheat, $zone), 'total_farmers'),
                // Household headship is not captured by any Irrigation page.
                'female_headed_households' => null,
            ];
        }, self::zones($projects, $benefits, $wuas, $wheat));

        return [
            'data' => self::withKeys($rows),
            'meta' => ['untracked_metrics' => ['female_headed_households']],
        ];
    }
}
