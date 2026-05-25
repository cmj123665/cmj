@echo off
chcp 65001 >nul
title 游戏大厅启动器

echo.
echo ╔══════════════════════════════════════════════════════╗
echo ║                                                    ║
echo ║       🎮 游戏大厅 - 一键启动器 🎮                   ║
echo ║                                                    ║
echo ╚══════════════════════════════════════════════════════╝
echo.
echo [1/3] 正在启动后端服务器...
echo.

start "游戏大厅后端服务器" cmd /k "node server-dev.js"

echo.
echo [2/3] 等待后端服务器启动...
timeout /t 3 /nobreak >nul

echo.
echo [3/3] 正在打开游戏页面...
echo.

start "" "%~dp0index.html"

echo.
echo ╔══════════════════════════════════════════════════════╗
echo ║                                                    ║
echo ║       ✅ 游戏大厅已启动完成！                       ║
echo ║                                                    ║
echo ║   后端服务器: http://localhost:3000                ║
echo ║   游戏页面: 已在浏览器中打开                       ║
echo ║                                                    ║
echo ║   ⚠️  请勿关闭后端服务器窗口！                      ║
echo ║   ⚠️  关闭游戏时请先关闭后端服务器窗口             ║
echo ║                                                    ║
echo ╚══════════════════════════════════════════════════════╝
echo.
echo 按任意键关闭此窗口...
pause >nul
