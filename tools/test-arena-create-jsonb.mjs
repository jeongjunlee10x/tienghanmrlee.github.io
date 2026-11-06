/* Regression: Supabase PostgREST .contains() on a JSONB array of objects
 * MUST receive serialized JSON, not a native JS array of objects.
 * A native array serializes as cs.{[object Object]} and blocks ALL room creation.
 */
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const code=readFileSync(new URL("../supabase/functions/mrlee-arena-rooms/index.ts",import.meta.url),"utf8");
const old='.contains("members",[{uid}])';
const fixed='.contains("members",JSON.stringify([{uid}]))';
assert.ok(code.includes(fixed),"Arena backend must serialize JSONB containment operand");
assert.ok(!code.includes(old),"Unsafe JS array in JSONB .contains() regressed");
const uid="qa_verified_firebase_uid_123";
const json=JSON.stringify([{uid}]);
assert.deepEqual(JSON.parse(json),[{uid}]);
const url=new URL("https://example.test/rest/v1/mrlee_arena_rooms");
url.searchParams.set("members","cs."+json);
assert.equal(url.searchParams.get("members"),'cs.[{"uid":"qa_verified_firebase_uid_123"}]');
assert.ok(!url.href.includes("%5Bobject+Object%5D"),"Invalid PostgREST query shape");
assert.match(code,/async function freshRoom\(/);
assert.match(code,/await requireGold\(database,uid,game,tier\)/);
assert.match(code,/if\(\(count\|\|0\)>=3\)/);
assert.match(code,/visibility,locked:false,min_gold:tier,status:"waiting"/);
assert.match(code,/return reply\(req,200,\{ok:true,room:safeRoom\(row,uid\)\}\)/);
console.log("PASS: JSONB membership filter serializes to cs.JSON; create-room auth, gold, room cap preserved");
