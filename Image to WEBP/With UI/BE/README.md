# WEBP Converter API (Express.js)

API Backend ini dibuat untuk mengonversi gambar menjadi format WEBP secara *lossless* (tanpa pengurangan kualitas visual). API ini juga mendukung pengiriman dalam bentuk ZIP yang berisi beberapa gambar, yang mana akan otomatis diekstrak, dikonversi, dan dikembalikan ke klien (frontend).

---

## 1. Endpoint: Convert to WEBP

**URL:** `/api/convert-webp`  
**Method:** `POST`  
**Content-Type:** `multipart/form-data`

Mengonversi satu atau banyak file gambar (atau ZIP) ke `.webp`.

### Request Parameters (Body Form-Data)

| Parameter | Tipe Data | Wajib | Deskripsi |
| :--- | :--- | :---: | :--- |
| `files` | `File` (Array/Single) | **Ya** | File gambar (`.png`, `.jpg`, `.jpeg`, `.bmp`, `.tiff`, `.gif`) ATAU file `.zip`. Boleh mengirim banyak file sekaligus (*multiple files*). |
| `asZip` | `String` (`"true"`) | Tidak | Kirim `true` jika kamu **memaksa** hasil akhirnya dibungkus sebagai `converted_images.zip`, meskipun hanya 1 gambar yang di-upload. |

---

### Response 

Tipe *response* dari server dinamis berdasarkan parameter atau jumlah gambar yang diproses.

#### A. Response Jika Hanya 1 Gambar (dan `asZip` tidak aktif)
*   **Status Code:** `200 OK`
*   **Content-Type:** `image/webp`
*   **Deskripsi:** Langsung mengembalikan *binary stream* gambar `.webp`. (Bisa didownload atau langsung ditampilkan di tag `<img>`).

#### B. Response Jika Lebih Dari 1 Gambar (Atau `asZip` = "true")
*   **Status Code:** `200 OK`
*   **Content-Type:** `application/zip`
*   **Deskripsi:** Mengembalikan *binary stream* file `converted_images.zip` yang berisikan semua gambar yang sudah dikonversi.

#### C. Response Error (Gagal)
*   **Status Code:** `400 Bad Request` / `500 Internal Server Error`
*   **Content-Type:** `application/json`
*   **Format Body:**
    ```json
    {
      "error": "Tidak ada file yang diunggah"
    }
    ```

---

## 2. Contoh Penggunaan di Frontend (Fetch API)

Berikut adalah contoh fungsi di sisi Frontend React / Vanilla JavaScript untuk melakukan "Hit" ke Endpoint ini.

```javascript
async function handleUploadAndConvert(filesArrayOrZip) {
  const formData = new FormData();
  
  // Meng-append file ke formData
  // filesArrayOrZip dapat berupa single file input, atau multiple files
  for (let file of filesArrayOrZip) {
    formData.append('files', file);
  }
  
  // Opsional: memaksa output menjadi ZIP
  // formData.append('asZip', 'true');

  try {
    const response = await fetch('http://localhost:3001/api/convert-webp', {
      method: 'POST',
      body: formData, // Jangan set Content-Type manual, biarkan browser yang atur multipart boundary
    });

    if (!response.ok) {
      const errorJson = await response.json();
      throw new Error(errorJson.error || 'Terjadi kesalahan');
    }

    // Mendapatkan Blob (Binary Data) dari response
    const blob = await response.blob();
    const contentType = response.headers.get('Content-Type');
    
    // Tentukan ekstensi berdasarkan Header dari Server
    const isZip = contentType === 'application/zip';
    const filename = isZip ? 'converted_images.zip' : 'converted_image.webp';

    // Proses Download File Otomatis
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();

    // Cleanup
    a.remove();
    window.URL.revokeObjectURL(url);
    
  } catch (error) {
    console.error('Konversi gagal:', error);
    alert(error.message);
  }
}
```
