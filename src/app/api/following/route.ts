import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");
  if (!address) {
    return NextResponse.json({ error: "Missing address" }, { status: 400 });
  }
  try {
    const res = await fetch(
      `https://api.neynar.xyz/v1/farcaster/follows?user=${address}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.NEYNAR_API_KEY}`,
        },
      }
    );
    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: text }, { status: res.status });
    }
    const data = await res.json();
    const follows = data.follows.map((f: any) => f.owner);
    return NextResponse.json({ follows });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
