/**
 * Created by Barry on 6/12/2014.
 */
define(['jquery'],function($){
  return {
    service:All580.serverName+'/service/',
    deleteFeedback:function(ids){
      var url = this.service+'core/feedback|del?ids='+ids;
      return $.ajax({
          url: url,
          type: "DELETE",
          contentType : 'application/json'
      });
    },
    getDetailById : function(id){
        var url = this.service + 'core/feedback|'+id;
        return $.getJSON(url);
    }
  };
});