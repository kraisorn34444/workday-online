import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button"; // ใช้ Component เดิมของคุณ

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // ระบบ Login ใหม่ที่เชื่อมกับ routers.ts
  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        // ✅ บังคับรีเฟรชหน้าเพื่อให้ context.ts อ่าน Cookie ใหม่
        window.location.href = "/"; 
      }
    },
    onError: (error) => {
      alert(error.message || "ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ username, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-border">
          {/* Logo/Branding */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-white">W</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Work Online</h1>
            <p className="text-muted-foreground">เข้าสู่ระบบจัดการงาน</p>
          </div>

          {/* Form กรอกข้อมูลจริง */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อผู้ใช้งาน</label>
              <input
                type="text"
                className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">รหัสผ่าน</label>
              <input
                type="password"
                className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full h-11 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold rounded-lg transition-all"
            >
              {loginMutation.isPending ? "กำลังตรวจสอบ..." : "เข้าสู่ระบบ"}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-border text-center">
            <p className="text-xs text-muted-foreground">
              เฉพาะผู้ที่ได้รับอนุญาตเท่านั้น
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}