'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Plus, Edit2, Trash2, Shield, Mail, Phone, Calendar, Search, Filter } from 'lucide-react';

interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: 'manager' | 'EMPLOYEE';
  permissions: string[];
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export default function UsersManagementPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [authorized, setAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAuthorization();
  }, []);

  const checkAuthorization = async () => {
    try {
      const response = await fetch('/api/auth/profile');
      const data = await response.json();
      
      if (!data.success || !data.data || !data.data.user || data.data.user.role !== 'manager') {
        router.push('/dashboard');
        return;
      }
      
      setAuthorized(true);
      fetchEmployees();
    } catch (error) {
      console.error('Authorization check failed:', error);
      router.push('/dashboard');
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/v1/employees');
      const data = await response.json();
      
      if (data.success) {
        setEmployees(data.employees);
      } else {
        console.error('Failed to fetch employees:', data.error);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEmployee = async (id: string, name: string) => {
    if (!confirm(`هل أنت متأكد من حذف "${name}"؟ هذا الإجراء لا يمكن التراجع عنه.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/v1/employees/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        // Show success message
        const successMessage = document.createElement('div');
        successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-pulse';
        successMessage.textContent = 'تم حذف الموظف بنجاح';
        document.body.appendChild(successMessage);

        setTimeout(() => {
          document.body.removeChild(successMessage);
        }, 3000);

        fetchEmployees();
      } else {
        alert(data.error || 'فشل حذف الموظف');
      }
    } catch (error) {
      alert('حدث خطأ أثناء حذف الموظف');
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/v1/employees/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      const data = await response.json();

      if (data.success) {
        fetchEmployees();
      } else {
        alert(data.error || 'فشل تحديث حالة الموظف');
      }
    } catch (error) {
      alert('حدث خطأ أثناء تحديث حالة الموظف');
    }
  };

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = `${employee.firstName} ${employee.lastName} ${employee.email}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || employee.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && employee.isActive) || 
      (statusFilter === 'inactive' && !employee.isActive);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadge = (role: string) => {
    const badges = {
      MANAGER: { color: 'bg-purple-100 text-purple-800', text: 'مدير عام', icon: '👑' },
      EMPLOYEE: { color: 'bg-green-100 text-green-800', text: 'موظف', icon: '👤' }
    };
    
    const badge = badges[role as keyof typeof badges] || badges.EMPLOYEE;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        <span>{badge.icon}</span>
        {badge.text}
      </span>
    );
  };

  if (!authorized || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#C1A286] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">{!authorized ? 'جاري التحقق من الصلاحيات...' : 'جاري تحميل الموظفين...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-[#C1A286] to-[#d4b896] rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#1A2E26]">إدارة الموظفين</h1>
                <p className="text-gray-600">إدارة وتحكم في الموظفين والمديرين</p>
              </div>
            </div>
            
            <button
              onClick={() => router.push('/register')}
              className="flex items-center gap-2 px-4 py-2 bg-[#1A2E26] text-white rounded-lg hover:bg-[#2a4a3d] transition-colors"
            >
              <Plus className="w-4 h-4" />
              إضافة موظف جديد
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="البحث بالاسم أو البريد الإلكتروني..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C1A286] focus:border-transparent"
              />
            </div>

            {/* Role Filter */}
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <Filter className="h-5 w-5 text-gray-400" />
              </div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C1A286] focus:border-transparent appearance-none"
              >
                <option value="all">جميع الأدوار</option>
                <option value="MANAGER">مدير عام</option>
                <option value="EMPLOYEE">موظف</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <Filter className="h-5 w-5 text-gray-400" />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C1A286] focus:border-transparent appearance-none"
              >
                <option value="all">جميع الحالات</option>
                <option value="active">نشط</option>
                <option value="inactive">غير نشط</option>
              </select>
            </div>
          </div>
        </div>

        {/* Employees List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {filteredEmployees.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">لا يوجد موظفين</h3>
              <p className="text-gray-600 mb-6">ابدأ بإضافة موظفين جدد للنظام</p>
              <button
                onClick={() => router.push('/register')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#1A2E26] text-white rounded-lg hover:bg-[#2a4a3d] transition-colors"
              >
                <Plus className="w-4 h-4" />
                إضافة موظف جديد
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الموظف
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الدور
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الحالة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      تاريخ الإنشاء
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEmployees.map((employee) => (
                    <tr key={employee._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {employee.firstName} {employee.lastName}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-2">
                            <Mail className="w-3 h-3" />
                            {employee.email}
                          </div>
                          {employee.phone && (
                            <div className="text-sm text-gray-500 flex items-center gap-2">
                              <Phone className="w-3 h-3" />
                              {employee.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getRoleBadge(employee.role)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleStatus(employee._id, employee.isActive)}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                            employee.isActive
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          }`}
                        >
                          <div className={`w-2 h-2 rounded-full ${
                            employee.isActive ? 'bg-green-500' : 'bg-red-500'
                          }`}></div>
                          {employee.isActive ? 'نشط' : 'غير نشط'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3 h-3" />
                          {new Date(employee.createdAt).toLocaleDateString('ar-SA')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => router.push(`/register?edit=${employee._id}`)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                            title="تعديل"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteEmployee(employee._id, `${employee.firstName} ${employee.lastName}`)}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                            title="حذف"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">إجمالي الموظفين</p>
                <p className="text-2xl font-bold text-[#1A2E26]">{employees.length}</p>
              </div>
              <Users className="w-8 h-8 text-[#C1A286]" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">الموظفين</p>
                <p className="text-2xl font-bold text-green-600">
                  {employees.filter(e => e.role === 'EMPLOYEE').length}
                </p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">النشطين</p>
                <p className="text-2xl font-bold text-purple-600">
                  {employees.filter(e => e.isActive).length}
                </p>
              </div>
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-purple-600 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
