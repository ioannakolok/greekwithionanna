// Main JavaScript for Greek Learning Platform
// Interactive components and animations

document.addEventListener('DOMContentLoaded', function() {
    // Wait for language manager to be initialized
    if (window.languageManager) {
        // Initialize all components
        initializeNavigation();
        initializeHeroAnimations();
        initializeQuiz();
        initializeVideoGallery();
        initializeCounters();
        initializeScrollAnimations();
        
        // Re-initialize components after language is set
        setTimeout(() => {
            initializeQuiz(); // Re-initialize quiz with correct language
        }, 100);
    } else {
        // Fallback if language manager isn't ready
        setTimeout(() => {
            initializeNavigation();
            initializeHeroAnimations();
            initializeQuiz();
            initializeVideoGallery();
            initializeCounters();
            initializeScrollAnimations();
        }, 100);
    }
});

// Navigation functionality
function initializeNavigation() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // Ensure language toggle exists. If the translations script hasn't added it yet,
    // call the language manager to create the toggle manually. This prevents
    // missing toggles on pages where the dynamic insertion fails.
    if (typeof window !== 'undefined' && window.languageManager) {
        // Only add a new toggle if one is not already present
        if (!document.getElementById('language-toggle')) {
            window.languageManager.createLanguageToggle();
        }
    }

    // Toggle desktop dropdown menus on click instead of relying solely on hover.
    // This ensures submenus stay open long enough for users to click items.
    const navParents = document.querySelectorAll('nav .relative.group');
    navParents.forEach(parent => {
        const button = parent.querySelector('button');
        const dropdown = parent.querySelector('.absolute');
        if (button && dropdown) {
            button.addEventListener('click', function(e) {
                // Prevent default link behaviour and stop propagation to avoid unwanted navigation
                e.preventDefault();
                e.stopPropagation();
                // Hide other dropdowns before toggling this one
                navParents.forEach(otherParent => {
                    if (otherParent !== parent) {
                        const otherDropdown = otherParent.querySelector('.absolute');
                        if (otherDropdown) otherDropdown.classList.add('hidden');
                    }
                });
                dropdown.classList.toggle('hidden');
            });
        }
    });
    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        navParents.forEach(parent => {
            if (!parent.contains(e.target)) {
                const dropdown = parent.querySelector('.absolute');
                if (dropdown) dropdown.classList.add('hidden');
            }
        });
    });
}

// Hero section animations
function initializeHeroAnimations() {
    // Get current language for hero text
    const currentLang = window.languageManager ? window.languageManager.getCurrentLanguage() : 'en';
    
    const heroTexts = {
        'en': [
            'Master Greek with Ioanna',
            'Discover Greek Culture',
            'Learn from a Native Expert',
            'Experience Authentic Greece'
        ],
        'de': [
            'Griechisch meistern mit Ioanna',
            'Griechische Kultur entdecken',
            'Von einer Muttersprachlerin lernen',
            'Authentisches Griechenland erleben'
        ]
    };
    
    // Typewriter effect for hero heading
    const typed = new Typed('#typed-heading', {
        strings: heroTexts[currentLang] || heroTexts['en'],
        typeSpeed: 60,
        backSpeed: 30,
        backDelay: 2000,
        loop: true,
        showCursor: true,
        cursorChar: '|'
    });
}

