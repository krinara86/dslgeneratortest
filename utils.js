function processResponse(response, step, domainDSL) {
    switch (step) {
        case 'gatherDomain':
            domainDSL.name = response.trim();
            break;
        case 'gatherEntities':
            processEntities(response, domainDSL);
            break;
        case 'gatherRelationships':
            processRelationships(response, domainDSL);
            break;
    }
}

function processEntities(response, domainDSL) {
    const entities = response.split(',').map(entity => entity.trim());
    domainDSL.entities = entities.map(entity => createEntity(entity));
}

function processRelationships(response, domainDSL) {
    domainDSL.relationships = response.split(',').map(rel => rel.trim());
}

function parseChanges(message) {
    const toAdd = message.split('toAdd:')[1]?.split('toRemove:')[0]?.trim();
    const toRemove = message.split('toRemove:')[1]?.trim();
    return { toAdd: toAdd ? toAdd.split(',').map(entity => entity.trim()) : [], toRemove: toRemove ? toRemove.split(',').map(entity => entity.trim()) : [] };
}
