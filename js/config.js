// Configuration for the Ecore DSL Generator
const config = {
    // Replace these values with your actual API credentials
    apiKey: 'jYZpbwqDS8jE9VLbAhUj5HOhDvIlTNcK', // Your LePlatforme API key
    endpoint: 'https://api.mistral.ai/v1/chat/completions', // LePlatforme API endpoint
    modelName: 'istral-small-latest', // Model name for the completion
    
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