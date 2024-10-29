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

            const result: number[][] = Array.from({ length: img.height * 1 }, () => Array(img.width * 1).fill(0));

            for (let i = 0; i < img.height; i++) {
                for (let j = 0; j < img.width; j++) {
                    const pixelIndex = (i * img.width + j) * 4;
                    const grayscaleValue = data[pixelIndex];

                    result[i][j] = grayscaleValue;
                    //result[i * 2][j * 2] = grayscaleValue;
                    //result[1 + i * 2][j * 2] = grayscaleValue;
                  //  result[1 + i * 2][1 + j * 2] = grayscaleValue;
                    //result[i * 2][1 + j * 2] = grayscaleValue;
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
