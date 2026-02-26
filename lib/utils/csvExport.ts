import { EventGuest, RSVPStatus } from '@/lib/models/EventGuest'
import { CheckIn } from '@/lib/models/CheckIn'
import Papa from 'papaparse'

interface GuestRecord {
  الاسم: string
  الهاتف: string
  البريد: string
  حالة_الدعوة: string
  حالة_الرد: string
  حالة_الحضور: string
  رقم_الهاتف_الأصلي: string
}

export async function generateGuestsCsv(eventId: string): Promise<string> {
  try {
    // Get all event guests
    const eventGuests = await EventGuest.find({ eventId }).lean()

    // Get check-ins
    const checkIns = await CheckIn.find({
      eventId,
    }).select('eventGuestId').lean()

    const checkedInGuestIds = new Set(
      checkIns.map(ci => ci.eventGuestId.toString())
    )

    // Map status values to Arabic
    const invitationStatusMap: Record<string, string> = {
      pending: 'قيد الانتظار',
      sent: 'مرسلة',
      failed: 'فشلت',
    }

    const rsvpStatusMap: Record<string, string> = {
      pending: 'قيد الانتظار',
      confirmed: 'مؤكد',
      declined: 'مرفوض',
      maybe: 'ربما',
    }

    const checkInStatusMap: Record<string, string> = {
      pending: 'قيد الانتظار',
      checked_in: 'تم الحضور',
      no_show: 'لم يحضر',
    }

    const records: GuestRecord[] = eventGuests.map(guest => ({
      الاسم: guest.snapshotName,
      الهاتف: guest.snapshotPhone,
      البريد: guest.snapshotEmail || '-',
      حالة_الدعوة: invitationStatusMap[guest.invitationStatus] || guest.invitationStatus,
      حالة_الرد: rsvpStatusMap[guest.rsvpStatus] || guest.rsvpStatus,
      حالة_الحضور: checkInStatusMap[guest.checkInStatus] || guest.checkInStatus,
      رقم_الهاتف_الأصلي: guest.snapshotPhone,
    }))

    // Generate CSV
    const csv = Papa.unparse(records, {
      header: true,
      dynamicTyping: false,
    })

    return csv
  } catch (error) {
    throw new Error(
      `Failed to generate CSV: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

export function generateCsvFile(
  records: Record<string, any>[],
  filename: string
): { csv: string; filename: string } {
  const csv = Papa.unparse(records, {
    header: true,
    dynamicTyping: false,
  })

  return { csv, filename }
}
