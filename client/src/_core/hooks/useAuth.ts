import { trpc } from "@/lib/trpc";

export function useAuth() {
  // ดึงข้อมูล User ปัจจุบันจาก AppRouter.auth.me ที่เราเขียนไว้ใน Backend
  const { data: user, isLoading } = trpc.auth.me.useQuery(undefined, {
    retry: false, // ถ้า Error ไม่ต้องพยายามใหม่ เพราะแปลว่าไม่ได้ Login
  });

  return {
    user,
    isAuthenticated: !!user, // ถ้ามีข้อมูล user แปลว่า Login แล้ว
    loading: isLoading,
  };
}