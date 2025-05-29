/* ================================================================
   script.js  ─  Parsonalize 相性診断   (2025-05-30 修正版)
==================================================================*/
document.addEventListener('DOMContentLoaded', () => {

    /* ---------- DOM 取得 ---------- */
    const diagnoseButton         = document.getElementById('diagnose-button');
    const person1TypeSelection   = document.getElementById('person1-type-selection');
    const person2TypeSelection   = document.getElementById('person2-type-selection');
    const compatibilityResultDiv = document.getElementById('compatibility-result');
    const resultTypesSpan        = document.getElementById('result-types');
    const resultTextP            = document.getElementById('result-text');
    const resultStrengthsP       = document.getElementById('result-strengths');
    const resultWeaknessesP      = document.getElementById('result-weaknesses');
    const resultTipsP            = document.getElementById('result-tips');
    const starRatingSpan         = document.getElementById('star-rating');
    const parameterChartCanvas   = document.getElementById('parameter-chart');
    const parameterLabelsDiv     = document.getElementById('parameter-labels');
    const ctx                    = parameterChartCanvas.getContext('2d');

    let selectedPerson1Type = null;
    let selectedPerson2Type = null;

    /* ---------- FAQ アコーディオン ---------- */
    document.querySelectorAll('.faq-question').forEach(q=>{
        q.addEventListener('click',()=>{
            const a=q.nextElementSibling, icon=q.querySelector('.faq-toggle i');
            const open=a.style.display==='block';
            a.style.display=open?'none':'block';
            icon.classList.toggle('fa-plus', open);
            icon.classList.toggle('fa-minus',!open);
        });
    });

    /* ---------- スムーススクロール ---------- */
    document.querySelectorAll('a[href^="#"]').forEach(a=>{
        a.addEventListener('click',e=>{
            e.preventDefault();
            document.querySelector(a.getAttribute('href'))
                .scrollIntoView({behavior:'smooth'});
        });
    });

    /* =============================================================
       MBTI データ定義  （16タイプすべて完全収録）
    ============================================================= */
    const mbtiTypes = {
        "ISTJ": { name:"管理者", shortDesc:"責任感が強く、真面目で実用的なタイプ。",
            strengths:"現実的で頼りになり、約束をきちんと守る。組織力があり、安定した関係を築ける。",
            weaknesses:"変化に抵抗しやすく、感情表現が苦手。柔軟性に欠けることがある。",
            tips:"相手の感情に耳を傾け、積極的に共感を示しましょう。新しい体験にもオープンな姿勢を。",
            parameters:{論理的思考:4,計画性:5,安定志向:5,感受性:2,柔軟性:2,社交性:2}},
        "ISFJ": { name:"擁護者", shortDesc:"温かく、控えめで、献身的なタイプ。",
            strengths:"思いやりがあり、相手の気持ちを察する。忠実で、安定と調和を重視。",
            weaknesses:"自己犠牲的になりがちで、自分の意見を言いにくい。ストレスを溜めやすい。",
            tips:"自分の意見や感情も大切に。相手もあなたのサポートを喜びます。",
            parameters:{論理的思考:3,計画性:3,安定志向:5,感受性:5,柔軟性:3,社交性:3}},
        "INFJ": { name:"提唱者", shortDesc:"理想主義で洞察力が高いタイプ。",
            strengths:"深い共感力で相手の可能性を引き出す。精神的な繋がりを大切に。",
            weaknesses:"完璧主義で自分を追い込みがち。誤解されやすい。",
            tips:"現実と理想のバランスを。完璧でなくてもあなたの存在が価値。",
            parameters:{論理的思考:4,計画性:4,安定志向:3,感受性:5,柔軟性:4,社交性:4}},
        "INTJ": { name:"建築家", shortDesc:"戦略的で独立心が強いタイプ。",
            strengths:"問題解決能力が高く、目標達成に着実。知的刺激を与える。",
            weaknesses:"感情表現が苦手で冷たく見られがち。他人の意見を聞かない事も。",
            tips:"相手の感情にも配慮し、時には弱みを見せることも大切。",
            parameters:{論理的思考:5,計画性:5,安定志向:4,感受性:2,柔軟性:3,社交性:2}},
        "ISTP": { name:"巨匠", shortDesc:"冷静で実践的、好奇心旺盛なタイプ。",
            strengths:"問題解決に優れ柔軟で適応力あり、自由を好む。",
            weaknesses:"感情表現が苦手で突然姿を消すことも。長期計画が苦手。",
            tips:"感情を言葉で表現する意識を。予測不能な行動は相手を不安に。",
            parameters:{論理的思考:4,計画性:2,安定志向:3,感受性:2,柔軟性:5,社交性:3}},
        "ISFP": { name:"冒険家", shortDesc:"芸術的で感受性豊かなタイプ。",
            strengths:"感受性豊かで美しさを共有。温かく相手の個性を尊重。",
            weaknesses:"感情的になりやすく批判に弱い。決断を先延ばしがち。",
            tips:"感じたことを素直に伝えると相手はもっと理解できる。",
            parameters:{論理的思考:2,計画性:2,安定志向:3,感受性:5,柔軟性:5,社交性:4}},
        "INFP": { name:"仲介者", shortDesc:"理想主義で共感力に富むタイプ。",
            strengths:"深い共感力で相手に寄り添う。創造的で成長を促す。",
            weaknesses:"非現実的な理想を追い優柔不断。ストレスに弱い。",
            tips:"現実的な目標を設定し小さな成功体験を積む。",
            parameters:{論理的思考:3,計画性:2,安定志向:2,感受性:5,柔軟性:5,社交性:4}},
        "INTP": { name:"論理学者", shortDesc:"論理的で分析的なタイプ。",
            strengths:"知的会話を好み新視点を提供。独立心が強い。",
            weaknesses:"感情より論理を優先しがち。社交性に欠ける事も。",
            tips:"知的刺激だけでなく感情的繋がりも大切に。",
            parameters:{論理的思考:5,計画性:3,安定志向:3,感受性:1,柔軟性:4,社交性:2}},
        "ESTP": { name:"起業家", shortDesc:"エネルギッシュで行動力あるタイプ。",
            strengths:"行動力があり刺激的。困難でも冷静で頼りになる。",
            weaknesses:"衝動的で退屈を嫌い責任感に欠けがち。",
            tips:"長期的安定も視野に入れ計画性を持つと充実。",
            parameters:{論理的思考:4,計画性:2,安定志向:2,感受性:3,柔軟性:5,社交性:5}},
        "ESFP": { name:"エンターテイナー", shortDesc:"陽気で社交的なタイプ。",
            strengths:"明るく楽しい雰囲気を作る。共感力が高い。",
            weaknesses:"衝動的で飽きっぽい。長期視点に欠ける。",
            tips:"将来のことも少し考え計画性を持つと魅力がさらに。",
            parameters:{論理的思考:2,計画性:1,安定志向:2,感受性:5,柔軟性:5,社交性:5}},
        "ENFP": { name:"広報運動家", shortDesc:"情熱的で創造的なタイプ。",
            strengths:"好奇心旺盛で活気をもたらす。共感力が高い。",
            weaknesses:"集中が続かず感情の起伏が激しい事も。",
            tips:"一つに集中する時間を作り感情の波を穏やかに。",
            parameters:{論理的思考:3,計画性:2,安定志向:2,感受性:5,柔軟性:5,社交性:5}},
        "ENTP": { name:"討論者", shortDesc:"機知に富み挑戦的なタイプ。",
            strengths:"刺激的議論を好み新視点を提供。",
            weaknesses:"議論に熱中し感情を無視しがち。実行が苦手。",
            tips:"相手の感情にも耳を傾け共感を示すと信頼関係が。",
            parameters:{論理的思考:5,計画性:2,安定志向:2,感受性:2,柔軟性:5,社交性:4}},
        "ESTJ": { name:"幹部", shortDesc:"実践的で組織力のあるタイプ。",
            strengths:"リーダーシップがあり現実的で頼りになる。",
            weaknesses:"頑固で自分の意見を押し付けがち。感情軽視。",
            tips:"相手の意見に耳を傾け柔軟性を見せるとさらに輝く。",
            parameters:{論理的思考:5,計画性:5,安定志向:5,感受性:2,柔軟性:2,社交性:4}},
        "ESFJ": { name:"領事", shortDesc:"社交的で協調性を重んじるタイプ。",
            strengths:"明るい雰囲気を作りきめ細かなサポート。",
            weaknesses:"他人の評価を気にしすぎストレスを抱えがち。",
            tips:"自分の意見も大切にし完璧を目指し過ぎないこと。",
            parameters:{論理的思考:3,計画性:4,安定志向:5,感受性:5,柔軟性:3,社交性:5}},
        "ENFJ": { name:"主人公", shortDesc:"カリスマ性があり人を鼓舞するタイプ。",
            strengths:"リーダーシップと深い共感力で成長を促す。",
            weaknesses:"自己犠牲的で他人の問題を抱え込みがち。",
            tips:"限界を知り無理をしない。問題に介入し過ぎない。",
            parameters:{論理的思考:4,計画性:4,安定志向:4,感受性:5,柔軟性:4,社交性:5}},
        "ENTJ": { name:"指揮官", shortDesc:"戦略的で自信に満ちたタイプ。",
            strengths:"目標達成能力が高く知的刺激を与える。",
            weaknesses:"感情表現が苦手で高圧的に見られがち。",
            tips:"相手の感情にも耳を傾け時には弱みを見せること。",
            parameters:{論理的思考:5,計画性:5,安定志向:4,感受性:2,柔軟性:3,社交性:4}}
    };

    /* =============================================================
       getCompatibility()  ─ 先ほどご提示のロジックをそのまま収録
    ============================================================= */
    function getCompatibility(type1, type2) {
        const t1 = mbtiTypes[type1], t2 = mbtiTypes[type2];
        if(!t1||!t2){return {rating:0,text:"タイプが不明です",strengths:"",weaknesses:"",tips:"",parameters:{論理적思考:0,計画性:0,安定志向:0,感受性:0,柔軟性:0,社交性:0}};}

        let score=0, strengths=[], weaknesses=[], tips=[], params={};
        for(const k in t1.parameters){ params[k]=(t1.parameters[k]+t2.parameters[k])/2; }

        /* ---- 4 指標 (E/I,S/N,T/F,J/P) ---- */
        const axes=[0,1,2,3];
        axes.forEach(idx=>{
            const same = type1.charAt(idx)===type2.charAt(idx);
            if(idx===0){ // E/I
                score+=same?1:3;
                same? strengths.push("お互いのエネルギーレベルが類似。")
                    : strengths.push("外向性と内向性が補完しバランス。");
                if(!same){ weaknesses.push("活動ペースが異なる。");
                    tips.push("相手のペースを尊重し調整を。"); }
            }else if(idx===1){ // S/N
                score+=same?2:3;
                same? strengths.push("情報処理方法が似て誤解が少ない。")
                    : strengths.push("具体と抽象が補完し幅広い視点。");
                if(!same){ weaknesses.push("認識のズレが生じやすい。");
                    tips.push("具体例と全体像を意識して対話を。");}
            }else if(idx===2){ // T/F
                score+=same?1:3;
                same? strengths.push("意思決定基準が近く共感しやすい。")
                    : strengths.push("論理と感情が補完し多角的に判断。");
                if(!same){ weaknesses.push("優先基準の違いで対立する事も。");
                    tips.push("相手のプロセスを理解し尊重を。");}
            }else{ // J/P
                score+=same?1:3;
                same? strengths.push("行動パターンが近く協調しやすい。")
                    : strengths.push("計画性と柔軟性が補完し対応力向上。");
                if(!same){ weaknesses.push("段取りと臨機応変で食い違い。");
                    tips.push("得意分野を分担し役割を明確に。");}
            }
        });

        /* ---- 特定ペアのボーナス例 ---- */
        if((type1==="ENFP"&&type2==="ISTJ")||(type1==="ISTJ"&&type2==="ENFP")){
            score+=2;
            strengths.push("互いに無い視点を与え合い斬新さと実用性が融合。");
            weaknesses.push("価値観の違いで擦れ違いが起こりやすい。");
            tips.push("オープンな対話で理解を深めましょう。");
        }
        if((type1==="INFJ"&&type2==="ENFJ")||(type1==="ENFJ"&&type2==="INFJ")){
            score+=4;
            strengths.push("深い共感で理想的関係を築ける。");
            weaknesses.push("気を遣い過ぎ本音が言えなくなる事も。");
            tips.push("正直な気持ちの共有が鍵。");
        }
        if((type1==="INTJ"&&type2==="INTP")||(type1==="INTP"&&type2==="INTJ")){
            score+=3;
            strengths.push("知的探求を共に楽しみ刺激し合える。");
            weaknesses.push("感情表現が苦手で誤解しやすい。");
            tips.push("言葉だけでなく行動でも感謝を示す。");
        }
        if((type1==="ESFP"&&type2==="ISTP")||(type1==="ISTP"&&type2==="ESFP")){
            score+=2;
            strengths.push("行動力を刺激し合い新しい体験を共有。");
            weaknesses.push("将来ビジョンの考え方が異なる。");
            tips.push("短期と長期のバランスを意識。");
        }

        const rating=Math.min(5,Math.max(1,Math.ceil(score/3.5)));
        let text=`あなたと${t2.name}（${type2}）さんの相性は星${rating}つ（5段階）。`;
        text+= rating===5? "素晴らしい相性です！" :
            rating===4? "とても良い相性です。" :
                rating===3? "まずまずの相性です。" :
                    rating===2? "努力が必要な相性かもしれません。" :
                        "挑戦的な相性かもしれません。";

        const finalStrengths = strengths.join(" ") + " " + t1.strengths + " " + t2.strengths;
        const finalWeaknesses= weaknesses.join(" ") + " " + t1.weaknesses+ " " + t2.weaknesses;
        const finalTips      = tips.join(" ")       + " " + t1.tips      + " " + t2.tips;

        return {rating,text,strengths:finalStrengths,weaknesses:finalWeaknesses,tips:finalTips,parameters:params};
    }

    /* =============================================================
       レーダーチャート描画
    ============================================================= */
    function drawRadarChart(data, labels){
        const cssColor = getComputedStyle(document.documentElement)
            .getPropertyValue('--c-primary-dark').trim() || '#F4511E';
        const cx=parameterChartCanvas.width/2, cy=parameterChartCanvas.height/2;
        const radius=Math.min(cx,cy)*0.7;
        const step=(Math.PI*2)/labels.length;

        ctx.clearRect(0,0,parameterChartCanvas.width,parameterChartCanvas.height);

        /* グリッド */
        ctx.strokeStyle='rgba(100,100,100,0.3)'; ctx.lineWidth=1;
        for(let r=1;r<=5;r++){
            ctx.beginPath();
            const rad=radius*(r/5);
            labels.forEach((_,i)=>{
                const x=cx+rad*Math.cos(i*step-Math.PI/2);
                const y=cy+rad*Math.sin(i*step-Math.PI/2);
                i? ctx.lineTo(x,y):ctx.moveTo(x,y);
            });
            ctx.closePath(); ctx.stroke();
        }
        /* 放射線 */
        labels.forEach((_,i)=>{
            ctx.beginPath();
            ctx.moveTo(cx,cy);
            ctx.lineTo(cx+radius*Math.cos(i*step-Math.PI/2),
                cy+radius*Math.sin(i*step-Math.PI/2));
            ctx.stroke();
        });

        /* データ多角形 */
        ctx.beginPath();
        labels.forEach((lab,i)=>{
            const v=data[lab]/5;
            const x=cx+radius*v*Math.cos(i*step-Math.PI/2);
            const y=cy+radius*v*Math.sin(i*step-Math.PI/2);
            i? ctx.lineTo(x,y):ctx.moveTo(x,y);
        });
        ctx.closePath();
        ctx.fillStyle  ='rgba(255,138,101,0.6)';
        ctx.strokeStyle=cssColor; ctx.lineWidth=2;
        ctx.fill(); ctx.stroke();

        /* ラベル */
        parameterLabelsDiv.innerHTML='';
        labels.forEach((lab,i)=>{
            const angle=i*step-Math.PI/2, rLab=radius*1.2;
            let x=cx+rLab*Math.cos(angle), y=cy+rLab*Math.sin(angle);

            const el=document.createElement('div');
            el.className='parameter-label'; el.textContent=lab;
            parameterLabelsDiv.appendChild(el);

            const w=el.offsetWidth, h=el.offsetHeight;
            if(Math.abs(Math.cos(angle))<0.1) x-=w/2;
            else if(Math.cos(angle)<0)        x-=w;
            if(Math.abs(Math.sin(angle))<0.1) y-=h/2;
            else if(Math.sin(angle)<0)        y-=h;
            el.style.left=`${x}px`; el.style.top=`${y}px`;
        });
    }

    /* =============================================================
       選択カードの生成
    ============================================================= */
    function renderTypeSelection(container, personNum){
        container.innerHTML='';
        Object.entries(mbtiTypes).forEach(([code,info])=>{
            const card=document.createElement('div');
            card.className='mbti-type-card'; card.dataset.type=code;
            card.innerHTML=`
        <div class="mbti-type-code">${code}</div>
        <div class="mbti-type-name">${info.name}</div>
        <div class="mbti-type-short-desc">${info.shortDesc}</div>`;
            card.addEventListener('click',()=>{
                container.querySelectorAll('.mbti-type-card')
                    .forEach(c=>c.classList.remove('selected'));
                card.classList.add('selected');
                personNum===1? selectedPerson1Type=code : selectedPerson2Type=code;
            });
            container.appendChild(card);
        });
    }
    renderTypeSelection(person1TypeSelection,1);
    renderTypeSelection(person2TypeSelection,2);

    /* =============================================================
       診断実行ボタン
    ============================================================= */
    diagnoseButton.addEventListener('click',()=>{
        if(!selectedPerson1Type||!selectedPerson2Type)
            return alert("2人の性格タイプを選択してください。");
        if(selectedPerson1Type===selectedPerson2Type)
            return alert("異なる性格タイプを選択してください。");

        const compat=getCompatibility(selectedPerson1Type,selectedPerson2Type);
        const p1Name=mbtiTypes[selectedPerson1Type].name;
        const p2Name=mbtiTypes[selectedPerson2Type].name;

        resultTypesSpan.textContent=
            `${selectedPerson1Type}（${p1Name}）と ${selectedPerson2Type}（${p2Name}）`;
        resultTextP.textContent       = compat.text;
        resultStrengthsP.textContent  = compat.strengths;
        resultWeaknessesP.textContent = compat.weaknesses;
        resultTipsP.textContent       = compat.tips;

        /* 星 */
        starRatingSpan.innerHTML = Array.from({length:5},(_,i)=>
            i<compat.rating?'<i class="fas fa-star star"></i>':'<i class="far fa-star star"></i>'
        ).join('');

        /* ① 結果を先に表示してレイアウト確定 */
        compatibilityResultDiv.style.display='block';

        /* ② 確定後に Canvas サイズ決定→描画 */
        requestAnimationFrame(()=>{
            const rect = parameterChartCanvas.parentElement.getBoundingClientRect();
            const size = Math.min(rect.width, 240);     // CSS と同じ 240px を上限
            /* キャンバス内部の座標系と CSS サイズを 1:1 にそろえる */
            parameterChartCanvas.width  = size;         // <canvas width="…">
            parameterChartCanvas.height = size;         // <canvas height="…">
            parameterChartCanvas.style.width  = `${size}px`;  // CSS 幅
            parameterChartCanvas.style.height = `${size}px`;  // CSS 高
            ctx.setTransform(1,0,0,1,0,0);              // スケールをリセット

            drawRadarChart(compat.parameters,
                ['論理的思考','計画性','安定志向','感受性','柔軟性','社交性']);

            compatibilityResultDiv.scrollIntoView({behavior:'smooth'});
        });
    });

}); // DOMContentLoaded end
