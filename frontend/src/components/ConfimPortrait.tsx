import React, { useState, useCallback, useEffect } from 'react';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../services/cropImage';
import { useLocation, useNavigate } from 'react-router-dom';

interface Event {
  id: number;
  title: string;
  date: string;
  location: string;
  description?: string;
  [key: string]: any;
}

interface ConfirmPortraitProps { 
  event?: Event;     // truyền trực tiếp từ cha
  onCompleted: (newAvatar: string) => void;
  hideEventInfo?: boolean;
  mode?: "register" | "update";
}

const ConfirmPortrait: React.FC<ConfirmPortraitProps> = ({
  event: eventFromProps,
  onCompleted,
  hideEventInfo,
  mode = "register"
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const event: Event | undefined = eventFromProps || location.state?.event;
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string>('');
  const [isImageValid, setIsImageValid] = useState<boolean | null>(null);
  const [alreadyRegistered, setAlreadyRegistered] = useState<boolean>(false);

  const userData = localStorage.getItem("user");
  const user = userData ? JSON.parse(userData) : null;
  const user_code = user?.user_code;
  const token = localStorage.getItem("token");

  useEffect(() => {
    const checkExistingRegistration = async () => {
      if (!event?.id || !user_code) return;
      try {
        const res = await fetch("http://localhost:3001/registrations", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const result = await res.json();
        const matched = result.data?.find((reg: any) => reg.event_id === event.id && reg.user_code === user_code);
        if (matched) {
          setAlreadyRegistered(true);
          setValidationMessage("❗Bạn đã đăng ký sự kiện này.");
        }
      } catch (err) {
        console.error("❌ Lỗi kiểm tra đăng ký:", err);
      }
    };

    checkExistingRegistration();
  }, [event?.id, user_code, token]);

  const onCropComplete = useCallback((_: any, area: any) => {
    setCroppedAreaPixels(area);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  if (e.target.files && e.target.files.length > 0) {
    const file = e.target.files[0];

    // 🧼 Reset lại trạng thái khi chọn ảnh mới
    setValidationMessage("");       // Xóa thông báo cũ (lỗi hoặc hợp lệ)
    setIsImageValid(false);         // Reset trạng thái hợp lệ
    setCroppedImage(null);          // Xóa ảnh đã crop nếu có
    setIsUploading(false);          // Reset trạng thái upload

    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string); // Load ảnh mới
      setIsCropping(true);                  // Bật crop mode
    };
    reader.readAsDataURL(file);
  }
};


  const handleCrop = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    setIsUploading(true);
    try {
      // 1. Cắt ảnh từ crop tool
      const { file, url } = await getCroppedImg(imageSrc, croppedAreaPixels);

      // 2. Gọi API kiểm tra ảnh chân dung (FastAPI)
      const verifyForm = new FormData();
      verifyForm.append("file", file);

      const verifyRes = await fetch("http://127.0.0.1:8000/verify-portrait", {
        method: "POST",
        body: verifyForm
      });

      const verifyData = await verifyRes.json().catch(() => ({}));

      if (!verifyRes.ok || !verifyData.success) {
        const reason = verifyData.message || "Ảnh không hợp lệ";
        const details = verifyData.errors?.length ? "\n- " + verifyData.errors.join("\n- ") : "";
        setValidationMessage(`❌ Ảnh không hợp lệ:\n${reason}${details}`);
        setIsImageValid(false);
        return; // 🚫 dừng lại, không upload
      }

      // 3. Nếu ảnh hợp lệ, gọi API upload ảnh lên backend (Node.js)
      const uploadForm = new FormData();
      uploadForm.append("file", file);

      const uploadRes = await fetch("http://localhost:3001/registrations/avatar", {
        method: "POST",
        body: uploadForm,
      });

      if (!uploadRes.ok) throw new Error("Upload ảnh thất bại");

      const uploadData = await uploadRes.json();
      const realImageUrl = uploadData.imageUrl;

      setCroppedImage(realImageUrl);
      setIsCropping(false);
      setIsImageValid(true);

    } catch (err) {
      console.error("❌ Lỗi crop/upload:", err);
      setValidationMessage("❌ Lỗi gửi ảnh tới server");
      setIsImageValid(false);
    } finally {
      setIsUploading(false);
    }
  };


  const handleCreateRegister = async () => {
    if (!event || !croppedImage) return;

    try {
      const checkRes = await fetch(`http://localhost:3001/registrations/check-registration/${user_code}/${event.id}/${user?.unit_code}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` }
      });

      const checkData = await checkRes.json();
      if (!checkData.success || !checkData.eligible) {
        alert("❌ Không đủ điều kiện đăng ký: " + (checkData.message || checkData.reason));
        return;
      }

      const payload = {
        user_code,
        event_id: event.id,
        avatar_url: croppedImage
      };
      
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
        alert("❌ Đăng ký thất bại: " + data.error);
      } else {
        alert("✅ Đăng ký thành công!");
        onCompleted(croppedImage);
        navigate("/myevent");
      }

    } catch (error) {
      alert("❌ Lỗi kết nối đến server");
      console.error("Lỗi đăng ký:", error);
    }
  };

  const handleUpdateAvatar = async () => {
    console.log("👉 Nút được nhấn");
    console.log("📦 Event:", event);
    console.log("🖼️ Cropped Image:", croppedImage);
    console.log("🟢 User Code:", user_code);
    if (!event || !croppedImage) {
      console.warn("⚠️ Thiếu event hoặc croppedImage, không thể cập nhật.");
      return;
    }

    const payload = {
    avatar_url: croppedImage,
    user_code: user_code,
    previous_avatar_url: event.avatar_url
  };
    try {
      
      const res = await fetch(`http://localhost:3001/registrations/${event.event_id}/update`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        alert("❌ Cập nhật thất bại: " + data.error);
      } else {
        alert("✅ Cập nhật ảnh thành công!");
        onCompleted(croppedImage);
      }

    } catch (error) {
      alert("❌ Lỗi kết nối đến server");
      console.error("Lỗi cập nhật:", error);
    }
  };

  return (
    <div className={`mx-auto p-6 ${hideEventInfo ? "max-w-2xl" : "max-w-6xl"}`}>
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        📄 {mode === "update" ? "Cập nhật ảnh chân dung" : "Thông tin đăng ký sự kiện"}
      </h2>

      <div className={`grid gap-6 ${!hideEventInfo ? 'md:grid-cols-2' : 'grid-cols-1 justify-center'}`}>
        {!hideEventInfo && event && (
          <div className="bg-white rounded-lg shadow p-6 space-y-4 border">
            <p><strong>Tên sự kiện:</strong> {event.title}</p>
            <p>
              <strong>Thời gian tổ chức:</strong>{" "}
              {event.start_time && event.end_time ? (
                <>
                  {new Date(event.start_time).toLocaleDateString('vi-VN')} |{" "}
                  {new Date(event.start_time).toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })} -{" "}
                  {new Date(event.end_time).toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </>
              ) : (
                "Không xác định"
              )}
            </p>
            <p><strong>Địa điểm:</strong> {event.location}</p>
            <p>{event.description}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6 border">
          {mode !== "update" && alreadyRegistered && (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-3 mb-4 rounded text-sm">
              ⚠️ Bạn đã đăng ký sự kiện này.
            </div>
          )}

          <label className="block text-sm font-medium text-gray-700 mb-2">Tải ảnh chân dung:</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={mode !== "update" && alreadyRegistered}
            className="mb-4"
          />

          {isCropping && imageSrc && (
            <div className="relative h-64 mb-4">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={3 / 4}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
              <button onClick={handleCrop} className="absolute bottom-3 right-3 bg-blue-600 text-white px-4 py-2 rounded">
                ✅ Cắt ảnh
              </button>
            </div>
          )}
          {isUploading ? (
            <div className="mt-2 px-3 py-2 rounded text-sm flex items-center gap-2 border border-blue-500 text-blue-600">
              <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
              </svg>
              <span>Đang kiểm tra ảnh...</span>
            </div>
          ) : (
            validationMessage && (
              <div
                className="mt-2 whitespace-pre-line px-3 py-2 rounded text-sm"
                style={{
                  color: isImageValid ? 'green' : 'red',
                  border: `1px solid ${isImageValid ? 'green' : 'red'}`
                }}
              >
                {validationMessage}
              </div>
            )
          )}


          {croppedImage && !isCropping && (
            <div className="text-center">
              <img src={croppedImage} alt="Cropped" className="w-36 mx-auto mb-3" />
              {validationMessage && (
                <p className={`text-sm ${isImageValid ? "text-green-600" : "text-red-600"}`}>
                  {validationMessage}
                </p>
              )}

              {mode === "register" && (
                <button
                  onClick={handleCreateRegister}
                  disabled={!isImageValid || isUploading || alreadyRegistered}
                  className={`mt-4 px-5 py-2 rounded text-white font-semibold ${
                    !isImageValid || isUploading || alreadyRegistered ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {alreadyRegistered ? "Đã đăng ký" : "Xác nhận đăng ký"}
                </button>
              )}

              {mode === "update" && (
                <button
                  onClick={handleUpdateAvatar}
                  disabled={!isImageValid || isUploading}
                  className={`mt-4 px-5 py-2 rounded text-white font-semibold ${
                    !isImageValid || isUploading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  Cập nhật ảnh
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfirmPortrait;
