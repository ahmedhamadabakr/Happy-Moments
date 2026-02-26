import * as XLSX from 'xlsx';
import { normalizePhoneNumber, validatePhoneNumber } from './phoneNormalizer';

export interface ParsedContact {
  fullName: string;
  phone: string;
  email?: string;
  rowNumber: number;
}

export interface ExcelParseResult {
  contacts: ParsedContact[];
  errors: {
    row: number;
    error: string;
  }[];
  totalRows: number;
  validRows: number;
  invalidRows: number;
}

/**
 * قراءة وتحليل ملف Excel
 */
export async function parseExcelFile(
  fileBuffer: Buffer,
  defaultCountryCode: string = '+20'
): Promise<ExcelParseResult> {
  try {
    // قراءة الملف
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    
    // الحصول على أول ورقة
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // تحويل إلى JSON
    const rawData: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    if (rawData.length === 0) {
      throw new Error('الملف فارغ');
    }
    
    const contacts: ParsedContact[] = [];
    const errors: { row: number; error: string }[] = [];
    
    // البحث عن صف العناوين
    let headerRowIndex = -1;
    let nameColumnIndex = -1;
    let phoneColumnIndex = -1;
    let emailColumnIndex = -1;
    
    // البحث عن العناوين (Name, Phone, Email)
    for (let i = 0; i < Math.min(5, rawData.length); i++) {
      const row = rawData[i];
      if (Array.isArray(row)) {
        for (let j = 0; j < row.length; j++) {
          const cell = String(row[j]).toLowerCase().trim();
          
          if (
            (cell.includes('name') || cell.includes('اسم') || cell.includes('الاسم')) &&
            nameColumnIndex === -1
          ) {
            nameColumnIndex = j;
            headerRowIndex = i;
          }
          
          if (
            (cell.includes('phone') || cell.includes('هاتف') || cell.includes('رقم') || cell.includes('mobile')) &&
            phoneColumnIndex === -1
          ) {
            phoneColumnIndex = j;
            headerRowIndex = i;
          }
          
          if (
            (cell.includes('email') || cell.includes('بريد') || cell.includes('ايميل')) &&
            emailColumnIndex === -1
          ) {
            emailColumnIndex = j;
          }
        }
      }
      
      if (nameColumnIndex !== -1 && phoneColumnIndex !== -1) {
        break;
      }
    }
    
    // إذا لم نجد العناوين، نفترض أن أول عمود هو الاسم والثاني هو الهاتف
    if (nameColumnIndex === -1 || phoneColumnIndex === -1) {
      nameColumnIndex = 0;
      phoneColumnIndex = 1;
      emailColumnIndex = 2;
      headerRowIndex = 0;
    }
    
    // معالجة البيانات
    const seenPhones = new Set<string>();
    
    for (let i = headerRowIndex + 1; i < rawData.length; i++) {
      const row = rawData[i];
      
      if (!Array.isArray(row) || row.length === 0) {
        continue;
      }
      
      const name = row[nameColumnIndex]?.toString().trim();
      const phone = row[phoneColumnIndex]?.toString().trim();
      const email = emailColumnIndex !== -1 ? row[emailColumnIndex]?.toString().trim() : undefined;
      
      // التحقق من وجود الاسم والهاتف
      if (!name || !phone) {
        errors.push({
          row: i + 1,
          error: 'الاسم أو رقم الهاتف مفقود',
        });
        continue;
      }
      
      try {
        // تطبيع رقم الهاتف
        const normalizedPhone = normalizePhoneNumber(phone, defaultCountryCode);
        
        // التحقق من صحة الرقم
        if (!validatePhoneNumber(normalizedPhone)) {
          errors.push({
            row: i + 1,
            error: 'رقم الهاتف غير صحيح',
          });
          continue;
        }
        
        // تجاهل المكررات
        if (seenPhones.has(normalizedPhone)) {
          errors.push({
            row: i + 1,
            error: 'رقم الهاتف مكرر',
          });
          continue;
        }
        
        seenPhones.add(normalizedPhone);
        
        contacts.push({
          fullName: name,
          phone: normalizedPhone,
          email: email && email.includes('@') ? email.toLowerCase() : undefined,
          rowNumber: i + 1,
        });
      } catch (error: any) {
        errors.push({
          row: i + 1,
          error: error.message || 'خطأ في معالجة البيانات',
        });
      }
    }
    
    return {
      contacts,
      errors,
      totalRows: rawData.length - headerRowIndex - 1,
      validRows: contacts.length,
      invalidRows: errors.length,
    };
  } catch (error: any) {
    console.error('Error parsing Excel file:', error);
    throw new Error('فشل في قراءة ملف Excel: ' + error.message);
  }
}

/**
 * التحقق من نوع الملف
 */
export function validateExcelFile(filename: string, mimetype: string): boolean {
  const validExtensions = ['.xlsx', '.xls', '.csv'];
  const validMimeTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/csv',
  ];
  
  const hasValidExtension = validExtensions.some(ext => filename.toLowerCase().endsWith(ext));
  const hasValidMimeType = validMimeTypes.includes(mimetype);
  
  return hasValidExtension && hasValidMimeType;
}
