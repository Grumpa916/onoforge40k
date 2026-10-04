const assert=require('assert');
const fs=require('fs');
const vm=require('vm');

const source=fs.readFileSync('js/ui/html-utils.js','utf8');
const context={};
vm.createContext(context);
vm.runInContext(source,context);

assert.strictEqual(context.esc('plain text'),'plain text');
assert.strictEqual(context.esc('& < > " \' \\'),'&amp; &lt; &gt; &quot; &#39; \\');
assert.strictEqual(context.esc(null),'');
assert.strictEqual(context.esc(undefined),'');
assert.strictEqual(context.esc(42),'42');
assert.strictEqual(context.OnoForgeHtmlUtils.esc('<b>safe</b>'),'&lt;b&gt;safe&lt;/b&gt;');

console.log('html-utils.test.js: PASS');
