/**
 * Modified from prism-autoloader.js (https://github.com/PrismJS/prism/blob/master/plugins/autoloader/prism-autoloader.js)
 * Licensed under MIT, Copyright (c) 2012 Lea Verou
 *
 * Modified by Imken Luo, licensed under MIT
 * Copyright (c) 2023 Imken Luo
 *
 * @license MIT
 */

import {
  lang_dependencies as preset_lang_dependencies,
  lang_aliases as preset_lang_aliases,
} from "./constants.js";

/**
 * The autoloader plugin of prismjs.
 *
 * @param {import("prismjs")} Prism
 */
export default function autoloader(Prism) {
  if (typeof Prism === "undefined" || typeof document === "undefined") {
    return;
  }

  /**
   * @typedef LangDataItem
   * @property {{ success?: () => void, error?: () => void }[]} callbacks
   * @property {boolean} [error]
   * @property {boolean} [loading]
   */

  /** @type {Object<string, LangDataItem>} */
  var lang_data = {};

  var ignored_language = "none";
  var languages_path = "components/";

  /** @type {HTMLScriptElement | null} */
  // @ts-expect-error
  var script = Prism.util.currentScript();

  if (script) {
    var autoloaderFile =
      /\bplugins\/autoloader\/prism-autoloader\.(?:min\.)?js(?:\?[^\r\n/]*)?$/i;
    var prismFile = /(^|\/)[\w-]+\.(?:min\.)?js(?:\?[^\r\n/]*)?$/i;

    const src = script.src;
    if (autoloaderFile.test(src)) {
      // the script is the original autoloader script in the usual Prism project structure
      languages_path = src.replace(autoloaderFile, "components/");
    } else if (prismFile.test(src)) {
      // the script is part of a bundle like a custom prism.js from the download page
      languages_path = src.replace(prismFile, "$1components/");
    }
  }

  var config = (Prism.plugins.autoloader = {
    languages_path: languages_path,
    use_minified: true,
    loadLanguages: loadLanguages,
    /** @type {Object<string, string | string[]>} */
    lang_dependencies: {},
    /** @type {Object<string, string>} */
    lang_aliases: {},
    /** @type {Object<string, string>} */
    lang_urls: {},
  });

  /**
   * Get alias from language.
   *
   * @param {string} lang
   */
  const getAlias = (lang) =>
    ({ ...preset_lang_aliases, ...config.lang_aliases }[lang] || lang);

  /**
   * Lazily loads an external script.
   *
   * @param {string} src
   * @param {() => void} [success]
   * @param {() => void} [error]
   */
  function addScript(src, success, error) {
    var s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.onload = () => {
      document.body.removeChild(s);
      success && success();
    };
    s.onerror = () => {
      document.body.removeChild(s);
      error && error();
    };
    document.body.appendChild(s);
  }

  /**
   * Returns all additional dependencies of the given element defined by the `data-dependencies` attribute.
   *
   * @param {Element} element
   * @returns {string[]}
   */
  function getDependencies(element) {
    var deps = (element.getAttribute("data-dependencies") || "").trim();
    if (!deps) {
      var parent = element.parentElement;
      if (parent && parent.tagName.toLowerCase() === "pre") {
        deps = (parent.getAttribute("data-dependencies") || "").trim();
      }
    }
    return deps ? deps.split(/\s*,\s*/g) : [];
  }

  /**
   * Returns whether the given language is currently loaded.
   *
   * @param {string} lang
   * @returns {boolean}
   */
  function isLoaded(lang) {
    if (lang.indexOf("!") >= 0) {
      // forced reload
      return false;
    }

    lang = getAlias(lang); // resolve alias

    if (lang in Prism.languages) {
      // the given language is already loaded
      return true;
    }

    // this will catch extensions like CSS extras that don't add a grammar to Prism.languages
    var data = lang_data[lang];
    return data && !data.error && data.loading === false;
  }

  /**
   * Returns the path to a grammar, using the language_path and use_minified config keys.
   *
   * @param {string} lang
   * @returns {string}
   */
  const getLanguagePath = (lang) => {
    return (
      config.lang_urls[lang] ??
      `${config.languages_path}prism-${lang}${
        config.use_minified ? ".min" : ""
      }.js`
    );
  };

  /**
   * Loads all given grammars concurrently.
   *
   * @param {string[] | string} languages
   * @param {(languages: string[]) => void} [success]
   * @param {(language: string) => void} [error] This callback will be invoked on the first language to fail.
   */
  function loadLanguages(languages, success, error) {
    if (typeof languages === "string") {
      languages = [languages];
    }

    var total = languages.length;
    var completed = 0;
    var failed = false;

    if (total === 0) {
      if (success) {
        setTimeout(success, 0);
      }
      return;
    }

    function successCallback() {
      if (failed) {
        return;
      }
      completed++;
      if (completed === total) {
        success &&
          success(typeof languages === "string" ? [languages] : languages);
      }
    }

    languages.forEach(function (lang) {
      loadLanguage(lang, successCallback, function () {
        if (failed) {
          return;
        }
        failed = true;
        error && error(lang);
      });
    });
  }

  /**
   * Loads a grammar with its dependencies.
   *
   * @param {string} lang
   * @param {() => void} [success]
   * @param {() => void} [error]
   */
  function loadLanguage(lang, success, error) {
    const force = lang.indexOf("!") >= 0;

    lang = lang.replace("!", "");
    lang = getAlias(lang);

    function load() {
      var data = lang_data[lang];
      if (!data) {
        data = lang_data[lang] = {
          callbacks: [],
        };
      }
      data.callbacks.push({
        success: success ?? (() => {}),
        error: error ?? (() => {}),
      });

      if (!force && isLoaded(lang)) {
        // the language is already loaded and we aren't forced to reload
        languageCallback(lang, "success");
      } else if (!force && data.error) {
        // the language failed to load before and we don't reload
        languageCallback(lang, "error");
      } else if (force || !data.loading) {
        // the language isn't currently loading and/or we are forced to reload
        data.loading = true;
        data.error = false;

        addScript(
          getLanguagePath(lang),
          () => {
            data.loading = false;
            languageCallback(lang, "success");
          },
          () => {
            data.loading = false;
            data.error = true;
            languageCallback(lang, "error");
          }
        );
      }
    }

    var dependencies = {
      ...preset_lang_dependencies,
      ...config.lang_dependencies,
    }[lang];
    if (dependencies && dependencies.length) {
      loadLanguages(dependencies, load, error);
    } else {
      load();
    }
  }

  /**
   * Runs all callbacks of the given type for the given language.
   *
   * @param {string} lang
   * @param {"success" | "error"} type
   */
  function languageCallback(lang, type) {
    if (!lang_data[lang]) return;
    const callbacks = lang_data[lang].callbacks;
    for (let i = 0, l = callbacks.length; i < l; i++) {
      const callback = callbacks[i][type];
      if (callback) {
        setTimeout(callback, 0);
      }
    }
    callbacks.length = 0;
  }

  Prism.hooks.add("complete", (env) => {
    var element = env.element;
    var language = env.language;
    if (!element || !language || language === ignored_language) {
      return;
    }

    var deps = getDependencies(element);
    if (/^diff-./i.test(language)) {
      // the "diff-xxxx" format is used by the Diff Highlight plugin
      deps.push("diff");
      deps.push(language.substring("diff-".length));
    } else {
      deps.push(language);
    }

    if (!deps.every(isLoaded)) {
      // the language or some dependencies aren't loaded
      loadLanguages(deps, () => {
        if (element) Prism.highlightElement(element);
      });
    }
  });
}
