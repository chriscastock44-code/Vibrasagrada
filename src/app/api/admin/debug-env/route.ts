import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

/**
 * TEMPORARY diagnostic endpoint — DELETE after fixing the admin login issue.
 *
 * Does not expose the actual password or the full hash. It only reports
 * whether the ADMIN_PASSWORD_HASH env var currently set in production
 * actually matches a given test password, plus a few harmless shape checks
 * (length, prefix, whether it looks like a valid bcrypt hash). This lets us
 * find the real problem instead of guessing blind through the chat.
 *
 * Usage: GET /api/admin/debug-env?key=vibra-debug&password=vibra2026
 */
export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get("key");
  if (key !== "vibra-debug") {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const hash = process.env.ADMIN_PASSWORD_HASH;
  const testPassword = request.nextUrl.searchParams.get("password") || "vibra2026";

  if (!hash) {
    return NextResponse.json({
      hashPresent: false,
      message: "ADMIN_PASSWORD_HASH no está definida en producción.",
    });
  }

  let compareResult: boolean | string;
  try {
    compareResult = await bcrypt.compare(testPassword, hash);
  } catch (err) {
    compareResult = `error al comparar: ${err instanceof Error ? err.message : String(err)}`;
  }

  return NextResponse.json({
    hashPresent: true,
    hashLength: hash.length,
    expectedLength: 60,
    startsWithValidBcryptPrefix: /^\$2[aby]\$/.test(hash),
    first7: hash.slice(0, 7),
    last6: hash.slice(-6),
    containsDollarSign: (hash.match(/\$/g) || []).length,
    containsBackslash: hash.includes("\\"),
    containsWhitespace: /\s/.test(hash),
    containsQuotes: hash.includes('"') || hash.includes("'"),
    testedPassword: testPassword,
    matches: compareResult,
    // Diagnostic info to tell "process never restarted" apart from
    // "restarted but the stored value is still wrong":
    serverUptimeSeconds: Math.round(process.uptime()),
    serverPid: process.pid,
    serverBootedAt: new Date(Date.now() - process.uptime() * 1000).toISOString(),
    buildMarker: "debug-v2",
  });
}
