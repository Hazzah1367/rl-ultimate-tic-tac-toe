import {makeAgent,startEpisode,advance,finish,evaluate,rng,FEATURES} from './engine.js';
let agents=[makeAgent(),makeAgent()],count=0,wins=[0,0,0],history=[],running=false,mode='watch',delay=1000/3,lr=.035,ep=startEpisode(0),timer=null,random=rng(2026),last=null;
const epsilon=()=>Math.max(.04,.65*Math.exp(-count/3500));
const checkpoint=()=>({version:1,algorithm:'linear-reinforce-v1',agents,count,wins,history});
function stats(){return {count,wins,epsilon:epsilon(),agents,history,running,mode};}
function send(type,extra={}){postMessage({type,...stats(),...extra});}
function frame(){send('frame',{state:ep.state,aMark:ep.aMark,last});}
function measure(){const scores=evaluate(agents,40);history.push({episode:count,a:scores[0].score,b:scores[1].score});if(history.length>200)history.shift();send('evaluation',{scores,checkpoint:checkpoint()});}
function step(){if(ep.state.winner){ep=startEpisode(count);last=null;}last=advance(ep,agents,epsilon(),random);if(ep.state.winner){finish(ep,agents,lr);wins[ep.result]++;count++;}return !!ep.state.winner;}
function tick(){timer=null;if(!running)return;if(mode==='watch'){const done=step();frame();if(done&&count%250===0)measure();timer=setTimeout(tick,ep.state.winner?Math.max(700,delay):delay);}else{const start=performance.now();let done=false;do{done=step();if(done&&count%250===0){measure();break;}}while(performance.now()-start<45);frame();timer=setTimeout(tick,0);}}
function stop(){running=false;clearTimeout(timer);timer=null;}
onmessage=e=>{const d=e.data;try{if(d.type==='init'){if(d.data)restore(d.data);if(!history.length)measure();frame();}
if(d.type==='run'){running=!!d.running;clearTimeout(timer);timer=null;if(running)tick();else send('status',{checkpoint:checkpoint()});}
if(d.type==='settings'){if(d.mode==='watch'||d.mode==='fast')mode=d.mode;if(Number.isFinite(d.delay))delay=Math.max(30,d.delay);if(Number.isFinite(d.lr))lr=Math.max(.001,Math.min(.1,d.lr));if(running){clearTimeout(timer);tick();}else send('status');}
if(d.type==='step'){stop();step();frame();if(count>0&&count%250===0&&ep.state.winner)measure();}
if(d.type==='save')send('saved',{checkpoint:checkpoint()});
if(d.type==='reset'){stop();agents=[makeAgent(),makeAgent()];count=0;wins=[0,0,0];history=[];random=rng(2026);ep=startEpisode(0);last=null;measure();frame();}
if(d.type==='load'){stop();restore(d.data);ep=startEpisode(count);last=null;frame();send('saved',{checkpoint:checkpoint()});}
if(d.type==='evaluate'){const scores=evaluate(agents,80,13000,true);send('benchmark',{scores});}
}catch(err){send('error',{message:err.message});}};
function restore(c){if(!c||c.version!==1||c.algorithm!=='linear-reinforce-v1'||!Number.isInteger(c.count)||c.count<0||!Array.isArray(c.agents)||c.agents.length!==2||!Array.isArray(c.wins)||c.wins.length!==3||c.wins.some(n=>!Number.isInteger(n)||n<0)||!Array.isArray(c.history)||c.history.length>200)throw Error('This is not a valid Nested checkpoint.');for(const a of c.agents)if(!Array.isArray(a.weights)||a.weights.length!==FEATURES.length||a.weights.some(x=>!Number.isFinite(x)||Math.abs(x)>12)||!Number.isFinite(a.baseline)||!Number.isInteger(a.updates)||a.updates<0)throw Error('Invalid agent weights.');if(c.history.some(h=>!Number.isFinite(h.episode)||!Number.isFinite(h.a)||!Number.isFinite(h.b)||h.a<0||h.a>1||h.b<0||h.b>1))throw Error('Invalid evaluation history.');agents=c.agents;count=c.count;wins=c.wins;history=c.history;ep=startEpisode(count);}
