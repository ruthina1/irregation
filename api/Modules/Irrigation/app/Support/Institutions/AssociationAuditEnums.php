<?php

namespace Modules\Irrigation\Support\Institutions;

/**
 * Controlled vocabularies of association strengthening audits.
 *
 * Values are copied verbatim (including the Amharic labels) from the
 * frontend pages, because the pages compare and filter on these exact strings.
 */
final class AssociationAuditEnums
{
    public const VERDICTS = [
        'Unqualified Audit Opinion',
        'Qualified Audit Opinion',
        'Adverse Audit Opinion',
        'Disclaimer of Opinion',
        'Audit In Progress',
    ];

    public const IN_PROGRESS = 'Audit In Progress';

    public const GOVERNANCE_GRADES = [
        'Grade A - High Functionality',
        'Grade B - Moderate Functionality',
        'Grade C - Weak Governance',
    ];

    public const SCOPES = [
        'Comprehensive Financial & Legal Compliance Audit',
        'Annual Water Fee Revenue & Bank Reconciliation Audit',
        'Operation & Maintenance Fund Utilization Audit',
        'Governance & Leadership By-Law Compliance Inspection',
    ];
}
