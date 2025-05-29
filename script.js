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
            fetchCompatibility(person1Type, person2Type); // PHPからデータを取得する関数を呼び出す
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

// --- 相性診断ロジック（PHPからデータを取得） ---

async function fetchCompatibility(type1, type2) {
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

    try {
        // PHPビルトインサーバーのURLに合わせる
        // ここを 'get_compatibility.php' から 'http://localhost:8000/get_compatibility.php' に変更します。
        const response = await fetch(`http://localhost:8000/get_compatibility.php?type1=${type1}&type2=${type2}`);
        if (!response.ok) {
            // エラーの詳細をコンソールに出力
            console.error(`HTTP error! Status: ${response.status} - ${response.statusText}`);
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        if (data.error) {
            alert("エラー: " + data.error);
            resultDiv.style.display = 'none';
            return;
        }

        resultTypesSpan.textContent = `${type1} と ${type2}`;
        resultText.innerHTML = `<strong>${data.title}</strong><br>${data.summary}`;
        resultStrengths.textContent = data.strengths;
        resultWeaknesses.textContent = data.weaknesses;
        resultTips.textContent = data.tips;

        resultDiv.style.display = 'block'; // 結果表示エリアを表示

        // 結果表示後、結果エリアまでスクロール
        resultDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });

    } catch (error) {
        console.error("相性データの取得に失敗しました:", error);
        alert("相性データの取得中にエラーが発生しました。時間を置いて再度お試しください。");
        resultDiv.style.display = 'none';
    }
}