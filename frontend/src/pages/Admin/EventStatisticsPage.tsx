import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from 'recharts';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { saveAs } from 'file-saver';

const API_BASE = 'http://localhost:3001';

const EventStatisticsPage: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [unitFilter, setUnitFilter] = useState<string>('');
  const [unitMap, setUnitMap] = useState<Record<string, string>>({});
  const [unitStats, setUnitStats] = useState<{ code: string, count: number, name?: string }[]>([]);

  const today = new Date();
  const nextMonth = new Date();
  nextMonth.setMonth(today.getMonth() + 1);
  const formatDate = (d: Date) => d.toISOString().split('T')[0];
  const [fromDate, setFromDate] = useState<string>(formatDate(today));
  const [toDate, setToDate] = useState<string>(formatDate(nextMonth));

  useEffect(() => {
    axios.get(`${API_BASE}/events`).then(res => setEvents(res.data));
    axios.get(`${API_BASE}/registrations/getAll`).then(res => setRegistrations(res.data.data));
    axios.get(`${API_BASE}/units/test`).then(res => {
      setUnits(res.data);
      const map: Record<string, string> = {};
      res.data.forEach((u: any) => {
        map[u.code] = u.name;
      });
      setUnitMap(map);
    });
  }, []);

  // LỌC SỰ KIỆN THEO NGÀY + MÃ ĐƠN VỊ
  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const isAfterFrom = !fromDate || new Date(e.start_time) >= new Date(fromDate);
      const isBeforeTo = !toDate || new Date(e.start_time) <= new Date(toDate);
      const isSameUnit = !unitFilter || e.unit_code === unitFilter;
      return isAfterFrom && isBeforeTo && isSameUnit;
    });
  }, [events, fromDate, toDate, unitFilter]);

  // TÍNH unitStats CHỈ TỪ filteredEvents
  useEffect(() => {
    const map: Record<string, number> = {};
    // chỉ dùng event trong khoảng đã lọc
    const eventMap = Object.fromEntries(filteredEvents.map((e) => [e.event_id, e]));
    const filteredEventIds = new Set(filteredEvents.map(e => e.event_id));

    registrations.forEach((r) => {
      if (!filteredEventIds.has(r.event_id)) return; // bỏ qua các đăng ký không thuộc sự kiện đã lọc
      const event = eventMap[r.event_id];
      if (!event || !event.unit_code) return;
      const code = event.unit_code;
      map[code] = (map[code] || 0) + 1;
    });

    const stats = Object.entries(map).map(([code, count]) => ({
      code,
      count,
      name: unitMap[code] || '(không rõ)',
    }));

    setUnitStats(stats);
  }, [filteredEvents, registrations, unitMap]);

  const handleExportExcel = () => {
    const exportData = filteredEvents.map((e, i) => ({
      STT: i + 1,
      'Tên sự kiện': e.title,
      'Ngày tổ chức': e.start_time,
      'Tổng đăng ký': registrations.filter(r => r.event_id === e.event_id).length,
      'Đơn vị tổ chức': unitMap[e.unit_code] || e.unit_code,
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sự kiện');
    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([buffer]), 'ThongKeSuKien.xlsx');
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.setFont('times', 'normal');
    doc.text('📊 Báo cáo sự kiện theo đơn vị', 14, 20);
    const body = filteredEvents.map((e, i) => ([
      i + 1,
      e.title,
      e.start_time,
      registrations.filter(r => r.event_id === e.event_id).length,
      unitMap[e.unit_code] || e.unit_code,
    ]));
    autoTable(doc, {
      head: [['STT', 'Tên sự kiện', 'Ngày tổ chức', 'Tổng đăng ký', 'Đơn vị']],
      body,
      startY: 30,
    });
    doc.save('ThongKeSuKien.pdf');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">📊 Thống kê sự kiện theo đơn vị</h1>

      {/* Bộ lọc ngày và nút */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
        <div>
          <label className="block">Từ ngày</label>
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="border rounded px-3 py-1" />
        </div>
        <div>
          <label className="block">Đến ngày</label>
          <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="border rounded px-3 py-1" />
        </div>
        <button
          onClick={() => setUnitFilter('')}
          className="sm:ml-auto px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
        >
          🔄 Xem tất cả đơn vị
        </button>
      </div>

      <p className="text-sm text-gray-500">
        Hiển thị {filteredEvents.length} sự kiện từ {events.length} tổng sự kiện
      </p>

      {/* Biểu đồ */}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={unitStats}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="code" />
          <YAxis />
          <Tooltip formatter={(value) => [`${value}`, 'Số đăng ký']} />
          <Bar
            dataKey="count"
            fill="#3b82f6"
            onClick={(entry: any) => {
              setUnitFilter(entry.payload.code); // click để lọc theo đơn vị vẫn hoạt động
            }}
          />
        </BarChart>
      </ResponsiveContainer>

      {/* Bảng chú thích đơn vị */}
      <div className="overflow-x-auto">
        <table className="mt-4 border text-sm w-full sm:w-1/2">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-2 py-1">Mã đơn vị</th>
              <th className="border px-2 py-1">Tên đơn vị</th>
            </tr>
          </thead>
          <tbody>
            {unitStats.map((item) => (
              <tr key={item.code}>
                <td className="border px-2 py-1">{item.code}</td>
                <td className="border px-2 py-1">
                  {item.name || `⚠️ Không có tên (${item.code})`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bảng sự kiện chi tiết */}
      <div className="overflow-x-auto">
        <table className="w-full border mt-4 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-2 py-1">STT</th>
              <th className="border px-2 py-1">Tên sự kiện</th>
              <th className="border px-2 py-1">Ngày tổ chức</th>
              <th className="border px-2 py-1">Tổng đăng ký</th>
              <th className="border px-2 py-1">Đơn vị</th>
            </tr>
          </thead>
          <tbody>
            {filteredEvents.map((e, i) => (
              <tr key={e.event_id} className="odd:bg-white even:bg-gray-50">
                <td className="border px-2 py-1 text-center">{i + 1}</td>
                <td className="border px-2 py-1">{e.title}</td>
                <td className="border px-2 py-1 text-center">{e.start_time}</td>
                <td className="border px-2 py-1 text-center">
                  {registrations.filter(r => r.event_id === e.event_id).length}
                </td>
                <td className="border px-2 py-1 text-center">{unitMap[e.unit_code] || e.unit_code}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Export buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mt-4">
        <button onClick={handleExportExcel} className="bg-green-600 text-white px-4 py-2 rounded">📥 Xuất Excel</button>
        <button onClick={handleExportPDF} className="bg-red-600 text-white px-4 py-2 rounded">📄 Xuất PDF</button>
      </div>
    </div>
  );
};

export default EventStatisticsPage;
