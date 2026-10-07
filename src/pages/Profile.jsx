import { useEffect, useState } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, refreshProfile } = useAuth();
  const [form, setForm] = useState({ name: '', phone: '', address: '', city: '', bio: '', experienceInYears: '', languages: '' });
  const [message, setMessage] = useState('');
  useEffect(() => { if (user) setForm({ name: user.name || '', phone: user.phone || '', address: user.address || '', city: user.city || '', bio: user.bio || '', experienceInYears: user.experienceInYears || '', languages: user.languages || '' }); }, [user]);
  const submit = async (e) => { e.preventDefault(); const payload = { ...form, experienceInYears: form.experienceInYears ? Number(form.experienceInYears) : undefined, languages: form.languages ? form.languages.split(',').map((x) => x.trim()) : undefined }; await API.put('/users/profile', payload); await refreshProfile(); setMessage('Profile updated successfully.'); };
  return <main className="min-h-screen bg-orange-50/30 p-6"><form onSubmit={submit} className="mx-auto max-w-2xl rounded-3xl bg-white p-8 shadow-sm"><h1 className="text-3xl font-bold">Your profile</h1>{message && <p className="mt-4 rounded-xl bg-green-50 p-3 text-green-700">{message}</p>}<div className="mt-6 grid gap-4 sm:grid-cols-2">{[['name','Name'],['phone','Phone'],...(user?.role === 'pandit' ? [['address','Address']] : []),['city','City'],['experienceInYears','Experience (years)']].map(([key,label]) => <label key={key} className="text-sm font-semibold">{label}<input value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className="mt-1 w-full rounded-xl border p-3" /></label>)}</div><label className="mt-4 block text-sm font-semibold">Bio<textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className="mt-1 w-full rounded-xl border p-3" rows="3" /></label><label className="mt-4 block text-sm font-semibold">Languages (comma separated)<input value={form.languages} onChange={(e) => setForm({ ...form, languages: e.target.value })} className="mt-1 w-full rounded-xl border p-3" /></label><button className="mt-6 rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white">Save profile</button></form></main>;
}
