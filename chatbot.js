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
const apiUrl = 'https://api.mistral.ai/v1/chat/completions'; // Replace with the actual API endpoint

async function askQuestion(step) {
    let question = '';
    let instructions = '';
    let examples = '';

    switch (step) {
        case 'gatherDomain':
            question = "Can you describe the domain of your DSL? (e.g., cycling, cooking)";
            instructions = "Please provide a single word for the domain.";
            break;
        case 'gatherEntities':
            question = "What are the main concepts or things in your domain?";
            instructions = "Please provide the concepts separated by commas.";
            examples = await generateExamples('entities', domainInfo.domain);
            break;
        case 'gatherAttributes':
            question = `Can you describe the properties or details of ${domainInfo.entities.join(', ')}?`;
            instructions = "Please provide the properties in the format: Entity: property1, property2, ...";
            examples = await generateExamples('attributes', domainInfo.domain);
            break;
        case 'gatherRelationships':
            question = `How do these concepts relate to each other?`;
            instructions = "Please provide the relationships in the format: A (relationship) B, ...";
            examples = await generateExamples('relationships', domainInfo.domain);
            break;
        case 'reviewInputs':
            question = "Here are the inputs you provided. Please review them:";
            instructions = "If you want to change any input, type 'change' followed by the category (domain, entities, attributes, relationships). Otherwise, type 'confirm'.";
            displayInputs();
            return;
        case 'generateDSL':
            generateDSL();
            return;
        default:
            return;
    }

    chatbox.innerHTML += `<p><strong>Chatbot:</strong> ${question}</p>`;
    chatbox.innerHTML += `<p><strong>Instructions:</strong> ${instructions}</p>`;
    if (examples) {
        chatbox.innerHTML += `<p><strong>Examples:</strong> ${examples}</p>`;
    }
}

async function sendMessage() {
    const message = userInput.value;
    if (message.trim() === "") return;

    chatbox.innerHTML += `<p><strong>You:</strong> ${message}</p>`;
    conversationHistory.push({ role: 'user', content: message });
    userInput.value = "";

    try {
        let llmResponse = '';
        if (currentStep === 'reviewInputs') {
            llmResponse = processReview(message);
        } else {
            llmResponse = await callLLM(message, currentStep);
            conversationHistory.push({ role: 'assistant', content: llmResponse });
            processResponse(llmResponse, currentStep);
        }

        if (currentStep === 'gatherDomain') {
            currentStep = 'gatherEntities';
        } else if (currentStep === 'gatherEntities') {
            currentStep = 'gatherAttributes';
        } else if (currentStep === 'gatherAttributes') {
            currentStep = 'gatherRelationships';
        } else if (currentStep === 'gatherRelationships') {
            currentStep = 'reviewInputs';
        } else if (currentStep === 'reviewInputs' && llmResponse === 'confirm') {
            currentStep = 'generateDSL';
        }

        askQuestion(currentStep);
    } catch (error) {
        chatbox.innerHTML += `<p><strong>Error:</strong> ${error.message}</p>`;
        console.error('Error:', error);
    }
}

async function callLLM(message, step) {
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'codestral-latest', // Updated to use the Codestral model
                messages: [{ role: 'user', content: message }]
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('Fetch error:', error);
        throw new Error(`Failed to fetch: ${error.message}`);
    }
}

async function generateExamples(type, domain) {
    const prompt = `Provide examples of ${type} for the domain "${domain}".`;
    try {
        const response = await callLLM(prompt, 'generateExamples');
        return response;
    } catch (error) {
        console.error('Error generating examples:', error);
        return '';
    }
}

function processResponse(response, step) {
    switch (step) {
        case 'gatherDomain':
            domainInfo.domain = response.trim();
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
            domainInfo.relationships = response.split(',').map(rel => rel.trim());
            break;
    }
}

function processReview(message) {
    if (message.toLowerCase() === 'confirm') {
        return 'confirm';
    } else if (message.toLowerCase().startsWith('change')) {
        const category = message.split(' ')[1];
        switch (category) {
            case 'domain':
                currentStep = 'gatherDomain';
                domainInfo.domain = '';
                break;
            case 'entities':
                currentStep = 'gatherEntities';
                domainInfo.entities = [];
                break;
            case 'attributes':
                currentStep = 'gatherAttributes';
                domainInfo.attributes = {};
                break;
            case 'relationships':
                currentStep = 'gatherRelationships';
                domainInfo.relationships = [];
                break;
            default:
                chatbox.innerHTML += `<p><strong>Error:</strong> Invalid category. Please try again.</p>`;
                askQuestion('reviewInputs');
                return;
        }
        askQuestion(currentStep);
    } else {
        chatbox.innerHTML += `<p><strong>Error:</strong> Invalid input. Please type 'confirm' or 'change' followed by the category.</p>`;
        askQuestion('reviewInputs');
    }
}

async function generateDSL() {
    const prompt = `Based on the following information, generate an Ecore file in XML format:
Domain: ${domainInfo.domain}
Entities: ${domainInfo.entities.join(', ')}
Attributes: ${JSON.stringify(domainInfo.attributes)}
Relationships: ${domainInfo.relationships.join(', ')}`;

    try {
        const llmResponse = await callLLM(prompt, 'generateDSL');
        chatbox.innerHTML += `<p><strong>Generated Ecore:</strong></p><pre>${llmResponse}</pre>`;

        // Create a download link for the Ecore file
        const blob = new Blob([llmResponse], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${domainInfo.domain.toLowerCase().replace(/ /g, '_')}.ecore`;
        a.textContent = 'Download Ecore File';
        a.className = 'download-link';
        chatbox.appendChild(a);
    } catch (error) {
        chatbox.innerHTML += `<p><strong>Error:</strong> ${error.message}</p>`;
        console.error('Error:', error);
    }
}

function displayInputs() {
    chatbox.innerHTML += `<p><strong>Domain:</strong> ${domainInfo.domain}</p>`;
    chatbox.innerHTML += `<p><strong>Entities:</strong> ${domainInfo.entities.join(', ')}</p>`;
    chatbox.innerHTML += `<p><strong>Attributes:</strong> ${JSON.stringify(domainInfo.attributes, null, 2)}</p>`;
    chatbox.innerHTML += `<p><strong>Relationships:</strong> ${domainInfo.relationships.join(', ')}</p>`;
}

askQuestion(currentStep);