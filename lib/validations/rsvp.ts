import { z } from 'zod'

export const submitRsvpSchema = z.object({
  response: z.enum(['confirmed', 'declined', 'maybe'], {
    errorMap: () => ({ message: 'الرد يجب أن يكون: تأكيد أو اعتذار أو ربما' }),
  }),
  notes: z.string()
    .max(500, 'الملاحظات يجب أن لا تتجاوز 500 حرف')
    .optional()
    .or(z.literal('')),
})

export type SubmitRsvpInput = z.infer<typeof submitRsvpSchema>
