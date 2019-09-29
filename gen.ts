import * as showdown from 'showdown';
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'fs';
import * as dayjs from 'dayjs';

const converter = new showdown.Converter({ metadata: true });
const template = readFileSync('template.html', 'utf8');

const markdownDirectory = './markdown/';
for(const markdownPath of readdirSync(markdownDirectory)) {
  try {
    const markdownFile = readFileSync(markdownDirectory + markdownPath, 'utf8');

    const markdownContent = converter.makeHtml(markdownFile);
    const { title, description, createdAt, ogTitle, ogDescription, ogImage } = converter.getMetadata();
    const htmlPath = __dirname + '/docs/posts/' + dayjs(createdAt).format('YYYY/MM/DD');
    console.log(htmlPath)

    mkdirSync(htmlPath, { recursive: true });
    let replacedHtml = template.replace('$$title', title)
    replacedHtml = replacedHtml.replace('$$description', description || ogDescription || title)
    replacedHtml = replacedHtml.replace('$$content', markdownContent)
    replacedHtml = replacedHtml.replace('$$og:title', ogTitle || title || 'soonoo.me')
    replacedHtml = replacedHtml.replace('$$og:description', ogDescription || description || title)
    replacedHtml = replacedHtml.replace('$$og:image', ogImage)

    writeFileSync(htmlPath + '/' + markdownPath.replace('.md', '.html'), replacedHtml, 'utf8');
  } catch(e) {
    console.error(e);
  }
}

