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