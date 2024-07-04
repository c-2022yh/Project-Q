//html 태그 값 받아옴
const frameDiv = document.getElementById('frame');
const frameSlide = document.getElementById('frameSlide');

//전체 데이터
var dataList = undefined;

//범위값만 받아온 데이터
var rangeDataList = [];

//파일 읽어오는 함수
function handleFile(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        const text = e.target.result;
        const csvData = parseCSV(text);

        dataList = csvData;
        setDataList();
        makeSlide();
    };

    reader.readAsText(file);
}

//csv 데이터 가공
function parseCSV(text) {
    const rows = text.split('\n');
    return rows.map(row => row.split(','));
}

//이벤트리스너 연결
document.getElementById('input-csv').addEventListener('change', handleFile, false);

//파일로 불러온 데이터 가공 후 dataList배열에 저장
function setDataList()
{
    let d = [];
    for(let i in dataList)
    {
        d.push(new Array());
        for(let j in dataList[i])
        {
            if(!(dataList[i][j] == "" || dataList[i][j] =="\r")) //필요없는 값 제거
            {
                d[i][j] = dataList[i][j];
            }
        }
    }
    dataList = d;
    dataList.pop();

}

//슬라이드 관련 변수
var minSlider;
var maxSlider;
var minValue;
var maxValue;

//범위 슬라이드 설정
function makeSlide()
{
    //변수 설정
    let min = dataList[0][0];
    let max = dataList[dataList.length-1][0];
    //html 추가
    frameSlide.innerHTML = `
        <h2>챕터 범위 설정하기</h2>
        <div class="slider-container">
            <input type="range" id="minSlider" class="slider" min="${min}" max="${max}" value="0">
            <input type="range" id="maxSlider" class="slider" min="${min}" max="${max}" value="100">
            <div class="output">
                <span id="minValue">${min}</span>
                <span id="maxValue">${max}</span>
            </div>
            <button id="submitButton" onclick="submitButtonFunc()">입력완료</button>
        </div>
    `
    //html 태그 가져옴
    minSlider = document.getElementById('minSlider');
    maxSlider = document.getElementById('maxSlider');
    minValue = document.getElementById('minValue');
    maxValue = document.getElementById('maxValue');
    
    //최대값, 최소값이 서로 엇나가지 않도록 조정 
    var updateValues = function() {
        if (parseInt(minSlider.value) > parseInt(maxSlider.value)) {
            maxSlider.value = minSlider.value;
        }
        minValue.textContent = minSlider.value;
        maxValue.textContent = maxSlider.value;
    }

    //이벤트리스너 연결
    minSlider.addEventListener('input', updateValues);
    maxSlider.addEventListener('input', updateValues);
}

//입력완료 버튼이 눌리면 실행되는 함수
function submitButtonFunc()
{
    //지정한 범위 안에 있는 데이터만 가져옴
    for(let i in dataList)
    {
        for(let j=minSlider.value; j<=maxSlider.value; j++)
        {
            if(dataList[i][0] == j)
            {
                rangeDataList.push(new Array());
                rangeDataList[i] = dataList[i];
            }
        }
    }
    //초기 세팅
    setQuestion();
    //문제를 만드는 함수
    playQuiz();
}

//문제 관련 변수

//html 태그 지정할 변수
var questionNumber;
var scoreP;
var question;
var answerList = [];

//몇번째 문제를 푸는 지 확인할 변수
var questionCount = 0;

//정답 맞힌 수
var score = 0;

//정답 보기 처리할 배열
var questionList = [];

//오답 보기 처리할 배열
var wrongQuestionList = [];

//정답 보기 인덱스
var aIndex = 0;

