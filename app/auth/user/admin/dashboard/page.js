"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Dropdown from '../../../../components/Dropdown';
import { 
  Users, Code2, Flag, Search, Download, Eye, 
  Edit, Trash2, BarChart4, LogOut, Home, Shield,
  CheckCircle, XCircle, AlertCircle
} from 'lucide-react';

const toastConfig = {
  position: "bottom-right",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: "dark",
  style: {
    backgroundColor: '#1f2937',
    color: '#f3f4f6',
    borderRadius: '0.75rem',
    border: '1px solid rgba(75, 85, 99, 0.3)',
  },
};

// Add smooth transition config for motion
const transitionConfig = {
  type: "spring",
  stiffness: 100,
  damping: 15
};

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [creations, setCreations] = useState([]);
  const [reports, setReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState({
    users: 'all',
    creations: 'all',
    reports: 'all'
  });
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  
  const [stats, setStats] = useState({
    todayUsers: 0,
    totalViews: 0,
    pendingReports: 0,
    activeProjects: 0
  });

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [usersRes, creationsRes, reportsRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/creations'),
        fetch('/api/admin/reports')
      ]);

      if (!usersRes.ok || !creationsRes.ok || !reportsRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const [usersData, creationsData, reportsData] = await Promise.all([
        usersRes.json(),
        creationsRes.json(),
        reportsRes.json()
      ]);

      setUsers(usersData);
      setCreations(creationsData);
      setReports(reportsData);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      setStats({
        todayUsers: usersData.filter(u => new Date(u.createdAt) >= today).length,
        totalViews: creationsData.reduce((acc, curr) => acc + (curr.views || 0), 0),
        pendingReports: reportsData.filter(r => r.status === 'pending').length,
        activeProjects: creationsData.filter(c => c.privacy === 'public').length
      });

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filterOptions = {
    users: [
      { value: 'all', label: 'All Users' },
      { value: 'recent', label: 'Recently Joined' },
      { value: 'active', label: 'Most Active' }
    ],
    creations: [
      { value: 'all', label: 'All Projects' },
      { value: 'public', label: 'Public Only' },
      { value: 'private', label: 'Private Only' },
      { value: 'popular', label: 'Most Popular' }
    ],
    reports: [
      { value: 'all', label: 'All Reports' },
      { value: 'pending', label: 'Pending' },
      { value: 'in-progress', label: 'In Progress' },
      { value: 'resolved', label: 'Resolved' },
      { value: 'rejected', label: 'Rejected' }
    ]
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchTerm('');
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (value) => {
    setFilter({ ...filter, [activeTab]: value });
  };

  const getFilteredData = () => {
    let data = [];
    
    switch (activeTab) {
      case 'users':
        data = users.filter(user => 
          user.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        if (filter.users === 'recent') {
          data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else if (filter.users === 'active') {
          data.sort((a, b) => (b.creations?.length || 0) - (a.creations?.length || 0));
        }
        break;
        
      case 'creations':
        data = creations.filter(creation => 
          creation.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
          creation.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        if (filter.creations === 'public') {
          data = data.filter(creation => creation.privacy === 'public');
        } else if (filter.creations === 'private') {
          data = data.filter(creation => creation.privacy === 'private');
        } else if (filter.creations === 'popular') {
          data.sort((a, b) => (b.views || 0) - (a.views || 0));
        }
        break;
        
      case 'reports':
        data = reports.filter(report => 
          report.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
          report.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        if (filter.reports !== 'all') {
          data = data.filter(report => report.status === filter.reports);
        }
        break;
        
      default:
        break;
    }
    
    return data;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'in-progress':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'resolved':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'rejected':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getPrivacyColor = (privacy) => {
    switch (privacy) {
      case 'public':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'private':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'unlisted':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };

  const exportData = () => {
    let dataToExport;
    let fileName;
    
    switch (activeTab) {
      case 'users':
        dataToExport = users;
        fileName = 'users-export.json';
        break;
      case 'creations':
        dataToExport = creations;
        fileName = 'creations-export.json';
        break;
      case 'reports':
        dataToExport = reports;
        fileName = 'reports-export.json';
        break;
      default:
        return;
    }
    
    const jsonString = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const href = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = href;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    URL.revokeObjectURL(href);
  };

  const handleUserAction = async (action, user) => {
    try {
      switch (action) {
        case 'view':
          router.push(`/auth/user/${user._id}`);
          break;
        case 'edit':
          toast.info('Edit user functionality coming soon', toastConfig);
          break;
        case 'delete':
          if (window.confirm(`Are you sure you want to delete user ${user.username}?`)) {
            await fetch(`/api/admin/users/${user._id}`, { method: 'DELETE' });
            toast.success('User deleted successfully', toastConfig);
            fetchData();
          }
          break;
      }
    } catch (error) {
      toast.error('Action failed: ' + error.message, toastConfig);
    }
  };

  const handleCreationAction = async (action, creation) => {
    try {
      switch (action) {
        case 'view':
          router.push(`/creations/${creation._id}`);
          break;
        case 'delete':
          if (window.confirm(`Delete project "${creation.title}"?`)) {
            await fetch(`/api/admin/creations/${creation._id}`, { method: 'DELETE' });
            toast.success('Project deleted successfully', toastConfig);
            fetchData();
          }
          break;
      }
    } catch (error) {
      toast.error('Action failed', toastConfig);
    }
  };

  const handleReportAction = async (action, report) => {
    try {
      switch (action) {
        case 'resolve':
          await fetch('/api/admin/reports', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reportId: report._id, status: 'resolved' })
          });
          toast.success('Report marked as resolved', toastConfig);
          fetchData();
          break;
        case 'reject':
          await fetch('/api/admin/reports', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reportId: report._id, status: 'rejected' })
          });
          toast.success('Report rejected', toastConfig);
          fetchData();
          break;
      }
    } catch (error) {
      toast.error('Action failed', toastConfig);
    }
  };

  const renderTableHeader = (columns) => (
    <thead className="bg-[#1e2534]">
      <tr>
        {columns.map((col, i) => (
          <th key={i} className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
            {col}
          </th>
        ))}
      </tr>
    </thead>
  );

  // Update table styling
  const renderDataTable = (columns, data, renderRow) => (
    <div className="bg-[#1a1f2c]/50 rounded-lg border border-[#2a3241] overflow-hidden backdrop-blur-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[#2a3241]">
          {renderTableHeader(columns)}
          <tbody className="divide-y divide-[#2a3241]">
            {data.length > 0 ? data.map(renderRow) : (
              <tr>
                <td colSpan={columns.length} className="px-4 py-6 text-center text-gray-400">
                  {searchTerm ? 'No results found.' : 'No data available.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Update motion animations in table rows
  const tableRowAnimation = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { ...transitionConfig, delay: 0.1 }
  };

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <motion.div 
      whileHover={{ scale: 1.01, translateY: -2 }}
      transition={transitionConfig}
      className={`p-6 rounded-lg bg-[#1a1f2c]/50 border border-[#2a3241] hover:border-${color}-500/30 backdrop-blur-sm`}
    >
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-lg bg-${color}-500/10`}>
          <Icon className={`h-8 w-8 text-${color}-400`} />
        </div>
      </div>
    </motion.div>
  );

  const ActionButton = ({ icon: Icon, label, onClick, variant = "default" }) => {
    const variants = {
      default: "bg-[#1e2534] hover:bg-[#252b3b] text-gray-300",
      blue: "bg-blue-600/20 hover:bg-blue-500/30 text-blue-400",
      red: "bg-red-600/20 hover:bg-red-500/30 text-red-400",
      green: "bg-green-600/20 hover:bg-green-500/30 text-green-400"
    };

    return (
      <button
        onClick={onClick}
        title={label}
        className={`p-1.5 rounded-lg transition-colors ${variants[variant]}`}
      >
        <Icon className="h-4 w-4" />
      </button>
    );
  };

  const Sidebar = () => (
    <motion.div
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={transitionConfig}
      className="fixed left-0 top-0 h-screen w-64 bg-[#1a1f2c]/80 border-r border-[#2a3241] backdrop-blur-sm"
    >
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2.5 bg-blue-500/10 rounded-lg">
            <Shield className="h-6 w-6 text-blue-400" />
          </div>
          <span className="text-xl font-bold text-white">Admin Panel</span>
        </div>

        <nav className="space-y-2">
          {[
            { icon: Home, label: 'Overview', value: 'overview' },
            { icon: Users, label: 'Users', value: 'users' },
            { icon: Code2, label: 'Projects', value: 'creations' },
            { icon: Flag, label: 'Reports', value: 'reports' },
          ].map((item) => (
            <motion.button
              key={item.value}
              whileHover={{ x: 4 }}
              onClick={() => handleTabChange(item.value)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === item.value
                  ? 'bg-gray-700/70 text-white' 
                  : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
              }`}
            >
              <item.icon className={`h-5 w-5 ${
                activeTab === item.value ? 'text-blue-400' : 'text-gray-500'
              }`} />
              <span className="text-sm font-medium">{item.label}</span>
            </motion.button>
          ))}
        </nav>
      </div>

      <motion.button 
        whileHover={{ x: 4 }}
        className="absolute bottom-6 left-6 right-6 flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10"
        onClick={() => router.push('/auth/logout')}
      >
        <LogOut className="h-5 w-5" />
        <span className="text-sm font-medium">Logout</span>
      </motion.button>
    </motion.div>
  );

  const Toolbar = () => (
    <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
      <div className="flex-1 flex items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchTerm}
            onChange={handleSearch}
            className="w-full px-4 py-2 pl-10 bg-[#1a1f2c]/50 border border-[#2a3241] rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500/30 focus:border-[#2a3241]"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
        
        <Dropdown 
          options={filterOptions[activeTab]} 
          value={filter[activeTab]}
          onChange={handleFilterChange}
          placeholder="Filter"
        />
        
        <button
          onClick={exportData}
          className="px-4 py-2 bg-gray-800/30 border border-gray-700/50 rounded-lg text-gray-300 hover:bg-gray-700/50 flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Export</span>
        </button>
      </div>
    </div>
  );

  const renderUsersTab = () => {
    const filteredUsers = getFilteredData();
    
    return renderDataTable(
      ['User', 'Email', 'Joined', 'Projects', 'Actions'],
      filteredUsers,
      (user, index) => (
        <motion.tr
          key={user._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="border-b border-gray-800/50 hover:bg-gray-700/20 transition"
        >
          <td className="px-4 py-4 whitespace-nowrap">
            <div className="flex items-center space-x-3">
              {user.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.username} 
                  className="h-8 w-8 rounded-lg object-cover ring-2 ring-gray-700/50"
                />
              ) : (
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                  {user.username.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-white font-medium">{user.username}</span>
            </div>
          </td>
          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
            {user.email}
          </td>
          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
            {formatDate(user.createdAt)}
          </td>
          <td className="px-4 py-4 whitespace-nowrap">
            <span className="px-2.5 py-1 rounded-md bg-blue-500/20 text-blue-300 text-xs font-medium">
              {user.creations?.length || 0}
            </span>
          </td>
          <td className="px-4 py-4 whitespace-nowrap text-sm">
            <div className="flex space-x-2">
              <ActionButton 
                icon={Eye} 
                label="View Profile" 
                onClick={() => handleUserAction('view', user)} 
              />
              <ActionButton 
                icon={Edit} 
                label="Edit User" 
                onClick={() => handleUserAction('edit', user)} 
                variant="blue"
              />
              <ActionButton 
                icon={Trash2} 
                label="Delete User" 
                onClick={() => handleUserAction('delete', user)} 
                variant="red"
              />
            </div>
          </td>
        </motion.tr>
      )
    );
  };

  const renderCreationsTab = () => {
    const filteredCreations = getFilteredData();
    
    return renderDataTable(
      ['Title', 'Author', 'Created', 'Status', 'Views', 'Actions'],
      filteredCreations,
      (creation, index) => (
        <motion.tr
          key={creation._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="border-b border-gray-800/50 hover:bg-gray-700/20 transition"
        >
          <td className="px-4 py-4">
            <div className="flex items-center space-x-2">
              <Code2 className="h-5 w-5 text-blue-400 flex-shrink-0" />
              <span className="text-white font-medium text-sm">{creation.title}</span>
            </div>
          </td>
          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
            {creation.author}
          </td>
          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
            {formatDate(creation.createdAt)}
          </td>
          <td className="px-4 py-4 whitespace-nowrap">
            <span className={`px-2.5 py-1 rounded-md border text-xs font-medium ${getPrivacyColor(creation.privacy)}`}>
              {creation.privacy}
            </span>
          </td>
          <td className="px-4 py-4 whitespace-nowrap">
            <div className="flex items-center space-x-1">
              <BarChart4 className="h-4 w-4 text-gray-400" />
              <span className="text-gray-300 text-sm">{creation.views || 0}</span>
            </div>
          </td>
          <td className="px-4 py-4 whitespace-nowrap">
            <div className="flex space-x-2">
              <ActionButton 
                icon={Eye} 
                label="View Creation" 
                onClick={() => handleCreationAction('view', creation)} 
              />
              <ActionButton 
                icon={Edit} 
                label="Edit Creation" 
                variant="blue"
              />
              <ActionButton 
                icon={Trash2} 
                label="Delete Creation" 
                onClick={() => handleCreationAction('delete', creation)} 
                variant="red"
              />
            </div>
          </td>
        </motion.tr>
      )
    );
  };

  const renderReportsTab = () => {
    const filteredReports = getFilteredData();
    
    return renderDataTable(
      ['Report', 'Type', 'Submitted', 'Status', 'Priority', 'Actions'],
      filteredReports,
      (report, index) => (
        <motion.tr
          key={report._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="border-b border-gray-800/50 hover:bg-gray-700/20 transition"
        >
          <td className="px-4 py-4">
            <div className="flex flex-col">
              <span className="text-white font-medium text-sm">{report.title}</span>
              <span className="text-gray-400 text-xs truncate max-w-xs">{report.pageUrl}</span>
            </div>
          </td>
          <td className="px-4 py-4 whitespace-nowrap">
            <span className="px-2.5 py-1 rounded-md bg-indigo-500/20 text-indigo-300 text-xs font-medium">
              {report.type}
            </span>
          </td>
          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
            {formatDate(report.createdAt)}
          </td>
          <td className="px-4 py-4 whitespace-nowrap">
            <span className={`px-2.5 py-1 rounded-md border text-xs font-medium ${getStatusColor(report.status)}`}>
              {report.status}
            </span>
          </td>
          <td className="px-4 py-4 whitespace-nowrap">
            <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${
              report.priority === 'critical' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
              report.priority === 'high' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' :
              report.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
              'bg-green-500/20 text-green-300 border border-green-500/30'
            }`}>
              {report.priority}
            </span>
          </td>
          <td className="px-4 py-4 whitespace-nowrap">
            <div className="flex space-x-2">
              <ActionButton 
                icon={Eye} 
                label="View Report" 
              />
              <ActionButton 
                icon={CheckCircle} 
                label="Mark as Resolved" 
                onClick={() => handleReportAction('resolve', report)} 
                variant="green"
              />
              <ActionButton 
                icon={XCircle} 
                label="Reject Report" 
                onClick={() => handleReportAction('reject', report)} 
                variant="red"
              />
            </div>
          </td>
        </motion.tr>
      )
    );
  };

  const renderOverview = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="New Users Today" 
          value={stats.todayUsers} 
          icon={Users} 
          color="blue" 
        />
        <StatCard 
          title="Total Views" 
          value={stats.totalViews} 
          icon={BarChart4} 
          color="green" 
        />
        <StatCard 
          title="Pending Reports" 
          value={stats.pendingReports} 
          icon={AlertCircle} 
          color="yellow" 
        />
        <StatCard 
          title="Active Projects" 
          value={stats.activeProjects} 
          icon={Code2} 
          color="purple" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 rounded-2xl border border-gray-700/50 p-8"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-white">Recent Users</h3>
            <button 
              onClick={() => handleTabChange('users')}
              className="text-blue-400 hover:text-blue-300 text-sm font-medium"
            >
              View all
            </button>
          </div>
          <div className="space-y-6">
            {users.slice(0, 5).map(user => (
              <motion.div 
                key={user._id}
                whileHover={{ x: 5 }}
                className="flex items-center justify-between p-4 rounded-xl bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xl font-bold text-white">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-base font-medium text-white">{user.username}</p>
                    <p className="text-sm text-gray-400">{formatDate(user.createdAt)}</p>
                  </div>
                </div>
                <button 
                  onClick={() => router.push(`/auth/user/${user._id}`)}
                  className="p-2 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                >
                  <Eye className="h-5 w-5" />
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 rounded-2xl border border-gray-700/50 p-8"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-white">Latest Reports</h3>
            <button 
              onClick={() => handleTabChange('reports')}
              className="text-blue-400 hover:text-blue-300 text-sm font-medium"
            >
              View all
            </button>
          </div>
          <div className="space-y-6">
            {reports.slice(0, 5).map(report => (
              <motion.div 
                key={report._id}
                whileHover={{ x: 5 }}
                className="flex items-center justify-between p-4 rounded-xl bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
              >
                <div>
                  <p className="text-base font-medium text-white">{report.title}</p>
                  <p className="text-sm text-gray-400">{formatDate(report.createdAt)}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${getStatusColor(report.status)}`}>
                  {report.status}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'users':
        return renderUsersTab();
      case 'creations':
        return renderCreationsTab();
      case 'reports':
        return renderReportsTab();
      default:
        return null;
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#131720] via-[#1a1f2c] to-[#1e2534] min-h-screen">
      <Sidebar />
      <div className="ml-64">
        <div className="max-w-screen-2xl mx-auto p-6">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-sm text-gray-400">Manage users, projects, and reports</p>
          </div>

          {activeTab !== 'overview' && <Toolbar />}

          {!isLoading ? renderContent() : (
            <div className="flex justify-center items-center py-20">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ 
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "linear"
                }}
                className="rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-400"
              />
            </div>
          )}
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}
