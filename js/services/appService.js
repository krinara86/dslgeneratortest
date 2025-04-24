// API Service for communicating with LePlatforme API

/**
 * Generates Ecore format from domain object using LePlatforme API
 * @param {Object} domainObject - The structured domain object
 * @returns {Promise<string>} - Promise resolving to the generated Ecore content
 */
function generateEcore(domainObject) {
    return new Promise((resolve, reject) => {
      try {
        const prompt = `Generate an Ecore metamodel file for a Domain Specific Language with the following specifications:
  Domain: ${domainObject.domain}
  Main Concepts/Entities: ${domainObject.entities.join(', ')}
  Relationships:
  ${domainObject.relationships
    .map(rel => `- ${rel.source} (${rel.relationship}) ${rel.target}`)
    .join('\n')}
  
  Please provide only the complete Ecore XMI content with no additional explanations.`;
  
        fetch(config.endpoint, {
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
        })
        .then(response => {
          if (!response.ok) {
            throw new Error(`API request failed with status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          // Extract and trim the Ecore content from the response
          // This is a simplification - adjust based on actual API response structure
          let ecoreContent = data.choices ? data.choices[0].text : data.output;
          
          // Trim any markdown code block indicators and whitespace
          ecoreContent = ecoreContent.replace(/```xml|```ecore|```/g, '').trim();
          
          resolve(ecoreContent);
        })
        .catch(error => {
          console.error('Error generating Ecore:', error);
          reject(error);
        });
      } catch (error) {
        console.error('Error in generateEcore:', error);
        reject(error);
      }
    });
  }