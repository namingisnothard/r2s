import type { Metadata } from 'next';
import './globals.css';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
const title = 'Real2Sim Frontier — Graphics & Robot Learning Pipelines';
const description = 'A cited tracker of real-to-simulation pipelines, tested robot embodiments, simulation engines, foundation tools, retargeting history, and terminology across vision, graphics, and robot learning.';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  keywords: ['real2sim', 'robot learning', 'neural graphics', 'digital twins', 'human video', 'retargeting', '3D Gaussian splatting', 'simulation'],
  openGraph: { title, description, type: 'website', url: siteUrl, images: [{ url: `${siteUrl}/og.png`, width: 1200, height: 630, alt: 'Real2Sim Frontier — Graphics × Robot Learning Pipelines' }] },
  twitter: { card: 'summary_large_image', title, description, images: [`${siteUrl}/og.png`] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
