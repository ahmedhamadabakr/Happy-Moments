'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

type RsvpStatus = 'pending' | 'confirmed' | 'declined' | 'maybe'

interface InvitationData {
  guestName: string
  eventTitle: string
  eventDescription?: string
  eventDate: string
  eventTime?: string
  location?: string
  locationUrl?: string
  invitationImage?: string
  rsvpStatus: RsvpStatus
  rsvpMessage?: string
}

export default function RsvpPage() {
  const params = useParams()
  const token = params.token as string

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [invitation, setInvitation] = useState<InvitationData | null>(null)
  const [message, setMessage] = useState('')
  const [doneMessage, setDoneMessage] = useState<string | null>(null)

  const formattedDate = useMemo(() => {
    if (!invitation?.eventDate) return ''
    const d = new Date(invitation.eventDate)
    if (Number.isNaN(d.getTime())) return invitation.eventDate
    return d.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }, [invitation?.eventDate])

  useEffect(() => {
    let isMounted = true

    async function load() {
      try {
        setLoading(true)
        setError(null)

        const res = await fetch(`/api/v1/rsvp/${token}`, { cache: 'no-store' })
        const json = await res.json()

        if (!res.ok) {
          throw new Error(json?.error || 'فشل في تحميل الدعوة')
        }

        if (!isMounted) return

        setInvitation(json.invitation)
        setMessage(json.invitation?.rsvpMessage || '')
      } catch (e) {
        if (!isMounted) return
        setError(e instanceof Error ? e.message : 'خطأ غير معروف')
      } finally {
        if (!isMounted) return
        setLoading(false)
      }
    }

    if (token) load()

    return () => {
      isMounted = false
    }
  }, [token])

  async function submit(action: 'accept' | 'decline' | 'message') {
    try {
      setSubmitting(true)
      setDoneMessage(null)
      setError(null)

      const payload = action === 'message' ? { action, message } : { action }

      const res = await fetch(`/api/v1/rsvp/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const json = await res.json()

      if (!res.ok) {
        throw new Error(json?.error || 'فشل في تسجيل الرد')
      }

      setDoneMessage(json?.message || 'تم تسجيل ردك بنجاح')

      const refreshed = await fetch(`/api/v1/rsvp/${token}`, { cache: 'no-store' })
      const refreshedJson = await refreshed.json()
      if (refreshed.ok) {
        setInvitation(refreshedJson.invitation)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'خطأ غير معروف')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-3xl">
          <Card>
            <CardHeader>
              <CardTitle>جاري التحميل...</CardTitle>
              <CardDescription>يرجى الانتظار</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    )
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-3xl">
          <Card>
            <CardHeader>
              <CardTitle>تعذر عرض الدعوة</CardTitle>
              <CardDescription>{error || 'الدعوة غير موجودة'}</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{invitation.eventTitle}</CardTitle>
            <CardDescription>
              {invitation.guestName ? `مرحباً ${invitation.guestName}` : 'مرحباً'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {invitation.invitationImage && (
              <div className="overflow-hidden rounded-lg border bg-white">
                <img
                  src={invitation.invitationImage}
                  alt="Invitation"
                  className="h-auto w-full"
                />
              </div>
            )}

            {invitation.eventDescription && (
              <div className="text-sm text-slate-700">{invitation.eventDescription}</div>
            )}

            <div className="grid gap-2 text-sm text-slate-700">
              <div>
                <span className="font-medium">التاريخ:</span> {formattedDate}
                {invitation.eventTime ? ` - ${invitation.eventTime}` : ''}
              </div>
              {invitation.location && (
                <div>
                  <span className="font-medium">المكان:</span>{' '}
                  {invitation.locationUrl ? (
                    <a
                      className="text-blue-600 hover:underline"
                      href={invitation.locationUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {invitation.location}
                    </a>
                  ) : (
                    invitation.location
                  )}
                </div>
              )}
              <div>
                <span className="font-medium">حالة الرد:</span> {invitation.rsvpStatus}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Button
                disabled={submitting}
                onClick={() => submit('accept')}
              >
                حضور
              </Button>
              <Button
                variant="destructive"
                disabled={submitting}
                onClick={() => submit('decline')}
              >
                اعتذار
              </Button>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">رسالة (اختياري)</div>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="اكتب رسالة قصيرة..."
              />
              <div className="flex justify-end">
                <Button
                  variant="secondary"
                  disabled={submitting || message.trim().length === 0}
                  onClick={() => submit('message')}
                >
                  إرسال رسالة
                </Button>
              </div>
            </div>

            {doneMessage && (
              <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">
                {doneMessage}
              </div>
            )}

            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                {error}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
