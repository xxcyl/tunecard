import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { name, value, options } = await request.json()
  
  // Set the cookie
  cookies().set(name, value, options)
  
  return NextResponse.json({ success: true })
}

export async function DELETE(request: Request) {
  const { name, options } = await request.json()
  
  // Remove the cookie by setting an empty value and expired date
  cookies().set(name, '', {
    ...options,
    maxAge: 0,
  })
  
  return NextResponse.json({ success: true })
}
