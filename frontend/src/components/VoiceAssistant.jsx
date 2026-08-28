import {useEffect,useRef,useState} from 'react';
import {Mic,MicOff,Sparkles,X,CheckCircle2,LoaderCircle,Radio,ArrowRight} from 'lucide-react';
import {api} from '../lib/api';
import {translate as tr} from '../lib/i18n';

const SpeechRecognition=typeof window!=='undefined'&&(window.SpeechRecognition||window.webkitSpeechRecognition);
const speechLang={en:'en-IN',hi:'hi-IN',kn:'kn-IN',te:'te-IN',ta:'ta-IN'};

export default function VoiceAssistant({language,onApply}){
 const [open,setOpen]=useState(false),[listening,setListening]=useState(false),[busy,setBusy]=useState(false),[transcript,setTranscript]=useState(''),[message,setMessage]=useState(''),[liveFill,setLiveFill]=useState(true),[preview,setPreview]=useState({}),[appliedCount,setAppliedCount]=useState(0);
 const recognition=useRef(null); const committed=useRef(''); const timer=useRef(null);
 const applyFields=(fields,text='')=>{if(fields&&Object.keys(fields).length){onApply(fields,text);setPreview(fields);setAppliedCount(Object.keys(fields).length)}};
 const parseNow=async(text)=>{if(!text.trim())return;setBusy(true);setMessage('');try{const result=await api('/api/voice/parse',{method:'POST',body:JSON.stringify({transcript:text,language})});setPreview(result.fields||{});if(liveFill)applyFields(result.fields||{},text);setMessage(result.mode==='LOCAL_FALLBACK'?tr(language,'voiceLocalFallback'):tr(language,liveFill?'voiceLiveApplied':'voiceReadyToApply'));}catch{const local=parseLocally(text);setPreview(local);if(liveFill)applyFields(local,text);setMessage(tr(language,'voiceLocalFallback'));}finally{setBusy(false)}};
 const start=()=>{setMessage('');setTranscript('');committed.current='';setPreview({});setAppliedCount(0);if(!SpeechRecognition){setMessage(tr(language,'voiceUnsupported'));return}const r=new SpeechRecognition();recognition.current=r;r.lang=speechLang[language]||'en-IN';r.interimResults=true;r.continuous=true;r.maxAlternatives=1;r.onstart=()=>setListening(true);r.onend=()=>{setListening(false);if(committed.current.trim())parseNow(committed.current)};r.onerror=()=>{setListening(false);setMessage(tr(language,'voiceError'))};r.onresult=e=>{let interim='';let finalChunk='';for(let i=e.resultIndex;i<e.results.length;i++){const text=e.results[i][0].transcript;if(e.results[i].isFinal)finalChunk+=text+' ';else interim+=text+' '}if(finalChunk)committed.current=(committed.current+' '+finalChunk).trim();const full=(committed.current+' '+interim).trim();setTranscript(full);if(liveFill&&full){clearTimeout(timer.current);timer.current=setTimeout(()=>parseNow(full),700)}};try{r.start()}catch{setListening(false);setMessage(tr(language,'voiceError'))}};
 const stop=()=>{clearTimeout(timer.current);recognition.current?.stop()};
 const manualApply=()=>{if(Object.keys(preview).length)applyFields(preview,transcript);else parseNow(transcript)};
 useEffect(()=>()=>{clearTimeout(timer.current);recognition.current?.stop()},[]);
 const samples=[tr(language,'voiceSampleOne'),tr(language,'voiceSampleTwo'),tr(language,'voiceSampleThree')];
 return <>
  <button type="button" className="voice-fab" onClick={()=>setOpen(true)}><Mic size={17}/><span>{tr(language,'voiceAssistant')}</span></button>
  {open&&<div className="voice-backdrop" onMouseDown={e=>e.target===e.currentTarget&&setOpen(false)}><div className="voice-panel" role="dialog" aria-modal="true">
   <button className="icon-btn close" onClick={()=>{stop();setOpen(false)}} aria-label={tr(language,'close')}><X/></button>
   <div className="voice-kicker"><span className="eyebrow"><Sparkles size={15}/> FIELD VOICE ASSISTANT</span><span className="voice-live-state"><Radio size={12}/> {listening?tr(language,'listening'):tr(language,'ready')}</span></div>
   <h2>{tr(language,'voiceTitle')}</h2><p>{tr(language,'voiceText')}</p>
   <div className="voice-examples"><span>{tr(language,'saySomething')}</span>{samples.map((x,i)=><button key={i} type="button" onClick={()=>{setTranscript(x);parseNow(x)}}>{x}<ArrowRight size={13}/></button>)}</div>
   <label className="live-fill-toggle"><span><b>{tr(language,'liveFill')}</b><small>{tr(language,'liveFillHint')}</small></span><button type="button" className={'switch '+(liveFill?'on':'')} onClick={()=>setLiveFill(v=>!v)} aria-pressed={liveFill}><i/></button></label>
   <div className={'voice-orb '+(listening?'listening':'')}><Mic size={34}/></div>
   <button type="button" className="primary wide voice-listen" onClick={listening?stop:start}>{listening?<><MicOff size={17}/>{tr(language,'stopListening')}</>:<><Mic size={17}/>{tr(language,'startListening')}</>}</button>
   <div className="transcript-box"><div className="transcript-head"><span>{tr(language,'voiceTranscript')}</span>{appliedCount>0&&<b>✓ {appliedCount} {tr(language,'fieldsUpdating')}</b>}</div><p>{transcript||tr(language,'voicePlaceholder')}</p></div>
   {Object.keys(preview).length>0&&<div className="voice-preview"><strong>{tr(language,'voiceExtracted')}</strong>{Object.entries(preview).filter(([k,v])=>v!==''&&v!=null).map(([k,v])=><div key={k}><span>{prettyLabel(k,language)}</span><b>{String(v)}</b></div>)}</div>}
   {message&&<div className="notice">{message}</div>}
   <button type="button" className="secondary wide" disabled={!transcript||busy} onClick={manualApply}>{busy?<><LoaderCircle className="spin" size={16}/>{tr(language,'voiceProcessing')}</>:<><CheckCircle2 size={16}/>{tr(language,'useVoiceData')}</>}</button>
   <small className="voice-note">{tr(language,'voiceNote')}</small>
  </div></div>}
 </>
}

