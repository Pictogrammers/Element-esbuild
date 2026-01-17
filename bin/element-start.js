#!/usr/bin/env node
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __commonJS = (cb, mod) => function __require2() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/esbuild/lib/main.js
var require_main = __commonJS({
  "node_modules/esbuild/lib/main.js"(exports, module) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp2 = Object.prototype.hasOwnProperty;
    var __export = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps2 = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp2.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc2(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps2(__defProp2({}, "__esModule", { value: true }), mod);
    var node_exports = {};
    __export(node_exports, {
      analyzeMetafile: () => analyzeMetafile,
      analyzeMetafileSync: () => analyzeMetafileSync,
      build: () => build,
      buildSync: () => buildSync,
      context: () => context2,
      default: () => node_default,
      formatMessages: () => formatMessages,
      formatMessagesSync: () => formatMessagesSync,
      initialize: () => initialize,
      stop: () => stop,
      transform: () => transform,
      transformSync: () => transformSync,
      version: () => version
    });
    module.exports = __toCommonJS(node_exports);
    function encodePacket(packet) {
      let visit = (value) => {
        if (value === null) {
          bb.write8(0);
        } else if (typeof value === "boolean") {
          bb.write8(1);
          bb.write8(+value);
        } else if (typeof value === "number") {
          bb.write8(2);
          bb.write32(value | 0);
        } else if (typeof value === "string") {
          bb.write8(3);
          bb.write(encodeUTF8(value));
        } else if (value instanceof Uint8Array) {
          bb.write8(4);
          bb.write(value);
        } else if (value instanceof Array) {
          bb.write8(5);
          bb.write32(value.length);
          for (let item of value) {
            visit(item);
          }
        } else {
          let keys = Object.keys(value);
          bb.write8(6);
          bb.write32(keys.length);
          for (let key of keys) {
            bb.write(encodeUTF8(key));
            visit(value[key]);
          }
        }
      };
      let bb = new ByteBuffer();
      bb.write32(0);
      bb.write32(packet.id << 1 | +!packet.isRequest);
      visit(packet.value);
      writeUInt32LE(bb.buf, bb.len - 4, 0);
      return bb.buf.subarray(0, bb.len);
    }
    function decodePacket(bytes) {
      let visit = () => {
        switch (bb.read8()) {
          case 0:
            return null;
          case 1:
            return !!bb.read8();
          case 2:
            return bb.read32();
          case 3:
            return decodeUTF8(bb.read());
          case 4:
            return bb.read();
          case 5: {
            let count = bb.read32();
            let value2 = [];
            for (let i = 0; i < count; i++) {
              value2.push(visit());
            }
            return value2;
          }
          case 6: {
            let count = bb.read32();
            let value2 = {};
            for (let i = 0; i < count; i++) {
              value2[decodeUTF8(bb.read())] = visit();
            }
            return value2;
          }
          default:
            throw new Error("Invalid packet");
        }
      };
      let bb = new ByteBuffer(bytes);
      let id = bb.read32();
      let isRequest = (id & 1) === 0;
      id >>>= 1;
      let value = visit();
      if (bb.ptr !== bytes.length) {
        throw new Error("Invalid packet");
      }
      return { id, isRequest, value };
    }
    var ByteBuffer = class {
      constructor(buf = new Uint8Array(1024)) {
        this.buf = buf;
        this.len = 0;
        this.ptr = 0;
      }
      _write(delta) {
        if (this.len + delta > this.buf.length) {
          let clone = new Uint8Array((this.len + delta) * 2);
          clone.set(this.buf);
          this.buf = clone;
        }
        this.len += delta;
        return this.len - delta;
      }
      write8(value) {
        let offset = this._write(1);
        this.buf[offset] = value;
      }
      write32(value) {
        let offset = this._write(4);
        writeUInt32LE(this.buf, value, offset);
      }
      write(bytes) {
        let offset = this._write(4 + bytes.length);
        writeUInt32LE(this.buf, bytes.length, offset);
        this.buf.set(bytes, offset + 4);
      }
      _read(delta) {
        if (this.ptr + delta > this.buf.length) {
          throw new Error("Invalid packet");
        }
        this.ptr += delta;
        return this.ptr - delta;
      }
      read8() {
        return this.buf[this._read(1)];
      }
      read32() {
        return readUInt32LE(this.buf, this._read(4));
      }
      read() {
        let length = this.read32();
        let bytes = new Uint8Array(length);
        let ptr = this._read(bytes.length);
        bytes.set(this.buf.subarray(ptr, ptr + length));
        return bytes;
      }
    };
    var encodeUTF8;
    var decodeUTF8;
    var encodeInvariant;
    if (typeof TextEncoder !== "undefined" && typeof TextDecoder !== "undefined") {
      let encoder = new TextEncoder();
      let decoder = new TextDecoder();
      encodeUTF8 = (text) => encoder.encode(text);
      decodeUTF8 = (bytes) => decoder.decode(bytes);
      encodeInvariant = 'new TextEncoder().encode("")';
    } else if (typeof Buffer !== "undefined") {
      encodeUTF8 = (text) => Buffer.from(text);
      decodeUTF8 = (bytes) => {
        let { buffer, byteOffset, byteLength } = bytes;
        return Buffer.from(buffer, byteOffset, byteLength).toString();
      };
      encodeInvariant = 'Buffer.from("")';
    } else {
      throw new Error("No UTF-8 codec found");
    }
    if (!(encodeUTF8("") instanceof Uint8Array))
      throw new Error(`Invariant violation: "${encodeInvariant} instanceof Uint8Array" is incorrectly false

This indicates that your JavaScript environment is broken. You cannot use
esbuild in this environment because esbuild relies on this invariant. This
is not a problem with esbuild. You need to fix your environment instead.
`);
    function readUInt32LE(buffer, offset) {
      return buffer[offset++] | buffer[offset++] << 8 | buffer[offset++] << 16 | buffer[offset++] << 24;
    }
    function writeUInt32LE(buffer, value, offset) {
      buffer[offset++] = value;
      buffer[offset++] = value >> 8;
      buffer[offset++] = value >> 16;
      buffer[offset++] = value >> 24;
    }
    var quote = JSON.stringify;
    var buildLogLevelDefault = "warning";
    var transformLogLevelDefault = "silent";
    function validateAndJoinStringArray(values, what) {
      const toJoin = [];
      for (const value of values) {
        validateStringValue(value, what);
        if (value.indexOf(",") >= 0) throw new Error(`Invalid ${what}: ${value}`);
        toJoin.push(value);
      }
      return toJoin.join(",");
    }
    var canBeAnything = () => null;
    var mustBeBoolean = (value) => typeof value === "boolean" ? null : "a boolean";
    var mustBeString = (value) => typeof value === "string" ? null : "a string";
    var mustBeRegExp = (value) => value instanceof RegExp ? null : "a RegExp object";
    var mustBeInteger = (value) => typeof value === "number" && value === (value | 0) ? null : "an integer";
    var mustBeValidPortNumber = (value) => typeof value === "number" && value === (value | 0) && value >= 0 && value <= 65535 ? null : "a valid port number";
    var mustBeFunction = (value) => typeof value === "function" ? null : "a function";
    var mustBeArray = (value) => Array.isArray(value) ? null : "an array";
    var mustBeArrayOfStrings = (value) => Array.isArray(value) && value.every((x) => typeof x === "string") ? null : "an array of strings";
    var mustBeObject = (value) => typeof value === "object" && value !== null && !Array.isArray(value) ? null : "an object";
    var mustBeEntryPoints = (value) => typeof value === "object" && value !== null ? null : "an array or an object";
    var mustBeWebAssemblyModule = (value) => value instanceof WebAssembly.Module ? null : "a WebAssembly.Module";
    var mustBeObjectOrNull = (value) => typeof value === "object" && !Array.isArray(value) ? null : "an object or null";
    var mustBeStringOrBoolean = (value) => typeof value === "string" || typeof value === "boolean" ? null : "a string or a boolean";
    var mustBeStringOrObject = (value) => typeof value === "string" || typeof value === "object" && value !== null && !Array.isArray(value) ? null : "a string or an object";
    var mustBeStringOrArrayOfStrings = (value) => typeof value === "string" || Array.isArray(value) && value.every((x) => typeof x === "string") ? null : "a string or an array of strings";
    var mustBeStringOrUint8Array = (value) => typeof value === "string" || value instanceof Uint8Array ? null : "a string or a Uint8Array";
    var mustBeStringOrURL = (value) => typeof value === "string" || value instanceof URL ? null : "a string or a URL";
    function getFlag(object, keys, key, mustBeFn) {
      let value = object[key];
      keys[key + ""] = true;
      if (value === void 0) return void 0;
      let mustBe = mustBeFn(value);
      if (mustBe !== null) throw new Error(`${quote(key)} must be ${mustBe}`);
      return value;
    }
    function checkForInvalidFlags(object, keys, where) {
      for (let key in object) {
        if (!(key in keys)) {
          throw new Error(`Invalid option ${where}: ${quote(key)}`);
        }
      }
    }
    function validateInitializeOptions(options) {
      let keys = /* @__PURE__ */ Object.create(null);
      let wasmURL = getFlag(options, keys, "wasmURL", mustBeStringOrURL);
      let wasmModule = getFlag(options, keys, "wasmModule", mustBeWebAssemblyModule);
      let worker = getFlag(options, keys, "worker", mustBeBoolean);
      checkForInvalidFlags(options, keys, "in initialize() call");
      return {
        wasmURL,
        wasmModule,
        worker
      };
    }
    function validateMangleCache(mangleCache) {
      let validated;
      if (mangleCache !== void 0) {
        validated = /* @__PURE__ */ Object.create(null);
        for (let key in mangleCache) {
          let value = mangleCache[key];
          if (typeof value === "string" || value === false) {
            validated[key] = value;
          } else {
            throw new Error(`Expected ${quote(key)} in mangle cache to map to either a string or false`);
          }
        }
      }
      return validated;
    }
    function pushLogFlags(flags, options, keys, isTTY2, logLevelDefault) {
      let color = getFlag(options, keys, "color", mustBeBoolean);
      let logLevel = getFlag(options, keys, "logLevel", mustBeString);
      let logLimit = getFlag(options, keys, "logLimit", mustBeInteger);
      if (color !== void 0) flags.push(`--color=${color}`);
      else if (isTTY2) flags.push(`--color=true`);
      flags.push(`--log-level=${logLevel || logLevelDefault}`);
      flags.push(`--log-limit=${logLimit || 0}`);
    }
    function validateStringValue(value, what, key) {
      if (typeof value !== "string") {
        throw new Error(`Expected value for ${what}${key !== void 0 ? " " + quote(key) : ""} to be a string, got ${typeof value} instead`);
      }
      return value;
    }
    function pushCommonFlags(flags, options, keys) {
      let legalComments = getFlag(options, keys, "legalComments", mustBeString);
      let sourceRoot = getFlag(options, keys, "sourceRoot", mustBeString);
      let sourcesContent = getFlag(options, keys, "sourcesContent", mustBeBoolean);
      let target = getFlag(options, keys, "target", mustBeStringOrArrayOfStrings);
      let format = getFlag(options, keys, "format", mustBeString);
      let globalName = getFlag(options, keys, "globalName", mustBeString);
      let mangleProps = getFlag(options, keys, "mangleProps", mustBeRegExp);
      let reserveProps = getFlag(options, keys, "reserveProps", mustBeRegExp);
      let mangleQuoted = getFlag(options, keys, "mangleQuoted", mustBeBoolean);
      let minify = getFlag(options, keys, "minify", mustBeBoolean);
      let minifySyntax = getFlag(options, keys, "minifySyntax", mustBeBoolean);
      let minifyWhitespace = getFlag(options, keys, "minifyWhitespace", mustBeBoolean);
      let minifyIdentifiers = getFlag(options, keys, "minifyIdentifiers", mustBeBoolean);
      let lineLimit = getFlag(options, keys, "lineLimit", mustBeInteger);
      let drop = getFlag(options, keys, "drop", mustBeArrayOfStrings);
      let dropLabels = getFlag(options, keys, "dropLabels", mustBeArrayOfStrings);
      let charset = getFlag(options, keys, "charset", mustBeString);
      let treeShaking = getFlag(options, keys, "treeShaking", mustBeBoolean);
      let ignoreAnnotations = getFlag(options, keys, "ignoreAnnotations", mustBeBoolean);
      let jsx = getFlag(options, keys, "jsx", mustBeString);
      let jsxFactory = getFlag(options, keys, "jsxFactory", mustBeString);
      let jsxFragment = getFlag(options, keys, "jsxFragment", mustBeString);
      let jsxImportSource = getFlag(options, keys, "jsxImportSource", mustBeString);
      let jsxDev = getFlag(options, keys, "jsxDev", mustBeBoolean);
      let jsxSideEffects = getFlag(options, keys, "jsxSideEffects", mustBeBoolean);
      let define = getFlag(options, keys, "define", mustBeObject);
      let logOverride = getFlag(options, keys, "logOverride", mustBeObject);
      let supported = getFlag(options, keys, "supported", mustBeObject);
      let pure = getFlag(options, keys, "pure", mustBeArrayOfStrings);
      let keepNames = getFlag(options, keys, "keepNames", mustBeBoolean);
      let platform = getFlag(options, keys, "platform", mustBeString);
      let tsconfigRaw = getFlag(options, keys, "tsconfigRaw", mustBeStringOrObject);
      let absPaths = getFlag(options, keys, "absPaths", mustBeArrayOfStrings);
      if (legalComments) flags.push(`--legal-comments=${legalComments}`);
      if (sourceRoot !== void 0) flags.push(`--source-root=${sourceRoot}`);
      if (sourcesContent !== void 0) flags.push(`--sources-content=${sourcesContent}`);
      if (target) flags.push(`--target=${validateAndJoinStringArray(Array.isArray(target) ? target : [target], "target")}`);
      if (format) flags.push(`--format=${format}`);
      if (globalName) flags.push(`--global-name=${globalName}`);
      if (platform) flags.push(`--platform=${platform}`);
      if (tsconfigRaw) flags.push(`--tsconfig-raw=${typeof tsconfigRaw === "string" ? tsconfigRaw : JSON.stringify(tsconfigRaw)}`);
      if (minify) flags.push("--minify");
      if (minifySyntax) flags.push("--minify-syntax");
      if (minifyWhitespace) flags.push("--minify-whitespace");
      if (minifyIdentifiers) flags.push("--minify-identifiers");
      if (lineLimit) flags.push(`--line-limit=${lineLimit}`);
      if (charset) flags.push(`--charset=${charset}`);
      if (treeShaking !== void 0) flags.push(`--tree-shaking=${treeShaking}`);
      if (ignoreAnnotations) flags.push(`--ignore-annotations`);
      if (drop) for (let what of drop) flags.push(`--drop:${validateStringValue(what, "drop")}`);
      if (dropLabels) flags.push(`--drop-labels=${validateAndJoinStringArray(dropLabels, "drop label")}`);
      if (absPaths) flags.push(`--abs-paths=${validateAndJoinStringArray(absPaths, "abs paths")}`);
      if (mangleProps) flags.push(`--mangle-props=${jsRegExpToGoRegExp(mangleProps)}`);
      if (reserveProps) flags.push(`--reserve-props=${jsRegExpToGoRegExp(reserveProps)}`);
      if (mangleQuoted !== void 0) flags.push(`--mangle-quoted=${mangleQuoted}`);
      if (jsx) flags.push(`--jsx=${jsx}`);
      if (jsxFactory) flags.push(`--jsx-factory=${jsxFactory}`);
      if (jsxFragment) flags.push(`--jsx-fragment=${jsxFragment}`);
      if (jsxImportSource) flags.push(`--jsx-import-source=${jsxImportSource}`);
      if (jsxDev) flags.push(`--jsx-dev`);
      if (jsxSideEffects) flags.push(`--jsx-side-effects`);
      if (define) {
        for (let key in define) {
          if (key.indexOf("=") >= 0) throw new Error(`Invalid define: ${key}`);
          flags.push(`--define:${key}=${validateStringValue(define[key], "define", key)}`);
        }
      }
      if (logOverride) {
        for (let key in logOverride) {
          if (key.indexOf("=") >= 0) throw new Error(`Invalid log override: ${key}`);
          flags.push(`--log-override:${key}=${validateStringValue(logOverride[key], "log override", key)}`);
        }
      }
      if (supported) {
        for (let key in supported) {
          if (key.indexOf("=") >= 0) throw new Error(`Invalid supported: ${key}`);
          const value = supported[key];
          if (typeof value !== "boolean") throw new Error(`Expected value for supported ${quote(key)} to be a boolean, got ${typeof value} instead`);
          flags.push(`--supported:${key}=${value}`);
        }
      }
      if (pure) for (let fn of pure) flags.push(`--pure:${validateStringValue(fn, "pure")}`);
      if (keepNames) flags.push(`--keep-names`);
    }
    function flagsForBuildOptions(callName, options, isTTY2, logLevelDefault, writeDefault) {
      var _a2;
      let flags = [];
      let entries = [];
      let keys = /* @__PURE__ */ Object.create(null);
      let stdinContents = null;
      let stdinResolveDir = null;
      pushLogFlags(flags, options, keys, isTTY2, logLevelDefault);
      pushCommonFlags(flags, options, keys);
      let sourcemap = getFlag(options, keys, "sourcemap", mustBeStringOrBoolean);
      let bundle = getFlag(options, keys, "bundle", mustBeBoolean);
      let splitting = getFlag(options, keys, "splitting", mustBeBoolean);
      let preserveSymlinks = getFlag(options, keys, "preserveSymlinks", mustBeBoolean);
      let metafile = getFlag(options, keys, "metafile", mustBeBoolean);
      let outfile = getFlag(options, keys, "outfile", mustBeString);
      let outdir = getFlag(options, keys, "outdir", mustBeString);
      let outbase = getFlag(options, keys, "outbase", mustBeString);
      let tsconfig = getFlag(options, keys, "tsconfig", mustBeString);
      let resolveExtensions = getFlag(options, keys, "resolveExtensions", mustBeArrayOfStrings);
      let nodePathsInput = getFlag(options, keys, "nodePaths", mustBeArrayOfStrings);
      let mainFields = getFlag(options, keys, "mainFields", mustBeArrayOfStrings);
      let conditions = getFlag(options, keys, "conditions", mustBeArrayOfStrings);
      let external = getFlag(options, keys, "external", mustBeArrayOfStrings);
      let packages = getFlag(options, keys, "packages", mustBeString);
      let alias = getFlag(options, keys, "alias", mustBeObject);
      let loader = getFlag(options, keys, "loader", mustBeObject);
      let outExtension = getFlag(options, keys, "outExtension", mustBeObject);
      let publicPath = getFlag(options, keys, "publicPath", mustBeString);
      let entryNames = getFlag(options, keys, "entryNames", mustBeString);
      let chunkNames = getFlag(options, keys, "chunkNames", mustBeString);
      let assetNames = getFlag(options, keys, "assetNames", mustBeString);
      let inject = getFlag(options, keys, "inject", mustBeArrayOfStrings);
      let banner = getFlag(options, keys, "banner", mustBeObject);
      let footer = getFlag(options, keys, "footer", mustBeObject);
      let entryPoints2 = getFlag(options, keys, "entryPoints", mustBeEntryPoints);
      let absWorkingDir = getFlag(options, keys, "absWorkingDir", mustBeString);
      let stdin = getFlag(options, keys, "stdin", mustBeObject);
      let write = (_a2 = getFlag(options, keys, "write", mustBeBoolean)) != null ? _a2 : writeDefault;
      let allowOverwrite = getFlag(options, keys, "allowOverwrite", mustBeBoolean);
      let mangleCache = getFlag(options, keys, "mangleCache", mustBeObject);
      keys.plugins = true;
      checkForInvalidFlags(options, keys, `in ${callName}() call`);
      if (sourcemap) flags.push(`--sourcemap${sourcemap === true ? "" : `=${sourcemap}`}`);
      if (bundle) flags.push("--bundle");
      if (allowOverwrite) flags.push("--allow-overwrite");
      if (splitting) flags.push("--splitting");
      if (preserveSymlinks) flags.push("--preserve-symlinks");
      if (metafile) flags.push(`--metafile`);
      if (outfile) flags.push(`--outfile=${outfile}`);
      if (outdir) flags.push(`--outdir=${outdir}`);
      if (outbase) flags.push(`--outbase=${outbase}`);
      if (tsconfig) flags.push(`--tsconfig=${tsconfig}`);
      if (packages) flags.push(`--packages=${packages}`);
      if (resolveExtensions) flags.push(`--resolve-extensions=${validateAndJoinStringArray(resolveExtensions, "resolve extension")}`);
      if (publicPath) flags.push(`--public-path=${publicPath}`);
      if (entryNames) flags.push(`--entry-names=${entryNames}`);
      if (chunkNames) flags.push(`--chunk-names=${chunkNames}`);
      if (assetNames) flags.push(`--asset-names=${assetNames}`);
      if (mainFields) flags.push(`--main-fields=${validateAndJoinStringArray(mainFields, "main field")}`);
      if (conditions) flags.push(`--conditions=${validateAndJoinStringArray(conditions, "condition")}`);
      if (external) for (let name of external) flags.push(`--external:${validateStringValue(name, "external")}`);
      if (alias) {
        for (let old in alias) {
          if (old.indexOf("=") >= 0) throw new Error(`Invalid package name in alias: ${old}`);
          flags.push(`--alias:${old}=${validateStringValue(alias[old], "alias", old)}`);
        }
      }
      if (banner) {
        for (let type in banner) {
          if (type.indexOf("=") >= 0) throw new Error(`Invalid banner file type: ${type}`);
          flags.push(`--banner:${type}=${validateStringValue(banner[type], "banner", type)}`);
        }
      }
      if (footer) {
        for (let type in footer) {
          if (type.indexOf("=") >= 0) throw new Error(`Invalid footer file type: ${type}`);
          flags.push(`--footer:${type}=${validateStringValue(footer[type], "footer", type)}`);
        }
      }
      if (inject) for (let path3 of inject) flags.push(`--inject:${validateStringValue(path3, "inject")}`);
      if (loader) {
        for (let ext in loader) {
          if (ext.indexOf("=") >= 0) throw new Error(`Invalid loader extension: ${ext}`);
          flags.push(`--loader:${ext}=${validateStringValue(loader[ext], "loader", ext)}`);
        }
      }
      if (outExtension) {
        for (let ext in outExtension) {
          if (ext.indexOf("=") >= 0) throw new Error(`Invalid out extension: ${ext}`);
          flags.push(`--out-extension:${ext}=${validateStringValue(outExtension[ext], "out extension", ext)}`);
        }
      }
      if (entryPoints2) {
        if (Array.isArray(entryPoints2)) {
          for (let i = 0, n = entryPoints2.length; i < n; i++) {
            let entryPoint = entryPoints2[i];
            if (typeof entryPoint === "object" && entryPoint !== null) {
              let entryPointKeys = /* @__PURE__ */ Object.create(null);
              let input = getFlag(entryPoint, entryPointKeys, "in", mustBeString);
              let output = getFlag(entryPoint, entryPointKeys, "out", mustBeString);
              checkForInvalidFlags(entryPoint, entryPointKeys, "in entry point at index " + i);
              if (input === void 0) throw new Error('Missing property "in" for entry point at index ' + i);
              if (output === void 0) throw new Error('Missing property "out" for entry point at index ' + i);
              entries.push([output, input]);
            } else {
              entries.push(["", validateStringValue(entryPoint, "entry point at index " + i)]);
            }
          }
        } else {
          for (let key in entryPoints2) {
            entries.push([key, validateStringValue(entryPoints2[key], "entry point", key)]);
          }
        }
      }
      if (stdin) {
        let stdinKeys = /* @__PURE__ */ Object.create(null);
        let contents = getFlag(stdin, stdinKeys, "contents", mustBeStringOrUint8Array);
        let resolveDir = getFlag(stdin, stdinKeys, "resolveDir", mustBeString);
        let sourcefile = getFlag(stdin, stdinKeys, "sourcefile", mustBeString);
        let loader2 = getFlag(stdin, stdinKeys, "loader", mustBeString);
        checkForInvalidFlags(stdin, stdinKeys, 'in "stdin" object');
        if (sourcefile) flags.push(`--sourcefile=${sourcefile}`);
        if (loader2) flags.push(`--loader=${loader2}`);
        if (resolveDir) stdinResolveDir = resolveDir;
        if (typeof contents === "string") stdinContents = encodeUTF8(contents);
        else if (contents instanceof Uint8Array) stdinContents = contents;
      }
      let nodePaths = [];
      if (nodePathsInput) {
        for (let value of nodePathsInput) {
          value += "";
          nodePaths.push(value);
        }
      }
      return {
        entries,
        flags,
        write,
        stdinContents,
        stdinResolveDir,
        absWorkingDir,
        nodePaths,
        mangleCache: validateMangleCache(mangleCache)
      };
    }
    function flagsForTransformOptions(callName, options, isTTY2, logLevelDefault) {
      let flags = [];
      let keys = /* @__PURE__ */ Object.create(null);
      pushLogFlags(flags, options, keys, isTTY2, logLevelDefault);
      pushCommonFlags(flags, options, keys);
      let sourcemap = getFlag(options, keys, "sourcemap", mustBeStringOrBoolean);
      let sourcefile = getFlag(options, keys, "sourcefile", mustBeString);
      let loader = getFlag(options, keys, "loader", mustBeString);
      let banner = getFlag(options, keys, "banner", mustBeString);
      let footer = getFlag(options, keys, "footer", mustBeString);
      let mangleCache = getFlag(options, keys, "mangleCache", mustBeObject);
      checkForInvalidFlags(options, keys, `in ${callName}() call`);
      if (sourcemap) flags.push(`--sourcemap=${sourcemap === true ? "external" : sourcemap}`);
      if (sourcefile) flags.push(`--sourcefile=${sourcefile}`);
      if (loader) flags.push(`--loader=${loader}`);
      if (banner) flags.push(`--banner=${banner}`);
      if (footer) flags.push(`--footer=${footer}`);
      return {
        flags,
        mangleCache: validateMangleCache(mangleCache)
      };
    }
    function createChannel(streamIn) {
      const requestCallbacksByKey = {};
      const closeData = { didClose: false, reason: "" };
      let responseCallbacks = {};
      let nextRequestID = 0;
      let nextBuildKey = 0;
      let stdout = new Uint8Array(16 * 1024);
      let stdoutUsed = 0;
      let readFromStdout = (chunk) => {
        let limit = stdoutUsed + chunk.length;
        if (limit > stdout.length) {
          let swap = new Uint8Array(limit * 2);
          swap.set(stdout);
          stdout = swap;
        }
        stdout.set(chunk, stdoutUsed);
        stdoutUsed += chunk.length;
        let offset = 0;
        while (offset + 4 <= stdoutUsed) {
          let length = readUInt32LE(stdout, offset);
          if (offset + 4 + length > stdoutUsed) {
            break;
          }
          offset += 4;
          handleIncomingPacket(stdout.subarray(offset, offset + length));
          offset += length;
        }
        if (offset > 0) {
          stdout.copyWithin(0, offset, stdoutUsed);
          stdoutUsed -= offset;
        }
      };
      let afterClose = (error) => {
        closeData.didClose = true;
        if (error) closeData.reason = ": " + (error.message || error);
        const text = "The service was stopped" + closeData.reason;
        for (let id in responseCallbacks) {
          responseCallbacks[id](text, null);
        }
        responseCallbacks = {};
      };
      let sendRequest = (refs, value, callback) => {
        if (closeData.didClose) return callback("The service is no longer running" + closeData.reason, null);
        let id = nextRequestID++;
        responseCallbacks[id] = (error, response) => {
          try {
            callback(error, response);
          } finally {
            if (refs) refs.unref();
          }
        };
        if (refs) refs.ref();
        streamIn.writeToStdin(encodePacket({ id, isRequest: true, value }));
      };
      let sendResponse = (id, value) => {
        if (closeData.didClose) throw new Error("The service is no longer running" + closeData.reason);
        streamIn.writeToStdin(encodePacket({ id, isRequest: false, value }));
      };
      let handleRequest = async (id, request) => {
        try {
          if (request.command === "ping") {
            sendResponse(id, {});
            return;
          }
          if (typeof request.key === "number") {
            const requestCallbacks = requestCallbacksByKey[request.key];
            if (!requestCallbacks) {
              return;
            }
            const callback = requestCallbacks[request.command];
            if (callback) {
              await callback(id, request);
              return;
            }
          }
          throw new Error(`Invalid command: ` + request.command);
        } catch (e) {
          const errors = [extractErrorMessageV8(e, streamIn, null, void 0, "")];
          try {
            sendResponse(id, { errors });
          } catch {
          }
        }
      };
      let isFirstPacket = true;
      let handleIncomingPacket = (bytes) => {
        if (isFirstPacket) {
          isFirstPacket = false;
          let binaryVersion = String.fromCharCode(...bytes);
          if (binaryVersion !== "0.27.2") {
            throw new Error(`Cannot start service: Host version "${"0.27.2"}" does not match binary version ${quote(binaryVersion)}`);
          }
          return;
        }
        let packet = decodePacket(bytes);
        if (packet.isRequest) {
          handleRequest(packet.id, packet.value);
        } else {
          let callback = responseCallbacks[packet.id];
          delete responseCallbacks[packet.id];
          if (packet.value.error) callback(packet.value.error, {});
          else callback(null, packet.value);
        }
      };
      let buildOrContext = ({ callName, refs, options, isTTY: isTTY2, defaultWD: defaultWD2, callback }) => {
        let refCount = 0;
        const buildKey = nextBuildKey++;
        const requestCallbacks = {};
        const buildRefs = {
          ref() {
            if (++refCount === 1) {
              if (refs) refs.ref();
            }
          },
          unref() {
            if (--refCount === 0) {
              delete requestCallbacksByKey[buildKey];
              if (refs) refs.unref();
            }
          }
        };
        requestCallbacksByKey[buildKey] = requestCallbacks;
        buildRefs.ref();
        buildOrContextImpl(
          callName,
          buildKey,
          sendRequest,
          sendResponse,
          buildRefs,
          streamIn,
          requestCallbacks,
          options,
          isTTY2,
          defaultWD2,
          (err, res) => {
            try {
              callback(err, res);
            } finally {
              buildRefs.unref();
            }
          }
        );
      };
      let transform2 = ({ callName, refs, input, options, isTTY: isTTY2, fs: fs3, callback }) => {
        const details = createObjectStash();
        let start = (inputPath) => {
          try {
            if (typeof input !== "string" && !(input instanceof Uint8Array))
              throw new Error('The input to "transform" must be a string or a Uint8Array');
            let {
              flags,
              mangleCache
            } = flagsForTransformOptions(callName, options, isTTY2, transformLogLevelDefault);
            let request = {
              command: "transform",
              flags,
              inputFS: inputPath !== null,
              input: inputPath !== null ? encodeUTF8(inputPath) : typeof input === "string" ? encodeUTF8(input) : input
            };
            if (mangleCache) request.mangleCache = mangleCache;
            sendRequest(refs, request, (error, response) => {
              if (error) return callback(new Error(error), null);
              let errors = replaceDetailsInMessages(response.errors, details);
              let warnings = replaceDetailsInMessages(response.warnings, details);
              let outstanding = 1;
              let next = () => {
                if (--outstanding === 0) {
                  let result = {
                    warnings,
                    code: response.code,
                    map: response.map,
                    mangleCache: void 0,
                    legalComments: void 0
                  };
                  if ("legalComments" in response) result.legalComments = response == null ? void 0 : response.legalComments;
                  if (response.mangleCache) result.mangleCache = response == null ? void 0 : response.mangleCache;
                  callback(null, result);
                }
              };
              if (errors.length > 0) return callback(failureErrorWithLog("Transform failed", errors, warnings), null);
              if (response.codeFS) {
                outstanding++;
                fs3.readFile(response.code, (err, contents) => {
                  if (err !== null) {
                    callback(err, null);
                  } else {
                    response.code = contents;
                    next();
                  }
                });
              }
              if (response.mapFS) {
                outstanding++;
                fs3.readFile(response.map, (err, contents) => {
                  if (err !== null) {
                    callback(err, null);
                  } else {
                    response.map = contents;
                    next();
                  }
                });
              }
              next();
            });
          } catch (e) {
            let flags = [];
            try {
              pushLogFlags(flags, options, {}, isTTY2, transformLogLevelDefault);
            } catch {
            }
            const error = extractErrorMessageV8(e, streamIn, details, void 0, "");
            sendRequest(refs, { command: "error", flags, error }, () => {
              error.detail = details.load(error.detail);
              callback(failureErrorWithLog("Transform failed", [error], []), null);
            });
          }
        };
        if ((typeof input === "string" || input instanceof Uint8Array) && input.length > 1024 * 1024) {
          let next = start;
          start = () => fs3.writeFile(input, next);
        }
        start(null);
      };
      let formatMessages2 = ({ callName, refs, messages, options, callback }) => {
        if (!options) throw new Error(`Missing second argument in ${callName}() call`);
        let keys = {};
        let kind = getFlag(options, keys, "kind", mustBeString);
        let color = getFlag(options, keys, "color", mustBeBoolean);
        let terminalWidth = getFlag(options, keys, "terminalWidth", mustBeInteger);
        checkForInvalidFlags(options, keys, `in ${callName}() call`);
        if (kind === void 0) throw new Error(`Missing "kind" in ${callName}() call`);
        if (kind !== "error" && kind !== "warning") throw new Error(`Expected "kind" to be "error" or "warning" in ${callName}() call`);
        let request = {
          command: "format-msgs",
          messages: sanitizeMessages(messages, "messages", null, "", terminalWidth),
          isWarning: kind === "warning"
        };
        if (color !== void 0) request.color = color;
        if (terminalWidth !== void 0) request.terminalWidth = terminalWidth;
        sendRequest(refs, request, (error, response) => {
          if (error) return callback(new Error(error), null);
          callback(null, response.messages);
        });
      };
      let analyzeMetafile2 = ({ callName, refs, metafile, options, callback }) => {
        if (options === void 0) options = {};
        let keys = {};
        let color = getFlag(options, keys, "color", mustBeBoolean);
        let verbose = getFlag(options, keys, "verbose", mustBeBoolean);
        checkForInvalidFlags(options, keys, `in ${callName}() call`);
        let request = {
          command: "analyze-metafile",
          metafile
        };
        if (color !== void 0) request.color = color;
        if (verbose !== void 0) request.verbose = verbose;
        sendRequest(refs, request, (error, response) => {
          if (error) return callback(new Error(error), null);
          callback(null, response.result);
        });
      };
      return {
        readFromStdout,
        afterClose,
        service: {
          buildOrContext,
          transform: transform2,
          formatMessages: formatMessages2,
          analyzeMetafile: analyzeMetafile2
        }
      };
    }
    function buildOrContextImpl(callName, buildKey, sendRequest, sendResponse, refs, streamIn, requestCallbacks, options, isTTY2, defaultWD2, callback) {
      const details = createObjectStash();
      const isContext = callName === "context";
      const handleError = (e, pluginName) => {
        const flags = [];
        try {
          pushLogFlags(flags, options, {}, isTTY2, buildLogLevelDefault);
        } catch {
        }
        const message = extractErrorMessageV8(e, streamIn, details, void 0, pluginName);
        sendRequest(refs, { command: "error", flags, error: message }, () => {
          message.detail = details.load(message.detail);
          callback(failureErrorWithLog(isContext ? "Context failed" : "Build failed", [message], []), null);
        });
      };
      let plugins2;
      if (typeof options === "object") {
        const value = options.plugins;
        if (value !== void 0) {
          if (!Array.isArray(value)) return handleError(new Error(`"plugins" must be an array`), "");
          plugins2 = value;
        }
      }
      if (plugins2 && plugins2.length > 0) {
        if (streamIn.isSync) return handleError(new Error("Cannot use plugins in synchronous API calls"), "");
        handlePlugins(
          buildKey,
          sendRequest,
          sendResponse,
          refs,
          streamIn,
          requestCallbacks,
          options,
          plugins2,
          details
        ).then(
          (result) => {
            if (!result.ok) return handleError(result.error, result.pluginName);
            try {
              buildOrContextContinue(result.requestPlugins, result.runOnEndCallbacks, result.scheduleOnDisposeCallbacks);
            } catch (e) {
              handleError(e, "");
            }
          },
          (e) => handleError(e, "")
        );
        return;
      }
      try {
        buildOrContextContinue(null, (result, done) => done([], []), () => {
        });
      } catch (e) {
        handleError(e, "");
      }
      function buildOrContextContinue(requestPlugins, runOnEndCallbacks, scheduleOnDisposeCallbacks) {
        const writeDefault = streamIn.hasFS;
        const {
          entries,
          flags,
          write,
          stdinContents,
          stdinResolveDir,
          absWorkingDir,
          nodePaths,
          mangleCache
        } = flagsForBuildOptions(callName, options, isTTY2, buildLogLevelDefault, writeDefault);
        if (write && !streamIn.hasFS) throw new Error(`The "write" option is unavailable in this environment`);
        const request = {
          command: "build",
          key: buildKey,
          entries,
          flags,
          write,
          stdinContents,
          stdinResolveDir,
          absWorkingDir: absWorkingDir || defaultWD2,
          nodePaths,
          context: isContext
        };
        if (requestPlugins) request.plugins = requestPlugins;
        if (mangleCache) request.mangleCache = mangleCache;
        const buildResponseToResult = (response, callback2) => {
          const result = {
            errors: replaceDetailsInMessages(response.errors, details),
            warnings: replaceDetailsInMessages(response.warnings, details),
            outputFiles: void 0,
            metafile: void 0,
            mangleCache: void 0
          };
          const originalErrors = result.errors.slice();
          const originalWarnings = result.warnings.slice();
          if (response.outputFiles) result.outputFiles = response.outputFiles.map(convertOutputFiles);
          if (response.metafile) result.metafile = JSON.parse(response.metafile);
          if (response.mangleCache) result.mangleCache = response.mangleCache;
          if (response.writeToStdout !== void 0) console.log(decodeUTF8(response.writeToStdout).replace(/\n$/, ""));
          runOnEndCallbacks(result, (onEndErrors, onEndWarnings) => {
            if (originalErrors.length > 0 || onEndErrors.length > 0) {
              const error = failureErrorWithLog("Build failed", originalErrors.concat(onEndErrors), originalWarnings.concat(onEndWarnings));
              return callback2(error, null, onEndErrors, onEndWarnings);
            }
            callback2(null, result, onEndErrors, onEndWarnings);
          });
        };
        let latestResultPromise;
        let provideLatestResult;
        if (isContext)
          requestCallbacks["on-end"] = (id, request2) => new Promise((resolve3) => {
            buildResponseToResult(request2, (err, result, onEndErrors, onEndWarnings) => {
              const response = {
                errors: onEndErrors,
                warnings: onEndWarnings
              };
              if (provideLatestResult) provideLatestResult(err, result);
              latestResultPromise = void 0;
              provideLatestResult = void 0;
              sendResponse(id, response);
              resolve3();
            });
          });
        sendRequest(refs, request, (error, response) => {
          if (error) return callback(new Error(error), null);
          if (!isContext) {
            return buildResponseToResult(response, (err, res) => {
              scheduleOnDisposeCallbacks();
              return callback(err, res);
            });
          }
          if (response.errors.length > 0) {
            return callback(failureErrorWithLog("Context failed", response.errors, response.warnings), null);
          }
          let didDispose = false;
          const result = {
            rebuild: () => {
              if (!latestResultPromise) latestResultPromise = new Promise((resolve3, reject) => {
                let settlePromise;
                provideLatestResult = (err, result2) => {
                  if (!settlePromise) settlePromise = () => err ? reject(err) : resolve3(result2);
                };
                const triggerAnotherBuild = () => {
                  const request2 = {
                    command: "rebuild",
                    key: buildKey
                  };
                  sendRequest(refs, request2, (error2, response2) => {
                    if (error2) {
                      reject(new Error(error2));
                    } else if (settlePromise) {
                      settlePromise();
                    } else {
                      triggerAnotherBuild();
                    }
                  });
                };
                triggerAnotherBuild();
              });
              return latestResultPromise;
            },
            watch: (options2 = {}) => new Promise((resolve3, reject) => {
              if (!streamIn.hasFS) throw new Error(`Cannot use the "watch" API in this environment`);
              const keys = {};
              const delay = getFlag(options2, keys, "delay", mustBeInteger);
              checkForInvalidFlags(options2, keys, `in watch() call`);
              const request2 = {
                command: "watch",
                key: buildKey
              };
              if (delay) request2.delay = delay;
              sendRequest(refs, request2, (error2) => {
                if (error2) reject(new Error(error2));
                else resolve3(void 0);
              });
            }),
            serve: (options2 = {}) => new Promise((resolve3, reject) => {
              if (!streamIn.hasFS) throw new Error(`Cannot use the "serve" API in this environment`);
              const keys = {};
              const port2 = getFlag(options2, keys, "port", mustBeValidPortNumber);
              const host = getFlag(options2, keys, "host", mustBeString);
              const servedir = getFlag(options2, keys, "servedir", mustBeString);
              const keyfile = getFlag(options2, keys, "keyfile", mustBeString);
              const certfile = getFlag(options2, keys, "certfile", mustBeString);
              const fallback = getFlag(options2, keys, "fallback", mustBeString);
              const cors = getFlag(options2, keys, "cors", mustBeObject);
              const onRequest = getFlag(options2, keys, "onRequest", mustBeFunction);
              checkForInvalidFlags(options2, keys, `in serve() call`);
              const request2 = {
                command: "serve",
                key: buildKey,
                onRequest: !!onRequest
              };
              if (port2 !== void 0) request2.port = port2;
              if (host !== void 0) request2.host = host;
              if (servedir !== void 0) request2.servedir = servedir;
              if (keyfile !== void 0) request2.keyfile = keyfile;
              if (certfile !== void 0) request2.certfile = certfile;
              if (fallback !== void 0) request2.fallback = fallback;
              if (cors) {
                const corsKeys = {};
                const origin = getFlag(cors, corsKeys, "origin", mustBeStringOrArrayOfStrings);
                checkForInvalidFlags(cors, corsKeys, `on "cors" object`);
                if (Array.isArray(origin)) request2.corsOrigin = origin;
                else if (origin !== void 0) request2.corsOrigin = [origin];
              }
              sendRequest(refs, request2, (error2, response2) => {
                if (error2) return reject(new Error(error2));
                if (onRequest) {
                  requestCallbacks["serve-request"] = (id, request3) => {
                    onRequest(request3.args);
                    sendResponse(id, {});
                  };
                }
                resolve3(response2);
              });
            }),
            cancel: () => new Promise((resolve3) => {
              if (didDispose) return resolve3();
              const request2 = {
                command: "cancel",
                key: buildKey
              };
              sendRequest(refs, request2, () => {
                resolve3();
              });
            }),
            dispose: () => new Promise((resolve3) => {
              if (didDispose) return resolve3();
              didDispose = true;
              const request2 = {
                command: "dispose",
                key: buildKey
              };
              sendRequest(refs, request2, () => {
                resolve3();
                scheduleOnDisposeCallbacks();
                refs.unref();
              });
            })
          };
          refs.ref();
          callback(null, result);
        });
      }
    }
    var handlePlugins = async (buildKey, sendRequest, sendResponse, refs, streamIn, requestCallbacks, initialOptions, plugins2, details) => {
      let onStartCallbacks = [];
      let onEndCallbacks = [];
      let onResolveCallbacks = {};
      let onLoadCallbacks = {};
      let onDisposeCallbacks = [];
      let nextCallbackID = 0;
      let i = 0;
      let requestPlugins = [];
      let isSetupDone = false;
      plugins2 = [...plugins2];
      for (let item of plugins2) {
        let keys = {};
        if (typeof item !== "object") throw new Error(`Plugin at index ${i} must be an object`);
        const name = getFlag(item, keys, "name", mustBeString);
        if (typeof name !== "string" || name === "") throw new Error(`Plugin at index ${i} is missing a name`);
        try {
          let setup = getFlag(item, keys, "setup", mustBeFunction);
          if (typeof setup !== "function") throw new Error(`Plugin is missing a setup function`);
          checkForInvalidFlags(item, keys, `on plugin ${quote(name)}`);
          let plugin = {
            name,
            onStart: false,
            onEnd: false,
            onResolve: [],
            onLoad: []
          };
          i++;
          let resolve3 = (path3, options = {}) => {
            if (!isSetupDone) throw new Error('Cannot call "resolve" before plugin setup has completed');
            if (typeof path3 !== "string") throw new Error(`The path to resolve must be a string`);
            let keys2 = /* @__PURE__ */ Object.create(null);
            let pluginName = getFlag(options, keys2, "pluginName", mustBeString);
            let importer = getFlag(options, keys2, "importer", mustBeString);
            let namespace2 = getFlag(options, keys2, "namespace", mustBeString);
            let resolveDir = getFlag(options, keys2, "resolveDir", mustBeString);
            let kind = getFlag(options, keys2, "kind", mustBeString);
            let pluginData = getFlag(options, keys2, "pluginData", canBeAnything);
            let importAttributes = getFlag(options, keys2, "with", mustBeObject);
            checkForInvalidFlags(options, keys2, "in resolve() call");
            return new Promise((resolve22, reject) => {
              const request = {
                command: "resolve",
                path: path3,
                key: buildKey,
                pluginName: name
              };
              if (pluginName != null) request.pluginName = pluginName;
              if (importer != null) request.importer = importer;
              if (namespace2 != null) request.namespace = namespace2;
              if (resolveDir != null) request.resolveDir = resolveDir;
              if (kind != null) request.kind = kind;
              else throw new Error(`Must specify "kind" when calling "resolve"`);
              if (pluginData != null) request.pluginData = details.store(pluginData);
              if (importAttributes != null) request.with = sanitizeStringMap(importAttributes, "with");
              sendRequest(refs, request, (error, response) => {
                if (error !== null) reject(new Error(error));
                else resolve22({
                  errors: replaceDetailsInMessages(response.errors, details),
                  warnings: replaceDetailsInMessages(response.warnings, details),
                  path: response.path,
                  external: response.external,
                  sideEffects: response.sideEffects,
                  namespace: response.namespace,
                  suffix: response.suffix,
                  pluginData: details.load(response.pluginData)
                });
              });
            });
          };
          let promise = setup({
            initialOptions,
            resolve: resolve3,
            onStart(callback) {
              let registeredText = `This error came from the "onStart" callback registered here:`;
              let registeredNote = extractCallerV8(new Error(registeredText), streamIn, "onStart");
              onStartCallbacks.push({ name, callback, note: registeredNote });
              plugin.onStart = true;
            },
            onEnd(callback) {
              let registeredText = `This error came from the "onEnd" callback registered here:`;
              let registeredNote = extractCallerV8(new Error(registeredText), streamIn, "onEnd");
              onEndCallbacks.push({ name, callback, note: registeredNote });
              plugin.onEnd = true;
            },
            onResolve(options, callback) {
              let registeredText = `This error came from the "onResolve" callback registered here:`;
              let registeredNote = extractCallerV8(new Error(registeredText), streamIn, "onResolve");
              let keys2 = {};
              let filter = getFlag(options, keys2, "filter", mustBeRegExp);
              let namespace2 = getFlag(options, keys2, "namespace", mustBeString);
              checkForInvalidFlags(options, keys2, `in onResolve() call for plugin ${quote(name)}`);
              if (filter == null) throw new Error(`onResolve() call is missing a filter`);
              let id = nextCallbackID++;
              onResolveCallbacks[id] = { name, callback, note: registeredNote };
              plugin.onResolve.push({ id, filter: jsRegExpToGoRegExp(filter), namespace: namespace2 || "" });
            },
            onLoad(options, callback) {
              let registeredText = `This error came from the "onLoad" callback registered here:`;
              let registeredNote = extractCallerV8(new Error(registeredText), streamIn, "onLoad");
              let keys2 = {};
              let filter = getFlag(options, keys2, "filter", mustBeRegExp);
              let namespace2 = getFlag(options, keys2, "namespace", mustBeString);
              checkForInvalidFlags(options, keys2, `in onLoad() call for plugin ${quote(name)}`);
              if (filter == null) throw new Error(`onLoad() call is missing a filter`);
              let id = nextCallbackID++;
              onLoadCallbacks[id] = { name, callback, note: registeredNote };
              plugin.onLoad.push({ id, filter: jsRegExpToGoRegExp(filter), namespace: namespace2 || "" });
            },
            onDispose(callback) {
              onDisposeCallbacks.push(callback);
            },
            esbuild: streamIn.esbuild
          });
          if (promise) await promise;
          requestPlugins.push(plugin);
        } catch (e) {
          return { ok: false, error: e, pluginName: name };
        }
      }
      requestCallbacks["on-start"] = async (id, request) => {
        details.clear();
        let response = { errors: [], warnings: [] };
        await Promise.all(onStartCallbacks.map(async ({ name, callback, note }) => {
          try {
            let result = await callback();
            if (result != null) {
              if (typeof result !== "object") throw new Error(`Expected onStart() callback in plugin ${quote(name)} to return an object`);
              let keys = {};
              let errors = getFlag(result, keys, "errors", mustBeArray);
              let warnings = getFlag(result, keys, "warnings", mustBeArray);
              checkForInvalidFlags(result, keys, `from onStart() callback in plugin ${quote(name)}`);
              if (errors != null) response.errors.push(...sanitizeMessages(errors, "errors", details, name, void 0));
              if (warnings != null) response.warnings.push(...sanitizeMessages(warnings, "warnings", details, name, void 0));
            }
          } catch (e) {
            response.errors.push(extractErrorMessageV8(e, streamIn, details, note && note(), name));
          }
        }));
        sendResponse(id, response);
      };
      requestCallbacks["on-resolve"] = async (id, request) => {
        let response = {}, name = "", callback, note;
        for (let id2 of request.ids) {
          try {
            ({ name, callback, note } = onResolveCallbacks[id2]);
            let result = await callback({
              path: request.path,
              importer: request.importer,
              namespace: request.namespace,
              resolveDir: request.resolveDir,
              kind: request.kind,
              pluginData: details.load(request.pluginData),
              with: request.with
            });
            if (result != null) {
              if (typeof result !== "object") throw new Error(`Expected onResolve() callback in plugin ${quote(name)} to return an object`);
              let keys = {};
              let pluginName = getFlag(result, keys, "pluginName", mustBeString);
              let path3 = getFlag(result, keys, "path", mustBeString);
              let namespace2 = getFlag(result, keys, "namespace", mustBeString);
              let suffix = getFlag(result, keys, "suffix", mustBeString);
              let external = getFlag(result, keys, "external", mustBeBoolean);
              let sideEffects = getFlag(result, keys, "sideEffects", mustBeBoolean);
              let pluginData = getFlag(result, keys, "pluginData", canBeAnything);
              let errors = getFlag(result, keys, "errors", mustBeArray);
              let warnings = getFlag(result, keys, "warnings", mustBeArray);
              let watchFiles = getFlag(result, keys, "watchFiles", mustBeArrayOfStrings);
              let watchDirs = getFlag(result, keys, "watchDirs", mustBeArrayOfStrings);
              checkForInvalidFlags(result, keys, `from onResolve() callback in plugin ${quote(name)}`);
              response.id = id2;
              if (pluginName != null) response.pluginName = pluginName;
              if (path3 != null) response.path = path3;
              if (namespace2 != null) response.namespace = namespace2;
              if (suffix != null) response.suffix = suffix;
              if (external != null) response.external = external;
              if (sideEffects != null) response.sideEffects = sideEffects;
              if (pluginData != null) response.pluginData = details.store(pluginData);
              if (errors != null) response.errors = sanitizeMessages(errors, "errors", details, name, void 0);
              if (warnings != null) response.warnings = sanitizeMessages(warnings, "warnings", details, name, void 0);
              if (watchFiles != null) response.watchFiles = sanitizeStringArray(watchFiles, "watchFiles");
              if (watchDirs != null) response.watchDirs = sanitizeStringArray(watchDirs, "watchDirs");
              break;
            }
          } catch (e) {
            response = { id: id2, errors: [extractErrorMessageV8(e, streamIn, details, note && note(), name)] };
            break;
          }
        }
        sendResponse(id, response);
      };
      requestCallbacks["on-load"] = async (id, request) => {
        let response = {}, name = "", callback, note;
        for (let id2 of request.ids) {
          try {
            ({ name, callback, note } = onLoadCallbacks[id2]);
            let result = await callback({
              path: request.path,
              namespace: request.namespace,
              suffix: request.suffix,
              pluginData: details.load(request.pluginData),
              with: request.with
            });
            if (result != null) {
              if (typeof result !== "object") throw new Error(`Expected onLoad() callback in plugin ${quote(name)} to return an object`);
              let keys = {};
              let pluginName = getFlag(result, keys, "pluginName", mustBeString);
              let contents = getFlag(result, keys, "contents", mustBeStringOrUint8Array);
              let resolveDir = getFlag(result, keys, "resolveDir", mustBeString);
              let pluginData = getFlag(result, keys, "pluginData", canBeAnything);
              let loader = getFlag(result, keys, "loader", mustBeString);
              let errors = getFlag(result, keys, "errors", mustBeArray);
              let warnings = getFlag(result, keys, "warnings", mustBeArray);
              let watchFiles = getFlag(result, keys, "watchFiles", mustBeArrayOfStrings);
              let watchDirs = getFlag(result, keys, "watchDirs", mustBeArrayOfStrings);
              checkForInvalidFlags(result, keys, `from onLoad() callback in plugin ${quote(name)}`);
              response.id = id2;
              if (pluginName != null) response.pluginName = pluginName;
              if (contents instanceof Uint8Array) response.contents = contents;
              else if (contents != null) response.contents = encodeUTF8(contents);
              if (resolveDir != null) response.resolveDir = resolveDir;
              if (pluginData != null) response.pluginData = details.store(pluginData);
              if (loader != null) response.loader = loader;
              if (errors != null) response.errors = sanitizeMessages(errors, "errors", details, name, void 0);
              if (warnings != null) response.warnings = sanitizeMessages(warnings, "warnings", details, name, void 0);
              if (watchFiles != null) response.watchFiles = sanitizeStringArray(watchFiles, "watchFiles");
              if (watchDirs != null) response.watchDirs = sanitizeStringArray(watchDirs, "watchDirs");
              break;
            }
          } catch (e) {
            response = { id: id2, errors: [extractErrorMessageV8(e, streamIn, details, note && note(), name)] };
            break;
          }
        }
        sendResponse(id, response);
      };
      let runOnEndCallbacks = (result, done) => done([], []);
      if (onEndCallbacks.length > 0) {
        runOnEndCallbacks = (result, done) => {
          (async () => {
            const onEndErrors = [];
            const onEndWarnings = [];
            for (const { name, callback, note } of onEndCallbacks) {
              let newErrors;
              let newWarnings;
              try {
                const value = await callback(result);
                if (value != null) {
                  if (typeof value !== "object") throw new Error(`Expected onEnd() callback in plugin ${quote(name)} to return an object`);
                  let keys = {};
                  let errors = getFlag(value, keys, "errors", mustBeArray);
                  let warnings = getFlag(value, keys, "warnings", mustBeArray);
                  checkForInvalidFlags(value, keys, `from onEnd() callback in plugin ${quote(name)}`);
                  if (errors != null) newErrors = sanitizeMessages(errors, "errors", details, name, void 0);
                  if (warnings != null) newWarnings = sanitizeMessages(warnings, "warnings", details, name, void 0);
                }
              } catch (e) {
                newErrors = [extractErrorMessageV8(e, streamIn, details, note && note(), name)];
              }
              if (newErrors) {
                onEndErrors.push(...newErrors);
                try {
                  result.errors.push(...newErrors);
                } catch {
                }
              }
              if (newWarnings) {
                onEndWarnings.push(...newWarnings);
                try {
                  result.warnings.push(...newWarnings);
                } catch {
                }
              }
            }
            done(onEndErrors, onEndWarnings);
          })();
        };
      }
      let scheduleOnDisposeCallbacks = () => {
        for (const cb of onDisposeCallbacks) {
          setTimeout(() => cb(), 0);
        }
      };
      isSetupDone = true;
      return {
        ok: true,
        requestPlugins,
        runOnEndCallbacks,
        scheduleOnDisposeCallbacks
      };
    };
    function createObjectStash() {
      const map = /* @__PURE__ */ new Map();
      let nextID = 0;
      return {
        clear() {
          map.clear();
        },
        load(id) {
          return map.get(id);
        },
        store(value) {
          if (value === void 0) return -1;
          const id = nextID++;
          map.set(id, value);
          return id;
        }
      };
    }
    function extractCallerV8(e, streamIn, ident) {
      let note;
      let tried = false;
      return () => {
        if (tried) return note;
        tried = true;
        try {
          let lines = (e.stack + "").split("\n");
          lines.splice(1, 1);
          let location = parseStackLinesV8(streamIn, lines, ident);
          if (location) {
            note = { text: e.message, location };
            return note;
          }
        } catch {
        }
      };
    }
    function extractErrorMessageV8(e, streamIn, stash, note, pluginName) {
      let text = "Internal error";
      let location = null;
      try {
        text = (e && e.message || e) + "";
      } catch {
      }
      try {
        location = parseStackLinesV8(streamIn, (e.stack + "").split("\n"), "");
      } catch {
      }
      return { id: "", pluginName, text, location, notes: note ? [note] : [], detail: stash ? stash.store(e) : -1 };
    }
    function parseStackLinesV8(streamIn, lines, ident) {
      let at = "    at ";
      if (streamIn.readFileSync && !lines[0].startsWith(at) && lines[1].startsWith(at)) {
        for (let i = 1; i < lines.length; i++) {
          let line = lines[i];
          if (!line.startsWith(at)) continue;
          line = line.slice(at.length);
          while (true) {
            let match = /^(?:new |async )?\S+ \((.*)\)$/.exec(line);
            if (match) {
              line = match[1];
              continue;
            }
            match = /^eval at \S+ \((.*)\)(?:, \S+:\d+:\d+)?$/.exec(line);
            if (match) {
              line = match[1];
              continue;
            }
            match = /^(\S+):(\d+):(\d+)$/.exec(line);
            if (match) {
              let contents;
              try {
                contents = streamIn.readFileSync(match[1], "utf8");
              } catch {
                break;
              }
              let lineText = contents.split(/\r\n|\r|\n|\u2028|\u2029/)[+match[2] - 1] || "";
              let column = +match[3] - 1;
              let length = lineText.slice(column, column + ident.length) === ident ? ident.length : 0;
              return {
                file: match[1],
                namespace: "file",
                line: +match[2],
                column: encodeUTF8(lineText.slice(0, column)).length,
                length: encodeUTF8(lineText.slice(column, column + length)).length,
                lineText: lineText + "\n" + lines.slice(1).join("\n"),
                suggestion: ""
              };
            }
            break;
          }
        }
      }
      return null;
    }
    function failureErrorWithLog(text, errors, warnings) {
      let limit = 5;
      text += errors.length < 1 ? "" : ` with ${errors.length} error${errors.length < 2 ? "" : "s"}:` + errors.slice(0, limit + 1).map((e, i) => {
        if (i === limit) return "\n...";
        if (!e.location) return `
error: ${e.text}`;
        let { file, line, column } = e.location;
        let pluginText = e.pluginName ? `[plugin: ${e.pluginName}] ` : "";
        return `
${file}:${line}:${column}: ERROR: ${pluginText}${e.text}`;
      }).join("");
      let error = new Error(text);
      for (const [key, value] of [["errors", errors], ["warnings", warnings]]) {
        Object.defineProperty(error, key, {
          configurable: true,
          enumerable: true,
          get: () => value,
          set: (value2) => Object.defineProperty(error, key, {
            configurable: true,
            enumerable: true,
            value: value2
          })
        });
      }
      return error;
    }
    function replaceDetailsInMessages(messages, stash) {
      for (const message of messages) {
        message.detail = stash.load(message.detail);
      }
      return messages;
    }
    function sanitizeLocation(location, where, terminalWidth) {
      if (location == null) return null;
      let keys = {};
      let file = getFlag(location, keys, "file", mustBeString);
      let namespace2 = getFlag(location, keys, "namespace", mustBeString);
      let line = getFlag(location, keys, "line", mustBeInteger);
      let column = getFlag(location, keys, "column", mustBeInteger);
      let length = getFlag(location, keys, "length", mustBeInteger);
      let lineText = getFlag(location, keys, "lineText", mustBeString);
      let suggestion = getFlag(location, keys, "suggestion", mustBeString);
      checkForInvalidFlags(location, keys, where);
      if (lineText) {
        const relevantASCII = lineText.slice(
          0,
          (column && column > 0 ? column : 0) + (length && length > 0 ? length : 0) + (terminalWidth && terminalWidth > 0 ? terminalWidth : 80)
        );
        if (!/[\x7F-\uFFFF]/.test(relevantASCII) && !/\n/.test(lineText)) {
          lineText = relevantASCII;
        }
      }
      return {
        file: file || "",
        namespace: namespace2 || "",
        line: line || 0,
        column: column || 0,
        length: length || 0,
        lineText: lineText || "",
        suggestion: suggestion || ""
      };
    }
    function sanitizeMessages(messages, property, stash, fallbackPluginName, terminalWidth) {
      let messagesClone = [];
      let index = 0;
      for (const message of messages) {
        let keys = {};
        let id = getFlag(message, keys, "id", mustBeString);
        let pluginName = getFlag(message, keys, "pluginName", mustBeString);
        let text = getFlag(message, keys, "text", mustBeString);
        let location = getFlag(message, keys, "location", mustBeObjectOrNull);
        let notes = getFlag(message, keys, "notes", mustBeArray);
        let detail = getFlag(message, keys, "detail", canBeAnything);
        let where = `in element ${index} of "${property}"`;
        checkForInvalidFlags(message, keys, where);
        let notesClone = [];
        if (notes) {
          for (const note of notes) {
            let noteKeys = {};
            let noteText = getFlag(note, noteKeys, "text", mustBeString);
            let noteLocation = getFlag(note, noteKeys, "location", mustBeObjectOrNull);
            checkForInvalidFlags(note, noteKeys, where);
            notesClone.push({
              text: noteText || "",
              location: sanitizeLocation(noteLocation, where, terminalWidth)
            });
          }
        }
        messagesClone.push({
          id: id || "",
          pluginName: pluginName || fallbackPluginName,
          text: text || "",
          location: sanitizeLocation(location, where, terminalWidth),
          notes: notesClone,
          detail: stash ? stash.store(detail) : -1
        });
        index++;
      }
      return messagesClone;
    }
    function sanitizeStringArray(values, property) {
      const result = [];
      for (const value of values) {
        if (typeof value !== "string") throw new Error(`${quote(property)} must be an array of strings`);
        result.push(value);
      }
      return result;
    }
    function sanitizeStringMap(map, property) {
      const result = /* @__PURE__ */ Object.create(null);
      for (const key in map) {
        const value = map[key];
        if (typeof value !== "string") throw new Error(`key ${quote(key)} in object ${quote(property)} must be a string`);
        result[key] = value;
      }
      return result;
    }
    function convertOutputFiles({ path: path3, contents, hash }) {
      let text = null;
      return {
        path: path3,
        contents,
        hash,
        get text() {
          const binary = this.contents;
          if (text === null || binary !== contents) {
            contents = binary;
            text = decodeUTF8(binary);
          }
          return text;
        }
      };
    }
    function jsRegExpToGoRegExp(regexp) {
      let result = regexp.source;
      if (regexp.flags) result = `(?${regexp.flags})${result}`;
      return result;
    }
    var fs = __require("fs");
    var os = __require("os");
    var path = __require("path");
    var ESBUILD_BINARY_PATH = process.env.ESBUILD_BINARY_PATH || ESBUILD_BINARY_PATH;
    var isValidBinaryPath = (x) => !!x && x !== "/usr/bin/esbuild";
    var packageDarwin_arm64 = "@esbuild/darwin-arm64";
    var packageDarwin_x64 = "@esbuild/darwin-x64";
    var knownWindowsPackages = {
      "win32 arm64 LE": "@esbuild/win32-arm64",
      "win32 ia32 LE": "@esbuild/win32-ia32",
      "win32 x64 LE": "@esbuild/win32-x64"
    };
    var knownUnixlikePackages = {
      "aix ppc64 BE": "@esbuild/aix-ppc64",
      "android arm64 LE": "@esbuild/android-arm64",
      "darwin arm64 LE": "@esbuild/darwin-arm64",
      "darwin x64 LE": "@esbuild/darwin-x64",
      "freebsd arm64 LE": "@esbuild/freebsd-arm64",
      "freebsd x64 LE": "@esbuild/freebsd-x64",
      "linux arm LE": "@esbuild/linux-arm",
      "linux arm64 LE": "@esbuild/linux-arm64",
      "linux ia32 LE": "@esbuild/linux-ia32",
      "linux mips64el LE": "@esbuild/linux-mips64el",
      "linux ppc64 LE": "@esbuild/linux-ppc64",
      "linux riscv64 LE": "@esbuild/linux-riscv64",
      "linux s390x BE": "@esbuild/linux-s390x",
      "linux x64 LE": "@esbuild/linux-x64",
      "linux loong64 LE": "@esbuild/linux-loong64",
      "netbsd arm64 LE": "@esbuild/netbsd-arm64",
      "netbsd x64 LE": "@esbuild/netbsd-x64",
      "openbsd arm64 LE": "@esbuild/openbsd-arm64",
      "openbsd x64 LE": "@esbuild/openbsd-x64",
      "sunos x64 LE": "@esbuild/sunos-x64"
    };
    var knownWebAssemblyFallbackPackages = {
      "android arm LE": "@esbuild/android-arm",
      "android x64 LE": "@esbuild/android-x64",
      "openharmony arm64 LE": "@esbuild/openharmony-arm64"
    };
    function pkgAndSubpathForCurrentPlatform() {
      let pkg;
      let subpath;
      let isWASM = false;
      let platformKey = `${process.platform} ${os.arch()} ${os.endianness()}`;
      if (platformKey in knownWindowsPackages) {
        pkg = knownWindowsPackages[platformKey];
        subpath = "esbuild.exe";
      } else if (platformKey in knownUnixlikePackages) {
        pkg = knownUnixlikePackages[platformKey];
        subpath = "bin/esbuild";
      } else if (platformKey in knownWebAssemblyFallbackPackages) {
        pkg = knownWebAssemblyFallbackPackages[platformKey];
        subpath = "bin/esbuild";
        isWASM = true;
      } else {
        throw new Error(`Unsupported platform: ${platformKey}`);
      }
      return { pkg, subpath, isWASM };
    }
    function pkgForSomeOtherPlatform() {
      const libMainJS = __require.resolve("esbuild");
      const nodeModulesDirectory = path.dirname(path.dirname(path.dirname(libMainJS)));
      if (path.basename(nodeModulesDirectory) === "node_modules") {
        for (const unixKey in knownUnixlikePackages) {
          try {
            const pkg = knownUnixlikePackages[unixKey];
            if (fs.existsSync(path.join(nodeModulesDirectory, pkg))) return pkg;
          } catch {
          }
        }
        for (const windowsKey in knownWindowsPackages) {
          try {
            const pkg = knownWindowsPackages[windowsKey];
            if (fs.existsSync(path.join(nodeModulesDirectory, pkg))) return pkg;
          } catch {
          }
        }
      }
      return null;
    }
    function downloadedBinPath(pkg, subpath) {
      const esbuildLibDir = path.dirname(__require.resolve("esbuild"));
      return path.join(esbuildLibDir, `downloaded-${pkg.replace("/", "-")}-${path.basename(subpath)}`);
    }
    function generateBinPath() {
      if (isValidBinaryPath(ESBUILD_BINARY_PATH)) {
        if (!fs.existsSync(ESBUILD_BINARY_PATH)) {
          console.warn(`[esbuild] Ignoring bad configuration: ESBUILD_BINARY_PATH=${ESBUILD_BINARY_PATH}`);
        } else {
          return { binPath: ESBUILD_BINARY_PATH, isWASM: false };
        }
      }
      const { pkg, subpath, isWASM } = pkgAndSubpathForCurrentPlatform();
      let binPath;
      try {
        binPath = __require.resolve(`${pkg}/${subpath}`);
      } catch (e) {
        binPath = downloadedBinPath(pkg, subpath);
        if (!fs.existsSync(binPath)) {
          try {
            __require.resolve(pkg);
          } catch {
            const otherPkg = pkgForSomeOtherPlatform();
            if (otherPkg) {
              let suggestions = `
Specifically the "${otherPkg}" package is present but this platform
needs the "${pkg}" package instead. People often get into this
situation by installing esbuild on Windows or macOS and copying "node_modules"
into a Docker image that runs Linux, or by copying "node_modules" between
Windows and WSL environments.

If you are installing with npm, you can try not copying the "node_modules"
directory when you copy the files over, and running "npm ci" or "npm install"
on the destination platform after the copy. Or you could consider using yarn
instead of npm which has built-in support for installing a package on multiple
platforms simultaneously.

If you are installing with yarn, you can try listing both this platform and the
other platform in your ".yarnrc.yml" file using the "supportedArchitectures"
feature: https://yarnpkg.com/configuration/yarnrc/#supportedArchitectures
Keep in mind that this means multiple copies of esbuild will be present.
`;
              if (pkg === packageDarwin_x64 && otherPkg === packageDarwin_arm64 || pkg === packageDarwin_arm64 && otherPkg === packageDarwin_x64) {
                suggestions = `
Specifically the "${otherPkg}" package is present but this platform
needs the "${pkg}" package instead. People often get into this
situation by installing esbuild with npm running inside of Rosetta 2 and then
trying to use it with node running outside of Rosetta 2, or vice versa (Rosetta
2 is Apple's on-the-fly x86_64-to-arm64 translation service).

If you are installing with npm, you can try ensuring that both npm and node are
not running under Rosetta 2 and then reinstalling esbuild. This likely involves
changing how you installed npm and/or node. For example, installing node with
the universal installer here should work: https://nodejs.org/en/download/. Or
you could consider using yarn instead of npm which has built-in support for
installing a package on multiple platforms simultaneously.

If you are installing with yarn, you can try listing both "arm64" and "x64"
in your ".yarnrc.yml" file using the "supportedArchitectures" feature:
https://yarnpkg.com/configuration/yarnrc/#supportedArchitectures
Keep in mind that this means multiple copies of esbuild will be present.
`;
              }
              throw new Error(`
You installed esbuild for another platform than the one you're currently using.
This won't work because esbuild is written with native code and needs to
install a platform-specific binary executable.
${suggestions}
Another alternative is to use the "esbuild-wasm" package instead, which works
the same way on all platforms. But it comes with a heavy performance cost and
can sometimes be 10x slower than the "esbuild" package, so you may also not
want to do that.
`);
            }
            throw new Error(`The package "${pkg}" could not be found, and is needed by esbuild.

If you are installing esbuild with npm, make sure that you don't specify the
"--no-optional" or "--omit=optional" flags. The "optionalDependencies" feature
of "package.json" is used by esbuild to install the correct binary executable
for your current platform.`);
          }
          throw e;
        }
      }
      if (/\.zip\//.test(binPath)) {
        let pnpapi;
        try {
          pnpapi = __require("pnpapi");
        } catch (e) {
        }
        if (pnpapi) {
          const root2 = pnpapi.getPackageInformation(pnpapi.topLevel).packageLocation;
          const binTargetPath = path.join(
            root2,
            "node_modules",
            ".cache",
            "esbuild",
            `pnpapi-${pkg.replace("/", "-")}-${"0.27.2"}-${path.basename(subpath)}`
          );
          if (!fs.existsSync(binTargetPath)) {
            fs.mkdirSync(path.dirname(binTargetPath), { recursive: true });
            fs.copyFileSync(binPath, binTargetPath);
            fs.chmodSync(binTargetPath, 493);
          }
          return { binPath: binTargetPath, isWASM };
        }
      }
      return { binPath, isWASM };
    }
    var child_process = __require("child_process");
    var crypto = __require("crypto");
    var path2 = __require("path");
    var fs2 = __require("fs");
    var os2 = __require("os");
    var tty = __require("tty");
    var worker_threads;
    if (process.env.ESBUILD_WORKER_THREADS !== "0") {
      try {
        worker_threads = __require("worker_threads");
      } catch {
      }
      let [major, minor] = process.versions.node.split(".");
      if (
        // <v12.17.0 does not work
        +major < 12 || +major === 12 && +minor < 17 || +major === 13 && +minor < 13
      ) {
        worker_threads = void 0;
      }
    }
    var _a;
    var isInternalWorkerThread = ((_a = worker_threads == null ? void 0 : worker_threads.workerData) == null ? void 0 : _a.esbuildVersion) === "0.27.2";
    var esbuildCommandAndArgs = () => {
      if ((!ESBUILD_BINARY_PATH || false) && (path2.basename(__filename) !== "main.js" || path2.basename(__dirname) !== "lib")) {
        throw new Error(
          `The esbuild JavaScript API cannot be bundled. Please mark the "esbuild" package as external so it's not included in the bundle.

More information: The file containing the code for esbuild's JavaScript API (${__filename}) does not appear to be inside the esbuild package on the file system, which usually means that the esbuild package was bundled into another file. This is problematic because the API needs to run a binary executable inside the esbuild package which is located using a relative path from the API code to the executable. If the esbuild package is bundled, the relative path will be incorrect and the executable won't be found.`
        );
      }
      if (false) {
        return ["node", [path2.join(__dirname, "..", "bin", "esbuild")]];
      } else {
        const { binPath, isWASM } = generateBinPath();
        if (isWASM) {
          return ["node", [binPath]];
        } else {
          return [binPath, []];
        }
      }
    };
    var isTTY = () => tty.isatty(2);
    var fsSync = {
      readFile(tempFile, callback) {
        try {
          let contents = fs2.readFileSync(tempFile, "utf8");
          try {
            fs2.unlinkSync(tempFile);
          } catch {
          }
          callback(null, contents);
        } catch (err) {
          callback(err, null);
        }
      },
      writeFile(contents, callback) {
        try {
          let tempFile = randomFileName();
          fs2.writeFileSync(tempFile, contents);
          callback(tempFile);
        } catch {
          callback(null);
        }
      }
    };
    var fsAsync = {
      readFile(tempFile, callback) {
        try {
          fs2.readFile(tempFile, "utf8", (err, contents) => {
            try {
              fs2.unlink(tempFile, () => callback(err, contents));
            } catch {
              callback(err, contents);
            }
          });
        } catch (err) {
          callback(err, null);
        }
      },
      writeFile(contents, callback) {
        try {
          let tempFile = randomFileName();
          fs2.writeFile(tempFile, contents, (err) => err !== null ? callback(null) : callback(tempFile));
        } catch {
          callback(null);
        }
      }
    };
    var version = "0.27.2";
    var build = (options) => ensureServiceIsRunning().build(options);
    var context2 = (buildOptions) => ensureServiceIsRunning().context(buildOptions);
    var transform = (input, options) => ensureServiceIsRunning().transform(input, options);
    var formatMessages = (messages, options) => ensureServiceIsRunning().formatMessages(messages, options);
    var analyzeMetafile = (messages, options) => ensureServiceIsRunning().analyzeMetafile(messages, options);
    var buildSync = (options) => {
      if (worker_threads && !isInternalWorkerThread) {
        if (!workerThreadService) workerThreadService = startWorkerThreadService(worker_threads);
        return workerThreadService.buildSync(options);
      }
      let result;
      runServiceSync((service) => service.buildOrContext({
        callName: "buildSync",
        refs: null,
        options,
        isTTY: isTTY(),
        defaultWD,
        callback: (err, res) => {
          if (err) throw err;
          result = res;
        }
      }));
      return result;
    };
    var transformSync = (input, options) => {
      if (worker_threads && !isInternalWorkerThread) {
        if (!workerThreadService) workerThreadService = startWorkerThreadService(worker_threads);
        return workerThreadService.transformSync(input, options);
      }
      let result;
      runServiceSync((service) => service.transform({
        callName: "transformSync",
        refs: null,
        input,
        options: options || {},
        isTTY: isTTY(),
        fs: fsSync,
        callback: (err, res) => {
          if (err) throw err;
          result = res;
        }
      }));
      return result;
    };
    var formatMessagesSync = (messages, options) => {
      if (worker_threads && !isInternalWorkerThread) {
        if (!workerThreadService) workerThreadService = startWorkerThreadService(worker_threads);
        return workerThreadService.formatMessagesSync(messages, options);
      }
      let result;
      runServiceSync((service) => service.formatMessages({
        callName: "formatMessagesSync",
        refs: null,
        messages,
        options,
        callback: (err, res) => {
          if (err) throw err;
          result = res;
        }
      }));
      return result;
    };
    var analyzeMetafileSync = (metafile, options) => {
      if (worker_threads && !isInternalWorkerThread) {
        if (!workerThreadService) workerThreadService = startWorkerThreadService(worker_threads);
        return workerThreadService.analyzeMetafileSync(metafile, options);
      }
      let result;
      runServiceSync((service) => service.analyzeMetafile({
        callName: "analyzeMetafileSync",
        refs: null,
        metafile: typeof metafile === "string" ? metafile : JSON.stringify(metafile),
        options,
        callback: (err, res) => {
          if (err) throw err;
          result = res;
        }
      }));
      return result;
    };
    var stop = () => {
      if (stopService) stopService();
      if (workerThreadService) workerThreadService.stop();
      return Promise.resolve();
    };
    var initializeWasCalled = false;
    var initialize = (options) => {
      options = validateInitializeOptions(options || {});
      if (options.wasmURL) throw new Error(`The "wasmURL" option only works in the browser`);
      if (options.wasmModule) throw new Error(`The "wasmModule" option only works in the browser`);
      if (options.worker) throw new Error(`The "worker" option only works in the browser`);
      if (initializeWasCalled) throw new Error('Cannot call "initialize" more than once');
      ensureServiceIsRunning();
      initializeWasCalled = true;
      return Promise.resolve();
    };
    var defaultWD = process.cwd();
    var longLivedService;
    var stopService;
    var ensureServiceIsRunning = () => {
      if (longLivedService) return longLivedService;
      let [command, args] = esbuildCommandAndArgs();
      let child = child_process.spawn(command, args.concat(`--service=${"0.27.2"}`, "--ping"), {
        windowsHide: true,
        stdio: ["pipe", "pipe", "inherit"],
        cwd: defaultWD
      });
      let { readFromStdout, afterClose, service } = createChannel({
        writeToStdin(bytes) {
          child.stdin.write(bytes, (err) => {
            if (err) afterClose(err);
          });
        },
        readFileSync: fs2.readFileSync,
        isSync: false,
        hasFS: true,
        esbuild: node_exports
      });
      child.stdin.on("error", afterClose);
      child.on("error", afterClose);
      const stdin = child.stdin;
      const stdout = child.stdout;
      stdout.on("data", readFromStdout);
      stdout.on("end", afterClose);
      stopService = () => {
        stdin.destroy();
        stdout.destroy();
        child.kill();
        initializeWasCalled = false;
        longLivedService = void 0;
        stopService = void 0;
      };
      let refCount = 0;
      child.unref();
      if (stdin.unref) {
        stdin.unref();
      }
      if (stdout.unref) {
        stdout.unref();
      }
      const refs = {
        ref() {
          if (++refCount === 1) child.ref();
        },
        unref() {
          if (--refCount === 0) child.unref();
        }
      };
      longLivedService = {
        build: (options) => new Promise((resolve3, reject) => {
          service.buildOrContext({
            callName: "build",
            refs,
            options,
            isTTY: isTTY(),
            defaultWD,
            callback: (err, res) => err ? reject(err) : resolve3(res)
          });
        }),
        context: (options) => new Promise((resolve3, reject) => service.buildOrContext({
          callName: "context",
          refs,
          options,
          isTTY: isTTY(),
          defaultWD,
          callback: (err, res) => err ? reject(err) : resolve3(res)
        })),
        transform: (input, options) => new Promise((resolve3, reject) => service.transform({
          callName: "transform",
          refs,
          input,
          options: options || {},
          isTTY: isTTY(),
          fs: fsAsync,
          callback: (err, res) => err ? reject(err) : resolve3(res)
        })),
        formatMessages: (messages, options) => new Promise((resolve3, reject) => service.formatMessages({
          callName: "formatMessages",
          refs,
          messages,
          options,
          callback: (err, res) => err ? reject(err) : resolve3(res)
        })),
        analyzeMetafile: (metafile, options) => new Promise((resolve3, reject) => service.analyzeMetafile({
          callName: "analyzeMetafile",
          refs,
          metafile: typeof metafile === "string" ? metafile : JSON.stringify(metafile),
          options,
          callback: (err, res) => err ? reject(err) : resolve3(res)
        }))
      };
      return longLivedService;
    };
    var runServiceSync = (callback) => {
      let [command, args] = esbuildCommandAndArgs();
      let stdin = new Uint8Array();
      let { readFromStdout, afterClose, service } = createChannel({
        writeToStdin(bytes) {
          if (stdin.length !== 0) throw new Error("Must run at most one command");
          stdin = bytes;
        },
        isSync: true,
        hasFS: true,
        esbuild: node_exports
      });
      callback(service);
      let stdout = child_process.execFileSync(command, args.concat(`--service=${"0.27.2"}`), {
        cwd: defaultWD,
        windowsHide: true,
        input: stdin,
        // We don't know how large the output could be. If it's too large, the
        // command will fail with ENOBUFS. Reserve 16mb for now since that feels
        // like it should be enough. Also allow overriding this with an environment
        // variable.
        maxBuffer: +process.env.ESBUILD_MAX_BUFFER || 16 * 1024 * 1024
      });
      readFromStdout(stdout);
      afterClose(null);
    };
    var randomFileName = () => {
      return path2.join(os2.tmpdir(), `esbuild-${crypto.randomBytes(32).toString("hex")}`);
    };
    var workerThreadService = null;
    var startWorkerThreadService = (worker_threads2) => {
      let { port1: mainPort, port2: workerPort } = new worker_threads2.MessageChannel();
      let worker = new worker_threads2.Worker(__filename, {
        workerData: { workerPort, defaultWD, esbuildVersion: "0.27.2" },
        transferList: [workerPort],
        // From node's documentation: https://nodejs.org/api/worker_threads.html
        //
        //   Take care when launching worker threads from preload scripts (scripts loaded
        //   and run using the `-r` command line flag). Unless the `execArgv` option is
        //   explicitly set, new Worker threads automatically inherit the command line flags
        //   from the running process and will preload the same preload scripts as the main
        //   thread. If the preload script unconditionally launches a worker thread, every
        //   thread spawned will spawn another until the application crashes.
        //
        execArgv: []
      });
      let nextID = 0;
      let fakeBuildError = (text) => {
        let error = new Error(`Build failed with 1 error:
error: ${text}`);
        let errors = [{ id: "", pluginName: "", text, location: null, notes: [], detail: void 0 }];
        error.errors = errors;
        error.warnings = [];
        return error;
      };
      let validateBuildSyncOptions = (options) => {
        if (!options) return;
        let plugins2 = options.plugins;
        if (plugins2 && plugins2.length > 0) throw fakeBuildError(`Cannot use plugins in synchronous API calls`);
      };
      let applyProperties = (object, properties) => {
        for (let key in properties) {
          object[key] = properties[key];
        }
      };
      let runCallSync = (command, args) => {
        let id = nextID++;
        let sharedBuffer = new SharedArrayBuffer(8);
        let sharedBufferView = new Int32Array(sharedBuffer);
        let msg = { sharedBuffer, id, command, args };
        worker.postMessage(msg);
        let status = Atomics.wait(sharedBufferView, 0, 0);
        if (status !== "ok" && status !== "not-equal") throw new Error("Internal error: Atomics.wait() failed: " + status);
        let { message: { id: id2, resolve: resolve3, reject, properties } } = worker_threads2.receiveMessageOnPort(mainPort);
        if (id !== id2) throw new Error(`Internal error: Expected id ${id} but got id ${id2}`);
        if (reject) {
          applyProperties(reject, properties);
          throw reject;
        }
        return resolve3;
      };
      worker.unref();
      return {
        buildSync(options) {
          validateBuildSyncOptions(options);
          return runCallSync("build", [options]);
        },
        transformSync(input, options) {
          return runCallSync("transform", [input, options]);
        },
        formatMessagesSync(messages, options) {
          return runCallSync("formatMessages", [messages, options]);
        },
        analyzeMetafileSync(metafile, options) {
          return runCallSync("analyzeMetafile", [metafile, options]);
        },
        stop() {
          worker.terminate();
          workerThreadService = null;
        }
      };
    };
    var startSyncServiceWorker = () => {
      let workerPort = worker_threads.workerData.workerPort;
      let parentPort = worker_threads.parentPort;
      let extractProperties = (object) => {
        let properties = {};
        if (object && typeof object === "object") {
          for (let key in object) {
            properties[key] = object[key];
          }
        }
        return properties;
      };
      try {
        let service = ensureServiceIsRunning();
        defaultWD = worker_threads.workerData.defaultWD;
        parentPort.on("message", (msg) => {
          (async () => {
            let { sharedBuffer, id, command, args } = msg;
            let sharedBufferView = new Int32Array(sharedBuffer);
            try {
              switch (command) {
                case "build":
                  workerPort.postMessage({ id, resolve: await service.build(args[0]) });
                  break;
                case "transform":
                  workerPort.postMessage({ id, resolve: await service.transform(args[0], args[1]) });
                  break;
                case "formatMessages":
                  workerPort.postMessage({ id, resolve: await service.formatMessages(args[0], args[1]) });
                  break;
                case "analyzeMetafile":
                  workerPort.postMessage({ id, resolve: await service.analyzeMetafile(args[0], args[1]) });
                  break;
                default:
                  throw new Error(`Invalid command: ${command}`);
              }
            } catch (reject) {
              workerPort.postMessage({ id, reject, properties: extractProperties(reject) });
            }
            Atomics.add(sharedBufferView, 0, 1);
            Atomics.notify(sharedBufferView, 0, Infinity);
          })();
        });
      } catch (reject) {
        parentPort.on("message", (msg) => {
          let { sharedBuffer, id } = msg;
          let sharedBufferView = new Int32Array(sharedBuffer);
          workerPort.postMessage({ id, reject, properties: extractProperties(reject) });
          Atomics.add(sharedBufferView, 0, 1);
          Atomics.notify(sharedBufferView, 0, Infinity);
        });
      }
    };
    if (isInternalWorkerThread) {
      startSyncServiceWorker();
    }
    var node_default = node_exports;
  }
});

