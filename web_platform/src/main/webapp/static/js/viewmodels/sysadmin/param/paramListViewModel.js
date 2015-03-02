/**
 * Created by Barry.
 */
requirejs(['jquery','knockout','paramsService','commonUtil','amplify','DT-bootstrap','bootstrap'],
		function($,ko,paramsService,util){
            var sys_info = parent.app.getI18nMessage('common.sys.info');
            var sys_error = parent.app.getI18nMessage('common.sys.error');
            var submit_error = parent.app.getI18nMessage('common.sys.submit.fail');
            var edit_ok = parent.app.getI18nMessage('common.sys.edit.text');
            var edit_fail = parent.app.getI18nMessage('common.sys.edit.text');
            var delete_tip = parent.app.getI18nMessage('param.delete.tip');
  var paramListViewModel = function() {
    var ep = this;
    this.paramView = new ParamView();
    this.sel_text = ko.observable('-Select-');
    this.name = ko.observable('');
    this.code = ko.observable('');
    this.typeOptions = ko.observableArray([]);
    this.has_count = ko.observable('true');//是否要统计翻页显示！
    this.params = new Array();
    this.paramAdd = 'addparam';
    this.paramDel = 'delparam';
    this.delIds = ko.observable('');
    this.paramModify = 'modifyparam';
    this.viewDel = ko.observable(false);
    this.viewAdd = ko.observable(false);
    this.canAdd = false;
    this.canDel = ko.observable('');
    this.canModify = false;
    this.initAuth = function () {
      if (parent.app.checkAuth(ep.paramAdd)) {
          ep.canAdd = true;
          ep.viewAdd(true);
      }
      if (parent.app.checkAuth(ep.paramDel)) {
          ep.canDel = true;
          ep.viewDel(true);
      }
      if (parent.app.checkAuth(ep.paramModify)) {
        ep.canModify = true;
      }
    };
      this.seti18nText = function(){
          $('title,legend,label,span,div,th').each(function(){
              var attr = $(this).attr('i18n');
              if(attr !=null && attr != ''){
                  $(this).text(parent.app.getI18nMessage(attr));
              }
          });
          $('h4,button').each(function(){
              var attr = $(this).attr('i18n');
              if(attr !=null && attr != ''){
                  $(this).html(parent.app.getI18nMessage(attr));
              }
          });
      };
    this.init = function () {
        ep.sel_text(parent.app.getI18nMessage("common.sys.select.text"));
        ep.seti18nText();
        ep.initAuth();
        ep.loadTypeList();
    };

    var SelectModel = function (text, value) {
        this.text = text;
        this.val = value;
    };
    
    this.loadTypeList = function(){
    	var deferred = paramsService.getParams(null);
    	 $.when(deferred).done(function (response) {
             if(typeof response =="string") {
               eval('var result =' + response);
             }else{
             	var result = response;
             }
             if (result.state.code == 200000 && result.result.length > 0) {
               ep.typeOptions([]);
                 $.each(result.result, function (index,status) {
                 	ep.typeOptions.push(new SelectModel(status.type_meaning,status.type));
                 });
             } else {
                 console.log('load status failed');
             }
         }).fail(function (error) {
             console.log(error);
         });
    };

    this.datatable = ko.observable();

    this.setUpTable = function () {
      var settings = All580.dataTable;
      settings['sAjaxSource'] = All580.serverName + '/service/core/param|lst';
      settings['fnServerParams'] = function (aoData) {
        aoData.push({ "name": "name", "value": ep.params['name']});
        aoData.push({ "name": "code", "value": ep.params['code']});
        aoData.push({ "name": "type", "value": ep.params['type']});
        aoData.push({ "name": "has_count", "value": ep.has_count});
      };
      settings['fnDrawCallback'] = function(){
    	  util.adjustIframeHeight();
      };
      settings['aoColumns'] = [
        {   //checkbox
        	'sDefaultContent': '',
        	'fnRender': function (obj) {
               return '<input style=\'margin-left:10px;cursor:pointer;\' name=\'foreach_chk_data\' type=\'checkbox\'id=\''+obj.aData.id+'\' >';
        	}
        }, 
        { 'mData': 'name','sDefaultContent': ''}, //参数名称
        { 'mData': 'code', 'sDefaultContent': ''}, //参数编码
        { 'mData': 'type_meaning', 'sDefaultContent': ''}, //参数类型
		{ 	//创建时间
        	'sDefaultContent': '',
        	'fnRender': function (obj) {
        		return All580.DPGlobal.formatDateTime(obj.aData.create_time, 'yyyy-MM-dd HH:mm:ss');
        	}
		},
		{ 	//操作
        	'sDefaultContent': '',
        	'fnRender': function (obj) {
                if(ep.canModify){
                    return '<a href="edit.html?id=' + obj.aData.id + '&status=edit">'+edit_ok+'</a>';
                }else{
                    return edit_fail;
                }
            }
		}
      ];
      var dataTable = $('#dynamic-table').dataTable(settings);
        ep.datatable(dataTable);
      $('#search').click(function() {
    	  ep.params['name']=ep.name();
    	  ep.params['code']=ep.code();
    	  ep.params['type']=ep.paramView.type();
    	  ep.params['has_count']=ep.has_count();
          dataTable.fnDraw();
      });

    };
      this.delParam = function (obj) {
          var deferred = paramsService.delParam(obj);
          $.when(deferred).done(function (response) {
              if(response.state.code==200000) {
                  console.log('删除成功');
                  ep.loadTypeList();
                  ep.params['name']=ep.name();
                  ep.params['code']=ep.code();
                  ep.params['type']=ep.paramView.type();
                  ep.params['has_count']=ep.has_count();
                  ep.datatable().fnDraw();
              }else{
                  parent.amplify.publish('status.alerts',sys_info,submit_error);
                  console.log(response.msg);
              }
          }).fail(function (error) {
              parent.amplify.publish('status.alerts',sys_info,sys_error);
              console.log(error);
          });
      };
  };
  
  var ParamView = function (data) {
      var me = this;
      this.type = ko.observable('');
      if (typeof data != 'undefined') {
          if (typeof data.type != 'undefined') {
              me.type(data.type);
          }
      }
  };
  var epList = new paramListViewModel();
  epList.init();
  ko.applyBindings(epList);

  $(document).ready(function(){
	  epList.setUpTable();
      $('#sure_btn').click(function(){
          $('#myModal').modal('hide');
          epList.delParam(epList.delIds());
      });

      //新增事件
      $('#add').click(function(e){
          window.location.href = 'edit.html';
      });
      //删除事件
      $('#delete').click(function(e){
          var ary = [];
          $('input[name=foreach_chk_data]').each(function(){
              if($(this).prop('checked')){
                  ary.push('\''+$(this).prop('id')+'\'');
              }
          });
          if(ary.length <= 0){
              parent.amplify.publish('status.alerts',sys_info,delete_tip);
              return;
          }
          epList.delIds(ary.toString());
          $('#myModal').modal('show');
      });
  });
});

function eachCheckBox(_self){
    var _chk = $(_self).prop('checked');
    $('input[name=foreach_chk_data]').each(function(){
        $(this).prop('checked',_chk);
    });
}
