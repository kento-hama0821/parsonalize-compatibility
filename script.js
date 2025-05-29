// ページが読み込まれたときの処理
document.addEventListener('DOMContentLoaded', function() {
    // アニメーション要素の表示制御 (ボタンを除く)
    const animatedElements = document.querySelectorAll('.animated:not(#start-diagnosis-btn):not(#start-diagnosis-btn-bottom)');
    animatedElements.forEach(element => {
        element.style.opacity = '0'; // 初期状態は非表示
    });

    setTimeout(() => {
        animatedElements.forEach(element => {
            element.style.opacity = '1'; // 少し遅れて表示開始
        });
    }, 100);

    // イベントリスナー設定
    setupEventListeners();

    // よくある質問の開閉機能を設定
    setupFaqToggle();
});

// イベントリスナーの設定
function setupEventListeners() {
    // 「相性診断を始める」ボタンをクリック → フォームセクションへスクロール
    const startDiagnosisBtn = document.getElementById("start-diagnosis-btn");
    if (startDiagnosisBtn) {
        startDiagnosisBtn.addEventListener("click", function(e) {
            e.preventDefault();
            const targetElement = document.getElementById("compatibility-form-section");
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80, // ヘッダーの高さ分を考慮
                    behavior: 'smooth'
                });
            }
        });
    }

    const startDiagnosisBtnBottom = document.getElementById("start-diagnosis-btn-bottom");
    if (startDiagnosisBtnBottom) {
        startDiagnosisBtnBottom.addEventListener("click", function(e) {
            e.preventDefault();
            const targetElement = document.getElementById("compatibility-form-section");
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80, // ヘッダーの高さ分を考慮
                    behavior: 'smooth'
                });
            }
        });
    }

    // ナビゲーションリンクのスムーススクロール
    const navLinks = document.querySelectorAll('.main-nav a, .footer-links a');
    navLinks.forEach(link => {
        if (link.getAttribute('href').startsWith('#')) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 80, // ヘッダーの高さ分を考慮
                        behavior: 'smooth'
                    });
                }
            });
        }
    });

    // 相性診断ボタンのクリックイベント
    const diagnoseButton = document.getElementById("diagnose-button");
    if (diagnoseButton) {
        diagnoseButton.addEventListener("click", function() {
            const person1Type = document.getElementById("person1-type").value;
            const person2Type = document.getElementById("person2-type").value;
            displayCompatibility(person1Type, person2Type);
        });
    }
}

// よくある質問の開閉機能
function setupFaqToggle() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        const toggle = item.querySelector('.faq-toggle i');

        // 初期状態では回答を非表示に
        answer.style.display = 'none';

        question.addEventListener('click', () => {
            // 回答の表示切り替え
            if (answer.style.display === 'none') {
                answer.style.display = 'block';
                toggle.classList.remove('fa-plus');
                toggle.classList.add('fa-minus');
            } else {
                answer.style.display = 'none';
                toggle.classList.remove('fa-minus');
                toggle.classList.add('fa-plus');
            }
        });
    });
}

// 画面のスクロール状態を監視して、適宜アニメーション要素を表示する
window.addEventListener('scroll', function() {
    const animatedElements = document.querySelectorAll('.animated:not(#start-diagnosis-btn):not(#start-diagnosis-btn-bottom)');

    animatedElements.forEach(element => {
        const position = element.getBoundingClientRect();

        // 要素が画面に入ったら表示
        if (position.top < window.innerHeight * 0.9) {
            element.style.opacity = '1';
        }
    });
});

// --- 相性診断ロジック（JavaScriptのみで簡潔に実装） ---

