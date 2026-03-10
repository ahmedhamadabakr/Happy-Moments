'use client'

import { Guest } from '@/lib/types'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { HelpCircle, CheckCircle, XCircle } from 'lucide-react'

export default function GuestList({ guests }: { guests: Guest[] }) {

  const rsvpStatusMap: any = {
    pending: { text: 'لم يرد', icon: HelpCircle, color: 'bg-yellow-50 text-yellow-700 border border-yellow-200' },
    attending: { text: 'سيحضر', icon: CheckCircle, color: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
    declined: { text: 'لن يحضر', icon: XCircle, color: 'bg-red-50 text-red-700 border border-red-200' },
  }

  const checkInStatusMap: any = {
    pending: { text: 'لم يصل', color: 'bg-slate-100 text-slate-700' },
    checked_in: { text: 'تم الدخول', color: 'bg-green-100 text-green-700' },
  }

  const invitationStatusMap: any = {
    pending: { text: 'لم تُرسل', color: 'bg-slate-100 text-slate-700' },
    sent: { text: 'تم الإرسال', color: 'bg-blue-100 text-blue-700' },
  }

  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-md" dir="rtl">
      <Table>

        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead className="text-right">الضيف</TableHead>
            <TableHead className="text-right">رقم الجوال</TableHead>
            <TableHead className="text-right">الدعوة</TableHead>
            <TableHead className="text-right">الرد</TableHead>
            <TableHead className="text-right">الدخول</TableHead>
            <TableHead className="text-right">QR scans</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>

          {guests.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-12">
                لا يوجد ضيوف
              </TableCell>
            </TableRow>
          )}

          {guests.map((guest) => {

            const rsvp = rsvpStatusMap[guest.rsvpStatus || 'pending']
            const checkin = checkInStatusMap[guest.checkInStatus || 'pending']
            const invite = invitationStatusMap[guest.invitationStatus || 'pending']

            return (
              <TableRow key={guest._id}>

                <TableCell>
                  <div className="font-bold">
                    {guest.snapshotName}
                  </div>
                </TableCell>

                <TableCell>
                  {guest.snapshotPhone}
                </TableCell>

                <TableCell>
                  <Badge className={invite.color}>
                    {invite.text}
                  </Badge>
                </TableCell>

                <TableCell>
                  <Badge className={`${rsvp.color} flex gap-1 items-center w-fit`}>
                    <rsvp.icon className="h-3 w-3" />
                    {rsvp.text}
                  </Badge>
                </TableCell>

                <TableCell>
                  <Badge className={checkin.color}>
                    {checkin.text}
                  </Badge>
                </TableCell>

                <TableCell>
                  {guest.scanCount || 0}
                </TableCell>

              </TableRow>
            )

          })}

        </TableBody>

      </Table>
    </div>
  )
}