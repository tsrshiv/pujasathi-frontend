import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, IndianRupee, Search } from 'lucide-react';
import API from '../services/api';

export default function PujaCatalog() {
  const [pujas, setPujas] = useState([]);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    API.get('/pujas')
      .then(({ data }) => setPujas(data.data || []))
      .catch((err) => setError(err.response?.data?.message || 'Unable to load pujas.'));
  }, []);

  const filtered = pujas.filter((puja) =>
    `${puja.title} ${puja.category}`.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <main className="min-h-screen bg-orange-50/30 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 rounded-3xl bg-gradient-to-r from-orange-500 to-amber-400 p-8 text-white">
          <p className="mb-2 font-semibold uppercase tracking-widest text-orange-100">Sacred services</p>
          <h1 className="text-4xl font-bold">Choose a puja for your occasion</h1>
          <p className="mt-2 max-w-2xl text-orange-50">Verified pandits, transparent pricing and a simple booking experience.</p>
        </div>
        <div className="mb-6 flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
          <Search className="text-gray-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search puja or category" className="w-full outline-none" />
        </div>
        {error && <p className="mb-4 rounded-xl bg-red-50 p-4 text-red-600">{error}</p>}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((puja) => (
            <article key={puja._id} className="overflow-hidden rounded-2xl bg-white shadow-sm">
              {puja.imageUrl ? <img src={puja.imageUrl} alt="" className="h-44 w-full object-cover" /> : <div className="h-44 bg-gradient-to-br from-orange-100 to-amber-200" />}
              <div className="p-5">
                <p className="text-sm font-semibold text-orange-600">{puja.category}</p>
                <h2 className="mt-1 text-xl font-bold text-gray-800">{puja.title}</h2>
                <p className="mt-2 line-clamp-2 text-sm text-gray-500">{puja.description}</p>
                <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                  <span className="flex items-center gap-1"><Clock size={16} /> {puja.durationInHours || 1} hour</span>
                  <span className="flex items-center gap-1 font-bold text-gray-800"><IndianRupee size={16} /> {puja.priceWithSamagri}</span>
                </div>
                <Link to={`/book/${puja._id}`} className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-orange-500 py-3 font-semibold text-white hover:bg-orange-600">
                  Book this puja <ArrowRight size={17} />
                </Link>
              </div>
            </article>
          ))}
        </div>
        {!filtered.length && !error && <p className="rounded-2xl bg-white p-10 text-center text-gray-500">No pujas found.</p>}
      </div>
    </main>
  );
}
