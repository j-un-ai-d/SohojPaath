import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Upload, Brain, Gamepad2, AlertTriangle, CheckCircle2,
  Loader2, ChevronRight, Trophy, RefreshCw, Clock, ArrowRight, Target, Layers, ScanLine, Music, Eye, ScanSearch, PlayCircle, PenLine, Rocket,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { ScreeningResult } from '../types';

// ── constants
const ROUNDS        = 10;
const T_LETTER      = 2500;
const T_WORD        = 3500;
const T_MIRROR      = 3000;
const T_RHYME       = 4000;
const T_ODD         = 4000;
const FEEDBACK_MS   = 750;
const API           = 'http://localhost:5000';
const LETTERS       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

// ── types
interface RoundResult {
  wrongClicks: number; reactionMs: number; missed: boolean;
  score: number; accuracy: number; missRate: number;
}
interface WordItem  { before:string; after:string; allCorrect:string[]; options:string[]; label:string; }
interface MirrorItem { shown:string; correct:string; distractors:string[]; hint:string; }
interface RhymeItem { word:string; rhymes:string; notRhymes:string[]; }
interface OddItem   { group:string[]; odd:string; }
interface GameApiResult { risk_level:'LOW'|'MEDIUM'|'HIGH'; probability:number; }
interface HwApiResult   { risk_level:'LOW'|'MEDIUM'|'HIGH'; predicted_class:string; confidence:number; }
type FB     = 'correct'|'timeout'|null;
type GameId = 'g1'|'g2'|'g3'|'g4'|'g5';
type Screen =
  'track_select'|'age_input'|
  'g1_intro'|'g1_play'|'g1_done'|
  'g2_intro'|'g2_play'|'g2_done'|
  'g3_intro'|'g3_play'|'g3_done'|
  'g4_intro'|'g4_play'|'g4_done'|
  'g5_intro'|'g5_play'|'g5_done'|
  'submitting'|'results'|'game_error'|'hw_upload';

// ── word bank — options fixed per item, never shuffled in JSX
const WORD_BANK: WordItem[] = [
  { before:'D', after:'G', allCorrect:['I','O','U'], options:['I','O','U','E'], label:'D_G' },
  { before:'C', after:'T', allCorrect:['A','O','U'], options:['A','O','U','I'], label:'C_T' },
  { before:'B', after:'G', allCorrect:['A','I','O','U'], options:['A','I','O','U'], label:'B_G' },
  { before:'H', after:'T', allCorrect:['A','I','O','U'], options:['A','I','O','U'], label:'H_T' },
  { before:'R', after:'N', allCorrect:['A','U'], options:['A','U','I','O'], label:'R_N' },
  { before:'S', after:'N', allCorrect:['U','A','O','I'], options:['U','A','O','I'], label:'S_N' },
  { before:'B', after:'X', allCorrect:['O'], options:['O','A','I','U'], label:'B_X' },
  { before:'C', after:'P', allCorrect:['A','O','U'], options:['A','O','U','I'], label:'C_P' },
  { before:'L', after:'G', allCorrect:['A','E','O','U'], options:['A','E','O','U'], label:'L_G' },
  { before:'B', after:'D', allCorrect:['A','E','I','O'], options:['A','E','I','O'], label:'B_D' },
  { before:'T', after:'P', allCorrect:['A','I','O'], options:['A','I','O','U'], label:'T_P' },
  { before:'P', after:'N', allCorrect:['A','I','U'], options:['A','I','U','O'], label:'P_N' },
  { before:'W', after:'N', allCorrect:['A','I','O'], options:['A','I','O','U'], label:'W_N' },
  { before:'F', after:'N', allCorrect:['A','I','U'], options:['A','I','U','O'], label:'F_N' },
  { before:'M', after:'P', allCorrect:['A','O'], options:['A','O','I','U'], label:'M_P' },
];

// ── mirror bank
const MIRROR_BANK: MirrorItem[] = [
  {shown:'b',correct:'b',distractors:['d','p','q'],hint:'Which letter is this?'},
  {shown:'d',correct:'d',distractors:['b','p','q'],hint:'Which letter is this?'},
  {shown:'p',correct:'p',distractors:['q','b','d'],hint:'Which letter is this?'},
  {shown:'q',correct:'q',distractors:['p','b','d'],hint:'Which letter is this?'},
  {shown:'n',correct:'n',distractors:['u','m','h'],hint:'Which letter is this?'},
  {shown:'u',correct:'u',distractors:['n','w','m'],hint:'Which letter is this?'},
  {shown:'w',correct:'w',distractors:['m','u','v'],hint:'Which letter is this?'},
  {shown:'m',correct:'m',distractors:['w','n','u'],hint:'Which letter is this?'},
  {shown:'6',correct:'6',distractors:['9','b','d'],hint:'Which number is this?'},
  {shown:'9',correct:'9',distractors:['6','p','q'],hint:'Which number is this?'},
  {shown:'b',correct:'b',distractors:['d','q','p'],hint:'Which letter is this?'},
];

// ── rhyme bank
const RHYME_BANK: RhymeItem[] = [
  {word:'CAT',   rhymes:'HAT',   notRhymes:['BUS','RUN','PIG']},
  {word:'DOG',   rhymes:'LOG',   notRhymes:['CAT','MAP','SUN']},
  {word:'SUN',   rhymes:'RUN',   notRhymes:['CAP','BIG','DOG']},
  {word:'BIG',   rhymes:'PIG',   notRhymes:['HOP','CAT','SUN']},
  {word:'HOP',   rhymes:'TOP',   notRhymes:['RUN','BIG','CAT']},
  {word:'RED',   rhymes:'BED',   notRhymes:['SUN','PIG','HOP']},
  {word:'FAT',   rhymes:'BAT',   notRhymes:['LOG','BED','RUN']},
  {word:'FUN',   rhymes:'BUN',   notRhymes:['CAT','HOT','BIG']},
  {word:'HOT',   rhymes:'POT',   notRhymes:['BIG','RUN','CAT']},
  {word:'MAN',   rhymes:'CAN',   notRhymes:['HOT','BIG','RUN']},
  {word:'LET',   rhymes:'PET',   notRhymes:['MAN','HOT','BIG']},
];

