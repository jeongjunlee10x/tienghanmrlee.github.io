/** MR LEE AI - confirm all 20 optimized binaries actually exist before publication.
 * Run node tools/verify-mrlee-ai-assets.mjs after staging images in the repository.
 * Original graphics remain a fallback when images are not published.
 */
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
const root=path.resolve('.');
const expected={
  "admin-mobile": "4191c8c6961a5f92c6469dcbd33a9a20bf0b12cb27fedb0e40be3f44c36170de",
  "admin": "5e89517824bc0b3edf3cb14bcab7e83de323185d44e469f77b93d2e5ad67ed53",
  "culture-mobile": "f089c8964bcd2f0c4e291c1df45c5b105c94fb1883d84bdfd9d1f4441d53b8d8",
  "culture": "f66b4634235ec31d98f226914b3cc64894d47675838eaa365e5c0afd49074325",
  "home-mobile": "566242e2532e01aa5d79845d810fc3502ada7e7be7c3e498b6805ba3e146b8bb",
  "home": "2229c6b50d15b5b6188630bbfb8584c2b494b78060ee983c92ea2c075eb9280d",
  "interview-mobile": "fcc37c44280ce3fbb502e71fc4d60ae3532418cffa9d4c428ac54d2258e06eff",
  "interview": "7dacc769678986b9a3f8a0306953f10d150ad47e2b894c66f93efa8ce1643b14",
  "learning-mobile": "6a83df2b6fd1c5d0d5d86c114e913da726f0e1a3897e0635120a232ac3787ed3",
  "learning": "51451a519cd4e314c2b6fc558ee3aeb32038531c7020c30ab51be334630556c9",
  "profile-mobile": "be6a5d9c0e42106dd33bb17d61053ac8b7d2157352aec22e8040c28c9b142a66",
  "profile": "3194c51c8df6dbb9980e3dfa9d5e7a71a2b97dac3a3854b7a6bd1f91940a5716",
  "speaking-mobile": "71880bccf3c6fd10ea78b314c91db4b3c232e88d16e319ab40cddb80ea4af1b6",
  "speaking": "8167d0d732118b5ada2a169b04c704549b41f11d5caa452b9f3b291a53823de1",
  "topik-mobile": "fbff917d0ac8c6ca3f44065a6c688073c7291c00c127ad753cad3280c239ea00",
  "topik": "24854ab6412cf7cc5d44353b8eaefe02a265b353d973a407a18d128635c6aeff",
  "universities-mobile": "33285c88047fc27555274eba19c44c24e0897d50a06bdd8a5d523e2b149c900d",
  "universities": "001327085977928696209fbd62bc907b3eec912864d19dfeb436fab203834b61",
  "workbook-mobile": "0f0972575389e35b8ec7d4a4e49c3da64996fe2cda6a2b0e6d8c76fab3b66ebf",
  "workbook": "95dfb7d0d719dabf485655248b15c5b06a285d2130975d0bc2b31f5c6a45ed24"
};
let missing=0,failed=0;const digestsSeen=new Set();
for(const [name,sha] of Object.entries(expected)){
 const file=path.join(root,'assets','mrlee-ai','v1',name+'.webp');
 if(!fs.existsSync(file)){console.error('MISSING AI IMAGE',file);missing++;continue}
 const bytes=fs.readFileSync(file);
 const digest=crypto.createHash('sha256').update(bytes).digest('hex');
 const ok=bytes.length>75_000&&bytes.subarray(0,4).toString('ascii')==='RIFF'&&bytes.subarray(8,12).toString('ascii')==='WEBP'&&digest===sha&&!digestsSeen.has(digest);
 if(!ok){console.error('CORRUPTED OR DUPLICATE IMAGE',name,bytes.length);failed++}
 digestsSeen.add(digest);
}
console.log('MR LEE AI V1: '+(20-missing-failed)+'/20 WebP verified | missing '+missing+' | invalid '+failed);
if(missing||failed)process.exitCode=1;
else console.log('PASS: 10 topic artworks with desktop and mobile variants (byte integrity verified).');
