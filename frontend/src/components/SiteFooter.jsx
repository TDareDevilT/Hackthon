import {useState} from 'react';
import {ShieldCheck,FileText,Sparkles} from 'lucide-react';
import TeamModal from './TeamModal';
import LegalModal from './LegalModal';
import {translate as tr} from '../lib/i18n';
export default function SiteFooter({language='en'}){const [team,setTeam]=useState(false),[legal,setLegal]=useState(null);return <><footer className="site-footer"><div className="footer-left"><span>Built by </span><button className="team-trigger" onClick={()=>setTeam(true)}>Usual Misfits</button></div><div className="footer-links"><button onClick={()=>setLegal('privacy')}><ShieldCheck size={12}/>{tr(language,'privacy')}</button><button onClick={()=>setLegal('terms')}><FileText size={12}/>{tr(language,'terms')}</button><button onClick={()=>setLegal('ai')}><Sparkles size={12}/>{tr(language,'aiTransparency')}</button></div><span className="footer-note">Decision support, not a substitute for local agronomy.</span></footer><TeamModal open={team} onClose={()=>setTeam(false)}/><LegalModal open={!!legal} onClose={()=>setLegal(null)} type={legal||'privacy'} language={language}/></>}
