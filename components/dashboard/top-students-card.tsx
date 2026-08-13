"use client";

import Image from "next/image";
import { Award } from "lucide-react";
import { getAvatarUrl } from "@/lib/avatar";

interface TopStudent {
  id?: string;
  full_name?: string;
  name?: string;
  avatar_url?: string | null;
  avatarUrl?: string | null;
  points?: number;
  score?: number;
  value?: number;
  count?: number
}

interface TopStudentsCardProps {
  entries: TopStudent[];
}

function getName(student: TopStudent) {
  return (
    student.full_name ??
    student.name ??
    "Học sinh"
  );
}

function getScore(student: TopStudent) {
  return student.count ?? 0;
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
}: TopStudentsCardProps) {
  const students = entries.slice(0, 3);

  if (students.length === 0) {
    return null;
  }

  const first = students[0];
  const second = students[1];
  const third = students[2];

  return (
    <div className="relative overflow-hidden rounded-xl border border-amber-900/40 bg-gradient-to-b from-[#0a0f1d] via-[#111827] to-[#070b14] px-4 py-6 shadow-xl">
      
      {/* Hiệu ứng ánh sáng nền tinh giản */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.05)_0%,transparent_70%)] pointer-events-none" />

      {/* HEADER */}
      <div className="relative z-10 mb-6 text-center">
        <div className="flex items-center justify-center gap-2">
          <Award className="size-5 text-amber-400" />
          <h3 className="text-lg font-black tracking-widest bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 bg-clip-text text-transparent uppercase drop-shadow-[0_2px_4px_rgba(251,191,36,0.2)] sm:text-xl">
            TOP 3 HỌC SINH XUẤT SẮC
          </h3>
          <Award className="size-5 text-amber-400" />
        </div>
        <p className="text-[10px] font-medium tracking-wide text-amber-100/40 uppercase">
          Những học sinh có điểm làm bài kiểm tra cao nhất
        </p>
      </div>

      {/* PODIUM COMPACT */}
      <div className="relative z-10 mx-auto flex max-w-3xl items-end justify-center gap-4 sm:gap-8">
        
        {/* =========================
            HẠNG 2 (Bên trái)
        ========================== */}
        {second && (
          <div className="flex w-[30%] max-w-[160px] flex-col items-center">
            <div className="relative flex items-center justify-center p-2">
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 text-slate-400 text-sm">👑</div>
              
              <div className="absolute inset-0 rounded-full border border-slate-400/30 p-0.5">
                <div className="h-full w-full rounded-full border-2 border-double border-slate-400/60" />
              </div>

              <div className="relative z-10 flex size-20 items-center justify-center overflow-hidden rounded-full border border-slate-300 bg-slate-900 shadow-[0_0_10px_rgba(148,163,184,0.1)] sm:size-24">
                {getAvatarUrl(second.avatar_url) ? (
                  <Image
                    src={getAvatarUrl(second.avatar_url)!}
                    alt={getName(second)}
                    width={96}
                    height={96}
                    className="h-full w-full object-cover"
                    unoptimized
                  />
                ) : (
                  <span className="text-xl font-bold text-slate-400">
                    {getInitials(getName(second))}
                  </span>
                )}
              </div>

              <div className="absolute -bottom-1 -left-1 z-20 flex size-8 flex-col items-center justify-center rounded-full border border-slate-300 bg-gradient-to-b from-slate-100 to-slate-400 text-slate-900 shadow-md">
                <span className="text-xs font-black leading-none">2</span>
                <span className="text-[6px] font-bold uppercase tracking-tighter">TOP</span>
              </div>
            </div>

            {/* Khung Tên - Cho phép rớt hàng */}
            <div className="mt-3 w-full text-center">
              <div className="rounded-full border border-slate-400/20 bg-gradient-to-r from-slate-200/90 via-white to-slate-200/90 px-3 py-1 sm:py-1.5 shadow">
                <p className="text-[11px] font-black tracking-normal text-slate-900 uppercase leading-tight">
                  {getName(second)}
                </p>
              </div>
              <p className="mt-1 text-base font-medium text-slate-400">
                {getScore(second)} điểm
              </p>
            </div>
          </div>
        )}

        {/* =========================
            HẠNG 1 (Ở giữa)
        ========================== */}
        {first && (
          <div className="flex w-[34%] max-w-[180px] flex-col items-center sm:-translate-y-2">
            <div className="relative flex items-center justify-center p-2.5">
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-amber-400 text-lg drop-shadow">👑</div>
              
              <div className="absolute inset-0 rounded-full border border-amber-400/30 p-0.5">
                <div className="h-full w-full rounded-full border-2 border-double border-amber-400" />
              </div>

              <div className="relative z-10 flex size-24 items-center justify-center overflow-hidden rounded-full border border-amber-400 bg-amber-950 shadow-[0_0_15px_rgba(251,191,36,0.2)] sm:size-28">
                {getAvatarUrl(first.avatar_url) ? (
                  <Image
                    src={getAvatarUrl(first.avatar_url)!}
                    alt={getName(first)}
                    width={112}
                    height={112}
                    className="h-full w-full object-cover"
                    unoptimized
                  />
                ) : (
                  <span className="text-2xl font-extrabold bg-gradient-to-br from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
                    {getInitials(getName(first))}
                  </span>
                )}
              </div>

              <div className="absolute -bottom-1 -left-1 z-20 flex size-9 flex-col items-center justify-center rounded-full border border-amber-300 bg-gradient-to-b from-yellow-200 via-amber-400 to-amber-600 text-amber-950 shadow-md">
                <span className="text-sm font-black leading-none">1</span>
                <span className="text-[6px] font-bold uppercase tracking-tighter">TOP</span>
              </div>
            </div>

            {/* Khung Tên - Cho phép rớt hàng */}
            <div className="mt-3 w-full text-center">
              <div className="rounded-full border border-amber-400 bg-gradient-to-r from-amber-100 via-amber-200 to-amber-100 px-3 py-1 sm:py-1.5 shadow-[0_2px_8px_rgba(251,191,36,0.15)]">
                <p className="text-xs font-black tracking-normal text-amber-950 uppercase leading-tight">
                  {getName(first)}
                </p>
              </div>
              <p className="mt-1 text-lg font-bold text-yellow-400 drop-shadow">
                {getScore(first)} điểm
              </p>
            </div>
          </div>
        )}

        {/* =========================
            HẠNG 3 (Bên phải)
        ========================== */}
        {third && (
          <div className="flex w-[30%] max-w-[160px] flex-col items-center">
            <div className="relative flex items-center justify-center p-2">
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 text-orange-400 text-sm">👑</div>
              
              <div className="absolute inset-0 rounded-full border border-orange-500/20 p-0.5">
                <div className="h-full w-full rounded-full border-2 border-double border-orange-400/50" />
              </div>

              <div className="relative z-10 flex size-20 items-center justify-center overflow-hidden rounded-full border border-orange-400/50 bg-orange-950/40 shadow-[0_0_10px_rgba(249,115,22,0.1)] sm:size-24">
                {getAvatarUrl(third.avatar_url) ? (
                  <Image
                    src={getAvatarUrl(third.avatar_url)!}
                    alt={getName(third)}
                    width={96}
                    height={96}
                    className="h-full w-full object-cover"
                    unoptimized
                  />
                ) : (
                  <span className="text-xl font-bold text-orange-400">
                    {getInitials(getName(third))}
                  </span>
                )}
              </div>

              <div className="absolute -bottom-1 -left-1 z-20 flex size-8 flex-col items-center justify-center rounded-full border border-orange-300 bg-gradient-to-b from-orange-200 to-orange-500 text-orange-950 shadow-md">
                <span className="text-xs font-black leading-none">3</span>
                <span className="text-[6px] font-bold uppercase tracking-tighter">TOP</span>
              </div>
            </div>

            {/* Khung Tên - Cho phép rớt hàng */}
            <div className="mt-3 w-full text-center">
              <div className="rounded-full border border-orange-400/20 bg-gradient-to-r from-orange-100/90 via-orange-50 to-orange-100/90 px-3 py-1 sm:py-1.5 shadow">
                <p className="text-[11px] font-black tracking-normal text-orange-950 uppercase leading-tight">
                  {getName(third)}
                </p>
              </div>
              <p className="mt-1 text-sm font-medium text-slate-400">
                {getScore(third)} điểm
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}