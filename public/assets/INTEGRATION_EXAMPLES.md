# Asset Integration Examples

This file shows real examples of how to integrate the assets into your landing page components.

## Hero Section Example

```tsx
// src/app/components/landing/HeroSection.tsx

export function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src="/assets/images/heroes/landing-hero.jpg"
          alt="Welcome to Nensha Jennifer"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
      </div>
      
      {/* Rest of hero content */}
    </section>
  );
}
```

## Featured Book Example

```tsx
// src/app/components/landing/FeaturedBook.tsx
import { ImageWithFallback } from '../figma/ImageWithFallback';

export function FeaturedBook() {
  return (
    <div className="grid md:grid-cols-2 gap-12 items-center">
      {/* Book Cover */}
      <div>
        <ImageWithFallback
          src="/assets/images/books/featured-book-cover.jpg"
          alt="Featured Book: Hearts Entwined"
          className="rounded-2xl shadow-2xl w-80 h-96"
        />
      </div>
      
      {/* Book Details */}
      <div>
        <h2>Featured Book Title</h2>
        <p>Book description...</p>
      </div>
    </div>
  );
}
```

## Books Grid Example

```tsx
// src/app/components/landing/BooksGrid.tsx

const DEMO_BOOKS = [
  {
    id: '1',
    title: 'Hearts Entwined',
    image: '/assets/images/books/hearts-entwined-cover.jpg',
    description: 'A sweeping tale of love across continents...'
  },
  {
    id: '2',
    title: 'Echoes of Forever',
    image: '/assets/images/books/echoes-of-forever-cover.jpg',
    description: 'Where second chances meet unexpected love...'
  },
  {
    id: '3',
    title: 'Midnight Confessions',
    image: '/assets/images/books/midnight-confessions-cover.jpg',
    description: 'Secrets, passion, and the heart\'s deepest desires...'
  }
];

export function BooksGrid() {
  return (
    <div className="grid md:grid-cols-3 gap-8">
      {DEMO_BOOKS.map((book) => (
        <div key={book.id}>
          <ImageWithFallback
            src={book.image}
            alt={book.title}
            className="w-full h-96 rounded-lg object-cover shadow-lg"
          />
          <h3>{book.title}</h3>
          <p>{book.description}</p>
        </div>
      ))}
    </div>
  );
}
```

## Author Section Example

```tsx
// src/app/components/landing/AboutSection.tsx

export function AboutSection() {
  return (
    <section className="py-24">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        {/* Author Photo */}
        <div>
          <img
            src="/assets/images/author/author-profile.jpg"
            alt="Jennifer Nensha - Romance Author"
            className="w-96 h-96 rounded-2xl object-cover shadow-2xl"
          />
        </div>
        
        {/* Author Bio */}
        <div>
          <h2>About the Author</h2>
          <p>Bio text...</p>
        </div>
      </div>
    </section>
  );
}
```

## Social Proof Example

```tsx
// src/app/components/landing/SocialProof.tsx

const TESTIMONIALS = [
  {
    id: 1,
    text: 'A captivating read that kept me up all night!',
    author: 'Sarah M.',
    image: '/assets/images/misc/testimonial-1.jpg'
  },
  // ... more testimonials
];

export function SocialProof() {
  return (
    <div className="grid md:grid-cols-3 gap-8">
      {TESTIMONIALS.map((testimonial) => (
        <div key={testimonial.id} className="bg-card rounded-lg p-6">
          <img
            src={testimonial.image}
            alt={testimonial.author}
            className="w-16 h-16 rounded-full object-cover mb-4"
          />
          <p className="text-lg mb-4">"{testimonial.text}"</p>
          <p className="font-semibold">{testimonial.author}</p>
        </div>
      ))}
    </div>
  );
}
```

## Image with Fallback Component

The project includes an `ImageWithFallback` component that automatically handles loading states:

```tsx
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

// The component handles:
// - Broken image URLs gracefully
// - Loading states
// - Fallback placeholder images
// - Accessibility (alt text)

<ImageWithFallback
  src="/assets/images/books/book-cover.jpg"
  alt="Book Title"
  className="your-custom-classes"
/>
```

## File Naming Convention Examples

✅ **Good:**
- `landing-hero.jpg`
- `featured-book-cover.jpg`
- `author-profile.jpg`
- `social-proof-background.png`

❌ **Avoid:**
- `LandingHero.jpg` (capitals)
- `featured_book_cover.jpg` (underscores)
- `FeaturedBookCover.jpg` (camelCase)
- `cover (1).jpg` (numbers in name)

## Performance Optimization Tips

1. **Use appropriate formats:**
   - Photography: JPEG (80-85 quality)
   - Graphics with transparency: PNG
   - Modern browsers: WebP (with JPEG fallback)

2. **Responsive images:**
   ```tsx
   <img
     src="/assets/images/heroes/landing-hero.jpg"
     alt="Hero"
     loading="lazy" // Lazy load for off-screen images
     className="w-full h-auto"
   />
   ```

3. **Picture element for multiple sizes:**
   ```tsx
   <picture>
     <source media="(min-width: 768px)" srcSet="/assets/images/heroes/hero-desktop.jpg" />
     <source media="(max-width: 767px)" srcSet="/assets/images/heroes/hero-mobile.jpg" />
     <img
       src="/assets/images/heroes/hero-fallback.jpg"
       alt="Hero"
       className="w-full h-auto"
     />
   </picture>
   ```

4. **CSS background images for decorative elements:**
   ```tsx
   <div
     style={{
       backgroundImage: 'url(/assets/images/misc/pattern.png)',
       backgroundSize: 'cover',
       backgroundPosition: 'center'
     }}
     className="w-full h-96"
   />
   ```
