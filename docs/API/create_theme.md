## Tạo một theme mới

Chuẩn bị đầy đủ tài nguyên của theme(hình ảnh, file css, javascript ...).

Tạo một thư mục mới `[theme-name]` trong thư mục `public`.

```
    public
        theme_resources/[theme-name]    # Thư mục chứa css, image, javascript...
```

Chép toàn bộ tài nguyên của theme vào thư mục

Tạo một thư mục mới `[theme-name]` trong thư mục `themes\frontend`

Tạo file `layout.html` trong thư mục

```
    themes
        frontend/[theme-name]
                [module]    # Module muốn viết đè
                layout.html # Định nghĩa layout của theme
```
## Tạo file theme.json

Đây là file chứa các cấu hình trong theme:

```
{
  "name": "Corlate",
  "alias": "corlate",
  "folder": "corlate",
  "author": "shapebootstrap",
  "link": "http://shapebootstrap.net/item/corlate-free-responsive-business-html-template/",
  "thumbnail": "corlate-thumbnail.jpg",
  "sidebars": [
    {
      "name": "main-menu",
      "title": "Main Menu"
    },
    {
      "name": "right-sidebar",
      "title": "Right Sidebar"
    }
  ],
  "menus": [
    {
      "name": "main_menu",
      "title": "Main menu"
    },
    {
      "name": "left_menu",
      "title": "Left menu"
    }
  ],
  "events": [
    {
      "name": "before_close_head_tag",
      "description": "Occur before </head> tag"
    },
    {
      "name": "after_open_body_tag",
      "description": "Occur after <body> tag"
    },
    {
      "name": "before_close_body_tag",
      "description": "Occur before </body> tag"
    }
  ]
}
```
* `name` - Tên hiển thị của theme.
* `alias` - Tên mã của theme (không hỗ trợ dấu cách).
* `folder` - Tên thư mục chứa theme.
* `author` - Tên tác giả.
* `link` - Trang web của tác giả.
* `thumbnail` - Ảnh đại diện của theme.
* `sidebars` - Vùng hiển thị widgets trong theme.
    * `name` - Mã khu vực hiển thị.
    * `title` - Tên khu vực sidebar.
* `events` - Thiết lập khu vực để đặt plugin
    * `name` - Mã vùng.
    * `description` - Mô tả vùng.
    
## Cài đặt các events trong theme

Thiết lập từng event trong file `layout.html`

```
  {{ <event name> |fire_event(null)|safe }}
```
    
    


