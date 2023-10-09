# prism-autoloader-plus

Add more feature to prism-autoloader.

Build:

```sh
pnpm install
pnpm build
```

Usage:

```html
<script src="prism-autoloader-plus.min.js"></script>
<!-- or use CDN -->
<script src="https://cdn.jsdelivr.net/npm/@immccn123/prism-autoloader-plus@{version}/prism-autoloader-plus.min.js"></script>
```

See [offical document](https://prismjs.com/plugins/autoloader/) for basic usage.

In addition to the configuration items mentioned in the official documentation, this plugin also provides the following configurations:

```html
<script>
  Prism.plugins.autoloader.languages_path =
    "https://unpkg.com/prismjs@1.29.0/components/"; // trailing slash is required
  // Addtional
  Prism.plugins.autoloader.lang_dependencies = {
    doxycpp: "cpp",
    "language-string": ["multiple", "dependencies"],
  };
  // Addtional
  Prism.plugins.autoloader.lang_urls = {
    doxycpp:
      "//fastly.jsdelivr.net/npm/prism-cpp-doxygen/prism-cpp-doxygen.min.js",
  };
</script>
```

If you don't need these additional configuration items, please use the [official plugin](https://prismjs.com/plugins/autoloader/).
