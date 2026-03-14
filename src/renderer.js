require('./index.css');

// Get references to our HTML elements
const character = document.getElementById('character');
const sprite = document.getElementById('sprite');
const speechBubble = document.getElementById('speech-bubble');
const speechBubbleDismissBtn = document.getElementById('dismiss-btn');
const bubbleText = document.getElementById('bubble-text');

// Sound
const alarmSound = new Audio(require('./assets/alarm-sound.mp3'));
const catSound = new Audio(require('./assets/cat-meow.mp3'));
let soundInterval = null;

// Keep track of the timer that hides the bubble
let bubbleTimer = null;

// Listen for meeting reminders from main.js via IPC
window.electronAPI.onShowReminder((meeting) => 
{
  showReminder(meeting);
});

// Show reminder
function showReminder(meeting)
{
  // Update the speech bubble text
  bubbleText.textContent = `📅 ${meeting.title} in ${meeting.minutesUntil} min!`;

  // Show the speech bubble
  speechBubble.style.display = 'block';

  // Make character excited
  character.classList.remove('dancing')
  character.classList.add('excited');

  //Play alarm sound & cat sound
  alarmSound.play();
  catSound.play();

  // Clear any existing sound interval
  if(soundInterval) clearInterval(soundInterval);

  // Repeat sound every 4.5 seconds
  soundInterval = setInterval(() => {
    // Reset and replay both sounds
    alarmSound.currentTime = 0;
    catSound.currentTime = 0;
    alarmSound.play();
    catSound.play();
  }, 4500);

  // Clear any existing timer
  if (bubbleTimer) clearTimeout(bubbleTimer);

  // Hide the bubble and stop alarm sounds after 30 seconds
  bubbleTimer = setTimeout(() => {
    dismissReminder();
  }, 30000);
}

// Make the character draggable around the screen
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let windowStartX = 0;
let windowStartY = 0;

character.addEventListener('mousedown', (e) => {
  isDragging = true;
  
  // Record where the mouse was when we started dragging
  dragStartX = e.screenX;
  dragStartY = e.screenY;

  // Record where the window was when we started dragging
  windowStartX = window.screenX;
  windowStartY = window.screenY;

  character.style.cursor = 'grabbing';
  e.preventDefault();
});

document.addEventListener('mousemove', (e) => 
{
  if (!isDragging) return;

  // Calculate how far the mouse has moved from where we started
  const deltaX = e.screenX - dragStartX;
  const deltaY = e.screenY - dragStartY;

  // Move the window by that same amount from where it started
  window.electronAPI.moveWindow(
    Math.round(windowStartX + deltaX),
    Math.round(windowStartY + deltaY)
  );
});

document.addEventListener('mouseup', () => 
{
  isDragging = false;
  character.style.cursor = 'pointer';
});

speechBubbleDismissBtn.addEventListener('click', () =>
{
  dismissReminder();
})

function dismissReminder() 
{
  // Hide speech bubble
  speechBubble.style.display = 'none';

  // Return to idle animation
  character.classList.remove('excited');

  // Stop sounds
  clearInterval(soundInterval);
  soundInterval = null;
  alarmSound.pause();
  alarmSound.currentTime = 0;
  catSound.pause();
  catSound.currentTime = 0;

  // Clear the auto-dismiss timer
  if (bubbleTimer) {
    clearTimeout(bubbleTimer);
    bubbleTimer = null;
  }
}
