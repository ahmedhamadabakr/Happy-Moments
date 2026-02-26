# 🛠️ الأوامر المفيدة

دليل شامل لجميع الأوامر المفيدة في المشروع.

## 📦 NPM Commands

### التطوير
```bash
# تشغيل التطبيق في وضع التطوير
npm run dev

# تشغيل على بورت مختلف
PORT=3001 npm run dev
```

### البناء والإنتاج
```bash
# بناء التطبيق للإنتاج
npm run build

# تشغيل النسخة المبنية
npm start

# بناء وتشغيل
npm run build && npm start
```

### الفحص والتنظيف
```bash
# فحص الأخطاء
npm run lint

# إصلاح الأخطاء تلقائياً
npm run lint -- --fix
```

### إدارة المستخدمين
```bash
# عرض قائمة المستخدمين
npm run list-users

# إنشاء مدير جديد
npm run create-admin
```

## 🗄️ MongoDB Commands

### الاتصال
```bash
# الاتصال بـ MongoDB
mongosh

# الاتصال بقاعدة بيانات محددة
mongosh event-management
```

### العمليات الأساسية
```bash
# عرض قواعد البيانات
show dbs

# استخدام قاعدة بيانات
use event-management

# عرض المجموعات
show collections

# عرض المستخدمين
db.users.find().pretty()

# عرض الفعاليات
db.events.find().pretty()

# عد المستندات
db.users.countDocuments()

# حذف قاعدة البيانات (احذر!)
db.dropDatabase()
```

### استعلامات مفيدة
```bash
# البحث عن مستخدم بالبريد
db.users.findOne({ email: "admin@test.com" })

# عرض جميع المديرين
db.users.find({ role: "manager" })

# عرض الفعاليات النشطة
db.events.find({ status: "active", deletedAt: null })

# عد الضيوف لفعالية
db.eventguests.countDocuments({ eventId: ObjectId("...") })

# عرض آخر 10 عمليات check-in
db.checkinlogs.find().sort({ scannedAt: -1 }).limit(10)
```

### النسخ الاحتياطي والاستعادة
```bash
# نسخ احتياطي
mongodump --db event-management --out ./backup

# استعادة
mongorestore --db event-management ./backup/event-management

# تصدير مجموعة إلى JSON
mongoexport --db event-management --collection users --out users.json

# استيراد من JSON
mongoimport --db event-management --collection users --file users.json
```

## 🔴 Redis Commands

### الاتصال
```bash
# الاتصال بـ Redis
redis-cli

# الاتصال بـ Redis مع كلمة مرور
redis-cli -a your-password
```

### العمليات الأساسية
```bash
# اختبار الاتصال
PING

# عرض جميع المفاتيح
KEYS *

# عرض قيمة مفتاح
GET key-name

# حذف مفتاح
DEL key-name

# حذف جميع البيانات (احذر!)
FLUSHALL

# عرض معلومات Redis
INFO

# عرض الذاكرة المستخدمة
INFO memory
```

### Queue Operations
```bash
# عرض طوابير BullMQ
KEYS bull:*

# عرض عدد المهام في طابور
LLEN bull:whatsapp-queue:wait

# عرض المهام الفاشلة
LRANGE bull:whatsapp-queue:failed 0 -1
```

## 🐳 Docker Commands

### MongoDB
```bash
# تشغيل MongoDB
docker run -d -p 27017:27017 --name mongodb mongo:latest

# إيقاف MongoDB
docker stop mongodb

# بدء MongoDB
docker start mongodb

# عرض Logs
docker logs mongodb

# حذف Container
docker rm mongodb
```

### Redis
```bash
# تشغيل Redis
docker run -d -p 6379:6379 --name redis redis:latest

# إيقاف Redis
docker stop redis

# بدء Redis
docker start redis

# عرض Logs
docker logs redis

# حذف Container
docker rm redis
```

### Docker Compose
```bash
# تشغيل جميع الخدمات
docker-compose up -d

# إيقاف جميع الخدمات
docker-compose down

# عرض الحالة
docker-compose ps

# عرض Logs
docker-compose logs -f
```

## 🧪 Testing Commands

### اختبار API
```bash
# اختبار تسجيل الدخول
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"Admin123456"}'

# اختبار إضافة موظف
curl -X POST http://localhost:3000/api/v1/employees \
  -H "Content-Type: application/json" \
  -H "Cookie: accessToken=YOUR_TOKEN" \
  -d '{"firstName":"John","lastName":"Doe","email":"john@test.com","password":"Password123","roleKey":"EVENT_CREATOR"}'

# اختبار قائمة الموظفين
curl -X GET http://localhost:3000/api/v1/employees \
  -H "Cookie: accessToken=YOUR_TOKEN"
```

