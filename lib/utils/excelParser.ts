import * as XLSX from 'xlsx';
import { normalizePhoneNumber, isValidPhoneNumber } from './phoneNormalizer';

export interface ParsedContact {
  firstName: string;
  lastName: string;
  suffix?: string;
  phone: string;
  companion?: number;
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
    let firstNameColumnIndex = -1;
    let lastNameColumnIndex = -1;
    let suffixColumnIndex = -1;
    let phoneColumnIndex = -1;
    let companionColumnIndex = -1;
    let emailColumnIndex = -1;
    
    // البحث عن العناوين (firstName, lastName, suffix, phone, companion, email)
    for (let i = 0; i < Math.min(5, rawData.length); i++) {
      const row = rawData[i];
      if (Array.isArray(row)) {
        for (let j = 0; j < row.length; j++) {
          const cell = String(row[j]).toLowerCase().trim();
          
          if (
            (cell === 'firstname' || cell === 'first name' || cell.includes('الاسم الأول')) &&
            firstNameColumnIndex === -1
          ) {
            firstNameColumnIndex = j;
            headerRowIndex = i;
          }
          
          if (
            (cell === 'lastname' || cell === 'last name' || cell.includes('اسم العائلة') || cell.includes('الاسم الأخير')) &&
            lastNameColumnIndex === -1
          ) {
            lastNameColumnIndex = j;
            headerRowIndex = i;
          }
          
          if (
            (cell === 'suffix' || cell.includes('لقب') || cell.includes('اللقب')) &&
            suffixColumnIndex === -1
          ) {
            suffixColumnIndex = j;
          }
          
          if (
            (cell === 'phone' || cell.includes('هاتف') || cell.includes('رقم') || cell.includes('mobile')) &&
            phoneColumnIndex === -1
          ) {
            phoneColumnIndex = j;
            headerRowIndex = i;
          }
          
          if (
            (cell === 'companion' || cell === 'companions' || cell.includes('مرافق') || cell.includes('المرافقين')) &&
            companionColumnIndex === -1
          ) {
            companionColumnIndex = j;
          }
          
          if (
            (cell === 'email' || cell.includes('بريد') || cell.includes('ايميل')) &&
            emailColumnIndex === -1
          ) {
            emailColumnIndex = j;
          }
        }
      }
      
      if (firstNameColumnIndex !== -1 && lastNameColumnIndex !== -1 && phoneColumnIndex !== -1) {
        break;
      }
    }
    
    // إذا لم نجد العناوين، نفترض الترتيب: firstName, lastName, suffix, phone, companion
    if (firstNameColumnIndex === -1 || lastNameColumnIndex === -1 || phoneColumnIndex === -1) {
      firstNameColumnIndex = 0;
      lastNameColumnIndex = 1;
      suffixColumnIndex = 2;
      phoneColumnIndex = 3;
      companionColumnIndex = 4;
      emailColumnIndex = 5;
      headerRowIndex = 0;
    }
    
    // معالجة البيانات
    const seenPhones = new Set<string>();
    
    for (let i = headerRowIndex + 1; i < rawData.length; i++) {
      const row = rawData[i];
      
      if (!Array.isArray(row) || row.length === 0) {
        continue;
      }
      
      const firstName = row[firstNameColumnIndex]?.toString().trim();
      const lastName = row[lastNameColumnIndex]?.toString().trim();
      const suffix = suffixColumnIndex !== -1 ? row[suffixColumnIndex]?.toString().trim() : undefined;
      const phone = row[phoneColumnIndex]?.toString().trim();
      const companionValue = companionColumnIndex !== -1 ? row[companionColumnIndex] : undefined;
      const companion = companionValue !== undefined && companionValue !== null && companionValue !== '' 
        ? parseInt(String(companionValue)) 
        : undefined;
      const email = emailColumnIndex !== -1 ? row[emailColumnIndex]?.toString().trim() : undefined;
      
      // التحقق من وجود الاسم الأول والأخير والهاتف
      if (!firstName || !lastName || !phone) {
        errors.push({
          row: i + 1,
          error: 'الاسم الأول أو الأخير أو رقم الهاتف مفقود',
        });
        continue;
      }
      
      try {
        // تطبيع رقم الهاتف
        const normalizedPhone = normalizePhoneNumber(phone, defaultCountryCode);
        
        // التحقق من صحة الرقم
        if (!isValidPhoneNumber(normalizedPhone)) {
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
          firstName,
          lastName,
          suffix,
          phone: normalizedPhone,
          companion: companion !== undefined && !isNaN(companion) ? companion : undefined,
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
