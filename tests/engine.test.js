import test from 'node:test';import assert from 'node:assert/strict';import {fresh,play,legal,win,makeAgent,episode,evaluate,rng,policy,features,learn} from '../dist/engine.js';
test('a newly won board has no future threats or fork for either mark',()=>{
  for(const mark of [1,-1]){
    const s=fresh();s.turn=mark;s.cells[0]=s.cells[1]=mark;
    const before=JSON.stringify(s),f=features(s,2);
    assert.equal(f[0],1,'capture remains active');
    assert.equal(f[2],0,'winning a board is not a fork');
    assert.equal(f[3],0,'closed board has no own threats');
    assert.equal(f[4],0,'closed board has no opponent threats');
    assert.equal(JSON.stringify(s),before,'feature extraction preserves state');
  }
});
test('a genuine fork on an open board still has two winning cells',()=>{
  for(const mark of [1,-1]){
    const s=fresh();s.turn=mark;s.cells[0]=s.cells[4]=mark;s.cells[8]=-mark;
    const f=features(s,2);
    assert.equal(f[0],0);assert.equal(f[2],1);assert.equal(f[3],2/4);
  }
});
test('closing a full drawn board yields no threats',()=>{
  const s=fresh();s.cells.splice(0,9,1,-1,1,1,-1,-1,-1,1,0);
  const f=features(s,8);assert.equal(f[0],0);assert.equal(f[2],0);assert.equal(f[3],0);assert.equal(f[4],0);
});
test('opening and destination routing',()=>{const s=fresh();assert.equal(legal(s).length,81);const n=play(s,11);assert.equal(n.next,2);assert.equal(n.turn,-1);assert.equal(legal(n).length,9);assert.ok(legal(n).every(a=>Math.floor(a/9)===2));assert.throws(()=>play(n,0));assert.equal(s.cells[11],0);});
test('claimed destination allows free choice; won boards close',()=>{const s=fresh();s.boards[4]=1;const n=play(s,4);assert.equal(n.next,-1);assert.ok(legal(n).every(a=>Math.floor(a/9)!==4));});
test('local win claims board; macro line ends game',()=>{let s=fresh();s.cells[0]=1;s.cells[1]=1;s.next=0;let n=play(s,2);assert.equal(n.boards[0],1);s=fresh();s.boards[0]=s.boards[1]=1;s.cells[18]=s.cells[19]=1;s.next=2;n=play(s,20);assert.equal(n.winner,1);assert.equal(legal(n).length,0);assert.throws(()=>play(n,21));});
test('three drawn boards are never a macro win',()=>{assert.equal(win([2,2,2,0,0,0,0,0,0]),0);});
test('full local board is drawn; full macro board is drawn',()=>{const s=fresh();s.cells.splice(0,9,1,-1,1,1,-1,-1,-1,1,0);s.boards=[0,2,2,2,2,2,2,2,2];s.next=0;const n=play(s,8);assert.equal(n.boards[0],2);assert.equal(n.winner,2);});
test('initial policy is uniform and legal',()=>{const p=policy(fresh(),makeAgent().weights,.65);assert.equal(p.actions.length,81);assert.ok(p.probs.every(x=>Math.abs(x-1/81)<1e-12));assert.ok(Math.abs(p.probs.reduce((a,b)=>a+b,0)-1)<1e-10);});
test('positive advantage reinforces the selected feature',()=>{const a=makeAgent(),g=Array(18).fill(0);g[0]=1;learn(a,[{grad:g,reward:1}],.035);assert.ok(a.weights[0]>0);assert.equal(a.updates,1);});
test('seeded self play terminates legally and updates two separate agents',()=>{const a=[makeAgent(),makeAgent()],random=rng(42);let outcomes=[0,0,0];for(let i=0;i<100;i++){const ep=episode(a,i,.4,random);assert.ok(ep.state.ply<=81);assert.notEqual(ep.state.winner,0);assert.equal(ep.aMark,i%2===0?1:-1);outcomes[ep.result]++;}assert.equal(outcomes.reduce((x,y)=>x+y,0),100);assert.ok(a.every(x=>x.updates===100&&x.weights.every(Number.isFinite)));assert.notDeepEqual(a[0].weights,a[1].weights);});
test('evaluation is repeatable and does not train',()=>{const a=[makeAgent(),makeAgent()],before=JSON.stringify(a);assert.deepEqual(evaluate(a,8,123),evaluate(a,8,123));assert.equal(JSON.stringify(a),before);});
test('exploration mixture gradient matches finite differences',async()=>{const {choose}=await import('../dist/engine.js');const s=play(fresh(),40),w=Array.from({length:18},(_,i)=>i*.03),eps=.4,choice=choose(s,w,eps,()=>.37,true),idx=policy(s,w,eps).actions.indexOf(choice.action);for(let j=0;j<w.length;j++){const plus=w.slice(),minus=w.slice();plus[j]+=1e-5;minus[j]-=1e-5;const numeric=(Math.log(policy(s,plus,eps).probs[idx])-Math.log(policy(s,minus,eps).probs[idx]))/2e-5;assert.ok(Math.abs(numeric-choice.grad[j])<1e-7);}});