// ── odd one out bank
const ODD_BANK: OddItem[] = [
  {group:['CAT','BAT','HAT'],  odd:'SUN'},
  {group:['DOG','LOG','HOG'],  odd:'CAT'},
  {group:['RUN','SUN','BUN'],  odd:'BIG'},
  {group:['BIG','PIG','JIG'],  odd:'HAT'},
  {group:['RED','BED','FED'],  odd:'RUN'},
  {group:['HOT','POT','DOT'],  odd:'PIG'},
  {group:['MAN','CAN','FAN'],  odd:'BED'},
  {group:['LET','PET','MET'],  odd:'DOG'},
  {group:['HOP','TOP','MOP'],  odd:'SUN'},
  {group:['FAT','BAT','MAT'],  odd:'LOG'},
  {group:['FUN','BUN','SUN'],  odd:'HAT'},
];

// ── helpers
function shuffle<T>(a: T[]): T[] {
  const b=[...a]; for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];} return b;
}
function calcScore(ms:number,limit:number,wc:number){return Math.max(0,Math.round(20*(1-Math.min(1,ms/limit)))-wc*3);}
function buildVec(age:number,gender:number,nativeLang:number,otherLang:number,...groups:RoundResult[][]){
  // feature order matches Dyt-desktop.csv column layout
  const vec=new Array(196).fill(0);
  vec[0]=gender;      // 1=Male 0=Female
  vec[1]=nativeLang;  // 1=Yes  0=No
  vec[2]=otherLang;   // 1=Yes  0=No
  vec[3]=age;
  groups.forEach((rounds,gameIdx)=>{
    if(!rounds.length)return;
    const base=4+gameIdx*6;
    if(base+5>=196)return;
    let hits=0,misses=0,score=0;
    rounds.forEach(r=>{
      hits   += r.accuracy===100?1:0;   // correct round = 1 hit
      misses += r.wrongClicks;
      score  += r.score;
    });
    const clicks  = hits+misses;
    const accuracy  = clicks>0?hits/clicks:0;    // 0‒1 as in CSV
    const missRate  = clicks>0?misses/clicks:0;  // 0‒1 as in CSV
    vec[base]  =clicks;
    vec[base+1]=hits;
    vec[base+2]=misses;
    vec[base+3]=score;
    vec[base+4]=accuracy;
    vec[base+5]=missRate;
  });
  return vec;
}
const riskColor=(l:string)=>l==='HIGH'?'text-red-500':l==='MEDIUM'?'text-amber-500':'text-emerald-500';
const riskBg=(l:string)=>l==='HIGH'?'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800':l==='MEDIUM'?'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800':'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800';

// ══════════════════════════════════════════════════════════════════════════════
interface DyslexiaScreeningProps {
  onScreeningComplete?: (result: ScreeningResult) => void;
}

