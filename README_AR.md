# 🎉 نظام إدارة الفعاليات والدعوات الاحترافي

نظام متكامل لإدارة الفعاليات وإرسال الدعوات عبر WhatsApp مع QR Code ونظام صلاحيات متقدم.

## ✨ المميزات الرئيسية

### 🔐 نظام الأدوار والصلاحيات
- **مدير (Manager)**: صلاحيات كاملة على النظام
- **موظفون (Employees)**: صلاحيات محددة حسب الدور
  - منشئ الفعاليات
  - مدير جهات الاتصال
  - مرسل الدعوات
  - مشاهد
  - موظف التسجيل
- **عميل (Client)**: عرض فقط بدون تسجيل دخول

### 📱 إدارة الفعاليات
- إنشاء فعاليات مع ربطها بعميل محدد
- رفع صورة دعوة مخصصة
- رفع ملف Excel بجهات الاتصال
- توليد QR Code فريد لكل ضيف
- دمج QR تلقائياً مع صورة الدعوة

### 📊 جهات الاتصال
- رفع ملفات Excel (.xlsx, .xls, .csv)
- تطبيع أرقام الهواتف تلقائياً
- دعم الأرقام مع/بدون كود الدولة
- إزالة المكررات تلقائياً
- إدارة قاعدة بيانات جهات الاتصال

### 💬 إرسال الدعوات عبر WhatsApp
- إرسال صورة الدعوة مع QR
- رسالة نصية مع تفاصيل الفعالية
- أزرار قبول/رفض
- رابط موقع الفعالية (Google Maps)
- نظام Queue للإرسال التدريجي
- تتبع حالة الإرسال

### ✅ نظام RSVP
- صفحة دعوة عامة لكل ضيف
- قبول أو رفض الدعوة
- إرسال رسالة للمنظم
- تحديث فوري لصفحة العميل

### 📸 نظام Check-in بـ QR
- مسح QR Code بالكاميرا
- إدخال يدوي للرقم
- دعم المسح المتكرر
- تسجيل كل عملية مسح
- عداد حضور مباشر
- صوت تنبيه عند المسح

### 👁️ صفحة العميل
- رابط خاص بدون تسجيل دخول
- إحصائيات شاملة:
  - إجمالي المدعوين
  - المؤكدين
  - المعتذرين
  - المنتظرين
  - الحاضرين
- قائمة الضيوف وحالاتهم
- الرسائل الواردة من الضيوف
- تحديث فوري (Real-time)

### 📈 الإحصائيات والتحليلات
- إحصائيات لكل فعالية
- إحصائيات على مستوى الشركة
- معدل القبول
- معدل الحضور
- معدل عدم الحضور
- رسوم بيانية تفاعلية

### 📤 التصدير
- تصدير CSV
- تصدير PDF
- قائمة الضيوف
- قائمة الحضور
- الإحصائيات

## 🏗️ البنية التقنية

### Frontend
- **Next.js 16** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS**
- **Shadcn UI**
- **Zustand** (State Management)
- **Socket.io Client** (Real-time)

### Backend
- **Next.js API Routes**
- **MongoDB** + **Mongoose**
- **JWT** (Authentication)
- **Redis** (Queue & Cache)
- **BullMQ** (Job Queue)
- **Socket.io** (WebSocket)

### خدمات خارجية
- **WhatsApp Business API**
- **Google Maps** (للموقع)

### معالجة البيانات
- **Sharp** (معالجة الصور)
- **QRCode** (توليد QR)
- **XLSX** (قراءة Excel)
- **bcryptjs** (تشفير)

## 📁 هيكل المشروع

```
├── app/
│   ├── api/
│   │   ├── auth/              # تسجيل الدخول والخروج
│   │   ├── v1/
│   │   │   ├── employees/     # إدارة الموظفين
│   │   │   ├── clients/       # إدارة العملاء
│   │   │   ├── events/        # إدارة الفعاليات
│   │   │   ├── contacts/      # إدارة جهات الاتصال
│   │   │   ├── rsvp/          # نظام RSVP
│   │   │   ├── check-in/      # نظام Check-in
│   │   │   ├── client-view/   # صفحة العميل
│   │   │   └── analytics/     # الإحصائيات
│   │   └── webhooks/          # WhatsApp Webhooks
│   ├── dashboard/             # لوحة التحكم
│   ├── client/                # صفحة العميل العامة
│   └── rsvp/                  # صفحة RSVP العامة
├── components/                # مكونات React
├── lib/
│   ├── models/                # MongoDB Models
│   ├── types/                 # TypeScript Types
│   ├── utils/                 # أدوات مساعدة
│   ├── services/              # خدمات (WhatsApp, Queue)
│   ├── middleware/            # Middleware (Permissions)
│   └── auth/                  # JWT & Authentication
└── public/
    ├── event-images/          # صور الفعاليات
    ├── qr-codes/              # رموز QR
    └── invitations/           # الدعوات النهائية
```

## 🚀 البدء السريع

### 1. المتطلبات
- Node.js 18+
- MongoDB 6+
- Redis 7+
- حساب WhatsApp Business API

### 2. التثبيت
```bash
# استنساخ المشروع
git clone <repository-url>
cd event-management-system

# تثبيت المكتبات
npm install

# تثبيت المكتبات الإضافية
npm install sharp bullmq ioredis socket.io socket.io-client @types/bcryptjs
npm install -D @types/qrcode
```

### 3. الإعداد
```bash
# نسخ ملف البيئة
cp .env.example .env.local

# تعديل المتغيرات في .env.local
```

### 4. التشغيل
```bash
# Development
npm run dev

# Production
npm run build
npm start
```

## 📚 الوثائق

