from PIL import Image, ImageDraw

def make_round_favicon(input_path, output_path):
    # Open the image
    img = Image.open(input_path).convert("RGBA")
    
    # Get dimensions
    w, h = img.size
    
    # We want it as big as possible. So let's crop to a square first.
    # We will just take the min dimension as the diameter.
    min_dim = min(w, h)
    left = (w - min_dim) / 2
    top = (h - min_dim) / 2
    right = (w + min_dim) / 2
    bottom = (h + min_dim) / 2
    
    img = img.crop((left, top, right, bottom))
    w, h = img.size # should be min_dim x min_dim
    
    # Create a circular mask
    mask = Image.new("L", (w, h), 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((0, 0, w, h), fill=255)
    
    # Apply the mask
    result = Image.new("RGBA", (w, h), (0,0,0,0))
    result.paste(img, (0,0), mask)
    
    # Save as PNG
    result.save(output_path, format="PNG")

make_round_favicon(
    r"c:\Users\reyes\Desktop\PROYECTOAURUM\AURUM\assets\images\logos\logo01.jpeg",
    r"c:\Users\reyes\Desktop\PROYECTOAURUM\AURUM\assets\images\logos\logo01_round.png"
)
print("Round favicon created.")
