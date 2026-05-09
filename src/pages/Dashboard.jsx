import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Clock, User, Info, FileText, CheckCircle, History, Trash2, MapPin, MessageSquare, Search, Building2 } from 'lucide-react';


const DEFAULT_EMPLOYEES = [
  "SK. SAKIL",
  "LONALISA BADAJENA",
  "ASHABARI DHAL",
  "BIKKU KUMAR",
  "MUKUL PATTNAIK",
  "MANASWINI BEHERA",
  "SANDEEP SAHOO",
  "PRATIK RAY",
  "SATYAJEET SAHOO",
  "RAJESH OJHA",
  "DEBAKANTA DAS",
  "GYANADEEP BARIK",
  "SUNIL KUMAR BARIK",
  "ANMOL NAYAK",
  "BIJAY KUMAR MAHARANA",
  "PANKAJ KUMAR DASH",
  "ABINASH DAS",
  "RANJIT SINGH PURTY",
  "SANJAY KUMAR SAHOO",
  "SUNITA ROUT",
  "GOPABANDHU BEHERA",
  "RAJEEB LOCHAN MISHRA",
  "RITWIK NANDY",
  "SANTOSH KUMAR ROUT",
  "LABONI PRATIHAR",
  "DIPTIRANJAN NAYAK",
  "BABUL PATRA",
  "SUCHISMITA DASH",
  "MITALI MADHUSMITA SAHOO",
  "SOUMYARANJAN DAS",
  "SANTOSH KUMAR SAHOO",
  "RIKON KUMAR PARIDA",
  "SIDHANTA BARIK",
  "ANANYA MAHAPATRA",
  "MD. DANISH ALAM",
  "TAPASWINI OJHA",
  "PRITIPUSPA BARIK",
  "JYOTIRANJAN NAYAK",
  "AMLAN NANDA",
  "BIJAYAKETAN SAHOO"
].sort((a, b) => a.localeCompare(b));

const MANAGERS = [
  "MANASWINI BEHERA",
  "ANMOL NAYAK",
  "LABONI PRATIHAR",
  "SK SAKIL",
  "SOUMYARANJAN DAS",
  "SATYAJIT SAHOO",
  "ASHABARI DHAL"
].sort((a, b) => a.localeCompare(b));

