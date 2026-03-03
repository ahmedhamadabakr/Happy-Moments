import { notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{ token: string }>
}

async function getClientView(token: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const res = await fetch(`${baseUrl}/api/v1/client-view/${token}`, {
    cache: 'no-store',
  })

  const json = await res.json()

  if (!res.ok || !json?.success) {
    return null
  }

  return json
}

export default async function ClientViewPage({ params }: PageProps) {
  const { token } = await params
  const data = await getClientView(token)

  if (!data) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-xl border bg-white p-6">
          <div className="text-2xl font-semibold">{data.client?.name || 'Client'}</div>
          {data.client?.email && (
            <div className="text-sm text-slate-600">{data.client.email}</div>
          )}
        </div>

        <div className="space-y-4">
          {data.events?.map((event: any) => (
            <div key={event.id} className="rounded-xl border bg-white p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="text-xl font-semibold">{event.title}</div>
                  {event.description && (
                    <div className="mt-1 text-sm text-slate-600">{event.description}</div>
                  )}
                  <div className="mt-2 text-sm text-slate-700">
                    {event.eventDate ? new Date(event.eventDate).toLocaleDateString() : ''}
                    {event.eventTime ? ` - ${event.eventTime}` : ''}
                  </div>
                  {event.location && (
                    <div className="mt-1 text-sm text-slate-700">
                      {event.locationUrl ? (
                        <a
                          className="text-blue-600 hover:underline"
                          href={event.locationUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {event.location}
                        </a>
                      ) : (
                        event.location
                      )}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-md bg-slate-50 p-2">
                    <div className="text-slate-500">Invited</div>
                    <div className="font-semibold">{event.stats?.totalInvited ?? 0}</div>
                  </div>
                  <div className="rounded-md bg-green-50 p-2">
                    <div className="text-slate-500">Confirmed</div>
                    <div className="font-semibold">{event.stats?.confirmed ?? 0}</div>
                  </div>
                  <div className="rounded-md bg-red-50 p-2">
                    <div className="text-slate-500">Declined</div>
                    <div className="font-semibold">{event.stats?.declined ?? 0}</div>
                  </div>
                  <div className="rounded-md bg-orange-50 p-2">
                    <div className="text-slate-500">Pending</div>
                    <div className="font-semibold">{event.stats?.pending ?? 0}</div>
                  </div>
                  <div className="rounded-md bg-purple-50 p-2 col-span-2">
                    <div className="text-slate-500">Checked In</div>
                    <div className="font-semibold">{event.stats?.checkedIn ?? 0}</div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <div className="text-sm font-medium">Guests</div>
                <div className="mt-2 grid gap-2">
                  {event.guests?.map((g: any, idx: number) => (
                    <div
                      key={`${g.phone}-${idx}`}
                      className="flex flex-col gap-2 rounded-lg bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <div className="font-medium">{g.name}</div>
                        {g.rsvpMessage && (
                          <div className="mt-1 text-sm text-slate-600">{g.rsvpMessage}</div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-medium border">
                          {g.rsvpStatus}
                        </span>
                        {g.checkInStatus === 'checked_in' && (
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-medium border">
                            checked_in
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
