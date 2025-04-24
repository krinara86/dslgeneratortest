// Main application entry point

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded and parsed');
    
    // Check if all required functions are available
    console.log('Checking available functions:');
    console.log('parseDomain:', typeof parseDomain);
    console.log('parseEntities:', typeof parseEntities);
    console.log('parseRelationships:', typeof parseRelationships);
    console.log('buildDomainObject:', typeof buildDomainObject);
    console.log('generateEcore:', typeof generateEcore);
    console.log('createQuestionComponent:', typeof createQuestionComponent);
    console.log('createResultComponent:', typeof createResultComponent);
    console.log('createEcoreDownloadComponent:', typeof createEcoreDownloadComponent);
    
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
          Please update your API configuration in the config section of the HTML file before using the application.
        </span>
      `;
      document.querySelector('.container').insertBefore(warningDiv, document.querySelector('#stepper').parentNode);
    }
  });