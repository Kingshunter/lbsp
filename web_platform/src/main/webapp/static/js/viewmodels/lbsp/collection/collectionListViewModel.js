/**
 * Created by Barry.
 */
requirejs(['jquery','knockout','collectionService','commonUtil','amplify','DT-bootstrap','bootstrap','bootstrap-datepicker'],
		function($,ko,collectionService,util){
  var sys_info = parent.app.getI18nMessage('common.sys.info');
  var sys_error = parent.app.getI18nMessage('common.sys.error');
  var submit_error = parent.app.getI18nMessage('common.sys.submit.fail');
  var yes = parent.app.getI18nMessage('common.sys.label.yes');
  var no = parent.app.getI18nMessage('common.sys.label.no');
  var anonymous = parent.app.getI18nMessage('common.select.anonymous');
  var atlease_tip = parent.app.getI18nMessage('common.sys.select.atleast.one');
  var shop_label = parent.app.getI18nMessage('collection.shop.type.label');
  var promotion_label = parent.app.getI18nMessage('collection.promotion.type.label');
  var CollectionListViewModel = function() {
    var ep = this;
    this.sel_text = ko.observable('-Select-');
    this.name = ko.observable('');
    this.title = ko.observable('');
    this.type = ko.observable('');
    this.typeOptions = ko.observableArray([]);
    this.start_dateStr = ko.observable('');
    this.end_dateStr = ko.observable('');
    this.params = new Array();
    this.paramAdd = 'addfeedback';
    this.paramDel = 'delfeedback';
    this.delIds = ko.observable('');
    this.paramModify = 'modifyfeedback';
    this.viewDel = ko.observable(false);
    this.viewAdd = ko.observable(false);
    this.canAdd = false;
    this.canDel = ko.observable('');
    this.canModify = false;
    this.viewModify = ko.observable(false);
    this.isUpdate = ko.observable(false);
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
          ep.viewModify(true);
      }
    };
      this.seti18nText = function(){
          $('title,label,span,div,th').each(function(){
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
        ep.datePickerInit();
    };
    //初始化Date Picker
    this.datePickerInit = function(){
        //start
        var checkin = $('.dpd1').datepicker().on('changeDate', function (ev) {
            var date = new Date(ev.date);
            var date_str =  All580.DPGlobal.formatDateTime(date, 'yyyy-MM-dd');
            ep.start_dateStr(date_str);
            if (ev.date.valueOf() > checkout.date.valueOf()) {
                date.setDate(date.getDate() + 1);
                checkout.setValue(date);
            }
            checkin.hide();
            $('.dpd2')[0].focus();
        }).data('datepicker');
        //end
        var checkout = $('.dpd2').datepicker().on('changeDate', function (ev) {
            var date = new Date(ev.date);
            var date_str =  All580.DPGlobal.formatDateTime(date, 'yyyy-MM-dd');
            ep.end_dateStr(date_str);
            checkout.hide();
        }).data('datepicker');
    };
    var SelectModel = function (text, value) {
        this.text = text;
        this.val = value;
    };
    this.loadTypeList = function(){
        ep.typeOptions.push(new SelectModel(shop_label,'S'));
        ep.typeOptions.push(new SelectModel(promotion_label,'G'));
    };

    this.datatable = ko.observable();

    this.setUpTable = function () {
      var settings = All580.dataTable;
      settings['sAjaxSource'] = All580.serverName + '/service/core/collection|lst';
      settings['fnServerParams'] = function (aoData) {
        aoData.push({ "name": "name", "value": ep.params['name']});
        aoData.push({ "name": "type", "value": ep.params['type']});
        aoData.push({ "name": "from", "value": ep.params['from']});
        aoData.push({ "name": "to", "value": ep.params['to']});
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
        { 'mData': 'customerName','sDefaultContent': ''}, //所属人
        {//收藏类型
            'sDefaultContent': '',
            'fnRender': function (obj) {
                if(typeof obj.aData.type == 'S'){
                    return '<span class="label label-info">'+shop_label+'</span>';
                }else{
                    return '<span class="label label-info">'+promotion_label+'</span>';
                }
            }
        },
        {//收藏内容
            'sDefaultContent': '',
            'fnRender': function (obj) {
                if(typeof obj.aData.type == 'S'){
                    return obj.aData.shopName;
                }else{
                    return obj.aData.title;
                }
            }
        },
		{ 	//创建时间
        	'sDefaultContent': '',
        	'fnRender': function (obj) {
        		return All580.DPGlobal.formatDateTime(obj.aData.create_time, 'yyyy-MM-dd HH:mm:ss');
        	}
		}
      ];
      var dataTable = $('#dynamic-table').dataTable(settings);
        ep.datatable(dataTable);
      $('#search').click(function() {
          ep.params['name']=ep.name();
          ep.params['type']=ep.type();
          ep.params['from']=ep.start_dateStr();
          ep.params['to']=ep.end_dateStr();
          dataTable.fnDraw();
      });

    };
    this.delParam = function (obj) {
        var deferred = collectionService.deleteCollection(obj);
        $.when(deferred).done(function (response) {
            if(response.state.code==200000) {
                console.log('删除成功');
                ep.params['name']=ep.name();
                ep.params['type']=ep.type();
                ep.params['from']=ep.start_dateStr();
                ep.params['to']=ep.end_dateStr();
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
  var epList = new CollectionListViewModel();
  epList.init();
  ko.applyBindings(epList);

  window.operateEvent = function(id,self){
      return epList.loadRef(self,id);
  }

  $(document).ready(function(){
	  epList.setUpTable();
      $('#sure_btn').click(function(){
          $('#myModal').modal('toggle');
          epList.delParam(epList.delIds());
      });

      //删除事件
      $('#delete').click(function(e){
          var ary = [];
          $('input[name=foreach_chk_data]').each(function(){
              if($(this).prop('checked')){
                  ary.push($(this).prop('id'));
              }
          });
          if(ary.length <= 0){
              parent.amplify.publish('status.alerts',sys_info,atlease_tip);
              return;
          }
          epList.delIds(ary.toString());
          $('#myModal').modal('toggle');
      });
  });
});

function eachCheckBox(_self){
    var _chk = $(_self).prop('checked');
    $('input[name=foreach_chk_data]').each(function(){
        $(this).prop('checked',_chk);
    });
}

function eventHandle(id,self){
    window.operateEvent(id,self);
}
