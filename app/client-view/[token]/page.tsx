'use client'
import { useEffect, useState } from 'react'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { Calendar, MapPin, Users, CheckCircle, XCircle, Clock, UserCheck, Sparkles, ChevronDown } from 'lucide-react'

interface PageProps {
  params: Promise<{ token: string }>
}

export default function ClientViewPage({ params }: PageProps) {
  const [token, setToken] = useState<string>('')
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<any>(null)

  useEffect(() => {
    params.then(p => {
      setToken(p.token)
      fetchData(p.token)
    })
  }, [params])

  const fetchData = async (token: string) => {
    try {
      const res = await fetch(`/api/v1/client-view/${token}`)
      const result = await res.json()
      if (result.success) {
        setData(result)
        if (result.events?.length > 0) {
          setSelectedEvent(result.events[0])
        }
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#F08784] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 text-lg font-medium">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return notFound()
  }

  const statusLabels: Record<string, string> = {
    confirmed: 'مؤكد',
    declined: 'معتذر',
    pending: 'قيد الانتظار',
    maybe: 'ربما',
  }

  const checkInLabels: Record<string, string> = {
    checked_in: 'حضر',
    pending: 'لم يحضر',
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm backdrop-blur-md bg-white/95">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo2.png" alt="هابي مومنتس" width={120} height={40} className="object-contain" />
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-slate-900">{data.client?.name}</div>
            {data.client?.email && (
              <div className="text-sm text-slate-600">{data.client.email}</div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-[#F08784]/10 text-[#F08784] px-5 py-2 rounded-full text-sm font-bold mb-4">
            <Sparkles size={18} />
            <span>مرحباً بك</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
            فعالياتك مع <span className="text-[#F08784]">هابي مومنتس</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            استعرض جميع فعالياتك وتفاصيل الضيوف بكل سهولة
          </p>
        </div>

        {/* Events Selection */}
        {data.events?.length > 1 && (
          <div className="mb-8">
            <label className="block text-lg font-bold text-slate-900 mb-4">اختر الفعالية:</label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.events.map((event: any) => (
                <button
                  key={event.id}
                  onClick={() => setSelectedEvent(event)}
                  className={`p-6 rounded-2xl border-2 transition-all duration-300 text-right ${
                    selectedEvent?.id === event.id
                      ? 'border-[#F08784] bg-gradient-to-br from-[#F08784]/10 to-[#D97673]/5 shadow-lg'
                      : 'border-slate-200 bg-white hover:border-[#F08784]/50 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-bold text-slate-900">{event.title}</h3>
                    {selectedEvent?.id === event.id && (
                      <CheckCircle className="text-[#F08784] flex-shrink-0" size={24} />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                    <Calendar size={16} />
                    <span>{new Date(event.eventDate).toLocaleDateString('ar-EG', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                  </div>
                  {event.eventTime && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Clock size={16} />
                      <span>{event.eventTime}</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

<<<<<<< HEAD
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-md bg-slate-50 p-2">
                    <div className="text-slate-500">مدعو</div>
                    <div className="font-semibold">{event.stats?.totalInvited ?? 0}</div>
                  </div>
                  <div className="rounded-md bg-green-50 p-2">
                    <div className="text-slate-500">مؤكد</div>
                    <div className="font-semibold">{event.stats?.confirmed ?? 0}</div>
                  </div>
                  <div className="rounded-md bg-red-50 p-2">
                    <div className="text-slate-500">رفض</div>
                    <div className="font-semibold">{event.stats?.declined ?? 0}</div>
                  </div>
                  <div className="rounded-md bg-orange-50 p-2">
                    <div className="text-slate-500">قيد الانتظار</div>
                    <div className="font-semibold">{event.stats?.pending ?? 0}</div>
                  </div>
                  <div className="rounded-md bg-purple-50 p-2 col-span-2">
                    <div className="text-slate-500">تم تسجيل الوصول</div>
                    <div className="font-semibold">{event.stats?.checkedIn ?? 0}</div>
                  </div>
=======
        {/* Selected Event Details */}
        {selectedEvent && (
          <div className="space-y-6">
            {/* Event Info Card */}
            <div className="bg-gradient-to-br from-white to-slate-50 rounded-3xl p-8 shadow-xl border border-slate-200">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 mb-2">{selectedEvent.title}</h2>
                  {selectedEvent.description && (
                    <p className="text-slate-600 text-lg">{selectedEvent.description}</p>
                  )}
>>>>>>> 9b4a3b4a66a9e5ec0430fa5ff0bc5afa488162ea
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                  selectedEvent.status === 'active' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-slate-100 text-slate-700'
                }`}>
                  {selectedEvent.status === 'active' ? 'نشط' : 'مغلق'}
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200">
                  <div className="w-12 h-12 bg-[#F08784]/10 rounded-full flex items-center justify-center">
                    <Calendar className="text-[#F08784]" size={24} />
                  </div>
                  <div>
                    <div className="text-sm text-slate-600">التاريخ</div>
                    <div className="font-bold text-slate-900">
                      {new Date(selectedEvent.eventDate).toLocaleDateString('ar-EG', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        weekday: 'long'
                      })}
                    </div>
                  </div>
                </div>

                {selectedEvent.eventTime && (
                  <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200">
                    <div className="w-12 h-12 bg-[#F08784]/10 rounded-full flex items-center justify-center">
                      <Clock className="text-[#F08784]" size={24} />
                    </div>
                    <div>
                      <div className="text-sm text-slate-600">الوقت</div>
                      <div className="font-bold text-slate-900">{selectedEvent.eventTime}</div>
                    </div>
                  </div>
                )}

                {selectedEvent.location && (
                  <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 md:col-span-2">
                    <div className="w-12 h-12 bg-[#F08784]/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <MapPin className="text-[#F08784]" size={24} />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-slate-600">الموقع</div>
                      {selectedEvent.locationUrl ? (
                        <a
                          href={selectedEvent.locationUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="font-bold text-[#F08784] hover:text-[#D97673] transition-colors"
                        >
                          {selectedEvent.location}
                        </a>
                      ) : (
                        <div className="font-bold text-slate-900">{selectedEvent.location}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-6 border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <Users className="text-blue-600" size={24} />
                </div>
                <div className="text-3xl font-black text-blue-900 mb-1">
                  {selectedEvent.stats?.totalInvited ?? 0}
                </div>
                <div className="text-sm font-bold text-blue-700">إجمالي المدعوين</div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl p-6 border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <CheckCircle className="text-green-600" size={24} />
                </div>
                <div className="text-3xl font-black text-green-900 mb-1">
                  {selectedEvent.stats?.confirmed ?? 0}
                </div>
                <div className="text-sm font-bold text-green-700">مؤكد الحضور</div>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-red-100/50 rounded-2xl p-6 border border-red-200">
                <div className="flex items-center justify-between mb-2">
                  <XCircle className="text-red-600" size={24} />
                </div>
                <div className="text-3xl font-black text-red-900 mb-1">
                  {selectedEvent.stats?.declined ?? 0}
                </div>
                <div className="text-sm font-bold text-red-700">معتذر</div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-2xl p-6 border border-orange-200">
                <div className="flex items-center justify-between mb-2">
                  <Clock className="text-orange-600" size={24} />
                </div>
                <div className="text-3xl font-black text-orange-900 mb-1">
                  {selectedEvent.stats?.pending ?? 0}
                </div>
                <div className="text-sm font-bold text-orange-700">قيد الانتظار</div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-2xl p-6 border border-purple-200">
                <div className="flex items-center justify-between mb-2">
                  <UserCheck className="text-purple-600" size={24} />
                </div>
                <div className="text-3xl font-black text-purple-900 mb-1">
                  {selectedEvent.stats?.checkedIn ?? 0}
                </div>
                <div className="text-sm font-bold text-purple-700">حضر فعلياً</div>
              </div>
            </div>

            {/* Guests List */}
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-2 h-8 bg-gradient-to-b from-[#F08784] to-[#D97673] rounded-full"></div>
                <h3 className="text-2xl font-black text-slate-900">قائمة الضيوف</h3>
                <span className="bg-slate-100 text-slate-700 px-4 py-1.5 rounded-full text-sm font-bold">
                  {selectedEvent.guests?.length ?? 0} ضيف
                </span>
              </div>

              <div className="space-y-3">
                {selectedEvent.guests?.map((guest: any, idx: number) => (
                  <div
                    key={`${guest.phone}-${idx}`}
                    className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-200 hover:border-[#F08784]/30 hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="font-bold text-lg text-slate-900 mb-1">{guest.name}</div>
                        {guest.phone && (
                          <div className="text-sm text-slate-600 mb-2">{guest.phone}</div>
                        )}
                        {guest.rsvpMessage && (
                          <div className="mt-2 p-3 bg-white rounded-xl border border-slate-200">
                            <div className="text-xs text-slate-500 mb-1">رسالة:</div>
                            <div className="text-sm text-slate-700">{guest.rsvpMessage}</div>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-4 py-2 rounded-full text-sm font-bold border-2 ${
                          guest.rsvpStatus === 'confirmed'
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : guest.rsvpStatus === 'declined'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-orange-50 text-orange-700 border-orange-200'
                        }`}>
                          {statusLabels[guest.rsvpStatus] || guest.rsvpStatus}
                        </span>
                        {guest.checkInStatus === 'checked_in' && (
                          <span className="px-4 py-2 rounded-full text-sm font-bold bg-purple-50 text-purple-700 border-2 border-purple-200">
                            ✓ حضر
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {(!selectedEvent.guests || selectedEvent.guests.length === 0) && (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 text-lg">لا يوجد ضيوف بعد</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {(!data.events || data.events.length === 0) && (
          <div className="text-center py-20">
            <Calendar className="w-20 h-20 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-xl font-medium">لا توجد فعاليات بعد</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-200 bg-white text-center text-slate-600 text-sm mt-12">
        <p>© {new Date().getFullYear()} هابي مومنتس. جميع الحقوق محفوظة - صنع بكل حب في الكويت 🇰🇼</p>
      </footer>
    </div>
  )
}