// Interactive Quiz System
function initializeQuiz() {
    // Get current language
    const currentLang = window.languageManager ? window.languageManager.getCurrentLanguage() : 'en';
    
    const quizData = [
        {
            question: currentLang === 'de' ? 
                'Was bedeutet "Γεια σου" (Yia sou) auf Deutsch?' :
                'What does "Γεια σου" (Yia sou) mean in English?',
            options: [
                { 
                    text: currentLang === 'de' ? 'Hallo/Auf Wiedersehen (informell)' : 'Hello/Goodbye (informal)', 
                    correct: true 
                },
                { 
                    text: currentLang === 'de' ? 'Vielen Dank' : 'Thank you very much', 
                    correct: false 
                },
                { 
                    text: currentLang === 'de' ? 'Wie geht es dir?' : 'How are you?', 
                    correct: false 
                },
                { 
                    text: currentLang === 'de' ? 'Guten Morgen' : 'Good morning', 
                    correct: false 
                }
            ],
            explanation: currentLang === 'de' ?
                '"Γεια σου" ist tatsächlich die informelle Art, sowohl hallo als auch auf Wiedersehen auf Griechisch zu sagen. Es ist eine der vielseitigsten Begrüßungen, die Sie im täglichen Gespräch verwenden werden.' :
                '"Γεια σου" is indeed the informal way to say both hello and goodbye in Greek. It\'s one of the most versatile greetings you\'ll use in daily conversations.'
        },
        {
            question: currentLang === 'de' ? 
                'Welcher griechische Buchstabe klingt wie "th" in "this"?' :
                'Which Greek letter sounds like \'th\' in \'this\'?',
            options: [
                { text: "Δ (Delta)", correct: true },
                { text: "Θ (Theta)", correct: false },
                { text: "Λ (Lambda)", correct: false },
                { text: "Ρ (Rho)", correct: false }
            ],
            explanation: currentLang === 'de' ?
                'Δ (Delta) macht den "th"-Sound wie in "this", während Θ (Theta) den "th"-Sound wie in "think" macht. Dies ist eine wichtige Unterscheidung in der griechischen Aussprache.' :
                'Δ (Delta) makes the \'th\' sound as in \'this\', while Θ (Theta) makes the \'th\' sound as in \'think\'. This is an important distinction in Greek pronunciation.'
        },
        {
            question: currentLang === 'de' ? 
                'Was ist der traditionelle griechische Gruß für "Guten Morgen"?' :
                'What is the traditional Greek greeting for \'Good morning\'?',
            options: [
                { 
                    text: "Καλημέρα (Kalimera)", 
                    correct: true 
                },
                { 
                    text: "Καλησπέρα (Kalispera)", 
                    correct: false 
                },
                { 
                    text: "Καληνύχτα (Kalinichta)", 
                    correct: false 
                },
                { 
                    text: "Γεια σας (Yia sas)", 
                    correct: false 
                }
            ],
            explanation: currentLang === 'de' ?
                'Καλημέρα (Kalimera) wird für "Guten Morgen" verwendet und wird typischerweise bis gegen Mittag verwendet. Καλησπέρα (Kalispera) wird für "Guten Abend" verwendet.' :
                'Καλημέρα (Kalimera) is used for \'Good morning\' and is typically used until around noon. Καλησπέρα (Kalispera) is used for \'Good evening\'.'
        },
        {
            question: currentLang === 'de' ? 
                'Was schützt das "böse Auge" (μάτι) in der griechischen Kultur?' :
                'In Greek culture, what does the \'evil eye\' (μάτι) protect against?',
            options: [
                { 
                    text: currentLang === 'de' ? 'Schlechtes Glück und negative Energie' : 'Bad luck and negative energy', 
                    correct: true 
                },
                { 
                    text: currentLang === 'de' ? 'Nur körperliche Krankheit' : 'Physical illness only', 
                    correct: false 
                },
                { 
                    text: currentLang === 'de' ? 'Finanzielle Probleme' : 'Financial problems', 
                    correct: false 
                },
                { 
                    text: currentLang === 'de' ? 'Beziehungsprobleme' : 'Relationship issues', 
                    correct: false 
                }
            ],
            explanation: currentLang === 'de' ?
                'Das "böse Auge" (μάτι) soll vor schlechtem Glück, negativer Energie und neidischen Blicken anderer schützen. Es ist eine tief verwurzelte kulturelle Tradition.' :
                'The \'evil eye\' (μάτι) is believed to protect against bad luck, negative energy, and envious glances from others. It\'s a deeply rooted cultural tradition.'
        },
        {
            question: currentLang === 'de' ? 
                'Welche griechische Insel ist berühmt für ihre weißen Gebäude und blauen Kuppeln?' :
                'Which Greek island is famous for its white buildings and blue domes?',
            options: [
                { 
                    text: "Santorini", 
                    correct: true 
                },
                { 
                    text: "Mykonos", 
                    correct: false 
                },
                { 
                    text: "Crete", 
                    correct: false 
                },
                { 
                    text: "Rhodes", 
                    correct: false 
                }
            ],
            explanation: currentLang === 'de' ?
                'Santorini ist weltberühmt für seine ikonischen weißen kykladischen Gebäude mit blauen Kuppeln, besonders in den Städten Fira und Oia.' :
                'Santorini is world-famous for its iconic white Cycladic buildings with blue domes, particularly in the towns of Fira and Oia.'
        }
    ];

    // If no quiz container exists on the current page, exit early. This prevents errors
    // on pages without a quiz (e.g. the home page after the quiz was moved).
    const quizContainerCheck = document.getElementById('quiz-container');
    if (!quizContainerCheck) {
        return;
    }

    let currentQuestion = 0;
    let score = 0;
    let answered = false;

    const quizContainer = document.getElementById('quiz-container');
    const questionElement = document.getElementById('quiz-question');
    const optionsContainer = document.getElementById('quiz-options');
    const feedbackElement = document.getElementById('quiz-feedback');
    const resultsElement = document.getElementById('quiz-results');
    const progressBar = document.getElementById('quiz-progress-bar');
    const progressText = document.getElementById('quiz-progress-text');
    const nextButton = document.getElementById('next-question');

    function displayQuestion() {
        const question = quizData[currentQuestion];
        questionElement.textContent = question.question;
        
        // Update progress
        const progress = ((currentQuestion + 1) / quizData.length) * 100;
        progressBar.style.width = progress + '%';
        progressText.textContent = `${currentQuestion + 1} of ${quizData.length}`;
        
        // Clear options
        optionsContainer.innerHTML = '';
        
        // Create options
        question.options.forEach((option, index) => {
            const optionElement = document.createElement('div');
            optionElement.className = 'quiz-option border-2 border-gray-200 rounded-lg p-4 hover:border-aegean-blue cursor-pointer';
            optionElement.innerHTML = `<span class="font-medium">${option.text}</span>`;
            optionElement.dataset.correct = option.correct;
            
            optionElement.addEventListener('click', () => selectAnswer(optionElement, option.correct));
            optionsContainer.appendChild(optionElement);
        });
        
        answered = false;
    }

    function selectAnswer(selectedElement, isCorrect) {
        if (answered) return;
        
        answered = true;
        
        // Remove hover effects from all options
        const allOptions = optionsContainer.querySelectorAll('.quiz-option');
        allOptions.forEach(option => {
            option.style.pointerEvents = 'none';
            option.classList.remove('hover:border-aegean-blue');
        });
        
        // Mark selected answer
        if (isCorrect) {
            selectedElement.classList.add('correct');
            score++;
        } else {
            selectedElement.classList.add('incorrect');
            // Also highlight the correct answer
            allOptions.forEach(option => {
                if (option.dataset.correct === 'true') {
                    option.classList.add('correct');
                }
            });
        }
        
        // Show feedback
        showFeedback(isCorrect);
    }

    function showFeedback(isCorrect) {
        const question = quizData[currentQuestion];
        const feedbackText = document.getElementById('feedback-text');
        const feedbackTitle = feedbackElement.querySelector('h4');
        
        // Get current language for feedback messages
        const currentLang = window.languageManager ? window.languageManager.getCurrentLanguage() : 'en';
        
        feedbackText.textContent = question.explanation;
        
        // Set correct feedback title based on whether answer was correct
        if (isCorrect) {
            feedbackTitle.textContent = currentLang === 'de' ? 'Ausgezeichnet!' : 'Excellent!';
            feedbackElement.className = 'mt-8 p-6 rounded-lg bg-green-50 border border-green-200';
        } else {
            feedbackTitle.textContent = currentLang === 'de' ? 'Fast richtig!' : 'Close!';
            feedbackElement.className = 'mt-8 p-6 rounded-lg bg-orange-50 border border-orange-200';
        }
        
        feedbackElement.classList.remove('hidden');
        
        // Animate feedback appearance
        anime({
            targets: feedbackElement,
            opacity: [0, 1],
            translateY: [20, 0],
            duration: 500,
            easing: 'easeOutCubic'
        });
    }

    function nextQuestion() {
        currentQuestion++;
        
        if (currentQuestion < quizData.length) {
            // Hide feedback and show next question
            feedbackElement.classList.add('hidden');
            displayQuestion();
            
            // Animate question transition
            anime({
                targets: '#quiz-question-container',
                opacity: [0, 1],
                translateX: [50, 0],
                duration: 500,
                easing: 'easeOutCubic'
            });
        } else {
            // Show results
            showResults();
        }
    }

    function showResults() {
        const percentage = Math.round((score / quizData.length) * 100);
        const scoreDisplay = document.getElementById('score-display');
        const progressCircle = document.getElementById('progress-circle');
        const resultsTitle = resultsElement.querySelector('h3');
        const resultsDescription = resultsElement.querySelector('p');
        
        // Get current language for results messages
        const currentLang = window.languageManager ? window.languageManager.getCurrentLanguage() : 'en';
        
        // Update results text based on language
        resultsTitle.textContent = currentLang === 'de' ? 'Großartiger Start!' : 'Great Start!';
        resultsDescription.textContent = currentLang === 'de' ? 
            'Sie zeigen ausgezeichnetes Potenzial zum Lernen von Griechisch! Ioanna kann Ihnen helfen, auf diesem Fundament aufzubauen.' :
            'You\'re showing excellent potential for learning Greek! Ioanna can help you build on this foundation.';
        
        // Hide quiz container and show results
        document.getElementById('quiz-question-container').style.display = 'none';
        feedbackElement.style.display = 'none';
        resultsElement.classList.remove('hidden');
        
        // Animate results
        anime({
            targets: resultsElement,
            opacity: [0, 1],
            scale: [0.8, 1],
            duration: 800,
            easing: 'easeOutCubic'
        });
        
        // Animate score counting
        anime({
            targets: { count: 0 },
            count: percentage,
            duration: 2000,
            easing: 'easeOutCubic',
            update: function(anim) {
                scoreDisplay.textContent = Math.round(anim.animatables[0].target.count) + '%';
            }
        });
        
        // Animate progress circle
        const circumference = 2 * Math.PI * 50;
        const offset = circumference - (percentage / 100) * circumference;
        
        anime({
            targets: progressCircle,
            strokeDashoffset: [circumference, offset],
            duration: 2000,
            easing: 'easeOutCubic'
        });
    }

    // Event listeners
    if (nextButton) {
        nextButton.addEventListener('click', nextQuestion);
    }

    // Initialize first question
    displayQuestion();
}

