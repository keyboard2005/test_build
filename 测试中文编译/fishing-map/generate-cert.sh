#!/bin/bash

# 生成本地开发用的 SSL 证书
echo "正在生成本地 SSL 证书..."

# 生成私钥
openssl genrsa -out localhost-key.pem 2048

# 生成证书签名请求配置
cat > localhost.conf << EOF
[req]
distinguished_name = req_distinguished_name
req_extensions = v3_req
prompt = no

[req_distinguished_name]
C = CN
ST = Beijing
L = Beijing
O = Local Development
CN = localhost

[v3_req]
keyUsage = keyEncipherment, dataEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
DNS.2 = *.localhost
IP.1 = 127.0.0.1
IP.2 = 0.0.0.0
IP.3 = 192.168.6.127
EOF

# 生成证书
openssl req -new -x509 -key localhost-key.pem -out localhost.pem -days 365 -config localhost.conf -extensions v3_req

echo "SSL 证书生成完成！"
echo "文件: localhost-key.pem, localhost.pem"
echo ""
echo "请在手机浏览器中访问 https://192.168.6.127:3000"
echo "首次访问时选择'继续访问'或'高级 -> 继续访问'"

# 清理临时文件
rm localhost.conf
