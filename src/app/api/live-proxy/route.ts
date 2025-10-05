import { NextRequest, NextResponse } from 'next/server';

// Allowed domains for CORS
const ALLOWED_DOMAINS = [
  'api.coingecko.com',
  'api.binance.com',
  'api.kraken.com',
  'api.polygon.io',
  'api.alphavantage.co',
  'api.openweathermap.org',
  'api.github.com',
  'jsonplaceholder.typicode.com',
  'httpbin.org',
  'localhost',
  '127.0.0.1',
];

// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string, limit: number = 100, windowMs: number = 60000): boolean {
  const now = Date.now();
  const key = ip;
  const current = rateLimitMap.get(key);

  if (!current || now > current.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (current.count >= limit) {
    return false;
  }

  current.count++;
  return true;
}

function isAllowedDomain(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    
    return ALLOWED_DOMAINS.some(domain => 
      hostname === domain || hostname.endsWith(`.${domain}`)
    );
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');
    const demo = searchParams.get('demo');

    // Handle demo data
    if (demo) {
      return handleDemoData(demo);
    }

    if (!url) {
      return NextResponse.json(
        { error: 'URL parameter is required' },
        { status: 400 }
      );
    }

    // Validate URL
    if (!isAllowedDomain(url)) {
      return NextResponse.json(
        { error: 'Domain not allowed' },
        { status: 403 }
      );
    }

    // Fetch data from the URL
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'SlideSmith Live Widget Proxy',
        'Accept': 'application/json',
      },
      // Add timeout
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch data: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Add CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Cache-Control': 'public, max-age=60',
    };

    return NextResponse.json(data, { headers: corsHeaders });
  } catch (error) {
    console.error('Error in live proxy:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function handleDemoData(demo: string) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Cache-Control': 'public, max-age=60',
  };

  switch (demo) {
    case 'alcohol_trend':
      return NextResponse.json({
        data: [
          { time: '2020-01', value: 65 },
          { time: '2020-02', value: 68 },
          { time: '2020-03', value: 72 },
          { time: '2020-04', value: 75 },
          { time: '2020-05', value: 78 },
          { time: '2020-06', value: 82 },
          { time: '2020-07', value: 85 },
          { time: '2020-08', value: 88 },
          { time: '2020-09', value: 92 },
          { time: '2020-10', value: 95 },
          { time: '2020-11', value: 98 },
          { time: '2020-12', value: 102 },
        ],
        title: 'Alcohol Use Trends by Age Group',
        xAxis: 'time',
        yAxis: 'value',
      }, { headers: corsHeaders });

    case 'crypto_prices':
      return NextResponse.json({
        BTC: { price: 45000, change: 2.5 },
        ETH: { price: 3200, change: -1.2 },
        ADA: { price: 0.45, change: 5.8 },
        SOL: { price: 95, change: 3.2 },
      }, { headers: corsHeaders });

    case 'weather':
      return NextResponse.json({
        location: 'Sydney, Australia',
        temperature: 22,
        condition: 'Partly Cloudy',
        humidity: 65,
        wind: 15,
      }, { headers: corsHeaders });

    case 'github_stats':
      return NextResponse.json({
        repos: 42,
        stars: 128,
        followers: 89,
        following: 156,
      }, { headers: corsHeaders });

    default:
      return NextResponse.json(
        { error: 'Unknown demo data type' },
        { status: 400 }
      );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
