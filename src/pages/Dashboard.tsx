import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { MapPin, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

const Dashboard = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await api.get('/sos');
      setEvents(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markResolved = async (id: string) => {
    try {
      await api.patch(`/sos/${id}/status`, { status: 'RESOLVED' });
      fetchEvents();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading dashboard...</div>;

  return (
    <div className="py-6 space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Emergency Dashboard</h2>
      
      {events.length === 0 ? (
        <div className="bg-white p-8 rounded-xl text-center text-slate-500 border border-slate-200">
          No emergency events found.
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((ev) => (
            <div key={ev.id} className={`p-5 rounded-xl border ${ev.status === 'ACTIVE' ? 'bg-red-50 border-red-200 shadow-sm' : 'bg-white border-slate-200'}`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  {ev.status === 'ACTIVE' ? <AlertTriangle className="text-red-600" /> : <CheckCircle className="text-green-600" />}
                  <h3 className="font-bold text-lg text-slate-900">{ev.incident_type}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    ev.status === 'ACTIVE' ? 'bg-red-200 text-red-800' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {ev.status}
                  </span>
                </div>
                <div className="text-sm text-slate-500 flex items-center gap-1">
                  <Clock size={14} />
                  {new Date(ev.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                <div>
                  <div className="text-slate-500 mb-1">People</div>
                  <div className="font-medium">{ev.people_involved || 'Unknown'}</div>
                </div>
                <div>
                  <div className="text-slate-500 mb-1">Injury</div>
                  <div className="font-medium">{ev.injury_reported ? 'Reported' : 'None'}</div>
                </div>
                <div>
                  <div className="text-slate-500 mb-1">Urgency</div>
                  <div className="font-medium">{ev.severity}</div>
                </div>
              </div>

              <div className="bg-white/60 p-3 rounded-lg mb-4 text-sm text-slate-700 border border-black/5">
                <div className="font-medium mb-1 text-slate-500">Summary</div>
                {ev.ai_summary}
              </div>

              <div className="flex flex-wrap gap-3">
                {ev.latitude && ev.longitude && (
                  <a 
                    href={`https://www.google.com/maps?q=${ev.latitude},${ev.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-lg font-medium text-sm transition"
                  >
                    <MapPin size={16} /> OPEN LOCATION
                  </a>
                )}
                {ev.status === 'ACTIVE' && (
                  <button 
                    onClick={() => markResolved(ev.id)}
                    className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg font-medium text-sm transition ml-auto"
                  >
                    MARK RESOLVED
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
