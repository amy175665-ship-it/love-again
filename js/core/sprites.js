/* =========================================================
   픽셀 스프라이트 (한 글자 = 한 칸, 색은 PAL에서)
   ========================================================= */
const PAL = {
  B:'#609aef',
  k:'#1a1630', g:'#a8764f', G:'#e3c39d', m:'#4e3426', w:'#f3e6c4', e:'#1a1630', n:'#1a1630',
  h:'#79d3b2', H:'#4fa48a', t:'#efe0c2', T:'#fffaf0', p:'#f2b4a0', a:'#f2b544',
  o:'#ff7a45', O:'#ffb066', y:'#ffe08a', b:'#e0a050', l:'#79d3b2', M:'#6b3a2a',
  c:'#ffe08a', r:'#d8483a', P:'#c9705a', s:'#5a6288', S:'#79d3b2', x:'#ffffff', d:'#3d4259',
  v:'#9b7be0', V:'#d9c8ff', z:'#b3b5bd',
};
const SPR = {
  ring: ['....kkkk....','...kBxxBk...','....kBBk....','...kkkkkk...','..kyy..yyk..','.kyk....kyk.','.kyk....kyk.','..kyy..yyk..','...kkkkkk...'],
  wave: ['............','....SS......','..SSxxS.....','.SSxxxS.....','SSxxxSS...SS','SxxxSS..SSxS','SSSSSSSSSSSS','xxxxxxxxxxxx'],
  tube: ['...kkkkkk...','.kkrrxxrrkk.','kxxrkkkkrxxk','kxxk....kxxk','krrk....krrk','krrk....krrk','kxxk....kxxk','kxxrkkkkrxxk','.kkrrxxrrkk.','...kkkkkk...'],
  guitar: ['...kkkkkk...','...kddddk...','....kbbk....','....kbbk....','....kbbk....','..kkkbbkkk..','.krrrbbrrrk.','krrrkkkkrrrk','krrrrrrrrrrk','.krrrkkrrrk.','..kkkkkkkk..'],
  flower: ['....pppp....','...pwwwwp...','.pppwwwwppp.','pwwwwyywwwwp','pwwwwyywwwwp','.pppwwwwppp.','...pwwwwp...','....pppp....','.....HH.....','...HHHHH....'],
  wheel: ['....kkkk....','..kkayyykk..','.kaakkkkyyk.','kakk.kk.kyyk','kykk.kk.kayk','.kyykkkkaak.','..kkkkkkkk..','.....kk.....','....k..k....','...kkkkkk...'],
  jacket: ['...kkkkkk...','..kddkkddk..','.kdddkkdddk.','kddddkkddddk','kddsdkkddddk','kkdsdkkdddkk','..kddkkddk..','..kddkkddk..','..kkkkkkkk..'],
  cup: ['..kkkkkk....','.kwwwwwwkkk.','.kwpppwwk.wk','.kwpwpwwk.wk','.kwpppwwkkk.','.kwwwwwwk...','..kkkkkk....'],
  rabbit: ['..kk..kk....','..kwkkwk....','..kwkkwk....','..kwwwwk....','.kwewwewk...','.kwwppwwk...','..kwwwwk....','.kwwwwwwk...','..kkkkkk....'],
  noodles: ['.kkkkkkkkkk.','krrrrrrrrrrk','.kyyyyyyyyk.','.krwwwwwwrk.','..krwwwwrk..','..krrrrrrk..','...kkkkkk...'],
  cap: ['....kkkk....','..kkBBBBkk..','.kBBBBBBBBk.','.kBBBBBBBBk.','kkkkkkkkkkkk','kBBBBBBBBBBk','.kkkkkkkkkk.'],
  drum: ['.k........k.','..k......k..','...k....k...','..kkkkkkkk..','.kxxxxxxxxk.','.kkkkkkkkkk.','.krkwkrkwrk.','.krkwkrkwrk.','..kkkkkkkk..'],
  daechang: ['............','..kkkkkkkk..','.kbbybbybbk.','.kbkkbbkkbk.','.kbyybbyybk.','..kkkkkkkk..','.kssssssssk.','..kkkkkkkk..'],
  hoe: ['............','.kkkkkkkkkk.','kxpxkxpxkxpk','kxpxkxpxkxpk','kxxxkxxxkxxk','kkkkkkkkkkkk','kHHhhHHhhHHk','.kddddddddk.','..kkkkkkkk..'],
  izakaya: ['....kkkk....','...kddddk...','..krrrrrrk..','.krrrrrrrrk.','.kPPPPPPPPk.','.krxxxxxxrk.','.krrrrrrrrk.','.kPPPPPPPPk.','..krrrrrrk..','...kddddk...','....kkkk....','.....aa.....'],
  heart: ['..kkk..kkk..','.krrrkkrrrk.','krxrrrrrrrrk','krxrrrrrrrrk','krrrrrrrrrrk','.krrrrrrrrk.','..krrrrrrk..','...krrrrk...','....krrk....','.....kk.....'],
  bouquet: ['.kk..kk..kk.','kppkkppkkppk','kpykkypkkpyk','.kk.kkkk.kk.','..kH.HH.Hk..','..kwwwwwwk..','...kwwwwk...','...kwaawk...','....kwwk....','.....kk.....'],
  palette: ['...kkkkkk...','..kwwwwwwk..','.kwrwwwBwwk.','kwwwwwwwwwk.','kwywwkkwwwk.','kwwwk..kwhk.','.kwwwkkwwwk.','..kwwwwwwk..','...kkkkkk...'],
  luge: ['............','..kkk.......','.kBBBk......','.kBBBkkkkkk.','kooooooooook','kooooooooook','.kkkkkkkkkk.','..kdk..kdk..','..kkk..kkk..','ssssssssssss'],
  sofa: ['............','..kkkkkkkk..','.kPPPPPPPPk.','.kPPPPPPPPk.','kkkkkkkkkkkk','kPkOOOOOOkPk','kPkkkkkkkkPk','kkkkkkkkkkkk','.kk......kk.'],
  tteokguk: ['...s..s.....','....s..s....','kkkkkkkkkkkk','kwxxwGGwxxwk','.kPPPPPPPPk.','..kPPPPPPk..','...kkkkkk...'],
  camera: ['..kkkk......','kkkddkkkkkkk','kdddkkkkdxdk','kddkBBBBkddk','kddkBxBBkddk','kddkBBBBkddk','kdddkkkkdddk','kkkkkkkkkkkk'],
  sheep: ['..kk....kk..','.kxxk..kxxk.','.kxxxkkxxxk.','.kxxxxxxxxk.','.kttttttttk.','.ktettttetk.','.kptttttptk.','..kttttttk..','...kkkkkk...'],
  tent: ['.....kk.....','....kook....','...kooOOk...','..kookkOOk..','.koookdkOOOk','koookddkOOOk','kkkkkkkkkkkk','hhhhhhhhhhhh'],
  tree: ['...kkkkkk...','..khhhhhhk..','.khhHhhhhhk.','khhhhhhHhhhk','khHhhhhhhhhk','.khhhhhhhhk.','..kkkmmkkk..','....kmmk....','....kmmk....','..kkkkkkkk..'],
  console: ['kkkkkkkkkkkk','kBBkSSSSkrrk','kBBkSxSSkrrk','kkBkSSSSkrkk','kBBkSSSSkrrk','kkkkkkkkkkkk'],
  beanie: ['.....kk.....','....kxxk....','...kkkkkk...','..kxxxxxxk..','.kxxxxxxxxk.','.kxxxxxxxxk.','kkkkkkkkkkkk','kwxwxwxwxwxk','kkkkkkkkkkkk'],
  stage: ['.y..y..y..y.','kkkkkkkkkkkk','kv..rr.rr.vk','kv..rrrrr.vk','kv...rrr..vk','kv....r...vk','kkkkkkkkkkkk','kbbbbbbbbbbk','kkkkkkkkkkkk'],
  gradcap: ['.....kk.....','...kkddkk...','.kkddddddkk.','kddddddddddk','.kkddddddkka','...kddddk..a','...kddddk..a','....kkkk...a'],
  palm: ['..HH..HH....','.HHHHHHHHH..','HH..HHH..HH.','H....b....H.','.....b......','.....bb.....','......b.....','......b.....','..yyyyyyyy..','SSSSSSSSSSSS'],
  gull: ['kk........kk','kxk......kxk','.kxk....kxk.','..kxkkkkxk..','...kxxxxxkoo','....kkkkkk..','............','SSxxSSSSSSSS'],
  baseball: ['...kkkkkk...','..kxxxxxxk..','.kxrxxxxrxk.','kxrxxxxxxrxk','kxrxxxxxxrxk','kxrxxxxxxrxk','.kxrxxxxrxk.','..kxxxxxxk..','...kkkkkk...'],
  bear: ['.kk......kk.','kppk....kppk','kppkkkkkkppk','.kppppppppk.','kpppeppepppk','kppppwwppppk','kpppwkkwpppk','.kpppwwpppk.','..kkkkkkkk..'],
  gimbap: ['..kkkkkkkk..','.kddddddddk.','kdxxxxxxxxdk','kdxyHxoxrxdk','kdxxHyrxoxdk','kdxxxxxxxxdk','.kddddddddk.','..kkkkkkkk..'],
  watch: ['...kkkkkk...','...kssssk...','..kkkkkkkk..','..kddddddkk.','..kdhhhhdk..','..kdhxhhdkk.','..kddddddk..','..kkkkkkkk..','...kssssk...','...kkkkkk...'],
  mountain: ['.....kk.....','....kxxk....','...kxxHHk...','..kHHHHHHk..','.kHHhHHHHHk.','kHHhhHHHHhHk','kkkkkkkkkkkk'],
  inari: ['............','..kkkkkkkk..','.kbbbbbbbbk.','kbxxkxxxkxbk','kbxxxxxxxxbk','kbbbbbbbbbbk','.kbbbbbbbbk.','..kkkkkkkk..'],
  cablecar: ['kkkkkkkkkkkk','.....kk.....','...kkkkkk...','..krrrrrrk..','..kxxrrxxk..','..krrrrrrk..','...kkkkkk...'],
  icecream: ['....kkkk....','...kzzzzk...','..kzzxzzzk..','..kzzzzzzk..','..kkkkkkkk..','...kbbbbk...','...kbbbbk...','....kbbk....','....kbbk....','.....kk.....'],
  plane: ['.........kk.','........kBk.','.kkkkkkkkBk.','kxxBxBxBxxxk','kxxxxxxxxxk.','.kkkkBBkkkk.','....kBBk....','.....kk.....'],
  jjun: [
    '..kk........kk..',
    '.kGgk......kgGk.',
    '.kggkkkkkkkkggk.',
    '.kggggggggggggk.',
    '.kgmmmggggmmmgk.',
    '.kmmwemggmewmmk.',
    '.kgmmmggggmmmgk.',
    '.kgGGGGnnGGGGgk.',
    '..kgGGGGGGGGgk..',
    '...kkhhhhhhkk.km',
    '..khhhhHHhhhhkkg',
    '.kghhhhHHhhhhgkm',
    '.kkhhhhhhhhhhkkg',
    '..khhhhhhhhhhk.k',
    '..kmmk....kmmk..',
    '..kkkk....kkkk..',
  ],
  wawa: [
    '.k............k.',
    '.kk..........kk.',
    '.ktk........ktk.',
    '.kptk......ktpk.',
    '.kpttkkkkkkttpk.',
    '..kttttttttttk..',
    '.kttTTttttTTttk.',
    '.kteeTttttTeetk.',
    '.kttTTTnnTTTttk.',
    '..kTTTTTTTTTTk..',
    '...kTTTkkTTTk...',
    '..kaaaaaaaaaak..',
    '.kttttttttttttk.',
    '.ktTTttttttTTtk.',
    '..ktk......ktk..',
    '..kkk......kkk..',
  ],
  flame: ['...o..','..oo.o','.oOoo.','oOyOo.','oyyyOo','.oyyo.'],
  bell: ['kk....kk','kkkkkkkk','kk....kk'],
  burger: ['..kkkkkk..','.kbbbbbbk.','kbbybbybbk','kllllllllk','kMMMMMMMMk','kbbbbbbbbk','.kkkkkkkk.'],
  pizza: ['kkkkkkkkkk','kbbbbbbbbk','.kcrcccrk.','..kccrck..','...kcck...','....kk....'],
  gop: ['..........','..ppp.pp..','.pPPpppPp.','pPpPPpPPpp','kkkkkkkkkk','.kssssssk.','..kkkkkk..'],
  shrimp: ['..kkkkkk....','.koooooOk...','koOooOoook..','kooOooOookk.','.kkooooOkook','...kkkkk.kk.'],
  monitor: ['kkkkkkkkkk','kSSSSSSSSk','kSxSSSSSSk','kSSSSSSSSk','kSSSSSSSSk','kkkkkkkkkk','....kk....','..kkkkkk..'],
  house: ['....kk....','...kook...','..kooook..','.kooooook.','kkkkkkkkkk','.kwwwwwwk.','.kwSkwddk.','.kwwkwddk.','.kkkkkkkk.'],
  dice: ['kkkkkkkk','kwwwwwwk','kwkwwwwk','kwwwwwwk','kwwwwwwk','kwwwwkwk','kwwwwwwk','kkkkkkkk'],
};
// 와와 웃는 얼굴(U자 입꼬리)
SPR.wawaSmile = SPR.wawa.slice();
SPR.wawaSmile[9]  = '..kTTkTTTTkTTk..';
SPR.wawaSmile[10] = '...kTTkkkkTTk...';
// 쭌의 변신(실패): 와와 모양인데 라쿤 색 + 꼬리가 남아 있음
const SWAP = { t:'g', T:'G', p:'m', a:'h' };
SPR.morph = SPR.wawa.map(r => [...r].map(c => SWAP[c] || c).join(''));
SPR.morph[11] = SPR.morph[11].slice(0,14) + 'gm';
SPR.morph[12] = SPR.morph[12].slice(0,15) + 'm';
SPR.morph[13] = SPR.morph[13].slice(0,15) + 'g';
// 같은 모양의 다른 색 (추억 지도의 꽃과 가디건)
const recolor = (name, swap) => SPR[name].map(r => [...r].map(c => swap[c] || c).join(''));
SPR.violet = recolor('flower', { p:'v', w:'V' });
SPR.yflower = recolor('flower', { p:'a', w:'y', y:'o' });
SPR.gradBouquet = recolor('bouquet', { p:'x', y:'a' });
SPR.cardigan = recolor('jacket', { d:'o', s:'O' });

function svg(name, cls = '') {
  const rows = SPR[name]; let out = '';
  rows.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {               // 같은 색이 이어지면 하나로 합쳐서 그림
      const c = row[x]; let w = 1;
      while (row[x + w] === c) w++;
      if (c !== '.') out += `<rect x="${x}" y="${y}" width="${w}" height="1" fill="${PAL[c]}"/>`;
      x += w;
    }
  });
  return `<svg class="px ${cls}" viewBox="0 0 ${rows[0].length} ${rows.length}" shape-rendering="crispEdges" aria-hidden="true">${out}</svg>`;
}

