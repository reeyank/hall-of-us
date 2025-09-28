import { NextResponse } from 'next/server';
import { TAGS_POOL } from '../../feed/constants';

export async function GET() {
  return NextResponse.json(TAGS_POOL);
}