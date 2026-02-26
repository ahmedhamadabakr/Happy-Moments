# تثبيت المكتبات المطلوبة

## المكتبات الإضافية المطلوبة

قم بتشغيل الأمر التالي لتثبيت جميع المكتبات المطلوبة للنظام الجديد:

```bash
npm install sharp bullmq ioredis socket.io socket.io-client @types/bcryptjs
npm install -D @types/qrcode
```

## شرح المكتبات

### 1. sharp
```bash
npm install sharp
```
- معالجة الصور
- دمج QR Code مع صورة الدعوة
- تغيير حجم الصور
- تحسين الأداء

### 2. bullmq
```bash
npm install bullmq
```
- نظام الطوابير (Queue System)
- إرسال رسائل WhatsApp بالتدريج
- إعادة المحاولة عند الفشل
- معالجة المهام في الخلفية

### 3. ioredis
```bash
npm install ioredis
```
- عميل Redis لـ Node.js
- مطلوب لـ BullMQ
- التخزين المؤقت (Caching)
- الجلسات

### 4. socket.io & socket.io-client
```bash
npm install socket.io socket.io-client
```
- التحديثات الفورية (Real-time)
- تحديث صفحة العميل عند:
  - قبول/رفض دعوة
  - مسح QR Code
  - إرسال رسالة

### 5. @types/bcryptjs
```bash
npm install @types/bcryptjs
```
- تعريفات TypeScript لـ bcryptjs
- مطلوب للتطوير

### 6. @types/qrcode
```bash
npm install -D @types/qrcode
```
- تعريفات TypeScript لـ qrcode
- مطلوب للتطوير

## المكتبات الموجودة بالفعل

هذه المكتبات موجودة في package.json الحالي:

✅ qrcode - توليد QR Code
✅ xlsx - قراءة ملفات Excel
✅ bcryptjs - تشفير كلمات المرور
✅ mongoose - MongoDB ODM
✅ jose - JWT
✅ multer - رفع الملفات
✅ zod - التحقق من البيانات

## التحقق من التثبيت

بعد التثبيت، تحقق من وجود المكتبات:

```bash
npm list sharp
npm list bullmq
npm list ioredis
npm list socket.io
```

## مشاكل محتملة وحلولها

### مشكلة: فشل تثبيت sharp

#### Windows
```bash
npm install --platform=win32 --arch=x64 sharp
```

#### Linux
```bash
# تثبيت المتطلبات
sudo apt-get install -y build-essential libvips-dev

# ثم تثبيت sharp
npm install sharp
```

#### macOS
```bash
# تثبيت المتطلبات
brew install vips

# ثم تثبيت sharp
npm install sharp
```

### مشكلة: فشل تثبيت bcrypt

استخدم bcryptjs بدلاً منه (موجود بالفعل):
```bash
npm install bcryptjs
npm install -D @types/bcryptjs
```

### مشكلة: Redis غير متوفر

#### تثبيت Redis

**Windows:**
```bash
# استخدم WSL أو Docker
docker run -d -p 6379:6379 --name redis redis:latest
```

**Linux:**
```bash
sudo apt-get install redis-server
sudo systemctl start redis
```

**macOS:**
```bash
brew install redis
brew services start redis
```

#### اختبار Redis
```bash
redis-cli ping
# يجب أن يرجع: PONG
```

## package.json المحدث

بعد التثبيت، سيكون package.json كالتالي:

```json
{
  "dependencies": {
    // ... المكتبات الموجودة
    "sharp": "^0.33.0",
    "bullmq": "^4.15.0",
    "ioredis": "^5.3.2",
    "socket.io": "^4.6.1",
    "socket.io-client": "^4.6.1",
    "@types/bcryptjs": "^2.4.6"
  },
  "devDependencies": {
    // ... المكتبات الموجودة
    "@types/qrcode": "^1.5.5"
  }
}
```

## التحقق من عمل كل شيء

### 1. اختبار Sharp
```javascript
// test-sharp.js
const sharp = require('sharp');

sharp('input.jpg')
  .resize(300, 300)
  .toFile('output.jpg')
  .then(() => console.log('Sharp works!'))
  .catch(err => console.error('Sharp error:', err));
```

### 2. اختبار QRCode
```javascript
// test-qr.js
const QRCode = require('qrcode');

QRCode.toFile('test-qr.png', 'Hello World')
  .then(() => console.log('QRCode works!'))
  .catch(err => console.error('QRCode error:', err));
```

### 3. اختبار Redis
```javascript
// test-redis.js
const Redis = require('ioredis');
const redis = new Redis();

redis.set('test', 'hello')
  .then(() => redis.get('test'))
  .then(result => console.log('Redis works:', result))
  .catch(err => console.error('Redis error:', err))
  .finally(() => redis.quit());
```

### 4. اختبار BullMQ
```javascript
// test-queue.js
const { Queue, Worker } = require('bullmq');

const queue = new Queue('test-queue');

const worker = new Worker('test-queue', async job => {
  console.log('Processing job:', job.data);
});

queue.add('test-job', { message: 'Hello Queue' })
  .then(() => console.log('BullMQ works!'))
  .catch(err => console.error('BullMQ error:', err));
```

## الأوامر الكاملة للتثبيت

```bash
# 1. تثبيت المكتبات الأساسية
npm install sharp bullmq ioredis socket.io socket.io-client @types/bcryptjs

# 2. تثبيت تعريفات TypeScript
npm install -D @types/qrcode

# 3. التحقق من التثبيت
npm list sharp bullmq ioredis socket.io

# 4. تشغيل التطبيق
npm run dev
```

## ملاحظات مهمة

1. **sharp**: قد يستغرق وقتاً في التثبيت لأنه يحتوي على مكونات native
2. **Redis**: يجب أن يكون قيد التشغيل قبل استخدام BullMQ
3. **Socket.io**: سيتم إعداده في الخطوات القادمة
4. **BullMQ**: يحتاج Redis للعمل

## الخطوة التالية

بعد تثبيت المكتبات:
1. راجع ملف `SETUP_GUIDE.md` لإعداد البيئة
2. راجع ملف `IMPLEMENTATION_PLAN.md` لخطة التنفيذ
3. ابدأ بتشغيل التطبيق: `npm run dev`

---

إذا واجهت أي مشاكل في التثبيت، راجع قسم "مشاكل محتملة وحلولها" أعلاه.
