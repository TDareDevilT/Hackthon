import { GoogleGenAI, Type } from '@google/genai';
import { demoReport } from '../utils/demo.js';
const reportResponse={type:Type.OBJECT,properties:{title:{type:Type.STRING},summary:{type:Type.STRING},weather_outlook:{type:Type.STRING},climate_score:{type:Type.NUMBER},risks:{type:Type.ARRAY,items:{type:Type.STRING}},recommendations:{type:Type.ARRAY,items:{type:Type.STRING}},harvest_guidance:{type:Type.STRING},data_quality:{type:Type.STRING},disclaimer:{type:Type.STRING}},required:['title','summary','weather_outlook','climate_score','risks','recommendations','harvest_guidance','data_quality','disclaimer']};
function safeReport(value){if(!value||typeof value!=='object')throw new Error('AI returned an invalid report.');if(!Array.isArray(value.risks)||!Array.isArray(value.recommendations))throw new Error('AI returned an invalid report structure.');const score=Number(value.climate_score);if(!Number.isFinite(score)||score<0||score>100)throw new Error('AI returned an invalid climate score.');return {...value,climate_score:Math.round(score),risks:value.risks.slice(0,6),recommendations:value.recommendations.slice(0,8),disclaimer:value.disclaimer||'Decision support only. Verify high-stakes decisions with local agronomy and official advisories.'};}
export async function generateReport(input,liveWeather){
  const hasKey=Boolean(process.env.GEMINI_API_KEY);
  const demo=process.env.DEMO_MODE==='true';
  if(!hasKey||demo) return {report:demoReport(input),mode:demo?'DEMO':'LOCAL_FALLBACK'};
  try {
    const ai=new GoogleGenAI({apiKey:process.env.GEMINI_API_KEY});
    const languageNames={en:'English',hi:'Hindi',kn:'Kannada',te:'Telugu',ta:'Tamil'};
    const prompt=`You are an agricultural climate decision-support assistant. Write the complete report in ${languageNames[input.language]||'English'}. Use the farmer's supplied readings, crop, crop stage and optional live local weather context. Clearly distinguish measured farmer readings from live weather context. If live weather context is absent, say so. Explain weather in plain language, identify climate risks, give practical crop-stage-aware actions, and give cautious harvest guidance. Do not invent weather data. Never give unsafe chemical dosages. Field notes are optional and may be empty. Keep recommendations practical for a farmer. Input:
${JSON.stringify({farm:input,liveWeather})}`;
    const response=await ai.models.generateContent({model:process.env.GEMINI_MODEL||'gemini-3.7-flash',contents:prompt,config:{responseMimeType:'application/json',responseSchema:reportResponse,temperature:0.25}});
    return {report:safeReport(JSON.parse(response.text)),mode:'REAL'};
  } catch(error) {
    console.error('Gemini report failed, using local report:',error?.message||error);
    return {report:demoReport(input),mode:'LOCAL_FALLBACK'};
  }
}
