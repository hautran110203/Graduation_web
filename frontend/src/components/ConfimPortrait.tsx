
// import React, { useState, useCallback, useEffect } from 'react';
// import Cropper from 'react-easy-crop';
// import getCroppedImg from '../services/cropImage';
// import { useLocation, useNavigate } from 'react-router-dom';

// interface Event {
//   id: number;
//   title: string;
//   date: string;
//   location: string;
//   description?: string;
//   [key: string]: any; // có thể có event_id, start_time, end_time, avatar_url...
// }

// interface ConfirmPortraitProps {
//   event?: Event; // truyền trực tiếp từ cha
//   onCompleted: (newAvatar: string) => void;
//   hideEventInfo?: boolean;
//   mode?: 'register' | 'update';
// }

// const ConfirmPortrait: React.FC<ConfirmPortraitProps> = ({
//   event: eventFromProps,
//   onCompleted,
//   hideEventInfo,
//   mode = 'register',
// }) => {
//   const location = useLocation();
//   const navigate = useNavigate();

//   // ===== FLAGS (bật/tắt auto call khi mở form) =====
//   const AUTO_LOAD_AVATAR_ON_MOUNT = false; // tắt: không tự load avatar từ DB khi mở form
//   const AUTO_CHECK_REG_ON_MOUNT   = false; // tắt: không tự kiểm tra đã đăng ký

//   const event: Event | undefined = eventFromProps || (location.state?.event as Event | undefined);
//   const eventId = (event as any)?.event_id ?? event?.id;

//   const [imageSrc, setImageSrc] = useState<string | null>(null);
//   const [croppedImage, setCroppedImage] = useState<string | null>(null); // URL hiển thị (có thể có ?v=)
//   const [crop, setCrop] = useState({ x: 0, y: 0 });
//   const [zoom, setZoom] = useState(1);
//   const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
//   const [isCropping, setIsCropping] = useState(false);
//   const [isUploading, setIsUploading] = useState(false);
//   const [validationMessage, setValidationMessage] = useState<string>('');
//   const [isImageValid, setIsImageValid] = useState<boolean | null>(null);
//   const [alreadyRegistered, setAlreadyRegistered] = useState<boolean>(false);

//   const userData = localStorage.getItem('user');
//   const user = userData ? JSON.parse(userData) : null;
//   const user_code = user?.user_code;
//   const token = localStorage.getItem('token');

//   // ----- helpers -----
//   const cleanUrl = (url: string) => url.split('?')[0]; // dùng cho DB
//   const withBust = (url: string) => {
//     try {
//       const u = new URL(url);
//       u.searchParams.set('v', Date.now().toString());
//       return u.toString();
//     } catch {
//       return `${url}${url.includes('?') ? '&' : '?'}v=${Date.now()}`;
//     }
//   };

//   // load avatar từ DB (silent: không hiển thị thông báo/valid)
//   const fetchAvatarFromDB = useCallback(
//     async (silent: boolean = false): Promise<void> => {
//       if (!eventId || !user_code) return;
//       try {
//         const res = await fetch('http://localhost:3001/registrations', {
//           headers: { Authorization: `Bearer ${token}` },
//           cache: 'no-store',
//         });
//         if (!res.ok) throw new Error(`HTTP ${res.status}`);
//         const result = await res.json();

//         const matched = result.data?.find(
//           (reg: any) => reg.event_id === eventId && reg.user_code === user_code
//         );

//         if (matched?.avatar_url) {
//           const bust = withBust(matched.avatar_url);
//           setCroppedImage(bust);
//           if (!silent) {
//             setIsImageValid(true);
//             setValidationMessage('✅ Ảnh đã được cập nhật từ hệ thống.');
//           } else {
//             setIsImageValid(null);
//             setValidationMessage('');
//           }
//         }
//       } catch (e) {
//         console.error('Refetch avatar lỗi:', e);
//       }
//     },
//     [eventId, user_code, token]
//   );

