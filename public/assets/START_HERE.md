# 🎨 Assets Folder - Getting Started

Welcome! This folder is ready for your landing page images. Here's how to get started:

## 📁 Folder Structure

```
public/
└── assets/
    └── images/
        ├── heroes/        → Large banner and hero images
        ├── books/         → Book cover artwork
        ├── author/        → Author profile photos
        └── misc/          → Miscellaneous images (testimonials, decorations, etc.)
```

## 🚀 Quick Setup

### 1. Add Your Images
- Place hero images in `public/assets/images/heroes/`
- Place book covers in `public/assets/images/books/`
- Place author photo in `public/assets/images/author/`
- Place other images in `public/assets/images/misc/`

### 2. Reference in Components
```tsx
// Example: Use absolute path from public folder
<img src="/assets/images/heroes/landing-hero.jpg" alt="Hero" />
```

### 3. Deploy
No additional configuration needed! When you build for production, all assets are automatically included.

## 📖 Documentation Files

- **`README.md`** - Detailed folder structure and guidelines
- **`USAGE_GUIDE.md`** - How to reference assets and optimization tips
- **`INTEGRATION_EXAMPLES.md`** - Real code examples for your components

## 🎯 Recommended Image Sizes

| Type | Size | Format | Max Size |
|------|------|--------|----------|
| Hero Banner | 1920x1080 | JPEG | 600KB |
| Book Cover | 400x600 | JPEG | 300KB |
| Author Photo | 400x400 | JPEG | 150KB |
| Thumbnail | 300x300 | JPEG | 100KB |

## 💡 Tips Before Deploying

- [ ] Compress all images (use TinyPNG.com)
- [ ] Use lowercase filenames with hyphens: `my-image.jpg` ✓
- [ ] Update component imports with your image filenames
- [ ] Test in browser: hard refresh (Ctrl+Shift+R)
- [ ] Check mobile display
- [ ] Total assets should be under 10MB

## ❓ Need Help?

See `INTEGRATION_EXAMPLES.md` for copy-paste code examples showing how to use these assets in your landing page components.

---

**Happy customizing!** 🎨✨
