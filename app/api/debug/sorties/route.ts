import { NextResponse } from 'next/server';

/**
 * Debug route — shows what Vercel sees for the Google Sheets env vars.
 * Remove this file once production is confirmed working.
 * Access: /api/debug/sorties
 */
export const dynamic = 'force-dynamic';

export async function GET() {
  const tallyId = process.env.TALLY_SHEET_ID;
  const configId = process.env.CONFIG_SHEET_ID;

  const results: Record<string, unknown> = {
    env: {
      TALLY_SHEET_ID: tallyId ? `✅ set (${tallyId.slice(0, 8)}...)` : '❌ NOT SET',
      CONFIG_SHEET_ID: configId ? `✅ set (${configId.slice(0, 8)}...)` : '❌ NOT SET',
    },
    tally: null,
    config: null,
  };

  // Test Tally sheet fetch
  if (tallyId) {
    const url = `https://docs.google.com/spreadsheets/d/${tallyId}/export?format=csv&gid=0`;
    try {
      const res = await fetch(url, { cache: 'no-store' });
      const text = await res.text();
      const lines = text.split(/\r?\n/);
      results.tally = {
        status: res.status,
        ok: res.ok,
        lineCount: lines.length,
        header: lines[0],
        firstDataRows: lines.slice(1, 4),
      };
    } catch (err) {
      results.tally = { error: String(err) };
    }
  }

  // Test config sheet fetch
  if (configId) {
    const url = `https://docs.google.com/spreadsheets/d/${configId}/export?format=csv&gid=0`;
    try {
      const res = await fetch(url, { cache: 'no-store' });
      const text = await res.text();
      const lines = text.split(/\r?\n/);
      results.config = {
        status: res.status,
        ok: res.ok,
        lineCount: lines.length,
        rows: lines.slice(0, 5),
      };
    } catch (err) {
      results.config = { error: String(err) };
    }
  }

  return NextResponse.json(results, { status: 200 });
}
