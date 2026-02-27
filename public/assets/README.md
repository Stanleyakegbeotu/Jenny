# Assets Folder

This folder contains all static assets for the landing page and admin dashboard.

## Folder Structure

### `/images/`
All image assets for the website

- **`heroes/`** - Large hero section images
  - Landing page hero background
  - Section cover images
  - Recommended size: 1920x1080 or higher for hero sections

- **`books/`** - Book cover images
  - Featured book covers
  - Book grid display images
  - Recommended size: 400x600 (3:2 aspect ratio for covers)

- **`author/`** - Author profile images
  - Author headshot/photo
  - Author profile picture
  - Recommended size: 300x300 or 400x400 for profiles

- **`misc/`** - Miscellaneous images
  - Social proof images
  - Testimonial images
  - Decorative elements
  - Any other supporting images

## Usage in Components

### Referencing Images in React Components

```tsx
// Using public assets in components
<img src="/assets/images/books/featured-book.jpg" alt="Featured Book" />

// Using with ImageWithFallback component
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

<ImageWithFallback
  src="/assets/images/books/book-cover.jpg"
  alt="Book Cover"
  className="w-full h-full object-cover"
/>
```

## Image Optimization Tips

1. **Format**: Use optimized formats (WebP preferred, JPEG/PNG fallback)
2. **Size**: Compress images before uploading
   - Heroes: 1-2 MB max
   - Books: 200-400 KB max
   - Author: 100-200 KB max

3. **Naming Convention**: Use lowercase with hyphens
   - ✅ `featured-book-cover.jpg`
   - ❌ `FeaturedBookCover.jpg`
   - ❌ `featured_book_cover.jpg`

## Deployment Notes

- All assets in the `public` folder are copied directly to the build output (`dist`)
- Assets are served statically with caching headers
- Use `/assets/images/...` paths (absolute from root) in components
- No build processing applied to public assets

## Example Landing Page Assets

For the default landing page, you might add:

```
public/assets/images/
├── heroes/
│   ├── landing-hero.jpg
│   ├── featured-books-section.jpg
│   └── cta-section.jpg
├── books/
│   ├── hearts-entwined-cover.jpg
│   ├── echoes-of-forever-cover.jpg
│   └── midnight-confessions-cover.jpg
├── author/
│   └── author-profile.jpg
└── misc/
    ├── social-proof-1.jpg
    ├── testimonial-bg.jpg
    └── decoration.png
```
