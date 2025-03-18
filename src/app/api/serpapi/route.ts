import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query');
  const apiKey = process.env.NEXT_PUBLIC_SERPAPI_API_KEY;
  
  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }
  
  try {
    const response = await fetch(
      `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(query)}&api_key=${apiKey}`
    );
    
    if (!response.ok) {
      throw new Error(`SerpAPI request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching from SerpAPI:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data from SerpAPI' },
      { status: 500 }
    );
  }
} 