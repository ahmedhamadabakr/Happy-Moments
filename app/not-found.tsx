import Link from "next/link"

export default function NotFound() {

    return (

        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">

            <div className="text-center">

                <h1 className="text-7xl font-bold text-[#F08784]">
                    404
                </h1>

                <h2 className="mt-4 text-2xl font-semibold text-slate-800">
                    الصفحة غير موجودة
                </h2>

                <p className="mt-2 text-slate-600">
                    عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
                </p>

                <Link
                    href="/"
                    className="inline-block mt-6 rounded-lg bg-[#F08784] px-6 py-3 text-white font-medium hover:opacity-90 transition"
                >

                    العودة إلى الصفحة الرئيسية
                </Link>

            </div>

        </div>

    )

}