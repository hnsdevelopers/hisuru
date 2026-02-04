import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  XCircle,
  ArrowRight,
  Github,
  Twitter,
  Linkedin,
  Zap,
  Sparkles,
  Shield,
  Globe,
  Bell,
  Calendar,
  Users,
  BarChart,
  AlertCircle
} from 'lucide-react';
import { Link, useSearchParams, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const urlMode = searchParams.get("mode");
  
  const [isLogin, setIsLogin] = useState(urlMode === "signup" ? false : true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    company: '',
    phone: '',
    rememberMe: false,
    newsletter: true,
    acceptTerms: false
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

const [passwordRequirements, setPasswordRequirements] = useState([
  { key: 'length', text: 'At least 8 characters', met: false },
  { key: 'uppercase', text: 'One uppercase letter', met: false },
  { key: 'lowercase', text: 'One lowercase letter', met: false },
  { key: 'number', text: 'One number', met: false },
  { key: 'special', text: 'One special character', met: false }
]);


const updatePasswordRequirements = (password) => {
  setPasswordRequirements([
    {
      key: 'length',
      text: 'At least 8 characters',
      met: password.length >= 8
    },
    {
      key: 'uppercase',
      text: 'One uppercase letter',
      met: /[A-Z]/.test(password)
    },
    {
      key: 'lowercase',
      text: 'One lowercase letter',
      met: /[a-z]/.test(password)
    },
    {
      key: 'number',
      text: 'One number',
      met: /\d/.test(password)
    },
    {
      key: 'special',
      text: 'One special character',
      met: /[^A-Za-z0-9]/.test(password)
    }
  ]);
};


  const features = [
    { icon: Calendar, text: 'Smart scheduling', color: 'blue' },
    { icon: Users, text: 'Team collaboration', color: 'green' },
    { icon: BarChart, text: 'Advanced analytics', color: 'purple' },
    { icon: Bell, text: 'Smart notifications', color: 'orange' }
  ];

  const socialAuth = [
    { provider: 'Google', icon: Globe, color: 'red', enabled: false },
    { provider: 'GitHub', icon: Github, color: 'gray', enabled: true },
    { provider: 'Twitter', icon: Twitter, color: 'blue', enabled: false }
  ];

  // Check current auth session on mount
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        window.location.href = '/dashboard';
      }
      setIsLoading(false);
    };
    
    checkSession();
  }, []);

  // Update mode based on URL
  useEffect(() => {
    if (urlMode === "signup") {
      setIsLogin(false);
    }
  }, [location, urlMode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear errors
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (authError) setAuthError('');

    // Update password requirements
    if (name === 'password' && !isLogin) {
      updatePasswordRequirements(value);
    }
  };


  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!isLogin) {
      if (!formData.name?.trim()) {
        newErrors.name = 'Full name is required';
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }

      if (!formData.acceptTerms) {
        newErrors.acceptTerms = 'You must accept the terms and conditions';
      }
    }

    return newErrors;
  };

  const handleSignup = async () => {
    try {
      setAuthError('');
      setIsSubmitting(true);

      // Sign up with Supabase
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
            company: formData.company || '',
            phone: formData.phone || '',
            newsletter_subscribed: formData.newsletter
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) throw error;

      // Success
      setSuccessMessage(
        'Account created successfully! Please check your email to verify your account.'
      );
      
      // Auto-redirect after 5 seconds
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 5000);

    } catch (error) {
      console.error('Signup error:', error);
      setAuthError(error.message || 'Failed to create account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignin = async () => {
    try {
      setAuthError('');
      setIsSubmitting(true);

      // Sign in with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });

      if (error) throw error;

      // Update last login in database (optional)
      if (data.user) {
        await supabase
          .from('users')
          .update({ last_login_at: new Date().toISOString() })
          .eq('id', data.user.id);
      }

      // Success - redirect to dashboard
      window.location.href = '/dashboard';

    } catch (error) {
      console.error('Signin error:', error);
      if (error.message.includes('Invalid login credentials')) {
        setAuthError('Invalid email or password. Please try again.');
      } else {
        setAuthError(error.message || 'Failed to sign in. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    try {
      let redirectUrl;
      
      if (provider === 'GitHub') {
        redirectUrl = await supabase.auth.signInWithOAuth({
          provider: 'github',
          options: {
            redirectTo: `${window.location.origin}/auth/callback`
          }
        });
      }
      // Add other providers as needed

      if (redirectUrl?.error) throw redirectUrl.error;

    } catch (error) {
      console.error('Social login error:', error);
      setAuthError(`Failed to sign in with ${provider}`);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setAuthError('Please enter your email address first');
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setSuccessMessage('Password reset instructions have been sent to your email.');
    } catch (error) {
      setAuthError(error.message || 'Failed to send reset email');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Submit based on mode
    if (isLogin) {
      await handleSignin();
    } else {
      await handleSignup();
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setPasswordRequirements(prev =>
      prev.map(req => ({ ...req, met: false }))
    );
    setErrors({});
    setAuthError('');
    setSuccessMessage('');
    setFormData(prev => ({
      ...prev,
      password: '',
      confirmPassword: ''
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-4">
      <div className="max-w-6xl w-full">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left Column - Auth Form */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 rounded-xl bg-white/20">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <div className="ml-4">
                  <h1 className="text-2xl font-bold text-white">HiSuru</h1>
                  <p className="text-blue-100">All-in-one productivity platform</p>
                </div>
              </div>
              
              {/* Toggle Switch */}
              <div className="inline-flex bg-white/20 rounded-full p-1 backdrop-blur-sm">
                <button
                  onClick={() => setIsLogin(true)}
                  className={`px-8 py-3 text-sm font-semibold rounded-full transition-all duration-300 ${
                    isLogin
                      ? 'bg-white text-gray-900 shadow-lg'
                      : 'text-white hover:text-blue-100'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setIsLogin(false)}
                  className={`px-8 py-3 text-sm font-semibold rounded-full transition-all duration-300 ${
                    !isLogin
                      ? 'bg-white text-gray-900 shadow-lg'
                      : 'text-white hover:text-blue-100'
                  }`}
                >
                  Sign Up
                </button>
              </div>
            </div>

            {/* Form Content */}
            <div className="p-8 md:p-10">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {isLogin ? 'Welcome back!' : 'Create your account'}
                </h2>
                <p className="text-gray-600">
                  {urlMode === "signup" 
                    ? "Start your 14-day free trial. No credit card required."
                    : isLogin 
                      ? "Sign in to access your dashboard and continue your work"
                      : "Start your 14-day free trial. No credit card required."}
                </p>
                
                {/* Show special badge for signup from Get Started */}
                {urlMode === "signup" && (
                  <div className="inline-flex items-center mt-4 px-4 py-2 rounded-full bg-green-100">
                    <Sparkles className="w-4 h-4 text-green-600 mr-2" />
                    <span className="text-sm font-medium text-green-700">Free trial activated</span>
                  </div>
                )}
              </div>

              {/* Error/Success Messages */}
              {authError && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
                    <span className="text-red-700">{authError}</span>
                  </div>
                </div>
              )}

              {successMessage && (
                <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                    <span className="text-green-700">{successMessage}</span>
                  </div>
                </div>
              )}

              {/* Social Auth */}
              <div className="mb-8">
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  {socialAuth.map((social, index) => (
                    <button
                      key={index}
                      onClick={() => handleSocialLogin(social.provider)}
                      disabled={!social.enabled}
                      className={`flex-1 flex items-center justify-center p-3 border rounded-xl transition-colors ${
                        social.enabled
                          ? 'border-gray-300 hover:bg-gray-50'
                          : 'border-gray-200 cursor-not-allowed opacity-50'
                      }`}
                    >
                      <social.icon className={`w-5 h-5 text-${social.color}-600 mr-3`} />
                      <span className="font-medium text-gray-700">{social.provider}</span>
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">Or continue with email</span>
                  </div>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {!isLogin && (
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
                      className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
                        errors.name
                          ? 'border-red-300 ring-2 ring-red-100'
                          : 'border-gray-300 hover:border-gray-400 focus:border-blue-500'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
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
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-2 text-gray-400" />
                      Email Address *
                    </div>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
                      errors.email
                        ? 'border-red-300 ring-2 ring-red-100'
                        : 'border-gray-300 hover:border-gray-400 focus:border-blue-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="you@company.com"
                    disabled={isSubmitting}
                  />
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <XCircle className="w-4 h-4 mr-1" />
                      {errors.email}
                    </p>
                  )}
                </div>

                {!isLogin && (
                  <>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Company
                        </label>
                        <input
                          type="text"
                          name="company"
                          value={formData.company}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Your company (optional)"
                          disabled={isSubmitting}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="+1 (555) 000-0000"
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center">
                      <Lock className="w-4 h-4 mr-2 text-gray-400" />
                      Password *
                    </div>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 pr-12 ${
                        errors.password
                          ? 'border-red-300 ring-2 ring-red-100'
                          : 'border-gray-300 hover:border-gray-400 focus:border-blue-500'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="••••••••"
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600"
                      disabled={isSubmitting}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <XCircle className="w-4 h-4 mr-1" />
                      {errors.password}
                    </p>
                  )}

                  {!isLogin && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                      <p className="text-sm font-medium text-gray-700 mb-3">Password requirements:</p>
                      <ul className="space-y-2">
                        {passwordRequirements.map((req, index) => (
                          <li key={index} className="flex items-center text-sm">
                            {req.met ? (
                              <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                            ) : (
                              <div className="w-4 h-4 rounded-full border border-gray-300 mr-2"></div>
                            )}
                            <span className={req.met ? 'text-green-600' : 'text-gray-600'}>{req.text}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {!isLogin && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 pr-12 ${
                          errors.confirmPassword
                            ? 'border-red-300 ring-2 ring-red-100'
                            : 'border-gray-300 hover:border-gray-400 focus:border-blue-500'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        placeholder="••••••••"
                        disabled={isSubmitting}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600"
                        disabled={isSubmitting}
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <XCircle className="w-4 h-4 mr-1" />
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="rememberMe"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      disabled={isSubmitting}
                    />
                    <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-700">
                      Remember me
                    </label>
                  </div>
                  
                  {isLogin && (
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      disabled={isSubmitting}
                    >
                      Forgot password?
                    </button>
                  )}
                </div>

                {!isLogin && (
                  <>
                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        id="newsletter"
                        name="newsletter"
                        checked={formData.newsletter}
                        onChange={handleChange}
                        className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        disabled={isSubmitting}
                      />
                      <label htmlFor="newsletter" className="ml-2 text-sm text-gray-600">
                        Subscribe to our newsletter for product updates, tips, and special offers.
                      </label>
                    </div>

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
                      <label htmlFor="acceptTerms" className="ml-2 text-sm text-gray-600">
                        I agree to the{' '}
                        <Link to="/terms" className="text-blue-600 hover:text-blue-700 font-medium">
                          Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link to="/privacy" className="text-blue-600 hover:text-blue-700 font-medium">
                          Privacy Policy
                        </Link> *
                      </label>
                    </div>
                    {errors.acceptTerms && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <XCircle className="w-4 h-4 mr-1" />
                        {errors.acceptTerms}
                      </p>
                    )}
                  </>
                )}

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
                      {isLogin ? 'Signing in...' : 'Creating account...'}
                    </>
                  ) : (
                    <>
                      {isLogin ? 'Sign In' : 'Start Free Trial'}
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </>
                  )}
                </button>
              </form>

              {/* Toggle Link */}
              <div className="mt-8 text-center">
                <p className="text-gray-600">
                  {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                  <button
                    onClick={toggleAuthMode}
                    className="text-blue-600 hover:text-blue-700 font-semibold"
                    disabled={isSubmitting}
                  >
                    {isLogin ? 'Sign up for free' : 'Sign in instead'}
                  </button>
                </p>
              </div>

              {/* Terms */}
              <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                <p className="text-xs text-gray-500">
                  By continuing, you agree to our{' '}
                  <Link to="/terms" className="text-blue-600 hover:text-blue-700">Terms of Service</Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-blue-600 hover:text-blue-700">Privacy Policy</Link>.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Features & Benefits */}
          <div className="space-y-8">
            {/* Feature Cards */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-900">
                Everything you need to boost productivity
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div key={index} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className={`inline-flex p-3 rounded-lg bg-${feature.color}-100 mb-4`}>
                        <Icon className={`w-6 h-6 text-${feature.color}-600`} />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">{feature.text}</h4>
                      <p className="text-sm text-gray-600">
                        {feature.text === 'Smart scheduling' && 'AI-powered scheduling that finds the perfect time for meetings'}
                        {feature.text === 'Team collaboration' && 'Work together seamlessly with shared workflows and real-time updates'}
                        {feature.text === 'Advanced analytics' && 'Gain insights into your team\'s productivity and performance'}
                        {feature.text === 'Smart notifications' && 'Get notified about important updates without the noise'}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Testimonials */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8">
              <div className="flex items-center mb-6">
                <Sparkles className="w-6 h-6 text-purple-600 mr-3" />
                <h3 className="text-xl font-bold text-gray-900">Trusted by teams worldwide</h3>
              </div>
              
              <div className="space-y-4">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <p className="text-gray-700 italic mb-4">
                    "HiSuru has transformed how our team works. We're 45% more productive since switching."
                  </p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                      SJ
                    </div>
                    <div className="ml-4">
                      <div className="font-semibold text-gray-900">Sarah Johnson</div>
                      <div className="text-sm text-gray-600">CTO at TechCorp</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Security & Trust */}
            <div className="space-y-6">
              <div className="flex items-center">
                <Shield className="w-6 h-6 text-green-600 mr-3" />
                <div>
                  <h4 className="font-semibold text-gray-900">Enterprise-grade security</h4>
                  <p className="text-sm text-gray-600">Your data is protected with bank-level encryption</p>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  <span>14-day free trial</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  <span>Cancel anytime</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}