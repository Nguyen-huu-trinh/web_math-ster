"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";

interface TopStudent {
  id?: string;
  student_id?: string;
  student_code?: string;
  full_name?: string;
  name?: string;
  avatarUrl?: string | null;
  avatar_url?: string | null;
  points?: number;
  score?: number;
  value?: number;
  count?: number;
  quote?: string;
  hp?: number;
}

interface TopStudentsCardProps {
  entries: TopStudent[];
  currentStudentScore?: number;
  currentStudentId?: string;
}

function getName(student: TopStudent) {
  return student.full_name ?? student.name ?? "Học sinh";
}

function getAvatarUrl(url?: string | null) {
  if (!url) return undefined;
  const value = url.trim();
  if (!value) return undefined;

  const fileMatch = value.match(/drive\.google\.com\/file\/d\/([^/?]+)/);
  if (fileMatch?.[1]) {
    return `https://drive.google.com/thumbnail?id=${fileMatch[1]}&sz=w400`;
  }

  const idMatch = value.match(/drive\.google\.com\/(?:open|uc)\?[^#]*id=([^&]+)/);
  if (idMatch?.[1]) {
    return `https://drive.google.com/thumbnail?id=${idMatch[1]}&sz=w400`;
  }

  return value;
}

function getStudentAvatar(student: TopStudent) {
  return getAvatarUrl(student.avatarUrl ?? student.avatar_url);
}

function getScore(student: TopStudent): number {
  return Number(student.count ?? student.score ?? student.value ?? 0);
}

function getStudentCode(student: TopStudent, fallbackIndex: number) {
  return student.student_code ?? student.student_id ?? `MS-${String(fallbackIndex).padStart(4, "0")}`;
}

function getStudentHp(student: TopStudent) {
  if (student.points !== undefined && student.points !== null) {
    return Number(student.points);
  }
  if (student.hp !== undefined && student.hp !== null) {
    return Number(student.hp);
  }
  if (student.value !== undefined && student.value !== null) {
    return Number(student.value);
  }
  return 0;
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((item) => item[0])
    .join("")
    .toUpperCase();
}

export function TopStudentsCard({
  entries,
  currentStudentScore = 0,
  currentStudentId,
}: TopStudentsCardProps) {
  const router = useRouter();
  const { profile } = useAuth();

  // Kiểm tra vai trò xem người dùng hiện tại có phải Giáo viên không
  const isTeacher = profile?.role?.toUpperCase() === "TEACHER";

  const students = entries.slice(0, 3);

  if (students.length === 0) {
    return null;
  }

  const first = students[0];
  const second = students[1];
  const third = students[2];

  // Hàm chuyển hướng đến trang cá nhân của học sinh nếu là Giáo viên
  const handleStudentClick = (student: TopStudent) => {
    if (!isTeacher) return;
    const targetId = student.student_id ?? student.id;
    if (!targetId) return;

    router.push(`/students/${targetId}`);
  };

  // Kiểm tra học sinh hiện tại có thuộc Top 3 (dành cho chế độ xem của học sinh)
  const isCurrentUserInTop = currentStudentId
    ? students.some(
        (s) =>
          (s.student_id && s.student_id === currentStudentId) ||
          (s.id && s.id === currentStudentId) ||
          (s.student_code && s.student_code === currentStudentId)
      )
    : false;

  const thirdScore = third ? getScore(third) : 0;
  const diffScore = Math.max(0, Number((thirdScore - currentStudentScore).toFixed(2)));

  return (
    <div
      className="relative overflow-hidden rounded-3xl border border-slate-800/80 bg-[#0F1420] p-6 sm:p-8 text-white shadow-2xl"
      style={{
        backgroundImage:
          "radial-gradient(ellipse at 48% 0%, rgba(245, 158, 11, 0.14), transparent 58%), radial-gradient(ellipse at 100% 100%, rgba(124, 58, 237, 0.1), transparent 52%)",
      }}
    >
      {/* HEADER */}
      <div className="mb-6 space-y-2">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-400">
          <span>✨</span>
          <span>MATH-STER HALL OF FAME</span>
        </div>

        <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
          TOP 3 CHIẾN BINH XUẤT SẮC
        </h3>

        <p className="text-xs sm:text-sm font-medium text-slate-400">
          Vinh danh những con trâu cày giỏi nhất lớp
        </p>
      </div>

      {/* GRID 2 CỘT */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 items-stretch">
        
        {/* ========================================================
            CỘT TRÁI: TOP 1 - THỦ KHOA (lg:col-span-7)
        ========================================================= */}
        {first && (
          <div
            className="flex flex-col justify-between rounded-2xl border border-amber-500/30 bg-gradient-to-b from-[#1E2230]/90 to-[#141824]/90 p-5 sm:p-6 shadow-lg lg:col-span-7"
            style={{
              backgroundImage:
                "radial-gradient(ellipse at 0% 50%, rgba(245, 158, 11, 0.04), transparent 55%), linear-gradient(to bottom, rgba(30, 34, 48, 0.9), rgba(20, 24, 36, 0.9))",
            }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-[#EAB308] px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-950">
                  <span>👑</span>
                  <span>THỦ KHOA TOÁN MATH-STER</span>
                </div>

                {/* Tên Top 1: Nếu là giáo viên thì cho phép nhấp chuột */}
                <h4
                  onClick={() => handleStudentClick(first)}
                  className={`text-2xl sm:text-3xl font-extrabold text-[#F5B82E] tracking-tight transition-opacity ${
                    isTeacher ? "cursor-pointer hover:underline hover:opacity-85" : ""
                  }`}
                  title={isTeacher ? "Xem trang cá nhân học sinh" : undefined}
                >
                  {getName(first)}
                </h4>
              </div>

              {/* Avatar Top 1: Nếu là giáo viên thì cho phép nhấp chuột */}
              <div
                onClick={() => handleStudentClick(first)}
                className={`relative size-20 sm:size-24 shrink-0 overflow-hidden rounded-2xl border-2 border-[#F5B82E] bg-slate-800 p-0.5 shadow-md transition-transform ${
                  isTeacher ? "cursor-pointer hover:scale-105" : ""
                }`}
                title={isTeacher ? "Xem trang cá nhân học sinh" : undefined}
              >
                {getStudentAvatar(first) ? (
                  <img
                    src={getStudentAvatar(first)}
                    alt={getName(first)}
                    className="h-full w-full rounded-xl object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-xl bg-slate-900 text-xl font-black text-[#F5B82E]">
                    {getInitials(getName(first))}
                  </div>
                )}
              </div>
            </div>

            {/* 3 Box chỉ số thống kê */}
            <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-3">
              <div className="flex flex-col items-center justify-center rounded-xl bg-slate-900/80 border border-slate-800/80 py-2.5 px-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Điểm số
                </span>
                <span className="mt-0.5 text-base sm:text-lg font-black text-[#F5B82E]">
                  {getScore(first).toFixed(2)}
                </span>
              </div>

              <div className="flex flex-col items-center justify-center rounded-xl bg-slate-900/80 border border-slate-800/80 py-2.5 px-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Độ trâu
                </span>
                <span className="mt-0.5 text-base sm:text-lg font-black text-white">
                  {getStudentHp(first)} HP
                </span>
              </div>

              <div className="flex flex-col items-center justify-center rounded-xl bg-slate-900/80 border border-slate-800/80 py-2.5 px-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Xếp hạng
                </span>
                <span className="mt-0.5 text-base sm:text-lg font-black text-emerald-400">
                  #1 Khối
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            CỘT PHẢI: TOP 2 & TOP 3 (lg:col-span-5)
        ========================================================= */}
        <div className="flex flex-col justify-between gap-3 lg:col-span-5">
          
          {/* TOP 2 */}
          {second && (
            <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-[#161B28]/90 p-4 shadow-sm hover:border-slate-700 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                {/* Avatar Top 2 */}
                <div
                  onClick={() => handleStudentClick(second)}
                  className={`size-12 shrink-0 overflow-hidden rounded-xl border border-slate-700 bg-slate-800 transition-transform ${
                    isTeacher ? "cursor-pointer hover:scale-105" : ""
                  }`}
                  title={isTeacher ? "Xem trang cá nhân học sinh" : undefined}
                >
                  {getStudentAvatar(second) ? (
                    <img
                      src={getStudentAvatar(second)}
                      alt={getName(second)}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center font-bold text-slate-300">
                      {getInitials(getName(second))}
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                    <span>{getStudentCode(second, 2)}</span>
                    <span>•</span>
                    <span className="text-slate-300">Á Quân</span>
                  </div>
                  {/* Tên Top 2 */}
                  <h5
                    onClick={() => handleStudentClick(second)}
                    className={`truncate text-sm sm:text-base font-bold text-white transition-opacity ${
                      isTeacher ? "cursor-pointer hover:underline hover:opacity-85" : ""
                    }`}
                    title={isTeacher ? "Xem trang cá nhân học sinh" : undefined}
                  >
                    {getName(second)}
                  </h5>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Độ trâu: {getStudentHp(second)} Máu
                  </p>
                </div>
              </div>

              <div className="shrink-0 rounded-xl bg-slate-900/90 border border-slate-800 px-3 py-1.5 text-right">
                <span className="font-mono text-sm sm:text-base font-black text-slate-100">
                  {getScore(second).toFixed(2)}đ
                </span>
              </div>
            </div>
          )}

          {/* TOP 3 */}
          {third && (
            <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-[#161B28]/90 p-4 shadow-sm hover:border-slate-700 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                {/* Avatar Top 3 */}
                <div
                  onClick={() => handleStudentClick(third)}
                  className={`size-12 shrink-0 overflow-hidden rounded-xl border border-slate-700 bg-slate-800 transition-transform ${
                    isTeacher ? "cursor-pointer hover:scale-105" : ""
                  }`}
                  title={isTeacher ? "Xem trang cá nhân học sinh" : undefined}
                >
                  {getStudentAvatar(third) ? (
                    <img
                      src={getStudentAvatar(third)}
                      alt={getName(third)}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center font-bold text-slate-300">
                      {getInitials(getName(third))}
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                    <span>{getStudentCode(third, 3)}</span>
                    <span>•</span>
                    <span className="text-slate-300">Quý Quân</span>
                  </div>
                  {/* Tên Top 3 */}
                  <h5
                    onClick={() => handleStudentClick(third)}
                    className={`truncate text-sm sm:text-base font-bold text-white transition-opacity ${
                      isTeacher ? "cursor-pointer hover:underline hover:opacity-85" : ""
                    }`}
                    title={isTeacher ? "Xem trang cá nhân học sinh" : undefined}
                  >
                    {getName(third)}
                  </h5>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Độ trâu: {getStudentHp(third)} Máu
                  </p>
                </div>
              </div>

              <div className="shrink-0 rounded-xl bg-slate-900/90 border border-slate-800 px-3 py-1.5 text-right">
                <span className="font-mono text-sm sm:text-base font-black text-slate-100">
                  {getScore(third).toFixed(2)}đ
                </span>
              </div>
            </div>
          )}

          {/* THANH ĐỘNG LỰC DƯỚI CÙNG (Chỉ hiển thị cho học sinh, hoặc nhắc nhở chung khi là giáo viên) */}
          <div className="flex items-center justify-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-2.5 text-center text-xs font-semibold text-amber-400">
            {isTeacher ? (
              <>
                <span>👨‍🏫</span>
                <span>Chế độ giáo viên: Bấm vào tên hoặc avatar để xem chi tiết hồ sơ học sinh.</span>
              </>
            ) : isCurrentUserInTop ? (
              <>
                <span>🔥</span>
                <span>Tuyệt vời! Bạn đang nằm trong Top 3 xuất sắc nhất tuần này. Giữ vững phong độ nhé!</span>
              </>
            ) : diffScore > 0 ? (
              <>
                <span>💪</span>
                <span>Chỉ cách Top 3 đúng <strong className="font-black text-amber-300">{diffScore}</strong> điểm, cố lên nhé!</span>
              </>
            ) : (
              <>
                <span>🚀</span>
                <span>Bạn đang bám sát nút Top 3 rồi, hãy bứt phá ở bài thi tiếp theo nhé!</span>
              </>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
