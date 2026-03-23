# TICKET LEAD – Next.js

المشروع يعمل الآن بـ **Next.js 14** (App Router). الديزاين والواجهات كما هي بدون تغيير.

## تشغيل المشروع

```bash
npm install
npm run dev
```

ثم افتح المتصفح على: **http://localhost:3000**

## البناء للإنتاج

```bash
npm run build
npm run start
```



## متغيرات البيئة (اختياري)

لربط الباك اند، أنشئ ملف `.env.local` في جذر المشروع:

```
NEXT_PUBLIC_API_BASE_URL=https://عنوان-السيرفر
```

## المسارات (نفس السلوك السابق)

- `/` – تسجيل الدخول (طالب / دكتور / أدمن حسب `?role=`)
- `/forgettenpassword` – نسيت كلمة المرور
- `/student` – داشبورد الطالب
- `/student/new-ticket` – تذكرة جديدة
- `/student/ticket/[id]` – تفاصيل تذكرة
- `/doctor` – داشبورد الدكتور
- `/doctor/my-courses` – مواد الدكتور
- `/doctor/tickets` – تذاكر الدكتور
- `/doctor/ticket/[id]` – تفاصيل تذكرة (دكتور)
- `/administrator` – داشبورد الأدمن
- `/administrator/tickets` – التذاكر
- `/administrator/users` – المستخدمين
- `/administrator/users/[id]` – تفاصيل مستخدم (مع query للبيانات)
- `/administrator/new-user` – مستخدم جديد
- `/administrator/add-course` – إضافة مقرر
- `/administrator/analysis` – التحليلات
- `/administrator/site-settings` – إعدادات الموقع

## الأصول الثابتة

الصور (مثل شعار اللوجن والخلفية) من مجلد `public/`. انسخ محتويات `login/imgs/` من المشروع القديم إلى `public/login/imgs/` إذا لزم الأمر.
