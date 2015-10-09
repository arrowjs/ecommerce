> ArrowCMS là hệ thống quản trị nội dung được viết trên nền tàng Nodejs. 

## Yêu cầu hệ thống

Trước khi bắt đầu với hệ thống ArrowCMS, chắc chắn bạn đã cài đặt:  
Nền tảng: [iojs](https://iojs.org/en/index.html)( >= `3.0.0`)   
Cơ sở dữ liệu: [postgresql](http://www.postgresql.org/) (>= `9.4`)  
Bộ nhớ đệm: [redis](http://redis.io/)   

Với máy sử dụng hệ điều hành Linux, chúng tôi hỗ trợ bộ cài đặt tự động :
```
    git clone https://github.com/TechMaster/arrowjs-installer
    cd arrowjs-installer
    ./install
```
-----
## Cài đặt ArrowCMS

- Clone toàn bộ hệ thống từ GitHub:
```
    git clone https://github.com/TechMaster/arrowjs-installer
```
-  Khởi tạo cơ sở dữ liệu:  
    Tạo 1 cơ sở dữ liệu trên Postgres
```
    CREATEDB <database name>
```
hoặc
```
    psql
    CREATE DATABASE <database name>;
```

```
    cd <clone folder>
    pg_restore -U [username] -d [dbname] "sql/arrowjs.backup"
    # [username]: user for database postgres
    # [dbname]: database name to restore
```
- Chỉnh sửa file config hệ thống:

```
    cd <clone folder>/config/env
```
Ban đầu, ứng dụng ArrowCMS chạy ở chế độ `development`. Bạn có hãy thay đổi thông tin trong file `development.js` và file `all.js` cho phù hợp với hệ thống hiện tại

- Cài đặt các node module:

```
    npm install
```

- Khởi động ứng dụng : 

```
    node server.js
```
Ứng dụng Arrowjs chạy mặc định ở cổng `3333`. Mở trình duyệt của máy với link : `http://localhost:3333`

-----

## Development và Production ...

Với lần đầu tiên chạy ứng dụng nếu bạn chưa thiết đặt `NODE_ENV`, chế độ mặc định sẽ là development. Ở chế độ này với các request đến server sẽ hiển thị log trong terminal.
Bạn có thể chuyển sang các chế độ khác nhau bằng việc thay đổi bỏ chủ thích trong file `server.js`

```
    process.env.NODE_ENV = "production";
```
Bạn hoàn toàn có thể tạo ra những môi trường của riêng mình bằng việc tạo ra các file `<name>.js` trong thư mục `config/env` sau đó thay đổi  môi trường bằng câu lệnh terminal hoặc 
tên trong file `server.js`

-----
