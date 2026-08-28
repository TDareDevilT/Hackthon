import {useEffect,useState} from 'react';
import {BrowserRouter} from 'react-router-dom';
import {supabase} from './lib/supabase';
import Layout from './components/Layout';
import Auth from './pages/Auth';
import Home from './pages/Home';
import Report from './pages/Report';
import History from './pages/History';
import Tutorial from './components/Tutorial';
import ResetPassword from './pages/ResetPassword';
import './styles.css';
function App(){
 const [user,setUser]=useState(null),[page,setPage]=useState('home'),[report,setReport]=useState(null),[language,setLanguage]=useState(localStorage.getItem('climate-language')||'en'),[tutorial,setTutorial]=useState(false);
 useEffect(()=>{supabase?.auth.getSession().then(({data})=>{if(data.session?.user)setUser(data.session.user)});const sub=supabase?.auth.onAuthStateChange((_e,s)=>setUser(s?.user||null));return()=>sub?.data.subscription.unsubscribe()},[]);
 useEffect(()=>{localStorage.setItem('climate-language',language)},[language]);
 useEffect(()=>{if(user && !localStorage.getItem('climate-tutorial-done'))setTutorial(true)},[user]);
 if(window.location.pathname==='/reset') return <ResetPassword/>;
 if(!user)return <Auth onAuth={setUser} language={language} onLanguage={setLanguage}/>;
 const nav=p=>{setPage(p);setReport(null)};
 return <><Layout user={user} page={page} onNavigate={nav} language={language} onLanguage={setLanguage} onTutorial={()=>setTutorial(true)} onUserUpdate={setUser}>{report?<Report data={report} onBack={()=>setReport(null)}/>:page==='history'?<History onOpen={setReport} language={language}/>:<Home onReport={setReport} language={language} user={user}/>}</Layout><Tutorial open={tutorial} onClose={()=>setTutorial(false)} language={language}/></>;
}
export default function Root(){return <BrowserRouter><App/></BrowserRouter>}
