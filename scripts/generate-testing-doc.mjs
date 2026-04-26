/**
 * Reads docs/TESTING-GUIDE.md and produces docs/Proxima-LMS-Testing-Guide.docx.
 * Run with: node scripts/generate-testing-doc.mjs
 */
import {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  Table, TableRow, TableCell, WidthType, BorderStyle,
  ShadingType,
} from "docx"
import { marked } from "marked"
import { readFileSync, writeFileSync } from "fs"
import { fileURLToPath } from "url"
import { dirname, join } from "path"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")
const SOURCE = join(ROOT, "docs/TESTING-GUIDE.md")
const OUTPUT = join(ROOT, "docs/Proxima-LMS-Testing-Guide.docx")

const COLORS = {
  teal: "22D3B7",
  dark: "0C1119",
  ink: "E8ECF5",
  gray: "94A0B8",
  tertiary: "5C6A82",
  border: "2A3650",
  surface: "121926",
}

const FONT_BODY = "Inter"
const FONT_CODE = "JetBrains Mono"
const FONT_DISPLAY = "Inter"

/* ─── inline-text parsing ─── */

function tokensToRuns(tokens, baseStyle = {}) {
  const runs = []
  for (const t of tokens) {
    if (t.type === "text") {
      runs.push(new TextRun({ text: t.text, font: FONT_BODY, ...baseStyle }))
    } else if (t.type === "strong") {
      runs.push(...tokensToRuns(t.tokens, { ...baseStyle, bold: true }))
    } else if (t.type === "em") {
      runs.push(...tokensToRuns(t.tokens, { ...baseStyle, italics: true }))
    } else if (t.type === "codespan") {
      runs.push(
        new TextRun({
          text: t.text,
          font: FONT_CODE,
          color: COLORS.teal,
          ...baseStyle,
        })
      )
    } else if (t.type === "link") {
      runs.push(...tokensToRuns(t.tokens, { ...baseStyle, color: COLORS.teal, underline: {} }))
    } else if (t.type === "del") {
      runs.push(...tokensToRuns(t.tokens, { ...baseStyle, strike: true }))
    } else if (t.type === "br") {
      runs.push(new TextRun({ text: "", break: 1 }))
    } else if (t.type === "html") {
      const text = t.text.replace(/<[^>]+>/g, "")
      if (text.trim()) runs.push(new TextRun({ text, font: FONT_BODY, ...baseStyle }))
    } else if (t.text) {
      runs.push(new TextRun({ text: t.text, font: FONT_BODY, ...baseStyle }))
    }
  }
  return runs
}

/* ─── block builders ─── */

function heading(text, level) {
  const sizes = { 1: 40, 2: 30, 3: 24, 4: 22 }
  const headingMap = {
    1: HeadingLevel.HEADING_1,
    2: HeadingLevel.HEADING_2,
    3: HeadingLevel.HEADING_3,
    4: HeadingLevel.HEADING_4,
  }
  return new Paragraph({
    heading: headingMap[level] ?? HeadingLevel.HEADING_3,
    spacing: { before: level === 1 ? 480 : level === 2 ? 360 : 240, after: 120 },
    children: [
      new TextRun({
        text,
        bold: true,
        color: level <= 2 ? COLORS.teal : COLORS.ink,
        font: FONT_DISPLAY,
        size: sizes[level] ?? 22,
      }),
    ],
  })
}

function paragraph(token) {
  return new Paragraph({
    spacing: { after: 140, line: 300 },
    children: tokensToRuns(token.tokens, { color: COLORS.ink, size: 22 }),
  })
}

function listItem(token, ordered, idx) {
  const prefix = ordered ? `${idx + 1}.` : "•"
  const firstChild = token.tokens?.[0]
  let isCheckbox = false
  let checked = false
  if (firstChild?.type === "text" && /^\[[ xX]\]\s/.test(firstChild.text)) {
    isCheckbox = true
    checked = /^\[[xX]\]/.test(firstChild.text)
    firstChild.text = firstChild.text.replace(/^\[[ xX]\]\s/, "")
    if (firstChild.tokens?.[0]?.text) {
      firstChild.tokens[0].text = firstChild.tokens[0].text.replace(/^\[[ xX]\]\s/, "")
    }
  }

  const flatTokens = token.tokens.flatMap((t) =>
    t.type === "text" && t.tokens ? t.tokens : [t]
  )
  const runs = tokensToRuns(flatTokens, { color: COLORS.ink, size: 22 })

  const marker = isCheckbox
    ? new TextRun({ text: checked ? "☑  " : "☐  ", color: COLORS.teal, size: 22, font: FONT_BODY })
    : new TextRun({ text: `${prefix}  `, color: COLORS.tertiary, size: 22, font: FONT_BODY })

  return new Paragraph({
    spacing: { after: 80 },
    indent: { left: 360 },
    children: [marker, ...runs],
  })
}

