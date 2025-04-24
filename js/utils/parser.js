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