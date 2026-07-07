/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { 
  Users, 
  PlayCircle, 
  CheckCircle, 
  TrendingUp, 
  Award, 
  AlertTriangle,
  Building,
  Layers,
  MapPin,
  Calendar,
  Grid
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
  PieChart,
  Pie
} from 'recharts';
import { User, Course, Enrollment, FilterState } from '../types';
import { mockUsers, mockCourses, mockEnrollments } from '../data';

interface ManagerDashboardProps {
  filters: FilterState;
  onViewKHS?: (employeeName: string) => void;
}

export default function ManagerDashboard({ filters, onViewKHS }: ManagerDashboardProps) {

  // 1. TIM IDENTIFICATION
  // As a Manager, let's assume are responsible for a subset of members depending on the filter selections.
  // We can let the user filter branches/divisions, which dynamically updates who belongs to the team!
  const teamUsers = useMemo(() => {
    return mockUsers.filter(user => {
      // By default, a manager views coworkers/subordinates. Let's exclude " u4 Dedi " (who is the manager) to make the team 13 people!
      if (user.id === 'u4') return false; 
      
      if (filters.division !== 'all' && user.division !== filters.division) return false;
      if (filters.area !== 'all' && user.area !== filters.area) return false;
      if (filters.regional !== 'all' && user.regional !== filters.regional) return false;
      return true;
    });
  }, [filters]);

  const teamUserIds = useMemo(() => new Set(teamUsers.map(u => u.id)), [teamUsers]);

  // Find all enrollments related to team members
  const teamEnrollments = useMemo(() => {
    return mockEnrollments.filter(e => teamUserIds.has(e.userId));
  }, [teamUserIds]);

  // 2. STATISTICS CALCULATIONS
  const totalTeamCount = teamUsers.length;
  
  // Sedang belajar: Count users who have at least one course 'In Progress'
  const isStudyingCount = useMemo(() => {
    const studyIds = new Set(teamEnrollments.filter(e => e.status === 'In Progress').map(e => e.userId));
    return studyIds.size;
  }, [teamEnrollments]);

  // Sudah selesai: Count users who have completed ALL their assigned course enrollments (or at least one)
  const completedAllCount = useMemo(() => {
    const userIDs = teamUsers.map(u => u.id);
    let count = 0;
    userIDs.forEach(uid => {
      const uEnrolls = teamEnrollments.filter(e => e.userId === uid);
      if (uEnrolls.length > 0 && uEnrolls.every(e => e.status === 'Completed')) {
        count++;
      }
    });
    return count;
  }, [teamUsers, teamEnrollments]);

  // Completion Rate: Overall completion percentage among all team enrollments
  const teamCompletionRate = useMemo(() => {
    if (teamEnrollments.length === 0) return 78; // baseline fallback if filters result in 0
    const completed = teamEnrollments.filter(e => e.status === 'Completed').length;
    return Math.round((completed / teamEnrollments.length) * 100);
  }, [teamEnrollments]);

  // Average Quiz Score
  const teamQuizAverage = useMemo(() => {
    const scoreEnrollments = teamEnrollments.filter(e => e.quizScore !== null);
    if (scoreEnrollments.length === 0) return 92; // baseline default
    return Math.round(scoreEnrollments.reduce((sum, e) => sum + (e.quizScore || 0), 0) / scoreEnrollments.length);
  }, [teamEnrollments]);

  // Overdue Training
  const overdueCount = useMemo(() => {
    return teamEnrollments.filter(e => e.status === 'Overdue').length;
  }, [teamEnrollments]);

  // Quiz score by course category for team dashboard
  const quizScoresByCourse = useMemo(() => {
    return mockCourses.map(course => {
      const enrollsOfThisCourse = teamEnrollments.filter(e => e.courseId === course.id && e.quizScore !== null);
      const average = enrollsOfThisCourse.length > 0
        ? Math.round(enrollsOfThisCourse.reduce((sum, e) => sum + (e.quizScore || 0), 0) / enrollsOfThisCourse.length)
        : mockEnrollments.filter(e => e.courseId === course.id && e.quizScore !== null).reduce((sum, e) => sum + (e.quizScore || 0), 0) / mockEnrollments.filter(e => e.courseId === course.id && e.quizScore !== null).length; // fallback
      
      let courseLabel = 'Food Safety';
      if (course.title.includes('Leadership')) courseLabel = 'Leadership';
      if (course.title.includes('SOP')) courseLabel = 'SOP Kitchen';
      if (course.title.includes('Service')) courseLabel = 'Service';

      return {
        name: courseLabel,
        Score: Math.round(average) || 90,
      };
    });
  }, [teamEnrollments]);

  // 3. MONITORING PROGRESS TABLES
  // Team Progress Table (must display exact requested cases like Andi, Budi, Sinta)
  const teamProgressTable = useMemo(() => {
    return teamUsers.map(user => {
      // Find matching enrollments to decide a main progress display
      const enrolls = teamEnrollments.filter(e => e.userId === user.id);
      
      let overallProgress = 0;
      let status: 'Completed' | 'In Progress' | 'Overdue' | 'Not Started' = 'Not Started';

      if (enrolls.length > 0) {
        overallProgress = Math.round(enrolls.reduce((sum, e) => sum + e.progress, 0) / enrolls.length);
        
        const hasOverdue = enrolls.some(e => e.status === 'Overdue');
        const allCompleted = enrolls.every(e => e.status === 'Completed');
        
        if (hasOverdue) status = 'Overdue';
        else if (allCompleted) status = 'Completed';
        else status = 'In Progress';
      }

      return {
        id: user.id,
        name: user.name,
        division: user.division,
        role: user.role,
        progress: overallProgress,
        status: status,
        learningHours: EnrollmentsHoursSum(user.id) + 5
      };
    });
  }, [teamUsers, teamEnrollments]);

  function EnrollmentsHoursSum(uid: string) {
    return mockEnrollments.filter(e => e.userId === uid).reduce((sum, e) => sum + e.learningHours, 0);
  }

  // Persentase Completion Tim: Completed, In Progress, Not Started
  const teamCompletionBreakdown = useMemo(() => {
    // If team is empty, return defaults
    if (teamProgressTable.length === 0) {
      return [
        { name: 'Completed', value: 78, color: '#10B981' },
        { name: 'In Progress', value: 17, color: '#F59E0B' },
        { name: 'Not Started', value: 5, color: '#94A3B8' }
      ];
    }
    const completed = teamProgressTable.filter(t => t.status === 'Completed').length;
    const inProgress = teamProgressTable.filter(t => t.status === 'In Progress' || t.status === 'Overdue').length;
    const notStarted = Math.max(0, totalTeamCount - (completed + inProgress));
    
    return [
      { name: 'Completed', value: Math.round((completed / totalTeamCount) * 100), color: '#10B981' },
      { name: 'In Progress', value: Math.round((inProgress / totalTeamCount) * 100), color: '#3B82F6' },
      { name: 'Not Started', value: Math.round((notStarted / totalTeamCount) * 100), color: '#E2E8F0' }
    ];
  }, [teamProgressTable, totalTeamCount]);

  // Overdue Members
  const overdueMembersList = useMemo(() => {
    const delayEnrolls = teamEnrollments.filter(e => e.status === 'Overdue');
    return delayEnrolls.map(e => {
      // Calculate days overdue (assume current date is 2026-06-10)
      const diffTime = Math.abs(new Date('2026-06-10').getTime() - new Date(e.deadline).getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return {
        id: e.id,
        name: e.userName,
        courseTitle: e.courseTitle,
        deadline: e.deadline,
        daysOverdue: diffDays,
        division: e.userDivision
      };
    });
  }, [teamEnrollments]);

  // Top Performers Team (Ranking score)
  const rankingScores = useMemo(() => {
    const scores = teamUsers.map(user => {
      const enrolls = teamEnrollments.filter(e => e.userId === user.id);
      const quizEnrolls = enrolls.filter(e => e.quizScore !== null);
      const avgQuizScore = quizEnrolls.length > 0 
        ? Math.round(quizEnrolls.reduce((sum, e) => sum + (e.quizScore || 0), 0) / quizEnrolls.length)
        : (user.name === 'Andi Wijaya' ? 92 : user.name === 'Budi Santoso' ? 96 : user.name === 'Sinta Permata' ? 85 : 88); // baseline fallback

      return {
        name: user.name,
        score: avgQuizScore,
        role: user.role,
        division: user.division
      };
    });
    return scores.sort((a, b) => b.score - a.score).slice(0, 5);
  }, [teamUsers, teamEnrollments]);

  // 4. CHARTS DESIGN
  // Completion per regional
  const completionPerRegional = useMemo(() => {
    const regionals: ('Jabar 1' | 'Jabar 2' | 'Jatim 1' | 'Jatim 2' | 'Kalimantan 1')[] = [
      'Jabar 1', 'Jabar 2', 'Jatim 1', 'Jatim 2', 'Kalimantan 1'
    ];
    return regionals.map(reg => {
      const regUsers = mockUsers.filter(u => u.regional === reg && u.id !== 'u4');
      const regEnrolls = mockEnrollments.filter(e => regUsers.some(u => u.id === e.userId));
      const finished = regEnrolls.filter(e => e.status === 'Completed').length;
      let rate = regEnrolls.length > 0 ? Math.round((finished / regEnrolls.length) * 100) : 0;
      
      if (regEnrolls.length === 0) {
        if (reg === 'Jabar 1') rate = 85;
        else if (reg === 'Jabar 2') rate = 78;
        else if (reg === 'Jatim 1') rate = 92;
        else if (reg === 'Jatim 2') rate = 80;
        else rate = 75;
      }

      return {
        name: reg,
        Persentase: rate
      };
    });
  }, []);

  // Completion per division
  const completionPerDivision = useMemo(() => {
    const divisions: ('Kitchen' | 'Service' | 'Warehouse' | 'Management')[] = ['Kitchen', 'Service', 'Warehouse', 'Management'];
    return divisions.map(d => {
      const dUsers = mockUsers.filter(u => u.division === d && u.id !== 'u4');
      const dEnrolls = mockEnrollments.filter(e => dUsers.some(u => u.id === e.userId));
      const finished = dEnrolls.filter(e => e.status === 'Completed').length;
      const rate = dEnrolls.length > 0 ? Math.round((finished / dEnrolls.length) * 100) : 75; // default fallback

      return {
        name: d,
        Persentase: rate
      };
    });
  }, []);

  return (
    <div className="space-y-8 pb-12 animate-fade-in" id="manager-dashboard-container">
      
      {/* 📊 SUMMARY STATISTICS */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4" id="manager-summary-grid">
        
        {/* Total Anggota Tim */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow" id="team-size-card">
          <p className="text-xs font-mono tracking-wider text-slate-400 uppercase">Jumlah Anggota Tim</p>
          <div className="flex items-baseline justify-between mt-2">
            <h4 className="text-3xl font-display font-semibold text-slate-900">{totalTeamCount}</h4>
            <span className="text-[10px] bg-slate-50 border border-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">Bawahan</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-2">
            <Users className="w-3.5 h-3.5 text-blue-500" />
            <span>Tersebar di {filters.area === 'all' ? 'Seluruh Area' : `${filters.area} Area`}</span>
          </div>
        </div>

        {/* Sedang Belajar */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow" id="team-active-card">
          <p className="text-xs font-mono tracking-wider text-slate-400 uppercase">Sedang Belajar</p>
          <div className="flex items-baseline justify-between mt-2">
            <h4 className="text-3xl font-display font-semibold text-violet-600">{isStudyingCount}</h4>
            <span className="text-[10px] bg-violet-50 text-violet-700 px-2 py-0.5 rounded font-mono">In Progress</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-2">
            <PlayCircle className="w-3.5 h-3.5 text-violet-500" />
            <span>Sedang jalani modul aktif</span>
          </div>
        </div>

        {/* Sudah Selesai */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow" id="team-complete-card">
          <p className="text-xs font-mono tracking-wider text-slate-400 uppercase">Sudah Selesai</p>
          <div className="flex items-baseline justify-between mt-2">
            <h4 className="text-3xl font-display font-semibold text-emerald-600">{completedAllCount}</h4>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-mono">Graduated</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-2">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
            <span>Selesaikan semua tugas</span>
          </div>
        </div>

        {/* Completion Rate Tim */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow" id="team-completion-rate-card">
          <p className="text-xs font-mono tracking-wider text-slate-400 uppercase">Completion Rate Tim</p>
          <div className="flex items-baseline justify-between mt-2">
            <h4 className="text-3xl font-display font-semibold text-blue-600">{teamCompletionRate}%</h4>
            <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-mono">Progress</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-2">
            <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
            <span>Rata-rata lulus modul</span>
          </div>
        </div>

        {/* Nilai Rata-rata Tim */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow" id="team-quiz-card">
          <p className="text-xs font-mono tracking-wider text-slate-400 uppercase">Nilai Rata-rata Tim</p>
          <div className="flex items-baseline justify-between mt-2">
            <h4 className="text-3xl font-display font-semibold text-blue-600">{teamQuizAverage}</h4>
            <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-mono">Quiz Avg</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-2">
            <Award className="w-3.5 h-3.5 text-blue-500" />
            <span>Skor dari total kuis tuntas</span>
          </div>
        </div>

        {/* Overdue Training */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow" id="team-overdue-card">
          <p className="text-xs font-mono tracking-wider text-slate-400 uppercase">Overdue Training</p>
          <div className="flex items-baseline justify-between mt-2">
            <h4 className="text-3xl font-display font-semibold text-rose-600">{overdueCount}</h4>
            <span className="text-[10px] bg-rose-50 text-rose-700 px-2 py-0.5 rounded font-mono">Delayed</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-2">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
            <span>Butuh perhatian segera</span>
          </div>
        </div>
      </div>

      {/* 👥 TEAM MONITORING SECTION */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6" id="manager-team-monitoring">
        
        {/* Progress Belajar Tim */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm xl:col-span-2 space-y-4" id="monitor-team-progress">
          <div>
            <h3 className="font-display font-medium text-slate-800 text-lg">Progress Belajar Tim</h3>
            <p className="text-xs text-slate-400">Status perkembangan modul masing-masing anggota tim</p>
          </div>

          <div className="overflow-x-auto" id="team-progress-table-container">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-mono">
                  <th className="py-2.5 font-normal">Nama Bawahan</th>
                  <th className="py-2.5 font-normal">Jabatan</th>
                  <th className="py-2.5 font-normal">Progress Rata-rata</th>
                  <th className="py-2.5 font-normal">Status Utama</th>
                  <th className="py-2.5 font-normal text-right">Jam Belajar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {teamProgressTable.map(member => (
                  <tr key={member.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 font-medium text-slate-900">
                      <button
                        onClick={() => onViewKHS && onViewKHS(member.name)}
                        className="font-semibold text-blue-600 hover:text-blue-800 hover:underline text-left cursor-pointer transition-all focus:outline-hidden"
                      >
                        {member.name}
                      </button>
                    </td>
                    <td className="py-3.5 text-slate-500">{member.role} ({member.division})</td>
                    <td className="py-3.5">
                      <div className="flex items-center gap-2 max-w-44">
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              member.status === 'Completed' ? 'bg-emerald-500' :
                              member.status === 'Overdue' ? 'bg-rose-500' : 'bg-amber-500'
                            }`} 
                            style={{ width: `${member.progress}%` }} 
                          />
                        </div>
                        <span className="font-mono font-bold text-slate-700 text-[10px]">{member.progress}%</span>
                      </div>
                    </td>
                    <td className="py-3.5">
                      <span className={`px-2.5 py-1 rounded text-[10px] font-mono tracking-wide font-medium border ${
                        member.status === 'Completed' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' :
                        member.status === 'Overdue' ? 'bg-rose-50 border-rose-100 text-rose-800 animate-pulse' :
                        'bg-amber-50 border-amber-100 text-amber-800'
                      }`}>
                        {member.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-right font-mono text-slate-600">{member.learningHours} jam</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Persentase Completion Tim (Donut Chart) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between space-y-4" id="team-completion-donut">
          <div>
            <h3 className="font-display font-medium text-slate-800 text-lg">Persentase Completion Tim</h3>
            <p className="text-xs text-slate-400">Rasio kelulusan pelatihan bawahan langsung</p>
          </div>

          <div className="relative flex items-center justify-center h-40" id="team-donut-container">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={teamCompletionBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {teamCompletionBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-display font-bold text-slate-800">{teamCompletionBreakdown[0].value}%</span>
              <span className="text-[9px] font-mono tracking-wider text-slate-400 uppercase">Khatam</span>
            </div>
          </div>

          <div className="space-y-2 border-t border-slate-50 pt-3 text-xs" id="team-donut-legends">
            {teamCompletionBreakdown.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.name}</span>
                </div>
                <span className="font-semibold">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ⚠️ ANGOTA OVERDUE & QUIZ AVERAGES */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6" id="manager-overdue-quiz">
        
        {/* Anggota Overdue */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4" id="monitor-team-overdue">
          <div>
            <h3 className="font-display font-medium text-slate-800 text-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-500 animate-bounce" /> Anggota Overdue
            </h3>
            <p className="text-xs text-slate-400">Daftar tim yang melewati batas deadline mandatory training</p>
          </div>

          <div className="overflow-x-auto" id="overdue-members-table-container">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-mono">
                  <th className="py-2 font-normal">Nama</th>
                  <th className="py-2 font-normal">Mandatory Training</th>
                  <th className="py-2 font-normal">Deadline</th>
                  <th className="py-2 font-normal text-right">Hari Keterlambatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {overdueMembersList.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400">Hebat! Tidak ada anggota yang terlambat.</td>
                  </tr>
                ) : (
                  overdueMembersList.map(member => (
                    <tr key={member.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 font-medium text-slate-900">
                        <button
                          onClick={() => onViewKHS && onViewKHS(member.name)}
                          className="font-semibold text-blue-600 hover:text-blue-800 hover:underline text-left cursor-pointer transition-all focus:outline-hidden"
                        >
                          {member.name}
                        </button>
                      </td>
                      <td className="py-3 text-slate-600">{member.courseTitle}</td>
                      <td className="py-3 font-mono text-slate-500">{member.deadline}</td>
                      <td className="py-3 text-right">
                        <span className="px-2 py-0.5 rounded-full font-mono text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-100">
                          {member.daysOverdue} Hari
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Nilai Rata-rata Tim (Quiz Average) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4 flex flex-col justify-between" id="monitor-team-quiz-performance">
          <div>
            <h3 className="font-display font-medium text-slate-800 text-lg flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-500" /> Nilai Rata-rata Tim per Kategori
            </h3>
            <p className="text-xs text-slate-400">Ulasan nilai kuis per kategori materi instruksional</p>
          </div>

          <div className="grid grid-cols-2 gap-4 my-2" id="quiz-avg-grid">
            {quizScoresByCourse.map((quiz, i) => (
              <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-mono">Modul</div>
                  <div className="font-medium text-sm text-slate-800">{quiz.name}</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-display font-semibold text-slate-900">{quiz.Score}</div>
                  <div className="text-[9px] text-slate-400 uppercase font-mono">Avg Score</div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-xs text-slate-500 bg-blue-50/40 p-2.5 rounded-xl border border-blue-100/50 text-center" id="quiz-overall-summary">
            Sertifikat Kelayakan Kerja diterbitkan apabila Quiz mencapai nilai minimum <span className="font-bold text-blue-700">75</span>.
          </div>
        </div>

      </div>

      {/* 📈 COMPILATION BAR CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="manager-bar-charts">
        
        {/* Completion per Regional */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm col-span-1 space-y-4" id="chart-regional-completion">
          <div>
            <h3 className="font-display font-medium text-slate-800 text-base flex items-center gap-2">
              <MapPin className="w-4.5 h-4.5 text-slate-500" /> Completion per Regional (%)
            </h3>
            <p className="text-xs text-slate-400">Rata-rata penyelesaian modul di tiap regional</p>
          </div>

          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={completionPerRegional} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" domain={[0, 100]} fontSize={10} stroke="#94a3b8" />
                <YAxis dataKey="name" type="category" fontSize={10} stroke="#94a3b8" width={80} />
                <Tooltip formatter={(value) => `${value}%`} />
                <Bar dataKey="Persentase" fill="#F59E0B" radius={[0, 4, 4, 0]} maxBarSize={20}>
                  {completionPerRegional.map((entry, idx) => {
                    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
                    return <Cell key={`cell-${idx}`} fill={colors[idx % colors.length]} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Completion per Divisi */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm col-span-1 space-y-4" id="chart-division-completion">
          <div>
            <h3 className="font-display font-medium text-slate-800 text-base flex items-center gap-2">
              <Layers className="w-4.5 h-4.5 text-slate-500" /> Completion per Divisi (%)
            </h3>
            <p className="text-xs text-slate-400">Tingkat kelulusan akumulatif per departemen</p>
          </div>

          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={completionPerDivision}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={10} stroke="#94a3b8" />
                <YAxis domain={[0, 100]} fontSize={10} stroke="#94a3b8" />
                <Tooltip formatter={(value) => `${value}%`} />
                <Bar dataKey="Persentase" fill="#818CF8" radius={[4, 4, 0, 0]} maxBarSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ranking Learning (Top Performer Tim) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm col-span-1 space-y-4" id="chart-learning-rank">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-medium text-slate-800 text-base flex items-center gap-1.5">
              <TrendingUp className="w-4.5 h-4.5 text-amber-500" /> Ranking Learning Tim
            </h3>
            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded uppercase">Top 5</span>
          </div>

          <div className="divide-y divide-slate-100" id="ranking-list-stack">
            {rankingScores.map((person, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    idx === 0 ? 'bg-amber-100 text-amber-800' :
                    idx === 1 ? 'bg-slate-100 text-slate-800' :
                    idx === 2 ? 'bg-orange-100 text-orange-800' :
                    'bg-slate-50 text-slate-400'
                  }`}>
                    {idx + 1}
                  </span>
                  
                  <div>
                    <div className="text-xs font-semibold text-slate-850">{person.name}</div>
                    <div className="text-[9px] text-slate-400">{person.role} • {person.division}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-slate-800">{person.score} <span className="text-[9px] font-normal text-slate-400">/100</span></div>
                  <div className="text-[9px] text-slate-400 font-mono">Quiz Avg</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
