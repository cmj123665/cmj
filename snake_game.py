import pygame
import random
import sys

# 初始化 Pygame
pygame.init()

# 游戏常量
SCREEN_WIDTH = 600
SCREEN_HEIGHT = 600
GRID_SIZE = 20
GRID_WIDTH = SCREEN_WIDTH // GRID_SIZE
GRID_HEIGHT = SCREEN_HEIGHT // GRID_SIZE

# 颜色定义
BLACK = (0, 0, 0)
WHITE = (255, 255, 255)
GREEN = (0, 200, 0)
DARK_GREEN = (0, 150, 0)
RED = (200, 0, 0)
BLUE = (0, 100, 200)
GRAY = (100, 100, 100)

# 方向
UP = (0, -1)
DOWN = (0, 1)
LEFT = (-1, 0)
RIGHT = (1, 0)


class Snake:
    def __init__(self):
        self.reset()

    def reset(self):
        """重置蛇的状态"""
        self.body = [(GRID_WIDTH // 2, GRID_HEIGHT // 2)]
        self.direction = RIGHT
        self.grow = False

    def move(self):
        """移动蛇"""
        head_x, head_y = self.body[0]
        dir_x, dir_y = self.direction
        new_head = (head_x + dir_x, head_y + dir_y)

        self.body.insert(0, new_head)

        if not self.grow:
            self.body.pop()
        else:
            self.grow = False

    def set_direction(self, new_direction):
        """设置新的移动方向（不能反向）"""
        # 防止蛇反向移动
        if (new_direction[0] * -1, new_direction[1] * -1) != self.direction:
            self.direction = new_direction

    def check_collision(self):
        """检查碰撞"""
        head = self.body[0]

        # 检查是否撞墙
        if head[0] < 0 or head[0] >= GRID_WIDTH or head[1] < 0 or head[1] >= GRID_HEIGHT:
            return True

        # 检查是否撞到自己
        if head in self.body[1:]:
            return True

        return False

    def eat(self):
        """蛇吃食物"""
        self.grow = True

    def draw(self, screen):
        """绘制蛇"""
        for i, segment in enumerate(self.body):
            x = segment[0] * GRID_SIZE
            y = segment[1] * GRID_SIZE

            # 蛇头用深绿色，身体用绿色
            color = DARK_GREEN if i == 0 else GREEN

            # 绘制蛇身
            pygame.draw.rect(screen, color, (x, y, GRID_SIZE, GRID_SIZE))
            # 绘制边框
            pygame.draw.rect(screen, BLACK, (x, y, GRID_SIZE, GRID_SIZE), 1)


class Food:
    def __init__(self):
        self.position = (0, 0)
        self.respawn()

    def respawn(self):
        """随机生成食物位置"""
        self.position = (
            random.randint(0, GRID_WIDTH - 1),
            random.randint(0, GRID_HEIGHT - 1)
        )

    def draw(self, screen):
        """绘制食物"""
        x = self.position[0] * GRID_SIZE
        y = self.position[1] * GRID_SIZE
        pygame.draw.circle(screen, RED, (x + GRID_SIZE // 2, y + GRID_SIZE // 2), GRID_SIZE // 2 - 2)


class Game:
    def __init__(self):
        self.screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
        pygame.display.set_caption("贪吃蛇游戏")
        self.clock = pygame.time.Clock()
        self.font = pygame.font.Font(None, 36)
        self.small_font = pygame.font.Font(None, 24)

        self.snake = Snake()
        self.food = Food()
        self.score = 0
        self.high_score = 0
        self.game_over = False
        self.running = True

    def reset_game(self):
        """重置游戏"""
        self.snake.reset()
        self.food.respawn()
        self.score = 0
        self.game_over = False

    def handle_events(self):
        """处理事件"""
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                self.running = False

            elif event.type == pygame.KEYDOWN:
                if self.game_over:
                    if event.key == pygame.K_SPACE:
                        self.reset_game()
                    elif event.key == pygame.K_ESCAPE:
                        self.running = False
                else:
                    if event.key == pygame.K_UP or event.key == pygame.K_w:
                        self.snake.set_direction(UP)
                    elif event.key == pygame.K_DOWN or event.key == pygame.K_s:
                        self.snake.set_direction(DOWN)
                    elif event.key == pygame.K_LEFT or event.key == pygame.K_a:
                        self.snake.set_direction(LEFT)
                    elif event.key == pygame.K_RIGHT or event.key == pygame.K_d:
                        self.snake.set_direction(RIGHT)
                    elif event.key == pygame.K_ESCAPE:
                        self.running = False

    def update(self):
        """更新游戏状态"""
        if self.game_over:
            return

        self.snake.move()

        # 检查碰撞
        if self.snake.check_collision():
            self.game_over = True
            if self.score > self.high_score:
                self.high_score = self.score
            return

        # 检查是否吃到食物
        if self.snake.body[0] == self.food.position:
            self.snake.eat()
            self.score += 1
            # 确保食物不会生成在蛇身上
            while self.food.position in self.snake.body:
                self.food.respawn()

    def draw(self):
        """绘制游戏画面"""
        self.screen.fill(BLACK)

        # 绘制网格线（可选，增加视觉效果）
        for x in range(0, SCREEN_WIDTH, GRID_SIZE):
            pygame.draw.line(self.screen, (20, 20, 20), (x, 0), (x, SCREEN_HEIGHT))
        for y in range(0, SCREEN_HEIGHT, GRID_SIZE):
            pygame.draw.line(self.screen, (20, 20, 20), (0, y), (SCREEN_WIDTH, y))

        # 绘制蛇和食物
        self.food.draw(self.screen)
        self.snake.draw(self.screen)

        # 绘制分数
        score_text = self.font.render(f"分数: {self.score}", True, WHITE)
        high_score_text = self.small_font.render(f"最高分: {self.high_score}", True, GRAY)
        self.screen.blit(score_text, (10, 10))
        self.screen.blit(high_score_text, (10, 50))

        # 游戏结束画面
        if self.game_over:
            overlay = pygame.Surface((SCREEN_WIDTH, SCREEN_HEIGHT))
            overlay.set_alpha(150)
            overlay.fill(BLACK)
            self.screen.blit(overlay, (0, 0))

            game_over_text = self.font.render("游戏结束!", True, RED)
            restart_text = self.small_font.render("按空格键重新开始，ESC退出", True, WHITE)

            text_rect = game_over_text.get_rect(center=(SCREEN_WIDTH // 2, SCREEN_HEIGHT // 2 - 20))
            restart_rect = restart_text.get_rect(center=(SCREEN_WIDTH // 2, SCREEN_HEIGHT // 2 + 20))

            self.screen.blit(game_over_text, text_rect)
            self.screen.blit(restart_text, restart_rect)

        pygame.display.flip()

    def run(self):
        """主游戏循环"""
        FPS = 10  # 游戏速度

        while self.running:
            self.handle_events()
            self.update()
            self.draw()
            self.clock.tick(FPS)

        pygame.quit()
        sys.exit()


if __name__ == "__main__":
    game = Game()
    game.run()
