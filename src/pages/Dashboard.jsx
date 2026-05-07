import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Clock, User, Info, FileText, CheckCircle, History, Trash2 } from 'lucide-react';

const DEFAULT_EMPLOYEES = [
  "SK. SAKIL",
  "PRABODH CHANDRA PANDA",
  "LONALISA BADAJENA",
  "ASHABARI DHAL",
  "PRADEEP KUMAR SAHOO",
  "BIKKU KUMAR",
  "MUKUL PATTNAIK",
  "MANASWINI BEHERA",
  "SANDEEP SAHOO",
  "SUSANT KUMAR PRADHAN",
  "PRATIK RAY",
  "SATYAJEET SAHOO",
  "RAJESH OJHA",
  "DEBAKANTA DAS",
  "GYANADEEP BARIK",
  "SUNIL KUMAR BARIK",
  "ANMOL NAYAK",
  "BIJAY KUMAR MAHARANA",
  "DEBI PRASAD PANDA",
  "PANKAJ KUMAR DASH",
  "SUDHANSU BALA SWAIN",
  "ABINASH DAS",
  "RANJIT SINGH PURTY",
  "SANJAY KUMAR SAHOO",
  "SUNITA ROUT",
  "PAPU BEHERA",
  "GOPABANDHU BEHERA",
  "RAJEEB LOCHAN MISHRA",
  "SUDARSHAN CHATTERJEE",
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
  "DEBASHIS PRADHAN",
  "BIJAYAKETAN SAHOO"
];

const MANAGERS = [
  "MANASWINI BEHERA",
  "ANMOL NAYAK",
  "LABONI PRATIHAR",
  "SK SAKIL",
  "SOUMYARANJAN DAS",
  "SATYAJIT SAHOO",
  "ASHABARI DHAL"
];
export default function Dashboard() {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  
  // Form State
  const [employeeName, setEmployeeName] = useState('');
  const [informTo, setInformTo] = useState('');
  const [purpose, setPurpose] = useState('');

  // Search/Filter State
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
      informTo,
      purpose,
      date: new Date().toLocaleDateString()
    };

    saveRecords([newRecord, ...records]);
    setEmployeeName('');
    setInformTo('');
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
  
  // History records (filtered by search if provided)
  const historyRecords = records.filter(r => {
    const isReturned = r.returnTime !== null;
    if (searchName) {
      return isReturned && r.employeeName.toLowerCase().includes(searchName.toLowerCase());
    }
    return isReturned;
  });

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
              <h1 className="text-xl font-bold text-gray-900">Movement Register Dashboard</h1>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="flex items-center text-gray-600 hover:text-red-600 transition-colors px-3 py-2 rounded-md text-sm font-medium"
              >
                <LogOut className="w-5 h-5 mr-2" />
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
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-white">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <User className="w-5 h-5 mr-2 text-indigo-600" />
                  New Entry (Going Out)
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
                      {DEFAULT_EMPLOYEES.map(emp => <option key={emp} value={emp}>{emp}</option>)}
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
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
                    <textarea
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      placeholder="Reason for leaving"
                      rows="3"
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      required
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    Record Time Out
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Records Section */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Currently Out */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-white">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <Info className="w-5 h-5 mr-2 text-orange-500" />
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
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-md font-bold text-gray-900">{record.employeeName}</h4>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                Out Since {formatTime(record.outTime)}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600 grid grid-cols-2 gap-2">
                              <p><span className="font-medium text-gray-500">Inform:</span> {record.informTo}</p>
                              <p><span className="font-medium text-gray-500">Purpose:</span> {record.purpose}</p>
                            </div>
                          </div>
                          <div className="ml-6">
                            <button
                              onClick={() => handleReturn(record.id)}
                              className="flex items-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
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
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white flex flex-col sm:flex-row justify-between items-center gap-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <History className="w-5 h-5 mr-2 text-blue-600" />
                  Past Records
                </h3>
                <div className="relative w-full sm:w-64">
                  <input
                    type="text"
                    placeholder="Search employee..."
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                  />
                </div>
              </div>
              <div className="p-0 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Out Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Return Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purpose</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {historyRecords.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                          {searchName ? 'No matching records found.' : 'No past records available.'}
                        </td>
                      </tr>
                    ) : (
                      historyRecords.map((record) => (
                        <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatDate(record.date)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{record.employeeName}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">{formatTime(record.outTime)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">{formatTime(record.returnTime)}</td>
                          <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={record.purpose}>{record.purpose}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleDeleteRecord(record.id)}
                              className="text-red-500 hover:text-red-700 transition-colors p-1 rounded hover:bg-red-50"
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