// scripts/element-start.ts
var import_esbuild = __toESM(require_main(), 1);

// node_modules/chokidar/index.js
import { EventEmitter } from "node:events";
import { stat as statcb, Stats } from "node:fs";
import { readdir as readdir2, stat as stat3 } from "node:fs/promises";
import * as sp2 from "node:path";

// node_modules/readdirp/index.js
import { lstat, readdir, realpath, stat } from "node:fs/promises";
import { join as pjoin, relative as prelative, resolve as presolve, sep as psep } from "node:path";
import { Readable } from "node:stream";
var EntryTypes = {
  FILE_TYPE: "files",
  DIR_TYPE: "directories",
  FILE_DIR_TYPE: "files_directories",
  EVERYTHING_TYPE: "all"
};
var defaultOptions = {
  root: ".",
  fileFilter: (_entryInfo) => true,
  directoryFilter: (_entryInfo) => true,
  type: EntryTypes.FILE_TYPE,
  lstat: false,
  depth: 2147483648,
  alwaysStat: false,
  highWaterMark: 4096
};
Object.freeze(defaultOptions);
var RECURSIVE_ERROR_CODE = "READDIRP_RECURSIVE_ERROR";
var NORMAL_FLOW_ERRORS = /* @__PURE__ */ new Set(["ENOENT", "EPERM", "EACCES", "ELOOP", RECURSIVE_ERROR_CODE]);
var ALL_TYPES = [
  EntryTypes.DIR_TYPE,
  EntryTypes.EVERYTHING_TYPE,
  EntryTypes.FILE_DIR_TYPE,
  EntryTypes.FILE_TYPE
];
var DIR_TYPES = /* @__PURE__ */ new Set([
  EntryTypes.DIR_TYPE,
  EntryTypes.EVERYTHING_TYPE,
  EntryTypes.FILE_DIR_TYPE
]);
var FILE_TYPES = /* @__PURE__ */ new Set([
  EntryTypes.EVERYTHING_TYPE,
  EntryTypes.FILE_DIR_TYPE,
  EntryTypes.FILE_TYPE
]);
var isNormalFlowError = (error) => NORMAL_FLOW_ERRORS.has(error.code);
var wantBigintFsStats = process.platform === "win32";
var emptyFn = (_entryInfo) => true;
var normalizeFilter = (filter) => {
  if (filter === void 0)
    return emptyFn;
  if (typeof filter === "function")
    return filter;
  if (typeof filter === "string") {
    const fl = filter.trim();
    return (entry) => entry.basename === fl;
  }
  if (Array.isArray(filter)) {
    const trItems = filter.map((item) => item.trim());
    return (entry) => trItems.some((f) => entry.basename === f);
  }
  return emptyFn;
};
var ReaddirpStream = class extends Readable {
  parents;
  reading;
  parent;
  _stat;
  _maxDepth;
  _wantsDir;
  _wantsFile;
  _wantsEverything;
  _root;
  _isDirent;
  _statsProp;
  _rdOptions;
  _fileFilter;
  _directoryFilter;
  constructor(options = {}) {
    super({
      objectMode: true,
      autoDestroy: true,
      highWaterMark: options.highWaterMark
    });
    const opts = { ...defaultOptions, ...options };
    const { root: root2, type } = opts;
    this._fileFilter = normalizeFilter(opts.fileFilter);
    this._directoryFilter = normalizeFilter(opts.directoryFilter);
    const statMethod = opts.lstat ? lstat : stat;
    if (wantBigintFsStats) {
      this._stat = (path) => statMethod(path, { bigint: true });
    } else {
      this._stat = statMethod;
    }
    this._maxDepth = opts.depth != null && Number.isSafeInteger(opts.depth) ? opts.depth : defaultOptions.depth;
    this._wantsDir = type ? DIR_TYPES.has(type) : false;
    this._wantsFile = type ? FILE_TYPES.has(type) : false;
    this._wantsEverything = type === EntryTypes.EVERYTHING_TYPE;
    this._root = presolve(root2);
    this._isDirent = !opts.alwaysStat;
    this._statsProp = this._isDirent ? "dirent" : "stats";
    this._rdOptions = { encoding: "utf8", withFileTypes: this._isDirent };
    this.parents = [this._exploreDir(root2, 1)];
    this.reading = false;
    this.parent = void 0;
  }
  async _read(batch) {
    if (this.reading)
      return;
    this.reading = true;
    try {
      while (!this.destroyed && batch > 0) {
        const par = this.parent;
        const fil = par && par.files;
        if (fil && fil.length > 0) {
          const { path, depth } = par;
          const slice = fil.splice(0, batch).map((dirent) => this._formatEntry(dirent, path));
          const awaited = await Promise.all(slice);
          for (const entry of awaited) {
            if (!entry)
              continue;
            if (this.destroyed)
              return;
            const entryType = await this._getEntryType(entry);
            if (entryType === "directory" && this._directoryFilter(entry)) {
              if (depth <= this._maxDepth) {
                this.parents.push(this._exploreDir(entry.fullPath, depth + 1));
              }
              if (this._wantsDir) {
                this.push(entry);
                batch--;
              }
            } else if ((entryType === "file" || this._includeAsFile(entry)) && this._fileFilter(entry)) {
              if (this._wantsFile) {
                this.push(entry);
                batch--;
              }
            }
          }
        } else {
          const parent = this.parents.pop();
          if (!parent) {
            this.push(null);
            break;
          }
          this.parent = await parent;
          if (this.destroyed)
            return;
        }
      }
    } catch (error) {
      this.destroy(error);
    } finally {
      this.reading = false;
    }
  }
  async _exploreDir(path, depth) {
    let files;
    try {
      files = await readdir(path, this._rdOptions);
    } catch (error) {
      this._onError(error);
    }
    return { files, depth, path };
  }
  async _formatEntry(dirent, path) {
    let entry;
    const basename3 = this._isDirent ? dirent.name : dirent;
    try {
      const fullPath = presolve(pjoin(path, basename3));
      entry = { path: prelative(this._root, fullPath), fullPath, basename: basename3 };
      entry[this._statsProp] = this._isDirent ? dirent : await this._stat(fullPath);
    } catch (err) {
      this._onError(err);
      return;
    }
    return entry;
  }
  _onError(err) {
    if (isNormalFlowError(err) && !this.destroyed) {
      this.emit("warn", err);
    } else {
      this.destroy(err);
    }
  }
  async _getEntryType(entry) {
    if (!entry && this._statsProp in entry) {
      return "";
    }
    const stats = entry[this._statsProp];
    if (stats.isFile())
      return "file";
    if (stats.isDirectory())
      return "directory";
    if (stats && stats.isSymbolicLink()) {
      const full = entry.fullPath;
      try {
        const entryRealPath = await realpath(full);
        const entryRealPathStats = await lstat(entryRealPath);
        if (entryRealPathStats.isFile()) {
          return "file";
        }
        if (entryRealPathStats.isDirectory()) {
          const len = entryRealPath.length;
          if (full.startsWith(entryRealPath) && full.substr(len, 1) === psep) {
            const recursiveError = new Error(`Circular symlink detected: "${full}" points to "${entryRealPath}"`);
            recursiveError.code = RECURSIVE_ERROR_CODE;
            return this._onError(recursiveError);
          }
          return "directory";
        }
      } catch (error) {
        this._onError(error);
        return "";
      }
    }
  }
  _includeAsFile(entry) {
    const stats = entry && entry[this._statsProp];
    return stats && this._wantsEverything && !stats.isDirectory();
  }
};
function readdirp(root2, options = {}) {
  let type = options.entryType || options.type;
  if (type === "both")
    type = EntryTypes.FILE_DIR_TYPE;
  if (type)
    options.type = type;
  if (!root2) {
    throw new Error("readdirp: root argument is required. Usage: readdirp(root, options)");
  } else if (typeof root2 !== "string") {
    throw new TypeError("readdirp: root argument must be a string. Usage: readdirp(root, options)");
  } else if (type && !ALL_TYPES.includes(type)) {
    throw new Error(`readdirp: Invalid type passed. Use one of ${ALL_TYPES.join(", ")}`);
  }
  options.root = root2;
  return new ReaddirpStream(options);
}

