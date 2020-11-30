<template>
  <div class="quillWrapper">
    <slot name="toolbar"></slot>
    <div
      :id="id"
      ref="quillContainer"
    ></div>
    <input
      v-if="useCustomImageHandler"
      id="file-upload"
      ref="fileInput"
      type="file"
      accept="image/*"
      style="display:none;"
      @change="emitImageInfo($event)"
    />
  </div>
</template>

<script>
import Quill from "quill";
import defaultToolbar from "@/helpers/default-toolbar";
import oldApi from "@/helpers/old-api";
import mergeDeep from "@/helpers/merge-deep";
import MarkdownShortcuts from "@/helpers/markdown-shortcuts";
import { breakDown, fixUp } from "@/helpers/quill-fix-indent";

export default {
  name: "VueEditor",
  mixins: [oldApi],
  props: {
    id: {
      type: String,
      default: "quill-container",
    },
    placeholder: {
      type: String,
      default: "",
    },
    value: {
      type: String,
      default: "",
    },
    disabled: {
      type: Boolean,
    },
    editorToolbar: {
      type: Array,
      default: () => [],
    },
    editorOptions: {
      type: Object,
      required: false,
      default: () => ({}),
    },
    useCustomImageHandler: {
      type: Boolean,
      default: false,
    },
    useMarkdownShortcuts: {
      type: Boolean,
      default: false,
    },
  },

  data: () => ({
    quill: null,
  }),

  watch: {
    value(val) {
      if (val != this.quill.root.innerHTML && !this.quill.hasFocus()) {
        this.quill.root.innerHTML = breakDown(val);
      }
    },
    disabled(status) {
      this.quill.enable(!status);
    },
  },

  mounted() {
    this.registerCustomModules(Quill);
    this.registerPrototypes();
    this.initializeEditor();
  },

  beforeDestroy() {
    this.quill = null;
    delete this.quill;
  },

  methods: {
    initializeEditor() {
      this.setupQuillEditor();
      this.checkForCustomImageHandler();
      this.handleInitialContent();
      this.registerEditorEventListeners();
      this.$emit("ready", this.quill);
    },

    setupQuillEditor() {
      let editorConfig = {
        debug: false,
        modules: this.setModules(),
        theme: "snow",
        placeholder: this.placeholder ? this.placeholder : "",
        readOnly: this.disabled ? this.disabled : false,
      };

      this.prepareEditorConfig(editorConfig);
      this.quill = new Quill(this.$refs.quillContainer, editorConfig);
      this.quill.clipboard.addMatcher(Node.ELEMENT_NODE, (node, delta) => {
        let ops = [];
        delta.ops.forEach((op) => {
          if (op.insert && typeof op.insert === "string") {
            ops.push({
              insert: op.insert,
            });
          }
        });
        delta.ops = ops;
        return delta;
      });
    },

    setModules() {
      let modules = {
        toolbar: this.editorToolbar.length
          ? this.editorToolbar
          : defaultToolbar,
      };

      const Link = Quill.import("formats/link");
      const PROTOCOL_WHITELIST = [
        "lionparcel",
        "mailto",
        "https",
        "http",
        "tel",
      ];
      Link.sanitize = function (url) {
        // prefix default protocol.
        let protocol = url.slice(0, url.indexOf(":"));
        if (PROTOCOL_WHITELIST.indexOf(protocol) === -1) {
          url = "http://" + url;
        }
        // Link._sanitize function
        let anchor = document.createElement("a");
        anchor.href = url;
        protocol = anchor.href.slice(0, anchor.href.indexOf(":"));
        return PROTOCOL_WHITELIST.indexOf(protocol) > -1
          ? url
          : this.SANITIZED_URL;
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

    prepareEditorConfig(editorConfig) {
      if (
        Object.keys(this.editorOptions).length > 0 &&
        this.editorOptions.constructor === Object
      ) {
        if (
          this.editorOptions.modules &&
          typeof this.editorOptions.modules.toolbar !== "undefined"
        ) {
          // We don't want to merge default toolbar with provided toolbar.
          delete editorConfig.modules.toolbar;
        }

        mergeDeep(editorConfig, this.editorOptions);
      }
    },

    registerPrototypes() {
      Quill.prototype.getHTML = function () {
        return this.container.querySelector(".ql-editor").innerHTML;
      };
      Quill.prototype.getWordCount = function () {
        return this.container.querySelector(".ql-editor").innerText.length;
      };
    },

    registerEditorEventListeners() {
      this.quill.on("text-change", this.handleTextChange);
      this.quill.on("selection-change", this.handleSelectionChange);
      this.listenForEditorEvent("text-change");
      this.listenForEditorEvent("selection-change");
      this.listenForEditorEvent("editor-change");
    },

    listenForEditorEvent(type) {
      this.quill.on(type, (...args) => {
        this.$emit(type, ...args);
      });
    },

    handleInitialContent() {
      if (this.value) this.quill.root.innerHTML = breakDown(this.value); // Set initial editor content
    },

    handleSelectionChange(range, oldRange) {
      if (!range && oldRange) this.$emit("blur", this.quill);
      else if (range && !oldRange) this.$emit("focus", this.quill);
    },

    handleTextChange(delta, oldContents) {
      let editorContent =
        this.quill.getHTML() === "<p><br></p>" ? "" : this.quill.getHTML();
      this.$emit("input", fixUp(editorContent));

      if (this.useCustomImageHandler)
        this.handleImageRemoved(delta, oldContents);
    },

    handleImageRemoved(delta, oldContents) {
      const currrentContents = this.quill.getContents();
      const deletedContents = currrentContents.diff(oldContents);
      const operations = deletedContents.ops;

      operations.map((operation) => {
        if (operation.insert && operation.insert.hasOwnProperty("image")) {
          const { image } = operation.insert;
          this.$emit("image-removed", image);
        }
      });
    },
    checkForCustomImageHandler() {
      this.useCustomImageHandler === true ? this.setupCustomImageHandler() : "";
    },

    setupCustomImageHandler() {
      let toolbar = this.quill.getModule("toolbar");
      toolbar.addHandler("image", this.customImageHandler);
    },

    customImageHandler(image, callback) {
      this.$refs.fileInput.click();
    },

    emitImageInfo($event) {
      const resetUploader = function () {
        var uploader = document.getElementById("file-upload");
        uploader.value = "";
      };
      let file = $event.target.files[0];
      let Editor = this.quill;
      let range = Editor.getSelection();
      let cursorLocation = range.index;
      this.$emit("image-added", file, Editor, cursorLocation, resetUploader);
    },
  },
};
</script>

<style src="quill/dist/quill.snow.css"></style>
<style src="../assets/vue2-editor.scss" lang="scss"></style>
