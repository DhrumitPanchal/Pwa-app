from PIL import Image, ImageDraw, ImageFont
import os

def create_pwa_icon(size, filename):
    # Create a new image with blue background
    img = Image.new('RGB', (size, size), color='#3b82f6')
    draw = ImageDraw.Draw(img)
    
    # Draw a simple notification bell
    # Bell body (arc/triangle shape)
    bell_center_x = size // 2
    bell_center_y = size // 2
    bell_radius = size // 4
    
    # Draw bell using ellipse and polygon
    draw.ellipse(
        [bell_center_x - bell_radius, bell_center_y - bell_radius,
         bell_center_x + bell_radius, bell_center_y + bell_radius//2],
        fill='white'
    )
    
    # Bell bottom
    draw.rectangle(
        [bell_center_x - bell_radius//4, bell_center_y + bell_radius//2,
         bell_center_x + bell_radius//4, bell_center_y + bell_radius],
        fill='white'
    )
    
    # Bell clapper
    draw.ellipse(
        [bell_center_x - bell_radius//8, bell_center_y + bell_radius - bell_radius//8,
         bell_center_x + bell_radius//8, bell_center_y + bell_radius + bell_radius//8],
        fill='white'
    )
    
    # Save the image
    img.save(filename, 'PNG')
    print(f'Created {filename} ({size}x{size})')

# Create icons
public_dir = os.path.join(os.path.dirname(__file__), 'public')
create_pwa_icon(192, os.path.join(public_dir, 'icon-192x192.png'))
create_pwa_icon(512, os.path.join(public_dir, 'icon-512x512.png'))

print('Icons generated successfully!')
