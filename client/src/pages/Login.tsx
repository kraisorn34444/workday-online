// Login Page — Manus OAuth Integration
// Design: Clean, centered login form with branding

import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Login() {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate("/");
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50 p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-border">
          {/* Logo/Branding */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-white">W</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Work Online</h1>
            <p className="text-muted-foreground">ระบบจัดการงานบริการลูกค้า</p>
          </div>

          {/* Description */}
          <div className="mb-8">
            <p className="text-sm text-muted-foreground text-center mb-4">
              เข้าสู่ระบบเพื่อจัดการรายการงาน ปฏิทิน สถิติ และภาพประกอบ
            </p>
          </div>

          {/* Login Button */}
          <Button
            onClick={() => (window.location.href = getLoginUrl())}
            className="w-full h-11 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold rounded-lg transition-all"
          >
            เข้าสู่ระบบด้วย Manus
          </Button>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              ระบบนี้มีการจำกัดสิทธิ์การเข้าถึง
              <br />
              เฉพาะผู้ที่ได้รับอนุญาตเท่านั้น
            </p>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-white/50 backdrop-blur rounded-lg p-4 border border-border/50">
          <p className="text-xs text-muted-foreground text-center">
            💡 หากคุณเป็นผู้ดูแลระบบ สามารถแก้ไข เพิ่ม และลบข้อมูลได้
          </p>
        </div>
      </div>
    </div>
  );
}
