/**
 * MR LEE site QA entrypoint (Node 22+, no npm).
 * Runs current tests instead of obsolete checks referencing removed JSON paths.
 * Read-only: does not clean, overwrite, build MP3 or touch student data.
 */
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
const root=path.resolve(process.argv[2]||path.join(path.dirname(fileURLToPath(import.meta.url)),'..'));
const suites=[
 ['Đường dẫn của toàn bộ trang / cú pháp JS','audit-full-site.mjs'],
 ['Nút liên hệ và sức khỏe Admin','check-contact-admin.mjs'],
 ['Ảnh bìa toàn cảnh và chữ lồng ảnh','check-home-overlay.mjs'],
 ['Học bổng và bảng xếp hạng không bị chồng lấn','check-ranking-layout.mjs'],
 ['Tương phản chữ TOPIK I/II trong hai giao diện','check-topik-contrast.mjs'],
 ['Chọn giao diện một lần khi vào website, không hiện nút trùng','check-theme-entry.mjs'],
 ['Hình ảnh và font trong CSS','audit-css-assets.mjs'],
 ['24 bản ghi âm TOPIK thật','audit-topik-audio.mjs'],
 ['Kho giáo trình và AI trợ lý','check-mrlee-ai.mjs'],
 ['Chức năng cốt lõi','mrlee-next-qa.mjs'],
 ['Trang chủ / Admin Smart','check-mrlee-smart.mjs'],
 ['Giao diện trang con V4','check-mrlee-v4.mjs'],
 ['Nút một màn hình V5','check-mrlee-v5.mjs'],
 ['Điểm thưởng (kiểm toán chỉ đọc)','audit-mrlee-rewards.mjs'],
 ['Thang điểm Spark và quy tắc công khai','test-score-policy.cjs'],
 ['Tài khoản Firebase đến sau và lưu lịch sử luyện tập','test-learning-tracker-auth.cjs']
];
let failures=0;
for(const [title,file] of suites){
 console.log('\n=== '+title+' ===');
 const out=spawnSync(process.execPath,[path.join(root,'tools',file)],{cwd:root,encoding:'utf8',timeout:120000,maxBuffer:10*1024*1024});
 if(out.stdout)process.stdout.write(out.stdout);
 if(out.stderr)process.stderr.write(out.stderr);
 if(out.status!==0){failures++;console.error('FAILED: '+file+' '+(out.error?.message||''))}
}
if(failures){console.error('\nMRLEE QA: '+failures+'/'+suites.length+' bộ kiểm tra không đạt.');process.exitCode=1}
else console.log('\nMRLEE QA: ĐẠT '+suites.length+'/'+suites.length+' bộ kiểm tra tĩnh. Cần thử trình duyệt và tài khoản thật trước khi kết luận hết lỗi runtime.');
