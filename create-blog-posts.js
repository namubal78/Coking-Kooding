/**
 * 블로그 글 일괄 게시 스크립트
 *
 * 사용법:
 * 1. 브라우저에서 namubal78.github.io 로그인
 * 2. 개발자도구 콘솔에서: localStorage.getItem('token') 복사
 * 3. node create-blog-posts.js <위에서 복사한 토큰>
 *
 * 콘텐츠: blog-posts/ 폴더의 .md 파일을 읽어서 게시합니다.
 * 파일 상단 프론트매터(---) 형식:
 *   title: 제목
 *   category: 학습|트러블슈팅|가족|초안
 *   excerpt: 한 줄 요약
 *   tags: tag1,tag2,tag3
 */

const fs = require('fs')
const path = require('path')

const API = 'https://coking-cooding-api.onrender.com'
const token = process.argv[2]

if (!token) {
  console.error('사용법: node create-blog-posts.js <JWT_TOKEN>')
  process.exit(1)
}

function parseFrontmatter(raw) {
  const lines = raw.split('\n')
  if (lines[0].trim() !== '---') return null
  const end = lines.indexOf('---', 1)
  if (end === -1) return null
  const meta = {}
  for (let i = 1; i < end; i++) {
    const idx = lines[i].indexOf(':')
    if (idx === -1) continue
    const key = lines[i].slice(0, idx).trim()
    const val = lines[i].slice(idx + 1).trim()
    meta[key] = val
  }
  const content = lines.slice(end + 1).join('\n').trim()
  return { ...meta, content }
}

async function createPost(post) {
  const body = {
    title: post.title,
    category: post.category,
    excerpt: post.excerpt,
    tags: post.tags ? post.tags.split(',').map(t => t.trim()) : [],
    content: post.content,
  }
  const res = await fetch(`${API}/api/blog/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`${res.status}: ${text}`)
  }
  return res.json()
}

async function main() {
  const dir = path.join(__dirname, 'blog-posts')
  if (!fs.existsSync(dir)) {
    console.error('blog-posts/ 폴더가 없습니다.')
    process.exit(1)
  }
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.md')).sort()
  if (files.length === 0) {
    console.error('blog-posts/ 폴더에 .md 파일이 없습니다.')
    process.exit(1)
  }
  console.log(`총 ${files.length}개 글 게시 시작...\n`)
  for (const file of files) {
    const raw = fs.readFileSync(path.join(dir, file), 'utf-8')
    const post = parseFrontmatter(raw)
    if (!post || !post.title) {
      console.warn(`  건너뜀: ${file} (프론트매터 없음)`)
      continue
    }
    try {
      const result = await createPost(post)
      console.log(`✓ [${result.id}] ${post.title}`)
    } catch (e) {
      console.error(`✗ ${post.title}`)
      console.error(`  ${e.message}`)
    }
  }
  console.log('\n완료!')
}

main()