//세팅 함수
function setQuestion()
{
    //html 태그 작성
    frameDiv.innerHTML=`
        <h2 id="questionNumber">문제1</h2>
        <p id="scoreP" style="text-align: right; margin-right: 30px;">정답: 0/50</p>
        <h3 id="question">영단어</h3>
        <ul id="answerList">
            <li><button id="answer1" onclick="clickAnswer('0')">정답1</button></li>
            <li><button id="answer2" onclick="clickAnswer('1')">정답2</button></li>
            <li><button id="answer3" onclick="clickAnswer('2')">정답3</button></li>
            <li><button id="answer4" onclick="clickAnswer('3')">정답4</button></li>
            <li><button id="answer5" onclick="clickAnswer('4')">정답5</button></li>
        </ul>
    `;

    //html 태그 연결
    questionNumber = document.getElementById('questionNumber');
    scoreP = document.getElementById('scoreP');
    question = document.getElementById('question');
    answerList.push(document.getElementById('answer1'));
    answerList.push(document.getElementById('answer2'));
    answerList.push(document.getElementById('answer3'));
    answerList.push(document.getElementById('answer4'));
    answerList.push(document.getElementById('answer5'));
    
    //문제 처리 관련 배열 생성 후 1로 초기화
    //1이면 문제 출제 가능 0이면 이미 출제된 문제
    questionList = new Array(rangeDataList.length).fill(1);
    wrongQuestionList = new Array(rangeDataList.length).fill(1);

}

function playQuiz()
{
    questionCount++;
    //html값 표기
    questionNumber.innerHTML =`문제${questionCount}`;
    scoreP.innerHTML = `정답: ${score}/${rangeDataList.length}`;

    //오답보기 초기화
    wrongQuestionList.fill(1);

    //정답 인덱스 가져오기
    let randomIndex = getRandomIndex();

    //정답 인덱스의 단어 뜻 인덱스 가져오기
    let meanIndex = getMeanIndex(randomIndex);

    
    let q = "";
    let a = new Array(5).fill("");

    aIndex = Math.floor(Math.random()*5);

    let r = Math.random();
    if(r<0.5) //영단어가 문제
    {

        q = rangeDataList[randomIndex][1];
        a[aIndex] = rangeDataList[randomIndex][meanIndex];

        for(let i in a)
        {
            if(a[i] == "")
            {
                let wrongIndex = getWrongAnswerIndex();
                a[i] = rangeDataList[wrongIndex][getMeanIndex(wrongIndex)];
            }
        }

        
    }
    else // 뜻이 문제
    {
        q = rangeDataList[randomIndex][meanIndex];
        a[aIndex] = rangeDataList[randomIndex][1];

        for(let i in a)
        {
            if(a[i] == "")
            {
                let wrongIndex = getWrongAnswerIndex();
                a[i] = rangeDataList[wrongIndex][1];
            }
        }
        
    }

    
    
    question.innerHTML = q;
    for(let i in answerList)
    {
        answerList[i].innerHTML=a[i];
    }

    

}

function getRandomIndex()
{
    while(true)
    {
        let r = Math.floor(Math.random()*questionList.length);
        if(questionList[r] == 1)
        {
            questionList[r] = 0;
            wrongQuestionList[r] = 0;
            return r;
        }
    }
    
}

function getMeanIndex(i)
{
    let r = Math.floor(Math.random() * (rangeDataList[i].length-2)) + 2;
    return r;
}

function getWrongAnswerIndex()
{
    while(true)
    {
        let r = Math.floor(Math.random()*wrongQuestionList.length);
        if(wrongQuestionList[r] == 1)
        {
            wrongQuestionList[r] = 0;
            return r;
        }
    }
}

function clickAnswer(num)
{
    if(num == aIndex)
    {
        score++;
        console.log("정답!");

    }
    else console.log("오답!");

    if(questionCount == rangeDataList.length)
    {
        console.log("끝");
        resultScreen();
    }
    else playQuiz();
}


function resultScreen()
{
    frameDiv.innerHTML=`
        <h1>문제 끝!</h1>
        <h2>정답 수 ${score}/${rangeDataList.length}</h2>
        <ul id="answerList">
            <li><button id="b1" onclick="">다시 풀기</button></li>
            <li><button id="b2" onclick="">범위 다시 정하기</button></li>

        </ul>
    `;
}












