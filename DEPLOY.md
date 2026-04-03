# 图片压缩工具部署指南

## 📦 部署方式总览

本项目支持多种部署方式，根据您的需求选择合适的方案：

| 部署方式 | 适用场景 | 难度 | 推荐度 |
|---------|---------|------|--------|
| Docker | 开发/测试 | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| Gunicorn | 生产服务器 | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| 云服务 | 快速上线 | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| 静态托管 | 纯前端部署 | ⭐ | ⭐⭐⭐ |

---

## 🚀 方式一：Docker 部署（最简单）

### 本地 Docker 运行
```bash
# 构建镜像
docker build -t image-compressor .

# 运行容器
docker run -d -p 5000:5000 --name compressor image-compressor
```

### Docker Compose 运行
```bash
# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

### 访问应用
- http://localhost:5000

---

## 🖥️ 方式二：生产服务器部署（Gunicorn + Nginx）

### 1. 安装依赖
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install python3 python3-pip nginx

# CentOS/RHEL
sudo yum install python3 python3-pip nginx
```

### 2. 安装 Python 依赖
```bash
cd /path/to/image-compressor
python3 -m venv venv
source venv/bin/activate
pip install -r requirements_prod.txt
```

### 3. 启动 Gunicorn
```bash
# 基本启动
gunicorn --workers 3 --bind 0.0.0.0:5000 app:app

# 或者使用 socket 文件
gunicorn --workers 3 --bind unix:image-compressor.sock -m 007 app:app
```

### 4. 配置 Nginx
```bash
# 复制 nginx 配置
sudo cp nginx.conf /etc/nginx/sites-available/image-compressor

# 创建软链接
sudo ln -s /etc/nginx/sites-available/image-compressor /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

### 5. 设置开机自启（systemd）
```bash
# 复制服务文件
sudo cp image-compressor.service /etc/systemd/system/

# 修改路径（修改 /path/to 为实际路径）
sudo nano /etc/systemd/system/image-compressor.service

# 启动服务
sudo systemctl daemon-reload
sudo systemctl start image-compressor
sudo systemctl enable image-compressor
```

---

## ☁️ 方式三：云服务部署

### Render.com（免费额度）
1. 访问 https://render.com
2. 创建 Web Service
3. 连接 GitHub 仓库
4. 设置构建命令：`pip install -r requirements.txt`
5. 设置启动命令：`gunicorn app:app`
6. 环境变量：无需设置
7. 点击 Deploy

### Railway.app
```bash
# 安装 Railway CLI
npm install -g @railway/cli

# 登录
railway login

# 初始化项目
railway init

# 部署
railway up
```

### Vercel（仅静态前端）
由于图片压缩主要在前端完成，可以部署纯静态版本：

```bash
# 创建 Vercel 项目
vercel init

# 添加 vercel.json 配置
{
  "version": 2,
  "builds": [
    {
      "src": "templates/index.html",
      "use": "@vercel/static"
    }
  ]
}

# 部署
vercel deploy
```

### 阿里云/腾讯云服务器
```bash
# 1. 购买云服务器（最低配置即可）
# 2. 安全组开放 80 和 443 端口
# 3. 使用 SSH 连接服务器
# 4. 按照方式二的步骤部署
# 5. 配置域名和 SSL 证书（可选）
```

---

## 🎯 方式四：纯前端部署（无需后端）

**注意**：如果不需要文件上传到服务器，可以直接部署静态文件。

### 修改后端代码
将图片压缩逻辑完全放在前端，移除所有服务器上传功能。

### 部署到 GitHub Pages
```bash
# 1. 将项目推送到 GitHub
# 2. 在仓库设置中启用 GitHub Pages
# 3. 选择 main 分支
# 4. 访问 https://username.github.io/repo-name
```

### 部署到 Netlify
```bash
# 1. 登录 Netlify 并连接 GitHub
# 2. 选择部署文件夹
# 3. 自动部署完成
```

---

## 🔒 HTTPS 配置（推荐）

### 使用 Let's Encrypt
```bash
# 安装 certbot
sudo apt install certbot python3-certbot-nginx

# 获取 SSL 证书
sudo certbot --nginx -d yourdomain.com

# 自动续期
sudo certbot renew --dry-run
```

### Nginx 配置示例
```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # SSL 配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://127.0.0.1:5000;
        # ... 其他配置
    }
}

# HTTP 跳转 HTTPS
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

---

## 📊 性能优化建议

### 1. 静态文件优化
- 开启 Gzip 压缩
- 设置合理的缓存时间
- 使用 CDN 加速

### 2. 服务器优化
```bash
# 增加 Gunicorn worker 数量
gunicorn --workers 4 --threads 2 app:app

# 使用 gevent 提升并发
gunicorn --worker-class gevent --workers 4 app:app
```

### 3. 数据库（如果需要）
- 添加 Redis 缓存
- 使用 SQLite/PostgreSQL 存储用户数据

---

## 🛠️ 故障排查

### 常见问题

1. **端口被占用**
   ```bash
   # 查找占用端口的进程
   lsof -i:5000
   # 杀死进程
   kill -9 <PID>
   ```

2. **权限错误**
   ```bash
   # 修改 uploads 目录权限
   chmod 755 uploads
   chown www-data:www-data uploads
   ```

3. **内存不足**
   ```bash
   # 减少 worker 数量
   gunicorn --workers 2 app:app
   ```

### 日志查看
```bash
# Gunicorn 日志
tail -f /var/log/image-compressor.log

# Nginx 日志
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

---

## 📱 域名配置

1. 购买域名（阿里云、腾讯云、Namecheap 等）
2. DNS 配置 A 记录指向服务器 IP
3. 等待 DNS 生效（通常 10-30 分钟）
4. 配置 SSL 证书
5. 测试访问

---

## 🎉 部署完成后

1. 访问您的域名或 IP 地址
2. 测试图片上传和压缩功能
3. 检查移动端适配
4. 设置监控和告警（可选）
5. 定期备份（如果有数据）

---

## 💰 成本估算

| 部署方式 | 月成本 | 说明 |
|---------|-------|------|
| 服务器自建 | ¥30-100 | 1核2G 云服务器 |
| Docker | ¥30-100 | 与服务器相同 |
| Render.com | $0-7 | 免费额度 750小时 |
| Railway.app | $0-5 | 免费额度 $5/月 |
| 静态托管 | $0 | Netlify/Vercel 免费计划 |

---

## 📞 技术支持

如有问题，请查看：
- 项目 GitHub Issues
- 官方文档
- Stack Overflow
