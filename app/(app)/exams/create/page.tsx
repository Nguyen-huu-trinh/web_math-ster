import { CreateExamWizard } from "./create-exam-wizard";

export default function CreateExamPage() {
  return (
    <div className="space-y-6">

      <div>

        <h1 className="text-3xl font-bold">
          Tạo đề thi
        </h1>

        <p className="text-muted-foreground mt-1">
          Tạo đề thi mới theo cấu trúc THPT hoặc đề tự do.
        </p>

      </div>

      <CreateExamWizard />

    </div>
  );
}