import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getSessionUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const internalSecret = process.env.INTERNAL_API_SECRET || "super-secret-key-123";
    const backendUrl = process.env.BACKEND_URL || "http://localhost:8000";

    const res = await fetch(`${backendUrl}/api/ai/insight/${user.id}`, {
      headers: {
        Authorization: `Bearer ${internalSecret}`,
      },
      // Since LLMs can take time, we might want to increase the standard fetch timeout
      // but fetch handles it fine usually unless it takes > 30s
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch AI insight" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("AI Insight Route Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
