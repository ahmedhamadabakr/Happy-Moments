# ⚡ البدء السريع - 5 دقائق

دليل سريع لتشغيل النظام في أقل من 5 دقائق.

## 📋 المتطلبات

تأكد من تثبيت:
- ✅ Node.js 18+
- ✅ MongoDB
- ✅ Redis

## 🚀 خطوات التشغيل

### 1. تثبيت المكتبات (دقيقة واحدة)

```bash
npm install
npm install sharp bullmq ioredis socket.io socket.io-client @types/bcryptjs
npm install -D @types/qrcode
```

### 2. تشغيل الخدمات (30 ثانية)

```bash
# في terminal منفصل: تشغيل MongoDB
mongod

# في terminal آخر: تشغيل Redis
redis-server
```

أو باستخدام Docker:
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
docker run -d -p 6379:6379 --name redis redis:latest
```

### 3. إعداد البيئة (دقيقة واحدة)

إنشاء ملف `.env.local`:

```env
MONGODB_URI=mongodb://localhost:27017/event-management
JWT_SECRET=my-super-secret-key-change-this
NEXT_PUBLIC_BASE_URL=http://localhost:3000
REDIS_URL=redis://localhost:6379

# WhatsApp (اختياري للتجربة)
WHATSAPP_API_URL=https://graph.facebook.com/v18.0
WHATSAPP_API_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_VERIFY_TOKEN=
```

### 4. إنشاء المجلدات (10 ثواني)

```bash
mkdir -p public/event-images public/qr-codes public/invitations public/uploads
```

### 5. تشغيل التطبيق (10 ثواني)

```bash
npm run dev
```

افتح المتصفح: `http://localhost:3000`

## 👤 إنشاء أول مدير

### الطريقة السريعة (API)

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Admin",
    "lastName": "User",
    "email": "admin@test.com",
    "password": "Admin123456",
    "companyName": "Test Company",
    "companyEmail": "info@test.com"
  }'
```

### تسجيل الدخول

```
URL: http://localhost:3000/login
Email: admin@test.com
Password: Admin123456
```

## ✅ اختبار سريع

### 1. إضافة موظف

```bash
# احصل على Token من تسجيل الدخول أولاً
TOKEN="your-jwt-token"

curl -X POST http://localhost:3000/api/v1/employees \
  -H "Content-Type: application/json" \
  -H "Cookie: accessToken=$TOKEN" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@test.com",
    "password": "Password123",
    "roleKey": "EVENT_CREATOR"
  }'
```

### 2. إضافة عميل

```bash
curl -X POST http://localhost:3000/api/v1/clients \
  -H "Content-Type: application/json" \
  -H "Cookie: accessToken=$TOKEN" \
  -d '{
    "fullName": "Client Name",
    "email": "client@test.com",
    "phone": "+201234567890"
  }'
```

### 3. اختبار تطبيع الأرقام

إنشاء ملف `test-phone.js`:

```javascript
const { normalizePhoneNumber } = require('./lib/utils/phoneNormalizer');

console.log(normalizePhoneNumber('01234567890')); // +201234567890
console.log(normalizePhoneNumber('+201234567890')); // +201234567890
console.log(normalizePhoneNumber('00201234567890')); // +201234567890
```

تشغيل:
```bash
node test-phone.js
```

### 4. اختبار QR Code

إنشاء ملف `test-qr.js`:

```javascript
const { generateQRCode } = require('./lib/utils/qrGenerator');
const fs = require('fs');

generateQRCode('Test QR Code')
  .then(buffer => {
    fs.writeFileSync('test-qr.png', buffer);
    console.log('✅ QR Code created: test-qr.png');
  })
  .catch(err => console.error('❌ Error:', err));
```

تشغيل:
```bash
node test-qr.js
```

## 📊 إنشاء ملف Excel تجريبي

إنشاء ملف `contacts.xlsx` بالبيانات التالية:

| Name | Phone | Email |
|------|-------|-------|
| أحمد محمد | 01234567890 | ahmed@test.com |
| سارة علي | +201098765432 | sara@test.com |
| محمد حسن | 00201555555555 | mohamed@test.com |

## 🎯 الخطوات التالية

بعد التشغيل الناجح:

1. ✅ راجع [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) لخطة التنفيذ الكاملة
2. ✅ راجع [SETUP_GUIDE.md](./SETUP_GUIDE.md) للإعداد التفصيلي
3. ✅ راجع [NEXT_STEPS.md](./NEXT_STEPS.md) لمعرفة ما يجب إنجازه
4. ✅ ابدأ بتطوير الواجهات

## 🐛 مشاكل شائعة وحلولها

### المشكلة: Cannot connect to MongoDB
```bash
# تحقق من تشغيل MongoDB
mongosh
# أو
docker ps | grep mongodb
```

### المشكلة: Cannot connect to Redis
```bash
# تحقق من تشغيل Redis
redis-cli ping
# يجب أن يرجع: PONG
```

### المشكلة: Sharp installation failed
```bash
# Windows
npm install --platform=win32 --arch=x64 sharp

# Linux
sudo apt-get install -y build-essential libvips-dev
npm install sharp

# macOS
brew install vips
npm install sharp
```

### المشكلة: Port 3000 already in use
```bash
# تغيير البورت
PORT=3001 npm run dev
```

## 📱 اختبار على الهاتف

للاختبار على الهاتف في نفس الشبكة:

1. احصل على IP الخاص بك:
```bash
# Windows
ipconfig

# Linux/Mac
ifconfig
```

2. افتح على الهاتف:
```
http://YOUR_IP:3000
```

3. حدّث `.env.local`:
```env
NEXT_PUBLIC_BASE_URL=http://YOUR_IP:3000
```

## 🎉 تهانينا!

إذا وصلت هنا، فالنظام يعمل بنجاح! 🚀

الآن يمكنك:
- ✅ إضافة موظفين
- ✅ إضافة عملاء
- ✅ إنشاء فعاليات (بعد إكمال الواجهات)
- ✅ رفع Excel
- ✅ إرسال دعوات (بعد إعداد WhatsApp)

## 📚 موارد إضافية

- [README_AR.md](./README_AR.md) - الوثائق الكاملة
- [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) - خطة التنفيذ
- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - دليل الإعداد التفصيلي
- [INSTALL_DEPENDENCIES.md](./INSTALL_DEPENDENCIES.md) - تثبيت المكتبات

## 💡 نصائح

1. استخدم Postman لاختبار API endpoints
2. راجع Console للأخطاء
3. راجع MongoDB Compass لعرض البيانات
4. استخدم Redis Commander لعرض بيانات Redis

---

**ملاحظة**: هذا دليل سريع للبدء. للإعداد الكامل والاحترافي، راجع [SETUP_GUIDE.md](./SETUP_GUIDE.md)

حظاً موفقاً! 🎯
