/*!
 * vue2-editor v2.10.2 
 * (c) 2020 David Royer
 * Released under the MIT License.
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('quill')) :
  typeof define === 'function' && define.amd ? define(['exports', 'quill'], factory) :
  (global = global || self, factory(global.Vue2Editor = {}, global.Quill));
}(this, function (exports, Quill) { 'use strict';

  Quill = Quill && Quill.hasOwnProperty('default') ? Quill['default'] : Quill;

  var defaultToolbar = [[{
    header: [false, 1, 2, 3, 4, 5, 6]
  }], ["bold", "italic", "underline", "strike"], // toggled buttons
  [{
    align: ""
  }, {
    align: "center"
  }, {
    align: "right"
  }, {
    align: "justify"
  }], ["blockquote", "code-block"], [{
    list: "ordered"
  }, {
    list: "bullet"
  }, {
    list: "check"
  }], [{
    indent: "-1"
  }, {
    indent: "+1"
  }], // outdent/indent
  [{
    color: []
  }, {
    background: []
  }], // dropdown with defaults from theme
  ["link", "image", "video"], ["clean"] // remove formatting button
  ];

  var oldApi = {
    props: {
      customModules: Array
    },
    methods: {
      registerCustomModules: function registerCustomModules(Quill) {
        if (this.customModules !== undefined) {
          this.customModules.forEach(function (customModule) {
            Quill.register("modules/" + customModule.alias, customModule.module);
          });
        }
      }
    }
  };

  function _typeof(obj) {
    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function");
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        writable: true,
        configurable: true
      }
    });
    if (superClass) _setPrototypeOf(subClass, superClass);
  }

  function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
      return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf(o);
  }

  function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };

    return _setPrototypeOf(o, p);
  }

  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return self;
  }

  function _possibleConstructorReturn(self, call) {
    if (call && (typeof call === "object" || typeof call === "function")) {
      return call;
    }

    return _assertThisInitialized(self);
  }

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArrayLimit(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance");
  }

  /**
   * Performs a deep merge of `source` into `target`.
   * Mutates `target` only but not its objects and arrays.
   *
   */
  function mergeDeep(target, source) {
    var isObject = function isObject(obj) {
      return obj && _typeof(obj) === "object";
    };

    if (!isObject(target) || !isObject(source)) {
      return source;
    }

    Object.keys(source).forEach(function (key) {
      var targetValue = target[key];
      var sourceValue = source[key];

      if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
        target[key] = targetValue.concat(sourceValue);
      } else if (isObject(targetValue) && isObject(sourceValue)) {
        target[key] = mergeDeep(Object.assign({}, targetValue), sourceValue);
      } else {
        target[key] = sourceValue;
      }
    });
    return target;
  }

  var BlockEmbed = Quill.import("blots/block/embed");

  var HorizontalRule =
  /*#__PURE__*/
  function (_BlockEmbed) {
    _inherits(HorizontalRule, _BlockEmbed);

    function HorizontalRule() {
      _classCallCheck(this, HorizontalRule);

      return _possibleConstructorReturn(this, _getPrototypeOf(HorizontalRule).apply(this, arguments));
    }

    return HorizontalRule;
  }(BlockEmbed);

  HorizontalRule.blotName = "hr";
  HorizontalRule.tagName = "hr";
  Quill.register("formats/horizontal", HorizontalRule);

  var MarkdownShortcuts =
  /*#__PURE__*/
  function () {
    function MarkdownShortcuts(quill, options) {
      var _this = this;

      _classCallCheck(this, MarkdownShortcuts);

      this.quill = quill;
      this.options = options;
      this.ignoreTags = ["PRE"];
      this.matches = [{
        name: "header",
        pattern: /^(#){1,6}\s/g,
        action: function action(text, selection, pattern) {
          var match = pattern.exec(text);
          if (!match) return;
          var size = match[0].length; // Need to defer this action https://github.com/quilljs/quill/issues/1134

          setTimeout(function () {
            _this.quill.formatLine(selection.index, 0, "header", size - 1);

            _this.quill.deleteText(selection.index - size, size);
          }, 0);
        }
      }, {
        name: "blockquote",
        pattern: /^(>)\s/g,
        action: function action(_text, selection) {
          // Need to defer this action https://github.com/quilljs/quill/issues/1134
          setTimeout(function () {
            _this.quill.formatLine(selection.index, 1, "blockquote", true);

            _this.quill.deleteText(selection.index - 2, 2);
          }, 0);
        }
      }, {
        name: "code-block",
        pattern: /^`{3}(?:\s|\n)/g,
        action: function action(_text, selection) {
          // Need to defer this action https://github.com/quilljs/quill/issues/1134
          setTimeout(function () {
            _this.quill.formatLine(selection.index, 1, "code-block", true);

            _this.quill.deleteText(selection.index - 4, 4);
          }, 0);
        }
      }, {
        name: "bolditalic",
        pattern: /(?:\*|_){3}(.+?)(?:\*|_){3}/g,
        action: function action(text, _selection, pattern, lineStart) {
          var match = pattern.exec(text);
          var annotatedText = match[0];
          var matchedText = match[1];
          var startIndex = lineStart + match.index;
          if (text.match(/^([*_ \n]+)$/g)) return;
          setTimeout(function () {
            _this.quill.deleteText(startIndex, annotatedText.length);

            _this.quill.insertText(startIndex, matchedText, {
              bold: true,
              italic: true
            });

            _this.quill.format("bold", false);
          }, 0);
        }
      }, {
        name: "bold",
        pattern: /(?:\*|_){2}(.+?)(?:\*|_){2}/g,
        action: function action(text, _selection, pattern, lineStart) {
          var match = pattern.exec(text);
          var annotatedText = match[0];
          var matchedText = match[1];
          var startIndex = lineStart + match.index;
          if (text.match(/^([*_ \n]+)$/g)) return;
          setTimeout(function () {
            _this.quill.deleteText(startIndex, annotatedText.length);

            _this.quill.insertText(startIndex, matchedText, {
              bold: true
            });

            _this.quill.format("bold", false);
          }, 0);
        }
      }, {
        name: "italic",
        pattern: /(?:\*|_){1}(.+?)(?:\*|_){1}/g,
        action: function action(text, _selection, pattern, lineStart) {
          var match = pattern.exec(text);
          var annotatedText = match[0];
          var matchedText = match[1];
          var startIndex = lineStart + match.index;
          if (text.match(/^([*_ \n]+)$/g)) return;
          setTimeout(function () {
            _this.quill.deleteText(startIndex, annotatedText.length);

            _this.quill.insertText(startIndex, matchedText, {
              italic: true
            });

            _this.quill.format("italic", false);
          }, 0);
        }
      }, {
        name: "strikethrough",
        pattern: /(?:~~)(.+?)(?:~~)/g,
        action: function action(text, _selection, pattern, lineStart) {
          var match = pattern.exec(text);
          var annotatedText = match[0];
          var matchedText = match[1];
          var startIndex = lineStart + match.index;
          if (text.match(/^([*_ \n]+)$/g)) return;
          setTimeout(function () {
            _this.quill.deleteText(startIndex, annotatedText.length);

            _this.quill.insertText(startIndex, matchedText, {
              strike: true
            });

            _this.quill.format("strike", false);
          }, 0);
        }
      }, {
        name: "code",
        pattern: /(?:`)(.+?)(?:`)/g,
        action: function action(text, _selection, pattern, lineStart) {
          var match = pattern.exec(text);
          var annotatedText = match[0];
          var matchedText = match[1];
          var startIndex = lineStart + match.index;
          if (text.match(/^([*_ \n]+)$/g)) return;
          setTimeout(function () {
            _this.quill.deleteText(startIndex, annotatedText.length);

            _this.quill.insertText(startIndex, matchedText, {
              code: true
            });

            _this.quill.format("code", false);

            _this.quill.insertText(_this.quill.getSelection(), " ");
          }, 0);
        }
      }, {
        name: "hr",
        pattern: /^([-*]\s?){3}/g,
        action: function action(text, selection) {
          var startIndex = selection.index - text.length;
          setTimeout(function () {
            _this.quill.deleteText(startIndex, text.length);

            _this.quill.insertEmbed(startIndex + 1, "hr", true, Quill.sources.USER);

            _this.quill.insertText(startIndex + 2, "\n", Quill.sources.SILENT);

            _this.quill.setSelection(startIndex + 2, Quill.sources.SILENT);
          }, 0);
        }
      }, {
        name: "asterisk-ul",
        pattern: /^(\*|\+)\s$/g,
        action: function action(_text, selection, _pattern) {
          setTimeout(function () {
            _this.quill.formatLine(selection.index, 1, "list", "unordered");

            _this.quill.deleteText(selection.index - 2, 2);
          }, 0);
        }
      }, {
        name: "image",
        pattern: /(?:!\[(.+?)\])(?:\((.+?)\))/g,
        action: function action(text, selection, pattern) {
          var startIndex = text.search(pattern);
          var matchedText = text.match(pattern)[0]; // const hrefText = text.match(/(?:!\[(.*?)\])/g)[0]

          var hrefLink = text.match(/(?:\((.*?)\))/g)[0];
          var start = selection.index - matchedText.length - 1;

          if (startIndex !== -1) {
            setTimeout(function () {
              _this.quill.deleteText(start, matchedText.length);

              _this.quill.insertEmbed(start, "image", hrefLink.slice(1, hrefLink.length - 1));
            }, 0);
          }
        }
      }, {
        name: "link",
        pattern: /(?:\[(.+?)\])(?:\((.+?)\))/g,
        action: function action(text, selection, pattern) {
          var startIndex = text.search(pattern);
          var matchedText = text.match(pattern)[0];
          var hrefText = text.match(/(?:\[(.*?)\])/g)[0];
          var hrefLink = text.match(/(?:\((.*?)\))/g)[0];
          var start = selection.index - matchedText.length - 1;

          if (startIndex !== -1) {
            setTimeout(function () {
              _this.quill.deleteText(start, matchedText.length);

              _this.quill.insertText(start, hrefText.slice(1, hrefText.length - 1), "link", hrefLink.slice(1, hrefLink.length - 1));
            }, 0);
          }
        }
      }]; // Handler that looks for insert deltas that match specific characters

      this.quill.on("text-change", function (delta, _oldContents, _source) {
        for (var i = 0; i < delta.ops.length; i++) {
          if (delta.ops[i].hasOwnProperty("insert")) {
            if (delta.ops[i].insert === " ") {
              _this.onSpace();
            } else if (delta.ops[i].insert === "\n") {
              _this.onEnter();
            }
          }
        }
      });
    }

    _createClass(MarkdownShortcuts, [{
      key: "isValid",
      value: function isValid(text, tagName) {
        return typeof text !== "undefined" && text && this.ignoreTags.indexOf(tagName) === -1;
      }
    }, {
      key: "onSpace",
      value: function onSpace() {
        var selection = this.quill.getSelection();
        if (!selection) return;

        var _this$quill$getLine = this.quill.getLine(selection.index),
            _this$quill$getLine2 = _slicedToArray(_this$quill$getLine, 2),
            line = _this$quill$getLine2[0],
            offset = _this$quill$getLine2[1];

        var text = line.domNode.textContent;
        var lineStart = selection.index - offset;

        if (this.isValid(text, line.domNode.tagName)) {
          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = this.matches[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var match = _step.value;
              var matchedText = text.match(match.pattern);

              if (matchedText) {
                // We need to replace only matched text not the whole line
                console.log("matched:", match.name, text);
                match.action(text, selection, match.pattern, lineStart);
                return;
              }
            }
          } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion && _iterator.return != null) {
                _iterator.return();
              }
            } finally {
              if (_didIteratorError) {
                throw _iteratorError;
              }
            }
          }
        }
      }
    }, {
      key: "onEnter",
      value: function onEnter() {
        var selection = this.quill.getSelection();
        if (!selection) return;

        var _this$quill$getLine3 = this.quill.getLine(selection.index),
            _this$quill$getLine4 = _slicedToArray(_this$quill$getLine3, 2),
            line = _this$quill$getLine4[0],
            offset = _this$quill$getLine4[1];

        var text = line.domNode.textContent + " ";
        var lineStart = selection.index - offset;
        selection.length = selection.index++;

        if (this.isValid(text, line.domNode.tagName)) {
          var _iteratorNormalCompletion2 = true;
          var _didIteratorError2 = false;
          var _iteratorError2 = undefined;

          try {
            for (var _iterator2 = this.matches[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
              var match = _step2.value;
              var matchedText = text.match(match.pattern);

              if (matchedText) {
                console.log("matched", match.name, text);
                match.action(text, selection, match.pattern, lineStart);
                return;
              }
            }
          } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
                _iterator2.return();
              }
            } finally {
              if (_didIteratorError2) {
                throw _iteratorError2;
              }
            }
          }
        }
      }
    }]);

    return MarkdownShortcuts;
  }(); // module.exports = MarkdownShortcuts;

  /*
   * Quill 1.* cannot next block elements inside <li> including nested <ul>,<ol>.
   * To achieve nested lists it uses flat linear lists with CSS class `ql-indent-\d+` on <li>.
   * Nesting <ul> inside <ol> or vice-versa cause topmost list to break in two adjacent lists.
   *
   * There is the only solution: fix bad HTML after getting it from Quill and break it back before
   * passing to Quill again for editing.
   */
  var mkNode = function mkNode() {
    var tagName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "div";
    return document.createElement(tagName);
  };

  var IS_LI = {
    LI: true,
    li: true
  };

  function wrapContent(node) {
    var tagName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "div";
    var container = mkNode(tagName);

    while (node.firstChild) {
      container.appendChild(node.firstChild);
    }

    node.appendChild(container);
  }

  function nextNode(node) {
    var current = node;

    do {
      current = current.nextSibling;
    } while (current && 1 !== current.nodeType);

    return current;
  }

  function firstNode(node) {
    var current = node.firstChild;

    while (current && 1 !== current.nodeType) {
      current = current.nextSibling;
    }

    return current;
  }

  function lastNode(node) {
    var current = node.lastChild;

    while (current && 1 !== current.nodeType) {
      current = current.previousSibling;
    }

    return current;
  }

  var reIndent = /^ql-indent-(\d+)$/;

  var getItemLevel = function getItemLevel(li) {
    var level = 0;
    Array.from(li.classList).some(function (name) {
      var match = name.match(reIndent);

      if (match) {
        level = Number(match[1]);
        return true;
      }
    });
    return level;
  };

  var removeItemLevel = function removeItemLevel(li) {
    var level = 0;
    Array.from(li.classList).some(function (name) {
      var match = name.match(reIndent);

      if (match) {
        li.classList.remove(name);

        if (!li.classList.length) {
          li.removeAttribute("class");
        }

        level = Number(match[1]);
        return true;
      }
    });
    return level;
  };

  var getListLevel = function getListLevel(list) {
    var li = firstNode(list);
    return li && IS_LI[li.tagName] ? getItemLevel(li) : 0;
  };

  function fixUp(content) {
    var swap = mkNode();
    swap.innerHTML = content; // find all `ul,ol`

    var lists = Array.from(swap.querySelectorAll("ul,ol")); // if none then return content;

    if (!lists.length) {
      return content;
    }

    var changed = false; // check its indent level
    // nest lists and remember if anything was changed

    {
      var prevList = null;
      var prevListLevel = null;
      var prevLastLi = null;
      var prevLastLiLevel = null;
      var stack = [];
      lists.forEach(function (list, listIndex) {
        var curLevel = getListLevel(list);
        var curLastLi = lastNode(list);
        var curLastLiLevel = getItemLevel(curLastLi);

        if (null === prevList) {
          prevList = list;
          prevListLevel = curLevel;
          prevLastLi = curLastLi;
          prevLastLiLevel = curLastLiLevel;
          return;
        }

        while (curLevel < prevLastLiLevel && stack.length) {
          var _stack$pop = stack.pop();

          var _stack$pop2 = _slicedToArray(_stack$pop, 4);

          prevList = _stack$pop2[0];
          prevListLevel = _stack$pop2[1];
          prevLastLi = _stack$pop2[2];
          prevLastLiLevel = _stack$pop2[3];
        }

        if (curLevel > prevLastLiLevel) {
          stack.push([prevList, prevListLevel, prevLastLi, prevLastLiLevel]);

          if (!firstNode(prevLastLi)) {
            wrapContent(prevLastLi);
          }

          prevLastLi.appendChild(list);
          changed = true;
          prevList = list;
          prevListLevel = curLevel;
          prevLastLi = curLastLi;
          prevLastLiLevel = curLastLiLevel;
          return;
        }

        if (list.tagName === prevList.tagName && nextNode(prevList) === list) {
          // merge lists
          while (list.firstChild) {
            prevList.appendChild(list.firstChild);
            changed = true;
          } // remove empty list from DOM


          list.remove(); // remove it from array

          delete lists[listIndex];
          prevLastLi = lastNode(prevList);
          prevLastLiLevel = getItemLevel(prevLastLi);
          return;
        }

        prevList = list;
        prevListLevel = curLevel;
        prevLastLi = curLastLi;
        prevLastLiLevel = curLastLiLevel;
      });
    } // check all its `li`

    lists.forEach(function (list) {
      var li = firstNode(list);
      var baseLevel = removeItemLevel(li);
      var prevLi = li;
      var prevList = list;
      var prevLevel = baseLevel;
      var stack = [];
      var nextLi = nextNode(prevLi);

      while (nextLi) {
        var curLi = nextLi;
        nextLi = nextNode(nextLi);
        var curLevel = removeItemLevel(curLi);

        while (curLevel < prevLevel && curLevel >= baseLevel && stack.length) {
          var _stack$pop3 = stack.pop();

          var _stack$pop4 = _slicedToArray(_stack$pop3, 3);

          prevLi = _stack$pop4[0];
          prevList = _stack$pop4[1];
          prevLevel = _stack$pop4[2];
        }

        if (curLevel > prevLevel) {
          if (!firstNode(prevLi)) {
            wrapContent(prevLi);
          }

          var curList = mkNode(prevList.tagName);
          curList.appendChild(curLi);
          prevLi.appendChild(curList);
          changed = true;
          stack.push([prevLi, prevList, prevLevel]);
          prevLi = curLi;
          prevList = curList;
          prevLevel = curLevel;
        } else {
          if (prevList !== list) {
            changed = true;
            prevList.appendChild(curLi);
          }

          prevLi = curLi;
        }
      }
    }); // if nothing was changed then return content;

    if (!changed) {
      return content;
    }

    return swap.innerHTML;
  }

  //
  var script = {
    name: "VueEditor",
    mixins: [oldApi],
    props: {
      id: {
        type: String,
        default: "quill-container"
      },
      placeholder: {
        type: String,
        default: ""
      },
      value: {
        type: String,
        default: ""
      },
      disabled: {
        type: Boolean
      },
      editorToolbar: {
        type: Array,
        default: function _default() {
          return [];
        }
      },
      editorOptions: {
        type: Object,
        required: false,
        default: function _default() {
          return {};
        }
      },
      useCustomImageHandler: {
        type: Boolean,
        default: false
      },
      useMarkdownShortcuts: {
        type: Boolean,
        default: false
      }
    },
    data: function data() {
      return {
        quill: null
      };
    },
    watch: {
      value: function value(val) {
        if (val != this.quill.root.innerHTML && !this.quill.hasFocus()) {
          this.quill.root.innerHTML = val;
        }
      },
      disabled: function disabled(status) {
        this.quill.enable(!status);
      }
    },
    mounted: function mounted() {
      this.registerCustomModules(Quill);
      this.registerPrototypes();
      this.initializeEditor();
    },
    beforeDestroy: function beforeDestroy() {
      this.quill = null;
      delete this.quill;
    },
    methods: {
      initializeEditor: function initializeEditor() {
        this.setupQuillEditor();
        this.checkForCustomImageHandler();
        this.handleInitialContent();
        this.registerEditorEventListeners();
        this.$emit("ready", this.quill);
      },
      setupQuillEditor: function setupQuillEditor() {
        var editorConfig = {
          debug: false,
          modules: this.setModules(),
          theme: "snow",
          placeholder: this.placeholder ? this.placeholder : "",
          readOnly: this.disabled ? this.disabled : false
        };
        this.prepareEditorConfig(editorConfig);
        this.quill = new Quill(this.$refs.quillContainer, editorConfig);
        this.quill.clipboard.addMatcher(Node.ELEMENT_NODE, function (node, delta) {
          var ops = [];
          delta.ops.forEach(function (op) {
            if (op.insert && typeof op.insert === "string") {
              ops.push({
                insert: op.insert
              });
            }
          });
          delta.ops = ops;
          return delta;
        });
      },
      setModules: function setModules() {
        var modules = {
          toolbar: this.editorToolbar.length ? this.editorToolbar : defaultToolbar
        };
        var Link = Quill.import("formats/link");
        var PROTOCOL_WHITELIST = ["lionparcel", "mailto", "https", "http", "tel"];

        Link.sanitize = function (url) {
          // prefix default protocol.
          var protocol = url.slice(0, url.indexOf(":"));

          if (PROTOCOL_WHITELIST.indexOf(protocol) === -1) {
            url = "http://" + url;
          } // Link._sanitize function


          var anchor = document.createElement("a");
          anchor.href = url;
          protocol = anchor.href.slice(0, anchor.href.indexOf(":"));
          return PROTOCOL_WHITELIST.indexOf(protocol) > -1 ? url : this.SANITIZED_URL;
        };

        Quill.register(Link, true);

        if (this.useMarkdownShortcuts) {
          Quill.register("modules/markdownShortcuts", MarkdownShortcuts, true);
          modules["markdownShortcuts"] = {};
        }

        var DirectionAttribute = Quill.import("attributors/attribute/direction");
        Quill.register(DirectionAttribute, true);
        var AlignClass = Quill.import("attributors/class/align");
        Quill.register(AlignClass, true);
        var BackgroundClass = Quill.import("attributors/class/background");
        Quill.register(BackgroundClass, true);
        var ColorClass = Quill.import("attributors/class/color");
        Quill.register(ColorClass, true);
        var DirectionClass = Quill.import("attributors/class/direction");
        Quill.register(DirectionClass, true);
        var FontClass = Quill.import("attributors/class/font");
        Quill.register(FontClass, true);
        var SizeClass = Quill.import("attributors/class/size");
        Quill.register(SizeClass, true);
        var AlignStyle = Quill.import("attributors/style/align");
        Quill.register(AlignStyle, true);
        var BackgroundStyle = Quill.import("attributors/style/background");
        Quill.register(BackgroundStyle, true);
        var ColorStyle = Quill.import("attributors/style/color");
        Quill.register(ColorStyle, true);
        var DirectionStyle = Quill.import("attributors/style/direction");
        Quill.register(DirectionStyle, true);
        var FontStyle = Quill.import("attributors/style/font");
        Quill.register(FontStyle, true);
        var SizeStyle = Quill.import("attributors/style/size");
        Quill.register(SizeStyle, true);
        return modules;
      },
      prepareEditorConfig: function prepareEditorConfig(editorConfig) {
        if (Object.keys(this.editorOptions).length > 0 && this.editorOptions.constructor === Object) {
          if (this.editorOptions.modules && typeof this.editorOptions.modules.toolbar !== "undefined") {
            // We don't want to merge default toolbar with provided toolbar.
            delete editorConfig.modules.toolbar;
          }

          mergeDeep(editorConfig, this.editorOptions);
        }
      },
      registerPrototypes: function registerPrototypes() {
        Quill.prototype.getHTML = function () {
          return this.container.querySelector(".ql-editor").innerHTML;
        };

        Quill.prototype.getWordCount = function () {
          return this.container.querySelector(".ql-editor").innerText.length;
        };
      },
      registerEditorEventListeners: function registerEditorEventListeners() {
        this.quill.on("text-change", this.handleTextChange);
        this.quill.on("selection-change", this.handleSelectionChange);
        this.listenForEditorEvent("text-change");
        this.listenForEditorEvent("selection-change");
        this.listenForEditorEvent("editor-change");
      },
      listenForEditorEvent: function listenForEditorEvent(type) {
        var _this = this;

        this.quill.on(type, function () {
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }

          _this.$emit.apply(_this, [type].concat(args));
        });
      },
      handleInitialContent: function handleInitialContent() {
        if (this.value) this.quill.root.innerHTML = this.value; // Set initial editor content
      },
      handleSelectionChange: function handleSelectionChange(range, oldRange) {
        if (!range && oldRange) this.$emit("blur", this.quill);else if (range && !oldRange) this.$emit("focus", this.quill);
      },
      handleTextChange: function handleTextChange(delta, oldContents) {
        var editorContent = this.quill.getHTML() === "<p><br></p>" ? "" : this.quill.getHTML();
        this.$emit("input", fixUp(editorContent));
        if (this.useCustomImageHandler) this.handleImageRemoved(delta, oldContents);
      },
      handleImageRemoved: function handleImageRemoved(delta, oldContents) {
        var _this2 = this;

        var currrentContents = this.quill.getContents();
        var deletedContents = currrentContents.diff(oldContents);
        var operations = deletedContents.ops;
        operations.map(function (operation) {
          if (operation.insert && operation.insert.hasOwnProperty("image")) {
            var image = operation.insert.image;

            _this2.$emit("image-removed", image);
          }
        });
      },
      checkForCustomImageHandler: function checkForCustomImageHandler() {
        this.useCustomImageHandler === true ? this.setupCustomImageHandler() : "";
      },
      setupCustomImageHandler: function setupCustomImageHandler() {
        var toolbar = this.quill.getModule("toolbar");
        toolbar.addHandler("image", this.customImageHandler);
      },
      customImageHandler: function customImageHandler(image, callback) {
        this.$refs.fileInput.click();
      },
      emitImageInfo: function emitImageInfo($event) {
        var resetUploader = function resetUploader() {
          var uploader = document.getElementById("file-upload");
          uploader.value = "";
        };

        var file = $event.target.files[0];
        var Editor = this.quill;
        var range = Editor.getSelection();
        var cursorLocation = range.index;
        this.$emit("image-added", file, Editor, cursorLocation, resetUploader);
      }
    }
  };

  function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier
  /* server only */
  , shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
    if (typeof shadowMode !== 'boolean') {
      createInjectorSSR = createInjector;
      createInjector = shadowMode;
      shadowMode = false;
    } // Vue.extend constructor export interop.


    var options = typeof script === 'function' ? script.options : script; // render functions

    if (template && template.render) {
      options.render = template.render;
      options.staticRenderFns = template.staticRenderFns;
      options._compiled = true; // functional template

      if (isFunctionalTemplate) {
        options.functional = true;
      }
    } // scopedId


    if (scopeId) {
      options._scopeId = scopeId;
    }

    var hook;

    if (moduleIdentifier) {
      // server build
      hook = function hook(context) {
        // 2.3 injection
        context = context || // cached call
        this.$vnode && this.$vnode.ssrContext || // stateful
        this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext; // functional
        // 2.2 with runInNewContext: true

        if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
          context = __VUE_SSR_CONTEXT__;
        } // inject component styles


        if (style) {
          style.call(this, createInjectorSSR(context));
        } // register component module identifier for async chunk inference


        if (context && context._registeredComponents) {
          context._registeredComponents.add(moduleIdentifier);
        }
      }; // used by ssr in case component is cached and beforeCreate
      // never gets called


      options._ssrRegister = hook;
    } else if (style) {
      hook = shadowMode ? function () {
        style.call(this, createInjectorShadow(this.$root.$options.shadowRoot));
      } : function (context) {
        style.call(this, createInjector(context));
      };
    }

    if (hook) {
      if (options.functional) {
        // register for functional component in vue file
        var originalRender = options.render;

        options.render = function renderWithStyleInjection(h, context) {
          hook.call(context);
          return originalRender(h, context);
        };
      } else {
        // inject component registration as beforeCreate hook
        var existing = options.beforeCreate;
        options.beforeCreate = existing ? [].concat(existing, hook) : [hook];
      }
    }

    return script;
  }

  var normalizeComponent_1 = normalizeComponent;

  /* script */
  const __vue_script__ = script;
  /* template */
  var __vue_render__ = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"quillWrapper"},[_vm._t("toolbar"),_vm._v(" "),_c('div',{ref:"quillContainer",attrs:{"id":_vm.id}}),_vm._v(" "),(_vm.useCustomImageHandler)?_c('input',{ref:"fileInput",staticStyle:{"display":"none"},attrs:{"id":"file-upload","type":"file","accept":"image/*"},on:{"change":function($event){return _vm.emitImageInfo($event)}}}):_vm._e()],2)};
  var __vue_staticRenderFns__ = [];

    /* style */
    const __vue_inject_styles__ = undefined;
    /* scoped */
    const __vue_scope_id__ = undefined;
    /* module identifier */
    const __vue_module_identifier__ = undefined;
    /* functional template */
    const __vue_is_functional_template__ = false;
    /* style inject */
    
    /* style inject SSR */
    

    
    var VueEditor = normalizeComponent_1(
      { render: __vue_render__, staticRenderFns: __vue_staticRenderFns__ },
      __vue_inject_styles__,
      __vue_script__,
      __vue_scope_id__,
      __vue_is_functional_template__,
      __vue_module_identifier__,
      undefined,
      undefined
    );

  var version = "2.10.2"; // Declare install function executed by Vue.use()

  function install(Vue) {
    if (install.installed) return;
    install.installed = true;
    Vue.component("VueEditor", VueEditor);
  }
  var VPlugin = {
    install: install,
    version: version,
    Quill: Quill,
    VueEditor: VueEditor
  }; // Auto-install when vue is found (eg. in browser via <script> tag)

  var GlobalVue = null;

  if (typeof window !== "undefined") {
    GlobalVue = window.Vue;
  } else if (typeof global !== "undefined") {
    GlobalVue = global.Vue;
  }

  if (GlobalVue) {
    GlobalVue.use(VPlugin);
  }
  /*************************************************/

  exports.Quill = Quill;
  exports.VueEditor = VueEditor;
  exports.default = VPlugin;
  exports.install = install;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
