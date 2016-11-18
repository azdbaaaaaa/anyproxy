/*
read the following wiki before using rule file
https://github.com/alibaba/anyproxy/wiki/What-is-rule-file-and-how-to-write-one
*/
module.exports = {
	/*
	These functions will overwrite the default ones, write your own when necessary.
    Comments in Chinese are nothing but a translation of key points. Be relax if you dont understand.
    致中文用户：中文注释都是只摘要，必要时请参阅英文文档。欢迎提出修改建议。
	*/
    summary:function(){
        return "this is a blank rule for AnyProxy";
    },




    //=======================
    //when getting a request from user
    //收到用户请求之后
    //=======================

    //是否截获https请求
    //should intercept https request, or it will be forwarded to real server
    shouldInterceptHttpsReq :function(req){
        return true;
    },

    //是否在本地直接发送响应（不再向服务器发出请求）
	//whether to intercept this request by local logic 
	//if the return value is true, anyproxy will call dealLocalResponse to get response data and will not send request to remote server anymore
    //req is the user's request sent to the proxy server
	shouldUseLocalResponse : function(req,reqBody){
        return false;
	},

    //如果shouldUseLocalResponse返回true，会调用这个函数来获取本地响应内容
    //you may deal the response locally instead of sending it to server
    //this function be called when shouldUseLocalResponse returns true 
    //callback(statusCode,resHeader,responseData)
    //e.g. callback(200,{"content-type":"text/html"},"hello world")
	dealLocalResponse : function(req,reqBody,callback){
        callback(statusCode,resHeader,responseData)
	},



    //=======================
    //when ready to send a request to server
    //向服务端发出请求之前
    //=======================

    //替换向服务器发出的请求协议（http和https的替换）
    //replace the request protocol when sending to the real server
    //protocol : "http" or "https"
    replaceRequestProtocol:function(req,protocol){
    	var newProtocol = protocol;
    	return newProtocol;
    },

    //替换向服务器发出的请求参数（option)
    //option is the configuration of the http request sent to remote server. You may refers to http://nodejs.org/api/http.html#http_http_request_options_callback
    //you may return a customized option to replace the original one
    //you should not overwrite content-length header in options, since anyproxy will handle it for you
    replaceRequestOption : function(req,option){
        var newOption = option;
        return newOption;
    },

    //替换请求的body
    //replace the request body
    replaceRequestData: function(req,data){
        return data;
    },



    //=======================
    //when ready to send the response to user after receiving response from server
    //向用户返回服务端的响应之前
    //=======================

    //替换服务器响应的http状态码
    //replace the statusCode before it's sent to the user
    replaceResponseStatusCode: function(req,res,statusCode){
        // console.log(req.headers.host);
        // if (req.headers.host == "mobile.mmbang.net") {
        //     var newStatusCode = "000";
        // } else {
        //     var newStatusCode = statusCode;
        // }
        var newStatusCode = statusCode;
    	return newStatusCode;
    },

    //替换服务器响应的http头
    //replace the httpHeader before it's sent to the user
    //Here header == res.headers
    replaceResponseHeader: function(req,res,header){
    	var newHeader = header;
    	return newHeader;
    },

    //替换服务器响应的数据
    //replace the response from the server before it's sent to the user
    //you may return either a Buffer or a string
    //serverResData is a Buffer. for those non-unicode reponse , serverResData.toString() should not be your first choice.
    replaceServerResDataAsync: function(req,res,serverResData,callback){
        // console.log(req.url);
        // console.log(serverResData.toString());
        // callback(serverResData);
        // 判断是否
        if ('content-type' in res.headers) {
            if (res.headers['content-type'].split(";")[0] == "application/json") {   
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
                        '$..user_name': '我是修改过的用户名字',
                        '$..baby_name': '我是修改过的宝宝名字',
                        '$..lollipop.target_url': 'com.iyaya.mmbang://app/v1/webview/advanced?url=https://www.baidu.com',
                        '$.message': '我是/api18这个接口修改的message',
                        // '$..flowers': null,
                    },
                    "log.mmbang.com/catch": {
                        '$.message': '我是/catch接口修改过的message'
                    },

                };

                // 全局修改的list
                var global_mock = {
                    '$.message': '我是全局修改过的message',
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
                replaceData(global_mock);

                // 循环替换local_mock中的值
                for (var path in local_mock){
                    path_temp = path.replace(/\/$/,"");
                    if (fullurl == path_temp) {
                        console.log("==> will replace:" + path);
                        replaceData(local_mock[path]);
                        // console.log(resBody);
                    } else {
                        console.log("==> will not replace:" + path);
                        console.log("==> fullurl:" + fullurl);
                    };
                };
                callback(JSON.stringify(resBody));
            };
        } else {
            // console.log(resBody);
            // callback(JSON.stringify(resBody));
            callback(serverResData);            
        };
    },

    //Deprecated    
    // replaceServerResData: function(req,res,serverResData){
    //     return serverResData;
    // },

    //在请求返回给用户前的延迟时间
    //add a pause before sending response to user
    pauseBeforeSendingResponse : function(req,res){
    	var timeInMS = 1; //delay all requests for 1ms
    	return timeInMS; 
    }

};