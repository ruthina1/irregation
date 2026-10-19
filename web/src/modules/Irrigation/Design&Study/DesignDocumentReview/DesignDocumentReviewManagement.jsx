import React, { useEffect, useMemo, useState } from 'react';
import { App } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { irrigationStudyDesignApi } from '../../../../services/api/irrigationApi';
import useIrrigationRecords from '../../shared/hooks/useIrrigationRecords';
import { CURRENT_FISCAL_YEAR } from '../../shared/constants';
import { exportRowsToCsv, extractName, notifyApiError, toNumber } from '../../shared/utils';
import IrrigationBreadcrumb from '../../shared/components/IrrigationBreadcrumb';
import IrrigationPageHeader from '../../shared/components/IrrigationPageHeader';
import LoadErrorAlert from '../../shared/components/LoadErrorAlert';
import IrrigationStatsSection from '../../shared/components/IrrigationStatsSection';

import DesignDocumentReviewStats from './DesignDocumentReviewStats';
import DesignDocumentReviewFilters from './DesignDocumentReviewFilters';
import DesignDocumentReviewTable from './DesignDocumentReviewTable';
import DesignDocumentReviewForm from './DesignDocumentReviewForm';
import DesignDocumentReviewDetail from './DesignDocumentReviewDetail';

const CSV_COLUMNS = [
  ['Review Code', (r) => r.review_code],
  ['Project Code', (r) => r.project_code],
  ['Scheme Name', (r) => r.scheme_name],
  ['Fiscal Year', (r) => r.fiscal_year],
  ['Milestone', (r) => r.review_milestone],
  ['Volume', (r) => r.document_volume],
  ['Version', (r) => r.submission_version],
  ['Command Area (Ha)', (r) => toNumber(r.command_area_ha)],
  ['Score', (r) => toNumber(r.overall_technical_score)],
  ['Verdict', (r) => r.review_verdict],
  ['Lead Reviewer', (r) => r.lead_reviewer],
  ['Ethiopian Date', (r) => r.review_ethiopian_date],
  ['Zone', (r) => extractName(r.zone)],
  ['Woreda', (r) => extractName(r.woreda)],
  ['Kebele', (r) => extractName(r.kebele)],
];

