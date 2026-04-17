// Technical Indicators Calculations

export const calculateSMA = (data, period = 20) => {
  if (!data || data.length < period) return [];
  
  const smaData = [];
  for (let i = period - 1; i < data.length; i++) {
    const sum = data.slice(i - period + 1, i + 1).reduce((acc, d) => acc + d.close, 0);
    smaData.push({
      date: data[i].date,
      sma: sum / period,
    });
  }
  return smaData;
};

export const calculateEMA = (data, period = 12) => {
  if (!data || data.length < period) return [];
  
  const k = 2 / (period + 1);
  let ema = data[0].close;
  const emaData = [{ date: data[0].date, ema }];
  
  for (let i = 1; i < data.length; i++) {
    ema = data[i].close * k + ema * (1 - k);
    emaData.push({ date: data[i].date, ema });
  }
  return emaData;
};

export const calculateRSI = (data, period = 14) => {
  if (!data || data.length < period + 1) return [];
  
  const changes = [];
  for (let i = 1; i < data.length; i++) {
    changes.push(data[i].close - data[i - 1].close);
  }
  
  const rsiData = [];
  for (let i = period; i < changes.length; i++) {
    let avgGain = 0;
    let avgLoss = 0;
    
    for (let j = i - period; j < i; j++) {
      if (changes[j] > 0) {
        avgGain += changes[j];
      } else {
        avgLoss -= changes[j];
      }
    }
    
    avgGain /= period;
    avgLoss /= period;
    
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    const rsi = 100 - (100 / (1 + rs));
    
    rsiData.push({
      date: data[i].date,
      rsi,
      overbought: 70,
      oversold: 30,
    });
  }
  
  return rsiData;
};

export const calculateMACD = (data) => {
  if (!data || data.length < 26) return [];
  
  const ema12 = calculateEMA(data, 12);
  const ema26 = calculateEMA(data, 26);
  
  const macdLine = [];
  for (let i = 0; i < data.length; i++) {
    if (ema12[i] && ema26[i]) {
      macdLine.push({
        date: data[i].date,
        macd: ema12[i].ema - ema26[i].ema,
      });
    }
  }
  
  // Calculate signal line (9-day EMA of MACD line)
  const signalLine = [];
  const k = 2 / (9 + 1);
  let signal = macdLine[0]?.macd || 0;
  
  for (let i = 0; i < macdLine.length; i++) {
    signal = macdLine[i].macd * k + signal * (1 - k);
    signalLine.push({ date: macdLine[i].date, signal });
  }
  
  // Calculate histogram
  const histogram = [];
  for (let i = 0; i < macdLine.length; i++) {
    histogram.push({
      date: macdLine[i].date,
      histogram: macdLine[i].macd - signalLine[i].signal,
    });
  }
  
  // Combine all data
  const result = [];
  for (let i = 0; i < macdLine.length; i++) {
    result.push({
      date: macdLine[i].date,
      macd: macdLine[i].macd,
      signal: signalLine[i].signal,
      histogram: histogram[i].histogram,
    });
  }
  
  return result;
};

export const calculateBollingerBands = (data, period = 20, stdDev = 2) => {
  if (!data || data.length < period) return [];
  
  const result = [];
  
  for (let i = period - 1; i < data.length; i++) {
    const slice = data.slice(i - period + 1, i + 1);
    const prices = slice.map(d => d.close);
    
    // Calculate SMA
    const sma = prices.reduce((acc, price) => acc + price, 0) / period;
    
    // Calculate standard deviation
    const variance = prices.reduce((acc, price) => acc + Math.pow(price - sma, 2), 0) / period;
    const standardDeviation = Math.sqrt(variance);
    
    result.push({
      date: data[i].date,
      middle: sma,
      upper: sma + (standardDeviation * stdDev),
      lower: sma - (standardDeviation * stdDev),
      price: data[i].close,
    });
  }
  
  return result;
};

export const calculateVWAP = (data) => {
  if (!data || data.length === 0) return [];
  
  const vwapData = [];
  let cumulativeTypicalPriceVolume = 0;
  let cumulativeVolume = 0;
  
  for (let i = 0; i < data.length; i++) {
    const typicalPrice = (data[i].high + data[i].low + data[i].close) / 3;
    cumulativeTypicalPriceVolume += typicalPrice * data[i].volume;
    cumulativeVolume += data[i].volume;
    
    vwapData.push({
      date: data[i].date,
      vwap: cumulativeTypicalPriceVolume / cumulativeVolume,
    });
  }
  
  return vwapData;
};

// Combine all indicators
export const calculateAllIndicators = (data) => {
  if (!data || data.length === 0) return data;
  
  const smaData = calculateSMA(data);
  const emaData = calculateEMA(data);
  const rsiData = calculateRSI(data);
  const macdData = calculateMACD(data);
  const bbData = calculateBollingerBands(data);
  
  // Create a map for easy lookup
  const smaMap = new Map(smaData.map(d => [d.date, d.sma]));
  const emaMap = new Map(emaData.map(d => [d.date, d.ema]));
  const rsiMap = new Map(rsiData.map(d => [d.date, d.rsi]));
  const macdMap = new Map(macdData.map(d => [d.date, { macd: d.macd, signal: d.signal }]));
  const bbMap = new Map(bbData.map(d => [d.date, { upper: d.upper, lower: d.lower }]));
  
  // Combine with original data
  return data.map(item => ({
    ...item,
    sma: smaMap.get(item.date),
    ema: emaMap.get(item.date),
    rsi: rsiMap.get(item.date),
    macd: macdMap.get(item.date)?.macd,
    signal: macdMap.get(item.date)?.signal,
    upperBand: bbMap.get(item.date)?.upper,
    lowerBand: bbMap.get(item.date)?.lower,
  }));
};