// node_modules/chokidar/handler.js
import { watch as fs_watch, unwatchFile, watchFile } from "node:fs";
import { realpath as fsrealpath, lstat as lstat2, open, stat as stat2 } from "node:fs/promises";
import { type as osType } from "node:os";
import * as sp from "node:path";
var STR_DATA = "data";
var STR_END = "end";
var STR_CLOSE = "close";
var EMPTY_FN = () => {
};
var pl = process.platform;
var isWindows = pl === "win32";
var isMacos = pl === "darwin";
var isLinux = pl === "linux";
var isFreeBSD = pl === "freebsd";
var isIBMi = osType() === "OS400";
var EVENTS = {
  ALL: "all",
  READY: "ready",
  ADD: "add",
  CHANGE: "change",
  ADD_DIR: "addDir",
  UNLINK: "unlink",
  UNLINK_DIR: "unlinkDir",
  RAW: "raw",
  ERROR: "error"
};
var EV = EVENTS;
var THROTTLE_MODE_WATCH = "watch";
var statMethods = { lstat: lstat2, stat: stat2 };
var KEY_LISTENERS = "listeners";
var KEY_ERR = "errHandlers";
var KEY_RAW = "rawEmitters";
var HANDLER_KEYS = [KEY_LISTENERS, KEY_ERR, KEY_RAW];
var binaryExtensions = /* @__PURE__ */ new Set([
  "3dm",
  "3ds",
  "3g2",
  "3gp",
  "7z",
  "a",
  "aac",
  "adp",
  "afdesign",
  "afphoto",
  "afpub",
  "ai",
  "aif",
  "aiff",
  "alz",
  "ape",
  "apk",
  "appimage",
  "ar",
  "arj",
  "asf",
  "au",
  "avi",
  "bak",
  "baml",
  "bh",
  "bin",
  "bk",
  "bmp",
  "btif",
  "bz2",
  "bzip2",
  "cab",
  "caf",
  "cgm",
  "class",
  "cmx",
  "cpio",
  "cr2",
  "cur",
  "dat",
  "dcm",
  "deb",
  "dex",
  "djvu",
  "dll",
  "dmg",
  "dng",
  "doc",
  "docm",
  "docx",
  "dot",
  "dotm",
  "dra",
  "DS_Store",
  "dsk",
  "dts",
  "dtshd",
  "dvb",
  "dwg",
  "dxf",
  "ecelp4800",
  "ecelp7470",
  "ecelp9600",
  "egg",
  "eol",
  "eot",
  "epub",
  "exe",
  "f4v",
  "fbs",
  "fh",
  "fla",
  "flac",
  "flatpak",
  "fli",
  "flv",
  "fpx",
  "fst",
  "fvt",
  "g3",
  "gh",
  "gif",
  "graffle",
  "gz",
  "gzip",
  "h261",
  "h263",
  "h264",
  "icns",
  "ico",
  "ief",
  "img",
  "ipa",
  "iso",
  "jar",
  "jpeg",
  "jpg",
  "jpgv",
  "jpm",
  "jxr",
  "key",
  "ktx",
  "lha",
  "lib",
  "lvp",
  "lz",
  "lzh",
  "lzma",
  "lzo",
  "m3u",
  "m4a",
  "m4v",
  "mar",
  "mdi",
  "mht",
  "mid",
  "midi",
  "mj2",
  "mka",
  "mkv",
  "mmr",
  "mng",
  "mobi",
  "mov",
  "movie",
  "mp3",
  "mp4",
  "mp4a",
  "mpeg",
  "mpg",
  "mpga",
  "mxu",
  "nef",
  "npx",
  "numbers",
  "nupkg",
  "o",
  "odp",
  "ods",
  "odt",
  "oga",
  "ogg",
  "ogv",
  "otf",
  "ott",
  "pages",
  "pbm",
  "pcx",
  "pdb",
  "pdf",
  "pea",
  "pgm",
  "pic",
  "png",
  "pnm",
  "pot",
  "potm",
  "potx",
  "ppa",
  "ppam",
  "ppm",
  "pps",
  "ppsm",
  "ppsx",
  "ppt",
  "pptm",
  "pptx",
  "psd",
  "pya",
  "pyc",
  "pyo",
  "pyv",
  "qt",
  "rar",
  "ras",
  "raw",
  "resources",
  "rgb",
  "rip",
  "rlc",
  "rmf",
  "rmvb",
  "rpm",
  "rtf",
  "rz",
  "s3m",
  "s7z",
  "scpt",
  "sgi",
  "shar",
  "snap",
  "sil",
  "sketch",
  "slk",
  "smv",
  "snk",
  "so",
  "stl",
  "suo",
  "sub",
  "swf",
  "tar",
  "tbz",
  "tbz2",
  "tga",
  "tgz",
  "thmx",
  "tif",
  "tiff",
  "tlz",
  "ttc",
  "ttf",
  "txz",
  "udf",
  "uvh",
  "uvi",
  "uvm",
  "uvp",
  "uvs",
  "uvu",
  "viv",
  "vob",
  "war",
  "wav",
  "wax",
  "wbmp",
  "wdp",
  "weba",
  "webm",
  "webp",
  "whl",
  "wim",
  "wm",
  "wma",
  "wmv",
  "wmx",
  "woff",
  "woff2",
  "wrm",
  "wvx",
  "xbm",
  "xif",
  "xla",
  "xlam",
  "xls",
  "xlsb",
  "xlsm",
  "xlsx",
  "xlt",
  "xltm",
  "xltx",
  "xm",
  "xmind",
  "xpi",
  "xpm",
  "xwd",
  "xz",
  "z",
  "zip",
  "zipx"
]);
var isBinaryPath = (filePath) => binaryExtensions.has(sp.extname(filePath).slice(1).toLowerCase());
var foreach = (val, fn) => {
  if (val instanceof Set) {
    val.forEach(fn);
  } else {
    fn(val);
  }
};
var addAndConvert = (main, prop, item) => {
  let container = main[prop];
  if (!(container instanceof Set)) {
    main[prop] = container = /* @__PURE__ */ new Set([container]);
  }
  container.add(item);
};
var clearItem = (cont) => (key) => {
  const set = cont[key];
  if (set instanceof Set) {
    set.clear();
  } else {
    delete cont[key];
  }
};
var delFromSet = (main, prop, item) => {
  const container = main[prop];
  if (container instanceof Set) {
    container.delete(item);
  } else if (container === item) {
    delete main[prop];
  }
};
var isEmptySet = (val) => val instanceof Set ? val.size === 0 : !val;
var FsWatchInstances = /* @__PURE__ */ new Map();
function createFsWatchInstance(path, options, listener, errHandler, emitRaw) {
  const handleEvent = (rawEvent, evPath) => {
    listener(path);
    emitRaw(rawEvent, evPath, { watchedPath: path });
    if (evPath && path !== evPath) {
      fsWatchBroadcast(sp.resolve(path, evPath), KEY_LISTENERS, sp.join(path, evPath));
    }
  };
  try {
    return fs_watch(path, {
      persistent: options.persistent
    }, handleEvent);
  } catch (error) {
    errHandler(error);
    return void 0;
  }
}
var fsWatchBroadcast = (fullPath, listenerType, val1, val2, val3) => {
  const cont = FsWatchInstances.get(fullPath);
  if (!cont)
    return;
  foreach(cont[listenerType], (listener) => {
    listener(val1, val2, val3);
  });
};
var setFsWatchListener = (path, fullPath, options, handlers) => {
  const { listener, errHandler, rawEmitter } = handlers;
  let cont = FsWatchInstances.get(fullPath);
  let watcher2;
  if (!options.persistent) {
    watcher2 = createFsWatchInstance(path, options, listener, errHandler, rawEmitter);
    if (!watcher2)
      return;
    return watcher2.close.bind(watcher2);
  }
  if (cont) {
    addAndConvert(cont, KEY_LISTENERS, listener);
    addAndConvert(cont, KEY_ERR, errHandler);
    addAndConvert(cont, KEY_RAW, rawEmitter);
  } else {
    watcher2 = createFsWatchInstance(
      path,
      options,
      fsWatchBroadcast.bind(null, fullPath, KEY_LISTENERS),
      errHandler,
      // no need to use broadcast here
      fsWatchBroadcast.bind(null, fullPath, KEY_RAW)
    );
    if (!watcher2)
      return;
    watcher2.on(EV.ERROR, async (error) => {
      const broadcastErr = fsWatchBroadcast.bind(null, fullPath, KEY_ERR);
      if (cont)
        cont.watcherUnusable = true;
      if (isWindows && error.code === "EPERM") {
        try {
          const fd = await open(path, "r");
          await fd.close();
          broadcastErr(error);
        } catch (err) {
        }
      } else {
        broadcastErr(error);
      }
    });
    cont = {
      listeners: listener,
      errHandlers: errHandler,
      rawEmitters: rawEmitter,
      watcher: watcher2
    };
    FsWatchInstances.set(fullPath, cont);
  }
  return () => {
    delFromSet(cont, KEY_LISTENERS, listener);
    delFromSet(cont, KEY_ERR, errHandler);
    delFromSet(cont, KEY_RAW, rawEmitter);
    if (isEmptySet(cont.listeners)) {
      cont.watcher.close();
      FsWatchInstances.delete(fullPath);
      HANDLER_KEYS.forEach(clearItem(cont));
      cont.watcher = void 0;
      Object.freeze(cont);
    }
  };
};
var FsWatchFileInstances = /* @__PURE__ */ new Map();
var setFsWatchFileListener = (path, fullPath, options, handlers) => {
  const { listener, rawEmitter } = handlers;
  let cont = FsWatchFileInstances.get(fullPath);
  const copts = cont && cont.options;
  if (copts && (copts.persistent < options.persistent || copts.interval > options.interval)) {
    unwatchFile(fullPath);
    cont = void 0;
  }
  if (cont) {
    addAndConvert(cont, KEY_LISTENERS, listener);
    addAndConvert(cont, KEY_RAW, rawEmitter);
  } else {
    cont = {
      listeners: listener,
      rawEmitters: rawEmitter,
      options,
      watcher: watchFile(fullPath, options, (curr, prev) => {
        foreach(cont.rawEmitters, (rawEmitter2) => {
          rawEmitter2(EV.CHANGE, fullPath, { curr, prev });
        });
        const currmtime = curr.mtimeMs;
        if (curr.size !== prev.size || currmtime > prev.mtimeMs || currmtime === 0) {
          foreach(cont.listeners, (listener2) => listener2(path, curr));
        }
      })
    };
    FsWatchFileInstances.set(fullPath, cont);
  }
  return () => {
    delFromSet(cont, KEY_LISTENERS, listener);
    delFromSet(cont, KEY_RAW, rawEmitter);
    if (isEmptySet(cont.listeners)) {
      FsWatchFileInstances.delete(fullPath);
      unwatchFile(fullPath);
      cont.options = cont.watcher = void 0;
      Object.freeze(cont);
    }
  };
};
var NodeFsHandler = class {
  fsw;
  _boundHandleError;
  constructor(fsW) {
    this.fsw = fsW;
    this._boundHandleError = (error) => fsW._handleError(error);
  }
  /**
   * Watch file for changes with fs_watchFile or fs_watch.
   * @param path to file or dir
   * @param listener on fs change
   * @returns closer for the watcher instance
   */
  _watchWithNodeFs(path, listener) {
    const opts = this.fsw.options;
    const directory = sp.dirname(path);
    const basename3 = sp.basename(path);
    const parent = this.fsw._getWatchedDir(directory);
    parent.add(basename3);
    const absolutePath = sp.resolve(path);
    const options = {
      persistent: opts.persistent
    };
    if (!listener)
      listener = EMPTY_FN;
    let closer;
    if (opts.usePolling) {
      const enableBin = opts.interval !== opts.binaryInterval;
      options.interval = enableBin && isBinaryPath(basename3) ? opts.binaryInterval : opts.interval;
      closer = setFsWatchFileListener(path, absolutePath, options, {
        listener,
        rawEmitter: this.fsw._emitRaw
      });
    } else {
      closer = setFsWatchListener(path, absolutePath, options, {
        listener,
        errHandler: this._boundHandleError,
        rawEmitter: this.fsw._emitRaw
      });
    }
    return closer;
  }
  /**
   * Watch a file and emit add event if warranted.
   * @returns closer for the watcher instance
   */
  _handleFile(file, stats, initialAdd) {
    if (this.fsw.closed) {
      return;
    }
    const dirname5 = sp.dirname(file);
    const basename3 = sp.basename(file);
    const parent = this.fsw._getWatchedDir(dirname5);
    let prevStats = stats;
    if (parent.has(basename3))
      return;
    const listener = async (path, newStats) => {
      if (!this.fsw._throttle(THROTTLE_MODE_WATCH, file, 5))
        return;
      if (!newStats || newStats.mtimeMs === 0) {
        try {
          const newStats2 = await stat2(file);
          if (this.fsw.closed)
            return;
          const at = newStats2.atimeMs;
          const mt = newStats2.mtimeMs;
          if (!at || at <= mt || mt !== prevStats.mtimeMs) {
            this.fsw._emit(EV.CHANGE, file, newStats2);
          }
          if ((isMacos || isLinux || isFreeBSD) && prevStats.ino !== newStats2.ino) {
            this.fsw._closeFile(path);
            prevStats = newStats2;
            const closer2 = this._watchWithNodeFs(file, listener);
            if (closer2)
              this.fsw._addPathCloser(path, closer2);
          } else {
            prevStats = newStats2;
          }
        } catch (error) {
          this.fsw._remove(dirname5, basename3);
        }
      } else if (parent.has(basename3)) {
        const at = newStats.atimeMs;
        const mt = newStats.mtimeMs;
        if (!at || at <= mt || mt !== prevStats.mtimeMs) {
          this.fsw._emit(EV.CHANGE, file, newStats);
        }
        prevStats = newStats;
      }
    };
    const closer = this._watchWithNodeFs(file, listener);
    if (!(initialAdd && this.fsw.options.ignoreInitial) && this.fsw._isntIgnored(file)) {
      if (!this.fsw._throttle(EV.ADD, file, 0))
        return;
      this.fsw._emit(EV.ADD, file, stats);
    }
    return closer;
  }
  /**
   * Handle symlinks encountered while reading a dir.
   * @param entry returned by readdirp
   * @param directory path of dir being read
   * @param path of this item
   * @param item basename of this item
   * @returns true if no more processing is needed for this entry.
   */
  async _handleSymlink(entry, directory, path, item) {
    if (this.fsw.closed) {
      return;
    }
    const full = entry.fullPath;
    const dir = this.fsw._getWatchedDir(directory);
    if (!this.fsw.options.followSymlinks) {
      this.fsw._incrReadyCount();
      let linkPath;
      try {
        linkPath = await fsrealpath(path);
      } catch (e) {
        this.fsw._emitReady();
        return true;
      }
      if (this.fsw.closed)
        return;
      if (dir.has(item)) {
        if (this.fsw._symlinkPaths.get(full) !== linkPath) {
          this.fsw._symlinkPaths.set(full, linkPath);
          this.fsw._emit(EV.CHANGE, path, entry.stats);
        }
      } else {
        dir.add(item);
        this.fsw._symlinkPaths.set(full, linkPath);
        this.fsw._emit(EV.ADD, path, entry.stats);
      }
      this.fsw._emitReady();
      return true;
    }
    if (this.fsw._symlinkPaths.has(full)) {
      return true;
    }
    this.fsw._symlinkPaths.set(full, true);
  }
  _handleRead(directory, initialAdd, wh, target, dir, depth, throttler) {
    directory = sp.join(directory, "");
    const throttleKey = target ? `${directory}:${target}` : directory;
    throttler = this.fsw._throttle("readdir", throttleKey, 1e3);
    if (!throttler)
      return;
    const previous = this.fsw._getWatchedDir(wh.path);
    const current = /* @__PURE__ */ new Set();
    let stream = this.fsw._readdirp(directory, {
      fileFilter: (entry) => wh.filterPath(entry),
      directoryFilter: (entry) => wh.filterDir(entry)
    });
    if (!stream)
      return;
    stream.on(STR_DATA, async (entry) => {
      if (this.fsw.closed) {
        stream = void 0;
        return;
      }
      const item = entry.path;
      let path = sp.join(directory, item);
      current.add(item);
      if (entry.stats.isSymbolicLink() && await this._handleSymlink(entry, directory, path, item)) {
        return;
      }
      if (this.fsw.closed) {
        stream = void 0;
        return;
      }
      if (item === target || !target && !previous.has(item)) {
        this.fsw._incrReadyCount();
        path = sp.join(dir, sp.relative(dir, path));
        this._addToNodeFs(path, initialAdd, wh, depth + 1);
      }
    }).on(EV.ERROR, this._boundHandleError);
    return new Promise((resolve3, reject) => {
      if (!stream)
        return reject();
      stream.once(STR_END, () => {
        if (this.fsw.closed) {
          stream = void 0;
          return;
        }
        const wasThrottled = throttler ? throttler.clear() : false;
        resolve3(void 0);
        previous.getChildren().filter((item) => {
          return item !== directory && !current.has(item);
        }).forEach((item) => {
          this.fsw._remove(directory, item);
        });
        stream = void 0;
        if (wasThrottled)
          this._handleRead(directory, false, wh, target, dir, depth, throttler);
      });
    });
  }
  /**
   * Read directory to add / remove files from `@watched` list and re-read it on change.
   * @param dir fs path
   * @param stats
   * @param initialAdd
   * @param depth relative to user-supplied path
   * @param target child path targeted for watch
   * @param wh Common watch helpers for this path
   * @param realpath
   * @returns closer for the watcher instance.
   */
  async _handleDir(dir, stats, initialAdd, depth, target, wh, realpath2) {
    const parentDir = this.fsw._getWatchedDir(sp.dirname(dir));
    const tracked = parentDir.has(sp.basename(dir));
    if (!(initialAdd && this.fsw.options.ignoreInitial) && !target && !tracked) {
      this.fsw._emit(EV.ADD_DIR, dir, stats);
    }
    parentDir.add(sp.basename(dir));
    this.fsw._getWatchedDir(dir);
    let throttler;
    let closer;
    const oDepth = this.fsw.options.depth;
    if ((oDepth == null || depth <= oDepth) && !this.fsw._symlinkPaths.has(realpath2)) {
      if (!target) {
        await this._handleRead(dir, initialAdd, wh, target, dir, depth, throttler);
        if (this.fsw.closed)
          return;
      }
      closer = this._watchWithNodeFs(dir, (dirPath, stats2) => {
        if (stats2 && stats2.mtimeMs === 0)
          return;
        this._handleRead(dirPath, false, wh, target, dir, depth, throttler);
      });
    }
    return closer;
  }
  /**
   * Handle added file, directory, or glob pattern.
   * Delegates call to _handleFile / _handleDir after checks.
   * @param path to file or ir
   * @param initialAdd was the file added at watch instantiation?
   * @param priorWh depth relative to user-supplied path
   * @param depth Child path actually targeted for watch
   * @param target Child path actually targeted for watch
   */
  async _addToNodeFs(path, initialAdd, priorWh, depth, target) {
    const ready = this.fsw._emitReady;
    if (this.fsw._isIgnored(path) || this.fsw.closed) {
      ready();
      return false;
    }
    const wh = this.fsw._getWatchHelpers(path);
    if (priorWh) {
      wh.filterPath = (entry) => priorWh.filterPath(entry);
      wh.filterDir = (entry) => priorWh.filterDir(entry);
    }
    try {
      const stats = await statMethods[wh.statMethod](wh.watchPath);
      if (this.fsw.closed)
        return;
      if (this.fsw._isIgnored(wh.watchPath, stats)) {
        ready();
        return false;
      }
      const follow = this.fsw.options.followSymlinks;
      let closer;
      if (stats.isDirectory()) {
        const absPath = sp.resolve(path);
        const targetPath = follow ? await fsrealpath(path) : path;
        if (this.fsw.closed)
          return;
        closer = await this._handleDir(wh.watchPath, stats, initialAdd, depth, target, wh, targetPath);
        if (this.fsw.closed)
          return;
        if (absPath !== targetPath && targetPath !== void 0) {
          this.fsw._symlinkPaths.set(absPath, targetPath);
        }
      } else if (stats.isSymbolicLink()) {
        const targetPath = follow ? await fsrealpath(path) : path;
        if (this.fsw.closed)
          return;
        const parent = sp.dirname(wh.watchPath);
        this.fsw._getWatchedDir(parent).add(wh.watchPath);
        this.fsw._emit(EV.ADD, wh.watchPath, stats);
        closer = await this._handleDir(parent, stats, initialAdd, depth, path, wh, targetPath);
        if (this.fsw.closed)
          return;
        if (targetPath !== void 0) {
          this.fsw._symlinkPaths.set(sp.resolve(path), targetPath);
        }
      } else {
        closer = this._handleFile(wh.watchPath, stats, initialAdd);
      }
      ready();
      if (closer)
        this.fsw._addPathCloser(path, closer);
      return false;
    } catch (error) {
      if (this.fsw._handleError(error)) {
        ready();
        return path;
      }
    }
  }
};

