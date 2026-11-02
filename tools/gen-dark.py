#!/usr/bin/env python3
"""Sinh src/dark.css từ các class màu hex trong code. Chạy lại sau khi thêm màu mới:  python tools/gen-dark.py"""
import glob, os, re
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
BG={'#fbfbfd':'#000000','#f5f5f7':'#121214','#e8e8ed':'#2c2c2e','#d2d2d7':'#3a3a3c','#1d1d1f':'#1c1c1e','#f0f7ff':'#0a2540','white':'#1c1c1e'}
TX={'#1d1d1f':'#f5f5f7','#424245':'#d2d2d7','#515154':'#c7c7cc','#6e6e73':'#a1a1a6','#86868b':'#8e8e93','#0071e3':'#0a84ff','#66a9f5':'#66a9f5','#000000':'#f5f5f7'}
BD={'#e8e8ed':'#38383a','#d2d2d7':'#48484a','#1d1d1f':'#f5f5f7','#f5f5f7':'#2c2c2e','#fbfbfd':'#1c1c1e','white':'#38383a'}
SUF={'hover':':hover','focus':':focus','active':':active','disabled':':disabled','group-hover':':is(:where(.group):hover *)'}
MQ={'sm':'640px','md':'768px','lg':'1024px','xl':'1280px'}
def rgba(h,a):
    h=h.lstrip('#'); return f"rgb({int(h[0:2],16)} {int(h[2:4],16)} {int(h[4:6],16)} / {int(a)/100})"
esc=lambda t: re.sub(r'([^a-zA-Z0-9_-])',r'\\\1',t)
src=''.join(open(f).read() for f in glob.glob('src/**/*.tsx',recursive=True))+open('index.html').read()
rx=re.compile(r'((?:[a-z-]+:)*)(bg|text|border|ring|from|via|to)-(?:\[(#[0-9a-fA-F]{6})\]|(white))(?:/(\d+))?')
out=[]
for tok in set(re.findall(r'[^\s"\'`{}]+',src)):
    m=rx.fullmatch(tok)
    if not m: continue
    vs=[v for v in m.group(1).split(':') if v]; pre=m.group(2); hx=(m.group(3) or 'white').lower(); a=m.group(5)
    if any(v not in SUF and v not in MQ for v in vs): continue
    if pre=='text' and hx=='white': continue
    if pre in('border','ring') and hx=='white' and a: continue
    mp=TX if pre=='text' else BD if pre in('border','ring') else BG
    if hx not in mp: continue
    col=mp[hx]
    if a: col='rgb(255 255 255 / %s)'%(int(a)/100) if hx=='#1d1d1f' and pre!='text' and int(a)<=20 else rgba(col,a)
    decl={'bg':'background-color','text':'color','border':'border-color','ring':'--tw-ring-color','from':'--tw-gradient-from','via':'--tw-gradient-via','to':'--tw-gradient-to'}[pre]
    rule='.dark .'+esc(tok)+''.join(SUF[v] for v in vs if v in SUF)+'{'+decl+':'+col+'}'
    mq=[MQ[v] for v in vs if v in MQ]
    out.append(f"@media (min-width:{mq[0]}){{{rule}}}" if mq else rule)
head=open('src/dark.css').read().split('\n.dark .bg-white')[0] if False else None
base=open('src/dark.css').read()
keep=base[:base.index('.dark .bg-white')] if '.dark .bg-white' in base else base.split('\n@media')[0]
# giữ phần đầu (base + extras), thay phần sinh tự động
marker='/*GENERATED*/'
fixed=base.split(marker)[0].rstrip()+'\n'
open('src/dark.css','w').write(fixed+marker+'\n'+'\n'.join(sorted(out))+'\n')
print(len(out),'dark rules')
