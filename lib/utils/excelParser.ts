import * as XLSX from 'xlsx'
import { CreateContactInput } from '@/lib/validations/contact'

export interface ParseResult {
  contacts: CreateContactInput[]
  errors: { row: number; error: string }[]
}

export function parseExcelFile(buffer: Buffer): ParseResult {
  const contacts: CreateContactInput[] = []
  const errors: { row: number; error: string }[] = []

  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' })
    const firstSheet = workbook.SheetNames[0]
    
    if (!firstSheet) {
      throw new Error('الملف فارغ أو لا يحتوي على أوراق عمل')
    }

    const worksheet = workbook.Sheets[firstSheet]
    const data = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, {
      header: 1,
      defval: '',
    }) as unknown[][]

    // Skip header row and process data
    for (let i = 1; i < data.length; i++) {
      const row = data[i] as (string | number | undefined)[]
      
      if (!row || row.length === 0) continue

      const fullName = String(row[0] || '').trim()
      const phone = String(row[1] || '').trim()
      const email = row[2] ? String(row[2]).trim() : undefined

      if (!fullName) {
        errors.push({ row: i + 1, error: 'الاسم مطلوب' })
        continue
      }

      if (!phone) {
        errors.push({ row: i + 1, error: 'رقم الهاتف مطلوب' })
        continue
      }

      if (phone.length < 7) {
        errors.push({ row: i + 1, error: 'رقم الهاتف غير صحيح' })
        continue
      }

      contacts.push({
        fullName,
        phone,
        ...(email && { email }),
      })
    }
  } catch (error) {
    throw new Error(
      `خطأ في قراءة الملف: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`
    )
  }

  return { contacts, errors }
}
