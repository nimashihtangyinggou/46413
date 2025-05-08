// 初始化 GUN
const gun = Gun(['https://gun-manhattan.herokuapp.com/gun']);
const questions = gun.get('questions');

// DOM 元素
const questionsList = document.getElementById('questions-list');
const questionForm = document.getElementById('question-form');

// 監聽表單提交
questionForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const questionText = document.getElementById('question').value;

    // 建立新問題
    const questionId = Date.now().toString();
    questions.get(questionId).put({
        username: username,
        question: questionText,
        timestamp: Date.now(),
        answers: []
    });

    // 清空表單
    questionForm.reset();
});

// 渲染問題到頁面
function renderQuestion(questionId, data) {
    // 檢查元素是否已存在
    let questionElement = document.getElementById(`question-${questionId}`);
    
    if (!questionElement) {
        questionElement = document.createElement('div');
        questionElement.id = `question-${questionId}`;
        questionElement.className = 'list-group-item question-card';
        questionsList.prepend(questionElement);
    }

    const timestamp = new Date(data.timestamp).toLocaleString('zh-TW');
    
    questionElement.innerHTML = `
        <div class="d-flex justify-content-between align-items-start">
            <div>
                <span class="username">${data.username}</span>
                <p class="mt-2">${data.question}</p>
                <div class="timestamp">${timestamp}</div>
            </div>
        </div>
        <div class="answer-section">
            <form class="answer-form mt-3" onsubmit="submitAnswer('${questionId}', event)">
                <div class="input-group">
                    <input type="text" class="form-control" placeholder="寫下您的回答..." required>
                    <button class="btn btn-outline-primary" type="submit">回答</button>
                </div>
            </form>
            <div class="answers mt-3" id="answers-${questionId}"></div>
        </div>
    `;

    // 渲染答案
    if (data.answers) {
        const answersContainer = document.getElementById(`answers-${questionId}`);
        answersContainer.innerHTML = '';
        Object.keys(data.answers).forEach(key => {
            if (data.answers[key]) {
                const answerTimestamp = new Date(parseInt(key)).toLocaleString('zh-TW');
                const answerHtml = `
                    <div class="answer-item mb-2">
                        <small class="text-muted">${answerTimestamp}</small>
                        <p class="mb-1">${data.answers[key]}</p>
                    </div>
                `;
                answersContainer.insertAdjacentHTML('beforeend', answerHtml);
            }
        });
    }
}

// 提交答案
function submitAnswer(questionId, event) {
    event.preventDefault();
    const form = event.target;
    const answerText = form.querySelector('input').value;
    const answerTimestamp = Date.now();
    
    questions.get(questionId).get('answers').get(answerTimestamp).put(answerText);
    form.reset();
}

// 即時監聽資料變化
questions.map().once((data, id) => {
    if (data) {
        renderQuestion(id, data);
    }
});

questions.map().on((data, id) => {
    if (data) {
        renderQuestion(id, data);
    }
});