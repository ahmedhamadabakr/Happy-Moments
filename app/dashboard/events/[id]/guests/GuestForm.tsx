'use client'

import { useState, useEffect } from 'react'
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

// تعريف هيكل بيانات الضيف لتحسين التوقعات البرمجية
interface Guest {
  _id?: string
  firstName: string
  lastName: string
  snapshotPhone?: string // أو phone حسب ما يرسله السيرفر
  companion: number
}

interface Props {
  eventId: string
  guest?: Guest | null // أضفنا null للحالات التي لا يوجد فيها ضيف
  open: boolean
  onFinished: () => void
}

export default function GuestForm({ eventId, guest, onFinished }: Props) {
  const initialState = {
    firstName: '',
    lastName: '',
    phone: '',
    companion: 0
  }

  const [form, setForm] = useState(initialState)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (guest) {
      setForm({
        firstName: guest.firstName || '',
        lastName: guest.lastName || '',
        phone: guest.snapshotPhone || '',
        companion: guest.companion || 0
      })
    } else {
      // مهم جداً لتفريغ الحقول عند إضافة ضيف جديد بعد عملية تعديل
      setForm(initialState)
    }
  }, [guest])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target
    setForm(prev => ({
      ...prev,
      // تحويل القيمة لرقم إذا كان نوع المدخل number
      [name]: type === 'number' ? parseInt(value) || 0 : value 
    }))
  }

  const handleSubmit = async () => {
    // التحقق من البيانات الأساسية قبل الإرسال
    if (!form.firstName || !form.phone) {
      alert('يرجى ملء الحقول الأساسية')
      return
    }

    try {
      setLoading(true)

      const url = guest
        ? `/api/v1/events/${eventId}/guests/${guest._id}`
        : `/api/v1/events/${eventId}/guests`

      const method = guest ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'حدث خطأ أثناء الحفظ')
      }

      onFinished()
    } catch (err: any) {
      alert(err.message || 'خطأ في الاتصال بالسيرفر')
    } finally {
      setLoading(false)
    }
  }

  return (
    <DialogContent dir="rtl" className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle className="text-right">
          {guest ? 'تعديل بيانات الضيف' : 'إضافة ضيف جديد'}
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-4 mt-4">
        <div className="grid grid-cols-2 gap-2">
           <Input
            name="firstName"
            placeholder="الاسم الأول"
            value={form.firstName}
            onChange={handleChange}
          />
          <Input
            name="lastName"
            placeholder="اسم العائلة"
            value={form.lastName}
            onChange={handleChange}
          />
        </div>

        <Input
          name="phone"
          placeholder="رقم الجوال"
          value={form.phone}
          onChange={handleChange}
        />

        <div className="space-y-1">
          <label className="text-sm text-gray-500 mr-1">عدد المرافقين</label>
          <Input
            name="companion"
            type="number"
            min={0}
            placeholder="عدد المرافقين"
            value={form.companion}
            onChange={handleChange}
          />
        </div>

        <Button
          className="w-full bg-[#F08784] hover:bg-[#D97673] text-white mt-4"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'جاري الحفظ...' : guest ? 'تحديث البيانات' : 'إضافة الضيف'}
        </Button>
      </div>
    </DialogContent>
  )
}