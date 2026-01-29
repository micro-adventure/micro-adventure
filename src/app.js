document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generate-btn');
    const adventureDisplay = document.getElementById('adventure-display');
    const lastAdventureDisplay = document.getElementById('last-adventure');

    // Load last adventure from LocalStorage
    const lastAdventure = localStorage.getItem('lastAdventure');
    if (lastAdventure) {
        lastAdventureDisplay.textContent = lastAdventure;
    }

    generateBtn.addEventListener('click', () => {
        // Randomly select an adventure
        if (typeof adventures !== 'undefined' && adventures.length > 0) {
            const randomIndex = Math.floor(Math.random() * adventures.length);
            const selectedAdventure = adventures[randomIndex];
            
            // Animation effect (simple opacity toggle)
            adventureDisplay.style.opacity = 0;
            setTimeout(() => {
                adventureDisplay.textContent = selectedAdventure;
                adventureDisplay.style.opacity = 1;
            }, 200);

            // Save to LocalStorage
            localStorage.setItem('lastAdventure', selectedAdventure);
            
            // "Last Adventure Completed" display updates on page reload, preserving history of previous session.
        } else {
            adventureDisplay.textContent = "No adventures found!";
        }
    });
});
