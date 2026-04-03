#!/bin/bash

# 图片压缩工具快速启动脚本

echo "=========================================="
echo "   图片压缩工具 - 快速启动脚本"
echo "=========================================="
echo ""

# 检查 Python
if ! command -v python3 &> /dev/null; then
    echo "❌ 未找到 Python，请先安装 Python 3.7+"
    exit 1
fi

echo "✅ Python 版本: $(python3 --version)"

# 检查虚拟环境
if [ ! -d "venv" ]; then
    echo "📦 创建虚拟环境..."
    python3 -m venv venv
    echo "✅ 虚拟环境创建成功"
fi

# 激活虚拟环境
echo "🔧 激活虚拟环境..."
source venv/bin/activate

# 安装依赖
echo "📥 安装依赖..."
pip install -q -r requirements.txt
echo "✅ 依赖安装完成"

# 创建 uploads 目录
mkdir -p uploads
echo "✅ 创建 uploads 目录"

# 启动服务
echo ""
echo "=========================================="
echo "🚀 启动图片压缩服务..."
echo "=========================================="
echo "访问地址: http://localhost:5000"
echo "按 Ctrl+C 停止服务"
echo ""

python app.py
