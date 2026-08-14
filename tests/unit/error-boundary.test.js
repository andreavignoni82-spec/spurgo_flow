import test from 'node:test'; import assert from 'node:assert/strict'; import { ErrorBoundary } from '../../src/core/error-boundary.js';
test('contains synchronous throws',()=>{const seen=[]; const b=new ErrorBoundary({onError:(e,m)=>seen.push([e,m])}); assert.equal(b.run(()=>{throw Error('sync')},{id:'a'}),undefined); assert.equal(seen[0][1].id,'a');});
test('contains asynchronous rejections',async()=>{const seen=[]; const b=new ErrorBoundary({onError:e=>seen.push(e)}); assert.equal(await b.runAsync(async()=>{throw Error('async')}),undefined); assert.equal(seen.length,1);});
