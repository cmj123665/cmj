/**
 * 简单的音效脚本 - 仅包含基本功能
 * 防止卡顿和性能问题
 */

// 简单的音效管理器
const SimpleAudio = {
    enabled: true,

    // 播放简单的提示音
    play(type) {
        if (!this.enabled) return;

        try {
            // 使用 Web Audio API 创建简单的蜂鸣音
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;

            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.connect(gain);
            gain.connect(ctx.destination);

            const sounds = {
                click: { freq: 800, dur: 0.05 },
                score: { freq: 600, dur: 0.1 },
                success: { freq: 523, dur: 0.15 },
                error: { freq: 200, dur: 0.2 },
                victory: { freq: 659, dur: 0.3 },
                defeat: { freq: 220, dur: 0.3 }
            };

            const sound = sounds[type] || sounds.click;
            osc.frequency.value = sound.freq;
            osc.type = 'sine';

            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + sound.dur);

            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + sound.dur);
        } catch (e) {
            // 静默失败
        }
    },

    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }
};
