# Prompt: Implementasi K-Means Clustering untuk Segmentasi Citra Tomat

Bertindaklah sebagai ahli Computer Vision dan Software Engineer Python. Buatkan saya kode Python untuk proyek segmentasi citra digital. 

Fokus utama proyek ini adalah mengimplementasikan algoritma K-Means Clustering secara *unsupervised* untuk memisahkan objek buah tomat dari latar belakangnya. Kode harus ditulis dengan pendekatan arsitektur yang bersih dan modular.

## Spesifikasi Lingkungan & Library
* **Bahasa Pemrograman:** Python
* **Library Pemrosesan:** OpenCV (`cv2`) dan NumPy
* **Library Visualisasi:** Matplotlib

## Tahapan Algoritma yang Harus Diimplementasikan

1. **Preprocessing:** Buat fungsi untuk memuat gambar dan mengonversi citra dari format asli menjadi ruang warna L*a*b*.
2. **Ekstraksi Fitur Warna:** Pastikan algoritma dapat memanfaatkan pemisahan komponen *Lightness* (L) dari komponen krominansi (a dan b) agar segmentasi dapat lebih tahan terhadap variasi intensitas cahaya.
3. **K-Means Clustering:** Implementasikan algoritma K-Means menggunakan OpenCV untuk membagi wilayah citra. Terapkan parameter iterasi maksimum dan kriteria penghentian (*epsilon*) untuk menjamin konvergensi algoritma. 
4. **Parameter Dinamis:** Buat parameter jumlah *cluster* (K) secara dinamis agar mudah diubah-ubah saat saya melakukan eksperimen pencarian konfigurasi paling optimal.
5. **Masking & Ekstraksi:** Buat mekanisme untuk mengidentifikasi *cluster* yang berisi objek tomat. Gunakan *cluster* terpilih tersebut untuk menghasilkan *mask* biner, lalu aplikasikan *mask* tersebut untuk mengekstraksi objek tomat asli tanpa latar belakang.

## Struktur Kode yang Diharapkan

* Pisahkan setiap langkah logika (membaca citra, konversi warna, eksekusi K-Means, masking, dan penampilan hasil) ke dalam fungsi-fungsi modular.
* Jangan menggabungkan semua logika dalam satu blok *script* panjang. 
* Buat satu fungsi utama (`main()`) yang mengambil satu sampel gambar, memanggil modul-modul di atas secara berurutan, lalu menampilkan *plot* visualisasi yang membandingkan: Citra Asli, Mask Biner yang dihasilkan, dan Hasil Ekstraksi Akhir.
* Berikan *type hinting* dan komentar penjelasan (*docstrings*) yang rapi pada setiap fungsi.
* buat agar bisa menerima banyak gambar dari folder 'Dataset' dan menampilkan hasilnya. simpan hasil di folder 'Output'
* buat program segmentasi image di folder 'input'