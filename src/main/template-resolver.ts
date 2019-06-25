import * as path from 'path';

export function getTemplate(id: string) {
    return require(path.join(__dirname, "collage-maker", id));
}

