import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import activityLogger from '../services/activityLogger';

export const useActivityLogger = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const lastPathname = useRef('');
  
  // Initialize logger on mount
  useEffect(() => {
    const initLogger = async () => {
      await activityLogger.initialize();
    };
    
    initLogger();
    
    return () => {
      activityLogger.cleanup();
    };
  }, []);
  
  // Track page views
  useEffect(() => {
    if (lastPathname.current === location.pathname) return;
    
    lastPathname.current = location.pathname;
    
    activityLogger.logPageView({
      pageUrl: window.location.href,
      pageTitle: document.title,
      routePath: location.pathname,
      metadata: {
        searchParams: location.search,
        hash: location.hash
      }
    });
  }, [location]);
  
  // Track button clicks (delegated event handler)
  useEffect(() => {
    const handleClick = (event) => {
      const button = event.target.closest('button, [role="button"], a[href]');
      if (!button) return;
      
      const buttonText = button.textContent?.trim() || 
                       button.getAttribute('aria-label') ||
                       button.getAttribute('title') ||
                       'Unlabeled button';
      
      activityLogger.logButtonClick({
        elementId: button.id,
        elementClass: button.className,
        buttonText,
        action: button.getAttribute('onclick') ? 'custom' : 'default',
        metadata: {
          tagName: button.tagName,
          href: button.getAttribute('href'),
          type: button.getAttribute('type')
        }
      });
    };
    
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);
  
  // Track form submissions
  useEffect(() => {
    const handleSubmit = (event) => {
      const form = event.target;
      
      // Collect form data (excluding sensitive fields)
      const formData = new FormData(form);
      const formValues = {};
      
      for (let [key, value] of formData.entries()) {
        // Skip sensitive fields
        if (key.toLowerCase().includes('password') || 
            key.toLowerCase().includes('token') ||
            key.toLowerCase().includes('secret')) {
          formValues[key] = '[REDACTED]';
        } else {
          formValues[key] = value;
        }
      }
      
      activityLogger.logFormSubmit({
        formName: form.getAttribute('name') || form.id || 'Unknown form',
        elementId: form.id,
        elementClass: form.className,
        values: formValues,
        hasErrors: !form.checkValidity()
      });
    };
    
    document.addEventListener('submit', handleSubmit);
    return () => document.removeEventListener('submit', handleSubmit);
  }, []);
  
  // Track errors
  useEffect(() => {
    const handleError = (event) => {
      activityLogger.logError({
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
      });
    };
    
    const handleUnhandledRejection = (event) => {
      activityLogger.logError({
        message: event.reason?.message || 'Unhandled promise rejection',
        error: event.reason
      });
    };
    
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);
  
  // Track visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        activityLogger.logActivity({
          activityType: 'tab_switch',
          activityLabel: 'Tab switched away',
          activityDetails: { visibilityState: 'hidden' }
        });
      } else {
        activityLogger.logActivity({
          activityType: 'tab_switch',
          activityLabel: 'Tab switched back',
          activityDetails: { visibilityState: 'visible' }
        });
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);
  
  // Track network status
  useEffect(() => {
    const handleOnline = () => {
      activityLogger.logActivity({
        activityType: 'network_status',
        activityLabel: 'Device came online',
        activityDetails: { status: 'online' }
      });
    };
    
    const handleOffline = () => {
      activityLogger.logActivity({
        activityType: 'network_status',
        activityLabel: 'Device went offline',
        activityDetails: { status: 'offline' }
      });
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return {
    logPageView: activityLogger.logPageView.bind(activityLogger),
    logButtonClick: activityLogger.logButtonClick.bind(activityLogger),
    logFormSubmit: activityLogger.logFormSubmit.bind(activityLogger),
    logAIPrompt: activityLogger.logAIPrompt.bind(activityLogger),
    logEmailSent: activityLogger.logEmailSent.bind(activityLogger),
    logFileUpload: activityLogger.logFileUpload.bind(activityLogger),
    logError: activityLogger.logError.bind(activityLogger),
    logAPICall: activityLogger.logAPICall.bind(activityLogger),
    logCustomActivity: activityLogger.logActivity.bind(activityLogger),
    activityTypes: activityLogger.activityTypes
  };
};