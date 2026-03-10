import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function EventAnalytics({ eventId }: { eventId: string }) {

  return (

    <Card>

      <CardHeader>
        <CardTitle>تحليلات الفعالية</CardTitle>
      </CardHeader>

      <CardContent>
        <p>سيتم عرض تحليلات الحضور والردود هنا.</p>
      </CardContent>

    </Card>

  )

}