# Irrigation module — handoff notes (2026-10-15)

Paste this file into a new Claude Code chat (opened in this folder) and say:
"Continue the Irrigation module task from HANDOFF.md."

## Goal (from the brief)
Build the Irrigation module backend in `api/` (Laravel, user-given structure) and the frontend in `web/`
(React/Vite/antd). Connect them, split pages into components, keep every existing feature, and leave other modules untouched.

## Layout
- `web/`: the original frontend, moved here unchanged. The original copy is kept at
  `/tmp/claude-1000/-home-abraham-Downloads-Telegram-Desktop-dist--2-/7ddd5f25-8774-4731-9b28-61a0053e3886/scratchpad/baseline`
  (it may not survive a reboot; use it for the diff review).
- `api/`: new Laravel 13 app with nwidart/laravel-modules, Sanctum and spatie/laravel-permission.
  - `api/Modules/Irrigation/` follows the requested structure:
    - `app/Http/Controllers/IrrigationController.php`
    - `app/Http/Requests/Store|UpdateIrrigationRequest.php`
    - `app/Models/Irrigation.php` (table `irrigation_records`; shared fields are columns, the rest is a JSON `data` column)
    - `routes/api.php`
    - `database/migrations` and `database/seeders`
    - `Providers/IrrigationServiceProvider.php`
    - Added: `app/Services` (IrrigationService, IrrigationWorkflowService, IrrigationReportService) and
      `app/Support` (IrrigationResources registry, IrrigationEnums, IrrigationValidation, EthiopianCalendar).
  - Base app: `routes/api.php` has `/api/v1/umac/login|me|logout|change-password` (AuthController).
    Also changed: `bootstrap/app.php` (apiPrefix `api/v1`, JSON errors), `AppServiceProvider` (SuperAdmin bypass,
    login throttle), `config/cors.php` (CORS_ALLOWED_ORIGINS), `DatabaseSeeder`, `phpunit.xml` (MariaDB + module tests).

## Running locally
- Database: Docker container `iaims-mariadb` (mariadb:10.11.10), port 13306, databases `iaims` and `iaims_testing`.
  Docker Hub pulls hang on this machine; the image was already local.
- API: `cd api && php artisan serve --port=8000`. Admin login comes from `IAIMS_ADMIN_EMAIL` / `IAIMS_ADMIN_PASSWORD` in `api/.env`.
- Web: `cd web && npx vite --port 5173`. `web/.env.development.local` (gitignored) points it at `http://127.0.0.1:8000/api/v1`.
  The production `.env` is unchanged.
- Backend tests: `cd api && php artisan test --testsuite=Modules`. Last run: 74 tests passed (680 assertions).
- Browser E2E: `scratchpad/e2e/wua.mjs` (playwright-core using the cached Chromium in `~/.cache/ms-playwright`).

## API contract
- Base path: `/api/v1/irrigation/{resource}`.
- Every route needs a Sanctum token and the `manage-watersheds` permission (SuperAdmin passes automatically).
- Resources:
  - `pipeline`, `study-design`, `document-review`, `quality-assurance`, `construction-ready`
  - `capacity-building`, `inputs`
  - `construction/{projects,progress,completion,funding,benefits}`
  - `institutions/{water-users-associations,assessment-audit,capacity-building,maintenance-cleaning}`
  - `water-utilization/{irrigated-area,water-sources}`
  - `production/{seasonal-production,highland-wheat}`
- Workflow actions:
  - `PATCH pipeline/{id}/screening`
  - `PATCH study-design/{id}/review-qa`
  - `POST construction-ready/{id}/handover`
  - `PUT construction/projects/{id}/progress`
  - `POST construction/funding/{id}/disburse`
  - `POST inputs/{id}/dispatch`
- Reports:
  - `GET reports/{directorate-master|study-design|construction|institutions|water-utilization|production|beneficiaries}`
  - `GET study-design/dashboard`
  - `GET production/overview`
- Lists return `{data:[...]}`. Errors return `{message, errors?}` with status 422, 404, 409, 405, 403 or 401.

## Frontend status
- Shared layer (done):
  - `web/src/services/api/irrigationApi.js`, which uses the existing axios client
  - `web/src/modules/Irrigation/shared/` (constants, utils, `hooks/useIrrigationRecords`, StatCard, FilterBar,
    EthDateFields, ComputedTotal, IrrigationPageHeader, LoadErrorAlert)
