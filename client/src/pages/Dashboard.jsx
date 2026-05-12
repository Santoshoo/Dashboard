import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Clock, User, Info, FileText, CheckCircle, History, Trash2, MapPin, MessageSquare, Search, UserCheck, Shield, Sparkles, ChevronRight, Plus, X, Users, AlertCircle } from 'lucide-react';
import { MANAGERS, LOCATIONS } from '../constants';

export default function Dashboard() {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [user, setUser] = useState(null);

  // Drawer State
  const [showForm, setShowForm] = useState(false);
  const [showEmpMasterModal, setShowEmpMasterModal] = useState(false);

  // Form State
  const [employeeName, setEmployeeName] = useState('');
  const [informTo, setInformTo] = useState('');
  const [customInformTo, setCustomInformTo] = useState('');
  const [visitLocation, setVisitLocation] = useState('');
  const [customLocation, setCustomLocation] = useState('');
  const [purpose, setPurpose] = useState('');

  // Employee Master State (Admin only)
  const [newEmpId, setNewEmpId] = useState('');
  const [newEmpName, setNewEmpName] = useState('');
  const [empError, setEmpError] = useState('');
  const [empSuccess, setEmpSuccess] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const userData = localStorage.getItem('currentUser');
    let currentUser;
    if (!userData) {
      currentUser = { username: 'Public User', role: 'public' };
      setUser(currentUser);
    } else {
      currentUser = JSON.parse(userData);
      setUser(currentUser);
      if (currentUser.role === 'employee') {
        setEmployeeName(currentUser.username);
      }
    }

    fetchInitialData(currentUser);

    // Live Clock
    const clockInterval = setInterval(() => setCurrentTime(new Date()), 1000);

    // Auto-refresh every 3 seconds
    const dataInterval = setInterval(() => {
      fetchRecords(currentUser);
    }, 3000);

    return () => {
      clearInterval(clockInterval);
      clearInterval(dataInterval);
    };
  }, []);

  const fetchInitialData = async (currentUser) => {
    try {
      const moveRes = await fetch(`http://localhost:5000/api/movements?role=${currentUser.role}&username=${currentUser.username}`);
      const moveData = await moveRes.json();
      setRecords(moveData);

      const empRes = await fetch('http://localhost:5000/api/employees');
      const empData = await empRes.json();
      setEmployees(empData);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
  };

  const fetchRecords = async (currentUser) => {
    try {
      const response = await fetch(`http://localhost:5000/api/movements?role=${currentUser.role}&username=${currentUser.username}`);
      const data = await response.json();
      setRecords(data);
    } catch (err) {
      console.error('Failed to fetch records:', err);
    }
  };

  const resetForm = () => {
    setInformTo('');
    setCustomInformTo('');
    setVisitLocation('');
    setCustomLocation('');
    setPurpose('');
    if (user && user.role !== 'employee') setEmployeeName('');
  };

  const handleGoOut = async (e) => {
    e.preventDefault();
    if (!employeeName || !informTo || !purpose) return;

    const newRecord = {
      id: Date.now().toString(),
      employeeName,
      employeeId: user.employeeId || 'PUBLIC',
      outTime: new Date().toISOString(),
      returnTime: null,
      informTo: informTo === 'Others' ? customInformTo : informTo,
      visitLocation: visitLocation === 'Others' ? customLocation : visitLocation,
      purpose,
      date: new Date().toLocaleDateString()
    };

    try {
      const response = await fetch('http://localhost:5000/api/movements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRecord)
      });

      if (response.ok) {
        fetchRecords(user);
        resetForm();
        setShowForm(false); // Close drawer on success
      }
    } catch (err) {
      console.error('Failed to record movement:', err);
    }
  };

  const handleReturn = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/movements/${id}/return`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ returnTime: new Date().toISOString() })
      });

      if (response.ok) {
        fetchRecords(user);
      }
    } catch (err) {
      console.error('Failed to record return:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    setUser(null);
    window.location.href = '/';
  };

  const fetchEmployees = async () => {
    try {
      // Fetch ALL employees for the admin master list
      const res = await fetch('http://localhost:5000/api/employees');
      const data = await res.json();
      setEmployees(data);
    } catch (err) {
      console.error('Failed to fetch employees:', err);
    }
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    setEmpError('');
    setEmpSuccess('');
    try {
      const res = await fetch('http://localhost:5000/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: newEmpId.trim(), name: newEmpName.trim() })
      });
      const data = await res.json();
      if (res.ok) {
        setEmpSuccess(`"${newEmpName.trim()}" added successfully.`);
        setNewEmpId('');
        setNewEmpName('');
        fetchEmployees();
      } else {
        setEmpError(data.message || 'Failed to add employee.');
      }
    } catch (err) {
      setEmpError('Server error. Please try again.');
    }
  };

  const handleToggleEmployee = async (id, name, currentStatus) => {
    const action = currentStatus ? 'deactivate' : 'activate';
    if (!window.confirm(`Are you sure you want to ${action} "${name}"?`)) return;
    try {
      const res = await fetch(`http://localhost:5000/api/employees/${id}/toggle`, { method: 'PATCH' });
      if (res.ok) {
        const updated = await res.json();
        setEmpSuccess(`"${name}" marked as ${updated.isActive ? 'Active' : 'Inactive'}.`);
        fetchEmployees();
      }
    } catch (err) {
      setEmpError('Failed to update employee status.');
    }
  };

  if (!user) return null;

  const isAdmin = user.role === 'admin';
  const isPublic = user.role === 'public';

  const activeRecords = records.filter(r => {
    const isOut = !r.returnTime;
    if (!isOut) return false;
    return (isAdmin || isPublic) ? true : r.employeeName === user.username;
  });

  const formatTime = (isoString) => {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">

      {/* ── Slide-in Drawer ── */}
      {/* Backdrop */}
      <div
        onClick={() => setShowForm(false)}
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${showForm ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      />

      {/* Drawer Panel */}
      <div className={`fixed top-0 left-0 h-full w-full max-w-sm bg-white shadow-2xl z-50 flex flex-col transition-transform duration-500 ease-in-out ${showForm ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Drawer Header */}
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-emerald-100 rounded-xl flex items-center justify-center mr-3">
              <Plus className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">New Movement</h3>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Going Out</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(false)}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-all duration-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Body — scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <form onSubmit={handleGoOut} className="space-y-5">
            {/* Select Person */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Select Person</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                  <UserCheck className="h-3.5 w-3.5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                </div>
                <select
                  className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all duration-300 bg-white font-bold text-xs text-slate-700 cursor-pointer outline-none appearance-none"
                  value={employeeName}
                  onChange={(e) => setEmployeeName(e.target.value)}
                  required
                >
                  <option value="" disabled>Choose a name...</option>
                  {employees.filter(emp => emp.isActive !== false).map(emp => (
                    <option key={emp.id} value={emp.name}>{emp.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Whom to Inform */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Whom to Inform</label>
              <select
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-300 bg-slate-50/50 focus:bg-white font-bold text-xs text-slate-700 cursor-pointer outline-none"
                value={informTo}
                onChange={(e) => setInformTo(e.target.value)}
                required
              >
                <option value="" disabled>Select whom to inform</option>
                {MANAGERS.map(mgr => <option key={mgr} value={mgr}>{mgr}</option>)}
                <option value="Others">Others</option>
              </select>
              {informTo === 'Others' && (
                <input
                  type="text"
                  className="mt-2 w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-300 bg-white font-bold text-xs outline-none"
                  placeholder="Enter full name"
                  value={customInformTo}
                  onChange={(e) => setCustomInformTo(e.target.value)}
                  required
                />
              )}
            </div>

            {/* Visit Location */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Visit Location</label>
              <select
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-300 bg-slate-50/50 focus:bg-white font-bold text-xs text-slate-700 cursor-pointer outline-none"
                value={visitLocation}
                onChange={(e) => setVisitLocation(e.target.value)}
                required
              >
                <option value="" disabled>Select location</option>
                {LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
              </select>
              {visitLocation === 'Others' && (
                <input
                  type="text"
                  className="mt-2 w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-300 bg-white font-bold text-xs outline-none"
                  placeholder="Enter custom location"
                  value={customLocation}
                  onChange={(e) => setCustomLocation(e.target.value)}
                  required
                />
              )}
            </div>

            {/* Purpose */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Purpose</label>
              <textarea
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-300 bg-slate-50/50 focus:bg-white font-bold text-xs text-slate-700 resize-none outline-none"
                placeholder="Reason for leaving..."
                rows="3"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                required
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full flex justify-center items-center py-3 px-6 rounded-xl shadow-lg shadow-emerald-100 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 transition-all duration-300 transform hover:-translate-y-0.5 active:scale-[0.98]"
            >
              <Clock className="w-5 h-5 mr-2.5" />
              Record Movement
            </button>
          </form>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="bg-white/70 backdrop-blur-xl sticky top-0 z-30 border-b border-slate-200/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className={`p-2 rounded-xl shadow-lg mr-3 ${isAdmin ? 'bg-indigo-600 shadow-indigo-100' : 'bg-emerald-600 shadow-emerald-100'}`}>
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div className="hidden xs:block">
                <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none">KIMS Log</h1>
                <div className="flex items-center mt-1.5">
                  <div className="relative flex h-2 w-2 mr-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Live Monitoring</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              {/* Real-time Clock */}
              <div className="hidden lg:flex flex-col items-end border-r border-slate-200 pr-4">
                <span className="text-base font-black text-slate-800 tabular-nums leading-none">
                  {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  {currentTime.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' })}
                </span>
              </div>

              <div className="flex items-center space-x-3">
                {isAdmin ? (
                  <>
                    <button
                      onClick={() => setShowEmpMasterModal(true)}
                      className="hidden md:flex items-center bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-all duration-300 px-5 py-2.5 rounded-2xl text-sm font-bold border border-indigo-100"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Employee Master
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex items-center text-slate-500 hover:text-red-600 transition-all duration-300 p-2.5 md:px-5 md:py-2.5 rounded-2xl text-sm font-bold hover:bg-red-50 border border-transparent"
                    >
                      <LogOut className="w-4 h-4 md:mr-2" />
                      <span className="hidden md:inline">Logout</span>
                    </button>
                  </>
                ) : (
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => navigate('/records')}
                      className="flex items-center bg-white hover:bg-slate-50 text-slate-700 transition-all duration-300 px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 shadow-sm"
                    >
                      <History className="w-3.5 h-3.5 mr-1.5" />
                      Archive
                    </button>
                    <button
                      onClick={() => navigate('/admin')}
                      className="flex items-center bg-slate-900 hover:bg-black text-white transition-all duration-300 px-4 py-2 rounded-xl text-xs font-bold shadow-lg transform hover:-translate-y-0.5"
                    >
                      <Shield className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
                      Admin
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Main Content ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">

        {/* Greeting & Quick Stats */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              {isAdmin ? `Welcome, ${user.username}` : 'Employee Movement Portal'}
            </h2>
            <p className="text-slate-400 font-bold mt-1 text-sm flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2"></span>
              {activeRecords.length} people are currently out.
            </p>
          </div>

          {!isAdmin && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl text-sm font-black shadow-lg shadow-emerald-200 transition-all duration-300 transform hover:-translate-y-0.5 active:scale-[0.98] group"
            >
              <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
              New Movement
            </button>
          )}
        </div>

        {/* Currently Outside Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] flex items-center">
              <div className="w-6 h-6 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                <Info className="w-3 h-3 text-orange-600" />
              </div>
              Current Status
            </h3>
          </div>

          {activeRecords.length === 0 ? (
            <div className="bg-white rounded-[3rem] border border-slate-100 p-16 text-center shadow-sm">
              <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-6 transform -rotate-6">
                <CheckCircle className="w-10 h-10 text-emerald-500" />
              </div>
              <h4 className="text-xl font-black text-slate-900 mb-2">Clear Records</h4>
              <p className="text-slate-400 font-bold max-w-xs mx-auto">
                {isAdmin ? 'All personnel are accounted for.' : 'No one is currently recorded as being outside.'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {activeRecords.map(record => (
                <div key={record.id} className="bg-white rounded-xl border border-slate-100 p-2.5 px-6 shadow-sm hover:shadow-md transition-all duration-300 group">
                  <div className="grid grid-cols-2 md:grid-cols-4 items-center gap-4">
                    {/* Column 1: Identity */}
                    <div className="flex items-center min-w-0">
                      <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center mr-3 group-hover:bg-emerald-50 transition-colors shrink-0">
                        <User className="w-4 h-4 text-slate-400 group-hover:text-emerald-500" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-black text-slate-900 truncate">{record.employeeName}</h4>
                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Staff Member</p>
                      </div>
                    </div>

                    {/* Column 2: Time & Inform To */}
                    <div className="hidden md:flex flex-col text-[10px] font-bold text-slate-500">
                      <div className="flex items-center">
                        <Clock className="w-3 h-3 text-orange-500 mr-2 shrink-0" />
                        <span>Out: <span className="text-slate-900">{formatTime(record.outTime)}</span></span>
                      </div>
                      <div className="flex items-center mt-1 ml-5 opacity-60">
                        <span>Inform: {record.informTo}</span>
                      </div>
                    </div>

                    {/* Column 3: Location & Purpose */}
                    <div className="hidden md:flex flex-col text-[10px] font-bold text-slate-500 min-w-0">
                      <div className="flex items-center">
                        <MapPin className="w-3 h-3 text-slate-400 mr-2 shrink-0" />
                        <span className="truncate">To: <span className="text-slate-900">{record.visitLocation}</span></span>
                      </div>
                      <div className="flex items-center mt-1 ml-5 opacity-60">
                        <span className="truncate">"{record.purpose}"</span>
                      </div>
                    </div>

                    {/* Column 4: Return Button */}
                    <div className="flex justify-end items-center">
                      <div className="md:hidden text-right mr-3">
                        <p className="text-[10px] font-black text-orange-600 leading-none">{formatTime(record.outTime)}</p>
                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Out</p>
                      </div>
                      <button
                        onClick={() => handleReturn(record.id)}
                        className="h-8 px-5 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white rounded-lg text-[10px] font-black transition-all duration-300 flex items-center justify-center border border-emerald-100 hover:border-emerald-600 whitespace-nowrap min-w-[100px]"
                      >
                        <CheckCircle className="w-3.5 h-3.5 mr-2" />
                        Return
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Employee Master Modal (Admin only) ── */}
        {isAdmin && showEmpMasterModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300"
              onClick={() => setShowEmpMasterModal(false)}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-4xl bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
              {/* Header */}
              <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
                <h3 className="text-lg font-black text-slate-900 flex items-center">
                  <div className="w-8 h-8 bg-indigo-100 rounded-xl flex items-center justify-center mr-3">
                    <Users className="w-4 h-4 text-indigo-600" />
                  </div>
                  Employee Master
                  <span className="ml-2.5 px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-lg border border-indigo-100">
                    {employees.length} staff
                  </span>
                </h3>
                <button
                  onClick={() => setShowEmpMasterModal(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-all duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto">
                {/* Add Employee Form */}
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">New Entry</h4>
                  <form onSubmit={handleAddEmployee} className="space-y-2.5">
                    <input
                      type="text"
                      placeholder="Employee ID"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-300 text-xs font-bold outline-none"
                      value={newEmpId}
                      onChange={(e) => setNewEmpId(e.target.value)}
                      required
                    />
                    <input
                      type="text"
                      placeholder="Full Name"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-300 text-xs font-bold outline-none"
                      value={newEmpName}
                      onChange={(e) => setNewEmpName(e.target.value)}
                      required
                    />
                    <button
                      type="submit"
                      className="w-full flex items-center justify-center py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-md transition-all duration-300 hover:-translate-y-0.5"
                    >
                      <Plus className="w-3.5 h-3.5 mr-2" />
                      Add Employee
                    </button>
                  </form>

                  {/* Feedback messages */}
                  {empSuccess && (
                    <div className="mt-3 flex items-center gap-2 px-4 py-3 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-bold">
                      <CheckCircle className="w-4 h-4 flex-shrink-0" />
                      {empSuccess}
                    </div>
                  )}
                  {empError && (
                    <div className="mt-3 flex items-center gap-2 px-4 py-3 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm font-bold">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {empError}
                    </div>
                  )}
                </div>

                {/* Employee List */}
                <div>
                  <h4 className="text-sm font-black text-slate-700 uppercase tracking-widest mb-4">Current Employees</h4>
                  <div className="border border-slate-100 rounded-2xl overflow-hidden max-h-72 overflow-y-auto">
                    <table className="min-w-full">
                      <thead className="sticky top-0">
                        <tr className="bg-slate-50">
                          <th className="px-5 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">ID</th>
                          <th className="px-5 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Name</th>
                          <th className="px-5 py-3 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {employees.map(emp => {
                          const active = emp.isActive !== false; // treat NULL as active
                          return (
                            <tr key={emp.id} className={`hover:bg-slate-50/50 transition-colors ${!active ? 'opacity-50' : ''}`}>
                              <td className="px-5 py-3 whitespace-nowrap">
                                <span className="text-xs font-black text-slate-400">{emp.id}</span>
                              </td>
                              <td className="px-5 py-3 whitespace-nowrap">
                                <span className="text-sm font-bold text-slate-800">{emp.name}</span>
                              </td>
                              <td className="px-5 py-3 whitespace-nowrap text-center">
                                <button
                                  onClick={() => handleToggleEmployee(emp.id, emp.name, active)}
                                  className={`px-3 py-1 rounded-full text-xs font-black border transition-all duration-200 ${active
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                      : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                                    }`}
                                  title={active ? 'Click to deactivate' : 'Click to activate'}
                                >
                                  {active ? '● Active' : '○ Inactive'}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
