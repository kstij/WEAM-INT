import { NextRequest, NextResponse } from 'next/server';

// Weam proxy route for aidocs
// This forwards requests from Weam to your app running on port 3000

const APP_BASE_URL = process.env.APP_BASE_URL || 'http://localhost:3000';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params.path, 'GET');
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params.path, 'POST');
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params.path, 'PUT');
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params.path, 'DELETE');
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params.path, 'PATCH');
}

async function handleRequest(
  request: NextRequest,
  pathSegments: string[],
  method: string
) {
  try {
    const path = pathSegments.join('/');
    const url = new URL(request.url);
    const searchParams = url.searchParams.toString();
    
    const targetUrl = `${APP_BASE_URL}/api/${path}${searchParams ? `?${searchParams}` : ''}`;
    
    // Prepare headers
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    // Forward cookies for authentication
    const cookieHeader = request.headers.get('cookie');
    if (cookieHeader) {
      headers['Cookie'] = cookieHeader;
    }
    
    // Prepare request body for non-GET requests
    let body: string | undefined;
    if (method !== 'GET') {
      try {
        body = await request.text();
      } catch (error) {
        console.error('Error reading request body:', error);
      }
    }
    
    // Make the request to your app
    const response = await fetch(targetUrl, {
      method,
      headers,
      body,
    });
    
    // Get response data
    const responseData = await response.text();
    
    // Create response with same status and headers
    const nextResponse = new NextResponse(responseData, {
      status: response.status,
      statusText: response.statusText,
    });
    
    // Forward response headers
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() !== 'content-encoding') {
        nextResponse.headers.set(key, value);
      }
    });
    
    return nextResponse;
    
  } catch (error) {
    console.error(`Error proxying ${method} request:`, error);
    
    return NextResponse.json(
      { 
        error: 'Proxy Error', 
        message: 'Failed to connect to aidocs' 
      },
      { status: 500 }
    );
  }
}
