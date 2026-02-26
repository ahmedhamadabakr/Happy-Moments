# خطة تنفيذ نظام إدارة الفعاليات والدعوات

## ✅ ما تم إنجازه

### 1. نظام الأدوار والصلاحيات
- ✅ `lib/types/roles.ts` - تعريف الأدوار والصلاحيات
- ✅ `lib/middleware/permissions.ts` - Middleware للتحقق من الصلاحيات
- ✅ تحديث `lib/models/User.ts` - إضافة نظام الصلاحيات
- ✅ تحديث `lib/auth/jwt.ts` - دعم الصلاحيات في JWT

### 2. قاعدة البيانات
- ✅ `lib/models/Client.ts` - نموذج العميل
- ✅ `lib/models/CheckInLog.ts` - سجل عمليات المسح
- ✅ تحديث `lib/models/Event.ts` - إضافة حقول QR والعميل
- ✅ تحديث `lib/models/EventGuest.ts` - إضافة حقول QR والمسح المتكرر

### 3. الأدوات المساعدة
- ✅ `lib/utils/phoneNormalizer.ts` - تطبيع أرقام الهواتف
- ✅ `lib/utils/excelParser.ts` - قراءة ملفات Excel
- ✅ `lib/utils/qrGenerator.ts` - توليد QR ودمجه مع الصور
- ✅ `lib/services/whatsapp.service.ts` - خدمة WhatsApp Business API

### 4. API Endpoints
- ✅ `app/api/v1/employees/route.ts` - إدارة الموظفين
- ✅ `app/api/v1/employees/[id]/route.ts` - عمليات الموظف الفردي

## 📋 ما يجب إنجازه

### المرحلة 1: API Endpoints المتبقية

#### A. إدارة العملاء (Clients)
```
POST   /api/v1/clients              - إنشاء عميل جديد
GET    /api/v1/clients              - قائمة العملاء
GET    /api/v1/clients/[id]         - بيانات عميل محدد
PATCH  /api/v1/clients/[id]         - تحديث بيانات عميل
DELETE /api/v1/clients/[id]         - حذف عميل
```

#### B. إنشاء الفعاليات مع رفع Excel
```
POST   /api/v1/events/create-with-contacts
       - إنشاء فعالية + رفع Excel + إنشاء/ربط عميل
       - معالجة الأرقام وتطبيعها
       - إنشاء EventGuests
       - توليد QR لكل ضيف
```

#### C. إرسال الدعوات
```
POST   /api/v1/events/[id]/send-invitations
       - إرسال الدعوات عبر WhatsApp
       - استخدام Queue للإرسال التدريجي
       - تسجيل حالة الإرسال
```

#### D. RSVP (الرد على الدعوة)
```
GET    /api/v1/rsvp/[token]         - عرض صفحة الدعوة
POST   /api/v1/rsvp/[token]/accept  - قبول الدعوة
POST   /api/v1/rsvp/[token]/decline - رفض الدعوة
POST   /api/v1/rsvp/[token]/message - إرسال رسالة
```

#### E. صفحة العميل (Client View)
```
GET    /api/v1/client-view/[token]  - بيانات الفعالية للعميل
       - إحصائيات الردود
       - قائمة الضيوف وحالاتهم
       - الرسائل الواردة
```

#### F. Check-in (المسح)
```
POST   /api/v1/check-in/scan        - مسح QR Code
GET    /api/v1/check-in/verify/[token] - التحقق من QR
GET    /api/v1/events/[id]/check-ins - قائمة الحضور
POST   /api/v1/check-in/manual      - تسجيل يدوي
```

#### G. الإحصائيات
```
GET    /api/v1/analytics/event/[id] - إحصائيات فعالية
GET    /api/v1/analytics/company    - إحصائيات الشركة
```

#### H. WhatsApp Webhook
```
GET    /api/webhooks/whatsapp       - Verification
POST   /api/webhooks/whatsapp       - استقبال التحديثات
```

### المرحلة 2: الواجهات (Frontend)

#### A. صفحات الموظفين
```
/dashboard/employees              - قائمة الموظفين (مدير فقط)
/dashboard/employees/create       - إضافة موظف (مدير فقط)
/dashboard/employees/[id]         - تعديل موظف (مدير فقط)
```

#### B. صفحات العملاء
```
/dashboard/clients                - قائمة العملاء
/dashboard/clients/create         - إضافة عميل
```

#### C. إنشاء فعالية محسّن
```
/dashboard/events/create
  - اختيار/إنشاء عميل
  - رفع صورة الدعوة
  - تحديد إحداثيات QR
  - رفع Excel
  - معاينة البيانات
```

#### D. صفحة الفعالية المحسّنة
```
/dashboard/events/[id]
  - إحصائيات شاملة
  - إرسال الدعوات
  - عرض الضيوف
  - تصدير البيانات
```

#### E. صفحة Check-in
```
/dashboard/check-in/[eventId]
  - ماسح QR بالكاميرا
  - إدخال يدوي
  - عداد الحضور المباشر
  - قائمة آخر 50 مسح
  - صوت تنبيه
```

