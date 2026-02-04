import { 
  Link 
} from "react-router-dom";
import { 
  Zap, 
  Mail, 
  Phone, 
  MapPin, 
  Twitter, 
  Linkedin, 
  Github, 
  Globe,
  ArrowRight,
  Shield,
  Sparkles,
  MessageSquare,
  Clock
} from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: "Product",
      links: [
        { name: "Features", href: "/features" },
        { name: "Pricing", href: "/pricing" },
        { name: "AI Assistant", href: "/ai" },
        { name: "Integrations", href: "/integrations" },
        { name: "Roadmap", href: "/roadmap" },
        { name: "API", href: "/api" }
      ]
    },
    {
      title: "Company",
      links: [
        { name: "About Us", href: "/about" },
        { name: "Our Team", href: "/team" },
        { name: "Careers", href: "/careers" },
        { name: "Press Kit", href: "/press" },
        { name: "Blog", href: "/blog" },
        { name: "Success Stories", href: "/stories" }
      ]
    },
    {
      title: "Resources",
      links: [
        { name: "Documentation", href: "/docs" },
        { name: "Help Center", href: "/help" },
        { name: "Community", href: "/community" },
        { name: "Partners", href: "/partners" },
        { name: "Webinars", href: "/webinars" },
        { name: "Status", href: "/status" }
      ]
    },
    {
      title: "Legal",
      links: [
        { name: "Privacy Policy", href: "/privacy" },
        { name: "Terms of Service", href: "/terms" },
        { name: "Security", href: "/security" },
        { name: "GDPR", href: "/gdpr" },
        { name: "Cookie Policy", href: "/cookies" },
        { name: "Compliance", href: "/compliance" }
      ]
    }
  ];

  const contactInfo = [
    {
      icon: Mail,
      text: "support@hisuru.com",
      href: "mailto:support@hisuru.com"
    },
    {
      icon: Phone,
      text: "+1 (555) 123-4567",
      href: "tel:+15551234567"
    },
    {
      icon: MapPin,
      text: "San Francisco, CA",
      href: "https://maps.google.com"
    }
  ];

  const socialLinks = [
    { icon: Twitter, href: "https://twitter.com/hisuru", label: "Twitter" },
    { icon: Linkedin, href: "https://linkedin.com/company/hisuru", label: "LinkedIn" },
    { icon: Github, href: "https://github.com/hisuru", label: "GitHub" },
    { icon: Globe, href: "https://hisuru.com/blog", label: "Blog" }
  ];

  const trustBadges = [
    { text: "SOC 2 Compliant", icon: Shield },
    { text: "GDPR Ready", icon: Sparkles },
    { text: "99.9% Uptime", icon: Clock }
  ];

  return (
    <footer className="bg-gradient-to-b from-gray-900 to-gray-950 text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Logo and Description */}
          <div className="lg:col-span-2">
            <div className="flex items-center mb-6">
              <Link to="/" className="flex items-center space-x-3 group">
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg group-hover:shadow-blue-500/25 transition-all duration-300">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div className="flex flex-col">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    HiSuru
                  </h2>
                  <div className="h-1 w-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full group-hover:w-8 transition-all duration-300"></div>
                </div>
              </Link>
            </div>
            <p className="text-gray-400 mb-8 max-w-md">
              Your all-in-one productivity platform. Manage meetings, emails, tasks, 
              and expenses seamlessly with AI-powered intelligence.
            </p>
            
            {/* Newsletter Subscription */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-4">Stay updated</h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-grow px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200 flex items-center justify-center">
                  Subscribe
                  <ArrowRight className="ml-2 w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                No spam ever. Unsubscribe anytime.
              </p>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              {contactInfo.map((contact, index) => {
                const Icon = contact.icon;
                return (
                  <a
                    key={index}
                    href={contact.href}
                    className="flex items-center text-gray-400 hover:text-white transition-colors group"
                  >
                    <Icon className="w-5 h-5 mr-3 text-blue-400 group-hover:text-blue-300" />
                    <span>{contact.text}</span>
                  </a>
                );
              })}
            </div>
          </div>

          {/* Navigation Links */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {footerSections.map((section) => (
                <div key={section.title}>
                  <h3 className="text-lg font-semibold text-white mb-6">
                    {section.title}
                  </h3>
                  <ul className="space-y-3">
                    {section.links.map((link) => (
                      <li key={link.name}>
                        <Link
                          to={link.href}
                          className="text-gray-400 hover:text-white hover:translate-x-1 transition-all duration-200 flex items-center"
                        >
                          <ArrowRight className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex flex-wrap items-center gap-6 mb-6 md:mb-0">
              {trustBadges.map((badge, index) => {
                const Icon = badge.icon;
                return (
                  <div key={index} className="flex items-center text-sm">
                    <Icon className="w-4 h-4 text-green-400 mr-2" />
                    <span className="text-gray-300">{badge.text}</span>
                  </div>
                );
              })}
            </div>
            
            <div className="flex items-center space-x-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition-all duration-200 hover:scale-110"
                    aria-label={social.label}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-gray-900/50 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="text-gray-500 text-sm mb-4 md:mb-0">
              © {currentYear} HiSuru. All rights reserved.
            </div>
            
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
              <Link to="/privacy" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link to="/cookies" className="hover:text-white transition-colors">
                Cookie Policy
              </Link>
              <div className="flex items-center">
                <MessageSquare className="w-4 h-4 mr-2 text-blue-400" />
                <span className="text-gray-400">English</span>
              </div>
            </div>
          </div>

          {/* Bottom Note */}
          <div className="mt-6 pt-6 border-t border-gray-800 text-center">
            <p className="text-xs text-gray-600">
              HiSuru is a product of HnS Devs. Made with ❤️ for productive teams worldwide.
              <br />
              This site is protected by reCAPTCHA and the Google 
              <a href="https://policies.google.com/privacy" className="text-blue-400 hover:text-blue-300 ml-1">
                Privacy Policy
              </a> and 
              <a href="https://policies.google.com/terms" className="text-blue-400 hover:text-blue-300 ml-1">
                Terms of Service
              </a> apply.
            </p>
          </div>
        </div>
      </div>

      {/* Fixed CTA Button */}
      <a
        href="/login"
        className="fixed bottom-6 right-6 z-50 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-200 hover:scale-105 active:scale-95 flex items-center"
      >
        <Sparkles className="w-5 h-5 mr-2" />
        Start Free Trial
      </a>
    </footer>
  );
}