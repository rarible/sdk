cd ..
cp mattel.env .env
mkcert test-virtual.mattel.com
echo "0.0.0.0 test-virtual.mattel.com" >> /etc/hosts
