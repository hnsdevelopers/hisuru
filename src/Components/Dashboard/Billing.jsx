import { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Receipt, 
  Download, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  TrendingUp,
  Users,
  Zap,
  Calendar,
  RefreshCw,
  Shield,
  CreditCard as Card,
  DollarSign,
  FileText,
  Eye,
  EyeOff,
  ChevronRight,
  Sparkles,
  Crown,
  Star
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

const BillingComponent = ({ darkMode }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [usage, setUsage] = useState({});
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [showCardDetails, setShowCardDetails] = useState({});
  const [updating, setUpdating] = useState(false);

  // Plan configurations
  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      description: 'For individuals getting started',
      features: [
        'Up to 5 team members',
        'Basic task management',
        'Email integration',
        '1 GB storage',
        'Standard support'
      ],
      color: 'gray',
      icon: Star
    },
    {
      id: 'pro',
      name: 'Professional',
      price: 29,
      description: 'For teams and growing businesses',
      features: [
        'Up to 20 team members',
        'Advanced task management',
        'Meeting scheduler',
        'AI-powered insights',
        '10 GB storage',
        'Priority support',
        'Custom workflows'
      ],
      color: 'blue',
      icon: Zap,
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 99,
      description: 'Advanced features for organizations',
      features: [
        'Unlimited team members',
        'Custom AI training',
        'Dedicated support',
        '99.9% uptime SLA',
        'Custom integrations',
        'Advanced security',
        'On-premise deployment'
      ],
      color: 'purple',
      icon: Crown
    }
  ];

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      // Fetch subscription
      const { data: subscriptionData, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (subError && subError.code !== 'PGRST116') {
        console.error('Subscription fetch error:', subError);
      }

      // Fetch invoices
      const { data: invoicesData, error: invError } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (invError) {
        console.error('Invoices fetch error:', invError);
      }

      // Fetch usage
      const { data: usageData, error: usageError } = await supabase
        .from('usage_tracking')
        .select('*')
        .eq('user_id', user.id)
        .gte('period_start', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (usageError) {
        console.error('Usage fetch error:', usageError);
      }

      // Process usage data
      const usageMap = {};
      if (usageData) {
        usageData.forEach(item => {
          if (!usageMap[item.metric_name]) {
            usageMap[item.metric_name] = [];
          }
          usageMap[item.metric_name].push(item);
        });
      }

      setSubscription(subscriptionData || {
        plan_type: 'free',
        status: 'active',
        billing_cycle: 'monthly',
        trial_end: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
      });
      setInvoices(invoicesData || []);
      setUsage(usageMap);
      setLoading(false);

    } catch (error) {
      console.error('Billing data fetch error:', error);
      setLoading(false);
    }
  };

  const handlePlanChange = async (planId) => {
    try {
      setUpdating(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      const selectedPlan = plans.find(p => p.id === planId);
      const isUpgrade = ['pro', 'enterprise'].includes(planId);
      const isDowngrade = planId === 'free' && subscription?.plan_type !== 'free';

      // Update subscription in database
      const { data, error } = await supabase
        .from('subscriptions')
        .upsert({
          user_id: user.id,
          plan_type: planId,
          status: isUpgrade ? 'pending_payment' : 'active',
          amount: selectedPlan.price,
          billing_cycle: 'monthly',
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      // For upgrades, simulate payment flow
      if (isUpgrade) {
        // In real app, redirect to Stripe checkout
        alert(`Redirecting to payment for ${selectedPlan.name} plan...`);
        // window.location.href = `/checkout?plan=${planId}`;
      } else if (isDowngrade) {
        // Downgrade confirmation
        if (window.confirm('Are you sure you want to downgrade to Free plan? You will lose premium features.')) {
          setSubscription(prev => ({ ...prev, plan_type: 'free', amount: 0 }));
          alert('Plan downgraded successfully!');
        }
      } else {
        setSubscription(prev => ({ ...prev, plan_type: planId, amount: selectedPlan.price }));
        alert('Plan updated successfully!');
      }

      setUpdating(false);
    } catch (error) {
      console.error('Plan change error:', error);
      alert('Failed to update plan. Please try again.');
      setUpdating(false);
    }
  };

  const handleBillingCycleChange = async (cycle) => {
    try {
      setUpdating(true);
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('subscriptions')
        .update({
          billing_cycle: cycle,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;

      setSubscription(prev => ({ ...prev, billing_cycle: cycle }));
      alert(`Billing cycle changed to ${cycle}`);
      setUpdating(false);
    } catch (error) {
      console.error('Billing cycle change error:', error);
      setUpdating(false);
    }
  };

  const handleDownloadInvoice = async (invoiceId) => {
    // In real app, generate and download PDF
    alert('Downloading invoice...');
    // const { data } = await supabase.storage.from('invoices').download(`${invoiceId}.pdf`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'green';
      case 'pending': return 'yellow';
      case 'failed': return 'red';
      default: return 'gray';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending': return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'failed': return <AlertCircle className="w-5 h-5 text-red-500" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className={`text-2xl font-bold mb-2 flex items-center ${
          darkMode ? 'text-white' : 'text-gray-900'
        }`}>
          <CreditCard className="w-6 h-6 mr-3 text-blue-500" />
          Billing & Subscription
        </h3>
        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Manage your subscription, payment methods, and billing history
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 border-b" style={{ 
        borderColor: darkMode ? '#374151' : '#e5e7eb' 
      }}>
        {['overview', 'plans', 'payment', 'invoices', 'usage'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 text-sm font-medium transition-colors relative ${
              activeTab === tab
                ? darkMode 
                  ? 'text-blue-400' 
                  : 'text-blue-600'
                : darkMode 
                  ? 'text-gray-400 hover:text-gray-300' 
                  : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {activeTab === tab && (
              <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${
                darkMode ? 'bg-blue-500' : 'bg-blue-600'
              }`} />
            )}
          </button>
        ))}
      </div>

      {/* Current Plan Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Current Plan Card */}
          <div className={`rounded-xl border p-6 ${
            darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200 shadow-sm'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h4 className={`text-lg font-semibold mb-2 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Current Plan
                </h4>
                <div className="flex items-center space-x-3">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    subscription?.plan_type === 'pro' 
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                      : subscription?.plan_type === 'enterprise'
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                  }`}>
                    {subscription?.plan_type?.charAt(0).toUpperCase() + subscription?.plan_type?.slice(1)}
                  </div>
                  {subscription?.trial_end && new Date(subscription.trial_end) > new Date() && (
                    <div className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded-full text-sm font-medium">
                      Trial ends {new Date(subscription.trial_end).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className={`text-3xl font-bold ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  ${subscription?.amount || 0}
                  <span className="text-lg font-normal text-gray-500 ml-1">/month</span>
                </p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {subscription?.billing_cycle === 'yearly' ? 'Billed yearly' : 'Billed monthly'}
                </p>
              </div>
            </div>

            {/* Plan Progress */}
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Storage used</span>
                <span className="font-medium">2.5 GB / 10 GB</span>
              </div>
              <div className={`h-2 rounded-full overflow-hidden ${
                darkMode ? 'bg-gray-700' : 'bg-gray-200'
              }`}>
                <div className="h-full bg-blue-500 rounded-full" style={{ width: '25%' }} />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={() => setActiveTab('plans')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Upgrade Plan
              </button>
              <button
                onClick={() => setActiveTab('payment')}
                className={`px-4 py-2 rounded-lg border font-medium ${
                  darkMode 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-800' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Update Payment
              </button>
              {subscription?.plan_type !== 'free' && (
                <button
                  onClick={() => handlePlanChange('free')}
                  className={`px-4 py-2 rounded-lg border font-medium ${
                    darkMode 
                      ? 'border-red-600 text-red-400 hover:bg-red-900/30' 
                      : 'border-red-300 text-red-600 hover:bg-red-50'
                  }`}
                >
                  Cancel Subscription
                </button>
              )}
            </div>
          </div>

          {/* Usage Statistics */}
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { label: 'Team Members', value: '3/20', icon: Users, color: 'blue' },
              { label: 'Tasks This Month', value: '148', icon: CheckCircle, color: 'green' },
              { label: 'Meetings Scheduled', value: '12', icon: Calendar, color: 'purple' }
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border ${
                    darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {stat.label}
                      </p>
                      <p className={`text-2xl font-bold mt-1 ${
                        darkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {stat.value}
                      </p>
                    </div>
                    <div className={`p-3 rounded-lg bg-${stat.color}-100 dark:bg-${stat.color}-900/30`}>
                      <Icon className={`w-6 h-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Plans Tab */}
      {activeTab === 'plans' && (
        <div className="space-y-6">
          <div className={`p-4 rounded-lg ${
            darkMode ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'
          }`}>
            <div className="flex items-center">
              <Sparkles className="w-5 h-5 text-blue-500 mr-2" />
              <p className={`text-sm ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                <span className="font-semibold">Pro Tip:</span> Save 20% with annual billing!
              </p>
            </div>
          </div>

          {/* Billing Cycle Toggle */}
          <div className="flex justify-center mb-8">
            <div className={`inline-flex rounded-lg p-1 ${
              darkMode ? 'bg-gray-800' : 'bg-gray-100'
            }`}>
              <button
                onClick={() => handleBillingCycleChange('monthly')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                  subscription?.billing_cycle === 'monthly'
                    ? darkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900 shadow'
                    : darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => handleBillingCycleChange('yearly')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                  subscription?.billing_cycle === 'yearly'
                    ? darkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900 shadow'
                    : darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Yearly
                <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 rounded-full">
                  Save 20%
                </span>
              </button>
            </div>
          </div>

          {/* Plans Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const Icon = plan.icon;
              const isCurrentPlan = subscription?.plan_type === plan.id;
              const isPopular = plan.popular;
              
              return (
                <div
                  key={plan.id}
                  className={`rounded-xl border relative overflow-hidden transition-transform hover:scale-[1.02] ${
                    isCurrentPlan
                      ? darkMode 
                        ? 'border-blue-500 ring-2 ring-blue-500/20' 
                        : 'border-blue-500 ring-2 ring-blue-200'
                      : darkMode 
                        ? 'border-gray-700 hover:border-gray-600' 
                        : 'border-gray-200 hover:border-gray-300'
                  } ${darkMode ? 'bg-gray-900' : 'bg-white'}`}
                >
                  {isPopular && (
                    <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center py-1 text-sm font-semibold">
                      Most Popular
                    </div>
                  )}

                  <div className={`p-6 ${isPopular ? 'pt-10' : ''}`}>
                    {/* Plan Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="flex items-center">
                          <div className={`p-2 rounded-lg mr-3 bg-${plan.color}-100 dark:bg-${plan.color}-900/30`}>
                            <Icon className={`w-6 h-6 text-${plan.color}-600 dark:text-${plan.color}-400`} />
                          </div>
                          <h4 className={`text-xl font-bold ${
                            darkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {plan.name}
                          </h4>
                        </div>
                        <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {plan.description}
                        </p>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="mb-6">
                      <div className="flex items-baseline">
                        <span className={`text-3xl font-bold ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          ${subscription?.billing_cycle === 'yearly' ? Math.round(plan.price * 12 * 0.8) : plan.price}
                        </span>
                        <span className={`ml-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          /{subscription?.billing_cycle === 'yearly' ? 'year' : 'month'}
                        </span>
                      </div>
                      {subscription?.billing_cycle === 'yearly' && plan.price > 0 && (
                        <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                          Save ${Math.round(plan.price * 12 * 0.2)} annually
                        </p>
                      )}
                    </div>

                    {/* Features */}
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center">
                          <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                          <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {/* Action Button */}
                    <button
                      onClick={() => handlePlanChange(plan.id)}
                      disabled={updating || isCurrentPlan}
                      className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                        isCurrentPlan
                          ? darkMode 
                            ? 'bg-gray-800 text-gray-400 cursor-not-allowed' 
                            : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                          : plan.id === 'free'
                          ? darkMode
                            ? 'bg-gray-700 text-white hover:bg-gray-600'
                            : 'bg-gray-900 text-white hover:bg-gray-800'
                          : darkMode
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                          : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                      }`}
                    >
                      {updating ? (
                        <RefreshCw className="w-5 h-5 animate-spin mx-auto" />
                      ) : isCurrentPlan ? (
                        'Current Plan'
                      ) : plan.id === 'free' ? (
                        'Downgrade to Free'
                      ) : (
                        `Upgrade to ${plan.name}`
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Payment Methods Tab */}
      {activeTab === 'payment' && (
        <div className="space-y-6">
          {/* Add Payment Method */}
          <div className={`rounded-xl border p-6 ${
            darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <h4 className={`text-lg font-semibold mb-4 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              <Card className="w-5 h-5 inline mr-2" />
              Add Payment Method
            </h4>
            
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Card Number
                </label>
                <input
                  type="text"
                  placeholder="4242 4242 4242 4242"
                  className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode 
                      ? 'bg-gray-800 border-gray-700 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode 
                        ? 'bg-gray-800 border-gray-700 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    CVC
                  </label>
                  <input
                    type="text"
                    placeholder="123"
                    className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode 
                        ? 'bg-gray-800 border-gray-700 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>
            </div>

            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
              Add Payment Method
            </button>
          </div>

          {/* Current Payment Methods */}
          <div className={`rounded-xl border p-6 ${
            darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <h4 className={`text-lg font-semibold mb-4 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Your Payment Methods
            </h4>
            
            {paymentMethods.length > 0 ? (
              <div className="space-y-4">
                {/* Sample payment method */}
                <div className={`p-4 rounded-lg border ${
                  darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-4">
                        <Card className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className={`font-medium ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          •••• 4242
                        </p>
                        <p className={`text-sm ${
                          darkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          Expires 12/25
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded-full text-sm font-medium">
                        Default
                      </span>
                      <button className="p-2 text-gray-500 hover:text-red-600">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className={`text-center py-8 ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>No payment methods added yet</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Invoices Tab */}
      {activeTab === 'invoices' && (
        <div className="space-y-6">
          <div className={`rounded-xl border overflow-hidden ${
            darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className={`px-6 py-4 border-b ${
              darkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <h4 className={`text-lg font-semibold ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                <Receipt className="w-5 h-5 inline mr-2" />
                Billing History
              </h4>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`border-b ${
                    darkMode ? 'border-gray-700' : 'border-gray-200'
                  }`}>
                    <th className={`px-6 py-3 text-left text-sm font-semibold ${
                      darkMode ? 'text-gray-300' : 'text-gray-900'
                    }`}>
                      Invoice
                    </th>
                    <th className={`px-6 py-3 text-left text-sm font-semibold ${
                      darkMode ? 'text-gray-300' : 'text-gray-900'
                    }`}>
                      Date
                    </th>
                    <th className={`px-6 py-3 text-left text-sm font-semibold ${
                      darkMode ? 'text-gray-300' : 'text-gray-900'
                    }`}>
                      Amount
                    </th>
                    <th className={`px-6 py-3 text-left text-sm font-semibold ${
                      darkMode ? 'text-gray-300' : 'text-gray-900'
                    }`}>
                      Status
                    </th>
                    <th className={`px-6 py-3 text-left text-sm font-semibold ${
                      darkMode ? 'text-gray-300' : 'text-gray-900'
                    }`}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.length > 0 ? (
                    invoices.map((invoice) => (
                      <tr key={invoice.id} className={`border-b ${
                        darkMode ? 'border-gray-800 hover:bg-gray-800' : 'border-gray-100 hover:bg-gray-50'
                      }`}>
                        <td className="px-6 py-4">
                          <p className={`font-medium ${
                            darkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {invoice.invoice_number}
                          </p>
                          <p className={`text-sm ${
                            darkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {invoice.plan_type?.charAt(0).toUpperCase() + invoice.plan_type?.slice(1)} Plan
                          </p>
                        </td>
                        <td className={`px-6 py-4 ${
                          darkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          {new Date(invoice.created_at).toLocaleDateString()}
                        </td>
                        <td className={`px-6 py-4 font-medium ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          ${invoice.total_amount || invoice.amount}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            {getStatusIcon(invoice.status)}
                            <span className={`ml-2 capitalize ${
                              getStatusColor(invoice.status) === 'green' 
                                ? 'text-green-600 dark:text-green-400'
                                : getStatusColor(invoice.status) === 'yellow'
                                ? 'text-yellow-600 dark:text-yellow-400'
                                : getStatusColor(invoice.status) === 'red'
                                ? 'text-red-600 dark:text-red-400'
                                : 'text-gray-600 dark:text-gray-400'
                            }`}>
                              {invoice.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleDownloadInvoice(invoice.id)}
                            className="flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className={`px-6 py-8 text-center ${
                        darkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        <Receipt className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <p>No invoices found</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Usage Tab */}
      {activeTab === 'usage' && (
        <div className="space-y-6">
          <div className={`rounded-xl border p-6 ${
            darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <h4 className={`text-lg font-semibold mb-6 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              <TrendingUp className="w-5 h-5 inline mr-2" />
              Usage Statistics
            </h4>

            <div className="grid md:grid-cols-2 gap-6">
              {Object.entries(usage).map(([metric, data]) => (
                <div key={metric} className={`p-4 rounded-lg border ${
                  darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
                }`}>
                  <h5 className={`font-medium mb-3 ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {metric.replace(/_/g, ' ').toUpperCase()}
                  </h5>
                  <div className="space-y-3">
                    {data.slice(0, 5).map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span className={`text-sm ${
                          darkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {new Date(item.period_start).toLocaleDateString()}
                        </span>
                        <div className="flex items-center">
                          <span className={`font-medium mr-2 ${
                            darkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {item.metric_value}
                          </span>
                          {item.limit_value && (
                            <span className="text-sm text-gray-500">
                              / {item.limit_value}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {Object.keys(usage).length === 0 && (
              <div className={`text-center py-8 ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>No usage data available yet</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingComponent;