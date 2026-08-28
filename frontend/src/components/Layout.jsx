import {useState} from 'react';
import {Leaf,History,Settings,HelpCircle,LogOut,Sprout,BookOpen,Menu,X,UserRound} from 'lucide-react';
import {supabase} from '../lib/supabase';
import SettingsModal from './SettingsModal';
import SiteFooter from './SiteFooter';
import ProfileModal from './ProfileModal';
import {translate as tr} from '../lib/i18n';

export default function Layout({children,user,onNavigate,page,language,onLanguage,onTutorial,onUserUpdate}){
 const [settings,setSettings]=useState(false),[profile,setProfile]=useState(false),[mobileOpen,setMobileOpen]=useState(false);
 const logout=async()=>{await supabase?.auth.signOut()};
 const closeMobile=()=>setMobileOpen(false);
 const name=user?.user_metadata?.full_name||user?.user_metadata?.name||user?.email?.split('@')[0]||'Farmer';
 return <div className="app-shell">
  <header className="topbar"><button className="mobile-menu-btn icon-btn" onClick={()=>setMobileOpen(v=>!v)} aria-label={mobileOpen?tr(language,'close'):tr(language,'menu')}>{mobileOpen?<X size={19}/>:<Menu size={19}/>}</button>
   <div className="brand"><div className="brand-mark"><Leaf/></div><div><b>Climate Aware</b><span>AGRICULTURE ASSISTANT</span></div></div>
   <div className="top-date">FIELD DAY · {new Date().toLocaleDateString(language==='en'?'en-IN':language,{weekday:'long',month:'short',day:'numeric'}).toUpperCase()}</div>
   <div className="user-tools"><button className="user-pill profile-pill" onClick={()=>setProfile(true)} title={tr(language,'profile')}><span className="avatar-mini"><UserRound size={12}/></span> {name}<i/></button><button className="icon-btn" title={tr(language,'settings')} onClick={()=>setSettings(true)}><Settings size={17}/></button><button className="icon-btn desktop-help" title={tr(language,'help')} onClick={onTutorial}><HelpCircle size={17}/></button><button className="icon-btn" title={tr(language,'signOut')} onClick={logout}><LogOut size={17}/></button></div>
  </header>
  <div className="workspace">
   {mobileOpen&&<button className="sidebar-overlay" aria-label={tr(language,'close')} onClick={closeMobile}/>} 
   <aside className={'sidebar '+(mobileOpen?'mobile-open':'')}>
    <div className="sidebar-top"><span className="side-label">YOUR FIELDSPACE</span><button className="sidebar-collapse" onClick={()=>document.body.classList.toggle('sidebar-collapsed')} aria-label={tr(language,'collapseSidebar')}><span/></button></div>
    <button className={page==='home'?'side-link active':'side-link'} onClick={()=>{onNavigate('home');closeMobile()}}><Sprout size={17}/><span className="side-text">{tr(language,'farmReport')}</span><b>›</b></button>
    <button className={page==='history'?'side-link active':'side-link'} onClick={()=>{onNavigate('history');closeMobile()}}><History size={17}/><span className="side-text">{tr(language,'history')}</span><b>›</b></button>
    <button className="side-link" onClick={()=>{onTutorial();closeMobile()}}><BookOpen size={17}/><span className="side-text">{tr(language,'tutorial')}</span><b>›</b></button>
    <div className="field-note"><span>CLIMATE READINESS</span><strong>AI + FIELD DATA</strong><p>Simple readings. Clearer decisions.</p></div>
    <button className="side-link settings-link" onClick={()=>{setSettings(true);closeMobile()}}><Settings size={17}/><span className="side-text">{tr(language,'settings')}</span><b>›</b></button>
    <button className="side-link profile-side" onClick={()=>{setProfile(true);closeMobile()}}><UserRound size={17}/><span className="side-text">{tr(language,'profile')}</span><b>›</b></button>
   </aside>
   <main className="workspace-main"><div className="workspace-content">{children}</div><SiteFooter language={language}/></main>
  </div>
  <SettingsModal open={settings} onClose={()=>setSettings(false)} language={language} onLanguage={onLanguage} onTutorial={onTutorial} onProfile={()=>{setSettings(false);setProfile(true)}}/>
  <ProfileModal open={profile} onClose={()=>setProfile(false)} user={user} language={language} onSaved={onUserUpdate}/>
 </div>
}
