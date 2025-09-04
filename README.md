# Website Đăng Ký Tốt Nghiệp

Một ứng dụng web để quản lý các buổi lễ tốt nghiệp và đăng ký sinh viên, với tính năng xác thực chân dung được hỗ trợ bởi AI để đảm bảo chất lượng ảnh nộp kèm theo hồ sơ.

Video demo: https://drive.google.com/file/d/18J-VBvts7lG0lc0ioQTu7nY0HJCyQRGl/view?usp=drive_link
## 🚀 Tính Năng

### Chức Năng Cốt Lõi
- **Hệ Thống Người Dùng Đa Vai Trò**: Hỗ trợ sinh viên, đơn vị quản trị và quản trị viên cấp cao với kiểm soát truy cập dựa trên vai trò
- **Quản Lý Sự Kiện**: Tạo, xem và quản lý các sự kiện tốt nghiệp
- **Đăng Ký Sinh Viên**: Đăng ký sự kiện với xác thực chân dung tự động
- **Quản Lý Dữ Liệu Tốt Nghiệp**: Tải lên và quản lý hồ sơ tốt nghiệp của sinh viên qua Excel

### Xác Thực Chân Dung Bằng AI
- Phát hiện và xác thực khuôn mặt được căn giữa
- Kiểm tra chất lượng hình ảnh (độ sáng, mờ, tư thế)
- Phát hiện vật thể (khẩu trang, kính)
- Phân tích nền
- Phát hiện hình ảnh giả/anime
- Đảm bảo chất lượng tự động cho ảnh chân dung chuyên nghiệp

### Tính Năng Quản Trị
- Bảng điều khiển quản trị với tổng quan hệ thống
- Quản lý đơn vị đào tạo và tài khoản
- Thống kê sự kiện và quản lý địa điểm
- Chức năng nhập/xuất Excel
- Tạo báo cáo PDF
- Chế độ trình bày cho sự kiện

### Sơ đồ lớp của database
<img width="709" height="596" alt="image" src="https://github.com/user-attachments/assets/4afee34a-433f-4aad-a131-dbb2158c9e88" />


## 🛠️ Công Nghệ Sử Dụng

### Frontend
- **React 19.1.0** với TypeScript
- **Vite** cho công cụ xây dựng
- **Material-UI** cho các thành phần UI
- **Tailwind CSS** cho styling
- **React Router** cho điều hướng
- **Axios** cho các cuộc gọi API
- **React Hook Form** cho xử lý form

### Backend
- **Node.js** với Express.js
- **JWT** cho xác thực
- **AWS DynamoDB** cho cơ sở dữ liệu
- **AWS S3** cho lưu trữ file
- **Multer** cho tải lên file
- **bcryptjs** cho mã hóa mật khẩu

### Học Máy / AI
- **TensorFlow/Keras** cho phân loại khuôn mặt
- **PyTorch** cho các mô hình ML nâng cao
- **OpenCV** cho xử lý hình ảnh
- **RetinaFace** cho phát hiện khuôn mặt
- **YOLO** cho phát hiện vật thể
- **Hopenet** cho ước tính tư thế đầu
- **Bisenet** cho phân tích nền
- **CLIP** cho phát hiện hình ảnh giả

## 📋 Yêu Cầu Tiên Quyết

- Node.js (v16 trở lên)
- Python 3.8+
- Tài khoản AWS với DynamoDB và S3 được cấu hình
- Git

## 🔧 Cài Đặt & Thiết Lập

### 1. Sao Chép Kho Lưu Trữ
```bash
git clone <repository-url>
cd graduation-registration-website
```

### 2. Thiết Lập Backend
```bash
cd Web/backend
npm install
```

Tạo file `.env` trong thư mục backend:
```env
PORT=3001
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=your-aws-region
DYNAMODB_TABLE_USERS=users
DYNAMODB_TABLE_EVENTS=events
DYNAMODB_TABLE_GRADUATION=graduation_approved
DYNAMODB_TABLE_UNITS=units
S3_BUCKET_NAME=your-s3-bucket
JWT_SECRET=your-jwt-secret
```

Khởi động backend:
```bash
npm run dev
```

### 3. Thiết Lập Frontend
```bash
cd ../frontend
npm install
npm run dev
```

### 4. Thiết Lập Python/ML
```bash
# Cho xác thực chân dung
cd ../../portrait_checker
pip install -r requirements.txt

# Cho mô hình phân loại khuôn mặt
cd ../Model
pip install -r requirements.txt
```

## 🚀 Cách Sử Dụng

### Khởi Động Ứng Dụng
1. Khởi động máy chủ backend: `npm run dev` trong `Web/backend`
2. Khởi động frontend: `npm run dev` trong `Web/frontend`
3. Truy cập ứng dụng tại `http://localhost:5173` (frontend) và `http://localhost:3001` (API backend)

### Vai Trò Người Dùng
- **Sinh Viên**: Đăng ký sự kiện, tải lên chân dung, xem đăng ký
- **Đơn Vị Quản Trị**: Quản lý sự kiện và đăng ký cho đơn vị của họ
- **Quản Trị Viên Cấp Cao**: Quản lý toàn hệ thống và giám sát

### Xác Thực Chân Dung
Hệ thống tự động xác thực chân dung đã tải lên cho:
- Khuôn mặt đơn lẻ, được căn giữa
- Độ sáng và độ sắc nét phù hợp
- Tư thế đầu đúng
- Nền sạch sẽ
- Không có vật cấm (khẩu trang, kính)
- Ảnh chụp thực (không phải anime/giả)

## 📁 Cấu Trúc Dự Án

```
graduation-registration-website/
├── Web/
│   ├── backend/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   ├── utils/
│   │   └── server.js
│   └── frontend/
│       ├── src/
│       │   ├── components/
│       │   ├── pages/
│       │   ├── layouts/
│       │   └── services/
│       └── package.json
├── Model/
│   ├── train.py
│   ├── predict.py
│   └── requirements.txt
├── portrait_checker/
│   ├── app.py
│   ├── utils/
│   └── requirements.txt
└── README.md
```

## 📝 Giấy Phép

Dự án này được cấp phép theo Giấy Phép ISC.

---

**Lưu ý**: Đảm bảo tất cả dịch vụ AWS được cấu hình đúng và có thể truy cập trước khi triển khai. Các mô hình xác thực chân dung yêu cầu trọng số được đào tạo trước được đặt trong các thư mục thích hợp.