const LOCATIONS = [
  "Admin",
  "Meeting",
  "Refreshment",
  "Ward Visit",
  "EMR",
  "A Block",
  "B Block",
  "C Block",
  "D Block",
  "E Block",
  "Main Building",
  "Lab Visit",
  "Bank Work",
  "Personal",
  "Others"
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  
  // Form State
  const [employeeName, setEmployeeName] = useState('');
  const [informTo, setInformTo] = useState('');
  const [customInformTo, setCustomInformTo] = useState('');
  const [visitLocation, setVisitLocation] = useState('');
  const [customLocation, setCustomLocation] = useState('');
  const [purpose, setPurpose] = useState('');


  // Search/Filter State (searches employee name and whom to inform)
  const [searchName, setSearchName] = useState('');

  useEffect(() => {
    const isAuth = localStorage.getItem('isAdminLoggedIn');
    if (!isAuth) {
      navigate('/login');
    }

    const storedRecords = localStorage.getItem('employeeMovementRecords');
    if (storedRecords) {
      setRecords(JSON.parse(storedRecords));
    }
  }, [navigate]);

  const saveRecords = (newRecords) => {
    setRecords(newRecords);
    localStorage.setItem('employeeMovementRecords', JSON.stringify(newRecords));
  };

  const handleGoOut = (e) => {
    e.preventDefault();
    if (!employeeName || !informTo || !purpose) return;

    const newRecord = {
      id: Date.now().toString(),
      employeeName,
      outTime: new Date().toISOString(),
      returnTime: null,
      informTo: informTo === 'Others' ? customInformTo : informTo,
      visitLocation: visitLocation === 'Others' ? customLocation : visitLocation,
      purpose,
      date: new Date().toLocaleDateString()
    };

    saveRecords([newRecord, ...records]);
    setEmployeeName('');
    setInformTo('');
    setCustomInformTo('');
    setVisitLocation('');
    setCustomLocation('');
    setPurpose('');

  };

  const handleReturn = (id) => {
    const updatedRecords = records.map(record => {
      if (record.id === id) {
        return { ...record, returnTime: new Date().toISOString() };
      }
      return record;
    });
    saveRecords(updatedRecords);
  };

  const handleDeleteRecord = (id) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      const updatedRecords = records.filter(record => record.id !== id);
      saveRecords(updatedRecords);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isAdminLoggedIn');
    navigate('/login');
  };

  // Active records (currently outside)
  const activeRecords = records.filter(r => !r.returnTime);
  
  // History records (filtered by search if provided). Search matches employee name OR whom to inform.
  const historyRecords = records
    .filter(r => r.returnTime !== null)
    .filter(r => {
      const q = searchName.trim().toLowerCase();
      if (!q) return true;
      const nameMatch = r.employeeName && r.employeeName.toLowerCase().includes(q);
      const informMatch = r.informTo && r.informTo.toLowerCase().includes(q);
      return nameMatch || informMatch;
    })
    .sort((a, b) => a.employeeName.localeCompare(b.employeeName));

  const formatTime = (isoString) => {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-indigo-600 mr-3" />
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Movement Register</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLogout}
                className="flex items-center text-gray-500 hover:text-red-600 transition-all duration-200 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-red-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>

          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Form Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-xl shadow-indigo-100 border border-gray-100 overflow-hidden sticky top-8">
              <div className="px-6 py-6 border-b border-gray-100 bg-gradient-to-br from-indigo-50/50 to-white">
                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                    <User className="w-5 h-5 text-indigo-600" />
                  </div>
                  New Entry
                </h3>
              </div>

              <div className="p-6">
                <form onSubmit={handleGoOut} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Employee Name</label>
                    <select
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white"
                      value={employeeName}
                      onChange={(e) => setEmployeeName(e.target.value)}
                      required
                    >
                      <option value="" disabled>Select an employee</option>
                      {DEFAULT_EMPLOYEES.map(emp => (
                        <option key={emp} value={emp}>{emp}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Whom to Inform</label>
                    <select
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white"
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
                        className="mt-2 w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white animate-in fade-in slide-in-from-top-1 duration-200"
                        placeholder="Write the Name"
                        value={customInformTo}
                        onChange={(e) => setCustomInformTo(e.target.value)}
                        required
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Visit Location</label>
                    <select
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white"
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
                        className="mt-2 w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white animate-in fade-in slide-in-from-top-1 duration-200"
                        placeholder="Type the custom location name"
                        value={customLocation}
                        onChange={(e) => setCustomLocation(e.target.value)}
                        required
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
                    <textarea
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      placeholder="Reason for leaving"
                      rows="2"
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      required
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-indigo-200 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    Record Movement
                  </button>

                </form>
              </div>
            </div>
          </div>

          {/* Records Section */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Currently Out */}
            <div className="bg-white rounded-3xl shadow-xl shadow-orange-50 border border-gray-100 overflow-hidden">
              <div className="px-6 py-6 border-b border-gray-100 bg-gradient-to-br from-orange-50/50 to-white">
                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                    <Info className="w-5 h-5 text-orange-600" />
                  </div>
                  Currently Outside
                </h3>
              </div>

              <div className="p-0">
                {activeRecords.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    No employees currently outside.
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {activeRecords.map(record => (
                      <li key={record.id} className="p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="text-lg font-bold text-gray-900">{record.employeeName}</h4>
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700 border border-orange-200">
                                <Clock className="w-3 h-3 mr-1" />
                                Out Since {formatTime(record.outTime)}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                              <div className="flex items-center">
                                <MessageSquare className="w-4 h-4 mr-2 text-gray-400" />
                                <span className="font-semibold text-gray-500 mr-2">Inform:</span> {record.informTo}
                              </div>
                              <div className="flex items-center">
                                <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                                <span className="font-semibold text-gray-500 mr-2">Location:</span> {record.visitLocation}
                              </div>
                              <div className="flex items-start sm:col-span-2">
                                <FileText className="w-4 h-4 mr-2 text-gray-400 mt-0.5" />
                                <span className="font-semibold text-gray-500 mr-2">Purpose:</span> {record.purpose}
                              </div>
                            </div>


                          </div>
                          <div className="ml-6">
                            <button
                              onClick={() => handleReturn(record.id)}
                              className="flex items-center py-2.5 px-5 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-100 transition-all duration-200"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Mark Return
                            </button>

                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* History / Previous Records */}
            <div className="bg-white rounded-3xl shadow-xl shadow-blue-50 border border-gray-100 overflow-hidden">
              <div className="px-6 py-6 border-b border-gray-100 bg-gradient-to-br from-blue-50/50 to-white flex flex-col md:flex-row justify-between items-center gap-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <History className="w-5 h-5 text-blue-600" />
                  </div>
                  Past Records
                </h3>
                <div className="relative w-full md:w-80">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search employee or whom to inform..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all duration-200 text-sm bg-gray-50/50 focus:bg-white"
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                  />
                </div>
              </div>

              <div className="p-0 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Employee Details</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Time (Out/In)</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Location</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Purpose</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {historyRecords.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-12 text-center text-gray-400">
                          <div className="flex flex-col items-center">
                            <Search className="w-10 h-10 mb-2 opacity-20" />
                            <p className="text-sm">{searchName ? 'No matching records found.' : 'No past records available.'}</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      historyRecords.map((record) => (
                        <tr key={record.id} className="hover:bg-blue-50/30 transition-colors group">
                          <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-500 font-medium">{formatDate(record.date)}</td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-gray-900">{record.employeeName}</span>
                              <span className="text-xs text-gray-500 flex items-center mt-0.5">
                                <MessageSquare className="w-3 h-3 mr-1 opacity-60" />
                                {record.informTo}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded-lg">{formatTime(record.outTime)}</span>
                              <span className="text-gray-300">→</span>
                              <span className="text-sm text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-lg">{formatTime(record.returnTime)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 text-gray-700">
                              <MapPin className="w-3 h-3 mr-1 opacity-60" />
                              {record.visitLocation || '-'}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-sm text-gray-600 max-w-xs">
                            <p className="truncate" title={record.purpose}>{record.purpose}</p>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleDeleteRecord(record.id)}
                              className="text-gray-400 hover:text-red-600 transition-all duration-200 p-2 rounded-xl hover:bg-red-50 opacity-0 group-hover:opacity-100"
                              title="Delete Record"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
