const sampleText = `我建议大家学 AI，先别急着到处收藏二手资料。

最权威的资料，其实就在模型御三家的官网里。

Anthropic，OpenAI，Google。

为什么？

因为他们直接研究模型，训练模型，发布模型，还要把这些模型交给应用厂商、开发者、企业团队和千千万万的普通用户使用。

他们官网上的文档，不只是产品说明书。很多内容其实是他们在做 Agent、做模型能力、做工程化落地时踩过的坑，最后沉淀成的公开经验。

省流版：

想学 Agent，看 Anthropic Engineering。
想学 API 和产品工程，看 OpenAI Developers。
想系统补提示词、Agent 和 Gemini 能力，看 Google AI for Developers 和 Kaggle 白皮书。

## 一、Anthropic / Claude：最值得精读的是工程模块

入口：
https://www.anthropic.com/learn
https://claude.com/resources/tutorials
https://www.anthropic.com/engineering
https://docs.claude.com/

Claude 的学习资料，大体可以分成五块。

第一块是 Anthropic Academy。

这是 Anthropic 的官方课程平台，偏系统学习。从 Build with Claude，到 Claude Code in action，再到企业协作场景里的 Claude for work，都属于这类内容。

第四块，也是我最推荐精读的，是 Engineering at Anthropic。

https://www.anthropic.com/engineering/building-effective-agents
Building effective agents：Agent 设计模式总纲。

https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
Effective context engineering for AI agents：讲真正复杂的 Agent 如何组织上下文。

## 二、OpenAI：文档最全，Cookbook 最适合抄作业

入口：
https://developers.openai.com/
https://developers.openai.com/api/docs
https://cookbook.openai.com/
https://developers.openai.com/codex

OpenAI 的开发者资料，整体更像一个完整的工程手册。

API Docs 建议优先看 Text generation、Prompt engineering、Structured outputs、Function calling、Reasoning best practices。

Cookbook 是 OpenAI 最适合抄作业的地方。这里有大量可运行的 Notebook 和案例。

## 三、Google AI / Gemini：系统性最强，白皮书值得打印出来读

入口：
https://ai.google.dev/gemini-api/docs
https://aistudio.google.com/
https://github.com/google-gemini/cookbook
https://www.kaggle.com/whitepaper-prompt-engineering

Google 的资料有两个特点。第一，Gemini API 文档覆盖很全。第二，Kaggle 白皮书非常系统。

## 怎么读？

如果你想理解 Agent，先读 Anthropic 的 Building effective agents，再读 Google 的 Agents 白皮书，最后看 OpenAI Agents SDK 的 Orchestration 和 Evals。

如果你想做 AI 应用，先读 OpenAI 的 Structured outputs、Function calling、Reasoning best practices。

特别友情提醒：

不要把官网文档当成一次性资料。这些页面是活的。模型更新，接口更新，最佳实践也会更新。

所以更好的办法，是做一个自己的资料追踪 Agent。`;

const themes = [
  {
    id: "docs",
    name: "文档树",
    desc: "适合资料整理、工具清单、学习路径",
    accent: "#d97757",
    render: renderDocsTheme,
  },
  {
    id: "minimal",
    name: "清爽白底",
    desc: "适合观点文、教程、长文发布",
    accent: "#111111",
    render: renderMinimalTheme,
  },
  {
    id: "magazine",
    name: "专栏杂志",
    desc: "适合叙事、评论、深度文章",
    accent: "#8a5a2b",
    render: renderMagazineTheme,
  },
  {
    id: "night",
    name: "黑色科技",
    desc: "适合 AI、编程、产品发布",
    accent: "#38bdf8",
    render: renderNightTheme,
  },
  {
    id: "cards",
    name: "卡片清单",
    desc: "适合榜单、推荐、模块化内容",
    accent: "#2f7d5b",
    render: renderCardsTheme,
  },
];

