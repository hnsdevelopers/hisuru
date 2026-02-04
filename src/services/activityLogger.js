import { supabase } from '../lib/supabase';

class ActivityLogger {
  constructor() {
    this.currentSessionId = null;
    this.isInitialized = false;
    this.lastActivityTime = null;
    this.activityQueue = [];
    this.flushInterval = null;
    
    // Default activity types
    this.activityTypes = {
      // Auth
      LOGIN: 'login',
      LOGOUT: 'logout',
      SIGNUP: 'signup',
      PASSWORD_RESET: 'password_reset',
      
      // Navigation
      PAGE_VIEW: 'page_view',
      NAVIGATE: 'navigate',
      TAB_SWITCH: 'tab_switch',
      
      // User Actions
      BUTTON_CLICK: 'button_click',
      FORM_SUBMIT: 'form_submit',
      FORM_FIELD_CHANGE: 'form_field_change',
      SEARCH: 'search',
      FILTER: 'filter',
      SORT: 'sort',
      
      // AI Actions
      AI_PROMPT: 'ai_prompt',
      AI_RESPONSE: 'ai_response',
      AI_TOOL_USE: 'ai_tool_use',
      
      // Communication
      EMAIL_SENT: 'email_sent',
      EMAIL_OPENED: 'email_opened',
      EMAIL_CLICKED: 'email_clicked',
      SMS_SENT: 'sms_sent',
      NOTIFICATION_SENT: 'notification_sent',
      
      // Files
      FILE_UPLOAD: 'file_upload',
      FILE_DOWNLOAD: 'file_download',
      FILE_DELETE: 'file_delete',
      FILE_SHARE: 'file_share',
      
      // Settings
      SETTINGS_CHANGE: 'settings_change',
      PREFERENCE_UPDATE: 'preference_update',
      
      // Errors
      ERROR: 'error',
      WARNING: 'warning',
      
      // Performance
      PERFORMANCE_METRIC: 'performance_metric',
      API_CALL: 'api_call',
      
      // Payment
      PAYMENT_INITIATED: 'payment_initiated',
      PAYMENT_SUCCESS: 'payment_success',
      PAYMENT_FAILED: 'payment_failed',
      
      // Subscription
      SUBSCRIPTION_CREATED: 'subscription_created',
      SUBSCRIPTION_UPDATED: 'subscription_updated',
      SUBSCRIPTION_CANCELLED: 'subscription_cancelled'
    };
  }

  // Initialize logger with user info
  async initialize(userId = null) {
    if (this.isInitialized) return;

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user && !userId) {
        console.warn('No user found for activity logging');
        return;
      }

      const currentUserId = userId || user.id;
      
      // Get or create session
      this.currentSessionId = await this.getOrCreateSession(currentUserId);
      
      // Start activity flush interval
      this.flushInterval = setInterval(() => this.flushActivityQueue(), 5000);
      
      // Track page visibility changes
      this.setupVisibilityTracking();
      
      // Track performance metrics
      this.setupPerformanceTracking();
      
      this.isInitialized = true;
      console.log('Activity logger initialized');
      
