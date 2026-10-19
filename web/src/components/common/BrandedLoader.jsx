import React from 'react';
import { Typography } from 'antd';

const { Text } = Typography;

export default function BrandedLoader({ message = "System Initializing" }) {
  return (
    <div style={styles.overlay}>
      {/* ─── Custom Keyframes ─── */}
      <style>{`
        @keyframes systemSpin {
          100% { transform: rotate(360deg); }
        }
        @keyframes textBreathe {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>

      <div style={styles.centerContainer}>
        {/* Minimalist System Spinner */}
        <svg 
          width="44" 
          height="44" 
          viewBox="0 0 44 44" 
          xmlns="http://www.w3.org/2000/svg"
          style={styles.spinner}
        >
          {/* Background Track */}
          <circle 
            cx="22" cy="22" r="20" 
            fill="none" 
            stroke="#e2e8f0" 
            strokeWidth="2.5" 
          />
          {/* Active Animated Track */}
          <circle 
            cx="22" cy="22" r="20" 
            fill="none" 
            stroke="#2C9647" 
            strokeWidth="2.5" 
            strokeLinecap="round"
            strokeDasharray="30 100"
          />
        </svg>

        {/* High-Level Formal Typography */}
        <Text style={styles.message}>
          {message}
        </Text>
      </div>

      {/* Minimal Formal Footer */}
      <div style={styles.footer}>
        <Text style={styles.footerText}>IAIMS • Amhara Regional State Bureau of Agriculture</Text>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0, // top: 0, right: 0, bottom: 0, left: 0
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    backdropFilter: 'blur(2px)',
    WebkitBackdropFilter: 'blur(2px)',
    animation: 'fadeIn 0.3s ease-out forwards',
  },
  centerContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '24px',
  },
  spinner: {
    animation: 'systemSpin 1s cubic-bezier(0.4, 0, 0.2, 1) infinite',
  },
  message: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#334155', // Sleek dark slate
    textTransform: 'uppercase',
    letterSpacing: '2px', // Highly tracked for a "system" feel
    animation: 'textBreathe 2s ease-in-out infinite',
  },
  footer: {
    position: 'absolute',
    bottom: '32px',
  },
  footerText: {
    fontSize: '10px',
    fontWeight: 500,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  }
};