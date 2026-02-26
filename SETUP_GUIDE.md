# دليل الإعداد والتشغيل - نظام إدارة الفعاليات والدعوات

## 📋 المتطلبات الأساسية

### 1. البرامج المطلوبة
- Node.js 18+ و npm
- MongoDB 6+
- Redis 7+ (للQueue System)
- Git

### 2. حساب WhatsApp Business API
- التسجيل في Meta for Developers
- إنشاء تطبيق WhatsApp Business
- الحصول على:
  - Phone Number ID
  - Access Token
  - Verify Token

## 🚀 خطوات التثبيت

### الخطوة 1: استنساخ المشروع
```bash
git clone <repository-url>
cd event-management-system
```

### الخطوة 2: تثبيت Dependencies
```bash
npm install

# تثبيت المكتبات الإضافية المطلوبة
npm install qrcode sharp xlsx bullmq ioredis socket.io socket.io-client
npm install -D @types/qrcode
```

### الخطوة 3: إعداد قاعدة البيانات

#### MongoDB
```bash
# تشغيل MongoDB
mongod --dbpath /path/to/data

# أو باستخدام Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

#### Redis
```bash
# تشغيل Redis
redis-server

# أو باستخدام Docker
docker run -d -p 6379:6379 --name redis redis:latest
```

### الخطوة 4: إعداد المتغيرات البيئية

إنشاء ملف `.env.local`:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/event-management

# JWT Secret (استخدم مفتاح قوي وعشوائي)
JWT_SECRET=your-super-secret-jwt-key-change-this-to-random-string

# WhatsApp Business API
WHATSAPP_API_URL=https://graph.facebook.com/v18.0
WHATSAPP_API_TOKEN=your-whatsapp-business-api-token
WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
WHATSAPP_VERIFY_TOKEN=your-custom-verify-token

# Application URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Redis (للQueue System)
REDIS_URL=redis://localhost:6379

# File Upload Settings
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./public/uploads

# Node Environment
NODE_ENV=development
```

### الخطوة 5: إنشاء المجلدات المطلوبة
```bash
mkdir -p public/event-images
mkdir -p public/qr-codes
mkdir -p public/invitations
mkdir -p public/uploads
```

### الخطوة 6: تشغيل التطبيق

#### Development Mode
```bash
npm run dev
```

التطبيق سيعمل على: `http://localhost:3000`

#### Production Mode
```bash
npm run build
npm start
```

## 👤 إنشاء أول مدير (Manager)

### الطريقة 1: عبر API مباشرة

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "أحمد",
    "lastName": "محمد",
    "email": "admin@example.com",
    "password": "SecurePassword123",
    "companyName": "شركة الفعاليات",
    "companyEmail": "info@company.com"
  }'
```

### الطريقة 2: عبر MongoDB مباشرة

```javascript
// الاتصال بـ MongoDB
use event-management

// إنشاء شركة
db.companies.insertOne({
  name: "شركة الفعاليات",
  email: "info@company.com",
  createdAt: new Date(),
  updatedAt: new Date()
})

// الحصول على Company ID
const companyId = db.companies.findOne({email: "info@company.com"})._id

// إنشاء مدير (استخدم bcrypt لتشفير كلمة المرور)
db.users.insertOne({
  firstName: "أحمد",
  lastName: "محمد",
  email: "admin@example.com",
  password: "$2a$10$...", // كلمة مرور مشفرة
  role: "manager",
  permissions: [], // المدير لديه كل الصلاحيات تلقائياً
  company: companyId,
  isActive: true,
  refreshTokens: [],
  createdAt: new Date(),
  updatedAt: new Date()
})
```

## 🔧 إعداد WhatsApp Business API

### 1. إنشاء تطبيق في Meta for Developers
1. اذهب إلى https://developers.facebook.com/
2. أنشئ تطبيق جديد
3. اختر "Business" كنوع التطبيق
4. أضف منتج "WhatsApp"

### 2. الحصول على Phone Number ID
1. في لوحة تحكم التطبيق، اذهب إلى WhatsApp > Getting Started
2. انسخ Phone Number ID

### 3. الحصول على Access Token
1. في نفس الصفحة، انسخ Temporary Access Token
2. للإنتاج، أنشئ System User Token دائم

### 4. إعداد Webhook
1. في WhatsApp > Configuration
2. أضف Webhook URL: `https://yourdomain.com/api/webhooks/whatsapp`
3. أضف Verify Token (نفس القيمة في .env.local)
4. اشترك في الأحداث:
   - messages
   - message_status

### 5. اختبار الإرسال
```bash
curl -X POST http://localhost:3000/api/v1/test/whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+201234567890",
    "message": "رسالة تجريبية"
  }'
```

## 📱 استخدام النظام

### 1. تسجيل الدخول كمدير
```
URL: http://localhost:3000/login
Email: admin@example.com
Password: SecurePassword123
```

