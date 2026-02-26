'use client';

import { useState } from 'react';
import { useAuthStore } from '@/lib/store/authStore';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { Modal } from '@/components/shared/Modal';
import { FormInput } from '@/components/shared/FormInput';

interface Template {
  _id: string;
  name: string;
  content: string;
  type: 'invitation' | 'reminder' | 'thankyou';
}

const defaultTemplates: Template[] = [
  {
    _id: '1',
    name: 'دعوة الفعالية',
    type: 'invitation',
    content: 'السلام عليكم ورحمة الله وبركاته\n\nنتشرف بدعوتك للحضور إلى فعاليتنا\n\n[تفاصيل الفعالية]\n\nالتاريخ: [التاريخ]\nالوقت: [الوقت]\nالمكان: [المكان]\n\nيرجى تأكيد حضورك من خلال:\n[رابط RSVP]',
  },
  {
    _id: '2',
    name: 'تذكير بالفعالية',
    type: 'reminder',
    content: 'السلام عليكم ورحمة الله وبركاته\n\nتذكير برفق بفعاليتنا القادمة\n\n[اسم الفعالية]\nالتاريخ: [التاريخ] - الوقت: [الوقت]\nالمكان: [المكان]',
  },
  {
    _id: '3',
    name: 'شكراً للحضور',
    type: 'thankyou',
    content: 'السلام عليكم ورحمة الله وبركاته\n\nشكراً لحضورك وتعاونك في فعاليتنا\n\nنتطلع لرؤيتك في الفعاليات القادمة',
  },
];

export default function TemplatesPage() {
  const { user, company } = useAuthStore();
  const [templates, setTemplates] = useState<Template[]>(defaultTemplates);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    content: '',
  });

  const handleEdit = (template: Template) => {
    setEditingTemplate(template);
    setFormData({ name: template.name, content: template.content });
    setIsEditOpen(true);
  };

  const handleSave = () => {
    if (editingTemplate) {
      setTemplates(
        templates.map((t) =>
          t._id === editingTemplate._id
            ? { ...editingTemplate, ...formData }
            : t
        )
      );
    }
    setIsEditOpen(false);
    setEditingTemplate(null);
    setFormData({ name: '', content: '' });
  };

  const typeLabel = {
    invitation: 'دعوة',
    reminder: 'تذكير',
    thankyou: 'شكر',
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">قوالب الرسائل</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <Card key={template._id} title={template.name}>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">النوع</p>
                  <p className="text-sm font-medium text-gray-900">
                    {typeLabel[template.type as keyof typeof typeLabel]}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">المحتوى</p>
                  <p className="text-sm text-gray-700 line-clamp-3">
                    {template.content}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(template)}
                  className="w-full"
                >
                  تعديل
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title={`تعديل القالب: ${editingTemplate?.name}`}
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => setIsEditOpen(false)}
            >
              إلغاء
            </Button>
            <Button onClick={handleSave}>حفظ</Button>
          </>
        }
      >
        <div className="space-y-4">
          <FormInput
            label="اسم القالب"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
          />
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              محتوى الرسالة
            </label>
            <textarea
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={10}
            />
            <p className="text-xs text-gray-500">
              استخدم [اسم] [التاريخ] [الوقت] [المكان] كمتغيرات ديناميكية
            </p>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
