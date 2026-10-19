import React from 'react';
import { Typography, Badge } from 'antd';
import { useAuthStore } from '../../store/authStore';

// Import Role-Specific Dashboards
import SuperAdminDashboard from './SuperAdminDashboard';
import StaffDashboard from './StaffDashboard';

const { Title, Text } = Typography;

export default function DashboardHome() {
  const { user } = useAuthStore();
  
  // Extract primary role
  const userRole = user?.roles?.[0]?.name || 'Staff';
  const isSuperAdmin = userRole === 'SuperAdmin';

  return (
    <>
      {/* Formal typography overrides to match the system login layout */}
      <style>{`
        .dashboard-container {
          max-width: 1200px;
          margin: 0 auto;
          min-height: 100%;
          padding: 24px 16px;
        }

        .workspace-header {
          margin-bottom: 32px;
          padding-bottom: 24px;
          border-bottom: 2px solid #0f172a; /* Deep formal dark border */
        }

        .workspace-title {
          font-family: Georgia, Cambria, "Times New Roman", Times, serif !important;
          font-weight: 700 !important;
          color: #0f172a !important;
          margin: 0 0 4px 0 !important;
          letter-spacing: -0.5px;
        }

        .workspace-subtitle {
          font-family: Georgia, Cambria, "Times New Roman", Times, serif !important;
          font-style: italic;
          color: #475569 !important;
          font-size: 14px;
        }

        /* Structured Government Metadata Panel */
        .session-context-bar {
          margin-top: 24px;
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 2px;
          padding: 12px 18px;
          display: flex;
          flex-wrap: wrap;
          gap: 24px;
          align-items: center;
        }

        .meta-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .meta-label {
          font-size: 10px;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }

        .meta-value {
          font-size: 13px;
          font-weight: 600;
          color: #0f172a;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }

        .meta-divider {
          width: 1px;
          height: 28px;
          background-color: #e2e8f0;
        }

        @media (max-width: 768px) {
          .session-context-bar {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }
          .meta-divider {
            display: none;
          }
        }
      `}</style>

      <div className="dashboard-container">
        
        {/* ─── Official Administrative Header ─── */}
        <div className="workspace-header">
          <Title level={2} className="workspace-title">
            Bureau of Agriculture Administrative Workspace
          </Title>
          
          {/* Official Session Context Panel */}
          <div className="session-context-bar">
            {/* Active Operator */}
            <div className="meta-item">
              <span className="meta-label">Authorized Operator</span>
              <span className="meta-value" style={{ fontFamily: 'Georgia, Cambria, serif', fontWeight: 'bold' }}>
                {user?.full_name || 'N/A'}
              </span>
            </div>

            <div className="meta-divider" />

            {/* Access Clearance */}
            <div className="meta-item">
              <span className="meta-label">Access Clearance</span>
              <span className="meta-value">
                <Badge 
                  status={isSuperAdmin ? "error" : "processing"} 
                  text={userRole} 
                  style={{ fontWeight: 600, color: isSuperAdmin ? '#991b1b' : '#1e40af' }}
                />
              </span>
            </div>

            <div className="meta-divider" />
          </div>
        </div>

        {/* ─── Role-Based Dashboard Workspace Routing ─── */}
        <div style={{ marginTop: 24 }}>
          {isSuperAdmin ? <SuperAdminDashboard /> : <StaffDashboard />}
        </div>
        
      </div>
    </>
  );
}