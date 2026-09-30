import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { User, Phone, Mail, Trash2, Plus } from 'lucide-react';

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const res = await api.get('/contacts');
      setContacts(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;
    
    try {
      await api.post('/contacts', { name, phone, email });
      setName('');
      setPhone('');
      setEmail('');
      fetchContacts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/contacts/${id}`);
      fetchContacts();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="py-6 space-y-8 max-w-2xl mx-auto w-full">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <User className="text-slate-400" />
          My Profile
        </h2>
        <div className="space-y-2">
          <div className="flex gap-2">
            <span className="font-medium text-slate-500 w-20">Name:</span>
            <span className="font-semibold text-slate-900">{user?.name}</span>
          </div>
          <div className="flex gap-2">
            <span className="font-medium text-slate-500 w-20">Email:</span>
            <span className="font-semibold text-slate-900">{user?.email}</span>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Emergency Contacts</h2>
        
        {loading ? (
          <div className="text-slate-500">Loading contacts...</div>
        ) : (
          <div className="space-y-4 mb-8">
            {contacts.length === 0 ? (
              <p className="text-slate-500 text-sm italic">No emergency contacts added yet.</p>
            ) : (
              contacts.map(contact => (
                <div key={contact.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div>
                    <h4 className="font-bold text-slate-900">{contact.name}</h4>
                    <div className="text-sm text-slate-600 flex items-center gap-4 mt-1">
                      <span className="flex items-center gap-1"><Phone size={14} /> {contact.phone}</span>
                      {contact.email && <span className="flex items-center gap-1"><Mail size={14} /> {contact.email}</span>}
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDelete(contact.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                    aria-label="Delete contact"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        <h3 className="font-bold text-slate-800 mb-3 text-sm uppercase tracking-wide">Add New Contact</h3>
        <form onSubmit={handleAddContact} className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Name</label>
              <input 
                type="text" 
                required 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-red-500 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Phone</label>
              <input 
                type="tel" 
                required 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-red-500 outline-none text-sm"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-500 mb-1">Email (Optional)</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-red-500 outline-none text-sm"
              />
            </div>
          </div>
          <button type="submit" className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition">
            <Plus size={16} /> Add Contact
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
