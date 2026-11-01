import json,subprocess,sys,numpy as np
# usage: python3 render.py  (expects clips/<KEY>.mp4 and <KEY>.mp3 in ..)
T=json.load(open('talk.json'))
ENC=['-c:v','libx264','-crf','15','-preset','fast','-pix_fmt','yuv420p','-an']
def lag(k):
    def env(p):
        a=np.frombuffer(subprocess.run(['ffmpeg','-loglevel','error','-i',p,'-ac','1','-ar','8000','-f','f32le','-'],capture_output=True).stdout,np.float32)
        return np.convolve(np.abs(a),np.ones(80)/80,'same')[::80]
    A=env(f'clips/{k}.mp4');B=env(f'../{k}.mp3');n=min(len(A),len(B))-80
    def r(L):
        return np.corrcoef(A[L:L+n],B[:n])[0,1] if L>=0 else np.corrcoef(A[:n],B[-L:-L+n])[0,1]
    L=max(range(-30,60),key=r); return L/100
lags={k:lag(k) for k in sorted({t['key'] for t in T})}
print('lags',lags,flush=True)
def Z(nf,snap=.10,kb=.04): return f"(1+{snap}*max(0\\,1-n/5)+{kb}*n/{nf})"
for t in T:
    nf=t['nf'];z=t['z'];ss=max(0,t['ss']+lags[t['key']])
    vf=(f"trim=start={ss},setpts=PTS-STARTPTS,scale={round(1080*z/2)*2}:{round(1920*z/2)*2}:flags=lanczos,crop=1080:1920,fps=24,tpad=stop_mode=clone:stop_duration=2,"
        f"scale=w='trunc(1080*{Z(nf)}/2)*2':h='trunc(1920*{Z(nf)}/2)*2':eval=frame:flags=bicubic,crop=1080:1920,unsharp=5:5:0.45,setsar=1")
    subprocess.run(['ffmpeg','-loglevel','error','-y','-i',f"clips/{t['key']}.mp4",'-vf',vf,'-frames:v',str(nf)]+ENC+[t['seg']],check=True)
    print(t['seg'],flush=True)
subprocess.run(['ffmpeg','-loglevel','error','-y','-f','concat','-safe','0','-i','list.txt','-c','copy','nosubs.mp4'],check=True)
subprocess.run(['ffmpeg','-loglevel','error','-y','-i','nosubs.mp4','-i','mix6.wav','-vf','ass=caps6.ass:fontsdir=.','-c:v','libx264','-crf','18','-preset','fast','-pix_fmt','yuv420p','-c:a','aac','-b:a','256k','-shortest','TTThinking_reposteo_v9.mp4'],check=True)
print('DONE')
