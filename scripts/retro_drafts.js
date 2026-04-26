#!/usr/bin/env node
/**
 * 소급 드래프트 생성 스크립트
 *
 * 실행:
 *   node scripts/retro_drafts.js
 *   node scripts/retro_drafts.js --dry-run
 */

const { execSync } = require('child_process')

const { ANTHROPIC_API_KEY, API_URL, WEBHOOK_SECRET, JWT_TOKEN } = process.env
const DRY_RUN = process.argv.includes('--dry-run')
const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages'
const MODEL = 'claude-haiku-4-5-20251001'
const MAX_TOKENS = 5500
const GITHUB_REPO = 'https://github.com/namubal78/Coking-Cooding'

// 날짜별 대표 커밋 (가장 의미 있는 커밋 선택)
// action: 'put' = 기존 항목 덮어쓰기, 'post' = 신규 생성
const RETRO_TARGETS = [
  { date: '2026-04-22', sha: 'c0dd6d4', dbId: 1,   action: 'put'  }, // README + 포트폴리오 + 시드 SQL
  { date: '2026-04-23', sha: '0dcff5f', dbId: null, action: 'post' }, // 포트폴리오 + 랜딩 + Slack Bot
  { date: '2026-04-24', sha: '524f293', dbId: 2,   action: 'put'  }, // UI 대규모 개선
]

if (!DRY_RUN && (!ANTHROPIC_API_KEY || !API_URL || !WEBHOOK_SECRET || !JWT_TOKEN)) {
  console.error('필수 환경변수 없음: ANTHROPIC_API_KEY, API_URL, WEBHOOK_SECRET, JWT_TOKEN')
  process.exit(1)
}

const sleep = ms => new Promise(r => setTimeout(r, ms))

function getGitDiff(sha) {
  try {
    const raw = execSync(
      `git diff ${sha}~1 ${sha} -- "backend/**" "frontend/app/**" "frontend/components/**" "frontend/lib/**" ".github/**" "scripts/**"`,
      { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 }
    )
    return raw.slice(0, 6000)
  } catch {
    try {
      return execSync(`git diff ${sha}~1 ${sha}`, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 }).slice(0, 6000)
    } catch (e) {
      return `diff 추출 실패: ${e.message}`
    }
  }
}

function getCommitMeta(sha) {
  try {
    const msg    = execSync(`git log -1 --pretty=%B ${sha}`, { encoding: 'utf8' }).split('\n')[0].trim()
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
    body: JSON.stringify({ model: MODEL, max_tokens: MAX_TOKENS, messages: [{ role: 'user', content: prompt }] }),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(JSON.stringify(json))
  return json.content[0].text
}

async function putEntry(id, sha, content) {
  const body = `> SHA: [${sha}](${GITHUB_REPO}/commit/${sha})\n\n` + content
  const res = await fetch(`${API_URL}/api/dev-logs/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'X-Webhook-Secret': WEBHOOK_SECRET },
    body: JSON.stringify({ content: body }),
  })
  if (!res.ok) throw new Error(`PUT ${id} 실패: ${res.status} ${await res.text()}`)
}

async function postWebhook(sha, meta, content) {
  const body = `> SHA: [${sha}](${GITHUB_REPO}/commit/${sha})\n\n` + content
  const files = meta.files.split(', ').filter(Boolean)
  const res = await fetch(`${API_URL}/api/dev-logs/webhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Webhook-Secret': WEBHOOK_SECRET },
    body: JSON.stringify({
      commitMessage: meta.msg,
      author: meta.author,
      sha,
      changedFiles: files,
      timestamp: meta.ts,
      diff: body,
    }),
  })
  if (!res.ok) throw new Error(`POST webhook 실패: ${res.status} ${await res.text()}`)
}

async function main() {
  console.log(`소급 드래프트 생성 — ${RETRO_TARGETS.length}건\n`)

  for (let i = 0; i < RETRO_TARGETS.length; i++) {
    const { date, sha, dbId, action } = RETRO_TARGETS[i]
    const meta = getCommitMeta(sha)
    console.log(`[${i + 1}/${RETRO_TARGETS.length}] ${date} / sha=${sha} / ${action === 'put' ? `PUT id=${dbId}` : 'POST (신규)'}`)
    console.log(`  커밋: ${meta.msg}`)

    if (DRY_RUN) { console.log('  → dry-run 건너뜀\n'); continue }

    try {
      const diff = getGitDiff(sha)
      const prompt = buildPrompt(sha, meta, diff)
      const newContent = await callAnthropic(prompt)
      console.log(`  Claude 생성 완료 (${newContent.length}자)`)

      if (action === 'put') {
        await putEntry(dbId, sha, newContent)
        console.log(`  ✅ PUT id=${dbId} 성공\n`)
      } else {
        await postWebhook(sha, meta, newContent)
        console.log(`  ✅ POST 성공 (${date} 신규 항목)\n`)
      }
    } catch (e) {
      console.error(`  ❌ 실패: ${e.message}\n`)
    }

    await sleep(2000)
  }

  console.log('완료!')
}

main().catch(e => { console.error(e); process.exit(1) })
