'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Loader2, UserPlus, Edit, Trash2, Search, CheckCircle, XCircle, HelpCircle } from 'lucide-react'
import { useApi } from '@/lib/hooks/useApi'
import { Guest } from '@/lib/types'
import GuestForm from './GuestForm'

export default function EventGuestsPage() {
  const params = useParams()
  const eventId = params?.id?.toString() || ''

  const [guests, setGuests] = useState<Guest[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedGuest, setSelectedGuest] = useState<Guest | undefined>()
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const { execute: fetchGuests, loading } = useApi(
    `/api/v1/events/${eventId}/guests?page=${page}&limit=10`,
    {
      onSuccess: (data) => {
        setGuests(data?.data || [])
        setTotalPages(data?.pagination?.pages || 1)
      }
    }
  )

  useEffect(() => { if(eventId) fetchGuests() }, [eventId, page])

  const filteredGuests = useMemo(() => {
    const term = searchTerm.toLowerCase()
    return guests.filter(g => {
      const name = (g.snapshotName || `${g.firstName} ${g.lastName}`).toLowerCase()
      const phone = (g.snapshotPhone || '').toLowerCase()
      return name.includes(term) || phone.includes(term)
    })
  }, [guests, searchTerm])

  const handleDeleteGuest = async (guestId: string) => {
    if(!confirm('هل أنت متأكد من حذف هذا الضيف؟')) return
    try {
      const res = await fetch(`/api/v1/events/${eventId}/guests/${guestId}`, { method: 'DELETE' })
      const data = await res.json()
      if(res.ok) fetchGuests()
      else alert(data.error || 'فشل الحذف')
    } catch(e) {
      alert('خطأ في الاتصال')
    }
  }

  const rsvpStatusMap: any = {
    pending: { text: 'لم يرد', icon: HelpCircle, color: 'bg-slate-100 text-slate-700' },
    confirmed: { text: 'سيحضر', icon: CheckCircle, color: 'bg-green-100 text-green-800 border-green-200' },
    declined: { text: 'لن يحضر', icon: XCircle, color: 'bg-red-100 text-red-800 border-red-200' },
    maybe: { text: 'ربما', icon: HelpCircle, color: 'bg-yellow-100 text-yellow-800 border-yellow-200' }
  }

  return (
    <DashboardLayout>
      <div dir="rtl" className="space-y-6">
        {/* Header */}
        <Card className="p-6 border-none shadow-sm bg-gradient-to-l from-[#F08784]/10 to-transparent">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#F08784] rounded-xl flex items-center justify-center shadow-sm">
              <UserPlus className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">إدارة الضيوف</h1>
              <p className="text-slate-500 text-sm">أضف ونظم قائمة المدعوين لفعاليتك</p>
            </div>
          </div>
        </Card>

        {/* Guests Table */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex justify-between items-center pb-6">
            <CardTitle className="text-xl">قائمة الضيوف ({guests.length})</CardTitle>
            <Dialog open={isFormOpen} onOpenChange={(val) => { setIsFormOpen(val); if(!val) setSelectedGuest(undefined) }}>
              <DialogTrigger asChild>
                <Button className="bg-[#F08784] hover:bg-[#D97673] text-white shadow-sm">
                  <UserPlus className="ml-2 h-4 w-4" /> إضافة ضيف
                </Button>
              </DialogTrigger>
              <GuestForm
                eventId={eventId}
                guest={selectedGuest}
                open={isFormOpen}
                onFinished={() => { setIsFormOpen(false); setSelectedGuest(undefined); fetchGuests() }}
              />
            </Dialog>
          </CardHeader>

          <CardContent>
            <div className="mb-4 relative">
              <Input
                placeholder="بحث بالاسم أو رقم الجوال..."
                className="pr-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute right-3 top-2.5 h-5 w-5 text-slate-400" />
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="text-right">الضيف</TableHead>
                    <TableHead className="text-right">حالة الرد</TableHead>
                    <TableHead className="text-center">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={3} className="h-24 text-center">جاري التحميل...</TableCell></TableRow>
                  ) : filteredGuests.length === 0 ? (
                    <TableRow><TableCell colSpan={3} className="h-24 text-center">لا يوجد ضيوف حالياً</TableCell></TableRow>
                  ) : (
                    filteredGuests.map((guest) => {
                      const status = rsvpStatusMap[guest.rsvpStatus || 'pending']
                      return (
                        <TableRow key={guest._id} className="hover:bg-slate-50/50">
                          <TableCell>
                            <div className="font-bold">{guest.snapshotName}</div>
                            <div className="text-xs text-slate-500">{guest.snapshotPhone}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`${status.color} border shadow-none px-2 py-1`}>
                              <status.icon className="ml-1.5 h-3.5 w-3.5" /> {status.text}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-center gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                onClick={() => { setSelectedGuest(guest); setIsFormOpen(true) }}
                              >
                                <Edit className="h-4 w-4 ml-1" /> تعديل
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleDeleteGuest(guest._id)}
                              >
                                <Trash2 className="h-4 w-4 ml-1" /> حذف
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex justify-center gap-2 mt-4">
                <Button disabled={page===1} onClick={()=>setPage(p=>p-1)}>السابق</Button>
                <span className="px-2 py-1 border rounded">{page} / {totalPages}</span>
                <Button disabled={page===totalPages} onClick={()=>setPage(p=>p+1)}>التالي</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}