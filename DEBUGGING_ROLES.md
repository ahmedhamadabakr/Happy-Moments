# تشخيص مشكلة الأدوار (Roles Debugging)

## المشكلة
المستخدم لديه role = "manager" في قاعدة البيانات لكن لا يستطيع الوصول لمعظم الصفحات.

## الفحوصات المطبقة

### 1. التحقق من قيم الـ Enum
في `lib/types/roles.ts`:
```typescript
export enum UserRole {
  MANAGER = 'manager',  // ✅ بأحرف صغيرة
  EMPLOYEE = 'employee', // ✅ بأحرف صغيرة
}
```

### 2. التحقق من الـ API Responses
- `app/api/auth/login/route.ts` - يرجع `user.role` كما هو من DB
- `app/api/auth/profile/route.ts` - يرجع `user.role` كما هو من DB

### 3. التحقق من الـ Middleware
في `middleware.ts`:
```typescript
if (!payload || payload.role !== UserRole.MANAGER) // ✅ يستخدم 'manager'
```

### 4. التحقق من صفحات الحماية
- `components/auth/ModernRegisterForm.tsx` - تم تصحيحها من 'MANAGER' إلى 'manager'
- `app/dashboard/users/page.tsx` - ✅ تستخدم 'manager'
- `app/dashboard/manager/page.tsx` - ✅ تستخدم 'manager'

### 5. التحقق من الـ Sidebar
في `components/dashboard/DashboardSidebar.tsx`:
```typescript
const navigationItems = [
  {
    label: 'لوحة المدير',
    href: '/dashboard/manager',
    icon: Shield,
    role: ['manager'], // ✅ بأحرف صغيرة
  },
  // ...
];

const visibleItems = navigationItems.filter((item) => 
  item.role.includes(user.role) // ✅ يقارن بشكل صحيح
);
```

## خطوات التشخيص

### 1. افتح صفحة التشخيص
انتقل إلى: `/dashboard/debug`

ستعرض الصفحة:
- بيانات المستخدم من Auth Store
- بيانات المستخدم من API
- فحص الـ role بشكل مباشر

### 2. افتح Console في المتصفح
ستجد logs تعرض:
- `Auth check response:` - استجابة API
- `Sidebar - User role:` - الـ role في Sidebar
- `Sidebar - Visible items:` - عدد العناصر المرئية
- `Profile API - User role from DB:` - الـ role من قاعدة البيانات

## الحلول المحتملة

### إذا كان الـ role في DB بأحرف كبيرة (MANAGER)
قم بتحديث قاعدة البيانات:
```javascript
db.users.updateMany(
  { role: "MANAGER" },
  { $set: { role: "manager" } }
)

db.users.updateMany(
  { role: "EMPLOYEE" },
  { $set: { role: "employee" } }
)
```

### إذا كان الـ role صحيح لكن لا يظهر في Sidebar
1. تحقق من Console logs
2. تحقق من أن Auth Store يحمل البيانات بشكل صحيح
3. امسح localStorage وأعد تسجيل الدخول:
```javascript
localStorage.clear()
```

### إذا كان الـ role صحيح لكن يتم رفض الوصول
1. تحقق من Middleware logs في terminal
2. تحقق من JWT token في cookies
3. جرب تسجيل الخروج وإعادة تسجيل الدخول

## التحديثات المطبقة

### 1. إضافة Debug Logs
- في `lib/store/authStore.ts`
- في `components/dashboard/DashboardSidebar.tsx`
- في `app/api/auth/profile/route.ts`

### 2. إنشاء صفحة تشخيص
- `app/dashboard/debug/page.tsx`

### 3. تصحيح المقارنات
- تم تصحيح `components/auth/ModernRegisterForm.tsx`

## الخطوات التالية

1. افتح التطبيق وسجل الدخول
2. انتقل إلى `/dashboard/debug`
3. افتح Console
4. شارك النتائج لمزيد من التشخيص

## ملاحظات مهمة

- جميع قيم الـ role يجب أن تكون بأحرف صغيرة: `'manager'` و `'employee'`
- الـ Enum `UserRole.MANAGER` يساوي `'manager'` (بأحرف صغيرة)
- المقارنات يجب أن تكون دائماً: `user.role === 'manager'`
