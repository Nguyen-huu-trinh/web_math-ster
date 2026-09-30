const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");

function load(file, dependencies = {}) {
    const scope = {
        exports: {}, Error, SyntaxError,
        console: { error() {} },
        require: (name) => dependencies[name] ?? require(name),
    };
    vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, "utf8"), {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    }).outputText, scope);
    return scope.exports;
}

const plain = (value) => JSON.parse(JSON.stringify(value));
const schema = load("validators/teacher-student.schema.ts");
const context = { params: Promise.resolve({ studentId: "student-1" }) };

function route({ forbidden = false, failure } = {}) {
    let saved;
    const { PATCH } = load("app/api/teachers/students/[studentId]/route.ts", {
        "@/lib/auth/roles": { UserRole: { TEACHER: "TEACHER" } },
        "@/lib/auth/require-role": {
            requireRole: async (roles) => {
                assert.deepEqual(plain(roles), ["TEACHER"]);
                if (forbidden) throw Object.assign(new Error("Forbidden"), { status: 403 });
            },
        },
        "@/validators/teacher-student.schema": schema,
        "@/services/teacher-student.service": {
            teacherStudentService: {
                update: async (id, values) => {
                    if (failure) throw failure;
                    saved = { id, values: plain(values) };
                    return { id };
                },
            },
        },
    });
    return { PATCH, get saved() { return saved; } };
}

test("teacher updates joined date and existing personal email field", async () => {
    const api = route();
    const response = await api.PATCH({ json: async () => ({
        joinedDate: "2026-09-30", personalEmail: " an@example.com ",
    }) }, context);
    assert.equal(response.status, 200);
    assert.deepEqual(api.saved, {
        id: "student-1",
        values: { joinedDate: "2026-09-30", personalEmail: "an@example.com" },
    });
});

test("blank personal email clears the stored value", async () => {
    const api = route();
    const response = await api.PATCH({ json: async () => ({ personalEmail: " " }) }, context);
    assert.equal(response.status, 200);
    assert.deepEqual(api.saved.values, { personalEmail: null });
});

test("invalid input and protected profile fields are rejected before saving", async () => {
    for (const body of [
        {}, null, [], { fullName: " " }, { fullName: 123 }, { phone: "0901234567" },
        { personalEmail: "invalid" }, { points: -1 }, { rewardMoney: "100" },
        { joinedDate: "2026-09-30", role: "TEACHER" }, { created_at: "2026-01-01" },
        { email: "new-login@example.com" },
        { joinedDate: "" }, { joinedDate: null }, { joinedDate: "30/09/2026" },
        { joinedDate: "2026-02-29" }, { joinedDate: "2026-04-31" },
        { joinedDate: "2026-13-01" }, { joinedDate: "2026-09-30T00:00:00Z" },
    ]) {
        const api = route();
        const response = await api.PATCH({ json: async () => body }, context);
        assert.equal(response.status, 400, JSON.stringify(body));
        assert.equal(api.saved, undefined);
        assert.ok((await response.json()).error);
    }
});

test("existing financial edits accept zero and nonnegative numbers", async () => {
    const api = route();
    const response = await api.PATCH({ json: async () => ({ points: 0, rewardMoney: 1000 }) }, context);
    assert.equal(response.status, 200);
    assert.deepEqual(api.saved.values, { points: 0, rewardMoney: 1000 });
});

test("joined date accepts a valid leap day", async () => {
    const api = route();
    const response = await api.PATCH({ json: async () => ({ joinedDate: "2024-02-29" }) }, context);
    assert.equal(response.status, 200);
    assert.deepEqual(api.saved.values, { joinedDate: "2024-02-29" });
});

test("nonteachers cannot update a student", async () => {
    const api = route({ forbidden: true });
    const response = await api.PATCH({ json: async () => ({ joinedDate: "2026-09-30" }) }, context);
    assert.equal(response.status, 403);
    assert.equal(api.saved, undefined);
});

test("malformed JSON and database errors return error responses", async () => {
    const api = route();
    const malformed = await api.PATCH({ json: async () => { throw new SyntaxError("Invalid JSON"); } }, context);
    assert.equal(malformed.status, 400);
    assert.equal(api.saved, undefined);

    const failingApi = route({ failure: { code: "42501", message: "Permission denied" } });
    const failed = await failingApi.PATCH({ json: async () => ({ joinedDate: "2026-09-30" }) }, context);
    assert.equal(failed.status, 500);
    assert.ok((await failed.json()).error);
    assert.equal(failingApi.saved, undefined);
});

