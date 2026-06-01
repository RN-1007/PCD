import cv2
import numpy as np
import matplotlib.pyplot as plt
import os
from typing import Tuple, Optional

def load_and_convert_image(image_path: str) -> Optional[Tuple[np.ndarray, np.ndarray]]:
    """
    Memuat gambar dari path dan mengonversinya ke RGB dan ruang warna L*a*b*.

    Args:
        image_path (str): Path ke file gambar.

    Returns:
        Optional[Tuple[np.ndarray, np.ndarray]]: Tuple berisi citra RGB dan citra L*a*b*.
                                                 Jika gagal memuat, mengembalikan None.
    """
    image = cv2.imread(image_path)
    if image is None:
        print(f"Gagal memuat gambar: {image_path}")
        return None

    # OpenCV membaca gambar dalam format BGR. Konversi ke RGB untuk visualisasi Matplotlib
    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    
    # Konversi gambar ke ruang warna L*a*b*
    image_lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
    
    return image_rgb, image_lab

def perform_kmeans_clustering(image_lab: np.ndarray, k: int = 3) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
    """
    Melakukan K-Means clustering pada citra menggunakan komponen a* dan b* 
    dari ruang warna L*a*b* agar lebih tahan terhadap variasi intensitas cahaya (L).

    Args:
        image_lab (np.ndarray): Citra dalam ruang warna L*a*b*.
        k (int): Jumlah klaster (K) untuk algoritma K-Means.

    Returns:
        Tuple[np.ndarray, np.ndarray, np.ndarray]: 
            - center: Pusat klaster.
            - label: Label setiap piksel.
            - segmented_image: Citra hasil rekonstruksi klaster.
    """
    # Ekstraksi komponen 'a' dan 'b'
    # Komponen 'a' (hijau - merah) dan 'b' (biru - kuning)
    ab_channels = image_lab[:, :, 1:] 
    
    # Reshape citra menjadi larik piksel 2D
    pixel_values = ab_channels.reshape((-1, 2))
    
    # Konversi ke tipe float32 sesuai kebutuhan OpenCV K-Means
    pixel_values = np.float32(pixel_values)
    
    # Definisikan kriteria penghentian (epsilon dan iterasi maksimum)
    # cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER
    criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 100, 0.2)
    
    # Jalankan algoritma K-Means
    _, label, center = cv2.kmeans(pixel_values, k, None, criteria, 10, cv2.KMEANS_RANDOM_CENTERS)
    
    # Konversi center kembali ke uint8
    center = np.uint8(center)
    
    # Petakan piksel ke pusat klaster masing-masing
    segmented_data = center[label.flatten()]
    
    # Reshape kembali ke dimensi asli citra (tanpa channel L)
    segmented_image = segmented_data.reshape((image_lab.shape[0], image_lab.shape[1], 2))
    
    return center, label, segmented_image

def identify_tomato_cluster(center: np.ndarray, label: np.ndarray, image_shape: Tuple[int, int], color_threshold: float = 10.0) -> np.ndarray:
    """
    Mengidentifikasi klaster yang berisi objek tomat berdasarkan jarak dari warna abu-abu.
    Karena tomat merah menuju kuning, kita memilih klaster yang memiliki nilai krominansi
    cukup jauh dari abu-abu (128, 128) dan memiliki komponen merah/kuning (a/b > 120).

    Args:
        center (np.ndarray): Pusat klaster dari K-Means. (Berisi komponen a dan b)
        label (np.ndarray): Label klaster tiap piksel.
        image_shape (Tuple[int, int]): Dimensi (tinggi, lebar) citra.
        color_threshold (float): Batas toleransi jarak dari warna abu-abu. 
                                 Semakin kecil, semakin banyak warna (termasuk kuning/pudar) yang masuk.

    Returns:
        np.ndarray: Mask biner dari klaster yang teridentifikasi sebagai tomat (255) dan background (0).
    """
    label_reshaped = label.reshape(image_shape)
    mask = np.zeros(image_shape, dtype=np.uint8)
    
    for i in range(len(center)):
        a_val = center[i, 0]
        b_val = center[i, 1]
        
        # Jarak Euclidean dari warna abu-abu murni (128, 128)
        dist_from_gray = np.sqrt((float(a_val) - 128)**2 + (float(b_val) - 128)**2)
        
        # Tomat merah/kuning cenderung memiliki a atau b yang lebih besar dari abu-abu
        # Jika jaraknya melebihi threshold dan tidak mengarah ke warna dingin (biru/hijau), maka itu tomat
        if dist_from_gray > color_threshold and (a_val > 120 or b_val > 120):
            mask[label_reshaped == i] = 255
            
    # Fallback: Jika threshold terlalu ketat dan tidak ada yang terpilih, pilih yang paling merah ('a' tertinggi)
    if np.max(mask) == 0:
        a_channel_centers = center[:, 0]
        tomato_cluster_idx = np.argmax(a_channel_centers)
        mask[label_reshaped == tomato_cluster_idx] = 255
    
    return mask

