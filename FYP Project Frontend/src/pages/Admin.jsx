import { useState, useEffect, useCallback } from 'react';

import { Link } from 'react-router-dom';

import { motion } from 'framer-motion';

import {

  Shield,

  Users,

  Activity,

  MessageSquare,

  Star,

  LayoutDashboard,

  Database,

  LogOut,

} from 'lucide-react';

import { useAuth } from '../context/AuthContext';



function RatingStars({ rating }) {

  return (

    <div className="flex items-center gap-0.5">

      {[1, 2, 3, 4, 5].map((star) => (

        <Star

          key={star}

          className={`w-4 h-4 ${star <= rating ? 'text-amber-400' : 'text-gray-300'}`}

          fill={star <= rating ? 'currentColor' : 'none'}

          stroke="currentColor"

        />

      ))}

    </div>

  );

}



const TABS = [

  { id: 'overview', label: 'Overview', shortLabel: 'Overview', icon: LayoutDashboard },

  { id: 'users', label: 'Users', shortLabel: 'Users', icon: Users },

  { id: 'detections', label: 'Detections', shortLabel: 'Detections', icon: Activity },

  { id: 'analyses', label: 'Analyses DB', shortLabel: 'Analyses', icon: Database },

  { id: 'feedback', label: 'Feedback', shortLabel: 'Feedback', icon: MessageSquare },

];



function StatCard({ label, value, sub }) {

  return (

    <div className="p-5 rounded-2xl bg-gradient-to-br from-forest-50 to-white border border-forest-100">

      <p className="text-sm text-gray-500 mb-1">{label}</p>

      <p className="text-3xl font-bold text-forest-900">{value}</p>

      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}

    </div>

  );

}



