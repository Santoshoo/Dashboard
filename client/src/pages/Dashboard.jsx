import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Clock, User, Info, FileText, CheckCircle, History, Trash2, MapPin, MessageSquare, Search, UserCheck, Shield, Sparkles, ChevronRight, ChevronDown, ChevronUp, Plus, X, Users, AlertCircle, Sun, Moon } from 'lucide-react';
import { MANAGERS, LOCATIONS, MANAGER_LOCATIONS } from '../constants';
import { usePagination, Pagination } from '../utils';

export default function Dashboard() {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [user, setUser] = useState(null);

  // Location Selector State
  const [selectedLocation, setSelectedLocation] = useState(localStorage.getItem('selectedLocation') || 'IT DATA CENTER');
  const locations = ['IT DATA CENTER', 'IT COMMAND CENTER'];

  // Theme State
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light-theme');
    } else {
      document.documentElement.classList.remove('light-theme');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleLocationChange = (location) => {
    setSelectedLocation(location);
    localStorage.setItem('selectedLocation', location);
  };

  // Drawer State
  const [showForm, setShowForm] = useState(false);
  const [showEmpMasterModal, setShowEmpMasterModal] = useState(false);

  // Timeline UI State
  const [expandedRecords, setExpandedRecords] = useState({});

  const toggleTimeline = (id) => {
    setExpandedRecords(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Add Location State
  const [showAddLocationModal, setShowAddLocationModal] = useState(false);
  const [currentRecordId, setCurrentRecordId] = useState(null);
  const [addVisitLocation, setAddVisitLocation] = useState('');
  const [addCustomLocation, setAddCustomLocation] = useState('');
  const [addPurpose, setAddPurpose] = useState('');

  // Form State
  const [formError, setFormError] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [employeeSearchInput, setEmployeeSearchInput] = useState('');
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);
  const [informTo, setInformTo] = useState('');
  const [customInformTo, setCustomInformTo] = useState('');
  const [visitLocation, setVisitLocation] = useState('');
  const [customLocation, setCustomLocation] = useState('');
  const [purpose, setPurpose] = useState('');

  // Reset form when drawer toggles or location changes
  useEffect(() => {
    setEmployeeSearchInput('');
    setEmployeeName('');
    setInformTo('');
    setCustomInformTo('');
    setVisitLocation('');
    setCustomLocation('');
    setPurpose('');
    setFormError('');
  }, [showForm, selectedLocation]);

  // Employee Master State (Admin only)
  const [newEmpId, setNewEmpId] = useState('');
  const [newEmpName, setNewEmpName] = useState('');
  const [newEmpDept, setNewEmpDept] = useState('');
  const [empError, setEmpError] = useState('');
  const [empSuccess, setEmpSuccess] = useState('');
  const [empSearchQuery, setEmpSearchQuery] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  // TAT Stats State
  const [tatStats, setTatStats] = useState(null);

  // Auto-clear feedback messages
  useEffect(() => {
    if (empSuccess || empError) {
      const timer = setTimeout(() => {
        setEmpSuccess('');
        setEmpError('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [empSuccess, empError]);

  useEffect(() => {
    const userData = sessionStorage.getItem('currentUser') || localStorage.getItem('currentUser');
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
    fetchTatStats(currentUser.username);

    // Live Clock
    const clockInterval = setInterval(() => setCurrentTime(new Date()), 1000);

    // Auto-refresh every 3 seconds
    const dataInterval = setInterval(() => {
      fetchRecords(currentUser);
      fetchTatStats(currentUser.username);
    }, 3000);

    return () => {
      clearInterval(clockInterval);
      clearInterval(dataInterval);
    };
  }, []);

  const fetchInitialData = async (currentUser) => {
    try {
      const moveRes = await fetch(`/api/movements?role=${currentUser.role}&username=${currentUser.username}`);
      const moveData = await moveRes.json();
      setRecords(moveData);

      const empRes = await fetch('/api/employees');
      const empData = await empRes.json();
      setEmployees(empData);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
  };

  const fetchRecords = async (currentUser) => {
    try {
      const response = await fetch(`/api/movements?role=${currentUser.role}&username=${currentUser.username}`);
      const data = await response.json();
      setRecords(data);
    } catch (err) {
      console.error('Failed to fetch records:', err);
    }
  };

  const fetchTatStats = async (employeeName) => {
    if (!employeeName || employeeName === 'Public User') return;
    try {
      const response = await fetch(`/api/movements/stats/tat?employeeName=${encodeURIComponent(employeeName)}`);
      const data = await response.json();
      if (data.data && data.data.length > 0) {
        setTatStats(data.data[0]);
      }
    } catch (err) {
      console.error('Failed to fetch TAT stats:', err);
    }
  };

  const resetForm = () => {
    setInformTo('');
    setCustomInformTo('');
    setVisitLocation('');
    setCustomLocation('');
    setPurpose('');
    setEmployeeSearchInput('');
    setShowEmployeeDropdown(false);
    setFormError('');
    if (user && user.role !== 'employee') setEmployeeName('');
  };

  const handleGoOut = async (e) => {
    e.preventDefault();
    setFormError('');
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
      date: new Date().toLocaleDateString(),
      employeeDepartment: selectedLocation
    };

    try {
      const response = await fetch('/api/movements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRecord)
      });

      if (response.ok) {
        fetchRecords(user);
        resetForm();
        setShowForm(false); // Close drawer on success
      } else {
        const errorData = await response.json();
        setFormError(errorData.message || 'Failed to create movement.');
      }
    } catch (err) {
      console.error('Failed to record movement:', err);
      setFormError('Server error. Please try again.');
    }
  };

  const handleReturn = async (id) => {
    const token = sessionStorage.getItem('token');
    try {
      const response = await fetch(`/api/movements/${id}/return`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ returnTime: new Date().toISOString() })
      });

      if (response.ok) {
        fetchRecords(user);
      }
    } catch (err) {
      console.error('Failed to record return:', err);
    }
  };

  const handleAddLocationSubmit = async (e) => {
    e.preventDefault();
    if (!currentRecordId) return;

    const finalLocation = addVisitLocation === 'Others' ? addCustomLocation : addVisitLocation;
    if (!finalLocation || !addPurpose) return;

    const token = sessionStorage.getItem('token');
    try {
      const response = await fetch(`/api/movements/${currentRecordId}/add-location`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ newLocation: finalLocation, newPurpose: addPurpose })
      });

      if (response.ok) {
        fetchRecords(user);
        setShowAddLocationModal(false);
        setAddVisitLocation('');
        setAddCustomLocation('');
        setAddPurpose('');
        setCurrentRecordId(null);
      }
    } catch (err) {
      console.error('Failed to add location:', err);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('currentUser');
    sessionStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    setUser(null);
    window.location.href = '/';
  };

  const calculateCurrentTAT = (outTime) => {
    if (!outTime) return '-';
    const duration = currentTime - new Date(outTime);
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));

    if (hours === 0) return `${minutes}m`;
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}m`;
  };

  const canMarkReturn = (record) => {
    if (!isAdmin || !user) return false;

    // SUPER_ADMIN can mark return for any location
    if (user.role === 'SUPER_ADMIN') return true;

    // ADMIN can only mark return if:
    // Employee's department matches admin's location
    const adminLocation = user.location || 'IT DATA CENTER';
    const employeeDept = record.employeeDepartment;

    return adminLocation === employeeDept;
  };

  const fetchEmployees = async () => {
    try {
      // Fetch ALL employees for the admin master list
      const res = await fetch('/api/employees');
      const data = await res.json();
      setEmployees(data);
    } catch (err) {
      console.error('Failed to fetch employees:', err);
    }
  };

  // Get filtered managers based on employee's department
  const getFilteredManagers = () => {
    const dataCenterManagers = ["MANASWINI BEHERA", "LABONI PRATIHAR"];
    const commandCenterManagers = MANAGERS.filter(m => !["MANASWINI BEHERA", "LABONI PRATIHAR"].includes(m));

    if (selectedLocation === "IT DATA CENTER") {
      return dataCenterManagers;
    } else if (selectedLocation === "IT COMMAND CENTER") {
      return commandCenterManagers;
    }
    return MANAGERS;
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    setEmpError('');
    setEmpSuccess('');
    const token = sessionStorage.getItem('token');
    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id: newEmpId.trim(),
          name: newEmpName.trim(),
          department: newEmpDept
        })
      });
      const data = await res.json();
      if (res.ok) {
        setEmpSuccess(`"${newEmpName.trim()}" added successfully.`);
        setNewEmpId('');
        setNewEmpName('');
        setNewEmpDept('');
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
    const token = sessionStorage.getItem('token');
    try {
      const res = await fetch(`/api/employees/${id}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const updated = await res.json();
        setEmpSuccess(`"${name}" marked as ${updated.isActive ? 'Active' : 'Inactive'}.`);
        fetchEmployees();
      }
    } catch (err) {
      setEmpError('Failed to update employee status.');
    }
  };

  const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';
  const isPublic = user?.role === 'public';

  const activeRecords = records.filter(r => {
    const isOut = !r.returnTime;
    if (!isOut) return false;

    // Admins filter by their specific location (except SUPER_ADMIN sees all)
    if (isAdmin) {
      if (user?.role !== 'SUPER_ADMIN') {
        const adminLocation = user?.location || 'IT DATA CENTER';
        if (r.employeeDepartment !== adminLocation) return false;
      }
    } else {
      // For public/employee, use selected location
      if (r.employeeDepartment !== selectedLocation) return false;
    }

    if (!user) return true;
    return (isAdmin || isPublic) ? true : r.employeeName === user.username;
  });

  const {
    paginatedData: paginatedActiveRecords,
    paginationInfo: activePaginationInfo,
    goToPage: goToActivePage
  } = usePagination(activeRecords, isAdmin ? 6 : 10);

  if (!user) return null;

  const formatTime = (isoString) => {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-(--industrial-bg) text-(--industrial-text) transition-colors duration-500">
      {/* ── Side Drawer Overlay ── */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${showForm ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => { }} // Frozen: doesn't close on click
      />

      {/* ── New Movement Drawer ── */}
      <div className={`fixed left-0 top-0 h-full w-full max-w-md bg-(--industrial-card) border-r border-(--industrial-border) shadow-2xl z-50 transform transition-transform duration-500 ease-out flex flex-col ${showForm ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Drawer Header */}
        <div className="px-6 py-5 border-b border-(--industrial-border) bg-(--industrial-text)/5 flex items-center justify-between shrink-0">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-[#D4AF37]/20 rounded-xl flex items-center justify-center mr-3">
              <Plus className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <div>
              <h3 className="text-base font-black text-(--industrial-text)">New Movement</h3>
              <p className="text-[9px] font-bold text-[#D4AF37] uppercase tracking-widest">Going Out</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(false)}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-(--industrial-text)/5 text-(--industrial-text-muted) hover:text-(--industrial-text) transition-all duration-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Body — scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-6 no-scrollbar">
          {formError && (
            <div className="mb-5 flex items-start gap-2 px-4 py-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold shadow-lg">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}
          <form onSubmit={handleGoOut} className="space-y-5">
            {/* Select Person */}
            <div>
              <label className="block text-[10px] font-black text-(--industrial-text-muted) uppercase tracking-widest mb-2 ml-1">Select Person</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                  <UserCheck className="h-3.5 w-3.5 text-(--industrial-text-muted) transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="Search employee..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-(--industrial-border) focus:ring-4 focus:ring-[#D4AF37]/10 focus:border-[#D4AF37]/40 transition-all duration-300 bg-(--industrial-text)/5 font-bold text-xs text-(--industrial-text) outline-none"
                  value={employeeSearchInput}
                  onChange={(e) => {
                    setEmployeeSearchInput(e.target.value);
                    setShowEmployeeDropdown(true);
                  }}
                  onFocus={() => setShowEmployeeDropdown(true)}
                  required={!employeeName}
                />
                {employeeName && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <span className="text-[10px] font-bold text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-1 rounded">{employeeName}</span>
                  </div>
                )}

                {/* Dropdown List */}
                {showEmployeeDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-(--industrial-card) border border-(--industrial-border) rounded-xl shadow-2xl z-50 max-h-48 overflow-y-auto">
                    {employees
                      .filter(emp =>
                        emp.isActive !== false &&
                        emp.department === selectedLocation &&
                        (emp.name.toLowerCase().includes(employeeSearchInput.toLowerCase()) ||
                          emp.id.toLowerCase().includes(employeeSearchInput.toLowerCase()))
                      )
                      .length === 0 ? (
                      <div className="px-4 py-3 text-center text-[10px] font-bold text-(--industrial-text-muted)">
                        No employees found
                      </div>
                    ) : (
                      employees
                        .filter(emp =>
                          emp.isActive !== false &&
                          emp.department === selectedLocation &&
                          (emp.name.toLowerCase().includes(employeeSearchInput.toLowerCase()) ||
                            emp.id.toLowerCase().includes(employeeSearchInput.toLowerCase()))
                        )
                        .map(emp => (
                          <button
                            key={emp.id}
                            type="button"
                            onClick={() => {
                              setEmployeeName(emp.name);
                              setEmployeeSearchInput('');
                              setShowEmployeeDropdown(false);
                            }}
                            className="w-full px-4 py-2.5 text-left text-xs font-bold text-(--industrial-text) hover:bg-[#D4AF37]/10 transition-colors border-b border-(--industrial-border)/30 last:border-b-0"
                          >
                            {emp.name}
                          </button>
                        ))
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Close dropdown when clicking outside */}
            {showEmployeeDropdown && (
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowEmployeeDropdown(false)}
              />
            )}

            {/* Whom to Inform */}
            <div>
              <label className="block text-[10px] font-black text-(--industrial-text-muted) uppercase tracking-widest mb-2 ml-1">Whom to Inform</label>
              <select
                className="w-full px-4 py-2.5 rounded-xl border border-(--industrial-border) focus:ring-4 focus:ring-[#D4AF37]/10 focus:border-[#D4AF37]/40 transition-all duration-300 bg-(--industrial-text)/5 font-bold text-xs text-(--industrial-text) cursor-pointer outline-none appearance-none"
                value={informTo}
                onChange={(e) => setInformTo(e.target.value)}
                required
              >
                <option value="" disabled className="bg-(--industrial-card) text-(--industrial-text)">Select whom to inform</option>
                {getFilteredManagers().map(mgr => <option key={mgr} value={mgr} className="bg-(--industrial-card) text-(--industrial-text)">{mgr}</option>)}
                <option value="Others" className="bg-(--industrial-card) text-(--industrial-text)">Others</option>
              </select>
              {informTo === 'Others' && (
                <input
                  type="text"
                  className="mt-2 w-full px-4 py-2.5 rounded-xl border border-(--industrial-border) focus:ring-4 focus:ring-[#D4AF37]/10 focus:border-[#D4AF37]/40 transition-all duration-300 bg-(--industrial-text)/5 font-bold text-xs text-(--industrial-text) outline-none"
                  placeholder="Enter full name"
                  value={customInformTo}
                  onChange={(e) => setCustomInformTo(e.target.value)}
                  required
                />
              )}
            </div>

            {/* Visit Location */}
            <div>
              <label className="block text-[10px] font-black text-(--industrial-text-muted) uppercase tracking-widest mb-2 ml-1">Visit Location</label>
              <select
                className="w-full px-4 py-2.5 rounded-xl border border-(--industrial-border) focus:ring-4 focus:ring-[#D4AF37]/10 focus:border-[#D4AF37]/40 transition-all duration-300 bg-(--industrial-text)/5 font-bold text-xs text-(--industrial-text) cursor-pointer outline-none appearance-none"
                value={visitLocation}
                onChange={(e) => setVisitLocation(e.target.value)}
                required
              >
                <option value="" disabled className="bg-(--industrial-card) text-(--industrial-text)">Select location</option>
                {LOCATIONS.map(loc => <option key={loc} value={loc} className="bg-(--industrial-card) text-(--industrial-text)">{loc}</option>)}
              </select>
              {visitLocation === 'Others' && (
                <input
                  type="text"
                  className="mt-2 w-full px-4 py-2.5 rounded-xl border border-(--industrial-border) focus:ring-4 focus:ring-[#D4AF37]/10 focus:border-[#D4AF37]/40 transition-all duration-300 bg-(--industrial-text)/5 font-bold text-xs text-(--industrial-text) outline-none"
                  placeholder="Enter custom location"
                  value={customLocation}
                  onChange={(e) => setCustomLocation(e.target.value)}
                  required
                />
              )}
            </div>

            {/* Purpose */}
            <div>
              <label className="block text-[10px] font-black text-(--industrial-text-muted) uppercase tracking-widest mb-2 ml-1">Purpose</label>
              <textarea
                className="w-full px-4 py-2.5 rounded-xl border border-(--industrial-border) focus:ring-4 focus:ring-[#D4AF37]/10 focus:border-[#D4AF37]/40 transition-all duration-300 bg-(--industrial-text)/5 font-bold text-xs text-(--industrial-text) resize-none outline-none"
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
              className="w-full flex justify-center items-center py-3 px-6 rounded-xl gold-gradient gold-glow text-xs font-black text-[#0B0F19] transition-all duration-300 transform hover:-translate-y-0.5 active:scale-[0.98]"
            >
              <Clock className="w-5 h-5 mr-2.5" />
              Record Movement
            </button>
          </form>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="bg-(--industrial-bg)/95 backdrop-blur-xl sticky top-0 z-30 border-b border-(--industrial-border) shadow-2xl">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className={`p-2 rounded-xl gold-glow gold-gradient mr-3`}>
                <Clock className="w-5 h-5 text-[#0B0F19]" />
              </div>
              <div className="hidden xs:block">
                <h1 className="text-xl font-black text-(--industrial-text) tracking-tight leading-none">KIMS Portal</h1>
                <div className="flex items-center mt-1.5">
                  <div className="relative flex h-2 w-2 mr-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4AF37] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D4AF37]"></span>
                  </div>
                  <p className="text-[10px] font-black text-(--industrial-text-muted) uppercase tracking-[0.15em]">Live Monitoring</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              {/* Real-time Clock */}
              <div className="hidden lg:flex flex-col items-end border-r border-(--industrial-border) pr-4">
                <span className="text-base font-black text-(--industrial-text) tabular-nums leading-none">
                  {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
                <span className="text-[9px] font-bold text-(--industrial-text-muted) uppercase tracking-widest mt-1">
                  {currentTime.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' })}
                </span>
              </div>

              <div className="flex items-center space-x-3">
                {/* Theme Toggle Button */}
                <button
                  onClick={toggleTheme}
                  className="flex items-center justify-center p-2.5 rounded-2xl bg-(--industrial-text)/5 hover:bg-(--industrial-text)/10 text-(--industrial-text-muted) hover:text-(--industrial-text) transition-all duration-300 border border-(--industrial-border) shadow-sm"
                  title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                  {theme === 'dark' ? (
                    <Sun className="w-4 h-4 text-[#D4AF37] hover:rotate-45 transition-transform duration-300" />
                  ) : (
                    <Moon className="w-4 h-4 text-[#D4AF37] hover:-rotate-12 transition-transform duration-300" />
                  )}
                </button>

                {isAdmin ? (
                  <>
                    {user?.role === 'SUPER_ADMIN' && (
                      <button
                        onClick={() => navigate('/admin-management')}
                        className="hidden md:flex items-center bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 text-[#D4AF37] transition-all duration-300 px-5 py-2.5 rounded-2xl text-sm font-bold border border-[#D4AF37]/20 mr-2"
                      >
                        <Shield className="w-4 h-4 mr-2" />
                        Admin Management
                      </button>
                    )}
                    <button
                      onClick={() => setShowEmpMasterModal(true)}
                      className="hidden md:flex items-center bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 text-[#D4AF37] transition-all duration-300 px-5 py-2.5 rounded-2xl text-sm font-bold border border-[#D4AF37]/20"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Employee Master
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex items-center text-(--industrial-text-muted) hover:text-red-500 transition-all duration-300 p-2.5 md:px-5 md:py-2.5 rounded-2xl text-sm font-bold hover:bg-red-500/10 border border-transparent"
                    >
                      <LogOut className="w-4 h-4 md:mr-2" />
                      <span className="hidden md:inline">Logout</span>
                    </button>
                  </>
                ) : (
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => navigate('/records')}
                      className="flex items-center bg-(--industrial-text)/5 hover:bg-(--industrial-text)/10 text-(--industrial-text) transition-all duration-300 px-4 py-2 rounded-xl text-xs font-bold border border-(--industrial-border)"
                    >
                      <History className="w-3.5 h-3.5 mr-1.5 text-[#D4AF37]" />
                      Archive
                    </button>
                    <button
                      onClick={() => navigate('/admin')}
                      className="flex items-center bg-[#D4AF37] hover:bg-[#B8860B] text-[#0B0F19] transition-all duration-300 px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-amber-900/20 transform hover:-translate-y-0.5"
                    >
                      <Shield className="w-3.5 h-3.5 mr-1.5 text-[#0B0F19]" />
                      Admin
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Location Selector (Only for non-admin users) ── */}
      {!isAdmin && (
        <div className="bg-(--industrial-bg)/95 backdrop-blur-xl border-b border-(--industrial-border) sticky top-16 z-20">
          <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-center space-x-3">
              <MapPin className="w-4 h-4 text-[#D4AF37]" />
              <label className="text-xs font-black text-(--industrial-text-muted) uppercase tracking-widest">Location:</label>
              <div className="flex space-x-2">
                {locations.map(loc => (
                  <button
                    key={loc}
                    onClick={() => handleLocationChange(loc)}
                    className={`px-4 py-2 rounded-lg font-bold text-xs transition-all duration-300 ${selectedLocation === loc
                      ? 'bg-[#D4AF37] text-[#0B0F19] shadow-lg shadow-amber-500/30'
                      : 'bg-(--industrial-text)/5 text-(--industrial-text-muted) hover:bg-(--industrial-text)/10 border border-(--industrial-border)'
                      }`}
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Content ── */}
      <main className="flex-1 w-full flex flex-col px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-(--industrial-text) tracking-tight">
              {isAdmin ? `Welcome, ${user.username}` : 'Employee Movement Portal'}
            </h2>
            {isAdmin && user.role !== 'SUPER_ADMIN' && (
              <p className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest mt-1 mb-2">
                Assigned Location: {user.location || 'IT DATA CENTER'}
              </p>
            )}
            <p className="text-(--industrial-text-muted) font-bold mt-1 text-sm flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] mr-2"></span>
              {activeRecords.length} people are currently out.
            </p>
          </div>

          {!isAdmin && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center justify-center gold-gradient gold-glow text-[#0B0F19] px-6 py-3 rounded-2xl text-sm font-black transition-all duration-300 transform hover:-translate-y-0.5 active:scale-[0.98] group"
            >
              <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
              New Movement
            </button>
          )}
        </div>

        {/* Individual Employee TAT Stats */}
        {!isAdmin && user && user.username !== 'Public User' && tatStats && (
          <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Total Trips Card */}
            <div className="bg-(--industrial-card) border border-(--industrial-border) rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-black text-(--industrial-text-muted) uppercase tracking-widest mb-2">Total Trips</p>
                  <p className="text-3xl font-black text-[#D4AF37]">{tatStats.totalTrips}</p>
                </div>
                <div className="w-10 h-10 bg-[#D4AF37]/10 rounded-xl flex items-center justify-center">
                  <Clock className="w-5 h-5 text-[#D4AF37]" />
                </div>
              </div>
              <p className="text-[10px] font-bold text-(--industrial-text-muted) mt-3">Times outside</p>
            </div>

            {/* Total Time Card */}
            <div className="bg-(--industrial-card) border border-(--industrial-border) rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-black text-(--industrial-text-muted) uppercase tracking-widest mb-2">Total TAT</p>
                  <p className="text-3xl font-black text-green-400">{tatStats.totalTime}</p>
                </div>
                <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center">
                  <Clock className="w-5 h-5 text-green-400" />
                </div>
              </div>
              <p className="text-[10px] font-bold text-(--industrial-text-muted) mt-3">Combined duration</p>
            </div>

            {/* Average Time Card */}
            <div className="bg-(--industrial-card) border border-(--industrial-border) rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-black text-(--industrial-text-muted) uppercase tracking-widest mb-2">Avg. TAT</p>
                  <p className="text-3xl font-black text-blue-400">{tatStats.averageTime}</p>
                </div>
                <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                  <Info className="w-5 h-5 text-blue-400" />
                </div>
              </div>
              <p className="text-[10px] font-bold text-(--industrial-text-muted) mt-3">Per trip average</p>
            </div>

            {/* Employee ID Card */}
            <div className="bg-(--industrial-card) border border-(--industrial-border) rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-black text-(--industrial-text-muted) uppercase tracking-widest mb-2">Employee ID</p>
                  <p className="text-3xl font-black text-purple-400">{tatStats.employeeId}</p>
                </div>
                <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center">
                  <User className="w-5 h-5 text-purple-400" />
                </div>
              </div>
              <p className="text-[10px] font-bold text-(--industrial-text-muted) mt-3">Staff identifier</p>
            </div>
          </div>
        )}

        {/* Currently Outside Section */}
        <div className="space-y-8 flex-1 flex flex-col">
          <div className="flex items-center justify-between border-b border-(--industrial-border) pb-4">
            <h3 className="text-xl md:text-2xl font-black text-[#D4AF37] uppercase tracking-[0.2em] flex items-center">
              <div className="w-10 h-10 bg-[#D4AF37]/20 rounded-xl flex items-center justify-center mr-4 shadow-[0_0_15px_rgba(212,175,55,0.3)]">
                <Info className="w-6 h-6 text-[#D4AF37]" />
              </div>
              Live Movement Status
            </h3>
          </div>

          {activeRecords.length === 0 ? (
            <div className="bg-(--industrial-card) rounded-[3rem] border border-(--industrial-border) p-16 text-center shadow-2xl">
              <div className="w-20 h-20 bg-[#D4AF37]/10 rounded-3xl flex items-center justify-center mx-auto mb-6 transform -rotate-6">
                <CheckCircle className="w-10 h-10 text-[#D4AF37]" />
              </div>
              <h4 className="text-xl font-black text-(--industrial-text) mb-2">Clear Records</h4>
              <p className="text-(--industrial-text-muted) font-bold max-w-xs mx-auto">
                {isAdmin ? 'All personnel are accounted for.' : 'No one is currently recorded as being outside.'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="space-y-2">
                {paginatedActiveRecords.map(record => {
                  const isOver2Hours = !isAdmin && record.outTime && (currentTime - new Date(record.outTime)) > 2 * 60 * 60 * 1000;
                  
                  // Compute timeline for UI
                  let displayTimeline = record.timeline;
                  
                  // Safely parse timeline if it was stored as a JSON string in the database
                  if (typeof displayTimeline === 'string') {
                    try {
                      displayTimeline = JSON.parse(displayTimeline);
                    } catch (e) {
                      displayTimeline = null;
                    }
                  }

                  if ((!displayTimeline || !Array.isArray(displayTimeline)) && record.visitLocation) {
                    const locations = record.visitLocation.split('->').map(s => s.trim());
                    const purposes = record.purpose ? record.purpose.split('|').map(s => s.trim()) : [];
                    displayTimeline = locations.map((loc, idx) => ({
                      location: loc,
                      purpose: purposes[idx] || record.purpose,
                      timestamp: record.outTime // Fallback timestamp for legacy records
                    }));
                  }
                  
                  // Final fallback to prevent .map crashes
                  if (!Array.isArray(displayTimeline)) {
                    displayTimeline = [];
                  }

                  return (
                    <div key={record.id} className="bg-(--industrial-card) rounded-2xl border-2 border-(--industrial-border) p-4 md:p-6 shadow-2xl hover:border-[#D4AF37]/40 hover:shadow-[0_0_30px_rgba(212,175,55,0.15)] transition-all duration-300 group transform hover:-translate-y-1">
                      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 lg:gap-6 w-full">
                        {/* Column 1: Identity */}
                        <div className="flex items-center w-full lg:w-[22%] min-w-0 shrink-0">
                          <div className="w-12 h-12 bg-(--industrial-text)/5 rounded-xl flex items-center justify-center mr-4 group-hover:bg-[#D4AF37]/20 transition-colors shrink-0 border border-(--industrial-border) group-hover:border-[#D4AF37]/30">
                            <User className="w-6 h-6 text-(--industrial-text-muted) group-hover:text-[#D4AF37]" />
                          </div>
                          <div className="min-w-0">
                            <h4 className={`text-base md:text-lg font-black truncate ${isOver2Hours ? 'text-red-500 animate-pulse' : 'text-(--industrial-text)'}`}>
                              {record.employeeName}
                            </h4>
                            <p className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest mt-1">Staff Member</p>
                          </div>
                        </div>

                        {/* Column 2: Time & Inform To */}
                        <div className="hidden lg:flex flex-col text-xs font-bold text-(--industrial-text-muted) w-[18%] shrink-0">
                          <div className="flex items-center bg-(--industrial-text)/5 rounded-lg px-3 py-1.5 w-fit border border-(--industrial-border)">
                            <Clock className="w-4 h-4 text-[#D4AF37] mr-2 shrink-0" />
                            <span className="uppercase tracking-wider">Out: <span className="text-(--industrial-text) ml-1">{formatTime(record.outTime)}</span></span>
                          </div>
                          <div className="flex items-center mt-2 ml-1 opacity-80">
                            <span className="text-[#D4AF37] mr-1">↳</span> Inform: <span className="text-(--industrial-text) ml-1">{record.informTo}</span>
                          </div>
                        </div>

                        {/* Column 2.5: Current TAT */}
                        <div className="hidden lg:flex flex-col text-xs font-bold items-center justify-center w-[12%] shrink-0">
                          <div className="inline-flex items-center px-4 py-2 rounded-xl bg-blue-500/10 text-blue-400 border-2 border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.15)] text-sm">
                            <Clock className="w-4 h-4 mr-2" />
                            {calculateCurrentTAT(record.outTime)}
                          </div>
                          <span className="text-(--industrial-text-muted) mt-2 uppercase tracking-widest text-[10px]">Elapsed Time</span>
                        </div>

                        {/* Column 3: Location & Purpose */}
                        <div className="hidden lg:flex flex-col text-xs font-bold text-(--industrial-text-muted) flex-1 min-w-0">
                          <div className="flex items-start bg-(--industrial-text)/5 rounded-lg px-3 py-2 w-full border border-(--industrial-border)">
                            <MapPin className="w-4 h-4 text-[#D4AF37] mr-2 shrink-0 mt-0.5" />
                            <div className="flex flex-col min-w-0">
                              <span className="uppercase tracking-wider shrink-0 mb-1">To:</span>
                              <span className="text-(--industrial-text) whitespace-normal wrap-break-word leading-relaxed">
                                {record.visitLocation}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-start mt-2 ml-1 opacity-80">
                            <span className="text-[#D4AF37] mr-1 shrink-0 mt-0.5">↳</span> 
                            <span className="italic whitespace-normal wrap-break-word leading-relaxed min-w-0">
                              "{record.purpose}"
                            </span>
                          </div>
                        </div>

                        {/* Column 4: Actions (Public) or Status (Admin) */}
                        <div className="flex justify-end items-center shrink-0 w-full lg:w-auto">
                          <div className="lg:hidden text-right mr-3 flex-1 flex justify-end gap-4">
                            <div>
                              <p className="text-[10px] font-black text-[#D4AF37] leading-none">{formatTime(record.outTime)}</p>
                              <p className="text-[8px] font-bold text-(--industrial-text-muted) uppercase tracking-widest mt-0.5">Out</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-blue-400 leading-none">{calculateCurrentTAT(record.outTime)}</p>
                              <p className="text-[8px] font-bold text-(--industrial-text-muted) uppercase tracking-widest mt-0.5">TAT</p>
                            </div>
                          </div>

                          {isAdmin ? (
                            canMarkReturn(record) ? (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    setCurrentRecordId(record.id);
                                    setShowAddLocationModal(true);
                                  }}
                                  className="h-10 lg:h-12 px-3 lg:px-4 bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-white rounded-xl text-xs font-black transition-all duration-300 flex items-center justify-center border-2 border-blue-500/30 hover:border-blue-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] whitespace-nowrap uppercase tracking-widest shrink-0"
                                  title="Add Location"
                                >
                                  <MapPin className="w-4 h-4 lg:w-5 lg:h-5 lg:mr-2" />
                                  <span className="hidden lg:inline">Add</span>
                                </button>
                                <button
                                  onClick={() => handleReturn(record.id)}
                                  className="h-10 lg:h-12 px-4 lg:px-6 bg-[#D4AF37]/10 hover:bg-[#D4AF37] text-[#D4AF37] hover:text-[#0B0F19] rounded-xl text-xs font-black transition-all duration-300 flex items-center justify-center border-2 border-[#D4AF37]/30 hover:border-[#D4AF37] hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] whitespace-nowrap uppercase tracking-widest shrink-0"
                                >
                                  <CheckCircle className="w-4 h-4 lg:w-5 lg:h-5 lg:mr-2.5" />
                                  Return
                                </button>
                              </div>
                            ) : (
                              <div className="h-12 px-6 bg-(--industrial-text)/5 text-(--industrial-text-muted) rounded-xl text-xs font-black flex items-center justify-center border border-(--industrial-border) whitespace-nowrap opacity-50 cursor-not-allowed uppercase tracking-widest">
                                <AlertCircle className="w-5 h-5 mr-2.5" />
                                Not Auth
                              </div>
                            )
                          ) : (
                            <div className="h-12 px-8 bg-[#D4AF37]/10 text-[#D4AF37] rounded-xl text-xs font-black flex items-center justify-center border-2 border-[#D4AF37]/20 shadow-[0_0_15px_rgba(212,175,55,0.1)] whitespace-nowrap uppercase tracking-widest">
                              <Clock className="w-5 h-5 mr-2.5 animate-spin-slow" style={{ animationDuration: '3s' }} />
                              Currently Out
                            </div>
                          )}
                          
                          {/* Timeline Toggle Button */}
                          {displayTimeline && displayTimeline.length > 0 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleTimeline(record.id);
                              }}
                              className="ml-3 h-12 w-12 flex items-center justify-center rounded-xl bg-(--industrial-text)/5 hover:bg-[#D4AF37]/10 text-(--industrial-text-muted) hover:text-[#D4AF37] transition-all duration-300 border border-(--industrial-border) hover:border-[#D4AF37]/30"
                              title="Toggle Timeline"
                            >
                              {expandedRecords[record.id] ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Expandable Timeline Section */}
                      {displayTimeline && displayTimeline.length > 0 && expandedRecords[record.id] && (
                        <div className="mt-6 pt-6 border-t border-(--industrial-border) animate-in slide-in-from-top-2 fade-in duration-300">
                          <h5 className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.2em] mb-4">Movement Timeline</h5>
                          <div className="relative pl-6 space-y-6">
                            {/* Vertical Line */}
                            <div className="absolute left-2.75 top-2 bottom-2 w-0.5 bg-(--industrial-border)"></div>
                            
                            {displayTimeline.map((item, index) => (
                              <div key={index} className="relative flex items-start justify-between">
                                {/* Dot */}
                                <div className="absolute -left-5.5 top-1 w-3 h-3 rounded-full border-2 border-[#D4AF37] bg-(--industrial-card) shadow-[0_0_8px_rgba(212,175,55,0.5)]"></div>
                                
                                <div className="flex-1 pr-4">
                                  <p className="text-sm font-black text-(--industrial-text)">
                                    <span className="text-[#D4AF37] mr-2">Assignment {index + 1}</span>
                                    - Out to {item.location}
                                    <span className="text-(--industrial-text-muted) italic font-bold ml-2">"{item.purpose}"</span>
                                  </p>
                                </div>
                                <div className="text-[10px] font-bold text-(--industrial-text-muted) bg-(--industrial-text)/5 px-3 py-1 rounded-lg border border-(--industrial-border)">
                                  {formatTime(item.timestamp)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-4">
                <Pagination
                  {...activePaginationInfo}
                  onPageChange={goToActivePage}
                />
              </div>
            </div>
          )}
        </div>

        {/* ── Employee Master Modal (Admin only) ── */}
        {isAdmin && showEmpMasterModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-(--industrial-bg)/80 backdrop-blur-sm transition-opacity duration-300"
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-5xl bg-(--industrial-card) border border-(--industrial-border) rounded-4xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
              {/* Header */}
              <div className="px-6 py-5 border-b border-(--industrial-border) bg-(--industrial-text)/5 flex items-center justify-between">
                <h3 className="text-lg font-black text-(--industrial-text) flex items-center">
                  <div className="w-8 h-8 bg-[#D4AF37]/20 rounded-xl flex items-center justify-center mr-3">
                    <Users className="w-4 h-4 text-[#D4AF37]" />
                  </div>
                  Employee Master
                  <span className="ml-2.5 px-2 py-0.5 bg-[#D4AF37]/10 text-[#D4AF37] text-[10px] font-black rounded-lg border border-[#D4AF37]/20">
                    {employees.length} staff
                  </span>
                </h3>
                <button
                  onClick={() => setShowEmpMasterModal(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-(--industrial-text)/5 text-(--industrial-text-muted) hover:text-(--industrial-text) transition-all duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-h-[70vh] overflow-y-auto">
                {/* Add Employee Form */}
                <div className="lg:col-span-5">
                  <h4 className="text-[10px] font-black text-(--industrial-text-muted) uppercase tracking-widest mb-4">New Entry</h4>
                  <form onSubmit={handleAddEmployee} className="space-y-2.5">
                    <input
                      type="text"
                      placeholder="Employee ID"
                      className="w-full px-4 py-2.5 rounded-xl border border-(--industrial-border) focus:ring-4 focus:ring-[#D4AF37]/10 focus:border-[#D4AF37]/40 transition-all duration-300 bg-(--industrial-text)/5 text-xs font-bold text-(--industrial-text) outline-none placeholder:text-(--industrial-text-muted)/50"
                      value={newEmpId}
                      onChange={(e) => setNewEmpId(e.target.value)}
                      required
                    />
                    <input
                      type="text"
                      placeholder="Full Name"
                      className="w-full px-4 py-2.5 rounded-xl border border-(--industrial-border) focus:ring-4 focus:ring-[#D4AF37]/10 focus:border-[#D4AF37]/40 transition-all duration-300 bg-(--industrial-text)/5 text-xs font-bold text-(--industrial-text) outline-none placeholder:text-(--industrial-text-muted)/50"
                      value={newEmpName}
                      onChange={(e) => setNewEmpName(e.target.value)}
                      required
                    />
                    <select
                      className="w-full px-4 py-2.5 rounded-xl border border-(--industrial-border) focus:ring-4 focus:ring-[#D4AF37]/10 focus:border-[#D4AF37]/40 transition-all duration-300 bg-(--industrial-text)/5 font-bold text-xs text-(--industrial-text) cursor-pointer outline-none appearance-none"
                      value={newEmpDept}
                      onChange={(e) => setNewEmpDept(e.target.value)}
                      required
                    >
                      <option value="" disabled className="bg-(--industrial-card) text-(--industrial-text)">Assign Location...</option>
                      <option value="IT DATA CENTER" className="bg-(--industrial-card) text-(--industrial-text)">IT DATA CENTER</option>
                      <option value="IT COMMAND CENTER" className="bg-(--industrial-card) text-(--industrial-text)">IT COMMAND CENTER</option>
                    </select>
                    <button
                      type="submit"
                      className="w-full flex items-center justify-center py-2.5 px-4 rounded-xl gold-gradient gold-glow text-[#0B0F19] text-xs font-black transition-all duration-300 hover:-translate-y-0.5"
                    >
                      <Plus className="w-3.5 h-3.5 mr-2" />
                      Add Employee
                    </button>
                  </form>

                  {/* Feedback messages */}
                  {empSuccess && (
                    <div className="mt-3 flex items-center gap-2 px-4 py-3 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#D4AF37] text-sm font-bold">
                      <CheckCircle className="w-4 h-4 shrink-0" />
                      {empSuccess}
                    </div>
                  )}
                  {empError && (
                    <div className="mt-3 flex items-center gap-2 px-4 py-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {empError}
                    </div>
                  )}
                </div>

                {/* Employee List */}
                <div className="lg:col-span-7">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <h4 className="text-sm font-black text-(--industrial-text) uppercase tracking-widest">Current Employees</h4>

                    {/* Master Search Bar */}
                    <div className="relative flex-1 max-w-xs">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-3 w-3 text-(--industrial-text-muted)" />
                      </div>
                      <input
                        type="text"
                        placeholder="Search ID or Name..."
                        className="w-full pl-9 pr-4 py-1.5 rounded-xl border border-(--industrial-border) focus:ring-4 focus:ring-[#D4AF37]/10 focus:border-[#D4AF37]/40 transition-all duration-300 bg-(--industrial-text)/5 text-[10px] font-bold text-(--industrial-text) outline-none placeholder:text-(--industrial-text-muted)/50"
                        value={empSearchQuery}
                        onChange={(e) => setEmpSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="border border-(--industrial-border) rounded-2xl overflow-x-auto max-h-72 overflow-y-auto no-scrollbar">
                    <table className="min-w-full">
                      <thead className="sticky top-0 z-10 bg-(--industrial-card) border-b border-(--industrial-border)">
                        <tr>
                          <th className="px-5 py-3 text-left text-[10px] font-black text-(--industrial-text-muted) uppercase tracking-widest">ID</th>
                          <th className="pl-5 pr-2 py-3 text-left text-[10px] font-black text-(--industrial-text-muted) uppercase tracking-widest">Name</th>
                          <th className="pl-6 pr-5 py-3 text-left text-[10px] font-black text-(--industrial-text-muted) uppercase tracking-widest">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-(--industrial-border)">
                        {employees
                          .filter(emp =>
                            emp.id.toLowerCase().includes(empSearchQuery.toLowerCase()) ||
                            emp.name.toLowerCase().includes(empSearchQuery.toLowerCase())
                          )
                          .map(emp => {
                            const active = emp.isActive !== false; // treat NULL as active
                            return (
                              <tr key={emp.id} className={`hover:bg-[#D4AF37]/5 transition-colors ${!active ? 'opacity-50' : ''}`}>
                                <td className="px-5 py-3 whitespace-nowrap">
                                  <span className="text-xs font-black text-(--industrial-text-muted)">{emp.id}</span>
                                </td>
                                <td className="pl-5 pr-2 py-3 whitespace-nowrap">
                                  <span className="text-sm font-bold text-(--industrial-text)">{emp.name}</span>
                                </td>
                                <td className="pl-6 pr-5 py-3 whitespace-nowrap text-left">
                                  <button
                                    onClick={() => handleToggleEmployee(emp.id, emp.name, active)}
                                    className={`inline-flex items-center justify-start w-22 pl-3 py-1.5 rounded-full text-[9px] font-black border transition-all duration-300 ${active
                                      ? 'bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/20 hover:bg-[#D4AF37]/20'
                                      : 'bg-(--industrial-text)/5 text-(--industrial-text-muted) border-(--industrial-border) hover:bg-(--industrial-text)/10'
                                      }`}
                                    title={active ? 'Click to deactivate' : 'Click to activate'}
                                  >
                                    <span className="mr-2 leading-none text-[8px]">●</span>
                                    <span className="leading-none">{active ? 'ACTIVE' : 'INACTIVE'}</span>
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

        {/* ── Add Location Modal (Admin only) ── */}
        {isAdmin && showAddLocationModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-(--industrial-bg)/80 backdrop-blur-sm transition-opacity duration-300"
              onClick={() => setShowAddLocationModal(false)}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-md bg-(--industrial-card) border border-(--industrial-border) rounded-4xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
              {/* Header */}
              <div className="px-6 py-5 border-b border-(--industrial-border) bg-(--industrial-text)/5 flex items-center justify-between">
                <h3 className="text-lg font-black text-(--industrial-text) flex items-center">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-xl flex items-center justify-center mr-3">
                    <MapPin className="w-4 h-4 text-blue-400" />
                  </div>
                  Add New Location
                </h3>
                <button
                  onClick={() => setShowAddLocationModal(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-(--industrial-text)/5 text-(--industrial-text-muted) hover:text-(--industrial-text) transition-all duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                <form onSubmit={handleAddLocationSubmit} className="space-y-5">
                  {/* Visit Location */}
                  <div>
                    <label className="block text-[10px] font-black text-(--industrial-text-muted) uppercase tracking-widest mb-2 ml-1">New Visit Location</label>
                    <select
                      className="w-full px-4 py-2.5 rounded-xl border border-(--industrial-border) focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/40 transition-all duration-300 bg-(--industrial-text)/5 font-bold text-xs text-(--industrial-text) cursor-pointer outline-none appearance-none"
                      value={addVisitLocation}
                      onChange={(e) => setAddVisitLocation(e.target.value)}
                      required
                    >
                      <option value="" disabled className="bg-(--industrial-card) text-(--industrial-text)">Select new location</option>
                      {LOCATIONS.map(loc => <option key={loc} value={loc} className="bg-(--industrial-card) text-(--industrial-text)">{loc}</option>)}
                    </select>
                    {addVisitLocation === 'Others' && (
                      <input
                        type="text"
                        className="mt-2 w-full px-4 py-2.5 rounded-xl border border-(--industrial-border) focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/40 transition-all duration-300 bg-(--industrial-text)/5 font-bold text-xs text-(--industrial-text) outline-none"
                        placeholder="Enter custom location"
                        value={addCustomLocation}
                        onChange={(e) => setAddCustomLocation(e.target.value)}
                        required
                      />
                    )}
                  </div>

                  {/* Purpose */}
                  <div>
                    <label className="block text-[10px] font-black text-(--industrial-text-muted) uppercase tracking-widest mb-2 ml-1">New Purpose</label>
                    <textarea
                      className="w-full px-4 py-2.5 rounded-xl border border-(--industrial-border) focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/40 transition-all duration-300 bg-(--industrial-text)/5 font-bold text-xs text-(--industrial-text) resize-none outline-none"
                      placeholder="Reason for new location..."
                      rows="3"
                      value={addPurpose}
                      onChange={(e) => setAddPurpose(e.target.value)}
                      required
                    />
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    className="w-full flex justify-center items-center py-3 px-6 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-xs font-black transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg shadow-blue-500/30"
                  >
                    <MapPin className="w-5 h-5 mr-2.5" />
                    Add to Route
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
