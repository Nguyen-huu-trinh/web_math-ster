import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { randomUUID } from "node:crypto";
import vm from "node:vm";
import ts from "typescript";
import { PGlite } from "@electric-sql/pglite";

const require = createRequire(import.meta.url);
function loadTs(path) {
  const code = ts.transpileModule(readFileSync(new URL(path, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const exports = {};
  vm.runInNewContext(code, { exports, require, Set, Math });
  return exports;
}
const study = loadTs("../lib/flashcards/study.ts");
const validation = loadTs("../lib/flashcards/validation.ts");
const math = loadTs("../lib/flashcards/math.ts");

test("math renders all four delimiters and bare formulas with surrounding prose", () => {
  const formula = String.raw`\frac{x_A + x_B}{2}`;
  for (const [left, right, block] of [["$", "$", false], ["$$", "$$", true], ["\\(", "\\)", false], ["\\[", "\\]", true]]) {
    const html = math.renderMathText(`Trước ${left}${formula}${right} sau`);
    assert.match(html, /class="katex"/);
    assert.match(html, /class="mfrac"/);
    assert.equal(html.includes('class="katex-display"'), block);
    assert.ok(html.startsWith("Trước ") && html.endsWith(" sau"));
  }
  for (const source of [formula, String.raw`\vec{a} \cdot \vec{b}`, String.raw`\sqrt{\frac{1}{2}} + \alpha`, String.raw`M\left(\frac{x_A+x_B}{2},\frac{y_A+y_B}{2}\right)`]) {
    const html = math.renderMathText(source);
    assert.match(html, /class="katex"/);
    assert.doesNotMatch(html, /katex-error/);
  }
  const mixed = math.renderMathText(String.raw`Đáp án: \frac{x_A + x_B}{2} là hoành độ.
Ghi nhớ $x^2$ và \sqrt{y}.`);
  assert.ok(mixed.startsWith("Đáp án"));
  assert.ok(mixed.includes("là hoành độ.\nGhi nhớ "));
  assert.equal((mixed.match(/class="katex"/g) ?? []).length, 3);
});

test("math preserves plain text, escaped dollars, brace-contained delimiters and incomplete input", () => {
  for (const text of ["", "Câu hỏi bình thường", "Giá 20 USD", String.raw`Giá \$20`, "$unfinished", "Hai dòng\nTiếng Việt"]) {
    assert.equal(math.renderMathText(text), text);
  }
  assert.doesNotMatch(math.renderMathText(String.raw`$\text{giá $5$} + x$`), /katex-error/);
  assert.doesNotMatch(math.renderMathText(String.raw`$\text{giá \$5} + x$`), /katex-error/);
  assert.doesNotThrow(() => math.renderMathText(String.raw`$\frac{1$`));
  assert.doesNotThrow(() => math.renderMathText(String.raw`\sqrt{`));
});

test("math repairs duplicated command slashes while preserving matrix and aligned row breaks", () => {
  const copied = String.raw`\\(\\frac{x_A+x_B}{2}\\)`;
  assert.equal(math.normalizeMathText(copied), String.raw`\(\frac{x_A+x_B}{2}\)`);
  assert.match(math.renderMathText(copied), /class="mfrac"/);
  for (const formula of [String.raw`\begin{pmatrix}a&b\\c&d\end{pmatrix}`, String.raw`\begin{aligned}x&=1\\y&=\frac{1}{2}\end{aligned}`]) {
    assert.equal(math.normalizeMathText(formula), formula);
    assert.doesNotMatch(math.renderMathText(formula), /katex-error/);
    assert.match(math.renderMathText(formula), /class="katex-display"/);
  }
  assert.equal(math.normalizeMathText(math.normalizeMathText(copied)), math.normalizeMathText(copied));
});

test("math escapes user HTML and does not enable trusted KaTeX commands", () => {
  const html = math.renderMathText(String.raw`<img src=x onerror="alert(1)"> $\href{javascript:alert(1)}{x}$`);
  assert.ok(html.startsWith("&lt;img"));
  assert.doesNotMatch(html, /<img|<script|<a\s|href="javascript:/);
});

test("study filters, shuffle, completion and skipped cards", () => {
  const cards = [
    { id: "a", progress: null },
    { id: "b", progress: { is_starred: true, status: "LEARNED" } },
    { id: "c", progress: { is_starred: true, status: "REVIEW_NEEDED" } },
  ];
  assert.deepEqual([...study.studyQueue(cards, "starred")], ["b", "c"]);
  assert.deepEqual([...study.studyQueue(cards, "all")], ["a", "b", "c"]);
  const queue = ["a", "b", "c"];
  assert.deepEqual([...study.shuffleCards(queue, () => 0)].sort(), queue);
  assert.deepEqual(queue, ["a", "b", "c"]);
  assert.equal(study.nextUnrated(queue, { c: true }, 2), 0);
  assert.equal(study.sessionStats(queue, { a: true, c: true }).percent, 67);
  assert.equal(study.nextUnrated(queue, { a: true, b: true, c: true }, 2), -1);
  assert.equal(study.nextUnrated(["a"], { a: true }, 0), -1);
  assert.equal(study.sessionStats([], {}).percent, 0);
});

test("server input rejects blank, oversized, malformed and injected fields", () => {
  assert.equal(validation.deckInputSchema.safeParse({ title: "   " }).success, false);
  assert.equal(validation.deckInputSchema.safeParse({ title: "Oxyz", is_published: true }).success, false);
  assert.equal(validation.cardInputSchema.safeParse({ question: "q", answer: "a".repeat(10001) }).success, false);
  assert.equal(validation.starBatchSchema.safeParse([]).success, false);
  assert.equal(validation.starBatchSchema.safeParse([{ cardId: randomUUID(), isStarred: true, user_id: randomUUID() }]).success, false);
  assert.equal(validation.starBatchSchema.safeParse([{ cardId: randomUUID(), isStarred: false }]).success, true);
  const id = randomUUID();
  assert.equal(validation.reorderInputSchema.safeParse([id, id]).success, false);
  assert.equal(validation.flashcardIdSchema.safeParse("not-a-uuid").success, false);
});

test("deck display order accepts only PostgreSQL nonnegative integers", () => {
  for (const order_index of [0, 1, 2147483647]) {
    assert.equal(validation.deckInputSchema.parse({ title: "Deck", order_index }).order_index, order_index);
  }
  for (const order_index of [-1, 1.5, 2147483648, NaN, Infinity, "1", "", null]) {
    assert.equal(validation.deckInputSchema.safeParse({ title: "Deck", order_index }).success, false);
  }
  assert.equal(Object.hasOwn(validation.deckInputSchema.parse({ title: "Deck" }), "order_index"), false);
});

test("PostgreSQL migration, RLS, CRUD, reordering and personal progress", async (t) => {
  const db = new PGlite();
  const teacher = randomUUID(), student = randomUUID(), otherStudent = randomUUID(), inactive = randomUUID(), admin = randomUUID();
  const deck = randomUUID();
  let cards;
  async function asUser(id, role = "authenticated") {
    await db.exec("reset role");
    await db.query("select set_config('request.jwt.claim.sub', $1, false)", [id]);
    await db.exec(`set role ${role}`);
  }
  async function scalar(sql, params = []) { return (await db.query(sql, params)).rows[0].value; }
  try {
    // Isolated Supabase auth/profile contract; no production connection or credentials.
    await db.exec(`
      create role anon; create role authenticated;
      create schema auth;
      create function auth.uid() returns uuid language sql stable as
        $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
      grant usage on schema public, auth to anon, authenticated;
      grant execute on function auth.uid() to anon, authenticated;
      create table public.profiles(id uuid primary key, role text not null, is_active boolean not null default true);
    `);
    for (const [id, role, active] of [[teacher, "TEACHER", true], [student, "STUDENT", true], [otherStudent, "STUDENT", true], [inactive, "STUDENT", false], [admin, "ADMIN", true]]) {
      await db.query("insert into profiles values ($1, $2, $3)", [id, role, active]);
    }
    await db.exec(readFileSync(new URL("../supabase/migrations/202610030001_math_flashcards.sql", import.meta.url), "utf8"));
    await db.exec(readFileSync(new URL("../supabase/migrations/202610030002_flashcard_stars.sql", import.meta.url), "utf8"));

    await t.test("teacher creates draft and cards; timestamps and order are generated", async () => {
      await asUser(teacher);
      await db.query("insert into flashcard_decks(id, title) values ($1, 'Oxyz')", [deck]);
      for (const label of ["A", "B", "C"]) await db.query("select create_flashcard($1, $2, $3, null)", [deck, label, "$x^2$"]);
      cards = (await scalar("select get_flashcard_deck_detail($1) as value", [deck])).cards;
      assert.deepEqual(cards.map((card) => card.order_index), [0, 1, 2]);
      assert.equal(await scalar("select is_published as value from flashcard_decks where id=$1", [deck]), false);
      const before = await scalar("select updated_at::text as value from flashcard_decks where id=$1", [deck]);
      await db.query("update flashcard_decks set title='Vectơ Oxyz' where id=$1", [deck]);
      assert.notEqual(await scalar("select updated_at::text as value from flashcard_decks where id=$1", [deck]), before);
    });

    await t.test("LaTeX survives validation, JSON transport, PostgreSQL writes and JSON reads", async () => {
      const input = {
        question: String.raw`Tính \(\vec{a}\cdot\vec{b}\)`,
        answer: String.raw`\frac{x_A+x_B}{2}`,
        note: String.raw`\[\begin{pmatrix}a&b\\c&d\end{pmatrix}\]`,
      };
      const payload = validation.cardInputSchema.parse(JSON.parse(JSON.stringify(input)));
      const created = await scalar("select to_jsonb(create_flashcard($1, $2, $3, $4)) as value", [deck, payload.question, payload.answer, payload.note]);
      const detail = JSON.parse(JSON.stringify(await scalar("select get_flashcard_deck_detail($1) as value", [deck])));
      const stored = detail.cards.find((card) => card.id === created.id);
      for (const field of ["question", "answer", "note"]) {
        assert.equal(stored[field], input[field]);
        assert.match(math.renderMathText(stored[field]), /class="katex"/);
        assert.doesNotMatch(math.renderMathText(stored[field]), /katex-error/);
      }
      const updated = String.raw`$$\sqrt{\alpha}$$`;
      await db.query("update flashcards set answer=$1 where id=$2", [updated, created.id]);
      assert.equal(await scalar("select answer as value from flashcards where id=$1", [created.id]), updated);
      await db.query("delete from flashcards where id=$1", [created.id]);
    });

    await t.test("students cannot see drafts or create teacher content", async () => {
      await asUser(student);
      assert.deepEqual(await scalar("select get_flashcard_decks() as value"), []);
      assert.equal(await scalar("select get_flashcard_deck_detail($1) as value", [deck]), null);
      await assert.rejects(db.query("insert into flashcard_decks(title) values ('forbidden')"), { code: "42501" });
      await assert.rejects(db.query("select create_flashcard($1, 'q', 'a', null)", [deck]), { code: "42501" });
      await assert.rejects(db.query("select update_flashcard_progress($1, 'LEARNED', null)", [cards[0].id]), { code: "P0002" });
      await assert.rejects(db.query("select reorder_flashcards($1, $2::uuid[])", [deck, cards.map((card) => card.id)]), { code: "42501" });
      assert.equal((await db.query("update flashcards set answer='forbidden' where id=$1 returning id", [cards[0].id])).rows.length, 0);
    });

    await t.test("reorder validates full membership and rolls back invalid lists", async () => {
      await asUser(teacher);
      const reversed = cards.map((card) => card.id).reverse();
      await db.query("select reorder_flashcards($1, $2::uuid[])", [deck, reversed]);
      assert.deepEqual((await scalar("select get_flashcard_deck_detail($1) as value", [deck])).cards.map((card) => card.id), reversed);
      for (const bad of [[cards[0].id], [cards[0].id, cards[0].id, cards[1].id], [cards[0].id, cards[1].id, randomUUID()]]) {
        await assert.rejects(db.query("select reorder_flashcards($1, $2::uuid[])", [deck, bad]), { code: "22023" });
      }
      assert.deepEqual((await scalar("select get_flashcard_deck_detail($1) as value", [deck])).cards.map((card) => card.id), reversed);
      await db.query("update flashcard_decks set is_published=true where id=$1", [deck]);
    });

    await t.test("star-only updates preserve learned status and review timestamp", async () => {
      await asUser(student);
      const starred = await scalar("select to_jsonb(update_flashcard_progress($1, null, true)) as value", [cards[0].id]);
      assert.equal(starred.reviewed_at, null);
      const learned = await scalar("select to_jsonb(update_flashcard_progress($1, 'LEARNED', null)) as value", [cards[0].id]);
      assert.equal(learned.is_starred, true);
      const unstarred = await scalar("select to_jsonb(update_flashcard_progress($1, null, false)) as value", [cards[0].id]);
      assert.equal(unstarred.status, "LEARNED");
      assert.equal(unstarred.reviewed_at, learned.reviewed_at);
      assert.equal(unstarred.id, starred.id);
      const catalog = await scalar("select get_flashcard_decks() as value");
      assert.equal(catalog[0].card_count, 3);
      assert.equal(catalog[0].learned_count, 1);
    });

    await t.test("batch stars validate atomically without changing review history", async () => {
      await asUser(student);
      const before = await scalar("select to_jsonb(p) as value from flashcard_student_progress p where card_id=$1", [cards[0].id]);
      const batch = [{ cardId: cards[0].id, isStarred: true }];
      await db.query("select update_flashcard_stars($1, $2::jsonb)", [deck, JSON.stringify(batch)]);
      const after = await scalar("select to_jsonb(p) as value from flashcard_student_progress p where card_id=$1", [cards[0].id]);
      assert.equal(after.is_starred, true);
      assert.equal(after.status, before.status);
      assert.equal(after.reviewed_at, before.reviewed_at);
      for (const invalid of [[], [...batch, ...batch], [{ cardId: cards[0].id, isStarred: "false" }]]) {
        await assert.rejects(db.query("select update_flashcard_stars($1, $2::jsonb)", [deck, JSON.stringify(invalid)]), { code: "22023" });
      }
      await assert.rejects(db.query("select update_flashcard_stars($1, $2::jsonb)", [deck, JSON.stringify([{ cardId: cards[0].id, isStarred: false }, { cardId: randomUUID(), isStarred: true }])]), { code: "P0002" });
      assert.equal(await scalar("select is_starred as value from flashcard_student_progress where card_id=$1", [cards[0].id]), true);
      await asUser(teacher);
      await assert.rejects(db.query("select update_flashcard_stars($1, $2::jsonb)", [deck, JSON.stringify(batch)]), { code: "42501" });
    });

    await t.test("progress is private and cannot be written for another student", async () => {
      await asUser(otherStudent);
      assert.equal(await scalar("select count(*)::int as value from flashcard_student_progress"), 0);
      assert.equal((await scalar("select get_flashcard_decks() as value"))[0].learned_count, 0);
      await assert.rejects(db.query("insert into flashcard_student_progress(user_id, card_id) values ($1, $2)", [student, cards[1].id]), { code: "42501" });
      assert.equal((await db.query("update flashcard_student_progress set status='REVIEW_NEEDED' where user_id=$1 returning id", [student])).rows.length, 0);
      await asUser(teacher);
      await assert.rejects(db.query("select update_flashcard_progress($1, 'LEARNED', null)", [cards[0].id]), { code: "42501" });
    });

    await t.test("unpublishing blocks further reviews without deleting progress", async () => {
      await asUser(teacher);
      await db.query("update flashcard_decks set is_published=false where id=$1", [deck]);
      await asUser(student);
      await assert.rejects(db.query("select update_flashcard_progress($1, 'REVIEW_NEEDED', null)", [cards[0].id]), { code: "P0002" });
      await asUser(teacher);
      await db.query("update flashcard_decks set is_published=true where id=$1", [deck]);
      await asUser(student);
      assert.equal((await scalar("select get_flashcard_decks() as value"))[0].learned_count, 1);
    });

    await t.test("anonymous/inactive accounts cannot access content; admin can manage", async () => {
      await asUser("", "anon");
      await assert.rejects(db.query("select * from flashcard_decks"), { code: "42501" });
      await assert.rejects(db.query("select get_flashcard_decks()"), { code: "42501" });
      await asUser(inactive);
      assert.deepEqual(await scalar("select get_flashcard_decks() as value"), []);
      await asUser(admin);
      assert.equal((await scalar("select get_flashcard_decks() as value")).length, 1);
    });

    await t.test("catalog progress derives from personal stars instead of old ratings", async () => {
      await db.exec("reset role");
      await db.exec(readFileSync(new URL("../supabase/migrations/202610030003_flashcard_catalog_stars.sql", import.meta.url), "utf8"));
      await asUser(student);
      let catalog = await scalar("select get_flashcard_decks() as value");
      assert.equal(catalog[0].starred_count, 1);
      assert.equal(catalog[0].card_count - catalog[0].starred_count, 2);
      assert.equal(catalog[0].learned_count, undefined);
      assert.equal((await scalar("select get_flashcard_deck_detail($1) as value", [deck])).starred_count, 1);
      await db.query("select update_flashcard_stars($1, $2::jsonb)", [deck, JSON.stringify([{ cardId: cards[0].id, isStarred: false }])]);
      assert.equal((await scalar("select get_flashcard_decks() as value"))[0].starred_count, 0);
      await db.query("select update_flashcard_stars($1, $2::jsonb)", [deck, JSON.stringify(cards.map((card) => ({ cardId: card.id, isStarred: true })))]);
      assert.equal((await scalar("select get_flashcard_decks() as value"))[0].starred_count, 3);
      await asUser(otherStudent);
      assert.equal((await scalar("select get_flashcard_decks() as value"))[0].starred_count, 0);
      await asUser(teacher);
      const empty = await scalar("insert into flashcard_decks(title, is_published) values ('Empty', true) returning id as value");
      await asUser(student);
      catalog = await scalar("select get_flashcard_decks() as value");
      assert.equal(catalog.find((item) => item.id === empty).card_count, 0);
      assert.equal(catalog.find((item) => item.id === empty).starred_count, 0);
      await asUser(teacher);
      await db.query("delete from flashcard_decks where id=$1", [empty]);
      await db.exec("reset role");
      await db.query("delete from flashcard_student_progress where card_id=any($1::uuid[])", [cards.slice(1).map((card) => card.id)]);
    });

    await t.test("deck ordering migration preserves data, sorts catalogs and enforces permissions", async () => {
      await asUser(teacher);
      const extra = [];
      for (const title of ["Older", "Newer", "Draft"]) {
        extra.push(await scalar("insert into flashcard_decks(title, is_published, created_at) values ($1, $2, '2020-01-01') returning id as value", [title, title !== "Draft"]));
      }
      await db.query("update flashcard_decks set created_at='2020-01-02' where id=$1", [extra[1]]);
      const before = await scalar("select get_flashcard_decks() as value");
      await db.exec("reset role");
      await db.exec(readFileSync(new URL("../supabase/migrations/202610040001_flashcard_deck_order.sql", import.meta.url), "utf8"));
      await asUser(teacher);
      assert.deepEqual(await scalar("select get_flashcard_decks() as value"), before.map((item) => ({ ...item, order_index: 0 })));
      for (const [id, order] of [[deck, 20], [extra[0], 10], [extra[1], 10], [extra[2], 1]]) {
        await db.query("update flashcard_decks set order_index=$1 where id=$2", [order, id]);
      }
      assert.deepEqual((await scalar("select get_flashcard_decks() as value")).map((item) => item.id), [extra[2], extra[1], extra[0], deck]);
      assert.equal((await scalar("select get_flashcard_deck_detail($1) as value", [deck])).order_index, 20);
      await db.query("update flashcard_decks set created_at='2020-01-01' where id=$1", [extra[1]]);
      assert.deepEqual((await scalar("select get_flashcard_decks() as value")).slice(1, 3).map((item) => item.id), extra.slice(0, 2).sort());
      await assert.rejects(db.query("update flashcard_decks set order_index=-1 where id=$1", [deck]), { code: "23514" });
      await assert.rejects(db.query("update flashcard_decks set order_index=null where id=$1", [deck]), { code: "23502" });
      await assert.rejects(db.query("update flashcard_decks set order_index=2147483648 where id=$1", [deck]), { code: "22003" });
      const defaultDeck = await scalar("insert into flashcard_decks(title) values ('Default') returning to_jsonb(flashcard_decks) as value");
      assert.equal(defaultDeck.order_index, 0);
      extra.push(defaultDeck.id);
      const customDeck = await scalar("insert into flashcard_decks(title, order_index) values ('Custom', 5) returning to_jsonb(flashcard_decks) as value");
      assert.equal(customDeck.order_index, 5);
      extra.push(customDeck.id);
      await asUser(student);
      assert.deepEqual((await scalar("select get_flashcard_decks() as value")).map((item) => item.id), [...extra.slice(0, 2).sort(), deck]);
      assert.equal((await db.query("update flashcard_decks set order_index=0 where id=$1 returning id", [deck])).rows.length, 0);
      assert.equal((await scalar("select get_flashcard_deck_detail($1) as value", [deck])).order_index, 20);
      await asUser(admin);
      await db.query("update flashcard_decks set order_index=2 where id=$1", [deck]);
      assert.equal((await scalar("select get_flashcard_decks() as value")).find((item) => item.id === deck).order_index, 2);
      await db.query("delete from flashcard_decks where id=any($1::uuid[])", [extra]);
    });

    await t.test("large decks retain all cards and cascading deletes remove progress", async () => {
      await asUser(teacher);
      await db.query("insert into flashcards(deck_id, question, answer, order_index) select $1, 'Q', 'A', n from generate_series(3, 1004) n", [deck]);
      assert.equal((await scalar("select get_flashcard_deck_detail($1) as value", [deck])).cards.length, 1005);
      await db.query("delete from flashcards where id=$1", [cards[0].id]);
      await db.exec("reset role");
      assert.equal(await scalar("select count(*)::int as value from flashcard_student_progress"), 0);
      await asUser(teacher);
      await db.query("delete from flashcard_decks where id=$1", [deck]);
      await db.exec("reset role");
      assert.equal(await scalar("select count(*)::int as value from flashcards"), 0);
    });
  } finally { await db.close(); }
});