// Video Gallery System
function initializeVideoGallery() {
    // Get current language
    const currentLang = window.languageManager ? window.languageManager.getCurrentLanguage() : 'en';
    
    const videoData = [
        {
            id: 1,
            title: currentLang === 'de' ? 'Grundlegende griechische Begrüßungen' : 'Basic Greek Greetings',
            category: "language",
            duration: "5:32",
            thumbnail: "https://kimi-web-img.moonshot.cn/img/platoacademy.net/edd8964b87da6a60555e0cd03a45862536d816b5.webp",
            description: currentLang === 'de' ? 'Lernen Sie grundlegende griechische Begrüßungen für tägliche Gespräche' : 'Learn essential Greek greetings for daily conversations'
        },
        {
            id: 2,
            title: currentLang === 'de' ? 'Griechische Ostertraditionen' : 'Greek Easter Traditions',
            category: "culture",
            duration: "12:15",
            thumbnail: "https://kimi-web-img.moonshot.cn/img/pontosworld.com/0c897967f1af1d4d15cdc9ece21001de9fed26d3.jpg",
            description: currentLang === 'de' ? 'Entdecken Sie die schönen Traditionen der griechisch-orthodoxen Ostern' : 'Discover the beautiful traditions of Greek Orthodox Easter'
        },
        {
            id: 3,
            title: currentLang === 'de' ? 'Santorini-Reiseführer' : 'Santorini Travel Guide',
            category: "travel",
            duration: "8:45",
            thumbnail: "https://kimi-web-img.moonshot.cn/img/www.greeka.com/111f326bb79c410922d301e91489d7efdc3f56d5.jpg",
            description: currentLang === 'de' ? 'Erkunden Sie die magische Insel Santorini' : 'Explore the magical island of Santorini'
        },
        {
            id: 4,
            title: currentLang === 'de' ? 'Antike griechische Mythologie' : 'Ancient Greek Mythology',
            category: "history",
            duration: "15:20",
            thumbnail: "https://kimi-web-img.moonshot.cn/img/symbolikon.com/1f2b2521feff7651c53632b8d2f2867f34da6b70.png",
            description: currentLang === 'de' ? 'Die faszinierende Welt der griechischen Götter und Helden' : 'The fascinating world of Greek gods and heroes'
        },
        {
            id: 5,
            title: currentLang === 'de' ? 'Griechische Aussprachetipps' : 'Greek Pronunciation Tips',
            category: "language",
            duration: "7:18",
            thumbnail: "https://kimi-web-img.moonshot.cn/img/www.greek123.com/ba516675f09fb2f65678c37846503d4f1203bd48.png",
            description: currentLang === 'de' ? 'Meistern Sie die Klänge des griechischen Alphabets' : 'Master the sounds of the Greek alphabet'
        },
        {
            id: 6,
            title: currentLang === 'de' ? 'Traditioneller griechischer Tanz' : 'Traditional Greek Dance',
            category: "culture",
            duration: "10:30",
            thumbnail: "https://kimi-web-img.moonshot.cn/img/static.wixstatic.com/543d11a97de2a9d78ae48584c458d12473b1bffb.jpg",
            description: currentLang === 'de' ? 'Lernen Sie über griechische traditionelle Tänze und Musik' : 'Learn about Greek traditional dances and music'
        },
        {
            id: 7,
            title: currentLang === 'de' ? 'Athen-Stadtrundgang' : 'Athens City Tour',
            category: "travel",
            duration: "14:22",
            thumbnail: "https://kimi-web-img.moonshot.cn/img/media.istockphoto.com/cf3adc0771857f412cbc0d3d6c628112298a8273.jpg",
            description: currentLang === 'de' ? 'Entdecken Sie die historische Hauptstadt Griechenlands' : 'Discover the historic capital of Greece'
        },
        {
            id: 8,
            title: currentLang === 'de' ? 'Einführung in die griechische Küche' : 'Greek Cuisine Introduction',
            category: "culture",
            duration: "11:45",
            thumbnail: "https://kimi-web-img.moonshot.cn/img/i0.wp.com/3ee551255069949db57b50989f9abdf3ad34d43e.jpg",
            description: currentLang === 'de' ? 'Erkunden Sie die köstliche Welt der griechischen Küche' : 'Explore the delicious world of Greek food'
        },
        {
            id: 9,
            title: currentLang === 'de' ? 'Griechisches Alphabet leicht gemacht' : 'Greek Alphabet Made Easy',
            category: "language",
            duration: "9:15",
            thumbnail: "https://kimi-web-img.moonshot.cn/img/flypaper.soundfly.com/aea32577970d6c694602117517c785890afb90db.jpg",
            description: currentLang === 'de' ? 'Lernen Sie das griechische Alphabet lesen und schreiben' : 'Learn to read and write Greek letters'
        }
    ];

    const videoGrid = document.getElementById('video-grid');
    const filterButtons = document.querySelectorAll('.video-filter');
    const modal = document.getElementById('video-modal');
    const modalTitle = document.getElementById('modal-title');
    const closeModal = document.getElementById('close-modal');

    let currentFilter = 'all';

    function renderVideos() {
        const filteredVideos = currentFilter === 'all' 
            ? videoData 
            : videoData.filter(video => video.category === currentFilter);

        videoGrid.innerHTML = '';

        filteredVideos.forEach((video, index) => {
            const videoElement = document.createElement('div');
            videoElement.className = 'video-thumbnail bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300';
            videoElement.innerHTML = `
                <div class="relative overflow-hidden">
                    <img src="${video.thumbnail}" alt="${video.title}" class="w-full h-48 object-cover">
                    <div class="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <div class="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                            <svg class="w-8 h-8 text-aegean-blue ml-1" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z"/>
                            </svg>
                        </div>
                    </div>
                    <div class="absolute top-4 right-4 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
                        ${video.duration}
                    </div>
                </div>
                <div class="p-6">
                    <h3 class="text-lg font-semibold text-aegean-blue mb-2">${video.title}</h3>
                    <p class="text-marble-gray text-sm mb-4">${video.description}</p>
                    <div class="flex items-center justify-between">
                        <span class="inline-block bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-medium">
                            ${getCategoryName(video.category, currentLang)}
                        </span>
                        <button class="text-olive-gold hover:text-orange-600 font-medium text-sm">
                            Watch Now
                        </button>
                    </div>
                </div>
            `;

            videoElement.addEventListener('click', () => openVideoModal(video));
            videoGrid.appendChild(videoElement);

            // Animate video appearance
            anime({
                targets: videoElement,
                opacity: [0, 1],
                translateY: [30, 0],
                duration: 600,
                delay: index * 100,
                easing: 'easeOutCubic'
            });
        });
    }

    function openVideoModal(video) {
        modalTitle.textContent = video.title;
        modal.classList.remove('hidden');
        
        // Animate modal appearance
        anime({
            targets: modal,
            opacity: [0, 1],
            duration: 300,
            easing: 'easeOutCubic'
        });
    }

    function closeVideoModal() {
        anime({
            targets: modal,
            opacity: [1, 0],
            duration: 300,
            easing: 'easeOutCubic',
            complete: () => {
                modal.classList.add('hidden');
            }
        });
    }

    // Filter functionality
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Update active filter
            filterButtons.forEach(btn => {
                btn.classList.remove('active', 'bg-olive-gold', 'text-white');
                btn.classList.add('bg-white', 'text-marble-gray');
            });
            
            button.classList.add('active', 'bg-olive-gold', 'text-white');
            button.classList.remove('bg-white', 'text-marble-gray');
            
            currentFilter = button.dataset.filter;
            renderVideos();
        });
    });

    // Modal close functionality
    if (closeModal) {
        closeModal.addEventListener('click', closeVideoModal);
    }
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeVideoModal();
        }
    });

    // Initialize video gallery
    renderVideos();
}