const els = {
  title: document.querySelector("#articleTitle"),
  input: document.querySelector("#articleInput"),
  stats: document.querySelector("#articleStats"),
  themeGrid: document.querySelector("#themeGrid"),
  preview: document.querySelector("#wechatPreview"),
  activeThemeName: document.querySelector("#activeThemeName"),
  copyRich: document.querySelector("#copyRichButton"),
  copyHtml: document.querySelector("#copyHtmlButton"),
  copyStatus: document.querySelector("#copyStatus"),
  loadSample: document.querySelector("#loadSampleButton"),
};

let activeTheme = themes[0];
let renderedHtml = "";

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function linkify(value, color) {
  const safe = escapeHtml(value);
  return safe.replace(
    /(https?:\/\/[^\s<]+)/g,
    `<a href="$1" style="color:${color};text-decoration:none;font-weight:700;">$1</a>`,
  );
}

function parseArticle(title, raw) {
  const blocks = raw
    .split(/\n\s*\n/g)
    .map((item) => item.trim())
    .filter(Boolean)
    .map((text) => {
      if (/^#{1,3}\s+/.test(text)) {
        return { type: "heading", text: text.replace(/^#{1,3}\s+/, "") };
      }
      if (/^(省流版|特别友情提醒|入口|怎么读)[：:]?$/.test(text)) {
        return { type: "calloutTitle", text: text.replace(/[：:]$/, "") };
      }
      if (/^https?:\/\//.test(text)) {
        return { type: "links", lines: text.split(/\n/).filter(Boolean) };
      }
      const lines = text.split(/\n/).filter(Boolean);
      if (lines.length > 1 && lines.every((line) => line.length < 80)) {
        return { type: "list", lines };
      }
      return { type: "paragraph", text };
    });

  return {
    title: title.trim() || "未命名文章",
    blocks,
    plainText: `${title}\n\n${raw}`,
  };
}

function paragraph(text, color = "#1b1b1b") {
  return `<p style="margin:18px 0;color:${color};">${text}</p>`;
}

function renderBlocks(article, styles) {
  let cardIndex = 0;
  return article.blocks
    .map((block) => {
      if (block.type === "heading") {
        cardIndex += 1;
        return styles.heading(block.text, cardIndex);
      }
      if (block.type === "calloutTitle") {
        return styles.calloutTitle(block.text);
      }
      if (block.type === "links") {
        return styles.links(block.lines);
      }
      if (block.type === "list") {
        return styles.list(block.lines);
      }
      return styles.paragraph(block.text);
    })
    .join("");
}

function renderDocsTheme(article) {
  const accent = "#d97757";
  const styles = {
    heading: (text, index) => `
      <section style="box-sizing:border-box;margin:28px 0;border:1.5px solid #e0e4ea;border-radius:18px;overflow:hidden;box-shadow:0 6px 22px rgba(20,30,50,0.06);">
        <section style="box-sizing:border-box;padding:18px;background:linear-gradient(180deg,#fcf2ec,#ffffff);">
          <p style="margin:0;color:${accent};font-size:12px;letter-spacing:2px;text-transform:uppercase;">Module ${index}</p>
          <h2 style="margin:4px 0 0;color:#1b1b1b;font-size:21px;line-height:1.35;font-weight:800;">${escapeHtml(text)}</h2>
        </section>
      </section>`,
    calloutTitle: (text) => `<section style="box-sizing:border-box;margin:22px 0 14px;padding:14px 16px;border:1px solid #e0e4ea;border-radius:14px;background:#f6f8fa;"><p style="margin:0;color:#1b1b1b;font-weight:800;">${escapeHtml(text)}</p></section>`,
    links: (lines) => `<section style="box-sizing:border-box;margin:14px 0 18px;padding:0;border-left:2px solid #e0e4ea;">${lines.map((line) => `<p style="margin:8px 0;padding-left:14px;color:#5b6470;font-size:14px;">${linkify(line, accent)}</p>`).join("")}</section>`,
    list: (lines) => `<section style="box-sizing:border-box;margin:14px 0;padding:14px;border:1px solid #e0e4ea;border-radius:12px;background:#ffffff;">${lines.map((line, index) => `<p style="margin:8px 0;color:#5b6470;font-size:14px;line-height:1.8;"><span style="display:inline-block;width:22px;height:22px;margin-right:8px;border-radius:7px;background:${accent};color:#ffffff;text-align:center;line-height:22px;font-size:12px;">${index + 1}</span>${linkify(line, accent)}</p>`).join("")}</section>`,
    paragraph: (text) => paragraph(linkify(text, accent)),
  };

  return wrapWechat(article, renderBlocks(article, styles), {
    kicker: "Documentation Guide",
    summary: "白底卡片、品牌色模块和树状链接，适合资料合集与学习路径。",
  });
}

function renderMinimalTheme(article) {
  const styles = {
    heading: (text) => `<h2 style="margin:34px 0 14px;padding:0 0 8px;border-bottom:2px solid #111111;color:#111111;font-size:21px;line-height:1.35;font-weight:800;">${escapeHtml(text)}</h2>`,
    calloutTitle: (text) => `<p style="margin:26px 0 10px;color:#111111;font-size:17px;font-weight:800;">${escapeHtml(text)}</p>`,
    links: (lines) => `<section style="box-sizing:border-box;margin:14px 0;padding:12px 14px;border:1px solid #e5e7eb;border-radius:10px;background:#fafafa;">${lines.map((line) => `<p style="margin:8px 0;color:#4b5563;font-size:14px;">${linkify(line, "#111111")}</p>`).join("")}</section>`,
    list: (lines) => `<section style="box-sizing:border-box;margin:14px 0;">${lines.map((line) => `<p style="margin:10px 0;padding-left:14px;border-left:3px solid #111111;color:#374151;">${linkify(line, "#111111")}</p>`).join("")}</section>`,
    paragraph: (text) => paragraph(linkify(text, "#111111")),
  };
  return wrapWechat(article, renderBlocks(article, styles), {
    kicker: "Clean Notes",
    summary: "克制的黑白排版，适合长文、观点文和教程。",
  });
}

function renderMagazineTheme(article) {
  const accent = "#8a5a2b";
  const styles = {
    heading: (text) => `<section style="box-sizing:border-box;margin:34px 0 16px;padding:18px 0 8px;border-top:1px solid #d6c4ae;"><p style="margin:0 0 4px;color:${accent};font-size:12px;letter-spacing:2px;">COLUMN</p><h2 style="margin:0;color:#2a2118;font-size:22px;line-height:1.35;font-weight:800;">${escapeHtml(text)}</h2></section>`,
    calloutTitle: (text) => `<p style="margin:24px 0 12px;color:${accent};font-size:18px;font-weight:800;">${escapeHtml(text)}</p>`,
    links: (lines) => `<section style="box-sizing:border-box;margin:14px 0;padding:14px 16px;border-radius:2px;background:#f7f0e7;">${lines.map((line) => `<p style="margin:8px 0;color:#5b4634;font-size:14px;">${linkify(line, accent)}</p>`).join("")}</section>`,
    list: (lines) => `<section style="box-sizing:border-box;margin:14px 0;">${lines.map((line) => `<p style="margin:10px 0;color:#3d3024;font-size:15px;"><span style="color:${accent};font-weight:800;">＊</span> ${linkify(line, accent)}</p>`).join("")}</section>`,
    paragraph: (text) => paragraph(linkify(text, accent), "#2a2118"),
  };
  return wrapWechat(article, renderBlocks(article, styles), {
    kicker: "Weekend Column",
    summary: "带一点纸张感的专栏风格，适合深度解读。",
    background: "#fffaf4",
  });
}

function renderNightTheme(article) {
  const accent = "#38bdf8";
  const styles = {
    heading: (text) => `<section style="box-sizing:border-box;margin:30px 0 16px;padding:16px;border:1px solid rgba(56,189,248,0.35);border-radius:14px;background:#0f172a;"><p style="margin:0 0 4px;color:${accent};font-size:12px;letter-spacing:2px;">SYSTEM NODE</p><h2 style="margin:0;color:#ffffff;font-size:21px;line-height:1.35;font-weight:800;">${escapeHtml(text)}</h2></section>`,
    calloutTitle: (text) => `<p style="margin:24px 0 10px;color:${accent};font-size:17px;font-weight:800;">${escapeHtml(text)}</p>`,
    links: (lines) => `<section style="box-sizing:border-box;margin:14px 0;padding:14px;border:1px solid rgba(148,163,184,0.28);border-radius:12px;background:#111827;">${lines.map((line) => `<p style="margin:8px 0;color:#cbd5e1;font-size:14px;">${linkify(line, accent)}</p>`).join("")}</section>`,
    list: (lines) => `<section style="box-sizing:border-box;margin:14px 0;">${lines.map((line) => `<p style="margin:10px 0;padding:10px 12px;border-radius:10px;background:#111827;color:#dbeafe;font-size:14px;">${linkify(line, accent)}</p>`).join("")}</section>`,
    paragraph: (text) => paragraph(linkify(text, accent), "#dbeafe"),
  };
  return wrapWechat(article, renderBlocks(article, styles), {
    kicker: "AI Dispatch",
    summary: "深色技术感排版，适合 AI、开发者、产品更新。",
    background: "#020617",
    color: "#dbeafe",
    titleColor: "#ffffff",
  });
}

function renderCardsTheme(article) {
  const accent = "#2f7d5b";
  let card = 0;
  const styles = {
    heading: (text) => {
      card += 1;
      return `<section style="box-sizing:border-box;margin:28px 0 14px;padding:16px;border:1px solid #d7e8df;border-radius:16px;background:#f2fbf6;"><p style="margin:0 0 6px;color:${accent};font-size:12px;font-weight:800;">CARD ${String(card).padStart(2, "0")}</p><h2 style="margin:0;color:#143c2a;font-size:20px;line-height:1.35;font-weight:800;">${escapeHtml(text)}</h2></section>`;
    },
    calloutTitle: (text) => `<p style="margin:22px 0 10px;color:${accent};font-size:17px;font-weight:800;">${escapeHtml(text)}</p>`,
    links: (lines) => `<section style="box-sizing:border-box;margin:14px 0;display:block;">${lines.map((line) => `<p style="margin:8px 0;padding:12px 14px;border:1px solid #d7e8df;border-radius:12px;background:#ffffff;color:#4b6358;font-size:14px;">${linkify(line, accent)}</p>`).join("")}</section>`,
    list: (lines) => `<section style="box-sizing:border-box;margin:14px 0;">${lines.map((line) => `<p style="margin:8px 0;padding:12px 14px;border-radius:12px;background:#f2fbf6;color:#24483a;font-size:14px;">${linkify(line, accent)}</p>`).join("")}</section>`,
    paragraph: (text) => paragraph(linkify(text, accent), "#173b2c"),
  };
  return wrapWechat(article, renderBlocks(article, styles), {
    kicker: "Curated Cards",
    summary: "模块化卡片排版，适合清单、推荐、方法论。",
    background: "#fbfdfb",
  });
}

function wrapWechat(article, body, options) {
  const background = options.background || "#ffffff";
  const color = options.color || "#1b1b1b";
  const titleColor = options.titleColor || "#111111";
  return `<section style="box-sizing:border-box;max-width:677px;margin:0 auto;padding:28px 14px 40px;background:${background};color:${color};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','PingFang SC','Microsoft YaHei',Arial,sans-serif;font-size:16px;line-height:1.85;">
    <section style="box-sizing:border-box;margin:0 0 24px;padding:0 2px;">
      <p style="margin:0 0 8px;color:#9098a4;font-size:12px;letter-spacing:3px;text-transform:uppercase;">${escapeHtml(options.kicker)}</p>
      <h1 style="margin:0 0 12px;color:${titleColor};font-size:28px;line-height:1.25;font-weight:800;letter-spacing:0;">${escapeHtml(article.title)}</h1>
      <p style="margin:0;color:#5b6470;font-size:15px;line-height:1.8;">${escapeHtml(options.summary)}</p>
    </section>
    ${body}
    <p style="margin:28px 0 0;text-align:center;color:#9098a4;font-size:12px;line-height:1.6;">由公众号排版编辑器生成 · 可直接粘贴到草稿箱</p>
  </section>`;
}

function renderThemeButtons() {
  els.themeGrid.innerHTML = themes
    .map(
      (theme) => `<button type="button" class="theme-card ${theme.id === activeTheme.id ? "active" : ""}" data-theme="${theme.id}">
        <span class="theme-swatch" style="background:${theme.accent}"></span>
        <strong>${theme.name}</strong>
        <small>${theme.desc}</small>
      </button>`,
    )
    .join("");
}

function render() {
  const article = parseArticle(els.title.value, els.input.value);
  renderedHtml = activeTheme.render(article);
  els.preview.innerHTML = renderedHtml;
  els.activeThemeName.textContent = activeTheme.name;
  els.stats.textContent = `${els.input.value.replace(/\s/g, "").length} 字`;
  localStorage.setItem("wechat-layout-editor:title", els.title.value);
  localStorage.setItem("wechat-layout-editor:input", els.input.value);
  localStorage.setItem("wechat-layout-editor:theme", activeTheme.id);
}

function setStatus(message, tone = "neutral") {
  els.copyStatus.textContent = message;
  els.copyStatus.dataset.tone = tone;
}

async function copyRichHtml() {
  const text = els.preview.innerText;
  try {
    await navigator.clipboard.write([
      new ClipboardItem({
        "text/html": new Blob([renderedHtml], { type: "text/html" }),
        "text/plain": new Blob([text], { type: "text/plain" }),
      }),
    ]);
    setStatus("已复制富文本。现在去公众号草稿箱正文区域粘贴。", "success");
  } catch (error) {
    const range = document.createRange();
    range.selectNode(els.preview);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    document.execCommand("copy");
    selection.removeAllRanges();
    setStatus("已用兼容模式复制。若样式缺失，请用 Chrome 打开本页面再复制。", "warning");
  }
}

async function copySourceHtml() {
  await navigator.clipboard.writeText(renderedHtml);
  setStatus("已复制 HTML 源码。注意：公众号正文粘贴源码会显示代码，通常请用“复制到公众号”。", "success");
}

function init() {
  els.title.value = localStorage.getItem("wechat-layout-editor:title") || els.title.value;
  els.input.value = localStorage.getItem("wechat-layout-editor:input") || sampleText;
  const savedTheme = localStorage.getItem("wechat-layout-editor:theme");
  activeTheme = themes.find((theme) => theme.id === savedTheme) || activeTheme;

  renderThemeButtons();
  render();

  els.input.addEventListener("input", render);
  els.title.addEventListener("input", render);
  els.copyRich.addEventListener("click", copyRichHtml);
  els.copyHtml.addEventListener("click", copySourceHtml);
  els.loadSample.addEventListener("click", () => {
    els.input.value = sampleText;
    render();
    setStatus("示例文章已载入。", "success");
  });
  els.themeGrid.addEventListener("click", (event) => {
    const card = event.target.closest("[data-theme]");
    if (!card) return;
    activeTheme = themes.find((theme) => theme.id === card.dataset.theme) || activeTheme;
    renderThemeButtons();
    render();
  });
}

init();
