const apiKey = 'jYZpbwqDS8jE9VLbAhUj5HOhDvIlTNcK'; // Replace with your actual API key
const apiUrl = 'https://api.mistral.ai/v1/chat/completions'; // Replace with the actual API endpoint

async function callLLM(message, step) {
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'mistral-small-latest', // Updated to use the Codestral model
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
    const prompt = `Provide examples of ${type} for the domain "${domain}". Return the examples in a comma-separated list without any additional text.`;
    try {
        const response = await callLLM(prompt, 'generateExamples');
        // Trim any noise from the response
        const examples = response.split(',').map(example => example.trim()).filter(example => example);
        return examples.join(', ');
    } catch (error) {
        console.error('Error generating examples:', error);
        return '';
    }
}
