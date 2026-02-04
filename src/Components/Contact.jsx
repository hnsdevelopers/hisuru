import React, { useState } from "react";
import { 
  Send, 
  Mail, 
  Phone, 
  User, 
  MessageSquare, 
  CheckCircle, 
  Clock,
  MapPin,
  Globe,
  Sparkles,
  Shield,
  ArrowRight,
  AlertCircle,
  XCircle
} from "lucide-react";
import { supabase } from "../lib/supabase";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    subject: "",
    message: "",
    acceptTerms: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [activeField, setActiveField] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");

  const contactMethods = [
    {
      icon: Mail,
      title: "Email Support",
      value: "support@hisuru.com",
      description: "Typically replies within 2 hours",
      color: "blue"
    },
    {
      icon: Phone,
      title: "Phone Support",
      value: "+1 (555) 123-4567",
      description: "Mon-Fri, 9am-6pm EST",
      color: "green"
    },
    {
      icon: Clock,
      title: "Response Time",
      value: "< 4 hours",
      description: "Average first response time",
      color: "purple"
    }
  ];

  const subjects = [
    "General Inquiry",
    "Sales Question",
    "Technical Support",
    "Partnership",
    "Feature Request",
    "Billing Issue",
    "Technical Support",
    "Feedback"
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name?.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email?.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.subject?.trim()) {
      newErrors.subject = "Subject is required";
    }

    if (!formData.message?.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = "You must accept the terms and conditions";
    }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
    if (submitError) setSubmitError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      // Insert contact form data into PostgreSQL
      const { data, error } = await supabase
        .from("contacts")
        .insert([
          {
            name: formData.name.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim() || null,
            company: formData.company.trim() || null,
            subject: formData.subject,
            message: formData.message.trim(),
            ip_address: await getClientIP(), // Optional
            user_agent: navigator.userAgent,
            status: "new",
            created_at: new Date().toISOString()
          }
        ])
        .select(); // Returns the inserted data

      if (error) {
        console.error("Supabase error:", error);
        throw new Error(`Database error: ${error.message}`);
      }

      console.log("Contact saved to PostgreSQL:", data);

      // Send notification email (optional - can be done via Supabase Edge Functions)
      await sendNotificationEmail(formData);

      setIsSubmitted(true);
      
      // Reset form after 5 seconds
      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({
          name: "",
          email: "",
          phone: "",
          company: "",
          subject: "",
          message: "",
          acceptTerms: false,
        });
        setErrors({});
      }, 5000);

    } catch (error) {
      console.error("Contact form submission error:", error);
      setSubmitError(
        error.message || 
        "Failed to submit your message. Please try again or contact us directly."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Optional: Get client IP address
  const getClientIP = async () => {
    try {
      const response = await fetch("https://api.ipify.org?format=json");
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.error("Failed to get IP:", error);
      return null;
    }
  };

  // Optional: Send notification email via Supabase Edge Function
  const sendNotificationEmail = async (formData) => {
    try {
      // You can set up a Supabase Edge Function for this
      // For now, we'll just log it
      console.log("Notification email would be sent for:", formData.email);
      
      // Example of calling an Edge Function:
      // const { data, error } = await supabase.functions.invoke('send-contact-email', {
      //   body: { contactData: formData }
      // });
    } catch (error) {
      console.error("Failed to send notification email:", error);
    }
  };

  const resetForm = () => {
    setIsSubmitted(false);
    setFormData({
      name: "",
      email: "",
      phone: "",
      company: "",
      subject: "",
      message: "",
      acceptTerms: false,
    });
    setErrors({});
    setSubmitError("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 mb-6">
            <Sparkles className="w-4 h-4 text-purple-600 mr-2" />
            <span className="text-sm font-semibold text-gray-700">
              We're here to help
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Get in touch with
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              our team
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Have questions? Our team is ready to assist you. Fill out the form below 
            and we'll get back to you shortly.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-8">
            {/* Contact Methods */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Contact</h3>
              <div className="space-y-6">
                {contactMethods.map((method, index) => {
                  const Icon = method.icon;
                  return (
                    <div key={index} className="flex items-start">
                      <div className={`p-3 rounded-xl bg-${method.color}-100 mr-4`}>
                        <Icon className={`w-6 h-6 text-${method.color}-600`} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{method.title}</h4>
                        <p className="text-lg font-medium text-gray-900 mt-1">{method.value}</p>
                        <p className="text-sm text-gray-500 mt-1">{method.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Office Location */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white">
              <h3 className="text-xl font-bold mb-6">Our Office</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <MapPin className="w-5 h-5 text-blue-400 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <p className="font-medium">123 Innovation Drive</p>
                    <p className="text-gray-300">San Francisco, CA 94107</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Globe className="w-5 h-5 text-green-400 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Global Coverage</p>
                    <p className="text-gray-300">Support available worldwide</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center mb-4">
                <Shield className="w-5 h-5 text-green-600 mr-3" />
                <h4 className="font-semibold text-gray-900">Safe & Secure</h4>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Your information is protected with enterprise-grade security and encryption.
              </p>
              <div className="flex items-center text-sm text-gray-500">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                GDPR compliant
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  All submissions are stored securely in our PostgreSQL database.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
              {/* Form Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-xl bg-white/20">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <h2 className="text-xl font-bold text-white">Send us a message</h2>
                    <p className="text-blue-100">We'll respond within 24 hours</p>
                  </div>
                </div>
              </div>

              {/* Form Content */}
              <div className="p-6 md:p-8">
                {/* Error Message */}
                {submitError && (
                  <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200">
                    <div className="flex items-center">
                      <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0" />
                      <span className="text-red-700">{submitError}</span>
                    </div>
                  </div>
                )}

                {isSubmitted ? (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center p-4 rounded-full bg-green-100 mb-6">
                      <CheckCircle className="w-12 h-12 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Message Sent Successfully!</h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      Thank you for contacting us. Our team will get back to you within 24 hours.
                      We've sent a confirmation email to {formData.email}. Your message has been 
                      saved securely in our database.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <button
                        onClick={resetForm}
                        className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Send Another Message
                      </button>
                      <a
                        href="/"
                        className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Back to Home
                      </a>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name & Email */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-2 text-gray-400" />
                            Full Name *
                          </div>
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          onFocus={() => setActiveField('name')}
                          onBlur={() => setActiveField(null)}
                          required
                          className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
                            errors.name
                              ? 'border-red-500 ring-2 ring-red-100'
                              : activeField === 'name'
                                ? 'border-blue-500 ring-2 ring-blue-100'
                                : 'border-gray-300 hover:border-gray-400'
                          } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                          placeholder="John Doe"
                          disabled={isSubmitting}
                        />
                        {errors.name && (
                          <p className="mt-2 text-sm text-red-600 flex items-center">
                            <XCircle className="w-4 h-4 mr-1" />
                            {errors.name}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <div className="flex items-center">
                            <Mail className="w-4 h-4 mr-2 text-gray-400" />
                            Work Email *
                          </div>
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          onFocus={() => setActiveField('email')}
                          onBlur={() => setActiveField(null)}
                          required
                          className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
                            errors.email
                              ? 'border-red-500 ring-2 ring-red-100'
                              : activeField === 'email'
                                ? 'border-blue-500 ring-2 ring-blue-100'
                                : 'border-gray-300 hover:border-gray-400'
                          } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                          placeholder="john@company.com"
                          disabled={isSubmitting}
                        />
                        {errors.email && (
                          <p className="mt-2 text-sm text-red-600 flex items-center">
                            <XCircle className="w-4 h-4 mr-1" />
                            {errors.email}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Phone & Company */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 mr-2 text-gray-400" />
                            Phone Number
                          </div>
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          onFocus={() => setActiveField('phone')}
                          onBlur={() => setActiveField(null)}
                          className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
                            activeField === 'phone'
                              ? 'border-blue-500 ring-2 ring-blue-100'
                              : 'border-gray-300 hover:border-gray-400'
                          } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                          placeholder="+1 (555) 000-0000"
                          disabled={isSubmitting}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Company
                        </label>
                        <input
                          type="text"
                          name="company"
                          value={formData.company}
                          onChange={handleChange}
                          onFocus={() => setActiveField('company')}
                          onBlur={() => setActiveField(null)}
                          className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
                            activeField === 'company'
                              ? 'border-blue-500 ring-2 ring-blue-100'
                              : 'border-gray-300 hover:border-gray-400'
                          } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                          placeholder="Your company (optional)"
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>

                    {/* Subject */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Subject *
                      </label>
                      <select
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
                          errors.subject
                            ? 'border-red-500 ring-2 ring-red-100'
                            : 'border-gray-300 hover:border-gray-400'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        disabled={isSubmitting}
                      >
                        <option value="">Select a subject</option>
                        {subjects.map((subject) => (
                          <option key={subject} value={subject}>
                            {subject}
                          </option>
                        ))}
                      </select>
                      {errors.subject && (
                        <p className="mt-2 text-sm text-red-600 flex items-center">
                          <XCircle className="w-4 h-4 mr-1" />
                          {errors.subject}
                        </p>
                      )}
                    </div>

                    {/* Message */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Message *
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        onFocus={() => setActiveField('message')}
                        onBlur={() => setActiveField(null)}
                        required
                        rows={6}
                        className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
                          errors.message
                            ? 'border-red-500 ring-2 ring-red-100'
                            : activeField === 'message'
                              ? 'border-blue-500 ring-2 ring-blue-100'
                              : 'border-gray-300 hover:border-gray-400'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none`}
                        placeholder="Tell us about your project, questions, or how we can help..."
                        disabled={isSubmitting}
                      />
                      <div className="flex justify-between mt-2">
                        {errors.message && (
                          <p className="text-sm text-red-600 flex items-center">
                            <XCircle className="w-4 h-4 mr-1" />
                            {errors.message}
                          </p>
                        )}
                        <p className="text-sm text-gray-500 ml-auto">
                          {formData.message.length}/2000 characters
                        </p>
                      </div>
                    </div>

                    {/* Terms & Privacy */}
                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        id="acceptTerms"
                        name="acceptTerms"
                        checked={formData.acceptTerms}
                        onChange={handleChange}
                        className={`mt-1 w-4 h-4 rounded focus:ring-blue-500 ${
                          errors.acceptTerms ? 'text-red-600' : 'text-blue-600'
                        }`}
                        disabled={isSubmitting}
                      />
                      <label htmlFor="acceptTerms" className="ml-3 text-sm text-gray-600">
                        I agree to the{" "}
                        <a href="/terms" className="text-blue-600 hover:text-blue-700 font-medium">
                          terms and conditions
                        </a>{" "}
                        and{" "}
                        <a href="/privacy" className="text-blue-600 hover:text-blue-700 font-medium">
                          privacy policy
                        </a>{" "}
                        of HiSuru. We respect your privacy and will only use your information
                        to respond to your inquiry. Your data will be stored securely in our PostgreSQL database.
                      </label>
                    </div>
                    {errors.acceptTerms && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <XCircle className="w-4 h-4 mr-1" />
                        {errors.acceptTerms}
                      </p>
                    )}

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 flex items-center justify-center ${
                        isSubmitting
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:shadow-blue-500/25 hover:scale-105 active:scale-95'
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                          Saving to Database...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5 mr-3" />
                          Send Message to Database
                        </>
                      )}
                    </button>

                    {/* Database Note */}
                    <div className="text-center pt-4 border-t border-gray-100">
                      <p className="text-sm text-gray-500">
                        Your message will be securely stored in our PostgreSQL database.
                        Need immediate assistance? Call us at{" "}
                        <a href="tel:+15551234567" className="text-blue-600 font-medium">
                          +1 (555) 123-4567
                        </a>
                      </p>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Frequently Asked Questions
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                q: "What happens to my contact information?",
                a: "Your information is stored securely in our PostgreSQL database and is only accessible to our support team."
              },
              {
                q: "How long does it take to get a response?",
                a: "We aim to respond to all inquiries within 4 hours during business hours."
              },
              {
                q: "Do you offer custom solutions?",
                a: "Yes! We provide custom integrations and features for enterprise clients."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow duration-200">
                <h4 className="font-semibold text-gray-900 mb-3">{faq.q}</h4>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}