// app/usuarios/reset-password/page.tsx
import ResetPassword from "@/components/UserForm/ResetPassword";
import React, { Suspense } from "react";

export default function ResetPasswordPage() {
    return (
        <div className="p-6">
            <Suspense fallback={
                <div className="min-h-screen flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            }>
                <ResetPassword />
            </Suspense>
        </div>
    )
}