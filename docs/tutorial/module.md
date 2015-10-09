> Module ArrowCMS có cấu trúc theo mô hình MVC, có thể tái sử dụng ở các hệ thống ArrowCMS khác

## Cấu trúc module ArrowCMS

* `dir-name` - Tên module.
    * `backend` - Chứa các file xử lý phía `backend`
        * `controllers`(có thể có hoặc không) - Thư mục chứa tất cả các file xử lý nghiệp vụ.
        * `views`(có thể có hoặc không) - Thư mục chứa layout backend cho module.
        * `route.js` - File định nghĩa điều hướng.
    * `frontend` - Chứa các file xử lý phía `frontend`
        * `controllers`(có thể có hoặc không) - Thư mục chứa tất cả các file xử lý nghiệp vụ.
        * `settings`(có thể có hoặc không) - Thư mục chứa route (theo cấu trúc bắt buộc) trả về menu cho frontend.
        * `views`(có thể có hoặc không) - Thư mục chứa layout frontend cho module.
        * `route.js` - File định nghĩa điều hướng.
    * `models` - Thư mục chứa tất cả các file model sử dụng trong module định nghĩa theo chuẩn của `sequelize`.
    * `module.js` - File chứa thông tin định nghĩa module(tên, các chức năng ...) .

    
VD: module xử lý các bài viết `blog`

![Screenshot](img/img1.png)

## Cấu trúc file module.js

![Screenshot](img/module.png)

* `modules.[name]`: name là tên của module phải trùng tên với tên thư mục chứa file `module.js`
    * `title` - Tên hiển thị đầy đủ của module.
    * `author` - Tên tác giả.
    * `version` - Phiên bản của module theo chuẩn `Major.Minor.Patch`.
    * `description` - Mô tả về module.
    * `rules` - Hệ thống quyền hạn của module. (có thể có hoặc không)
        * `name` - tên quyền hạn,
        * `title` - Mô tả về quyền hạn trong bảng phân quyền,
    * `backend_menu` - Hệ thống menu quản lý của module, (có thể có hoặc không)
        * `title` - Tiêu đề menu của module,
        * `icon` - Biểu tượng của module,
        * `menus` - Thông tin chi tiết các menu con,
            * `rule` - Quyền hạn để có thể vào menu con,
            * `title` - Tiêu đề của menu con,
            * `link` - Đường dẫn đến menu con,
            
## Khởi tạo một module

1. Tạo thư mục với tên module bạn muốn trong thư mục `app`.
2. Tạo ra hệ thông các file theo chuẩn cấu trúc của module.
    Một module không nhất thiết phải có đủ cả backend và frontend
3. Tạo file `module.js` với cấu trúc như trên
4. Hoàn thiện route,controller,views;


## Route trong module ArrowCMS
Route trong arrowCMS khai báo như Express Route
```javascript
    let express = require('express'),
        router = express.Router(),
        
        //Khai báo các route
    module.exports =  route    
```

Middle check quyền ở mỗi route

```
    __acl.isAllow(<Quyền đã khai báo trong  file module.js>)
```

## Controller trong module ArrowCMS

- Với backend module : 
```
    var _module = new BackModule;
        
    // Khai báo các function xử lý 
    // _module.read = function(req,res) { };
    
    module.exports = _module;
```     
- Với frontend module :

```
    var _module = new FrontModule;
    
    // Khai báo các function xử lý 
    // _module.read = function(req,res) { };
    
    module.exports = _module;
```

## Khai báo views

View trong ArrowCMS là các file html viết tuân thủ cú pháp nunjucks.Các file view được đặt trong thư mục `views` của từng module
Các khối nội dung trong ArrowCMS phụ thuộc vào từng view mà người dùng sử dụng. Với layout view mặc định của ArrowCMS, views gồm có 3 phần
   * `content` - Phần nội dung chính.
   * `jsExtends` - Mở rộng phần javascript.
   * `cssExtends` - Mở rộng phần css.
Bạn có thể sử dụng 1 layout view riêng biệt hoặc mở rộng layout view mặc định :
```
    {% extends 'layout.html' %}
```
## Khai báo models

ArrowCMS sử dụng sequelize để tương tác với cơ sở dữ liệu. Một mẫu database đơn giản:

```javascript
    'use strict';
    
    let slug = require('slug');
    
    module.exports = function (sequelize, DataTypes) {
        let Category = sequelize.define("category", {
            id : {
                type : DataTypes.INTEGER,
                primaryKey : true,
                autoIncrement : true,
                validate: {
                    isInt: {
                        msg: 'Count must be an integer number'
                    }
                }
            },
            count: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
                validate : {
                    isInt : {
                        msg : 'Count must be an integer number'
                    }
                }
            },
            name: {
                type: DataTypes.STRING,
                unique: true,
                allowNull: false
            },
            alias: {
                type :   DataTypes.STRING,
                validate : {
                    isAlias : function (value) {
                        if (typeof value !== 'string' || value.match(__config.regExp.alias_reg)){
                            throw new Error('Alias cannot includes special characters');
                        }
                    }
                }
            }
        }, {
            tableName: 'arr_category',
            timestamps: false,
            hooks: {
                beforeCreate: function (category, op, fn) {
                    category.alias = slug(category.name).toLowerCase();
                    fn(null, category);
                }
            }
        });
    
        Category.sync();
        return Category
    };
```       

## Tương tác với models và views
    
Render view trong controller:

```
    _module.render(req,res,<tên view trong thư mục views>,<Các biến truyền vào view>,[function callback]);
```    

Gọi flash message trong backend:

```
    req.flash.[message_type]
```
* `req` - là request.
* `[message_type]` - bao gồm `error`, `success`, `warning`, `info`.

ví dụ sử dụng flash message:

```javascript
    _module.index=function(req, res){
        req.flash.error("Oh! có lỗi gì đó");
        res.render('views');
    }

```

Để có thể gọi đến model trong controller :

```
     __models.<tên model được khai báo>.<query function>
```    

Tạo Button trong backend: 

```
     res.locals.deleteButton = __acl.addButton(req, <tên module>, <quyền cho nút>);
     res.locals.saveButton = __acl.addButton(req, <tên module>, <quyền cho nút>);
     res.locals.backButton = __acl.addButton(req, <tên module>, <quyền cho nút>, <link>);
     res.locals.createButton = __acl.addButton(req, <tên module>, <quyền cho nút>, <link>);
```

Tìm hiểu thêm `api` để có thể tùy biến module
