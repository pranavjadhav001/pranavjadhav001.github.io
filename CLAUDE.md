# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Pranav Jadhav's personal site/blog, built on the **Phantom Jekyll theme** (vendored in-repo, not pulled from RubyGems — see `phantom.gemspec`). Hosted on GitHub Pages at the `pranavjadhav001.github.io` repo, with a custom domain via `CNAME` (`www.pranavj.com`). Pushing to `main` is the deploy mechanism — there is no CI workflow; GitHub Pages builds the site automatically.

## Commands

```bash
gem install bundler
bundle install
bundle exec jekyll serve       # local dev server, default http://localhost:4000
```

There are no lint or test commands/scripts in this repo — it's a static Jekyll site with no JS build step or test suite.

## Architecture

- **Posts** (`_posts/*.md`) are the unit of content. Each post's front matter drives layout via two custom fields the theme's includes key off of:
  - `layout: inner` (article layout) — almost always used for posts.
  - `position: left` or `position: right` — selects `_includes/content-left.html` vs `content-right.html` on the home page grid (alternates featured image/text side).
  - Other front matter (`featured_image`, `project_link`, `button_icon`, `button_text`, `lead_text`, `categories`, `tags`) feeds directly into the include templates — check `_includes/post-content.html` and `_includes/featured-image.html` before changing a post's fields.
- **Layouts** (`_layouts/`) are thin wrappers that assemble includes:
  - `home.html` — paginated post grid, loops `paginator.posts` and dispatches to `content-left`/`content-right` based on each post's `position`.
  - `inner.html` — single-column article view, renders `{{ content }}` directly (used for posts and `about.md`).
  - `default.html` — generic wrapper using `post-content.html`.
  All three share `header.html` and `footer.html` includes.
- **Site-wide config lives in `_config.yml`**, not scattered across templates: nav items (`nav_item`), pagination behavior (via jekyll-paginate), footer text, contact form toggle (`enable_contact`), and analytics ID are all set there. Changing the nav or footer text should go through `_config.yml`, not by hand-editing `header.html`/`footer.html`.
- **Styling**: `css/style.scss` plus `_sass/_bootstrap.scss` and `_sass/_mixins.scss` (Bootstrap-based). `css/animate.min.css` and `js/wow.min.js` drive the scroll-triggered `wow fadeIn` animations used when looping posts in `home.html`.
- `_plugins/` is empty (just `.gitkeep`) — no custom Jekyll plugins currently.

## Editing conventions (from README.md)

- To add or update a post: add/edit a `.md` file under `_posts/`, following the existing front-matter shape (see any file in `_posts/` for the template — `layout`, `position`, `title`, `date`, `categories`, `tags`, `featured_image`, `project_link`, `button_icon`, `button_text`, `lead_text`).
- To change the home page hero title/description/buttons: edit `_includes/home-hero.html`.
