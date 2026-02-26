import jsPDF from 'jspdf'
import { EventGuest } from '@/lib/models/EventGuest'
import { CheckIn } from '@/lib/models/CheckIn'
import { Event } from '@/lib/models/Event'

interface EventStatistics {
  totalInvited: number
  invitationsSent: number
  confirmed: number
  declined: number
  maybe: number
  attended: number
  noShow: number
  attendanceRate: number
}

async function getEventStatistics(eventId: string): Promise<EventStatistics> {
  const totalInvited = await EventGuest.countDocuments({ eventId })
  const invitationsSent = await EventGuest.countDocuments({
    eventId,
    invitationStatus: 'sent',
  })
  const confirmed = await EventGuest.countDocuments({
    eventId,
    rsvpStatus: 'confirmed',
  })
  const declined = await EventGuest.countDocuments({
    eventId,
    rsvpStatus: 'declined',
  })
  const maybe = await EventGuest.countDocuments({
    eventId,
    rsvpStatus: 'maybe',
  })
  const attended = await CheckIn.countDocuments({ eventId })
  const noShow = confirmed - attended
  const attendanceRate = confirmed > 0 ? Math.round((attended / confirmed) * 100) : 0

  return {
    totalInvited,
    invitationsSent,
    confirmed,
    declined,
    maybe,
    attended,
    noShow,
    attendanceRate,
  }
}

export async function generateEventPdf(eventId: string): Promise<Buffer> {
  try {
    const event = await Event.findById(eventId).lean()
    if (!event) {
      throw new Error('الفعالية غير موجودة')
    }

    const stats = await getEventStatistics(eventId)
    const guests = await EventGuest.find({ eventId }).lean()

    // Create PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    // Set Arabic font (use default as jsPDF doesn't support Arabic by default)
    pdf.setFont('helvetica')

    // Add header
    pdf.setFontSize(16)
    pdf.text('تقرير الفعالية', 105, 20, { align: 'center' })

    pdf.setFontSize(12)
    const eventTitleShort = event.title.substring(0, 40)
    pdf.text(`عنوان: ${eventTitleShort}`, 20, 35)
    pdf.text(`التاريخ: ${event.eventDate.toISOString().split('T')[0]}`, 20, 45)

    // Add statistics section
    pdf.setFontSize(11)
    pdf.text('الإحصائيات:', 20, 60)

    const statsY = 70
    const statsData = [
      ['إجمالي المدعوين', `${stats.totalInvited}`],
      ['الدعوات المرسلة', `${stats.invitationsSent}`],
      ['التأكيدات', `${stats.confirmed}`],
      ['الاعتذارات', `${stats.declined}`],
      ['ربما', `${stats.maybe}`],
      ['الحضور', `${stats.attended}`],
      ['الغياب', `${stats.noShow}`],
      ['نسبة الحضور', `${stats.attendanceRate}%`],
    ]

    let currentY = statsY
    statsData.forEach(([label, value]) => {
      pdf.text(`${label}: ${value}`, 20, currentY)
      currentY += 8
    })

    // Add guests table
    currentY += 5
    pdf.setFontSize(11)
    pdf.text('قائمة الضيوف:', 20, currentY)
    currentY += 8

    // Table headers
    const tableX = 20
    const colWidths = [30, 30, 30, 40]
    const headers = ['الاسم', 'الهاتف', 'الرد', 'الحضور']

    pdf.setFontSize(10)
    let headerX = tableX
    headers.forEach((header, i) => {
      pdf.text(header, headerX, currentY)
      headerX += colWidths[i]
    })

    currentY += 6
    pdf.setDrawColor(200, 200, 200)
    pdf.line(20, currentY, 190, currentY)
    currentY += 3

    // Table rows
    pdf.setFontSize(9)
    let rowCount = 0
    for (const guest of guests) {
      if (rowCount > 20) {
        // Add new page if needed
        pdf.addPage()
        currentY = 20
        rowCount = 0
      }

      const rsvpStatusMap: Record<string, string> = {
        confirmed: 'مؤكد',
        declined: 'مرفوض',
        maybe: 'ربما',
        pending: 'قيد',
      }

      const checkInStatusMap: Record<string, string> = {
        checked_in: 'حضر',
        no_show: 'غياب',
        pending: 'قيد',
      }

      let rowX = tableX
      const rowData = [
        guest.snapshotName.substring(0, 15),
        guest.snapshotPhone,
        rsvpStatusMap[guest.rsvpStatus] || guest.rsvpStatus,
        checkInStatusMap[guest.checkInStatus] || guest.checkInStatus,
      ]

      rowData.forEach((text, i) => {
        pdf.text(text, rowX, currentY)
        rowX += colWidths[i]
      })

      currentY += 5
      rowCount++
    }

    // Add footer with generation date
    pdf.setFontSize(8)
    pdf.text(
      `تم الإنشاء: ${new Date().toLocaleString('ar-EG')}`,
      105,
      pdf.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    )

    return Buffer.from(pdf.output('arraybuffer'))
  } catch (error) {
    throw new Error(
      `Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}
