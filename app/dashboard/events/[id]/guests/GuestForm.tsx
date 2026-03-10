'use client'

import { useState, useEffect } from 'react'
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Props {
  eventId: string
  guest?: any
  open: boolean
  onFinished: () => void
}

export default function GuestForm({ eventId, guest, onFinished }: Props) {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    companion: 0
  })

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (guest) {
      setForm({
        firstName: guest.firstName || '',
        lastName: guest.lastName || '',
        phone: guest.snapshotPhone || '',
        companion: guest.companion || 0
      })
    }
  }, [guest])

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
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
        alert(data.error || 'حدث خطأ')
        return
      }

      onFinished()
    } catch (err) {
      alert('خطأ في الاتصال بالسيرفر')
    } finally {
      setLoading(false)
    }
  }

  return (
    <DialogContent dir="rtl">
      <DialogHeader>
        <DialogTitle>
          {guest ? 'تعديل بيانات الضيف' : 'إضافة ضيف جديد'}
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-4 mt-4">

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

        <Input
          name="phone"
          placeholder="رقم الجوال"
          value={form.phone}
          onChange={handleChange}
        />

        <Input
          name="companion"
          type="number"
          min={0}
          placeholder="عدد المرافقين"
          value={form.companion}
          onChange={handleChange}
        />

        <Button
          className="w-full bg-[#F08784] hover:bg-[#D97673]"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'جاري الحفظ...' : guest ? 'تحديث الضيف' : 'إضافة الضيف'}
        </Button>

      </div>
    </DialogContent>
  )
}