import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { Search, MapPin, Star, Award, CheckCircle } from 'lucide-react';

export default function PanditSearch() {
  const navigate = useNavigate();
  const [pandits, setPandits] = useState([]);
  const [city, setCity] = useState('Bangalore');
  const [loading, setLoading] = useState(false);

  const fetchPandits = async () => {
    setLoading(true);
    try {
      const response = await API.get(`/pandits/nearby?city=${city}`);
      setPandits(response.data.data);
    } catch (error) {
      console.error('Error fetching pandits:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPandits();
  }, []);

  return (
    <div className="min-h-screen bg-orange-50/30 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Search Header */}
        <div className="bg-white p-6 rounded-2xl shadow-sm mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Find Verified Pandits Near You</h1>
          <p className="mb-4 text-sm text-gray-500">Choose a puja first; your request will be offered to available pandits in your city.</p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Enter City (e.g. Bangalore, Delhi)"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-saffron-500"
              />
            </div>

            <button
              onClick={fetchPandits}
              className="flex items-center justify-center gap-2 bg-saffron-500 hover:bg-saffron-600 text-white font-semibold px-6 py-3 rounded-xl transition shadow cursor-pointer"
            >
              <Search className="w-5 h-5" />
              <span>Search</span>
            </button>
          </div>
        </div>

        {/* Results Grid */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading nearby pandits...</div>
        ) : pandits.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-sm text-gray-500">
            No approved pandits available in {city} right now.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pandits.map((pandit) => (
              <div key={pandit._id} className="bg-white rounded-2xl p-5 shadow-sm border border-orange-100 hover:shadow-md transition">
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={pandit.profileImage || 'https://via.placeholder.com/150'}
                    alt={pandit.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-saffron-500"
                  />
                  <div>
                    <div className="flex items-center gap-1">
                      <h3 className="text-lg font-bold text-gray-800">{pandit.name}</h3>
                      <CheckCircle className="w-4 h-4 text-blue-500 fill-blue-500" />
                    </div>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> {pandit.city || 'Location N/A'}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 mb-4 text-sm text-gray-600">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Award className="w-4 h-4 text-saffron-500" /> Experience:
                    </span>
                    <span className="font-semibold text-gray-800">{pandit.experienceInYears || 5}+ Years</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" /> Status:
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                      Available Online
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/pujas')}
                  className="w-full bg-saffron-500 hover:bg-saffron-600 text-white font-semibold py-2.5 rounded-xl transition shadow-sm cursor-pointer"
                >
                  Choose Puja & Book
                </button>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}