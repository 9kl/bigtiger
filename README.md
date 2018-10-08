# bigtiger
在[django](https:://https://www.djangoproject.com/,'django')的基础上封装的一个web框架，加速企业应用的开发。


## 安装
    pip install bigtiger
    
## 文档

### 视图层

#### 导入视图相关的包
    
    from bigtiger.views.decorators import jsonresponse, excelresponse
    from bigtiger.views.generic import (
        ListView, DetailView, CreateView, UpdateView, DeleteView)
    from bigtiger.utils.unique import get_uuid

    from gardener.forms.sys_book import (
        SysBookSearchForm, SysBookEditForm, SysBookEditFormAdmin)
    from gardener.models.sys_book import SysBookModel
    

#### 列表视图
    
    class SysBookListView(ListView):
        template_name = "gardener/pages/sys_book/table.htm"
        search_form_class = SysBookSearchForm
        search_form_initial = {'sort': 'order_number', 'order': 'asc'}

        def search(self):
            if self.search_form.is_valid():
                cd = self.search_form.cleaned_data

                service = SysBookModel()
                lst, count = service.get_page_query(
                    cd['class_code'], cd['code'], cd['text'], cd['remark'], self.page_limit, self.page_offset, cd['sort'], cd['order'])
                return lst, count

        @excelresponse(u'系统数据字典', 'sys_book.xls', 2, 0)
        def excel(self):
            result, _ = self.search()
            if result:
                return [(item['id'], item['class_code'], item['code'], item['text'], item['order_number'], item['is_enable'], item['remark'], ) for item in result]
            return None

        @jsonresponse()
        def json(self):
            result, total = self.search()
            return {'data': result, "message": None, "pages": self.page_index, "success": True, "total": total}
           
 #### 新增视图
 
     class SysBookAddView(CreateView):
        template_name = "gardener/pages/sys_book/edit.htm"
        form_class = SysBookEditForm
        form_admin_class = SysBookEditFormAdmin

        def add(self, cd):
            del cd['_id']

            cd['id'] = get_uuid()
            service = SysBookModel()
            service.add(cd)
            
  #### 编辑视图
  
      class SysBookEditView(UpdateView):
        template_name = "gardener/pages/sys_book/edit.htm"
        form_class = SysBookEditForm
        form_admin_class = SysBookEditFormAdmin

        def get_init_form_data(self, pk, pks):
            service = SysBookModel()
            d = service.get_detail(pk)
            d['_id'] = d['id']
            return d

        def modify(self, cd):
            _id = cd['_id']
            del cd['_id']

            service = SysBookModel()
            service.modify(_id, cd)
            
            
  #### 删除视图
  
      class SysBookDeleteView(DeleteView):

        def delete(self, pk, pks):
            service = SysBookModel()
            service.tran_delete(pks)
            
  #### 详情视图
  
      class SysBookDetailView(DetailView):
        template_name = "gardener/pages/sys_book/detail.htm"

        def search(self, pk, pks):
            service = SysBookModel()
            d = service.get_detail(pk)
            return d
            
 ### 模型层
 
 模型层用[sqlalchemy](https:://www.sqlalchemy.org/,'sqlalchemy')替代django自带的model数据操作，运用[sqlalchemy-django](https:://github.com/9kl/sqlalchemy_django,'sqlalchemy_django')库完成数据操作。
 
 
 ### 表单
 
    from django import forms

    from bigtiger.forms.forms import BaseForm
    from bigtiger.forms.forms import OrderForm


    class SysBookSearchForm(OrderForm):
        class_code = forms.CharField(label='分类编码', required=False)
        code = forms.CharField(label='字典编码', required=False)
        text = forms.CharField(label='字典名称', required=False)
        remark = forms.CharField(label='备注', required=False)

        def __init__(self, *args, **kwargs):
            super(SysBookSearchForm, self).__init__(*args, **kwargs)


    class SysBookEditForm(BaseForm):
        _id = forms.CharField(required=False, widget=forms.HiddenInput)

        id = forms.CharField(label='Id', required=False, max_length=36)
        class_code = forms.CharField(label='分类编码', required=True, max_length=20)
        code = forms.CharField(label='字典编码', required=True, max_length=50)
        text = forms.CharField(label='字典名称', required=True, max_length=50)
        order_number = forms.IntegerField(
            label='排序号', required=True, max_value=99, min_value=0)
        is_enable = forms.ChoiceField(
            label='启用状态', required=True)
        remark = forms.CharField(label='备注', required=False, max_length=200,
                                 widget=forms.Textarea(attrs={'rows': 2, 'cols': 100}))

        def __init__(self, *args, **kwargs):
            super(SysBookEditForm, self).__init__(*args, **kwargs)
            self.fields['is_enable'].choices = ((1, '是'), (0, '否'))


    class SysBookEditFormAdmin(object):
        fieldsets = (
            ('基础信息', {'fields': ('class_code', 'code', 'text', 'order_number',
                                 'is_enable', 'remark', ), 'classes': ('col-sm-12', 'form-horizontal',)}),
            ('隐藏域', {'fields': ('_id', 'id',),
                     'classes': ('col-sm-12', 'hidefield',)}),
        )
        readonly_fields = ()


    class SysBookCreateFormAdmin(object):
        pass
        
        
 ### 模版
 
 模版的使用与django的模版使用方法一致，下面的示例是运用bigtiger内置的bigtiger.contrib.admin完成数据的增删改查的模版。
 
 #### 列表页面
 
    {% extends "admin/basemanage.htm" %}

    {% block searchField %}
    <div class="form-group">
    {{ form.class_code.label_tag }}
    {{ form.class_code }}
    </div>
    <div class="form-group">
    {{ form.code.label_tag }}
    {{ form.code }}
    </div>
    <div class="form-group">
    {{ form.text.label_tag }}
    {{ form.text }}
    </div>
    <div class="form-group">
    {{ form.remark.label_tag }}
    {{ form.remark }}
    </div>
    {% endblock %}
    
    {% block tableWrapper %}
    <table id="zssly_report_dg">
        <thead>
            <tr>
                    <th data-options="field:'ck',checkbox:true"></th>
                    <th data-options="field:'_link',formatter:humanize.formatDetailInfo,align:'center'"></th>
                    <th data-options="field:'class_code',width:60">分类编码</th>
                    <th data-options="field:'code',width:60">字典编码</th>
                    <th data-options="field:'text',width:60">字典名称</th>
                    <th data-options="field:'order_number',width:45">排序号</th>
                    <th data-options="field:'is_enable',width:60, formatter:humanize.formatYesNoImg">启用状态</th>
                    <th data-options="field:'remark',width:30">备注</th>
                </tr>
        </thead>
    </table>
    
    <script type="text/javascript">
        app.mainWindow.gridResize(function (h) {
            $('.gridWrapper').height(h);
        });

        (function () {
            var config = {
                pageId: '{{ permission.id }}',
                pageTitle: '{{ permission.menu_name }}',
                pageUrl: '{{ permission.menu_url }}',
                windowHeight: '600px',
                windowWidth: '800px',
                dataGridId: '#zssly_report_dg',
                toolbarId: '#zssly_report_dg_toolbar',
                btns: ['search', 'insert', 'update', 'delete'],
                gridOptions: {'fitColumns': true},
                detailColumn: '_link',
                getRowKey: function (row) {
                    var keys = [row['id']];
                    return keys.join('|');
                },
                getQueryParams: function () {
                    var q = {
                        'class_code': $('#id_class_code').val(),
                        'code': $('#id_code').val(),
                        'text': $('#id_text').val(),
                        'remark': $('#id_remark').val(),
                    };
                    return q;
                }
            };
            new ListPageView(config);
        })();
    </script>
    {% endblock %}
    
#### 新增/编辑页面

    {% extends "admin/baseedit.htm" %}
    
#### 详情页面
    
    {% extends "admin/basedetail.htm" %}

    {% block head %}
    {{ block.super }}
    <style type="text/css">
    .table-responsive table .field-t {
        width: 18em;
        text-align: right;
    }
    </style>
    {% endblock %}

    {% block box_content %}
    <div class="row">
        <div class="table-responsive col-sm-12">
            <table class="table table-hover table-condensed">
                <thead>
                    <tr>
                        <th colspan="2">
                            <h3>系统数据字典</h3>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr class="field field-id">
                        <td class="field-t">id：</td>
                        <td class="field-c">{{ object.id }}</td>
                    </tr>
                    <tr class="field field-class_code">
                        <td class="field-t">分类编码：</td>
                        <td class="field-c">{{ object.class_code }}</td>
                    </tr>
                    <tr class="field field-code">
                        <td class="field-t">字典编码：</td>
                        <td class="field-c">{{ object.code }}</td>
                    </tr>
                    <tr class="field field-text">
                        <td class="field-t">字典名称：</td>
                        <td class="field-c">{{ object.text }}</td>
                    </tr>
                    <tr class="field field-order_number">
                        <td class="field-t">排序号：</td>
                        <td class="field-c">{{ object.order_number }}</td>
                    </tr>
                    <tr class="field field-is_enable">
                        <td class="field-t">启用状态：</td>
                        <td class="field-c">{{ object.is_enable }}</td>
                    </tr>
                    <tr class="field field-remark">
                        <td class="field-t">备注：</td>
                        <td class="field-c">{{ object.remark }}</td>
                    </tr>
                    </tbody>
            </table>
        </div>
    </div>
    {% endblock %}


 
 
 
 


