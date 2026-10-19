import React, { useState } from 'react';
import { App, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import { irrigationStudyDesignApi } from '../../../../services/api/irrigationApi';
import { CURRENT_FISCAL_YEAR } from '../../shared/constants';
import IrrigationBreadcrumb from '../../shared/components/IrrigationBreadcrumb';
import IrrigationPageHeader from '../../shared/components/IrrigationPageHeader';
import LoadErrorAlert from '../../shared/components/LoadErrorAlert';
import IrrigationStatsSection from '../../shared/components/IrrigationStatsSection';

import StudyDesignDashboardStats from './StudyDesignDashboardStats';
import StudyDesignDashboardFilters from './StudyDesignDashboardFilters';
import StudyDesignDashboardTable, { DashboardCharts, RecentCertificationsTable } from './StudyDesignDashboardTable';
import StudyDesignDashboardForm from './StudyDesignDashboardForm';
import StudyDesignDashboardDetail from './StudyDesignDashboardDetail';

/** Colours for the modality groups returned by study-design/dashboard. */
export const MODALITY_COLORS = {
  'Consultant (New)': '#5b8a6b',
  'Consultant (Rehab)': '#64748b',
  'Program-Led (FSRP/PACT)': '#64748b',
  'In-House Regional': '#64748b',
  'In-House Zonal/Woreda': '#2f7d4a',
};

/** Used for any modality group the client does not know yet. */
export const FALLBACK_MODALITY_COLORS = ['#a16207', '#64748b', '#5b8a6b', '#a16207', '#8c8c8c'];

export const ROUTES = {
  pipeline: '/irrigation/study-design/project-identification',
  studies: '/irrigation/study-design/projects',
};








const EMPTY = { kpis: null, stage_progress: [], modality_distribution: [], recent_certifications: [] };

/**
 * Loads GET study-design/dashboard for the selected fiscal year.
 * `loading` is derived from whether the latest request has completed, and
 * responses for a superseded request are ignored.
 */
function useStudyDesignDashboard() {
  const [fiscalYear, setFiscalYear] = useState(CURRENT_FISCAL_YEAR);
  const [version, setVersion] = useState(0);
  const [result, setResult] = useState({ key: null, data: EMPTY, error: null });

  const requestKey = `${fiscalYear}#${version}`;

  useEffect(() => {
    let current = true;
    irrigationStudyDesignApi.studyDesign.dashboard({ fiscal_year: fiscalYear }).then(
      (res) => {
        if (current) setResult({ key: requestKey, data: { ...EMPTY, ...(res.data?.data || {}) }, error: null });
      },
      (err) => {
        if (current) setResult({ key: requestKey, data: EMPTY, error: getApiErrorMessage(err, 'Failed to load the Study & Design dashboard.') });
      }
    );
    return () => {
      current = false;
    };
  }, [fiscalYear, requestKey]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);

  // Colours are assigned client-side (the API returns name / count / hectares).
  const modalityDistribution = useMemo(
    () => (result.data.modality_distribution || []).map((m, i) => ({
      ...m,
      color: MODALITY_COLORS[m.name] || FALLBACK_MODALITY_COLORS[i % FALLBACK_MODALITY_COLORS.length],
    })),
    [result.data.modality_distribution]
  );

  return {
    fiscalYear,
    setFiscalYear,
    loading: result.key !== requestKey,
    error: result.error,
    reload,
    kpis: result.data.kpis,
    stageProgress: result.data.stage_progress || [],
    modalityDistribution,
    recentCertifications: result.data.recent_certifications || [],
  };
}


function StudyDesignDashboardContent() {
  const navigate = useNavigate();
  const dashboard = useStudyDesignDashboard();
  const [detailItem, setDetailItem] = useState(null);
  const [formOpen, setFormOpen] = useState(false);

  return (
    <div className="irr-page">
      <IrrigationBreadcrumb section="Irrigation Study & Design" title="Study & Design Performance Overview" />

      <LoadErrorAlert error={dashboard.error} onRetry={dashboard.reload} />

      <Spin spinning={dashboard.loading}>
        <IrrigationStatsSection onRefresh={dashboard.reload} loading={dashboard.loading}>
          <StudyDesignDashboardStats kpis={dashboard.kpis} onNavigate={navigate} />
        </IrrigationStatsSection>
      </Spin>

      <IrrigationPageHeader
        section="Irrigation Study & Design"
        title="Study & Design Performance Overview"
        subtitle="Executive scorecard tracking the complete lifecycle from scouting pipeline to construction-ready design certification"
        fiscalYear={dashboard.fiscalYear}
        onFiscalYearChange={dashboard.setFiscalYear}
        onRefresh={dashboard.reload}
        loading={dashboard.loading}
        extra={<StudyDesignDashboardFilters onNavigateStudies={() => navigate(ROUTES.studies)} />}
      />

      <StudyDesignDashboardTable
        recentCertifications={dashboard.recentCertifications}
        stageProgress={dashboard.stageProgress}
        modalityDistribution={dashboard.modalityDistribution}
        loading={dashboard.loading}
        onViewAll={() => navigate(ROUTES.studies)}
      />

      <StudyDesignDashboardDetail visible={Boolean(detailItem)} record={detailItem} onClose={() => setDetailItem(null)} />
      <StudyDesignDashboardForm open={formOpen} onCancel={() => setFormOpen(false)} onSubmit={() => setFormOpen(false)} />
    </div>
  );
}

export default function StudyDesignDashboardManagement() {
  return (
    <App>
      <StudyDesignDashboardContent />
    </App>
  );
}
