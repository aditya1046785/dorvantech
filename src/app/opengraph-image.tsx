import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';
export const alt = 'DORVANTECH | Technology that works for your business';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#FAFBFC',
          padding: '80px',
          position: 'relative',
        }}
      >
        <div
          style={{
            fontSize: '32px',
            fontWeight: 700,
            letterSpacing: '0.04em',
            color: '#0A1930',
          }}
        >
          DORVANTECH
        </div>

        <div
          style={{
            fontSize: '72px',
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: '-0.025em',
            color: '#0A1930',
            maxWidth: '900px',
          }}
        >
          Technology that works for your business.
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '24px',
            backgroundImage:
              'repeating-linear-gradient(135deg, rgba(10, 25, 48, 0.6) 0, rgba(10, 25, 48, 0.6) 1.5px, transparent 1.5px, transparent 8px)',
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}