// node_modules/chokidar/index.js
var SLASH = "/";
var SLASH_SLASH = "//";
var ONE_DOT = ".";
var TWO_DOTS = "..";
var STRING_TYPE = "string";
var BACK_SLASH_RE = /\\/g;
var DOUBLE_SLASH_RE = /\/\//g;
var DOT_RE = /\..*\.(sw[px])$|~$|\.subl.*\.tmp/;
var REPLACER_RE = /^\.[/\\]/;
function arrify(item) {
  return Array.isArray(item) ? item : [item];
}
var isMatcherObject = (matcher) => typeof matcher === "object" && matcher !== null && !(matcher instanceof RegExp);
function createPattern(matcher) {
  if (typeof matcher === "function")
    return matcher;
  if (typeof matcher === "string")
    return (string) => matcher === string;
  if (matcher instanceof RegExp)
    return (string) => matcher.test(string);
  if (typeof matcher === "object" && matcher !== null) {
    return (string) => {
      if (matcher.path === string)
        return true;
      if (matcher.recursive) {
        const relative3 = sp2.relative(matcher.path, string);
        if (!relative3) {
          return false;
        }
        return !relative3.startsWith("..") && !sp2.isAbsolute(relative3);
      }
      return false;
    };
  }
  return () => false;
}
function normalizePath(path) {
  if (typeof path !== "string")
    throw new Error("string expected");
  path = sp2.normalize(path);
  path = path.replace(/\\/g, "/");
  let prepend = false;
  if (path.startsWith("//"))
    prepend = true;
  path = path.replace(DOUBLE_SLASH_RE, "/");
  if (prepend)
    path = "/" + path;
  return path;
}
function matchPatterns(patterns, testString, stats) {
  const path = normalizePath(testString);
  for (let index = 0; index < patterns.length; index++) {
    const pattern = patterns[index];
    if (pattern(path, stats)) {
      return true;
    }
  }
  return false;
}
function anymatch(matchers, testString) {
  if (matchers == null) {
    throw new TypeError("anymatch: specify first argument");
  }
  const matchersArray = arrify(matchers);
  const patterns = matchersArray.map((matcher) => createPattern(matcher));
  if (testString == null) {
    return (testString2, stats) => {
      return matchPatterns(patterns, testString2, stats);
    };
  }
  return matchPatterns(patterns, testString);
}
var unifyPaths = (paths_) => {
  const paths = arrify(paths_).flat();
  if (!paths.every((p) => typeof p === STRING_TYPE)) {
    throw new TypeError(`Non-string provided as watch path: ${paths}`);
  }
  return paths.map(normalizePathToUnix);
};
var toUnix = (string) => {
  let str = string.replace(BACK_SLASH_RE, SLASH);
  let prepend = false;
  if (str.startsWith(SLASH_SLASH)) {
    prepend = true;
  }
  str = str.replace(DOUBLE_SLASH_RE, SLASH);
  if (prepend) {
    str = SLASH + str;
  }
  return str;
};
var normalizePathToUnix = (path) => toUnix(sp2.normalize(toUnix(path)));
var normalizeIgnored = (cwd = "") => (path) => {
  if (typeof path === "string") {
    return normalizePathToUnix(sp2.isAbsolute(path) ? path : sp2.join(cwd, path));
  } else {
    return path;
  }
};
var getAbsolutePath = (path, cwd) => {
  if (sp2.isAbsolute(path)) {
    return path;
  }
  return sp2.join(cwd, path);
};
var EMPTY_SET = Object.freeze(/* @__PURE__ */ new Set());
var DirEntry = class {
  path;
  _removeWatcher;
  items;
  constructor(dir, removeWatcher) {
    this.path = dir;
    this._removeWatcher = removeWatcher;
    this.items = /* @__PURE__ */ new Set();
  }
  add(item) {
    const { items } = this;
    if (!items)
      return;
    if (item !== ONE_DOT && item !== TWO_DOTS)
      items.add(item);
  }
  async remove(item) {
    const { items } = this;
    if (!items)
      return;
    items.delete(item);
    if (items.size > 0)
      return;
    const dir = this.path;
    try {
      await readdir2(dir);
    } catch (err) {
      if (this._removeWatcher) {
        this._removeWatcher(sp2.dirname(dir), sp2.basename(dir));
      }
    }
  }
  has(item) {
    const { items } = this;
    if (!items)
      return;
    return items.has(item);
  }
  getChildren() {
    const { items } = this;
    if (!items)
      return [];
    return [...items.values()];
  }
  dispose() {
    this.items.clear();
    this.path = "";
    this._removeWatcher = EMPTY_FN;
    this.items = EMPTY_SET;
    Object.freeze(this);
  }
};
var STAT_METHOD_F = "stat";
var STAT_METHOD_L = "lstat";
var WatchHelper = class {
  fsw;
  path;
  watchPath;
  fullWatchPath;
  dirParts;
  followSymlinks;
  statMethod;
  constructor(path, follow, fsw) {
    this.fsw = fsw;
    const watchPath = path;
    this.path = path = path.replace(REPLACER_RE, "");
    this.watchPath = watchPath;
    this.fullWatchPath = sp2.resolve(watchPath);
    this.dirParts = [];
    this.dirParts.forEach((parts) => {
      if (parts.length > 1)
        parts.pop();
    });
    this.followSymlinks = follow;
    this.statMethod = follow ? STAT_METHOD_F : STAT_METHOD_L;
  }
  entryPath(entry) {
    return sp2.join(this.watchPath, sp2.relative(this.watchPath, entry.fullPath));
  }
  filterPath(entry) {
    const { stats } = entry;
    if (stats && stats.isSymbolicLink())
      return this.filterDir(entry);
    const resolvedPath = this.entryPath(entry);
    return this.fsw._isntIgnored(resolvedPath, stats) && this.fsw._hasReadPermissions(stats);
  }
  filterDir(entry) {
    return this.fsw._isntIgnored(this.entryPath(entry), entry.stats);
  }
};
var FSWatcher = class extends EventEmitter {
  closed;
  options;
  _closers;
  _ignoredPaths;
  _throttled;
  _streams;
  _symlinkPaths;
  _watched;
  _pendingWrites;
  _pendingUnlinks;
  _readyCount;
  _emitReady;
  _closePromise;
  _userIgnored;
  _readyEmitted;
  _emitRaw;
  _boundRemove;
  _nodeFsHandler;
  // Not indenting methods for history sake; for now.
  constructor(_opts = {}) {
    super();
    this.closed = false;
    this._closers = /* @__PURE__ */ new Map();
    this._ignoredPaths = /* @__PURE__ */ new Set();
    this._throttled = /* @__PURE__ */ new Map();
    this._streams = /* @__PURE__ */ new Set();
    this._symlinkPaths = /* @__PURE__ */ new Map();
    this._watched = /* @__PURE__ */ new Map();
    this._pendingWrites = /* @__PURE__ */ new Map();
    this._pendingUnlinks = /* @__PURE__ */ new Map();
    this._readyCount = 0;
    this._readyEmitted = false;
    const awf = _opts.awaitWriteFinish;
    const DEF_AWF = { stabilityThreshold: 2e3, pollInterval: 100 };
    const opts = {
      // Defaults
      persistent: true,
      ignoreInitial: false,
      ignorePermissionErrors: false,
      interval: 100,
      binaryInterval: 300,
      followSymlinks: true,
      usePolling: false,
      // useAsync: false,
      atomic: true,
      // NOTE: overwritten later (depends on usePolling)
      ..._opts,
      // Change format
      ignored: _opts.ignored ? arrify(_opts.ignored) : arrify([]),
      awaitWriteFinish: awf === true ? DEF_AWF : typeof awf === "object" ? { ...DEF_AWF, ...awf } : false
    };
    if (isIBMi)
      opts.usePolling = true;
    if (opts.atomic === void 0)
      opts.atomic = !opts.usePolling;
    const envPoll = process.env.CHOKIDAR_USEPOLLING;
    if (envPoll !== void 0) {
      const envLower = envPoll.toLowerCase();
      if (envLower === "false" || envLower === "0")
        opts.usePolling = false;
      else if (envLower === "true" || envLower === "1")
        opts.usePolling = true;
      else
        opts.usePolling = !!envLower;
    }
    const envInterval = process.env.CHOKIDAR_INTERVAL;
    if (envInterval)
      opts.interval = Number.parseInt(envInterval, 10);
    let readyCalls = 0;
    this._emitReady = () => {
      readyCalls++;
      if (readyCalls >= this._readyCount) {
        this._emitReady = EMPTY_FN;
        this._readyEmitted = true;
        process.nextTick(() => this.emit(EVENTS.READY));
      }
    };
    this._emitRaw = (...args) => this.emit(EVENTS.RAW, ...args);
    this._boundRemove = this._remove.bind(this);
    this.options = opts;
    this._nodeFsHandler = new NodeFsHandler(this);
    Object.freeze(opts);
  }
  _addIgnoredPath(matcher) {
    if (isMatcherObject(matcher)) {
      for (const ignored of this._ignoredPaths) {
        if (isMatcherObject(ignored) && ignored.path === matcher.path && ignored.recursive === matcher.recursive) {
          return;
        }
      }
    }
    this._ignoredPaths.add(matcher);
  }
  _removeIgnoredPath(matcher) {
    this._ignoredPaths.delete(matcher);
    if (typeof matcher === "string") {
      for (const ignored of this._ignoredPaths) {
        if (isMatcherObject(ignored) && ignored.path === matcher) {
          this._ignoredPaths.delete(ignored);
        }
      }
    }
  }
  // Public methods
  /**
   * Adds paths to be watched on an existing FSWatcher instance.
   * @param paths_ file or file list. Other arguments are unused
   */
  add(paths_, _origAdd, _internal) {
    const { cwd } = this.options;
    this.closed = false;
    this._closePromise = void 0;
    let paths = unifyPaths(paths_);
    if (cwd) {
      paths = paths.map((path) => {
        const absPath = getAbsolutePath(path, cwd);
        return absPath;
      });
    }
    paths.forEach((path) => {
      this._removeIgnoredPath(path);
    });
    this._userIgnored = void 0;
    if (!this._readyCount)
      this._readyCount = 0;
    this._readyCount += paths.length;
    Promise.all(paths.map(async (path) => {
      const res = await this._nodeFsHandler._addToNodeFs(path, !_internal, void 0, 0, _origAdd);
      if (res)
        this._emitReady();
      return res;
    })).then((results) => {
      if (this.closed)
        return;
      results.forEach((item) => {
        if (item)
          this.add(sp2.dirname(item), sp2.basename(_origAdd || item));
      });
    });
    return this;
  }
  /**
   * Close watchers or start ignoring events from specified paths.
   */
  unwatch(paths_) {
    if (this.closed)
      return this;
    const paths = unifyPaths(paths_);
    const { cwd } = this.options;
    paths.forEach((path) => {
      if (!sp2.isAbsolute(path) && !this._closers.has(path)) {
        if (cwd)
          path = sp2.join(cwd, path);
        path = sp2.resolve(path);
      }
      this._closePath(path);
      this._addIgnoredPath(path);
      if (this._watched.has(path)) {
        this._addIgnoredPath({
          path,
          recursive: true
        });
      }
      this._userIgnored = void 0;
    });
    return this;
  }
  /**
   * Close watchers and remove all listeners from watched paths.
   */
  close() {
    if (this._closePromise) {
      return this._closePromise;
    }
    this.closed = true;
    this.removeAllListeners();
    const closers = [];
    this._closers.forEach((closerList) => closerList.forEach((closer) => {
      const promise = closer();
      if (promise instanceof Promise)
        closers.push(promise);
    }));
    this._streams.forEach((stream) => stream.destroy());
    this._userIgnored = void 0;
    this._readyCount = 0;
    this._readyEmitted = false;
    this._watched.forEach((dirent) => dirent.dispose());
    this._closers.clear();
    this._watched.clear();
    this._streams.clear();
    this._symlinkPaths.clear();
    this._throttled.clear();
    this._closePromise = closers.length ? Promise.all(closers).then(() => void 0) : Promise.resolve();
    return this._closePromise;
  }
  /**
   * Expose list of watched paths
   * @returns for chaining
   */
  getWatched() {
    const watchList = {};
    this._watched.forEach((entry, dir) => {
      const key = this.options.cwd ? sp2.relative(this.options.cwd, dir) : dir;
      const index = key || ONE_DOT;
      watchList[index] = entry.getChildren().sort();
    });
    return watchList;
  }
  emitWithAll(event, args) {
    this.emit(event, ...args);
    if (event !== EVENTS.ERROR)
      this.emit(EVENTS.ALL, event, ...args);
  }
  // Common helpers
  // --------------
  /**
   * Normalize and emit events.
   * Calling _emit DOES NOT MEAN emit() would be called!
   * @param event Type of event
   * @param path File or directory path
   * @param stats arguments to be passed with event
   * @returns the error if defined, otherwise the value of the FSWatcher instance's `closed` flag
   */
  async _emit(event, path, stats) {
    if (this.closed)
      return;
    const opts = this.options;
    if (isWindows)
      path = sp2.normalize(path);
    if (opts.cwd)
      path = sp2.relative(opts.cwd, path);
    const args = [path];
    if (stats != null)
      args.push(stats);
    const awf = opts.awaitWriteFinish;
    let pw;
    if (awf && (pw = this._pendingWrites.get(path))) {
      pw.lastChange = /* @__PURE__ */ new Date();
      return this;
    }
    if (opts.atomic) {
      if (event === EVENTS.UNLINK) {
        this._pendingUnlinks.set(path, [event, ...args]);
        setTimeout(() => {
          this._pendingUnlinks.forEach((entry, path2) => {
            this.emit(...entry);
            this.emit(EVENTS.ALL, ...entry);
            this._pendingUnlinks.delete(path2);
          });
        }, typeof opts.atomic === "number" ? opts.atomic : 100);
        return this;
      }
      if (event === EVENTS.ADD && this._pendingUnlinks.has(path)) {
        event = EVENTS.CHANGE;
        this._pendingUnlinks.delete(path);
      }
    }
    if (awf && (event === EVENTS.ADD || event === EVENTS.CHANGE) && this._readyEmitted) {
      const awfEmit = (err, stats2) => {
        if (err) {
          event = EVENTS.ERROR;
          args[0] = err;
          this.emitWithAll(event, args);
        } else if (stats2) {
          if (args.length > 1) {
            args[1] = stats2;
          } else {
            args.push(stats2);
          }
          this.emitWithAll(event, args);
        }
      };
      this._awaitWriteFinish(path, awf.stabilityThreshold, event, awfEmit);
      return this;
    }
    if (event === EVENTS.CHANGE) {
      const isThrottled = !this._throttle(EVENTS.CHANGE, path, 50);
      if (isThrottled)
        return this;
    }
    if (opts.alwaysStat && stats === void 0 && (event === EVENTS.ADD || event === EVENTS.ADD_DIR || event === EVENTS.CHANGE)) {
      const fullPath = opts.cwd ? sp2.join(opts.cwd, path) : path;
      let stats2;
      try {
        stats2 = await stat3(fullPath);
      } catch (err) {
      }
      if (!stats2 || this.closed)
        return;
      args.push(stats2);
    }
    this.emitWithAll(event, args);
    return this;
  }
  /**
   * Common handler for errors
   * @returns The error if defined, otherwise the value of the FSWatcher instance's `closed` flag
   */
  _handleError(error) {
    const code = error && error.code;
    if (error && code !== "ENOENT" && code !== "ENOTDIR" && (!this.options.ignorePermissionErrors || code !== "EPERM" && code !== "EACCES")) {
      this.emit(EVENTS.ERROR, error);
    }
    return error || this.closed;
  }
  /**
   * Helper utility for throttling
   * @param actionType type being throttled
   * @param path being acted upon
   * @param timeout duration of time to suppress duplicate actions
   * @returns tracking object or false if action should be suppressed
   */
  _throttle(actionType, path, timeout) {
    if (!this._throttled.has(actionType)) {
      this._throttled.set(actionType, /* @__PURE__ */ new Map());
    }
    const action = this._throttled.get(actionType);
    if (!action)
      throw new Error("invalid throttle");
    const actionPath = action.get(path);
    if (actionPath) {
      actionPath.count++;
      return false;
    }
    let timeoutObject;
    const clear = () => {
      const item = action.get(path);
      const count = item ? item.count : 0;
      action.delete(path);
      clearTimeout(timeoutObject);
      if (item)
        clearTimeout(item.timeoutObject);
      return count;
    };
    timeoutObject = setTimeout(clear, timeout);
    const thr = { timeoutObject, clear, count: 0 };
    action.set(path, thr);
    return thr;
  }
  _incrReadyCount() {
    return this._readyCount++;
  }
  /**
   * Awaits write operation to finish.
   * Polls a newly created file for size variations. When files size does not change for 'threshold' milliseconds calls callback.
   * @param path being acted upon
   * @param threshold Time in milliseconds a file size must be fixed before acknowledging write OP is finished
   * @param event
   * @param awfEmit Callback to be called when ready for event to be emitted.
   */
  _awaitWriteFinish(path, threshold, event, awfEmit) {
    const awf = this.options.awaitWriteFinish;
    if (typeof awf !== "object")
      return;
    const pollInterval = awf.pollInterval;
    let timeoutHandler;
    let fullPath = path;
    if (this.options.cwd && !sp2.isAbsolute(path)) {
      fullPath = sp2.join(this.options.cwd, path);
    }
    const now = /* @__PURE__ */ new Date();
    const writes = this._pendingWrites;
    function awaitWriteFinishFn(prevStat) {
      statcb(fullPath, (err, curStat) => {
        if (err || !writes.has(path)) {
          if (err && err.code !== "ENOENT")
            awfEmit(err);
          return;
        }
        const now2 = Number(/* @__PURE__ */ new Date());
        if (prevStat && curStat.size !== prevStat.size) {
          writes.get(path).lastChange = now2;
        }
        const pw = writes.get(path);
        const df = now2 - pw.lastChange;
        if (df >= threshold) {
          writes.delete(path);
          awfEmit(void 0, curStat);
        } else {
          timeoutHandler = setTimeout(awaitWriteFinishFn, pollInterval, curStat);
        }
      });
    }
    if (!writes.has(path)) {
      writes.set(path, {
        lastChange: now,
        cancelWait: () => {
          writes.delete(path);
          clearTimeout(timeoutHandler);
          return event;
        }
      });
      timeoutHandler = setTimeout(awaitWriteFinishFn, pollInterval);
    }
  }
  /**
   * Determines whether user has asked to ignore this path.
   */
  _isIgnored(path, stats) {
    if (this.options.atomic && DOT_RE.test(path))
      return true;
    if (!this._userIgnored) {
      const { cwd } = this.options;
      const ign = this.options.ignored;
      const ignored = (ign || []).map(normalizeIgnored(cwd));
      const ignoredPaths = [...this._ignoredPaths];
      const list = [...ignoredPaths.map(normalizeIgnored(cwd)), ...ignored];
      this._userIgnored = anymatch(list, void 0);
    }
    return this._userIgnored(path, stats);
  }
  _isntIgnored(path, stat4) {
    return !this._isIgnored(path, stat4);
  }
  /**
   * Provides a set of common helpers and properties relating to symlink handling.
   * @param path file or directory pattern being watched
   */
  _getWatchHelpers(path) {
    return new WatchHelper(path, this.options.followSymlinks, this);
  }
  // Directory helpers
  // -----------------
  /**
   * Provides directory tracking objects
   * @param directory path of the directory
   */
  _getWatchedDir(directory) {
    const dir = sp2.resolve(directory);
    if (!this._watched.has(dir))
      this._watched.set(dir, new DirEntry(dir, this._boundRemove));
    return this._watched.get(dir);
  }
  // File helpers
  // ------------
  /**
   * Check for read permissions: https://stackoverflow.com/a/11781404/1358405
   */
  _hasReadPermissions(stats) {
    if (this.options.ignorePermissionErrors)
      return true;
    return Boolean(Number(stats.mode) & 256);
  }
  /**
   * Handles emitting unlink events for
   * files and directories, and via recursion, for
   * files and directories within directories that are unlinked
   * @param directory within which the following item is located
   * @param item      base path of item/directory
   */
  _remove(directory, item, isDirectory) {
    const path = sp2.join(directory, item);
    const fullPath = sp2.resolve(path);
    isDirectory = isDirectory != null ? isDirectory : this._watched.has(path) || this._watched.has(fullPath);
    if (!this._throttle("remove", path, 100))
      return;
    if (!isDirectory && this._watched.size === 1) {
      this.add(directory, item, true);
    }
    const wp = this._getWatchedDir(path);
    const nestedDirectoryChildren = wp.getChildren();
    nestedDirectoryChildren.forEach((nested) => this._remove(path, nested));
    const parent = this._getWatchedDir(directory);
    const wasTracked = parent.has(item);
    parent.remove(item);
    if (this._symlinkPaths.has(fullPath)) {
      this._symlinkPaths.delete(fullPath);
    }
    let relPath = path;
    if (this.options.cwd)
      relPath = sp2.relative(this.options.cwd, path);
    if (this.options.awaitWriteFinish && this._pendingWrites.has(relPath)) {
      const event = this._pendingWrites.get(relPath).cancelWait();
      if (event === EVENTS.ADD)
        return;
    }
    this._watched.delete(path);
    this._watched.delete(fullPath);
    const eventName = isDirectory ? EVENTS.UNLINK_DIR : EVENTS.UNLINK;
    if (wasTracked && !this._isIgnored(path))
      this._emit(eventName, path);
    this._closePath(path);
  }
  /**
   * Closes all watchers for a path
   */
  _closePath(path) {
    this._closeFile(path);
    const dir = sp2.dirname(path);
    this._getWatchedDir(dir).remove(sp2.basename(path));
  }
  /**
   * Closes only file-specific watchers
   */
  _closeFile(path) {
    const closers = this._closers.get(path);
    if (!closers)
      return;
    closers.forEach((closer) => closer());
    this._closers.delete(path);
  }
  _addPathCloser(path, closer) {
    if (!closer)
      return;
    let list = this._closers.get(path);
    if (!list) {
      list = [];
      this._closers.set(path, list);
    }
    list.push(closer);
  }
  _readdirp(root2, opts) {
    if (this.closed)
      return;
    const options = { type: EVENTS.ALL, alwaysStat: true, lstat: true, ...opts, depth: 0 };
    let stream = readdirp(root2, options);
    this._streams.add(stream);
    stream.once(STR_CLOSE, () => {
      stream = void 0;
    });
    stream.once(STR_END, () => {
      if (stream) {
        this._streams.delete(stream);
        stream = void 0;
      }
    });
    return stream;
  }
};
function watch(paths, options = {}) {
  const watcher2 = new FSWatcher(options);
  watcher2.add(paths);
  return watcher2;
}
var chokidar_default = { watch, FSWatcher };

