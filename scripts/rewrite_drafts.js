#!/usr/bin/env node
/**
 * 기존 dev_log 항목 전체를 현재 프롬프트 품질로 재작성하는 스크립트
 *
 * 실행 전 환경변수 설정:
 *   export ANTHROPIC_API_KEY=sk-ant-...
 *   export API_URL=https://coking-cooding-api.onrender.com
 *   export WEBHOOK_SECRET=...
 *   export JWT_TOKEN=...   (로그인 후 localStorage의 token 값)
 *
 * 실행:
 *   node scripts/rewrite_drafts.js
 *   node scripts/rewrite_drafts.js --dry-run   (API 호출 없이 SHA 추출만 확인)
 */

import { execSync } from 'child_process'

const {
  ANTHROPIC_API_KEY,
  API_URL,
  WEBHOOK_SECRET,
  JWT_TOKEN,
} = process.env

const DRY_RUN = process.argv.includes('--dry-run')
const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages'
const MODEL = 'claude-haiku-4-5-20251001'
const MAX_TOKENS = 5500
const GITHUB_REPO = 'https://github.com/namubal78/Coking-Cooding'

if (!DRY_RUN && (!ANTHROPIC_API_KEY || !API_URL || !WEBHOOK_SECRET || !JWT_TOKEN)) {
  console.error('필수 환경변수가 없습니다: ANTHROPIC_API_KEY, API_URL, WEBHOOK_SECRET, JWT_TOKEN')
  process.exit(1)
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function extractSha(content) {
  const match = content.match(/SHA:\s*\[([a-f0-9]{7,40})\]/)
  return match ? match[1] : null
}

function getGitDiff(sha) {
  try {
    const raw = execSync(`git diff ${sha}~1 ${sha} -- "backend/**" "frontend/app/**" "frontend/components/**" "frontend/lib/**" ".github/**" "scripts/**"`, {
      encoding: 'utf8',
      maxBuffer: 10 * 1024 * 1024,
    })
    return raw.slice(0, 6000)
  } catch {
    try {
      const raw = execSync(`git diff ${sha}~1 ${sha}`, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 })
      return raw.slice(0, 6000)
    } catch (e) {
      return `diff 추출 실패: ${e.message}`
    }
  }
}

function getCommitMeta(sha) {
  try {
    const msg   = execSync(`git log -1 --pretty=%B ${sha}`, { encoding: 'utf8' }).split('\n')[0].trim()
    const author = execSync(`git log -1 --pretty=%an ${sha}`, { encoding: 'utf8' }).trim()
    const ts     = execSync(`git log -1 --pretty=%cI ${sha}`, { encoding: 'utf8' }).trim()
    const files  = execSync(`git diff --name-only ${sha}~1 ${sha}`, { encoding: 'utf8' })
      .trim().split('\n').filter(Boolean).join(', ')
    return { msg, author, ts, files }
  } catch {
    return { msg: sha, author: 'unknown', ts: '', files: '' }
  }
}

function buildPrompt(sha, meta, diff) {
  return `다음 커밋 정보와 실제 코드 diff를 바탕으로 심층 기술 개발 일지를 한국어로 작성해줘.
diff를 직접 분석해서 실제 변경 내용을 정확히 반영하고, A4 기준 1.5페이지 분량으로 압축적이고 밀도 있게 서술해줘.
단순 설명이 아니라 "왜 이 선택인가", "어떤 대안이 있었는가", "트레이드오프는 무엇인가"를 중심으로 작성해줘.

커밋 메시지: ${meta.msg}
작성자: ${meta.author}
커밋 SHA: ${sha}
변경 파일: ${meta.files}
시각: ${meta.ts}

실제 diff:
\`\`\`diff
${diff}
\`\`\`

아래 형식을 정확히 따라줘:

## 이슈 및 문제상황
(왜 이 변경이 필요했는지 2~3문장. 기존 코드의 한계를 구체적으로)

## 커밋 요약
(무엇을 어떻게 했는지 2~3문장. 기술적으로 구체적으로)

## 주요 변경사항
- \`파일명\`: 변경 핵심 내용 (1~2줄)

## BEFORE / AFTER
\`\`\`before
(diff의 - 라인을 참고해서 변경 전 핵심 코드 2~3줄)
\`\`\`
\`\`\`after
(diff의 + 라인을 참고해서 변경 후 핵심 코드 2~3줄)
\`\`\`

## 기술 선택 배경 및 트레이드오프
(핵심 기술 결정 1~2개만)

### [결정: 선택한 기술/방식]
**선택한 이유**: (1~2문장)
**대안**: \`대안A\` — 장점/단점/선택 안 한 이유 각 한 줄
**트레이드오프**: 얻은 것과 포기한 것 각 1문장

## 기술 개념 심층 분석
(핵심 키워드 2~3개)

### [키워드명]
(동작 원리와 이 프로젝트에서의 적용 3~5문장)
- **[핵심 개념]**: 1~2문장
- **장점**: 구체적 이점 한 줄
- **주의점**: 한계나 주의사항 한 줄

## 세부 설정 포인트
- \`설정항목\`: 값 — 이유와 다른 값을 썼을 때 차이 한 줄

## 결과
정상 처리됨 / 이슈 발생 등 한 줄`
}

async function callAnthropic(prompt) {
  const res = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      messages: [{ role: 'user', content: prompt }],
    }),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(JSON.stringify(json))
  return json.content[0].text
}

async function updateDevLog(id, sha, content) {
  const shaLink = `> SHA: [${sha}](${GITHUB_REPO}/commit/${sha})\n\n`
  const res = await fetch(`${API_URL}/api/dev-logs/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Webhook-Secret': WEBHOOK_SECRET,
    },
    body: JSON.stringify({ content: shaLink + content }),
  })
  if (!res.ok) throw new Error(`PUT failed: ${res.status} ${await res.text()}`)
}

async function main() {
  console.log('📋 dev_log 목록 가져오는 중...')
  const res = await fetch(`${API_URL}/api/dev-logs`, {
    headers: { Authorization: `Bearer ${JWT_TOKEN}` },
  })
  const logs = await res.json()
  console.log(`총 ${logs.length}개 항목 발견\n`)

  for (let i = 0; i < logs.length; i++) {
    const log = logs[i]
    const sha = extractSha(log.content)
    console.log(`[${i + 1}/${logs.length}] id=${log.id} date=${log.logDate} sha=${sha ?? '❌ 추출 실패'}`)

    if (!sha) {
      console.log('  → SHA 없음, 건너뜀\n')
      continue
    }

    if (DRY_RUN) continue

    try {
      const diff = getGitDiff(sha)
      const meta = getCommitMeta(sha)
      console.log(`  커밋: ${meta.msg}`)

      const prompt = buildPrompt(sha, meta, diff)
      const newContent = await callAnthropic(prompt)
      await updateDevLog(log.id, sha, newContent)
      console.log(`  ✅ 재작성 완료 (${newContent.length}자)\n`)
    } catch (e) {
      console.error(`  ❌ 실패: ${e.message}\n`)
    }

    await sleep(2000)
  }

  console.log('완료!')
}

main().catch(e => { console.error(e); process.exit(1) })
