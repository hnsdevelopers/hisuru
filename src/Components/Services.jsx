import React, { useState } from "react";
import { 
  CheckCircle2, 
  Calendar, 
  Mail, 
  Wallet, 
  Trello, 
  RefreshCw, 
  Users, 
  Sparkles,
  Zap,
  BarChart,
  Target,
  Clock,
  Shield,
  ArrowRight,
  ChevronRight,
  ExternalLink
} from "lucide-react";
import { Link } from "react-router-dom";

const services = [
  {
    title: "Task Management",
    description: "Organize, prioritize, and track tasks with intelligent workflows and smart reminders.",
    icon: Trello,
    color: "blue",
    features: ["Smart prioritization", "Recurring tasks", "Progress tracking", "Deadline alerts"],
    cta: "Explore Tasks",
    stats: "95% of users complete tasks faster"
  },
  {
    title: "Meeting Scheduler",
    description: "Automated scheduling with timezone detection, calendar sync, and smart suggestions.",
    icon: Calendar,
    color: "purple",
    features: ["Auto-scheduling", "Zoom integration", "Buffer time", "Room booking"],
    cta: "Schedule Demo",
    stats: "Save 5+ hours weekly"
  },
  {
    title: "Email Integration",
    description: "Unified inbox with AI-powered email categorization, responses, and follow-ups.",
    icon: Mail,
    color: "green",
    features: ["Smart replies", "Template library", "Follow-up reminders", "Spam filtering"],
    cta: "Connect Email",
    stats: "Process emails 3x faster"
  },
  {
    title: "Expense Management",
    description: "Automated expense tracking, categorization, reporting, and budget management.",
    icon: Wallet,
    color: "orange",
    features: ["Receipt scanning", "Budget alerts", "Tax-ready reports", "Multi-currency"],
    cta: "Track Expenses",
    stats: "Reduce expense errors by 80%"
  },
  {
    title: "Project Management",
    description: "Complete project tracking with Gantt charts, resource planning, and milestone tracking.",
    icon: BarChart,
    color: "pink",
    features: ["Timeline view", "Resource allocation", "Milestone tracking", "Risk management"],
    cta: "Manage Projects",
    stats: "Complete projects 40% faster"
  },
  {
    title: "Realtime Synchronization",
    description: "Instant updates across all devices and team members with secure real-time syncing.",
    icon: RefreshCw,
    color: "cyan",
    features: ["Live collaboration", "Version history", "Conflict resolution", "Offline mode"],
    cta: "Sync Now",
    stats: "Zero data loss guarantee"
  },
  {
    title: "Collaborative Interface",
    description: "Built-in team communication, file sharing, and real-time collaboration tools.",
    icon: Users,
    color: "indigo",
    features: ["Team channels", "File sharing", "@mentions", "Video calls"],
    cta: "Collaborate",
    stats: "Boost team productivity by 60%"
  },
  {
    title: "AI-Powered Intelligence",
    description: "Predictive insights, automation, and smart recommendations powered by machine learning.",
    icon: Sparkles,
    color: "yellow",
    features: ["Predictive scheduling", "Workload balancing", "Pattern recognition", "Auto-optimization"],
    cta: "Try AI Features",
    stats: "Get 45% more done with AI"
  }
];

