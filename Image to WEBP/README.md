# Image to WEBP Converter (Lossless)

Tool sederhana berbasis Python untuk mengubah gambar dengan format apa pun (PNG, JPG, JPEG, BMP, dsb) menjadi format **WEBP** tanpa mengurangi resolusi atau kualitas gambar sedikitpun. Tool ini sangat cocok untuk optimasi aset *website* modern.

## Fitur Utama
- **Lossless Conversion**: Menggunakan parameter `lossless=True` yang menjamin 100% piksel dan resolusi asli dipertahankan.
- **Dukungan ZIP (Impor & Ekspor)**: 
  - **Impor**: Anda bisa langsung memilih file berformat `.zip` yang berisi banyak gambar di dalamnya. Program akan secara otomatis mengekstraknya dan mengonversi semua gambar di dalam zip tersebut.
  - **Ekspor**: Anda bisa memilih untuk membungkus (*packing*) semua gambar yang sudah dikonversi ke dalam satu file `.zip` agar lebih rapi.
- **Bulk Convert**: Anda bisa memilih banyak gambar secara langsung.
- **GUI Interaktif**: Dilengkapi dengan jendela pop-up interaktif untuk memudahkan proses.

## Persyaratan (Prerequisites)
Pastikan Anda sudah menginstal **Python** di komputer Anda. Anda juga memerlukan *library* eksternal yaitu **Pillow**.

Untuk menginstalnya, buka Terminal atau Command Prompt (CMD) dan jalankan perintah berikut:
```bash
pip install Pillow
```

## Cara Penggunaan
1. Buka Terminal atau Command Prompt.
2. Arahkan direktori terminal ke folder tempat tool ini berada:
3. Jalankan script Python dengan perintah:
   ```bash
   python image_to_webp.py
   ```
4. Jendela dialog input akan muncul. Anda bisa memilih file-file gambar biasa atau **langsung memilih file .zip** yang di dalamnya terdapat banyak gambar.
5. Setelah itu, akan muncul pertanyaan:
   - Klik **Yes** jika Anda ingin semua hasil konversi langsung dibungkus menjadi sebuah file `output.zip`.
   - Klik **No** jika Anda ingin hasil konversi diletakkan biasa pada suatu Folder.
6. Tunggu prosesnya selesai. Status pengerjaan bisa dilihat pada tampilan terminal.
7. Notifikasi pop-up "Sukses" akan muncul setelah selesai!