      // Log initialization
      await this.logActivity({
        activityType: this.activityTypes.PAGE_VIEW,
        activityLabel: 'Activity logger initialized',
        pageUrl: window.location.href,
        pageTitle: document.title
      });
      
    } catch (error) {
      console.error('Failed to initialize activity logger:', error);
    }
  }

  // Get or create user session
  async getOrCreateSession(userId) {
    try {
      const userAgent = navigator.userAgent;
      const screenRes = `${window.screen.width}x${window.screen.height}`;
      
      // Get IP address (requires backend help or external service)
      const ipData = await this.getIPInfo();
      
      // Check for existing active session
      const { data: existingSessions, error: sessionError } = await supabase
        .from('user_sessions')
        .select('id')
        .eq('user_id', userId)
        .eq('is_active', true)
        .eq('ip_address', ipData.ip)
        .limit(1);
      
      if (!sessionError && existingSessions?.length > 0) {
        // Update existing session
        await supabase
          .from('user_sessions')
          .update({
            last_activity_at: new Date().toISOString(),
            is_current: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingSessions[0].id);
        
        return existingSessions[0].id;
      }
      
      // Create new session
      const { data: newSession, error: createError } = await supabase
        .from('user_sessions')
        .insert({
          user_id: userId,
          device_name: this.getDeviceName(),
          device_type: this.getDeviceType(),
          os_name: this.getOSName(),
          os_version: this.getOSVersion(),
          browser_name: this.getBrowserName(),
          browser_version: this.getBrowserVersion(),
          browser_language: navigator.language,
          screen_resolution: screenRes,
          is_mobile: this.isMobile(),
          is_tablet: this.isTablet(),
          is_desktop: this.isDesktop(),
          ip_address: ipData.ip,
          country_code: ipData.country_code,
          country_name: ipData.country_name,
          region: ipData.region,
          city: ipData.city,
          latitude: ipData.latitude,
          longitude: ipData.longitude,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          user_agent: userAgent,
          platform: navigator.platform,
          is_current: true,
          login_at: new Date().toISOString(),
          last_activity_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        })
        .select('id')
        .single();
      
      if (createError) throw createError;
      
      return newSession.id;
      
    } catch (error) {
      console.error('Failed to create session:', error);
      return null;
    }
  }

  // Get IP information
  async getIPInfo() {
    try {
      // Try to get IP from Supabase edge function or external service
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      
      // For detailed location, you would need a paid service
      return {
        ip: data.ip,
        country_code: 'XX',
        country_name: 'Unknown',
        region: 'Unknown',
        city: 'Unknown',
        latitude: 0,
        longitude: 0
      };
    } catch (error) {
      return {
        ip: '0.0.0.0',
        country_code: 'XX',
        country_name: 'Unknown',
        region: 'Unknown',
        city: 'Unknown',
        latitude: 0,
        longitude: 0
      };
    }
  }

  // Device detection helpers
  getDeviceName() {
    const ua = navigator.userAgent;
    if (/iPhone/.test(ua)) return 'iPhone';
    if (/iPad/.test(ua)) return 'iPad';
    if (/Android/.test(ua)) return 'Android Device';
    if (/Windows/.test(ua)) return 'Windows PC';
    if (/Mac/.test(ua)) return 'Mac';
    if (/Linux/.test(ua)) return 'Linux PC';
    return 'Unknown Device';
  }

  getDeviceType() {
    const ua = navigator.userAgent;
    if (/Mobile/.test(ua)) return 'mobile';
    if (/Tablet/.test(ua)) return 'tablet';
    return 'desktop';
  }

  getOSName() {
    const ua = navigator.userAgent;
    if (/Windows/.test(ua)) return 'Windows';
    if (/Mac/.test(ua)) return 'macOS';
    if (/Linux/.test(ua)) return 'Linux';
    if (/Android/.test(ua)) return 'Android';
    if (/iOS|iPhone|iPad/.test(ua)) return 'iOS';
    return 'Unknown';
  }

  getOSVersion() {
    // Simplified version detection
    const ua = navigator.userAgent;
    const matches = ua.match(/(Windows NT|Android|iPhone OS|Mac OS X)\s([\d._]+)/);
    return matches ? matches[2] : 'Unknown';
  }

  getBrowserName() {
    const ua = navigator.userAgent;
    if (/Chrome/.test(ua) && !/Edge/.test(ua)) return 'Chrome';
    if (/Firefox/.test(ua)) return 'Firefox';
    if (/Safari/.test(ua) && !/Chrome/.test(ua)) return 'Safari';
    if (/Edge/.test(ua)) return 'Edge';
    if (/Opera/.test(ua)) return 'Opera';
    return 'Unknown';
  }

  getBrowserVersion() {
    const ua = navigator.userAgent;
    const matches = ua.match(/(Chrome|Firefox|Safari|Edge|Opera)\/([\d.]+)/);
    return matches ? matches[2] : 'Unknown';
  }

  isMobile() {
    return /Mobi|Android/i.test(navigator.userAgent);
  }

  isTablet() {
    return /Tablet|iPad/i.test(navigator.userAgent);
  }

  isDesktop() {
    return !this.isMobile() && !this.isTablet();
  }

  // Setup visibility change tracking
  setupVisibilityTracking() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.logActivity({
          activityType: this.activityTypes.PAGE_VIEW,
          activityLabel: 'Tab hidden/backgrounded',
          activityDetails: { visibilityState: 'hidden' }
        });
      } else {
        this.logActivity({
          activityType: this.activityTypes.PAGE_VIEW,
          activityLabel: 'Tab visible/foregrounded',
          activityDetails: { visibilityState: 'visible' }
        });
      }
    });
  }

  // Setup performance tracking
  setupPerformanceTracking() {
    if ('performance' in window) {
      // Monitor long tasks
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (entry.duration > 100) { // Tasks longer than 100ms
              this.logActivity({
                activityType: this.activityTypes.PERFORMANCE_METRIC,
                activityLabel: 'Long task detected',
                activityDetails: {
                  entryType: entry.entryType,
                  name: entry.name,
                  duration: entry.duration,
                  startTime: entry.startTime
                }
              });
            }
          });
        });
        
        observer.observe({ entryTypes: ['longtask'] });
      }
    }
  }

  // Main logging function
  async logActivity(activityData) {
    const defaultData = {
      activityType: this.activityTypes.PAGE_VIEW,
      activityCategory: 'navigation',
      activityLabel: 'User activity',
      activityDetails: {},
      pageUrl: window.location.href,
      pageTitle: document.title,
      routePath: window.location.pathname,
      elementId: null,
      elementClass: null,
      elementType: null,
      elementText: null,
      loadTimeMs: null,
      responseTimeMs: null,
      isSuccessful: true,
      errorMessage: null,
      metadata: {}
    };

    const activity = { ...defaultData, ...activityData };
    
    // Add timestamp
    activity.timestamp = new Date().toISOString();
    
    // Add user info if available
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        activity.userId = user.id;
        activity.sessionId = this.currentSessionId;
      }
    } catch (error) {
      console.warn('Could not get user for activity log');
    }
    
    // Queue the activity for batch processing
    this.activityQueue.push(activity);
    
    // Update last activity time
    this.lastActivityTime = Date.now();
    
    // Flush queue if it gets too large
    if (this.activityQueue.length >= 20) {
      await this.flushActivityQueue();
    }
    
    return activity;
  }

  // Flush activity queue to database
  async flushActivityQueue() {
    if (this.activityQueue.length === 0) return;
    
    const activitiesToSend = [...this.activityQueue];
    this.activityQueue = [];
    
    try {
      // Get IP info for batch
      const ipInfo = await this.getIPInfo();
      
      const activitiesWithIP = activitiesToSend.map(activity => ({
        user_id: activity.userId,
        session_id: activity.sessionId,
        activity_type: activity.activityType,
        activity_category: activity.activityCategory,
        activity_label: activity.activityLabel,
        activity_details: activity.activityDetails,
        page_url: activity.pageUrl,
        page_title: activity.pageTitle,
        route_path: activity.routePath,
        element_id: activity.elementId,
        element_class: activity.elementClass,
        element_type: activity.elementType,
        element_text: activity.elementText,
        load_time_ms: activity.loadTimeMs,
        response_time_ms: activity.responseTimeMs,
        ip_address: ipInfo.ip,
        latitude: ipInfo.latitude,
        longitude: ipInfo.longitude,
        is_successful: activity.isSuccessful,
        error_message: activity.errorMessage,
        metadata: activity.metadata,
        created_at: activity.timestamp
      }));
      
      // Insert batch to database
      const { error } = await supabase
        .from('user_activities')
        .insert(activitiesWithIP);
      
      if (error) throw error;
      
      console.log(`Flushed ${activitiesToSend.length} activities to database`);
      
    } catch (error) {
      console.error('Failed to flush activities:', error);
      // Requeue failed activities
      this.activityQueue.unshift(...activitiesToSend);
    }
  }

  // Specialized logging functions
  async logPageView(pageData) {
    return this.logActivity({
      activityType: this.activityTypes.PAGE_VIEW,
      activityCategory: 'navigation',
      activityLabel: `Viewed page: ${pageData.pageTitle || document.title}`,
      pageUrl: pageData.pageUrl || window.location.href,
      pageTitle: pageData.pageTitle || document.title,
      routePath: pageData.routePath || window.location.pathname,
      metadata: {
        referrer: document.referrer,
        ...pageData.metadata
      }
    });
  }

  async logButtonClick(buttonData) {
    return this.logActivity({
      activityType: this.activityTypes.BUTTON_CLICK,
      activityCategory: 'action',
      activityLabel: `Clicked: ${buttonData.buttonText || 'button'}`,
      elementId: buttonData.elementId,
      elementClass: buttonData.elementClass,
      elementType: 'button',
      elementText: buttonData.buttonText,
      metadata: {
        action: buttonData.action,
        ...buttonData.metadata
      }
    });
  }

  async logFormSubmit(formData) {
    // Remove sensitive data from form values
    const sanitizedValues = { ...formData.values };
    const sensitiveFields = ['password', 'credit_card', 'ssn', 'token'];
    
    sensitiveFields.forEach(field => {
      if (sanitizedValues[field]) {
        sanitizedValues[field] = '[REDACTED]';
      }
    });
    
    return this.logActivity({
      activityType: this.activityTypes.FORM_SUBMIT,
      activityCategory: 'action',
      activityLabel: `Submitted form: ${formData.formName || 'Unknown form'}`,
      elementId: formData.elementId,
      elementClass: formData.elementClass,
      elementType: 'form',
      activityDetails: {
        formName: formData.formName,
        formFields: Object.keys(sanitizedValues),
        fieldCount: Object.keys(sanitizedValues).length,
        hasErrors: formData.hasErrors || false
      },
      metadata: {
        ...formData.metadata
      }
    });
  }

  async logAIPrompt(promptData) {
    // Log to specialized AI logs table
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const aiLog = {
        user_id: user.id,
        session_id: this.currentSessionId,
        ai_provider: promptData.provider || 'openai',
        ai_model: promptData.model || 'gpt-4',
        prompt_type: promptData.promptType || 'general',
        prompt_text: promptData.promptText?.substring(0, 1000), // Limit length
        prompt_tokens: promptData.promptTokens,
        response_text: promptData.responseText?.substring(0, 2000),
        response_tokens: promptData.responseTokens,
        response_time_ms: promptData.responseTime,
        context_data: promptData.context,
        temperature: promptData.temperature,
        max_tokens: promptData.maxTokens,
        is_successful: promptData.isSuccessful !== false,
        error_message: promptData.errorMessage,
        total_tokens: (promptData.promptTokens || 0) + (promptData.responseTokens || 0),
        total_cost: promptData.totalCost || 0,
        processing_time_ms: promptData.processingTime
      };
      
      const { error } = await supabase
        .from('ai_prompt_logs')
        .insert(aiLog);
      
      if (error) throw error;
      
      // Also log as general activity
      return this.logActivity({
        activityType: this.activityTypes.AI_PROMPT,
        activityCategory: 'ai',
        activityLabel: `AI Prompt: ${promptData.promptType || 'General'}`,
        activityDetails: {
          provider: promptData.provider,
          model: promptData.model,
          promptType: promptData.promptType,
          tokenCount: (promptData.promptTokens || 0) + (promptData.responseTokens || 0),
          responseTime: promptData.responseTime,
          cost: promptData.totalCost
        },
        isSuccessful: promptData.isSuccessful !== false,
        errorMessage: promptData.errorMessage
      });
      
    } catch (error) {
      console.error('Failed to log AI prompt:', error);
      return null;
    }
  }

  async logEmailSent(emailData) {
    // Log to specialized communication logs table
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const emailLog = {
        user_id: user.id,
        session_id: this.currentSessionId,
        communication_type: 'email',
        direction: 'sent',
        recipient_email: emailData.to,
        recipient_name: emailData.recipientName,
        subject: emailData.subject,
        body_preview: emailData.body?.substring(0, 500),
        status: emailData.status || 'sent',
        provider_name: emailData.provider || 'supabase',
        provider_message_id: emailData.messageId
      };
      
      const { error } = await supabase
        .from('communication_logs')
        .insert(emailLog);
      
      if (error) throw error;
      
      // Also log as general activity
      return this.logActivity({
        activityType: this.activityTypes.EMAIL_SENT,
        activityCategory: 'communication',
        activityLabel: `Email sent to: ${emailData.to}`,
        activityDetails: {
          recipient: emailData.to,
          subject: emailData.subject,
          status: emailData.status
        },
        isSuccessful: emailData.status !== 'failed'
      });
      
    } catch (error) {
      console.error('Failed to log email:', error);
      return null;
    }
  }

  async logFileUpload(fileData) {
    // Log to specialized file logs table
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const fileLog = {
        user_id: user.id,
        session_id: this.currentSessionId,
        operation_type: 'upload',
        file_name: fileData.fileName,
        file_type: fileData.fileType,
        file_size_bytes: fileData.fileSize,
        storage_provider: 'supabase',
        is_successful: fileData.isSuccessful !== false,
        error_message: fileData.errorMessage,
        progress_percentage: fileData.progress || 100
      };
      
      const { error } = await supabase
        .from('file_operation_logs')
        .insert(fileLog);
      
      if (error) throw error;
      
      // Also log as general activity
      return this.logActivity({
        activityType: this.activityTypes.FILE_UPLOAD,
        activityCategory: 'file',
        activityLabel: `File uploaded: ${fileData.fileName}`,
        activityDetails: {
          fileName: fileData.fileName,
          fileType: fileData.fileType,
          fileSize: fileData.fileSize,
          progress: fileData.progress
        },
        isSuccessful: fileData.isSuccessful !== false,
        errorMessage: fileData.errorMessage
      });
      
    } catch (error) {
      console.error('Failed to log file upload:', error);
      return null;
    }
  }

  async logError(errorData) {
    return this.logActivity({
      activityType: this.activityTypes.ERROR,
      activityCategory: 'error',
      activityLabel: `Error: ${errorData.message || 'Unknown error'}`,
      activityDetails: {
        errorName: errorData.name,
        errorStack: errorData.stack?.substring(0, 1000),
        errorCode: errorData.code,
        component: errorData.component
      },
      isSuccessful: false,
      errorMessage: errorData.message,
      errorCode: errorData.code,
      errorSeverity: errorData.severity || 'medium'
    });
  }

  async logAPICall(apiData) {
    return this.logActivity({
      activityType: this.activityTypes.API_CALL,
      activityCategory: 'system',
      activityLabel: `API Call: ${apiData.endpoint}`,
      activityDetails: {
        method: apiData.method,
        endpoint: apiData.endpoint,
        statusCode: apiData.statusCode,
        responseTime: apiData.responseTime,
        payloadSize: apiData.payloadSize
      },
      responseTimeMs: apiData.responseTime,
      isSuccessful: apiData.statusCode >= 200 && apiData.statusCode < 300,
      errorMessage: apiData.errorMessage
    });
  }

  // Clean up
  async cleanup() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    
    // Flush any remaining activities
    await this.flushActivityQueue();
    
    // Mark session as inactive
    if (this.currentSessionId) {
      try {
        await supabase
          .from('user_sessions')
          .update({
            is_active: false,
            is_current: false,
            logout_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', this.currentSessionId);
      } catch (error) {
        console.error('Failed to cleanup session:', error);
      }
    }
    
    this.isInitialized = false;
    this.currentSessionId = null;
  }
}

// Create singleton instance
const activityLogger = new ActivityLogger();

export default activityLogger;