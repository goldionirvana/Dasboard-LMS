/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  GraduationCap, 
  Filter, 
  RefreshCcw, 
  Calendar,
  Building,
  Briefcase,
  Layers,
  ChevronDown,
  ChevronUp,
  MapPin,
  Clock,
  Sparkles,
  Search,
  BookOpen
} from 'lucide-react';
import { FilterState } from './types';
import AdminDashboard from './components/AdminDashboard';
import KHSDashboard from './components/KHSDashboard';

export default function App() {
  const [selectedKHSName, setSelectedKHSName] = useState<string | null>(null);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(true);
  
  // Initialize filter state with Indonesia-oriented defaults
  const [filters, setFilters] = useState<FilterState>({
    startDate: '',
    endDate: '',
    area: 'all',
    regional: 'all',
    division: 'all',
    category: 'all',
  });

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      area: 'all',
      regional: 'all',
      division: 'all',
      category: 'all',
    });
  };

  // Determine active filter badges count
  const activeFiltersCount = Object.entries(filters).filter(([key, val]) => {
    if (key === 'startDate' || key === 'endDate') return val !== '';
    return val !== 'all';
  }).length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans antialiased text-sm">
      
      {/* 🌐 TOP NAVIGATION BAR */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs" id="lms-navbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            
            {/* Title / Brand */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <span className="font-sans font-bold text-slate-900 text-base block leading-none tracking-tight">LMS Analytics Hub</span>
                <span className="text-[10px] font-mono tracking-wider text-slate-450 uppercase font-medium">Operational Console</span>
              </div>
            </div>

            {/* User credentials and UTC time stamp */}
            <div className="hidden md:flex items-center gap-4 text-xs font-medium">
              
              {/* UTC Time */}
              <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 flex items-center gap-2 text-slate-500 font-mono" id="nav-timestamp">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>UTC: 2026-06-10 01:45</span>
              </div>

              {/* Connected User */}
              <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600" id="nav-userinfo">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-mono text-slate-500 text-[10px] sm:text-xs">nirvanagoldio@gmail.com</span>
              </div>

            </div>

          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6" id="dashboard-scaffold">
        
        {!selectedKHSName && (
          <>
            {/* 🏆 HERO HEADER BANNER */}
        <div className="p-6 md:p-8 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4 relative overflow-hidden" id="dashboard-hero-card">
          {/* Subtle graphic accent */}
          <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none transform translate-y-12 translate-x-4">
            <GraduationCap className="w-96 h-96 text-blue-600" />
          </div>

          <div className="space-y-1 relative z-10">
            <span className="text-xs font-mono tracking-widest text-blue-650 uppercase font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-500 fill-blue-500" /> LMS Performance Audit
            </span>
            <h1 className="text-2xl md:text-3xl font-sans font-bold tracking-tight text-slate-950">
              Dashboard Pemantauan &amp; Analisis Pembelajaran
            </h1>
            <p className="text-slate-500 text-xs md:text-sm max-w-2xl font-light">
              Platform evaluasi performa pembelajaran korporat, pemantauan progress pelatihan mandiri kru harian, dan indeks keberhasilan trainer.
            </p>
          </div>


        </div>

        {/* 🛠️ LIVE FILTER CONTROLLER */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm" id="dashboard-filter-panel">
          
          {/* Collapse Header */}
          <div 
            onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
            className="px-6 py-4 flex items-center justify-between border-b border-slate-200/60 cursor-pointer select-none hover:bg-slate-50/50 transition-colors"
            id="filter-panel-accordion-header"
          >
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-blue-600" />
              <span className="font-semibold text-slate-850">Filter Analisis Dashboard</span>
              {activeFiltersCount > 0 && (
                <span className="bg-blue-50 text-blue-700 text-[10px] font-mono px-2 py-0.5 rounded-sm font-bold border border-blue-200">
                  {activeFiltersCount} filter aktif
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              {activeFiltersCount > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    resetFilters();
                  }}
                  className="flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 font-medium bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-100 transition-colors cursor-pointer"
                  id="btn-filter-reset-quick"
                >
                  <RefreshCcw className="w-3 h-3" />
                  <span>Reset All</span>
                </button>
              )}

              <div className="text-slate-400">
                {isFilterPanelOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </div>
          </div>

          {/* Expanded State Fields */}
          {isFilterPanelOpen && (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-down" id="filters-fields-grid">
              
              {/* Periode Evaluasi (Tanggal Range) */}
              <div className="space-y-1.5 col-span-1" id="field-periode-range">
                <label className="text-xs font-mono font-bold text-slate-400 uppercase flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> Periode Evaluasi (Tanggal Range)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <input
                      type="date"
                      value={filters.startDate}
                      onChange={(e) => handleFilterChange('startDate', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-xs focus:ring-2 focus:ring-blue-100 focus:border-blue-500 focus:outline-hidden transition-all text-slate-700 font-medium"
                      id="filter-start-date"
                    />
                    <span className="absolute right-2 top-2.5 text-[8px] font-mono text-slate-400 uppercase pointer-events-none">Mulai</span>
                  </div>
                  <div className="relative">
                    <input
                      type="date"
                      value={filters.endDate}
                      onChange={(e) => handleFilterChange('endDate', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-xs focus:ring-2 focus:ring-blue-100 focus:border-blue-500 focus:outline-hidden transition-all text-slate-700 font-medium"
                      id="filter-end-date"
                    />
                    <span className="absolute right-2 top-2.5 text-[8px] font-mono text-slate-400 uppercase pointer-events-none">Selesai</span>
                  </div>
                </div>
              </div>

              {/* Cabang */}
              {/* Area */}
              <div className="space-y-1.5" id="field-area">
                <label className="text-xs font-mono font-bold text-slate-400 uppercase flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> Area
                </label>
                <select
                  value={filters.area}
                  onChange={(e) => handleFilterChange('area', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-100 focus:border-blue-500 focus:outline-hidden transition-all text-slate-700"
                >
                  <option value="all">Semua Area (All Areas)</option>
                  <option value="East">East</option>
                  <option value="West">West</option>
                </select>
              </div>

              {/* Regional */}
              <div className="space-y-1.5" id="field-regional">
                <label className="text-xs font-mono font-bold text-slate-400 uppercase flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> Regional
                </label>
                <select
                  value={filters.regional}
                  onChange={(e) => handleFilterChange('regional', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-100 focus:border-blue-500 focus:outline-hidden transition-all text-slate-700"
                >
                  <option value="all">Semua Regional (All Regionals)</option>
                  <option value="Jabar 1">Jabar 1</option>
                  <option value="Jabar 2">Jabar 2</option>
                  <option value="Jatim 1">Jatim 1</option>
                  <option value="Jatim 2">Jatim 2</option>
                  <option value="Kalimantan 1">Kalimantan 1</option>
                </select>
              </div>

              {/* Departemen / Divisi */}
              <div className="space-y-1.5" id="field-divisi">
                <label className="text-xs font-mono font-bold text-slate-400 uppercase flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" /> Departemen / Divisi
                </label>
                <select
                  value={filters.division}
                  onChange={(e) => handleFilterChange('division', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-100 focus:border-blue-500 focus:outline-hidden transition-all text-slate-700"
                >
                  <option value="all">Semua Departemen (All Divisions)</option>
                  <option value="Kitchen">Kitchen (Cabang Dapur)</option>
                  <option value="Service">Service (Layanan Pelanggan)</option>
                  <option value="Warehouse">Warehouse (Logistik &amp; Gudang)</option>
                  <option value="Management">Management (Staf Kantor Utama)</option>
                </select>
              </div>

              {/* Kategori Course */}
              <div className="space-y-1.5" id="field-course-categories">
                <label className="text-xs font-mono font-bold text-slate-400 uppercase flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-slate-400" /> Kategori Materi / Course
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-100 focus:border-blue-500 focus:outline-hidden transition-all text-slate-700"
                >
                  <option value="all">Semua Kategori (All Categories)</option>
                  <option value="Food Safety">Food Safety &amp; Sanitarian</option>
                  <option value="Leadership">Corporate Leadership</option>
                  <option value="SOP">SOP Standard Operating Procedure</option>
                  <option value="Service Excellence">Service Excellence Culture</option>
                </select>
              </div>

            </div>
          )}

          {/* Filter Status summary strip */}
          <div className="px-6 py-3 bg-slate-50 rounded-b-2xl border-t border-slate-200 flex flex-wrap gap-2 text-xs items-center" id="active-badges-strip">
            <span className="text-slate-440 font-mono text-[10px] uppercase font-bold">Status filter:</span>
            {activeFiltersCount === 0 ? (
              <span className="text-slate-500 font-light">Mencakup semua data korporasi (unfiltered).</span>
            ) : (
              <div className="flex flex-wrap gap-1.5" id="active-badges-list">
                {Object.entries(filters).map(([key, val]) => {
                  if (key === 'startDate' || key === 'endDate') {
                    if (val === '') return null;
                    return (
                      <span 
                        key={key}
                        onClick={() => handleFilterChange(key as keyof FilterState, '')}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md font-mono text-[10px] font-semibold bg-blue-50 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-100 border border-blue-200 text-blue-700 transition-colors cursor-pointer"
                      >
                        <span className="text-slate-400">{key === 'startDate' ? 'Mulai' : 'Selesai'}:</span>
                        <strong>{val}</strong>
                        <span className="font-sans font-bold leading-none">&times;</span>
                      </span>
                    );
                  }
                  if (val === 'all') return null;
                  return (
                    <span 
                      key={key}
                      onClick={() => handleFilterChange(key as keyof FilterState, 'all')}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md font-mono text-[10px] font-semibold bg-blue-50 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-100 border border-blue-200 text-blue-700 transition-colors cursor-pointer"
                    >
                      <span className="text-slate-400">{key === 'division' ? 'divisi' : key === 'category' ? 'kategori' : key}:</span>
                      <strong>{val}</strong>
                      <span className="font-sans font-bold leading-none">&times;</span>
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </div>
          </>
        )}

        {/* 🚀 ACTIVE DASHBOARD MOUNTING POINT */}
        <div id="active-dashboard-mount-point" className="transition-all duration-350">
          {selectedKHSName ? (
            <KHSDashboard 
              initialEmployeeName={selectedKHSName} 
              onBack={() => setSelectedKHSName(null)} 
            />
          ) : (
            <AdminDashboard filters={filters} onViewKHS={setSelectedKHSName} />
          )}
        </div>

      </main>

      {/* 🔮 BEAUTIFUL COMPACT FOOTER */}
      <footer className="bg-white border-t border-slate-100 py-6 text-center text-xs text-slate-400 mt-12 space-y-1.5" id="lms-footer">
        <p className="font-mono text-[10px] uppercase tracking-wider text-slate-300">Google AI Studio • Enterprise LMS Audit Suite</p>
        <p className="text-slate-400">Dioperasikan secara aman dalam lingkungan virtual terisolasi.</p>
      </footer>
    </div>
  );
}
