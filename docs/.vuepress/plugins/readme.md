# 页面

VuePress 是以 Markdown 为中心的。你项目中的每一个 Markdown 文件都是一个单独的页面。

## 路由

默认情况下，页面的路由路径是根据你的 Markdown 文件的相对路径决定的。

假设这是你的 Markdown 文件所处的目录结构：

```
└─ docs
   ├─ guide
   │  ├─ getting-started.md
   │  └─ README.md
   ├─ contributing.md
   └─ README.md
```

将 `docs` 目录作为你的 [sourceDir](../reference/cli.md) ，例如你在运行 `vuepress dev docs` 命令。此时，你的 Markdown 文件对应的路由路径为：

| 相对路径                    | 路由路径                      |
| --------------------------- | ----------------------------- |
| `/README.md`                | `/`                           |
| `/index.md`                 | `/`                           |
| `/contributing.md`          | `/contributing.html`          |
| `/guide/README.md`          | `/guide/`                     |
| `/guide/getting-started.md` | `/guide/getting-started.html` |

::: tip
默认配置下， `README.md` 和 `index.md` 都会被转换成 `index.html` ，并且其对应的路由路径都是由斜杠结尾的。然而，如果你想同时保留这两个文件，就可能会造成冲突。

在这种情况下，你可以设置 [pagePatterns](../reference/config.md#pagepatterns) 来避免某个文件被 VuePress 处理，例如使用 `['**/*.md', '!**/README.md', '!.vuepress', '!node_modules']` 来排除所有的 `README.md` 文件。

此外，一些符号如 `:` 和 `+` 可能对 vue-router 有特殊含义，因此你应该避免使用它们，请参阅 [vue-router 文档](https://router.vuejs.org/zh/guide/essentials/route-matching-syntax.html) 了解更多详情。
:::

## Frontmatter

Markdown 文件可以包含一个 [YAML](https://yaml.org/) Frontmatter 。Frontmatter 必须在 Markdown 文件的顶部，并且被包裹在一对三短划线中间。下面是一个基本的示例：

```md
---
lang: zh-CN
title: 页面的标题
description: 页面的描述
---
```

你肯定注意到 Frontmatter 中的字段和[配置文件](./configuration.md#config-file)中的[站点配置](./configuration.md#站点配置)十分类似。你可以通过 Frontmatter 来覆盖当前页面的 `lang`, `title`, `description` 等属性。因此，你可以把 Frontmatter 当作页面级作用域的配置。

同样的，VuePress 有一些内置支持的 Frontmatter 字段，而你使用的主题也可能有它自己的特殊 Frontmatter 。

::: tip
前往 [Frontmatter 参考](../reference/frontmatter.md) 查看 VuePress 支持的 Frontmatter 配置。

前往 [默认主题 > Frontmatter 参考](../reference/default-theme/frontmatter.md) 查看默认主题的 Frontmatter 配置。
:::

### permalink

- 类型： `string`

- 详情：

  页面的永久链接。

  它将会覆盖根据文件路径来决定的默认路由路径。

- 参考：
  - [Frontmatter > permalinkPattern](#permalinkpattern)
  - [指南 > 页面 > 路由](../guide/page.md#路由)
  - [Node API > Page 属性 > permalink](./node-api.md#permalink)

### permalinkPattern

- 类型： `string | null`

- 详情：

  为页面生成永久链接的 Pattern 。

  它将会覆盖站点配置中的 `permalinkPattern` 配置项。

  如果 Frontmatter 中设置了 `permalink` ，那么这个字段则不会生效。

- 使用：

  | Pattern  | 描述               |
  | -------- | ------------------ |
  | `:year`  | 创建日期的 年 部分 |
  | `:month` | 创建日期的 月 部分 |
  | `:day`   | 创建日期的 日 部分 |
  | `:slug`  | 页面文件名的 Slug  |
  | `:raw`   | 原始路由路径       |

  `:year`, `:month` 和 `:day` Pattern 根据如下优先级进行解析：

  - Frontmatter 中的 `date` 字段。
  - 符合 `yyyy-MM-dd-foobar.md` 或 `yyyy-MM-foobar.md` 日期格式的文件名。
  - 符合 `yyyy/MM/dd/foobar.md` 或 `yyyy/MM/foobar.md` 日期格式的目录名。
  - 默认值 `0000-00-00` 。

- 示例 1 ：

  页面文件名是 `foo-bar.md` 。

  页面 Frontmatter 是：

```md
---
date: 2021-01-03
permalinkPattern: :year/:month/:day/:slug.html
---
```

那么页面的永久链接将会是 `2021/01/03/foo-bar.html` 。

- 示例 2 ：

  页面文件名是 `2021-01-03-bar-baz.md`。

  页面 Frontmatter 是：

```md
---
permalinkPattern: :year/:month/:day/:slug.html
---
```

那么页面的永久链接将会是 `2021/01/03/bar-baz.html` 。

- 参考：
  - [配置 > permalinkPattern](./config.md#permalinkpattern)
  - [Frontmatter > date](#date)
  - [Frontmatter > permalink](#permalink)
  - [Node API > Page 属性 > permalink](./node-api.md#permalink)

### layout

- 类型： `string`

- 详情：

  页面的布局。

  布局是由主题提供的。如果你不指定该 Frontmatter ，则会使用默认布局。你应该参考主题自身的文档来了解其提供了哪些布局。

  如果主题布局无法满足你的需求，你可以使用自定义布局组件。

- 示例：

在 `.vuepress/client.ts` 文件中注册一个布局组件：

```ts
import { defineClientConfig } from '@vuepress/client';
import CustomLayout from './CustomLayout.vue';

export default defineClientConfig({
  layouts: {
    CustomLayout,
  },
});
```

在 Frontmatter 中设置自定义布局：

```md
---
layout: CustomLayout
---
```

## 内容

页面的主要内容是使用 Markdown 书写的。VuePress 首先会将 Markdown 转换为 HTML ，然后将 HTML 作为 Vue 单文件组件的 `<template>` 。

借助 [markdown-it](https://github.com/markdown-it/markdown-it) 和 Vue 模板语法的能力，基础的 Markdown 可以得到很多的扩展功能。接下来，前往 [Markdown](./markdown.md) 章节来了解 VuePress 中 Markdown 的扩展功能。
