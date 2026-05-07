import React, { useState, useEffect } from 'react';
import { Users, UserCheck, Trash2, Search, Loader2, Filter, GraduationCap, Briefcase, RefreshCw, Plus, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

/**
 * Reusable Stat Card Component
 */
const StatCard = ({ title, count, icon: Icon, colorClass, gradient }) => (
  <div className={`card-premium relative overflow-hidden p-6 group`}>
    <div className={`absolute top-0 right-0 w-32 h-32 ${gradient} opacity-[0.05] rounded-full -translate-y-12 translate-x-12 group-hover:scale-125 transition-transform duration-500`}></div>
    <div className="flex items-center gap-5 relative z-10">
      <div className={`p-4 rounded-2xl ${colorClass} text-white shadow-lg transition-transform group-hover:scale-110 duration-300`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em]">{title}</p>
        <div className="flex items-end gap-2 mt-1">
          <h3 className="text-3xl font-black tracking-tight" style={{ color: 'var(--text-main)' }}>{count}</h3>
          <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-md mb-1.5">+2.4%</span>
        </div>
      </div>
    </div>
  </div>
);

/**
 * Reusable Data Table Component
 */
const DataTable = ({ 
  title, 
  columns, 
  data, 
  onDelete, 
  searchPlaceholder, 
  searchValue, 
  onSearchChange, 
  emptyMessage,
  icon: TitleIcon,
  themeColor = "blue"
}) => {
  return (
    <div className="card-premium p-0 overflow-hidden flex flex-col group/table transition-all duration-500" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
      <div className="p-10 pb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b" style={{ borderColor: 'var(--border-color)' }}>
        <div className="flex items-center gap-5">
          {TitleIcon && (
            <div className="h-14 w-14 bg-indigo-600/10 rounded-2xl flex items-center justify-center border border-indigo-600/20 group-hover/table:rotate-6 transition-transform duration-500">
                <TitleIcon size={28} className="text-indigo-600" />
            </div>
          )}
          <div>
            <h2 className="text-3xl font-black tracking-tighter" style={{ color: 'var(--text-main)' }}>{title}</h2>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mt-1.5 opacity-60">Registry Index Visualization</p>
          </div>
        </div>
        <div className="relative group/search">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/search:text-indigo-600 transition-colors" size={20} />
          <input
            type="text"
            placeholder={searchPlaceholder}
            className="w-full sm:w-96 pl-14 pr-6 py-4 rounded-[1.5rem] text-sm font-bold shadow-inner-sm outline-none transition-all focus:ring-4 focus:ring-indigo-500/10"
            style={{ backgroundColor: 'var(--bg-surface-2)', color: 'var(--text-main)' }}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b" style={{ backgroundColor: 'var(--bg-surface-2)', borderColor: 'var(--border-color)' }}>
              {columns.map((col, idx) => (
                <th key={idx} className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">{col.header}</th>
              ))}
              <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Administrative Action</th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
            {data.length > 0 ? (
              data.map((item, idx) => (
                <tr key={item._id || item.id || idx} className="hover:bg-indigo-500/5 dark:hover:bg-white/5 transition-all duration-300 group/row">
                  {columns.map((col, cIdx) => (
                    <td key={cIdx} className="px-10 py-6">
                      {col.render ? col.render(item) : (
                        <span className="text-sm font-bold" style={{ color: 'var(--text-main)' }}>
                            {item[col.key] || '—'}
                        </span>
                      )}
                    </td>
                  ))}
                  <td className="px-10 py-6 text-right">
                    <button
                      onClick={() => onDelete(item._id || item.id || idx)}
                      className="p-3.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-2xl transition-all border border-transparent hover:border-rose-500/20"
                    >
                      <Trash2 size={20} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + 1} className="px-10 py-32 text-center">
                  <div className="flex flex-col items-center justify-center animate-fade-in">
                    <div className="h-24 w-24 bg-slate-50 dark:bg-slate-900 rounded-[2rem] flex items-center justify-center text-slate-300 dark:text-slate-700 mb-8 border border-slate-100 dark:border-slate-800">
                       <Search size={48} />
                    </div>
                    <p className="text-slate-400 font-black text-xs uppercase tracking-[0.2em]">{emptyMessage}</p>
                    <button onClick={() => onSearchChange('')} className="mt-4 text-indigo-600 text-xs font-black uppercase tracking-widest hover:underline">Reset Directory Filter</button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Admin = () => {
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentSearch, setStudentSearch] = useState('');
  const [teacherSearch, setTeacherSearch] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      let studentData = [];
      let teacherData = [];

      const localStudents = localStorage.getItem('students');
      const localTeachers = localStorage.getItem('teachers');

      if (localStudents) {
        studentData = JSON.parse(localStudents);
      } else {
        try {
          const res = await axios.get('/api/students');
          studentData = res.data.success ? res.data.students || res.data : res.data;
        } catch (e) {
          console.log("No API students found");
        }
      }

      if (localTeachers) {
        teacherData = JSON.parse(localTeachers);
      } else {
        try {
          const res = await axios.get('/api/teachers');
          teacherData = res.data.success ? res.data.teachers || res.data : res.data;
        } catch (e) {
          console.log("No API teachers found");
        }
      }

      if (studentData.length === 0 && teacherData.length === 0 && !localStudents && !localTeachers) {
        const dummyStudents = [
          { id: 's1', name: 'Zoya Khan', email: 'zoya@learnhub.com', course: 'UX/UI Mastery' },
          { id: 's2', name: 'Arjun Mehta', email: 'arjun@learnhub.com', course: 'Node.js Backend' },
          { id: 's3', name: 'Riya Gupta', email: 'riya@learnhub.com', course: 'React Frameworks' }
        ];
        const dummyTeachers = [
          { id: 't1', name: 'Dr. Sarah Wilson', subject: 'Cloud Architecture', experience: '12' },
          { id: 't2', name: 'Prof. Michael Brown', subject: 'Cyber Security', experience: '8' },
          { id: 't3', name: 'Lisa Ray', subject: 'Frontend Design', experience: '5' }
        ];
        setStudents(dummyStudents);
        setTeachers(dummyTeachers);
        localStorage.setItem('students', JSON.stringify(dummyStudents));
        localStorage.setItem('teachers', JSON.stringify(dummyTeachers));
      } else {
        setStudents(Array.isArray(studentData) ? studentData : []);
        setTeachers(Array.isArray(teacherData) ? teacherData : []);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load directory data");
    } finally {
      setTimeout(() => setLoading(false), 500); 
    }
  };

  const deleteStudent = (id) => {
    if (window.confirm("Permanent delete this student record?")) {
      const updated = students.filter((s, idx) => (s._id || s.id || idx) !== id);
      setStudents(updated);
      localStorage.setItem('students', JSON.stringify(updated));
      toast.success("Record deleted");
    }
  };

  const deleteTeacher = (id) => {
    if (window.confirm("Permanent delete this teacher record?")) {
      const updated = teachers.filter((t, idx) => (t._id || t.id || idx) !== id);
      setTeachers(updated);
      localStorage.setItem('teachers', JSON.stringify(updated));
      toast.success("Record deleted");
    }
  };

  const filteredStudents = students.filter(s => 
    s.name?.toLowerCase().includes(studentSearch.toLowerCase()) || 
    s.email?.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.course?.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const filteredTeachers = teachers.filter(t => 
    t.name?.toLowerCase().includes(teacherSearch.toLowerCase()) || 
    t.subject?.toLowerCase().includes(teacherSearch.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <div className="relative">
          <Loader2 className="animate-spin text-indigo-600" size={64} />
          <div className="absolute inset-0 blur-2xl bg-indigo-500/20 animate-pulse rounded-full"></div>
        </div>
        <p className="mt-10 text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] animate-pulse">Establishing Secure Connection...</p>
      </div>
    );
  }

  return (
    <div className="space-y-16 pb-20 animate-fade-in-up">
      {/* Analytics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <StatCard 
          title="Global Student Registry" 
          count={students.length} 
          icon={GraduationCap} 
          colorClass="bg-indigo-600" 
          gradient="bg-indigo-600"
        />
        <StatCard 
          title="Verified Faculty Assets" 
          count={teachers.length} 
          icon={Briefcase} 
          colorClass="bg-emerald-500" 
          gradient="bg-emerald-500"
        />
      </div>

      {/* Directory Sections */}
      <div className="space-y-16">
        <DataTable
          title="Candidate Registry"
          icon={Users}
          columns={[
            { 
              header: 'Identity Signature', 
              key: 'name', 
              render: (s) => (
                <div className="flex items-center gap-5">
                  <div className="h-12 w-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-glow-indigo transition-transform group-hover/row:scale-110">
                    {s.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-base font-black tracking-tight" style={{ color: 'var(--text-main)' }}>{s.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{s.email}</p>
                  </div>
                </div>
              ) 
            },
            { header: 'Current Enrollment', key: 'course', render: (s) => (
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[11px] font-black uppercase tracking-wider border border-indigo-500/20">
                    <RefreshCw size={12} className="animate-spin-slow" /> {s.course}
                </span>
            )}
          ]}
          data={filteredStudents}
          onDelete={deleteStudent}
          searchValue={studentSearch}
          onSearchChange={setStudentSearch}
          searchPlaceholder="Filter Registry..."
          emptyMessage="No Match Located in Core"
        />

        <DataTable
          title="Faculty Directory"
          icon={UserCheck}
          columns={[
            { 
              header: 'Verified Faculty', 
              key: 'name', 
              render: (t) => (
                <div className="flex items-center gap-5">
                  <div className="h-12 w-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white font-black text-sm shadow-glow-success transition-transform group-hover/row:scale-110">
                    {t.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-base font-black tracking-tight" style={{ color: 'var(--text-main)' }}>{t.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Faculty Member</p>
                  </div>
                </div>
              ) 
            },
            { header: 'Specialization', key: 'subject', render: (t) => (
                <span className="px-4 py-2 rounded-xl bg-slate-500/10 text-slate-600 dark:text-slate-400 text-[11px] font-black uppercase tracking-wider border border-slate-500/20">{t.subject}</span>
            )},
            { header: 'Tenure Cycle', key: 'experience', render: (t) => (
                <span className="flex items-center gap-2 text-sm font-black tracking-tight" style={{ color: 'var(--text-main)' }}>
                    <Briefcase size={16} className="text-amber-500" /> {t.experience} Years
                </span>
            )}
          ]}
          data={filteredTeachers}
          onDelete={deleteTeacher}
          searchValue={teacherSearch}
          onSearchChange={setTeacherSearch}
          searchPlaceholder="Filter Faculty..."
          emptyMessage="No Faculty Nodes Located"
        />
      </div>
    </div>
  );
};

export default Admin;
