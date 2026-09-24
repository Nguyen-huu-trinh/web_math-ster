# Broadcast notifications

Apply `supabase/migrations/202609240001_broadcast_notifications.sql` in the target Supabase SQL Editor (or your normal migration deployment). The migration creates the two tables when the previous notification tables were deleted. It also tolerates the original `message` column if that old schema still exists. It does not recreate or write per-user notification deliveries.

## Publication

Use the 2026-09-25 publication controls below. Both migrations must be applied in order.

## Reading and cost

Apply `202609250003_notification_concise_content.sql` after the lesson links migration and before deploying the updated material API. Broadcast titles now store the exam/lesson title. Attendance content is NULL; periodic content is the optional exam description. Material content uses a short added/updated action and the resource type/name. The teacher API accepts a boolean `isUpdate` (defaults to false) and passes it to the role-checked RPC. Existing recognized legacy notifications are normalized where their linked lesson/exam still exists, without changing IDs or read tracking. Old material records do not store their original create/update action, so migration preserves the action recorded in the text. This migration has not been run against the remote database.

`get_notification_feed()` is SECURITY INVOKER, respects RLS, and returns the newest 20 items plus the total unread count. The read table has a composite primary key; inserts use ON CONFLICT DO NOTHING to make repeated clicks safe. There is no UPDATE/DELETE permission for students, and no authenticated INSERT permission on broadcasts.

The hook keys its cache by auth user ID, keeps data fresh for 60 seconds, and does not poll or subscribe to Realtime. Opening the popover refreshes stale data. Marking read patches cache after a successful insert, without an immediate list refetch. “Read all displayed” affects the latest displayed unread items only; older unseen broadcasts remain in the total unread count.

## Validation

Run `node --test tests/notifications.test.cjs` for hook/cache tests. Before deployment, test in a Supabase environment:

1. Anonymous users cannot read the tables or invoke the feed.
2. Student A can only insert/read read-tracking rows with A's auth ID; inserting B's ID fails.
3. Students cannot insert/update/delete broadcasts or update/delete read tracking.
4. Teacher unlocks an existing exam: exactly one broadcast appears. Student clicking it opens the exam preview, not a new attempt automatically.
5. Teacher saves a lesson resource with the send checkbox checked: one broadcast appears, opening its lesson player directly.
6. Repeat read and bulk-read operations; ensure no duplicate rows and stable unread counts.

The migration has not been applied automatically. Local database verification requires a running Supabase/Docker environment.

## Updated publication controls (2026-09-25)

Apply `202609250001_notification_publication_controls.sql` AFTER the broadcast migration. Do not rerun the old migration alone: it creates the legacy automatic triggers. The new migration removes both legacy triggers and changes publication as follows:

- Exam INSERT never broadcasts, even if inserted OPEN. An UPDATE broadcasts only on transition from not-open to `status = OPEN AND is_active = true`. Repeated opens while already open do not broadcast; close then reopen creates one new broadcast.
- Material INSERT/UPDATE never broadcasts automatically. The resource form starts with its notification checkbox unchecked on every open. Saving with it checked calls the authenticated teacher API `/api/notifications/material` after a successful save.
- The API loads names/type/parent links through a role-checked database function rather than trusting user-supplied notification text. A submission UUID prevents duplicate notification records if the same API request is retried. Students cannot publish through the API or RPC.
- Saving and publishing are separate operations. If saving succeeds but publishing fails, the UI explicitly reports that the resource was saved without a notification. It does not repeat the save or pretend publication succeeded. Teachers can edit the saved resource and send again.
- `subtype` identifies ATTENDANCE/PERIODIC/VIDEO/PDF/EXAM for navbar icons and badges. Existing broadcasts without a subtype retain a generic icon. Description is rendered as plain text with line breaks, not HTML.
- Apply `202609250002_notification_lesson_links.sql` after the publication controls migration. New material broadcasts link directly to `/courses/[courseId]/lessons/[lessonId]`. The navbar also converts older `/courses?...` notification links containing both courseId and lessonId to the lesson player; links without a lessonId retain their original destination.

Integration checks on a running database: create locked/open exam (zero notifications), open locked exam (one), repeat open (zero extra), edit open exam title (zero extra), close/reopen (one extra); save material unchecked (zero), checked (one); repeat POST with the same requestId (still one); submit as student (403); verify ATTENDANCE/PERIODIC description formats and Video/PDF/EXAM labels. Local SQL/RLS execution requires Docker/Supabase and has not been executed in this workspace.