function codeBlock(token) {
  return token.text.split("\n").map(
    (line) =>
      new Paragraph({
        spacing: { after: 0 },
        shading: { type: ShadingType.SOLID, color: "0D1117", fill: "0D1117" },
        children: [
          new TextRun({
            text: line || " ",
            font: FONT_CODE,
            color: "C9D1D9",
            size: 20,
          }),
        ],
      })
  )
}

function blockquote(token) {
  return token.tokens.flatMap((inner) => {
    if (inner.type === "paragraph") {
      return [
        new Paragraph({
          spacing: { after: 120, line: 300 },
          indent: { left: 240 },
          border: { left: { style: BorderStyle.SINGLE, size: 18, color: COLORS.teal, space: 12 } },
          children: tokensToRuns(inner.tokens, { color: COLORS.gray, size: 22, italics: true }),
        }),
      ]
    }
    return []
  })
}

function tableBlock(token) {
  const headerRow = new TableRow({
    tableHeader: true,
    children: token.header.map(
      (cell) =>
        new TableCell({
          shading: { type: ShadingType.SOLID, color: COLORS.surface, fill: COLORS.surface },
          margins: { top: 100, bottom: 100, left: 140, right: 140 },
          children: [
            new Paragraph({
              children: tokensToRuns(cell.tokens, { color: COLORS.teal, bold: true, size: 20 }),
            }),
          ],
        })
    ),
  })

  const bodyRows = token.rows.map(
    (row) =>
      new TableRow({
        children: row.map(
          (cell) =>
            new TableCell({
              margins: { top: 100, bottom: 100, left: 140, right: 140 },
              children: [
                new Paragraph({
                  children: tokensToRuns(cell.tokens, { color: COLORS.ink, size: 20 }),
                }),
              ],
            })
        ),
      })
  )

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...bodyRows],
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: COLORS.border },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: COLORS.border },
      left: { style: BorderStyle.SINGLE, size: 4, color: COLORS.border },
      right: { style: BorderStyle.SINGLE, size: 4, color: COLORS.border },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: COLORS.border },
      insideVertical: { style: BorderStyle.SINGLE, size: 2, color: COLORS.border },
    },
  })
}

function hr() {
  return new Paragraph({
    spacing: { before: 200, after: 200 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: COLORS.border, space: 1 } },
    children: [new TextRun({ text: "" })],
  })
}

/* ─── main converter ─── */

function tokensToBlocks(tokens) {
  const blocks = []
  for (const tok of tokens) {
    switch (tok.type) {
      case "heading":
        blocks.push(heading(tok.text, tok.depth))
        break
      case "paragraph":
        blocks.push(paragraph(tok))
        break
      case "list":
        tok.items.forEach((item, i) => blocks.push(listItem(item, tok.ordered, i)))
        break
      case "code":
        blocks.push(...codeBlock(tok))
        break
      case "blockquote":
        blocks.push(...blockquote(tok))
        break
      case "table":
        blocks.push(tableBlock(tok))
        break
      case "hr":
        blocks.push(hr())
        break
      case "space":
        break
      default:
        if (tok.text) {
          blocks.push(
            new Paragraph({
              children: [new TextRun({ text: tok.text, font: FONT_BODY, color: COLORS.ink, size: 22 })],
            })
          )
        }
    }
  }
  return blocks
}

const md = readFileSync(SOURCE, "utf8")
const tokens = marked.lexer(md)
const blocks = tokensToBlocks(tokens)

const doc = new Document({
  creator: "Proxima LMS",
  title: "Proxima LMS — Testing Guide",
  styles: {
    default: {
      document: { run: { font: FONT_BODY, color: COLORS.ink } },
    },
  },
  sections: [
    {
      properties: {
        page: {
          margin: { top: 1080, bottom: 1080, left: 1080, right: 1080 },
        },
      },
      children: blocks,
    },
  ],
})

const buffer = await Packer.toBuffer(doc)
writeFileSync(OUTPUT, buffer)
console.log(`Generated: ${OUTPUT} (${(buffer.length / 1024).toFixed(1)} KB, ${tokens.length} top-level tokens)`)
