const chatbox = document.getElementById('chatbox');
const userInput = document.getElementById('userInput');

let conversationHistory = [];
let currentStep = 'gatherDomain';
let domainInfo = {
    domain: '',
    entities: [],
    attributes: {},
    relationships: []
};

const apiKey = 'jYZpbwqDS8jE9VLbAhUj5HOhDvIlTNcK'; // Replace with your actual API key
const apiUrl = 'https://api.lechat.ai/v1/chat/completions'; // Replace with the actual API endpoint

async function askQuestion(step) {
    let question = '';
    switch (step) {
        case 'gatherDomain':
            question = "Can you describe the domain of your DSL 2? (e.g., cycling, cooking)";
            break;
        case 'gatherEntities':
            question = "What are the main concepts or things in your domain? (e.g., Bike, Rider)";
            break;
        case 'gatherAttributes':
            question = `Can you describe the properties or details of ${domainInfo.entities.join(', ')}? (e.g., Bike has brand and model)`;
            break;
        case 'gatherRelationships':
            question = `How do these concepts relate to each other? (e.g., Rider owns Bike)`;
            break;
        default:
            generateDSL();
            return;
    }
    chatbox.innerHTML += `<p><strong>Chatbot:</strong> ${question}</p>`;
}

async function sendMessage() {
    const message = userInput.value;
    if (message.trim() === "") return;

    chatbox.innerHTML += `<p><strong>You:</strong> ${message}</p>`;
    conversationHistory.push({ role: 'user', content: message });
    userInput.value = "";

    const llmResponse = await callLLM(message, currentStep);
    conversationHistory.push({ role: 'assistant', content: llmResponse });

    processResponse(llmResponse, currentStep);

    if (currentStep === 'gatherDomain') {
        currentStep = 'gatherEntities';
    } else if (currentStep === 'gatherEntities') {
        currentStep = 'gatherAttributes';
    } else if (currentStep === 'gatherAttributes') {
        currentStep = 'gatherRelationships';
    } else if (currentStep === 'gatherRelationships') {
        currentStep = 'generateDSL';
    }

    askQuestion(currentStep);
}

async function callLLM(message, step) {
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: 'lechat',
            messages: [{ role: 'user', content: message }],
            step: step
        })
    });

    const data = await response.json();
    return data.choices[0].message.content;
}

function processResponse(response, step) {
    switch (step) {
        case 'gatherDomain':
            domainInfo.domain = response;
            break;
        case 'gatherEntities':
            domainInfo.entities = response.split(',').map(entity => entity.trim());
            break;
        case 'gatherAttributes':
            domainInfo.attributes = response.split(';').reduce((acc, attr) => {
                const [entity, details] = attr.split(':').map(part => part.trim());
                if (!acc[entity]) acc[entity] = [];
                acc[entity].push(...details.split(',').map(detail => detail.trim()));
                return acc;
            }, {});
            break;
        case 'gatherRelationships':
            domainInfo.relationships = response.split(';').map(rel => rel.trim());
            break;
    }
}

async function generateDSL() {
    const dslDescription = JSON.stringify(domainInfo, null, 2);
    const llmResponse = await callLLM(dslDescription, 'generateDSL');

    chatbox.innerHTML += `<p><strong>Generated Ecore:</strong></p><pre>${llmResponse}</pre>`;
}

askQuestion(currentStep);
