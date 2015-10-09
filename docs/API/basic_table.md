# Sử dụng view basic_table trong các `backend` modules

## Giới thiệu

* `basic_table.html` là một file có sẵn trong thư mục `themes\backend\default` nó có chức năng hiển thị dữ liệu cung cấp
theo dạng chuẩn table boostrap, tùy theo các option được cung cấp trong dữ liệu mà nó có thể hiển thị tương ứng với dữ
liệu đó
* `basic_table.html` sẽ bao gồm các chức năng:
    * `view`: hiển thị dữ liệu.
    * `sort`: sắp xếp dữ liệu theo cột được chọn.
    * `filter`: tìm kiếm dữ liệu.
    
![Screenshot](img/table.png)

## Hàm `__.createFilter`

```js
__.createFilter(req, res, route, reset_link, default_column, default_sort,columns)
```

* `req`: biến request.
* `res`: biến response.
* `route`: module đang chạy.
* `reset_link`:link thực hiện khi người dùng ấn nút `làm mới(reload)` .
* `default_column`: cột mặc định dùng để sắp xếp.
* `default_sort`: kiểu sắp xếp mặc định tăng dần `asc` hoặc giảm dần `desc`.
* `columns`: mảng các cấu hình hiển thị cho từng cột.

## Các thuộc tính để cấu hình hiển thị cột trong hàm

```js
{
    column: [cột để hiển thị dữ liệu],
    width: [độ rộng],
    header: [tiêu đề cột],
    #link có thể lấy dữ liệu từ các cột khác theo pattern `{ten_cot}` VD:/admin/roles/{role.id}
    link: [link khi bấm vào cột],
    acl: [quyền để kiểm tra có hiển thị link hay không],
    filter: {
        #Kiểu filter `string`, `number`, `select`, `datetime`
        data_type: [],
        #Các option bên dưới chỉ dùng khi kiểu `data_type` là `select`
        filter_key: [cột để tìm kiếm],
        data_source: [nguồn dữ liệu],
        display_key: [cột hiển thị],
        value_key: [cột lấy giá trị]
    }
}
```
## VD cột có kiểu tìm kiếm `string`

```js
{
    column: "user_email",                       # lấy cột user_email để hiển thị
    width: '15%',                               # độ rộng của cột là 15%
    header: "Email",                            # tiêu đề cột là Email
    filter: {
        data_type: 'string'                     # kiểu filter dữ liệu là string
    }
},
```
## VD cột có kiểu tìm kiếm `number`

```js
{
    column: "id",                               # lấy cột id để hiển thị
    width: '15%',                               # độ rộng của cột là 15%
    header: "Mã",                               # tiêu đề cột là Mã
    filter: {
        data_type: 'number'                     # kiểu filter dữ liệu là number
    }
},
```

## VD cột có kiểu tìm kiếm `datetime`

```js
{
    column: "created_at",                       # lấy cột id để hiển thị
    width: '15%',                               # độ rộng của cột là 15%
    header: "Ngày tạo",                         # tiêu đề cột là Ngày tạo
    type: 'datetime',                           # định dạng hiển thị cột là kiểu ngày tháng    
    filter: {
        data_type: 'datetime',                  # kiểu filter là datetime
        filter_key: 'created_at'                # cột tìm kiếm là created_at
    }
},
```
## VD cột có kiểu tìm kiếm `select`

```js
 {
    column: "course.title",                     # lấy cột course.title hiển thị
    header: "Khóa học",                         # tiêu đề cột là Khóa học
    filter: {
        type: 'select',                         # kiểu filter là select
        filter_key: 'course_id',                # cột để so sánh là course_id
        data_source: 'course',                  # nguồn lấy dữ liệu là bảng course
        display_key: 'title',                   # cột để hiển thị
        value_key: 'id'                         # cột để lấy giá trị
    }
},
```

## VD đầy đủ về cách sử dụng

