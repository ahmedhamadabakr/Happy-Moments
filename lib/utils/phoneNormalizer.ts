/**
 * تطبيع أرقام الهواتف
 * يدعم الأرقام مع أو بدون كود الدولة
 */

// أكواد الدول الشائعة
const COUNTRY_CODES = [
  '+20',  // مصر
  '+966', // السعودية
  '+971', // الإمارات
  '+965', // الكويت
  '+968', // عمان
  '+974', // قطر
  '+973', // البحرين
  '+962', // الأردن
  '+961', // لبنان
  '+963', // سوريا
  '+964', // العراق
  '+967', // اليمن
  '+212', // المغرب
  '+213', // الجزائر
  '+216', // تونس
  '+218', // ليبيا
  '+249', // السودان
  '+1',   // أمريكا/كندا
  '+44',  // بريطانيا
];

/**
 * تنظيف رقم الهاتف من الرموز غير الضرورية
 */
export function cleanPhoneNumber(phone: string): string {
  // إزالة المسافات والشرطات والأقواس
  return phone.replace(/[\s\-\(\)\.]/g, '');
}

/**
 * التحقق من وجود كود دولة
 */
export function hasCountryCode(phone: string): boolean {
  const cleaned = cleanPhoneNumber(phone);
  return cleaned.startsWith('+') || cleaned.startsWith('00');
}

/**
 * استخراج كود الدولة من الرقم
 */
export function extractCountryCode(phone: string): string | null {
  const cleaned = cleanPhoneNumber(phone);
  
  // إذا كان يبدأ بـ 00، استبدله بـ +
  let normalized = cleaned;
  if (normalized.startsWith('00')) {
    normalized = '+' + normalized.substring(2);
  }
  
  // البحث عن كود الدولة
  for (const code of COUNTRY_CODES) {
    if (normalized.startsWith(code)) {
      return code;
    }
  }
  
  return null;
}

/**
 * تطبيع رقم الهاتف
 * إذا لم يكن هناك كود دولة، يضيف الكود الافتراضي
 */
export function normalizePhoneNumber(
  phone: string,
  defaultCountryCode: string = '+20'
): string {
  const cleaned = cleanPhoneNumber(phone);
  
  // إذا كان فارغاً
  if (!cleaned) {
    throw new Error('رقم الهاتف فارغ');
  }
  
  // إذا كان يبدأ بـ 00، استبدله بـ +
  let normalized = cleaned;
  if (normalized.startsWith('00')) {
    normalized = '+' + normalized.substring(2);
  }
  
  // إذا كان يبدأ بـ +، تحقق من صحة كود الدولة
  if (normalized.startsWith('+')) {
    const countryCode = extractCountryCode(normalized);
    if (countryCode) {
      return normalized;
    }
    // إذا كان + موجود لكن كود الدولة غير صحيح
    throw new Error('كود الدولة غير صحيح');
  }
  
  // إذا كان يبدأ بـ 0، أزله وأضف كود الدولة
  if (normalized.startsWith('0')) {
    normalized = normalized.substring(1);
  }
  
  // أضف كود الدولة الافتراضي
  return defaultCountryCode + normalized;
}

/**
 * التحقق من صحة رقم الهاتف
 */
export function validatePhoneNumber(phone: string): boolean {
  const cleaned = cleanPhoneNumber(phone);
  
  // يجب أن يحتوي على أرقام فقط (مع + اختياري في البداية)
  const phoneRegex = /^\+?[0-9]{8,15}$/;
  
  return phoneRegex.test(cleaned);
}

/**
 * تنسيق رقم الهاتف للعرض
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = cleanPhoneNumber(phone);
  
  // إذا كان يبدأ بكود دولة
  const countryCode = extractCountryCode(cleaned);
  if (countryCode) {
    const number = cleaned.substring(countryCode.length);
    // تنسيق الرقم بمسافات كل 3 أرقام
    const formatted = number.replace(/(\d{3})(?=\d)/g, '$1 ');
    return `${countryCode} ${formatted}`;
  }
  
  // تنسيق بدون كود دولة
  return cleaned.replace(/(\d{3})(?=\d)/g, '$1 ');
}

/**
 * تطبيع مجموعة من الأرقام وإزالة المكررات
 */
export function normalizeAndDeduplicatePhones(
  phones: string[],
  defaultCountryCode: string = '+20'
): { normalized: string; original: string }[] {
  const seen = new Set<string>();
  const result: { normalized: string; original: string }[] = [];
  
  for (const phone of phones) {
    try {
      const normalized = normalizePhoneNumber(phone, defaultCountryCode);
      
      // تجاهل المكررات
      if (!seen.has(normalized)) {
        seen.add(normalized);
        result.push({ normalized, original: phone });
      }
    } catch (error) {
      // تجاهل الأرقام غير الصحيحة
      console.warn(`Invalid phone number: ${phone}`, error);
    }
  }
  
  return result;
}
