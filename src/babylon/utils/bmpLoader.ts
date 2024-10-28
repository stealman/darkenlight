async function loadBMPFromAssets(assetPath: string): Promise<unknown> {
    return new Promise((resolve, reject) => {
        const img = new Image();

        img.src = assetPath; // Set the image source to the asset path

        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                reject(new Error("Failed to get canvas context."));
                return;
            }

            canvas.width = img.width; // Set canvas dimensions to image dimensions
            canvas.height = img.height;

            ctx.drawImage(img, 0, 0); // Draw the image onto the canvas

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height); // Get pixel data
            const data = imageData.data; // This is a Uint8ClampedArray with RGBA values

            const result: number[][] = Array.from({ length: img.height }, () => Array(img.width).fill(0));

            for (let i = 0; i < img.height; i++) {
                for (let j = 0; j < img.width; j++) {
                    const pixelIndex = (i * img.width + j) * 4; // Calculate pixel index in the data array
                    const r = data[pixelIndex]; // Red channel
                    const g = data[pixelIndex + 1]; // Green channel
                    const b = data[pixelIndex + 2]; // Blue channel

                    // Check if the pixel is black (0) or white (255)
                    if (r === 255 && g === 255 && b === 255) {
                        result[i][j] = 0; // White pixel
                    } else {
                        result[i][j] = 1; // Black pixel
                    }
                }
            }

            resolve(result);
        };

        img.onerror = () => {
            reject(new Error("Failed to load image."));
        };

        img.src = assetPath;
    });
}

async function loadGrayscaleBMPFromAssets(assetPath: string): Promise<unknown> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = assetPath;

        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                reject(new Error("Failed to get canvas context."));
                return;
            }

            canvas.width = img.width;
            canvas.height = img.height;

            ctx.drawImage(img, 0, 0);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            const result: number[][] = Array.from({ length: img.height }, () => Array(img.width).fill(0));

            for (let i = 0; i < img.height; i++) {
                for (let j = 0; j < img.width; j++) {
                    const pixelIndex = (i * img.width + j) * 4;
                    const grayscaleValue = data[pixelIndex]; // Use the red channel for grayscale

                    result[i][j] = grayscaleValue; // Store grayscale value directly (0-255)
                }
            }

            resolve(result);
        };

        img.onerror = () => {
            reject(new Error("Failed to load image."));
        };
    });
}

export const loadBMPData = async (assetPath: string): Promise<unknown> => {
    try {
        const bmpArray = await loadGrayscaleBMPFromAssets(assetPath);

        return bmpArray;
    } catch (error) {
        console.error("Error loading BMP file:", error);
        return [];
    }
};
