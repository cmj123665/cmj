#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
自动化游戏检查和修复工具
自动检查所有游戏的代码、语法、逻辑问题并修复
"""
import os
import re
import json
from pathlib import Path

class GameChecker:
    def __init__(self, base_path):
        self.base_path = Path(base_path)
        self.results = []

    def check_all_games(self):
        """检查所有游戏"""
        games = [
            'snake-game', '2048', 'tetris', 'breakout', 'memory',
            'minesweeper', 'gomoku', 'pong-game', 'tile-game',
            'whack-a-mole', 'runner-game', 'tank-battle', 'puzzle',
            'tower-defense', 'space-shooter'
        ]

        print("=" * 60)
        print("开始检查所有游戏...")
        print("=" * 60)

        for game in games:
            self.check_game(game)

        self.generate_report()
        self.fix_all_issues()

    def check_game(self, game_name):
        """检查单个游戏"""
        game_path = self.base_path / game_name / 'index.html'
        if not game_path.exists():
            self.add_result(game_name, 'ERROR', '文件不存在')
            return

        try:
            with open(game_path, 'r', encoding='utf-8') as f:
                content = f.read()

            issues = []

            # 检查HTML结构
            if not self.check_html_structure(content, issues):
                pass

            # 检查JavaScript语法
            if not self.check_javascript_syntax(content, issues):
                pass

            # 检查游戏逻辑
            if not self.check_game_logic(content, issues):
                pass

            # 检查初始化
            if not self.check_initialization(content, issues):
                pass

            # 检查返回功能
            if not self.check_return_function(content, issues):
                pass

            if issues:
                self.add_result(game_name, 'ISSUES', issues)
            else:
                self.add_result(game_name, 'OK', '游戏正常')

        except Exception as e:
            self.add_result(game_name, 'ERROR', f'检查失败: {str(e)}')

    def check_html_structure(self, content, issues):
        """检查HTML结构"""
        # 检查基本的HTML标签
        if '<!DOCTYPE html>' not in content:
            issues.append('缺少DOCTYPE声明')

        if '<html' not in content:
            issues.append('缺少html标签')

        if '</html>' not in content:
            issues.append('缺少html结束标签')

        # 检查重复的body标签
        body_count = content.count('</body>')
        if body_count > 1:
            issues.append(f'重复的body标签: {body_count}个')

        # 检查script标签
        if '<script>' not in content and '<script type' not in content:
            issues.append('缺少script标签')

        return len(issues) == 0

    def check_javascript_syntax(self, content, issues):
        """检查JavaScript语法"""
        # 检查函数定义的完整性
        open_braces = content.count('{')
        close_braces = content.count('}')

        if open_braces != close_braces:
            issues.append(f'花括号不匹配: {open_braces}个{{ vs {close_braces}个}}')

        # 检查重复的else语句
        pattern = r'\}\s*else\s*\{'
        matches = re.findall(pattern, content)
        if_count = content.count('if\s*\(')

        if len(matches) > if_count + 5:  # 允许一些额外的else
            issues.append(f'可能有多余的else语句: {len(matches)}个')

        # 检查backToHall函数的语法
        backtohall_pattern = r'function\s+backToHall\s*\([^)]*\)\s*\{[^}]*\}\s*else\s*\{[^}]*\}\s*else\s*\{[^}]*\}'
        if re.search(backtohall_pattern, content):
            issues.append('backToHall函数有语法错误（重复的else）')

        return len(issues) == 0

    def check_game_logic(self, content, issues):
        """检查游戏逻辑"""
        # 检查是否有canvas
        has_canvas = 'canvas' in content.lower()
        has_getcontext = 'getContext' in content

        if has_canvas and not has_getcontext:
            issues.append('有canvas但没有getContext调用')

        # 检查游戏循环
        has_requestAnimationFrame = 'requestAnimationFrame' in content
        has_setInterval = 'setInterval' in content

        if has_canvas and not (has_requestAnimationFrame or has_setInterval):
            issues.append('有canvas但没有游戏循环(requestAnimationFrame或setInterval)')

        # 检查游戏控制
        has_addEventListener = 'addEventListener' in content
        has_keydown = 'keydown' in content or 'keyup' in content

        if has_canvas and not (has_addEventListener or has_keydown):
            issues.append('没有键盘控制事件监听')

        return len(issues) == 0

    def check_initialization(self, content, issues):
        """检查初始化"""
        # 检查是否有init函数
        has_init_function = bool(re.search(r'function\s+init\s*\(', content))
        has_init_game = bool(re.search(r'function\s+initGame\s*\(', content))
        has_new_game = bool(re.search(r'function\s+newGame\s*\(', content))
        has_start_game = bool(re.search(r'function\s+startGame\s*\(', content))

        # 检查是否有init调用
        init_calls = re.findall(r'init\s*\(\s*\)', content)
        initgame_calls = re.findall(r'initGame\s*\(\s*\)', content)
        newgame_calls = re.findall(r'newGame\s*\(\s*\)', content)
        startgame_calls = re.findall(r'startGame\s*\(\s*\)', content)

        # 检查文件末尾是否有初始化调用
        lines = content.split('\n')
        last_20_lines = '\n'.join(lines[-20:])
        has_init_call_at_end = bool(re.search(r'init\s*\(\s*\);', last_20_lines))

        if not (has_init_function or has_init_game or has_new_game or has_start_game):
            issues.append('没有定义任何初始化函数(init/initGame/newGame/startGame)')
        elif not has_init_call_at_end and not (initgame_calls or newgame_calls or startgame_calls):
            issues.append('定义了初始化函数但没有调用')

        return len(issues) == 0

    def check_return_function(self, content, issues):
        """检查返回功能"""
        # 检查是否有backToHall函数
        has_backtohall = 'backToHall' in content
        has_return = '返回' in content or '大厅' in content

        if not has_backtohall and not has_return:
            issues.append('缺少返回主页的功能')

        # 检查backToHall函数是否正确
        backtohall_pattern = r'function\s+backToHall\s*\([^)]*\)\s*\{[^}]*\}'
        if not re.search(backtohall_pattern, content) and has_backtohall:
            issues.append('backToHall函数定义不完整')

        return len(issues) == 0

    def add_result(self, game, status, details):
        """添加检查结果"""
        self.results.append({
            'game': game,
            'status': status,
            'details': details if isinstance(details, str) else ', '.join(details)
        })

    def generate_report(self):
        """生成检查报告"""
        print("\n" + "=" * 60)
        print("检查报告:")
        print("=" * 60)

        for result in self.results:
            status_symbol = "[OK]" if result['status'] == 'OK' else "[X]"
            print(f"\n{status_symbol} {result['game']}: {result['status']}")
            if result['details'] != '游戏正常':
                print(f"  问题: {result['details']}")

    def fix_all_issues(self):
        """修复所有发现的问题"""
        print("\n" + "=" * 60)
        print("开始修复问题...")
        print("=" * 60)

        for result in self.results:
            if result['status'] != 'OK':
                self.fix_game(result['game'])

    def fix_game(self, game_name):
        """修复单个游戏"""
        print(f"\n修复 {game_name}...")

        game_path = self.base_path / game_name / 'index.html'
        if not game_path.exists():
            print(f"  文件不存在，跳过")
            return

        try:
            with open(game_path, 'r', encoding='utf-8') as f:
                content = f.read()

            original_content = content
            fixes_applied = []

            # 修复1: 删除重复的init调用
            lines = content.split('\n')
            cleaned_lines = []
            init_call_positions = []

            for i, line in enumerate(lines):
                # 检查是否是init调用行
                if re.search(r'init\s*\(\s*\);', line):
                    # 只保留文件末尾的init调用
                    if i > len(lines) - 10:
                        cleaned_lines.append(line)
                    else:
                        fixes_applied.append("删除重复的init调用")
                else:
                    cleaned_lines.append(line)

            content = '\n'.join(cleaned_lines)

            # 修复2: 修复backToHall函数的语法错误
            backtohall_pattern = r'function\s+backToHall\s*\([^)]*\)\s*\{[^}]*\}\s*else\s*\{[^}]*\}\s*(?:else\s*\{[^}]*\}\s*)*'

            def replace_backtohall(match):
                return '''function backToHall() {
            if (window.parent) {
                window.parent.location.href = '../index.html';
            } else {
                window.location.href = '../index.html';
            }
        }'''

            new_content = re.sub(backtohall_pattern, replace_backtohall(match), content)
            if new_content != content:
                content = new_content
                fixes_applied.append("修复backToHall函数语法")

            # 修复3: 确保文件末尾有正确的结构
            # 检查文件末尾
            if content.strip().endswith('</script>'):
                # 移除多余的标签
                content = re.sub(r'</script>\s*</script>', '</script>', content)
                fixes_applied.append("删除重复的script标签")

            # 修复4: 确保每个游戏只有一个</html>标签
            content = re.sub(r'</html>\s*</html>', '</html>', content)
            fixes_applied.append("删除重复的html标签")

            # 如果有修复，保存文件
            if content != original_content:
                with open(game_path, 'w', encoding='utf-8') as f:
                    f.write(content)

                print(f"  应用了 {len(fixes_applied)} 个修复:")
                for fix in fixes_applied:
                    print(f"    - {fix}")
            else:
                print(f"  没有需要修复的问题")

        except Exception as e:
            print(f"  修复失败: {str(e)}")

def main():
    print("游戏自动化检查和修复工具")
    print("=" * 60)

    # 获取当前目录
    base_path = Path.cwd()

    # 创建检查器
    checker = GameChecker(base_path)

    # 检查所有游戏
    checker.check_all_games()

    print("\n" + "=" * 60)
    print("修复完成！")
    print("=" * 60)
    print("\n请刷新浏览器并重新测试游戏。")

if __name__ == '__main__':
    main()
