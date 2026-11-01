#!/usr/bin/env python3
"""Produce distinct properly credited photos of a phone-loss response. Stop on invalid originals, no upscaling."""
import hashlib, io, json, pathlib, time, urllib.parse, urllib.request
from PIL import Image, ImageOps
ROOT=pathlib.Path(__file__).resolve().parents[1]
SOURCES=json.loads((ROOT/'assets/culture/phone-v43-sources.json').read_text(encoding='utf-8'))['photos']
OUT=ROOT/'images/culture-v43-photo/mat-dien-thoai'
OUT.mkdir(parents=True,exist_ok=True)
result=[]
def obtain(entry):
    filename=entry['filename'].replace(' ','_')
    md5=hashlib.md5(filename.encode('utf-8')).hexdigest()
    quoted=urllib.parse.quote(filename,safe='-_().')
    urls=[
      f'https://upload.wikimedia.org/wikipedia/commons/{md5[0]}/{md5[:2]}/{quoted}',
      'https://commons.wikimedia.org/wiki/Special:Redirect/file/'+quoted,
    ]
    error=None
    for url in urls:
      for _ in range(3):
        try:
          req=urllib.request.Request(url,headers={
            'User-Agent':'MRLeeEducationCulture/1.0 (https://github.com/jeongjunlee10x/tienghanmrlee.github.io; licensed Wikimedia education photographs)',
            'Accept':'image/jpeg,image/png,image/*;q=0.8'
          })
          with urllib.request.urlopen(req,timeout=75) as response: data=response.read(30000000)
          with Image.open(io.BytesIO(data)) as im: im.verify()
          return data
        except Exception as e:
          error=e
          print('Retry source',entry['index'],repr(e),flush=True)
          time.sleep(2)
    raise RuntimeError(f'Image download failed {filename}: {error}')
assert [p['index'] for p in SOURCES]==[1,2,3,4,5]
for item in SOURCES:
    data=obtain(item)
    with Image.open(io.BytesIO(data)) as image:
      photo=ImageOps.exif_transpose(image).convert('RGB')
      w,h=photo.size
      assert w>=1536 and h>=1024, f'Original smaller than destination {w}x{h}'
      assert w>=item['original_width']-4 and h>=item['original_height']-4, f'Unexpected small original {w}x{h}'
      result_image=ImageOps.fit(photo,(1536,1024),method=Image.Resampling.LANCZOS,centering=(0.5,0.5))
      dest=OUT/f"{item['index']:02d}.webp"
      result_image.save(dest,'WEBP',quality=91,method=6)
      binary=dest.read_bytes()
      assert binary[:4]==b'RIFF' and binary[8:12]==b'WEBP'
      assert len(binary)>45000,(dest,len(binary))
      result.append({**item,'file':dest.relative_to(ROOT).as_posix(),'bytes':len(binary),'width':1536,'height':1024,
        'sha256':hashlib.sha256(binary).hexdigest(),'source_dimensions':[w,h],
        'modified':'Original cropped to 3:2 and downsampled to 1536x1024 WebP','credit_required':True})
      print('READY',dest,len(binary),flush=True)
assert len(result)==5 and len({x['sha256'] for x in result})==5
(ROOT/'assets/culture/phone-v43-published.json').write_text(
  json.dumps({'version':'43.0','topic':'mat-dien-thoai','photos':result},ensure_ascii=False,indent=2)+'\n',
  encoding='utf-8')
print('PASS 5 unique licensed and verified 1536x1024 phone-loss scenes',flush=True)
