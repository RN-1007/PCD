import cv2
import numpy as np
import matplotlib.pyplot as plt
import glob 




def process_leaf_image(image_path):

    img = cv2.imread(image_path)
    if img is None:
        print("Gambar tidak ditemukan. Cek path file Anda.")
        return
        
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img_resized = cv2.resize(img_rgb, (256, 256))
    gray = cv2.cvtColor(img_resized, cv2.COLOR_RGB2GRAY)
    
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)

    
    sobel_x = cv2.Sobel(blurred, cv2.CV_64F, 1, 0, ksize=3)
    sobel_y = cv2.Sobel(blurred, cv2.CV_64F, 0, 1, ksize=3)
    sobel = np.uint8(np.absolute(cv2.magnitude(sobel_x, sobel_y)))
    
    
    canny = cv2.Canny(blurred, threshold1=50, threshold2=150)
    
    kernelx_prewitt = np.array([[1,1,1],[0,0,0],[-1,-1,-1]])
    kernely_prewitt = np.array([[-1,0,1],[-1,0,1],[-1,0,1]])
    prewitt_x = cv2.filter2D(blurred, -1, kernelx_prewitt)
    prewitt_y = cv2.filter2D(blurred, -1, kernely_prewitt)
    prewitt = prewitt_x + prewitt_y
    
    kernelx_roberts = np.array([[1, 0], [0, -1]])
    kernely_roberts = np.array([[0, 1], [-1, 0]])
    roberts_x = cv2.filter2D(blurred, -1, kernelx_roberts)
    roberts_y = cv2.filter2D(blurred, -1, kernely_roberts)
    roberts = roberts_x + roberts_y

   
    _, thresh = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
    

    pixel_values = img_resized.reshape((-1, 3))
    pixel_values = np.float32(pixel_values)
    

    criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 100, 0.2)
    k = 2 
    _, labels, centers = cv2.kmeans(pixel_values, k, None, criteria, 10, cv2.KMEANS_RANDOM_CENTERS)
    
    centers = np.uint8(centers)
    segmented_kmeans = centers[labels.flatten()]
    segmented_kmeans = segmented_kmeans.reshape(img_resized.shape)

    
    titles = ['Original', 'Grayscale', 'Gaussian Blur', 
              'Sobel', 'Canny', 'Prewitt', 'Roberts', 
              'Thresholding (Otsu)', 'K-Means Segmented']
    images = [img_resized, gray, blurred, 
              sobel, canny, prewitt, roberts, 
              thresh, segmented_kmeans]

    plt.figure(figsize=(15, 10))
    for i in range(9):
        plt.subplot(3, 3, i+1)
        if len(images[i].shape) == 3:
            plt.imshow(images[i])
        else:
            plt.imshow(images[i], cmap='gray')
        plt.title(titles[i])
        plt.axis('off')
    
    plt.tight_layout()
    plt.show()

path_folder = 'daun/*.jpg' 
list_gambar = glob.glob(path_folder)


if not list_gambar:
    print("Tidak ada gambar ditemukan! Cek nama folder dan ekstensi filenya (.jpg/.png).")

for file_gambar in list_gambar:
    print (f'memproses gambar {file_gambar}')
    process_leaf_image(file_gambar)