'use client'

import { Event, Guest } from '@/lib/types'
import { Card } from '@/components/ui/card'

export default function EventStats({
  event,
  guests
}: {
  event: Event
  guests: Guest[]
}) {

  const attending = guests.filter(g => g.rsvpStatus === 'ATTENDING').length

  return (

    <div className="grid md:grid-cols-4 gap-4">

      <Card className="p-4">
        الحالة
        <div className="text-2xl font-bold">
          {event.status}
        </div>
      </Card>

      <Card className="p-4">
        الضيوف
        <div className="text-2xl font-bold">
          {guests.length}
        </div>
      </Card>

      <Card className="p-4">
        الحضور
        <div className="text-2xl font-bold">
          {attending}
        </div>
      </Card>

      <Card className="p-4">
        النسبة
        <div className="text-2xl font-bold">
          {guests.length ? Math.round((attending / guests.length) * 100) : 0}%
        </div>
      </Card>

    </div>
  )
}