import { GoogleGenAI, Type } from '@google/genai';

const schema = {
  type: Type.OBJECT,
  properties: {
    farmName: { type: Type.STRING }, location: { type: Type.STRING }, crop: { type: Type.STRING },
    cropStage: { type: Type.STRING }, acreage: { type: Type.NUMBER }, temperatureC: { type: Type.NUMBER },
    humidity: { type: Type.NUMBER }, rainfallMm: { type: Type.NUMBER }, windKph: { type: Type.NUMBER },
    soilMoisture: { type: Type.NUMBER }, sunlightHours: { type: Type.NUMBER }, notes: { type: Type.STRING }
  }, required: []
};

const fields = ['farmName','location','crop','cropStage','acreage','temperatureC','humidity','rainfallMm','windKph','soilMoisture','sunlightHours','notes'];
const stages = ['Seedling','Vegetative','Flowering','Fruiting','Maturity','Post-harvest'];

export async function parseVoice(transcript, language='en') {
  const local = localParse(transcript);
  const key = process.env.GEMINI_API_KEY;
  if (!key || process.env.DEMO_MODE === 'true') return { fields: local, mode: 'DEMO' };

  try {
    const ai = new GoogleGenAI({ apiKey: key });
    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || 'gemini-3.7-flash',
      contents: `You extract structured agricultural form data from natural speech. Language: ${language}. Never invent a value. Return only values explicitly stated or unambiguously implied. Merge all details from the entire transcript. Normalize units: temperature to Celsius, rainfall to mm, wind to km/h, humidity/soil moisture to percent, sunlight to hours. Normalize common crop plurals to singular names. Crop stage must be one of Seedling, Vegetative, Flowering, Fruiting, Maturity, Post-harvest only when clearly stated. Put only genuinely unmapped observations in notes. Transcript:\n${transcript}`,
      config: { responseMimeType: 'application/json', responseSchema: schema, temperature: 0.1 }
    });
    const aiFields = sanitize(JSON.parse(response.text || '{}'));
    return { fields: mergeFields(local, aiFields), mode: 'REAL' };
  } catch (error) {
    console.error('Voice AI extraction failed, using local parser:', error?.message || error);
    return { fields: local, mode: 'LOCAL_FALLBACK' };
  }
}

function sanitize(v) {
  const out = {};
  for (const k of ['farmName','location','crop','cropStage','notes']) {
    if (typeof v?.[k] === 'string' && v[k].trim()) out[k] = v[k].trim();
  }
  for (const k of ['acreage','temperatureC','humidity','rainfallMm','windKph','soilMoisture','sunlightHours']) {
    if (Number.isFinite(Number(v?.[k]))) out[k] = Number(v[k]);
  }
  if (out.cropStage) {
    const normalized = normalizeStage(out.cropStage);
    if (normalized) out.cropStage = normalized; else delete out.cropStage;
  }
  return out;
}

function mergeFields(local, ai) {
  const out = { ...local };
  for (const key of fields) if (ai[key] !== undefined && ai[key] !== '') out[key] = ai[key];
  return sanitize(out);
}

function normalizeStage(value) {
  const s = String(value).toLowerCase().replace(/[-_]/g, ' ').trim();
  return stages.find(x => x.toLowerCase() === s) ||
    (s.includes('seed') ? 'Seedling' : s.includes('veget') ? 'Vegetative' : s.includes('flower') ? 'Flowering' :
    s.includes('fruit') ? 'Fruiting' : s.includes('matur') ? 'Maturity' : s.includes('post') ? 'Post-harvest' : null);
}

function cleanPhrase(value) {
  return String(value || '').replace(/\s+/g, ' ').replace(/[.]+$/, '').trim();
}

function valueAfter(text, patterns, stop) {
  for (const pattern of patterns) {
    const re = new RegExp(pattern.source + `\\s*([^,.;!?]+?)(?=${stop.source}|$)`, 'i');
    const m = text.match(re);
    if (m) return cleanPhrase(m[1]);
  }
  return '';
}

function numberAfter(text, patterns, max=Infinity) {
  for (const pattern of patterns) {
    const re = new RegExp(pattern.source + `\\s*(?:is|of|around|about|at|:)?\\s*(-?\\d+(?:\\.\\d+)?)`, 'i');
    const m = text.match(re);
    if (m) {
      const n = Number(m[1]);
      if (Number.isFinite(n) && n >= -1000 && n <= max) return n;
    }
  }
  return undefined;
}

