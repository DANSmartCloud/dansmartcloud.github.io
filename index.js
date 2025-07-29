var http = require('http');
http.createServer(function (request, response) {
    // 发送 HTTP 头部
    // HTTP 状态值: 200 : OK
    // 内容类型: text/plain。并用charset=UTF-8解决输出中文乱码
    response.writeHead(200, {'Content-Type': 'text/plain; charset=UTF-8'});
 
    // 下句是发送响应数据
    response.end('已成功启动本地服务器。\n');
}).listen(1111);
// 终端打印如下信息
console.log('Server running at http://127.0.0.1:1111/');