//rule scheme :

module.exports = {
    /*
    These functions will overwrite the default ones, write your own when necessary.
    Comments in Chinese are nothing but a translation of key points. Be relax if you dont understand.
    致中文用户：中文注释都是只摘要，必要时请参阅英文文档。欢迎提出修改建议。
    */
    summary:function(){
        return "this is a replaceServerResDataAsync rule for AnyProxy";
    },

    replaceServerResDataAsync: function(req,res,serverResData,callback){
        //append "hello world" to all web pages

        //for those non-unicode response , serverResData.toString() should not be your first choice.
        //this issue may help you understanding how to modify an non-unicode response: https://github.com/alibaba/anyproxy/issues/20
        // if(/html/i.test(res.headers['content-type'])){
        //     var newDataStr = serverResData.toString();
        //     newDataStr += "hello world!";
        //     callback(newDataStr);
        // }else{
        //     callback(serverResData);
        // }

        
        //update by zhoudongbin
        //
        console.log("Start replaceServerResDataAsync");
        if (res.headers['content-type']) {
            var mime_type = res.headers['content-type'].split(";")[0];
            // 替换json数据
            if ( mime_type == "application/json") {
                console.log("MIME is json, modify mode...");

                var jp = require('jsonpath');
                var URL = require('url');
                var resBody = JSON.parse(serverResData.toString());
                var fullurl = req.headers.host + URL.parse(req.url).pathname;
                fullurl = fullurl.replace(/\/$/,"");

                // 默认取前99个满足jsonpath条件的数据
                // var count = 99;

                // 局部修改的json数据
                var local_mock = {
                    "mobile.mmbang.com/api18": {
                        "$..user_name": "我是修改过的用户名字",
                        "$..baby_name": "我是修改过的宝宝名字",
                        "$..lollipop.target_url": "com.iyaya.mmbang://app/v1/webview/advanced?url=https://www.baidu.com",
                        "$.message": "我是/api18这个接口修改的message"
                    },
                    "log.mmbang.com/catch": {
                        "$.message": "我是/catch接口修改过的message"
                    }
                };

                // 全局修改的list
                var global_mock = {
                    "$.message": "我是全局修改过的message",
                    // '$.success': '我是修改过的success'
                };

                // 根据传入的jsonpath表达式替换resBody的值
                function replaceData(jsonpath) {
                    for (var key in jsonpath){
                        var pathExpressionList = jp.paths(resBody, key)
                        for (var i = 0; i < pathExpressionList.length; i++) {
                            var pathExpression = jp.stringify(pathExpressionList[i])
                            jp.value(resBody, pathExpression, jsonpath[key]);
                        };
                    };
                };

                // 循环替换global_mock中的值  PS:会替换掉局部修改的json数据
                if (global_mock) {
                    replaceData(global_mock);
                };

                // 循环替换local_mock中的值
                if (local_mock) {
                    for (var path in local_mock){
                        path_temp = path.replace(/\/$/,"");
                        if (fullurl == path_temp) {
                            console.log("will replace:" + path);
                            replaceData(local_mock[path]);
                            break;
                            // console.log(resBody);
                        } else {
                            console.log("will not replace:" + path + " && fullurl:" + fullurl);
                        };
                    };
                }
                callback(JSON.stringify(resBody));
            } else if( mime_type == "application/html"){
                console.log("MIME is html, SKIP");
                callback(serverResData);
            } else {
                console.log("MIME is sth else, SKIP");
                callback(serverResData);
            }
        } else {
            // console.log(resBody);
            // callback(JSON.stringify(resBody));
            console.log("MIME is not defined, SKIP");
            callback(serverResData);            
        }

    }
};