- Reference page (done, browser-verified): `Irrigatio&Institutions&Management/WaterUsersAssociations/` (folder + `index.jsx`).
  - Pattern: `index.jsx` + `constants.js` + `hooks/` + `components/` + `utils/`.
  - The old `.jsx` file was deleted, so App.jsx imports resolve to the folder's `index.jsx`.
- STATUS WHEN THE AGENTS WERE STOPPED (checked with a script):
  - Converted (folder with index.jsx; still needs review and lint): WaterUsersAssociations,
    ConstructionReadyDesigns, IrrigationDirectorateMasterReport, StudyDesignReports.
  - HALF-DONE (both the old .jsx and an unfinished folder exist; the old .jsx still wins at import
    time, so the app keeps working): ConstructionProjects, ConstructionProgressPerformance,
    ProjectCompletionHandover, ProjectFundingFinancing, SeasonalCropProductionYield, HighlandIrrigatedWheat.
    Finish each folder (check it against the old .jsx so no feature is lost), then delete the old .jsx.
  - NOT STARTED: every other page (19 in total).
  - Check whether `Analytics&Reports/shared/` (useIrrigationReport, ReportHeader) and
    `IrrigationWaterUtilization/WaterSourcesShared/` exist and are complete.
  - !! BUILD IS CURRENTLY BROKEN: App.jsx imports `IrrigationWaterUtilization/WaterUtilizationOverview`,
    and that folder does not exist yet. Create that page FIRST (spec in group F below).
- Other pages: 8 parallel agents were converting the remaining 29 pages; they were stopped.
  - Converted: a page folder with `index.jsx` exists and the old `.jsx` is gone.
  - Not converted: the old `.jsx` still exists, or both a folder and the `.jsx` exist (unfinished conversion).
  - Groups:
    - A: Design&Study — Pipeline, StudyDesign, DocumentReview, QualityAssurance
    - B: Design&Study — ConstructionReady, ProfessionalCapacityBuilding, AgriculturalInputUtilization, StudyDesignDashboard
    - C: Construction — Projects, ProgressPerformance, CompletionHandover
    - D: Construction — FundingFinancing, DevelopedLandBeneficiaries; Institutions — AssociationStrengtheningAudit
    - E: AssociationCapacityBuilding, SchemeMaintenanceCleaning, IrrigatedLandUtilization
    - F: WaterSources + IrrigationSystemsMethods (shared `WaterSourcesShared/`), CropProductionOverview, and the new `WaterUtilizationOverview/`
    - G: SeasonalCropProductionYield, HighlandIrrigatedWheat
    - H: all 7 `Analytics&Reports` pages (shared `useIrrigationReport`)
  - Rules for each page:
    - No mock data and no swallowed errors; report failures with `notifyApiError`.
    - Keep every field, column, filter, KPI, export, modal and navigation.
    - Edit forms load the saved date with `ethDateFields()`.
    - Replace `Select mode="combobox"` with `AutoComplete`. antd 6 dropped combobox mode, so free text never submitted.
    - Use `Divider titlePlacement="start"` and `destroyOnHidden`.
    - No default `import React`.
    - No synchronous setState inside `useEffect`.
- The only shared-file change is `web/src/App.jsx`: one import and a route for `/irrigation/water-utilization/overview`.
  The sidebar linked to it, but it had no route or page.

## API details by page group (irrigationApi.* names)
- **Pipeline:** `pipeline.screen(id, {pipeline_status, promoted_to_study, reconnaissance_expert, site_notes, eth_*})`.
  Approving and promoting automatically creates a study-design project.
- **Study design:** `studyDesign.reviewQa(id, {review_status, qa_status, is_construction_ready, reviewer_expert, review_notes, eth_*})`.
  - Returns 422 if a design is marked ready without a QA pass.
  - Study rows include `latest_review_code`, `latest_review_verdict`, `latest_review_score` and `review_cleared`.
    The QA page must read these fields, not `review_status`.
- **Document review / QA:**
  - Both send `project_id` and the `check_*` booleans.
  - The QA page's "linked review" modal fetches `documentReview.list({code})`.
  - Certifying a QA audit requires the latest review to be approved (422 otherwise). Certification puts the study on the
    construction-ready shelf automatically.
- **Construction-ready shelf:** `constructionReady.list`, `patch({shelf_status})` and
  `handover(id, {procurement_method, executing_client, allocated_budget_etb, handover_notes})` (409 if already handed over).
  Keep the existing navigation to the projects page with `shelfProject` state. There is no create or delete.
