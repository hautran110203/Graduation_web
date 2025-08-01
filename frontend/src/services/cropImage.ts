function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.src = url;
  });
}

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default async function getCroppedImg(
  imageSrc: string,
  pixelCrop: CropArea
): Promise<{ url: string; file: File }> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Không thể tạo canvas context");

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Không thể tạo blob từ canvas"));
        return;
      }

      const url = URL.createObjectURL(blob);
      const file = new File([blob], "cropped.jpg", { type: "image/jpeg" });
      resolve({ url, file });
    }, "image/jpeg");
  });
}
