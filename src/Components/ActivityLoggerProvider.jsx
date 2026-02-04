import React, { useEffect } from 'react';
import activityLogger from '../services/activityLogger';

export default function ActivityLoggerProvider({ children }) {
  useEffect(() => {
    // Initialize logger
    const initLogger = async () => {
      await activityLogger.initialize();
    };
    
    initLogger();
    
    // Log app initialization
    activityLogger.logActivity({
      activityType: 'app_initialized',
      activityLabel: 'Application initialized',
      activityDetails: {
        userAgent: navigator.userAgent,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        language: navigator.language,
        platform: navigator.platform
      }
    });
    
    return () => {
      // Cleanup on unmount
      activityLogger.cleanup();
    };
  }, []);
  
  return <>{children}</>;
}