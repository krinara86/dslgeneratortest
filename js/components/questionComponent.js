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