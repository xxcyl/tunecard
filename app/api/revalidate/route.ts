import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const paths = request.nextUrl.searchParams.getAll('path')

    if (paths.length === 0) {
      return NextResponse.json(
        { message: 'No paths provided' },
        { status: 400 }
      )
    }

    // 重新驗證所有提供的路徑
    paths.forEach((path) => {
      revalidatePath(path)
    })

    return NextResponse.json({ 
      revalidated: true, 
      paths,
      now: Date.now() 
    })
  } catch (err) {
    return NextResponse.json(
      { message: 'Error revalidating' },
      { status: 500 }
    )
  }
}
