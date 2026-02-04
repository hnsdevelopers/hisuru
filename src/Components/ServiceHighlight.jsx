import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  CheckCircle2, 
  Calendar, 
  Mail, 
  Wallet, 
  Trello, 
  RefreshCw, 
  Users, 
  Sparkles,
  ArrowRight,
  Zap,
  BarChart,
  Shield,
  Clock,
  Globe
} from "lucide-react";

export default function ServiceHighlight() {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const services = [
    {
      title: "Task Management",
      description: "Organize, prioritize, and track tasks with intelligent workflows",
      icon: Trello,
      color: "blue",
      features: ["Smart prioritization", "Recurring tasks", "Progress tracking"]
    },
    {
      title: "Meeting Scheduler",
      description: "Automated scheduling with timezone detection and calendar sync",
      icon: Calendar,
      color: "purple",
      features: ["Auto-scheduling", "Zoom integration", "Buffer time"]
    },
    {
      title: "Email Integration",
      description: "Unified inbox with AI-powered email categorization and responses",
      icon: Mail,
      color: "green",
      features: ["Smart replies", "Template library", "Follow-up reminders"]
    },
    {
      title: "Expense Management",
      description: "Automated expense tracking, categorization, and reporting",
      icon: Wallet,
      color: "orange",
      features: ["Receipt scanning", "Budget alerts", "Tax-ready reports"]
    },
    {
      title: "Project Management",
      description: "Complete project tracking with Gantt charts and resource planning",
      icon: BarChart,
      color: "pink",
      features: ["Timeline view", "Resource allocation", "Milestone tracking"]
    },
    {
      title: "Realtime Synchronization",
      description: "Instant updates across all devices and team members",
      icon: RefreshCw,
      color: "cyan",
      features: ["Live collaboration", "Version history", "Conflict resolution"]
    },
    {
      title: "Collaborative Interface",
      description: "Built-in team communication and file sharing capabilities",
      icon: Users,
      color: "indigo",
      features: ["Team channels", "File sharing", "@mentions"]
    },
    {
      title: "AI-Powered Intelligence",
      description: "Predictive insights and automation powered by machine learning",
      icon: Sparkles,
      color: "yellow",
      features: ["Predictive scheduling", "Workload balancing", "Pattern recognition"]
    }
  ];

  const stats = [
    { value: "98%", label: "Customer Satisfaction", icon: CheckCircle2, color: "green" },
    { value: "45%", label: "Time Saved Weekly", icon: Clock, color: "blue" },
    { value: "10K+", label: "Active Teams", icon: Users, color: "purple" },
    { value: "24/7", label: "Global Support", icon: Globe, color: "orange" },
  ];

  return (
    <div className="relative py-20 overflow-hidden bg-gradient-to-b from-white to-gray-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-blue-300 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-purple-300 rounded-full filter blur-3xl"></div>
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
            Comprehensive suite of
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              productivity tools
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From task management to AI-powered insights, HiSuru provides everything
            your team needs to work smarter, not harder.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div
                key={service.title}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`relative group bg-white rounded-2xl p-6 border border-gray-200 transition-all duration-300 hover:shadow-xl hover:border-transparent hover:scale-105 ${
                  hoveredIndex === index ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                {/* Icon Container */}
                <div className={`p-4 rounded-xl bg-${service.color}-100 w-fit mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`w-8 h-8 text-${service.color}-600`} />
                </div>

                {/* Service Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {service.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 mb-4">
                  {service.description}
                </p>

                {/* Features List */}
                <ul className="space-y-2 mb-6">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Hover Effect Line */}
                <div className={`absolute bottom-0 left-6 right-6 h-1 bg-gradient-to-r from-${service.color}-500 to-${service.color}-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-full`}></div>
              </div>
            );
          })}
        </div>

        {/* Stats Section */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 md:p-12 mb-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="text-center">
                  <div className={`inline-flex items-center justify-center p-4 rounded-xl bg-${stat.color}-500/10 mb-4`}>
                    <Icon className={`w-8 h-8 text-${stat.color}-400`} />
                  </div>
                  <div className="text-4xl font-bold text-white mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-300">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Feature Highlight */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 md:p-12 mb-16">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div className="lg:w-2/3 mb-8 lg:mb-0">
              <div className="flex items-center mb-4">
                <div className="p-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <span className="ml-3 text-lg font-semibold text-gray-900">
                  AI-Powered Intelligence
                </span>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Smart automation that learns your workflow
              </h3>
              <p className="text-gray-600 mb-6">
                Our AI continuously analyzes your work patterns to suggest optimizations,
                automate repetitive tasks, and predict your needs before you ask.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Predictive scheduling</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Smart resource allocation</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Automated follow-ups</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Priority detection</span>
                </div>
              </div>
            </div>
            <div className="lg:w-1/3">
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center p-4 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 mb-4">
                    <Sparkles className="w-8 h-8 text-purple-600" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">
                    Try AI Assistant
                  </h4>
                  <p className="text-gray-600 mb-6">
                    Experience intelligent automation in your workflow
                  </p>
                  <Link
                    to="/ai-demo"
                    className="inline-flex items-center justify-center w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200"
                  >
                    Launch AI Demo
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h3 className="text-3xl font-bold text-gray-900 mb-6">
            Ready to transform your workflow?
          </h3>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
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
              to="/contact"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200"
            >
              Schedule Demo
              <Calendar className="ml-2 w-5 h-5" />
            </Link>
          </div>
          <p className="mt-6 text-sm text-gray-500">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </div>
    </div>
  );
}