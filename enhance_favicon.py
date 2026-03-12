from PIL import Image, ImageFilter

def create_enhanced_favicon():
    img_path = r"e:\CyberCafeNew\frontBackend\public\navbarLogo.png"
    out_path = r"e:\CyberCafeNew\frontBackend\public\favicon-enhanced.png"
    
    img = Image.open(img_path).convert("RGBA")
    
    # 1. Crop to bounding box
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
        
    # 2. Make it a square with some padding
    max_dim = max(img.width, img.height)
    padded_size = int(max_dim * 1.1) # Less padding, bigger logo
    
    square_img = Image.new("RGBA", (padded_size, padded_size), (0, 0, 0, 0))
    x_offset = (padded_size - img.width) // 2
    y_offset = (padded_size - img.height) // 2
    square_img.paste(img, (x_offset, y_offset), img)
    
    # 3. Create a dark drop shadow (glow)
    # Extract alpha channel, make it solid black
    r, g, b, alpha = square_img.split()
    black_rgb = Image.new("RGB", square_img.size, (0, 0, 0))
    black_shadow = Image.merge("RGBA", (*black_rgb.split(), alpha))
    
    # Blur it strong
    shadow_blurred1 = black_shadow.filter(ImageFilter.GaussianBlur(radius=max_dim * 0.02))
    shadow_blurred2 = black_shadow.filter(ImageFilter.GaussianBlur(radius=max_dim * 0.05))
    shadow_blurred3 = black_shadow.filter(ImageFilter.GaussianBlur(radius=max_dim * 0.08))
    
    # Composite multiple times for a darker shadow
    final_img = Image.alpha_composite(Image.new("RGBA", square_img.size, (0,0,0,0)), shadow_blurred3)
    final_img = Image.alpha_composite(final_img, shadow_blurred2)
    final_img = Image.alpha_composite(final_img, shadow_blurred1)
    final_img = Image.alpha_composite(final_img, square_img)
    
    final_img.save(out_path)
    print("Favicon enhanced and saved.")

if __name__ == "__main__":
    create_enhanced_favicon()