```js
exports.list = function (req, res) {
    // Thêm button vào toolbar
    res.locals.createButton = __acl.addButton(req, route, 'create', '/admin/courses/create');
    res.locals.deleteButton = __acl.addButton(req, route, 'delete');

    //Cấu hình mặc định các tham số phân trang và sắp xếp
    let page = req.params.page || 1;
    let column = req.params.sort || 'id';
    let order = req.params.order || 'desc';


    // Cấu hình session để lưu lại dữ liệu từ khóa tìm kiếm
    let session_search = {};
    if (req.session.search) {
        session_search = req.session.search;
    }
    session_search[route + '_index_list'] = req.url;
    req.session.search = session_search;

    //Config columns
    res.locals.root_link = '/admin/courses/page/' + page + '/sort';
    
    //Điều kiện bổ sung chỉ lấy khóa học của giảng viên đó nếu không có quyền xem tất cả(indexAll)
    let customCondition = "AND (lectures @> ARRAY[" + req.user.id + "])";
    //Kiểm tra user có quyền xem tất không
    if (__acl.allow(req, route, 'indexAll')) {
        customCondition = '';
    }
    //Gọi hàm tạo cấu hình
    let filter = __.createFilter(req, res, route, '/admin/courses', column, order, [
        {
            column: "id",
            width: '1%',
            header: "",
            type: 'checkbox'
        },
        {
            column: "title",
            width: '25%',
            header: "Tên",
            link: '/admin/courses/{id}',
            acl: 'courses.update',
            filter: {
                data_type: 'string'
            }

        },
        {
            column: "",
            width: '10%',
            header: "Giáo trình",
            alias: "Xem Giáo Trình",
            link: "/admin/courses/section/{id}"

        },
        {
            column: "",
            width: '10%',
            header: "Đánh Giá",
            alias: "Xem Đánh Giá",
            link: "/admin/rate/list-course-rating/{id}"

        },
        {
            column: 'lectures',
            header: "Giảng viên",
            type: 'array',
            source: 'users',
            key_to_compare: 'id',
            key_to_value: 'display_name',
            filter: {
                type: 'select',
                filter_key: 'lectures',
                data_source: 'SELECT id, display_name FROM arr_user WHERE id = ANY(SELECT unnest(lectures) FROM course)',
                source_type: 'query',
                display_key: 'display_name',
                value_key: 'id'
            }
        },
        {
            column: "openning_content",
            width: '20%',
            header: "Chú thích",
            filter: {
                data_type: 'string'
            }
        },
        {
            column: "price",
            width: '5%',
            header: "Giá tiền",
            type: 'price',
            filter: {
                data_type: 'number'
            }
        },
        {
            column: "type",
            width: '1%',
            header: "Loại",
            type: "custom",
            alias: {
                "1": '<span class="label label-warning">Offline</span>',
                "2": '<span class="label label-success">Online</span>'
            },
            filter: {
                type: 'select',
                filter_key: 'type',
                data_source: [
                    {
                        name: "Offline",
                        value: 1
                    },
                    {
                        name: "Online",
                        value: 2
                    }

                ],
                display_key: 'name',
                value_key: 'value'
            }
        },

        {
            column: "status",
            width: '1%',
            header: "Trạng thái",
            filter: {
                type: 'select',
                filter_key: 'status',
                data_source: [
                    {
                        name: "publish"
                    },
                    {
                        name: "un-publish"
                    }
                ],
                display_key: 'name',
                value_key: 'name'
            }

        }
    ], customCondition);
    //Truy vấn CSDL lấy dữ liệu
    __models.course.findAndCountAll({
        attributes: filter.attributes,
        order: filter.sort,
        limit: __config.pagination.number_item,
        offset: (page - 1) * __config.pagination.number_item,
        where: filter.values
    }).then(function (results) {
        let totalPage = Math.ceil(results.count / __config.pagination.number_item);
        __models.user.findAll({
            where: ["id = ANY(SELECT unnest(lectures) FROM course)"],
            raw: true
        }).then(function (users) {
            _module.render(req, res, 'index', {
                title: "Danh sách khóa học",
                totalPage: totalPage,
                items: results.rows,    #bắt buộc phải truyền dữ liệu vào biến `items`
                sources: {users: users},
                currentPage: page
            });
        }).catch(function (err) {
            req.flash.error(err.name + ': ' + err.message);
            console.log(err.stack);
            res.redirect('/admin/courses');
        });
    }).catch(function (err) {
        req.flash.error(err.name + ': ' + err.message);
        console.log(err.stack);
        res.redirect('/admin/courses');
    });
};
```

Khi ngoài file giao diện ta chỉ cần thực hiện gọi

```
{% include 'basic_table.html' %}
<!-- phân trang nếu có -->
{{ totalPage|pagination(currentPage,'/admin/customer-register/page/{page}/sort/'+currentColumn+'/'+currentOrder)|safe }}
```

Tham khảo thêm mã nguồn ở các module khác trong thư mục `core\modules`

