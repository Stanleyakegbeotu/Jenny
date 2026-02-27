# Asset Usage Guide

## Quick Start

1. **Add your images** to the appropriate folder in `public/assets/images/`
2. **Reference them** in your components using absolute paths from the public folder
3. **Optimize before uploading** - compress images to reduce load time

## File Paths Reference

### In Components
```tsx
// ✅ Correct way - absolute path from public folder
<img src="/assets/images/heroes/landing-hero.jpg" alt="Hero" />

// ✅ Also works with ImageWithFallback
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

<ImageWithFallback
  src="/assets/images/books/book-cover.jpg"
  alt="Book"
/>

// ❌ Wrong - don't use relative paths for public assets
<img src="../public/assets/images/..." />

// ❌ Wrong - don't use import for public static files
import image from '../assets/images/hero.jpg'
```

## Folder Organization

### 📸 `/heroes/`
- Large background images
- Landing page hero sections
- Section dividers and backgrounds
- **Recommended:** 1920x1080px min, optimized to 500-800KB

### 📚 `/books/`
- Book cover art
- Featured book displays
- Book grid thumbnail images
- **Recommended:** 400x600px (portrait), 200-300KB

### 👤 `/author/`
- Author profile photo
- Author headshot
- About section images
- **Recommended:** 400x400px or 300x300px, 100-150KB

### 🎨 `/misc/`
- Social proof images
- Testimonial backgrounds
- Decorative elements
- Icons and illustrations
- **Recommended:** Variable sizes, optimize accordingly

## Image Optimization Tools

Before uploading, optimize your images:

- **Online:** TinyPNG, ImageOptim.com, Compressor.io
- **CLI:** ImageMagick, ffmpeg
- **VS Code Extension:** "Compress NOW"

### Quick Compression Example (using ImageMagick)
```bash
convert input.jpg -quality 80 -resize 1920x1080 output.jpg
```

## Common Use Cases

### Landing Page Hero
```tsx
<img 
  src="/assets/images/heroes/landing-hero.jpg"
  alt="Welcome to Nensha Jennifer"
  className="w-full h-96 object-cover"
/>
```

### Featured Book Display
```tsx
<ImageWithFallback
  src="/assets/images/books/hearts-entwined-cover.jpg"
  alt="Featured Book Cover"
  className="w-80 h-96 rounded-lg shadow-lg"
/>
```

### Author Profile
```tsx
<img
  src="/assets/images/author/author-profile.jpg"
  alt="Jennifer Nensha"
  className="w-32 h-32 rounded-full object-cover"
/>
```

## Deployment Checklist

Before deploying to production:

- [ ] All placeholder images replaced with actual images
- [ ] All images optimized and compressed
- [ ] Image paths verified in all components
- [ ] File naming follows lowercase-hyphen convention
- [ ] Alt text added to all images
- [ ] Total asset size acceptable (under 10MB for entire folder)
- [ ] Images tested in both light and dark mode (if applicable)
- [ ] Mobile display verified for responsive images

## Notes

- These are **static assets** - they won't be processed by Vite's build system
- Changes to assets require a hard refresh (Ctrl+Shift+R or Cmd+Shift+R) in development
- In production, these files will be served directly without caching concerns in Vite
- Use CSS background-image for decorative images that don't need alt text
- Use HTML img tags for content images (better accessibility)
