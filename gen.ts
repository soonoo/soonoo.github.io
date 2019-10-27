import * as showdown from 'showdown';
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'fs';
import * as dayjs from 'dayjs';

const converter = new showdown.Converter({ metadata: true });

const { HOST } = process.env;
const profileImage = 'https://avatars0.githubusercontent.com/u/5436405?s=460&v=4';
const posts = [];
const markdownDirectory = './markdown/';
for(const markdownPath of readdirSync(markdownDirectory)) {
  try {
    const template = readFileSync('template.html', 'utf8');
    const markdownFile = readFileSync(markdownDirectory + markdownPath, 'utf8');

    const markdownContent = converter.makeHtml(markdownFile);
    const { title, description, createdAt, ogTitle, ogDescription, ogImage } = converter.getMetadata();
    const htmlPath = '/docs/posts/' + dayjs(createdAt).format('YYYY/MM/DD');
    const fullHtmlPath = __dirname + htmlPath;
    const fileName = markdownPath.replace('.md', '.html');

    mkdirSync(fullHtmlPath, { recursive: true });
    let replacedHtml = template.replace('$$title', title);
    replacedHtml = replacedHtml.replace('$$description', description || ogDescription || title);
    replacedHtml = replacedHtml.replace('$$content', markdownContent);
    replacedHtml = replacedHtml.replace('$$og:title', ogTitle || title || 'soonoo.me');
    replacedHtml = replacedHtml.replace('$$og:description', ogDescription || description || title);
    replacedHtml = replacedHtml.replace('$$og:image', ogImage || profileImage);
    replacedHtml = replacedHtml.replace('$$HOST', HOST || 'https://soonoo.me');
    replacedHtml = replacedHtml.replace('$$github-comments', `
      <script src="https://utteranc.es/client.js"
        repo="soonoo/soonoo.github.io"
        issue-term="pathname"
        theme="github-light"
        crossorigin="anonymous"
        async>
      </script>
    `);

    posts.push({
      date: dayjs(createdAt).format('YYYY-MM'),
      title,
      path: htmlPath + '/' + fileName,
    });
    writeFileSync(fullHtmlPath + '/' + fileName, replacedHtml, 'utf8');
  } catch(e) {
    console.error(e);
  }

  try {
    let template = readFileSync('template.html', 'utf8');
    let listHtml = '';
    const compareDate = (a, b) => Number(new Date(b.date)) - Number(new Date(a.date));

    for(const post of posts.sort(compareDate)) {
      listHtml += `
        <div class='mainPostLink'>
          <span class='mainPostLinkDate'>${post.date}</span><a href='${post.path}'>${post.title}</a>
        </div>
      `;
    }

    template = template.replace('$$title', 'soonoo.me');
    template = template.replace('$$description', '순우 블로그');
    template = template.replace('$$og:title', 'soonoo.me');
    template = template.replace('$$og:description', '일기장 겸 블로그');
    template = template.replace('$$og:image', profileImage);
    template = template.replace('$$content', listHtml);
    template = template.replace('$$HOST', HOST || 'https://soonoo.me');
    template = template.replace('$$github-comments', '');
    writeFileSync(__dirname + '/index.html', template, 'utf8');
  } catch(e) {
    console.error(e);
  }

  try {
    const sitemapContent = posts.map(post => post.path).reduce((acc, cur) => acc + HOST + cur + '\n', '');
    writeFileSync(__dirname + '/docs/sitemap.txt', sitemapContent, 'utf8');
  } catch(e) {
    console.error(e);
  }
}