// scripts/element-start.ts
import { pathToFileURL, fileURLToPath } from "node:url";
import { join as join5, sep as sep3, dirname as dirname4 } from "node:path";
import { copyFile, readFile as readFile4, writeFile as writeFile2 } from "node:fs/promises";

// scripts/fileExists.ts
import { access } from "node:fs/promises";
import { constants } from "node:fs";
async function fileExists(filePath) {
  try {
    await access(filePath, constants.F_OK);
    return true;
  } catch (error) {
    return false;
  }
}

// scripts/folderExists.ts
import { access as access2 } from "node:fs/promises";
import { constants as constants2 } from "node:fs";
async function folderExists(folderPath) {
  try {
    await access2(folderPath, constants2.F_OK);
    return true;
  } catch (error) {
    return false;
  }
}

// scripts/playgroundPlugin.ts
import { join as join3 } from "node:path";

// scripts/getDirectories.ts
import { readdir as readdir3 } from "node:fs/promises";
async function getDirectories(dirPath) {
  const directories = [];
  try {
    const entries = await readdir3(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        directories.push(entry.name);
      }
    }
  } catch (err) {
    console.error("Error reading directory:", err);
  }
  return directories;
}

// scripts/playgroundPlugin.ts
import { readFile } from "node:fs/promises";

