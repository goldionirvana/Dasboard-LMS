/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { 
  Users, 
  Layers, 
  Award, 
  Clock, 
  CheckCircle,
  FileText,
  AlertCircle,
  Activity,
  ArrowRight,
  TrendingUp,
  Star,
  ThumbsUp,
  MessageSquare,
  EyeOff
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
  Radar,
  AreaChart,
  Area
} from 'recharts';
import { User, Course, Enrollment, PrePostTest, FilterState } from '../types';
import { 
  mockUsers, 
  mockCourses, 
  mockEnrollments, 
  mockPrePostTests, 
  mockFeedbackAspects, 
  mockFeedbackComments 
} from '../data';

interface TrainerDashboardProps {
  filters: FilterState;
}

export default function TrainerDashboard({ filters }: TrainerDashboardProps) {
  const [selectedClassFilters, setSelectedClassFilters] = useState<string>('all');
  const PASSING_GRADE = 75;

  // 1. FILTER PARTICIPANTS
  const trainerParticipants = useMemo(() => {
    return mockUsers.filter(u => {
      if (u.id === 'u4') return false; // Exclude top manager
      if (filters.area !== 'all' && u.area !== filters.area) return false;
      if (filters.regional !== 'all' && u.regional !== filters.regional) return false;
      if (filters.division !== 'all' && u.division !== filters.division) return false;
      return true;
    });
  }, [filters]);

  const participantIds = useMemo(() => new Set(trainerParticipants.map(u => u.id)), [trainerParticipants]);

  // Filter enrollments matching current participants
  const participantEnrollments = useMemo(() => {
    return mockEnrollments.filter(e => {
      if (!participantIds.has(e.userId)) return false;
      if (filters.category !== 'all') {
        const course = mockCourses.find(c => c.id === e.courseId);
        if (!course || course.category !== filters.category) return false;
      }
      return true;
    });
  }, [participantIds, filters.category]);

  // 2. STATISTICS CALCULATIONS
  const totalParticipants = trainerParticipants.length;
  
  const totalClasses = useMemo(() => {
    // Dynamically check how many core courses or locations are mapped
    const coursesCount = filters.category === 'all' ? 4 : 1;
    const regionalsCount = filters.regional === 'all' ? (filters.area === 'all' ? 5 : 2) : 1;
    return coursesCount * regionalsCount;
  }, [filters]);

  const trainerCompletionRate = useMemo(() => {
    if (participantEnrollments.length === 0) return 85; // baseline fallback
    const completed = participantEnrollments.filter(e => e.status === 'Completed').length;
    return Math.round((completed / participantEnrollments.length) * 100);
  }, [participantEnrollments]);

  const averageQuizScore = useMemo(() => {
    const scored = participantEnrollments.filter(e => e.quizScore !== null);
    if (scored.length === 0) return 90; // fallback
    return Math.round(scored.reduce((sum, e) => sum + (e.quizScore || 0), 0) / scored.length);
  }, [participantEnrollments]);

  const averageLearningTime = useMemo(() => {
    const scored = participantEnrollments;
    if (scored.length === 0) return 18.5; // fallback
    const elapsed = scored.reduce((sum, e) => sum + e.learningHours, 0);
    return Math.round((elapsed / scored.length) * 10) / 10;
  }, [participantEnrollments]);

  const certificatesIssued = useMemo(() => {
    return participantEnrollments.filter(e => e.status === 'Completed').length;
  }, [participantEnrollments]);

  // 3. MONITORING PARTICIPANTS
  // Progress Peserta Table (Nama, Progress, Quiz, Status)
  const progressPesertaList = useMemo(() => {
    return participantEnrollments.map(e => {
      return {
        id: e.id,
        name: e.userName,
        courseTitle: e.courseTitle,
        progress: e.progress,
        quizScore: e.quizScore,
        status: e.status
      };
    });
  }, [participantEnrollments]);

  // Peserta Belum Lulus (Quiz < 75)
  const failedParticipants = useMemo(() => {
    return participantEnrollments
      .filter(e => e.quizScore !== null && e.quizScore < PASSING_GRADE)
      .map(e => {
        return {
          id: e.id,
          name: e.userName,
          course: e.courseTitle,
          quizScore: e.quizScore as number,
          passingGrade: PASSING_GRADE,
          status: 'Belum Lulus'
        };
      });
  }, [participantEnrollments]);

  // Peserta Belum Login index
  const neverLoggedInParticipants = useMemo(() => {
    return trainerParticipants.filter(u => u.lastLogin === null);
  }, [trainerParticipants]);

  // Quiz Analysis distribution
  const quizAnalysisStats = useMemo(() => {
    const scores = participantEnrollments.filter(e => e.quizScore !== null).map(e => e.quizScore as number);
    if (scores.length === 0) {
      return { avg: 90, max: 100, min: 90, passCount: 14, passRate: 100, distribution: [] };
    }
    const sum = scores.reduce((a, b) => a + b, 0);
    const avg = Math.round(sum / scores.length);
    const max = Math.max(...scores);
    const min = Math.min(...scores);
    
    const passCount = scores.filter(s => s >= PASSING_GRADE).length;
    const passRate = Math.round((passCount / scores.length) * 100);

    // Distribution groupings: <75, 75-84, 85-94, 95-100
    const d1 = scores.filter(s => s < 75).length;
    const d2 = scores.filter(s => s >= 75 && s < 85).length;
    const d3 = scores.filter(s => s >= 85 && s < 95).length;
    const d4 = scores.filter(s => s >= 95).length;

    const distribution = [
      { range: '<75', jumlah: d1, fill: '#ef4444' },
      { range: '75-84', jumlah: d2, fill: '#f59e0b' },
      { range: '85-94', jumlah: d3, fill: '#3b82f6' },
      { range: '95-100', jumlah: d4, fill: '#10b981' }
    ];

    return { avg, max, min, passCount, passRate, distribution };
  }, [participantEnrollments]);

  // 4. LEARNING GAIN INDEX (Pre-test vs Post-test comparison)
  const lgiList = useMemo(() => {
    // Filter matching currently scoped participants
    const originalTests = mockPrePostTests.filter(test => {
      const foundUser = mockUsers.find(u => u.name === test.userName);
      if (!foundUser) return false;
      return participantIds.has(foundUser.id);
    });

    return originalTests.map(test => {
      const lgi = test.postTest - test.preTest;
      return {
        ...test,
        lgi: lgi >= 0 ? `+${lgi}` : `${lgi}`,
        lgiValue: lgi
      };
    });
  }, [participantIds]);

  const lgiSummary = useMemo(() => {
    if (lgiList.length === 0) {
      return { avgGain: 28, positiveRate: 100 };
    }
    const gains = lgiList.map(t => t.lgiValue);
    const avgGain = Math.round(gains.reduce((a, b) => a + b, 0) / gains.length);
    const positiveCount = gains.filter(g => g > 0).length;
    const positiveRate = Math.round((positiveCount / gains.length) * 100);

    return { avgGain, positiveRate };
  }, [lgiList]);


  return (
    <div className="space-y-8 pb-12 animate-fade-in" id="trainer-dashboard-container">
      
      {/* 📊 SUMMARY STATISTICS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4" id="trainer-summary-grid">
        
        {/* Total Peserta */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow" id="trainer-card-participants">
          <p className="text-xs font-mono tracking-wider text-slate-400 uppercase">Total Peserta Kelas</p>
          <div className="flex items-baseline justify-between mt-2">
            <h4 className="text-3xl font-display font-semibold text-slate-900">{totalParticipants}</h4>
            <span className="text-[10px] bg-slate-50 border border-slate-100 font-mono px-2 py-0.5 rounded text-slate-600">Siswa</span>
          </div>
          <div className="flex items-center gap-1 mt-2 text-[10px] text-slate-500">
            <Users className="w-3.5 h-3.5 text-blue-500" />
            <span>Peserta aktif ditangani</span>
          </div>
        </div>

        {/* Total Kelas */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow" id="trainer-card-classes">
          <p className="text-xs font-mono tracking-wider text-slate-400 uppercase">Total Kelas Bimbingan</p>
          <div className="flex items-baseline justify-between mt-2">
            <h4 className="text-3xl font-display font-semibold text-violet-600">{totalClasses}</h4>
            <span className="text-[10px] bg-violet-50 text-violet-700 font-mono px-2 py-0.5 rounded">Rombel</span>
          </div>
          <div className="flex items-center gap-1 mt-2 text-[10px] text-slate-500">
            <Layers className="w-3.5 h-3.5 text-violet-500" />
            <span>Materi didistribusikan</span>
          </div>
        </div>

        {/* Completion Rate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow" id="trainer-card-completion">
          <p className="text-xs font-mono tracking-wider text-slate-400 uppercase">Completion Rate</p>
          <div className="flex items-baseline justify-between mt-2">
            <h4 className="text-3xl font-display font-semibold text-emerald-600">{trainerCompletionRate}%</h4>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 font-mono px-2 py-0.5 rounded">Tamat</span>
          </div>
          <div className="flex items-center gap-1 mt-2 text-[10px] text-slate-500">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
            <span>Peserta merampungkan modul</span>
          </div>
        </div>

        {/* Average Quiz Score */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow" id="trainer-card-quiz">
          <p className="text-xs font-mono tracking-wider text-slate-400 uppercase">Avg Quiz Score</p>
          <div className="flex items-baseline justify-between mt-2">
            <h4 className="text-3xl font-display font-semibold text-blue-600">{averageQuizScore}</h4>
            <span className="text-[10px] bg-blue-50 text-blue-700 font-mono px-2 py-0.5 rounded">Skor Kuis</span>
          </div>
          <div className="flex items-center gap-1 mt-2 text-[10px] text-slate-500">
            <Award className="w-3.5 h-3.5 text-blue-500" />
            <span>Evaluasi materi tuntas</span>
          </div>
        </div>

        {/* Average Learning Time */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow" id="trainer-card-learningtime">
          <p className="text-xs font-mono tracking-wider text-slate-400 uppercase">Avg Learning Time</p>
          <div className="flex items-baseline justify-between mt-2">
            <h4 className="text-3xl font-display font-semibold text-blue-600">{averageLearningTime}h</h4>
            <span className="text-[10px] bg-blue-50 text-blue-700 font-mono px-2 py-0.5 rounded">Durasi</span>
          </div>
          <div className="flex items-center gap-1 mt-2 text-[10px] text-slate-500">
            <Clock className="w-3.5 h-3.5 text-blue-500" />
            <span>Rata-rata jam per siswa</span>
          </div>
        </div>

        {/* Certificates Issued */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow" id="trainer-card-certificates">
          <p className="text-xs font-mono tracking-wider text-slate-400 uppercase">Sertifikat Terbit</p>
          <div className="flex items-baseline justify-between mt-2">
            <h4 className="text-3xl font-display font-semibold text-amber-600">{certificatesIssued}</h4>
            <span className="text-[10px] bg-amber-50 text-amber-700 font-mono px-2 py-0.5 rounded">Certs</span>
          </div>
          <div className="flex items-center gap-1 mt-2 text-[10px] text-slate-500">
            <Award className="w-3.5 h-3.5 text-amber-500" />
            <span>Sertifikat kelulusan tuntas</span>
          </div>
        </div>
      </div>

      {/* 👥 MONITORING PESERTA TIMELINE & TABLES */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6" id="trainer-monitoring-row">
        
        {/* Progress Peserta */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4" id="trainer-participants-progress">
          <div>
            <h3 className="font-display font-medium text-slate-800 text-lg">Progress Peserta Kelas</h3>
            <p className="text-xs text-slate-400">Daftar perkembangan tiap peserta di kelas yang Anda tangani</p>
          </div>

          <div className="overflow-y-auto max-h-96 divide-y divide-slate-100 border border-slate-50 rounded-xl" id="progress-list-scroller">
            {progressPesertaList.map(peserta => (
              <div key={peserta.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="space-y-1">
                  <div className="font-semibold text-slate-800 text-sm">{peserta.name}</div>
                  <div className="text-xs text-slate-500">{peserta.courseTitle}</div>
                </div>
                
                <div className="flex items-center gap-5">
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 leading-tight">Progress</div>
                    <div className="font-mono font-bold text-slate-700 text-xs">{peserta.progress}%</div>
                  </div>

                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 leading-tight">Quiz</div>
                    <div className="font-mono font-bold text-slate-700 text-xs">{peserta.quizScore !== null ? peserta.quizScore : '-'}</div>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium border ${
                    peserta.status === 'Completed' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' :
                    peserta.status === 'Overdue' ? 'bg-rose-50 border-rose-100 text-rose-800' :
                    'bg-slate-50 border-slate-150 text-slate-600'
                  }`}>
                    {peserta.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hasil & Distribusi Quiz */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between space-y-4" id="trainer-quiz-analysis">
          <div>
            <h3 className="font-display font-medium text-slate-800 text-lg">Hasil & Distribusi Nilai Quiz</h3>
            <p className="text-xs text-slate-400">Analisis sebaran nilai kelulusan kuis peserta</p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center my-1" id="quiz-breakdown-numbers">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[9px] font-mono tracking-wider text-slate-400 uppercase leading-none block mb-1">Rata-rata</span>
              <span className="text-2xl font-display font-bold text-slate-800">{quizAnalysisStats.avg}</span>
            </div>
            
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[9px] font-mono tracking-wider text-slate-400 uppercase leading-none block mb-1">Tertinggi</span>
              <span className="text-2xl font-display font-bold text-emerald-600">{quizAnalysisStats.max}</span>
            </div>
            
            <div className="p-3.5 bg-rose-50/40 rounded-xl border border-rose-100/50">
              <span className="text-[9px] font-mono tracking-wider text-rose-500 uppercase leading-none block mb-1">Terendah</span>
              <span className="text-2xl font-display font-bold text-rose-600">{quizAnalysisStats.min}</span>
            </div>
          </div>

          <div className="h-44" id="quiz-dist-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={quizAnalysisStats.distribution}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                <XAxis dataKey="range" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} allowDecimals={false} />
                <Tooltip formatter={(value) => [`${value} Karyawan`]} />
                <Bar dataKey="jumlah" radius={[4, 4, 0, 0]}>
                  {quizAnalysisStats.distribution.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-between items-center bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100/40 text-xs text-slate-600 leading-tight" id="passing-stat-box">
            <span>Tingkat Kelulusan Kelas (&ge;75):</span>
            <span className="font-bold text-emerald-700">{quizAnalysisStats.passRate}% ({quizAnalysisStats.passCount} dari {participantEnrollments.filter(e => e.quizScore !== null).length} peserta kuis)</span>
          </div>
        </div>

        {/* Peserta Belum Lulus (Passing Grade < 75) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4" id="trainer-uncompleted-participants">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-medium text-slate-800 text-base flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-500" /> Peserta Belum Lulus (&lt;{PASSING_GRADE})
              </h3>
              <p className="text-xs text-slate-400">Peserta dengan nilai evaluasi kuis di bawah nilai kelayakan minimum</p>
            </div>
            
            <span className="text-[10px] font-mono px-2 py-0.5 bg-rose-50 border border-rose-100 text-rose-700 rounded-sm">
              Remedial Required
            </span>
          </div>

          <div className="overflow-x-auto" id="failed-table-scroller">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-mono">
                  <th className="py-2.5 font-normal">Nama Peserta</th>
                  <th className="py-2.5 font-normal">Course</th>
                  <th className="py-2.5 font-normal">Nilai Quiz</th>
                  <th className="py-2.5 font-normal">Passing Grade</th>
                  <th className="py-2.5 font-normal text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {failedParticipants.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 bg-slate-50/20 rounded-xl">Awesome! Semua peserta kuis sudah berhasil lulus kriteria KKM ({PASSING_GRADE}).</td>
                  </tr>
                ) : (
                  failedParticipants.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 font-semibold text-slate-850">{item.name}</td>
                      <td className="py-3 text-slate-650">{item.course}</td>
                      <td className="py-3 font-mono font-bold text-rose-600">{item.quizScore}</td>
                      <td className="py-3 font-mono text-slate-500">{item.passingGrade}</td>
                      <td className="py-3 text-right">
                        <span className="px-2 py-0.5 rounded bg-rose-50 text-[10px] border border-rose-100 font-mono font-medium text-rose-750">
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Peserta Belum Pernah Login */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4" id="trainer-unlogged-participants">
          <div>
            <h3 className="font-display font-medium text-slate-800 text-base flex items-center gap-2">
              <EyeOff className="w-5 h-5 text-slate-400" /> Peserta Belum Login
            </h3>
            <p className="text-xs text-slate-400">Anggota kelas terdaftar yang sama sekali belum mengakses materi instruksional</p>
          </div>

          <div className="overflow-y-auto max-h-56 divide-y divide-slate-100 border border-slate-100 rounded-xl" id="trainer-blank-users-list">
            {neverLoggedInParticipants.length === 0 ? (
              <div className="py-12 text-center text-slate-400">Hebat! Seluruh siswa terdaftar telah login ke sistem.</div>
            ) : (
              neverLoggedInParticipants.map(user => (
                <div key={user.id} className="p-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div>
                    <div className="font-semibold text-xs text-slate-800">{user.name}</div>
                    <div className="text-[10px] text-slate-400">{user.division} • {user.regional} • Admin Created: {user.dateCreated}</div>
                  </div>
                  <button 
                    onClick={() => alert(`Mengirim instruksi credential login baru ke ${user.email}`)}
                    className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors font-medium hover:text-slate-900 cursor-pointer"
                  >
                    Kirim Panduan LMS
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* 📝 LGI (LEARNING GAIN INDEX) SECTION (Pre-test vs Post-test comparison) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6" id="trainer-lgi-section">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-display font-medium text-slate-800 text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" /> LGI (Learning Gain Index)
            </h3>
            <p className="text-xs text-slate-400">Peningkatan kompetensi peserta diuji melalui perbandingan komprehensif Pre-test dan Post-test</p>
          </div>

          <div className="flex gap-4" id="lgi-rate-cards">
            {/* Rata-rata Gain */}
            <div className="bg-blue-50 border border-blue-100/50 p-2 px-4 rounded-xl flex items-center gap-3">
              <div className="text-center">
                <div className="text-[9px] uppercase font-mono tracking-wider text-blue-500">Rerata Peningkatan</div>
                <div className="text-lg font-bold text-blue-700">+{lgiSummary.avgGain} Poin</div>
              </div>
            </div>

            {/* % Mengalami Peningkatan */}
            <div className="bg-emerald-50 border border-emerald-100/50 p-2 px-4 rounded-xl flex items-center gap-3">
              <div className="text-center">
                <div className="text-[9px] uppercase font-mono tracking-wider text-emerald-500">Positif Gain %</div>
                <div className="text-lg font-bold text-emerald-700">{lgiSummary.positiveRate}% Peserta</div>
              </div>
            </div>
          </div>
        </div>

        {/* LGI COMPARISON TABLE */}
        <div className="overflow-x-auto border border-slate-100 rounded-xl" id="lgi-tabel-wrapper">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-mono">
                <th className="py-3 px-4 font-normal">Nama Peserta</th>
                <th className="py-3 px-4 font-normal">Nama Kelas Pelatihan</th>
                <th className="py-3 px-4 font-normal text-center">Hasil Pre-Test</th>
                <th className="py-3 px-4 font-normal text-center">Hasil Post-Test</th>
                <th className="py-3 px-4 font-normal text-center">Pencapaian Gain (LGI)</th>
                <th className="py-3 px-4 font-normal text-right">Progress Bar Evaluasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lgiList.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-800">{item.userName}</td>
                  <td className="py-3.5 px-4 text-slate-500">{item.className}</td>
                  <td className="py-3.5 px-4 text-center font-mono text-[#475569]">{item.preTest}</td>
                  <td className="py-3.5 px-4 text-center font-mono text-slate-800 font-semibold">{item.postTest}</td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-block px-2.5 py-0.5 rounded-full font-mono text-xs font-bold bg-blue-50 text-blue-700">
                      {item.lgi}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center gap-2 max-w-40 justify-end">
                      <span className="text-[10px] text-slate-400 font-mono">Pre: {item.preTest}</span>
                      <ArrowRight className="w-3 h-3 text-slate-300" />
                      <span className="text-[10px] text-slate-700 font-bold font-mono">Post: {item.postTest}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ⭐ FEEDBACK PESERTA TERHADAP TRAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="trainer-feedback-row">
        
        {/* Ringkasan Skor Evaluasi (Aspek bar charts) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4 lg:col-span-1 flex flex-col justify-between" id="trainer-feedback-chart-col">
          <div>
            <h3 className="font-display font-medium text-slate-800 text-lg flex items-center gap-1.5">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" /> Feedback Terhadap Trainer
            </h3>
            <p className="text-xs text-slate-400">Rasio ulasan kualitatif pengajaran instruktur</p>
          </div>

          <div className="space-y-3.5 my-2" id="feedback-rating-bars">
            {mockFeedbackAspects.map((aspect, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between items-baseline text-xs leading-none">
                  <span className="text-slate-600 font-medium">{aspect.aspect}</span>
                  <span className="font-bold text-slate-800 font-mono">{aspect.score}/5.0</span>
                </div>
                
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-amber-500 h-full rounded-full" 
                    style={{ width: `${(aspect.score / 5) * 100}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-amber-50/50 border border-amber-100/50 rounded-xl text-center flex items-center justify-center gap-2" id="feedback-overall-star">
            <span className="font-display font-bold text-amber-700 text-base">4.8 / 5.0</span>
            <span className="text-xs text-slate-500">(Sangat Memuaskan)</span>
          </div>
        </div>

        {/* Radar Chart Visualisation of Strength Areas */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4 lg:col-span-1 flex flex-col justify-between" id="trainer-feedback-radar-col">
          <div>
            <h3 className="font-display font-medium text-slate-800 text-base">Kekuatan & Evaluasi Instruktur</h3>
            <p className="text-xs text-slate-400">Analisis radar pemetaan pilar pengajaran trainer</p>
          </div>

          {/* Simple Radar chart mapping the aspect scores */}
          <div className="h-56 flex items-center justify-center" id="radar-chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={mockFeedbackAspects}>
                <PolarGrid stroke="#f1f5f9" />
                <PolarAngleAxis dataKey="aspect" tick={{ fill: '#64748b', fontSize: 8 }} />
                <Radar name="Trainer" dataKey="score" stroke="#2563eb" fill="#93c5fd" fillOpacity={0.6} />
                <Tooltip formatter={(value) => `${value} / 5.0`} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="text-[11px] font-mono text-center text-slate-400 leading-tight">
            Area Utama Unggulan: <strong className="text-slate-700">Interaksi dengan Peserta</strong> (4.9/5)
          </div>
        </div>

        {/* Comments section */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4 lg:col-span-1 flex flex-col justify-between" id="trainer-feedback-reviews-col">
          <div>
            <h3 className="font-display font-medium text-slate-800 text-lg flex items-center gap-1.5">
              <MessageSquare className="w-5 h-5 text-blue-500" /> Komentar Kualitatif Karyawan
            </h3>
            <p className="text-xs text-slate-400">Ulasan autentik tertulis dari peserta pelatihan</p>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-68 my-1 pr-1" id="comments-cards-list">
            {mockFeedbackComments.map((fc) => (
              <div key={fc.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100/50 flex flex-col justify-between" id={`review-card-${fc.id}`}>
                <p className="text-xs text-slate-650 italic leading-relaxed">
                  "{fc.comment}"
                </p>
                
                <div className="flex items-center justify-between border-t border-slate-100 mt-2 pt-2">
                  <div>
                    <span className="font-semibold text-[11px] text-slate-800">{fc.userName}</span>
                    <span className="text-[9px] text-slate-400 block">{fc.courseTitle}</span>
                  </div>
                  
                  <div className="flex items-center text-amber-500 gap-0.5" id="mini-stars">
                    {Array.from({ length: fc.rating }).map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-500" />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-[10px] text-center font-mono text-slate-400 border-t border-slate-50 pt-2" id="feedback-disclaimer">
            Data feedback diperbarui setiap sesi kelas pelatihan selesai dirampungkan.
          </div>
        </div>

      </div>

    </div>
  );
}
