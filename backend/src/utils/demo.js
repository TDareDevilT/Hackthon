export function demoReport(input) {
  const rain = Number(input.readings.rainfallMm || 0);
  const humidity = Number(input.readings.humidity || 0);
  const temp = Number(input.readings.temperatureC || 0);
  const heat = temp >= 35;
  const wet = rain >= 25 || humidity >= 85;
  return {
    title: `${input.crop} climate readiness report`,
    summary: heat ? 'Heat stress deserves priority attention in the current reading set.' : wet ? 'Moisture pressure is elevated, so disease and water-management checks matter.' : 'Current readings look broadly manageable, with routine climate monitoring recommended.',
    weather_outlook: `Based on the supplied readings, temperature is ${temp}°C, humidity is ${humidity}%, and rainfall is ${rain} mm. This is a local reading interpretation, not a live forecast.`,
    climate_score: Math.max(20, Math.min(96, Math.round(82 - (heat ? 22 : 0) - (wet ? 12 : 0)))),
    risks: [heat ? 'Heat stress risk' : 'Temperature variability', wet ? 'High moisture / fungal pressure' : 'Dry-spell risk if rainfall declines'],
    recommendations: ['Check soil moisture before irrigation rather than irrigating on a fixed schedule.', 'Inspect leaves and growing points for heat or moisture stress.', 'Record another reading after the next meaningful weather change.'],
    harvest_guidance: `For ${input.crop} at the ${input.cropStage} stage, avoid making a harvest decision from one weather reading. Combine crop maturity indicators with a short weather window and field inspection.`,
    data_quality: 'Demo interpretation generated from the supplied readings. Configure Gemini for live AI reasoning.',
    disclaimer: 'Decision support only. Verify high-stakes agricultural decisions with local agronomy and official advisories.'
  };
}
