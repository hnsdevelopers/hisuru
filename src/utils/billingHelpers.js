import { supabase } from '../lib/supabase';

export const billingApi = {
  // Get current subscription
  async getSubscription(userId) {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    return { data, error };
  },

  // Update subscription
  async updateSubscription(userId, updates) {
    const { data, error } = await supabase
      .from('subscriptions')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

    return { data, error };
  },

  // Get invoices
  async getInvoices(userId, limit = 10) {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    return { data, error };
  },

  // Create invoice
  async createInvoice(invoiceData) {
    const { data, error } = await supabase
      .from('invoices')
      .insert(invoiceData)
      .select()
      .single();

    return { data, error };
  },

  // Track usage
  async trackUsage(userId, metricName, metricValue, limitValue = null) {
    const { data, error } = await supabase
      .from('usage_tracking')
      .insert({
        user_id: userId,
        metric_name: metricName,
        metric_value: metricValue,
        limit_value: limitValue
      });

    return { data, error };
  },

  // Get usage summary
  async getUsageSummary(userId, days = 30) {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    
    const { data, error } = await supabase
      .from('usage_tracking')
      .select('*')
      .eq('user_id', userId)
      .gte('period_start', startDate);

    return { data, error };
  }
};