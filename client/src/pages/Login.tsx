import { useState } from "react";
import { trpc } from "@/lib/trpc";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        // ✅ ใช้ window.location เพื่อรีเฟรชหน้าและโหลด Cookie ใหม่
        window.location.href = "/"; 
      }
    },
    onError: (error) => {
      alert(error.message || "Login ล้มเหลว");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ username, password });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white shadow-md rounded-lg w-96">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">เข้าสู่ระบบ</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อผู้ใช้งาน</label>
            <input
              type="text"
              placeholder="Username"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">รหัสผ่าน</label>
            <input
              type="password"
              placeholder="Password"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded font-semibold hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
            // ✅ เปลี่ยนจาก isLoading เป็น isPending ตามมาตรฐานใหม่
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? "กำลังตรวจสอบ..." : "เข้าสู่ระบบ"}
          </button>
        </form>
      </div>
    </div>
  );
}