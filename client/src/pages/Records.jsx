import React, { useState, useEffect, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, History, Trash2, MapPin, MessageSquare, Search, Shield, Sparkles, LogOut, ChevronLeft, Calendar, X, FileDown, Sun, Moon, ChevronDown, ChevronUp } from 'lucide-react';
import { usePagination, Pagination } from '../utils';
import * as XLSX from 'xlsx';

import ConfirmModal from '../components/ConfirmModal';

export default function Records() {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [user, setUser] = useState(null);

  // Confirmation Modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    confirmVariant: 'danger',
    onConfirm: () => {},
  });
  const [searchName, setSearchName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [expandedRecords, setExpandedRecords] = useState({});
  
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

  const toggleTimeline = (id) => {
    setExpandedRecords(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  useEffect(() => {
    const userData = sessionStorage.getItem('currentUser') || localStorage.getItem('currentUser');

    let currentUser;
    if (!userData) {
      currentUser = { username: 'Public User', role: 'public' };
      setUser(currentUser);
    } else {
      currentUser = JSON.parse(userData);
      setUser(currentUser);
    }

    fetchRecords(currentUser);

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchRecords(currentUser);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchRecords = async (currentUser) => {
    try {
      const response = await fetch(`/api/movements?role=${currentUser.role}&username=${currentUser.username}`);
      const data = await response.json();
      setRecords(data);
    } catch (err) {
      console.error('Failed to fetch records:', err);
    }
  };

  const handleDeleteRecord = (id) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete History Record',
      message: 'Are you sure you want to delete this movement record permanently?',
      confirmText: 'Delete Record',
      confirmVariant: 'danger',
      onConfirm: () => executeDeleteRecord(id),
    });
  };

  const executeDeleteRecord = async (id) => {
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
    try {
      const response = await fetch(`/api/movements/${id}`, { method: 'DELETE' });
      if (response.ok) fetchRecords(user);
    } catch (err) {
      console.error('Failed to delete record:', err);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('currentUser');
    sessionStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');

    window.location.href = '/';
  };

  const getRecordTimeline = (record) => {
    let timeline = record.timeline;
    if (typeof timeline === 'string') {
      try {
        timeline = JSON.parse(timeline);
      } catch (e) {
        timeline = null;
      }
    }

    if (Array.isArray(timeline) && timeline.length > 0) {
      return timeline;
    }

    if (record.visitLocation) {
      const locationsArr = record.visitLocation.split('->').map(s => s.trim());
      const purposesArr = record.purpose ? record.purpose.split('|').map(s => s.trim()) : [];
      return locationsArr.map((loc, idx) => ({
        location: loc,
        purpose: purposesArr[idx] || record.purpose || '-',
        timestamp: record.outTime
      }));
    }

    return [];
  };

  const handleExportExcel = () => {
    // Prepare single-sheet data with full multi-assignment tracking details
    const exportData = historyRecords.map(record => {
      const timelineItems = getRecordTimeline(record);
      const totalAssignments = timelineItems.length || 1;

      const timelineStr = timelineItems.map((item, idx) =>
        `[Assignment ${idx + 1}] Location: ${item.location || '-'} | Purpose: ${item.purpose || '-'} | Logged: ${formatTime(item.timestamp)}`
      ).join('  -->  ');

      const baseRow = {
        'Employee Name': record.employeeName,
        'Informed To': record.informTo,
        'Department/Location': record.employeeDepartment || '-',
        'Out Date': new Date(record.outTime).toLocaleDateString(),
        'Out Time': formatTime(record.outTime),
        'Return Date': record.returnTime ? new Date(record.returnTime).toLocaleDateString() : '-',
        'Return Time': formatTime(record.returnTime),
        'Total Duration (TAT)': calculateTAT(record.outTime, record.returnTime),
        'Total Assignments': totalAssignments,
        'All Destinations': record.visitLocation || '-',
        'All Purposes': record.purpose || '-',
        'Timeline Breakdown': timelineStr
      };

      // Add individual assignment columns for granular analysis
      timelineItems.forEach((item, idx) => {
        baseRow[`Assignment ${idx + 1} Location`] = item.location || '-';
        baseRow[`Assignment ${idx + 1} Purpose`] = item.purpose || '-';
        baseRow[`Assignment ${idx + 1} Time`] = formatTime(item.timestamp);
      });

      return baseRow;
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Movements");

    // Generate filename with current date
    const filename = `KIMS_Movements_Archive_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(workbook, filename);
  };

  const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';

  const historyRecords = records
    .filter(r => r.returnTime !== null)
    .filter(r => {
      // Location filter (except SUPER_ADMIN sees all)
      if (isAdmin && user?.role !== 'SUPER_ADMIN') {
        if (r.employeeDepartment !== selectedLocation) return false;
      } else if (!isAdmin) {
        if (r.employeeDepartment !== selectedLocation) return false;
      }
      // Date Range filter
      if (startDate || endDate) {
        const recordDate = new Date(r.outTime).toISOString().slice(0, 10);
        if (startDate && recordDate < startDate) return false;
        if (endDate && recordDate > endDate) return false;
      }
      // Name search filter
      const q = searchName.trim().toLowerCase();
      if (!q) return true;
      const nameMatch = r.employeeName && r.employeeName.toLowerCase().includes(q);
      const informMatch = r.informTo && r.informTo.toLowerCase().includes(q);
      return nameMatch || informMatch;
    })
    .sort((a, b) => new Date(b.outTime) - new Date(a.outTime));

  const {
    paginatedData: paginatedHistoryRecords,
    paginationInfo: historyPaginationInfo,
    goToPage: goToHistoryPage
  } = usePagination(historyRecords, 10);

  if (!user) return null;

  const formatTime = (isoString) => {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const calculateTAT = (outTime, returnTime) => {
    if (!outTime || !returnTime) return '-';
    const duration = new Date(returnTime) - new Date(outTime);
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours === 0) return `${minutes}m`;
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="min-h-screen bg-[var(--industrial-bg)] transition-colors duration-500 pb-20">
      {/* ── Navigation ── */}
      <nav className="bg-[var(--industrial-card)]/80 backdrop-blur-xl sticky top-0 z-30 border-b border-[var(--industrial-border)] shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/')}
                className="p-2 rounded-xl bg-[var(--industrial-text)]/5 hover:bg-[var(--industrial-text)]/10 text-[var(--industrial-text)] mr-4 transition-all duration-300 border border-[var(--industrial-border)]"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center">
                <div className="p-2 rounded-xl gold-gradient gold-glow mr-3">
                  <History className="w-5 h-5 text-[#0B0F19]" />
                </div>
                <div>
                  <h1 className="text-xl font-black text-[var(--industrial-text)] tracking-tight leading-none">Archive</h1>
                  <p className="text-[10px] font-black text-[var(--industrial-text-muted)] uppercase tracking-[0.15em] mt-1.5">Historical Data</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="flex items-center justify-center p-2 rounded-xl bg-[var(--industrial-text)]/5 hover:bg-[var(--industrial-text)]/10 text-[var(--industrial-text-muted)] hover:text-[var(--industrial-text)] transition-all duration-300 border border-[var(--industrial-border)] shadow-sm"
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-[#D4AF37] hover:rotate-45 transition-transform duration-300" />
                ) : (
                  <Moon className="w-4 h-4 text-[#D4AF37] hover:-rotate-12 transition-transform duration-300" />
                )}
              </button>

              <button
                onClick={handleExportExcel}
                className="flex items-center bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 text-[#D4AF37] transition-all duration-300 px-4 py-2 rounded-xl text-xs font-black border border-[#D4AF37]/20 shadow-lg"
              >
                <FileDown className="w-4 h-4 mr-2" />
                Export Excel
              </button>
              {isAdmin && (
                <button
                  onClick={handleLogout}
                  className="flex items-center text-[var(--industrial-text-muted)] hover:text-red-500 transition-all duration-300 p-2.5 rounded-xl text-xs font-bold hover:bg-red-500/10"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ── Location Selector ── */}
      <div className="bg-[var(--industrial-card)]/50 backdrop-blur-sm border-b border-[var(--industrial-border)] sticky top-16 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-3">
            <MapPin className="w-4 h-4 text-[#D4AF37]" />
            <label className="text-xs font-black text-[var(--industrial-text-muted)] uppercase tracking-widest">Location:</label>
            <div className="flex space-x-2">
              {locations.map(loc => (
                <button
                  key={loc}
                  onClick={() => handleLocationChange(loc)}
                  className={`px-4 py-2 rounded-lg font-bold text-xs transition-all duration-300 ${
                    selectedLocation === loc
                      ? 'bg-[#D4AF37] text-[#0B0F19] shadow-lg shadow-amber-500/30'
                      : 'bg-[var(--industrial-text)]/5 text-[var(--industrial-text-muted)] hover:bg-[var(--industrial-text)]/10 border border-[var(--industrial-border)]'
                  }`}
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-black text-[var(--industrial-text)] tracking-tight">Movement Archive</h2>
          <p className="text-[var(--industrial-text-muted)] font-bold mt-1 text-sm flex items-center">
            Review and track all past personnel movements and multi-assignment details.
          </p>
        </div>

        <div className="bg-[var(--industrial-card)] rounded-[2.5rem] shadow-2xl border border-[var(--industrial-border)] overflow-hidden">
          {/* Header */}
          <div className="px-6 py-6 border-b border-[var(--industrial-border)] bg-[var(--industrial-text)]/5">
            <h3 className="text-[10px] font-black text-[var(--industrial-text-muted)] uppercase tracking-[0.2em] flex items-center">
              <div className="w-5 h-5 bg-[#D4AF37]/10 rounded flex items-center justify-center mr-2.5">
                <Search className="w-2.5 h-2.5 text-[#D4AF37]" />
              </div>
              Filter Archive
              <span className="ml-2.5 px-2 py-0.5 bg-[#D4AF37]/10 text-[#D4AF37] text-[9px] font-black rounded-lg border border-[#D4AF37]/20">
                {historyRecords.length} records
              </span>
            </h3>
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 mt-5">
              {/* Search bar */}
              <div className="relative flex-1 md:w-72">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Search className="h-3.5 w-3.5 text-[var(--industrial-text-muted)]" />
                </div>
                <input
                  type="text"
                  placeholder="Search name or manager..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--industrial-border)] focus:ring-4 focus:ring-[#D4AF37]/10 focus:border-[#D4AF37]/40 transition-all duration-300 bg-[var(--industrial-text)]/5 text-xs font-bold text-[var(--industrial-text)] outline-none placeholder:text-[var(--industrial-text-muted)]/50"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                />
              </div>

              {/* Start Date filter */}
              <div className="relative md:w-44">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Calendar className="h-3.5 w-3.5 text-[var(--industrial-text-muted)]" />
                </div>
                <input
                  type="date"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--industrial-border)] focus:ring-4 focus:ring-[#D4AF37]/10 focus:border-[#D4AF37]/40 transition-all duration-300 bg-[var(--industrial-text)]/5 text-[10px] font-black text-[var(--industrial-text)] outline-none cursor-pointer uppercase"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  title="Start Date"
                />
              </div>

              <div className="hidden md:block text-[var(--industrial-text-muted)]/50 font-black">→</div>

              {/* End Date filter */}
              <div className="relative md:w-44">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Calendar className="h-3.5 w-3.5 text-[var(--industrial-text-muted)]" />
                </div>
                <input
                  type="date"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--industrial-border)] focus:ring-4 focus:ring-[#D4AF37]/10 focus:border-[#D4AF37]/40 transition-all duration-300 bg-[var(--industrial-text)]/5 text-[10px] font-black text-[var(--industrial-text)] outline-none cursor-pointer uppercase"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  title="End Date"
                />
              </div>

              {/* Clear Filter */}
              {(searchName || startDate || endDate) && (
                <button
                  onClick={() => {
                    setSearchName('');
                    setStartDate('');
                    setEndDate('');
                  }}
                  className="flex items-center justify-center p-2.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors duration-300 border border-red-500/20"
                  title="Clear Filters"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="p-0 overflow-x-auto no-scrollbar">
            <table className="min-w-full">
              <thead>
                <tr className="bg-[var(--industrial-text)]/5">
                  <th className="px-6 py-4 text-left text-[9px] font-black text-[var(--industrial-text-muted)] uppercase tracking-widest">Person</th>
                  <th className="px-6 py-4 text-left text-[9px] font-black text-[var(--industrial-text-muted)] uppercase tracking-widest">Time Window</th>
                  <th className="px-6 py-4 text-left text-[9px] font-black text-[var(--industrial-text-muted)] uppercase tracking-widest">TAT</th>
                  <th className="px-6 py-4 text-left text-[9px] font-black text-[var(--industrial-text-muted)] uppercase tracking-widest">Assignments</th>
                  <th className="px-6 py-4 text-left text-[9px] font-black text-[var(--industrial-text-muted)] uppercase tracking-widest">Destination & Purpose</th>
                  {isAdmin && <th className="px-6 py-4 text-right text-[9px] font-black text-[var(--industrial-text-muted)] uppercase tracking-widest">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--industrial-border)]">
                {historyRecords.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? 6 : 5} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 bg-[var(--industrial-text)]/5 rounded-full flex items-center justify-center mb-3">
                          <Search className="w-6 h-6 text-[var(--industrial-text-muted)]" />
                        </div>
                        <p className="text-[var(--industrial-text-muted)] font-bold text-xs">{searchName ? 'No matching records found.' : 'No completed movements yet.'}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedHistoryRecords.map((record) => {
                    const timelineItems = getRecordTimeline(record);
                    const isMultiAssignment = timelineItems.length > 1;
                    const isExpanded = expandedRecords[record.id];

                    return (
                      <Fragment key={record.id}>
                        <tr className="hover:bg-[#D4AF37]/5 transition-colors group">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col">
                              <span className="text-xs font-black text-[var(--industrial-text)]">{record.employeeName}</span>
                              <span className="text-[10px] font-bold text-[var(--industrial-text-muted)] flex items-center mt-0.5">
                                <MessageSquare className="w-2.5 h-2.5 mr-1 opacity-50" />
                                {record.informTo}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2.5">
                              <span className="text-[10px] font-black text-red-500 bg-red-500/10 border border-red-500/20 px-2 py-1 rounded-lg">{formatTime(record.outTime)}</span>
                              <span className="text-[var(--industrial-text-muted)]/50 font-bold">→</span>
                              <span className="text-[10px] font-black text-[#D4AF37] bg-[#D4AF37]/10 border border-[#D4AF37]/20 px-2 py-1 rounded-lg">{formatTime(record.returnTime)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2 py-1 rounded-lg text-[10px] font-black bg-blue-500/10 text-blue-400 border border-blue-500/20">
                              <Clock className="w-2.5 h-2.5 mr-1.5" />
                              {calculateTAT(record.outTime, record.returnTime)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => toggleTimeline(record.id)}
                              className={`flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black transition-all duration-200 border ${
                                isMultiAssignment
                                  ? 'bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/40 hover:bg-[#D4AF37]/30 shadow-sm'
                                  : 'bg-[var(--industrial-text)]/5 text-[var(--industrial-text-muted)] border-[var(--industrial-border)] hover:bg-[var(--industrial-text)]/10'
                              }`}
                            >
                              <span className="mr-1.5">{timelineItems.length} {timelineItems.length === 1 ? 'Assignment' : 'Assignments'}</span>
                              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>
                          </td>
                          <td className="px-6 py-4 text-xs text-[var(--industrial-text-muted)] max-w-[220px]">
                            <div className="flex flex-col">
                              <span className="font-bold text-[var(--industrial-text)] truncate" title={record.visitLocation}>{record.visitLocation || '-'}</span>
                              <span className="font-medium text-[10px] text-[var(--industrial-text-muted)] truncate mt-0.5" title={record.purpose}>{record.purpose}</span>
                            </div>
                          </td>
                          {isAdmin && (
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <button
                                onClick={() => handleDeleteRecord(record.id)}
                                className="text-[var(--industrial-text-muted)]/60 hover:text-red-500 transition-all duration-300 p-2 rounded-xl hover:bg-red-500/10 md:opacity-0 group-hover:opacity-100"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          )}
                        </tr>

                        {/* Expandable Timeline Detailed Track Record */}
                        {isExpanded && (
                          <tr className="bg-[var(--industrial-text)]/[0.02]">
                            <td colSpan={isAdmin ? 6 : 5} className="px-6 py-4 bg-[#D4AF37]/[0.02] border-y border-[var(--industrial-border)]">
                              <div className="pl-4 pr-2 py-2">
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest flex items-center">
                                    <Sparkles className="w-3 h-3 mr-1.5 text-[#D4AF37]" />
                                    Assignment Track Record ({timelineItems.length} Steps)
                                  </h4>
                                </div>
                                <div className="relative pl-6 space-y-4">
                                  {/* Vertical Line */}
                                  <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-[var(--industrial-border)]"></div>
                                  
                                  {timelineItems.map((item, idx) => (
                                    <div key={idx} className="relative flex items-start justify-between">
                                      {/* Dot */}
                                      <div className="absolute -left-5.5 top-1 w-2.5 h-2.5 rounded-full border-2 border-[#D4AF37] bg-[var(--industrial-card)]"></div>
                                      
                                      <div className="flex-1 pr-4">
                                        <p className="text-xs font-black text-[var(--industrial-text)]">
                                          <span className="text-[#D4AF37] mr-2">Assignment {idx + 1}</span>
                                          — Destination: <span className="text-[var(--industrial-text)]">{item.location}</span>
                                        </p>
                                        <p className="text-[11px] font-medium text-[var(--industrial-text-muted)] mt-0.5 italic">
                                          "{item.purpose}"
                                        </p>
                                      </div>
                                      <div className="text-[10px] font-bold text-[var(--industrial-text-muted)] bg-[var(--industrial-text)]/5 px-2.5 py-1 rounded-lg border border-[var(--industrial-border)]">
                                        Logged: {formatTime(item.timestamp)}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <Pagination 
            {...historyPaginationInfo} 
            onPageChange={goToHistoryPage} 
          />
        </div>
      </main>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        confirmVariant={confirmModal.confirmVariant}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}

