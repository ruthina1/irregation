<?php

namespace Modules\Irrigation\Support;

/**
 * Controlled vocabularies shared by several Irrigation features (calendar,
 * fiscal year, cropping rounds, scheme types, funding channels).
 *
 * Feature-specific vocabularies live next to each feature's definition,
 * e.g. Support\StudyDesign\PipelineProjectEnums.
 */
final class IrrigationEnums
{
    public const ETHIOPIAN_MONTHS = [
        'Meskerem', 'Tikimt', 'Hidar', 'Tahsas', 'Tir', 'Yakatit', 'Megabit',
        'Miazia', 'Ginbot', 'Sene', 'Hamle', 'Nehase', 'Pagume',
    ];

    public const FISCAL_YEAR_PATTERN = '/^\d{4} E\.C\.$/';

    public const CROPPING_ROUNDS = ['Round 1 (1ኛ ዙር)', 'Round 2 (2ኛ ዙር)', 'Round 3 (3ኛ ዙር)'];

    public const SCHEME_TYPES = ['Existing Rehabilitation', 'New Construction'];

    /** Funding channels as used by construction projects, shelf records and land benefits. */
    public const FUNDING_SOURCES = [
        'Regional Government Capital Budget (በክልል መንግስት በጀት)',
        'Federal Government Budget (በፌደራል መንግስት በጀት)',
        'PACT Program (በPACT በጀት)',
        'FSRP Program (በFSRP በጀት)',
        'Lease / Direct Support Financing (በኪራይ/ግልጽ ድጋፍ)',
        'Green Climate Fund (GCF) (በGCF በጀት)',
        'DRDIP Project (በDRDIP በጀት)',
        'CREW Project (በCREW በጀት)',
        'CRIPS Project (በCRIPS በጀት)',
    ];
}
