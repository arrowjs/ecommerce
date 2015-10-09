# Cách tạo `widget`

## Cấu trúc thư mục

![Screenshot](img/img2.png)

* `[widget_name]`: tên widget
    * `*.js`: file javascript xử lý nghiệp vụ
    * `setting.html`: setting của widget trong backend // Tên bắt buộc không được đổi
    
## File `*.js`

File dùng để khởi tạo widget và xử lý các nghiệp vụ của widget

File này là phải được khởi tạo là `class` kế thừa thằng `BaseWidget`

VD:

```js
//Khởi tạo widget
class Categories extends BaseWidget {
    constructor() {
        super();
        //Cấu hình thông tin cho widget
        let conf = {
            alias: "arr_categories",                    # Mã widget, cái này quan trọng và chỉ duy nhất
            name: "Categories",                         # Tên widget
            description: __.t('m_widgets_categories'),  # Miêu tả chức năng
            author: "ZaiChi",                           # Tác giả
            version: "0.1.0",                           # Phiên bản
            options: {                                  # Các trường đặc biệt để cấu hình, tùy chức năng widget mà người dùng tạo ra biến tùy ý
                title: ''
            }
        };
        //Gán cấu hình vào đối tượng, 2 dòng code này là mặc định và luôn cần
        conf = _.assign(this.config, conf);
        this.files = this.getAllLayouts(conf.alias);
    }

    //Hàm viết đè render setting của widget
    //Viết đè hàm này khi cần có xử lý đặc biệt trước khi render ra màn hình setting
    render(widget) {
        let base_render = super.render;
        let self = this;
        return new Promise(function (resolve) {
            __models.category.findAll({
                order: "name ASC"
            }).then(function (categories) {
                resolve(base_render.call(self, widget, {
                    items: categories
                }));
            });
        })
    }
}

module.exports = Categories;
```

Mỗi `widget` trong mỗi theme là khác nhau nên việc hiển thị của nó trên mỗi theme phải được viết khác nhau.

1. Trong thư mục `themes\frontend\[theme_name]` tạo thư mục `_widgets`(nếu có rồi thì thôi)

2. Tạo thư mục mới có tên giống với `alias` của `widget` vừa được tạo

3. Tạo file `default.html` để định nghĩa việc hiển thị của `widget`

![Screenshot](img/img3.png)

VD:

```html
<section class="widget widget_categories">
    {% if items | length %}
        <div class="widget categories">
            <h3>{{ widget.data.title|title }}</h3>

            <div class="row">
                <div class="col-sm-6">
                    <ul class="blog_category">
                        {% for item in items %}
                            {% if item.id == category.id %}
                                <li>
                                    <a style="background-color: #c52d2f ;color: white"
                                       href="/category/{{ item.alias }}/{{ item.id }}/">
                                        {{ item.name }} <span class="badge"> {{ item.count }}</span>
                                    </a>
                                </li>
                            {% else %}
                                <li>
                                    <a href="/category/{{ item.alias }}/{{ item.id }}/">
                                        {{ item.name }} <span class="badge"> {{ item.count }}</span>
                                    </a>
                                </li>
                            {% endif %}
                        {% endfor %}
                    </ul>
                </div>
            </div>
        </div>
    {% endif %}
</section>
```

Tham khảo thêm mã nguồn của widget trong thư mục `core\widgets` 