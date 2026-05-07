# MCP servers

Coordination-layer connectors for MarkdownOps, exposed as Model Context Protocol
servers. Every server in this directory implements the same standard tool family
so MarkdownOps agents work against any of them without prompt changes.

## Standard tool family

| Tool | Purpose |
|---|---|
| `mdops_create_issue` | Create a coordination unit |
| `mdops_get_issue` | Read a coordination unit |
| `mdops_list_issues` | Search / filter coordination units |
| `mdops_add_comment` | Post a review or decision |
| `mdops_update_status` | Transition state |
| `mdops_link_artifact` | Attach a Markdown source path |
| `mdops_assign` | Set reviewers / owner |

See [../runners/mcp.md](../runners/mcp.md) for the contract details.

## Available servers

| Connector | Status | Path |
|---|---|---|
| GitHub Issues | ✅ available | [github/](github/) |
| GitLab Issues | ✅ available | [gitlab/](gitlab/) |
| Jira Cloud | ✅ available | [jira/](jira/) |
| Linear | ✅ available | [linear/](linear/) |
| Asana | 🚧 planned | `asana/` |
| Notion | 🚧 planned | `notion/` |
| Slack (read-only) | 🚧 planned | `slack/` |

## Adding a new connector

1. Copy `github/` as a starting template.
2. Reimplement each tool against your tool's API. Map vocabulary:
   - issue → your record type
   - comment → your activity / discussion item
   - status → your workflow state (often a label or a custom field)
   - labels → your tags / fields
3. Keep tool names and input schemas exactly. The `mdops_` prefix is part of
   the contract. Adding extensions is fine; renaming is not.
4. Add unit tests that mock the upstream API and assert protocol-level shapes.
5. Document required environment variables in the connector's `README.md`.
6. Update the table above.

## Running a server in isolation

```sh
cd mcp-servers/<connector>
npm install
cp .env.example .env  # then fill in
npm run build
npm start
```

The server speaks MCP over stdio. To poke at it interactively:

```sh
npx @modelcontextprotocol/inspector node dist/index.js
```

---

## 한국어

# MCP 서버

MarkdownOps용 협업 레이어 커넥터, Model Context Protocol 서버로 노출. 이 디렉터리의
모든 서버는 동일한 표준 도구군을 구현하므로, MarkdownOps agent는 프롬프트 변경 없이
어떤 서버에 대해서도 동작한다.

## 표준 도구군

| 도구 | 목적 |
|---|---|
| `mdops_create_issue` | 협업 단위 생성 |
| `mdops_get_issue` | 협업 단위 읽기 |
| `mdops_list_issues` | 협업 단위 검색/필터 |
| `mdops_add_comment` | 리뷰/결정 게시 |
| `mdops_update_status` | 상태 전이 |
| `mdops_link_artifact` | Markdown source 경로 첨부 |
| `mdops_assign` | 리뷰어/오너 지정 |

계약 세부는 [../runners/mcp.md](../runners/mcp.md) 참고.

## 수록 서버

| 커넥터 | 상태 | 경로 |
|---|---|---|
| GitHub Issues | ✅ 사용 가능 | [github/](github/) |
| GitLab Issues | ✅ 사용 가능 | [gitlab/](gitlab/) |
| Jira Cloud | ✅ 사용 가능 | [jira/](jira/) |
| Linear | ✅ 사용 가능 | [linear/](linear/) |
| Asana | 🚧 예정 | `asana/` |
| Notion | 🚧 예정 | `notion/` |
| Slack (읽기 전용) | 🚧 예정 | `slack/` |

## 새 커넥터 추가

1. `github/`를 출발점으로 복사.
2. 사용 도구 API에 대해 각 도구를 재구현. 어휘 매핑:
   - issue → 사용 도구의 레코드 종류
   - comment → 사용 도구의 활동/토론 항목
   - status → 사용 도구의 워크플로우 상태 (보통 label 또는 커스텀 필드)
   - labels → 사용 도구의 태그/필드
3. 도구 이름과 입력 스키마는 정확히 유지. `mdops_` 접두는 계약의 일부. 확장은
   허용되지만 이름 변경은 금지.
4. 상위 API를 모킹하고 프로토콜 레벨 모양을 단언하는 단위 테스트 추가.
5. 필요한 환경 변수는 커넥터 `README.md`에 문서화.
6. 위 표 갱신.

## 서버 단독 실행

```sh
cd mcp-servers/<connector>
npm install
cp .env.example .env  # 후 채우기
npm run build
npm start
```

서버는 stdio 위에서 MCP를 말한다. 대화식 검사:

```sh
npx @modelcontextprotocol/inspector node dist/index.js
```
