import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import CreateOrEditUnitPopup from '../../components/admin/CreateOrEditUnitPopup';

interface TrainingUnit {
  unitCode: string;
  unitName: string;
}

const TrainingUnitPage: React.FC = () => {
  const [units, setUnits] = useState<TrainingUnit[]>([]);
  const [popupMode, setPopupMode] = useState<'create' | 'edit' | null>(null);
  const [editingUnit, setEditingUnit] = useState<TrainingUnit | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
  const [showActions, setShowActions] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleSelectUnit = (unitCode: string) => {
    setSelectedUnits((prev) =>
      prev.includes(unitCode)
        ? prev.filter((code) => code !== unitCode)
        : [...prev, unitCode]
    );
  };

  const selectAll = () => {
    if (selectedUnits.length === units.length) {
      setSelectedUnits([]);
    } else {
      setSelectedUnits(units.map((u) => u.unitCode));
    }
  };

  useEffect(() => {
    const fetchUnits = async () => {
      setLoading(true);
      try {
        const res = await axios.get('http://localhost:3001/units');
        const mapped = res.data.map((item: any) => ({
          unitCode: item.unit_code,
          unitName: item.name,
        }));
        setUnits(mapped);
      } catch (err) {
        console.error('Lỗi khi tải đơn vị:', err);
        alert('Lỗi khi tải danh sách đơn vị');
      } finally {
        setLoading(false);
      }
    };

    fetchUnits();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowActions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCreate = async (unit: TrainingUnit) => {
    try {
      await axios.post('http://localhost:3001/units', {
        unit_code: unit.unitCode,
        name: unit.unitName,
      });
      setUnits((prev) => [...prev, unit]);
    } catch (err) {
      console.error('Lỗi tạo đơn vị:', err);
      alert('Tạo đơn vị thất bại');
    }
  };

  const handleUpdate = async (updated: TrainingUnit) => {
    try {
      await axios.put(`http://localhost:3001/units/${updated.unitCode}`, {
        name: updated.unitName,
      });
      setUnits((prev) =>
        prev.map((u) => (u.unitCode === updated.unitCode ? updated : u))
      );
    } catch (err) {
      console.error('Lỗi cập nhật:', err);
      alert('Cập nhật đơn vị thất bại');
    }
  };

  const handleDelete = async (unitCode: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa đơn vị này?')) {
      try {
        await axios.delete(`http://localhost:3001/units/${unitCode}`);
        setUnits((prev) => prev.filter((u) => u.unitCode !== unitCode));
        setSelectedUnits((prev) => prev.filter((code) => code !== unitCode));
      } catch (err) {
        console.error('Lỗi xoá đơn vị:', err);
        alert('Xoá đơn vị thất bại');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">🏢 Đơn vị đào tạo</h1>

        <div className="relative" ref={dropdownRef}>
          <div className="flex gap-2 items-center">
            <button
              className="px-4 py-2 border rounded bg-white text-sm hover:bg-gray-100"
              onClick={() => setShowActions(!showActions)}
            >
              Actions ▾
            </button>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded"
              onClick={() => {
                setEditingUnit(null);
                setPopupMode('create');
              }}
            >
              Tạo đơn vị
            </button>
          </div>

          {/* Dropdown menu */}
          <div
            className={`absolute left-0 mt-2 w-48 bg-white border shadow-lg rounded z-10 text-sm origin-top transition-all duration-200 ease-out
              ${showActions ? 'scale-100 opacity-100 visible' : 'scale-95 opacity-0 invisible'}
            `}
          >
            <button
              className="w-full text-left px-4 py-2 hover:bg-gray-100 disabled:text-gray-400"
              disabled={selectedUnits.length !== 1}
              onClick={() => {
                const toEdit = units.find((u) => u.unitCode === selectedUnits[0]);
                if (toEdit) {
                  setEditingUnit(toEdit);
                  setPopupMode('edit');
                }
                setShowActions(false);
              }}
            >
              Chỉnh sửa
            </button>
            <button
              className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600 disabled:text-gray-400"
              disabled={selectedUnits.length === 0}
              onClick={() => {
                selectedUnits.forEach(code => handleDelete(code));
                setShowActions(false);
              }}
            >
              Xóa
            </button>
          </div>
        </div>
      </div>


      {/* Table */}
      {loading ? (
        <div className="text-center text-gray-500 py-8">⏳ Đang tải danh sách đơn vị...</div>
      ) : (
        <table className="w-full text-sm bg-white border shadow-sm rounded mt-4">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="p-3">
                <input
                  type="checkbox"
                  checked={selectedUnits.length === units.length && units.length > 0}
                  onChange={selectAll}
                />
              </th>
              <th className="p-3">Mã đơn vị</th>
              <th className="p-3">Tên đơn vị</th>
            </tr>
          </thead>
          <tbody>
            {units.map((unit) => (
              <tr key={unit.unitCode} className="border-t hover:bg-gray-50">
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={selectedUnits.includes(unit.unitCode)}
                    onChange={() => toggleSelectUnit(unit.unitCode)}
                  />
                </td>
                <td className="p-3 text-blue-600 underline">{unit.unitCode}</td>
                <td className="p-3 font-medium">{unit.unitName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Popup */}
      {popupMode && (
        <CreateOrEditUnitPopup
          onClose={() => {
            setPopupMode(null);
            setEditingUnit(null);
          }}
          onSubmit={popupMode === 'create' ? handleCreate : handleUpdate}
          initialData={editingUnit || undefined}
        />
      )}
    </div>
  );
};

export default TrainingUnitPage;
