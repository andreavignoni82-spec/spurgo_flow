import test from 'node:test'; import assert from 'node:assert/strict'; import { createLifecycle } from '../../src/core/lifecycle.js';
test('abort signals and runs cleanup once',()=>{const lifecycle=createLifecycle(); let cleaned=0; lifecycle.addCleanup(()=>cleaned++); lifecycle.abort(); lifecycle.abort(); assert.equal(lifecycle.signal.aborted,true); assert.equal(cleaned,1);});
