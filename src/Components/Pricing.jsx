import React, { useState } from 'react';
import { Check, X, Zap, Sparkles, Shield, Globe, Users, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' or 'yearly'
  
  const services = [
    "Task Management",
    "Meeting Scheduler",
    "Email Integration",
    "Expense Management",
    "Project Management",
    "Realtime Synchronization",
    "Collaborative Interface",
    "Much more with AI",
  ];

  const plans = [
    {
      name: "Free",
      description: "Perfect for individuals starting out",
      monthlyPrice: 0,
      yearlyPrice: 0,
      features: [
        { name: "Task Management", included: true },
        { name: "Meeting Scheduler", included: true },
        { name: "Email Integration", included: false },
        { name: "Basic AI Features", included: false },
        { name: "Collaborative Interface", included: false },
        { name: "Priority Support", included: false },
        { name: "Advanced Analytics", included: false },
        { name: "Custom Workflows", included: false },
      ],
      cta: "Get Started Free",
      popular: false,
      icon: Zap,
      color: "green",
      buttonVariant: "outline"
    },
    {
      name: "Standard",
      description: "For growing professionals",
      monthlyPrice: 19,
      yearlyPrice: 190,
      features: [
        { name: "Task Management", included: true },
        { name: "Meeting Scheduler", included: true },
        { name: "Email Integration", included: true },
        { name: "Basic AI Features", included: true },
        { name: "Collaborative Interface", included: false },
        { name: "Priority Support", included: false },
        { name: "Advanced Analytics", included: false },
        { name: "Custom Workflows", included: false },
      ],
      cta: "Start 14-Day Trial",
      popular: true,
      icon: Users,
      color: "blue",
      buttonVariant: "gradient"
    },
    {
      name: "Professional",
      description: "For teams and businesses",
      monthlyPrice: 49,
      yearlyPrice: 490,
      features: [
        { name: "Task Management", included: true },
        { name: "Meeting Scheduler", included: true },
        { name: "Email Integration", included: true },
        { name: "Basic AI Features", included: true },
        { name: "Collaborative Interface", included: true },
        { name: "Priority Support", included: true },
        { name: "Advanced Analytics", included: true },
        { name: "Custom Workflows", included: false },
      ],
      cta: "Start 14-Day Trial",
      popular: false,
      icon: Sparkles,
      color: "purple",
      buttonVariant: "gradient"
    },
    {
      name: "Enterprise",
      description: "Advanced features for organizations",
      monthlyPrice: 99,
      yearlyPrice: 990,
      features: [
        { name: "Task Management", included: true },
        { name: "Meeting Scheduler", included: true },
        { name: "Email Integration", included: true },
        { name: "Basic AI Features", included: true },
        { name: "Collaborative Interface", included: true },
        { name: "Priority Support", included: true },
        { name: "Advanced Analytics", included: true },
        { name: "Custom Workflows", included: true },
      ],
      cta: "Contact Sales",
      popular: false,
      icon: Shield,
      color: "gray",
      buttonVariant: "dark"
    }
  ];

  const enterpriseFeatures = [
    { icon: Globe, text: "99.9% Uptime SLA" },
    { icon: Shield, text: "Enterprise Security" },
    { icon: Star, text: "Custom AI Training" },
    { icon: Users, text: "Dedicated Support" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
          Simple, transparent
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            pricing for everyone
          </span>
        </h1>
        <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
          Start free, upgrade as you grow. All plans include our core features
          plus exclusive AI capabilities.
        </p>

        {/* Billing Toggle */}
        <div className="mt-8 inline-flex items-center bg-gray-100 rounded-full p-1">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-6 py-3 text-sm font-medium rounded-full transition-all duration-200 ${billingCycle === 'monthly'
                ? 'bg-white text-gray-900 shadow-lg'
                : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-6 py-3 text-sm font-medium rounded-full transition-all duration-200 ${billingCycle === 'yearly'
                ? 'bg-white text-gray-900 shadow-lg'
                : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            Yearly Billing
            <span className="ml-2 px-2 py-1 text-xs font-bold bg-green-100 text-green-800 rounded-full">
              Save 16%
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards - Now 4 columns */}
      <div className="mt-16 max-w-7xl mx-auto grid gap-8 lg:grid-cols-4">
        {plans.map((plan) => {
          const Icon = plan.icon;
          return (
            <div
              key={plan.name}
              className={`relative rounded-2xl border ${plan.popular
                  ? 'border-blue-500 shadow-2xl shadow-blue-500/10 transform scale-105'
                  : plan.name === 'Free' 
                    ? 'border-green-200 shadow-lg'
                    : 'border-gray-200 shadow-lg'
                } bg-white p-6 transition-all duration-300 hover:shadow-xl`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-xs font-semibold shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}

              {plan.name === 'Free' && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-1 rounded-full text-xs font-semibold shadow-lg">
                    Forever Free
                  </span>
                </div>
              )}

              <div className="flex items-center mb-6">
                <div className={`p-3 rounded-lg bg-${plan.color}-100`}>
                  <Icon className={`w-7 h-7 text-${plan.color}-600`} />
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                  <p className="text-sm text-gray-600">{plan.description}</p>
                </div>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold text-gray-900">
                    ${billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice}
                  </span>
                  <span className="ml-2 text-gray-600">
                    {plan.monthlyPrice > 0 ? `/${billingCycle === 'monthly' ? 'month' : 'year'}` : ''}
                  </span>
                </div>
                {billingCycle === 'yearly' && plan.monthlyPrice > 0 && (
                  <p className="mt-2 text-sm text-green-600 font-medium">
                    ${plan.monthlyPrice * 12 - plan.yearlyPrice} yearly savings
                  </p>
                )}
                {plan.name === 'Free' && (
                  <p className="mt-2 text-sm text-green-600 font-medium">
                    No credit card required
                  </p>
                )}
              </div>

              <Link
                to="/auth?mode=signup"
                className={`block w-full py-3 px-4 text-center rounded-xl font-semibold text-lg transition-all duration-200 ${
                  plan.buttonVariant === 'gradient'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:shadow-blue-500/25'
                    : plan.buttonVariant === 'dark'
                    ? 'bg-gray-900 text-white hover:bg-gray-800'
                    : 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50'
                }`}
              >
                {plan.cta}
              </Link>

              <ul className="mt-8 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature.name} className="flex items-center text-sm">
                    {feature.included ? (
                      <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                    ) : (
                      <X className="w-4 h-4 text-gray-300 mr-3 flex-shrink-0" />
                    )}
                    <span className={feature.included ? 'text-gray-900' : 'text-gray-400'}>
                      {feature.name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Service Highlight Section */}
      <div className="mt-24 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">
            Everything you need to
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              {" "}streamline your workflow
            </span>
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            All plans include our powerful suite of features
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {services.map((service, index) => (
            <div
              key={service}
              className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-blue-50">
                  <Zap className="w-4 h-4 text-blue-600" />
                </div>
                <span className="ml-3 text-sm font-medium text-gray-900">{service}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Enterprise Features */}
      <div className="mt-24 max-w-7xl mx-auto bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 md:p-12">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/2">
            <h3 className="text-3xl font-bold text-white">
              Need enterprise-grade features?
            </h3>
            <p className="mt-4 text-gray-300">
              Custom solutions with advanced security, dedicated support, and SLA guarantees.
            </p>
            <Link
              to="/auth?mode=signup"
              className="inline-block mt-8 px-8 py-4 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-100 transition-colors duration-200"
            >
              Schedule a Demo
            </Link>
          </div>
          <div className="mt-8 md:mt-0 md:w-1/2 grid grid-cols-2 gap-4">
            {enterpriseFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="flex items-center">
                  <div className="p-3 rounded-lg bg-white/10">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="ml-3 text-white font-medium">{feature.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mt-24 max-w-3xl mx-auto">
        <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
          Frequently Asked Questions
        </h3>
        <div className="space-y-6">
          {[
            {
              q: "Can I switch plans at any time?",
              a: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately."
            },
            {
              q: "Is there a free trial available?",
              a: "Yes! Both Standard and Professional plans include a 14-day free trial. Free plan is forever free."
            },
            {
              q: "What's included in the Free plan?",
              a: "The Free plan includes Task Management and Meeting Scheduler for up to 2 users. Perfect for getting started."
            },
            {
              q: "How does the AI feature work?",
              a: "Our AI analyzes your workflow patterns and suggests optimizations, automates repetitive tasks, and provides intelligent insights."
            },
            {
              q: "What kind of support is included?",
              a: "Free plan includes community support. Standard gets email support. Professional and Enterprise get priority support."
            }
          ].map((faq, index) => (
            <div key={index} className="bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-200 transition-colors">
              <h4 className="font-semibold text-gray-900">{faq.q}</h4>
              <p className="mt-2 text-gray-600">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Trust Badges */}
      <div className="mt-24 text-center">
        <p className="text-gray-600 mb-8">Trusted by teams at</p>
        <div className="flex flex-wrap justify-center gap-8 text-gray-400">
          {['TechCorp', 'InnovateCo', 'GrowthLabs', 'FutureSoft', 'DigitalStack', 'StartupHub'].map((company) => (
            <div key={company} className="text-lg font-semibold hover:text-gray-600 transition-colors">
              {company}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="mt-16 text-center">
        <div className="inline-flex flex-col sm:flex-row gap-4">
          <Link
            to="/auth?mode=signup"
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200"
          >
            Start Free Plan
          </Link>
          <Link
            to="/auth?mode=signup"
            className="px-8 py-4 border-2 border-blue-600 text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-colors duration-200"
          >
            Try Professional Free for 14 Days
          </Link>
        </div>
        <p className="mt-6 text-sm text-gray-500">
          No credit card required • Cancel anytime • 14-day free trial on paid plans
        </p>
      </div>
    </div>
  );
}