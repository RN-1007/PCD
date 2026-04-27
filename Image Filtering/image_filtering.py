import cv2
import numpy as np
import matplotlib.pyplot as plt

# ======================
# 1. LOAD GAMBAR
# ======================
img = cv2.imread('foto.jpg', 0)

# resize (misal jadi 300x300)
img = cv2.resize(img, (300, 300))

if img is None:
    print("Gambar tidak ditemukan!")
    exit()

# ======================
# 2. TAMBAH NOISE
# ======================
def salt_pepper(img, prob=0.02):
    noisy = img.copy()
    rnd = np.random.rand(*img.shape)
    noisy[rnd < prob] = 0
    noisy[rnd > 1 - prob] = 255
    return noisy

sp_noise = salt_pepper(img)

gauss = np.random.normal(0, 25, img.shape)
gauss_noise = img + gauss
gauss_noise = np.clip(gauss_noise, 0, 255).astype(np.uint8)

# ======================
# 3. FILTER SPASIAL
# ======================
mean3 = cv2.blur(sp_noise, (3,3))
mean5 = cv2.blur(sp_noise, (5,5))
median = cv2.medianBlur(sp_noise, 3)
laplacian = cv2.Laplacian(img, cv2.CV_64F)

kernel = np.array([[0,-1,0],
                   [-1,5,-1],
                   [0,-1,0]])
sharpen = cv2.filter2D(img, -1, kernel)

# ======================
# 4. FILTER FREKUENSI
# ======================
f = np.fft.fft2(img)
fshift = np.fft.fftshift(f)
rows, cols = img.shape
crow, ccol = rows//2, cols//2

u, v = np.meshgrid(np.arange(cols), np.arange(rows))
D = np.sqrt((u-ccol)**2 + (v-crow)**2)
D0 = 50
n = 2

# Low Pass
H_ilpf = np.where(D <= D0, 1, 0)
H_blpf = 1 / (1 + (D/D0)**(2*n))
H_glpf = np.exp(-(D**2)/(2*(D0**2)))

# High Pass (Inverse dari Low Pass)
H_ihpf = 1 - H_ilpf
H_bhpf = 1 - H_blpf
H_ghpf = 1 - H_glpf

def apply_filter(H):
    G = fshift * H
    img_back = np.fft.ifft2(np.fft.ifftshift(G))
    return np.abs(img_back)

ilpf_img = apply_filter(H_ilpf)
blpf_img = apply_filter(H_blpf)
glpf_img = apply_filter(H_glpf)
ihpf_img = apply_filter(H_ihpf)
bhpf_img = apply_filter(H_bhpf)
ghpf_img = apply_filter(H_ghpf)

# ======================
# 5. TAMPILKAN (14 OUTPUT)
# ======================
plt.figure(figsize=(15,12))

titles = [
    "1. Citra Asli", "2. Salt & Pepper Noise", "3. Gaussian Noise",
    "4. Mean 3x3", "5. Mean 5x5", "6. Median Filter",
    "7. Laplacian", "8. Sharpen", "9. ILPF",
    "10. BLPF", "11. GLPF", "12. IHPF",
    "13. BHPF", "14. GHPF"
]

images = [
    img, sp_noise, gauss_noise,
    mean3, mean5, median,
    laplacian, sharpen, ilpf_img,
    blpf_img, glpf_img, ihpf_img,
    bhpf_img, ghpf_img
]

for i in range(14):
    plt.subplot(4,4,i+1)
    plt.imshow(images[i], cmap='gray')
    plt.title(titles[i])
    plt.axis('off')

plt.tight_layout()
plt.show()