function repository(results) {
    const calls = [];
    const { teacherStudentRepository } = load("repositories/teacher-student.repository.ts", {
        "@/lib/supabase/server": {
            createClient: async () => ({
                from(table) {
                    const call = { table, filters: [] };
                    calls.push(call);
                    const result = results[table];
                    const query = {
                        select(columns) { call.columns = columns; return query; },
                        update(values) { call.update = plain(values); return query; },
                        eq(...args) { call.filters.push(["eq", ...args]); return query; },
                        is(...args) { call.filters.push(["is", ...args]); return query; },
                        order() { return query; },
                        single: async () => result,
                        then: (resolve, reject) => Promise.resolve(result).then(resolve, reject),
                    };
                    return query;
                },
            }),
        },
    });
    return { repository: teacherStudentRepository, calls };
}

test("profile reads work without a phone column and preserve joined date, statistics and exams", async () => {
    const { repository: repo, calls } = repository({
        profiles: { data: {
            id: "student-1", full_name: "An", created_at: "2026-09-29T18:00:00Z",
            points: 5, reward_money: 1000,
        } },
        v_student_dashboard: { data: {
            average_periodic_score: 8, pending_exams: 2, total_lessons: 10,
            completed_lessons: 6, passed_exercises: 3, failed_exercises: 1,
        } },
        exams: { data: [{ id: "exam-1", title: "Exam", category: "PERIODIC", duration_minutes: 45 }] },
        exam_attempts: { data: [{ id: "attempt-1", exam_id: "exam-1", attempt_number: 1, score: 8, is_passed: true }] },
    });
    const detail = await repo.getById("student-1");
    assert.match(calls[0].columns, /\bcreated_at\b/);
    assert.doesNotMatch(calls[0].columns, /\bphone\b/);
    assert.equal(detail.profile.created_at, "2026-09-29T18:00:00Z");
    assert.deepEqual(plain(detail.statistics), {
        averageScore: 8, pendingExams: 2, incompleteLessons: 4, passedExercises: 3, failedExercises: 1,
    });
    assert.equal(detail.exams[0].attempts[0].id, "attempt-1");
    assert.equal(detail.exams[0].attempts[0].score, 8);
});

test("repository writes only supplied fields and targets an undeleted student", async () => {
    const { repository: repo, calls } = repository({ profiles: { data: { id: "student-1" } } });
    await repo.update("student-1", { joinedDate: "2026-09-30" });
    assert.deepEqual(calls[0].update, { created_at: "2026-09-30T00:00:00+07:00" });
    const displayedDate = new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Asia/Ho_Chi_Minh",
    }).format(new Date(calls[0].update.created_at));
    assert.equal(displayedDate, "30/09/2026");
    assert.deepEqual(calls[0].filters, [
        ["eq", "id", "student-1"], ["eq", "role", "STUDENT"], ["is", "deleted_at", null],
    ]);
});

test("successful mutations invalidate detail and both student lists and report feedback", async () => {
    const { QueryClient } = require("@tanstack/react-query");
    const client = new QueryClient();
    const keys = load("lib/react-query/query-keys.ts");
    const refreshed = [
        keys.queryKeys.teacherStudents.detail("student-1"),
        keys.queryKeys.teacherStudents.all(),
        keys.queryKeys.teacherStudents.byCourse("course-1"),
    ];
    for (const key of refreshed) client.setQueryData(key, {});
    client.setQueryData(["unrelated"], {});
    const messages = [];
    const { useUpdateTeacherStudent } = load("hooks/use-update-teacher-student.ts", {
        "@tanstack/react-query": { useQueryClient: () => client, useMutation: (options) => options },
        "@/lib/react-query/query-keys": keys,
        "@/services/teacher-student-client.service": { teacherStudentClientService: {} },
        sonner: { toast: { success: (text) => messages.push(text), error: (text) => messages.push(text) } },
    });
    const mutation = useUpdateTeacherStudent("student-1");
    await mutation.onSuccess();
    for (const key of refreshed) assert.equal(client.getQueryState(key).isInvalidated, true);
    assert.equal(client.getQueryState(["unrelated"]).isInvalidated, false);
    assert.equal(messages.length, 1);
    mutation.onError(new Error("Save failed"));
    assert.equal(messages[1], "Save failed");
    client.clear();
});
