import cv2
import os
import shutil
import tempfile
import tkinter as tk
from tkinter import filedialog, messagebox

def extract_frames(video_path, output_folder, is_zip_output, zip_path):
    vidcap = cv2.VideoCapture(video_path)
    
    if not vidcap.isOpened():
        messagebox.showerror("Error", f"Tidak dapat membuka file video:\n{video_path}")
        return

    fps = vidcap.get(cv2.CAP_PROP_FPS)
    frame_count = int(vidcap.get(cv2.CAP_PROP_FRAME_COUNT))
    width = int(vidcap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(vidcap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    
    print(f"Info Video: Resolusi {width}x{height} @ {fps:.2f} FPS, Total Frame: {frame_count}")
    
    os.makedirs(output_folder, exist_ok=True)

    count = 0
    success = True
    
    pad_length = len(str(frame_count)) if frame_count > 0 else 5

    print("Memulai proses ekstraksi...")
    while success:
        success, image = vidcap.read()
        if success:
            filename = f"frame_{str(count).zfill(pad_length)}.png"
            filepath = os.path.join(output_folder, filename)
            
            cv2.imwrite(filepath, image)
            count += 1
            
            if count % 50 == 0 or count == frame_count:
                print(f"Mengekstrak {count}/{frame_count} frame...")

    vidcap.release()
    
    final_dest = output_folder
    
    if is_zip_output and zip_path:
        print(f"Membungkus hasil ke dalam file ZIP: {zip_path} ...")
        base_zip_path = os.path.splitext(zip_path)[0]
        shutil.make_archive(base_zip_path, 'zip', output_folder)
        # Hapus folder sementara setelah selesai di zip
        shutil.rmtree(output_folder)
        final_dest = zip_path

    print(f"\nSelesai! {count} frame berhasil disimpan di: {final_dest}")
    messagebox.showinfo("Sukses", f"Ekstraksi selesai!\n{count} frame disimpan di:\n{final_dest}")

def main():
    root = tk.Tk()
    root.withdraw()
    
    messagebox.showinfo("Pilih Video", "Silakan pilih file video yang ingin diconvert menjadi per frame.")
    video_path = filedialog.askopenfilename(
        title="Pilih File Video",
        filetypes=[
            ("Video Files", "*.mp4 *.avi *.mov *.mkv *.flv *.wmv"),
            ("All Files", "*.*")
        ]
    )
    
    if not video_path:
        print("Tidak ada video yang dipilih. Dibatalkan.")
        return

    is_zip_output = messagebox.askyesno("Pilih Output", "Apakah Anda ingin mengekspor/menyimpan hasilnya ke dalam satu file ZIP?\n\n- Klik 'Yes' untuk ekspor ke .zip\n- Klik 'No' untuk simpan ke dalam Folder")
    
    output_folder = ""
    zip_path = ""
    
    if is_zip_output:
        zip_path = filedialog.asksaveasfilename(
            title="Simpan Sebagai File ZIP",
            defaultextension=".zip",
            filetypes=[("ZIP Files", "*.zip")]
        )
        if not zip_path:
            print("Tidak ada lokasi penyimpanan yang dipilih. Dibatalkan.")
            return
        # Gunakan direktori sementara untuk menampung gambar sebelum di-zip
        output_folder = tempfile.mkdtemp()
    else:
        messagebox.showinfo("Pilih Folder Output", "Silakan pilih folder tujuan untuk menyimpan gambar-gambar hasil ekstraksi.")
        output_folder = filedialog.askdirectory(
            title="Pilih Folder Output"
        )
        if not output_folder:
            print("Tidak ada folder yang dipilih. Dibatalkan.")
            return
        
    extract_frames(video_path, output_folder, is_zip_output, zip_path)

if __name__ == "__main__":
    main()
