## Thư mục themes

Chứa toàn bộ file định nghĩa giao diện hiển thị của hệ thống, sử dụng chuẩn template của [nunjucks](http://mozilla.github.io/nunjucks/)

![Screenshot](img/img2.png)
## Cấu trúc thư mục của `themes`

* `backend`(mặc định) - Thư mục định nghĩa giao diện của `backend` module.
    * `default`(mặc định) - Thư mục định nghĩa giao diện của `backend` module.
        * `_table_template` - Thư mục định nghĩa giao diện bảng chuẩn của backend (có thể dùng hoặc không).
        * `email-template` - Thư mục định nghĩa mẫu email được gửi trong `backend`.
        * `layout.html` - File định nghĩa giao diện của `backend`.
        * `login.html` - File định nghĩa giao diện login của `backend`.
        * `sidebar.html` - File định nghĩa giao diện menu bên trái của `backend`.
        * `toolbar.html` - File định nghĩa giao diện của `backend` module.
* `frontend`(mặc định) - Thư mục định nghĩa giao diện của `frontend` module.
    * `corlate`(mặc định) - thư mục định nghĩa giao diện của `frontend` module.
    * `widget_layout.html`(mặc định) - file quyết định layout widget sẽ sử dụng.
    * `default_layout.html`(mặc định) - file quyết định frontend sẽ sử dụng theme nào.
    

