const questions = [
  { icon:'🍙', q:'おにぎりに入れるなら？', a:{e:'🍙',t:'梅干し'}, b:{e:'🍫',t:'チョコ'}, ans:'a', hint:'食べものの組み合わせを選んでね' },
  { icon:'☔', q:'雨の日に使うのは？', a:{e:'☂️',t:'傘'}, b:{e:'🪭',t:'うちわ'}, ans:'a', hint:'雨にぬれない方だよ' },
  { icon:'🌞', q:'夏に合うのは？', a:{e:'🧥',t:'コート'}, b:{e:'👒',t:'帽子'}, ans:'b', hint:'暑い日に使いやすい方だよ' },
  { icon:'🦷', q:'歯みがきで使うのは？', a:{e:'🪥',t:'歯ブラシ'}, b:{e:'🔨',t:'かなづち'}, ans:'a', hint:'お口に使うものだよ' },
  { icon:'🍵', q:'お茶を入れるのは？', a:{e:'🍵',t:'湯のみ'}, b:{e:'👞',t:'くつ'}, ans:'a', hint:'飲みものを入れる方だよ' },
  { icon:'🧺', q:'洗濯で使うのは？', a:{e:'🧺',t:'洗濯かご'}, b:{e:'🎂',t:'ケーキ'}, ans:'a', hint:'服を入れる方だよ' },
  { icon:'🛁', q:'お風呂で使うのは？', a:{e:'🧼',t:'石けん'}, b:{e:'📚',t:'辞書'}, ans:'a', hint:'体を洗うものだよ' },
  { icon:'🍳', q:'目玉焼きを作るのは？', a:{e:'🍳',t:'フライパン'}, b:{e:'🧦',t:'くつ下'}, ans:'a', hint:'料理に使う方だよ' },
  { icon:'📞', q:'電話をかけるのは？', a:{e:'📱',t:'スマホ'}, b:{e:'🥕',t:'にんじん'}, ans:'a', hint:'もしもしに使う方だよ' },
  { icon:'🌸', q:'春に咲く花は？', a:{e:'🌸',t:'さくら'}, b:{e:'⛄',t:'雪だるま'}, ans:'a', hint:'春らしい方だよ' },
  { icon:'🚗', q:'遠くへ行きやすいのは？', a:{e:'🚗',t:'車'}, b:{e:'🪑',t:'いす'}, ans:'a', hint:'移動できる方だよ' },
  { icon:'🕰️', q:'時間を見るのは？', a:{e:'⏰',t:'時計'}, b:{e:'🍊',t:'みかん'}, ans:'a', hint:'何時かな？を見るものだよ' },
  { icon:'🍚', q:'ごはんに合うのは？', a:{e:'🍵',t:'お茶'}, b:{e:'🧴',t:'洗剤'}, ans:'a', hint:'食事で使える方だよ' },
  { icon:'🧹', q:'掃除で使うのは？', a:{e:'🧹',t:'ほうき'}, b:{e:'🍰',t:'ケーキ'}, ans:'a', hint:'きれいにする方だよ' },
  { icon:'👂', q:'音を聞くのは？', a:{e:'👂',t:'耳'}, b:{e:'🦶',t:'足'}, ans:'a', hint:'聞こえる方だよ' },
  { icon:'👀', q:'ものを見るのは？', a:{e:'👀',t:'目'}, b:{e:'👃',t:'鼻'}, ans:'a', hint:'見える方だよ' },
  { icon:'🍜', q:'ラーメンを食べるのは？', a:{e:'🥢',t:'おはし'}, b:{e:'🧹',t:'ほうき'}, ans:'a', hint:'食事に使う方だよ' },
  { icon:'🥶', q:'寒い日に着るのは？', a:{e:'🧥',t:'コート'}, b:{e:'👙',t:'水着'}, ans:'a', hint:'あたたかい方だよ' },
  { icon:'🍎', q:'くだものはどっち？', a:{e:'🍎',t:'りんご'}, b:{e:'🧱',t:'れんが'}, ans:'a', hint:'食べられる方だよ' },
  { icon:'🐟', q:'魚はどっち？', a:{e:'🐟',t:'さかな'}, b:{e:'🐈',t:'ねこ'}, ans:'a', hint:'水の中にいる方だよ' }
];

