import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

const loadRazorpay = () => new Promise((resolve) => {
  if (window.Razorpay) {
    resolve(true);
    return;
  }

  const script = document.createElement('script');
  script.src = 'https://checkout.razorpay.com/v1/checkout.js';
  script.onload = () => resolve(true);
  script.onerror = () => resolve(false);
  document.body.appendChild(script);
});

export default function BookingPage() {
  const { pujaId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [puja, setPuja] = useState(null);
  const [form, setForm] = useState({ bookingDate: '', timeSlot: 'Morning (8 AM - 12 PM)', street: '', city: user?.city || '', pincode: '', includeSamagri: true });
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [pendingOnlineBookingId, setPendingOnlineBookingId] = useState(
    () => sessionStorage.getItem(`pendingOnlineBooking:${pujaId}`) || '',
  );
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    API.get(`/pujas/${pujaId}`).then(({ data }) => setPuja(data.data)).catch(() => setError('Unable to load this puja.'));
  }, [pujaId]);

  if (!user) return <main className="p-10 text-center"><h1 className="text-2xl font-bold">Login to book a puja</h1><Link className="mt-4 inline-block text-orange-600" to="/login">Go to login</Link></main>;

  const submit = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      let bookingId = pendingOnlineBookingId;
      if (!bookingId) {
        const { data: bookingResponse } = await API.post('/bookings', {
          pujaId,
          bookingDate: form.bookingDate,
          timeSlot: form.timeSlot,
          includeSamagri: form.includeSamagri,
          paymentMethod,
          address: { street: form.street, city: form.city, pincode: form.pincode },
        });
        bookingId = bookingResponse.data._id;
        if (paymentMethod === 'online') {
          setPendingOnlineBookingId(bookingId);
          sessionStorage.setItem(`pendingOnlineBooking:${pujaId}`, bookingId);
        }
      }

      if (paymentMethod === 'cod') {
        navigate('/dashboard');
        return;
      }

      const { data: orderResponse } = await API.post('/payments/create-order', { bookingId });
      const scriptLoaded = await loadRazorpay();
      if (!scriptLoaded || !window.Razorpay) {
        throw new Error('Razorpay Checkout could not be loaded. Check your internet connection and retry.');
      }

      const checkout = new window.Razorpay({
        key: orderResponse.data.keyId,
        amount: orderResponse.data.order.amount,
        currency: orderResponse.data.order.currency,
        name: 'PujaSathi',
        description: puja.title,
        order_id: orderResponse.data.order.id,
        prefill: { name: user.name, email: user.email, contact: user.phone },
        theme: { color: '#f97316' },
        handler: async (payment) => {
          try {
            await API.post('/payments/verify', {
              bookingId,
              razorpay_order_id: payment.razorpay_order_id,
              razorpay_payment_id: payment.razorpay_payment_id,
              razorpay_signature: payment.razorpay_signature,
            });
            setPendingOnlineBookingId('');
            sessionStorage.removeItem(`pendingOnlineBooking:${pujaId}`);
            navigate('/dashboard');
          } catch (err) {
            setError(err.response?.data?.message || 'Payment verification failed. Contact support before retrying payment.');
            setSaving(false);
          }
        },
        modal: {
          ondismiss: () => setSaving(false),
        },
      });
      checkout.on('payment.failed', (event) => {
        setError(event.error?.description || 'Payment failed. You can retry online payment.');
        setSaving(false);
      });
      checkout.open();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Booking failed.');
      setSaving(false);
    }
  };

  return <main className="min-h-screen bg-orange-50/30 p-6"><div className="mx-auto max-w-2xl rounded-3xl bg-white p-8 shadow-sm">
    <h1 className="text-3xl font-bold text-gray-800">Book {puja?.title || 'Puja'}</h1>
    {puja && <p className="mt-2 text-gray-500">{puja.description}</p>}
    {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-red-600">{error}</p>}
    <form onSubmit={submit} className="mt-6 space-y-4">
      <label className="block text-sm font-semibold">Date<input required type="date" min={new Date().toISOString().split('T')[0]} value={form.bookingDate} onChange={(e) => setForm({ ...form, bookingDate: e.target.value })} className="mt-1 w-full rounded-xl border p-3" /></label>
      <label className="block text-sm font-semibold">Time slot<select value={form.timeSlot} onChange={(e) => setForm({ ...form, timeSlot: e.target.value })} className="mt-1 w-full rounded-xl border p-3"><option>Morning (8 AM - 12 PM)</option><option>Afternoon (12 PM - 4 PM)</option><option>Evening (4 PM - 8 PM)</option></select></label>
      <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold">Street<input required value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} className="mt-1 w-full rounded-xl border p-3" /></label><label className="text-sm font-semibold">City<input required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="mt-1 w-full rounded-xl border p-3" /></label><label className="text-sm font-semibold">Pincode<input required value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} className="mt-1 w-full rounded-xl border p-3" /></label></div>
      <label className="flex items-center gap-3 rounded-xl bg-orange-50 p-4"><input type="checkbox" checked={form.includeSamagri} onChange={(e) => setForm({ ...form, includeSamagri: e.target.checked })} /> Include samagri (₹{puja?.priceWithSamagri || 0})</label>
      <fieldset className="space-y-2">
        <legend className="text-sm font-semibold">Choose payment method</legend>
        <label className="flex items-center gap-3 rounded-xl border p-3">
          <input type="radio" name="paymentMethod" value="cod" checked={paymentMethod === 'cod'} disabled={Boolean(pendingOnlineBookingId)} onChange={() => setPaymentMethod('cod')} />
          Cash on delivery
        </label>
        <label className="flex items-center gap-3 rounded-xl border p-3">
          <input type="radio" name="paymentMethod" value="online" checked={paymentMethod === 'online'} disabled={Boolean(pendingOnlineBookingId)} onChange={() => setPaymentMethod('online')} />
          Pay online with Razorpay
        </label>
      </fieldset>
      {paymentMethod === 'online' && <p className="text-xs text-gray-500">Online payments are currently collected by PujaSathi. Pandit payouts are handled manually.</p>}
      <button disabled={saving || !puja} className="w-full rounded-xl bg-orange-500 py-3 font-semibold text-white disabled:opacity-50">{saving ? 'Please wait...' : paymentMethod === 'online' ? `Pay ₹${puja ? (form.includeSamagri ? puja.priceWithSamagri : puja.priceWithoutSamagri) : 0} online` : 'Confirm COD booking'}</button>
    </form>
  </div></main>;
}
