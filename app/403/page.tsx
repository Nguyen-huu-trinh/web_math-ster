export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-5xl font-bold">
          403
        </h1>

        <p className="mt-4 text-muted-foreground">
          Bạn không có quyền truy cập trang này.
        </p>
      </div>
    </div>
  );
}