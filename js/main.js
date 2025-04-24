// Configuration for the Ecore DSL Generator
const config = {
    // Replace these values with your actual API credentials
    apiKey: 'YOUR_API_KEY_HERE', // Your LePlatforme API key
    endpoint: 'YOUR_ENDPOINT_HERE', // LePlatforme API endpoint
    modelName: 'YOUR_MODEL_NAME_HERE', // Model name for the completion
    
    // Questions to ask the user
    questions: [
      { 
        step: 'gatherDomain', 
        question: "Can you describe the domain of your DSL?", 
        instructions: "Please provide a single word for the domain.", 
        examples: "Examples: cycling, cooking" 
      },
      { 
        step: 'gatherEntities', 
        question: "What are the main concepts or things in your domain?", 
        instructions: "Please provide the concepts separated by commas.", 
        examples: "Examples: Bike, Rider, Race" 
      },
      { 
        step: 'gatherRelationships', 
        question: "How do these concepts relate to each other?", 
        instructions: "Please provide the relationships in the format: A (relationship) B.", 
        examples: "Examples:\n- Bike (owned by) Rider\n- Rider (participates in) Race" 
      }
    ]
  };
  
  // Parser utilities for extracting structured information from user inputs
  
  /**
   * Parses the domain name from user input
   * @param {string} input - The user's input for domain
   * @returns {string} - The parsed domain
   */
  function parseDomain(input) {
    // Clean the input and extract the first word as domain
    return input.trim().split(/\s+/)[0].toLowerCase();
  }
  
  /**
   * Parses entities from comma-separated user input
   * @param {string} input - The user's input for entities
   * @returns {string[]} - Array of parsed entities
   */
  function parseEntities(input) {
    // Split by commas and clean each entity
    return input
      .split(',')
      .map(entity => entity.trim())
      .filter(entity => entity !== '');
  }
  
  /**
   * Parses relationships from user input
   * @param {string} input - The user's input for relationships
   * @returns {Object[]} - Array of parsed relationships
   */
  function parseRelationships(input) {
    // Split by lines first
    const lines = input.split('\n');
    const relationships = [];
  
    lines.forEach(line => {
      // Try to match the pattern "A (relationship) B"
      const match = line.match(/(.+?)\s*\((.+?)\)\s*(.+)/);
      if (match) {
        const [, source, relation, target] = match;
        relationships.push({
          source: source.trim(),
          relationship: relation.trim(),
          target: target.trim()
        });
      }
    });
  
    return relationships;
  }
  
  /**
   * Builds the complete domain object from all inputs
   * @param {Object} data - The collected user inputs
   * @returns {Object} - Structured domain object
   */
  function buildDomainObject(data) {
    return {
      domain: data.gatherDomain,
      entities: data.gatherEntities,
      relationships: data.gatherRelationships
    };
  }
  
  /**
   * Generates Ecore format from domain object using LePlatforme API
   * @param {Object} domainObject - The structured domain object
   * @returns {Promise<string>} - Promise resolving to the generated Ecore content
   */
  async function generateEcore(domainObject) {
    try {
      const prompt = `Generate an Ecore metamodel file for a Domain Specific Language with the following specifications:
  Domain: ${domainObject.domain}
  Main Concepts/Entities: ${domainObject.entities.join(', ')}
  Relationships:
  ${domainObject.relationships
    .map(rel => `- ${rel.source} (${rel.relationship}) ${rel.target}`)
    .join('\n')}
  
  Please provide only the complete Ecore XMI content with no additional explanations.`;
  
      const response = await fetch(config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`
        },
        body: JSON.stringify({
          model: config.modelName,
          prompt: prompt,
          max_tokens: 2000,
          temperature: 0.2
        })
      });
  
      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }
  
      const data = await response.json();
      
      // Extract and trim the Ecore content from the response
      // This is a simplification - adjust based on actual API response structure
      let ecoreContent = data.choices ? data.choices[0].text : data.output;
      
      // Trim any markdown code block indicators and whitespace
      ecoreContent = ecoreContent.replace(/```xml|```ecore|```/g, '').trim();
      
      return ecoreContent;
    } catch (error) {
      console.error('Error generating Ecore:', error);
      throw error;
    }
  }
  
  /**
   * Creates a Question component that displays the question, instructions, and examples
   * @param {Object} question - The question object with properties: question, instructions, examples
   * @param {Function} onAnswer - Callback function when answer is submitted
   * @returns {HTMLElement} - The question component DOM element
   */
  function createQuestionComponent(question, onAnswer) {
    // Create the container
    const container = document.createElement('div');
    container.className = 'card';
    
    // Create the card content
    const content = document.createElement('div');
    content.className = 'card-content';
    
    // Add question title
    const questionTitle = document.createElement('h5');
    questionTitle.textContent = question.question;
    content.appendChild(questionTitle);
    
    // Add instructions
    const instructions = document.createElement('p');
    instructions.textContent = question.instructions;
    instructions.className = 'grey-text';
    content.appendChild(instructions);
    
    // Create form
    const form = document.createElement('form');
    form.id = 'question-form';
    
    // Create textarea
    const textareaDiv = document.createElement('div');
    textareaDiv.className = 'input-field';
    
    const textarea = document.createElement('textarea');
    textarea.id = 'question-input';
    textarea.className = 'materialize-textarea';
    textarea.placeholder = question.examples;
    textareaDiv.appendChild(textarea);
    
    form.appendChild(textareaDiv);
    
    // Add examples as helper text
    const exampleText = document.createElement('p');
    exampleText.className = 'example-text';
    exampleText.textContent = question.examples;
    form.appendChild(exampleText);
    
    // Create button container
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'card-action right-align';
    
    // Create submit button
    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.className = 'btn waves-effect waves-light indigo';
    submitButton.textContent = 'Continue';
    
    // Add icon to button
    const icon = document.createElement('i');
    icon.className = 'material-icons right';
    icon.textContent = 'send';
    submitButton.appendChild(icon);
    
    buttonContainer.appendChild(submitButton);
    form.appendChild(buttonContainer);
    
    // Handle form submission
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const answer = textarea.value.trim();
      if (answer) {
        onAnswer(answer);
      }
    });
    
    content.appendChild(form);
    container.appendChild(content);
    
    return container;
  }
  
  /**
   * Creates a Result component that displays the domain object summary
   * @param {Object} domainObject - The domain object with domain, entities, and relationships
   * @param {boolean} isLoading - Whether the API request is in progress
   * @returns {HTMLElement} - The result component DOM element
   */
  function createResultComponent(domainObject, isLoading) {
    // Create the container
    const container = document.createElement('div');
    container.className = 'card';
    
    // Create the card content
    const content = document.createElement('div');
    content.className = 'card-content';
    
    // Add title
    const title = document.createElement('h5');
    title.textContent = 'Your DSL Summary';
    content.appendChild(title);
    
    if (isLoading) {
      // Create loader
      const loaderWrapper = document.createElement('div');
      loaderWrapper.className = 'loader-wrapper';
      
      const loader = document.createElement('div');
      loader.className = 'preloader-wrapper active';
      
      const spinnerLayer = document.createElement('div');
      spinnerLayer.className = 'spinner-layer spinner-blue-only';
      
      const clipperLeft = document.createElement('div');
      clipperLeft.className = 'circle-clipper left';
      const circleLeft = document.createElement('div');
      circleLeft.className = 'circle';
      clipperLeft.appendChild(circleLeft);
      
      const gapPatch = document.createElement('div');
      gapPatch.className = 'gap-patch';
      const circleGap = document.createElement('div');
      circleGap.className = 'circle';
      gapPatch.appendChild(circleGap);
      
      const clipperRight = document.createElement('div');
      clipperRight.className = 'circle-clipper right';
      const circleRight = document.createElement('div');
      circleRight.className = 'circle';
      clipperRight.appendChild(circleRight);
      
      spinnerLayer.appendChild(clipperLeft);
      spinnerLayer.appendChild(gapPatch);
      spinnerLayer.appendChild(clipperRight);
      
      loader.appendChild(spinnerLayer);
      loaderWrapper.appendChild(loader);
      
      const loadingText = document.createElement('p');
      loadingText.className = 'flow-text';
      loadingText.style.marginLeft = '20px';
      loadingText.textContent = 'Generating Ecore file...';
      loaderWrapper.appendChild(loadingText);
      
      content.appendChild(loaderWrapper);
    } else {
      // Display domain information
      const domainSection = document.createElement('div');
      
      const domainLabel = document.createElement('h6');
      domainLabel.textContent = 'Domain:';
      domainSection.appendChild(domainLabel);
      
      const domainValue = document.createElement('p');
      domainValue.textContent = domainObject.domain;
      domainValue.className = 'mb-3';
      domainSection.appendChild(domainValue);
      
      content.appendChild(domainSection);
      
      // Display entities
      const entitiesSection = document.createElement('div');
      
      const entitiesLabel = document.createElement('h6');
      entitiesLabel.textContent = 'Entities:';
      entitiesSection.appendChild(entitiesLabel);
      
      const entitiesValue = document.createElement('p');
      entitiesValue.textContent = domainObject.entities.join(', ');
      entitiesValue.className = 'mb-3';
      entitiesSection.appendChild(entitiesValue);
      
      content.appendChild(entitiesSection);
      
      // Display relationships
      const relationshipsSection = document.createElement('div');
      
      const relationshipsLabel = document.createElement('h6');
      relationshipsLabel.textContent = 'Relationships:';
      relationshipsSection.appendChild(relationshipsLabel);
      
      const relationshipsList = document.createElement('ul');
      relationshipsList.className = 'collection';
      
      domainObject.relationships.forEach(rel => {
        const listItem = document.createElement('li');
        listItem.className = 'collection-item';
        listItem.textContent = `${rel.source} (${rel.relationship}) ${rel.target}`;
        relationshipsList.appendChild(listItem);
      });
      
      relationshipsSection.appendChild(relationshipsList);
      content.appendChild(relationshipsSection);
    }
    
    container.appendChild(content);
    return container;
  }
  
  /**
   * Creates an Ecore Download component that provides a download link for the generated Ecore file
   * @param {string} ecoreContent - The generated Ecore XML content
   * @param {string} domain - The domain name for the file name
   * @returns {HTMLElement} - The download component DOM element
   */
  function createEcoreDownloadComponent(ecoreContent, domain) {
    // Create the container
    const container = document.createElement('div');
    container.className = 'card';
    
    // Create the card content
    const content = document.createElement('div');
    content.className = 'card-content';
    
    // Add title
    const title = document.createElement('h5');
    title.textContent = 'Your Ecore File is Ready!';
    content.appendChild(title);
    
    // Add description
    const description = document.createElement('p');
    description.textContent = 'Your DSL has been successfully converted to Ecore format. Click the button below to download.';
    description.className = 'mb-3';
    content.appendChild(description);
    
    // Add code preview
    const previewContainer = document.createElement('div');
    previewContainer.className = 'code-preview';
    
    const previewContent = document.createElement('pre');
    // Show only first 500 characters as preview
    previewContent.textContent = ecoreContent.substring(0, 500) + '... (preview)';
    previewContainer.appendChild(previewContent);
    
    content.appendChild(previewContainer);
    
    // Create button container for actions
    const actions = document.createElement('div');
    actions.className = 'card-action center-align';
    
    // Create download button
    const downloadButton = document.createElement('a');
    downloadButton.className = 'waves-effect waves-light btn-large indigo';
    downloadButton.innerHTML = '<i class="material-icons left">file_download</i> Download ' + domain + '_dsl.ecore';
    
    // Handle download click
    downloadButton.addEventListener('click', () => {
      // Create a Blob with the Ecore content
      const blob = new Blob([ecoreContent], { type: 'application/xml' });
      
      // Create a download URL for the Blob
      const url = URL.createObjectURL(blob);
      
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = url;
      link.download = `${domain}_dsl.ecore`;
      
      // Append to the document, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Release the URL object
      URL.revokeObjectURL(url);
    });
    
    actions.appendChild(downloadButton);
    container.appendChild(content);
    container.appendChild(actions);
    
    return container;
  }
  
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
  
      // Move to the next question or finalize
      if (this.currentQuestionIndex < config.questions.length - 1) {
        this.currentQuestionIndex++;
        this.updateStepper();
        this.renderCurrentQuestion();
      } else {
        // All questions answered, build the domain object
        this.domainObject = buildDomainObject(this.answers);
        this.updateStepper();
        this.renderResult();
        
        // Generate Ecore using the API
        try {
          this.isLoading = true;
          this.renderResult(); // Re-render with loading state
          
          const generatedEcore = await generateEcore(this.domainObject);
          this.ecoreContent = generatedEcore;
          this.isLoading = false;
          this.renderDownload();
        } catch (err) {
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
      
      // Create and render question component
      const questionComponent = createQuestionComponent(currentQuestion, this.handleAnswer.bind(this));
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
  
  // Initialize the application when the DOM is loaded
  document.addEventListener('DOMContentLoaded', function() {
    // Initialize Materialize components
    const elems = document.querySelectorAll('.sidenav');
    M.Sidenav.init(elems);
    
    // Initialize the chatbot
    const chatBot = new ChatBot('chatbot-container');
    
    // Display a warning if config values haven't been changed
    if (
      config.apiKey === 'YOUR_API_KEY_HERE' || 
      config.endpoint === 'YOUR_ENDPOINT_HERE' || 
      config.modelName === 'YOUR_MODEL_NAME_HERE'
    ) {
      const warningDiv = document.createElement('div');
      warningDiv.className = 'card-panel red lighten-4';
      warningDiv.innerHTML = `
        <span class="red-text text-darken-4">
          <i class="material-icons left">warning</i>
          Please update your API configuration in js/main.js before using the application.
        </span>
      `;
      document.querySelector('.container').insertBefore(warningDiv, document.querySelector('#stepper').parentNode);
    }
  });