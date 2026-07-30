# Video to Frames Converter (Sequence Scroll Tool)

Tool sederhana berbasis Python untuk mengekstrak setiap frame dari sebuah video menjadi kumpulan gambar individu. Tool ini sangat berguna untuk membuat aset gambar yang akan digunakan pada animasi efek **Sequence Scroll** di website, di mana kualitas gambar perlu dipertahankan 100% dari aslinya.

## Fitur Utama
- **Kualitas 100% (Lossless)**: Menyimpan frame dalam format `.png` untuk memastikan tidak ada penurunan resolusi atau kualitas gambar.
- **Ekspor ke ZIP**: Anda kini memiliki opsi untuk menyimpan semua hasil ekstraksi gambar (bisa mencapai ratusan atau ribuan frame) langsung dibungkus rapi ke dalam 1 file `.zip`.
- **GUI Interaktif**: Memiliki jendela pop-up untuk memudahkan pengguna memilih file video dan folder/file tujuan.
- **Penamaan Urut Otomatis**: Gambar yang dihasilkan akan dinamai secara berurutan dengan format *padding* yang rapi (misalnya: `frame_00001.png`, `frame_00002.png`). Urutan yang rapi ini sangat penting agar sequence animasi tidak berantakan.

## Persyaratan (Prerequisites)
Pastikan Anda sudah menginstal **Python** di komputer Anda. Anda juga memerlukan *library* eksternal yaitu **OpenCV**.

Untuk menginstal OpenCV, buka Terminal atau Command Prompt (CMD) dan jalankan perintah berikut:
```bash
pip install opencv-python
```

## Cara Penggunaan
1. Buka Terminal atau Command Prompt.
2. Arahkan direktori terminal ke folder tempat tool ini berada:
   ```bash
   cd "d:\Coding\PCD\Sequence Scroll"
   ```
3. Jalankan script Python dengan perintah:
   ```bash
   python video_to_frames.py
   ```
4. Jendela dialog akan muncul. Klik **OK**.
5. **Pilih File Video**: Jendela sistem akan terbuka. Cari dan pilih video yang ingin Anda ekstrak framenya (mendukung format: `.mp4`, `.avi`, `.mov`, dll).
6. **Pilih Output**: Akan muncul dialog pertanyaan apakah Anda ingin mengekspor hasilnya ke dalam file ZIP.
   - Klik **Yes** jika ingin membungkus semua frame yang dihasilkan menjadi sebuah file `.zip`. (Anda akan diminta memilih lokasi simpan file ZIP tersebut).
   - Klik **No** jika ingin menyimpannya langsung pada suatu Folder biasa. (Anda akan diminta memilih Folder mana yang digunakan).
7. Tunggu proses ekstraksi selesai. Anda dapat melihat progres ekstraksinya melalui terminal. 
8. Sebuah jendela notifikasi "Sukses" akan muncul setelah semua frame berhasil disimpan!
