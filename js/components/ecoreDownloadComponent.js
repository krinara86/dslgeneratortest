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