function localParse(text) {
  const raw = cleanPhrase(text);
  const lower = raw.toLowerCase();
  const out = {};

  const farm = valueAfter(raw, [/(?:my\s+)?farm(?:\s+name)?(?:\s+is|\s+called|\s*:)??/i, /farm(?:\s+name)?\s*(?:is|called|:)/i], /\s+(?:in|at)\s+|\s+(?:crop|location|temperature|humidity|rainfall|rain|wind|soil|sunlight|acre|stage)\b/i);
  if (farm) out.farmName = farm;

  const loc = valueAfter(raw, [/(?:location|located\s+in|based\s+in|from)\s*(?:is|at|in|:)?/i, /\bin\s+/i], /\s+(?:and\s+)?(?:i(?:'m|\s+am)\s+)?(?:growing|grow)|\s+(?:crop|temperature|humidity|rainfall|rain|wind|soil|sunlight|acre|stage)\b/i);
  if (loc && !/^(the|my|a)$/i.test(loc)) out.location = loc;

  const crop = valueAfter(raw, [/(?:crop|i\s+am\s+growing|i\s+grow|growing|planting|planted)\s*(?:is|are|called|:)?/i], /\s+(?:in|at|with|and)\s+|\s+(?:crop\s+stage|temperature|humidity|rainfall|rain|wind|soil|sunlight|acre|stage)\b/i);
  if (crop) out.crop = crop.replace(/\b(crops?|plants?)\b$/i, '').trim();

  const stageMatch = lower.match(/\b(seedling|seedling stage|vegetative|vegetative stage|flowering|flowering stage|fruiting|fruiting stage|maturity|mature|post[- ]harvest|post harvest)\b/i);
  if (stageMatch) out.cropStage = normalizeStage(stageMatch[1]);

  const nums = [
    ['temperatureC', [/(?:temperature|temp)(?:\s+is|\s+of|\s*:)?/i], 100],
    ['humidity', [/(?:humidity|humid)(?:\s+is|\s+of|\s*:)?/i], 100],
    ['rainfallMm', [/(?:rainfall|rain|precipitation)(?:\s+is|\s+of|\s*:)?/i], 5000],
    ['windKph', [/(?:wind)(?:\s+speed)?(?:\s+is|\s+of|\s*:)?/i], 500],
    ['soilMoisture', [/(?:soil\s+moisture|soil\s+moisture\s+level)(?:\s+is|\s+of|\s*:)?/i], 100],
    ['sunlightHours', [/(?:sunlight|sunshine)(?:\s+hours?)?(?:\s+is|\s+of|\s*:)?/i], 24],
    ['acreage', [/(?:farm\s+size|acreage|acres?)(?:\s+is|\s+of|\s*:)?/i], 100000]
  ];
  for (const [key, patterns, max] of nums) {
    const n = numberAfter(raw, patterns, max);
    if (n !== undefined) out[key] = n;
  }

  if (out.temperatureC === undefined) {
    const m = lower.match(/\b(-?\d+(?:\.\d+)?)\s*(?:°\s*)?(?:c|degrees?(?:\s+celsius)?)\b/i);
    if (m) out.temperatureC = Number(m[1]);
  }
  if (out.humidity === undefined) {
    const m = lower.match(/\b(?:humidity\s*(?:is|of|around|about)?\s*)?(\d+(?:\.\d+)?)\s*%\b/);
    if (m && /humidity|humid/.test(lower.slice(Math.max(0, m.index - 30), m.index + 10))) out.humidity = Number(m[1]);
  }

  const unmapped = raw
    .replace(/(?:my\s+)?farm(?:\s+name)?(?:\s+is|\s+called|\s*:)?\s*[^,.;!?]+/ig, '')
    .replace(/(?:location|located\s+in|based\s+in|from)\s*(?:is|at|in|:)?\s*[^,.;!?]+/ig, '')
    .replace(/(?:crop|i\s+am\s+growing|i\s+grow|growing|planting|planted)\s*(?:is|are|called|:)?\s*[^,.;!?]+/ig, '')
    .trim();
  if (unmapped && /\b(observe|noticed|notice|problem|issue|disease|pest|soil|irrigat|leaves?|yellow|dry|wet|storm|hail|frost)\b/i.test(unmapped)) out.notes = cleanPhrase(unmapped);

  return sanitize(out);
}
