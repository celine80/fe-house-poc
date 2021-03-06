Package.json Specification
===========

例子
```json
{
  "name": "@dr/doc-home",
  "version": "0.0.1",
  "description": "Home page",
  "browser": "browser/js/index.js",
  "main": "server/server.js",
  "style": "browser/style/main.less",
  "i18n": "i18n/resource-{locale}.json",
  "transforms": [ "@dr/parcelify-module-resolver"],
  "dr": {
	  "bundle": "home",
	  "entryPage": "index.html"
  },
  "author": "LJ"
}
```
Package.json的一些特殊属性说明

| 属性 | 说明
| -- | --
| `main` | Node Server端主Javascript文件
| `browser` | 浏览器端主Javascript文件
| `style` | 主LESS文件
| `transforms` | 目前只有一个值`["@dr/parcelify-module-resolver"]`
| `dr.bundle` (`dr.chunk`) | 合并打包属浏览器端JS, CSS文件时应该被归类于的bundle文件，多个package可以被归类到一个bundle下，以提高下载速度
| `dr.entryPage` | 可以是Array, 入口主静态页面，`gulp compile`时会自动copy到dist/static目录下，自动inject所依赖的JS, CSS bundle, 可以是package内相对路径，也可以是引用其他package内的文件`npm://<package-name>/<path>`，e.g. `npm://@dr/parent/browser/views/index.html`
| `dr.entryView` | 类似`dr.entryPage`, 可以是Array, 入口的server端render主页面, `gulp compile`时会自动copy到dist/server目录下, 用`api.getCompiledViewPath(relativePath)`可以获得compiled absolute path.
| `dr.assetsDir` | 存放静态资源的目录，package根目录下的相对路径, 默认为`assets`
| `dr.i18n` | 可选配置，默认就是`i18n`。i18n 文件所在路径，可以是带有{locale}变量的路径pattern，可以是某个代表i18n逻辑的主文件夹或文件，其他JS代码可以通过`require('packageName/i18n')`的方式获取i18n对象，i18n文件可以是`.json`, `.yaml`, `.js`
e.g.

```javascript
	activate: function(api) {
		api.router().get('/', function(req, res) {
			res.render(api.getCompiledViewPath('index.html'),
				{contextPath: api.contextPath});
		});
```
| 属性 | 说明
| -- | --
| `dr.browserifyNoParse` | 通知`gulp compile`时browserify不要parse某些js file，比如第三方library, 提高编译速度。

e.g.
```json
	"dr": {
		"bundle": "labjs",
	 	"browserifyNoParse": ["./LAB.src.js"],
	 	"noLint": true
	},
```
| 属性 | 说明
| -- | --
| `dr.noLint` | `gulp lint`不会对当前package check code style
| `dr.type` | 当value是"core"是，平台node server启动时会先加载当前的package，执行module.exports.activate(), 这样这个package 就是API provider, 可以用于monkey patch 新的属性或方法到api对象。`dr.type` 还可以有其他的值，比如`builder` 代表是一个build tool, `gulp compile`会依次调用他们
| `dr.priority` | 可以用于package排序，lib/packageMgr/packageUtils.find *XXX* Packages() 的callback会根据priority排序, 目前只有对`gulp compile`有用, 当有多个build tool时，可以有先后调用次序
