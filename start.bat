@echo off
chcp 65001 >nul
title 图片压缩工具

echo ==========================================
echo    图片压缩工具 - 快速启动脚本
echo ==========================================
echo.

REM 检查 Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 未找到 Python，请先安装 Python 3.7+
    pause
    exit /b 1
)

echo ✅ Python 已安装
echo.

REM 检查虚拟环境
if not exist "venv" (
    echo 📦 创建虚拟环境...
    python -m venv venv
    echo ✅ 虚拟环境创建成功
    echo.
)

REM 激活虚拟环境
echo 🔧 激活虚拟环境...
call venv\Scripts\activate.bat

REM 安装依赖
echo 📥 安装依赖...
pip install -q -r requirements.txt
echo ✅ 依赖安装完成
echo.

REM 创建 uploads 目录
if not exist "uploads" mkdir uploads
echo ✅ 创建 uploads 目录
echo.

echo ==========================================
echo 🚀 启动图片压缩服务...
echo ==========================================
echo 访问地址: http://localhost:5000
echo 按 Ctrl+C 停止服务
echo.

python app.py
pause