//   // (tùy cờ) Kiểm tra đã đăng ký — không trộn vào validationMessage
//   useEffect(() => {
//     if (!AUTO_CHECK_REG_ON_MOUNT) return;
//     const checkExistingRegistration = async () => {
//       if (!eventId || !user_code) return;
//       try {
//         const res = await fetch('http://localhost:3001/registrations', {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         const result = await res.json();
//         const matched = result.data?.find(
//           (reg: any) => reg.event_id === eventId && reg.user_code === user_code
//         );
//         if (matched) setAlreadyRegistered(true);
//       } catch (err) {
//         console.error('❌ Lỗi kiểm tra đăng ký:', err);
//       }
//     };
//     checkExistingRegistration();
//   }, [AUTO_CHECK_REG_ON_MOUNT, eventId, user_code, token]);

//   // (tùy cờ) Load avatar hiện tại khi mở form (silent)
//   useEffect(() => {
//     if (AUTO_LOAD_AVATAR_ON_MOUNT) fetchAvatarFromDB(true);
//   }, [AUTO_LOAD_AVATAR_ON_MOUNT, fetchAvatarFromDB]);

//   const onCropComplete = useCallback((_: any, area: any) => {
//     setCroppedAreaPixels(area);
//   }, []);

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files.length > 0) {
//       const file = e.target.files[0];

//       // reset trạng thái khi chọn ảnh mới
//       setValidationMessage('');
//       setIsImageValid(null);
//       setCroppedImage(null);
//       setIsUploading(false);

//       const reader = new FileReader();
//       reader.onload = () => {
//         setImageSrc(reader.result as string);
//         setIsCropping(true);
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const handleCrop = async () => {
//     if (!imageSrc || !croppedAreaPixels) return;
//     setIsUploading(true);

//     setValidationMessage('');
//     setIsImageValid(null);

//     try {
//       // 1) Cắt ảnh
//       const { file } = await getCroppedImg(imageSrc, croppedAreaPixels);

//       // 2) Verify (FastAPI)
//       const verifyForm = new FormData();
//       verifyForm.append('file', file);
//       const verifyRes = await fetch('http://127.0.0.1:8000/verify-portrait', {
//         method: 'POST',
//         body: verifyForm,
//       });
//       const verifyData = await verifyRes.json().catch(() => ({}));
//       if (!verifyRes.ok || !verifyData.success) {
//         const reason = verifyData.message || 'Ảnh không hợp lệ';
//         const details = verifyData.errors?.length ? '\n- ' + verifyData.errors.join('\n- ') : '';
//         setValidationMessage(`❌ Ảnh không hợp lệ:\n${reason}${details}`);
//         setIsImageValid(false);
//         return;
//       }

//       // 3) Upload (Node/S3)
//       const uploadForm = new FormData();
//       uploadForm.append('file', file);
//       const uploadRes = await fetch('http://localhost:3001/registrations/avatar', {
//         method: 'POST',
//         headers: { Authorization: `Bearer ${token}` },
//         body: uploadForm,
//       });
//       if (!uploadRes.ok) throw new Error('Upload ảnh thất bại');
//       const { imageUrl } = await uploadRes.json();

//       // preview ảnh đã upload (thêm ?v để chắc chắn tải mới)
//       setCroppedImage(withBust(imageUrl));
//       setIsCropping(false);

//       setIsImageValid(true);
//       setValidationMessage('✅ Ảnh hợp lệ');
//     } catch (err) {
//       console.error('❌ Lỗi crop/upload:', err);
//       setValidationMessage('❌ Lỗi gửi ảnh tới server');
//       setIsImageValid(false);
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   const handleCreateRegister = async () => {
//     if (!eventId || !croppedImage) return;

//     try {
//       const checkRes = await fetch(
//         `http://localhost:3001/registrations/check-registration/${user_code}/${eventId}/${user?.unit_code}`,
//         {
//           method: 'GET',
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );
//       const checkData = await checkRes.json();
//       if (!checkData.success || !checkData.eligible) {
//         alert('❌ Không đủ điều kiện đăng ký: ' + (checkData.message || checkData.reason));
//         return;
//       }

//       const payload = {
//         user_code,
//         event_id: eventId,
//         avatar_url: cleanUrl(croppedImage), // URL sạch cho DB
//       };

//       const res = await fetch('http://localhost:3001/registrations', {
//         method: 'POST',
//         headers: {
//           Authorization: `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(payload),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         alert('❌ Đăng ký thất bại: ' + data.error);
//       } else {
//         alert('✅ Đăng ký thành công!');
//         onCompleted(croppedImage);
//         navigate('/myevent');
//       }
//     } catch (error) {
//       alert('❌ Lỗi kết nối đến server');
//       console.error('Lỗi đăng ký:', error);
//     }
//   };

//   const handleUpdateAvatar = async () => {
//     if (!eventId || !croppedImage) {
//       console.warn('⚠️ Thiếu event hoặc croppedImage, không thể cập nhật.');
//       return;
//     }

//     const payload = {
//       avatar_url: cleanUrl(croppedImage), // URL sạch cho DB (không ?v=)
//       user_code,
//       previous_avatar_url: (event as any)?.avatar_url,
//     };

//     try {
//       const res = await fetch(`http://localhost:3001/registrations/${eventId}/update`, {
//         method: 'PUT',
//         headers: {
//           Authorization: `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(payload),
//       });

//       const data = await res.json().catch(() => ({}));

//       if (!res.ok) {
//         alert('❌ Cập nhật thất bại: ' + (data.error || 'Unknown error'));
//       } else {
//         // sau khi server OK, refetch từ DB (sẽ set ?v=... để ép reload ảnh)
//         await fetchAvatarFromDB(false);
//         alert('✅ Cập nhật ảnh thành công!');
//         onCompleted(croppedImage);
//       }
//     } catch (error) {
//       alert('❌ Lỗi kết nối đến server');
//       console.error('Lỗi cập nhật:', error);
//     }
//   };

//   return (
//     <div className={`mx-auto p-6 ${hideEventInfo ? 'max-w-2xl' : 'max-w-6xl'}`}>
//       <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
//         📄 {mode === 'update' ? 'Cập nhật ảnh chân dung' : 'Thông tin đăng ký sự kiện'}
//       </h2>

//       <div className={`grid gap-6 ${!hideEventInfo ? 'md:grid-cols-2' : 'grid-cols-1 justify-center'}`}>
//         {!hideEventInfo && event && (
//           <div className="bg-white rounded-lg shadow p-6 space-y-4 border">
//             <p>
//               <strong>Tên sự kiện:</strong> {event.title}
//             </p>
//             <p>
//               <strong>Thời gian tổ chức:</strong>{' '}
//               {event.start_time && event.end_time ? (
//                 <>
//                   {new Date(event.start_time).toLocaleDateString('vi-VN')} |{' '}
//                   {new Date(event.start_time).toLocaleTimeString('vi-VN', {
//                     hour: '2-digit',
//                     minute: '2-digit',
//                   })}{' '}
//                   -{' '}
//                   {new Date(event.end_time).toLocaleTimeString('vi-VN', {
//                     hour: '2-digit',
//                     minute: '2-digit',
//                   })}
//                 </>
//               ) : (
//                 'Không xác định'
//               )}
//             </p>
//             <p>
//               <strong>Địa điểm:</strong> {event.location}
//             </p>
//             <p>{event.description}</p>
//           </div>
//         )}

//         <div className="bg-white rounded-lg shadow p-6 border">
//           {mode !== 'update' && alreadyRegistered && (
//             <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-3 mb-4 rounded text-sm">
//               ⚠️ Bạn đã đăng ký sự kiện này.
//             </div>
//           )}

//           <label className="block text-sm font-medium text-gray-700 mb-2">Tải ảnh chân dung:</label>
//           <input
//             type="file"
//             accept="image/*"
//             onChange={handleFileChange}
//             disabled={mode !== 'update' && alreadyRegistered}
//             className="mb-4"
//           />

//           {isCropping && imageSrc && (
//             <div className="relative h-64 mb-4">
//               <Cropper
//                 image={imageSrc}
//                 crop={crop}
//                 zoom={zoom}
//                 aspect={3 / 4}
//                 onCropChange={setCrop}
//                 onZoomChange={setZoom}
//                 onCropComplete={onCropComplete}
//               />
//               <button
//                 onClick={handleCrop}
//                 className="absolute bottom-3 right-3 bg-blue-600 text-white px-4 py-2 rounded"
//               >
//                 ✅ Cắt ảnh
//               </button>
//             </div>
//           )}

//           {isUploading ? (
//             <div className="mt-2 px-3 py-2 rounded text-sm flex items-center gap-2 border border-blue-500 text-blue-600">
//               <svg
//                 className="animate-spin h-5 w-5 text-blue-600"
//                 xmlns="http://www.w3.org/2000/svg"
//                 fill="none"
//                 viewBox="0 0 24 24"
//               >
//                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
//                 <path
//                   className="opacity-75"
//                   fill="currentColor"
//                   d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
//                 />
//               </svg>
//               <span>Đang kiểm tra ảnh...</span>
//             </div>
//           ) : (
//             validationMessage && (
//               <div
//                 className="mt-2 whitespace-pre-line px-3 py-2 rounded text-sm"
//                 style={{
//                   color: isImageValid ? 'green' : 'red',
//                   border: `1px solid ${isImageValid ? 'green' : 'red'}`,
//                 }}
//               >
//                 {validationMessage}
//               </div>
//             )
//           )}

//           {croppedImage && !isCropping && (
//             <div className="text-center">
//               <img key={croppedImage} src={croppedImage} alt="Cropped" className="w-36 mx-auto mb-3" />

//               {mode === 'register' && (
//                 <button
//                   onClick={handleCreateRegister}
//                   disabled={!isImageValid || isUploading || alreadyRegistered}
//                   className={`mt-4 px-5 py-2 rounded text-white font-semibold ${
//                     !isImageValid || isUploading || alreadyRegistered
//                       ? 'bg-gray-400'
//                       : 'bg-green-600 hover:bg-green-700'
//                   }`}
//                 >
//                   {alreadyRegistered ? 'Đã đăng ký' : 'Xác nhận đăng ký'}
//                 </button>
//               )}

//               {mode === 'update' && (
//                 <>
//                   {isImageValid && !isUploading && (
//                     <div className="mt-3 text-green-600 text-sm font-medium">✅ Ảnh đã được tải thành công!</div>
//                   )}
//                   <button
//                     onClick={handleUpdateAvatar}
//                     disabled={!isImageValid || isUploading}
//                     className={`mt-4 px-5 py-2 rounded text-white font-semibold ${
//                       !isImageValid || isUploading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
//                     }`}
//                   >
//                     Cập nhật ảnh
//                   </button>
//                 </>
//               )}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ConfirmPortrait;
import React, { useState, useCallback, useEffect } from 'react';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../services/cropImage';
import { useLocation, useNavigate } from 'react-router-dom';

interface ConfirmEvent {
  id?: number;                 // id “cũ” (adapter)
  event_id?: number;           // id “mới”
  title: string;
  date?: string;
  location?: string;
  location_name?: string;      // tên địa điểm mới
  description?: string;
  start_time?: string;
  end_time?: string;
  avatar_url?: string;
  [key: string]: any;
}

interface ConfirmPortraitProps {
  event?: ConfirmEvent;                       // truyền trực tiếp từ cha hoặc location.state
  onCompleted?: (newAvatar: string) => void;  // ✅ cho phép optional
  hideEventInfo?: boolean;
  mode?: 'register' | 'update';
}

const ConfirmPortrait: React.FC<ConfirmPortraitProps> = ({
  event: eventFromProps,
  onCompleted = () => {},     // ✅ default no-op → tránh “is not a function”
  hideEventInfo,
  mode = 'register',
}) => {
  const locationRouter = useLocation();
  const navigate = useNavigate();

  const AUTO_LOAD_AVATAR_ON_MOUNT = false;
  const AUTO_CHECK_REG_ON_MOUNT   = false;

  const event: ConfirmEvent | undefined =
    eventFromProps || (locationRouter.state?.event as ConfirmEvent | undefined);

  const eventId: number | undefined = event?.event_id ?? event?.id;

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

  const userData = localStorage.getItem('user');
  const user = userData ? JSON.parse(userData) : null;
  const user_code = user?.user_code;
  const token = localStorage.getItem('token');

  const cleanUrl = (url: string) => url.split('?')[0];
  const withBust = (url: string) => {
    try {
      const u = new URL(url);
      u.searchParams.set('v', Date.now().toString());
      return u.toString();
    } catch {
      return `${url}${url.includes('?') ? '&' : '?'}v=${Date.now()}`;
    }
  };

  const fetchAvatarFromDB = useCallback(
    async (silent: boolean = false): Promise<void> => {
      if (!eventId || !user_code) return;
      try {
        const res = await fetch('http://localhost:3001/registrations', {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const result = await res.json();

        const matched = result.data?.find(
          (reg: any) => reg.event_id === eventId && reg.user_code === user_code
        );

        if (matched?.avatar_url) {
          const bust = withBust(matched.avatar_url);
          setCroppedImage(bust);
          if (!silent) {
            setIsImageValid(true);
            setValidationMessage('✅ Ảnh đã được cập nhật từ hệ thống.');
          } else {
            setIsImageValid(null);
            setValidationMessage('');
          }
        }
      } catch (e) {
        console.error('Refetch avatar lỗi:', e);
      }
    },
    [eventId, user_code, token]
  );

  useEffect(() => {
    if (!AUTO_CHECK_REG_ON_MOUNT) return;
    const checkExistingRegistration = async () => {
      if (!eventId || !user_code) return;
      try {
        const res = await fetch('http://localhost:3001/registrations', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await res.json();
        const matched = result.data?.find(
          (reg: any) => reg.event_id === eventId && reg.user_code === user_code
        );
        if (matched) setAlreadyRegistered(true);
      } catch (err) {
        console.error('❌ Lỗi kiểm tra đăng ký:', err);
      }
    };
    checkExistingRegistration();
  }, [AUTO_CHECK_REG_ON_MOUNT, eventId, user_code, token]);

  useEffect(() => {
    if (AUTO_LOAD_AVATAR_ON_MOUNT) fetchAvatarFromDB(true);
  }, [AUTO_LOAD_AVATAR_ON_MOUNT, fetchAvatarFromDB]);

  const onCropComplete = useCallback((_: any, area: any) => {
    setCroppedAreaPixels(area);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setValidationMessage('');
      setIsImageValid(null);
      setCroppedImage(null);
      setIsUploading(false);

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
    setValidationMessage('');
    setIsImageValid(null);

    try {
      const { file } = await getCroppedImg(imageSrc, croppedAreaPixels);

      // Verify (FastAPI)
      const verifyForm = new FormData();
      verifyForm.append('file', file);
      const verifyRes = await fetch('http://127.0.0.1:8000/verify-portrait', {
        method: 'POST',
        body: verifyForm,
      });
      const verifyData = await verifyRes.json().catch(() => ({}));
      if (!verifyRes.ok || !verifyData.success) {
        const reason = verifyData.message || 'Ảnh không hợp lệ';
        const details = verifyData.errors?.length ? '\n- ' + verifyData.errors.join('\n- ') : '';
        setValidationMessage(`❌ Ảnh không hợp lệ:\n${reason}${details}`);
        setIsImageValid(false);
        return;
      }

      // Upload (Node/S3)
      const uploadForm = new FormData();
      uploadForm.append('file', file);
      const uploadRes = await fetch('http://localhost:3001/registrations/avatar', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: uploadForm,
      });
      if (!uploadRes.ok) throw new Error('Upload ảnh thất bại');
      const { imageUrl } = await uploadRes.json();

      setCroppedImage(withBust(imageUrl));
      setIsCropping(false);
      setIsImageValid(true);
      setValidationMessage('✅ Ảnh hợp lệ');
    } catch (err) {
      console.error('❌ Lỗi crop/upload:', err);
      setValidationMessage('❌ Lỗi gửi ảnh tới server');
      setIsImageValid(false);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreateRegister = async () => {
    if (!eventId || !croppedImage) return;

    try {
      const checkRes = await fetch(
        `http://localhost:3001/registrations/check-registration/${user_code}/${eventId}/${user?.unit_code}`,
        { method: 'GET', headers: { Authorization: `Bearer ${token}` } }
      );
      const checkData = await checkRes.json();
      if (!checkData.success || !checkData.eligible) {
        alert('❌ Không đủ điều kiện đăng ký: ' + (checkData.message || checkData.reason));
        return;
      }

      const payload = { user_code, event_id: eventId, avatar_url: cleanUrl(croppedImage) };
      const res = await fetch('http://localhost:3001/registrations', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        alert('❌ Đăng ký thất bại: ' + data.error);
      } else {
        alert('✅ Đăng ký thành công!');
        onCompleted(croppedImage);   // ✅ luôn an toàn vì đã có default
        navigate('/myevent');
      }
    } catch (error) {
      alert('❌ Lỗi kết nối đến server');
      console.error('Lỗi đăng ký:', error);
    }
  };

  const handleUpdateAvatar = async () => {
    if (!eventId || !croppedImage) return;

    const payload = {
      avatar_url: cleanUrl(croppedImage),
      user_code,
      previous_avatar_url: event?.avatar_url,
    };

    try {
      const res = await fetch(`http://localhost:3001/registrations/${eventId}/update`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert('❌ Cập nhật thất bại: ' + (data.error || 'Unknown error'));
      } else {
        await fetchAvatarFromDB(false);
        alert('✅ Cập nhật ảnh thành công!');
        onCompleted(croppedImage);   // ✅ an toàn
      }
    } catch (error) {
      alert('❌ Lỗi kết nối đến server');
      console.error('Lỗi cập nhật:', error);
    }
  };

  return (
    <div className={`mx-auto p-6 ${hideEventInfo ? 'max-w-2xl' : 'max-w-6xl'}`}>
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        📄 {mode === 'update' ? 'Cập nhật ảnh chân dung' : 'Thông tin đăng ký sự kiện'}
      </h2>

      <div className={`grid gap-6 ${!hideEventInfo ? 'md:grid-cols-2' : 'grid-cols-1 justify-center'}`}>
        {!hideEventInfo && event && (
          <div className="bg-white rounded-lg shadow p-6 space-y-4 border">
            <p><strong>Tên sự kiện:</strong> {event.title}</p>
            <p>
              <strong>Thời gian tổ chức:</strong>{' '}
              {event.start_time && event.end_time ? (
                <>
                  {new Date(event.start_time).toLocaleDateString('vi-VN')} |{' '}
                  {new Date(event.start_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} -{' '}
                  {new Date(event.end_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </>
              ) : ('Không xác định')}
            </p>
            <p>
              <strong>Địa điểm:</strong> {event.location_name ?? event.location ?? '—'}
            </p>
            <p>{event.description}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6 border">
          {mode !== 'update' && alreadyRegistered && (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-3 mb-4 rounded text-sm">
              ⚠️ Bạn đã đăng ký sự kiện này.
            </div>
          )}

          <label className="block text-sm font-medium text-gray-700 mb-2">Tải ảnh chân dung:</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={mode !== 'update' && alreadyRegistered}
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
                style={{ color: isImageValid ? 'green' : 'red', border: `1px solid ${isImageValid ? 'green' : 'red'}` }}
              >
                {validationMessage}
              </div>
            )
          )}

          {croppedImage && !isCropping && (
            <div className="text-center">
              <img key={croppedImage} src={croppedImage} alt="Cropped" className="w-36 mx-auto mb-3" />

              {mode === 'register' && (
                <button
                  onClick={handleCreateRegister}
                  disabled={!isImageValid || isUploading || alreadyRegistered}
                  className={`mt-4 px-5 py-2 rounded text-white font-semibold ${
                    !isImageValid || isUploading || alreadyRegistered ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {alreadyRegistered ? 'Đã đăng ký' : 'Xác nhận đăng ký'}
                </button>
              )}

              {mode === 'update' && (
                <>
                  {isImageValid && !isUploading && (
                    <div className="mt-3 text-green-600 text-sm font-medium">✅ Ảnh đã được tải thành công!</div>
                  )}
                  <button
                    onClick={handleUpdateAvatar}
                    disabled={!isImageValid || isUploading}
                    className={`mt-4 px-5 py-2 rounded text-white font-semibold ${
                      !isImageValid || isUploading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    Cập nhật ảnh
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfirmPortrait;
