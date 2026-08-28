import {useState,useEffect,useRef} from 'react';
import {ChevronDown,Check,Globe2} from 'lucide-react';
import {languages,translate as tr} from '../lib/i18n';
export default function LanguagePicker({language,onLanguage,compact=false}){
 const [open,setOpen]=useState(false); const ref=useRef(null);
 useEffect(()=>{const h=e=>{if(ref.current&&!ref.current.contains(e.target))setOpen(false)};document.addEventListener('mousedown',h);return()=>document.removeEventListener('mousedown',h)},[]);
 const current=languages.find(x=>x.code===language)||languages[0];
 return <div className={'language-picker '+(compact?'compact':'')} ref={ref}>
  <button type="button" className="language-button" onClick={()=>setOpen(v=>!v)} aria-haspopup="listbox" aria-expanded={open}><Globe2 size={15}/><span>{current.label}</span><ChevronDown size={14}/></button>
  {open&&<div className="language-menu" role="listbox" aria-label={tr(language,'language')}>
   {languages.map(item=><button type="button" role="option" aria-selected={item.code===language} className={item.code===language?'selected':''} key={item.code} onClick={()=>{onLanguage(item.code);setOpen(false)}}><span>{item.label}</span>{item.code===language&&<Check size={15}/>}</button>)}
  </div>}
 </div>
}
