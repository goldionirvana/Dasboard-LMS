/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Activity as ActIcon, 
  BookOpen, 
  Award, 
  CheckCircle, 
  Percent, 
  BarChart4, 
  Clock, 
  Search, 
  EyeOff, 
  TrendingDown, 
  UserPlus, 
  Sparkles,
  ArrowUpRight,
  Filter,
  Calendar,
  Building,
  Target,
  ArrowDownRight,
  ShieldCheck
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  Cell, 
  PieChart, 
  Pie 
} from 'recharts';
import { User, Course, Enrollment, Activity, FilterState } from '../types';
import { 
  mockUsers, 
  mockCourses, 
  mockEnrollments, 
  mockActivities,
  getActiveUsersHourly,
  getActiveUsersWeekly,
  getActiveUsersMonthly,
  getCompletionsMonthly,
  getDailyLogins
} from '../data';

interface AdminDashboardProps {
  filters: FilterState;
}

export default function AdminDashboard({ filters }: AdminDashboardProps) {
  const [activeUserTimeframe, setActiveUserTimeframe] = useState<'harian' | 'mingguan' | 'bulanan'>('bulanan');
  const [searchQuery, setSearchQuery] = useState('');
  const [newUserTimeframe, setNewUserTimeframe] = useState<7 | 30>(30);

  // 1. DYNAMIC DATA FILTERING & COMPUTATION
  const filteredUsers = useMemo(() => {
    return mockUsers.filter(user => {
      if (filters.branch !== 'all' && user.branch !== filters.branch) return false;
      if (filters.area !== 'all' && user.area !== filters.area) return false;
      if (filters.regional !== 'all' && user.regional !== filters.regional) return false;
      if (filters.division !== 'all' && user.division !== filters.division) return false;
      return true;
    });
  }, [filters]);

  const filteredUserIds = useMemo(() => new Set(filteredUsers.map(u => u.id)), [filteredUsers]);

  const filteredEnrollments = useMemo(() => {
    return mockEnrollments.filter(enroll => {
      // User properties check
      if (!filteredUserIds.has(enroll.userId)) return false;
      
      // Course category filter
      if (filters.category !== 'all') {
        const course = mockCourses.find(c => c.id === enroll.courseId);
        if (!course || course.category !== filters.category) return false;
      }
      return true;
    });
  }, [filteredUserIds, filters.category]);

  const filteredCourses = useMemo(() => {
    if (filters.category === 'all') return mockCourses;
    return mockCourses.filter(c => c.category === filters.category);
  }, [filters.category]);

  // 2. STATISTICS CALCULATIONS
  const stats = useMemo(() => {
    const totalUsers = filteredUsers.length;
    
    // Active Today (logins with date matching today e.g. '2026-06-10')
    const activeToday = filteredUsers.filter(u => u.lastLogin && u.lastLogin.startsWith('2026-06-10')).length;
    
    const totalCourses = filteredCourses.length;
    const totalEnrollments = filteredEnrollments.length;
    
    // Certificates: Count of completed enrollments with a quiz score (or just status Completed)
    const certificatesCount = filteredEnrollments.filter(e => e.status === 'Completed').length;
    
    // Completed status
    const completionsCount = filteredEnrollments.filter(e => e.status === 'Completed').length;
    
    // Completion rate = Completed ÷ Enrollment * 100%
    const completionRate = totalEnrollments > 0 
      ? Math.round((completionsCount / totalEnrollments) * 100) 
      : 0;
      
    // Average Quiz Score
    const scoredEnrollments = filteredEnrollments.filter(e => e.quizScore !== null);
    const averageQuizScore = scoredEnrollments.length > 0
      ? Math.round(scoredEnrollments.reduce((sum, e) => sum + (e.quizScore || 0), 0) / scoredEnrollments.length)
      : 0;

    return {
      totalUsers,
      activeToday,
      totalCourses,
      totalEnrollments,
      certificatesCount,
      completionsCount,
      completionRate,
      averageQuizScore
    };
  }, [filteredUsers, filteredCourses, filteredEnrollments]);

  // 3. CHARTS DATA PREP
  // Active users trend
  const activeUsersData = useMemo(() => {
    if (activeUserTimeframe === 'harian') return getActiveUsersHourly;
    if (activeUserTimeframe === 'mingguan') return getActiveUsersWeekly;
    return getActiveUsersMonthly;
  }, [activeUserTimeframe]);

  // Donut chart progress: Completed, In Progress, Not Started
  const progressDonutData = useMemo(() => {
    const completed = filteredEnrollments.filter(e => e.status === 'Completed').length;
    const inProgress = filteredEnrollments.filter(e => e.status === 'In Progress').length;
    const overdue = filteredEnrollments.filter(e => e.status === 'Overdue').length;
    const notStarted = Math.max(0, filteredUsers.length * filteredCourses.length - (completed + inProgress + overdue));

    const total = completed + inProgress + overdue + notStarted;
    if (total === 0) {
      return [
        { name: 'Completed', value: 68, color: '#10B981' },
        { name: 'In Progress / Overdue', value: 22, color: '#3B82F6' },
        { name: 'Not Started', value: 10, color: '#94A3B8' }
      ];
    }

    return [
      { name: 'Completed', value: Math.round((completed / total) * 100), color: '#10B981' },
      { name: 'In Progress / Overdue', value: Math.round(((inProgress + overdue) / total) * 100), color: '#3B82F6' },
      { name: 'Not Started', value: Math.round((notStarted / total) * 100), color: '#F1F5F9' }
    ];
  }, [filteredEnrollments, filteredUsers, filteredCourses]);

  // 4. MONITORING LISTS PREP
  // Top Learners: grouped & sorted by completions, quiz avg, learning hours
  const topLearners = useMemo(() => {
    const userStats = filteredUsers.map(user => {
      const userEnrollments = filteredEnrollments.filter(e => e.userId === user.id);
      const completions = userEnrollments.filter(e => e.status === 'Completed').length;
      const scores = userEnrollments.filter(e => e.quizScore !== null).map(e => e.quizScore as number);
      const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
      const totalHours = userEnrollments.reduce((sum, e) => sum + e.learningHours, 0) + (user.learningHours || 0);

      return {
        id: user.id,
        name: user.name,
        division: user.division,
        branch: user.branch,
        completions,
        avgScore,
        learningHours: Math.round(totalHours * 10) / 10
      };
    });

    // Rank: prioritizing highest completions, then highest avg score, then learning hours
    return userStats
      .sort((a, b) => b.completions - a.completions || b.avgScore - a.avgScore || b.learningHours - a.learningHours)
      .slice(0, 10);
  }, [filteredUsers, filteredEnrollments]);

  // User Belum Pernah Login (lastLogin is null)
  const neverLoggedInUsers = useMemo(() => {
    return filteredUsers.filter(u => u.lastLogin === null);
  }, [filteredUsers]);

  // User with Progress Rendah (progress < 30%)
  const lowProgressUsers = useMemo(() => {
    const activeLow = filteredEnrollments
      .filter(e => e.status !== 'Completed' && e.progress < 30)
      .map(e => {
        const user = mockUsers.find(u => u.id === e.userId);
        return {
          id: e.id,
          userName: e.userName,
          courseTitle: e.courseTitle,
          progress: e.progress,
          deadline: e.deadline,
          branch: user?.branch || 'N/A',
          division: user?.division || 'N/A'
        };
      });
    return activeLow;
  }, [filteredEnrollments]);

  // New User in last 7 or 30 days
  const newUsers = useMemo(() => {
    const cutoffDate = new Date('2026-06-10');
    cutoffDate.setDate(cutoffDate.getDate() - newUserTimeframe);
    
    return filteredUsers.filter(u => {
      const createdDate = new Date(u.dateCreated);
      return createdDate >= cutoffDate;
    });
  }, [filteredUsers, newUserTimeframe]);

  // 5. COURSE PERFORMANCE REPORT
  const coursePerformance = useMemo(() => {
    return filteredCourses.map(course => {
      const enrolls = mockEnrollments.filter(e => e.courseId === course.id && filteredUserIds.has(e.userId));
      const enrollCount = enrolls.length;
      const completed = enrolls.filter(e => e.status === 'Completed').length;
      const completionRate = enrollCount > 0 ? Math.round((completed / enrollCount) * 100) : 0;
      
      return {
        id: course.id,
        title: course.title,
        category: course.category,
        enrollmentCount: enrollCount,
        completionRate: completionRate,
        totalAccess: course.totalAccess + (enrollCount * 5),
        lastAccess: course.lastAccess
      };
    });
  }, [filteredCourses, filteredUserIds]);

  const popularCourses = useMemo(() => {
    return [...coursePerformance].sort((a, b) => b.enrollmentCount - a.enrollmentCount);
  }, [coursePerformance]);

  const topCompletedCourses = useMemo(() => {
    return [...coursePerformance].sort((a, b) => b.completionRate - a.completionRate);
  }, [coursePerformance]);

  const rarelyAccessedCourses = useMemo(() => {
    return [...coursePerformance].sort((a, b) => a.totalAccess - b.totalAccess);
  }, [coursePerformance]);

  return (
    <div className="space-y-8 pb-12 animate-fade-in" id="admin-dashboard-container">
      
      {/* 📊 SUMMARY CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="admin-summary-grid">
        
        {/* Total Pengguna */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow" id="card-total-users">
          <div className="space-y-1">
            <p className="text-xs font-mono tracking-wider text-slate-400 uppercase">Total User Terdaftar</p>
            <h4 className="text-3xl font-display font-semibold text-slate-900">{stats.totalUsers}</h4>
            <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-600">
              <UserPlus className="w-3 h-3" />
              <span>+{newUsers.length} baru dlm 30 hari</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Pengguna Aktif Hari Ini */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow" id="card-active-today">
          <div className="space-y-1">
            <p className="text-xs font-mono tracking-wider text-slate-400 uppercase">Aktif Hari Ini</p>
            <h4 className="text-3xl font-display font-semibold text-slate-900">{stats.activeToday}</h4>
            <div className="flex items-center gap-1 text-[11px] font-medium text-amber-600">
              <ActIcon className="w-3 h-3 animate-pulse" />
              <span>Login hari berjalan</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <ActIcon className="w-6 h-6" />
          </div>
        </div>

        {/* Total Course & Enrollment */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow" id="card-total-courses">
          <div className="space-y-1">
            <p className="text-xs font-mono tracking-wider text-slate-400 uppercase">Total Materi & Enrolls</p>
            <h4 className="text-3xl font-display font-semibold text-slate-900">
              {stats.totalCourses} <span className="text-sm font-sans font-normal text-slate-400">/ {stats.totalEnrollments}</span>
            </h4>
            <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
              <BookOpen className="w-3 h-3" />
              <span>Rasio: {stats.totalCourses ? Math.round(stats.totalEnrollments/stats.totalCourses) : 0} peserta per materi</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        {/* Sertifikat Terbit */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow" id="card-certs">
          <div className="space-y-1">
            <p className="text-xs font-mono tracking-wider text-slate-400 uppercase">Sertifikat Diterbitkan</p>
            <h4 className="text-3xl font-display font-semibold text-emerald-600">{stats.certificatesCount}</h4>
            <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-600">
              <CheckCircle className="w-3 h-3" />
              <span>{stats.completionsCount} course diselesaikan</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Award className="w-6 h-6" />
          </div>
        </div>

        {/* Average Completion Rate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow" id="card-completion-rate">
          <div className="space-y-1">
            <p className="text-xs font-mono tracking-wider text-slate-400 uppercase">Avg Completion Rate</p>
            <h4 className="text-3xl font-display font-semibold text-blue-600">{stats.completionRate}%</h4>
            <div className="flex items-center gap-1 text-[11px] font-medium text-blue-600">
              <Percent className="w-3 h-3" />
              <span>Penyelesaian dari total enrollment</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Percent className="w-6 h-6" />
          </div>
        </div>

        {/* Average Quiz Score */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow" id="card-avg-quiz">
          <div className="space-y-1">
            <p className="text-xs font-mono tracking-wider text-slate-400 uppercase">Rata-rata Nilai Quiz</p>
            <h4 className="text-3xl font-display font-semibold text-blue-600">{stats.averageQuizScore} <span className="text-xs text-slate-400 font-sans">/ 100</span></h4>
            <div className="flex items-center gap-1 text-[11px] font-medium text-blue-600">
              <ShieldCheck className="w-3 h-3" />
              <span>Dari modul yang di-quiz</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Award className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 📈 ANALYTICS CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="admin-charts-section">
        
        {/* 1. Tren Pengguna Aktif (Line Chart) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm col-span-2 space-y-4" id="chart-active-users">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-display font-medium text-slate-800 text-lg">Tren Pengguna Aktif</h3>
              <p className="text-xs text-slate-400">Pola fluktuasi interaksi pengguna di platform</p>
            </div>
            
            <div className="flex bg-slate-50 p-1 rounded-lg border border-slate-100 text-xs font-medium text-slate-600 self-start" id="active-user-selector">
              <button 
                onClick={() => setActiveUserTimeframe('harian')}
                className={`px-3 py-1.5 rounded-md transition-all ${activeUserTimeframe === 'harian' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'}`}
              >
                Harian
              </button>
              <button 
                onClick={() => setActiveUserTimeframe('mingguan')}
                className={`px-3 py-1.5 rounded-md transition-all ${activeUserTimeframe === 'mingguan' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'}`}
              >
                Mingguan
              </button>
              <button 
                onClick={() => setActiveUserTimeframe('bulanan')}
                className={`px-3 py-1.5 rounded-md transition-all ${activeUserTimeframe === 'bulanan' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'}`}
              >
                Bulanan
              </button>
            </div>
          </div>

          <div className="h-68" id="rend-active-chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activeUsersData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ background: '#0f172a', borderRadius: '8px', color: '#fff', border: 'none', fontSize: 12 }} />
                <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="Malang" stroke="#F59E0B" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="Garut" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="Bandung" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. Progress Pembelajaran Perusahaan (Donut Chart) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between space-y-4" id="chart-donut-progress">
          <div>
            <h3 className="font-display font-medium text-slate-800 text-lg">Progress Pembelajaran</h3>
            <p className="text-xs text-slate-400">Persentase status materi semua karyawan</p>
          </div>

          <div className="relative flex items-center justify-center h-48" id="donut-canvas-container">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={progressDonutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {progressDonutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-display font-bold text-slate-800">{progressDonutData[0].value}%</span>
              <span className="text-[10px] font-mono tracking-wider text-slate-400 uppercase">Selesai</span>
            </div>
          </div>

          <div className="space-y-2 border-t border-slate-50 pt-3 text-xs" id="donut-chart-legend">
            {progressDonutData.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.name}</span>
                </div>
                <span className="font-semibold">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Tren Penyelesaian Course (Area Chart) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4" id="chart-area-completions">
          <div>
            <h3 className="font-display font-medium text-slate-800 text-base">Tren Penyelesaian Course</h3>
            <p className="text-xs text-slate-400">Total modul pembelajaran diselesaikan per bulan</p>
          </div>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={getCompletionsMonthly}>
                <defs>
                  <linearGradient id="colorSelesai" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                <XAxis dataKey="name" fontSize={10} stroke="#94a3b8" />
                <YAxis fontSize={10} stroke="#94a3b8" />
                <Tooltip />
                <Area type="monotone" dataKey="Selesai" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorSelesai)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          <div className="flex justify-between items-center text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100" id="area-summary-footer">
            <span>Selesai Juni berjalan:</span>
            <span className="font-bold text-slate-800">85 Sertifikat</span>
          </div>
        </div>

        {/* 3. Jumlah Login Harian (Bar Chart with highlights) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4 lg:col-span-2" id="chart-bar-logins">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-medium text-slate-800 text-base">Jumlah Login Harian</h3>
              <p className="text-xs text-slate-400">Total login harian pada minggu aktif</p>
            </div>
            
            <div className="flex gap-3 text-[10px] font-mono">
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-blue-500 rounded-sm"></span> Peak Activity</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-rose-500 rounded-sm"></span> Sepi</span>
            </div>
          </div>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getDailyLogins}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                <XAxis dataKey="date" fontSize={10} stroke="#94a3b8" />
                <YAxis fontSize={10} stroke="#94a3b8" />
                <Tooltip formatter={(value) => `${value} logins`} />
                <Bar dataKey="logins" radius={[4, 4, 0, 0]}>
                  {getDailyLogins.map((entry, index) => {
                    let color = '#3b82f6'; // default
                    if (entry.status === 'Peak') color = '#1d4ed8'; // Deep Blue highlight
                    if (entry.status === 'Sepi') color = '#f43f5e'; // Dark red
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-between text-xs text-slate-500 mt-2" id="login-highlight-footer">
            <div>Aktivitas Terpadat: <span className="font-bold text-blue-700">Rabu (78 Logins)</span></div>
            <div>Aktivitas Terendah: <span className="font-bold text-rose-600">Minggu (8 Logins)</span></div>
          </div>
        </div>
      </div>

      {/* 👥 LIST MONITORING & MANAGEMENT */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6" id="admin-users-monitoring">
        
        {/* 🏆 Top Learner */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4" id="monitor-top-learners">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-medium text-slate-800 text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" /> Top Learner 10
              </h3>
              <p className="text-xs text-slate-400">Peserta dengan penyelesaian dan keaktifan terbaik</p>
            </div>
            <span className="text-[10px] font-mono px-2 py-1 bg-amber-50 border border-amber-100 text-amber-700 rounded-md">
              Leaderboard
            </span>
          </div>

          <div className="overflow-x-auto" id="top-learner-table-scroller">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-mono">
                  <th className="py-2.5 font-normal">Rank</th>
                  <th className="py-2.5 font-normal">Nama / Divisi</th>
                  <th className="py-2.5 font-normal">Completions</th>
                  <th className="py-2.5 font-normal">Quiz Rata²</th>
                  <th className="py-2.5 font-normal text-right">Jam Belajar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {topLearners.slice(0, 10).map((learner, idx) => (
                  <tr key={learner.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3">
                      <span className={`inline-flex items-center justify-center w-5 h-5 rounded text-[10px] font-bold ${
                        idx === 0 ? 'bg-amber-100 text-amber-800' :
                        idx === 1 ? 'bg-slate-100 text-slate-800' :
                        idx === 2 ? 'bg-orange-100 text-orange-800' :
                        'bg-slate-50 text-slate-500'
                      }`}>
                        {idx + 1}
                      </span>
                    </td>
                    <td className="py-3">
                      <div>
                        <div className="font-medium text-slate-800">{learner.name}</div>
                        <div className="text-[10px] text-slate-400">{learner.division} • {learner.branch}</div>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full font-mono text-[10px] font-medium bg-emerald-50 text-emerald-700">
                        {learner.completions} Selesai
                      </span>
                    </td>
                    <td className="py-3 font-mono font-bold text-slate-700">
                      {learner.avgScore > 0 ? `${learner.avgScore}/100` : '-'}
                    </td>
                    <td className="py-3 text-right font-mono font-medium text-slate-600">
                      {learner.learningHours} jam
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 🚫 User Belum Pernah Login */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4" id="monitor-inactive-users">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-display font-medium text-slate-800 text-lg flex items-center gap-2">
                <EyeOff className="w-5 h-5 text-slate-500" /> User Belum Pernah Login
              </h3>
              <p className="text-xs text-slate-400">Membantu menindaklanjuti proses onboarding karyawan baru</p>
            </div>
            
            <div className="text-xs text-rose-500 font-mono bg-rose-50 px-2 py-1 border border-rose-100 rounded-md self-start">
              {neverLoggedInUsers.length} Orang Belum Akses
            </div>
          </div>

          <div className="overflow-y-auto max-h-76 divide-y divide-slate-100 border border-slate-50 rounded-xl" id="never-login-list-container">
            {neverLoggedInUsers.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">Semua user sudah pernah login.</div>
            ) : (
              neverLoggedInUsers.map(user => (
                <div key={user.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="space-y-1">
                    <div className="font-medium text-slate-800 text-sm">{user.name}</div>
                    <div className="text-xs text-slate-400 flex flex-wrap gap-x-2 gap-y-0.5">
                      <span>Cabang: <strong className="text-slate-600">{user.branch}</strong></span>
                      <span>•</span>
                      <span>Jabatan: <strong className="text-slate-600">{user.role}</strong></span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Akun Dibuat: {user.dateCreated}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-1.5">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded font-medium">
                      Belum Login
                    </span>
                    
                    <button 
                      onClick={() => alert(`Mengirimkan email follow-up onboarding ke ${user.email}`)}
                      className="text-[10px] font-medium text-indigo-600 hover:text-indigo-800 underline active:text-indigo-900 cursor-pointer"
                    >
                      Kirim Blast Email
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ⚠️ User dengan Progress Rendah (<30%) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4" id="monitor-low-progress">
          <div>
            <h3 className="font-display font-medium text-slate-800 text-lg flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-rose-500" /> User dengan Progress Rendah (&lt;30%)
            </h3>
            <p className="text-xs text-slate-400">Peserta dengan pengerjaan mandek untuk segera diingatkan manager</p>
          </div>

          <div className="overflow-y-auto max-h-76 divide-y divide-slate-100 border border-slate-50 rounded-xl" id="low-progress-list-container">
            {lowProgressUsers.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">Tidak ada user dengan progress kritis.</div>
            ) : (
              lowProgressUsers.map(enroll => (
                <div key={enroll.id} className="p-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-3 hover:bg-slate-50 transition-colors">
                  <div className="space-y-1">
                    <div className="font-medium text-slate-800 text-sm">{enroll.userName}</div>
                    <div className="text-xs text-slate-500 font-medium">
                      Modul: <span className="text-slate-700">{enroll.courseTitle}</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Cabang: {enroll.branch} • Divisi: {enroll.division}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end md:self-center">
                    <div className="text-right">
                      <div className="text-xs text-slate-400">Progress saat ini</div>
                      <div className="font-mono font-bold text-rose-600 text-sm">{enroll.progress}% / 100%</div>
                    </div>

                    <div className="space-y-0.5">
                      <div className="text-[10px] text-slate-400">Deadline</div>
                      <div className="text-xs font-mono font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {enroll.deadline}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 🆕 User Baru (7 vs 30 Hari terakhir) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4" id="monitor-new-users">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-sans font-semibold text-slate-800 text-md flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-500" /> Karyawan Baru Terdaftar
              </h3>
              <p className="text-xs text-slate-400">Data karyawan yang baru saja didaftarkan ke LMS</p>
            </div>

            <div className="flex bg-slate-50 p-1 rounded-lg border border-slate-100 text-xs font-medium text-slate-600" id="new-user-tab-selector">
              <button 
                onClick={() => setNewUserTimeframe(7)}
                className={`px-3 py-1 rounded-md transition-all ${newUserTimeframe === 7 ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'}`}
              >
                7 Hari Terakhir
              </button>
              <button 
                onClick={() => setNewUserTimeframe(30)}
                className={`px-3 py-1 rounded-md transition-all ${newUserTimeframe === 30 ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'}`}
              >
                30 Hari Terakhir
              </button>
            </div>
          </div>

          <div className="overflow-y-auto max-h-76 divide-y divide-slate-100 border border-slate-50 rounded-xl" id="new-users-list-container">
            {newUsers.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">Tidak ada karyawan baru dalam periode ini.</div>
            ) : (
              newUsers.map(user => (
                <div key={user.id} className="p-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div>
                    <div className="font-medium text-slate-800">{user.name}</div>
                    <div className="text-xs text-slate-400">{user.division} • {user.branch} • {user.role}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100 font-medium">
                      Didaftar: {user.dateCreated}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* 📚 COURSE PERFORMANCE FRAME */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6" id="admin-course-performance-analysis">
        <div>
          <h3 className="font-display font-medium text-slate-800 text-lg">Analisis Kinerja Course & Modul</h3>
          <p className="text-xs text-slate-400">Informasi efektivitas, ketertarikan, dan tingkat kesulitan masing-masing modul</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="course-reports-grid">
          
          {/* 🔥 Course Paling Populer */}
          <div className="space-y-3" id="popular-courses-col">
            <h4 className="text-sm font-semibold text-slate-750 border-l-4 border-blue-600 pl-2">
              🔥 Course Terpopuler (Enrollment)
            </h4>
            
            <div className="space-y-2.5" id="popular-cards-stack">
              {popularCourses.map((c, i) => (
                <div key={c.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div className="space-y-0.5 max-w-2/3">
                    <div className="font-medium text-xs text-slate-800 truncate" title={c.title}>{c.title}</div>
                    <div className="text-[10px] text-slate-400 font-mono italic">{c.category}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-700 font-mono">{c.enrollmentCount}</div>
                    <div className="text-[9px] text-slate-400 uppercase tracking-wide">Pendaftar</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 🥇 Course dengan Completion Tertinggi */}
          <div className="space-y-3" id="highest-completion-courses-col">
            <h4 className="text-sm font-semibold text-slate-700 border-l-4 border-emerald-500 pl-2">
              🏆 Completion Rate Tertinggi
            </h4>
            
            <div className="space-y-2.5" id="completion-cards-stack">
              {topCompletedCourses.map((c, i) => (
                <div key={c.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div className="space-y-0.5 max-w-2/3">
                    <div className="font-medium text-xs text-slate-800 truncate" title={c.title}>{c.title}</div>
                    <div className="text-[10px] text-slate-400 font-mono italic">{c.category}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-emerald-600 font-mono">{c.completionRate}%</div>
                    <div className="text-[9px] text-slate-400 uppercase tracking-wide">Tingkat Lulus</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 😴 Course Jarang Diakses / Evaluasi */}
          <div className="space-y-3" id="rarely-accessed-courses-col">
            <h4 className="text-sm font-semibold text-slate-700 border-l-4 border-amber-500 pl-2">
              😴 Course Jarang Diakses (Evaluasi)
            </h4>
            
            <div className="space-y-2.5" id="rarely-cards-stack">
              {rarelyAccessedCourses.map((c, i) => (
                <div key={c.id} className="p-3 bg-amber-50/20 rounded-xl border border-amber-100/50 flex flex-col gap-1.5 justify-between">
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-xs text-slate-800 truncate max-w-2/3" title={c.title}>{c.title}</div>
                    <span className="text-[9px] font-mono font-bold text-slate-500">{c.totalAccess} Klik</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>Terakhir diakses:</span>
                    <span className="font-mono text-slate-600">{new Date(c.lastAccess).toLocaleDateString('id-ID')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 📊 BAR CHART / LIST REPRESENTATION OF ALL COMPLETION RATES */}
        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100/80 space-y-4" id="average-completion-by-course">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <h4 className="text-sm font-semibold text-slate-800">📊 Rangkuman Average Completion Rate</h4>
            <span className="text-xs text-slate-400">Evaluasi efisiensi modul instruksional</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="average-completion-cards-row">
            {coursePerformance.map(course => (
              <div key={course.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <span className="text-[9px] font-mono px-2 py-0.5 bg-slate-50 text-slate-500 border border-slate-150 rounded-sm">
                    {course.category}
                  </span>
                  <p className="font-medium text-xs text-slate-800 truncate" title={course.title}>{course.title}</p>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between items-baseline text-xs">
                    <span className="text-slate-400 text-[10px]">Completion Rate:</span>
                    <span className="font-bold text-slate-800 font-mono">{course.completionRate}%</span>
                  </div>
                  
                  {/* Progress bar visual */}
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-blue-600 h-full rounded-full" 
                      style={{ width: `${course.completionRate}%` }} 
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 📅 TIMELINE AKTIVITAS TERBARU */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4" id="admin-recent-timeline">
        <div>
          <h3 className="font-display font-medium text-slate-800 text-lg">📅 Aktivitas Terbaru</h3>
          <p className="text-xs text-slate-400">Log operasional real-time di seluruh infrastruktur LMS</p>
        </div>

        <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100" id="activity-timeline-scaffold">
          {mockActivities.map(act => (
            <div key={act.id} className="relative group" id={`timeline-item-${act.id}`}>
              {/* Icon marker */}
              <span className={`absolute -left-[22px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white flex items-center justify-center ${
                act.type === 'login' ? 'bg-amber-500' :
                act.type === 'course_completed' ? 'bg-emerald-500' :
                act.type === 'quiz_finished' ? 'bg-blue-500' :
                act.type === 'cert_issued' ? 'bg-violet-500' : 'bg-slate-500'
              }`} />
              
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100/50 group-hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <span className="font-semibold text-slate-800 text-xs sm:text-sm">{act.userName} </span>
                  <span className="text-xs text-slate-500">[{act.userDivision}] — </span>
                  <span className="text-xs text-slate-600 font-medium">{act.detail}</span>
                </div>
                
                <span className="text-[10px] font-mono text-slate-400 whitespace-nowrap bg-white px-2 py-1 rounded border border-slate-100 shadow-xs self-start sm:self-center">
                  {new Date(act.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
