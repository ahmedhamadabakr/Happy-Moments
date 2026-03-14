import { z } from 'zod'

export const createEventSchema = z.object({
  title: z.string()
    .min(3, 'عنوان الفعالية يجب أن يكون على الأقل 3 أحرف')
    .max(255, 'عنوان الفعالية يجب أن لا يتجاوز 255 حرف'),
  description: z.string().max(1000, 'الوصف يجب أن لا يتجاوز 1000 حرف').optional(),
  eventDate: z.string().or(z.date()),
  eventTime: z.string().optional(),
  location: z.string().max(255, 'الموقع يجب أن لا يتجاوز 255 حرف').optional(),
})

export const updateEventSchema = createEventSchema.partial()

export const selectGuestsSchema = z.object({
  contactIds: z.array(z.string()).min(1, 'يجب تحديد جهة اتصال واحدة على الأقل'),
})

export type CreateEventInput = z.infer<typeof createEventSchema>
export type UpdateEventInput = z.infer<typeof updateEventSchema>
export type SelectGuestsInput = z.infer<typeof selectGuestsSchema>
