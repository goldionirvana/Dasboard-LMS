import React, { useState, useMemo } from 'react';
import { 
  BarChart4, 
  Map, 
  MapPin, 
  Compass, 
  Award, 
  Users, 
  Database, 
  List, 
  Search, 
  RefreshCcw, 
  Download, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Clock,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Info,
  ArrowUpRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  ZAxis, 
  CartesianGrid, 
  Tooltip, 
  Cell,
  BarChart,
  Bar,
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';

// --- HIGH FIDELITY MOCK DATA FROM PDF SCREENSHOTS ---

const overallStats = {
  totalScheduled: 18694,
  attendanceRate: 43.6,
  noShowRate: 56.3,
  passRate: 95.6,
};

// 1. Store Deep Dive Data
const highestNoShowVolume = [
  { name: 'SURABAYA MANYAR', scheduled: 142, noShowRate: 100.0, volume: 142 },
  { name: 'SEMARANG PROF HAMKA', scheduled: 142, noShowRate: 90.1, volume: 128 },
  { name: 'TANGSEL KAPTEN SOEBIJANTO', scheduled: 119, noShowRate: 97.5, volume: 116 },
  { name: 'JAKTIM RAYA CONDET', scheduled: 112, noShowRate: 95.5, volume: 107 },
  { name: 'BATU W.R SUPRATMAN', scheduled: 106, noShowRate: 100.0, volume: 106 },
  { name: 'SURABAYA MAYJEN SUNGKONO', scheduled: 147, noShowRate: 68.7, volume: 101 },
  { name: 'PONOROGO DIPONEGORO', scheduled: 120, noShowRate: 79.2, volume: 95 },
  { name: 'BANYUMAS DR SOEPARNO', scheduled: 94, noShowRate: 100.0, volume: 94 },
  { name: 'TABALONG A YANI', scheduled: 117, noShowRate: 76.9, volume: 90 },
  { name: 'BALIKPAPAN MULAWARMAN', scheduled: 119, noShowRate: 74.8, volume: 89 },
  { name: 'MOJOKERTO JENDRAL SUDIRMAN', scheduled: 104, noShowRate: 83.7, volume: 87 },
  { name: 'KARAWANG GALUH MAS RAYA', scheduled: 168, noShowRate: 50.0, volume: 84 },
];

const highestNoShowRate = [
  { name: 'SURABAYA MANYAR', scheduled: 142, noShowRate: 100.0 },
  { name: 'BATU W.R SUPRATMAN', scheduled: 106, noShowRate: 100.0 },
  { name: 'BANYUMAS DR SOEPARNO', scheduled: 94, noShowRate: 100.0 },
  { name: 'KUDUS H.M. SUBCHAN', scheduled: 66, noShowRate: 100.0 },
  { name: 'BALIKPAPAN SOEKARNO HATTA', scheduled: 62, noShowRate: 100.0 },
  { name: 'MAKASSAR A.P. PETTARANI', scheduled: 60, noShowRate: 100.0 },
  { name: 'MAKASSAR DR RATULANGI', scheduled: 56, noShowRate: 100.0 },
  { name: 'TUBAN BASUKI RACHMAD', scheduled: 48, noShowRate: 100.0 },
  { name: 'MAKASSAR PENGAYOMAN', scheduled: 41, noShowRate: 100.0 },
  { name: 'PALU RE MARTADINATA', scheduled: 38, noShowRate: 100.0 },
  { name: 'BANJARNEGARA LETJEND SUPRAPTO', scheduled: 36, noShowRate: 100.0 },
  { name: 'SURAKARTA MAWAR', scheduled: 32, noShowRate: 100.0 },
];

const bestAttendanceStores = [
  { name: 'JAKSEL AMPERA RAYA', scheduled: 34, noShowRate: 2.9 },
  { name: 'BANDUNG SURYA SUMANTRI', scheduled: 34, noShowRate: 2.9 },
  { name: 'BANDUNG SETIABUDI', scheduled: 87, noShowRate: 4.6 },
  { name: 'JAKTIM PAHLAWAN REVOLUSI', scheduled: 70, noShowRate: 5.7 },
  { name: 'BANDUNG RAYA LASWI', scheduled: 45, noShowRate: 6.7 },
  { name: 'BOGOR RAYA CIBUNGBULANG', scheduled: 71, noShowRate: 7.0 },
  { name: 'GRESIK SUMATRA', scheduled: 160, noShowRate: 7.5 },
  { name: 'BANDUNG PETA', scheduled: 112, noShowRate: 8.0 },
];

const storeTableData = [
  { store: 'SURABAYA MANYAR', regional: 'JAWA TIMUR 2', peserta: 142, hadir: 0, hadirPct: 0.0, tidakHadir: 142, tidakHadirPct: 100.0, lulus: 0, lulusPct: 0.0, risk: 'High', trainer: 'Budi Santoso', learningHours: 320, done: 0, progress: 12, notYet: 130 },
  { store: 'SEMARANG PROF HAMKA', regional: 'JAWA TENGAH 1', peserta: 142, hadir: 14, hadirPct: 9.9, tidakHadir: 128, tidakHadirPct: 90.1, lulus: 13, lulusPct: 92.9, risk: 'High', trainer: 'Ahmad Fauzi', learningHours: 410, done: 14, progress: 38, notYet: 90 },
  { store: 'TANGSEL KAPTEN SOEBIJANTO', regional: 'BANTEN', peserta: 119, hadir: 3, hadirPct: 2.5, tidakHadir: 116, tidakHadirPct: 97.5, lulus: 3, lulusPct: 100.0, risk: 'High', trainer: 'Siti Rahma', learningHours: 280, done: 3, progress: 22, notYet: 94 },
  { store: 'JAKTIM RAYA CONDET', regional: 'JAKARTA', peserta: 112, hadir: 5, hadirPct: 4.5, tidakHadir: 107, tidakHadirPct: 95.5, lulus: 5, lulusPct: 100.0, risk: 'High', trainer: 'Hendra Wijaya', learningHours: 310, done: 5, progress: 15, notYet: 92 },
  { store: 'BATU W.R SUPRATMAN', regional: 'JAWA TIMUR 1', peserta: 106, hadir: 0, hadirPct: 0.0, tidakHadir: 106, tidakHadirPct: 100.0, lulus: 0, lulusPct: 0.0, risk: 'High', trainer: 'Dewi Lestari', learningHours: 190, done: 0, progress: 8, notYet: 98 },
  { store: 'SURABAYA MAYJEN SUNGKONO', regional: 'JAWA TIMUR 1', peserta: 147, hadir: 46, hadirPct: 31.3, tidakHadir: 101, tidakHadirPct: 68.7, lulus: 46, lulusPct: 100.0, risk: 'Medium', trainer: 'Budi Santoso', learningHours: 840, done: 46, progress: 61, notYet: 40 },
  { store: 'PONOROGO DIPONEGORO', regional: 'JAWA TIMUR 1', peserta: 120, hadir: 25, hadirPct: 20.8, tidakHadir: 95, tidakHadirPct: 79.2, lulus: 25, lulusPct: 100.0, risk: 'High', trainer: 'Rian Hidayat', learningHours: 450, done: 25, progress: 35, notYet: 60 },
  { store: 'BANYUMAS DR SOEPARNO', regional: 'JAWA TENGAH 1', peserta: 94, hadir: 0, hadirPct: 0.0, tidakHadir: 94, tidakHadirPct: 100.0, lulus: 0, lulusPct: 0.0, risk: 'High', trainer: 'Andi Wijaya', learningHours: 150, done: 0, progress: 5, notYet: 89 },
  { store: 'TABALONG A YANI', regional: 'KALIMANTAN 1', peserta: 117, hadir: 27, hadirPct: 23.1, tidakHadir: 90, tidakHadirPct: 76.9, lulus: 25, lulusPct: 92.6, risk: 'High', trainer: 'Yusuf Mansur', learningHours: 510, done: 27, progress: 40, notYet: 50 },
  { store: 'BALIKPAPAN MULAWARMAN', regional: 'KALIMANTAN 1', peserta: 119, hadir: 30, hadirPct: 25.2, tidakHadir: 89, tidakHadirPct: 74.8, lulus: 28, lulusPct: 93.3, risk: 'High', trainer: 'Mega Utami', learningHours: 580, done: 30, progress: 45, notYet: 44 },
  { store: 'KUDUS H.M. SUBCHAN', regional: 'JAWA TENGAH 1', peserta: 66, hadir: 0, hadirPct: 0.0, tidakHadir: 66, tidakHadirPct: 100.0, lulus: 0, lulusPct: 0.0, risk: 'High', trainer: 'Ahmad Fauzi', learningHours: 120, done: 0, progress: 6, notYet: 60 },
  { store: 'BALIKPAPAN SOEKARNO HATTA', regional: 'KALIMANTAN 1', peserta: 62, hadir: 0, hadirPct: 0.0, tidakHadir: 62, tidakHadirPct: 100.0, lulus: 0, lulusPct: 0.0, risk: 'High', trainer: 'Mega Utami', learningHours: 110, done: 0, progress: 4, notYet: 58 },
  { store: 'MAKASSAR A.P. PETTARANI', regional: 'SULAWESI 2', peserta: 60, hadir: 0, hadirPct: 0.0, tidakHadir: 60, tidakHadirPct: 100.0, lulus: 0, lulusPct: 0.0, risk: 'High', trainer: 'Faisal Bahri', learningHours: 95, done: 0, progress: 3, notYet: 57 },
];

// 2. Regional Review Data
const regionalReviewData = [
  { name: 'JAWA BARAT 2', peserta: 3090, hadir: 1775, hadirPct: 57.4, tidakHadir: 1314, tidakHadirPct: 42.5, lulus: 1713, lulusPct: 96.5, avgPost: 95, risk: 'Medium', coords: { x: 260, y: 155 } },
  { name: 'JAWA TIMUR 2', peserta: 2531, hadir: 1177, hadirPct: 46.5, tidakHadir: 1354, tidakHadirPct: 53.5, lulus: 1129, lulusPct: 95.9, avgPost: 96, risk: 'High', coords: { x: 380, y: 165 } },
  { name: 'JAWA BARAT 1', peserta: 2251, hadir: 1616, hadirPct: 71.8, tidakHadir: 635, tidakHadirPct: 28.2, lulus: 1566, lulusPct: 96.9, avgPost: 96, risk: 'Low', coords: { x: 230, y: 150 } },
  { name: 'JAWA TIMUR 1', peserta: 1940, hadir: 608, hadirPct: 31.3, tidakHadir: 1332, tidakHadirPct: 68.7, lulus: 580, lulusPct: 95.4, avgPost: 95, risk: 'High', coords: { x: 350, y: 160 } },
  { name: 'BANTEN', peserta: 1714, hadir: 655, hadirPct: 38.2, tidakHadir: 1057, tidakHadirPct: 61.7, lulus: 610, lulusPct: 93.1, avgPost: 93, risk: 'High', coords: { x: 190, y: 145 } },
  { name: 'JAKARTA', peserta: 1640, hadir: 891, hadirPct: 54.3, tidakHadir: 747, tidakHadirPct: 45.5, lulus: 854, lulusPct: 95.8, avgPost: 95, risk: 'Medium', coords: { x: 215, y: 142 } },
  { name: 'JAWA TENGAH 1', peserta: 1608, hadir: 366, hadirPct: 22.8, tidakHadir: 1242, tidakHadirPct: 77.2, lulus: 328, lulusPct: 89.6, avgPost: 93, risk: 'High', coords: { x: 300, y: 155 } },
  { name: 'KALIMANTAN 1', peserta: 1168, hadir: 238, hadirPct: 20.4, tidakHadir: 930, tidakHadirPct: 79.6, lulus: 224, lulusPct: 94.1, avgPost: 93, risk: 'High', coords: { x: 360, y: 75 } },
  { name: 'JAWA TENGAH 2', peserta: 967, hadir: 355, hadirPct: 36.7, tidakHadir: 612, tidakHadirPct: 63.3, lulus: 341, lulusPct: 96.1, avgPost: 94, risk: 'High', coords: { x: 320, y: 158 } },
  { name: 'SULAWESI 2', peserta: 831, hadir: 240, hadirPct: 28.9, tidakHadir: 590, tidakHadirPct: 71.0, lulus: 234, lulusPct: 97.5, avgPost: 94, risk: 'High', coords: { x: 480, y: 80 } },
];

// Scatter plot generation mimicking the bubble chart
const bubbleChartData = [
  // Red Bubbles (High risk, high no-show volume / rate)
  { name: 'Surabaya Manyar', totalPeserta: 142, noShowRate: 100, volume: 142, color: '#ef4444' },
  { name: 'Semarang Prof Hamka', totalPeserta: 142, noShowRate: 90.1, volume: 128, color: '#ef4444' },
  { name: 'Tangsel Kapten Soebijanto', totalPeserta: 119, noShowRate: 97.5, volume: 116, color: '#ef4444' },
  { name: 'Jaktim Raya Condet', totalPeserta: 112, noShowRate: 95.5, volume: 107, color: '#ef4444' },
  { name: 'Batu W.R Supratman', totalPeserta: 106, noShowRate: 100, volume: 106, color: '#ef4444' },
  { name: 'Surabaya Mayjen Sungkono', totalPeserta: 147, noShowRate: 68.7, volume: 101, color: '#ef4444' },
  { name: 'Ponorogo Diponegoro', totalPeserta: 120, noShowRate: 79.2, volume: 95, color: '#ef4444' },
  { name: 'Banyumas Dr Soeparno', totalPeserta: 94, noShowRate: 100, volume: 94, color: '#ef4444' },
  { name: 'Tabalong A Yani', totalPeserta: 117, noShowRate: 76.9, volume: 90, color: '#ef4444' },
  { name: 'Balikpapan Mulawarman', totalPeserta: 119, noShowRate: 74.8, volume: 89, color: '#ef4444' },
  { name: 'Mojokerto Jendral Sudirman', totalPeserta: 104, noShowRate: 83.7, volume: 87, color: '#ef4444' },
  // Orange Bubbles (Medium risk)
  { name: 'Karawang Galuh Mas Raya', totalPeserta: 168, noShowRate: 50.0, volume: 84, color: '#f59e0b' },
  { name: 'Bandung Setiabudi', totalPeserta: 87, noShowRate: 40.6, volume: 35, color: '#f59e0b' },
  { name: 'Bogor Raya Cibungbulang', totalPeserta: 71, noShowRate: 45.0, volume: 32, color: '#f59e0b' },
  { name: 'Cirebon Kartini', totalPeserta: 90, noShowRate: 48.3, volume: 43, color: '#f59e0b' },
  // Green Bubbles (Low risk, high attendance)
  { name: 'Jaksel Ampera Raya', totalPeserta: 34, noShowRate: 2.9, volume: 1, color: '#10b981' },
  { name: 'Bandung Surya Sumantri', totalPeserta: 34, noShowRate: 2.9, volume: 1, color: '#10b981' },
  { name: 'Bandung Raya Laswi', totalPeserta: 45, noShowRate: 6.7, volume: 3, color: '#10b981' },
  { name: 'Gresik Sumatra', totalPeserta: 160, noShowRate: 7.5, volume: 12, color: '#10b981' },
  { name: 'Bandung Peta', totalPeserta: 112, noShowRate: 8.0, volume: 9, color: '#10b981' },
  { name: 'Sidoarjo Juanda', totalPeserta: 55, noShowRate: 15.4, volume: 8, color: '#10b981' },
  { name: 'Depok Margonda', totalPeserta: 64, noShowRate: 18.2, volume: 11, color: '#10b981' },
];

// Helper function to generate participants for a selected store
const getParticipantsForStore = (storeName: string, item: typeof storeTableData[0]) => {
  const namesPool: Record<string, {name: string, role: string, nik: string}[]> = {
    'SURABAYA MANYAR': [
      { name: 'Aris Prasetyo', role: 'Cashier Staff', nik: 'K002341' },
      { name: 'Bambang Pamungkas', role: 'Cook Helper', nik: 'K002342' },
      { name: 'Dewi Sartika', role: 'Waiter', nik: 'K002343' },
      { name: 'Farhan Ramadhan', role: 'Kitchen Helper', nik: 'K002344' },
      { name: 'Giska Amalia', role: 'Hostess', nik: 'K002345' },
    ],
    'SEMARANG PROF HAMKA': [
      { name: 'Heri Cahyono', role: 'Commis Chef', nik: 'K002411' },
      { name: 'Ika Pratiwi', role: 'Cashier Staff', nik: 'K002412' },
      { name: 'Joko Susilo', role: 'Waiter', nik: 'K002413' },
      { name: 'Kurniati', role: 'Kitchen Helper', nik: 'K002414' },
      { name: 'Lukman Hakim', role: 'Store Admin', nik: 'K002415' },
    ],
    'TANGSEL KAPTEN SOEBIJANTO': [
      { name: 'Mulyadi', role: 'Waiter', nik: 'K002521' },
      { name: 'Novita Sari', role: 'Cashier Staff', nik: 'K002522' },
      { name: 'Oky Pratama', role: 'Cook Helper', nik: 'K002523' },
      { name: 'Putri Amelia', role: 'Hostess', nik: 'K002524' },
      { name: 'Rian Hidayat', role: 'Kitchen Helper', nik: 'K002525' },
    ],
    'JAKTIM RAYA CONDET': [
      { name: 'Aris Prasetyo', role: 'Cashier Staff', nik: 'K002631' },
      { name: 'Bambang Pamungkas', role: 'Waiter', nik: 'K002632' },
      { name: 'Dewi Sartika', role: 'Kitchen Helper', nik: 'K002633' },
      { name: 'Farhan Ramadhan', role: 'Cook Helper', nik: 'K002634' },
      { name: 'Giska Amalia', role: 'Hostess', nik: 'K002635' },
    ],
    'BATU W.R SUPRATMAN': [
      { name: 'Yayan Ruhian', role: 'Waiter', nik: 'K002741' },
      { name: 'Zaskia Adya', role: 'Cashier Staff', nik: 'K002742' },
      { name: 'Adi Wijaya', role: 'Cook Helper', nik: 'K002743' },
      { name: 'Budi Santoso', role: 'Store Admin', nik: 'K002744' },
      { name: 'Citra Dewi', role: 'Kitchen Helper', nik: 'K002745' },
    ],
    'SURABAYA MAYJEN SUNGKONO': [
      { name: 'Deni Kurniawan', role: 'Commis Chef', nik: 'K002851' },
      { name: 'Eko Prasetyo', role: 'Cashier Staff', nik: 'K002852' },
      { name: 'Fani Lestari', role: 'Waiter', nik: 'K002853' },
      { name: 'Guntur Wibowo', role: 'Kitchen Helper', nik: 'K002854' },
      { name: 'Hendra Saputra', role: 'Cook Helper', nik: 'K002855' },
    ]
  };

  const defaultPool = [
    { name: 'Andi Wijaya', role: 'Cook Helper', nik: 'K002101' },
    { name: 'Citra Dewi', role: 'Cashier Staff', nik: 'K002102' },
    { name: 'Eko Prasetyo', role: 'Waiter', nik: 'K002103' },
    { name: 'Fani Lestari', role: 'Kitchen Helper', nik: 'K002104' },
    { name: 'Guntur Wibowo', role: 'Commis Chef', nik: 'K002105' },
  ];

  const pool = namesPool[storeName] || defaultPool;

  const total = item.peserta || 1;
  const donePct = (item.done || 0) / total;
  const progPct = (item.progress || 0) / total;
  
  return pool.map((emp, index) => {
    let status: 'Completed' | 'In Progress' | 'Not Yet Started' = 'Not Yet Started';
    let kehadiran: 'Hadir' | 'Tidak Hadir' = 'Tidak Hadir';
    let learningHours = 0;
    let postTestScore: number | null = null;

    const position = index / 5;
    if (position < donePct) {
      status = 'Completed';
      kehadiran = 'Hadir';
      learningHours = 4.0 + (index * 0.3);
      postTestScore = 80 + (index * 3);
    } else if (position < donePct + progPct) {
      status = 'In Progress';
      kehadiran = index % 2 === 0 ? 'Hadir' : 'Tidak Hadir';
      learningHours = 1.0 + (index * 0.5);
    } else {
      status = 'Not Yet Started';
      kehadiran = 'Tidak Hadir';
      learningHours = 0;
    }

    if (index === 0 && (item.done || 0) > 0) {
      status = 'Completed';
      kehadiran = 'Hadir';
      learningHours = 4.2;
      postTestScore = 85;
    }
    if (index === 1 && (item.progress || 0) > 0 && status !== 'Completed') {
      status = 'In Progress';
      kehadiran = 'Hadir';
      learningHours = 2.5;
    }

    return {
      ...emp,
      status,
      kehadiran,
      learningHours,
      postTestScore,
    };
  });
};

export default function SOCDashboard({ onViewKHS }: { onViewKHS?: (employeeName: string) => void }) {
  const [activeTab, setActiveTab] = useState<'overview' | 'attendance' | 'store' | 'regional' | 'outcome' | 'trainer' | 'quality' | 'detail'>('store');
  const [expandedStore, setExpandedStore] = useState<string | null>(null);
  
  // Interactive filters
  const [bulanFilter, setBulanFilter] = useState('all');
  const [regionalFilter, setRegionalFilter] = useState('all');
  const [stationFilter, setStationFilter] = useState('all');
  const [trainerFilter, setTrainerFilter] = useState('all');
  const [programFilter, setProgramFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  
  // Table Page indexes
  const [storeTablePage, setStoreTablePage] = useState(0);
  const storesPerPage = 5;

  const handleResetFilters = () => {
    setBulanFilter('all');
    setRegionalFilter('all');
    setStationFilter('all');
    setTrainerFilter('all');
    setProgramFilter('all');
    setStatusFilter('all');
    setSearchKeyword('');
    setStoreTablePage(0);
  };

  // Filter calculations
  const filteredStoreTableData = useMemo(() => {
    return storeTableData.filter(item => {
      if (regionalFilter !== 'all' && item.regional !== regionalFilter) return false;
      if (searchKeyword.trim() !== '') {
        const kw = searchKeyword.toLowerCase();
        const matchesStore = item.store.toLowerCase().includes(kw);
        const matchesReg = item.regional.toLowerCase().includes(kw);
        if (!matchesStore && !matchesReg) return false;
      }
      return true;
    });
  }, [regionalFilter, searchKeyword]);

  const paginatedStores = useMemo(() => {
    const start = storeTablePage * storesPerPage;
    return filteredStoreTableData.slice(start, start + storesPerPage);
  }, [filteredStoreTableData, storeTablePage]);

  const maxPages = Math.ceil(filteredStoreTableData.length / storesPerPage);

  // Filtered scatter data
  const filteredScatterData = useMemo(() => {
    return bubbleChartData.filter(item => {
      // simulate region filter
      if (regionalFilter !== 'all') {
        const mapping: Record<string, string[]> = {
          'JAWA TIMUR 2': ['Surabaya Manyar'],
          'JAWA TENGAH 1': ['Semarang Prof Hamka', 'Banyumas Dr Soeparno', 'Kudus H.M. Subchan'],
          'BANTEN': ['Tangsel Kapten Soebijanto'],
          'JAKARTA': ['Jaktim Raya Condet', 'Depok Margonda', 'Jaksel Ampera Raya'],
          'JAWA TIMUR 1': ['Batu W.R Supratman', 'Surabaya Mayjen Sungkono', 'Ponorogo Diponegoro', 'Sidoarjo Juanda', 'Gresik Sumatra'],
          'KALIMANTAN 1': ['Tabalong A Yani', 'Balikpapan Mulawarman', 'Balikpapan Soekarno Hatta'],
        };
        const activeStores = mapping[regionalFilter] || [];
        return activeStores.includes(item.name);
      }
      return true;
    });
  }, [regionalFilter]);

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-[600px]" id="soc-dashboard-root">
      
      {/* 🧭 SIDEBAR NAVIGATION */}
      <div className="w-full lg:w-64 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between" id="soc-sidebar">
        <div className="space-y-6">
          
          {/* Dashboard Logo/Header */}
          <div className="border-b border-slate-100 pb-4">
            <h2 className="font-sans font-extrabold text-slate-900 text-lg tracking-tight">Analisis Program Berjalan</h2>
            <div className="text-[10px] font-semibold text-blue-600 tracking-wider uppercase font-mono mt-0.5">Program Execution Review</div>
            <p className="text-[10px] text-slate-400 mt-1 leading-tight">Learning &amp; Academy Dashboard</p>
          </div>

          {/* Nav Items */}
          <nav className="flex flex-col gap-1.5" id="soc-nav-links">
            
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-blue-50 text-blue-700 border border-blue-100'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
              }`}
            >
              <BarChart4 className="w-4 h-4 text-blue-500" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('attendance')}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'attendance'
                  ? 'bg-blue-50 text-blue-700 border border-blue-100'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
              }`}
            >
              <UserCheck className="w-4 h-4 text-blue-500" />
              <span>Attendance Execution</span>
            </button>

            <button
              onClick={() => setActiveTab('store')}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'store'
                  ? 'bg-blue-50 text-blue-700 border border-blue-100'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
              }`}
            >
              <Compass className="w-4 h-4 text-blue-500" />
              <span>Store Deep Dive</span>
            </button>

            <button
              onClick={() => setActiveTab('regional')}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'regional'
                  ? 'bg-blue-50 text-blue-700 border border-blue-100'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
              }`}
            >
              <Map className="w-4 h-4 text-blue-500" />
              <span>Regional Review</span>
            </button>

            <button
              onClick={() => setActiveTab('outcome')}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'outcome'
                  ? 'bg-blue-50 text-blue-700 border border-blue-100'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
              }`}
            >
              <Award className="w-4 h-4 text-blue-500" />
              <span>Outcome Review</span>
            </button>

            <button
              onClick={() => setActiveTab('trainer')}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'trainer'
                  ? 'bg-blue-50 text-blue-700 border border-blue-100'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
              }`}
            >
              <Users className="w-4 h-4 text-blue-500" />
              <span>Trainer Review</span>
            </button>

            <button
              onClick={() => setActiveTab('quality')}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'quality'
                  ? 'bg-blue-50 text-blue-700 border border-blue-100'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
              }`}
            >
              <Database className="w-4 h-4 text-blue-500" />
              <span>Data Quality</span>
            </button>

            <button
              onClick={() => setActiveTab('detail')}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'detail'
                  ? 'bg-blue-50 text-blue-700 border border-blue-100'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
              }`}
            >
              <List className="w-4 h-4 text-blue-500" />
              <span>Detail Data</span>
            </button>

          </nav>
        </div>

        {/* Reading Rule Note */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 mt-6" id="reading-rule-box">
          <h4 className="text-[10px] font-mono font-bold text-slate-500 uppercase flex items-center gap-1">
            <Info className="w-3 h-3 text-slate-400" /> Reading rule:
          </h4>
          <p className="text-[10px] text-slate-500 mt-1 leading-normal">
            Dashboard ini membaca kesehatan pelaksanaan program berjalan. No-show dilihat sebagai bottleneck eksekusi, bukan satu-satunya ukuran keberhasilan.
          </p>
        </div>

      </div>

      {/* 🖥️ MAIN VIEWPORT CONTAINER */}
      <div className="flex-1 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs min-w-0" id="soc-main-viewport">
        
        {/* ======================================================== */}
        {/* 1. OVERVIEW VIEW */}
        {/* ======================================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Dashboard Executive Overview</h2>
              <p className="text-xs text-slate-500 mt-0.5">Ringkasan cepat kesehatan, kehadiran, dan kelulusan program berjalan.</p>
            </div>

            {/* Quick KPI Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
                <div className="text-xs text-slate-400 font-mono uppercase font-bold">Total Terjadwal</div>
                <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">18.694</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Peserta Terjadwal</div>
              </div>
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
                <div className="text-xs text-slate-400 font-mono uppercase font-bold">Attendance</div>
                <div className="text-2xl font-bold text-emerald-600 mt-1 font-mono">43,6%</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Tingkat Kehadiran</div>
              </div>
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
                <div className="text-xs text-slate-400 font-mono uppercase font-bold">No-Show Rate</div>
                <div className="text-2xl font-bold text-rose-500 mt-1 font-mono">56,3%</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Tingkat Tidak Hadir</div>
              </div>
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
                <div className="text-xs text-slate-400 font-mono uppercase font-bold">Pass Rate</div>
                <div className="text-2xl font-bold text-blue-600 mt-1 font-mono">95,6%</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Tingkat Kelulusan Ujian</div>
              </div>
            </div>

            {/* High-level charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="border border-slate-150 rounded-xl p-5 space-y-4">
                <h3 className="font-bold text-xs text-slate-600 uppercase font-mono">Kehadiran (Attendance) Bulanan</h3>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={[
                      { name: 'Jan', attendance: 41.2 },
                      { name: 'Feb', attendance: 42.5 },
                      { name: 'Mar', attendance: 43.8 },
                      { name: 'Apr', attendance: 42.1 },
                      { name: 'Mei', attendance: 44.3 },
                      { name: 'Jun', attendance: 43.6 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="name" fontSize={10} stroke="#94a3b8" />
                      <YAxis fontSize={10} stroke="#94a3b8" domain={[0, 100]} />
                      <Tooltip formatter={(v) => `${v}%`} />
                      <Area type="monotone" dataKey="attendance" stroke="#059669" fill="#d1fae5" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="border border-slate-150 rounded-xl p-5 space-y-4">
                <h3 className="font-bold text-xs text-slate-600 uppercase font-mono">No-Show Rate per Departemen</h3>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { name: 'Kitchen', noShow: 52.3 },
                      { name: 'Service', noShow: 61.2 },
                      { name: 'Warehouse', noShow: 58.7 },
                      { name: 'Management', noShow: 32.5 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="name" fontSize={10} stroke="#94a3b8" />
                      <YAxis fontSize={10} stroke="#94a3b8" domain={[0, 100]} />
                      <Tooltip formatter={(v) => `${v}%`} />
                      <Bar dataKey="noShow" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={30} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 2. ATTENDANCE EXECUTION VIEW */}
        {/* ======================================================== */}
        {activeTab === 'attendance' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Evaluasi Pelaksanaan Kehadiran</h2>
              <p className="text-xs text-slate-500 mt-0.5">Menganalisa tingkat no-show sebagai hambatan utama (bottleneck) dalam eksekusi program.</p>
            </div>

            {/* Attendance Execution charts */}
            <div className="border border-slate-150 rounded-xl p-5 space-y-4">
              <h3 className="font-bold text-xs text-slate-600 uppercase font-mono">Komparasi Hadir vs Tidak Hadir per Regional</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={regionalReviewData} margin={{ bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" fontSize={9} angle={-15} textAnchor="end" stroke="#94a3b8" />
                    <YAxis fontSize={10} stroke="#94a3b8" />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="hadir" name="Hadir (Attendance)" fill="#10b981" stackId="a" />
                    <Bar dataKey="tidakHadir" name="Tidak Hadir (No-show)" fill="#ef4444" stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl border border-slate-100 p-4 flex gap-4 items-center">
              <AlertTriangle className="w-8 h-8 text-amber-500 shrink-0" />
              <div>
                <h4 className="font-semibold text-xs text-slate-700">Analisis Rekomendasi:</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Regional <span className="font-bold text-slate-700">JAWA TENGAH 1</span> dan <span className="font-bold text-slate-700">KALIMANTAN 1</span> memiliki tingkat no-show di atas <span className="text-red-500 font-bold">75%</span>. Perlu dilakukan koordinasi intensif dengan Area Manager terkait penjadwalan kru di luar jam sibuk operational.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 3. STORE DEEP DIVE VIEW (MATCHES PDF 1) */}
        {/* ======================================================== */}
        {activeTab === 'store' && (
          <div className="space-y-6 animate-fade-in" id="store-deep-dive-panel">
            
            {/* Header / Deep dive title */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-sans font-bold text-slate-900 tracking-tight">Store Deep Dive</h2>
                <p className="text-xs text-slate-500 mt-0.5">Analisa store untuk menentukan prioritas follow-up dan improvement.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-amber-50 text-amber-800 text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg border border-amber-200">
                  Snapshot CSV fallback • 18.694 rows
                </span>
                <button 
                  onClick={handleResetFilters}
                  className="flex items-center gap-1.5 px-3 py-1 text-xs text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-lg transition-colors cursor-pointer"
                >
                  <RefreshCcw className="w-3.5 h-3.5" />
                  <span>Refresh data</span>
                </button>
              </div>
            </div>



            {/* Program Health Card Box */}
            <div className="bg-slate-50 border border-slate-150 p-6 rounded-2xl space-y-4" id="execution-health-panel">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Program Health</h3>
                <p className="text-xs text-slate-400">Evaluasi pelaksanaan training dari jadwal, kehadiran, completion, outcome post-test, konsentrasi risiko store, regional, station, trainer, dan kualitas data.</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-2">
                <div className="space-y-1">
                  <div className="text-2xl font-extrabold text-slate-800 font-mono">18.694</div>
                  <div className="text-xs text-slate-450">Terjadwal</div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-extrabold text-slate-800 font-mono">43,6%</div>
                  <div className="text-xs text-slate-450">Attendance</div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-extrabold text-slate-800 font-mono">56,3%</div>
                  <div className="text-xs text-slate-450">No-show</div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-extrabold text-slate-800 font-mono">95,6%</div>
                  <div className="text-xs text-slate-450">Pass rate</div>
                </div>
              </div>
            </div>

            {/* Store Risk Bubble Chart (MATCHES PDF 1 PAGE 1 & 2) */}
            <div className="border border-slate-150 rounded-2xl p-6 bg-white space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-base font-bold text-slate-800 flex items-center gap-1.5">
                    <Compass className="w-5 h-5 text-blue-500" /> Store Risk Bubble
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">X = total peserta. Y = no-show rate. Bubble = jumlah tidak hadir.</p>
                </div>
                <span className="text-xs text-blue-500 font-bold border border-blue-100 bg-blue-50/50 px-2.5 py-1 rounded-lg">
                  Hover detail
                </span>
              </div>

              {/* Scatter / Bubble Plot using Recharts */}
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis 
                      type="number" 
                      dataKey="totalPeserta" 
                      name="Total Peserta" 
                      unit=" org" 
                      fontSize={10} 
                      stroke="#94a3b8" 
                      label={{ value: 'Total peserta terjadwal', position: 'insideBottom', offset: -10, fontSize: 10, fill: '#64748b' }}
                    />
                    <YAxis 
                      type="number" 
                      dataKey="noShowRate" 
                      name="No-show Rate" 
                      unit="%" 
                      domain={[0, 100]}
                      fontSize={10} 
                      stroke="#94a3b8" 
                      label={{ value: 'No-show rate (%)', angle: -90, position: 'insideLeft', offset: 0, fontSize: 10, fill: '#64748b' }}
                    />
                    <ZAxis type="number" dataKey="volume" range={[60, 400]} name="No-show Volume" />
                    <Tooltip 
                      cursor={{ strokeDasharray: '3 3' }} 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-slate-900 text-white p-3 rounded-lg text-xs space-y-1 shadow-md border border-slate-850">
                              <p className="font-bold border-b border-slate-800 pb-1">{data.name}</p>
                              <p>Total Peserta: <span className="font-mono font-bold">{data.totalPeserta}</span></p>
                              <p>No-show Rate: <span className="font-mono font-bold text-rose-400">{data.noShowRate}%</span></p>
                              <p>Tidak Hadir: <span className="font-mono font-bold text-amber-400">{data.volume} org</span></p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Scatter data={filteredScatterData}>
                      {filteredScatterData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.7} stroke={entry.color} strokeWidth={1} />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>

              {/* Chart Legend Scale */}
              <div className="flex items-center justify-end gap-4 text-[10px] font-mono font-semibold text-slate-500">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Low (Kehadiran Bagus)</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Medium (No-show Sedan)</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" /> High Risk (No-show Tinggi)</span>
              </div>
            </div>

            {/* Bento-style lists (MATCHES Highest No-show Vol, Highest No-show Rate, Best Attendance) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Box 1: Highest No-show Volume */}
              <div className="border border-slate-150 rounded-2xl p-5 space-y-4 bg-white shadow-2xs" id="highest-no-show-volume-panel">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-rose-500" /> Highest No-show Volume
                  </h4>
                  <p className="text-[10px] text-slate-400">Store penyumbang peserta tidak hadir terbesar.</p>
                </div>
                <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto pr-1">
                  {highestNoShowVolume.slice(0, 8).map((st, idx) => (
                    <div key={idx} className="py-2.5 flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-700 truncate max-w-44" title={st.name}>{st.name}</span>
                      <span className="font-mono text-slate-500 font-semibold bg-rose-50/50 px-1.5 py-0.5 rounded border border-rose-100 text-[10px] shrink-0">
                        {st.volume} | {st.noShowRate.toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Box 2: Highest No-show Rate */}
              <div className="border border-slate-150 rounded-2xl p-5 space-y-4 bg-white shadow-2xs" id="highest-no-show-rate-panel">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-500" /> Highest No-show Rate
                  </h4>
                  <p className="text-[10px] text-slate-400">Store kecil bisa berisiko jika persentasenya tinggi. Min. 10 peserta.</p>
                </div>
                <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto pr-1">
                  {highestNoShowRate.slice(0, 8).map((st, idx) => (
                    <div key={idx} className="py-2.5 flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-700 truncate max-w-44" title={st.name}>{st.name}</span>
                      <span className="font-mono text-slate-500 font-semibold bg-amber-50/50 px-1.5 py-0.5 rounded border border-amber-100 text-[10px] shrink-0">
                        {st.scheduled} | {st.noShowRate.toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Box 3: Best Attendance Store */}
              <div className="border border-slate-150 rounded-2xl p-5 space-y-4 bg-white shadow-2xs" id="best-attendance-panel">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Best Attendance Store
                  </h4>
                  <p className="text-[10px] text-slate-400">Contoh store yang eksekusinya lebih stabil. Min. 10 peserta.</p>
                </div>
                <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto pr-1">
                  {bestAttendanceStores.map((st, idx) => (
                    <div key={idx} className="py-2.5 flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-700 truncate max-w-44" title={st.name}>{st.name}</span>
                      <span className="font-mono text-slate-500 font-semibold bg-emerald-50/50 px-1.5 py-0.5 rounded border border-emerald-100 text-[10px] shrink-0">
                        {st.scheduled} | {st.noShowRate.toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Store Concentration Review Table (MATCHES PDF 1 PAGE 4) */}
            <div className="border border-slate-150 rounded-2xl p-6 bg-white space-y-4" id="store-table-panel">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <div>
                  <h3 className="text-base font-bold text-slate-800">Store Concentration Review Table</h3>
                  <p className="text-xs text-slate-400">Tabel prioritas untuk follow-up store.</p>
                </div>
                {regionalFilter !== 'all' && (
                  <span className="bg-blue-50 text-blue-700 text-[10px] font-mono px-2 py-0.5 rounded border border-blue-150 font-bold">
                    Filter: {regionalFilter}
                  </span>
                )}
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-150">
                <table className="w-full text-left text-xs min-w-180">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[9px] font-mono border-b border-slate-150">
                    <tr>
                      <th className="py-3 px-4">Store &amp; Trainer</th>
                      <th className="py-3 px-4">Regional</th>
                      <th className="py-3 px-4 text-center">Peserta</th>
                      <th className="py-3 px-4 text-center">Hadir / Tidak / Lulus</th>
                      <th className="py-3 px-4 text-center">Durasi Belajar</th>
                      <th className="py-3 px-4 text-center">Progress Tracker (Done / Prog / NY)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedStores.map((item, idx) => {
                      const isExpanded = expandedStore === item.store;
                      return (
                        <React.Fragment key={idx}>
                          <tr 
                            onClick={() => setExpandedStore(isExpanded ? null : item.store)}
                            className={`hover:bg-slate-50/85 transition-colors cursor-pointer ${isExpanded ? 'bg-blue-50/30' : ''}`}
                          >
                            <td className="py-3.5 px-4 font-bold text-slate-800">
                              <div className="flex items-center gap-1.5">
                                <span className="text-blue-600 text-[10px] select-none">
                                  {isExpanded ? '▼' : '▶'}
                                </span>
                                <span>{item.store}</span>
                              </div>
                              <div className="text-[10px] text-slate-500 font-medium mt-1 flex items-center gap-1.5">
                                <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono text-[9px]">Trainer</span>
                                <span className="text-slate-600">{item.trainer || 'N/A'}</span>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 font-semibold text-slate-500 text-[11px]">{item.regional}</td>
                            <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-600">{item.peserta}</td>
                            <td className="py-3.5 px-4 text-center font-semibold">
                              <div className="flex items-center justify-center gap-1 text-[11px]">
                                <span className="text-emerald-600 font-mono font-bold">{item.hadir}</span>
                                <span className="text-slate-300">/</span>
                                <span className="text-rose-500 font-mono font-bold">{item.tidakHadir}</span>
                                <span className="text-slate-300">/</span>
                                <span className="text-blue-600 font-mono font-bold">{item.lulus}</span>
                              </div>
                              <div className="text-[9px] text-slate-400 font-mono mt-0.5 flex items-center justify-center gap-1">
                                <span className="text-emerald-600 font-medium">H: {item.hadirPct.toFixed(0)}%</span>
                                <span className="text-rose-450 font-medium">TH: {item.tidakHadirPct.toFixed(0)}%</span>
                                <span className="text-blue-605 font-medium">L: {item.lulusPct.toFixed(0)}%</span>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-center font-mono text-slate-700 font-bold">
                              <div className="flex items-center justify-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                <span>{item.learningHours || 0} jam</span>
                              </div>
                              <div className="text-[9px] text-slate-450 font-normal mt-0.5">
                                ~{((item.learningHours || 0) / (item.peserta || 1)).toFixed(1)} jam / peserta
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="space-y-1.5 max-w-[190px] mx-auto">
                                <div className="flex justify-between text-[9px] text-slate-500 font-semibold font-mono">
                                  <span className="text-emerald-600">Done: {item.done ?? 0}</span>
                                  <span className="text-amber-500">Prog: {item.progress ?? 0}</span>
                                  <span className="text-slate-400">NY: {item.notYet ?? 0}</span>
                                </div>
                                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden flex">
                                  <div 
                                    style={{ width: `${item.peserta ? ((item.done ?? 0) / item.peserta) * 100 : 0}%` }} 
                                    className="h-full bg-emerald-500 transition-all duration-300" 
                                    title={`Completed: ${item.done} (${item.peserta ? (((item.done ?? 0) / item.peserta) * 100).toFixed(1) : 0}%)`} 
                                  />
                                  <div 
                                    style={{ width: `${item.peserta ? ((item.progress ?? 0) / item.peserta) * 100 : 0}%` }} 
                                    className="h-full bg-amber-400 transition-all duration-300" 
                                    title={`In Progress: ${item.progress} (${item.peserta ? (((item.progress ?? 0) / item.peserta) * 100).toFixed(1) : 0}%)`} 
                                  />
                                  <div 
                                    style={{ width: `${item.peserta ? ((item.notYet ?? 0) / item.peserta) * 100 : 0}%` }} 
                                    className="h-full bg-slate-200 transition-all duration-300" 
                                    title={`Not Yet: ${item.notYet} (${item.peserta ? (((item.notYet ?? 0) / item.peserta) * 100).toFixed(1) : 0}%)`} 
                                  />
                                </div>
                                <div className="text-[9px] text-slate-400 text-center font-mono">
                                  Total Progress: {item.peserta ? ((( (item.done ?? 0) + (item.progress ?? 0) * 0.5 ) / item.peserta) * 100).toFixed(1) : 0}%
                                </div>
                              </div>
                            </td>
                          </tr>
                          
                          {/* Expanded Detail Panel */}
                          {isExpanded && (
                            <tr className="bg-slate-50/60" id={`expanded-store-${item.store}`}>
                              <td colSpan={6} className="p-5 border-l-4 border-l-blue-600">
                                <div className="space-y-4">
                                  <div className="flex justify-between items-center flex-wrap gap-2">
                                    <div>
                                      <h4 className="font-bold text-slate-800 text-sm">📋 Daftar Partisipan Store: {item.store}</h4>
                                      <p className="text-xs text-slate-400">Monitoring status belajar, kehadiran kelas, dan pencapaian post-test kru toko.</p>
                                    </div>
                                    <div className="text-xs text-slate-500 bg-white border border-slate-200 rounded-lg px-3 py-1.5 shadow-2xs font-sans">
                                      Trainer: <span className="font-bold text-slate-700">{item.trainer || 'N/A'}</span>
                                    </div>
                                  </div>

                                  <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs">
                                    <table className="w-full text-left text-xs min-w-160">
                                      <thead className="bg-slate-50 text-slate-550 uppercase text-[9px] font-mono border-b border-slate-150">
                                        <tr>
                                          <th className="py-2.5 px-4 font-semibold text-slate-500">Nama &amp; NIK</th>
                                          <th className="py-2.5 px-4 font-semibold text-slate-500">Jabatan</th>
                                          <th className="py-2.5 px-4 font-semibold text-slate-500 text-center">Kehadiran Kelas</th>
                                          <th className="py-2.5 px-4 font-semibold text-slate-500 text-center">Status Progress</th>
                                          <th className="py-2.5 px-4 font-semibold text-slate-500 text-center">Durasi Belajar</th>
                                          <th className="py-2.5 px-4 font-semibold text-slate-500 text-center">Nilai Post-Test</th>
                                          <th className="py-2.5 px-4 font-semibold text-slate-500 text-center">Aksi</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-100">
                                        {getParticipantsForStore(item.store, item).map((emp, empIdx) => (
                                          <tr key={empIdx} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="py-3 px-4">
                                              <div className="font-bold text-slate-800">{emp.name}</div>
                                              <div className="text-[10px] text-slate-400 font-mono">{emp.nik}</div>
                                            </td>
                                            <td className="py-3 px-4 text-slate-600 font-medium">{emp.role}</td>
                                            <td className="py-3 px-4 text-center">
                                              <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                                emp.kehadiran === 'Hadir' 
                                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                                              }`}>
                                                {emp.kehadiran}
                                              </span>
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                              <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                                emp.status === 'Completed' 
                                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                                  : emp.status === 'In Progress'
                                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                                  : 'bg-slate-100 text-slate-500 border border-slate-200'
                                              }`}>
                                                {emp.status}
                                              </span>
                                            </td>
                                            <td className="py-3 px-4 text-center font-mono font-semibold text-slate-600">
                                              {emp.learningHours > 0 ? `${emp.learningHours.toFixed(1)} Jam` : '0 Jam'}
                                            </td>
                                            <td className="py-3 px-4 text-center font-mono font-bold">
                                              {emp.postTestScore !== null ? (
                                                <span className="text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-150 text-[10px]">
                                                  {emp.postTestScore} / 100
                                                </span>
                                              ) : (
                                                <span className="text-slate-400 font-normal">-</span>
                                              )}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                              <button
                                                onClick={() => onViewKHS && onViewKHS(emp.name)}
                                                className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                                              >
                                                <span>Lihat Detail KHS</span>
                                                <ArrowUpRight className="w-3 h-3" />
                                              </button>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                    {filteredStoreTableData.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400 font-light">
                          Tidak ada store yang cocok dengan kriteria filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Pagination Controller */}
              {maxPages > 1 && (
                <div className="flex items-center justify-between text-xs pt-2" id="store-table-pagination">
                  <span className="text-slate-450 font-medium">
                    Menampilkan <strong className="text-slate-700">{storeTablePage * storesPerPage + 1}</strong> - <strong className="text-slate-700">{Math.min((storeTablePage + 1) * storesPerPage, filteredStoreTableData.length)}</strong> dari <strong className="text-slate-700">{filteredStoreTableData.length}</strong> store
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setStoreTablePage(p => Math.max(0, p - 1))}
                      disabled={storeTablePage === 0}
                      className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-slate-50 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="font-mono text-slate-500 px-2">Page {storeTablePage + 1} of {maxPages}</span>
                    <button
                      onClick={() => setStoreTablePage(p => Math.min(maxPages - 1, p + 1))}
                      disabled={storeTablePage === maxPages - 1}
                      className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-slate-50 cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* 4. REGIONAL REVIEW VIEW (MATCHES PDF 2) */}
        {/* ======================================================== */}
        {activeTab === 'regional' && (
          <div className="space-y-6 animate-fade-in" id="regional-review-panel">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-sans font-bold text-slate-900 tracking-tight">Regional Review</h2>
                <p className="text-xs text-slate-500 mt-0.5">Membaca performa regional sesuai pembagian asli di data.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-blue-50 text-blue-800 text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg border border-blue-200">
                  Original regional
                </span>
                <button 
                  onClick={handleResetFilters}
                  className="flex items-center gap-1.5 px-3 py-1 text-xs text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-lg transition-colors cursor-pointer"
                >
                  <RefreshCcw className="w-3.5 h-3.5" />
                  <span>Refresh data</span>
                </button>
              </div>
            </div>

            {/* Regional Map Coordinate Pinboard */}
            <div className="border border-slate-150 rounded-2xl p-6 bg-white space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-1.5">
                  <MapPin className="w-5 h-5 text-blue-500" /> Regional Execution Map
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Regional sesuai data asli, tidak digabung. Klik pin untuk memfilter.</p>
              </div>

              {/* Styled Interactive SVG Map Frame */}
              <div className="relative border border-slate-150 rounded-2xl h-80 bg-sky-50 overflow-hidden" id="interactive-map-frame">
                
                {/* Simulated geographic grids or outlines */}
                <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" viewBox="0 0 600 300">
                  {/* Grid Lines */}
                  <line x1="100" y1="0" x2="100" y2="300" stroke="#94a3b8" strokeDasharray="3 3" />
                  <line x1="200" y1="0" x2="200" y2="300" stroke="#94a3b8" strokeDasharray="3 3" />
                  <line x1="300" y1="0" x2="300" y2="300" stroke="#94a3b8" strokeDasharray="3 3" />
                  <line x1="400" y1="0" x2="400" y2="300" stroke="#94a3b8" strokeDasharray="3 3" />
                  <line x1="500" y1="0" x2="500" y2="300" stroke="#94a3b8" strokeDasharray="3 3" />
                  <line x1="0" y1="100" x2="600" y2="100" stroke="#94a3b8" strokeDasharray="3 3" />
                  <line x1="0" y1="200" x2="600" y2="200" stroke="#94a3b8" strokeDasharray="3 3" />

                  {/* High Fidelity Indonesia Landmass Silhouette */}
                  <path d="M 50,130 Q 110,100 160,150 T 260,170 T 350,165 T 450,130 T 550,160 Q 570,180 550,210 T 400,200 T 250,210 Z" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1" />
                </svg>

                {/* Interactive Clickable Pins */}
                {regionalReviewData.map((reg, idx) => {
                  const isSelected = regionalFilter === reg.name;
                  const pinColor = reg.risk === 'High' ? '#ef4444' : reg.risk === 'Medium' ? '#f59e0b' : '#10b981';
                  
                  return (
                    <button
                      key={idx}
                      onClick={() => setRegionalFilter(isSelected ? 'all' : reg.name)}
                      className="absolute p-1 group/pin cursor-pointer transition-transform hover:scale-115 focus:outline-hidden"
                      style={{ left: `${reg.coords.x}px`, top: `${reg.coords.y}px` }}
                    >
                      <span className={`absolute -inset-1 rounded-full animate-ping ${reg.risk === 'High' ? 'bg-red-300' : 'bg-green-300'} opacity-40`} />
                      <div className={`relative w-4.5 h-4.5 rounded-full shadow-md border-2 border-white flex items-center justify-center`} style={{ backgroundColor: pinColor }}>
                        <span className="w-1.5 h-1.5 bg-white rounded-full" />
                      </div>
                      
                      {/* Tooltip on hover */}
                      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden group-hover/pin:block bg-slate-900 text-white text-[10px] rounded px-2.5 py-1.5 font-sans whitespace-nowrap shadow-md leading-tight z-20">
                        <p className="font-bold border-b border-slate-800 pb-0.5">{reg.name}</p>
                        <p className="mt-0.5">Peserta: <strong className="font-mono">{reg.peserta.toLocaleString()}</strong></p>
                        <p>No-show Rate: <strong className="font-mono text-rose-300">{reg.tidakHadirPct}%</strong></p>
                        <p>Risk Index: <strong className="uppercase" style={{ color: pinColor }}>{reg.risk}</strong></p>
                      </div>
                    </button>
                  );
                })}

                <div className="absolute bottom-3 left-4 bg-white/95 border border-slate-200 px-3 py-1.5 rounded-lg flex items-center gap-3 text-[10px] font-mono font-semibold text-slate-500 shadow-sm">
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Low Risk</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Medium Risk</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> High Risk</span>
                </div>

                <div className="absolute top-3 right-4 bg-white/95 border border-slate-200 px-3 py-1 rounded-lg text-[10px] font-semibold text-slate-400 shadow-sm flex items-center gap-1">
                  <span>Zoom / Pan Disabled</span>
                </div>

              </div>
            </div>

            {/* Regional Performance Ranking Chart (MATCHES PDF 2 PAGE 3) */}
            <div className="border border-slate-150 rounded-2xl p-6 bg-white space-y-4" id="regional-charts-panel">
              <div>
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-1.5">
                  <BarChart4 className="w-5 h-5 text-blue-500" /> Regional Performance Ranking
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Ranking berdasarkan no-show volume dan no-show rate.</p>
              </div>

              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={regionalReviewData} layout="vertical" margin={{ left: 30, right: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis type="number" fontSize={10} stroke="#94a3b8" />
                    <YAxis dataKey="name" type="category" fontSize={9} stroke="#94a3b8" width={90} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="tidakHadir" name="Tidak hadir" fill="#ef4444" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="hadir" name="Hadir" fill="#10b981" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Regional Review Table (MATCHES PDF 2 PAGE 3 & 4) */}
            <div className="border border-slate-150 rounded-2xl p-6 bg-white space-y-4" id="regional-table-panel">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-base font-bold text-slate-800">Regional Review Table</h3>
                  <p className="text-xs text-slate-400">Count dan persentase agar volume besar tidak menipu.</p>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-150">
                <table className="w-full text-left text-xs min-w-180">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[9px] font-mono border-b border-slate-150">
                    <tr>
                      <th className="py-3 px-4">Regional</th>
                      <th className="py-3 px-4 text-center">Peserta</th>
                      <th className="py-3 px-4 text-center">Hadir</th>
                      <th className="py-3 px-4 text-center">Tidak Hadir</th>
                      <th className="py-3 px-4 text-center">Lulus</th>
                      <th className="py-3 px-4 text-center">Avg Post</th>
                      <th className="py-3 px-4 text-center">Risk</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {regionalReviewData.map((item, idx) => {
                      const isFiltered = regionalFilter !== 'all' && regionalFilter === item.name;
                      return (
                        <tr 
                          key={idx} 
                          onClick={() => setRegionalFilter(regionalFilter === item.name ? 'all' : item.name)}
                          className={`hover:bg-slate-50/50 cursor-pointer transition-colors ${isFiltered ? 'bg-blue-50/30' : ''}`}
                        >
                          <td className="py-3 px-4 font-bold text-slate-800 flex items-center gap-2">
                            {isFiltered && <span className="w-1.5 h-1.5 bg-blue-600 rounded-full shrink-0" />}
                            <span>{item.name}</span>
                          </td>
                          <td className="py-3 px-4 text-center font-mono font-bold text-slate-600">{item.peserta.toLocaleString()}</td>
                          <td className="py-3 px-4 text-center font-mono text-emerald-600 font-semibold">
                            {item.hadir.toLocaleString()} <span className="text-[10px] text-slate-400">| {item.hadirPct.toFixed(1)}%</span>
                          </td>
                          <td className="py-3 px-4 text-center font-mono text-rose-500 font-semibold">
                            {item.tidakHadir.toLocaleString()} <span className="text-[10px] text-slate-400">| {item.tidakHadirPct.toFixed(1)}%</span>
                          </td>
                          <td className="py-3 px-4 text-center font-mono text-blue-600 font-semibold">
                            {item.lulus.toLocaleString()} <span className="text-[10px] text-slate-400">| {item.lulusPct.toFixed(1)}%</span>
                          </td>
                          <td className="py-3 px-4 text-center font-mono font-bold text-slate-700">{item.avgPost}</td>
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              item.risk === 'High' 
                                ? 'bg-red-50 text-red-600 border border-red-100' 
                                : item.risk === 'Medium' 
                                ? 'bg-amber-50 text-amber-600 border border-amber-100' 
                                : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                            }`}>
                              {item.risk}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* 5. OUTCOME REVIEW VIEW */}
        {/* ======================================================== */}
        {activeTab === 'outcome' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Outcome Review (Hasil Belajar)</h2>
              <p className="text-xs text-slate-500 mt-0.5">Analisis hasil ujian, ketuntasan belajar, dan perbaikan pemahaman materi.</p>
            </div>

            {/* Outcomes info cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="border border-slate-150 rounded-xl p-5 space-y-4">
                <h3 className="font-bold text-xs text-slate-600 uppercase font-mono">Distribusi Kelulusan (Pass Rate)</h3>
                <div className="bg-slate-50 p-4 rounded-xl space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 font-medium">Lulus Evaluasi Akhir:</span>
                    <span className="font-bold text-emerald-600">95,6%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full" style={{ width: '95.6%' }} />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                    Hanya 4.4% peserta hadir yang membutuhkan her/ujian ulang untuk menguasai materi refreshment secara sempurna.
                  </p>
                </div>
              </div>

              <div className="border border-slate-150 rounded-xl p-5 space-y-4">
                <h3 className="font-bold text-xs text-slate-600 uppercase font-mono">Peningkatan Pre-test vs Post-test</h3>
                <div className="bg-slate-50 p-4 rounded-xl space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 font-medium">Rata-rata Pre-Test:</span>
                    <span className="font-mono font-bold text-slate-600">54.5</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 font-medium">Rata-rata Post-Test:</span>
                    <span className="font-mono font-bold text-blue-600">94.8</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                    Peningkatan rata-rata pemahaman materi sebesar <strong className="text-slate-700">+40.3 poin</strong> (Learning Gain) pasca pelaksanaan program.
                  </p>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 6. TRAINER REVIEW VIEW */}
        {/* ======================================================== */}
        {activeTab === 'trainer' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Trainer Performance Review</h2>
              <p className="text-xs text-slate-500 mt-0.5">Evaluasi kinerja instruktur pengajar berdasarkan feedback score dan ketepatan penyelesaian kelas.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-slate-150 p-4 rounded-xl">
                <div className="text-xs text-slate-400 uppercase font-mono">Trainer Rating</div>
                <div className="text-2xl font-bold text-slate-800 mt-1">4.82 <span className="text-xs font-normal text-slate-400">/ 5.0</span></div>
                <div className="text-[10px] text-slate-500 mt-1">Sangat Puas (Excellent)</div>
              </div>
              <div className="border border-slate-150 p-4 rounded-xl">
                <div className="text-xs text-slate-400 uppercase font-mono">Active Trainers</div>
                <div className="text-2xl font-bold text-slate-800 mt-1">12</div>
                <div className="text-[10px] text-slate-500 mt-1">Instruktur Tersertifikasi</div>
              </div>
              <div className="border border-slate-150 p-4 rounded-xl">
                <div className="text-xs text-slate-400 uppercase font-mono">Total Classes Conducted</div>
                <div className="text-2xl font-bold text-slate-800 mt-1">345</div>
                <div className="text-[10px] text-slate-500 mt-1">Sesi Selesai</div>
              </div>
            </div>

            {/* List of trainers */}
            <div className="border border-slate-150 rounded-xl p-5 space-y-4">
              <h3 className="font-bold text-xs text-slate-600 uppercase font-mono">Instruktur Berkinerja Terbaik</h3>
              <div className="divide-y divide-slate-100">
                {[
                  { name: 'Sutopo Hadinoto', rating: 4.91, classes: 42, satisfaction: '98%' },
                  { name: 'Diana Lestari', rating: 4.88, classes: 38, satisfaction: '96%' },
                  { name: 'Rudy Ardiansyah', rating: 4.85, classes: 45, satisfaction: '95%' },
                  { name: 'Fita Permatasari', rating: 4.81, classes: 31, satisfaction: '94%' },
                ].map((tr, idx) => (
                  <div key={idx} className="py-3 flex justify-between items-center text-xs">
                    <div>
                      <div className="font-bold text-slate-700">{tr.name}</div>
                      <div className="text-[10px] text-slate-450">{tr.classes} Sesi Terlaksana</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-blue-600 font-mono">{tr.rating}</div>
                      <div className="text-[10px] text-slate-400">{tr.satisfaction} Kepuasan</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 7. DATA QUALITY VIEW */}
        {/* ======================================================== */}
        {activeTab === 'quality' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Data Quality Analytics Audit</h2>
              <p className="text-xs text-slate-500 mt-0.5">Pemantauan kualitas, kelengkapan, dan integritas data logs dari CSV source.</p>
            </div>

            <div className="border border-slate-150 rounded-xl p-5 space-y-4">
              <h3 className="font-bold text-xs text-slate-600 uppercase font-mono flex items-center gap-1.5 text-emerald-600">
                <CheckCircle2 className="w-4 h-4" /> Audit Integritas Data: Clean
              </h3>
              
              <div className="space-y-3 text-xs text-slate-600">
                <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg">
                  <span>Data Completeness Rate (Kelengkapan Data)</span>
                  <strong className="text-emerald-600 font-mono">99.98%</strong>
                </div>
                <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg">
                  <span>Duplicated Records Detected (Record Ganda)</span>
                  <strong className="text-slate-500 font-mono">0 Rows</strong>
                </div>
                <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg">
                  <span>Invalid NIK / Email Errors</span>
                  <strong className="text-slate-500 font-mono">0 Entries</strong>
                </div>
                <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg">
                  <span>Unmapped Store Codes</span>
                  <strong className="text-slate-500 font-mono">0 Entries</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 8. DETAIL DATA VIEW */}
        {/* ======================================================== */}
        {activeTab === 'detail' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Data Detail - Store Program Berjalan</h2>
                <p className="text-xs text-slate-500 mt-0.5">Tampilan data detail mentah di tingkat store dan peserta.</p>
              </div>
              <button
                onClick={() => alert('Mengunduh data snapshot CSV fallback... (18.694 Baris)')}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download CSV (18.694 rows)</span>
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-150">
              <table className="w-full text-left text-xs min-w-180">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[9px] font-mono border-b border-slate-150">
                  <tr>
                    <th className="py-3 px-4">Nama Store</th>
                    <th className="py-3 px-4">Regional</th>
                    <th className="py-3 px-4 text-center">Total Peserta</th>
                    <th className="py-3 px-4 text-center">Hadir</th>
                    <th className="py-3 px-4 text-center">Tingkat No-show</th>
                    <th className="py-3 px-4 text-center">Tingkat Kelulusan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {storeTableData.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-bold text-slate-800">{item.store}</td>
                      <td className="py-3 px-4 font-semibold text-slate-500">{item.regional}</td>
                      <td className="py-3 px-4 text-center font-mono text-slate-600">{item.peserta}</td>
                      <td className="py-3 px-4 text-center font-mono text-emerald-600">{item.hadir} ({item.hadirPct}%)</td>
                      <td className="py-3 px-4 text-center font-mono text-rose-500">{item.tidakHadir} ({item.tidakHadirPct}%)</td>
                      <td className="py-3 px-4 text-center font-mono text-blue-600">{item.lulus} ({item.lulusPct}%)</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