#### F. صفحة العميل (عامة)
```
/client/[token]
  - عرض فقط (بدون تسجيل دخول)
  - إحصائيات الردود
  - قائمة الضيوف
  - الرسائل
  - تحديث تلقائي (WebSocket)
```

#### G. صفحة RSVP (عامة)
```
/rsvp/[token]
  - عرض الدعوة
  - أزرار قبول/رفض
  - رابط الموقع
  - إرسال رسالة
```

### المرحلة 3: Real-time Updates

#### WebSocket/SSE للتحديثات الفورية
```typescript
// lib/services/realtime.service.ts
- اتصال WebSocket
- بث تحديثات Check-in
- بث تحديثات RSVP
- تحديث صفحة العميل فوراً
```

### المرحلة 4: Queue System

#### نظام الطوابير للإرسال
```typescript
// lib/services/queue.service.ts
- Bull Queue أو BullMQ
- معالجة إرسال WhatsApp بالتدريج
- إعادة المحاولة عند الفشل
- تسجيل الحالة
```

### المرحلة 5: التحسينات

#### A. الأمان
- Rate limiting
- CSRF protection
- Input sanitization
- File upload validation

#### B. الأداء
- Redis caching
- Image optimization
- Database indexing
- Lazy loading

#### C. المراقبة
- Error tracking (Sentry)
- Performance monitoring
- Logging system
- Analytics

## 🔧 المتغيرات البيئية المطلوبة

```env
# Database
MONGODB_URI=mongodb://localhost:27017/event-management

# JWT
JWT_SECRET=your-super-secret-key-change-this

# WhatsApp Business API
WHATSAPP_API_URL=https://graph.facebook.com/v18.0
WHATSAPP_API_TOKEN=your-whatsapp-api-token
WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
WHATSAPP_VERIFY_TOKEN=your-verify-token

# Base URL
NEXT_PUBLIC_BASE_URL=https://yourdomain.com

# Redis (للQueue)
REDIS_URL=redis://localhost:6379

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./public/uploads
```

## 📦 Dependencies المطلوبة

```json
{
  "dependencies": {
    "qrcode": "^1.5.3",
    "sharp": "^0.33.0",
    "xlsx": "^0.18.5",
    "bullmq": "^4.15.0",
    "ioredis": "^5.3.2",
    "socket.io": "^4.6.1",
    "socket.io-client": "^4.6.1"
  },
  "devDependencies": {
    "@types/qrcode": "^1.5.5"
  }
}
```

## 🚀 خطوات التشغيل

### 1. تثبيت Dependencies
```bash
npm install qrcode sharp xlsx bullmq ioredis socket.io socket.io-client
npm install -D @types/qrcode
```

### 2. إعداد قاعدة البيانات
```bash
# تشغيل MongoDB
mongod

# تشغيل Redis
redis-server
```

### 3. إعداد المتغيرات البيئية
```bash
cp .env.example .env.local
# تعديل القيم في .env.local
```

### 4. تشغيل التطبيق
```bash
npm run dev
```

## 📝 ملاحظات مهمة

### 1. نظام الصلاحيات
- المدير (Manager) لديه كل الصلاحيات تلقائياً
- الموظفون يحصلون على صلاحيات محددة
- العميل ليس له حساب، فقط رابط عرض

### 2. QR Code
- يتم توليده تلقائياً لكل ضيف
- يُدمج مع صورة الدعوة في إحداثيات محددة
- يحتوي على Token فريد وآمن
- يسمح بالمسح المتكرر مع التسجيل

### 3. WhatsApp
- يجب التسجيل في WhatsApp Business API
- الرسائل تُرسل عبر Queue
- يتم تسجيل حالة كل رسالة
- Webhook لاستقبال التحديثات

### 4. Excel Upload
- يدعم .xlsx, .xls, .csv
- يتعرف على العناوين تلقائياً
- يطبّع أرقام الهواتف
- يزيل المكررات
- يتعامل مع الأرقام مع/بدون كود الدولة

### 5. Real-time Updates
- صفحة العميل تتحدث فوراً عند:
  - قبول/رفض دعوة
  - مسح QR Code
  - إرسال رسالة

## 🎯 الأولويات

### Priority 1 (أساسي)
1. ✅ نظام الصلاحيات
2. ✅ Models
3. ⏳ API: إنشاء فعالية + رفع Excel
4. ⏳ API: إرسال دعوات WhatsApp
5. ⏳ API: RSVP
6. ⏳ صفحة RSVP العامة

### Priority 2 (مهم)
7. ⏳ API: Check-in
8. ⏳ صفحة Check-in
9. ⏳ صفحة العميل
10. ⏳ Real-time updates

### Priority 3 (تحسينات)
11. ⏳ Queue system
12. ⏳ Analytics
13. ⏳ Export PDF/CSV
14. ⏳ Monitoring

## 🔄 الخطوات التالية

1. إنشاء API endpoints المتبقية
2. بناء الواجهات
3. تطبيق Real-time
4. إضافة Queue system
5. الاختبار الشامل
6. التوثيق
7. Deployment

---

**ملاحظة**: هذا مشروع احترافي كامل. يُنصح بالتنفيذ على مراحل واختبار كل مرحلة قبل الانتقال للتالية.
