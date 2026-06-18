// Cloudinary upload widget component
// Install: npm install next-cloudinary

// In your admin product form, use the upload widget:
import { CldUploadWidget } from 'next-cloudinary'
import type { CloudinaryUploadWidgetResults } from 'next-cloudinary'

// Usage in component:
// <CldUploadWidget
//   uploadPreset="ecommerce_uploads"
//   onSuccess={(results) => {
//     const url = results.info.secure_url
//     // Save this URL to Supabase product_images
//   }}
// >

// For displaying optimized images:
import { CldImage } from 'next-cloudinary'

// Usage:
// <CldImage
//   src="your-public-id"
//   width={600} height={600}
//   alt="Product name"
//   crop="fill"
//   sizes="(max-width: 768px) 100vw, 50vw"
// />

// Or just use the URL directly for fast loading:
export function getOptimizedUrl(
  publicId: string,
  width: number = 800
): string {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  return `https://res.cloudinary.com/${cloudName}/image/upload/c_fill,w_${width},q_auto,f_auto/${publicId}`
}

// Helper to extract public_id from full URL
export function extractPublicId(url: string): string {
  const parts = url.split('/upload/')
  if (parts.length < 2) return url
  return parts[1].replace(/\.[^.]+$/, '') // remove extension
}