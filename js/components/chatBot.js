/**
 * ChatBot component for managing the DSL generation process
 */
class ChatBot {
    constructor(containerId) {
      this.container = document.getElementById(containerId);
      this.currentQuestionIndex = 0;
      this.answers = {};
      this.domainObject = null;
      this.ecoreContent = null;
      this.isLoading = false;
      this.error = null;
      
      // Bind methods to this instance
      this.handleAnswer = this.handleAnswer.bind(this);
      this.renderCurrentQuestion = this.renderCurrentQuestion.bind(this);
      this.renderResult = this.renderResult.bind(this);
      this.renderDownload = this.renderDownload.bind(this);
      this.renderError = this.renderError.bind(this);
      this.reset = this.reset.bind(this);
      this.updateStepper = this.updateStepper.bind(this);
      
      // Start the process
      this.renderCurrentQuestion();
    }
    
    /**
     * Updates the stepper to show current progress
     */
    updateStepper() {
      const steps = document.querySelectorAll('#stepper .step');
      steps.forEach((step, index) => {
        // First clear all classes
        step.classList.remove('active', 'completed');
        
        // Add appropriate class
        if (index < this.currentQuestionIndex) {
          step.classList.add('completed');
        } else if (index === this.currentQuestionIndex) {
          step.classList.add('active');
        }
      });
    }
    
    /**
     * Handles answers from the question component
     * @param {string} answer - The user's answer
     */
    async handleAnswer(answer) {
      const currentQuestion = config.questions[this.currentQuestionIndex];
      let parsedAnswer;
  
      console.log(`Handling answer for question: ${currentQuestion.step}`);
  
      // Parse answer based on the question type
      switch (currentQuestion.step) {
        case 'gatherDomain':
          parsedAnswer = parseDomain(answer);
          break;
        case 'gatherEntities':
          parsedAnswer = parseEntities(answer);
          break;
        case 'gatherRelationships':
          parsedAnswer = parseRelationships(answer);
          break;
        default:
          parsedAnswer = answer;
      }
  
      // Update answers state
      this.answers[currentQuestion.step] = parsedAnswer;
      console.log('Updated answers:', this.answers);
  
      // Move to the next question or finalize
      if (this.currentQuestionIndex < config.questions.length - 1) {
        this.currentQuestionIndex++;
        this.updateStepper();
        this.renderCurrentQuestion();
      } else {
        // All questions answered, build the domain object
        this.domainObject = buildDomainObject(this.answers);
        console.log('Domain object created:', this.domainObject);
        this.updateStepper();
        this.renderResult();
        
        // Generate Ecore using the API
        try {
          this.isLoading = true;
          this.renderResult(); // Re-render with loading state
          console.log('Calling generateEcore...');
          
          if (typeof generateEcore !== 'function') {
            console.error('generateEcore is not a function!', typeof generateEcore);
            throw new Error('generateEcore function is not available');
          }
          
          const generatedEcore = await generateEcore(this.domainObject);
          console.log('Ecore generated successfully');
          this.ecoreContent = generatedEcore;
          this.isLoading = false;
          this.renderDownload();
        } catch (err) {
          console.error('Error in handleAnswer:', err);
          this.error = `Error generating Ecore: ${err.message}`;
          this.isLoading = false;
          this.renderError();
        }
      }
    }
    
    /**
     * Renders the current question
     */
    renderCurrentQuestion() {
      // Clear container
      this.container.innerHTML = '';
      
      // Get current question
      const currentQuestion = config.questions[this.currentQuestionIndex];
      
      console.log(`Rendering question: ${currentQuestion.step}`);
      
      // Create and render question component
      const questionComponent = createQuestionComponent(currentQuestion, this.handleAnswer);
      this.container.appendChild(questionComponent);
      
      // Initialize Materialize components if needed
      if (window.M) {
        M.updateTextFields();
        M.textareaAutoResize(document.getElementById('question-input'));
      }
    }
    
    /**
     * Renders the result/summary view
     */
    renderResult() {
      // Clear container
      this.container.innerHTML = '';
      
      console.log('Rendering result, isLoading:', this.isLoading);
      
      // Create and render result component
      const resultComponent = createResultComponent(this.domainObject, this.isLoading);
      this.container.appendChild(resultComponent);
    }
    
    /**
     * Renders the download view
     */
    renderDownload() {
      // Clear container
      this.container.innerHTML = '';
      
      console.log('Rendering download view');
      
      // Create and render download component
      const downloadComponent = createEcoreDownloadComponent(this.ecoreContent, this.domainObject.domain);
      this.container.appendChild(downloadComponent);
    }
    
    /**
     * Renders an error message
     */
    renderError() {
      // Clear container
      this.container.innerHTML = '';
      
      console.log('Rendering error:', this.error);
      
      // Create error card
      const errorCard = document.createElement('div');
      errorCard.className = 'card';
      
      const cardContent = document.createElement('div');
      cardContent.className = 'card-content';
      
      const errorTitle = document.createElement('h5');
      errorTitle.className = 'error-message';
      errorTitle.textContent = 'Error';
      cardContent.appendChild(errorTitle);
      
      const errorMessage = document.createElement('p');
      errorMessage.textContent = this.error;
      cardContent.appendChild(errorMessage);
      
      const helpText = document.createElement('p');
      helpText.textContent = 'Please check your API configuration and try again.';
      cardContent.appendChild(helpText);
      
      // Create button to restart
      const cardAction = document.createElement('div');
      cardAction.className = 'card-action';
      
      const restartButton = document.createElement('button');
      restartButton.className = 'btn waves-effect waves-light indigo';
      restartButton.textContent = 'Restart';
      restartButton.addEventListener('click', () => {
        this.reset();
      });
      
      cardAction.appendChild(restartButton);
      
      errorCard.appendChild(cardContent);
      errorCard.appendChild(cardAction);
      
      this.container.appendChild(errorCard);
    }
    
    /**
     * Resets the chatbot to start over
     */
    reset() {
      this.currentQuestionIndex = 0;
      this.answers = {};
      this.domainObject = null;
      this.ecoreContent = null;
      this.isLoading = false;
      this.error = null;
      this.updateStepper();
      this.renderCurrentQuestion();
    }
  }