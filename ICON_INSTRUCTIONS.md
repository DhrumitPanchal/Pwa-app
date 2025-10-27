# Icon Setup Instructions

The project requires two icon files in the `client/public/` directory:

- `icon-192x192.png` (192x192 pixels)
- `icon-512x512.png` (512x512 pixels)

## Quick Setup Options:

### Option 1: Use a placeholder generator
Visit https://via.placeholder.com/ and download:
- https://via.placeholder.com/192x192/3b82f6/ffffff?text=PWA
- https://via.placeholder.com/512x512/3b82f6/ffffff?text=PWA

Save them as `icon-192x192.png` and `icon-512x512.png` in `client/public/`

### Option 2: Create your own icons
1. Design a square icon (512x512 recommended)
2. Use an online tool like https://realfavicongenerator.net/
3. Generate 192x192 and 512x512 versions
4. Place them in `client/public/`

### Option 3: Use ImageMagick (if installed)
```bash
# Create simple colored icons
convert -size 192x192 xc:#3b82f6 -pointsize 72 -fill white -gravity center -annotate +0+0 "PWA" client/public/icon-192x192.png
convert -size 512x512 xc:#3b82f6 -pointsize 192 -fill white -gravity center -annotate +0+0 "PWA" client/public/icon-512x512.png
```

The app will work without icons, but they're required for a proper PWA experience.
