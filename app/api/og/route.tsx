import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';

import { site } from '@/lib/site';

export const runtime = 'nodejs';

/**
 * Open Graph image generator.
 *
 * Rendered on demand and cached for a year, so every page gets a share card without a
 * designer producing 90 PNGs. Text comes from query parameters and is length-capped —
 * an OG image is user-visible output, so it must not become a canvas for injected text.
 */
export async function GET(request: NextRequest): Promise<Response> {
  const params = request.nextUrl.searchParams;
  const title = (params.get('title') ?? site.tagline).slice(0, 90);
  const subtitle = (params.get('subtitle') ?? site.shortDescription).slice(0, 120);
  const eyebrow = (params.get('eyebrow') ?? '').slice(0, 40);

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #0a0e18 0%, #141957 55%, #1b27b6 100%)',
          padding: '72px 80px',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -160,
            right: -120,
            width: 520,
            height: 520,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(59,92,255,0.55) 0%, rgba(59,92,255,0) 70%)',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -180,
            left: -80,
            width: 420,
            height: 420,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(249,92,51,0.35) 0%, rgba(249,92,51,0) 70%)',
            display: 'flex',
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: 'linear-gradient(135deg, #3b5cff 0%, #1b27b6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 30,
              fontWeight: 800,
              color: '#ffffff',
            }}
          >
            C
          </div>
          <div style={{ display: 'flex', fontSize: 27, fontWeight: 700, color: '#ffffff' }}>
            {site.name}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 22, maxWidth: 940 }}>
          {eyebrow ? (
            <div
              style={{
                display: 'flex',
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: 2,
                textTransform: 'uppercase',
                color: '#93b0ff',
              }}
            >
              {eyebrow}
            </div>
          ) : null}
          <div
            style={{
              display: 'flex',
              fontSize: title.length > 55 ? 62 : 74,
              fontWeight: 800,
              lineHeight: 1.06,
              letterSpacing: -1.8,
              color: '#ffffff',
            }}
          >
            {title}
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 28,
              lineHeight: 1.4,
              color: 'rgba(255,255,255,0.72)',
            }}
          >
            {subtitle}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 24,
            color: 'rgba(255,255,255,0.6)',
          }}
        >
          <div style={{ display: 'flex' }}>{site.domain}</div>
          <div style={{ display: 'flex', gap: 26 }}>
            <div style={{ display: 'flex' }}>56 templates</div>
            <div style={{ display: 'flex' }}>ATS-friendly</div>
            <div style={{ display: 'flex' }}>Free to start</div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    },
  );
}
