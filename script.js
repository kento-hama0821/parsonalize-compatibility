/* ================================================================
   script.js ─  Parsonalize 相性診断   (2025-06-01 完全版_同タイプ許可)
   ---------------------------------------------------------------
   ① 16タイプ定義（レーダーチャート用の数値だけ保持）
   ② カード選択 UI
   ③ get_compatibility.php から文章データを取得
   ④ calcMetrics() で星＆レーダーチャートを生成
==================================================================*/
document.addEventListener('DOMContentLoaded', () => {

    /* ---------- DOM ---------- */
    const diagnoseBtn   = document.getElementById('diagnose-button');
    const p1Sel         = document.getElementById('person1-type-selection');
    const p2Sel         = document.getElementById('person2-type-selection');

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

    let sel1 = null, sel2 = null;

    /* =============================================================
          16 タイプ定義  ※文章は省略、レーダー用の 0-5 数値だけ
          論理的思考 / 計画性 / 安定志向 / 感受性 / 柔軟性 / 社交性
    ============================================================= */
    const mbtiTypes = {
        ISTJ:{name:"管理者",parameters:{論理的思考:4,計画性:5,安定志向:5,感受性:2,柔軟性:2,社交性:2}},
        ISFJ:{name:"擁護者",parameters:{論理的思考:3,計画性:3,安定志向:5,感受性:5,柔軟性:3,社交性:3}},
        INFJ:{name:"提唱者",parameters:{論理的思考:4,計画性:4,安定志向:3,感受性:5,柔軟性:4,社交性:4}},
        INTJ:{name:"建築家",parameters:{論理的思考:5,計画性:5,安定志向:4,感受性:2,柔軟性:3,社交性:2}},
        ISTP:{name:"巨匠"  ,parameters:{論理的思考:4,計画性:2,安定志向:3,感受性:2,柔軟性:5,社交性:3}},
        ISFP:{name:"冒険家",parameters:{論理的思考:2,計画性:2,安定志向:3,感受性:5,柔軟性:5,社交性:4}},
        INFP:{name:"仲介者",parameters:{論理的思考:3,計画性:2,安定志向:2,感受性:5,柔軟性:5,社交性:4}},
        INTP:{name:"論理学者",parameters:{論理的思考:5,計画性:3,安定志向:3,感受性:1,柔軟性:4,社交性:2}},
        ESTP:{name:"起業家",parameters:{論理的思考:4,計画性:2,安定志向:2,感受性:3,柔軟性:5,社交性:5}},
        ESFP:{name:"エンターテイナー",parameters:{論理的思考:2,計画性:1,安定志向:2,感受性:5,柔軟性:5,社交性:5}},
        ENFP:{name:"広報運動家",parameters:{論理的思考:3,計画性:2,安定志向:2,感受性:5,柔軟性:5,社交性:5}},
        ENTP:{name:"討論者",parameters:{論理的思考:5,計画性:2,安定志向:2,感受性:2,柔軟性:5,社交性:4}},
        ESTJ:{name:"幹部"  ,parameters:{論理的思考:5,計画性:5,安定志向:5,感受性:2,柔軟性:2,社交性:4}},
        ESFJ:{name:"領事"  ,parameters:{論理的思考:3,計画性:4,安定志向:5,感受性:5,柔軟性:3,社交性:5}},
        ENFJ:{name:"主人公",parameters:{論理的思考:4,計画性:4,安定志向:4,感受性:5,柔軟性:4,社交性:5}},
        ENTJ:{name:"指揮官",parameters:{論理的思考:5,計画性:5,安定志向:4,感受性:2,柔軟性:3,社交性:4}}
    };

    /* =============================================================
          calcMetrics()  ─ 星と平均パラメータを算出
    ============================================================= */
    function calcMetrics(a,b){
        const A=mbtiTypes[a], B=mbtiTypes[b];
        if(!A||!B) return {rating:0,params:{}};

        /* 星：一致数ベース */
        let same=0; for(let i=0;i<4;i++){ if(a[i]===b[i]) same++; }
        const rating=[1,2,3,4,5][same];   // same=0~4 → 1~5

        /* パラメータ平均 */
        const params={};
        Object.keys(A.parameters).forEach(k=>{
            params[k]=(A.parameters[k]+B.parameters[k])/2;
        });
        return {rating,params};
    }

    /* ---------- レーダーチャート ---------- */
    function drawRadar(params){
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
    }

    /* ---------- カード生成 ---------- */
    function renderCards(container,person){
        Object.entries(mbtiTypes).forEach(([code,info])=>{
            const card=document.createElement('div');
            card.className='mbti-type-card';
            card.dataset.type=code;
            card.innerHTML=`
        <div class="mbti-type-code">${code}</div>
        <div class="mbti-type-name">${info.name}</div>`;
            card.addEventListener('click',()=>{
                container.querySelectorAll('.mbti-type-card').forEach(c=>c.classList.remove('selected'));
                card.classList.add('selected');
                person===1?sel1=code:sel2=code;
            });
            container.appendChild(card);
        });
    }
    renderCards(p1Sel,1);
    renderCards(p2Sel,2);

    /* =============================================================
          診断
    ============================================================= */
    diagnoseBtn.addEventListener('click',()=>{
        if(!sel1||!sel2)  return alert('2人のタイプを選択してください。');
        // 同一タイプも診断できるようにチェックを削除 ★★★★★

        fetch(`get_compatibility.php?type1=${sel1}&type2=${sel2}`)
            .then(r=>r.json())
            .then(json=>{
                if(json.error){ alert(json.error); return; }

                const m      = calcMetrics(sel1,sel2);
                const name1  = mbtiTypes[sel1].name;
                const name2  = mbtiTypes[sel2].name;

                resultTypes.textContent = `${sel1}（${name1}） と ${sel2}（${name2}）`;
                starSpan.innerHTML      = Array.from({length:5},(_,i)=>i<m.rating?'★':'☆').join('');
                txtSummary.textContent  = json.summary   || '';
                txtStrength.textContent = json.strengths || '';
                txtWeakness.textContent = json.weaknesses|| '';
                txtTips.textContent     = json.tips      || '';

                resultWrap.style.display='block';

                /* Canvas サイズを親幅に合わせ設定 → 描画 */
                requestAnimationFrame(()=>{
                    const size=Math.min(
                        radarCanvas.parentElement.getBoundingClientRect().width,240);
                    radarCanvas.width=radarCanvas.height=size;
                    radarCanvas.style.width=radarCanvas.style.height=size+'px';
                    ctx.setTransform(1,0,0,1,0,0);
                    drawRadar(m.params);
                    resultWrap.scrollIntoView({behavior:'smooth'});
                });
            })
            .catch(e=>{
                console.error(e);
                alert('診断データ取得に失敗しました。');
            });
    });

});
