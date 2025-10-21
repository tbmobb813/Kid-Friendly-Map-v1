#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
function log(...a){console.log('[prune-autolink]',...a)}
const outPath = process.argv[2] || 'android/build/generated/autolinking/autolinking.json';
try{
  if(!fs.existsSync(outPath)){log('file not found:', outPath); process.exit(0)}
  const raw = fs.readFileSync(outPath,'utf8');
  const js = JSON.parse(raw);
  if(!js || !js.dependencies){log('no dependencies found'); process.exit(0)}
  const deps = js.dependencies;
  const removed = [];
  Object.keys(deps).forEach((name)=>{
    const info = deps[name];
    const plat = info && info.platforms && info.platforms.android;
    if(plat && plat.cmakeListsPath){
      const dir = path.dirname(plat.cmakeListsPath);
      if(!fs.existsSync(dir)){
        removed.push(name);
        delete deps[name];
      }
    }
  });
  if(removed.length>0){
    fs.writeFileSync(outPath, JSON.stringify(js,null,2),'utf8');
    log('Pruned missing JNI dependencies:', removed);
  } else {
    log('No missing JNI dependencies found');
  }
} catch(e){
  console.error('prune failed', e && e.stack || e);
  process.exit(2);
}
