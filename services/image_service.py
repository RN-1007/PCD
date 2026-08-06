import io
import zipfile
from PIL import Image

def build_zip_from_files(uploaded_files):
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
        for file_obj in uploaded_files:
            file_bytes = file_obj.read()
            filename = file_obj.filename or "image.webp"
            zip_file.writestr(filename, file_bytes)
    zip_buffer.seek(0)
    return zip_buffer

def convert_images_to_webp_zip(uploaded_files, quality=80):
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
        for file_obj in uploaded_files:
            try:
                image = Image.open(file_obj.stream)
                
                # Handle mode conversions
                if image.mode in ("RGBA", "P") and (file_obj.filename or '').lower().endswith(('.jpg', '.jpeg')):
                    image = image.convert("RGB")

                webp_buffer = io.BytesIO()
                image.save(webp_buffer, format="WEBP", quality=quality)
                webp_buffer.seek(0)

                filename = file_obj.filename or "image.png"
                base_name = filename.rsplit('.', 1)[0] if '.' in filename else filename
                webp_filename = f"{base_name}.webp"

                zip_file.writestr(webp_filename, webp_buffer.getvalue())
            except Exception as e:
                print(f"Error processing {file_obj.filename}: {e}")
    
    zip_buffer.seek(0)
    return zip_buffer