### 2. إضافة موظف
```
Dashboard > Users > Add Employee
- اختر الدور (Event Creator, Contact Manager, إلخ)
- أو حدد صلاحيات مخصصة
```

### 3. إضافة عميل
```
Dashboard > Clients > Add Client
- سيحصل على رابط خاص للعرض
```

### 4. إنشاء فعالية
```
Dashboard > Events > Create Event
1. اختر/أنشئ عميل
2. ارفع صورة الدعوة
3. حدد إحداثيات QR على الصورة
4. ارفع ملف Excel بجهات الاتصال
5. أكمل بيانات الفعالية
```

### 5. إرسال الدعوات
```
Dashboard > Events > [Event] > Send Invitations
- سيتم الإرسال عبر WhatsApp تلقائياً
```

### 6. مسح QR للحضور
```
Dashboard > Check-in > [Event]
- استخدم الكاميرا لمسح QR
- أو أدخل الرقم يدوياً
```

### 7. صفحة العميل
```
URL: http://localhost:3000/client/[token]
- يمكن للعميل مشاهدة:
  - إحصائيات الردود
  - قائمة الضيوف
  - الرسائل
  - الحضور
```

## 📊 بنية ملف Excel

يجب أن يحتوي ملف Excel على الأعمدة التالية:

| Name / الاسم | Phone / الهاتف | Email / البريد (اختياري) |
|--------------|----------------|-------------------------|
| أحمد محمد    | 01234567890    | ahmed@example.com       |
| سارة علي     | +201098765432  | sara@example.com        |
| محمد حسن     | 966501234567   |                         |

### ملاحظات:
- العمود الأول: الاسم (مطلوب)
- العمود الثاني: رقم الهاتف (مطلوب)
- العمود الثالث: البريد الإلكتروني (اختياري)
- يدعم الأرقام مع أو بدون كود الدولة
- يزيل المكررات تلقائياً
- يطبّع الأرقام تلقائياً

## 🔐 الأدوار والصلاحيات

### Manager (المدير)
- كل الصلاحيات
- إضافة/تعديل/حذف الموظفين
- إدارة كل شيء

### Employee Roles (أدوار الموظفين)

#### 1. Event Creator (منشئ الفعاليات)
- إنشاء فعاليات
- تعديل فعاليات
- عرض جهات الاتصال
- عرض الضيوف

#### 2. Contact Manager (مدير جهات الاتصال)
- إضافة/تعديل/حذف جهات الاتصال
- رفع ملفات Excel
- عرض الفعاليات

#### 3. Invitation Sender (مرسل الدعوات)
- إرسال دعوات WhatsApp
- عرض حالة الإرسال
- عرض الضيوف

#### 4. Viewer (مشاهد)
- عرض فقط
- لا يمكنه التعديل

#### 5. Check-in Staff (موظف التسجيل)
- مسح QR Code
- تسجيل الحضور
- عرض قائمة الحضور

## 🐛 استكشاف الأخطاء

### مشكلة: لا يمكن الاتصال بـ MongoDB
```bash
# تحقق من تشغيل MongoDB
mongosh

# أو
docker ps | grep mongodb
```

### مشكلة: فشل إرسال WhatsApp
1. تحقق من صحة Access Token
2. تحقق من Phone Number ID
3. تحقق من رصيد الحساب
4. راجع Logs في Meta for Developers

### مشكلة: QR Code لا يظهر
1. تحقق من وجود المجلدات:
   - `public/qr-codes`
   - `public/invitations`
2. تحقق من صلاحيات الكتابة
3. تحقق من تثبيت مكتبة `sharp`

### مشكلة: ملف Excel لا يُقرأ
1. تحقق من نوع الملف (.xlsx, .xls, .csv)
2. تحقق من وجود عناوين الأعمدة
3. تحقق من صحة البيانات

## 📚 الموارد الإضافية

- [Next.js Documentation](https://nextjs.org/docs)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [WhatsApp Business API](https://developers.facebook.com/docs/whatsapp)
- [Sharp Image Processing](https://sharp.pixelplumbing.com/)
- [QRCode.js](https://github.com/soldair/node-qrcode)

## 🆘 الدعم

للمساعدة أو الإبلاغ عن مشاكل:
1. راجع ملف `IMPLEMENTATION_PLAN.md`
2. تحقق من Logs في Console
3. راجع MongoDB Logs
4. راجع WhatsApp API Logs

## 📝 ملاحظات مهمة

1. **الأمان**: غيّر JWT_SECRET في الإنتاج
2. **WhatsApp**: استخدم Business Account للإنتاج
3. **الصور**: استخدم CDN للإنتاج
4. **Database**: فعّل Replica Set للإنتاج
5. **Backup**: اعمل نسخ احتياطية دورية

---

تم إنشاء هذا الدليل لمساعدتك في إعداد وتشغيل النظام بنجاح. حظاً موفقاً! 🚀
