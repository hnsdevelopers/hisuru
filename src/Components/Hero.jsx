import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Zap, CheckCircle, Play, Users, BarChart } from "lucide-react";

export default function Hero() {
  const [typedText, setTypedText] = useState("");
  const texts = ["scheduling", "productivity", "automation", "collaboration"];
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const typeSpeed = isDeleting ? 50 : 100;
    const pauseTime = isDeleting ? 100 : 1500;

    const timeout = setTimeout(() => {
      if (!isDeleting && charIndex === texts[textIndex].length) {
        setTimeout(() => setIsDeleting(true), pauseTime);
        return;
      }

      if (isDeleting && charIndex === 0) {
        setIsDeleting(false);
        setTextIndex((prev) => (prev + 1) % texts.length);
        return;
      }

      setTypedText(
        isDeleting
          ? texts[textIndex].substring(0, charIndex - 1)
          : texts[textIndex].substring(0, charIndex + 1)
      );
      setCharIndex((prev) => prev + (isDeleting ? -1 : 1));
    }, typeSpeed);

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, textIndex, texts]);

  const features = [
    "Meeting scheduling",
    "Email integration",
    "Task management",
    "Expense tracking",
    "AI-powered insights",
    "Team collaboration"
  ];

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-white to-gray-50 pt-20 md:pt-24">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 -left-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 -right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 mb-6">
              <Sparkles className="w-4 h-4 text-purple-600 mr-2" />
              <span className="text-sm font-semibold text-gray-700">
                Trusted by 10,000+ teams worldwide
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
              All-in-one
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                {typedText}
                <span className="animate-pulse">|</span>
              </span>
              platform for modern teams
            </h1>

            {/* Subtitle */}
            <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-2xl">
              Welcome to HiSuru! Your complete scheduling partner. Manage meetings, emails,
              tasks, and expenses from one intelligent platform powered by AI.
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link
                to="/auth?mode=signup"
                className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <button className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 group">
                <Play className="w-5 h-5 mr-2 text-blue-600 group-hover:text-blue-700" />
                Watch Demo
              </button>
            </div>

            {/* Feature List */}
            <div className="mt-10">
              <p className="text-sm font-medium text-gray-500 mb-4">Everything included:</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Trust Badges */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-4">Trusted by teams at</p>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6">
                {["TechCorp", "InnovateCo", "GrowthLabs", "FutureSoft"].map((company) => (
                  <div
                    key={company}
                    className="text-lg font-semibold text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {company}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Content - Dashboard Preview */}
          <div className="relative">
            {/* Dashboard Card */}
            <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
              {/* Dashboard Header */}
              <div className="p-6 bg-gradient-to-r from-gray-900 to-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <span className="ml-3 text-white font-semibold">HiSuru Dashboard</span>
                  </div>
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>

              {/* Dashboard Content */}
              <div className="p-6">
                {/* Stats Row */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-blue-50 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Meetings Today</p>
                        <p className="text-2xl font-bold text-gray-900">12</p>
                      </div>
                      <Users className="w-8 h-8 text-blue-600 opacity-50" />
                    </div>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Tasks Completed</p>
                        <p className="text-2xl font-bold text-gray-900">87%</p>
                      </div>
                      <BarChart className="w-8 h-8 text-purple-600 opacity-50" />
                    </div>
                  </div>
                </div>

                {/* Calendar Preview */}
                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">Today's Schedule</h3>
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"></div>
                  </div>
                  <div className="space-y-3">
                    {[
                      { time: "10:00 AM", title: "Team Standup", color: "blue" },
                      { time: "2:30 PM", title: "Client Call", color: "purple" },
                      { time: "4:00 PM", title: "Project Review", color: "green" }
                    ].map((event, index) => (
                      <div key={index} className="flex items-center">
                        <div className={`w-3 h-3 rounded-full bg-${event.color}-500 mr-3`}></div>
                        <span className="text-sm text-gray-500 w-16">{event.time}</span>
                        <span className="text-gray-900 flex-grow">{event.title}</span>
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Assistant */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4">
                  <div className="flex items-center">
                    <div className="p-2 rounded-lg bg-white">
                      <Sparkles className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="ml-3">
                      <p className="font-semibold text-gray-900">AI Assistant Ready</p>
                      <p className="text-sm text-gray-600">Optimizing your schedule...</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-6 -right-6 bg-white p-4 rounded-xl shadow-lg border border-gray-100 animate-float">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-green-100">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-semibold text-gray-900">+45%</p>
                  <p className="text-xs text-gray-600">Productivity</p>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg border border-gray-100 animate-float animation-delay-2000">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-blue-100">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-semibold text-gray-900">10K+</p>
                  <p className="text-xs text-gray-600">Active Users</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Animations */}
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
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}