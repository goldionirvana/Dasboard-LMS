/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { 
  GraduationCap, 
  Search, 
  Award, 
  BookOpen, 
  Clock, 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Calendar, 
  User as UserIcon, 
  Briefcase, 
  MapPin, 
  TrendingUp, 
  Printer, 
  Download, 
  ChevronRight,
  FileText,
  Bookmark,
  Share2
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { User, Course, Enrollment, PrePostTest } from '../types';
import { 
  mockUsers, 
  mockCourses, 
  mockEnrollments, 
  mockPrePostTests, 
  mockActivities 
} from '../data';

interface KHSDashboardProps {
  initialEmployeeName?: string;
  onBack: () => void;
}

export default function KHSDashboard({ initialEmployeeName = 'Andi Wijaya', onBack }: KHSDashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User>(() => {
    const found = mockUsers.find(u => u.name.toLowerCase() === initialEmployeeName.toLowerCase());
    return found || mockUsers[0];
  });
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  // Filter users for search bar dropdown
  const filteredUsersList = useMemo(() => {
    if (!searchTerm) return [];
    return mockUsers.filter(u => 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.division.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.role.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 5);
  }, [searchTerm]);

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setSearchTerm('');
  };

  // Get enrollments for selected user
  const userEnrollments = useMemo(() => {
    return mockEnrollments.filter(e => e.userId === selectedUser.id);
  }, [selectedUser]);

  // Get pre-post test scores for selected user
  const userPrePostTests = useMemo(() => {
    return mockPrePostTests.filter(t => t.userName.toLowerCase() === selectedUser.name.toLowerCase());
  }, [selectedUser]);

  // Stats Calculations
  const stats = useMemo(() => {
    const enrolls = userEnrollments;
    const completed = enrolls.filter(e => e.status === 'Completed').length;
    const total = enrolls.length;
    
    // Quiz Score Average
    const scored = enrolls.filter(e => e.quizScore !== null);
    const avgQuiz = scored.length > 0 
      ? Math.round(scored.reduce((sum, e) => sum + (e.quizScore || 0), 0) / scored.length) 
      : 0;

    // Pre & Post Test Averages and Learning Gain
    const preTests = userPrePostTests.map(t => t.preTest);
    const postTests = userPrePostTests.map(t => t.postTest);
    
    const avgPre = preTests.length > 0 ? Math.round(preTests.reduce((a, b) => a + b, 0) / preTests.length) : 0;
    const avgPost = postTests.length > 0 ? Math.round(postTests.reduce((a, b) => a + b, 0) / postTests.length) : 0;
    const lgi = avgPost - avgPre;

    // Total Hours
    const totalHours = enrolls.reduce((sum, e) => sum + e.learningHours, 0) + (selectedUser.learningHours || 0);

    return {
      completed,
      total,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      avgQuiz,
      avgPre,
      avgPost,
      lgi: lgi > 0 ? `+${lgi}` : `${lgi}`,
      totalHours: Math.round(totalHours * 10) / 10
    };
  }, [userEnrollments, userPrePostTests, selectedUser]);

  // Quiz scores by course category for the selected user
  const categoryChartData = useMemo(() => {
    return mockCourses.map(course => {
      const enroll = userEnrollments.find(e => e.courseId === course.id);
      
      let preScore = 0;
      let postScore = 0;
      let quizScore = 0;

      // Match test scores
      const testMatch = userPrePostTests.find(t => 
        t.className.toLowerCase().includes(course.title.toLowerCase()) || 
        course.title.toLowerCase().includes(t.className.toLowerCase())
      );
      if (testMatch) {
        preScore = testMatch.preTest;
        postScore = testMatch.postTest;
      }

      if (enroll) {
        quizScore = enroll.quizScore || 0;
      }

      let label = 'Food Safety';
      if (course.title.includes('Leadership')) label = 'Leadership';
      if (course.title.includes('SOP')) label = 'SOP Kitchen';
      if (course.title.includes('Service')) label = 'Service';

      return {
        name: label,
        'Pre-Test': preScore || 50, // default placeholder if no specific test record
        'Post-Test': postScore || (enroll?.status === 'Completed' ? 92 : 0),
        'Quiz': quizScore || (enroll?.status === 'Completed' ? 88 : 0)
      };
    });
  }, [userEnrollments, userPrePostTests]);

  // Filter activities for this user
  const userActivities = useMemo(() => {
    return mockActivities.filter(act => act.userName.toLowerCase() === selectedUser.name.toLowerCase());
  }, [selectedUser]);

  return (
    <div className="space-y-6 pb-12 animate-fade-in" id="khs-dashboard-root">
      
      {/* 🔙 BACK HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors cursor-pointer text-slate-600"
            id="khs-btn-back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-slate-900 leading-tight">Dashboard KHS Karyawan</h2>
            <p className="text-xs text-slate-500">Hasil Evaluasi Akademik &amp; Nilai Kelulusan Modul Pembelajaran</p>
          </div>
        </div>

        {/* 🔍 SEARCH AND CHOOSE EMPLOYEE */}
        <div className="relative w-full sm:w-80" id="khs-search-box">
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-600">
            <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            <input 
              type="text"
              placeholder="Cari karyawan lainnya..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-hidden text-xs w-full text-slate-800 placeholder-slate-400"
            />
          </div>

          {/* Search suggestions dropdown */}
          {filteredUsersList.length > 0 && (
            <div className="absolute top-11 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden divide-y divide-slate-100">
              {filteredUsersList.map(u => (
                <button
                  key={u.id}
                  onClick={() => handleSelectUser(u)}
                  className="w-full text-left px-4 py-2.5 hover:bg-slate-50 transition-colors text-xs flex justify-between items-center cursor-pointer"
                >
                  <div>
                    <span className="font-semibold text-slate-850 block">{u.name}</span>
                    <span className="text-[10px] text-slate-400">{u.role} • {u.division}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 🧑‍💼 PROFILE CARD PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="khs-profile-section">
        
        {/* PROFILE CARD */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-6 lg:col-span-1 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/40 rounded-full blur-2xl -mr-8 -mt-8" />
          
          <div className="space-y-4 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 border border-blue-200 flex items-center justify-center font-bold text-2xl uppercase">
                {selectedUser.name.charAt(0)}{selectedUser.name.split(' ')[1]?.charAt(0) || ''}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-sans font-bold text-slate-900 text-lg leading-tight">{selectedUser.name}</h3>
                  <span className={`px-2 py-0.5 rounded text-[9px] uppercase tracking-wider font-bold ${
                    selectedUser.status === 'Active' 
                      ? 'bg-emerald-50 border border-emerald-100 text-emerald-700' 
                      : 'bg-slate-50 border border-slate-100 text-slate-500'
                  }`}>
                    {selectedUser.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">{selectedUser.role}</p>
                <span className="text-[10px] font-mono font-bold text-slate-400 mt-0.5 block">NIK: EMP-{selectedUser.id.toUpperCase()}-2026</span>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-3 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span className="text-slate-400 flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5" /> Departemen</span>
                <span className="font-semibold text-slate-800">{selectedUser.division}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="text-slate-400 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Regional</span>
                <span className="font-semibold text-slate-800">{selectedUser.regional} ({selectedUser.area})</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="text-slate-400 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Join Date</span>
                <span className="font-semibold text-slate-800">{selectedUser.dateCreated}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="text-slate-400 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Terakhir Aktif</span>
                <span className="font-semibold font-mono text-slate-700 text-[11px]">
                  {selectedUser.lastLogin ? selectedUser.lastLogin.substring(0, 10) + ' ' + selectedUser.lastLogin.substring(11, 16) : 'Belum Pernah Login'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2 border-t border-slate-100 relative z-10">
            <button 
              onClick={() => setShowPrintPreview(true)}
              className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs hover:shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Kartu Hasil Studi</span>
            </button>
          </div>
        </div>

        {/* SUMMARY STATS GRID */}
        <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4" id="khs-stats-grid">
          
          {/* IPK / Rerata Quiz */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-sm transition-shadow">
            <div>
              <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase font-bold block mb-1">Rata-rata Quiz</span>
              <h4 className="text-3xl font-display font-semibold text-blue-600">{stats.avgQuiz} <span className="text-xs text-slate-400 font-sans">/ 100</span></h4>
            </div>
            <div className="border-t border-slate-50 pt-2 mt-3 flex items-center justify-between text-[11px] text-slate-500 font-medium">
              <span>Status KKM</span>
              <span className={`font-bold px-1.5 py-0.5 rounded ${stats.avgQuiz >= 75 ? 'text-emerald-700 bg-emerald-50' : 'text-amber-700 bg-amber-50'}`}>
                {stats.avgQuiz >= 75 ? 'Lulus' : 'Kurang'}
              </span>
            </div>
          </div>

          {/* Penyelesaian Kelas */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-sm transition-shadow">
            <div>
              <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase font-bold block mb-1">Ketuntasan Modul</span>
              <h4 className="text-3xl font-display font-semibold text-slate-800">
                {stats.completed} <span className="text-sm font-sans font-normal text-slate-400">/ {stats.total}</span>
              </h4>
            </div>
            <div className="border-t border-slate-50 pt-2 mt-3 space-y-1">
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>Rasio</span>
                <span>{stats.completionRate}%</span>
              </div>
              <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full" style={{ width: `${stats.completionRate}%` }} />
              </div>
            </div>
          </div>

          {/* Jam Belajar */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-sm transition-shadow">
            <div>
              <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase font-bold block mb-1">Learning Time</span>
              <h4 className="text-3xl font-display font-semibold text-violet-600">{stats.totalHours} <span className="text-xs text-slate-400 font-sans">jam</span></h4>
            </div>
            <div className="border-t border-slate-50 pt-2 mt-3 flex items-center gap-1 text-[11px] text-slate-500 font-medium">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              <span>Sangat Aktif Belajar</span>
            </div>
          </div>

          {/* LGI (Learning Gain) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-sm transition-shadow">
            <div>
              <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase font-bold block mb-1">Learning Gain (LGI)</span>
              <h4 className="text-3xl font-display font-semibold text-emerald-600">{stats.lgi} <span className="text-xs text-slate-400 font-sans">poin</span></h4>
            </div>
            <div className="border-t border-slate-50 pt-2 mt-3 flex items-center justify-between text-[11px] text-slate-500">
              <span className="font-medium text-slate-450">Pre: {stats.avgPre}</span>
              <ChevronRight className="w-3 h-3 text-slate-300" />
              <span className="font-bold text-slate-700">Post: {stats.avgPost}</span>
            </div>
          </div>

        </div>
      </div>

      {/* 📋 THE DETAILED KHS RESULT TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden" id="khs-table-panel">
        
        {/* Table Header Section */}
        <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
          <div>
            <h3 className="font-sans font-bold text-slate-850 text-base flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" /> Transkrip Resmi Kartu Hasil Studi (KHS)
            </h3>
            <p className="text-xs text-slate-400">Daftar nilai akhir per program pelatihan terdaftar</p>
          </div>
          <span className="text-[10px] font-mono font-bold px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-150 rounded-lg uppercase">
            Semester Genap 2026
          </span>
        </div>

        {/* KHS Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase font-mono text-[9px]">
              <tr>
                <th className="py-3 px-6">ID Materi</th>
                <th className="py-3 px-6">Nama Kelas / Pelatihan</th>
                <th className="py-3 px-6">Kategori</th>
                <th className="py-3 px-6 text-center">Pre-Test</th>
                <th className="py-3 px-6 text-center">Post-Test</th>
                <th className="py-3 px-6 text-center">Nilai Quiz</th>
                <th className="py-3 px-6 text-center">Kriteria Kelulusan</th>
                <th className="py-3 px-6 text-center">Status Akhir</th>
                <th className="py-3 px-6 text-right">Durasi Belajar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {userEnrollments.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 bg-slate-50/20">Tidak ada materi terdaftar untuk karyawan ini.</td>
                </tr>
              ) : (
                userEnrollments.map(enroll => {
                  const matchedCourse = mockCourses.find(c => c.id === enroll.courseId);
                  
                  // Match test values
                  const testMatch = userPrePostTests.find(t => 
                    t.className.toLowerCase().includes(enroll.courseTitle.toLowerCase()) || 
                    enroll.courseTitle.toLowerCase().includes(t.className.toLowerCase())
                  );
                  const preVal = testMatch ? testMatch.preTest : (enroll.status === 'Completed' ? 55 : 45);
                  const postVal = testMatch ? testMatch.postTest : (enroll.status === 'Completed' ? 92 : 0);
                  const quizVal = enroll.quizScore;
                  
                  // Decide grade criteria
                  const hasQuiz = quizVal !== null;
                  const isPass = hasQuiz ? (quizVal as number) >= 75 : false;

                  return (
                    <tr key={enroll.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="py-4 px-6 font-mono font-medium text-slate-400">{enroll.courseId.toUpperCase()}</td>
                      <td className="py-4 px-6 font-semibold text-slate-900">{enroll.courseTitle}</td>
                      <td className="py-4 px-6">
                        <span className="text-[10px] font-mono font-bold uppercase bg-slate-100 text-slate-500 border border-slate-200/60 px-2 py-0.5 rounded">
                          {matchedCourse?.category || 'SOP'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center font-mono text-slate-500">{enroll.status === 'Not Started' ? '-' : preVal}</td>
                      <td className="py-4 px-6 text-center font-mono text-slate-800 font-medium">{enroll.status === 'Not Started' ? '-' : (postVal || '-')}</td>
                      <td className={`py-4 px-6 text-center font-mono font-bold text-sm ${
                        hasQuiz ? (isPass ? 'text-emerald-600' : 'text-amber-600') : 'text-slate-400'
                      }`}>
                        {hasQuiz ? quizVal : '-'}
                      </td>
                      <td className="py-4 px-6 text-center font-mono text-slate-400">KKM: 75</td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-mono font-bold tracking-wide border ${
                          enroll.status === 'Completed' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' :
                          enroll.status === 'In Progress' ? 'bg-amber-50 border-amber-100 text-amber-800' :
                          enroll.status === 'Overdue' ? 'bg-rose-50 border-rose-100 text-rose-800 animate-pulse' :
                          'bg-slate-50 border-slate-150 text-slate-600'
                        }`}>
                          {enroll.status === 'Completed' && <CheckCircle className="w-3 h-3 text-emerald-500 shrink-0" />}
                          {enroll.status === 'In Progress' && <Clock className="w-3 h-3 text-amber-500 shrink-0" />}
                          {enroll.status === 'Overdue' && <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />}
                          {enroll.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right font-mono font-semibold text-slate-600">{enroll.learningHours} jam</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 📈 PERFORMANCE VISUALIZATION & HISTORY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="khs-visuals-grid">
        
        {/* Category Performance Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs lg:col-span-2 space-y-4">
          <div>
            <h3 className="font-display font-medium text-slate-800 text-base">Komparasi Hasil Evaluasi Akademik</h3>
            <p className="text-xs text-slate-400 font-light">Perbandingan nilai Pre-Test, Post-Test, dan Quiz Akhir per rumpun modul</p>
          </div>

          <div className="h-68" id="khs-bar-chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} domain={[0, 100]} />
                <Tooltip contentStyle={{ background: '#0f172a', borderRadius: '8px', color: '#fff', border: 'none', fontSize: 12 }} />
                <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                <Bar name="Hasil Pre-Test" dataKey="Pre-Test" fill="#94A3B8" radius={[4, 4, 0, 0]} />
                <Bar name="Hasil Post-Test" dataKey="Post-Test" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar name="Skor Quiz Utama" dataKey="Quiz" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Specific User Learning Log */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs lg:col-span-1 space-y-4">
          <div>
            <h3 className="font-display font-medium text-slate-800 text-base">Histori Belajar Terkini</h3>
            <p className="text-xs text-slate-400 font-light">Log aktvitas real-time pengerjaan materi di portal LMS</p>
          </div>

          <div className="overflow-y-auto max-h-68 space-y-4 pr-1">
            {userActivities.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                Tidak ada log aktivitas berjalan untuk karyawan ini hari ini.
              </div>
            ) : (
              userActivities.map(act => (
                <div key={act.id} className="relative pl-5 pb-1 last:pb-0" id={`act-${act.id}`}>
                  {/* Timeline bullet */}
                  <span className="absolute left-0.5 top-1 w-2 h-2 rounded-full bg-blue-500 ring-4 ring-blue-50 z-10" />
                  {/* Vertical rule */}
                  <span className="absolute left-1.5 top-2 bottom-0 w-0.5 bg-slate-100 -ml-[1px]" />
                  
                  <div className="space-y-0.5">
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span className="font-mono bg-slate-50 border border-slate-200 px-1.5 py-0.2 rounded uppercase font-bold text-[9px] text-slate-500">
                        {act.type.replace('_', ' ')}
                      </span>
                      <span className="font-mono">{act.timestamp.substring(11, 16)} WIB</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-normal font-medium">{act.detail}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* 📄 PRINT KHS OVERLAY MODAL */}
      {showPrintPreview && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto flex flex-col">
            
            {/* Modal Header Actions */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase">Cetak Kartu Hasil Studi Resmi</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak (Sistem Print)</span>
                </button>
                <button
                  onClick={() => setShowPrintPreview(false)}
                  className="px-3.5 py-1.5 bg-slate-150 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>

            {/* Printable Area Wrapper */}
            <div className="p-10 font-sans text-slate-800 space-y-8 bg-white" id="printable-khs-document">
              
              {/* Document Letterhead Header */}
              <div className="flex justify-between items-start border-b-2 border-slate-800 pb-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-xl">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight uppercase">PT INDONESIA KULINER JAYA</h1>
                    <p className="text-[10px] text-slate-400 font-mono tracking-wider">LMS OPERATIONS &amp; TRAINING HUB • KARTU HASIL STUDI</p>
                  </div>
                </div>
                
                <div className="text-right text-[10px] font-mono text-slate-400 space-y-0.5">
                  <div>TANGGAL DITERBITKAN: 2026-06-10</div>
                  <div>ID DOKUMEN: KHS-{selectedUser.id.toUpperCase()}-2026-A</div>
                  <div>STATUS DATA: VERIFIED VALID</div>
                </div>
              </div>

              {/* Document Subtitle */}
              <div className="text-center">
                <h2 className="text-lg font-bold text-slate-900 uppercase tracking-widest underline decoration-2 decoration-blue-600 underline-offset-4">KARTU HASIL STUDI (KHS) AKADEMIK</h2>
                <p className="text-xs text-slate-500 mt-1">Laporan Hasil Penilaian &amp; Uji Kompetensi Karyawan Tahun Ajaran 2026</p>
              </div>

              {/* Employee Biodata Detail Grid */}
              <div className="grid grid-cols-2 gap-6 bg-slate-50 p-5 rounded-xl border border-slate-150 text-xs">
                <div className="space-y-2.5">
                  <div className="flex"><span className="w-32 text-slate-400">Nama Karyawan:</span> <span className="font-bold text-slate-900">{selectedUser.name}</span></div>
                  <div className="flex"><span className="w-32 text-slate-400">Nomor Induk (NIK):</span> <span className="font-mono font-bold text-slate-700">EMP-{selectedUser.id.toUpperCase()}-2026</span></div>
                  <div className="flex"><span className="w-32 text-slate-400">Jabatan &amp; Role:</span> <span className="font-semibold text-slate-800">{selectedUser.role}</span></div>
                </div>
                <div className="space-y-2.5">
                  <div className="flex"><span className="w-32 text-slate-400">Divisi / Departemen:</span> <span className="font-bold text-slate-850">{selectedUser.division}</span></div>
                  <div className="flex"><span className="w-32 text-slate-400">Regional Penugasan:</span> <span className="font-semibold text-slate-800">{selectedUser.regional} ({selectedUser.area})</span></div>
                  <div className="flex"><span className="w-32 text-slate-400">Status Kepegawaian:</span> <span className="text-emerald-700 font-bold">AKTIF / TERDAFTAR</span></div>
                </div>
              </div>

              {/* Academic Performance Summary KPIs */}
              <div className="grid grid-cols-4 gap-4 text-center">
                <div className="border border-slate-200 p-3 rounded-lg bg-slate-50/50">
                  <div className="text-[9px] uppercase font-mono tracking-wider text-slate-400">Rerata Nilai Quiz</div>
                  <div className="text-xl font-bold text-blue-600 mt-1">{stats.avgQuiz} / 100</div>
                </div>
                <div className="border border-slate-200 p-3 rounded-lg bg-slate-50/50">
                  <div className="text-[9px] uppercase font-mono tracking-wider text-slate-400">Materi Selesai</div>
                  <div className="text-xl font-bold text-slate-850 mt-1">{stats.completed} / {stats.total}</div>
                </div>
                <div className="border border-slate-200 p-3 rounded-lg bg-slate-50/50">
                  <div className="text-[9px] uppercase font-mono tracking-wider text-slate-400">Learning Hours</div>
                  <div className="text-xl font-bold text-violet-600 mt-1">{stats.totalHours} jam</div>
                </div>
                <div className="border border-slate-200 p-3 rounded-lg bg-slate-50/50">
                  <div className="text-[9px] uppercase font-mono tracking-wider text-slate-400">LGI Achievement</div>
                  <div className="text-xl font-bold text-emerald-600 mt-1">{stats.lgi} poin</div>
                </div>
              </div>

              {/* Academic Course List Table */}
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-800 text-slate-800 uppercase font-mono text-[10px] font-bold bg-slate-100">
                    <th className="py-2.5 px-3">ID Materi</th>
                    <th className="py-2.5 px-3">Nama Kelas Pelatihan</th>
                    <th className="py-2.5 px-3 text-center">Hasil Pre-test</th>
                    <th className="py-2.5 px-3 text-center">Hasil Post-test</th>
                    <th className="py-2.5 px-3 text-center">Nilai Quiz</th>
                    <th className="py-2.5 px-3 text-center">KKM</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-right">Durasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {userEnrollments.map(enroll => {
                    const testMatch = userPrePostTests.find(t => 
                      t.className.toLowerCase().includes(enroll.courseTitle.toLowerCase()) || 
                      enroll.courseTitle.toLowerCase().includes(t.className.toLowerCase())
                    );
                    const preVal = testMatch ? testMatch.preTest : 55;
                    const postVal = testMatch ? testMatch.postTest : 92;

                    return (
                      <tr key={enroll.id} className="text-slate-800">
                        <td className="py-3 px-3 font-mono text-slate-500 font-bold">{enroll.courseId.toUpperCase()}</td>
                        <td className="py-3 px-3 font-semibold text-slate-900">{enroll.courseTitle}</td>
                        <td className="py-3 px-3 text-center font-mono text-slate-500">{enroll.status === 'Not Started' ? '-' : preVal}</td>
                        <td className="py-3 px-3 text-center font-mono text-slate-800 font-bold">{enroll.status === 'Not Started' ? '-' : postVal}</td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-slate-900">{enroll.quizScore !== null ? enroll.quizScore : '-'}</td>
                        <td className="py-3 px-3 text-center font-mono text-slate-400">75</td>
                        <td className="py-3 px-3 text-center font-bold text-[10px] font-mono">
                          {enroll.status === 'Completed' ? 'LULUS (PASS)' : enroll.status.toUpperCase()}
                        </td>
                        <td className="py-3 px-3 text-right font-mono">{enroll.learningHours} jam</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Signatures and Legal Footnote */}
              <div className="pt-8 grid grid-cols-2 gap-8 text-xs font-semibold text-slate-800">
                <div className="space-y-16">
                  <div className="space-y-1">
                    <p className="text-slate-400 font-mono text-[9px] uppercase">Penerima Transkrip KHS</p>
                    <p className="font-bold underline text-slate-800">{selectedUser.name}</p>
                    <p className="text-[10px] text-slate-500">{selectedUser.role}</p>
                  </div>
                </div>

                <div className="space-y-16 text-right">
                  <div className="space-y-1">
                    <p className="text-slate-400 font-mono text-[9px] uppercase">Mengetahui, Direktur HRD &amp; LMS Operations</p>
                    <p className="font-bold underline text-slate-800">Drs. Sutopo Hadinoto, M.B.A.</p>
                    <p className="text-[10px] text-slate-500">PT Indonesia Kuliner Jaya HQ</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-5 text-center text-[10px] font-mono text-slate-400 leading-normal">
                Dokumen hasil studi ini dicetak secara otomatis melalui Sistem Portal LMS Analytics Hub PT Indonesia Kuliner Jaya.<br />
                Segala pemalsuan atau modifikasi tidak sah akan dikenakan sanksi disipliner ketenagakerjaan secara tegas.
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
