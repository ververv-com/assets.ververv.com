import fs from 'fs-extra';
import path from 'path';
import ejs from 'ejs';

// 类型定义
interface ThirdPartyService {
    name: string;
    url?: string;
}

interface Feature {
    title: string;
    description: string;
    image: string;
}

interface Step {
    icon: string;
    title: string;
    description: string;
}

interface FAQ {
    question: string;
    answer: string;
}

interface HomepageSectionCopy {
    screenshots_title?: string;
    steps_title?: string;
    steps_subtitle?: string;
    support_title?: string;
    support_subtitle?: string;
    download_label?: string;
}

interface TermsConfig {
    service_description?: string;
}

interface LegalConfig {
    terms?: TermsConfig;
}

interface HomepageConfig {
    slogan: string;
    sub_slogan: string;
    app_icon: string;
    app_store_url: string;
    features: Feature[];
    faqs: FAQ[];
    steps?: Step[];
    screenshots?: string[];
    section_copy?: HomepageSectionCopy;
    feature_image_max_width?: string;
    feature_image_max_height?: string;
    support_email_subject?: string;
    support_email_body?: string;
    theme_color?: string;
    company_name?: string;
    company_url?: string;
}

interface AppConfig {
    key: string;
    name: string;
    email: string;
    updated_date: string;
    has_iap: boolean;
    third_party_services: ThirdPartyService[];
    pages: string[];
    homepage?: HomepageConfig;
    legal?: LegalConfig;
}

// 路径配置
const ROOT = path.resolve(__dirname, '..');
const PATHS = {
    data: path.join(ROOT, 'data', 'apps.json'),
    templates: path.join(ROOT, 'templates'),
    static: path.join(ROOT, 'static'),
    dist: path.join(ROOT, 'dist')
};

// 支持的页面类型
const PAGE_TEMPLATES: Record<string, string> = {
    privacy: 'privacy.ejs',
    terms: 'terms.ejs',
    homepage: 'homepage.ejs'
};

// 辅助函数
function hexToRgb(hex: string): string {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result 
        ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
        : '0, 0, 0';
}

async function build() {
    console.log('🚀 [Build] 开始构建...');

    try {
        // 1. 清理旧构建
        await fs.emptyDir(PATHS.dist);
        console.log('🗑️  已清理 dist 目录');

        // 2. 复制静态资源
        if (await fs.pathExists(PATHS.static)) {
            await fs.copy(PATHS.static, path.join(PATHS.dist, 'assets'));
            console.log('📦 已复制静态资源');
        }

        // 3. 读取配置
        const apps: AppConfig[] = await fs.readJson(PATHS.data);
        console.log(`📋 读取到 ${apps.length} 个 App 配置`);

        // 4. 为每个 App 生成页面
        for (const app of apps) {
            console.log(`\n👉 正在构建: ${app.name} (${app.key})`);

            const appDir = path.join(PATHS.dist, app.key);
            await fs.ensureDir(appDir);

            // 生成配置的页面（Clean URLs: 每个页面输出到独立子目录）
            let hasHomepage = false;
            for (const pageType of app.pages) {
                const templateFile = PAGE_TEMPLATES[pageType];
                if (!templateFile) {
                    console.warn(`   ⚠️  未知页面类型: ${pageType}`);
                    continue;
                }

                const templatePath = path.join(PATHS.templates, templateFile);
                if (!await fs.pathExists(templatePath)) {
                    console.warn(`   ⚠️  模板不存在: ${templateFile}`);
                    continue;
                }

                const template = await fs.readFile(templatePath, 'utf-8');
                const html = ejs.render(template, { 
                    ...app, 
                    helpers: { hexToRgb } 
                });

                // Clean URLs: 输出到子目录，文件名为 index.html
                // homepage → home/index.html
                // privacy  → privacy/index.html
                const outputDir = pageType === 'homepage' ? 'home' : pageType;
                const pageDir = path.join(appDir, outputDir);
                await fs.ensureDir(pageDir);
                await fs.writeFile(path.join(pageDir, 'index.html'), html);
                console.log(`   ✓ ${outputDir}/index.html`);

                if (pageType === 'homepage') {
                    hasHomepage = true;
                }
            }

            // 如果有 homepage，生成根目录重定向到 home/
            if (hasHomepage) {
                const redirectHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="refresh" content="0;url=home/">
    <link rel="canonical" href="home/">
    <title>Redirecting...</title>
</head>
<body>
    <p>Redirecting to <a href="home/">home/</a></p>
</body>
</html>`;
                await fs.writeFile(path.join(appDir, 'index.html'), redirectHtml);
                console.log('   ✓ index.html (redirect)');
            }

            // 生成 config.json
            const appConfig = {
                app_name: app.name,
                contact: app.email,
                privacy_policy_url: `https://s.ververv.com/${app.key}/privacy/`
            };
            await fs.writeFile(
                path.join(appDir, 'config.json'),
                JSON.stringify(appConfig, null, 2)
            );
            console.log('   ✓ config.json');
        }

        // 5. 生成首页
        const indexTemplatePath = path.join(PATHS.templates, 'index.ejs');
        if (await fs.pathExists(indexTemplatePath)) {
            const indexTemplate = await fs.readFile(indexTemplatePath, 'utf-8');
            const indexHtml = ejs.render(indexTemplate, { apps });
            await fs.writeFile(path.join(PATHS.dist, 'index.html'), indexHtml);
            console.log('\n✓ 首页 index.html 已生成');
        }

        // 6. 生成 CNAME 文件（GitHub Pages 自定义域名）
        const customDomain = 's.ververv.com';
        await fs.writeFile(path.join(PATHS.dist, 'CNAME'), customDomain);
        console.log(`✓ CNAME 文件已生成: ${customDomain}`);

        console.log('\n✅ 构建成功!');
        console.log(`📁 输出目录: ${PATHS.dist}`);

    } catch (err) {
        console.error('\n❌ 构建失败:', err);
        process.exit(1);
    }
}

build();
