import os
import glob
import time
import numpy as np
from PIL import Image

# Import PyTorch dan Transformers
import torch
from transformers import Swin2SRForImageSuperResolution, Swin2SRImageProcessor

def main():
    input_folder = "sequence"
    output_folder = "sequence_hasil"
    
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)
        
    print("Mengecek sistem GPU (NVIDIA CUDA)...")
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    
    if device.type == 'cuda':
        print(f"✅ GPU Aktif! Menggunakan: {torch.cuda.get_device_name(0)}")
    else:
        print("❌ GPU CUDA tidak terdeteksi.")
        return

    print("\nMemuat Model AI PyTorch: Swin2SR (BSRGAN x4)...")
    model_id = "caidas/swin2SR-realworld-sr-x4-64-bsrgan-psnr"
    
    processor = Swin2SRImageProcessor.from_pretrained(model_id)
    model = Swin2SRForImageSuperResolution.from_pretrained(model_id)
    
    model = model.to(device)
    model.eval() 
    
    image_files = []
    for ext in ('*.jpg', '*.jpeg', '*.png', '*.JPG', '*.JPEG', '*.PNG'):
        image_files.extend(glob.glob(os.path.join(input_folder, ext)))
        
    if not image_files:
        print(f"Tidak ada gambar ditemukan di folder '{input_folder}'")
        return

    print(f"\nDitemukan {len(image_files)} gambar. Memulai Rendering...")
    
    # Batas maksimal total pixel agar tidak meluap dari 8GB VRAM (estimasi batas aman: ~480x480 pixel untuk x4)
    MAX_PIXELS = 500 * 500 

    for i, file_path in enumerate(image_files):
        filename = os.path.basename(file_path)
        print(f"[{i+1}/{len(image_files)}] RTX 4060 sedang merender {filename} ...", end="", flush=True)
        
        start_time = time.time()
        
        try:
            image = Image.open(file_path).convert("RGB")
            
            #  FITUR ANTI-STUCK (VRAM OVERFLOW PROTECTION) 
            width, height = image.size
            if width * height > MAX_PIXELS:
                ratio = (MAX_PIXELS / (width * height)) ** 0.5
                new_w = int(width * ratio)
                new_h = int(height * ratio)
                image = image.resize((new_w, new_h), Image.Resampling.LANCZOS)
                
            inputs = processor(image, return_tensors="pt").to(device)
            
            with torch.no_grad():
                outputs = model(**inputs)
                
            output = outputs.reconstruction.data.squeeze().float().cpu().clamp_(0, 1).numpy()
            output = np.moveaxis(output, source=0, destination=-1)
            output = (output * 255.0).round().astype(np.uint8)
            
            result_img = Image.fromarray(output)
            
            output_path = os.path.join(output_folder, filename)
            result_img.save(output_path)
            
            elapsed = time.time() - start_time
            print(f" Selesai! ({elapsed:.1f} detik)")
            
        except torch.cuda.OutOfMemoryError:
            print(f"\n⚠️ [CUDA OOM] RTX 4060 kehabisan VRAM saat memproses {filename}!")
            torch.cuda.empty_cache()
        except Exception as e:
            print(f"\n❌ Terjadi kesalahan: {e}")
            
    print(f"\nSelesai! Hasil gambar super HD sudah ada di '{output_folder}'.")

if __name__ == "__main__":
    main()