- [دليل الإعداد الكامل](./SETUP_GUIDE.md)
- [خطة التنفيذ](./IMPLEMENTATION_PLAN.md)
- [تثبيت المكتبات](./INSTALL_DEPENDENCIES.md)

## 🔧 المتغيرات البيئية

```env
# Database
MONGODB_URI=mongodb://localhost:27017/event-management

# JWT
JWT_SECRET=your-secret-key

# WhatsApp
WHATSAPP_API_URL=https://graph.facebook.com/v18.0
WHATSAPP_API_TOKEN=your-token
WHATSAPP_PHONE_NUMBER_ID=your-phone-id
WHATSAPP_VERIFY_TOKEN=your-verify-token

# App
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Redis
REDIS_URL=redis://localhost:6379
```

## 👥 الأدوار والصلاحيات

### المدير (Manager)
✅ كل الصلاحيات
✅ إضافة/تعديل/حذف الموظفين
✅ تحديد أدوار الموظفين
✅ إدارة كل شيء

### الموظف (Employee)
حسب الصلاحيات المحددة:
- إنشاء فعاليات
- إدارة جهات الاتصال
- إرسال دعوات
- مسح QR
- عرض الإحصائيات

### العميل (Client)
👁️ عرض فقط
📊 إحصائيات الفعالية
📝 قائمة الضيوف
💬 الرسائل الواردة

## 📱 سير العمل

### 1. المدير يضيف موظف
```
Dashboard > Users > Add Employee
→ يختار الدور أو يحدد صلاحيات مخصصة
```

### 2. إنشاء فعالية
```
Dashboard > Events > Create Event
→ اختيار/إنشاء عميل
→ رفع صورة الدعوة
→ تحديد موضع QR
→ رفع Excel بجهات الاتصال
→ إكمال البيانات
```

### 3. إرسال الدعوات
```
Dashboard > Events > [Event] > Send Invitations
→ يتم الإرسال عبر WhatsApp تلقائياً
→ كل ضيف يحصل على:
  - صورة دعوة مع QR فريد
  - رسالة بالتفاصيل
  - أزرار قبول/رفض
  - رابط الموقع
```

### 4. الضيف يرد على الدعوة
```
الضيف يفتح الرابط من WhatsApp
→ يشاهد الدعوة
→ يضغط قبول أو رفض
→ يمكنه إرسال رسالة
```

### 5. يوم الفعالية - Check-in
```
Dashboard > Check-in > [Event]
→ الموظف يمسح QR من هاتف الضيف
→ يتم تسجيل الحضور فوراً
→ تحديث صفحة العميل تلقائياً
```

### 6. العميل يتابع
```
العميل يفتح رابطه الخاص
→ يشاهد:
  - عدد المؤكدين
  - عدد الحاضرين
  - الرسائل
  - قائمة الضيوف
→ تحديث فوري بدون refresh
```

## 🎯 حالات الاستخدام

### 1. حفل زفاف
- إنشاء فعالية "حفل زفاف أحمد وسارة"
- رفع صورة دعوة مصممة
- رفع قائمة 200 مدعو
- إرسال الدعوات عبر WhatsApp
- تتبع الردود
- مسح QR عند الدخول

### 2. مؤتمر شركة
- إنشاء فعالية "مؤتمر التقنية 2024"
- رفع قائمة الحضور من Excel
- إرسال دعوات رسمية
- تتبع التسجيل
- مسح QR عند الدخول
- تصدير قائمة الحضور

### 3. حفل تخرج
- إنشاء فعالية "حفل تخرج دفعة 2024"
- رفع قائمة الخريجين
- إرسال دعوات للعائلات
- تتبع الحضور
- إحصائيات شاملة

## 🔒 الأمان

- ✅ JWT للمصادقة
- ✅ Bcrypt لتشفير كلمات المرور
- ✅ نظام صلاحيات متقدم
- ✅ Tokens فريدة وآمنة
- ✅ التحقق من نوع الملفات
- ✅ Sanitization للمدخلات
- ✅ Rate Limiting (قريباً)
- ✅ CSRF Protection (قريباً)

## 📊 الإحصائيات المتاحة

### على مستوى الفعالية
- إجمالي المدعوين
- عدد المؤكدين
- عدد المعتذرين
- عدد المنتظرين
- عدد الحاضرين
- معدل القبول
- معدل الحضور
- معدل عدم الحضور

### على مستوى الشركة
- إجمالي الفعاليات
- إجمالي المدعوين
- معدل الحضور العام
- أكثر الفعاليات نجاحاً

## 🚧 قيد التطوير

- [ ] Real-time Updates (WebSocket)
- [ ] Queue System للإرسال
- [ ] Notifications System
- [ ] Multi-language Support
- [ ] Mobile App
- [ ] Advanced Analytics
- [ ] Email Integration
- [ ] SMS Integration

## 🤝 المساهمة

نرحب بالمساهمات! يرجى:
1. Fork المشروع
2. إنشاء Branch جديد
3. Commit التغييرات
4. Push للـ Branch
5. فتح Pull Request

## 📝 الترخيص

هذا المشروع مرخص تحت [MIT License](LICENSE)

## 📞 الدعم

للمساعدة أو الاستفسارات:
- راجع [دليل الإعداد](./SETUP_GUIDE.md)
- راجع [خطة التنفيذ](./IMPLEMENTATION_PLAN.md)
- افتح Issue في GitHub

## 🙏 شكر خاص

- Next.js Team
- Shadcn UI
- MongoDB Team
- WhatsApp Business API
- المجتمع المفتوح المصدر

---

صُنع بـ ❤️ للمساعدة في إدارة الفعاليات بشكل احترافي

**نسخة**: 1.0.0  
**آخر تحديث**: 2024
