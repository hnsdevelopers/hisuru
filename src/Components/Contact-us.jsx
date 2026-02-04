import React, { useState } from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  MessageSquare, 
  Send, 
  CheckCircle, 
  Zap,
  Headphones,
  Globe,
  Shield
} from 'lucide-react';
import Contact from './Contact'; // Import your Contact component

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    subject: '',
    message: '',
    plan: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const contactMethods = [
    {
      icon: Mail,
      title: "Email Us",
      details: "support@saaspro.com",
      description: "We reply within 4 hours",
      color: "blue",
      action: "mailto:support@saaspro.com"
    },
    {
      icon: Phone,
      title: "Call Us",
      details: "+1 (555) 123-4567",
      description: "Mon-Fri, 9am-6pm EST",
      color: "green",
      action: "tel:+15551234567"
    },
    {
      icon: MessageSquare,
      title: "Live Chat",
      details: "Start chatting",
      description: "Available 24/7",
      color: "purple",
      action: "#chat"
    },
  ];

  const supportPlans = [
    {
      title: "Basic Support",
      included: "Starter Plan",
      features: ["Email support", "24-48h response", "Knowledge base"],
      icon: Headphones,
      color: "gray"
    },
    {
      title: "Priority Support",
      included: "Professional Plan",
      features: ["Priority email", "<4h response", "Live chat", "Phone support"],
      icon: Zap,
      color: "blue"
    },
    {
      title: "Enterprise Support",
      included: "Enterprise Plan",
      features: ["Dedicated manager", "<1h response", "24/7 phone", "Custom SLA"],
      icon: Shield,
      color: "purple"
    }
  ];

  const faqs = [
    {
      question: "What's your typical response time?",
      answer: "Basic support: 24-48 hours. Priority support: Under 4 hours. Enterprise: Under 1 hour."
    },
    {
      question: "Do you offer custom integrations?",
      answer: "Yes! Our enterprise plans include custom integration support. Contact us to discuss your needs."
    },
    {
      question: "Is there a free trial for support services?",
      answer: "Support is included with all plans. Try our Professional plan free for 14 days to experience priority support."
    },
    {
      question: "How do I get help with technical issues?",
      answer: "Submit a ticket through our portal or use live chat for immediate assistance with critical issues."
    }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        name: '',
        email: '',
        company: '',
        phone: '',
        subject: '',
        message: '',
        plan: '',
      });
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            <Contact />

        {/* FAQ Section */}
        <div className="mt-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">
              Frequently Asked
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                {" "}Questions
              </span>
            </h2>
            <p className="mt-4 text-gray-600">Quick answers to common inquiries</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow duration-200"
              >
                <h4 className="font-bold text-gray-900 mb-3">{faq.question}</h4>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">
            Ready to transform your workflow?
          </h3>
          <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of companies using our platform to streamline their operations
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-100 transition-colors duration-200">
              Start Free Trial
            </button>
            <button className="px-8 py-4 border-2 border-white text-white font-semibold rounded-xl hover:bg-white/10 transition-colors duration-200">
              Schedule a Demo
            </button>
          </div>
        </div>
      </div>
  );
}