function prettyLabel(k,language){const map={farmName:'farmName',location:'location',crop:'crop',cropStage:'cropStage',acreage:'acreage',temperatureC:'temperature',humidity:'humidity',rainfallMm:'rainfall',windKph:'wind',soilMoisture:'soil',sunlightHours:'sunlight',notes:'observations'};return tr(language,map[k]||k)}
function parseLocally(text){const out={};const l=text.toLowerCase();const m=(r,k)=>{const x=l.match(r);if(x)out[k]=x[1].trim()};m(/(?:my\s+)?farm(?:\s+name)?\s+(?:is|called)\s+(.+?)(?=,|\s+in\s+|\s+and\s+(?:i|the)|$)/,'farmName');m(/(?:located\s+in|location\s+is|based\s+in)\s+(.+?)(?=,|\s+and\s+|\s+crop|$)/,'location');m(/(?:crop|growing|grow)\s+(?:is|are|tomatoes?\s+are)?\s*([a-z]+)(?=,|\s+and\s+|\s+at\s+|\s+in\s+|$)/,'crop');m(/(?:temperature|temp)\s*(?:is|of|around)?\s*(-?\d+(?:\.\d+)?)/,'temperatureC');m(/humidity\s*(?:is|of|around)?\s*(\d+(?:\.\d+)?)/,'humidity');m(/(?:rainfall|rain)\s*(?:is|of|around)?\s*(\d+(?:\.\d+)?)/,'rainfallMm');return out}