- **Inputs:** `inputs.dispatch(id, {dispatch_qty, recipient, notes, eth_*})`. The server owns `distributed_qty`,
  `dispatch_history` and `status`.
- **Study & Design dashboard:** `studyDesign.dashboard({fiscal_year})` returns
  - `data.kpis`
  - `data.stage_progress`
  - `data.modality_distribution` (assign colours client-side)
  - `data.recent_certifications`
- **Contract progress:** `constructionProjects.evaluateProgress(id, {the WBS percentages and quantities, health_status,
  resident_engineer, site_progress_notes, eth_*})`. This also writes a progress-log entry.
- **Progress logs:** need `contract_id`. The server derives the contract fields, fiscal year, variance and health.
- **Completion page:** the projects lookup passes `params: {status: 'Handed Over to Users'}`. The page sends the `check_*`
  booleans; the server computes the DLP expiry date and `protocol_checklist`.
- **Funding:** `constructionFunding.disburse(id, {disbursement_amount, ipc_no, recipient, voucher_ref, eth_*})`
  (422 if the amount exceeds the remaining balance).
- **Benefits:** `primary_crops_cultivated` is an array.
- **Strengthening audit:**
  - `associationAudits.list`; one audit is created automatically for each WUA, so there is no create UI.
  - The yearly audit is `associationAudits.update(id, {fiscal_year, audit_scope, audit_verdict, governance_grade,
    overall_health_score, audited_revenue_etb, audited_expense_etb, unaccounted_variance_etb, lead_auditor,
    audit_institution, strengthening_interventions, eth_*, check_assembly, check_bank, check_receipts, check_bylaws,
    check_disputes, check_assets})`.
  - The server rolls the previous result into history.
  - Pending audits have a null `governance_grade`, so guard every `.includes` / `.split`.
- **Other institution pages:** WUA trainings use `associationTrainings` (`wua_id`); maintenance uses `schemeMaintenance`
  (`intervention_types` is an array; labour fields are optional).
- **Water pages:**
  - Irrigated land uses `irrigatedArea`.
  - WaterSources and IrrigationSystemsMethods both use `waterSources` and share one implementation in
    `WaterSourcesShared/`. Systems & Methods keeps its WUA dropdown, fed by `waterUsersAssociations`.
- **Production:**
  - Seasonal and wheat pages: `seasonalProduction` / `highlandWheat`. Add a visible switch for `mechanized_harvesting`.
  - `productionOverview({fiscal_year})` returns `data` rows plus `summary`, `rounds` and `categories`. Replace the
    hardcoded KPIs and charts, and point the wheat card at `/irrigation/production/summer-wheat`.
- **WaterUtilizationOverview (new page):** KPIs and a zone table from `report('water-utilization')`, plus a category
  breakdown from `waterSources.list`, with links to the 3 water pages. Null metrics show "Not tracked".
- **Reports:**
  - `report(name, {fiscal_year})` returns rows with the same keys as the old mock data.
  - `directorate-master` also returns `program_portfolio`.
  - `construction` returns `meta.milestone_adherence_pct`; use it in place of the hardcoded 92%.
  - Null metrics show "Not tracked".
  - Fix the Directorate tab-icon bug.
- **Scheme lookups:** `constructionProjects`, which now includes `wua_name`.

## Remaining steps
1. Check every page is converted: `find web/src/modules/Irrigation -maxdepth 2 -name '*.jsx'` should list no old page files.
2. `cd web && npx eslint src/modules/Irrigation src/services/api/irrigationApi.js` and `npx vite build` must both pass.
3. Run browser checks of each page against the local API (create, edit, status change, delete, workflow actions, reports),
   following the `scratchpad/e2e/wua.mjs` pattern.
4. Run the final diff against the baseline and confirm that nothing outside `web/src/modules/Irrigation`,
   `web/src/services/api/irrigationApi.js` and the App.jsx route changed.
5. Write the final report (sections A–E of the brief). Points to include:
   - The component-breakdown image was never provided, so the breakdown follows the brief's text.
   - IrrigationSystemsMethods has no data model of its own; it shares the water-sources resource.
   - Metrics with no source data (drip/sprinkler hectares, application efficiency, female-headed households) are returned as null and shown as "Not tracked".
   - Pre-existing antd deprecation warnings come from the shared MainLayout and were left alone.
   - Set `APP_DEBUG=false` in production.
