# PWA Icons Setup

## Required Icons

To complete the PWA setup, you need to create the following icon files in the `public` folder:

### Icon Files:
- `icon-192x192.png` - 192x192px PNG image
- `icon-512x512.png` - 512x512px PNG image

## Quick Generation Options

### Option 1: Use a Generator Tool
1. Visit [PWA Asset Generator](https://progressier.com/pwa-icons-generator)
2. Upload your logo or icon
3. Generate all required sizes
4. Download and place in `public` folder

### Option 2: Use Icon.svg
The `icon.svg` file is already created in the public folder with a nice gradient design.
You can convert it to PNG:

1. Open icon.svg in a browser
2. Use a screenshot tool or online converter
3. Export as PNG in required sizes (192x192 and 512x512)

### Option 3: Create from Scratch
Use any graphic design tool (Figma, Canva, Photoshop):
1. Create a 512x512px canvas
2. Design an icon with the app's gradient (indigo to purple)
3. Add a document/quiz symbol
4. Export as PNG in both sizes

## Design Recommendations

- Use a **gradient background** from `#6366f1` (indigo) to `#a855f7` (purple)
- Include a **quiz/document icon** in white
- Keep it **simple and recognizable** at small sizes
- Use **rounded corners** (128px radius for 512px icon)
- Ensure good **contrast** for visibility

## Current Fallback

The app will work without these icons, but:
- PWA installation will use default browser icons
- Push notifications will use default icons
- The experience won't be as polished

## To Test PWA

After adding icons:
1. Run `npm run dev`
2. Open Chrome DevTools > Application > Manifest
3. Verify icons are loaded correctly
4. Test installation from browser menu
