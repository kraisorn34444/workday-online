import { useState, FormEvent } from "react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [, setLocation] = useLocation();

  // สร้างฟังก์ชันเรียกใช้ API Login (สมมติว่าใช้ tRPC ตามโครงสร้างเดิมคุณ)
  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: () => {
      setLocation("/"); // เข้าได้แล้วไปหน้าแรก
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
        <h1 className="text-2xl font-bold mb-6 text-center">เข้าสู่ระบบ</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            className="w-full p-2 border rounded"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-2 border rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
            disabled={loginMutation.isLoading}
          >
            {loginMutation.isLoading ? "กำลังตรวจสอบ..." : "เข้าสู่ระบบ"}
          </button>
        </form>
      </div>
    </div>
  );
}