import { NextResponse } from 'next/server'

export async function GET(request) {
  const { pathname } = new URL(request.url)
  
  // Health check endpoint
  if (pathname === '/api/' || pathname === '/api') {
    return NextResponse.json({ 
      message: 'Real-Time Gas Tracker API is running',
      timestamp: new Date().toISOString(),
      status: 'healthy'
    })
  }
  
  return NextResponse.json({ 
    error: 'Endpoint not found',
    availableEndpoints: [
      '/api/ - Health check'
    ]
  }, { status: 404 })
}

export async function POST(request) {
  return NextResponse.json({ 
    error: 'Method not implemented',
    message: 'POST endpoints will be added as needed'
  }, { status: 501 })
}