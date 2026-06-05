import { NextResponse } from 'next/server';
import { generateOHLCV } from '@/lib/mockData';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol') || 'BTCUSDT';
  
  const ohlcv = generateOHLCV(symbol, 200);

  return NextResponse.json(ohlcv);
}