// scripts/capitalizeFirstChracter.ts
function capitalizeFirstCharacter(str) {
  if (!str) {
    return str;
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// scripts/camelToDash.ts
function camelToDash(str) {
  return str.replace(/([a-zA-Z])(?=[A-Z])/g, "$1-").toLowerCase();
}

// scripts/playgroundPlugin.ts
var red = (text) => `\x1B[31m${text}\x1B[0m`;
var rootDir = process.cwd();
var srcDir = "src";
var componentsDir = "components";
function playgroundPlugin(options) {
  return {
    name: "playground-plugin",
    setup(build) {
      const entryPointName = "playground-entry";
      const virtualNamespace = "playground-module";
      build.onResolve({ filter: new RegExp(`^${entryPointName}$`) }, (args) => {
        return {
          path: entryPointName,
          namespace: virtualNamespace
        };
      });
      build.onLoad({ filter: /.*/, namespace: virtualNamespace }, async (args) => {
        const entryPoints2 = [];
        const namespaces = await getDirectories(join3(srcDir, componentsDir));
        if (namespaces.length === 0) {
          console.log(red('Missing at least 1 namespace folder under "src/components/"'));
          process.exit();
        }
        const meta = [];
        for (let namespace2 of namespaces) {
          const metaNamespace = {
            namespace: namespace2,
            components: []
          };
          meta.push(metaNamespace);
          const namespaceDir = join3(srcDir, componentsDir, namespace2);
          const components = await getDirectories(namespaceDir);
          for (let component of components) {
            if (await fileExists(join3(srcDir, componentsDir, namespace2, component, `${component}.ts`))) {
              let readme = "";
              if (await fileExists(join3(srcDir, componentsDir, namespace2, component, "README.md"))) {
                readme = await readFile(join3(srcDir, componentsDir, namespace2, component, "README.md"), "utf8");
              }
              const metaComponent = {
                namespace: namespace2,
                component,
                tag: `${namespace2}-${camelToDash(component)}`,
                examples: [],
                className: "",
                classExtends: "",
                readme
              };
              entryPoints2.push(`import '${componentsDir}/${namespace2}/${component}/${component}';`);
              if (await folderExists(join3(namespaceDir, component, "__examples__"))) {
                const examples = await getDirectories(join3(namespaceDir, component, "__examples__"));
                for (let example of examples) {
                  if (await fileExists(join3(namespaceDir, component, "__examples__", example, `${example}.ts`))) {
                    entryPoints2.push(`import '${componentsDir}/${namespace2}/${component}/__examples__/${example}/${example}';`);
                    metaComponent.examples.push({
                      namespace: namespace2,
                      component,
                      example,
                      tag: `x-${namespace2}-${camelToDash(component)}-${camelToDash(example)}`,
                      className: `X${capitalizeFirstCharacter(namespace2)}${capitalizeFirstCharacter(component)}${capitalizeFirstCharacter(example)}`
                    });
                  } else {
                    console.log(red(`Missing ${componentsDir}/${namespace2}/${component}/__examples__/${example}/${example}.ts`));
                  }
                }
              }
              const data = await readFile(join3(srcDir, componentsDir, namespace2, component, `${component}.ts`), "utf8");
              const matches = data.match(/class (\w+) extends (\w+)/);
              if (!matches) {
                console.log(red(`Component "${namespace2}-${component}" must extend HtmlElement or base class`));
                process.exit();
              }
              metaComponent.className = matches[1];
              metaComponent.classExtends = matches[2];
              metaNamespace.components.push(metaComponent);
            }
          }
        }
        options.after(meta);
        return {
          contents: entryPoints2.join("\n"),
          resolveDir: join3(process.cwd(), srcDir)
        };
      });
    }
  };
}

// scripts/htmlDependentsPlugin.ts
import { sep as sep2 } from "node:path";
import { readFile as readFile2 } from "node:fs/promises";

// scripts/dashToCamel.ts
function dashToCamel(str) {
  return str.replace(/-([a-z])/g, (m) => m[1].toUpperCase());
}

// scripts/htmlDependentsPlugin.ts
var root = process.cwd();
var rootDepth = root.split(sep2).length;
var htmlDependentsPlugin = {
  name: "html-dependents-plugin",
  setup(build) {
    build.onLoad({ filter: /\.html$/ }, async (args) => {
      const parts = args.path.split(sep2).splice(rootDepth);
      const [src, componentsDir3, currentNamspace, currentComponent, ...file] = parts;
      const contents = await readFile2(args.path, "utf8");
      const matches = contents.matchAll(/<\/(?<namespace>\w+)-(?<value>[^>]+)/g);
      const components = /* @__PURE__ */ new Map();
      for (const match of matches) {
        const { namespace: namespace2, value } = match.groups;
        const component = dashToCamel(value);
        components.set(`${namespace2}-${component}`, [namespace2, component]);
      }
      const imports = [];
      components.forEach(([namespace2, component]) => {
        const depth = parts.length - 4;
        const backPaths = new Array(depth).fill("..");
        if (namespace2 === currentNamspace) {
          if (component === currentComponent) {
            return;
          }
          imports.push(`import './${backPaths.join("/")}/${component}/${component}';`);
        } else {
          imports.push(`import './${backPaths.join("/")}/${namespace2}/${component}/${component}';`);
        }
      });
      imports.push(`export default \`${contents}\`;`);
      return {
        contents: imports.join("\n"),
        loader: "js"
      };
    });
  }
};

// scripts/rebuildNotifyPlugin.ts
var green = (text) => `\x1B[32m${text}\x1B[0m`;
var rebuildNotifyPlugin = {
  name: "rebuild-notify",
  setup(build) {
    build.onEnd((result) => {
      if (result.errors.length > 0) {
        console.error(`Build ended with ${result.errors.length} errors`);
      } else {
        console.log(green("Build succeeded!"));
      }
    });
  }
};

// scripts/createPlaygroundIndex.ts
import { join as join4 } from "node:path";
import { readFile as readFile3 } from "node:fs/promises";
async function createPlaygroundIndex({
  mode,
  rootDir: rootDir3,
  srcDir: srcDir3,
  indexFile,
  defaultDir: defaultDir2,
  playgroundFile,
  title: title2,
  repo: repo2,
  repoComponent: repoComponent2,
  navigation: navigation2,
  namespaces
}) {
  let indexContent = "";
  if (await fileExists(join4(rootDir3, srcDir3, indexFile))) {
    indexContent = await readFile3(join4(rootDir3, srcDir3, indexFile), "utf8");
  } else {
    console.log(defaultDir2, playgroundFile);
    indexContent = await readFile3(join4(defaultDir2, playgroundFile), "utf8");
  }
  indexContent = indexContent.replace(
    "<title>Default</title>",
    `<title>${title2 ?? "Default"}</title>`
  );
  indexContent = indexContent.replace(
    "<h1>Default</h1>",
    `<h1>${title2 ?? "Default"}</h1>`
  );
  const navItems = structuredClone(navigation2 ?? []);
  for (let navItem of navItems) {
    navItem.items = [];
  }
  let defaultItem;
  if (navItems.length === 0) {
    defaultItem = { label: "Components", items: [] };
    navItems.push(defaultItem);
  } else {
    defaultItem = navItems.find((x) => !x.extends && !x.components && !x.namespaces);
    if (!defaultItem) {
      defaultItem = { label: "Other", items: [] };
      navItems.push(defaultItem);
    }
  }
  const componentMap = /* @__PURE__ */ new Map();
  namespaces.forEach(({ components }) => {
    components.forEach(({ component, namespace: namespace2, tag, readme, examples, className, classExtends }) => {
      componentMap.set(className, {
        className,
        // MyComponent
        classExtends,
        // MyModal
        component,
        // component
        namespace: namespace2,
        // my
        tag,
        // my-component
        readme,
        // # My Component
        examples: examples.map((example) => example.className)
      });
      examples.forEach((example) => {
        componentMap.set(example.className, {
          className: example.className,
          // XMyComponentBasic
          classExtends: example.classExtends,
          // HtmlElement
          component: example.component,
          // myComponentBasic
          namespace: example.namespace,
          // x
          tag: example.tag,
          // x-my-component-basic
          example: example.example
          // Basic
        });
      });
      for (let navItem of navItems) {
        if (navItem.include && navItem.include.includes(className)) {
          navItem.items.push({
            namespace: namespace2,
            component,
            className,
            tag
          });
          return;
        }
      }
      for (let navItem of navItems) {
        if (navItem === defaultItem) {
          continue;
        }
        if (navItem.exclude && navItem.exclude.includes(className)) {
          continue;
        }
        if (navItem.namespaces && !navItem.namespaces.includes(namespace2)) {
          continue;
        }
        if (navItem.extends && !navItem.extends.includes(classExtends)) {
          continue;
        }
        navItem.items.push({
          namespace: namespace2,
          component,
          className,
          tag
        });
        return;
      }
      defaultItem.items.push({
        namespace: namespace2,
        component,
        examples,
        className,
        tag
      });
    });
  });
  indexContent = indexContent.replace(/([ ]*)<!-- \[Navigation\] -->/, (match, indent) => {
    return navItems.map(({ label, items }) => {
      return [
        indent,
        `<div>${label}</div>`,
        "<ul>",
        items.map(({ component, namespace: namespace2, tag, className }) => {
          return [
            `<li data-tag="${tag}" data-class-name="${className}" data-component="${component}"><a href="#${tag}">${component}</a></li>`
          ].join(`
${indent}`);
        }).join(`
${indent}`),
        "</ul>"
      ].join(`
${indent}`);
    }).join(`
${indent}`);
  });
  if (repo2) {
    const github = "M12,2A10,10 0 0,0 2,12C2,16.42 4.87,20.17 8.84,21.5C9.34,21.58 9.5,21.27 9.5,21C9.5,20.77 9.5,20.14 9.5,19.31C6.73,19.91 6.14,17.97 6.14,17.97C5.68,16.81 5.03,16.5 5.03,16.5C4.12,15.88 5.1,15.9 5.1,15.9C6.1,15.97 6.63,16.93 6.63,16.93C7.5,18.45 8.97,18 9.54,17.76C9.63,17.11 9.89,16.67 10.17,16.42C7.95,16.17 5.62,15.31 5.62,11.5C5.62,10.39 6,9.5 6.65,8.79C6.55,8.54 6.2,7.5 6.75,6.15C6.75,6.15 7.59,5.88 9.5,7.17C10.29,6.95 11.15,6.84 12,6.84C12.85,6.84 13.71,6.95 14.5,7.17C16.41,5.88 17.25,6.15 17.25,6.15C17.8,7.5 17.45,8.54 17.35,8.79C18,9.5 18.38,10.39 18.38,11.5C18.38,15.32 16.04,16.16 13.81,16.41C14.17,16.72 14.5,17.33 14.5,18.26C14.5,19.6 14.5,20.68 14.5,21C14.5,21.27 14.66,21.59 15.17,21.5C19.14,20.16 22,16.42 22,12A10,10 0 0,0 12,2Z";
    const generic = "M6,2H18A2,2 0 0,1 20,4V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V4A2,2 0 0,1 6,2M12.75,13.5C15.5,13.5 16.24,11.47 16.43,10.4C17.34,10.11 18,9.26 18,8.25C18,7 17,6 15.75,6C14.5,6 13.5,7 13.5,8.25C13.5,9.19 14.07,10 14.89,10.33C14.67,11 14,12 12,12C10.62,12 9.66,12.35 9,12.84V8.87C9.87,8.56 10.5,7.73 10.5,6.75C10.5,5.5 9.5,4.5 8.25,4.5C7,4.5 6,5.5 6,6.75C6,7.73 6.63,8.56 7.5,8.87V15.13C6.63,15.44 6,16.27 6,17.25C6,18.5 7,19.5 8.25,19.5C9.5,19.5 10.5,18.5 10.5,17.25C10.5,16.32 9.94,15.5 9.13,15.18C9.41,14.5 10.23,13.5 12.75,13.5M8.25,16.5A0.75,0.75 0 0,1 9,17.25A0.75,0.75 0 0,1 8.25,18A0.75,0.75 0 0,1 7.5,17.25A0.75,0.75 0 0,1 8.25,16.5M8.25,6A0.75,0.75 0 0,1 9,6.75A0.75,0.75 0 0,1 8.25,7.5A0.75,0.75 0 0,1 7.5,6.75A0.75,0.75 0 0,1 8.25,6M15.75,7.5A0.75,0.75 0 0,1 16.5,8.25A0.75,0.75 0 0,1 15.75,9A0.75,0.75 0 0,1 15,8.25A0.75,0.75 0 0,1 15.75,7.5Z";
    const repoIcon = repo2.includes("github.com") ? github : generic;
    indexContent = indexContent.replace(/([ ]*)<!-- \[Repo\] -->/, (match, indent) => {
      return [
        indent,
        `<a href="${repo2}">`,
        '  <svg viewBox="0 0 24 24">',
        `    <path fill="currentColor" d="${repoIcon}" />`,
        "  </svg>",
        "  <span>View Repo</span>",
        "</a>"
      ].join(`
${indent}`);
    });
    indexContent = indexContent.replace(/const repo = '';/, (match) => {
      return `const repo = '${repo2}';`;
    });
    indexContent = indexContent.replace(/const repoComponent = '';/, (match) => {
      return `const repoComponent = '${repoComponent2.replace(/\$repo/g, repo2)}';`;
    });
    indexContent = indexContent.replace(/const repoIcon = '';/, (match) => {
      return `const repoIcon = '${repoIcon}';`;
    });
  }
  if (mode === "dev") {
    indexContent = indexContent.replace(/([ ]*)<!-- \[info\] -->/, (match, indent) => {
      return [
        indent,
        "<p>This page is generated from <code>npm start</code>. To render only specific components use <code>npm start c-button</code>.</p>"
      ].join(`
${indent}`);
    });
  }
  const classNames = [...componentMap.keys()];
  indexContent = indexContent.replace(/([ ]*)const componentMap = new Map\(\);/, (match, indent) => {
    return [
      `${indent}const componentMap = new Map();`,
      ...classNames.map((className) => {
        const data = componentMap.get(className);
        return `componentMap.set('${className}', ${JSON.stringify(data)});`;
      })
    ].join(`${indent}
`);
  });
  indexContent = indexContent.replace(/([ ]*)const navigation = \[\];/, (match, indent) => {
    return `${indent}const navigation = ${JSON.stringify(navItems, null, "  ")};`;
  });
  return indexContent;
}

// scripts/element-start.ts
var plugins = [htmlDependentsPlugin, rebuildNotifyPlugin];
var green2 = (text) => `\x1B[32m${text}\x1B[0m`;
var red2 = (text) => `\x1B[31m${text}\x1B[0m`;
var __filename2 = fileURLToPath(import.meta.url);
var __dirname2 = dirname4(__filename2);
var defaultDir = join5(__dirname2, "..", "default");
var configFile = "element.config.ts";
var rootDir2 = process.cwd();
var publishDir = "publish";
var fullConfigPath = pathToFileURL(configFile);
if (!await fileExists(configFile)) {
  console.log(red2("Missing element.config.ts in root."), "Add with content:");
  console.log("export default {");
  console.log(`  namespace: 'hello',`);
  console.log("}");
  process.exit();
}
var config = await import(fullConfigPath.href);
var {
  namespace,
  title,
  navigation,
  repo,
  repoComponent
} = config.default;
var distDir = "dist";
var srcDir2 = "src";
var componentsDir2 = "components";
var entryPoints = [];
if (namespace) {
  console.log(green2("Building app..."));
  entryPoints.push(`./${srcDir2}/${componentsDir2}/${namespace}/app/app.ts`);
  const indexFile = "index.html";
  if (await fileExists(join5(rootDir2, srcDir2, indexFile))) {
    await copyFile(
      join5(rootDir2, srcDir2, indexFile),
      join5(rootDir2, distDir, indexFile)
    );
  } else {
    let indexContent = await readFile4(join5(defaultDir, indexFile), "utf8");
    indexContent = indexContent.replace(
      "<title>Default</title>",
      `<title>${title ?? "Default"}</title>`
    );
    indexContent = indexContent.replace(
      "<namespace-app></namespace-app>",
      `<${namespace}-app></${namespace}-app>`
    );
    await writeFile2(join5(rootDir2, distDir, indexFile), indexContent);
  }
  const faviconSvg = "favicon.svg";
  if (await fileExists(join5(rootDir2, srcDir2, faviconSvg))) {
    await copyFile(
      join5(rootDir2, srcDir2, faviconSvg),
      join5(rootDir2, distDir, faviconSvg)
    );
  } else {
    await copyFile(
      join5(defaultDir, faviconSvg),
      join5(rootDir2, distDir, faviconSvg)
    );
  }
} else {
  console.log(green2("Building components..."));
  if (!await folderExists(join5(srcDir2, componentsDir2))) {
    console.log(red2('Missing required "src/components" directory.'));
    process.exit();
  }
  const playgroundFile = "playground.html";
  const indexFile = "index.html";
  entryPoints.push("playground-entry");
  plugins.push(
    playgroundPlugin({
      after: async (namespaces) => {
        const indexContent = await createPlaygroundIndex({
          mode: "dev",
          rootDir: rootDir2,
          srcDir: srcDir2,
          indexFile,
          defaultDir,
          playgroundFile,
          title,
          repo,
          repoComponent,
          navigation,
          namespaces
        });
        await writeFile2(join5(rootDir2, distDir, indexFile), indexContent);
      }
    })
  );
}
var ctx = await (0, import_esbuild.context)({
  entryPoints,
  outfile: `./${distDir}/main.js`,
  bundle: true,
  format: "esm",
  // Use ES Modules
  target: "es2024",
  // Target ES6 syntax
  minify: false,
  loader: {
    ".css": "text"
  },
  plugins
});
await ctx.rebuild();
var watcher = chokidar_default.watch("src", {
  ignoreInitial: true
  // Don't trigger on startup
});
watcher.on("all", async (event, path) => {
  if (!namespace) {
    const parts = path.split(sep3);
    if (parts.length > 4 && parts[0] === srcDir2 && parts[1] === componentsDir2) {
      console.log(`Copy "${parts.slice(2).join("/")}" to publish/*`);
      await copyFile(join5(rootDir2, ...parts), join5(rootDir2, publishDir, ...parts.slice(2)));
    }
  }
  try {
    await ctx.rebuild();
  } catch (e) {
    console.error("Rebuild failed:", e);
  }
});
var { port } = await ctx.serve({
  servedir: distDir
});
console.log(green2("Dev server started at"), `localhost:${port}`);
/*! Bundled license information:

chokidar/index.js:
  (*! chokidar - MIT License (c) 2012 Paul Miller (paulmillr.com) *)
*/
