import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

const statusStyle = {
  pending: 'bg-amber-100 text-amber-700',
  accepted: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-600',
};

function BookingCard({ booking, panditMode, onRespond }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-bold text-gray-800">{booking.puja?.title || 'Puja booking'}</h3>
          <p className="text-sm text-gray-500">
            {new Date(booking.bookingDate).toLocaleDateString()} · {booking.timeSlot}
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyle[booking.bookingStatus] || statusStyle.pending}`}>
          {booking.bookingStatus}
        </span>
      </div>
      <p className="mt-3 text-sm text-gray-600">
        {booking.address?.street}, {booking.address?.city} - {booking.address?.pincode}
      </p>
      {booking.client && <p className="mt-1 text-sm text-gray-600">Client: {booking.client.name} · {booking.client.phone}</p>}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
        <div>
          <p className="font-semibold">₹{booking.totalAmount}</p>
          <p className="text-xs text-gray-500">
            {booking.paymentMethod === 'online' ? 'Online payment' : 'Cash on delivery'}
            {booking.paymentStatus ? ` · ${booking.paymentStatus.replace('_', ' ')}` : ''}
          </p>
        </div>
        {panditMode && booking.bookingStatus === 'pending' && (
          <div className="flex gap-2">
            <button onClick={() => onRespond(booking._id, 'reject')} className="rounded-lg border px-3 py-1.5 text-red-600">Reject</button>
            <button onClick={() => onRespond(booking._id, 'accept')} className="rounded-lg bg-orange-500 px-3 py-1.5 text-white">Accept</button>
          </div>
        )}
        {panditMode && booking.bookingStatus === 'accepted' && (
          <button onClick={() => onRespond(booking._id, 'complete')} className="rounded-lg bg-green-600 px-3 py-1.5 text-white">
            Mark completed
          </button>
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const endpoint = user?.role === 'pandit'
        ? '/dashboard/pandit'
        : user?.role === 'client'
          ? '/dashboard/client'
          : '/admin/pandits/pending';
      const { data: result } = await API.get(endpoint);
      setData(result.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Dashboard could not be loaded.');
    }
  };

  useEffect(() => {
    if (!user) return;
    let active = true;
    const endpoint = user.role === 'pandit'
      ? '/dashboard/pandit'
      : user.role === 'client'
        ? '/dashboard/client'
        : '/admin/pandits/pending';
    API.get(endpoint)
      .then(({ data: result }) => { if (active) setData(result.data || []); })
      .catch((err) => { if (active) setError(err.response?.data?.message || 'Dashboard could not be loaded.'); });
    return () => { active = false; };
  }, [user]);

  if (!user) {
    return <main className="p-10 text-center"><h1 className="text-2xl font-bold">Please login first</h1><Link to="/login" className="mt-3 inline-block text-orange-600">Login</Link></main>;
  }

  const respond = async (id, action) => {
    await API.put(`/bookings/${id}/respond`, { action });
    await load();
  };
  const toggle = async () => { await API.put('/pandits/toggle-status'); await load(); };

  return (
    <main className="min-h-screen bg-orange-50/30 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div><p className="font-semibold text-orange-600">Welcome back</p><h1 className="text-3xl font-bold text-gray-800">{user.name}'s dashboard</h1></div>
          {user.role === 'pandit' && <button onClick={toggle} className="rounded-xl bg-gray-800 px-4 py-2 font-semibold text-white">Toggle availability</button>}
        </div>
        {error && <p className="mb-4 rounded-xl bg-red-50 p-4 text-red-600">{error}</p>}
        {user.role === 'admin'
          ? <AdminPanel pandits={data || []} reload={load} />
          : user.role === 'pandit'
            ? <PanditPanel data={data} respond={respond} />
            : <ClientPanel data={data} />}
      </div>
    </main>
  );
}

function ClientPanel({ data }) {
  const upcoming = data?.upcomingBookings || [];
  const past = data?.pastBookings || [];
  return (
    <>
      <div className="mb-6 grid gap-4 sm:grid-cols-2"><Stat label="Upcoming bookings" value={data?.upcomingCount || 0} /><Stat label="Past bookings" value={data?.pastCount || 0} /></div>
      <h2 className="mb-3 text-xl font-bold">Upcoming bookings</h2>
      <div className="grid gap-4 md:grid-cols-2">{upcoming.map((booking) => <BookingCard key={booking._id} booking={booking} />)}</div>
      {!upcoming.length && <Empty text="No upcoming bookings yet." />}
      {past.length > 0 && <><h2 className="mb-3 mt-8 text-xl font-bold">Past bookings</h2><div className="grid gap-4 md:grid-cols-2">{past.map((booking) => <BookingCard key={booking._id} booking={booking} />)}</div></>}
    </>
  );
}

function PanditPanel({ data, respond }) {
  return (
    <>
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Stat label="Pending requests" value={data?.pendingRequestsCount || 0} />
        <Stat label="Accepted jobs" value={data?.acceptedBookingsCount || 0} />
        <Stat label="Average rating" value={data?.averageRating || 0} />
      </div>
      <PanditWallet />
      <h2 className="mb-3 mt-8 text-xl font-bold">Manage bookings</h2>
      <PanditBookings respond={respond} />
    </>
  );
}

function PanditWallet() {
  const [wallet, setWallet] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    API.get('/ledger/pandit')
      .then(({ data }) => { if (active) setWallet(data.data); })
      .catch((err) => { if (active) setError(err.response?.data?.message || 'Wallet could not be loaded.'); });
    return () => { active = false; };
  }, []);

  if (error) return <p className="rounded-xl bg-red-50 p-4 text-red-600">{error}</p>;
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm">
      <h2 className="text-xl font-bold">PujaSathi ledger</h2>
      <p className="mt-1 text-sm text-gray-500">Online earnings are paid manually by the platform. COD commission is due within 7 days of job completion.</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <Stat label="Net ledger balance" value={wallet ? `₹${wallet.balance}` : '…'} />
        <Stat label="Available for payout" value={wallet ? `₹${wallet.availableBalance}` : '…'} />
        <Stat label="COD commission due" value={wallet ? `₹${wallet.codFeeDue}` : '…'} />
      </div>
    </section>
  );
}

function PanditBookings({ respond }) {
  const [pending, setPending] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState('');

  const reload = async () => {
    const [pendingResponse, jobsResponse] = await Promise.all([
      API.get('/bookings/pandit/pending'),
      API.get('/bookings/pandit/my-jobs'),
    ]);
    setPending(pendingResponse.data.data || []);
    setJobs(jobsResponse.data.data || []);
  };

  useEffect(() => {
    let active = true;
    Promise.all([API.get('/bookings/pandit/pending'), API.get('/bookings/pandit/my-jobs')])
      .then(([pendingResponse, jobsResponse]) => {
        if (!active) return;
        setPending(pendingResponse.data.data || []);
        setJobs(jobsResponse.data.data || []);
      })
      .catch((err) => { if (active) setError(err.response?.data?.message || 'Bookings could not be loaded.'); });
    return () => { active = false; };
  }, []);

  const handleRespond = async (id, action) => {
    setError('');
    try {
      await respond(id, action);
      await reload();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update this booking.');
    }
  };

  return (
    <>
      {error && <p className="mb-4 rounded-xl bg-red-50 p-4 text-red-600">{error}</p>}
      <h3 className="mb-3 font-semibold">New requests</h3>
      <div className="grid gap-4 md:grid-cols-2">{pending.map((booking) => <BookingCard key={booking._id} booking={booking} panditMode onRespond={handleRespond} />)}</div>
      {!pending.length && <Empty text="No pending requests in your city." />}
      <h3 className="mb-3 mt-8 font-semibold">My jobs</h3>
      <div className="grid gap-4 md:grid-cols-2">{jobs.map((booking) => <BookingCard key={booking._id} booking={booking} panditMode onRespond={handleRespond} />)}</div>
      {!jobs.length && <Empty text="No accepted jobs yet." />}
    </>
  );
}

function AdminPanel({ pandits, reload }) {
  const approve = async (id) => { await API.put(`/admin/pandits/${id}/approve`, { isApproved: true }); reload(); };
  return (
    <>
      <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm"><h2 className="text-xl font-bold">Pending pandit approvals</h2><p className="mt-1 text-gray-500">Review and approve verified service providers.</p></div>
      <div className="grid gap-4 md:grid-cols-2">{pandits.map((pandit) => <div key={pandit._id} className="flex items-center justify-between rounded-2xl bg-white p-5 shadow-sm"><div><h3 className="font-bold">{pandit.name}</h3><p className="text-sm text-gray-500">{pandit.email} · {pandit.city}</p></div><button onClick={() => approve(pandit._id)} className="rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white">Approve</button></div>)}</div>
      {!pandits.length && <Empty text="No pending approvals." />}
      <AdminLedger />
    </>
  );
}

function AdminLedger() {
  const [rows, setRows] = useState([]);
  const [forms, setForms] = useState({});
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const load = async () => {
    const { data } = await API.get('/admin/pandit-ledgers');
    setRows(data.data || []);
  };
  useEffect(() => {
    let active = true;
    API.get('/admin/pandit-ledgers')
      .then(({ data }) => { if (active) setRows(data.data || []); })
      .catch((err) => { if (active) setError(err.response?.data?.message || 'Pandit ledgers could not be loaded.'); });
    return () => { active = false; };
  }, []);

  const updateForm = (panditId, field, value) => setForms((current) => ({
    ...current,
    [panditId]: { type: 'payout', ...current[panditId], [field]: value },
  }));

  const recordSettlement = async (panditId) => {
    const form = forms[panditId] || {};
    setError('');
    setMessage('');
    try {
      await API.post(`/admin/pandit-ledgers/${panditId}/settlements`, {
        type: form.type || 'payout',
        amount: Number(form.amount),
        reference: form.reference,
      });
      setMessage(`Settlement recorded for ${rows.find((row) => row.pandit._id === panditId)?.pandit.name}.`);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not record settlement.');
    }
  };

  return (
    <section className="mt-8 rounded-2xl bg-white p-5 shadow-sm">
      <h2 className="text-xl font-bold">Pandit settlements</h2>
      <p className="mt-1 text-sm text-gray-500">Send payouts or collect COD fees outside PujaSathi first, then record the verified bank/UPI reference here.</p>
      {message && <p className="mt-3 rounded-lg bg-green-50 p-3 text-green-700">{message}</p>}
      {error && <p className="mt-3 rounded-lg bg-red-50 p-3 text-red-600">{error}</p>}
      <div className="mt-4 space-y-4">
        {rows.map(({ pandit, balance, codFeeDue }) => {
          const form = forms[pandit._id] || {};
          return (
            <div key={pandit._id} className="rounded-xl border p-4">
              <div className="flex flex-wrap justify-between gap-2"><div><h3 className="font-bold">{pandit.name}</h3><p className="text-sm text-gray-500">{pandit.email} · {pandit.city}</p></div><div className="text-sm">Balance: <strong>₹{balance}</strong> · COD due: <strong>₹{codFeeDue}</strong></div></div>
              <div className="mt-3 grid gap-2 sm:grid-cols-4">
                <select value={form.type || 'payout'} onChange={(e) => updateForm(pandit._id, 'type', e.target.value)} className="rounded-lg border p-2">
                  <option value="payout">Record pandit payout</option>
                  <option value="cod_fee_payment">Record COD fee received</option>
                </select>
                <input type="number" min="0.01" step="0.01" placeholder="Amount ₹" value={form.amount || ''} onChange={(e) => updateForm(pandit._id, 'amount', e.target.value)} className="rounded-lg border p-2" />
                <input type="text" placeholder="Bank/UPI reference" value={form.reference || ''} onChange={(e) => updateForm(pandit._id, 'reference', e.target.value)} className="rounded-lg border p-2" />
                <button onClick={() => recordSettlement(pandit._id)} className="rounded-lg bg-orange-500 px-3 py-2 font-semibold text-white">Record verified transfer</button>
              </div>
            </div>
          );
        })}
        {!rows.length && !error && <Empty text="No pandit ledgers found." />}
      </div>
    </section>
  );
}

function Stat({ label, value }) {
  return <div className="rounded-2xl bg-white p-5 shadow-sm"><p className="text-sm text-gray-500">{label}</p><p className="mt-2 text-3xl font-bold text-orange-600">{value}</p></div>;
}

function Empty({ text }) {
  return <p className="rounded-2xl bg-white p-8 text-center text-gray-500">{text}</p>;
}
