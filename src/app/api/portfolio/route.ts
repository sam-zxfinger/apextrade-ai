import { NextResponse } from 'next/server';
import { generatePortfolio } from '@/lib/mockData';

export async function GET() {
  const port = generatePortfolio(10000);

  return NextResponse.json(port);
}
