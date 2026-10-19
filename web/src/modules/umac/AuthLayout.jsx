import React from 'react';
import { Typography } from 'antd';

// Import the official logo asset
import logo from "../../assets/IAIMS.png";

const { Title, Text } = Typography;

export default function AuthLayout({ children }) {
  return (
    <>
      {/* Formal Serif Typography and Large Label Styling overrides */}
      <style>{`
        .auth-container {
          min-height: 100vh;
          display: flex;
          background-color: #fcfcfc;
          /* Formal serif-based system font stack */
          font-family: Georgia, Cambria, "Times New Roman", Times, serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        
        /* Left branding panel */
        .branding-panel {
          flex: 0.75; 
          background: linear-gradient(135deg, #163e1e 0%, #0b2210 100%);
          color: #ffffff;
          padding: 56px 48px;
          display: flex;
          flex-direction: column;
          position: relative;
          justify-content: space-between;
          border-right: 1px solid rgba(0, 0, 0, 0.1);
        }

        .center-brand-group {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          margin-top: auto;
          margin-bottom: auto;
        }

        /* Right form panel */
        .form-panel {
          flex: 1.25;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 56px 32px;
          background-color: #ffffff;
        }

        .form-inner {
          width: 100%;
          max-width: 380px;
        }

        .mobile-logo-header {
          display: none;
          text-align: center;
          margin-bottom: 32px;
        }

        /* Highly formal serif overrides for headings */
        .form-panel h1, 
        .form-panel h2, 
        .form-panel h3, 
        .form-panel h4 {
          font-family: Georgia, Cambria, "Times New Roman", Times, serif !important;
          font-weight: 700 !important;
          color: #0f172a !important;
        }

        /* Enlarged, bold, highly professional form labels */
        .form-panel .ant-form-item-label > label {
          font-family: Georgia, Cambria, "Times New Roman", Times, serif !important;
          font-size: 15px !important;
          font-weight: 700 !important;
          color: #0f172a !important;
          letter-spacing: 0.2px;
          padding-bottom: 4px;
        }

        /* Standard input fields use high-legibility sans-serif for inputted data */
        .form-panel .ant-input-affix-wrapper,
        .form-panel .ant-input {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
          font-size: 14px !important;
          border-radius: 2px !important; /* Sharper borders for a formal appearance */
        }
        
        /* Mobile and tablet responsive design adjustments */
        @media (max-width: 991px) {
          .branding-panel {
            display: none !important;
          }
          .form-panel {
            flex: 1;
            background-color: #fafafa;
          }
          .mobile-logo-header {
            display: flex;
            flex-direction: column;
            align-items: center;
          }
        }
      `}</style>

      <div className="auth-container">
        {/* Left Branding Panel (Desktop/Laptop) */}
        <div className="branding-panel" style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={styles.brandingOverlay} />
          
          <div style={{ height: '20px' }} />

          <div className="center-brand-group">
            <img 
              src={logo} 
              alt="IAIMS Logo" 
              style={styles.largeLogoAsset} 
            />
            <Title level={2} style={styles.largeBrandTitle}>
              IAIMS
            </Title>
            <div style={styles.brandSubtitleDivider} />
            <Text style={styles.largeBrandSubtitle}>
              Amhara Region Bureau of Agriculture
            </Text>
            <Text style={styles.versionTag}>
              OFFICIAL SYSTEM · v1.0
            </Text>
          </div>

          <div style={{ textAlign: 'center' }}>
            <Text style={styles.copyright}>
              © {new Date().getFullYear()} Alyah Software PLC.
            </Text>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="form-panel">
          <div className="form-inner">
            {/* Mobile Header (Only visible on smaller viewports) */}
            <div className="mobile-logo-header">
              <img src={logo} alt="IAIMS Logo" style={{ height: 64, marginBottom: 16 }} />
              <Title level={3} style={{ margin: 0, fontWeight: 700 }}>
                IAIMS
              </Title>
              <Text type="secondary" style={{ fontSize: 13, fontFamily: 'Georgia, Cambria, serif' }}>
                Amhara Region Bureau of Agriculture
              </Text>
            </div>

            {/* Injected Login Form */}
            {children}
          </div>
        </div>
      </div>
    </>
  );
}

const styles = {
  brandingOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundImage:
      'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.04) 0%, transparent 60%)',
    pointerEvents: 'none',
  },
  largeLogoAsset: {
    height: 104,
    width: 'auto',
    objectFit: 'contain',
    marginBottom: 24,
  },
  largeBrandTitle: {
    color: '#ffffff',
    fontSize: '34px',
    fontWeight: 700,
    margin: 0,
    fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif',
  },
  brandSubtitleDivider: {
    width: 40,
    height: 2,
    backgroundColor: '#40a9ff', // Classic formal light-blue/teal tone accent divider
    margin: '16px 0',
  },
  largeBrandSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: '15px',
    lineHeight: 1.5,
    maxWidth: '280px',
    fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif',
  },
  versionTag: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '1px',
    marginTop: 16,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  copyright: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: '11px',
    letterSpacing: '0.5px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  }
};