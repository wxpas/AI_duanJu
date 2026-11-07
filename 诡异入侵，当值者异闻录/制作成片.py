#!/usr/bin/env python3
"""生成三集漫剧和合辑。依赖 pillow、numpy、imageio-ffmpeg。"""
from pathlib import Path
import subprocess, wave
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import imageio_ffmpeg

ROOT = Path(__file__).resolve().parent
A = ROOT / '制作素材'
FONT = A / 'NotoSansCJKsc-Regular.otf'
OUT = ROOT / '成片'
OUT.mkdir(exist_ok=True)
CAP = A / '字幕图'
CAP.mkdir(exist_ok=True)
TMP = Path('/home/user/.cache/duanju-render')
TMP.mkdir(parents=True, exist_ok=True)
ff = imageio_ffmpeg.get_ffmpeg_exe()
shots = [
 ('站厅.png','第1集  错误提示','林澈：姐，走吧。','末班车后，站厅只剩下姐弟二人。'),
 ('站厅.png','第1集  错误提示','林澈：这是什么？','黑潮从地缝涌出，姐弟退向值班室。'),
 ('值班室.png','第1集  错误提示','旁白：桌上多了一张纸。','林照：先别动。'),
 ('纸条.png','第1集  错误提示','纸条：抹去林澈的姓名，','黑潮即退。'),
 ('纸条.png','第2集  名字的代价','林澈写下自己的名字，','试着划掉“澈”字。'),
 ('失忆.png','第2集  名字的代价','林澈：你……认识我吗？','林照补全名字，林澈恢复了记忆。'),
 ('值班室.png','第2集  名字的代价','林照：这是黑潮的陷阱。','纸条上的字渗出黑色。'),
 ('铭牌.png','第2集  名字的代价','铭牌背面：值班员念出全名，','用本人铭牌压住红色按钮直到零点。'),
 ('铭牌.png','第3集  当值者','林澈：姐，小心！','铭牌滑落站厅，黑潮逼近。'),
 ('铭牌.png','第3集  当值者','林澈拉住姐姐，','林照捡起铭牌，两人赶回值班室。'),
 ('按钮.png','第3集  当值者','林照：我是林照。','她压住按钮，零点到来，黑潮退去。'),
 ('结局.png','第3集  当值者','林澈：你还记得我？','林照：记得。你是林澈，我弟弟。'),
]
font=ImageFont.truetype(str(FONT),27)
small=ImageFont.truetype(str(FONT),19)
for i,(pic,ep,line1,line2) in enumerate(shots):
    img=Image.new('RGBA',(540,960),(0,0,0,0)); d=ImageDraw.Draw(img)
    d.rounded_rectangle((20,24,290,60),radius=8,fill=(6,18,28,195))
    d.text((32,28),ep,font=small,fill=(226,239,247,255))
    d.rounded_rectangle((16,790,524,914),radius=14,fill=(5,12,20,200))
    for y,line in [(803,line1),(851,line2)]:
        f=font
        if d.textlength(line,font=f)>480: f=ImageFont.truetype(str(FONT),23)
        width=d.textlength(line,font=f)
        d.text(((540-width)/2,y),line,font=f,fill=(255,255,255,255),stroke_width=1,stroke_fill=(0,0,0,255))
    img.save(CAP/f'{i+1:02d}.png')
    # Independent eight-second animated camera move per scene.
    filt=("[0:v]scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280,"
          "zoompan=z='min(zoom+0.00035,1.08)':x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2':d=1:s=540x960:fps=24,"
          "format=rgba[bg];[bg][1:v]overlay=0:0:shortest=1,format=yuv420p[v]")
    cmd=[ff,'-y','-loglevel','error','-loop','1','-framerate','24','-i',str(A/pic),'-loop','1','-framerate','24','-i',str(CAP/f'{i+1:02d}.png'),'-filter_complex',filt,'-map','[v]','-t','8','-an','-c:v','libx264','-preset','veryfast','-crf','24','-pix_fmt','yuv420p',str(TMP/f'shot{i+1:02d}.mp4')]
    print('Rendering',i+1,flush=True); subprocess.run(cmd,check=True)

# Deterministic synthetic ambient and simple effects, no external music.
sr=22050; dur=96; t=np.arange(sr*dur)/sr
rng=np.random.default_rng(2026)
noise=rng.normal(0,1,len(t)); kernel=np.ones(400)/400
rumble=np.convolve(noise,kernel,mode='same')*.20
hum=.010*np.sin(2*np.pi*54*t)+.006*np.sin(2*np.pi*81*t)
amb=(rumble+hum)*(0.60+0.40*np.clip((t-8)/10,0,1))
amb*=np.where(t<84,1,np.clip((88-t)/4,0,1))
# Tick pulse, low in mix. Last chime at zero.
for sec in range(1,87):
    at=int(sec*sr); n=int(.028*sr); u=np.arange(n)/sr
    amb[at:at+n]+=0.028*np.sin(2*np.pi*1000*u)*np.exp(-u*130)
at=86*sr; n=sr*2; u=np.arange(n)/sr
amb[at:at+n]+=0.09*np.sin(2*np.pi*440*u)*np.exp(-u*2)
amb=np.clip(amb,-1,1)
with wave.open(str(TMP/'ambient.wav'),'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes((amb*32767).astype('<i2').tobytes())

lst=TMP/'concat.txt'
lst.write_text(''.join(f"file '{TMP / f'shot{i:02d}.mp4'}'\n" for i in range(1,13)),encoding='utf8')
subprocess.run([ff,'-y','-loglevel','error','-f','concat','-safe','0','-i',str(lst),'-c','copy',str(TMP/'picture.mp4')],check=True)
# Dialogues start within corresponding eight-second shot; scene 1-2-1 includes its narration and line.
voices=[('a01.wav',1.0),('a02.wav',9.0),('a04.wav',17.0),('a06.wav',41.0),('a07.wav',49.0),('a08.wav',57.0),('a09.wav',65.0),('a11.wav',81.0),('a12a.wav',88.2),('a12b.wav',90.0)]
cmd=[ff,'-y','-loglevel','error','-i',str(TMP/'picture.mp4'),'-i',str(TMP/'ambient.wav')]
for filename,_ in voices: cmd += ['-i',str(A/filename)]
filters=['[1:a]volume=0.75[amb]']
for i,(_,delay) in enumerate(voices): filters.append(f'[{i+2}:a]adelay={int(delay*1000)}:all=1,volume=1.0[v{i}]')
filters.append('[amb]'+''.join(f'[v{i}]' for i in range(len(voices)))+f'amix=inputs={len(voices)+1}:duration=first:dropout_transition=0:normalize=0,alimiter=limit=0.95[a]')
cmd += ['-filter_complex',';'.join(filters),'-map','0:v','-map','[a]','-c:v','copy','-c:a','aac','-b:a','160k','-t','96','-movflags','+faststart',str(OUT/'诡异入侵_三集完整漫剧.mp4')]
print('Mixing',flush=True); subprocess.run(cmd,check=True)
# Split at the fixed 32-second episode boundaries, re-encode for frame-exact playback.
for e in range(3):
    cmd=[ff,'-y','-loglevel','error','-ss',str(e*32),'-i',str(OUT/'诡异入侵_三集完整漫剧.mp4'),'-t','32','-c:v','libx264','-preset','veryfast','-crf','24','-c:a','aac','-b:a','160k','-movflags','+faststart',str(OUT/f'第{e+1}集.mp4')]
    print('Episode',e+1,flush=True); subprocess.run(cmd,check=True)
print('Done', flush=True)
