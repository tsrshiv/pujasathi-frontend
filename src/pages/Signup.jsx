import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Phone, MapPin } from 'lucide-react';

export default function Signup() {
  const [role, setRole] = useState('client');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    address: '',
    city: '',
  });
  const [error, setError] = useState('');
  const [otp, setOtp] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const { signup, requestSignupOtp } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (resendIn <= 0) return undefined;
    const timer = window.setTimeout(() => setResendIn((current) => current - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [resendIn]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (!verificationSent) {
        await requestSignupOtp(formData.email);
        setVerificationSent(true);
        setResendIn(60);
      } else {
        await signup({ ...formData, role, otp });
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const resendCode = async () => {
    setError('');
    setSubmitting(true);
    try {
      await requestSignupOtp(formData.email);
      setResendIn(60);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not send a new verification code.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-orange-50/40 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-3xl p-8 shadow-xl border border-orange-100">
        
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Create PujaSathi Account</h2>
          <p className="text-sm text-gray-500 mt-1">Register as a Client or Pandit</p>
        </div>

        {/* Role Switcher */}
        <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => setRole('client')}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition ${
              role === 'client' ? 'bg-saffron-500 text-white shadow' : 'text-gray-600'
            }`}
          >
            I am a Client
          </button>
          <button
            type="button"
            onClick={() => setRole('pandit')}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition ${
              role === 'pandit' ? 'bg-saffron-500 text-white shadow' : 'text-gray-600'
            }`}
          >
            I am a Pandit Ji
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <div className="relative">
              <User className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
              <input
                type="text"
                name="name"
                required
                onChange={handleChange}
                placeholder="Enter full name"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-saffron-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                <input
                  type="email"
                  name="email"
                  required
                  onChange={handleChange}
                  placeholder="name@email.com"
                  readOnly={verificationSent}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-saffron-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  name="phone"
                  required
                  onChange={handleChange}
                  placeholder="9876543210"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-saffron-500"
                />
              </div>
            </div>
          </div>

          {role === 'pandit' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input
                type="text"
                name="address"
                required
                value={formData.address}
                onChange={handleChange}
                placeholder="Street, area, landmark"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-saffron-500"
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <div className="relative">
                <MapPin className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  name="city"
                  required
                  onChange={handleChange}
                  placeholder="Bangalore"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-saffron-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                <input
                  type="password"
                  name="password"
                  required
                  minLength={8}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-saffron-500"
                />
              </div>
            </div>
          </div>

          {verificationSent && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email verification code</label>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6}"
                maxLength={6}
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 6-digit code"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-saffron-500"
              />
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-gray-500">Code expires in 10 minutes.</span>
                <button
                  type="button"
                  onClick={resendCode}
                  disabled={resendIn > 0 || submitting}
                  className="font-semibold text-saffron-600 disabled:text-gray-400"
                >
                  {resendIn > 0 ? `Resend in ${resendIn}s` : 'Resend code'}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || (verificationSent && otp.length !== 6)}
            className="w-full bg-saffron-500 hover:bg-saffron-600 text-white font-semibold py-3 rounded-xl shadow transition mt-2 cursor-pointer disabled:opacity-50"
          >
            {submitting
              ? 'Please wait...'
              : verificationSent
                ? 'Verify Email & Register'
                : 'Send Verification Code'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Already registered?{' '}
          <Link to="/login" className="text-saffron-600 font-semibold hover:underline">
            Login Now
          </Link>
        </p>
      </div>
    </div>
  );
}