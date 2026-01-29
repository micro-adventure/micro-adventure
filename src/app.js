document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const generateBtn = document.getElementById('generate-btn');
    const completeBtn = document.getElementById('complete-btn');
    const shareBtn = document.getElementById('share-btn');
    const actionButtons = document.getElementById('action-buttons');
    const adventureDisplay = document.getElementById('adventure-display');
    const lastAdventureDisplay = document.getElementById('last-adventure');
    const streakCountDisplay = document.getElementById('streak-count');
    const historyContainer = document.getElementById('history-container');

    // State
    let currentAdventure = null;

    // --- Audio Context for Click Sound ---
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    let audioCtx;

    function playClickSound() {
        if (!audioCtx) {
            audioCtx = new AudioContext();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        // A short, high-pitched "pop" or "click"
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.1);

        gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);

        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.1);
    }

    // --- Haptic Feedback Helper ---
    function vibrate(pattern = 10) {
        if (navigator.vibrate) {
            navigator.vibrate(pattern);
        }
    }

    // --- Initialization ---
    function init() {
        // Load Streak
        const streak = localStorage.getItem('streak') || 0;
        streakCountDisplay.textContent = streak;

        // Load Last Adventure
        const lastAdventure = localStorage.getItem('lastAdventure');
        if (lastAdventure) {
            lastAdventureDisplay.textContent = lastAdventure;
        }

        // Load History
        renderHistory();
    }

    function renderHistory() {
        const historyData = JSON.parse(localStorage.getItem('adventureHistory') || '[]');
        
        if (historyData.length === 0) {
            historyContainer.innerHTML = '<p class="text-center opacity-50 italic text-sm py-4">No completed adventures yet.</p>';
            return;
        }

        historyContainer.innerHTML = historyData.map(item => `
            <div class="bg-white/10 p-4 rounded-xl border border-white/5 flex flex-col">
                <p class="font-medium">${item.text}</p>
                <p class="text-xs opacity-60 mt-1 text-right">${new Date(item.timestamp).toLocaleString()}</p>
            </div>
        `).join('');
    }

    // --- Event Listeners ---

    // 1. Generate Adventure
    generateBtn.addEventListener('click', () => {
        if (typeof adventures !== 'undefined' && adventures.length > 0) {
            playClickSound();
            vibrate(10);

            const randomIndex = Math.floor(Math.random() * adventures.length);
            currentAdventure = adventures[randomIndex];
            
            // Animation
            adventureDisplay.style.opacity = 0;
            setTimeout(() => {
                adventureDisplay.textContent = currentAdventure;
                adventureDisplay.style.opacity = 1;
                
                // Show action buttons
                actionButtons.classList.remove('hidden');
            }, 200);

        } else {
            adventureDisplay.textContent = "No adventures found!";
        }
    });

    // 2. Mission Accomplished
    completeBtn.addEventListener('click', () => {
        if (!currentAdventure) return;

        playClickSound(); 
        vibrate([50, 50, 50]); // Success pattern

        const now = new Date();
        const todayStr = now.toDateString(); 

        // Update Last Adventure
        localStorage.setItem('lastAdventure', currentAdventure);
        lastAdventureDisplay.textContent = currentAdventure;

        // Update Streak
        let streak = parseInt(localStorage.getItem('streak') || 0);
        const lastCompletionDate = localStorage.getItem('lastCompletionDate');

        if (lastCompletionDate !== todayStr) {
            // Check if last completion was yesterday
            const yesterday = new Date(now);
            yesterday.setDate(now.getDate() - 1);
            const yesterdayStr = yesterday.toDateString();

            if (lastCompletionDate === yesterdayStr) {
                streak++;
            } else {
                streak = 1; 
            }
            
            localStorage.setItem('streak', streak);
            localStorage.setItem('lastCompletionDate', todayStr);
            streakCountDisplay.textContent = streak;
        }

        // Update History
        const historyData = JSON.parse(localStorage.getItem('adventureHistory') || '[]');
        historyData.unshift({
            text: currentAdventure,
            timestamp: now.toISOString()
        });
        if (historyData.length > 50) historyData.pop();
        localStorage.setItem('adventureHistory', JSON.stringify(historyData));
        
        renderHistory();

        // Reset UI State 
        actionButtons.classList.add('hidden');
        adventureDisplay.textContent = "Good job! Ready for another?";
        currentAdventure = null;
    });

    // 3. Share (With Fallback Fix)
    shareBtn.addEventListener('click', async () => {
        vibrate(10);
        const textToShare = `I just got this micro-adventure: "${currentAdventure}"! Can you do it? ${window.location.href}`;
        
        try {
            if (navigator.share && navigator.canShare && navigator.canShare({ title: 'Micro-Adventure', text: textToShare })) {
                await navigator.share({
                    title: 'Micro-Adventure',
                    text: textToShare
                });
            } else {
                throw new Error('Web Share API not supported');
            }
        } catch (err) {
            // Fallback to clipboard
            try {
                await navigator.clipboard.writeText(textToShare);
                
                // Visual Feedback
                const originalText = shareBtn.textContent;
                shareBtn.textContent = "Copied to Clipboard!";
                shareBtn.classList.remove('bg-white/20', 'hover:bg-white/30');
                shareBtn.classList.add('bg-green-500', 'hover:bg-green-600', 'border-transparent');
                
                setTimeout(() => {
                    shareBtn.textContent = originalText;
                    shareBtn.classList.add('bg-white/20', 'hover:bg-white/30');
                    shareBtn.classList.remove('bg-green-500', 'hover:bg-green-600', 'border-transparent');
                }, 2000);
            } catch (clipboardErr) {
                console.error('Failed to copy:', clipboardErr);
                alert('Could not share or copy to clipboard.');
            }
        }
    });

    // Initialize on load
    init();
});
