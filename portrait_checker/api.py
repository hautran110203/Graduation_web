from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import shutil
import os
from app import check_portrait  # hàm bạn đã viết
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # hoặc ["http://localhost:5173"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/verify-portrait")
async def verify_portrait(file: UploadFile = File(...)):
    if file.filename == "":
        raise HTTPException(status_code=400, detail="Không có file được tải lên.")

    temp_filename = f"temp_{file.filename}"
    try:
        # Lưu ảnh tạm
        with open(temp_filename, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Kiểm tra ảnh
        errors = check_portrait(temp_filename)
        os.remove(temp_filename)

        if errors:
            return JSONResponse(status_code=400, content={
                "success": False,
                "errors": errors
            })
        return {"success": True, "message": "Ảnh hợp lệ"}

    except Exception as e:
        if os.path.exists(temp_filename):
            os.remove(temp_filename)
        return JSONResponse(status_code=500, content={
            "success": False,
            "message": "Lỗi xử lý ảnh",
            "detail": str(e)
        })