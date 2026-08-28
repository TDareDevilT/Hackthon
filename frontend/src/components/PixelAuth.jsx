import {motion} from 'framer-motion';
export default function PixelAuth({active}){return active?<div className="pixel-layer" aria-hidden="true">{Array.from({length:96},(_,i)=><motion.i key={i} initial={{opacity:0,scale:0}} animate={{opacity:[0,1,.7],scale:[0,1,1]}} transition={{duration:.42,delay:Math.random()*.22}} style={{left:`${(i*37)%100}%`,top:`${(i*61)%100}%`}}/> )}</div>:null}