const $ = id => document.getElementById(id);
const screens = ['startScreen','gameScreen','resultScreen','finishScreen'].map($);
let soundOn = true;
let game = { list: [], index: 0, score: 0, locked: false };

function show(id){ screens.forEach(s=>s.classList.add('hidden')); $(id).classList.remove('hidden'); }
function shuffle(arr){ return [...arr].sort(()=>Math.random()-.5); }

function speak(text, rate=.82, pitch=1.12){
  if(!soundOn || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'ja-JP'; u.rate = rate; u.pitch = pitch; u.volume = 1;
  window.speechSynthesis.speak(u);
}

function beep(ok=true){
  if(!soundOn) return;
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    const notes = ok ? [660,880] : [440,520];
    notes.forEach((freq,i)=>{
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine'; osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, now + i*.12);
      gain.gain.exponentialRampToValueAtTime(0.25, now + i*.12 + .02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i*.12 + .16);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now + i*.12); osc.stop(now + i*.12 + .18);
    });
  } catch(e) {}
}

function startGame(){
  game.list = shuffle(questions).slice(0,10);
  game.index = 0; game.score = 0; game.locked = false;
  show('gameScreen'); renderQuestion();
}
function renderQuestion(){
  const item = game.list[game.index];
  game.locked = false;
  $('progressText').textContent = `${game.index+1} / ${game.list.length}`;
  $('questionIcon').textContent = item.icon;
  $('questionText').textContent = item.q;
  $('hintText').textContent = item.hint;
  $('choiceAEmoji').textContent = item.a.e; $('choiceAText').textContent = item.a.t;
  $('choiceBEmoji').textContent = item.b.e; $('choiceBText').textContent = item.b.t;
  $('choiceA').className = 'choice choice-a'; $('choiceB').className = 'choice choice-b';
  setTimeout(()=>speak('どっちかなぁ？'), 250);
}
function answer(which){
  if(game.locked) return;
  game.locked = true;
  const item = game.list[game.index];
  const ok = which === item.ans;
  if(ok) game.score++;
  const btn = which === 'a' ? $('choiceA') : $('choiceB');
  btn.classList.add(ok ? 'correct' : 'wrong');
  beep(ok);
  setTimeout(()=>{
    $('resultEmoji').textContent = ok ? '✨' : '😊';
    $('resultText').textContent = ok ? 'いいね〜！' : 'おしい〜';
    $('resultSubText').textContent = ok ? 'その調子、その調子。' : 'だいじょうぶ。次いこ〜。';
    show('resultScreen');
    speak(ok ? 'いいねー' : 'おしいー。だいじょうぶ');
  }, 300);
  setTimeout(nextQuestion, 1700);
}
function nextQuestion(){
  game.index++;
  if(game.index >= game.list.length){
    $('scoreText').textContent = `${game.score}問できました。すごい！`;
    show('finishScreen');
    speak('おしまい。楽しかったねー');
  } else {
    show('gameScreen'); renderQuestion();
  }
}

$('startBtn').addEventListener('click', startGame);
$('againBtn').addEventListener('click', startGame);
$('choiceA').addEventListener('click', ()=>answer('a'));
$('choiceB').addEventListener('click', ()=>answer('b'));
$('skipBtn').addEventListener('click', ()=>{ if(!game.locked) nextQuestion(); });
$('soundBtn').addEventListener('click', ()=>{
  soundOn = !soundOn;
  $('soundBtn').textContent = soundOn ? '🔊 音あり' : '🔇 音なし';
  $('soundBtn').setAttribute('aria-pressed', String(soundOn));
  if(soundOn) speak('音あり'); else if('speechSynthesis' in window) window.speechSynthesis.cancel();
});
