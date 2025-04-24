const chatbox = document.getElementById('chatbox');
const userInput = document.getElementById('userInput');

let conversationHistory = [];
let currentStep = 'gatherDomain';
let domainDSL = createDomain();

async function askQuestion(step) {
    let question = '';
    let instructions = '';
    let examples = '';

    switch (step) {
        case 'gatherDomain':
            question = "Can you describe the domain of your DSL? (e.g., cycling, cooking)";
            instructions = "Please provide a single word for the domain.";
            examples = "Examples: cycling, cooking";
            break;
        case 'gatherEntities':
            question = "What are the main concepts or things in your domain?";
            instructions = "Please provide the concepts separated by commas.";
            examples = await generateExamples('entities', domainDSL.name);
            break;
        case 'gatherRelationships':
            question = `How do these concepts relate to each other?`;
            instructions = "Please provide the relationships in the format: A (relationship) B.";
            examples = await generateExamples('relationships', domainDSL.name);
            break;
        case 'reviewInputs':
            question = "Here are the inputs you provided. Please review them:";
            instructions = "If you want to change any input, type 'change' followed by the category (domain, entities, relationships). Otherwise, type 'confirm'.";
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

async function processEntities() {
    const examples = await generateExamples('entities', domainDSL.name);
    chatbox.innerHTML += `<p><strong>Chatbot:</strong> Here are some example entities: ${examples}. Do you want to add or remove any?</p>`;
    chatbox.innerHTML += `<p><strong>Instructions:</strong> Please provide any additions (toAdd) or removals (toRemove) in the format: toAdd: Entity1, Entity2; toRemove: Entity3, Entity4.</p>`;
}

async function processRelationships() {
    const examples = await generateExamples('relationships', domainDSL.name);
    chatbox.innerHTML += `<p><strong>Chatbot:</strong> Here are some example relationships:</p>`;
    chatbox.innerHTML += `<p>${examples.split(',').map(rel => `- ${rel.trim()}`).join('<br>')}</p>`;
    chatbox.innerHTML += `<p><strong>Instructions:</strong> Please provide any additions (toAdd) or removals (toRemove) in the format: toAdd: Relationship1, Relationship2; toRemove: Relationship3, Relationship4.</p>`;
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
        } else if (currentStep === 'gatherEntities') {
            await processEntities();
            llmResponse = message;
        } else if (currentStep === 'gatherRelationships') {
            await processRelationships();
            llmResponse = message;
        } else {
            llmResponse = await callLLM(message, currentStep);
            conversationHistory.push({ role: 'assistant', content: llmResponse });
        }

        processResponse(llmResponse, currentStep, domainDSL);

        if (currentStep === 'gatherDomain') {
            currentStep = 'gatherEntities';
        } else if (currentStep === 'gatherEntities') {
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

function processReview(message) {
    if (message.toLowerCase() === 'confirm') {
        return 'confirm';
    } else if (message.toLowerCase().startsWith('change')) {
        const category = message.split(' ')[1];
        switch (category) {
            case 'domain':
                currentStep = 'gatherDomain';
                domainDSL.name = '';
                break;
            case 'entities':
                currentStep = 'gatherEntities';
                domainDSL.entities = [];
                break;
            case 'relationships':
                currentStep = 'gatherRelationships';
                domainDSL.relationships = [];
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
Domain: ${domainDSL.name}
Entities: ${domainDSL.entities.map(entity => entity.name).join(', ')}
Attributes: ${JSON.stringify(domainDSL.entities.map(entity => entity.properties))}
Relationships: ${domainDSL.relationships.join(', ')}`;

    try {
        const llmResponse = await callLLM(prompt, 'generateDSL');
        chatbox.innerHTML += `<p><strong>Generated Ecore:</strong></p><pre>${llmResponse}</pre>`;

        // Create a download link for the Ecore file
        const blob = new Blob([llmResponse], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${domainDSL.name.toLowerCase().replace(/ /g, '_')}.ecore`;
        a.textContent = 'Download Ecore File';
        a.className = 'download-link';
        chatbox.appendChild(a);
    } catch (error) {
        chatbox.innerHTML += `<p><strong>Error:</strong> ${error.message}</p>`;
        console.error('Error:', error);
    }
}

function displayInputs() {
    chatbox.innerHTML += `<p><strong>Domain:</strong> ${domainDSL.name}</p>`;
    chatbox.innerHTML += `<p><strong>Entities:</strong> ${domainDSL.entities.map(entity => entity.name).join(', ')}</p>`;
    chatbox.innerHTML += `<p><strong>Attributes:</strong> ${JSON.stringify(domainDSL.entities.map(entity => entity.properties), null, 2)}</p>`;
    chatbox.innerHTML += `<p><strong>Relationships:</strong> ${domainDSL.relationships.join(', ')}</p>`;
}

askQuestion(currentStep);