function DesignDocumentReviewManagementContent() {
  const { message } = App.useApp();
  const location = useLocation();
  const navigate = useNavigate();

  const [fiscalYear, setFiscalYear] = useState(CURRENT_FISCAL_YEAR);
  const [searchTerm, setSearchTerm] = useState(() => location.state?.searchReview || '');
  const [verdictFilter, setVerdictFilter] = useState(null);
  const [milestoneFilter, setMilestoneFilter] = useState(null);
  const [volumeFilter, setVolumeFilter] = useState(null);

  const reviews = useIrrigationRecords(irrigationStudyDesignApi.documentReview, { fiscalYear });
  const projects = useIrrigationRecords(irrigationStudyDesignApi.studyDesign, { fiscalYear });

  const [formState, setFormState] = useState({ open: false, review: null });
  const [dossierReview, setDossierReview] = useState(null);

  useEffect(() => {
    if (location.state?.searchReview) navigate(location.pathname, { replace: true, state: null });
  }, [location.state, location.pathname, navigate]);

  const filteredReviews = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return reviews.records.filter((r) => {
      const haystack = [r.review_code, r.project_code, r.scheme_name, r.submitting_entity, r.lead_reviewer, r.zone, r.woreda]
        .map((v) => extractName(v, '').toLowerCase());
      return (
        haystack.some((v) => v.includes(q))
        && (!verdictFilter || r.review_verdict === verdictFilter)
        && (!milestoneFilter || r.review_milestone === milestoneFilter)
        && (!volumeFilter || r.document_volume === volumeFilter)
      );
    });
  }, [reviews.records, searchTerm, verdictFilter, milestoneFilter, volumeFilter]);

  const stats = useMemo(() => {
    const totalReviews = filteredReviews.length;
    return {
      totalReviews,
      approvedCount: filteredReviews.filter((r) => r.review_verdict?.includes('Approved')).length,
      majorRevisionCount: filteredReviews.filter((r) => r.review_verdict === 'Major Revisions Required').length,
      avgScore: totalReviews > 0
        ? Math.round(filteredReviews.reduce((acc, r) => acc + toNumber(r.overall_technical_score), 0) / totalReviews)
        : 0,
    };
  }, [filteredReviews]);

  const saveReview = async (values, editingReview, form) => {
    const payload = {
      ...values,
      review_verdict: editingReview ? editingReview.review_verdict : 'Under Review',
    };
    try {
      if (editingReview) {
        await reviews.update(editingReview.id, payload);
        message.success('Design review record updated successfully');
      } else {
        await reviews.create(payload);
        message.success('New technical document review session logged successfully');
      }
      return true;
    } catch (err) {
      notifyApiError(message, err, 'Failed to save review record', form);
      return false;
    }
  };

  const changeVerdict = async (record, verdict) => {
    try {
      await reviews.patch(record.id, { review_verdict: verdict });
      message.success(`Verdict updated to "${verdict}"`);
    } catch (err) {
      notifyApiError(message, err, 'Failed to update review verdict');
    }
  };

  const deleteReview = async (record) => {
    try {
      await reviews.remove(record.id);
      message.success('Review evaluation record removed successfully');
    } catch (err) {
      notifyApiError(message, err, 'Failed to delete review record');
    }
  };

  const exportCsv = () => {
    exportRowsToCsv(filteredReviews, CSV_COLUMNS, 'Design_Document_Review_Ledger');
  };

  const reloadAll = () => {
    reviews.reload();
    projects.reload();
  };

  return (
    <div className="irr-page">
      <IrrigationBreadcrumb section="Irrigation Study & Design" title="Design Document Review (የጥናትና ዲዛይን ሰነድ ግምገማ)" />

      <LoadErrorAlert error={reviews.error} onRetry={reviews.reload} />
      <LoadErrorAlert error={projects.error && `Study & design projects: ${projects.error}`} onRetry={projects.reload} />

      <IrrigationStatsSection onRefresh={reloadAll} loading={reviews.loading}>
        <DesignDocumentReviewStats stats={stats} />
      </IrrigationStatsSection>

      <IrrigationPageHeader
        section="Irrigation Study & Design"
        title="Design Document Review (የጥናትና ዲዛይን ሰነድ ግምገማ)"
        subtitle="Technical document verification linked to study projects with direct Action Plan evaluation verdicts"
        fiscalYear={fiscalYear}
        onFiscalYearChange={setFiscalYear}
        onRefresh={reloadAll}
        loading={reviews.loading}
      >
        <DesignDocumentReviewFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          verdictFilter={verdictFilter}
          onVerdictChange={setVerdictFilter}
          milestoneFilter={milestoneFilter}
          onMilestoneChange={setMilestoneFilter}
          volumeFilter={volumeFilter}
          onVolumeChange={setVolumeFilter}
          onExport={exportCsv}
          onCreate={() => setFormState({ open: true, review: null })}
        />
      </IrrigationPageHeader>

      <DesignDocumentReviewTable
        data={filteredReviews}
        loading={reviews.loading}
        onView={setDossierReview}
        onEdit={(review) => setFormState({ open: true, review })}
        onDelete={deleteReview}
        onVerdictChange={changeVerdict}
      />

      <DesignDocumentReviewForm
        open={formState.open}
        editingReview={formState.review}
        projects={projects.records}
        fiscalYear={fiscalYear}
        nextCode={`REV-${fiscalYear.slice(0, 4)}-${String(reviews.records.length + 1).padStart(3, '0')}`}
        onCancel={() => setFormState({ open: false, review: null })}
        onSubmit={(values, form) => saveReview(values, formState.review, form)}
      />

      <DesignDocumentReviewDetail
        review={dossierReview}
        onClose={() => setDossierReview(null)}
      />
    </div>
  );
}

export default function DesignDocumentReviewManagement() {
  return (
    <App>
      <DesignDocumentReviewManagementContent />
    </App>
  );
}
