'use client'

import { Event } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function EventEditForm({
  formData,
  setFormData,
  onSave,
  onCancel,
  loading
}: {
  formData: Partial<Event>
  setFormData: (data: Partial<Event>) => void
  onSave: () => void
  onCancel: () => void
  loading?: boolean
}) {

  return (

    <Card className="border-2 border-[#F08784]/30 shadow-lg rounded-3xl bg-gradient-to-br from-white to-[#F08784]/5 overflow-hidden">

      <CardHeader className="border-b border-[#F08784]/20 bg-[#F08784]/5">
        <CardTitle className="text-2xl text-slate-900">
          تعديل بيانات الفعالية
        </CardTitle>

        <CardDescription>
          يمكنك تعديل جميع بيانات الفعالية من هنا
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">

        <div className="grid md:grid-cols-2 gap-6">

          {/* عنوان الفعالية */}

          <div className="space-y-2">

            <label className="text-sm font-bold text-slate-700">
              عنوان الفعالية
            </label>

            <Input
              value={formData.title || ''}
              placeholder="مثال: حفل التخرج"
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="rounded-xl"
            />

          </div>

          {/* الموقع */}

          <div className="space-y-2">

            <label className="text-sm font-bold text-slate-700">
              الموقع
            </label>

            <Input
              value={formData.location || ''}
              placeholder="مثال: قاعة الاحتفالات"
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              className="rounded-xl"
            />

          </div>

          {/* رابط الموقع */}

          <div className="space-y-2">

            <label className="text-sm font-bold text-slate-700">
              رابط Google Maps
            </label>

            <Input
              value={formData.locationUrl || ''}
              placeholder="https://maps.google.com"
              onChange={(e) =>
                setFormData({ ...formData, locationUrl: e.target.value })
              }
              className="rounded-xl"
            />

          </div>

          {/* التاريخ */}

          <div className="space-y-2">

            <label className="text-sm font-bold text-slate-700">
              التاريخ والوقت
            </label>

            <Input
              type="datetime-local"
              value={
                formData.eventDate
                  ? new Date(formData.eventDate)
                      .toISOString()
                      .substring(0, 16)
                  : ''
              }
              onChange={(e) =>
                setFormData({ ...formData, eventDate: e.target.value })
              }
              className="rounded-xl"
            />

          </div>

        </div>

        {/* الوصف */}

        <div className="space-y-2">

          <label className="text-sm font-bold text-slate-700">
            وصف الفعالية
          </label>

          <textarea
            value={formData.description || ''}
            placeholder="اكتب وصف الفعالية..."
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="w-full rounded-xl border border-slate-200 p-3 min-h-[120px] focus:border-[#F08784] focus:outline-none focus:ring-1 focus:ring-[#F08784]"
          />

        </div>

        {/* الأزرار */}

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">

          <Button
            variant="outline"
            onClick={onCancel}
            className="border-2 border-slate-300 hover:bg-slate-50 font-semibold rounded-xl"
          >
            إلغاء
          </Button>

          <Button
            onClick={onSave}
            disabled={loading}
            className="bg-[#F08784] hover:bg-[#D97673] text-white font-semibold shadow-md rounded-xl min-w-[120px]"
          >

            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'حفظ التغييرات'
            )}

          </Button>

        </div>

      </CardContent>

    </Card>

  )
}