### اختبار الأدوات
```bash
# اختبار تطبيع الأرقام
node -e "const {normalizePhoneNumber} = require('./lib/utils/phoneNormalizer'); console.log(normalizePhoneNumber('01234567890'));"

# اختبار QR Code
node -e "const {generateQRCode} = require('./lib/utils/qrGenerator'); generateQRCode('test').then(b => require('fs').writeFileSync('test.png', b));"
```

## 🔍 Debugging Commands

### عرض المتغيرات البيئية
```bash
# Windows
echo %MONGODB_URI%

# Linux/Mac
echo $MONGODB_URI

# Node.js
node -e "console.log(process.env.MONGODB_URI)"
```

### فحص الاتصالات
```bash
# فحص MongoDB
mongosh --eval "db.adminCommand('ping')"

# فحص Redis
redis-cli ping

# فحص البورت
netstat -an | grep 3000
netstat -an | grep 27017
netstat -an | grep 6379
```

### عرض Logs
```bash
# عرض Logs في الوقت الفعلي
npm run dev | tee app.log

# عرض آخر 100 سطر
tail -n 100 app.log

# متابعة Logs
tail -f app.log
```

## 📊 Performance Commands

### تحليل الأداء
```bash
# تحليل حجم البناء
npm run build -- --analyze

# فحص الذاكرة
node --inspect npm run dev

# عرض استخدام الذاكرة
node -e "console.log(process.memoryUsage())"
```

### تحسين MongoDB
```bash
# إنشاء Indexes
mongosh event-management --eval "db.users.createIndex({email: 1}, {unique: true})"

# عرض Indexes
mongosh event-management --eval "db.users.getIndexes()"

# تحليل استعلام
mongosh event-management --eval "db.users.find({email: 'test@test.com'}).explain('executionStats')"
```

## 🧹 Cleanup Commands

### تنظيف Node Modules
```bash
# حذف node_modules
rm -rf node_modules

# حذف package-lock.json
rm package-lock.json

# إعادة التثبيت
npm install
```

### تنظيف Next.js
```bash
# حذف .next
rm -rf .next

# حذف out
rm -rf out

# إعادة البناء
npm run build
```

### تنظيف البيانات
```bash
# حذف الصور المؤقتة
rm -rf public/temp/*

# حذف Logs
rm -rf logs/*

# حذف الملفات المرفوعة
rm -rf public/uploads/*
```

## 🚀 Deployment Commands

### Vercel
```bash
# تسجيل الدخول
vercel login

# نشر
vercel

# نشر للإنتاج
vercel --prod
```

### PM2 (للخوادم)
```bash
# تثبيت PM2
npm install -g pm2

# تشغيل التطبيق
pm2 start npm --name "event-app" -- start

# إيقاف
pm2 stop event-app

# إعادة التشغيل
pm2 restart event-app

# عرض الحالة
pm2 status

# عرض Logs
pm2 logs event-app

# حفظ التكوين
pm2 save

# تشغيل تلقائي عند بدء النظام
pm2 startup
```

## 📝 Git Commands

### العمليات الأساسية
```bash
# حالة المشروع
git status

# إضافة الملفات
git add .

# Commit
git commit -m "Add feature"

# Push
git push origin main

# Pull
git pull origin main
```

### Branches
```bash
# إنشاء branch جديد
git checkout -b feature/new-feature

# التبديل بين branches
git checkout main

# دمج branch
git merge feature/new-feature

# حذف branch
git branch -d feature/new-feature
```

## 🔐 Security Commands

### توليد مفاتيح عشوائية
```bash
# توليد JWT Secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# توليد Token
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### فحص الثغرات
```bash
# فحص npm packages
npm audit

# إصلاح الثغرات
npm audit fix

# فحص شامل
npm audit --audit-level=moderate
```

## 📦 Package Management

### تحديث المكتبات
```bash
# عرض المكتبات القديمة
npm outdated

# تحديث مكتبة محددة
npm update package-name

# تحديث جميع المكتبات
npm update

# تحديث Next.js
npm install next@latest react@latest react-dom@latest
```

### إزالة المكتبات
```bash
# إزالة مكتبة
npm uninstall package-name

# إزالة مكتبة dev
npm uninstall -D package-name

# تنظيف المكتبات غير المستخدمة
npm prune
```

---

**نصيحة**: احفظ هذا الملف كمرجع سريع للأوامر المفيدة!

**ملاحظة**: بعض الأوامر قد تختلف حسب نظام التشغيل (Windows/Linux/Mac).
