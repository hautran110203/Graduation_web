import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../services/cropImage';
import { useLocation } from 'react-router-dom';

interface Event {
  id: number;
  name: string;
  date: string;
  location: string;
  [key: string]: any;
}

interface ConfirmPortraitProps {
  eventId: number;
  onCompleted: (newAvatar: string) => void;
  hideEventInfo?: boolean;
}
const ConfirmPortrait: React.FC<ConfirmPortraitProps> = ({ eventId, onCompleted,hideEventInfo }) => {
  const location = useLocation();
  const event: Event = location.state?.event;

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string>('');
  const [isImageValid, setIsImageValid] = useState<boolean | null>(null);
  
  const onCropComplete = useCallback((_: any, area: any) => {
    setCroppedAreaPixels(area);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result as string);
        setIsCropping(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCrop = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    setIsUploading(true);

    try {
      const { file, url } = await getCroppedImg(imageSrc, croppedAreaPixels);
      setCroppedImage(url);
      setIsCropping(false);

      const formData = new FormData();
      formData.append("file", file, "portrait.jpg");

      setValidationMessage("Ảnh đã được xử lý (bỏ qua xác minh)");
      setIsImageValid(true);
    } catch (error) {
      setValidationMessage("Lỗi gửi ảnh tới server");
      setIsImageValid(false);
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfirmRegister = async () => {
    if ( !event || !croppedImage) return;
    // if (!isImageValid || !croppedImage || !event) return;
    const userData = localStorage.getItem("user");
    const user = userData ? JSON.parse(userData) : null;
    const user_code = user?.user_code;
    const unit_code = user?.unit_code;

    if (!user_code) {
    alert("Không tìm thấy mã người dùng");
    return;
    }


    try {
      const token = localStorage.getItem("token");
      
      const checkRes = await fetch(`http://localhost:3001/registrations/check-registration/${user_code}/${event.id}/${unit_code}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log("Sử dụng eventId:", eventId);

    const checkData = await checkRes.json();

    if (!checkData.success || !checkData.eligible) {
      alert("❌ Không đủ điều kiện đăng ký: " + checkData.message || checkData.reason);
      return;
    }
    
      const payload = {
        user_code,
        event_id: event.id,
        avatar_url: croppedImage
      };
      console.log("Sending:", payload);

      const res = await fetch("http://localhost:3001/registrations", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        console.log("Server trả về lỗi:", data);
        alert("❌ Đăng ký thất bại: " + data.error);
      } else {
        alert("✅ Đăng ký thành công!");
      }
    } catch (error) {
      console.log("Server trả về lỗi:", error);
      alert("❌ Lỗi kết nối đến server");
    }
  };

  return (
  <div className={`mx-auto p-6 ${hideEventInfo ? "max-w-2xl" : "max-w-6xl"}`}>
    <h2 className={`text-2xl font-bold mb-6 flex items-center gap-2 ${hideEventInfo ? 'justify-center' : ''}`}>
      📄 Thông tin đăng ký sự kiện
    </h2>

    <div className={`grid gap-6 ${!hideEventInfo ? 'md:grid-cols-2' : 'grid-cols-1 justify-center'}`}>    
      {!hideEventInfo && event && (
        <div className="bg-white rounded-lg shadow p-6 space-y-4 border border-gray-100">
          <div className="flex items-start gap-3">
            <span className="text-pink-600 text-xl mt-1">📌</span>
            <p><span className="font-semibold">Tên sự kiện:</span> {event.title || "Không xác định"}</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-blue-600 text-xl mt-1">📅</span>
            <p><span className="font-semibold">Ngày tổ chức:</span> {event.date ? new Date(event.date).toLocaleDateString('vi-VN') : "Không xác định"}</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-red-600 text-xl mt-1">📍</span>
            <p><span className="font-semibold">Địa điểm:</span> {event.location || "Không xác định"}</p>
          </div>
          <div className="text-gray-700 text-sm mt-2">{event.description}</div>
        </div>
      )}


      {/* CARD 2: Xác nhận ảnh */}
      <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
        <label className="block text-sm font-medium text-gray-700 mb-2">Tải ảnh chân dung:</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full mb-4 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
        />

        {isCropping && imageSrc && (
          <div className="relative w-full h-64 bg-gray-100 mb-4 rounded overflow-hidden border border-dashed border-gray-300">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={3 / 4}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
            <button
              onClick={handleCrop}
              className="absolute bottom-3 right-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 shadow"
            >
              ✅ Cắt ảnh
            </button>
          </div>
        )}

        {croppedImage && !isCropping && (
          <div className="text-center">
            <img src={croppedImage} alt="Ảnh đã cắt" className="w-36 h-auto mx-auto rounded shadow mb-3 border border-gray-300" />
            {validationMessage && (
              <p className={`text-sm font-medium flex items-center justify-center gap-2 ${isImageValid ? "text-green-600" : "text-red-600"}`}>
                {isImageValid ? "✅" : "❌"} {validationMessage}
              </p>
            )}
            <button
              onClick={handleConfirmRegister}
              disabled={!isImageValid || isUploading}
              className={`mt-4 px-5 py-2 rounded text-white font-semibold transition ${
                isImageValid ? "bg-green-600 hover:bg-green-700" : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              Xác nhận đăng ký
            </button>
          </div>
        )}
      </div>
    </div>
  </div>

  );
};

export default ConfirmPortrait;