export default function Admin() {

  const {

    user,

    logout,

    getAllUsers,

    getAllDetections,

    getAllFeedback,

    getAdminStats,

    getAllAnalyses,

  } = useAuth();

  const [users, setUsers] = useState([]);

  const [detections, setDetections] = useState([]);

  const [analyses, setAnalyses] = useState([]);

  const [feedback, setFeedback] = useState([]);

  const [stats, setStats] = useState(null);

  const [activeTab, setActiveTab] = useState('overview');

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState('');



  const loadAll = useCallback(async () => {

    setLoading(true);

    setError('');

    try {

      const [usersData, detectionsData, feedbackData, statsData, analysesData] = await Promise.all([

        getAllUsers(),

        getAllDetections(),

        getAllFeedback(),

        getAdminStats(),

        getAllAnalyses(),

      ]);

      setUsers(usersData);

      setDetections(detectionsData);

      setFeedback(feedbackData);

      setStats(statsData);

      setAnalyses(analysesData);

    } catch (err) {

      setError(err.message || 'Failed to load admin data');

    } finally {

      setLoading(false);

    }

  }, [getAllUsers, getAllDetections, getAllFeedback, getAdminStats, getAllAnalyses]);



  useEffect(() => {

    loadAll();

  }, [loadAll]);



  return (

    <div className="page-shell page-bg">

      <div className="max-w-6xl mx-auto">

        <motion.div

          initial={{ opacity: 0, y: 20 }}

          animate={{ opacity: 1, y: 0 }}

          className="page-card overflow-hidden !p-0"

        >

          <div className="p-4 sm:p-6 lg:p-8 border-b border-forest-100 flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-amber-50/80 to-forest-50/50">

            <div className="flex items-center gap-3 min-w-0">

              <span className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-amber-100 text-amber-700 shrink-0">

                <Shield className="w-6 h-6 sm:w-7 sm:h-7" />

              </span>

              <div className="min-w-0">

                <h1 className="text-xl sm:text-2xl font-bold text-forest-900">Admin Dashboard</h1>

                <p className="text-gray-500 text-xs sm:text-sm">

                  Signed in as {user?.email} — view all users, detections, analyses & feedback

                </p>

              </div>

            </div>

            <div className="flex flex-wrap gap-2 w-full sm:w-auto">

              <button

                type="button"

                onClick={loadAll}

                className="flex-1 sm:flex-none px-4 py-2 rounded-xl font-semibold text-sm text-forest-700 bg-forest-100 hover:bg-forest-200 transition-colors"

              >

                Refresh

              </button>

              <button

                type="button"

                onClick={() => {

                  logout();

                  window.location.href = '/admin/login';

                }}

                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm text-red-700 bg-red-50 hover:bg-red-100 transition-colors"

              >

                <LogOut className="w-4 h-4" />

                Logout

              </button>

              <Link

                to="/"

                className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2 rounded-xl font-semibold text-sm text-forest-700 bg-white border border-forest-200 hover:bg-forest-50 transition-colors"

              >

                Home

              </Link>

            </div>

          </div>



          <div className="flex border-b border-forest-100 overflow-x-auto">

            {TABS.map(({ id, label, shortLabel, icon: Icon }) => (

              <button

                key={id}

                type="button"

                onClick={() => setActiveTab(id)}

                className={`flex-shrink-0 flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 lg:px-5 py-3 sm:py-4 text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap ${

                  activeTab === id

                    ? 'text-forest-700 border-b-2 border-forest-600 bg-forest-50/50'

                    : 'text-gray-500 hover:text-forest-600'

                }`}

              >

                <Icon className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />

                <span className="sm:hidden">{shortLabel}</span>

                <span className="hidden sm:inline">{label}</span>

              </button>

            ))}

          </div>



          <div className="p-4 sm:p-6 lg:p-8">

            {loading ? (

              <div className="text-center py-12">

                <div className="w-10 h-10 border-2 border-forest-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />

                <p className="text-gray-500">Loading database records...</p>

              </div>

            ) : error ? (

              <p className="text-red-600 text-center py-8">{error}</p>

            ) : (

              <>

                {activeTab === 'overview' && stats && (

                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

                      <StatCard label="Total users" value={stats.totalUsers ?? 0} />

                      <StatCard label="Verified users" value={stats.verifiedUsers ?? 0} />

                      <StatCard label="Detections" value={stats.totalDetections ?? 0} />

                      <StatCard label="Feedback" value={stats.totalFeedback ?? 0} />

                    </div>

                    <p className="text-gray-600 text-sm">

                      Use the tabs above to browse all registered accounts, detection history, full

                      analysis records stored in MongoDB, and user feedback submissions.

                    </p>

                  </motion.div>

                )}



                {activeTab === 'users' && (

                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

                    <h2 className="text-base sm:text-lg font-semibold text-forest-900 mb-4">

                      Registered users ({users.length})

                    </h2>

                    {users.length === 0 ? (

                      <p className="text-gray-500">No users registered yet.</p>

                    ) : (

                      <div className="overflow-x-auto">

                        <table className="w-full min-w-[640px] text-left border-collapse text-sm">

                          <thead>

                            <tr className="border-b border-forest-200">

                              <th className="pb-3 pr-4 font-semibold text-forest-800">Name</th>

                              <th className="pb-3 pr-4 font-semibold text-forest-800">Email</th>

                              <th className="pb-3 pr-4 font-semibold text-forest-800">Status</th>

                              <th className="pb-3 font-semibold text-forest-800">Joined</th>

                            </tr>

                          </thead>

                          <tbody>

                            {users.map((u) => (

                              <tr key={u.email} className="border-b border-forest-100">

                                <td className="py-3 pr-4 text-gray-700">{u.name || '—'}</td>

                                <td className="py-3 pr-4 text-gray-600 break-all">{u.email}</td>

                                <td className="py-3 pr-4">

                                  <div className="flex flex-wrap gap-1.5">

                                    {u.isAdmin && (

                                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-medium">

                                        Admin

                                      </span>

                                    )}

                                    <span

                                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${

                                        u.isVerified

                                          ? 'bg-forest-100 text-forest-700'

                                          : 'bg-gray-100 text-gray-600'

                                      }`}

                                    >

                                      {u.isVerified ? 'Verified' : 'Unverified'}

                                    </span>

                                  </div>

                                </td>

                                <td className="py-3 text-gray-500">

                                  {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}

                                </td>

                              </tr>

                            ))}

                          </tbody>

                        </table>

                      </div>

                    )}

                  </motion.div>

                )}



                {activeTab === 'detections' && (

                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

                    <h2 className="text-base sm:text-lg font-semibold text-forest-900 mb-4">

                      Detection history ({detections.length})

                    </h2>

                    {detections.length === 0 ? (

                      <p className="text-gray-500">No detections recorded yet.</p>

                    ) : (

                      <div className="overflow-x-auto">

                        <table className="w-full min-w-[640px] text-left border-collapse text-sm">

                          <thead>

                            <tr className="border-b border-forest-200">

                              <th className="pb-3 pr-4 font-semibold text-forest-800">Date</th>

                              <th className="pb-3 pr-4 font-semibold text-forest-800">User</th>

                              <th className="pb-3 pr-4 font-semibold text-forest-800">Disease</th>

                              <th className="pb-3 font-semibold text-forest-800">Confidence</th>

                            </tr>

                          </thead>

                          <tbody>

                            {detections.map((d) => (

                              <tr key={d.id} className="border-b border-forest-100">

                                <td className="py-3 pr-4 text-gray-600">

                                  {d.date ? new Date(d.date).toLocaleString() : '—'}

                                </td>

                                <td className="py-3 pr-4 text-gray-700">

                                  {d.userName || d.userEmail || '—'}

                                </td>

                                <td className="py-3 pr-4 font-medium text-forest-800">{d.diseaseName}</td>

                                <td className="py-3 text-forest-600">{d.confidence}%</td>

                              </tr>

                            ))}

                          </tbody>

                        </table>

                      </div>

                    )}

                  </motion.div>

                )}



                {activeTab === 'analyses' && (

                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

                    <h2 className="text-base sm:text-lg font-semibold text-forest-900 mb-4">

                      Analyses collection ({analyses.length})

                    </h2>

                    {analyses.length === 0 ? (

                      <p className="text-gray-500">No analysis records yet.</p>

                    ) : (

                      <div className="space-y-4">

                        {analyses.map((a) => (

                          <div

                            key={a.id}

                            className="p-4 sm:p-5 rounded-2xl border border-forest-100 bg-forest-50/40"

                          >

                            <div className="flex flex-wrap items-start justify-between gap-2 mb-2">

                              <span className="font-semibold text-forest-800">{a.diseaseName}</span>

                              <span className="text-forest-600 font-medium">{a.confidence}%</span>

                            </div>

                            <p className="text-sm text-gray-700">

                              {a.userName || '—'} · {a.userEmail || '—'}

                            </p>

                            <p className="text-sm text-gray-600 mt-2 line-clamp-2">

                              {a.description || 'No description'}

                            </p>

                            <p className="text-xs text-gray-500 mt-2">

                              {a.date ? new Date(a.date).toLocaleString() : '—'}

                              {a.imagePath ? ` · ${a.imagePath}` : ''}

                            </p>

                          </div>

                        ))}

                      </div>

                    )}

                  </motion.div>

                )}



                {activeTab === 'feedback' && (

                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

                    <h2 className="text-base sm:text-lg font-semibold text-forest-900 mb-4">

                      User feedback ({feedback.length})

                    </h2>

                    {feedback.length === 0 ? (

                      <p className="text-gray-500">No feedback submitted yet.</p>

                    ) : (

                      <div className="overflow-x-auto">

                        <table className="w-full min-w-[720px] text-left border-collapse text-sm">

                          <thead>

                            <tr className="border-b border-forest-200">

                              <th className="pb-3 pr-4 font-semibold text-forest-800">Date</th>

                              <th className="pb-3 pr-4 font-semibold text-forest-800">User</th>

                              <th className="pb-3 pr-4 font-semibold text-forest-800">Disease</th>

                              <th className="pb-3 pr-4 font-semibold text-forest-800">Rating</th>

                              <th className="pb-3 font-semibold text-forest-800">Comment</th>

                            </tr>

                          </thead>

                          <tbody>

                            {feedback.map((f) => (

                              <tr key={f.id} className="border-b border-forest-100">

                                <td className="py-3 pr-4 text-gray-600">

                                  {f.createdAt ? new Date(f.createdAt).toLocaleString() : '—'}

                                </td>

                                <td className="py-3 pr-4 text-gray-700">

                                  {f.userName || f.userEmail || '—'}

                                </td>

                                <td className="py-3 pr-4 font-medium text-forest-800">

                                  {f.diseaseName || '—'}

                                </td>

                                <td className="py-3 pr-4">

                                  <RatingStars rating={f.rating} />

                                </td>

                                <td className="py-3 text-gray-600">{f.comment || '—'}</td>

                              </tr>

                            ))}

                          </tbody>

                        </table>

                      </div>

                    )}

                  </motion.div>

                )}

              </>

            )}

          </div>

        </motion.div>

      </div>

    </div>

  );

}


