import { z } from 'zod'

export const createContactSchema = z.object({
  fullName: z.string()
    .min(2, 'الاسم يجب أن يكون على الأقل حرفين')
    .max(255, 'الاسم يجب أن لا يتجاوز 255 حرف'),
  phone: z.string()
    .min(7, 'رقم الهاتف غير صحيح')
    .max(20, 'رقم الهاتف غير صحيح'),
  email: z.string().email().optional().or(z.literal('')),
})

export const bulkUploadSchema = z.object({
  contacts: z.array(createContactSchema).min(1, 'يجب تحديد المقاويم واحد على الأقل'),
})

export type CreateContactInput = z.infer<typeof createContactSchema>
export type BulkUploadInput = z.infer<typeof bulkUploadSchema>
