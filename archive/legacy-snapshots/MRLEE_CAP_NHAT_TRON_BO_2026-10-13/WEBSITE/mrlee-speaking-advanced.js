// MR LEE - Lo trinh 1-6: noi dung bien soan rieng, tham chieu Sejong/Topik
import { ROADMAP_UNITS } from './mrlee-roadmap-bank.js';
export const ADVANCED_SPEAKING_BANK = ROADMAP_UNITS.filter(x => x.level >= 3).map(x => ({
  id:x.id, kind:'lesson', level:'sc'+x.level, title:`Cấp ${x.level} · Bài ${x.number} – ${x.title}`, subtitle:x.goal, returnUrl:x.lessonUrl, items:x.samples
}));
