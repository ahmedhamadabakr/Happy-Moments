'use client'

import { Button } from '@/components/ui/button'
import { Calendar, MapPin, Edit, X } from 'lucide-react'
import { Event } from '@/lib/types'

export default function EventHeader({
  event,
  onEdit,
  isEditMode
}: {
  event: Event
  onEdit: () => void
  isEditMode: boolean
}) {

  return (

    <div className="bg-white p-6 rounded-xl shadow">

      <h1 className="text-3xl font-bold">{event.title}</h1>

      <div className="flex gap-4 mt-2 text-gray-600">

        <div className="flex items-center gap-2">
          <Calendar size={16} />
          {new Date(event.eventDate).toLocaleDateString('ar-SA')}
        </div>

        {event.location && (
          <div className="flex items-center gap-2">
            <MapPin size={16} />
            {event.location}
          </div>
        )}

      </div>

      <div className="mt-4">

        <Button onClick={onEdit}>
          {isEditMode ? (
            <>
              <X className="ml-2" size={16} />
              إلغاء
            </>
          ) : (
            <>
              <Edit className="ml-2" size={16} />
              تعديل
            </>
          )}
        </Button>

      </div>

    </div>
  )
}