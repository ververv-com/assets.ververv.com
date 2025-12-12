import fs from 'fs-extra';
import path from 'path';
import ejs from 'ejs';

// 类型定义 - 规范 data/apps.json 的格式
interface AppConfig {
    key: string;          // 例如: "photocleaner"
    name: string;         // 例如: "Photo Cleaner"
    email: string;        // 例如: "support@..."
    updated_date: string; // 例如: "December 12, 2025"
    has_iap: boolean;     // 是否有内购
}

// 路径配置
const ROOT = path.resolve(__dirname, '..');
const PATHS = {
    data: path.join(ROOT, 'data', 'apps.json'),
    template: path.join(ROOT, 'templates', 'privacy.ejs'),
    static: path.join(ROOT, 'static'),
    dist: path.join(ROOT, 'dist')
};

async function build() {
    console.log('🚀 [TypeScript] 开始构建...');

    try {
        // A. 清理旧构建
        await fs.emptyDir(PATHS.dist);

        // B. 复制公共资源 (如果有)
        if (await fs.pathExists(PATHS.static)) {
            await fs.copy(PATHS.static, path.join(PATHS.dist, 'assets'));
            console.log('📦 已复制静态资源');
        }

        // C. 读取数据
        const apps: AppConfig[] = await fs.readJson(PATHS.data);
        const template = await fs.readFile(PATHS.template, 'utf-8');

        // D. 遍历 App 生成页面
        for (const app of apps) {
            console.log(`👉 正在构建: ${app.name} (${app.key})`);

            // 目标目录: /dist/photocleaner
            const appDir = path.join(PATHS.dist, app.key);
            await fs.ensureDir(appDir);

            // 1. 生成 HTML
            const html = ejs.render(template, app);
            await fs.writeFile(path.join(appDir, 'privacy.html'), html);

            // 2. 生成 JSON 配置 (给 App 代码用的)
            const appConfig = {
                app_name: app.name,
                contact: app.email,
                privacy_policy_url: `https://assets.ververv.com/${app.key}/privacy.html`
            };
            await fs.writeFile(
                path.join(appDir, 'config.json'),
                JSON.stringify(appConfig, null, 2)
            );
        }

        console.log('✅ 构建成功!');

    } catch (err) {
        console.error('❌ 构建失败:', err);
        process.exit(1);
    }
}

build();
