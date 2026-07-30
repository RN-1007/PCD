import os
import tempfile
import zipfile
import shutil
import tkinter as tk
from tkinter import filedialog, messagebox
from PIL import Image

def process_image(file_path, output_dir):
    try:
        img = Image.open(file_path)
        base_name = os.path.basename(file_path)
        name_without_ext = os.path.splitext(base_name)[0]
        output_path = os.path.join(output_dir, f"{name_without_ext}.webp")
        
        img.save(output_path, 'webp', lossless=True)
        return True, base_name, f"{name_without_ext}.webp"
    except Exception as e:
        print(f"[ERROR] Gagal mengonversi {file_path}: {e}")
        return False, None, None

def convert_to_webp():
   
    root = tk.Tk()
    root.withdraw()
    
    
    messagebox.showinfo("Pilih Input", "Silakan pilih file gambar (bisa multi-select) ATAU pilih satu/beberapa file ZIP yang berisi gambar-gambar.")
    
    input_files = filedialog.askopenfilenames(
        title="Pilih File Gambar atau ZIP",
        filetypes=[
            ("Image or ZIP Files", "*.png *.jpg *.jpeg *.bmp *.tiff *.gif *.zip"),
            ("All Files", "*.*")
        ]
    )
    
    if not input_files:
        print("Tidak ada file yang dipilih. Dibatalkan.")
        return

    images_to_process = []
    temp_in_dir = None
    
    
    for fpath in input_files:
        if fpath.lower().endswith('.zip'):
            if not temp_in_dir:
                temp_in_dir = tempfile.mkdtemp()
            try:
                print(f"Mengekstrak isi ZIP: {fpath} ...")
                with zipfile.ZipFile(fpath, 'r') as zip_ref:
                    zip_ref.extractall(temp_in_dir)
            except zipfile.BadZipFile:
                messagebox.showerror("Error", f"File ZIP rusak atau tidak valid:\n{fpath}")
                continue
        else:
            images_to_process.append(fpath)

  
    if temp_in_dir:
        for root_dir, _, files in os.walk(temp_in_dir):
            for file in files:
                if file.lower().endswith(('.png', '.jpg', '.jpeg', '.bmp', '.tiff', '.gif')):
                    images_to_process.append(os.path.join(root_dir, file))

    if not images_to_process:
        messagebox.showerror("Error", "Tidak ditemukan gambar valid untuk dikonversi di dalam file/zip yang dipilih.")
        if temp_in_dir:
            shutil.rmtree(temp_in_dir)
        return

  
    is_zip_output = messagebox.askyesno("Pilih Output", "Apakah Anda ingin MENGEKSPOR/MENYIMPAN hasilnya ke dalam satu file ZIP?\n\n- Klik 'Yes' untuk ekspor ke .zip\n- Klik 'No' untuk simpan ke dalam sebuah Folder")
    
    output_path = ""
    if is_zip_output:
        output_path = filedialog.asksaveasfilename(
            title="Simpan Sebagai File ZIP",
            defaultextension=".zip",
            filetypes=[("ZIP Files", "*.zip")]
        )
    else:
        messagebox.showinfo("Pilih Folder", "Silakan pilih folder tujuan untuk menyimpan gambar WEBP.")
        output_path = filedialog.askdirectory(title="Pilih Folder Output")
        
    if not output_path:
        print("Output tidak ditentukan. Dibatalkan.")
        if temp_in_dir:
            shutil.rmtree(temp_in_dir)
        return


    work_out_dir = tempfile.mkdtemp() if is_zip_output else output_path
    os.makedirs(work_out_dir, exist_ok=True)
    
    count = 0
    total = len(images_to_process)
    print(f"Memulai konversi {total} gambar ke format WEBP (Lossless)...")
    
    for fpath in images_to_process:
        success, orig_name, new_name = process_image(fpath, work_out_dir)
        if success:
            count += 1
            print(f"[{count}/{total}] Berhasil: {orig_name} -> {new_name}")

   
    if is_zip_output:
        print(f"Membungkus hasil ke dalam file ZIP: {output_path} ...")
        base_zip_path = os.path.splitext(output_path)[0]
        shutil.make_archive(base_zip_path, 'zip', work_out_dir)
        shutil.rmtree(work_out_dir)
        
    if temp_in_dir:
        shutil.rmtree(temp_in_dir)

    print(f"\nSelesai! {count} dari {total} gambar berhasil dikonversi.")
    messagebox.showinfo("Sukses", f"Konversi selesai!\n{count} gambar berhasil dikonversi dan disimpan di:\n{output_path}")

if __name__ == "__main__":
    convert_to_webp()
