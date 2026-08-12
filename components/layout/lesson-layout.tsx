"use client";

import { ReactNode } from "react";

interface LessonLayoutProps {
  children: ReactNode;
  sidebar: ReactNode;
  resources: ReactNode;
}

export function LessonLayout({
  children,
  sidebar,
  resources,
}: LessonLayoutProps) {
  return (
    <div className="min-h-[calc(100vh-4rem)] w-full">
      <div className="grid w-full grid-cols-[280px_minmax(0,1fr)_360px] gap-6">

        {/* LEFT - LESSON LIST */}
        <aside className="min-w-0">
          {sidebar}
        </aside>

        {/* CENTER - LESSON CONTENT */}
        <main className="min-w-0">
          {children}
        </main>

        {/* RIGHT - RESOURCES */}
        <aside className="min-w-0">
          {resources}
        </aside>

      </div>
    </div>
  );
}