// MBTI相性データの定義（例：一部のみ記述、実際には全パターンを網羅するか、ロジックで生成）
// 順序は問わず、タイプ1-タイプ2の組み合わせでキーを設定
const compatibilityData = {
    // 理想的な相性
    'ENFJ-INFJ': {
        title: '最高の理解者ペア！',
        summary: 'お互いの感情を深く理解し、精神的な繋がりを重視する理想的な関係です。共に成長し、支え合えるでしょう。',
        strengths: '深い共感力、価値観の一致、互いの成長を促す、サポートし合う関係。',
        weaknesses: '対立を避けがち、現実的な問題解決が後回しになる可能性。',
        tips: '具体的な目標設定を意識し、時には現実的な課題にも目を向けましょう。率直な意見交換も大切です。'
    },
    'INFP-ENFJ': {
        title: '心温まる相互サポート関係！',
        summary: 'INFPの理想主義とENFJの共感力が融合し、互いにインスピレーションを与え合う温かい関係です。',
        strengths: '互いの感情を尊重、創造的なアイデアを共有、深い精神的な繋がり、支援し合う。',
        weaknesses: '衝突を避ける傾向、現実的な問題解決への苦手意識。',
        tips: '具体的な計画を立てる役割分担をしたり、現実的な課題についてオープンに話し合う時間を設けましょう。'
    },
    'ISTP-ESTP': {
        title: '刺激的な冒険家コンビ！',
        summary: '活動的で刺激を求める二人。共に新しい体験に飛び込み、スリリングな日々を楽しむことができます。',
        strengths: '行動力、柔軟性、即応性、共に楽しむ能力。',
        weaknesses: '感情表現が苦手、長期的な計画が立てにくい、衝動的になりがち。',
        tips: '感情的な側面にも意識を向け、お互いの内面を共有する時間を作りましょう。時には立ち止まって計画を練ることも大切です。'
    },
    // 良好な相性
    'ISTJ-ESTJ': {
        title: '堅実で信頼できるパートナーシップ！',
        summary: '論理的で責任感が強く、現実的な視点を持つ二人の組み合わせ。目標達成に向けて効率的に協力できます。',
        strengths: '高い組織力、責任感、計画性、堅実な行動。',
        weaknesses: '新しいアイデアへの抵抗、感情表現が控えめ。',
        tips: '新しい視点や方法も時には取り入れてみましょう。感情を言葉で伝える努力をすることで、より深い絆が生まれます。'
    },
    'ENFP-INTJ': {
        title: '創造と戦略のダイナミックペア！',
        summary: 'ENFPの無限のアイデアとINTJの戦略的思考が組み合わさり、互いに新しい可能性を引き出し合える関係です。',
        strengths: '斬新な発想、問題解決能力、知的な刺激、互いの成長を促す。',
        weaknesses: '感情と論理のバランス、計画性と柔軟性の違い。',
        tips: '感情をオープンにし、計画を立てる際は柔軟性も持たせることが大切です。互いの違いを尊重し、学び合う姿勢を持ちましょう。'
    },
    'ISFJ-ESTP': {
        title: 'サポートと行動のバランス関係！',
        summary: 'ISFJの面倒見の良さとESTPの行動力が融合し、お互いに足りない部分を補い合える関係です。',
        strengths: '実用性、互いのサポート、現実的な課題への対処、新しい体験。',
        weaknesses: '価値観の衝突、感情のすれ違い、計画性の欠如。',
        tips: 'お互いの行動の背景にある意図を理解しようと努め、感情を共有する時間を意識的に設けましょう。計画性のある行動も試みてください。'
    },
    // 注意点はあるが学びの多い相性
    'ISTJ-ENFP': {
        title: '学びと成長のダイナミックコンビ！',
        summary: '堅実なISTJと自由なENFP。異なる視点から学び合う機会が多く、成長に繋がる関係です。',
        strengths: '新しい視点の獲得、計画性と柔軟性の融合、問題解決能力の向上。',
        weaknesses: '価値観の衝突、コミュニケーションのすれ違い、ストレスの蓄積。',
        tips: 'お互いの行動原理を理解しようと努め、具体的な言葉で感情や意図を伝えましょう。共通の目標を持つと良いでしょう。'
    },
    'INTP-ESFJ': {
        title: '論理と感情の架け橋関係！',
        summary: 'INTPの論理的思考とESFJの人間関係重視の特性が交わり、互いに新しい価値観を発見できる関係です。',
        strengths: '論理的な視点と感情的なサポート、異なる視点からの問題解決。',
        weaknesses: '感情理解の難しさ、社交性の違い。',
        tips: 'INTPは感情を言葉で表現することを意識し、ESFJはINTPの独立性を尊重しましょう。共通の興味を見つけると関係が深まります。'
    },
    // その他の組み合わせ（デフォルトメッセージまたは詳細なロジックで対応）
    'default': {
        title: '興味深い組み合わせです！',
        summary: '異なる性格タイプが織りなす関係は、互いに新しい発見と成長の機会をもたらします。違いを理解し、尊重することが鍵です。',
        strengths: '多様な視点、お互いを刺激し合う、未知の可能性。',
        weaknesses: '誤解が生じやすい、価値観の衝突。',
        tips: 'オープンなコミュニケーションを心がけ、お互いの違いをポジティブに捉えましょう。共通の目標を見つけると良いでしょう。'
    }
};

// タイプを正規化するヘルパー関数 (例: 'ENFJ-INFJ' と 'INFJ-ENFJ' を同じキーに正規化)
function getSortedTypeKey(type1, type2) {
    // 辞書順に並べ替えることで、順序が逆でも同じキーになるようにする
    const sortedTypes = [type1, type2].sort();
    return sortedTypes[0] + '-' + sortedTypes[1];
}

// 相性診断結果を表示する関数
function displayCompatibility(type1, type2) {
    const resultDiv = document.getElementById("compatibility-result");
    const resultTypesSpan = document.getElementById("result-types");
    const resultText = document.getElementById("result-text");
    const resultStrengths = document.getElementById("result-strengths");
    const resultWeaknesses = document.getElementById("result-weaknesses");
    const resultTips = document.getElementById("result-tips");

    if (!type1 || !type2) {
        alert("2つのタイプを選択してください。");
        resultDiv.style.display = 'none';
        return;
    }

    const key = getSortedTypeKey(type1, type2);
    const data = compatibilityData[key] || compatibilityData['default']; // 一致するデータがなければデフォルトを使用

    resultTypesSpan.textContent = `${type1} と ${type2}`;
    resultText.innerHTML = `<strong>${data.title}</strong><br>${data.summary}`;
    resultStrengths.textContent = data.strengths;
    resultWeaknesses.textContent = data.weaknesses;
    resultTips.textContent = data.tips;

    resultDiv.style.display = 'block'; // 結果表示エリアを表示

    // 結果表示後、結果エリアまでスクロール
    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
}