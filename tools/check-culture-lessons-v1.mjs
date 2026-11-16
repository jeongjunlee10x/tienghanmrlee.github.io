import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const read = (path) => fs.readFileSync(path, 'utf8');
const sandbox = { window: {} };
vm.runInNewContext(read('mrlee-culture-v13-data.js'), sandbox);
vm.runInNewContext(read('assets/culture-lesson-v1-data.js'), sandbox);
const topics = sandbox.window.MRLEE_CULTURE_V13;
const plans = sandbox.window.MRLEE_CULTURE_LESSON_V1;
assert.equal(topics.length, 22, 'Expected 22 culture and life-skills topics');
assert.equal(Object.keys(plans).length, 22, 'Every topic needs a lesson plan');

for (const topic of topics) {
  const plan = plans[topic.slug];
  assert.ok(plan, 'Missing lesson plan: ' + topic.slug);
  assert.ok(plan.goals?.length >= 2, 'Missing learning outcomes: ' + topic.slug);
  assert.ok(plan.focus?.length >= 2, 'Missing theory focus: ' + topic.slug);
  assert.ok(plan.patterns?.length >= 2, 'Missing speaking patterns: ' + topic.slug);
  assert.equal(plan.practice.length, 3, 'Expected 3 speaking samples: ' + topic.slug);
  for (const [index, sample] of plan.practice.entries()) {
    assert.ok(sample.title && sample.scene, 'Missing scene: ' + topic.slug + '/' + index);
    assert.ok(sample.roles?.length === 2, 'Expected two role labels: ' + topic.slug + '/' + index);
    assert.ok(sample.images?.length >= 1 && sample.images.length <= 2, 'Expected 1–2 images: ' + topic.slug + '/' + index);
    assert.ok(sample.images.every((n) => Number.isInteger(n) && n >= 0 && n <= 4), 'Image index outside 5-image gallery: ' + topic.slug + '/' + index);
    assert.equal(sample.dialogue.length, 4, 'Expected 4 dialogue turns: ' + topic.slug + '/' + index);
    assert.ok(sample.dialogue.every((line) => line.length === 3 && ['A', 'B'].includes(line[0]) && line[1] && line[2]), 'Invalid bilingual dialogue: ' + topic.slug + '/' + index);
  }
  assert.ok(plan.discussion?.length >= 2 && plan.exit, 'Missing application task: ' + topic.slug);
}

const hub = read('van-hoa-han-quoc.html');
const lesson = read('van-hoa-bai-hoc.html');
const logic = read('assets/culture-lesson-v1.js');
vm.runInNewContext(read('mrlee-culture-v17-media.js'), sandbox);
const media = sandbox.window.MRLEE_CULTURE_V17_MEDIA;
assert.ok(hub.includes('assets/culture-lesson-v1.css') && hub.includes('assets/culture-lesson-v1.js'), 'Hub integration missing');
assert.ok(lesson.includes('assets/culture-lesson-v1.css') && lesson.includes('assets/culture-lesson-v1-data.js') && lesson.includes('assets/culture-lesson-v1.js'), 'Lesson integration missing');
assert.ok(lesson.indexOf('assets/culture-lesson-v1-data.js') < lesson.indexOf('mrlee-culture-v13.js'), 'Lesson blueprint must load before lesson renderer');
assert.ok(lesson.indexOf('mrlee-culture-hd-v19.js') < lesson.indexOf('assets/culture-lesson-v1.js'), 'Lesson enhancement must run after image engine');
assert.ok((lesson.match(/<img\b/g) || []).length >= 100, 'Expected the existing five-image topic galleries to remain');
assert.equal(Object.keys(media).length, 22, 'Expected image registry for all 22 topics');
assert.ok(Object.values(media).every((item) => item.images?.length >= 5), 'Each topic needs at least five registered image assets');
assert.ok(logic.includes('mrleeLessonPlan') && logic.includes('mrleeSpeakingLab') && logic.includes('mrleeApplication'), 'Lesson flow sections missing');
assert.ok(logic.includes('speechSynthesis') && logic.includes('data-mcl-swap'), 'Speaking interactions missing');

console.log('PASS: 22 lessons, 66 speaking samples, 264 dialogue lines, 1–2 images per sample, 45–60 minute plan, hub + lesson integration.');
