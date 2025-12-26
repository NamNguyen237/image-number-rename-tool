import os
import re

def rename_files_with_padding(directory, padding_length=3, file_extension=None):
    """
    Đổi tên các tệp tin đã đánh số trong thư mục chỉ định, thêm số 0 đệm vào phía trước.

    Tham số:
    - directory (str): Đường dẫn đến thư mục chứa tệp cần đổi tên.
    - padding_length (int): Tổng chiều dài của phần số mong muốn (ví dụ: 3 cho 001).
    - file_extension (str, optional): Chỉ xử lý các tệp có đuôi mở rộng này (ví dụ: '.jpg').
                                      Nếu là None, sẽ xử lý tất cả tệp.
    """
    try:
        # Lấy danh sách tất cả các tệp trong thư mục
        files = os.listdir(directory)
    except FileNotFoundError:
        print(f"Lỗi: Thư mục '{directory}' không tồn tại.")
        return

    # Biểu thức chính quy (Regex) để tìm phần số ở đầu tên file
    # Ví dụ: tìm '1', '10', '100' trong '1.jpg', '10_image.png'
    # Chúng ta tìm số ở đầu tên file (trước dấu chấm đầu tiên)
    number_pattern = re.compile(r'^(\d+)(.*)')
    
    renamed_count = 0

    print(f"Bắt đầu đổi tên tệp trong thư mục: {directory}")
    print("-" * 30)

    for old_filename in files:
        # Xây dựng đường dẫn đầy đủ
        old_filepath = os.path.join(directory, old_filename)

        # Bỏ qua nếu là thư mục
        if os.path.isdir(old_filepath):
            continue
        
        # Bỏ qua nếu đuôi file không khớp (nếu được chỉ định)
        if file_extension and not old_filename.lower().endswith(file_extension.lower()):
            continue
        
        # Tìm kiếm phần số trong tên tệp
        match = number_pattern.match(old_filename)

        if match:
            # Lấy phần số và phần còn lại của tên file (bao gồm đuôi mở rộng)
            number_part = match.group(1)
            remaining_part = match.group(2)
            
            # Chuyển đổi số và thêm số 0 đệm
            # zfill(3) sẽ biến '1' thành '001', '10' thành '010', '100' thành '100'
            padded_number = number_part.zfill(padding_length)
            
            # Tạo tên tệp mới
            new_filename = f"{padded_number}{remaining_part}"
            new_filepath = os.path.join(directory, new_filename)
            
            # Kiểm tra xem tên file có thay đổi không trước khi đổi tên
            if old_filename != new_filename:
                try:
                    os.rename(old_filepath, new_filepath)
                    print(f"Đã đổi tên: '{old_filename}' -> '{new_filename}'")
                    renamed_count += 1
                except Exception as e:
                    print(f"Lỗi khi đổi tên tệp '{old_filename}': {e}")
            # else:
            #     print(f"Bỏ qua: '{old_filename}' đã đúng định dạng.")


    print("-" * 30)
    print(f"Hoàn tất. Tổng số tệp đã đổi tên: {renamed_count}")
    print(f"Nếu muốn thử lại, hãy thay đổi '{padding_length}' hoặc đường dẫn thư mục.")


# --- CẤU HÌNH SỬ DỤNG ---

# 1. Đặt đường dẫn đến thư mục chứa các tệp của bạn
# Ví dụ: Dùng r'...' để tránh lỗi với ký tự \ trong Windows
TARGET_DIRECTORY = r''

# 2. Đặt chiều dài mong muốn của phần số (ví dụ: 3 cho 001)
DESIRED_PADDING = 3 

# 3. Đặt đuôi mở rộng (hoặc None để xử lý mọi tệp)
# Ví dụ: '.jpg', '.png', hoặc None
EXTENSION_TO_PROCESS = None 

# CHẠY TOOL
# --- CẢNH BÁO: CHẠY LỆNH NÀY SẼ THAY ĐỔI TÊN TỆP THỰC TẾ ---
rename_files_with_padding(TARGET_DIRECTORY, DESIRED_PADDING, EXTENSION_TO_PROCESS)