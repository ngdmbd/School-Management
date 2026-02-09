
import React from 'react';
import { Student, Translation } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface DashboardProps {
  students: Student[];
  t: Translation;
}

const Dashboard: React.FC<DashboardProps> = ({ students, t }) => {
  const stats = {
    total: students.length,
    male: students.filter(s => s.gender === 'Male').length,
    female: students.filter(s => s.gender === 'Female').length,
    avgAttendance: Math.round(students.reduce((acc, curr) => acc + curr.attendance, 0) / students.length) || 0
  };

  const chartData = [
    { name: t.statsMale, value: stats.male },
    { name: t.statsFemale, value: stats.female },
  ];

  const classData = Array.from(new Set(students.map(s => s.class))).map(cls => ({
    class: cls,
    count: students.filter(s => s.class === cls).length
  }));

  const COLORS = ['#10b981', '#f59e0b'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="text-slate-500 text-sm font-medium">{t.statsTotalStudents}</div>
          <div className="text-3xl font-bold mt-1 text-emerald-600">{stats.total}</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="text-slate-500 text-sm font-medium">{t.statsMale}</div>
          <div className="text-3xl font-bold mt-1 text-blue-600">{stats.male}</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="text-slate-500 text-sm font-medium">{t.statsFemale}</div>
          <div className="text-3xl font-bold mt-1 text-pink-600">{stats.female}</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="text-slate-500 text-sm font-medium">{t.attendance} (%)</div>
          <div className="text-3xl font-bold mt-1 text-orange-600">{stats.avgAttendance}%</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-80">
          <h3 className="font-semibold text-slate-800 mb-4">Students by Class</h3>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={classData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="class" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-80 flex flex-col">
          <h3 className="font-semibold text-slate-800 mb-4">Gender Distribution</h3>
          <div className="flex-1 flex items-center justify-center">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
             </ResponsiveContainer>
          </div>
          <div className="flex justify-center space-x-6 text-sm">
            <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-emerald-500 mr-2"></span> {t.statsMale}</div>
            <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-orange-500 mr-2"></span> {t.statsFemale}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