const Services = () => {
  
  const [activeService, setActiveService] = useState(0);
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "detailed"

  const stats = [
    { value: "10K+", label: "Active Teams", icon: Users, color: "blue" },
    { value: "98%", label: "Satisfaction Rate", icon: CheckCircle2, color: "green" },
    { value: "45%", label: "Time Saved", icon: Clock, color: "purple" },
    { value: "24/7", label: "Support", icon: Shield, color: "orange" },
  ];

  return (
    <section className="relative py-20 overflow-hidden bg-gradient-to-b from-white to-gray-50">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 mb-6">
            <Zap className="w-4 h-4 text-blue-600 mr-2" />
            <span className="text-sm font-semibold text-gray-700">
              Everything you need in one platform
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Powerful features for
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              modern productivity
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            From intelligent task management to AI-powered insights, HiSuru provides a comprehensive 
            suite of tools designed to streamline your workflow and boost team efficiency.
          </p>
          
          {/* View Toggle */}
          <div className="inline-flex bg-gray-100 rounded-full p-1 mb-12">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-6 py-2 text-sm font-medium rounded-full transition-all duration-200 ${viewMode === "grid"
                  ? 'bg-white text-gray-900 shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              Grid View
            </button>
            <button
              onClick={() => setViewMode("detailed")}
              className={`px-6 py-2 text-sm font-medium rounded-full transition-all duration-200 ${viewMode === "detailed"
                  ? 'bg-white text-gray-900 shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              Detailed View
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 mb-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className={`inline-flex items-center justify-center p-3 rounded-xl bg-${stat.color}-500/10 mb-3`}>
                    <Icon className={`w-6 h-6 text-${stat.color}-400`} />
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">
                    {stat.value}
                  </div>
                  <div className="text-gray-300 text-sm">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Services Grid/Detailed View */}
        {viewMode === "grid" ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <div
                  key={index}
                  onMouseEnter={() => setActiveService(index)}
                  className="group relative bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-lg hover:shadow-xl hover:border-transparent transition-all duration-300 hover:scale-105"
                >
                  {/* Icon Header */}
                  <div className={`p-6 bg-gradient-to-br from-${service.color}-50 to-${service.color}-100`}>
                    <div className={`inline-flex p-4 rounded-xl bg-white shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`w-8 h-8 text-${service.color}-600`} />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">
                      {service.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      {service.description}
                    </p>
                    
                    {/* Features List */}
                    <ul className="space-y-2 mb-6">
                      {service.features.slice(0, 2).map((feature, idx) => (
                        <li key={idx} className="flex items-center text-sm">
                          <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <Link
                      to={`/services/${service.title.toLowerCase().replace(/\s+/g, '-')}`}
                      className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                      {service.cta}
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>

                  {/* Hover Effect Line */}
                  <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-${service.color}-500 to-${service.color}-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`}></div>
                </div>
              );
            })}
          </div>
        ) : (
          // Detailed View
          <div className="space-y-8">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <div
                  key={index}
                  className={`bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 ${
                    activeService === index ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onMouseEnter={() => setActiveService(index)}
                >
                  <div className="p-8">
                    <div className="flex flex-col md:flex-row md:items-start gap-8">
                      {/* Icon Section */}
                      <div className="md:w-1/4">
                        <div className={`inline-flex p-5 rounded-2xl bg-gradient-to-br from-${service.color}-50 to-${service.color}-100`}>
                          <Icon className={`w-12 h-12 text-${service.color}-600`} />
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="md:w-3/4">
                        <div className="flex flex-col md:flex-row md:items-start justify-between mb-6">
                          <div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">
                              {service.title}
                            </h3>
                            <p className="text-gray-600 text-lg">
                              {service.description}
                            </p>
                          </div>
                          <div className="mt-4 md:mt-0">
                            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50">
                              <Target className="w-4 h-4 text-blue-600 mr-2" />
                              <span className="text-sm font-semibold text-blue-700">
                                {service.stats}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Features Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                          {service.features.map((feature, idx) => (
                            <div
                              key={idx}
                              className="flex items-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                            >
                              <CheckCircle2 className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                              <span className="text-gray-700 font-medium">{feature}</span>
                            </div>
                          ))}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-4">
                          <Link
                            to={`/services/${service.title.toLowerCase().replace(/\s+/g, '-')}`}
                            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200"
                          >
                            {service.cta}
                            <ArrowRight className="w-5 h-5 ml-2" />
                          </Link>
                          <button className="inline-flex items-center px-6 py-3 bg-white border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors">
                            Learn More
                            <ExternalLink className="w-5 h-5 ml-2" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-12">
            <div className="max-w-2xl mx-auto">
              <div className="inline-flex items-center p-3 rounded-lg bg-white shadow-sm mb-6">
                <Sparkles className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Ready to transform your workflow?
              </h3>
              <p className="text-xl text-gray-600 mb-8">
                Join thousands of teams who have streamlined their operations with HiSuru
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/sign-up"
                  className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200"
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <Link
                  to="/demo"
                  className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200"
                >
                  <Calendar className="mr-2 w-5 h-5" />
                  Schedule Demo
                </Link>
              </div>
              <p className="mt-6 text-sm text-gray-500">
                No credit card required • 14-day free trial • Cancel anytime
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Animation */}
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </section>
  );
};

export default Services;