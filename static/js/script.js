// Image Compressor
class ImageCompressor {
    constructor() {
        this.files = [];
        this.quality = 75;
        this.compressedFiles = [];
        this.initElements();
        this.bindEvents();
    }

    initElements() {
        this.uploadArea = document.getElementById('uploadArea');
        this.fileInput = document.getElementById('fileInput');
        this.settingsSection = document.getElementById('settingsSection');
        this.imagesSection = document.getElementById('imagesSection');
        this.imagesGrid = document.getElementById('imagesGrid');
        this.qualitySlider = document.getElementById('qualitySlider');
        this.qualityValue = document.getElementById('qualityValue');
        this.compressBtn = document.getElementById('compressBtn');
        this.loadingOverlay = document.getElementById('loadingOverlay');
        this.toast = document.getElementById('toast');
    }

    bindEvents() {
        // Upload area click
        this.uploadArea.addEventListener('click', () => this.fileInput.click());

        // File input change
        this.fileInput.addEventListener('change', (e) => this.handleFiles(e.target.files));

        // Drag and drop
        this.uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.uploadArea.classList.add('dragover');
        });

        this.uploadArea.addEventListener('dragleave', () => {
            this.uploadArea.classList.remove('dragover');
        });

        this.uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            this.uploadArea.classList.remove('dragover');
            this.handleFiles(e.dataTransfer.files);
        });

        // Quality slider
        this.qualitySlider.addEventListener('input', (e) => {
            this.quality = parseInt(e.target.value);
            this.qualityValue.textContent = this.quality;
            this.updateActivePreset();
        });

        // Preset buttons
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const quality = parseInt(btn.dataset.quality);
                this.quality = quality;
                this.qualitySlider.value = quality;
                this.qualityValue.textContent = quality;
                this.updateActivePreset();
            });
        });

        // Compress button
        this.compressBtn.addEventListener('click', () => this.compressImages());
    }

    updateActivePreset() {
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.dataset.quality) === this.quality);
        });
    }

    handleFiles(fileList) {
        const validFiles = Array.from(fileList).filter(file => {
            return file.type.startsWith('image/') &&
                   file.size <= 16 * 1024 * 1024; // 16MB
        });

        if (validFiles.length === 0) {
            this.showToast('请上传有效的图片文件（JPG、PNG、WebP，最大16MB）', 'error');
            return;
        }

        this.files = validFiles;
        this.settingsSection.style.display = 'block';
        this.compressBtn.disabled = false;
        this.compressBtn.textContent = `开始压缩 (${this.files.length} 张图片)`;
        this.showToast(`已选择 ${this.files.length} 张图片`, 'success');
    }

    async compressImages() {
        if (this.files.length === 0) return;

        this.showLoading(true);
        this.compressedFiles = [];
        this.imagesGrid.innerHTML = '';

        for (const file of this.files) {
            try {
                const compressedData = await this.compressImage(file);
                this.compressedFiles.push(compressedData);
                this.addImageCard(compressedData);
            } catch (error) {
                console.error('压缩失败:', error);
                this.showToast(`压缩 ${file.name} 失败`, 'error');
            }
        }

        this.showLoading(false);
        this.imagesSection.style.display = 'block';

        if (this.compressedFiles.length > 1) {
            this.addDownloadAllButton();
        }

        this.showToast(`成功压缩 ${this.compressedFiles.length} 张图片`, 'success');
    }

    async compressImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    canvas.width = img.width;
                    canvas.height = img.height;

                    ctx.drawImage(img, 0, 0);

                    // Get file type for output
                    let outputType = file.type;
                    if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
                        outputType = 'image/jpeg';
                    } else if (file.type === 'image/png') {
                        outputType = 'image/png';
                    } else {
                        outputType = 'image/webp';
                    }

                    canvas.toBlob((blob) => {
                        if (blob) {
                            resolve({
                                id: Date.now(),
                                name: file.name,
                                originalSize: file.size,
                                compressedSize: blob.size,
                                originalUrl: e.target.result,
                                compressedUrl: URL.createObjectURL(blob),
                                blob: blob,
                                width: img.width,
                                height: img.height
                            });
                        } else {
                            reject(new Error('压缩失败'));
                        }
                    }, outputType, this.quality / 100);
                };

                img.onerror = () => reject(new Error('图片加载失败'));
                img.src = e.target.result;
            };

            reader.onerror = () => reject(new Error('文件读取失败'));
            reader.readAsDataURL(file);
        });
    }

    addImageCard(data) {
        const card = document.createElement('div');
        card.className = 'image-card';

        const savings = ((data.originalSize - data.compressedSize) / data.originalSize * 100).toFixed(1);
        const isSaving = data.compressedSize < data.originalSize;

        card.innerHTML = `
            <div class="image-preview">
                <div class="preview-side original">
                    <div class="preview-label original">原始图片</div>
                    <img src="${data.originalUrl}" alt="原始图片" class="preview-image">
                    <div class="preview-info">
                        ${data.width} x ${data.height}<br>
                        ${this.formatSize(data.originalSize)}
                    </div>
                </div>
                <div class="preview-side compressed">
                    <div class="preview-label compressed">压缩后</div>
                    <img src="${data.compressedUrl}" alt="压缩后" class="preview-image">
                    <div class="preview-info">
                        ${data.width} x ${data.height}<br>
                        ${this.formatSize(data.compressedSize)}
                    </div>
                </div>
            </div>
            <div class="image-actions">
                <div class="image-name">${data.name}</div>
                <div class="image-stats">
                    <div class="stat-item">
                        <div class="stat-label">原始大小</div>
                        <div class="stat-value">${this.formatSize(data.originalSize)}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">压缩后</div>
                        <div class="stat-value">${this.formatSize(data.compressedSize)}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">节省</div>
                        <div class="stat-value ${isSaving ? 'saving' : ''}">
                            ${isSaving ? '-' : '+'}${Math.abs(savings)}%
                        </div>
                    </div>
                </div>
                <button class="download-btn" onclick="downloadImage('${data.id}')">下载</button>
            </div>
        `;

        this.imagesGrid.appendChild(card);
    }

    addDownloadAllButton() {
        const downloadAllBtn = document.createElement('button');
        downloadAllBtn.className = 'download-all-btn';
        downloadAllBtn.textContent = '下载全部';
        downloadAllBtn.onclick = () => this.downloadAll();
        this.imagesGrid.appendChild(downloadAllBtn);
    }

    async downloadAll() {
        for (const file of this.compressedFiles) {
            await this.downloadFile(file);
            // Small delay between downloads
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }

    async downloadFile(data) {
        const link = document.createElement('a');
        link.href = data.compressedUrl;
        link.download = `compressed_${data.name}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    formatSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    showLoading(show) {
        this.loadingOverlay.style.display = show ? 'flex' : 'none';
    }

    showToast(message, type = 'success') {
        this.toast.textContent = message;
        this.toast.className = `toast ${type} show`;

        setTimeout(() => {
            this.toast.classList.remove('show');
        }, 3000);
    }
}

// Global function for download button click
function downloadImage(id) {
    const compressor = window.imageCompressor;
    const file = compressor.compressedFiles.find(f => f.id === parseInt(id));
    if (file) {
        compressor.downloadFile(file);
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    window.imageCompressor = new ImageCompressor();
});
