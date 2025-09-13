
import { auth } from "@/lib/firebase-admin";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const idToken = await request.text();

  const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days

  try {
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });
    cookies().set("session", sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: true,
    });
    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("Error creating session cookie", error);
    return NextResponse.json({ status: "error" }, { status: 401 });
  }
}

export async function DELETE(request: NextRequest) {
  cookies().delete("session");
  return NextResponse.json({ status: "success" });
}