export default function DyslexiaScreening({ onScreeningComplete }: DyslexiaScreeningProps) {

  // ── core state
  const [screen,    setScreen]    = useState<Screen>('track_select');
  const [age,       setAge]       = useState(12);
  const [gender,    setGender]    = useState<number|null>(null);
  const [nativeLang,setNativeLang]= useState<number|null>(null);
  const [otherLang, setOtherLang] = useState<number|null>(null);
  const [game,      setGame]      = useState<GameId>('g1');
  const [roundIdx,  setRoundIdx]  = useState(0);
  const [roundKey,  setRoundKey]  = useState(0);
  const [timeLeft,  setTimeLeft]  = useState(T_LETTER);
  const [fb,        setFb]        = useState<FB>(null);
  const [wFlash,    setWFlash]    = useState<string|null>(null);
  const [cFlash,    setCFlash]    = useState<string|null>(null);

  // ── results
  const [res1,setRes1]=useState<RoundResult[]>([]);
  const [res2,setRes2]=useState<RoundResult[]>([]);
  const [res3,setRes3]=useState<RoundResult[]>([]);
  const [res4,setRes4]=useState<RoundResult[]>([]);
  const [res5,setRes5]=useState<RoundResult[]>([]);
  const r1=useRef<RoundResult[]>([]);
  const r2=useRef<RoundResult[]>([]);
  const r3=useRef<RoundResult[]>([]);
  const r4=useRef<RoundResult[]>([]);
  const r5=useRef<RoundResult[]>([]);

  // ── round content
  const [lRound, setLRound] = useState<{target:string;options:string[]}|null>(null);
  const [wRound, setWRound] = useState<{item:WordItem;options:string[]}|null>(null);   // options stored in state — NOT shuffled in JSX
  const [mRound, setMRound] = useState<{item:MirrorItem;options:string[]}|null>(null);
  const [rhRound,setRhRound]= useState<{item:RhymeItem;options:string[];correct:string}|null>(null);
  const [oRound, setORound] = useState<{item:OddItem;options:string[]}|null>(null);

  // ── banks (shuffled once per game)
  const wBank  = useRef<WordItem[]>(shuffle(WORD_BANK));
  const mBank  = useRef<MirrorItem[]>(shuffle(MIRROR_BANK));
  const rhBank = useRef<RhymeItem[]>(shuffle(RHYME_BANK));
  const oBank  = useRef<OddItem[]>(shuffle(ODD_BANK));

  // ── misc refs
  const wrongRef    = useRef(0);
  const startRef    = useRef(0);
  const doneRef     = useRef(false);
  const submitting  = useRef(false);  // prevent double submit

  // ── Track B
  const [imgFile,   setImgFile]   = useState<File|null>(null);
  const [imgPrev,   setImgPrev]   = useState<string|null>(null);
  const [hwRes,     setHwRes]     = useState<HwApiResult|null>(null);
  const [hwLoad,    setHwLoad]    = useState(false);
  const [hwErr,     setHwErr]     = useState('');
  const [gameRes,   setGameRes]   = useState<GameApiResult|null>(null);
  const [apiErr,    setApiErr]    = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  // ── round generators (options stored in state, not re-shuffled in JSX)
  const genL = useCallback(()=>{
    const t=LETTERS[Math.floor(Math.random()*LETTERS.length)];
    const pool=shuffle(LETTERS.filter(l=>l!==t));
    setLRound({target:t, options:shuffle([t,...pool.slice(0,3)])});
  },[]);

  const genW = useCallback((idx:number)=>{
    const item=wBank.current[idx%wBank.current.length];
    // shuffle into state here, not in JSX
    setWRound({item, options:shuffle(item.options)});
  },[]);

  const genM = useCallback((idx:number)=>{
    const item=mBank.current[idx%mBank.current.length];
    setMRound({item, options:shuffle([item.correct,...item.distractors])});
  },[]);

  const genRh = useCallback((idx:number)=>{
    const item=rhBank.current[idx%rhBank.current.length];
    const distractors=shuffle(item.notRhymes).slice(0,3);
    const opts=shuffle([item.rhymes,...distractors]);
    setRhRound({item, options:opts, correct:item.rhymes});
  },[]);

  const genO = useCallback((idx:number)=>{
    const item=oBank.current[idx%oBank.current.length];
    setORound({item, options:shuffle([...item.group, item.odd])});
  },[]);

  // ── record result
  const timeLimit=useCallback(()=>{
    if(game==='g1')return T_LETTER;
    if(game==='g2')return T_WORD;
    if(game==='g3')return T_MIRROR;
    if(game==='g4')return T_RHYME;
    return T_ODD;
  },[game]);

  const recordRound=useCallback((correct:boolean,missed:boolean,ms:number)=>{
    const wc=wrongRef.current; const tl=timeLimit();
    const row:RoundResult={
      wrongClicks:wc, reactionMs:missed?tl:ms, missed,
      score:correct?calcScore(ms,tl,wc):0,
      accuracy:correct?100:0, missRate:missed?1/(wc+1):0,
    };
    if(game==='g1'){r1.current=[...r1.current,row];setRes1([...r1.current]);}
    else if(game==='g2'){r2.current=[...r2.current,row];setRes2([...r2.current]);}
    else if(game==='g3'){r3.current=[...r3.current,row];setRes3([...r3.current]);}
    else if(game==='g4'){r4.current=[...r4.current,row];setRes4([...r4.current]);}
    else{r5.current=[...r5.current,row];setRes5([...r5.current]);}
  },[game,timeLimit]);

  // ── submit
  const submitToApi=useCallback(async()=>{
    if(submitting.current)return;
    submitting.current=true;
    setScreen('submitting');
    const vec=buildVec(age,gender,nativeLang,otherLang,r1.current,r2.current,r3.current,r4.current,r5.current);
    try{
      const res=await fetch(`${API}/predict/games`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({scores:vec})});
      if(!res.ok){
        const errData=await res.json().catch(()=>({}));
        throw new Error(`server_error:${errData.error||`Server returned ${res.status} — check your terminal for details`}`);
      }
      const data:GameApiResult=await res.json();
      setGameRes(data);
      setScreen('results');
      onScreeningComplete?.({
        id: Date.now().toString(),
        timestamp: Date.now(),
        track: 'A',
        riskLevel: data.risk_level,
        probability: data.probability,
      });
    }catch(e:any){
      const isServerError=typeof e.message==='string'&&e.message.startsWith('server_error:');
      setApiErr(
        isServerError
          ? e.message.replace('server_error:','')
          : 'Could not reach the Flask API. Make sure dyslexia_api.py is running on port 5000.'
      );
      setScreen('game_error');
    }finally{ submitting.current=false; }
  },[age, gender, nativeLang, otherLang, onScreeningComplete]);

  // ── advance round
  const nextScreen=useCallback(()=>{
    if(game==='g1')setScreen('g1_done');
    else if(game==='g2')setScreen('g2_done');
    else if(game==='g3')setScreen('g3_done');
    else if(game==='g4')setScreen('g4_done');
    else setScreen('g5_done');
  },[game]);

  const nextGen=useCallback((idx:number)=>{
    if(game==='g1')genL();
    else if(game==='g2')genW(idx);
    else if(game==='g3')genM(idx);
    else if(game==='g4')genRh(idx);
    else genO(idx);
  },[game,genL,genW,genM,genRh,genO]);

  const advance=useCallback((correct:boolean,missed:boolean,ms:number)=>{
    if(doneRef.current)return;
    doneRef.current=true;
    recordRound(correct,missed,ms);
    setFb(missed?'timeout':'correct');
    setTimeout(()=>{
      setFb(null);
      const next=roundIdx+1;
      if(next>=ROUNDS){nextScreen();}
      else{setRoundIdx(next);setRoundKey(k=>k+1);nextGen(next);}
    },FEEDBACK_MS);
  },[roundIdx,recordRound,nextScreen,nextGen]);

  // ── timer
  const playScreen=useCallback(()=>{
    if(game==='g1')return 'g1_play';
    if(game==='g2')return 'g2_play';
    if(game==='g3')return 'g3_play';
    if(game==='g4')return 'g4_play';
    return 'g5_play';
  },[game]);

  useEffect(()=>{
    const ps=playScreen();
    if(screen!==ps)return;
    const tl=timeLimit();
    wrongRef.current=0; startRef.current=Date.now();
    doneRef.current=false; setTimeLeft(tl);
    const tick=setInterval(()=>setTimeLeft(t=>Math.max(0,t-50)),50);
    const dead=setTimeout(()=>{
      clearInterval(tick);
      if(!doneRef.current){
        doneRef.current=true;
        recordRound(false,true,tl); setFb('timeout');
        setTimeout(()=>{
          setFb(null);
          const next=roundIdx+1;
          if(next>=ROUNDS){nextScreen();}
          else{setRoundIdx(next);setRoundKey(k=>k+1);nextGen(next);}
        },FEEDBACK_MS);
      }
    },tl);
    return()=>{clearInterval(tick);clearTimeout(dead);};
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[roundKey,screen]);

  // ── start / play more
  const startG=(gId:GameId,ref:React.MutableRefObject<RoundResult[]>,setter:React.Dispatch<React.SetStateAction<RoundResult[]>>,gen:(i:number)=>void)=>{
    ref.current=[];setter([]);
    setRoundIdx(0);setRoundKey(k=>k+1);setGame(gId);gen(0);
    setScreen(`${gId}_play` as Screen);
  };

  const playMoreG=(gId:GameId,ref:React.MutableRefObject<RoundResult[]>,gen:(i:number)=>void)=>{
    setRoundIdx(0);setRoundKey(k=>k+1);setGame(gId);gen(0);
    setScreen(`${gId}_play` as Screen);
  };

  // ── click handlers
  const onPick=useCallback((picked:string,correct:string|string[])=>{
    if(doneRef.current||fb!==null)return;
    const ok=Array.isArray(correct)?correct.includes(picked):picked===correct;
    if(ok){setCFlash(picked);setTimeout(()=>setCFlash(null),300);advance(true,false,Date.now()-startRef.current);}
    else{wrongRef.current++;setWFlash(picked);setTimeout(()=>setWFlash(null),280);}
  },[fb,advance]);

  // ── Track B
  const onFile=(e:React.ChangeEvent<HTMLInputElement>)=>{
    const f=e.target.files?.[0];if(!f)return;
    setImgFile(f);setHwRes(null);setHwErr('');
    const rd=new FileReader();rd.onload=()=>setImgPrev(rd.result as string);rd.readAsDataURL(f);
  };
  const onHw=async()=>{
    if(!imgFile||hwLoad)return;
    setHwLoad(true);setHwErr('');setHwRes(null);
    const fd=new FormData();fd.append('image',imgFile);
    try{
      const res=await fetch(`${API}/predict/handwriting`,{method:'POST',body:fd});
      if(!res.ok){
        const errData=await res.json().catch(()=>({}));
        setHwErr(errData.error||`Server returned ${res.status} — check your terminal for details`);
        return;
      }
      const result:HwApiResult=await res.json();
      setHwRes(result);
      onScreeningComplete?.({
        id: Date.now().toString(),
        timestamp: Date.now(),
        track: 'B',
        riskLevel: result.risk_level,
        predictedClass: result.predicted_class,
        confidence: result.confidence,
      });
    }catch(e:any){
      const isNetworkError=e instanceof TypeError;
      setHwErr(
        isNetworkError
          ? 'Could not reach the Flask API. Make sure dyslexia_api.py is running on port 5000.'
          : `Server error — check your terminal for details`
      );
    }finally{setHwLoad(false);}
  };

  // ── computed
  const tl=timeLimit();
  const pct=timeLeft/tl;
  const acc=(arr:RoundResult[])=>arr.length?Math.round(arr.filter(r=>r.accuracy===100).length/arr.length*100):0;
  const rt=(arr:RoundResult[])=>{const a=arr.filter(r=>!r.missed);return a.length?Math.round(a.reduce((s,r)=>s+r.reactionMs,0)/a.length):0;};
  const total=r1.current.length+r2.current.length+r3.current.length+r4.current.length+r5.current.length;

  // ── UI helpers
  const CARD='bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-black/5 dark:border-white/10 p-8 relative overflow-hidden';
  const timerColor=pct>0.5?'bg-primary':pct>0.25?'bg-amber-400':'bg-red-400';

  const optBtn=(letter:string,correct:string|string[])=>cn(
    'py-6 rounded-2xl text-4xl font-display font-black select-none transition-all duration-150 border-2',
    fb==='correct'&&(Array.isArray(correct)?correct.includes(letter):letter===correct)
      ?'bg-emerald-500 text-white ring-4 ring-emerald-300 ring-offset-2 shadow-lg border-emerald-500'
      :fb==='timeout'
      ?'bg-slate-100 dark:bg-slate-700/50 text-slate-300 dark:text-slate-600 cursor-not-allowed border-transparent'
      :cFlash===letter
      ?'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 border-emerald-400 shadow-md'
      :wFlash===letter
      ?'bg-red-50 dark:bg-red-900/20 text-red-500 border-red-200 dark:border-red-700 scale-95'
      :'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-primary/10 hover:text-primary border-transparent active:scale-95'
  );

  const wordOptBtn=(letter:string,allCorrect:string[])=>cn(
    'py-6 rounded-2xl text-4xl font-display font-black select-none transition-all duration-150 border-2',
    fb==='correct'&&allCorrect.includes(letter)
      ?'bg-emerald-500 text-white ring-4 ring-emerald-300 ring-offset-2 shadow-lg border-emerald-500'
      :fb==='timeout'
      ?'bg-slate-100 dark:bg-slate-700/50 text-slate-300 dark:text-slate-600 cursor-not-allowed border-transparent'
      :cFlash===letter
      ?'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 border-emerald-400 shadow-md'
      :wFlash===letter
      ?'bg-red-50 dark:bg-red-900/20 text-red-500 border-red-200 dark:border-red-700 scale-95'
      :'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-primary/10 hover:text-primary border-transparent active:scale-95'
  );

  const fbOverlay=(key:string)=>(
    <div className="flex justify-center items-center h-10 mb-2">
      <AnimatePresence>
        {fb==='correct'&&(
          <motion.div key={`ok${key}`} initial={{opacity:0,scale:0.5}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.8}}>
            <div className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg">
              ✓ Correct!
            </div>
          </motion.div>
        )}
        {fb==='timeout'&&(
          <motion.div key={`to${key}`} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
            <div className="flex items-center gap-2 bg-slate-700 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg">
              ⏱ Time's up
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const hdr=(label:string)=>(
    <div className="flex items-center justify-between mb-5">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">{label}</p>
        <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mt-0.5">Round <span className="text-primary">{roundIdx+1}</span> / {ROUNDS}</p>
      </div>
      <div className="flex items-center gap-1.5 text-slate-400 text-sm font-mono"><Clock size={13}/>{(timeLeft/1000).toFixed(1)}s</div>
    </div>
  );

  const tBar=(
    <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mb-8">
      <div className={cn('h-full rounded-full transition-all',timerColor)} style={{width:`${pct*100}%`}}/>
    </div>
  );

  const doneCard=(gNum:number,icon:React.ReactNode,results:RoundResult[],onMore:()=>void,onNext:()=>void,nextLabel:string)=>(
    <motion.div key={`g${gNum}done`} initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} exit={{opacity:0}} className={`${CARD} text-center`}>
      <div className="mb-6 flex justify-center text-primary">{icon}</div>
      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Game {gNum} Complete!</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{results.length} rounds played — more rounds = more accurate result</p>
      <div className="grid grid-cols-2 gap-4 mb-6 text-left">
        <div className="bg-slate-50 dark:bg-slate-700/40 rounded-2xl p-4"><p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Accuracy</p><p className="text-2xl font-bold text-primary">{acc(results)}%</p></div>
        <div className="bg-slate-50 dark:bg-slate-700/40 rounded-2xl p-4"><p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Avg Response</p><p className="text-2xl font-bold text-primary">{rt(results)}ms</p></div>
      </div>
      <div className="flex flex-col gap-3">
        <button onClick={onMore} className="w-full py-3 border-2 border-primary text-primary font-bold rounded-2xl hover:bg-primary/5 transition-all flex items-center justify-center gap-2"><RefreshCw size={16}/> Play {ROUNDS} more rounds</button>
        <button onClick={onNext} className="w-full py-4 bg-primary text-white font-bold rounded-2xl hover:scale-[1.02] transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2">{nextLabel} <ArrowRight size={17}/></button>
      </div>
    </motion.div>
  );

  const introCard=(gNum:number,title:string,duration:string,steps:string[],example:React.ReactNode,onStart:()=>void,icon:React.ReactNode)=>(
    <motion.div key={`g${gNum}intro`} initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}} exit={{opacity:0}} className={CARD}>
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center font-black text-xl">{gNum}</div>
        <div><h3 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h3><p className="text-xs text-slate-500 dark:text-slate-400">{ROUNDS} rounds · {duration}</p></div>
      </div>
      <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-5 mb-6 space-y-3">
        {steps.map((txt,i)=><div key={i} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400"><span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex-shrink-0 flex items-center justify-center text-xs font-bold">{i+1}</span>{txt}</div>)}
      </div>
      <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl mb-8 text-center border border-black/5 dark:border-white/10">{example}</div>
      <button onClick={onStart} className="w-full py-4 bg-primary text-white font-bold rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/20 text-base"><span className="inline-flex items-center justify-center gap-2">{icon} Start Game {gNum}</span></button>
    </motion.div>
  );

  const resetAll=()=>{
    r1.current=[];r2.current=[];r3.current=[];r4.current=[];r5.current=[];
    setRes1([]);setRes2([]);setRes3([]);setRes4([]);setRes5([]);
    setGameRes(null);setRoundIdx(0);submitting.current=false;
    setScreen('track_select');
  };

  // ══════════════════════════════════════════════════════════════════════════
  return (
    <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white">Dyslexia Screening</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Interactive assessment — choose a track below.</p>
      </div>

      <AnimatePresence mode="wait">

        {/* ── TRACK SELECT ── */}
        {screen==='track_select'&&(
          <motion.div key="ts" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
           <button onClick={()=>setScreen('age_input')} className="p-8 bg-white dark:bg-slate-800 rounded-3xl border border-black/5 dark:border-white/10 shadow-xl transition-all text-left">
              <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6"><Gamepad2 size={28}/></div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Track A — Game Test</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">Play five mini-games. The system automatically tracks reaction time, accuracy, and error patterns across 50 rounds.</p>
              <div className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
                <Rocket size={18} />
                Proceed
              </div>
            </button>
            <button onClick={()=>{setImgFile(null);setImgPrev(null);setHwRes(null);setHwErr('');setScreen('hw_upload');}} className="p-8 bg-white dark:bg-slate-800 rounded-3xl border border-black/5 dark:border-white/10 shadow-xl transition-all text-left">
              <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6"><Brain size={28}/></div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Track B — Handwriting</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">Upload a handwriting photo. The AI checks for letter-reversal patterns linked to dyslexia using a trained CNN model.</p>
              <div className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
                <Rocket size={18} />
                Proceed
              </div>
            </button>
          </motion.div>
        )}

        {/* ── AGE INPUT ── */}
        {screen==='age_input'&&(
          <motion.div key="age" initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}} exit={{opacity:0}} className={CARD}>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Quick Setup</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Enter your age to help calibrate the model.</p>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Age: <span className="text-primary text-base">{age}</span></label>
            <input type="range" min={5} max={18} value={age} onChange={e=>setAge(+e.target.value)} className="w-full accent-primary"/>
            {/* Gender */}
            <div className="mt-5">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Gender</p>
              <div className="flex gap-2">
                {([{label:'Male',v:1},{label:'Female',v:0}] as {label:string,v:number}[]).map(({label,v})=>(
                  <button key={v} onClick={()=>setGender(v)}
                    className={cn("flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-all",
                      gender===v?"border-primary bg-primary/10 text-primary":"border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400")}
                  >{label}</button>
                ))}
              </div>
            </div>
            {/* Native Language */}
            <div className="mt-3">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Is English your native language?</p>
              <div className="flex gap-2">
                {([{label:'Yes',v:1},{label:'No',v:0}] as {label:string,v:number}[]).map(({label,v})=>(
                  <button key={v} onClick={()=>setNativeLang(v)}
                    className={cn("flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-all",
                      nativeLang===v?"border-primary bg-primary/10 text-primary":"border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400")}
                  >{label}</button>
                ))}
              </div>
            </div>
            {/* Other Language */}
            <div className="mt-3">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Do you speak another language?</p>
              <div className="flex gap-2">
                {([{label:'Yes',v:1},{label:'No',v:0}] as {label:string,v:number}[]).map(({label,v})=>(
                  <button key={v} onClick={()=>setOtherLang(v)}
                    className={cn("flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-all",
                      otherLang===v?"border-primary bg-primary/10 text-primary":"border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400")}
                  >{label}</button>
                ))}
              </div>
            </div>

            <div className="flex gap-5 mt-10">
              <button onClick={()=>setScreen('track_select')} className="px-5 py-3 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-white/5 transition-all">Back</button>
              <button
                onClick={()=>setScreen('g1_intro')}
                disabled={gender===null||nativeLang===null||otherLang===null}
                className="flex-1 py-3 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              ><Gamepad2 size={18} />Continue</button>
            </div>
          </motion.div>
        )}

        {/* ══ GAME 1 ══ */}
        {screen==='g1_intro'&&introCard(1,'Game 1 — Letter Tap','~25 sec',
          ['A target letter appears at the top.','Four buttons appear — tap the matching letter.',`You have ${T_LETTER/1000}s per round.`],
          (<><p className="text-xs text-slate-400 mb-2">Find this letter</p><span className="text-6xl font-display font-black text-primary">A</span><p className="text-xs text-slate-400 mt-2">→ tap <strong>A</strong> from the choices</p></>),
          ()=>startG('g1',r1,setRes1,genL),<Target size={28}/>
        )}
        {screen==='g1_play'&&lRound&&(
          <motion.div key={`g1p${roundKey}`} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className={CARD}>
            {hdr('Game 1 — Letter Tap')}{tBar}
            {fbOverlay('g1')}
            <div className="text-center mb-8">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Find this letter</p>
              <motion.div key={lRound.target} initial={{scale:0.5,opacity:0}} animate={{scale:1,opacity:1}} transition={{type:'spring',stiffness:400,damping:20}} className="inline-flex w-28 h-28 items-center justify-center bg-primary/10 dark:bg-primary/20 rounded-3xl shadow-inner">
                <span className="text-6xl font-display font-black text-primary select-none">{lRound.target}</span>
              </motion.div>
            </div>
            <div className="grid grid-cols-2 gap-4">{lRound.options.map(l=><button key={l} onClick={()=>onPick(l,lRound.target)} disabled={fb!==null} className={optBtn(l,lRound.target)}>{l}</button>)}</div>
            
          </motion.div>
        )}
        {screen==='g1_done'&&doneCard(1,<Target size={40}/>,res1,()=>playMoreG('g1',r1,genL),()=>setScreen('g2_intro'),'Continue to Game 2')}

        {/* ══ GAME 2 ══ */}
        {screen==='g2_intro'&&introCard(2,'Game 2 — Word Builder','~35 sec',
          ['A 3-letter word appears with the middle letter missing.','Tap any letter that makes a real English word.','Multiple correct answers are accepted!',`You have ${T_WORD/1000}s per round.`],
          (<><p className="text-xs text-slate-400 mb-2">Example — D _ G</p><div className="flex items-center justify-center gap-3"><span className="text-4xl font-display font-black text-slate-900 dark:text-white">D</span><span className="inline-flex flex-col items-center justify-end min-w-[2rem] h-[3rem] pb-1"><span className="block w-7 h-0.5 bg-primary rounded-full opacity-70" /></span><span className="text-4xl font-display font-black text-slate-900 dark:text-white">G</span></div><p className="text-xs text-slate-400 mt-2">→ O (DOG), I (DIG) or U (DUG) — all correct!</p></>),
          ()=>startG('g2',r2,setRes2,genW),<Layers size={28}/>
        )}
        {screen==='g2_play'&&wRound&&(
          <motion.div key={`g2p${roundKey}`} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className={CARD}>
            {hdr('Game 2 — Word Builder')}{tBar}
            {fbOverlay('g2')}
            <div className="text-center mb-6">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Complete the word</p>
              <p className="text-xs text-slate-400 mb-4">Any letter making a real word is correct ✓</p>
              <motion.div key={wRound.item.label} initial={{scale:0.7,opacity:0}} animate={{scale:1,opacity:1}} transition={{type:'spring',stiffness:400,damping:22}} className="flex items-center justify-center gap-4">
                <span className="text-6xl font-display font-black text-slate-900 dark:text-white">{wRound.item.before}</span>
                <span className="inline-flex flex-col items-center justify-end min-w-[3rem] h-[4.5rem] pb-2">
                  <span className="block w-10 h-1 bg-primary rounded-full opacity-70" />
                </span>
                <span className="text-6xl font-display font-black text-slate-900 dark:text-white">{wRound.item.after}</span>
              </motion.div>
            </div>
            <div className="grid grid-cols-2 gap-4">{wRound.options.map(l=><button key={l} onClick={()=>onPick(l,wRound.item.allCorrect)} disabled={fb!==null} className={wordOptBtn(l,wRound.item.allCorrect)}>{l}</button>)}</div>
            
          </motion.div>
        )}
        {screen==='g2_done'&&doneCard(2,<Layers size={40}/>,res2,()=>playMoreG('g2',r2,genW),()=>setScreen('g3_intro'),'Continue to Game 3')}

        {/* ══ GAME 3 ══ */}
        {screen==='g3_intro'&&introCard(3,'Game 3 — Mirror Letters','~30 sec',
          ['A letter or number appears in the centre.','Choose the exact matching letter from four options.','Watch out — b/d and p/q look very similar!',`You have ${T_MIRROR/1000}s per round.`],
          (<><p className="text-xs text-slate-400 mb-2">Which letter is shown?</p><span className="text-6xl font-display font-black text-primary">b</span><p className="text-xs text-slate-400 mt-2">→ tap <strong>b</strong> not d, p or q</p></>),
          ()=>startG('g3',r3,setRes3,genM),<ScanLine size={28}/>
        )}
        {screen==='g3_play'&&mRound&&(
          <motion.div key={`g3p${roundKey}`} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className={CARD}>
            {hdr('Game 3 — Mirror Letters')}{tBar}
            {fbOverlay('g3')}
            <div className="text-center mb-8">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">{mRound.item.hint}</p>
              <motion.div key={mRound.item.shown} initial={{scale:0.5,opacity:0}} animate={{scale:1,opacity:1}} transition={{type:'spring',stiffness:400,damping:20}} className="inline-flex w-32 h-32 items-center justify-center bg-primary/10 dark:bg-primary/20 rounded-3xl shadow-inner">
                <span className="text-7xl font-display font-black text-primary select-none">{mRound.item.shown}</span>
              </motion.div>
            </div>
            <div className="grid grid-cols-2 gap-4">{mRound.options.map(l=><button key={l} onClick={()=>onPick(l,mRound.item.correct)} disabled={fb!==null} className={optBtn(l,mRound.item.correct)}>{l}</button>)}</div>
            
          </motion.div>
        )}
        {screen==='g3_done'&&doneCard(3,<ScanLine size={40}/>,res3,()=>playMoreG('g3',r3,genM),()=>setScreen('g4_intro'),'Continue to Game 4')}

        {/* ══ GAME 4 — RHYME MATCH ══ */}
        {screen==='g4_intro'&&introCard(4,'Game 4 — Rhyme Match','~40 sec',
          ['A word appears at the top.','Choose the word that RHYMES with it.','Only ONE option rhymes — pick carefully!',`You have ${T_RHYME/1000}s per round.`],
          (<><p className="text-xs text-slate-400 mb-2">Which word rhymes with CAT?</p><p className="text-xs text-slate-400 mt-1">→ <strong>HAT</strong> rhymes, DOG/SUN/BIG do not</p></>),
          ()=>startG('g4',r4,setRes4,genRh),<Music size={28}/>
        )}
        {screen==='g4_play'&&rhRound&&(
          <motion.div key={`g4p${roundKey}`} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className={CARD}>
            {hdr('Game 4 — Rhyme Match')}{tBar}
            {fbOverlay('g4')}
            <div className="text-center mb-8">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Which word rhymes with…</p>
              <motion.div key={rhRound.item.word} initial={{scale:0.5,opacity:0}} animate={{scale:1,opacity:1}} transition={{type:'spring',stiffness:400,damping:20}} className="inline-flex px-10 py-5 items-center justify-center bg-primary/10 dark:bg-primary/20 rounded-3xl shadow-inner">
                <span className="text-5xl font-display font-black text-primary select-none">{rhRound.item.word}</span>
              </motion.div>
            </div>
            <div className="grid grid-cols-2 gap-4">{rhRound.options.map(l=><button key={l} onClick={()=>onPick(l,rhRound.correct)} disabled={fb!==null} className={cn(optBtn(l,rhRound.correct),'text-2xl py-5')}>{l}</button>)}</div>
            
          </motion.div>
        )}
        {screen==='g4_done'&&doneCard(4,<Music size={40}/>,res4,()=>playMoreG('g4',r4,genRh),()=>setScreen('g5_intro'),'Continue to Game 5')}

        {/* ══ GAME 5 — ODD ONE OUT ══ */}
        {screen==='g5_intro'&&introCard(5,'Game 5 — Odd One Out','~40 sec',
          ['Four words appear on screen.','Three of them belong together (they rhyme).','Tap the ONE word that does NOT fit.',`You have ${T_ODD/1000}s per round.`],
          (<><p className="text-xs text-slate-400 mb-2">Which word does NOT belong?</p><p className="text-sm font-bold text-slate-700 dark:text-slate-200 mt-1">CAT · HAT · BAT · <span className="text-red-500">DOG</span></p><p className="text-xs text-slate-400 mt-1">→ <strong>DOG</strong> does not rhyme with the others</p></>),
          ()=>startG('g5',r5,setRes5,genO),<Eye size={28}/>
        )}
        {screen==='g5_play'&&oRound&&(
          <motion.div key={`g5p${roundKey}`} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className={CARD}>
            {hdr('Game 5 — Odd One Out')}{tBar}
            {fbOverlay('g5')}
            <div className="text-center mb-8">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Tap the word that does NOT belong</p>
            </div>
            <div className="grid grid-cols-2 gap-4">{oRound.options.map(l=><button key={l} onClick={()=>onPick(l,oRound.item.odd)} disabled={fb!==null} className={cn(optBtn(l,oRound.item.odd),'text-2xl py-5')}>{l}</button>)}</div>
            
          </motion.div>
        )}
        {screen==='g5_done'&&doneCard(5,<Eye size={40}/>,res5,()=>playMoreG('g5',r5,genO),submitToApi,'Get My Result')}

        {/* ── SUBMITTING ── */}
        {screen==='submitting'&&(
          <motion.div key="sub" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className={`${CARD} text-center py-16`}>
            <Loader2 size={52} className="animate-spin text-primary mx-auto mb-6"/>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Analysing your results…</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">{total} rounds of gameplay data sent to the AI model</p>
          </motion.div>
        )}

        {/* ── RESULTS ── */}
        {screen==='results'&&gameRes&&(
          <motion.div key="res" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0}} className={CARD}>
            <div className="flex items-center gap-3 mb-6"><Trophy size={26} className="text-primary"/><h3 className="text-xl font-bold text-slate-900 dark:text-white">Track A Complete</h3></div>
            <div className={cn('p-6 rounded-2xl border mb-6',riskBg(gameRes.risk_level))}>
              <div className={cn('flex items-center gap-2 font-bold text-2xl mb-2',riskColor(gameRes.risk_level))}>
                {gameRes.risk_level==='LOW'?<CheckCircle2 size={26}/>:<AlertTriangle size={26}/>}{gameRes.risk_level} RISK
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300">Dyslexia probability: <strong>{gameRes.probability}%</strong></p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Based on {total} rounds across 5 games</p>
            </div>
            <div className="grid grid-cols-5 gap-2 mb-6">
              {[{l:'G1',v:acc(res1)},{l:'G2',v:acc(res2)},{l:'G3',v:acc(res3)},{l:'G4',v:acc(res4)},{l:'G5',v:acc(res5)}].map(s=>(
                <div key={s.l} className="bg-slate-50 dark:bg-slate-700/40 rounded-2xl p-3 text-center">
                  <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">{s.l}</p>
                  <p className="text-base font-bold text-primary">{s.v}%</p>
                </div>
              ))}
            </div>
            <button onClick={()=>{setImgFile(null);setImgPrev(null);setHwRes(null);setHwErr('');setScreen('hw_upload');}}
              className="w-full py-4 bg-primary text-white font-bold rounded-2xl hover:scale-[1.02] transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 mb-3">
              <Brain size={18}/> Also try Track B — Handwriting Analysis <ArrowRight size={17}/>
            </button>
            <button onClick={resetAll} className="w-full py-3 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-white/5 flex items-center justify-center gap-2 transition-all">
              <RefreshCw size={15}/> Start over
            </button>
          </motion.div>
        )}

        {/* ── GAME ERROR ── */}
        {screen==='game_error'&&(
          <motion.div key="err" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className={CARD}>
            <AlertTriangle size={32} className="text-red-500 mb-4"/>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Connection Error</h3>
            <p className="text-sm text-red-500 mb-6">{apiErr}</p>
            <button onClick={submitToApi} className="w-full py-3 bg-primary text-white font-bold rounded-2xl hover:scale-[1.02] transition-all mb-3">Retry</button>
            <button onClick={()=>setScreen('track_select')} className="w-full py-3 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-white/5 transition-all">Start over</button>
          </motion.div>
        )}

        {/* ── TRACK B ── */}
        {screen==='hw_upload'&&(
          <motion.div key="hw" initial={{opacity:0,x:10}} animate={{opacity:1,x:0}} exit={{opacity:0}} className={CARD}>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Track B — Handwriting Analysis</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Upload a clear photo of handwritten text. The AI checks for reversal patterns.</p>
            <div onClick={()=>fileRef.current?.click()} className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-10 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all">
              {imgPrev?<img src={imgPrev} alt="Preview" className="max-h-52 mx-auto rounded-xl object-contain"/>:(<><Upload size={36} className="mx-auto mb-3 text-slate-400"/><p className="font-semibold text-slate-700 dark:text-slate-300">Click to upload image</p><p className="text-xs text-slate-400 mt-1">PNG, JPG, JPEG supported</p></>)}
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={onFile} className="hidden"/>
            <div className="mt-6">
              {imgFile&&<p className="mb-3 text-xs text-slate-500 dark:text-slate-400 text-center">Selected: {imgFile.name}</p>}
              <div className="flex gap-5">
              <button onClick={()=>setScreen('track_select')} className="px-5 py-3 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-white/5 transition-all">Back</button>
              <button onClick={onHw} disabled={!imgFile||hwLoad}
                className="flex-1 py-3 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {hwLoad?<><Loader2 size={18} className="animate-spin"/> Analysing…</>:<><ScanSearch size={18}/>Analyse Handwriting</>}
              </button>
            </div>
            </div>
            {hwErr&&<p className="mt-4 text-sm text-red-500 text-center">{hwErr}</p>}
            {hwRes&&(
              <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className={cn('mt-6 p-6 rounded-2xl border',riskBg(hwRes.risk_level))}>
                <div className={cn('flex items-center gap-2 font-bold text-lg mb-2',riskColor(hwRes.risk_level))}>
                  {hwRes.risk_level==='LOW'?<CheckCircle2 size={22}/>:<AlertTriangle size={22}/>}{hwRes.risk_level} RISK
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300">Pattern detected: <strong>{hwRes.predicted_class}</strong></p>
                <p className="text-sm text-slate-600 dark:text-slate-300">Confidence: <strong>{hwRes.confidence}%</strong></p>
              </motion.div>
            )}
          </motion.div>
        )}

      </AnimatePresence>

      <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl flex gap-3 items-start">
        <AlertTriangle size={18} className="text-amber-500 flex-shrink-0 mt-0.5"/>
        <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
          <strong>Disclaimer:</strong> This is a screening tool only, not a medical diagnosis. Results are indicative and should be reviewed by a qualified professional.
        </p>
      </div>
    </motion.div>
  );
}
