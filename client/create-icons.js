// Simple script to create basic PWA icons using canvas in Node.js
// This creates base64 data that can be converted to PNG

const fs = require('fs');
const path = require('path');

// Create a simple SVG icon
function createSVGIcon(size) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#3b82f6"/>
  <g transform="translate(${size/2}, ${size/2})">
    <!-- Bell icon -->
    <path d="M -${size/6} -${size/12} Q -${size/6} -${size/4} 0 -${size/4} Q ${size/6} -${size/4} ${size/6} -${size/12} L ${size/6} ${size/8} L -${size/6} ${size/8} Z" fill="white"/>
    <circle cx="0" cy="${size/6}" r="${size/20}" fill="white"/>
    <rect x="-${size/24}" y="-${size/3.5}" width="${size/12}" height="${size/12}" rx="${size/24}" fill="white"/>
  </g>
</svg>`;
}

// Save SVG files
const publicDir = path.join(__dirname, 'public');

// Create 192x192 SVG
fs.writeFileSync(
    path.join(publicDir, 'icon-192x192.svg'),
    createSVGIcon(192)
);

// Create 512x512 SVG
fs.writeFileSync(
    path.join(publicDir, 'icon-512x512.svg'),
    createSVGIcon(512)
);

console.log('SVG icons created!');
console.log('Note: You need to convert these SVG files to PNG.');
console.log('You can use an online converter like https://cloudconvert.com/svg-to-png');
console.log('Or install sharp: npm install sharp');
