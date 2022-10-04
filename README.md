# Stanford Christian Students
Website Development for Stanford Christian Students:
[christianstudents.github.io](https://christianstudents.github.io)

## Development
### Getting Started
1. **Clone Github repository:**<br/>
   Run the following commands.
   ```
   git clone https://github.com/christianstudents/christianstudents.github.io.git
   cd christianstudents.github.io
   ```
2. **Install Jekyll:**<br/>
   Follow the instructions at
   [Jekyll's official installation page](https://jekyllrb.com/docs/installation/) to install it on
   your computer.
3. **Install dependencies:**<br/>
   The website uses a few Jekyll plugins, including
   [jekyll-webpack](https://github.com/tevio/jekyll-webpack) to run Webpack, as well as modules from
   npm to handle stuff like TypeScript, Sass, etc. as well as modules used in development, like
   Firebase. Run the following command to install Ruby gems and npm modules.
   ```
   bundle install && npm install
   ```
5. **Run the server locally:**<br/>
   Run the following command to have Jekyll build and serve the website.
   ```
   npm start
   ```
   Navigate to [localhost:4000](http://localhost:4000/) in your browser to view the running website.

### Website Structure
Each page gets its own `.html` file. Since we're using Jekyll, we can use the same template for each
page (located in [`_layouts/default.html`](./_layouts/default.html)). Additionally, each page can
get its own stylesheet(s), script(s), and font(s) by defining that metadata in page's front matter.
For example:

```yaml
---
title: Page Title
layout: default
fonts:
  - Roboto
  - Karla:
    - 400
    - 400i
    - 700
    - 700i
  - Another Font:
    - 400
    - 700
  - Yet Another Font
styles:
  - some-stylesheet.css
  - another-stylesheet.css
scripts:
  - some-script.js
  - another-script.js
  - src: script-with-extra-attributes.js
    defer: true
    async: true
---
```

The front matter can specify `fonts`, `styles`, and `scripts` to link to other files. View each
section below for more details.

<details>
<summary>

#### `fonts`

</summary>

The `fonts` property lets you load fonts from [Google Fonts](https://fonts.google.com).

##### Type

```typescript
(FontName | Record<FontName, FontSpecification[]>)[]
```

Each `FontName` (`string`) should be the name of a font (e.g., `Karla`, `Robot Slab`, etc.). Each
`FontSpecification` (`string | number`) should be a font weight, optionally followed by an `"i"` to
mark that font as italic (e.g., `400`, `400i`, `900`, `200i`, etc.)

If the `FontName` is specified without any `FontSpecification`s, only the font with weight 400 and
no italics will be loaded (i.e., `Karla` is really just shorthand for `{ Karla: [400] }`).

##### Example

```yaml
---
# Loads Karla:400
fonts:
  - Karla
---
```
```yaml
# Loads Roboto:400;Roboto+Slab:400
fonts:
  - Roboto
  - Roboto Slab
---
```
```yaml
# Loads Open+Sans:400,400i,700,700i;Montserrat:500,600,900i;Lato:400
fonts:
  - Open Sans:
    - 400
    - 400i
    - 700
    - 700i
  - Montserrat:
    - 500
    - 600
    - 900i
  - Lato
---
```

</details>

<details>
<summary>

#### `styles`

</summary>

The `styles` property lets you load CSS stylesheets.

##### Type
```typescript
(Path)[]
```

Each `Path` (`string`) should be the path to a CSS file within the [`/css`](./css) directory.

##### Notes
Each `Path` should end with `.css` since it is referencing the generated CSS file, even if the
original file is a SCSS file.

Additionally, each path is relative to the `/css` directory, not the current file.

##### Example

You have two stylesheets, one at `/css/some-file.scss` and another at
`/css/directory/another-file.scss`. To load both into the same page, you would use the following
front matter:

```yaml
styles:
  - some-file.css
  - directory/another-file.css
```

Notice how the `"/css"` at the beginning of the path is implied, and the extensions are all `.css`
since the `.scss` files are turned into `.css` files by Webpack.

</details>

<details>
<summary>

#### `scripts`

</summary>

The `scripts` property lets you load JavaScript scripts.

##### Type
```typescript
(Record<string, any> | Path | boolean)[] | Path | boolean
```

Each `Path` (`string`) should be the path to a JavaScript file within the [`/js`](./js) directory.

##### Notes

Each `Path` should end with `.js` since it is referencing the generated JavaScript file, even if the
original file is a TypeScript file.

Additionally, each path is relative to the `/js` directory, not the current file.

Each `Record<string, any>` in the Type information is a dictionary of attributes to add to the
`<script>`. For example, to insert `<script src="/js/index.js" defer async>`, you would use the
following front matter:

```yaml
---
scripts:
  - src: index.js
    defer: true
    async: true
---
```

As a shorthand, if a dictionary is found without a `src` attribute, the path to the current HTML
page will be used instead. For example, if you have the following front matter in
`/directory/some-page.html`, you would see a `<script src="/js/directory/some-page.js" async>` add
to the page:

```yaml
---
scripts:
  - async: true
    # "src" assumed to be the current path, which is directory/some-page.
---
```

If a `Path` (`string`) is used instead of a dictionary, it is assumed to be the `src` of a file. For
example, the following two front matters are equivalent.

```yaml
---
scripts:
  - some-file.js
---
```
```yaml
---
scripts:
  - src: some-file.js
---
```

If a `boolean` is used instead of a dictionary and it is `true`, it is treated as an object with no
`src`, i.e., the current page's path is used as the `src`. For example, the following two front
matters are equivalent.

```yaml
---
scripts:
  - true
---
```
```yaml
---
scripts:
  - {} # "src" assumed to be the current path.
---
```

If a `boolean` or `Path` is used on its own instead of a list of objects, it is treated as a
single-element list. For example, the following three front matters are equivalent.

```yaml
---
scripts: true
---
```
```yaml
---
scripts:
  - true
---
```
```yaml
---
scripts:
  - {} # "src" assumed to be the current path
---
```

By default, `<script>`s are inserted at the end of the `<body>`, once the rest of the page has
gotten a chance to be parsed. This makes it easier to target elements (e.g., by using
`document.getElementById`) within the page instead of having to wait for them to load. If you
instead want a `<script>` to be inserted in the `<head>`, *before* the `<body>` has gotten a chance
to load, you can specify an additional `in_head: true` attribute to the script to have it show up in
the `<head>` instead. For example:

```yaml
---
scripts:
  - src: some-file-in-the-head.js
    in_head: true
  - src: another-file-in-the-body.js
    in_head: false # in_head can also be omitted here
---
```

##### Example

```yaml
scripts:
  - true
  - some-path.js
  - src: another-path.js
    defer: true
  - src: yet/another/path.js
    in_head: true
    defer: true
```

The front matter above, assuming is is in `index.html`, would generate the following HTML structure:

```html
<head>
  <!-- head content -->
  <script src="/js/yet/another/path.js" defer></script>
</head>
<body>
  <!-- body content -->
  <script src="/js/index.js"></script>
  <script src="/js/some-path.js"></script>
  <script src="/js/another-path.js" defer></script>
</body>
```

Notice how the `"/js"` at the beginning of the path is implied, and the extensions are all `.js`
since any `.ts` files are turned into `.js` files by Webpack.

</details>