export async function getLocalWeather(location){
 if(!location?.trim())return null;
 try{
  const geo=await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en&format=json`);
  if(!geo.ok)return null; const g=await geo.json(); const place=g.results?.[0]; if(!place)return null;
  const weather=await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum&timezone=auto&forecast_days=3`);
  if(!weather.ok)return null; const w=await weather.json();
  return {place:`${place.name}${place.admin1?`, ${place.admin1}`:''}`,latitude:place.latitude,longitude:place.longitude,current:w.current,daily:w.daily};
 }catch{return null}
}