// Helper function to get category name in current language
function getCategoryName(category, language) {
    const categoryNames = {
        'en': {
            'language': 'Language Learning',
            'culture': 'Greek Culture',
            'travel': 'Travel Greece',
            'history': 'Ancient History',
            'all': 'All Videos'
        },
        'de': {
            'language': 'Sprachlernen',
            'culture': 'Griechische Kultur',
            'travel': 'Griechenland bereisen',
            'history': 'Alte Geschichte',
            'all': 'Alle Videos'
        }
    };
    
    return categoryNames[language][category] || category;
}

// Animated Counters
function initializeCounters() {
    const counters = document.querySelectorAll('[data-count]');
    
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.dataset.count);
                
                anime({
                    targets: { count: 0 },
                    count: target,
                    duration: 2000,
                    easing: 'easeOutCubic',
                    update: function(anim) {
                        counter.textContent = Math.round(anim.animatables[0].target.count);
                    }
                });
                
                observer.unobserve(counter);
            }
        });
    }, observerOptions);

    counters.forEach(counter => {
        observer.observe(counter);
    });
}

// Scroll Animations
function initializeScrollAnimations() {
    // Animate elements on scroll
    const animateElements = document.querySelectorAll('.card-hover, .video-thumbnail');
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                anime({
                    targets: entry.target,
                    opacity: [0, 1],
                    translateY: [30, 0],
                    duration: 600,
                    delay: index * 100,
                    easing: 'easeOutCubic'
                });
                
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    animateElements.forEach(element => {
        element.style.opacity = '0';
        observer.observe(element);
    });
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add loading states for better UX
function showLoading(element) {
    element.innerHTML = '<div class="flex justify-center items-center py-8"><div class="animate-spin rounded-full h-8 w-8 border-b-2 border-olive-gold"></div></div>';
}

// Error handling for failed operations
function showError(element, message) {
    element.innerHTML = `<div class="text-center py-8 text-red-600">${message}</div>`;
}

// Performance optimization: Lazy load images
function initializeLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
}

// Initialize lazy loading if needed
if (document.querySelectorAll('img[data-src]').length > 0) {
    initializeLazyLoading();
}