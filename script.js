/* ================================================================
   Parsonalize 相性診断  (2025-06-01)
   ---------------------------------------------------------------
   ① 16タイプ定義
   ② UI 生成
   ③ PHP から文章データ取得
   ④ 星 & レーダーチャート描画
   ⑤ Lucky-Color / あるあるガチャ
==================================================================*/
document.addEventListener('DOMContentLoaded', () => {

    /* ---------- 16タイプ定義 ---------- */
    const mbtiTypes = {
        ISTJ:{name:"管理者",parameters:{論理的思考:4,計画性:5,安定志向:5,感受性:2,柔軟性:2,社交性:2}},
        ISFJ:{name:"擁護者",parameters:{論理的思考:3,計画性:3,安定志向:5,感受性:5,柔軟性:3,社交性:3}},
        INFJ:{name:"提唱者",parameters:{論理的思考:4,計画性:4,安定志向:3,感受性:5,柔軟性:4,社交性:4}},
        INTJ:{name:"建築家",parameters:{論理的思考:5,計画性:5,安定志向:4,感受性:2,柔軟性:3,社交性:2}},
        ISTP:{name:"巨匠",  parameters:{論理的思考:4,計画性:2,安定志向:3,感受性:2,柔軟性:5,社交性:3}},
        ISFP:{name:"冒険家",parameters:{論理的思考:2,計画性:2,安定志向:3,感受性:5,柔軟性:5,社交性:4}},
        INFP:{name:"仲介者",parameters:{論理的思考:3,計画性:2,安定志向:2,感受性:5,柔軟性:5,社交性:4}},
        INTP:{name:"論理学者",parameters:{論理的思考:5,計画性:3,安定志向:3,感受性:1,柔軟性:4,社交性:2}},
        ESTP:{name:"起業家",parameters:{論理的思考:4,計画性:2,安定志向:2,感受性:3,柔軟性:5,社交性:5}},
        ESFP:{name:"エンターテイナー",parameters:{論理的思考:2,計画性:1,安定志向:2,感受性:5,柔軟性:5,社交性:5}},
        ENFP:{name:"広報運動家",parameters:{論理的思考:3,計画性:2,安定志向:2,感受性:5,柔軟性:5,社交性:5}},
        ENTP:{name:"討論者",parameters:{論理的思考:5,計画性:2,安定志向:2,感受性:2,柔軟性:5,社交性:4}},
        ESTJ:{name:"幹部",  parameters:{論理的思考:5,計画性:5,安定志向:5,感受性:2,柔軟性:2,社交性:4}},
        ESFJ:{name:"領事",  parameters:{論理的思考:3,計画性:4,安定志向:5,感受性:5,柔軟性:3,社交性:5}},
        ENFJ:{name:"主人公",parameters:{論理的思考:4,計画性:4,安定志向:4,感受性:5,柔軟性:4,社交性:5}},
        ENTJ:{name:"指揮官",parameters:{論理的思考:5,計画性:5,安定志向:4,感受性:2,柔軟性:3,社交性:4}}
    };

    /* ---------- DOM 取得 ---------- */
    const diagnoseBtn   = document.getElementById('diagnose-button');
    const p1SelWrap     = document.getElementById('person1-type-selection');
    const p2SelWrap     = document.getElementById('person2-type-selection');
    const resultWrap    = document.getElementById('compatibility-result');
    const resultTypes   = document.getElementById('result-types');
    const starSpan      = document.getElementById('star-rating');
    const txtSummary    = document.getElementById('result-text');
    const txtStrength   = document.getElementById('result-strengths');
    const txtWeakness   = document.getElementById('result-weaknesses');
    const txtTips       = document.getElementById('result-tips');
    const radarCanvas   = document.getElementById('parameter-chart');
    const radarLabels   = document.getElementById('parameter-labels');
    const ctx           = radarCanvas.getContext('2d');

    const luckySelect   = document.getElementById('lucky-type-select');
    const aruaruSelect  = document.getElementById('aruaru-type-select');
    const aruaruSpinBtn = document.getElementById('aruaru-spin');
    const aruaruResEl   = document.getElementById('aruaru-result');
    const aruaruShareEl = document.getElementById('aruaru-share');

    /* ---------- ユーティリティ ---------- */
    const boomConfetti = () =>
        confetti({spread:70,particleCount:120,origin:{y:0.25}});

    const fillSelect = sel => {
        Object.keys(mbtiTypes).forEach(c=>{
            sel.add(new Option(`${c}（${mbtiTypes[c].name}）`,c));
        });
    };

    /* ---------- カード生成 ---------- */
    let sel1=null, sel2=null;
    const renderCards = (wrap,person) => {
        Object.entries(mbtiTypes).forEach(([code,info])=>{
            const card=document.createElement('div');
            card.className='mbti-type-card';
            card.dataset.type=code;
            card.innerHTML=`<div class="mbti-type-code">${code}</div>
                      <div class="mbti-type-name">${info.name}</div>`;
            card.onclick=()=>{
                wrap.querySelectorAll('.mbti-type-card').forEach(c=>c.classList.remove('selected'));
                card.classList.add('selected');
                person===1?sel1=code:sel2=code;
            };
            wrap.appendChild(card);
        });
    };
    renderCards(p1SelWrap,1);
    renderCards(p2SelWrap,2);

    /* ---------- 計算 ---------- */
    const calcMetrics = (a,b)=>{
        const A=mbtiTypes[a], B=mbtiTypes[b];
        let same=0; for(let i=0;i<4;i++) if(a[i]===b[i]) same++;
        const rating=[1,2,3,4,5][same];
        const params={}; Object.keys(A.parameters).forEach(k=>{
            params[k]=(A.parameters[k]+B.parameters[k])/2;
        });
        return {rating,params};
    };

    const drawRadar = params => {
        const labels=Object.keys(params);
        const cx=radarCanvas.width/2, cy=radarCanvas.height/2;
        const R=Math.min(cx,cy)*0.7, step=Math.PI*2/labels.length;
        ctx.clearRect(0,0,radarCanvas.width,radarCanvas.height);

        ctx.strokeStyle='rgba(100,100,100,.3)'; ctx.lineWidth=1;
        for(let i=1;i<=5;i++){
            ctx.beginPath();
            const r=R*i/5;
            labels.forEach((_,idx)=>{
                const x=cx+r*Math.cos(idx*step-Math.PI/2);
                const y=cy+r*Math.sin(idx*step-Math.PI/2);
                idx?ctx.lineTo(x,y):ctx.moveTo(x,y);
            });
            ctx.closePath(); ctx.stroke();
        }
        labels.forEach((_,idx)=>{
            ctx.beginPath(); ctx.moveTo(cx,cy);
            ctx.lineTo(cx+R*Math.cos(idx*step-Math.PI/2),
                cy+R*Math.sin(idx*step-Math.PI/2));
            ctx.stroke();
        });

        ctx.beginPath();
        labels.forEach((k,idx)=>{
            const v=params[k]/5;
            const x=cx+R*v*Math.cos(idx*step-Math.PI/2);
            const y=cy+R*v*Math.sin(idx*step-Math.PI/2);
            idx?ctx.lineTo(x,y):ctx.moveTo(x,y);
        });
        ctx.closePath();
        ctx.fillStyle='rgba(255,138,101,.6)';
        ctx.strokeStyle='#F4511E'; ctx.lineWidth=2;
        ctx.fill(); ctx.stroke();

        /* ラベル配置 */
        radarLabels.innerHTML='';
        labels.forEach((k,idx)=>{
            const ang=idx*step-Math.PI/2, rLab=R*1.25;
            const div=document.createElement('div');
            div.className='parameter-label'; div.textContent=k;
            radarLabels.appendChild(div);
            const w=div.offsetWidth, h=div.offsetHeight;
            let x=cx+rLab*Math.cos(ang), y=cy+rLab*Math.sin(ang);
            if(Math.abs(Math.cos(ang))<0.1) x-=w/2;
            else if(Math.cos(ang)<0)        x-=w;
            if(Math.abs(Math.sin(ang))<0.1) y-=h/2;
            else if(Math.sin(ang)<0)        y-=h;
            div.style.left=`${x}px`; div.style.top=`${y}px`;
        });
    };

    /* ---------- 診断ボタン ---------- */
    diagnoseBtn.onclick = () => {
        if(!sel1||!sel2) return alert('2人のタイプを選択してください。');

        fetch(`get_compatibility.php?type1=${sel1}&type2=${sel2}`)
            .then(r=>r.json())
            .then(js=>{
                if(js.error){alert(js.error);return;}

                const m = calcMetrics(sel1,sel2);
                const name1=mbtiTypes[sel1].name, name2=mbtiTypes[sel2].name;

                resultTypes.textContent = `${sel1}（${name1}） と ${sel2}（${name2}）`;
                starSpan.innerHTML = '★★★★★☆☆☆☆☆'.slice(5-m.rating,10-m.rating);
                txtSummary.textContent = js.summary;
                txtStrength.textContent = js.strengths;
                txtWeakness.textContent = js.weaknesses;
                txtTips.textContent = js.tips;
                resultWrap.style.display = 'block';

                /* レーダー */
                requestAnimationFrame(()=>{
                    const size=Math.min(radarCanvas.parentElement.clientWidth,240);
                    radarCanvas.width = radarCanvas.height = size;
                    drawRadar(m.params);
                    resultWrap.scrollIntoView({behavior:'smooth'});
                });

                /* SNS シェア */
                const shareTxt = encodeURIComponent(
                    `私(${sel1})と相手(${sel2})の相性は「${js.title}」！ #MBTI相性診断\n`);
                const url=encodeURIComponent(location.href);
                const open = u=>window.open(u,'_blank');

                document.getElementById('share-x'  ).onclick=()=>open(`https://twitter.com/intent/tweet?text=${shareTxt}&url=${url}`);
                document.getElementById('share-line').onclick=()=>open(`https://social-plugins.line.me/lineit/share?url=${url}&text=${shareTxt}`);
                document.getElementById('share-copy').onclick=()=>{
                    navigator.clipboard.writeText(`${decodeURIComponent(shareTxt)}\n${location.href}`);
                    alert('診断結果リンクをコピーしました！');
                };

                boomConfetti();
            })
            .catch(e=>{console.error(e);alert('診断データ取得に失敗しました。');});
    };

    /* ---------- Lucky-Color ---------- */
    const luckyQuotes = {
        ISTJ:"計画は順調。穏やかな一歩を。", ISFJ:"あなたの思いやりが光る日。",
        INFJ:"直感を信じれば道が開ける。",   INTJ:"長期ビジョンを描いてみて。",
        ISTP:"即断即決が吉！",               ISFP:"感性のままにデザインを。",
        INFP:"小さな夢を声に出そう。",       INTP:"好奇心の赴くまま学ぶ日。",
        ESTP:"冒険心がチャンスに変わる。",   ESFP:"楽しさを全力シェア！",
        ENFP:"アイデアが連鎖する予感。",     ENTP:"議論がヒントを運ぶ。",
        ESTJ:"仕組み化で効率 MAX。",         ESFJ:"笑顔のバフを周囲に配布。",
        ENFJ:"あなたの言葉が誰かを救う。",   ENTJ:"大胆な決断で流れを掴む。"
    };

    const genLuckyColor = type=>{
        const ymd=new Date().toISOString().slice(0,10);
        let h=0; (type+ymd).split('').forEach(c=>h=((h<<5)-h)+c.charCodeAt(0));
        const r=(h>>16)&255, g=(h>>8)&255, b=h&255;
        return '#'+[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('');
    };

    luckySelect.onchange = ()=>{
        const type=luckySelect.value; if(!type) return;
        const hex=genLuckyColor(type);
        document.getElementById('color-swatch').style.background=hex;
        document.getElementById('hex-code'     ).textContent=hex;
        document.getElementById('lucky-quote'  ).textContent=luckyQuotes[type]||'Have a nice day!';
        document.getElementById('lucky-display').style.display='block';
        boomConfetti();

        const txt=encodeURIComponent(`${type} の今日のラッキーカラーは ${hex}！ ${luckyQuotes[type]} #MBTI相性診断`);
        document.getElementById('lucky-share').onclick=
            ()=>window.open(`https://twitter.com/intent/tweet?text=${txt}&url=${encodeURIComponent(location.href)}`,'_blank');
    };

    /* ---------- あるあるガチャ ---------- */
    const aruaruDB = {
        ISTJ: [
            "説明書は端から端まで読む📖",
            "約束は10分前行動⏰",
            "冷蔵庫の整理が趣味🍳"
        ],
        ISFJ: [
            "『大丈夫？』が口癖🩹",
            "タッパー返却率100%🥘",
            "人の誕生日を呪文のように覚える🎂"
        ],
        INFJ: [
            "相手の気持ちを先回り読んで疲れる🔮",
            "日記は秘密の長文📓",
            "理想と現実のギャップにため息💭"
        ],
        INTJ: [
            "頭の中にガントチャート📊",
            "雑談より未来予測🔭",
            "スマホのホームは完璧にフォルダ整理📱"
        ],
        ISTP: [
            "工具箱は宝箱🛠️",
            "休日は突然ソロツーリング🏍️",
            "説明より実演が早い⚡"
        ],
        ISFP: [
            "写真フォルダは風景だらけ🌄",
            "予定は気分でキャンセル🪶",
            "部屋にフェアリーライト必須✨"
        ],
        INFP: [
            "頭の中で MV 制作中🎬",
            "メールの絵文字選びに 5 分⌛",
            "フィクション登場人物へ全力感情移入📖"
        ],
        INTP: [
            "新しい疑問→Wiki→関連リンク無限ループ🔗",
            "頭の中は常に実験室🧪",
            "会話がすぐ哲学になる🤔"
        ],
        ESTP: [
            "セール情報に秒で反応🏃‍♂️",
            "赤信号は短く感じる🚦",
            "壊れた家電はまず叩く🔨"
        ],
        ESFP: [
            "BGM は常に爆音🎶",
            "サプライズがサプライズで終わらない🎁",
            "鏡の前で即ダンス💃"
        ],
        ENFP: [
            "気づくとイベントの幹事🪄",
            "深夜2時に壮大な計画を語り出す🌙",
            "買ったノートは 3 ページで終了📚"
        ],
        ENTP: [
            "話題は毎分チェンジ🔄",
            "自分への反論を先に考える🧠",
            "眠気より好奇心で夜更かし☕"
        ],
        ESTJ: [
            "チェックリストが武器📝",
            "会議はタイムキープ厳守⏲️",
            "休日でもスーツ率高め👔"
        ],
        ESFJ: [
            "グループLINEの潤滑油💬",
            "相手の飲み物が減る前におかわり確認☕",
            "リアクション芸人と言われがち🤣"
        ],
        ENFJ: [
            "グループの目標を勝手に宣言📣",
            "励ましスタンプ連打💌",
            "自分のことは後回し⌚"
        ],
        ENTJ: [
            "TODO 管理アプリ課金勢💎",
            "無意識にリーダー席へ着席🪑",
            "雑談が気づけばブレスト🧩"
        ]
    };

    aruaruSpinBtn.onclick = ()=>{
        const t=aruaruSelect.value;
        if(!t) return alert('タイプを選択してください');
        const list=aruaruDB[t]||["まだネタがありません…😅"];
        const pick=list[Math.floor(Math.random()*list.length)];
        aruaruResEl.textContent=`${t} あるある：${pick}`;
        aruaruResEl.style.display='block';
        aruaruShareEl.style.display='inline-block';

        aruaruResEl.animate(
            [{transform:'scale(.9)',opacity:0},{transform:'scale(1.05)',opacity:1,offset:.7},{transform:'scale(1)',opacity:1}],
            {duration:500,easing:'ease-out'}
        );
        boomConfetti();

        const txt=encodeURIComponent(`${t} あるあるガチャ → ${pick} #MBTIあるある #MBTI相性診断`);
        aruaruShareEl.onclick=()=>window.open(
            `https://twitter.com/intent/tweet?text=${txt}&url=${encodeURIComponent(location.href)}`,'_blank');
    };

    /* ---------- 初期化 ---------- */
    fillSelect(luckySelect);
    fillSelect(aruaruSelect);

    /* ---------- FAQ アコーディオン ---------- */
    document.querySelectorAll('.faq-question').forEach(question => {
        question.addEventListener('click', () => {
            const faqItem = question.closest('.faq-item');
            const answer = faqItem.querySelector('.faq-answer');
            const icon = question.querySelector('.faq-toggle i');

            // 他のすべての項目を閉じる
            document.querySelectorAll('.faq-item').forEach(item => {
                if (item !== faqItem) {
                    item.classList.remove('active');
                    const itemAnswer = item.querySelector('.faq-answer');
                    const itemIcon = item.querySelector('.faq-toggle i');
                    itemAnswer.classList.remove('active');
                    itemIcon.className = 'fas fa-plus';
                }
            });

            // クリックされた項目の状態を切り替え
            faqItem.classList.toggle('active');
            answer.classList.toggle('active');
            
            // アイコンを切り替え
            if (faqItem.classList.contains('active')) {
                icon.className = 'fas fa-minus';
            } else {
                icon.className = 'fas fa-plus';
            }
        });
    });

    /* ---------- 日替わりトリビア ---------- */
    const triviaList = [
        'ISTJ は "現実主義のアーカイバー" 📑 取説は枕元に常備！',
        'ISFJ は "職場のお母さん" 🤱 差し入れのお菓子箱を絶やさない。',
        'INFJ は "静かなストーリーテラー" 📜 頭の中に小説が連載中。',
        'INTJ は "3 手先の戦術家" 🔭 地下鉄の乗換も秒で最短ルート。',
        'ISTP は "工具片手のマエストロ" 🛠️ ネジを見ると回したくなる。',
        'ISFP は "歩くアートギャラリー" 🎨 今日のテーマカラーは気分次第。',
        'INFP は "もしもワールドの建築士" 🌈 空想旅行が日課。',
        'INTP は "なるほどコレクター" 🧪 Wikipedia 深夜散歩は無制限。',
        'ESTP は "退屈の天敵" 🏃‍♂️ 何もないときはガチャを回す。',
        'ESFP は "パーティーの DJ" 🎧 音量 0 は存在しない。',
        'ENFP は "無限ループのアイデア工房" 🚀 ノートは 3 ページで新章突入。',
        'ENTP は "逆張りエンターテイナー" 🏓 議論でアイスブレイク。',
        'ESTJ は "秩序の守護者" ✅ To-Do リストにも優先度タグ必須。',
        'ESFJ は "リアクション即レス部隊" 💬 絵文字で感情バフ配布中。',
        'ENFJ は "歩くモチベーター" 💡 誰かの夢を自分事にしてくれる。',
        'ENTJ は "会議室の CEO" ♟️ ボードゲームでも司令塔ポジション。'
    ];

    document.getElementById('mbti-trivia').textContent =
        '💡 今日の Parsonalize トリビア：' + triviaList[new Date().getDate() % triviaList.length];
});
