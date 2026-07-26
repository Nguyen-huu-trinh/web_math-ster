interface ExamLayoutProps {
  children: React.ReactNode;
}

export default function ExamLayout({
  children,
}: ExamLayoutProps) {
  return (
    <main className="h-screen w-screen overflow-hidden bg-slate-100">
      {children}
    </main>
  );
}