def extract_object_with_mask(image_rgb: np.ndarray, mask: np.ndarray) -> np.ndarray:
    """
    Mengekstraksi objek tomat dari gambar asli menggunakan mask biner.

    Args:
        image_rgb (np.ndarray): Citra asli dalam format RGB.
        mask (np.ndarray): Mask biner objek.

    Returns:
        np.ndarray: Citra tomat yang diekstraksi tanpa latar belakang.
    """
    # Lakukan bitwise AND antara citra asli dan mask biner
    extracted_image = cv2.bitwise_and(image_rgb, image_rgb, mask=mask)
    return extracted_image

def visualize_results(image_rgb: np.ndarray, mask: np.ndarray, extracted_image: np.ndarray, output_path: Optional[str] = None):
    """
    Menampilkan perbandingan Citra Asli, Mask Biner, dan Hasil Ekstraksi Akhir menggunakan Matplotlib.

    Args:
        image_rgb (np.ndarray): Citra asli dalam format RGB.
        mask (np.ndarray): Mask biner.
        extracted_image (np.ndarray): Hasil ekstraksi akhir.
        output_path (Optional[str]): Path untuk menyimpan hasil plot gambar. Jika tidak ada, hanya ditampilkan.
    """
    plt.figure(figsize=(15, 5))
    
    # Plot 1: Citra Asli
    plt.subplot(1, 3, 1)
    plt.imshow(image_rgb)
    plt.title("Citra Asli")
    plt.axis('off')
    
    # Plot 2: Mask Biner
    plt.subplot(1, 3, 2)
    plt.imshow(mask, cmap='gray')
    plt.title("Mask Biner")
    plt.axis('off')
    
    # Plot 3: Hasil Ekstraksi Akhir
    plt.subplot(1, 3, 3)
    plt.imshow(extracted_image)
    plt.title("Hasil Ekstraksi Akhir")
    plt.axis('off')
    
    plt.tight_layout()
    
    if output_path:
        plt.savefig(output_path)
        plt.close()
    else:
        plt.show()

def process_single_image(image_path: str, k: int, output_dir: str):
    """
    Memproses satu gambar untuk segmentasi tomat dan menyimpan visualisasinya.

    Args:
        image_path (str): Path gambar yang akan diproses.
        k (int): Jumlah klaster K-Means.
        output_dir (str): Folder untuk menyimpan hasil visualisasi.
    """
    filename = os.path.basename(image_path)
    print(f"Memproses gambar: {filename}")
    
    # 1. Preprocessing
    result = load_and_convert_image(image_path)
    if result is None:
        return
    image_rgb, image_lab = result
    
    # 2 & 3. Ekstraksi Fitur dan K-Means Clustering
    center, label, _ = perform_kmeans_clustering(image_lab, k=k)
    
    # 4 & 5. Masking & Ekstraksi
    image_shape = image_rgb.shape[:2]
    mask = identify_tomato_cluster(center, label, image_shape)
    
    # Operasi morfologi (opsional) untuk merapikan noise pada mask
    kernel = np.ones((5, 5), np.uint8)
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel, iterations=1)
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel, iterations=2)
    
    extracted_image = extract_object_with_mask(image_rgb, mask)
    
    # Simpan hasil plot
    output_path = os.path.join(output_dir, f"result_{filename}")
    visualize_results(image_rgb, mask, extracted_image, output_path)

def main():
    """
    Fungsi utama.
    """
    # Direktori saat ini diasumsikan d:\Coding\PCD\Image Segmentation\Tugas Akhir
    base_dir = os.path.dirname(os.path.abspath(__file__)) 
    
    # Namun skrip ini akan ditempatkan di Input sesuai permintaan todo.md "buat program segmentasi image di folder 'input'"
    # Jika skrip ada di dalam 'Input', maka kita naik satu folder ke atas
    if os.path.basename(base_dir).lower() == 'input':
        base_dir = os.path.dirname(base_dir)
        
    dataset_dir = os.path.join(base_dir, "Dataset")
    output_dir = os.path.join(base_dir, "Output")
    
    # Buat folder Output jika belum ada
    os.makedirs(output_dir, exist_ok=True)
    
    # Parameter dinamis jumlah cluster (K)
    k_clusters = 3
    
    image_extensions = {".jpg", ".jpeg", ".png", ".bmp"}
    
    processed_any = False
    
    if os.path.exists(dataset_dir):
        for file in os.listdir(dataset_dir):
            ext = os.path.splitext(file)[1].lower()
            if ext in image_extensions:
                image_path = os.path.join(dataset_dir, file)
                process_single_image(image_path, k=k_clusters, output_dir=output_dir)
                processed_any = True
                
    if not processed_any:
        print(f"Tidak ada gambar yang ditemukan di dalam folder {dataset_dir}.")
    else:
        print(f"\nProses selesai. Hasil telah disimpan di: {output_dir}")

if __name__ == "__main__":
    main()
