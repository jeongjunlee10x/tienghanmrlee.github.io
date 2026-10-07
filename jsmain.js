// Cấu hình thời gian làm bài (15 phút)
let timeLeft = 15 * 60;
const timerElement = document.getElementById('time');

if (timerElement) {
  const timerInterval = setInterval(() => {
    let minutes = Math.floor(timeLeft / 60);
    let seconds = timeLeft % 60;

    seconds = seconds < 10 ? '0' + seconds : seconds;
    minutes = minutes < 10 ? '0' + minutes : minutes;

    timerElement.textContent = `${minutes}:${seconds}`;

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      alert("Đã hết thời gian làm bài!");
      submitQuiz();
    }
    timeLeft--;
  }, 1000);
}

// Hàm chấm điểm
function submitQuiz() {
  const answers = {
    q1: 'B',
    q2: 'A'
  };

  let score = 0;
  const form = document.getElementById('quiz-form');
  
  if (form.q1.value === answers.q1) score++;
  if (form.q2.value === answers.q2) score++;

  document.getElementById('score').textContent = score;
  document.getElementById('result-box').classList.remove('hidden');
  document.getElementById('submit-btn').disabled = true;
}