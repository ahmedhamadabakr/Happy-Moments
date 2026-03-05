import EmployeeRegisterForm from '@/components/auth/ModernRegisterForm';

export const metadata = {
  title: 'إضافة موظف جديد | منصة إدارة الفعاليات',
  description: 'إضافة موظف أو مدير جديد للنظام',
};

export default function RegisterPage() {
  return <EmployeeRegisterForm />;
}
