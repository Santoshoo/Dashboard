import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, History, Trash2, MapPin, MessageSquare, Search, Shield, Sparkles, LogOut, ChevronLeft, Calendar, X, FileDown } from 'lucide-react';
import { usePagination, Pagination } from '../utils';
import * as XLSX from 'xlsx';

export default function Records() {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [user, setUser] = useState(null);
  const [searchName, setSearchName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

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
      const response = await fetch(`http://localhost:5000/api/movements?role=${currentUser.role}&username=${currentUser.username}`);
      const data = await response.json();
      setRecords(data);
    } catch (err) {
      console.error('Failed to fetch records:', err);
    }
  };

  const handleDeleteRecord = async (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/movements/${id}`, { method: 'DELETE' });
        if (response.ok) fetchRecords(user);
      } catch (err) {
        console.error('Failed to delete record:', err);
      }
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('currentUser');
    sessionStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');

    window.location.href = '/';
  };

  const handleExportExcel = () => {
    // Prepare data for export
    const exportData = historyRecords.map(record => ({
      'Employee Name': record.employeeName,
      'Informed To': record.informTo,
      'Out Date': new Date(record.outTime).toLocaleDateString(),
      'Out Time': formatTime(record.outTime),
      'Return Date': new Date(record.returnTime).toLocaleDateString(),
      'Return Time': formatTime(record.returnTime),
      'Destination': record.visitLocation || '-',
      'Purpose': record.purpose
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Movements");

    // Generate filename with current date
    const filename = `KIMS_Movements_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(workbook, filename);
  };

  const isAdmin = user?.role === 'admin';

  const historyRecords = records
    .filter(r => r.returnTime !== null)
    .filter(r => {
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

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Navigation */}
      <nav className="bg-white/70 backdrop-blur-xl sticky top-0 z-50 border-b border-slate-200/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className={`p-2 rounded-xl shadow-lg mr-3 ${isAdmin ? 'bg-indigo-600 shadow-indigo-100' : 'bg-blue-600 shadow-blue-100'}`}>
                <History className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none">Movement Archive</h1>
                <div className="flex items-center mt-1.5">
                  <div className="relative flex h-2 w-2 mr-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">System Live</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/')}
                className="flex items-center bg-white hover:bg-slate-50 text-slate-700 transition-all duration-300 px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 shadow-sm"
              >
                <ChevronLeft className="w-3.5 h-3.5 mr-1.5" />
                Live Status
              </button>

              {isAdmin ? (
                <button
                  onClick={handleLogout}
                  className="flex items-center text-slate-500 hover:text-red-600 transition-all duration-300 p-2.5 md:px-5 md:py-2.5 rounded-2xl text-sm font-bold hover:bg-red-50 border border-transparent"
                >
                  <LogOut className="w-4 h-4 md:mr-2" />
                  <span className="hidden md:inline">Logout</span>
                </button>
              ) : (
                <button
                  onClick={() => navigate('/admin')}
                  className="flex items-center bg-slate-900 hover:bg-black text-white transition-all duration-300 px-5 py-2.5 rounded-2xl text-sm font-bold shadow-lg transform hover:-translate-y-0.5"
                >
                  <Shield className="w-4 h-4 mr-2 text-indigo-400" />
                  Admin
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Movement Archive</h2>
          <p className="text-slate-400 font-bold mt-1 text-sm flex items-center">
            Review and track all past personnel movements.
          </p>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-6 border-b border-slate-100 bg-slate-50/30">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center">
              <div className="w-5 h-5 bg-blue-100 rounded flex items-center justify-center mr-2.5">
                <Search className="w-2.5 h-2.5 text-blue-600" />
              </div>
              Filter Archive
              <span className="ml-2.5 px-2 py-0.5 bg-blue-50 text-blue-600 text-[9px] font-black rounded-lg border border-blue-100">
                {historyRecords.length} records
              </span>
            </h3>
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 mt-5">
              {/* Search bar */}
              <div className="relative flex-1 md:w-72">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Search className="h-3.5 w-3.5 text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search name or manager..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-300 text-xs font-bold outline-none"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                />
              </div>

              {/* Start Date filter */}
              <div className="relative md:w-44">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                </div>
                <input
                  type="date"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-300 text-[10px] font-black outline-none cursor-pointer uppercase"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  title="Start Date"
                />
              </div>

              <div className="hidden md:block text-slate-300 font-black">→</div>

              {/* End Date filter */}
              <div className="relative md:w-44">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                </div>
                <input
                  type="date"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-300 text-[10px] font-black outline-none cursor-pointer uppercase"
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
                  className="flex items-center justify-center p-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors duration-300 border border-red-100"
                  title="Clear Filters"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* Export Button */}
              <button
                onClick={handleExportExcel}
                className="flex items-center justify-center px-4 py-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-all duration-300 shadow-lg shadow-emerald-900/20 text-[10px] font-black uppercase tracking-wider"
              >
                <FileDown className="w-4 h-4 mr-2" />
                Export Excel
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="p-0 overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-slate-50/80">
                  <th className="px-6 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Person</th>
                  <th className="px-6 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Time Window</th>
                  <th className="px-6 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Destination</th>
                  <th className="px-6 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Purpose</th>
                  {isAdmin && <th className="px-6 py-4 text-right text-[9px] font-black text-slate-400 uppercase tracking-widest">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {historyRecords.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? 5 : 4} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                          <Search className="w-6 h-6 text-slate-200" />
                        </div>
                        <p className="text-slate-400 font-bold text-xs">{searchName ? 'No matching records found.' : 'No completed movements yet.'}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedHistoryRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-50/30 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-slate-900">{record.employeeName}</span>
                          <span className="text-[10px] font-bold text-slate-400 flex items-center mt-0.5">
                            <MessageSquare className="w-2.5 h-2.5 mr-1 opacity-50" />
                            {record.informTo}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2.5">
                          <span className="text-[10px] font-black text-red-600 bg-red-50 border border-red-100 px-2 py-1 rounded-lg">{formatTime(record.outTime)}</span>
                          <span className="text-slate-300 font-bold">→</span>
                          <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-lg">{formatTime(record.returnTime)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-1 rounded-lg text-[10px] font-black bg-slate-100 text-slate-600 border border-slate-200">
                          <MapPin className="w-2.5 h-2.5 mr-1 opacity-50" />
                          {record.visitLocation || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600 max-w-[180px]">
                        <p className="font-medium truncate text-slate-500" title={record.purpose}>{record.purpose}</p>
                      </td>
                      {isAdmin && (
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => handleDeleteRecord(record.id)}
                            className="text-slate-300 hover:text-red-600 transition-all duration-300 p-2 rounded-xl hover:bg-red-50 opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
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
    </div>
  );
}
